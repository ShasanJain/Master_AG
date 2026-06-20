"""
Skill Provenance Checker
─────────────────────────────────────
Detects drift between a skill's declared source_path (in its frontmatter)
and the current state of those source files on disk.

If the source files have changed since the skill was created, the skill
may be stale — this script flags it for review.

Frontmatter format (injected at skill creation time):
  ---
  name: 3d-websites
  provenance:
    source_path: scratch/demo_3d_site/
    source_hash: abc123def456
    created_at: 2026-06-19
  ---

Usage:
  python execution/check_provenance.py            # Check all skills
  python execution/check_provenance.py --update   # Refresh hashes after intentional update
"""

import os
import sys
import re
import json
import hashlib
import argparse

BASE_DIR     = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
GLOBAL_SKILLS = os.path.join(os.environ.get("USERPROFILE", ""), ".gemini", "skills")
LOCAL_SKILLS  = os.path.join(BASE_DIR, "skills")

SCAN_DIRS = [GLOBAL_SKILLS, LOCAL_SKILLS, os.path.join(BASE_DIR, ".agent", "skills")]


def hash_path(path: str) -> str:
    """Compute a stable SHA256 of all files in a directory (or a single file)."""
    h = hashlib.sha256()
    if os.path.isfile(path):
        with open(path, "rb") as f:
            h.update(f.read())
        return h.hexdigest()
    if os.path.isdir(path):
        for root, _, files in sorted(os.walk(path)):
            for fname in sorted(files):
                fpath = os.path.join(root, fname)
                rel   = os.path.relpath(fpath, path)
                h.update(rel.encode())
                try:
                    with open(fpath, "rb") as f:
                        h.update(f.read())
                except Exception:
                    pass
        return h.hexdigest()
    return ""


def extract_provenance(content: str) -> dict | None:
    """Pull the provenance block out of a skill file's YAML frontmatter."""
    match = re.search(r"^---\n([\s\S]*?)\n---", content)
    if not match:
        return None
    frontmatter = match.group(1)
    prov_match  = re.search(r"provenance:\s*\n((?:\s+\S.*\n)+)", frontmatter)
    if not prov_match:
        return None
    block = prov_match.group(1)
    result = {}
    for line in block.split("\n"):
        kv = re.match(r"\s+(\w+):\s*(.+)", line)
        if kv:
            result[kv.group(1)] = kv.group(2).strip()
    return result if result else None


def check_all(update_mode: bool = False) -> list[dict]:
    results = []
    for d in SCAN_DIRS:
        if not os.path.exists(d):
            continue
        for root, _, files in os.walk(d):
            for f in files:
                if f == "SKILL.md" or f.endswith("_skill.md"):
                    filepath = os.path.join(root, f)
                    try:
                        with open(filepath, "r", encoding="utf-8", errors="ignore") as fh:
                            content = fh.read()
                    except Exception:
                        continue

                    prov = extract_provenance(content)
                    if not prov:
                        continue  # Skip skills with no provenance block

                    source_path = os.path.join(BASE_DIR, prov.get("source_path", ""))
                    locked_hash = prov.get("source_hash", "")

                    if not os.path.exists(source_path):
                        results.append({
                            "skill": f,
                            "file":  filepath,
                            "status": "SOURCE_MISSING",
                            "detail": f"source_path '{source_path}' no longer exists"
                        })
                        continue

                    current_hash = hash_path(source_path)

                    if current_hash == locked_hash:
                        results.append({"skill": f, "file": filepath,
                                         "status": "OK", "detail": "Source unchanged"})
                    elif update_mode:
                        # Patch the frontmatter with new hash
                        new_content = content.replace(
                            f"source_hash: {locked_hash}",
                            f"source_hash: {current_hash}"
                        )
                        with open(filepath, "w", encoding="utf-8") as fh:
                            fh.write(new_content)
                        results.append({"skill": f, "file": filepath,
                                         "status": "UPDATED",
                                         "detail": f"Hash refreshed to {current_hash[:16]}..."})
                    else:
                        results.append({
                            "skill":   f,
                            "file":    filepath,
                            "status":  "STALE",
                            "detail":  f"Source changed since skill creation",
                            "locked":  locked_hash[:16] + "...",
                            "current": current_hash[:16] + "...",
                        })

    return results


def main():
    parser = argparse.ArgumentParser(description="Skill Provenance Checker")
    parser.add_argument("--update", action="store_true",
                        help="Refresh all provenance hashes to current state")
    parser.add_argument("--quiet",  action="store_true",
                        help="Only print non-OK results")
    args = parser.parse_args()

    results = check_all(update_mode=args.update)
    stale   = [r for r in results if r["status"] == "STALE"]

    for r in results:
        if args.quiet and r["status"] == "OK":
            continue
        print(json.dumps(r))

    summary = {
        "status": "fail" if stale else "ok",
        "data": {
            "total":  len(results),
            "ok":     sum(1 for r in results if r["status"] == "OK"),
            "stale":  len(stale),
            "missing": sum(1 for r in results if r["status"] == "SOURCE_MISSING"),
        }
    }
    print(json.dumps(summary))
    sys.exit(1 if stale else 0)


if __name__ == "__main__":
    main()
