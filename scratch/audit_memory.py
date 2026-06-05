import os
import sys
import sqlite3
import time
import json
import asyncio
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from execution.vector_memory import DB_PATH, get_stats, get_memory

import traceback

async def audit_memory():
    results = {
        "sqlite_size_mb": 0,
        "total_records": 0,
        "sectors": {},
        "embedding_test": {},
        "retrieval_test": {}
    }
    
    # 1. DB Size
    if os.path.exists(DB_PATH):
        results["sqlite_size_mb"] = round(os.path.getsize(DB_PATH) / (1024 * 1024), 2)
    
    # 2. Stats
    try:
        stats = await get_stats()
        results["total_records"] = stats.get("total", 0)
        results["sectors"] = stats.get("sectors", {})
    except Exception as e:
        results["stats_error"] = str(e)
        
    # 3. Stress Test (Embedding Speed)
    mem = get_memory()
    test_string = "This is a stress test memory string to check the latency of the embedding model under the unified neural engine architecture."
    
    start_time = time.time()
    try:
        temp_id = "test_stress_" + str(int(time.time()))
        await mem.add(test_string, user_id="audit", meta={"sector": "test", "id": temp_id})
        end_time = time.time()
        results["embedding_test"]["latency_seconds"] = round(end_time - start_time, 3)
        results["embedding_test"]["status"] = "SUCCESS"
        
        # Cleanup
        res = await mem.search("stress test", user_id="audit", limit=1)
        if res:
            await mem.delete(res[0]['id'])
    except Exception as e:
        results["embedding_test"]["status"] = "FAILED"
        results["embedding_test"]["error"] = traceback.format_exc()
        
    # 4. Retrieval Stress Test
    start_time = time.time()
    try:
        res = await mem.search("React components", user_id="jack", limit=100)
        end_time = time.time()
        results["retrieval_test"]["latency_seconds"] = round(end_time - start_time, 3)
        results["retrieval_test"]["records_returned"] = len(res)
        results["retrieval_test"]["status"] = "SUCCESS"
    except Exception as e:
        results["retrieval_test"]["status"] = "FAILED"
        results["retrieval_test"]["error"] = traceback.format_exc()

    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    asyncio.run(audit_memory())
