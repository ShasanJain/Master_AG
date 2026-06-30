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


async def generate_graph(limit_mem=500, threshold=0.65):
    nodes = []
    links = []
    all_vectors = []
    
    # 1. Fetch All Cognitive Traces from SQLite (OpenMemory)
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
                
                meta = {}
                try:
                    if meta_str: meta = json.loads(meta_str)
                except:
                    pass
                
                title = content[:40] + "..." if len(content) > 40 else content
                group = "personal"
                
                if meta.get("ast_id"):
                    group = "ast"
                    title = meta.get("ast_id")
                elif meta.get("skill_name"):
                    group = "industrial"
                    title = meta.get("skill_name")
                elif meta.get("tags"):
                    title = f"#{meta['tags'][0]} - {title}"
                elif sector == "structural":
                    group = "ast"
                elif sector == "procedural":
                    group = "industrial"
                    
                node = {
                    "id": mem_id,
                    "label": title,
                    "group": group,
                    "content": content,
                    "sector": sector or meta.get("sector") or "semantic",
                    "salience": float(salience) if salience is not None else 1.0,
                    "source_file": meta.get("source_file"),
                }
                nodes.append(node)
                if vec is not None:
                    all_vectors.append((mem_id, vec))
            conn.close()
        except Exception as e:
            sys.stderr.write(f"DB Error: {e}\n")

    # 1.5 Inject File System Skills and Cluster Hubs
    try:
        home_dir = os.environ.get("USERPROFILE") or os.environ.get("HOME") or ""
        scan_dirs = [
            os.path.join(home_dir, ".gemini", "skills"),
            os.path.abspath(os.path.join(os.getcwd(), "..", ".agent", "skills")),
            os.path.abspath(os.path.join(os.getcwd(), "..", "skills"))
        ]
        
        category_counts = Counter()
        skill_nodes = []
        processed_titles = set()
        
        for d in scan_dirs:
            if not os.path.exists(d): continue
            for root_dir, _, files in os.walk(d):
                for f in files:
                    if f == "SKILL.md" or f.endswith("_skill.md"):
                        filepath = os.path.join(root_dir, f)
                        try:
                            with open(filepath, "r", encoding="utf-8") as file_obj:
                                content = file_obj.read()
                            # Parse YAML frontmatter manually
                            meta = {}
                            match = re.search(r"^---\n([\s\S]*?)\n---", content)
                            if match:
                                for line in match.group(1).split("\n"):
                                    if ":" in line:
                                        k, v = line.split(":", 1)
                                        meta[k.strip()] = v.strip().strip("'").strip('"')
                            
                            title = meta.get("name") or os.path.basename(os.path.dirname(filepath))
                            if title in processed_titles: continue
                            processed_titles.add(title)
                            
                            cat = "CORE"
                            file_lower = filepath.lower()
                            if meta.get("category"): cat = meta["category"].upper()
                            elif "design" in file_lower or "ui" in file_lower: cat = "DESIGN"
                            elif "execution" in file_lower or "dev" in file_lower or "code" in file_lower: cat = "DEV"
                            elif "planning" in file_lower: cat = "PLANNING"
                            elif "review" in file_lower or "security" in file_lower or "ops" in file_lower: cat = "SRE"
                            elif "automation" in file_lower: cat = "AUTOMATION"
                            
                            category_counts[cat] += 1
                            node_id = f"skill_{title}"
                            skill_nodes.append({
                                "id": node_id,
                                "label": title,
                                "group": "industrial",
                                "content": meta.get("description", "Dynamic Skill Module"),
                                "sector": cat,
                                "salience": 2.0,
                                "source_file": filepath
                            })
                            
                        except Exception:
                            pass
        
        # Add Hub Nodes for each Category and link skills to them
        for cat, count in category_counts.items():
            hub_id = f"hub_{cat}"
            nodes.append({
                "id": hub_id,
                "label": cat,
                "group": "community",
                "content": f"Central hub for {cat} modules.",
                "member_count": count,
                "salience": float(count) * 2.0
            })
            
            # Link each skill in this category to the hub
            for snode in skill_nodes:
                if snode["sector"] == cat:
                    links.append({
                        "source": snode["id"],
                        "target": hub_id,
                        "value": 10.0, # High gravity to pull them close
                        "relation": "belongs_to_category"
                    })
        nodes.extend(skill_nodes)
    except Exception as e:
        sys.stderr.write(f"Skill injection Error: {e}\n")

    # 2. Calculate pure semantic relationships (Cosine Similarity)
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
                
        # Sort and take top 4 semantic links per node to avoid visual overload
        similarities.sort(key=lambda x: x[1], reverse=True)
        for target_id, val in similarities[:4]:
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
