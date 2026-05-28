import os
import sys
import json
import re
import sqlite3
import numpy as np
import warnings
import asyncio
from collections import Counter

# Suppress all noisy library warnings to guarantee clean JSON stdout
warnings.filterwarnings("ignore")
os.environ["DEEPLAKE_LOG_LEVEL"] = "error"

from vector_memory import DB_PATH
from deep_lake_vault import VAULT_PATH

class SilenceStdout:
    def __enter__(self):
        pass
    def __exit__(self, exc_type, exc_val, exc_tb):
        pass
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


def parse_community_summaries(report_path):
    """
    Parse GRAPH_REPORT.md to extract community summaries.
    Returns a dict: { community_id: { "cohesion": float, "nodes_text": str, "node_count": int } }
    """
    communities = {}
    if not os.path.exists(report_path):
        return communities

    try:
        with open(report_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Match community sections:  ### Community N - "..."
        pattern = r'### Community (\d+) - "([^"]*)"\s*\nCohesion: ([\d.]+)\s*\nNodes \((\d+)\): (.+?)(?=\n###|\n##|\Z)'
        matches = re.findall(pattern, content, re.DOTALL)

        for match in matches:
            comm_id = int(match[0])
            cohesion = float(match[2])
            node_count = int(match[3])
            nodes_text = match[4].strip()
            communities[comm_id] = {
                "cohesion": cohesion,
                "node_count": node_count,
                "nodes_text": nodes_text,
            }
    except Exception:
        pass

    return communities


def compute_degrees(graphify_links):
    """Compute degree count per node ID from graphify links."""
    degree = Counter()
    for link in graphify_links:
        degree[link.get("source", "")] += 1
        degree[link.get("target", "")] += 1
    return degree


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
                    title = meta.get("name") or meta.get("title") or meta.get("file") or f"Skill {i}"
                    
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
    report_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "graphify-out", "GRAPH_REPORT.md")

    if os.path.exists(graphify_path):
        try:
            with open(graphify_path, "r", encoding="utf-8") as f:
                graphify_data = json.load(f)
            
            graphify_links = graphify_data.get("links", [])
            degree = compute_degrees(graphify_links)

            # ── Phase 1: Prune isolated nodes (degree ≤ 1) ──
            graphify_node_ids = set()
            community_members = {}  # community_id -> list of node IDs

            for g_node in graphify_data.get("nodes", []):
                node_id = g_node.get("id")
                node_degree = degree.get(node_id, 0)

                # Skip isolated nodes — they have no structural value
                if node_degree <= 1:
                    continue

                comm_id = g_node.get("community")

                node = {
                    "id": node_id,
                    "label": g_node.get("label", node_id),
                    "group": "ast",
                    "content": f"AST: {g_node.get('file_type', 'code')} in {g_node.get('source_file')}",
                    "sector": "structural",
                    "salience": min(0.3 + (node_degree * 0.1), 1.0),  # Degree-weighted salience
                    "source_file": g_node.get("source_file"),
                    "source_location": g_node.get("source_location"),
                    "cluster": comm_id,  # Phase 1: attach community cluster ID
                }
                nodes.append(node)
                graphify_node_ids.add(node_id)

                # Track community membership for Phase 2
                if comm_id is not None:
                    community_members.setdefault(comm_id, []).append(node_id)
            
            # Merge graphify links (only between non-pruned nodes)
            for g_link in graphify_links:
                src = g_link.get("source")
                tgt = g_link.get("target")
                if src in graphify_node_ids and tgt in graphify_node_ids:
                    links.append({
                        "source": src,
                        "target": tgt,
                        "value": g_link.get("weight", 0.5),
                        "relation": g_link.get("relation", "contains")
                    })

            # ── Phase 2: Inject Community Summary Nodes ──
            comm_summaries = parse_community_summaries(report_path)

            for comm_id, member_ids in community_members.items():
                if len(member_ids) < 2:
                    continue  # Skip trivial communities with <2 connected members

                summary = comm_summaries.get(comm_id, {})
                cohesion = summary.get("cohesion", 0)
                node_count = summary.get("node_count", len(member_ids))
                nodes_text = summary.get("nodes_text", "")

                comm_node_id = f"community_{comm_id}"
                if nodes_text:
                    top_nodes = [n.strip().replace("()", "") for n in nodes_text.split(",")[:2]]
                    short_desc = ", ".join(top_nodes)
                    comm_label = short_desc or f"Cluster {comm_id}"
                    description = f"Community {comm_id} ({node_count} members, cohesion {cohesion:.2f}): {nodes_text}"
                else:
                    member_labels = []
                    for n in nodes:
                        if n.get("cluster") == comm_id and n["group"] == "ast":
                            member_labels.append(n["label"])
                    top_nodes = [n.replace("()", "") for n in member_labels[:2]]
                    short_desc = ", ".join(top_nodes)
                    comm_label = short_desc or f"Cluster {comm_id}"
                    description = f"Community {comm_id} ({len(member_labels)} connected members): {', '.join(member_labels[:8])}"
                    if len(member_labels) > 8:
                        description += f" (+{len(member_labels) - 8} more)"

                community_node = {
                    "id": comm_node_id,
                    "label": comm_label,
                    "group": "community",
                    "content": description,
                    "sector": "structural",
                    "salience": min(0.5 + cohesion, 1.0),
                    "cluster": comm_id,
                    "cohesion": cohesion,
                    "member_count": len(member_ids),
                }
                nodes.append(community_node)

                # Link community node to each member (lightweight hub-spoke)
                for mid in member_ids:
                    links.append({
                        "source": comm_node_id,
                        "target": mid,
                        "value": 0.3,
                        "relation": "community_member"
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
