import os
import sys
import json
import logging
import asyncio
import io

# Fix Windows encoding issues
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

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
    results = await mem.search("*", user_id=user_id, limit=100)
    return results

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

async def search_memory(query: str, user_id: str = "jack", limit: int = 10):
    """Search for memories."""
    mem = get_memory()
    return await mem.search(query, user_id=user_id, limit=limit)

async def purge_memories(sector: str = None):
    """Delete all memories or by sector."""
    mem = get_memory()
    # OpenMemory doesn't have a direct 'purge all' for a user yet in some versions
    # So we search all and delete individually
    results = await mem.search("*", limit=1000)
    count = 0
    for r in results:
        if not sector or r.get('metadata', {}).get('sector') == sector:
            await mem.delete(r['id'])
            count += 1
    return count

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command")
    
    p_store = sub.add_parser("store")
    p_store.add_argument("text")
    p_store.add_argument("--sector", default="semantic")
    
    sub.add_parser("list")
    sub.add_parser("stats")
    
    p_search = sub.add_parser("search")
    p_search.add_argument("query")
    p_search.add_argument("--limit", type=int, default=10)

    p_forget = sub.add_parser("forget")
    p_forget.add_argument("id")

    p_purge = sub.add_parser("purge")
    p_purge.add_argument("--sector")
    p_purge.add_argument("--all", action="store_true")
    
    args = parser.parse_args()
    
    if args.command == "store":
        asyncio.run(store_memory(args.text, sector=args.sector))
        print(f"Stored in {args.sector}.")
    elif args.command == "list":
        res = asyncio.run(list_memories())
        for r in res:
            sec = r.get('metadata', {}).get('sector') or r.get('primary_sector', 'unknown')
            print(f"[{sec.upper()}] {r.get('content')}")
    elif args.command == "search":
        res = asyncio.run(search_memory(args.query, limit=args.limit))
        print(json.dumps(res))
    elif args.command == "forget":
        asyncio.run(forget_memory(args.id))
        print(f"Deleted memory {args.id}")
    elif args.command == "purge":
        if args.all:
            count = asyncio.run(purge_memories())
            print(f"Purged all {count} memories.")
        elif args.sector:
            count = asyncio.run(purge_memories(args.sector))
            print(f"Purged {count} memories from {args.sector}.")
    elif args.command == "stats":
        res = asyncio.run(get_stats())
        print(json.dumps(res))
