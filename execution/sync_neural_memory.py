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

    # 3. Sync Filesystem Skills (Procedural)
    import re
    from collections import Counter
    
    home_dir = os.environ.get("USERPROFILE") or os.environ.get("HOME") or ""
    scan_dirs = [
        os.path.join(home_dir, ".gemini", "skills"),
        os.path.abspath(os.path.join(BASE_DIR, ".agent", "skills")),
        os.path.abspath(os.path.join(BASE_DIR, "skills"))
    ]
    
    print("Parsing File System Skill Modules...")
    for d in scan_dirs:
        if not os.path.exists(d): continue
        for root_dir, _, files in os.walk(d):
            for f in files:
                if f == "SKILL.md" or f.endswith("_skill.md"):
                    filepath = os.path.join(root_dir, f)
                    try:
                        with open(filepath, "r", encoding="utf-8") as file_obj:
                            content = file_obj.read()
                            
                        # Extract meta manually to avoid heavy yaml imports
                        meta_extracted = {}
                        match = re.search(r"^---\n([\s\S]*?)\n---", content)
                        if match:
                            for line in match.group(1).split("\n"):
                                if ":" in line:
                                    k, v = line.split(":", 1)
                                    meta_extracted[k.strip()] = v.strip().strip("'").strip('"')
                                    
                        name = meta_extracted.get("name") or os.path.basename(os.path.dirname(filepath))
                        
                        content_hash = get_hash(content)
                        if content_hash not in existing_hashes:
                            meta = {
                                "sector": "procedural",
                                "content_hash": content_hash,
                                "skill_name": name,
                                "tags": ["skill", "procedural", "fs_injected"]
                            }
                            # Safe DB injection via semantic vector_memory.py
                            await mem.add(content, user_id="jack", meta=meta)
                            existing_hashes.add(content_hash)
                            new_nodes += 1
                            print(f"  + Added Skill: {name}")
                    except Exception as e:
                        print(f"Failed to read file {filepath}: {e}")

    print(f"Synchronization Complete. {new_nodes} new cognitive traces injected.")

if __name__ == "__main__":
    try:
        asyncio.run(sync())
    except Exception as e:
        print(f"Warning: Neural Synchronization bypassed due to error: {e}", file=sys.stderr)
        sys.exit(0)

