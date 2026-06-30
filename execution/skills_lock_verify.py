"""
Skills Lock Verifier
─────────────────────────────────────
Enforces skills-lock.json integrity. Any skill whose on-disk content
hash has drifted from the locked hash is flagged as TAMPERED.

Usage:
  python execution/skills_lock_verify.py            # Check all locked skills
  python execution/skills_lock_verify.py --approve task-scheduler

The --approve flag recomputes the hash and updates skills-lock.json
to accept the new version as the new baseline.
"""

import os
import sys
import json
import hashlib
import argparse

BASE_DIR  = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LOCK_PATH = os.path.join(BASE_DIR, "skills-lock.json")

SKILL_SEARCH_ROOTS = [
    os.path.join(os.environ.get("USERPROFILE", ""), ".gemini", "skills"),
    os.path.join(BASE_DIR, "skills"),
    os.path.join(BASE_DIR, ".agent", "skills"),
]


def compute_hash(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def find_skill_file(skill_name: str, skill_path_hint: str = None) -> str | None:
    """Search for a skill's SKILL.md file on disk."""
    # If the lock has a skillPath, try that first relative to each root
    if skill_path_hint:
        for root in SKILL_SEARCH_ROOTS:
            if not os.path.exists(root):
                continue
            candidate = os.path.join(root, skill_path_hint)
            if os.path.exists(candidate):
                return candidate
            # Try matching end portion of path hint recursively
            base_hint = os.path.basename(skill_path_hint)
            for dirpath, _, filenames in os.walk(root):
                if skill_name in dirpath and base_hint in filenames:
                    return os.path.join(dirpath, base_hint)

    # Generic search: look for folder named after the skill recursively
    for root in SKILL_SEARCH_ROOTS:
        if not os.path.exists(root):
            continue
        for dirpath, _, filenames in os.walk(root):
            if os.path.basename(dirpath) == skill_name:
                for fname in ["SKILL.md", f"{skill_name}_skill.md"]:
                    if fname in filenames:
                        return os.path.join(dirpath, fname)

    return None


def verify_all(approve_skill: str = None) -> list[dict]:
    if not os.path.exists(LOCK_PATH):
        return [{"skill": "lock_file", "status": "MISSING",
                 "detail": f"skills-lock.json not found at {LOCK_PATH}"}]

    with open(LOCK_PATH, "r", encoding="utf-8") as f:
        lock_data = json.load(f)

    skills = lock_data.get("skills", {})
    results = []

    for skill_name, entry in skills.items():
        locked_hash = entry.get("computedHash", "")
        skill_path  = entry.get("skillPath", "")
        filepath    = find_skill_file(skill_name, skill_path)

        if not filepath:
            results.append({"skill": skill_name, "status": "NOT_FOUND",
                             "detail": "Could not locate skill file on disk"})
            continue

        current_hash = compute_hash(filepath)

        if approve_skill == skill_name:
            # User approved this drift — update the lock
            entry["computedHash"] = current_hash
            entry["approved_at"]  = __import__("time").strftime("%Y-%m-%dT%H:%M:%S")
            results.append({"skill": skill_name, "status": "APPROVED",
                             "detail": f"Hash updated to {current_hash[:16]}..."})
            continue

        if current_hash == locked_hash:
            results.append({"skill": skill_name, "status": "OK", "detail": filepath})
        else:
            results.append({
                "skill":   skill_name,
                "status":  "TAMPERED",
                "detail":  filepath,
                "locked":  locked_hash[:16] + "...",
                "current": current_hash[:16] + "...",
            })

    if approve_skill:
        with open(LOCK_PATH, "w", encoding="utf-8") as f:
            json.dump(lock_data, f, indent=2)

    return results


def main():
    parser = argparse.ArgumentParser(description="Skills Lock Verifier")
    parser.add_argument("--approve", metavar="SKILL_NAME",
                        help="Approve a skill's current hash as the new baseline")
    parser.add_argument("--quiet", action="store_true",
                        help="Only print non-OK results")
    args = parser.parse_args()

    results = verify_all(approve_skill=args.approve)

    tampered = [r for r in results if r["status"] == "TAMPERED"]
    not_found = [r for r in results if r["status"] == "NOT_FOUND"]

    for r in results:
        if args.quiet and r["status"] == "OK":
            continue
        print(json.dumps(r))

    summary = {
        "status": "fail" if (tampered or not_found) else "ok",
        "data": {
            "total":    len(results),
            "ok":       sum(1 for r in results if r["status"] == "OK"),
            "tampered": len(tampered),
            "missing":  len(not_found),
        }
    }
    print(json.dumps(summary))
    sys.exit(1 if (tampered or not_found) else 0)


if __name__ == "__main__":
    main()
