import os
import sys
import json
import asyncio
import hashlib
import warnings

warnings.filterwarnings("ignore")
os.environ["DEEPLAKE_LOG_LEVEL"] = "error"

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Add to path so we can import local modules
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from execution.vector_memory import store_memory, get_memory
from execution.deep_lake_vault import VAULT_PATH
import deeplake

class SilenceStdout:
    def __enter__(self):
        self._stdout = sys.stdout
        self._stderr = sys.stderr
        sys.stdout = open(os.devnull, 'w')
        sys.stderr = open(os.devnull, 'w')
    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.close()
        sys.stderr.close()
        sys.stdout = self._stdout
        sys.stderr = self._stderr

def get_hash(content: str) -> str:
    return hashlib.md5(content.encode('utf-8')).hexdigest()

async def sync():
    print("Initializing Neural Synchronization...")
    mem = get_memory()
    
    # 1. Fetch existing memories to prevent duplicates
    print("Fetching existing memory matrix...")
    existing = await mem.search("*", user_id="jack", limit=10000)
    existing_hashes = set()
    for r in existing:
        meta = r.get('metadata') or r.get('meta') or {}
        h = meta.get('content_hash')
        if h:
            existing_hashes.add(h)

    new_nodes = 0

    # 2. Sync Graphify AST (Structural)
    graphify_path = os.path.join(BASE_DIR, "graphify-out", "graph.json")
    if os.path.exists(graphify_path):
        print("Parsing Graphify AST...")
        with open(graphify_path, "r", encoding="utf-8") as f:
            graph_data = json.load(f)
        
        for g_node in graph_data.get("nodes", []):
            node_id = g_node.get("id", "")
            label = g_node.get("label", node_id)
            content = f"AST Node: {g_node.get('file_type', 'code')} in {g_node.get('source_file')}\nSymbol: {label}"
            
            content_hash = get_hash(content)
            if content_hash not in existing_hashes:
                meta = {
                    "sector": "structural",
                    "content_hash": content_hash,
                    "ast_id": node_id,
                    "source_file": g_node.get("source_file"),
                    "tags": ["ast", "code"]
                }
                # store_memory doesn't let us pass custom meta easily, so we use mem.add directly
                await mem.add(content, user_id="jack", meta=meta)
                existing_hashes.add(content_hash)
                new_nodes += 1
                print(f"  + Added AST Node: {label}")
    else:
        print("No graphify data found. Run 'graphify update .' to generate AST.")

    # 3. Sync DeepLake Vault (Procedural)
    if os.path.exists(VAULT_PATH):
        print("Parsing DeepLake Skill Vault...")
        try:
            with SilenceStdout():
                ds = deeplake.load(VAULT_PATH, read_only=True)
            num_skills = len(ds)
            texts = ds.text.data()["value"]
            metadatas = ds.metadata.data()["value"]
            
            for i in range(num_skills):
                text = texts[i]
                meta_src = metadatas[i] or {}
                name = meta_src.get("name", f"Skill_{i}")
                
                content_hash = get_hash(text)
                if content_hash not in existing_hashes:
                    meta = {
                        "sector": "procedural",
                        "content_hash": content_hash,
                        "skill_name": name,
                        "tags": ["skill", "procedural"]
                    }
                    await mem.add(text, user_id="jack", meta=meta)
                    existing_hashes.add(content_hash)
                    new_nodes += 1
                    print(f"  + Added Skill: {name}")
        except Exception as e:
            print(f"Failed to read DeepLake Vault: {e}")

    print(f"Synchronization Complete. {new_nodes} new cognitive traces injected.")

if __name__ == "__main__":
    asyncio.run(sync())
