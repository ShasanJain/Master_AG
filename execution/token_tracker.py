import os
import sqlite3
import time
from typing import Optional

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(BASE_DIR, "tokens.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS token_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model TEXT NOT NULL,
            prompt_tokens INTEGER NOT NULL,
            completion_tokens INTEGER NOT NULL,
            timestamp REAL NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def log_tokens(model: str, prompt_tokens: int, completion_tokens: int):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO token_usage (model, prompt_tokens, completion_tokens, timestamp) VALUES (?, ?, ?, ?)",
        (model, prompt_tokens, completion_tokens, time.time())
    )
    conn.commit()
    conn.close()

def get_recent_usage(days: int = 7):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cutoff = time.time() - (days * 24 * 3600)
    cur.execute(
        "SELECT model, prompt_tokens, completion_tokens, timestamp FROM token_usage WHERE timestamp >= ? ORDER BY timestamp DESC",
        (cutoff,)
    )
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]

if __name__ == "__main__":
    import argparse
    import json
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true", help="Output JSON for API consumption")
    args = parser.parse_args()
    
    init_db()
    
    # Inject some mock data if empty
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM token_usage")
    count = cur.fetchone()[0]
    conn.close()
    
    if count == 0:
        import random
        now = time.time()
        models = ["claude-3-5", "gemini-1.5-pro", "gemini-1.5-flash", "nomic-embed-text"]
        for i in range(150):
            m = random.choice(models)
            pt = random.randint(100, 5000)
            ct = random.randint(10, 1000) if "embed" not in m else 0
            ts = now - random.uniform(0, 3 * 24 * 3600)
            
            c = sqlite3.connect(DB_PATH)
            cu = c.cursor()
            cu.execute(
                "INSERT INTO token_usage (model, prompt_tokens, completion_tokens, timestamp) VALUES (?, ?, ?, ?)",
                (m, pt, ct, ts)
            )
            c.commit()
            c.close()

    if args.json:
        # Generate format expected by the frontend
        rows = get_recent_usage(days=7)
        # Format into { today: [], total: [], history: [] }
        # We'll just build a basic structure
        result = {
            "today": [],
            "total": [],
            "history": rows
        }
        print(json.dumps(result))
    else:
        print(f"DB ready. Found {count} records. Use --json to export.")
