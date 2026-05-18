import os
import sys
import json
import logging
import asyncio
from dotenv import load_dotenv

# Load .env first
load_dotenv()

# CRITICAL: Set environment variables BEFORE importing OpenMemory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(BASE_DIR, "openmemory.db")
os.environ["OM_EMBED_KIND"] = os.getenv("OM_EMBED_KIND", "ollama")
os.environ["OM_VEC_DIM"] = os.getenv("OM_VEC_DIM", "768")
os.environ["OM_DATABASE_URL"] = f"sqlite:///{DB_PATH}"

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(message)s')

def get_memory():
    """Initialize OpenMemory client."""
    from openmemory.client import Memory
    return Memory()

def load_config():
    """Load memory configuration."""
    config_path = os.path.join(BASE_DIR, "config", "memory_config.json")
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            return json.load(f)
    return {
        "embed_kind": os.getenv("OM_EMBED_KIND", "ollama"),
        "vec_dim": int(os.getenv("OM_VEC_DIM", 768)),
        "ollama_model": os.getenv("OM_OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")
    }

async def store_memory(text: str, user_id: str = "jack", sector: str = "semantic", tags: list = None):
    """Store a memory with specific metadata."""
    mem = get_memory()
    metadata = {
        "sector": sector,
        "stored_at": asyncio.get_event_loop().time(),
        "source": "jack-cli",
        "tags": tags or []
    }
    # OpenMemory uses 'meta' keyword
    result = await mem.add(text, user_id=user_id, meta=metadata)
    return result

async def forget_memory(memory_id: str):
    """Delete a memory."""
    mem = get_memory()
    await mem.delete(memory_id)

async def list_memories(user_id: str = "jack"):
    """List all memories for a user."""
    mem = get_memory()
    results = await mem.search("", user_id=user_id, limit=100)
    return results

async def recall_memory(query: str, user_id: str = "jack", limit: int = 100):
    """Semantic search for memories."""
    mem = get_memory()
    results = await mem.search(query, user_id=user_id, limit=limit)
    return results

async def purge_memories(sector: str = None, user_id: str = "jack"):
    """Purge memories. If sector is None, purge all."""
    mem = get_memory()
    results = await mem.search("*", user_id=user_id, limit=1000)
    deleted_count = 0
    for r in results:
        sec = r.get('metadata', {}).get('sector') or r.get('primary_sector', 'unknown')
        if sector is None or sec == sector:
            await mem.delete(r['id'])
            deleted_count += 1
    return deleted_count

async def get_stats(user_id: str = "jack"):
    """Get memory statistics."""
    mem = get_memory()
    # Search for '*' to get all memories safely
    results = await mem.search("*", user_id=user_id, limit=1000)
    sectors = {}
    for r in results:
        sec = r.get('metadata', {}).get('sector') or r.get('primary_sector', 'unknown')
        sectors[sec] = sectors.get(sec, 0) + 1
    return {"total": len(results), "sectors": sectors}

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command")
    
    p_store = sub.add_parser("store")
    p_store.add_argument("text")
    p_store.add_argument("--sector", default="semantic")
    
    p_list = sub.add_parser("list")
    p_list.add_argument("--json", action="store_true")
    
    p_stats = sub.add_parser("stats")
    
    p_forget = sub.add_parser("forget")
    p_forget.add_argument("memory_id")
    
    p_purge = sub.add_parser("purge")
    p_purge.add_argument("--sector", default=None)
    p_purge.add_argument("--all", action="store_true")
    
    p_recall = sub.add_parser("recall")
    p_recall.add_argument("query")
    p_recall.add_argument("--limit", type=int, default=100)
    
    args = parser.parse_args()
    
    if args.command == "store":
        asyncio.run(store_memory(args.text, sector=args.sector))
        print(f"Stored in {args.sector}.")
    elif args.command == "list":
        res = asyncio.run(list_memories())
        if args.json:
            print(json.dumps([{
                "id": r.get("id"),
                "content": r.get("content"),
                "metadata": r.get("metadata") or r.get("meta") or {}
            } for r in res]))
        else:
            for r in res:
                sec = r.get('metadata', {}).get('sector') or r.get('primary_sector', 'unknown')
                print(f"[{sec.upper()}] {r.get('content')}")
    elif args.command == "stats":
        res = asyncio.run(get_stats())
        print(json.dumps(res))
    elif args.command == "forget":
        asyncio.run(forget_memory(args.memory_id))
        print(f"Forgotten memory {args.memory_id}.")
    elif args.command == "purge":
        sec = args.sector if not args.all else None
        count = asyncio.run(purge_memories(sector=sec))
        print(f"Purged {count} memories.")
    elif args.command == "recall":
        res = asyncio.run(recall_memory(args.query, limit=args.limit))
        print(json.dumps([{
            "id": r.get("id"),
            "content": r.get("content"),
            "metadata": r.get("metadata") or r.get("meta") or {}
        } for r in res]))
