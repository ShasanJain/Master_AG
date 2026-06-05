import os, sys, asyncio
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from execution.vector_memory import store_memory

async def run_tests():
    print("Injecting test episodic memory...")
    await store_memory(
        "User successfully completed the Vector Memory UI refactor, implementing minimize functionality and natural language parsing.", 
        sector="episodic", 
        tags=["milestone", "ui", "memory"]
    )
    
    print("Injecting test semantic memory...")
    await store_memory(
        "The MemoryList component is responsible for rendering an array of MemoryTile child components and passing down the mem object.",
        sector="semantic",
        tags=["architecture", "react"]
    )
    print("Tests injected!")

if __name__ == "__main__":
    asyncio.run(run_tests())
