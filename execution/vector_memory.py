"""
Vector Memory v2 — Industrial Memory Engine
Wraps OpenMemory SDK for Jack's persistent context system.

Usage:
    python vector_memory.py store "Jack prefers TypeScript" --sector semantic
    python vector_memory.py recall "What language does Jack use?"
    python vector_memory.py list
    python vector_memory.py forget <memory_id>
    python vector_memory.py auto-capture "Session summary text here"
"""

import asyncio
import argparse
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path

# Setup
BASE_DIR = Path(__file__).parent.parent
LOG_FILE = BASE_DIR / "logs" / "memory.log"
CONFIG_FILE = BASE_DIR / "config" / "memory_config.json"

os.makedirs(LOG_FILE.parent, exist_ok=True)
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Also log to stdout for CLI use
console = logging.StreamHandler()
console.setLevel(logging.INFO)
logging.getLogger('').addHandler(console)


def load_config():
    """Load memory configuration."""
    defaults = {
        "engine": "openmemory",
        "default_user": "jack",
        "sectors": ["episodic", "semantic", "procedural"],
        "auto_capture": True
    }
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, 'r') as f:
                return {**defaults, **json.load(f)}
        except Exception:
            pass
    return defaults


def get_memory():
    """Initialize OpenMemory client."""
    from openmemory.client import Memory
    return Memory()


async def store_memory(text: str, sector: str = "semantic", user_id: str = None, tags: list = None):
    """Store a memory with sector classification."""
    config = load_config()
    user_id = user_id or config["default_user"]
    mem = get_memory()

    metadata = {
        "sector": sector,
        "stored_at": datetime.now().isoformat(),
        "source": "jack-cli"
    }
    if tags:
        metadata["tags"] = tags

    result = await mem.add(text, user_id=user_id, metadata=metadata)
    logging.info(f"STORED [{sector}] for user '{user_id}': {text[:80]}...")
    return result


async def recall_memory(query: str, user_id: str = None, top_k: int = 5):
    """Semantic search across stored memories."""
    config = load_config()
    user_id = user_id or config["default_user"]
    mem = get_memory()

    results = await mem.search(query, user_id=user_id, limit=top_k)
    logging.info(f"RECALL query='{query}' user='{user_id}' hits={len(results)}")
    return results


async def list_memories(user_id: str = None):
    """List all stored memories for a user."""
    config = load_config()
    user_id = user_id or config["default_user"]
    mem = get_memory()

    results = await mem.search("", user_id=user_id, limit=100)
    logging.info(f"LIST user='{user_id}' total={len(results)}")
    return results


async def forget_memory(memory_id: str):
    """Delete a specific memory by ID."""
    mem = get_memory()
    await mem.delete(memory_id)
    logging.info(f"FORGOT memory_id={memory_id}")


async def auto_capture(summary: str, user_id: str = None):
    """Auto-capture a session summary or user plan as episodic memory."""
    config = load_config()
    if not config.get("auto_capture", True):
        logging.info("Auto-capture disabled in config. Skipping.")
        return

    user_id = user_id or config["default_user"]
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    tagged_summary = f"[Session {timestamp}] {summary}"

    result = await store_memory(
        tagged_summary,
        sector="episodic",
        user_id=user_id,
        tags=["auto-capture", "session-summary"]
    )
    logging.info(f"AUTO-CAPTURED session summary for user '{user_id}'")
    return result


def format_results(results):
    """Format search results for CLI output."""
    if not results:
        print("No memories found.")
        return

    print(f"\n{'='*60}")
    print(f" Found {len(results)} memories")
    print(f"{'='*60}")
    for i, r in enumerate(results, 1):
        score = r.get('score', 0)
        sector = r.get('primary_sector', 'unknown')
        content = r.get('content', '')
        mem_id = r.get('id', '')[:8]
        print(f"\n  [{i}] Score: {score:.3f} | Sector: {sector} | ID: {mem_id}...")
        print(f"      {content}")
    print(f"\n{'='*60}\n")


def main():
    parser = argparse.ArgumentParser(description="Jack Vector Memory v2")
    sub = parser.add_subparsers(dest="command")

    # store
    p_store = sub.add_parser("store", help="Store a memory")
    p_store.add_argument("text", help="Memory text to store")
    p_store.add_argument("--sector", default="semantic",
                         choices=["episodic", "semantic", "procedural"],
                         help="Memory sector")
    p_store.add_argument("--user", default=None, help="User ID")
    p_store.add_argument("--tags", nargs="*", default=None, help="Tags")

    # recall
    p_recall = sub.add_parser("recall", help="Search memories")
    p_recall.add_argument("query", help="Search query")
    p_recall.add_argument("--user", default=None, help="User ID")
    p_recall.add_argument("--top-k", type=int, default=5, help="Max results")

    # list
    p_list = sub.add_parser("list", help="List all memories")
    p_list.add_argument("--user", default=None, help="User ID")

    # forget
    p_forget = sub.add_parser("forget", help="Delete a memory")
    p_forget.add_argument("memory_id", help="Memory ID to delete")

    # auto-capture
    p_auto = sub.add_parser("auto-capture", help="Auto-capture session summary")
    p_auto.add_argument("summary", help="Session summary text")
    p_auto.add_argument("--user", default=None, help="User ID")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    if args.command == "store":
        asyncio.run(store_memory(args.text, args.sector, args.user, args.tags))
        print(f"Memory stored [{args.sector}].")

    elif args.command == "recall":
        results = asyncio.run(recall_memory(args.query, args.user, args.top_k))
        format_results(results)

    elif args.command == "list":
        results = asyncio.run(list_memories(args.user))
        format_results(results)

    elif args.command == "forget":
        asyncio.run(forget_memory(args.memory_id))
        print(f"Memory {args.memory_id} forgotten.")

    elif args.command == "auto-capture":
        asyncio.run(auto_capture(args.summary, args.user))
        print("Session auto-captured.")


if __name__ == "__main__":
    main()
