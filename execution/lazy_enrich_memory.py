import os
import sys
import json
import asyncio
import sqlite3
import requests

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from execution.vector_memory import get_memory

DB_PATH = os.path.join(BASE_DIR, "openmemory.db")
if not os.path.exists(DB_PATH):
    print(f"DB not found at {DB_PATH}")
    sys.exit(1)

async def enrich():
    print("Starting Lazy Memory Enrichment...", flush=True)
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Find 3 unenriched structural nodes to reduce memory pressure
        cursor.execute("SELECT id, content, meta FROM memories WHERE content LIKE 'AST Node:%' LIMIT 3")
        rows = cursor.fetchall()
        
        if not rows:
            print("No unenriched structural nodes found. Everything is fully semantic!", flush=True)
            return
            
        print(f"Found {len(rows)} nodes to enrich.", flush=True)
        mem = get_memory()
        
        for row in rows:
            old_id = row[0]
            content = row[1]
            meta_str = row[2]
            
            try:
                meta = json.loads(meta_str) if meta_str else {}
            except Exception:
                meta = {}
            
            # Formulate prompt
            prompt = (
                "You are an expert developer assistant. Explain what the following codebase component achieves for the project in 1 concise natural language sentence. "
                "Output ONLY the sentence. No preface, no markdown, no quotes.\n\n"
                f"{content}"
            )
            
            print(f"Enriching node: {meta.get('source_file')} -> {meta.get('ast_id')}")
            
            # Call local Ollama
            try:
                resp = requests.post("http://localhost:11434/api/generate", json={
                    "model": "dolphin-llama3",
                    "prompt": prompt,
                    "stream": False
                }, timeout=30)
                resp.raise_for_status()
                explanation = resp.json().get("response", "").strip()
                
                if explanation:
                    # Append the semantic explanation to the original context so we keep the exact coordinates
                    new_content = f"{explanation}\n\n[Original Path: {content}]"
                    
                    # Update meta flag
                    meta['enriched'] = True
                    
                    # 1. Store the new memory (generates new embedding)
                    await mem.add(new_content, user_id="jack", meta=meta)
                    
                    # 2. Delete the old raw memory
                    await mem.delete(old_id)
                    
                    print(f"  -> Success: {explanation}")
                else:
                    print(f"  -> Failed: Empty response from LLM")
            except Exception as e:
                print(f"  -> Failed to reach Ollama or generate explanation: {e}")
                
        conn.close()
    except Exception as e:
        print(f"Enrichment error: {e}")

if __name__ == "__main__":
    asyncio.run(enrich())
