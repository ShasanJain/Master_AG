import requests
import json
import os
import re
from dotenv import load_dotenv
from vector_memory import get_memory, store_memory, forget_memory
from deep_lake_vault import search_vault
import asyncio

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

async def execute_cognitive_tags(text):
    actions_taken = []
    
    # Memory Storage
    store_matches = re.finditer(r'<store\s+sector="([^"]+)">([\s\S]*?)</store>', text)
    for match in store_matches:
        sector, content = match.group(1), match.group(2).strip()
        try:
            await store_memory(content, sector=sector)
            actions_taken.append(f"Memory: Archived in {sector}.")
        except Exception as e: actions_taken.append(f"Memory Error: {e}")

    # File Agency
    read_matches = re.finditer(r'<read_file\s+path="([^"]+)"\s*/>', text)
    for match in read_matches:
        path = os.path.join(BASE_DIR, match.group(1))
        try:
            if os.path.exists(path):
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                actions_taken.append(f"FILE_READ: {match.group(1)}\n{content[:500]}...")
            else: actions_taken.append(f"Read Error: File not found {match.group(1)}")
        except Exception as e: actions_taken.append(f"Read Error: {e}")

    write_matches = re.finditer(r'<write_file\s+path="([^"]+)">([\s\S]*?)</write_file>', text)
    for match in write_matches:
        path = os.path.join(BASE_DIR, match.group(1))
        content = match.group(2).strip()
        try:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            actions_taken.append(f"FILE_WRITE: Successfully updated {match.group(1)}")
        except Exception as e: actions_taken.append(f"Write Error: {e}")

    return actions_taken

def clean_tags(text):
    text = re.sub(r'<store\s+sector="([^"]+)">([\s\S]*?)</store>', '', text)
    text = re.sub(r'<read_file\s+path="([^"]+)"\s*/>', '', text)
    text = re.sub(r'<write_file\s+path="([^"]+)">([\s\S]*?)</write_file>', '', text)
    return text.strip()

import subprocess

def classify_query(query: str) -> str:
    """Classify query complexity for routing."""
    q = query.lower()
    structural_terms = ["architecture", "structure", "how does", "connect", "dependency", "import", "flow", "call", "path"]
    global_terms = ["summary", "overview", "all", "general", "high-level", "big picture", "communities", "clusters"]
    
    if any(t in q for t in global_terms): return "global"
    if any(t in q for t in structural_terms): return "structural"
    return "simple"

async def get_context(query: str):
    """
    Hybrid Retrieval Router (Phase 4).
    Routes to Vector Search, Graph Traversal, or Global Summaries based on query.
    """
    context = ""
    q_type = classify_query(query)
    context += f"--- RETRIEVAL ROUTER (Mode: {q_type.upper()}) ---\n"
    
    if q_type == "global":
        # Global: Fetch Community Summaries
        report_path = os.path.join(BASE_DIR, "graphify-out", "GRAPH_REPORT.md")
        try:
            if os.path.exists(report_path):
                with open(report_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    import re
                    match = re.search(r'## Communities.*?(?=##|$)', content, re.DOTALL)
                    if match:
                        context += match.group(0)[:2000] + "\n"
                    else:
                        context += "No community summaries found.\n"
        except Exception as e:
            context += f"Failed to load global graph context: {e}\n"
            
    elif q_type == "structural":
        # Structural: Run graphify query
        try:
            loop = asyncio.get_event_loop()
            output = await loop.run_in_executor(
                None, 
                lambda: subprocess.check_output(
                    ["npx", "-y", "graphify", "query", query, "--budget", "1500"], 
                    cwd=BASE_DIR, text=True, stderr=subprocess.STDOUT
                )
            )
            context += output + "\n"
        except Exception as e:
            context += f"Graph traversal failed: {e}\n"
            
    else:
        # Simple: Vector Search (OpenMemory + Deep Lake)
        try:
            mem = get_memory()
            om_results = await mem.search(query, limit=2)
            if om_results:
                context += "\n--- PERSONAL CONTEXT (OpenMemory) ---\n"
                for r in om_results:
                    context += f"{r.get('content')}\n"
        except: pass
        try:
            dl_results = await search_vault(query, limit=2)
            if dl_results:
                context += "\n--- INDUSTRIAL SKILLS (Deep Lake Vault) ---\n"
                for r in dl_results:
                    context += f"{r.get('content')}\n"
        except: pass
    
    return context + "\n------------------------\n" if context else ""

async def chat_complete(messages, model=None, context="", depth=0):
    if depth > 2: return "Recursive limit reached."
    
    url = f"{OLLAMA_URL}/api/chat"
    system_msg = (
        "You are Jack, a local autonomous engineer with DUAL-CORE memory.\n"
        "You have access to Personal Context (OpenMemory) and Industrial Skills (Deep Lake).\n"
        "Use your File System tags and memory tags to assist the user. Speak naturally."
    )
    if context and depth == 0:
        system_msg += f"\n\nContext:\n{context}"
        
    final_messages = [{"role": "system", "content": system_msg}] + messages

    try:
        print(f"[THINKING] Model: {model or OLLAMA_MODEL} | Depth: {depth}")
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, lambda: requests.post(url, json={
            "model": model or OLLAMA_MODEL,
            "messages": final_messages,
            "stream": False,
            "options": {"num_ctx": 4096}
        }, timeout=120))
        response.raise_for_status()
        raw_content = response.json().get("message", {}).get("content", "")
        
        actions = await execute_cognitive_tags(raw_content)
        
        if actions:
            print(f"[ACTION] Jack executed {len(actions)} tasks.")
            messages.append({"role": "assistant", "content": raw_content})
            messages.append({"role": "user", "content": f"ACTION_RESULTS:\n{chr(10).join(actions)}"})
            return await chat_complete(messages, model=model, depth=depth + 1)
            
        return clean_tags(raw_content)
    except Exception as e: return f"Neural Error: {str(e)}"

def query_ollama(prompt, model=None):
    """Simple synchronous prompt-response helper."""
    url = f"{OLLAMA_URL}/api/generate"
    try:
        response = requests.post(url, json={
            "model": model or OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        }, timeout=120)
        response.raise_for_status()
        return response.json().get("response", "")
    except Exception as e:
        return f"Error: {e}"

async def main():
    import sys
    if not sys.stdin.isatty(): arg = sys.stdin.read()
    elif len(sys.argv) > 1: arg = sys.argv[1]
    else: sys.exit(0)

    try:
        msgs = json.loads(arg)
        if not isinstance(msgs, list): msgs = [{"role": "user", "content": arg}]
    except: msgs = [{"role": "user", "content": arg}]
    
    last_query = msgs[-1]["content"] if msgs else ""
    context = await get_context(last_query) if last_query else ""
        
    res = await chat_complete(msgs, context=context)
    
    # Save the final interaction to Episodic Memory
    full_exchange = f"User: {last_query}\nJack: {res}"
    await store_memory(full_exchange, sector="episodic", tags=["chat_history"])
    
    print(res)

if __name__ == "__main__":
    asyncio.run(main())
