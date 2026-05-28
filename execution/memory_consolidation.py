"""
Memory Consolidation Engine (Phase 3)
─────────────────────────────────────
Performs three hygiene operations on openmemory.db:

1. Salience Decay  – reduces salience based on time since last_seen_at
2. Deduplication    – merges near-duplicate memories (simhash hamming distance < threshold)
3. Pruning          – removes memories whose salience has decayed below a floor

Safety rules:
- Dedup only merges within the SAME sector (episodic stays episodic)
- No episodic→semantic promotion
- Keeps the memory with higher salience/newer timestamp on conflict
"""

import os
import sys
import io
import json
import sqlite3
import time
import math
import argparse

# Fix Windows encoding
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(BASE_DIR, "openmemory.db")


def hamming_distance(h1: str, h2: str) -> int:
    """Compute hamming distance between two simhash hex/binary strings."""
    if not h1 or not h2 or len(h1) != len(h2):
        return 999  # incomparable → treat as totally different
    return sum(c1 != c2 for c1, c2 in zip(h1, h2))


def apply_salience_decay(conn, dry_run=False):
    """
    Decay salience using: salience *= exp(-decay_lambda * days_since_last_seen)
    Updates last_seen_at for memories that are recalled (handled by retrieval side).
    """
    cur = conn.cursor()
    now = int(time.time())

    cur.execute("""
        SELECT id, salience, decay_lambda, last_seen_at, primary_sector, content
        FROM memories
        WHERE salience > 0
    """)
    rows = cur.fetchall()

    updated = 0
    for row in rows:
        mem_id, salience, decay_lambda, last_seen_at, sector, content = row

        if decay_lambda is None or decay_lambda <= 0:
            decay_lambda = 0.005  # default: very slow decay

        if last_seen_at is None or last_seen_at <= 0:
            last_seen_at = now  # never seen → treat as just created

        days_elapsed = max(0, (now - last_seen_at) / 86400.0)
        exponent = decay_lambda * days_elapsed
        try:
            # Cap exponent to prevent overflow — beyond 20 the result is negligible
            if exponent > 20:
                new_salience = 0.01
            else:
                new_salience = salience * math.exp(-exponent)
        except (OverflowError, ValueError):
            new_salience = 0.01
        new_salience = round(max(new_salience, 0.01), 6)  # floor at 0.01

        if abs(new_salience - salience) > 0.001:
            if not dry_run:
                cur.execute(
                    "UPDATE memories SET salience = ? WHERE id = ?",
                    (new_salience, mem_id)
                )
            updated += 1
            print(f"  [DECAY] {sector}/{content[:40]}... {salience:.3f} → {new_salience:.3f} ({days_elapsed:.1f}d)")

    if not dry_run:
        conn.commit()

    return updated


def deduplicate_memories(conn, threshold=3, dry_run=False):
    """
    Merge near-duplicate memories (same sector, simhash hamming distance < threshold).
    Keeps the one with higher salience. Deletes the other.
    No cross-sector merging — episodic stays episodic.
    """
    cur = conn.cursor()
    cur.execute("""
        SELECT id, content, primary_sector, simhash, salience, created_at
        FROM memories
        WHERE simhash IS NOT NULL AND simhash != ''
        ORDER BY primary_sector, salience DESC
    """)
    rows = cur.fetchall()

    # Group by sector
    sector_groups = {}
    for row in rows:
        mem_id, content, sector, simhash, salience, created_at = row
        sector_groups.setdefault(sector, []).append({
            "id": mem_id,
            "content": content,
            "simhash": simhash,
            "salience": salience or 1.0,
            "created_at": created_at or 0,
        })

    merged = 0
    deleted_ids = set()

    for sector, memories in sector_groups.items():
        n = len(memories)
        for i in range(n):
            if memories[i]["id"] in deleted_ids:
                continue
            for j in range(i + 1, n):
                if memories[j]["id"] in deleted_ids:
                    continue

                dist = hamming_distance(memories[i]["simhash"], memories[j]["simhash"])
                if dist < threshold:
                    # Keep the one with higher salience, delete the other
                    keep = memories[i] if memories[i]["salience"] >= memories[j]["salience"] else memories[j]
                    drop = memories[j] if keep == memories[i] else memories[i]

                    print(f"  [DEDUP] [{sector}] KEEP: '{keep['content'][:40]}...' DROP: '{drop['content'][:40]}...' (dist={dist})")

                    if not dry_run:
                        cur.execute("DELETE FROM memories WHERE id = ?", (drop["id"],))
                        # Also clean up vectors table if it exists
                        try:
                            cur.execute("DELETE FROM vectors WHERE memory_id = ?", (drop["id"],))
                        except:
                            pass

                    deleted_ids.add(drop["id"])
                    merged += 1

    if not dry_run:
        conn.commit()

    return merged


def prune_low_salience(conn, floor=0.05, dry_run=False):
    """Remove memories whose salience has decayed below the floor."""
    cur = conn.cursor()

    cur.execute(
        "SELECT id, content, primary_sector, salience FROM memories WHERE salience < ?",
        (floor,)
    )
    rows = cur.fetchall()

    pruned = 0
    for row in rows:
        mem_id, content, sector, salience = row
        print(f"  [PRUNE] [{sector}] '{content[:50]}...' (salience={salience:.4f})")
        if not dry_run:
            cur.execute("DELETE FROM memories WHERE id = ?", (mem_id,))
            try:
                cur.execute("DELETE FROM vectors WHERE memory_id = ?", (mem_id,))
            except:
                pass
        pruned += 1

    if not dry_run:
        conn.commit()

    return pruned


def touch_memory(mem_id: str):
    """Update last_seen_at for a recalled memory (called by retrieval side)."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        now = int(time.time())
        cur.execute("UPDATE memories SET last_seen_at = ? WHERE id = ?", (now, mem_id))
        # Boost salience slightly on recall (reinforcement)
        cur.execute(
            "UPDATE memories SET salience = MIN(salience * 1.05, 1.0) WHERE id = ?",
            (mem_id,)
        )
        conn.commit()
        conn.close()
    except Exception:
        pass


def consolidate(dry_run=False, dedup_threshold=3, prune_floor=0.05):
    """Run the full consolidation pipeline."""
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)

    print("=" * 50)
    print("MEMORY CONSOLIDATION ENGINE")
    print("=" * 50)

    # Count before
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM memories")
    before = cur.fetchone()[0]
    print(f"\nMemories before: {before}")

    # Step 1: Salience Decay
    print("\n── Step 1: Salience Decay ──")
    decayed = apply_salience_decay(conn, dry_run=dry_run)
    print(f"  Decayed: {decayed} memories")

    # Step 2: Deduplication
    print("\n── Step 2: Same-Sector Deduplication ──")
    merged = deduplicate_memories(conn, threshold=dedup_threshold, dry_run=dry_run)
    print(f"  Merged: {merged} duplicate pairs")

    # Step 3: Prune
    print("\n── Step 3: Low-Salience Pruning ──")
    pruned = prune_low_salience(conn, floor=prune_floor, dry_run=dry_run)
    print(f"  Pruned: {pruned} memories")

    # Count after
    cur.execute("SELECT COUNT(*) FROM memories")
    after = cur.fetchone()[0]
    print(f"\nMemories after: {after} (removed {before - after})")

    if dry_run:
        print("\n⚠ DRY RUN — no changes were written to disk.")

    conn.close()
    print("=" * 50)

    return {"before": before, "after": after, "decayed": decayed, "merged": merged, "pruned": pruned}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Memory Consolidation Engine")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without writing")
    parser.add_argument("--dedup-threshold", type=int, default=3, help="Simhash hamming distance threshold for dedup (default: 3)")
    parser.add_argument("--prune-floor", type=float, default=0.05, help="Salience floor for pruning (default: 0.05)")
    parser.add_argument("--touch", type=str, help="Touch a memory ID (update last_seen_at)")
    args = parser.parse_args()

    if args.touch:
        touch_memory(args.touch)
        print(f"Touched memory {args.touch}")
    else:
        consolidate(dry_run=args.dry_run, dedup_threshold=args.dedup_threshold, prune_floor=args.prune_floor)
