"""
Database Vacuum & Analyze Engine
─────────────────────────────────────────────────────────
Runs SQLite VACUUM and ANALYZE on openmemory.db to:
  - Reclaim unused page space (VACUUM)
  - Update query planner statistics (ANALYZE)
  - Report size before/after

Also checks growth rate against a configurable warning threshold.

Scheduled monthly via config/schedule.json.
Can be run manually anytime.

Usage:
  python execution/db_vacuum.py              # Run vacuum + analyze
  python execution/db_vacuum.py --dry-run    # Report only, no changes
  python execution/db_vacuum.py --analyze    # ANALYZE only (fast, no locking)
"""

import os
import sys
import json
import sqlite3
import time
import argparse

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH  = os.path.join(BASE_DIR, "execution", "openmemory.db")

# Size thresholds
WARN_SIZE_MB   = 50.0   # Warn when DB exceeds this
DANGER_SIZE_MB = 200.0  # Error level

VACUUM_LOG_PATH = os.path.join(BASE_DIR, "logs", "vacuum_history.json")


def get_size_mb(path: str) -> float:
    return os.path.getsize(path) / (1024 * 1024)


def get_row_counts(conn) -> dict:
    cur = conn.cursor()
    counts = {}
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    for (tbl,) in cur.fetchall():
        try:
            cur.execute(f"SELECT COUNT(*) FROM {tbl}")
            counts[tbl] = cur.fetchone()[0]
        except Exception:
            counts[tbl] = -1
    return counts


def run_vacuum(dry_run: bool = False, analyze_only: bool = False) -> dict:
    if not os.path.exists(DB_PATH):
        return {"status": "fail", "data": {"error": f"DB not found at {DB_PATH}"}}

    size_before = get_size_mb(DB_PATH)

    if dry_run:
        return {
            "status": "ok",
            "data": {
                "dry_run": True,
                "size_before_mb": round(size_before, 2),
                "message": "Dry run — no changes made"
            }
        }

    conn = sqlite3.connect(DB_PATH)
    row_counts_before = get_row_counts(conn)

    t0 = time.time()
    try:
        if not analyze_only:
            print("[DB] Running VACUUM...")
            conn.execute("VACUUM")
        print("[DB] Running ANALYZE...")
        conn.execute("ANALYZE")
        conn.commit()
    except Exception as e:
        conn.close()
        return {"status": "fail", "data": {"error": str(e)}}

    elapsed = round(time.time() - t0, 2)
    conn.close()

    size_after = get_size_mb(DB_PATH)
    reclaimed  = size_before - size_after

    # Determine health status
    if size_after >= DANGER_SIZE_MB:
        health = "danger"
    elif size_after >= WARN_SIZE_MB:
        health = "warning"
    else:
        health = "ok"

    result = {
        "status": health if health == "ok" else "warn",
        "data": {
            "size_before_mb": round(size_before, 2),
            "size_after_mb":  round(size_after, 2),
            "reclaimed_mb":   round(reclaimed, 2),
            "elapsed_s":      elapsed,
            "row_counts":     row_counts_before,
            "health":         health,
            "timestamp":      time.strftime("%Y-%m-%dT%H:%M:%S"),
        }
    }

    # Append to vacuum history log
    os.makedirs(os.path.dirname(VACUUM_LOG_PATH), exist_ok=True)
    try:
        history = []
        if os.path.exists(VACUUM_LOG_PATH):
            with open(VACUUM_LOG_PATH, "r", encoding="utf-8") as f:
                history = json.load(f)
        history.append(result["data"])
        # Keep last 24 entries (2 years of monthly runs)
        history = history[-24:]
        with open(VACUUM_LOG_PATH, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2)
    except Exception:
        pass

    return result


def main():
    parser = argparse.ArgumentParser(description="DB Vacuum & Analyze Engine")
    parser.add_argument("--dry-run",      action="store_true", help="Report size only, no changes")
    parser.add_argument("--analyze",      action="store_true", help="ANALYZE only (no VACUUM)")
    args = parser.parse_args()

    result = run_vacuum(dry_run=args.dry_run, analyze_only=args.analyze)
    print(json.dumps(result, indent=2))

    d = result.get("data", {})
    if not args.dry_run:
        print(f"\n  Before : {d.get('size_before_mb', '?')} MB")
        print(f"  After  : {d.get('size_after_mb', '?')} MB")
        print(f"  Saved  : {d.get('reclaimed_mb', '?')} MB")
        print(f"  Time   : {d.get('elapsed_s', '?')}s")
        print(f"  Health : {d.get('health', '?').upper()}")

    if result["status"] == "fail":
        sys.exit(1)


if __name__ == "__main__":
    main()
