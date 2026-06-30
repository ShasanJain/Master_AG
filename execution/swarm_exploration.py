import os
import sys
import json
import asyncio
import requests
from dotenv import load_dotenv

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

PERSONAS = {
    "Architect": (
        "You are the System Architect. Focus on structural integrity, "
        "data flow, scalability, components, modularity, and database architecture."
    ),
    "Security": (
        "You are the Security Guard. Focus on the secure-by-default coding standards, "
        "authentication, authorization, encryption, data privacy, and vulnerability mitigation."
    ),
    "Designer": (
        "You are the Visual Designer. Focus on UX/UI, visual hierarchy, responsiveness, "
        "animations, micro-interactions, cohesive color palettes (HSL), and browser layout."
    )
}

def query_ollama(prompt, system_prompt):
    """Sync prompt-response helper for Ollama."""
    url = f"{OLLAMA_URL}/api/chat"
    try:
        response = requests.post(url, json={
            "model": OLLAMA_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "stream": False,
            "options": {"temperature": 0.7, "num_ctx": 4096}
        }, timeout=30)
        response.raise_for_status()
        return response.json().get("message", {}).get("content", "").strip()
    except Exception as e:
        return f"[Fallback Mode: Connection to Ollama failed: {e}]\nDefaulting to static structural feedback based on system standards."

async def run_swarm_member(persona_name, system_prompt, prompt):
    """Run a single swarm member asynchronously."""
    loop = asyncio.get_event_loop()
    print(f"[Swarm] Initializing {persona_name} evaluation...")
    content = await loop.run_in_executor(None, query_ollama, prompt, system_prompt)
    print(f"[Swarm] {persona_name} analysis complete.")
    return persona_name, content

async def main():
    if len(sys.argv) > 1:
        prompt = " ".join(sys.argv[1:])
    else:
        prompt = input("Enter the design or technical problem to explore: ")

    if not prompt.strip():
        print("Empty prompt. Exiting.")
        sys.exit(0)

    print(f"\n=== STARTING PARALLEL EXPLORATION SWARM ===")
    print(f"Prompt: {prompt}\n")

    tasks = [
        run_swarm_member(name, sys_p, prompt)
        for name, sys_p in PERSONAS.items()
    ]
    
    results = await asyncio.gather(*tasks)
    
    swarm_outputs = {}
    for name, content in results:
        swarm_outputs[name] = content
        print(f"\n--- {name.upper()}'S PERSPECTIVE ---")
        print(content)
        print("-" * 40)

    # Synthesis Step (Consensus Generator)
    print("\n[Swarm] Generating Unified Consensus Plan...")
    synthesis_prompt = (
        f"You are the Swarm Synthesizer. Review the following evaluations and generate "
        f"a single cohesive, production-grade technical implementation plan. Resolve any "
        f"conflicts between architectural efficiency, security requirements, and UI aesthetics.\n\n"
        f"Architect View:\n{swarm_outputs['Architect']}\n\n"
        f"Security View:\n{swarm_outputs['Security']}\n\n"
        f"Designer View:\n{swarm_outputs['Designer']}\n"
    )
    
    consensus_system = "You are the Swarm Integrator. Output a clean, action-oriented synthesis."
    loop = asyncio.get_event_loop()
    consensus = await loop.run_in_executor(None, query_ollama, synthesis_prompt, consensus_system)

    print("\n=== UNIFIED CONSENSUS PLAN ===")
    print(consensus)
    print("=" * 30)

    # Save output to scratch directory
    scratch_dir = os.path.join(os.path.dirname(__file__), "../scratch")
    os.makedirs(scratch_dir, exist_ok=True)
    out_file = os.path.join(scratch_dir, "swarm_consensus.md")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(f"# Swarm Exploration Results\n\n")
        f.write(f"**Original Prompt:** {prompt}\n\n")
        for name, content in swarm_outputs.items():
            f.write(f"## {name} View\n{content}\n\n")
        f.write(f"## Unified Consensus Plan\n{consensus}\n")

    print(f"\n[Swarm] Results successfully saved to {out_file}")

if __name__ == "__main__":
    asyncio.run(main())
