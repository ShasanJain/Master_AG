import os
import sys
import json
import requests
import numpy as np
import deeplake
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
VAULT_PATH = os.path.join(BASE_DIR, "skill_vault")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
EMBED_MODEL = "nomic-embed-text"

def get_embedding(text):
    """Get vector embedding from local Ollama node synchronously."""
    url = f"{OLLAMA_URL}/api/embeddings"
    try:
        response = requests.post(url, json={"model": EMBED_MODEL, "prompt": text}, timeout=60)
        response.raise_for_status()
        return response.json()["embedding"]
    except Exception as e:
        print(f"Embedding Failure: {e}")
        return [0.0] * 768

def init_vault(overwrite=False):
    """Initialize the Deep Lake dataset schema."""
    if overwrite and os.path.exists(VAULT_PATH):
        import shutil
        try:
            shutil.rmtree(VAULT_PATH)
        except Exception as e:
            print(f"Reset Failure: {e}")
            
    if not os.path.exists(VAULT_PATH):
        ds = deeplake.empty(VAULT_PATH, overwrite=True)
        ds.create_tensor('text', htype='text')
        ds.create_tensor('embedding', htype='generic')
        ds.create_tensor('metadata', htype='json')
        return ds
    return deeplake.load(VAULT_PATH)

async def search_vault(query_text, limit=3):
    """
    Search the Deep Lake vault using manual Cosine Similarity (Windows Fallback).
    Optimized to load read-only and handle dataset locks gracefully.
    """
    try:
        if not os.path.exists(VAULT_PATH):
            return []
            
        ds = deeplake.load(VAULT_PATH, read_only=True)
        if len(ds) == 0:
            return []
            
        q_embedding = np.array(get_embedding(query_text), dtype='float32')
        
        embeddings = ds.embedding.data()["value"]
        texts = ds.text.data()["value"]
        metadatas = ds.metadata.data()["value"]
        
        results = []
        for i, emb in enumerate(embeddings):
            if emb is None:
                continue
            emb = np.array(emb, dtype='float32')
            dot_product = np.dot(q_embedding, emb)
            norm_q = np.linalg.norm(q_embedding)
            norm_emb = np.linalg.norm(emb)
            similarity = dot_product / (norm_q * norm_emb) if (norm_q * norm_emb) > 0 else 0.0
            
            results.append({
                "content": texts[i],
                "metadata": metadatas[i],
                "similarity": float(similarity)
            })
            
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:limit]
    except Exception as e:
        print(f"Vault Search Failure: {e}")
        return []

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "stats":
        if os.path.exists(VAULT_PATH):
            try:
                ds = deeplake.load(VAULT_PATH, read_only=True)
                print(json.dumps({"total_skills": len(ds)}))
            except Exception as e:
                print(json.dumps({"error": str(e)}))
        else:
            print(json.dumps({"total_skills": 0}))
