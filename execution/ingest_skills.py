import os
import asyncio
from vector_memory import store_memory

SKILLS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../skills"))

async def ingest_all_skills():
    print(f"Indexing Skill Registry at {SKILLS_DIR}...")
    count = 0
    
    # Walk through the skills directory
    for root, dirs, files in os.walk(SKILLS_DIR):
        for file in files:
            if file.endswith(".md"):
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, SKILLS_DIR)
                
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    
                # We store each skill in the 'procedural' sector
                # We use the filename and path as part of the context
                text_to_store = f"SKILL: {rel_path}\n\n{content}"
                
                await store_memory(
                    text_to_store, 
                    sector="procedural", 
                    tags=["skill", rel_path.split(os.sep)[0]]
                )
                count += 1
                print(f"  [+] Indexed: {rel_path}")

    print(f"\nSuccessfully indexed {count} skills into Procedural Memory.")

if __name__ == "__main__":
    asyncio.run(ingest_all_skills())
