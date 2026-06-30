import os
import sys
import asyncio
import json
import warnings

warnings.filterwarnings("ignore")
os.environ["DEEPLAKE_LOG_LEVEL"] = "error"

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from execution.vector_memory import recall_memory

async def find_skills(query: str, limit: int = 20):
    print(f"Executing Semantic Sweep for query: '{query}'")
    results = await recall_memory(query, user_id="jack", limit=limit)
    
    skills = []
    for r in results:
        meta = r.get("metadata") or r.get("meta") or {}
        tags = meta.get("tags", [])
        
        # We only want to return skills
        if "skill" in tags or meta.get("sector") == "procedural" or meta.get("skill_name"):
            name = meta.get("skill_name", "Unknown Skill")
            
            if not any(s['name'] == name for s in skills):
                skills.append({
                    "name": name,
                    "relevance_score": r.get("distance", 0.0),
                    "tags": tags
                })
    
    if not skills:
        print("No related skills found in vector memory. Run sync_neural_memory.py to ingest skills.")
        return
        
    print(f"\n[Semantic Skill Extraction - Top {len(skills)} Modules]")
    for i, s in enumerate(skills, 1):
        # OpenMemory returns distance, lower is closer. Convert to similarity approx.
        dist = float(s['relevance_score'])
        sim = max(0.0, 1.0 - dist)
        print(f"{i}. {s['name']} (Sim: {sim:.3f})")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python find_skills.py \"<task description>\"")
        sys.exit(1)
        
    query = sys.argv[1]
    asyncio.run(find_skills(query))
