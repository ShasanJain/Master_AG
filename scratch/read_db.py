import sqlite3
import json

conn = sqlite3.connect("openmemory.db")
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [row[0] for row in cursor.fetchall()]

data = {}
for table in tables:
    cursor.execute(f"PRAGMA table_info({table});")
    columns = [col[1] for col in cursor.fetchall()]
    
    cursor.execute(f"SELECT * FROM {table};")
    rows = cursor.fetchall()
    
    table_rows = []
    for row in rows:
        row_dict = {}
        for col, val in zip(columns, row):
            if isinstance(val, bytes):
                row_dict[col] = "<binary blob>"
            elif isinstance(val, str):
                try:
                    row_dict[col] = json.loads(val)
                except ValueError:
                    row_dict[col] = val
            else:
                row_dict[col] = val
        table_rows.append(row_dict)
    data[table] = table_rows

conn.close()

with open("scratch/memory_dump.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Dump completed.")
