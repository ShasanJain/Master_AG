import os, sys, json, asyncio
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from execution.vector_memory import get_memory

async def inspect():
    mem = get_memory()
    res = await mem.search("*", limit=5)
    for r in res:
        print("SECTOR:", r.get('primary_sector') or r.get('metadata', {}).get('sector'))
        print("CONTENT:")
        print(repr(r['content'])[:200])
        print("META:")
        print(r.get('metadata', {}))
        print("-" * 50)

if __name__ == "__main__":
    asyncio.run(inspect())
