import os
import sys
import sqlite3
import asyncio
from typing import List, Dict, Any

from mcp.server.fastmcp import FastMCP
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(BASE_DIR, "openmemory.db")

os.environ["OM_EMBED_KIND"] = os.getenv("OM_EMBED_KIND", "ollama")
os.environ["OM_VEC_DIM"] = os.getenv("OM_VEC_DIM", "768")
os.environ["OM_DATABASE_URL"] = f"sqlite:///{DB_PATH}"

mcp = FastMCP("OpenMemory")

def get_openmemory_client():
    # Lazy load to avoid blocking if just starting
    from openmemory.client import Memory
    return Memory()

def get_db_connection():
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError(f"Database not found at {DB_PATH}")
    return sqlite3.connect(DB_PATH)

@mcp.tool()
async def search_memory(query: str, limit: int = 10, user_id: str = "jack") -> List[Dict[str, Any]]:
    """
    Search OpenMemory using semantic vector search.
    Returns a compact index of IDs and previews to save tokens.
    """
    mem = get_openmemory_client()
    results = await mem.search(query, user_id=user_id, limit=limit)
    
    compact_results = []
    for r in results:
        meta = r.get("metadata", {}) or r.get("meta", {})
        sector = meta.get("sector") or r.get("primary_sector", "unknown")
        content = r.get("content", "")
        # Return a preview of max 60 chars
        preview = content[:60] + "..." if len(content) > 60 else content
        compact_results.append({
            "id": r.get("id"),
            "sector": sector,
            "preview": preview,
            "distance": r.get("distance", 0.0)
        })
    return compact_results

@mcp.tool()
async def store_memory(text: str, sector: str = "semantic", user_id: str = "jack") -> str:
    """
    Store a new memory directly into openmemory.db.
    Use this immediately whenever the user asks you to 'remember this' or 'save to memory'.
    """
    mem = get_openmemory_client()
    metadata = {
        "sector": sector,
        "source": "mcp-server",
        "tags": []
    }
    # store returns the created object or ID
    result = await mem.add(text, user_id=user_id, meta=metadata)
    return f"Successfully saved memory to {sector} sector."

@mcp.tool()
def timeline_memory(memory_id: str, window_minutes: int = 120) -> List[Dict[str, Any]]:
    """
    Given a specific memory_id, finds the exact timestamp of that memory
    and returns a compact index of all memories recorded within a +/- window_minutes timeframe.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    
    # 1. Get timestamp of target memory
    cur.execute("SELECT created_at FROM memories WHERE id = ?", (memory_id,))
    row = cur.fetchone()
    if not row or not row[0]:
        conn.close()
        return [{"error": f"Memory {memory_id} not found or has no timestamp."}]
    
    target_time = row[0]
    window_seconds = window_minutes * 60
    start_time = target_time - window_seconds
    end_time = target_time + window_seconds
    
    # 2. Query neighbors
    cur.execute(
        "SELECT id, primary_sector, content, created_at FROM memories "
        "WHERE created_at >= ? AND created_at <= ? ORDER BY created_at ASC",
        (start_time, end_time)
    )
    rows = cur.fetchall()
    conn.close()
    
    compact_results = []
    for r_id, sector, content, created_at in rows:
        preview = content[:60] + "..." if len(content) > 60 else content
        compact_results.append({
            "id": r_id,
            "sector": sector,
            "created_at": created_at,
            "preview": preview
        })
    return compact_results

@mcp.tool()
def get_observations(memory_ids: List[str]) -> List[Dict[str, Any]]:
    """
    Fetch the full details (content, tags, metadata) for a list of memory IDs.
    Use this ONLY after using search_memory or timeline_memory to find relevant IDs.
    """
    if not memory_ids:
        return []
        
    conn = get_db_connection()
    cur = conn.cursor()
    
    placeholders = ",".join("?" for _ in memory_ids)
    query = f"SELECT id, primary_sector, content, tags, meta, created_at FROM memories WHERE id IN ({placeholders})"
    
    cur.execute(query, tuple(memory_ids))
    rows = cur.fetchall()
    conn.close()
    
    results = []
    for r_id, sector, content, tags, meta, created_at in rows:
        results.append({
            "id": r_id,
            "sector": sector,
            "created_at": created_at,
            "content": content,
            "tags": tags,
            "meta": meta
        })
    return results

if __name__ == "__main__":
    mcp.run()
