import os
import sys
import json
import sqlite3
import numpy as np
import warnings
import asyncio

# Suppress all noisy library warnings to guarantee clean JSON stdout
warnings.filterwarnings("ignore")
os.environ["DEEPLAKE_LOG_LEVEL"] = "error"

from vector_memory import DB_PATH
from deep_lake_vault import VAULT_PATH
import deeplake

def decode_vector(blob):
    """Decode SQLite BLOB vector to numpy array (assumes float32)."""
    if not blob:
        return None
    try:
        return np.frombuffer(blob, dtype=np.float32)
    except Exception:
        return None

def cosine_similarity(v1, v2):
    """Calculate cosine similarity between two vectors."""
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
    return float(np.dot(v1, v2) / (norm_v1 * norm_v2))

async def generate_graph(limit_mem=100, limit_skills=100, threshold=0.75):
    nodes = []
    links = []
    
    # 1. Fetch Personal Memories from SQLite (OpenMemory)
    memories_data = []
    if os.path.exists(DB_PATH):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, content, primary_sector, vector, salience, meta FROM memories LIMIT ?",
                (limit_mem,)
            )
            rows = cursor.fetchall()
            for row in rows:
                mem_id, content, sector, vec_blob, salience, meta_str = row
                vec = decode_vector(vec_blob)
                
                # Try parsing metadata for custom title/labels
                title = content[:30] + "..." if len(content) > 30 else content
                try:
                    meta = json.loads(meta_str) if meta_str else {}
                    if meta.get("tags"):
                        title = f"#{meta['tags'][0]} - {title}"
                except:
                    pass
                
                node = {
                    "id": mem_id,
                    "label": title,
                    "group": "personal",
                    "content": content,
                    "sector": sector or "semantic",
                    "salience": float(salience) if salience is not None else 1.0
                }
                nodes.append(node)
                if vec is not None:
                    memories_data.append((mem_id, vec))
            conn.close()
        except Exception:
            pass

    # 2. Fetch Industrial Skills from Deep Lake (skill_vault)
    skills_data = []
    if os.path.exists(VAULT_PATH):
        try:
            ds = deeplake.load(VAULT_PATH, read_only=True)
            num_skills = min(len(ds), limit_skills)
            if num_skills > 0:
                texts = ds.text.data()["value"][:num_skills]
                embeddings = ds.embedding.data()["value"][:num_skills]
                metadatas = ds.metadata.data()["value"][:num_skills]
                
                for i in range(num_skills):
                    skill_id = f"skill_{i}"
                    meta = metadatas[i] or {}
                    title = meta.get("title", f"Skill {i}")
                    if not title:
                        title = meta.get("file", f"Skill {i}")
                    
                    node = {
                        "id": skill_id,
                        "label": title,
                        "group": "industrial",
                        "content": texts[i],
                        "sector": "procedural",
                        "salience": 1.0
                    }
                    nodes.append(node)
                    
                    vec = embeddings[i]
                    if vec is not None:
                        skills_data.append((skill_id, np.array(vec, dtype='float32')))
        except Exception:
            pass

    # 3. Combine vectors and calculate semantic proximity clusters
    all_vectors = memories_data + skills_data
    
    # Calculate relationships (Cosine Similarity)
    n = len(all_vectors)
    for i in range(n):
        node_id_i, vec_i = all_vectors[i]
        similarities = []
        for j in range(n):
            if i == j:
                continue
            node_id_j, vec_j = all_vectors[j]
            sim = cosine_similarity(vec_i, vec_j)
            if sim >= threshold:
                similarities.append((node_id_j, sim))
                
        # Sort and take top 3 semantic links per node to avoid visual overload
        similarities.sort(key=lambda x: x[1], reverse=True)
        for target_id, val in similarities[:3]:
            # Add undirected link (prevent duplicates if already linked in other direction)
            exists = False
            for link in links:
                if (link["source"] == node_id_i and link["target"] == target_id) or \
                   (link["source"] == target_id and link["target"] == node_id_i):
                    exists = True
                    break
            if not exists:
                links.append({
                    "source": node_id_i,
                    "target": target_id,
                    "value": val
                })

    return {
        "nodes": nodes,
        "links": links
    }

def main():
    # Force stdin and stdout to use UTF-8 encoding
    if sys.platform == "win32":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
        
    try:
        graph = asyncio.run(generate_graph())
        print(json.dumps(graph, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"nodes": [], "links": [], "error": str(e)}))

if __name__ == "__main__":
    main()
