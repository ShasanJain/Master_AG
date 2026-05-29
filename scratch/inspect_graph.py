import json
import os

graph_path = "graphify-out/graph.json"
if os.path.exists(graph_path):
    with open(graph_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    print("Keys:", list(data.keys()))
    print("Nodes count:", len(data.get("nodes", [])))
    if data.get("nodes"):
        print("Sample Node:", data["nodes"][0])
    for key in data:
        if key != "nodes" and isinstance(data[key], list):
            print(f"List key: {key}, count: {len(data[key])}")
            if data[key]:
                print(f"Sample {key}:", data[key][0])
else:
    print("File not found")
