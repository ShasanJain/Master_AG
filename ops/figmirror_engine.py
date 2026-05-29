import os
import json
import argparse
from typing import Dict, Any

class FigMirrorStyleReplicator:
    """
    FigMirror-inspired visual feedback and style replication engine.
    Compares candidate assets/parameters to a style profile and returns a refinement checklist.
    """
    def __init__(self, workspace_root: str):
        self.workspace_root = os.path.abspath(workspace_root)
        self.profiles_path = os.path.join(self.workspace_root, "config", "profiles.json")

    def load_profiles(self) -> Dict[str, Any]:
        if not os.path.exists(self.profiles_path):
            return {"profiles": {}}
        with open(self.profiles_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def write_profiles(self, data: Dict[str, Any]):
        os.makedirs(os.path.dirname(self.profiles_path), exist_ok=True)
        with open(self.profiles_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def review_and_align(self, target_style_name: str, candidate_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Reviewer step: Compares candidate configuration against a target style profile
        and generates a delta checklist for refinement.
        """
        all_profiles = self.load_profiles()
        profiles = all_profiles.get("profiles", {})
        
        if target_style_name not in profiles:
            return {
                "aligned": False,
                "error": f"Target style '{target_style_name}' not found.",
                "checklist": ["Create target style profile first."]
            }
            
        target = profiles[target_style_name]
        checklist = []
        updates = {}
        
        # Compare visual fields
        for key, target_val in target.items():
            candidate_val = candidate_config.get(key)
            if candidate_val != target_val:
                checklist.append(f"Adjust '{key}': expected {target_val}, got {candidate_val}")
                updates[key] = target_val

        return {
            "aligned": len(checklist) == 0,
            "checklist": checklist,
            "proposed_corrections": updates
        }

    def register_style_reference(self, name: str, style_data: Dict[str, Any]):
        """Saves a verified layout style for future Drawer-Reviewer replication."""
        data = self.load_profiles()
        if "profiles" not in data:
            data["profiles"] = {}
        data["profiles"][name] = style_data
        self.write_profiles(data)
        print(f"[FigMirror Engine] Style reference '{name}' registered successfully.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--register", type=str, help="Register a style reference profile (JSON string)")
    parser.add_argument("--style-name", type=str, default="FastViral", help="Name of style to register/align")
    parser.add_argument("--align-candidate", type=str, help="Validate candidate configuration JSON against target style")
    args = parser.parse_args()

    engine = FigMirrorStyleReplicator(workspace_root=".")
    
    if args.register:
        style_ref = json.loads(args.register)
        engine.register_style_reference(args.style_name, style_ref)
    elif args.align_candidate:
        candidate = json.loads(args.align_candidate)
        result = engine.review_and_align(args.style_name, candidate)
        print(json.dumps(result, indent=2))
