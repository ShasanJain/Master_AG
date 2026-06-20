"""
Long-Term Memory Engine
─────────────────────────────────────────────────────────
Detects recurring patterns in semantic + episodic memory
and proactively proposes moving them into long_term storage.

Rules:
  1. A memory pattern is "detected" when 3+ episodic or
     semantic memories share significant term overlap.
  2. The agent asks the user once per conversation to
     promote detected patterns into long_term memory.
  3. If the user ignores or gives a non-committal response,
     we log a deferral and skip asking for the next N conversations.
  4. After N skipped conversations the agent asks again.

All state is stored in:
  config/ltm_defer_log.json
"""

import os
import sys
import json
import sqlite3
import time
import re
import math
from collections import Counter, defaultdict

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH  = os.path.join(BASE_DIR, "execution", "openmemory.db")
DEFER_LOG_PATH = os.path.join(BASE_DIR, "config", "ltm_defer_log.json")

# ── Tunables ────────────────────────────────────────────────────────────────
PATTERN_MIN_OVERLAP   = 3      # Min shared root-terms to count as "related"
PATTERN_MIN_CLUSTER   = 3      # Min memories in a cluster to flag as pattern
DEFER_CONVERSATIONS   = 5      # Conversations to skip after a user non-answer
LTM_RECALL_THRESHOLD  = 3      # Episodic recall_count needed for promotion
# ────────────────────────────────────────────────────────────────────────────


# ── Defer Log Helpers ────────────────────────────────────────────────────────

def _load_defer_log() -> dict:
    os.makedirs(os.path.dirname(DEFER_LOG_PATH), exist_ok=True)
    if os.path.exists(DEFER_LOG_PATH):
        try:
            with open(DEFER_LOG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"pending": [], "conversation_count": 0}


def _save_defer_log(log: dict):
    os.makedirs(os.path.dirname(DEFER_LOG_PATH), exist_ok=True)
    with open(DEFER_LOG_PATH, "w", encoding="utf-8") as f:
        json.dump(log, f, indent=2)


def tick_conversation():
    """Call once per conversation start to increment the internal counter."""
    log = _load_defer_log()
    log["conversation_count"] = log.get("conversation_count", 0) + 1
    _save_defer_log(log)
    return log["conversation_count"]


def record_user_ignored(pattern_key: str):
    """Record that the user did not confirm an LTM promotion suggestion."""
    log = _load_defer_log()
    existing = {p["key"]: p for p in log.get("pending", [])}
    now_conv = log.get("conversation_count", 0)
    if pattern_key in existing:
        existing[pattern_key]["defer_until_conversation"] = now_conv + DEFER_CONVERSATIONS
        existing[pattern_key]["ignored_at"] = int(time.time())
    else:
        log.setdefault("pending", []).append({
            "key": pattern_key,
            "defer_until_conversation": now_conv + DEFER_CONVERSATIONS,
            "ignored_at": int(time.time()),
        })
    log["pending"] = list(existing.values()) if existing else log["pending"]
    _save_defer_log(log)


def record_user_confirmed(pattern_key: str):
    """Remove a pattern from the pending defer list after the user confirms."""
    log = _load_defer_log()
    log["pending"] = [p for p in log.get("pending", []) if p["key"] != pattern_key]
    _save_defer_log(log)


def should_ask_about(pattern_key: str) -> bool:
    """Return True if we are allowed to suggest this pattern to the user right now."""
    log = _load_defer_log()
    now_conv = log.get("conversation_count", 0)
    for p in log.get("pending", []):
        if p["key"] == pattern_key:
            return now_conv >= p.get("defer_until_conversation", 0)
    return True  # Never deferred before → ask freely


# ── Text Utilities ───────────────────────────────────────────────────────────

_STOP_WORDS = {
    "a", "an", "the", "and", "or", "in", "on", "at", "to",
    "of", "for", "is", "are", "was", "be", "by", "with",
    "this", "that", "it", "as", "from", "do", "we", "you"
}


def _tokenize(text: str) -> list[str]:
    tokens = re.findall(r"\b[a-z]{3,}\b", text.lower())
    return [t for t in tokens if t not in _STOP_WORDS]


def _term_overlap(tokens_a: list[str], tokens_b: list[str]) -> int:
    return len(set(tokens_a) & set(tokens_b))


# ── Pattern Detection ────────────────────────────────────────────────────────

def detect_patterns(user_id: str = "jack") -> list[dict]:
    """
    Scan episodic + semantic memories. Build clusters of memories that
    share significant term overlap. Return clusters that meet the
    PATTERN_MIN_CLUSTER threshold.
    """
    if not os.path.exists(DB_PATH):
        return []

    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()
    cur.execute(
        "SELECT id, content, primary_sector, meta "
        "FROM memories "
        "WHERE user_id = ? AND primary_sector IN ('episodic', 'semantic')",
        (user_id,)
    )
    rows = cur.fetchall()
    conn.close()

    memories = []
    for mem_id, content, sector, meta_str in rows:
        meta = {}
        if meta_str:
            try:
                meta = json.loads(meta_str)
            except Exception:
                pass
        memories.append({
            "id":      mem_id,
            "content": content or "",
            "sector":  sector,
            "tokens":  _tokenize(content or ""),
            "meta":    meta,
        })

    # Simple greedy clustering: group by highest-overlap neighbour
    clusters: list[list[dict]] = []
    visited  = set()

    for i, mem in enumerate(memories):
        if mem["id"] in visited:
            continue
        cluster = [mem]
        visited.add(mem["id"])
        for j, other in enumerate(memories):
            if i == j or other["id"] in visited:
                continue
            if _term_overlap(mem["tokens"], other["tokens"]) >= PATTERN_MIN_OVERLAP:
                cluster.append(other)
                visited.add(other["id"])
        if len(cluster) >= PATTERN_MIN_CLUSTER:
            clusters.append(cluster)

    # Build pattern descriptors
    patterns = []
    for cluster in clusters:
        # Find the most common terms across the cluster
        all_tokens = []
        for m in cluster:
            all_tokens.extend(m["tokens"])
        common = [term for term, _ in Counter(all_tokens).most_common(5)]
        key    = "_".join(sorted(common[:3]))
        patterns.append({
            "key":      key,
            "label":    " + ".join(common),
            "count":    len(cluster),
            "ids":      [m["id"] for m in cluster],
            "sectors":  list({m["sector"] for m in cluster}),
            "preview":  cluster[0]["content"][:120] + "…",
        })

    return patterns


# ── LTM Promotion Helper ─────────────────────────────────────────────────────

def promote_pattern_to_ltm(pattern: dict, user_id: str = "jack") -> int:
    """
    Move all memories in a pattern cluster to 'long_term' sector.
    Returns the count of promoted memories.
    """
    if not os.path.exists(DB_PATH):
        return 0

    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()
    now  = int(time.time())

    promoted = 0
    for mem_id in pattern["ids"]:
        cur.execute("SELECT meta FROM memories WHERE id = ?", (mem_id,))
        row = cur.fetchone()
        meta = {}
        if row and row[0]:
            try:
                meta = json.loads(row[0])
            except Exception:
                pass
        meta["promoted_at"]       = now
        meta["promotion_reason"]  = f"pattern_detected:{pattern['key']}"
        meta["pattern_label"]     = pattern["label"]
        cur.execute(
            "UPDATE memories SET primary_sector = 'long_term', "
            "salience = 1.0, decay_lambda = 0.0001, meta = ? WHERE id = ?",
            (json.dumps(meta), mem_id)
        )
        promoted += 1

    conn.commit()
    conn.close()
    return promoted


# ── Public API for the Agent ─────────────────────────────────────────────────

def get_ltm_suggestions(user_id: str = "jack") -> list[dict]:
    """
    Returns a list of pattern objects that the agent SHOULD ask the user
    about right now (filtered by the defer log). Call once per conversation.
    """
    patterns = detect_patterns(user_id=user_id)
    return [p for p in patterns if should_ask_about(p["key"])]


def confirm_promotion(pattern_key: str, user_id: str = "jack") -> int:
    """User said yes. Promote the matching pattern and remove from defer log."""
    patterns = detect_patterns(user_id=user_id)
    match    = next((p for p in patterns if p["key"] == pattern_key), None)
    if not match:
        return 0
    count = promote_pattern_to_ltm(match, user_id=user_id)
    record_user_confirmed(pattern_key)
    return count


def defer_promotion(pattern_key: str):
    """User ignored or was unclear. Defer for DEFER_CONVERSATIONS conversations."""
    record_user_ignored(pattern_key)


# ── CLI ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Long-Term Memory Engine")
    sub = parser.add_subparsers(dest="command")

    sub.add_parser("detect",   help="Detect recurring patterns")
    sub.add_parser("suggest",  help="List patterns the agent should ask about now")
    p_confirm = sub.add_parser("confirm", help="Promote a pattern to LTM")
    p_confirm.add_argument("pattern_key")
    p_defer = sub.add_parser("defer", help="Defer a pattern suggestion")
    p_defer.add_argument("pattern_key")
    sub.add_parser("tick",    help="Increment conversation counter")

    args = parser.parse_args()

    if args.command == "detect":
        result = detect_patterns()
        print(json.dumps(result, indent=2))

    elif args.command == "suggest":
        suggestions = get_ltm_suggestions()
        if not suggestions:
            print("No LTM suggestions at this time.")
        else:
            for s in suggestions:
                print(f"\n[PATTERN] {s['label']} ({s['count']} memories, sectors: {s['sectors']})")
                print(f"  Key    : {s['key']}")
                print(f"  Preview: {s['preview']}")

    elif args.command == "confirm":
        n = confirm_promotion(args.pattern_key)
        print(f"Promoted {n} memories to long_term for pattern '{args.pattern_key}'.")

    elif args.command == "defer":
        defer_promotion(args.pattern_key)
        print(f"Deferred '{args.pattern_key}' for {DEFER_CONVERSATIONS} conversations.")

    elif args.command == "tick":
        n = tick_conversation()
        print(f"Conversation count: {n}")

    else:
        parser.print_help()
