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

class SilenceStdout:
    def __enter__(self):
        sys.stdout.flush()
        self.old_stdout_fd = os.dup(1)
        self.null_fd = os.open(os.devnull, os.O_WRONLY)
        os.dup2(self.null_fd, 1)
        os.close(self.null_fd)

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.flush()
        os.dup2(self.old_stdout_fd, 1)
        os.close(self.old_stdout_fd)

# Silence low-level stdout during import of deeplake
with SilenceStdout():
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
            with SilenceStdout():
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

    # 3. Fetch Graphify AST structure from graphify-out/graph.json
    graphify_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "graphify-out", "graph.json")
    if os.path.exists(graphify_path):
        try:
            with open(graphify_path, "r", encoding="utf-8") as f:
                graphify_data = json.load(f)
            
            # Map graphify node IDs to keep track
            graphify_node_ids = set()
            for g_node in graphify_data.get("nodes", []):
                node_id = g_node.get("id")
                # Group as 'ast' for distinction
                node = {
                    "id": node_id,
                    "label": g_node.get("label", node_id),
                    "group": "ast",
                    "content": f"AST: {g_node.get('file_type', 'code')} in {g_node.get('source_file')}",
                    "sector": "structural",
                    "salience": 0.8,
                    "source_file": g_node.get("source_file"),
                    "source_location": g_node.get("source_location")
                }
                nodes.append(node)
                graphify_node_ids.add(node_id)
            
            # Merge graphify links
            for g_link in graphify_data.get("links", []):
                src = g_link.get("source")
                tgt = g_link.get("target")
                if src in graphify_node_ids and tgt in graphify_node_ids:
                    links.append({
                        "source": src,
                        "target": tgt,
                        "value": g_link.get("weight", 0.5),
                        "relation": g_link.get("relation", "contains")
                    })
        except Exception as e:
            sys.stderr.write(f"Warning loading Graphify: {e}\n")

    # 4. Combine vectors and calculate semantic proximity clusters
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
                    "value": val,
                    "relation": "semantic_similarity"
                })

    # 5. Connect AST nodes to corresponding industrial skills/memories based on filename matches
    for node in nodes:
        if node["group"] == "ast" and node.get("source_file"):
            # Check if any skill or memory corresponds to this file
            src_file = node["source_file"].replace("/", "\\").lower()
            for other in nodes:
                if other["group"] == "industrial" and other.get("content") and "skill" in other.get("content").lower():
                    # Check if file path is in the content
                    if src_file in other.get("content").lower() or other["label"].lower() in src_file:
                        links.append({
                            "source": node["id"],
                            "target": other["id"],
                            "value": 1.0,
                            "relation": "implements"
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
