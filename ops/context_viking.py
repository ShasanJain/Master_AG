import os
import json
import re
import argparse
from typing import Dict, List, Any

class ContextViking:
    """
    OpenViking-inspired context indexing database.
    Maps directory structures to L0 (Summary/Skeleton) and L2 (Full Source) data.
    """
    def __init__(self, root_dir: str):
        self.root_dir = os.path.abspath(root_dir)
        self.db_path = os.path.join(self.root_dir, "scratch", "viking_context_db.json")
        self.exclude_dirs = {".git", "node_modules", ".next", "dist", "build", "venv", "graphify-out", "__pycache__"}
        self.supported_exts = {".py", ".ts", ".tsx", ".json", ".md", ".css"}

    def generate_l0_skeleton(self, filepath: str) -> Dict[str, Any]:
        """L0 tier: summary skeleton of the file, listing imports, classes, and function definitions."""
        ext = os.path.splitext(filepath)[1]
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()
        except Exception:
            return {"type": "unknown", "apis": []}

        apis = []
        if ext == ".py":
            for line in lines:
                stripped = line.strip()
                if stripped.startswith("def ") or stripped.startswith("class "):
                    apis.append(stripped.split("(")[0] if "(" in stripped else stripped)
            return {"type": "python", "apis": apis, "lines": len(lines)}
        elif ext in (".ts", ".tsx"):
            for line in lines:
                stripped = line.strip()
                if "export function " in stripped or "export const " in stripped or "interface " in stripped or "class " in stripped:
                    apis.append(stripped.split("{")[0].strip())
            return {"type": "typescript", "apis": apis, "lines": len(lines)}
        return {"type": "raw", "lines": len(lines)}

    def build_db(self) -> Dict[str, Any]:
        print(f"[Viking Context] Scanning workspace root: {self.root_dir}")
        viking_fs = {}

        for root, dirs, files in os.walk(self.root_dir):
            # Skip excluded paths
            dirs[:] = [d for d in dirs if d not in self.exclude_dirs and not d.startswith(".")]
            
            for file in files:
                ext = os.path.splitext(file)[1]
                if ext not in self.supported_exts:
                    continue

                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, self.root_dir).replace("\\", "/")
                
                # Exclude temporary files inside scratch/ except DB configs
                if rel_path.startswith("scratch/") and file != "viking_context_db.json":
                    continue

                l0_info = self.generate_l0_skeleton(abs_path)
                
                viking_fs[f"viking://{rel_path}"] = {
                    "rel_path": rel_path,
                    "abs_path": abs_path,
                    "filename": file,
                    "extension": ext,
                    "size_bytes": os.path.getsize(abs_path),
                    "l0_skeleton": l0_info
                }

        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        with open(self.db_path, "w", encoding="utf-8") as f:
            json.dump(viking_fs, f, indent=2)

        print(f"[Viking Context] DB generated with {len(viking_fs)} indexed resources. Saved -> {self.db_path}")
        return viking_fs

    def query(self, search_term: str) -> List[Dict[str, Any]]:
        """Search L0 index metadata for fast, highly targeted resource discovery."""
        if not os.path.exists(self.db_path):
            self.build_db()

        with open(self.db_path, "r", encoding="utf-8") as f:
            db = json.load(f)

        results = []
        term = search_term.lower()
        for v_uri, meta in db.items():
            match = False
            # Check filename/paths
            if term in meta["rel_path"].lower():
                match = True
            # Check APIS (L0 skeleton)
            elif "apis" in meta["l0_skeleton"]:
                for api in meta["l0_skeleton"]["apis"]:
                    if term in api.lower():
                        match = True
                        break

            if match:
                results.append({
                    "uri": v_uri,
                    "rel_path": meta["rel_path"],
                    "abs_path": meta["abs_path"],
                    "skeleton": meta["l0_skeleton"]
                })

        return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--build", action="store_true", help="Build context index database")
    parser.add_argument("--query", type=str, default="", help="Query the L0 database index")
    args = parser.parse_args()

    viking = ContextViking(root_dir=os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    if args.build:
        viking.build_db()
    elif args.query:
        matches = viking.query(args.query)
        print(json.dumps(matches, indent=2))
