import requests
import json
import os
import re
from dotenv import load_dotenv
from vector_memory import get_memory, store_memory, forget_memory
import asyncio

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

async def execute_cognitive_tags(text):
    """
    Parse and execute cognitive tags from text.
    New support for File System Agency.
    """
    actions_taken = []
    
    # <store sector="semantic">content</store>
    store_matches = re.finditer(r'<store\s+sector="([^"]+)">([\s\S]*?)</store>', text)
    for match in store_matches:
        sector, content = match.group(1), match.group(2).strip()
        try:
            await store_memory(content, sector=sector)
            actions_taken.append(f"Memory: Archived in {sector}.")
        except Exception as e: actions_taken.append(f"Memory Error: {e}")

    # <read_file path="relative/path" />
    read_matches = re.finditer(r'<read_file\s+path="([^"]+)"\s*/>', text)
    for match in read_matches:
        path = os.path.join(BASE_DIR, match.group(1))
        try:
            if os.path.exists(path):
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                actions_taken.append(f"FILE_READ: {match.group(1)}\n{content[:500]}...") # Limit preview
            else: actions_taken.append(f"Read Error: File not found {match.group(1)}")
        except Exception as e: actions_taken.append(f"Read Error: {e}")

    # <write_file path="relative/path">content</write_file>
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
    """Clean all cognitive tags for the user view."""
    text = re.sub(r'<store\s+sector="([^"]+)">([\s\S]*?)</store>', '', text)
    text = re.sub(r'<read_file\s+path="([^"]+)"\s*/>', '', text)
    text = re.sub(r'<write_file\s+path="([^"]+)">([\s\S]*?)</write_file>', '', text)
    return text.strip()

async def get_context(query: str):
    """Search for relevant context."""
    try:
        mem = get_memory()
        results = await mem.search(query, limit=2)
        if not results: return ""
        context = "\n--- RELEVANT CONTEXT ---\n"
        for r in results:
            sector = r.get('metadata', {}).get('sector') or r.get('primary_sector', 'knowledge')
            context += f"[{sector.upper()}] {r.get('content')}\n"
        return context + "------------------------\n"
    except: return ""

async def chat_complete(messages, model=None, context="", depth=0):
    """Recursive chat with File System Agency and Memory."""
    if depth > 2: return "Recursive limit reached."
    
    url = f"{OLLAMA_URL}/api/chat"
    system_msg = (
        "You are Jack, a local autonomous engineer. You have FILE SYSTEM ACCESS.\n"
        "Available Tags:\n"
        "- <read_file path=\"relative/path\" />\n"
        "- <write_file path=\"relative/path\">content</write_file>\n"
        "- <store sector=\"semantic\">content</store>\n"
        "Use these tags to inspect code or create files. Respond in natural language."
    )
    if context and depth == 0:
        system_msg += f"\n\nContext:\n{context}"
        
    final_messages = [{"role": "system", "content": system_msg}] + messages

    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, lambda: requests.post(url, json={
            "model": model or OLLAMA_MODEL,
            "messages": final_messages,
            "stream": False,
            "options": {"num_ctx": 4096}
        }, timeout=60))
        response.raise_for_status()
        raw_content = response.json().get("message", {}).get("content", "")
        
        actions = await execute_cognitive_tags(raw_content)
        
        if actions:
            # Add action results to history and recurse for natural confirmation
            messages.append({"role": "assistant", "content": raw_content})
            messages.append({"role": "user", "content": f"ACTION_RESULTS:\n{chr(10).join(actions)}"})
            return await chat_complete(messages, model=model, depth=depth + 1)
            
        return clean_tags(raw_content)
    except Exception as e: return f"Neural Error: {str(e)}"

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
    
    # Save the final interaction to Episodic Memory for history
    full_exchange = f"User: {last_query}\nJack: {res}"
    await store_memory(full_exchange, sector="episodic", tags=["chat_history"])
    
    print(res)

if __name__ == "__main__":
    asyncio.run(main())
