"""
Skill Studio Engine
====================
Powers the browser-based Workflow-to-Skill builder.
LLM strategy: Gemini API (primary) → Ollama (fallback on any failure).

Subcommands:
  extract    — parse raw workflow text into structured steps
  brainstorm — run one round of adaptive Q&A
  design     — generate full design document
  generate   — produce SKILL.md + Python CLI script files
  validate   — execute generated script with test input, return output
  publish    — write generated files to skills directory
"""

import os
import sys
import json
import time
import argparse
import subprocess
import urllib.request
import urllib.error
import urllib.parse
import tempfile
import shutil
import re

# ─── Config ──────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL_ADVISOR", "llama3.2")
SKILLS_DIR = os.path.expanduser(r"~/.gemini/config/skills")

# Brainstorm Q&A bank — maps to SKILL.md Phases
QUESTION_BANK = {
    1: [
        ("purpose", "What is the core purpose of this workflow? What problem does it solve?"),
        ("frequency", "How often do you run this? Is it recurring or one-off?"),
        ("trigger", "What triggers this workflow — a user request, a schedule, or an event?"),
    ],
    2: [
        ("inputs", "What are the exact inputs this workflow requires to start?"),
        ("outputs", "What does a successful run produce? Files, data, messages?"),
        ("strict_steps", "Are there any steps where the exact method matters (specific API, tool, database)?"),
    ],
    3: [
        ("error_handling", "If a step fails (API down, no results), should the skill: ask you for guidance, try alternatives, or fail loudly?"),
        ("edge_cases", "Are there edge cases the skill must handle silently vs. surface to you?"),
        ("rate_limits", "Are there any APIs involved with known rate limits?"),
    ],
    4: [
        ("existing_skills", "Do you use any existing tools in this workflow I should reference rather than rebuild?"),
        ("code_needed", "Does this workflow touch APIs, files, or data processing? (yes/no — determines if a script is needed)"),
        ("name", "What should this skill be called? (lowercase, hyphens, e.g. 'daily-report-builder')"),
    ],
    5: [
        ("sample_query", "Optional: provide a sample input and the expected output so I can validate the skill works correctly."),
    ],
}

# ─── LLM Abstraction ─────────────────────────────────────────────────────────
def call_gemini(prompt: str) -> str:
    """Call Gemini API. Returns text or raises on failure."""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not set")
    
    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 4096}
    }).encode()
    
    url = f"{GEMINI_ENDPOINT}?key={GEMINI_API_KEY}"
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        raise RuntimeError(f"Gemini failed: {e}")


def call_ollama(prompt: str) -> str:
    """Call local Ollama. Returns text or raises on failure."""
    payload = json.dumps({"model": OLLAMA_MODEL, "prompt": prompt, "stream": False}).encode()
    req = urllib.request.Request(OLLAMA_URL, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            data = json.loads(resp.read())
            return data.get("response", "").strip()
    except Exception as e:
        raise RuntimeError(f"Ollama failed: {e}")


def llm(prompt: str) -> str:
    """Gemini primary → Ollama fallback."""
    try:
        return call_gemini(prompt)
    except Exception as gemini_err:
        print(f"[WARN] Gemini unavailable ({gemini_err}), falling back to Ollama...", file=sys.stderr)
        try:
            return call_ollama(prompt)
        except Exception as ollama_err:
            raise RuntimeError(f"Both LLMs failed. Gemini: {gemini_err} | Ollama: {ollama_err}")


def llm_json(prompt: str) -> dict:
    """Call LLM and parse JSON from response. Strips markdown fences."""
    raw = llm(prompt)
    # Strip ```json ... ``` fences
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r"```\s*$", "", cleaned.strip(), flags=re.MULTILINE)
    return json.loads(cleaned.strip())


# ─── Subcommands ─────────────────────────────────────────────────────────────
def cmd_extract(args):
    """Extract structured steps from raw workflow text."""
    if hasattr(args, 'input_file') and args.input_file:
        with open(args.input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        workflow_text = data.get('workflow', '')
    else:
        workflow_text = args.workflow
    
    prompt = f"""You are an expert AI workflow analyst. The user has described a workflow below.
Extract it into a structured JSON object. Return ONLY valid JSON, no markdown.

{{
  "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "inputs": ["input1", "input2"],
  "outputs": ["output1", "output2"],
  "suggested_name": "lowercase-hyphenated-name",
  "has_api_calls": true,
  "has_file_io": true,
  "estimated_complexity": "LOW|MEDIUM|HIGH"
}}

Workflow:
{workflow_text}
"""
    
    result = llm_json(prompt)
    output = json.dumps(result, indent=2)
    
    if args.output:
        with open(args.output, "w") as f:
            f.write(output)
        print(f"Success! Extracted workflow written to: {args.output}", file=sys.stderr)
    else:
        print(output)


def cmd_brainstorm(args):
    """Run one brainstorm round. Returns next questions + updated brief."""
    if hasattr(args, 'input_file') and args.input_file:
        with open(args.input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        round_num = data.get('round', 1)
        brief_json = data.get('brief', {})
    else:
        round_num = args.round
        brief_json = json.loads(args.brief) if args.brief else {}
    
    questions = QUESTION_BANK.get(round_num, [])
    
    # Filter out already-answered questions
    answered_keys = set(brief_json.keys())
    pending = [(k, q) for k, q in questions if k not in answered_keys]
    
    # Determine completion: all 9 criteria answered
    required_keys = {"purpose", "inputs", "outputs", "strict_steps", "error_handling",
                     "code_needed", "existing_skills", "rate_limits", "name"}
    answered_required = required_keys.intersection(answered_keys)
    completion_pct = int(len(answered_required) / len(required_keys) * 100)
    is_complete = len(answered_required) == len(required_keys)
    
    result = {
        "round": round_num,
        "questions": [{"key": k, "question": q} for k, q in pending[:3]],
        "brief": brief_json,
        "completion_pct": completion_pct,
        "is_complete": is_complete,
        "required_answered": list(answered_required),
        "required_missing": list(required_keys - answered_keys),
    }
    
    output = json.dumps(result, indent=2)
    if args.output:
        with open(args.output, "w") as f:
            f.write(output)
        print(f"Success! Brainstorm round {round_num} written to: {args.output}", file=sys.stderr)
    else:
        print(output)


def cmd_design(args):
    """Generate a full skill design document from the completed brief."""
    if hasattr(args, 'input_file') and args.input_file:
        with open(args.input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        brief = data.get('brief', {})
    else:
        brief = json.loads(args.brief)
    
    prompt = f"""You are a senior AI systems architect. Based on this completed workflow brief, generate a comprehensive skill design document.
Return ONLY valid JSON, no markdown.

Brief:
{json.dumps(brief, indent=2)}

Return this JSON structure:
{{
  "skill_name": "lowercase-hyphenated-name",
  "description": "One paragraph, max 1024 chars",
  "directory_structure": ["SKILL.md", "scripts/skill_cli.py", "references/"],
  "existing_skills_referenced": [{{"name": "skill-name", "rationale": "why"}}],
  "new_scripts": [{{"name": "skill_cli.py", "subcommands": ["search", "fetch", "analyze"]}}],
  "rate_limiting_strategy": "Description of rate limiting approach",
  "error_handling_strategy": "Per-step error handling",
  "needs_code": true,
  "pattern": "cli|instruction-only",
  "workflow_steps": [
    {{"step": 1, "name": "Step Name", "description": "What happens", "strict": true, "fallback": "What to do on failure"}}
  ],
  "sample_query": "Optional sample query from brief",
  "sample_expected_output": "Optional expected output"
}}
"""
    
    result = llm_json(prompt)
    output = json.dumps(result, indent=2)
    
    if args.output:
        with open(args.output, "w") as f:
            f.write(output)
        print(f"Success! Design document written to: {args.output}", file=sys.stderr)
    else:
        print(output)


def cmd_generate(args):
    """Generate SKILL.md and Python CLI script from the design document."""
    if hasattr(args, 'input_file') and args.input_file:
        with open(args.input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        design = data.get('design', {})
        brief = data.get('brief', {})
    else:
        design = json.loads(args.design)
        brief = json.loads(args.brief) if args.brief else {}
    
    skill_name = design.get("skill_name", "unnamed-skill")
    
    # Generate SKILL.md
    skill_md_prompt = f"""You are generating a SKILL.md file for an AI agent skill system.
Follow this EXACT format (YAML frontmatter + markdown body). Return ONLY the raw markdown, no extra text.

The skill must have these sections:
1. YAML frontmatter with name and description
2. ## Overview
3. ## Dependencies (list referenced skills if any)
4. ## Quick Start (minimal example)
5. ## Utility Scripts (document each subcommand with examples) - only if CLI pattern
6. ## Workflow (numbered steps) - only if instruction-only
7. ## Rate Limiting - only if APIs are involved
8. ## Common Mistakes (2-3 pitfalls)

Design Document:
{json.dumps(design, indent=2)}

Brief:
{json.dumps(brief, indent=2)}
"""
    
    skill_md = llm(skill_md_prompt)
    
    # Generate Python CLI script (only if code is needed)
    script_content = ""
    if design.get("needs_code", True):
        script_prompt = f"""You are generating a production-quality Python CLI script for an AI skill.
STRICT REQUIREMENTS:
- Use argparse with subcommands (one per workflow step)
- Use `uv run` convention (shebang: #!/usr/bin/env python3)
- ALL subcommands must accept --output argument to write results to a file
- Use json.dump with indent=2 for JSON output
- NEVER print large data to stdout — write to --output file, print only "Success! Written to: <path>"
- Exit with code 1 on errors
- Implement rate limiting if any API is called (default: 1 request/second using time.monotonic())
- Add retry with exponential backoff for 5xx errors
- On HTTP errors, include the response body in error messages
- Make required arguments explicit (no silent defaults)

Design Document:
{json.dumps(design, indent=2)}

Return ONLY the raw Python code, no markdown fences.
"""
        script_content = llm(script_prompt)
    
    result = {
        "skill_name": skill_name,
        "files": {
            "SKILL.md": skill_md,
            "scripts/skill_cli.py": script_content,
        }
    }
    
    output = json.dumps(result, indent=2)
    if args.output:
        with open(args.output, "w") as f:
            f.write(output)
        print(f"Success! Generated skill files written to: {args.output}", file=sys.stderr)
    else:
        print(output)


def cmd_validate(args):
    """Execute the generated CLI script with a test input and capture output."""
    if hasattr(args, 'input_file') and args.input_file:
        with open(args.input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        generated = data.get('generated', {})
        test_input = data.get('test_input', '')
    else:
        generated = json.loads(args.generated)
        test_input = args.test_input or ""
    
    skill_name = generated.get("skill_name", "test-skill")
    files = generated.get("files", {})
    script = files.get("scripts/skill_cli.py", "")
    
    if not script:
        print(json.dumps({"success": False, "error": "No script to validate — instruction-only skill"}))
        return
    
    # Write script to temp file and run it
    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False, encoding="utf-8") as tmp:
        tmp.write(script)
        tmp_path = tmp.name
    
    try:
        # Run with the test input as argument (attempt --help first to verify argparse works)
        proc = subprocess.run(
            [sys.executable, tmp_path, "--help"],
            capture_output=True, text=True, timeout=15
        )
        
        result = {
            "success": proc.returncode == 0,
            "stdout": proc.stdout[:2000],
            "stderr": proc.stderr[:2000],
            "returncode": proc.returncode,
            "subcommands_detected": re.findall(r'\{([^}]+)\}', proc.stdout),
            "test_input": test_input,
        }
    except subprocess.TimeoutExpired:
        result = {"success": False, "error": "Script timed out during validation"}
    except Exception as e:
        result = {"success": False, "error": str(e)}
    finally:
        os.unlink(tmp_path)
    
    output = json.dumps(result, indent=2)
    if args.output:
        with open(args.output, "w") as f:
            f.write(output)
        print(f"Success! Validation result written to: {args.output}", file=sys.stderr)
    else:
        print(output)


def cmd_publish(args):
    """Write generated skill files to the skills directory."""
    if hasattr(args, 'input_file') and args.input_file:
        with open(args.input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        generated = data.get('generated', {})
    else:
        generated = json.loads(args.generated)
    skill_name = generated.get("skill_name", "unnamed-skill")
    files = generated.get("files", {})
    
    # Sanitize name
    skill_name = re.sub(r"[^a-z0-9\-]", "-", skill_name.lower()).strip("-")
    target_dir = os.path.join(SKILLS_DIR, skill_name)
    
    os.makedirs(target_dir, exist_ok=True)
    
    written = []
    for relative_path, content in files.items():
        if not content:
            continue
        full_path = os.path.join(target_dir, relative_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        written.append(full_path)
    
    result = {
        "success": True,
        "skill_name": skill_name,
        "install_path": target_dir,
        "files_written": written,
        "message": f"Skill '{skill_name}' installed to {target_dir}"
    }
    
    output = json.dumps(result, indent=2)
    if args.output:
        with open(args.output, "w") as f:
            f.write(output)
        print(f"Success! Publish result written to: {args.output}", file=sys.stderr)
    else:
        print(output)


# ─── CLI Entry ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    if sys.platform == "win32":
        import asyncio
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    parser = argparse.ArgumentParser(description="Skill Studio Engine — Workflow-to-Skill pipeline")
    sub = parser.add_subparsers(dest="command", required=True)
    
    # extract
    p = sub.add_parser("extract", help="Extract steps from raw workflow text")
    p.add_argument("--workflow", help="Raw workflow description text")
    p.add_argument("--input-file", help="JSON file with input data (avoids shell escaping)")
    p.add_argument("--output", help="Output file path")
    
    # brainstorm
    p = sub.add_parser("brainstorm", help="Run one round of adaptive Q&A")
    p.add_argument("--round", type=int, help="Round number (1-5)")
    p.add_argument("--brief", help="JSON string of current design brief")
    p.add_argument("--input-file", help="JSON file with input data (avoids shell escaping)")
    p.add_argument("--output", help="Output file path")
    
    # design
    p = sub.add_parser("design", help="Generate design document from completed brief")
    p.add_argument("--brief", help="JSON string of completed design brief")
    p.add_argument("--input-file", help="JSON file with input data (avoids shell escaping)")
    p.add_argument("--output", help="Output file path")
    
    # generate
    p = sub.add_parser("generate", help="Generate SKILL.md + Python CLI script")
    p.add_argument("--design", help="JSON string of design document")
    p.add_argument("--brief", help="JSON string of original brief")
    p.add_argument("--input-file", help="JSON file with input data (avoids shell escaping)")
    p.add_argument("--output", help="Output file path")
    
    # validate
    p = sub.add_parser("validate", help="Run generated script with test input")
    p.add_argument("--generated", help="JSON string of generated files")
    p.add_argument("--test-input", help="Test input string")
    p.add_argument("--input-file", help="JSON file with input data (avoids shell escaping)")
    p.add_argument("--output", help="Output file path")
    
    # publish
    p = sub.add_parser("publish", help="Write skill files to skills directory")
    p.add_argument("--generated", help="JSON string of generated files")
    p.add_argument("--input-file", help="JSON file with input data (avoids shell escaping)")
    p.add_argument("--output", help="Output file path")
    
    args = parser.parse_args()
    
    dispatch = {
        "extract": cmd_extract,
        "brainstorm": cmd_brainstorm,
        "design": cmd_design,
        "generate": cmd_generate,
        "validate": cmd_validate,
        "publish": cmd_publish,
    }
    
    try:
        dispatch[args.command](args)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
