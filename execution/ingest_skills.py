import os
import asyncio
import numpy as np
from deep_lake_vault import get_embedding, init_vault, VAULT_PATH
import requests
import deeplake
from dotenv import load_dotenv

load_dotenv()

GLOBAL_SKILLS_DIR = os.path.abspath(os.path.expanduser("~/.gemini/skills"))
LOCAL_SKILLS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "skills"))
SKILLS_DIR = GLOBAL_SKILLS_DIR if os.path.exists(GLOBAL_SKILLS_DIR) else LOCAL_SKILLS_DIR
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
EMBED_MODEL = "nomic-embed-text"

sem = asyncio.Semaphore(5)

async def get_embedding_async(text):
    """Get vector from local Ollama node asynchronously with semaphore."""
    async with sem:
        url = f"{OLLAMA_URL}/api/embeddings"
        loop = asyncio.get_event_loop()
        try:
            response = await loop.run_in_executor(None, lambda: requests.post(
                url,
                json={"model": EMBED_MODEL, "prompt": text},
                timeout=60
            ))
            response.raise_for_status()
            return response.json()["embedding"]
        except Exception as e:
            print(f"Embedding Failure: {e}")
            return [0.0] * 768

async def ingest_batch(batch_data):
    """Extend Deep Lake dataset with a batch of skills."""
    ds = deeplake.load(VAULT_PATH)
    texts = [d['text'] for d in batch_data]
    
    # Fetch embeddings concurrently (limited by semaphore)
    embeddings = await asyncio.gather(*[get_embedding_async(t) for t in texts])
    metadatas = [d['metadata'] for d in batch_data]
    
    with ds:
        ds.extend({
            'text': texts,
            'embedding': [np.array(e, dtype='float32') for e in embeddings],
            'metadata': metadatas
        })
    print(f" > Successfully batched {len(batch_data)} skills.")

async def migrate_industrial(overwrite=False):
    """Industrial-grade batch migration with resume support."""
    ds = init_vault(overwrite=overwrite)
    
    # Get existing paths to skip
    existing_paths = set()
    if len(ds) > 0 and not overwrite:
        print(f"[INFO] Fetching {len(ds)} existing paths from vault...")
        # Load metadata in chunks if needed, but for 4k it's fine
        metas = ds.metadata.data()["value"]
        existing_paths = {m.get("path") for m in metas if m.get("path")}
    
    batch = []
    batch_size = 50
    total_count = 0
    skip_count = 0
    
    print("[START] Beginning Industrial Batch Migration...")
    
    for root, dirs, files in os.walk(SKILLS_DIR):
        for file in files:
            if file.endswith(".md"):
                path = os.path.join(root, file)
                rel_path = os.path.relpath(path, SKILLS_DIR)
                
                if rel_path in existing_paths:
                    skip_count += 1
                    continue
                    
                try:
                    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    skill_name = os.path.basename(os.path.dirname(path))
                    batch.append({
                        "text": content,
                        "metadata": {
                            "name": skill_name,
                            "path": rel_path,
                            "type": "procedural_skill"
                        }
                    })
                    
                    if len(batch) >= batch_size:
                        await ingest_batch(batch)
                        total_count += len(batch)
                        batch = []
                        
                except Exception as e:
                    print(f"Error reading {file}: {e}")
                    
    # Final batch
    if batch:
        await ingest_batch(batch)
        total_count += len(batch)
        
    print(f"\n[COMPLETE] Synchronized {total_count} new skills. Skipped {skip_count} existing. Total vault: {len(ds)}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="Reset and rebuild the entire vault index.")
    args = parser.parse_args()
    asyncio.run(migrate_industrial(overwrite=args.reset))
