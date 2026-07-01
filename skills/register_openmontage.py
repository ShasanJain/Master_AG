import os
import json

SKILLS_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(SKILLS_DIR, "skills.json")

def register():
    if not os.path.exists(JSON_PATH):
        print(f"Error: {JSON_PATH} not found.")
        return

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    entries = data.get("entries", [])
    existing_paths = {e["path"] for e in entries}

    openmontage_dir = os.path.join(SKILLS_DIR, "openmontage")
    added_count = 0

    for root, dirs, files in os.walk(openmontage_dir):
        for file in files:
            if file.endswith(".md"):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, os.path.dirname(SKILLS_DIR))
                normalized_path = rel_path.replace("\\", "/")
                
                if normalized_path not in existing_paths:
                    entries.append({"path": normalized_path})
                    added_count += 1

    data["entries"] = entries
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"Registered {added_count} new OpenMontage skills in skills.json.")

if __name__ == "__main__":
    register()
