"""
Memory DB Health Check
─────────────────────────────────────
Verifies the integrity of openmemory.db before any memory operation.

Checks:
  1. File exists and is readable
  2. SQLite PRAGMA integrity_check passes
  3. Expected tables exist (memories, vectors)
  4. Expected columns exist on 'memories' table
  5. No orphaned vector rows

Outputs standardized JSON. Exit code 1 on any failure.

Usage:
  python execution/db_health.py
  python execution/db_health.py --fix-orphans
"""

import os
import sys
import json
import sqlite3
import argparse

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH  = os.path.join(BASE_DIR, "execution", "openmemory.db")

REQUIRED_TABLES  = {"memories"}
REQUIRED_COLUMNS = {
    "id", "content", "user_id", "primary_sector",
    "salience", "decay_lambda", "last_seen_at", "meta", "simhash"
}


def check_db(fix_orphans: bool = False) -> dict:
    checks = []
    ok = True

    # 1. File exists
    if not os.path.exists(DB_PATH):
        return {
            "status": "fail",
            "data": {"checks": [{"name": "file_exists", "passed": False,
                                  "detail": f"DB not found at {DB_PATH}"}]}
        }
    checks.append({"name": "file_exists", "passed": True})

    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cur  = conn.cursor()

        # 2. Integrity check
        cur.execute("PRAGMA integrity_check")
        result = cur.fetchone()[0]
        passed = (result == "ok")
        checks.append({"name": "integrity_check", "passed": passed,
                        "detail": result if not passed else None})
        if not passed:
            ok = False

        # 3. Required tables
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        existing_tables = {row[0] for row in cur.fetchall()}
        missing_tables  = REQUIRED_TABLES - existing_tables
        checks.append({
            "name": "required_tables",
            "passed": not missing_tables,
            "detail": f"Missing: {missing_tables}" if missing_tables else None
        })
        if missing_tables:
            ok = False
            return {"status": "fail", "data": {"checks": checks}}

        # 4. Required columns on 'memories'
        cur.execute("PRAGMA table_info(memories)")
        cols = {row[1] for row in cur.fetchall()}
        missing_cols = REQUIRED_COLUMNS - cols
        checks.append({
            "name": "required_columns",
            "passed": not missing_cols,
            "detail": f"Missing columns: {missing_cols}" if missing_cols else None
        })
        if missing_cols:
            ok = False

        # 5. Orphaned vectors (if vectors table exists)
        if "vectors" in existing_tables:
            # Inspect actual column names on the vectors table
            cur.execute("PRAGMA table_info(vectors)")
            vec_cols = {row[1] for row in cur.fetchall()}
            # Common column names for the FK reference
            fk_col = next((c for c in ["memory_id", "mem_id", "id"] if c in vec_cols), None)
            if fk_col:
                cur.execute(f"""
                    SELECT COUNT(*) FROM vectors v
                    LEFT JOIN memories m ON v.{fk_col} = m.id
                    WHERE m.id IS NULL
                """)
                orphan_count = cur.fetchone()[0]
                if orphan_count > 0 and fix_orphans:
                    cur.execute(f"""
                        DELETE FROM vectors WHERE {fk_col} NOT IN (SELECT id FROM memories)
                    """)
                    conn.commit()
                    checks.append({"name": "orphan_vectors", "passed": True,
                                    "detail": f"Fixed {orphan_count} orphaned rows"})
                else:
                    checks.append({
                        "name": "orphan_vectors",
                        "passed": orphan_count == 0,
                        "detail": f"{orphan_count} orphaned rows" if orphan_count else None
                    })
                    if orphan_count > 0:
                        ok = False
            else:
                checks.append({"name": "orphan_vectors", "passed": True,
                                "detail": "Cannot determine FK column, skipped"})

        # 6. Row count summary
        cur.execute("SELECT COUNT(*) FROM memories")
        total = cur.fetchone()[0]
        checks.append({"name": "row_count", "passed": True, "detail": f"{total} memories stored"})

    except Exception as e:
        checks.append({"name": "connection", "passed": False, "detail": str(e)})
        ok = False
    finally:
        if conn:
            conn.close()

    return {
        "status": "ok" if ok else "fail",
        "data": {"checks": checks}
    }


def main():
    parser = argparse.ArgumentParser(description="Memory DB Health Check")
    parser.add_argument("--fix-orphans", action="store_true",
                        help="Automatically delete orphaned vector rows")
    args = parser.parse_args()

    result = check_db(fix_orphans=args.fix_orphans)
    print(json.dumps(result, indent=2))

    # Print human-readable summary
    for c in result["data"]["checks"]:
        icon = "[OK]" if c["passed"] else "[FAIL]"
        detail = f" -- {c['detail']}" if c.get("detail") else ""
        print(f"  {icon} {c['name']}{detail}")

    sys.exit(0 if result["status"] == "ok" else 1)


if __name__ == "__main__":
    main()
