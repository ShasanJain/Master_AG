import sqlite3

conn = sqlite3.connect("openmemory.db")
cur = conn.cursor()

# Tables
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
print("Tables:", [r[0] for r in cur.fetchall()])

# Schema
cur.execute("PRAGMA table_info(memories)")
print("Schema:", [r for r in cur.fetchall()])

# Count
cur.execute("SELECT COUNT(*) FROM memories")
print("Memories:", cur.fetchone()[0])

# Sample
cur.execute("SELECT id, primary_sector, salience FROM memories LIMIT 5")
for r in cur.fetchall():
    print(r)

conn.close()
