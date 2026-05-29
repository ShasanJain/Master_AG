import json
from collections import Counter

g = json.load(open("graphify-out/graph.json", "r", encoding="utf-8"))

degree = Counter()
for l in g["links"]:
    degree[l["source"]] += 1
    degree[l["target"]] += 1

isolated = [n["id"] for n in g["nodes"] if degree.get(n["id"], 0) <= 1]
connected = [n for n in g["nodes"] if degree.get(n["id"], 0) > 1]

print(f"Total nodes: {len(g['nodes'])}")
print(f"Isolated (degree<=1): {len(isolated)}")
print(f"Connected (degree>1): {len(connected)}")

communities = set(n.get("community") for n in g["nodes"])
print(f"Communities: {len(communities)}")

comm_counts = Counter(n.get("community") for n in g["nodes"])
print("Top 10 communities:", comm_counts.most_common(10))

# Show some isolated node labels
print("\nSample isolated nodes:")
for nid in isolated[:10]:
    node = next((n for n in g["nodes"] if n["id"] == nid), None)
    if node:
        print(f"  {node['label']} (community {node.get('community')})")
