import os
import sys
import re
import json
import asyncio
import hashlib
import warnings

warnings.filterwarnings("ignore")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from execution.vector_memory import get_memory

def get_hash(content: str) -> str:
    return hashlib.md5(content.encode("utf-8")).hexdigest()

async def embed_local():
    mem = get_memory()
    skills_dir = os.path.join(BASE_DIR, "skills")
    
    print(f"[EMBED] Scanning local skills at {skills_dir}...")
    
    existing = await mem.search("*", user_id="jack", limit=5000)
    existing_hashes = set()
    for r in existing:
        meta = r.get("metadata") or r.get("meta") or {}
        h = meta.get("content_hash")
        if h:
            existing_hashes.add(h)

    added = 0
    for root_dir, _, files in os.walk(skills_dir):
        for f in files:
            if f == "SKILL.md" or f.endswith("_skill.md"):
                filepath = os.path.join(root_dir, f)
                try:
                    with open(filepath, "r", encoding="utf-8") as file_obj:
                        content = file_obj.read()

                    h = get_hash(content)
                    if h in existing_hashes:
                        continue

                    meta_extracted = {}
                    match = re.search(r"^---\n([\s\S]*?)\n---", content)
                    if match:
                        for line in match.group(1).split("\n"):
                            if ":" in line:
                                k, v = line.split(":", 1)
                                meta_extracted[k.strip()] = v.strip().strip("'").strip('"')

                    skill_name = meta_extracted.get("name") or os.path.basename(os.path.dirname(filepath))
                    
                    # Truncate content to safe nomic-embed context length (~5500 chars)
                    embed_text = content[:5500]

                    meta = {
                        "sector": "procedural",
                        "content_hash": h,
                        "skill_name": skill_name,
                        "tags": ["skill", "procedural", "local_promoted"]
                    }

                    await mem.add(embed_text, user_id="jack", meta=meta)
                    existing_hashes.add(h)
                    added += 1
                    print(f"  [+] Embedded: {skill_name} ({f})")
                except Exception as e:
                    print(f"  [-] Failed on {filepath}: {e}")

    print(f"[SUCCESS] Injected {added} local skill modules into neural memory.")

if __name__ == "__main__":
    asyncio.run(embed_local())

