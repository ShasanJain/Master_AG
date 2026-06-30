"""
Atomic Patch Wrapper
─────────────────────────────────────────────────────────────────────
A decorator / context manager used by ALL _patch_*.py scripts to ensure:

  1. A .bak file is created for every file touched BEFORE modification.
  2. If ANY exception occurs mid-patch, ALL touched files are restored.
  3. A patch_registry.json record is written on success.

Usage in a patch script:
  from execution.atomic_patch import AtomicPatch

  with AtomicPatch("patch_3d_assets") as patch:
      patch.modify("scratch/demo_3d_site/index.html", new_content)
      patch.modify("scratch/demo_3d_site/server.js", new_server_content)
  # On __exit__, all changes are committed or rolled back atomically.
"""

import os
import sys
import json
import shutil
import hashlib
import time

BASE_DIR     = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REGISTRY_PATH = os.path.join(BASE_DIR, "config", "patch_registry.json")
BAK_DIR       = os.path.join(BASE_DIR, ".tmp", "patch_backups")


def _hash_file(filepath: str) -> str:
    h = hashlib.md5()
    try:
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                h.update(chunk)
    except Exception:
        return ""
    return h.hexdigest()


class AtomicPatch:
    def __init__(self, patch_name: str):
        self.patch_name = patch_name
        self._pending: list[tuple[str, str]] = []   # (filepath, new_content)
        self._backups: dict[str, str]        = {}   # filepath → backup_path
        self._in_hashes: dict[str, str]      = {}
        self._out_hashes: dict[str, str]     = {}

    def __enter__(self):
        return self

    def modify(self, filepath: str, new_content: str):
        """
        Stage a file modification. Backs up the original immediately.
        filepath can be relative to BASE_DIR or absolute.
        """
        if not os.path.isabs(filepath):
            filepath = os.path.join(BASE_DIR, filepath)

        # Create backup
        os.makedirs(BAK_DIR, exist_ok=True)
        bak_name = os.path.relpath(filepath, BASE_DIR).replace(os.sep, "__") + ".bak"
        bak_path = os.path.join(BAK_DIR, bak_name)

        if os.path.exists(filepath):
            shutil.copy2(filepath, bak_path)
            self._in_hashes[filepath] = _hash_file(filepath)
        else:
            self._in_hashes[filepath] = ""

        self._backups[filepath] = bak_path
        self._pending.append((filepath, new_content))

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            # Rollback all pending changes
            print(f"[AtomicPatch:{self.patch_name}] Exception detected — rolling back...")
            for filepath, bak_path in self._backups.items():
                if os.path.exists(bak_path):
                    shutil.copy2(bak_path, filepath)
                    print(f"  ↩️  Restored: {filepath}")
                elif os.path.exists(filepath):
                    os.remove(filepath)
                    print(f"  🗑️  Removed (was new): {filepath}")
            print(f"[AtomicPatch:{self.patch_name}] Rollback complete.")
            return False  # Re-raise the exception

        # Commit all pending changes
        for filepath, new_content in self._pending:
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            self._out_hashes[filepath] = _hash_file(filepath)

        # Write patch registry entry
        self._write_registry()
        print(f"[AtomicPatch:{self.patch_name}] ✅ {len(self._pending)} file(s) patched atomically.")
        return False

    def _write_registry(self):
        os.makedirs(os.path.dirname(REGISTRY_PATH), exist_ok=True)
        try:
            if os.path.exists(REGISTRY_PATH):
                with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
                    registry = json.load(f)
            else:
                registry = {"patches": []}
        except Exception:
            registry = {"patches": []}

        entry = {
            "patch_name": self.patch_name,
            "applied_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "files": [
                {
                    "path":     os.path.relpath(fp, BASE_DIR),
                    "in_hash":  self._in_hashes.get(fp, ""),
                    "out_hash": self._out_hashes.get(fp, ""),
                }
                for fp in self._backups
            ]
        }
        registry["patches"].append(entry)
        with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
            json.dump(registry, f, indent=2)


def rollback_patch(patch_name: str) -> bool:
    """
    Restore files from a named patch's backups.
    Useful for manually reverting a specific patch.
    """
    if not os.path.exists(REGISTRY_PATH):
        print(f"No patch registry found at {REGISTRY_PATH}")
        return False

    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        registry = json.load(f)

    patch = next((p for p in reversed(registry["patches"])
                  if p["patch_name"] == patch_name), None)
    if not patch:
        print(f"Patch '{patch_name}' not found in registry.")
        return False

    for file_entry in patch["files"]:
        rel_path  = file_entry["path"]
        filepath  = os.path.join(BASE_DIR, rel_path)
        bak_name  = rel_path.replace(os.sep, "__") + ".bak"
        bak_path  = os.path.join(BAK_DIR, bak_name)
        if os.path.exists(bak_path):
            shutil.copy2(bak_path, filepath)
            print(f"  ↩️  Restored: {rel_path}")
        else:
            print(f"  ⚠️  Backup not found for: {rel_path}")

    return True


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Atomic Patch Utilities")
    sub = parser.add_subparsers(dest="cmd")
    p_rollback = sub.add_parser("rollback")
    p_rollback.add_argument("patch_name")
    p_list = sub.add_parser("list")
    args = parser.parse_args()

    if args.cmd == "rollback":
        rollback_patch(args.patch_name)
    elif args.cmd == "list":
        if os.path.exists(REGISTRY_PATH):
            with open(REGISTRY_PATH) as f:
                reg = json.load(f)
            for p in reg.get("patches", []):
                print(f"[{p['applied_at']}] {p['patch_name']} — {len(p['files'])} file(s)")
        else:
            print("No patch registry found.")
