"""
Directive Staleness Checker
─────────────────────────────────────
Verifies that each directive in directives/ still accurately describes
the execution scripts it references. Uses SHA256 hashes stored inside
directive frontmatter to detect when a script has changed.

Directive frontmatter format:
  ---
  title: Task Scheduler SOP
  references:
    - script: execution/scheduler_engine.py
      hash: abc123def456
  ---

Usage:
  python execution/check_directives.py            # Check all directives
  python execution/check_directives.py --update   # Refresh hashes (after intentional script update)
"""

import os
import sys
import re
import json
import hashlib
import argparse

BASE_DIR       = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIRECTIVES_DIR = os.path.join(BASE_DIR, "directives")


def hash_file(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def extract_references(content: str) -> tuple[list[dict], bool]:
    """
    Pull script references out of a directive's frontmatter.
    Returns (refs_list, has_references_key).
    has_references_key = True if the 'references:' key exists at all (even if empty).
    """
    match = re.search(r"^---\n([\s\S]*?)\n---", content)
    if not match:
        return [], False
    frontmatter = match.group(1)

    # Check if references key exists at all
    has_key = bool(re.search(r"^\s*references\s*:", frontmatter, re.MULTILINE))

    refs = []
    # Match: "  - script: path/to/file.py"
    for line in frontmatter.split("\n"):
        script_match = re.match(r"\s+-\s+script:\s+(.+)", line)
        if script_match:
            refs.append({"script": script_match.group(1).strip(), "hash": ""})
        hash_match = re.match(r"\s+hash:\s+(.+)", line)
        if hash_match and refs:
            refs[-1]["hash"] = hash_match.group(1).strip().strip('"')

    return refs, has_key


def inject_references(content: str, refs: list[dict]) -> str:
    """Replace or add a references block in a directive's frontmatter."""
    ref_block = "references:\n" + "".join(
        f"  - script: {r['script']}\n    hash: {r['hash']}\n"
        for r in refs
    )
    # If frontmatter exists, insert before closing ---
    if re.search(r"^---\n([\s\S]*?)\n---", content):
        def replacer(m):
            fm = m.group(1)
            fm = re.sub(r"references:[\s\S]*?(?=\n\w|\Z)", "", fm).strip()
            return f"---\n{fm}\n{ref_block}---"
        return re.sub(r"^---\n([\s\S]*?)\n---", replacer, content, count=1)
    else:
        return f"---\n{ref_block}---\n\n{content}"


def scan_referenced_scripts(content: str) -> list[str]:
    """
    Auto-detect scripts mentioned in directive body (e.g. `python execution/foo.py`)
    as fallback when no explicit frontmatter references are present.
    """
    return re.findall(r"execution/[\w_]+\.py", content)


def check_all(update_mode: bool = False) -> list[dict]:
    if not os.path.exists(DIRECTIVES_DIR):
        return [{"directive": "—", "status": "SKIP",
                 "detail": f"directives/ not found at {DIRECTIVES_DIR}"}]

    results = []
    for fname in os.listdir(DIRECTIVES_DIR):
        if not fname.endswith(".md"):
            continue
        fpath = os.path.join(DIRECTIVES_DIR, fname)
        with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        refs, has_refs_key = extract_references(content)

        # Auto-detect scripts from body if no frontmatter references block at all
        if not has_refs_key:
            detected = scan_referenced_scripts(content)
            if detected:
                refs = [{"script": s, "hash": ""} for s in detected]

        # Intentionally empty references list → mark as INTENTIONAL (not an error)
        if has_refs_key and not refs:
            results.append({"directive": fname, "status": "INTENTIONAL",
                             "detail": "No scripts referenced — declared intentionally"})
            continue

        if not refs:
            results.append({"directive": fname, "status": "NO_REFS",
                             "detail": "No script references found — add frontmatter references block"})
            continue

        stale_refs = []
        for ref in refs:
            script_path = os.path.join(BASE_DIR, ref["script"])
            if not os.path.exists(script_path):
                stale_refs.append({"script": ref["script"], "reason": "file not found"})
                continue
            current = hash_file(script_path)
            ref["current_hash"] = current
            if ref["hash"] and ref["hash"] != current:
                stale_refs.append({
                    "script":  ref["script"],
                    "reason":  "script changed since directive was written",
                    "locked":  ref["hash"][:16] + "...",
                    "current": current[:16] + "...",
                })

        if update_mode:
            for ref in refs:
                script_path = os.path.join(BASE_DIR, ref["script"])
                if os.path.exists(script_path):
                    ref["hash"] = hash_file(script_path)
            updated = inject_references(content, refs)
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(updated)
            results.append({"directive": fname, "status": "UPDATED",
                             "detail": f"Refreshed {len(refs)} script hashes"})
        elif stale_refs:
            results.append({"directive": fname, "status": "STALE",
                             "detail": stale_refs})
        else:
            results.append({"directive": fname, "status": "OK",
                             "detail": f"{len(refs)} script(s) match locked hashes"})

    return results


def main():
    parser = argparse.ArgumentParser(description="Directive Staleness Checker")
    parser.add_argument("--update", action="store_true",
                        help="Refresh all script hashes in directive frontmatter")
    parser.add_argument("--quiet",  action="store_true",
                        help="Only print non-OK results")
    args = parser.parse_args()

    results = check_all(update_mode=args.update)
    stale   = [r for r in results if r["status"] == "STALE"]

    for r in results:
        if args.quiet and r["status"] in ("OK", "NO_REFS"):
            continue
        print(json.dumps(r))

    summary = {
        "status": "fail" if stale else "ok",
        "data": {
            "total":        len(results),
            "ok":           sum(1 for r in results if r["status"] == "OK"),
            "stale":        len(stale),
            "no_refs":      sum(1 for r in results if r["status"] == "NO_REFS"),
            "intentional":  sum(1 for r in results if r["status"] == "INTENTIONAL"),
        }
    }
    print(json.dumps(summary))
    sys.exit(1 if stale else 0)


if __name__ == "__main__":
    main()
