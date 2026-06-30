import os
import json
import asyncio
import aiohttp
import argparse
import sys

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL_ADVISOR", "llama3.2") # Use your configured local model

ADVISOR_PROMPTS = {
    "contrarian": "You are The Contrarian. Assume this mission has an architectural weakness. Find it. What will fall short? What's missing? What assumption is incorrect? Be specific, not pessimistic. 2-3 sentences max.",
    "firstPrinciples": "You are The First Principles Thinker. Strip away all assumptions. What problem is this ACTUALLY solving? Is this the right question? Rebuild from ground zero. 2-3 sentences max.",
    "expansionist": "You are The Expansionist. Ignore risk. What upside is being missed? What could be 10x bigger? What adjacent opportunity is hiding in this idea? 2-3 sentences max.",
    "outsider": "You are The Outsider. You have zero context about this project. What is confusing? What would a fresh person misunderstand? What's the curse of knowledge here? 2-3 sentences max.",
    "builder": "You are The Builder. Ignore theory. What are the first 3 concrete steps to actually build this? What skills and tools are required? How hard is it to ship? 2-3 sentences max.",
}

async def ask_ollama(session, prompt, format_json=False):
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False
    }
    if format_json:
        payload["format"] = "json"

    try:
        async with session.post(OLLAMA_URL, json=payload, timeout=90) as resp:
            if resp.status == 200:
                data = await resp.json()
                return data.get("response", "").strip()
            return ""
    except Exception as e:
        return ""

async def draft_mission(idea: str):
    prompt = f"""You are an AI mission control system. Convert the following idea into a structured JSON mission brief. 
Return ONLY valid JSON with no markdown formatting or extra text.
{{
  "title": "Short 2-4 word punchy technical title",
  "desc": "A 1-2 sentence technical summary",
  "tags": ["SKILL1", "SKILL2", "CATEGORY"],
  "difficulty": "LOW" | "MEDIUM" | "HIGH" | "EXTREME",
  "progress": 50
}}

Idea: "{idea}"
"""
    async with aiohttp.ClientSession() as session:
        result = await ask_ollama(session, prompt, format_json=True)
        if result:
            try:
                parsed = json.loads(result)
                # Assign ID and Status
                parsed["id"] = str(int(asyncio.get_event_loop().time() * 1000))
                parsed["status"] = "DRAFT"
                return parsed
            except Exception:
                pass
                
        # Heuristic Fallback
        tags = ["CORE"]
        idea_lower = idea.lower()
        if "seo" in idea_lower: tags.append("MARKETING")
        if "ui" in idea_lower or "design" in idea_lower: tags.append("DESIGN")
        if "data" in idea_lower: tags.append("DATA")
        
        return {
            "id": str(int(asyncio.get_event_loop().time() * 1000)),
            "title": idea.split(' ')[:3] + ["Protocol*"],
            "desc": (idea[:80] + "...") if len(idea) > 80 else idea + " [Heuristic fallback]*",
            "tags": tags,
            "difficulty": "MEDIUM",
            "progress": 50,
            "status": "DRAFT"
        }

async def run_council(title: str, desc: str):
    async with aiohttp.ClientSession() as session:
        # 1. Run all 5 advisors concurrently
        tasks = []
        advisor_keys = list(ADVISOR_PROMPTS.keys())
        for adv in advisor_keys:
            prompt = f"{ADVISOR_PROMPTS[adv]}\n\nMission Title: \"{title}\"\nMission Description: \"{desc}\"\n\nYour analysis:"
            tasks.append(ask_ollama(session, prompt))
            
        results = await asyncio.gather(*tasks)
        
        advisor_outputs = {}
        for key, res in zip(advisor_keys, results):
            advisor_outputs[key] = res if res else f"[Ollama offline — heuristic fallback for {key}]*"
            
        # 2. Synthesize
        combined = "\n\n".join([f"{k.upper()}: {v}" for k, v in advisor_outputs.items()])
        syn_prompt = f"""You are a Chairman synthesizing a council's analysis of a software mission.
Based on these 5 advisor opinions, return ONLY valid JSON with no markdown or extra text:

{{
  "refinedDesc": "A polished 1-2 sentence technical summary",
  "skills": ["REACT", "PYTHON", "OLLAMA"],
  "difficulty": "LOW" | "MEDIUM" | "HIGH" | "EXTREME",
  "confidence": 85,
  "scopeEstimate": "1 week",
  "miniPRD": {{
    "problem": "exact problem solved",
    "audience": "Target user",
    "solution": "What the final product looks like"
  }},
  "verdict": "One sentence chairman verdict"
}}

Mission: "{title}" — "{desc}"

Council Opinions:
{combined}
"""
        enrichment = None
        syn_res = await ask_ollama(session, syn_prompt, format_json=True)
        if syn_res:
            try:
                enrichment = json.loads(syn_res)
            except Exception:
                pass
                
        if not enrichment:
            enrichment = {
                "refinedDesc": desc + " [Heuristic fallback]*",
                "skills": ["CORE"],
                "difficulty": "MEDIUM",
                "confidence": 40,
                "scopeEstimate": "1 week",
                "miniPRD": {
                    "problem": "Undefined",
                    "audience": "Unknown",
                    "solution": "Heuristic fallback representation."
                },
                "verdict": "Council unavailable. Heuristic enrichment applied.*"
            }

        return {
            "advisors": advisor_outputs,
            "enrichment": enrichment,
            "ollamaAvailable": any(v and "[Ollama offline" not in v for v in advisor_outputs.values())
        }

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--draft", type=str, help="Idea to draft into a mission")
    parser.add_argument("--council-title", type=str, help="Mission title")
    parser.add_argument("--council-desc", type=str, help="Mission description")
    
    args = parser.parse_args()
    
    # We use a trick to prevent asyncio loop errors on Windows
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
    if args.draft:
        res = asyncio.run(draft_mission(args.draft))
        print(json.dumps(res))
    elif args.council_title and args.council_desc:
        res = asyncio.run(run_council(args.council_title, args.council_desc))
        print(json.dumps(res))
    else:
        print(json.dumps({"error": "No valid arguments provided"}))
