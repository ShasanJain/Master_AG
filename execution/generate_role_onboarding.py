import os
import sys
import json
import re
import argparse
import asyncio
import requests
from pathlib import Path

# Setup paths to ensure we can import vector_memory
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

try:
    from execution.vector_memory import recall_memory
except ImportError:
    recall_memory = None

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

# Expanded default templates for fallback
DEFAULT_ROLE_TEMPLATES = {
    "junior frontend engineer": {
        "responsibilities": [
            "Support building React component layouts and video composites: You will manage user interface components and visual overlay frames rendered via Remotion.",
            "Maintain UI theme configs and branding assets: Update corporate styles, variables, colors, and layout presets.",
            "Integrate voice narration outputs with front-end visual widgets: Bridge synthesized TTS audio outputs with browser canvas timelines.",
            "Clean up workspace build pipelines and run formatting tests: Enforce coding quality standard checks before deployment."
        ],
        "tools": [
            {"name": "React Remotion (remotion)", "path": "remotion", "desc": "React-based video creation framework with visual timeline scrubbing.", "commands": ["npm run build", "npx remotion preview"]},
            {"name": "Design Presets (design-system)", "path": "design-system", "desc": "Shared design system configuration file containing branding styles.", "commands": ["python execution/test_design_system.py"]}
        ],
        "env_keys": [
            {"key": "EDGETTS_VOICE", "desc": "Standard neural voice key used in narration overlays."},
            {"key": "TIKTOK_API_KEY", "desc": "Publishing token for automated short posts."}
        ],
        "roadmap": [
            {"phase": "Days 1-5: UI Workspace Setup", "tasks": ["Clone repository and install node packages in dashboard.", "Run diagnostics test: python execution/run_diagnostics.py.", "Verify Remotion compiler previews locally."]},
            {"phase": "Days 6-15: Overlay Development", "tasks": ["Design a custom video frame template in dashboard workspace.", "Verify that text overlays align cleanly in vertical previews."]},
            {"phase": "Days 16-30: Component Integration", "tasks": ["Expose audio synthesis controls in Next.js frontend panels.", "Verify page builds with zero typescript errors."]}
        ]
    }
}

async def fetch_matched_skills(role: str):
    if not recall_memory:
        return []
    
    print(f"[Onboarding Engine] Querying vector database for: '{role}'...")
    try:
        results = await recall_memory(role, user_id="jack", limit=10)
        matched = []
        for r in results:
            meta = r.get("metadata") or r.get("meta") or {}
            if "skill" in meta.get("tags", []) or meta.get("skill_name"):
                name = meta.get("skill_name", "Unknown Skill")
                if name not in matched:
                    matched.append(name)
        return matched
    except Exception as e:
        print(f"[Onboarding Engine] Database query failed: {e}")
        return []

def parse_jd_with_llm(jd_text: str) -> dict:
    prompt = f"""
    You are an expert HR Analyst and COO.
    Parse this raw Job Description and extract the structured onboarding parameters in JSON format.
    
    Job Description text:
    \"\"\"
    {jd_text}
    \"\"\"
    
    Output ONLY a valid JSON object. Do not include markdown code block syntax.
    The JSON structure must match this scheme:
    {{
        "title": "Clean Job Title",
        "company": "Clean Company Name (default to Jack Enterprises if not found)",
        "responsibilities": [
            "Detailed responsibility 1...",
            "Detailed responsibility 2..."
        ],
        "tools": [
            {{
                "name": "Tool Name",
                "path": "workspace_subfolder_path (e.g. openmontage, remotion, design-system)",
                "desc": "Short description of what the tool is used for",
                "commands": ["Reference execution commands to run this tool"]
            }}
        ],
        "env_keys": [
            {{
                "key": "ENVIRONMENT_VARIABLE_KEY",
                "desc": "What this variable is used for"
            }}
        ],
        "roadmap": [
            {{
                "phase": "Days 1-5: Phase Name",
                "tasks": ["Task 1", "Task 2"]
            }},
            {{
                "phase": "Days 6-15: Phase Name",
                "tasks": ["Task 1"]
            }},
            {{
                "phase": "Days 16-30: Phase Name",
                "tasks": ["Task 1"]
            }}
        ]
    }}
    """
    
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }
    try:
        resp = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=30)
        if resp.status_code == 200:
            return json.loads(resp.json().get("response", ""))
    except Exception as e:
        print(f"[Onboarding Engine] LLM JD parsing error: {e}")
    return None

def parse_jd_fallback(jd_text: str) -> dict:
    # Attempt to extract fields using simple regex
    title_match = re.search(r"Job Title:\s*(.*)", jd_text, re.IGNORECASE)
    company_match = re.search(r"Company:\s*(.*)", jd_text, re.IGNORECASE)
    
    title = title_match.group(1).strip() if title_match else "Junior Frontend Engineer"
    company = company_match.group(1).strip() if company_match else "Jack Media Swarm"
    
    role_key = title.lower().strip()
    template = DEFAULT_ROLE_TEMPLATES.get(role_key, DEFAULT_ROLE_TEMPLATES["junior frontend engineer"])
    
    return {
        "title": title,
        "company": company,
        "responsibilities": template["responsibilities"],
        "tools": template["tools"],
        "env_keys": template["env_keys"],
        "roadmap": template["roadmap"]
    }

def generate_markdown(company: str, role: str, data: dict) -> str:
    md = f"# 🌐 Onboarding Guide: {role.title()} at {company}\n\n"
    md += f"Welcome to **{company}**! This document provides a highly detailed, role-specific onboarding breakdown mapping the tools, repositories, configurations, and schedules you need to start operating immediately.\n\n"
    
    md += "---\n\n"
    md += "## 🎯 1. Core Responsibilities & Operations\n"
    md += "As a member of our team, your primary tasks focus on keeping execution lines operating with zero errors. Your core daily operational loops include:\n\n"
    for resp in data["responsibilities"]:
        parts = resp.split(':')
        header = parts[0].strip()
        body = parts[1].strip() if len(parts) > 1 else ""
        md += f"*   **{header}:** {body}\n"
    md += "\n"
    
    md += "---\n\n"
    md += "## 🛠️ 2. Tooling, Script References & Workspace Access\n"
    md += "You will interact directly with these specific codebase directories. Please ensure you familiarize yourself with their folder paths and run commands:\n\n"
    for tool in data["tools"]:
        path_link = f"file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/{tool['path']}" if tool['path'] else "file:///c:/Users/swaya/OneDrive/Desktop/Master_AG"
        md += f"### 📂 [{tool['name']}]({path_link})\n"
        md += f"**Description:** {tool['desc']}\n\n"
        md += "**Execution Reference Commands:**\n"
        md += "```bash\n"
        for cmd in tool.get("commands", []):
            md += f"{cmd}\n"
        md += "```\n\n"
    
    md += "---\n\n"
    md += "## 🔑 3. Configuration & Environment Variables\n"
    md += "You must configure a local `.env` file in the project root containing these variables. Coordinate with your team leader to obtain valid tokens:\n\n"
    md += "| Variable Key | Purpose & Integration | Expected Format / Default |\n"
    md += "| :--- | :--- | :--- |\n"
    for item in data["env_keys"]:
        md += f"| `{item['key']}` | {item['desc']} | Configured in local `.env` |\n"
    md += "\n"
    
    md += "---\n\n"
    md += "## 📅 4. The First 30 Days Roadmap\n"
    md += "Follow this phased roadmap to ensure you align with our performance expectations during your first month:\n\n"
    for stage in data["roadmap"]:
        md += f"### 🗓️ {stage['phase']}\n"
        for task in stage["tasks"]:
            md += f"- [ ] {task}\n"
        md += "\n"
    
    md += "---\n\n"
    md += "## 📈 5. Quality Gates & Success Standards\n"
    md += "Before submitting any task, you must enforce the following checks:\n\n"
    md += "1.  **Directives Check:** Ensure your execution results align with the standard operating procedures under [directives/](file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/directives).\n"
    md += "2.  **Lint & Verify:** Run syntax audits: `npm run lint` or `pytest` locally depending on the module stack.\n"
    md += "3.  **Git Branch Rule:** Never commit directly to the `main` branch. Create a new branch prefixed with your role or feature area (e.g. `feature/backend-opt`).\n\n"
    
    md += "---\n\n"
    md += "## ☎️ 6. Support Contacts & HR Policies\n"
    md += "If you encounter any roadblock, please reach out to the appropriate contact:\n\n"
    md += "| Contact Persona | Name | Email | Direct Line / Slack |\n"
    md += "| :--- | :--- | :--- | :--- |\n"
    md += f"| **Team Lead / Manager** | Sarah Jenkins | s.jenkins@{company.lower().replace(' ', '')}.com | +1 (555) 019-2834 / `@SarahJ` |\n"
    md += f"| **HR Operations** | David Vance | d.vance@{company.lower().replace(' ', '')}.com | +1 (555) 014-9988 / `@DavidV` |\n"
    md += f"| **IT Helpdesk Support** | Tech Support Team | support@{company.lower().replace(' ', '')}.com | Slack: `#helpdesk-support` |\n\n"
    md += "### 📜 Corporate Documentation & Handbooks\n"
    md += "*   **[Corporate HR Policies Guide](file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/docs/hr/policies.md):** Information on leave policies, holidays, benefits, and standard conduct codes.\n"
    md += "*   **[Workspace Security Handbook](file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/docs/hr/security_handbook.md):** Password management policies, environment file handling, and code compilation policies.\n"
    
    return md

def generate_html(company: str, role: str, data: dict) -> str:
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Onboarding Guide: {role} at {company}</title>
    <style>
        body {{
            font-family: 'Outfit', sans-serif;
            background-color: #0d1117;
            color: #c9d1d9;
            margin: 0;
            padding: 40px;
            line-height: 1.6;
        }}
        .container {{
            max-width: 900px;
            margin: 0 auto;
            background: #161b22;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            border: 1px solid #30363d;
        }}
        h1 {{
            color: #58a6ff;
            border-bottom: 2px solid #30363d;
            padding-bottom: 15px;
            font-size: 2.2rem;
        }}
        h2 {{
            color: #f0883e;
            margin-top: 30px;
            border-bottom: 1px solid #21262d;
            padding-bottom: 8px;
        }}
        h3 {{
            color: #ff7b72;
        }}
        ul, ol {{
            padding-left: 20px;
        }}
        li {{
            margin-bottom: 10px;
        }}
        code {{
            background: #21262d;
            color: #ff7b72;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
        }}
        pre {{
            background: #0d1117;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            border: 1px solid #30363d;
        }}
        pre code {{
            background: none;
            color: #79c0ff;
            padding: 0;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }}
        th, td {{
            border: 1px solid #30363d;
            padding: 12px;
            text-align: left;
        }}
        th {{
            background-color: #21262d;
            color: #58a6ff;
        }}
        a {{
            color: #58a6ff;
            text-decoration: none;
        }}
        a:hover {{
            text-decoration: underline;
        }}
        .divider {{
            height: 1px;
            background-color: #30363d;
            margin: 40px 0;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🌐 Onboarding Guide: {role} at {company}</h1>
        <p>Welcome to <strong>{company}</strong>! This document maps the tools, repositories, configurations, and schedules you need to start operating immediately.</p>
        
        <div class="divider"></div>
        
        <h2>🎯 1. Core Responsibilities & Operations</h2>
        <ul>
    """
    for resp in data["responsibilities"]:
        parts = resp.split(':')
        header = parts[0].strip()
        body = parts[1].strip() if len(parts) > 1 else ""
        html += f"<li><strong>{header}:</strong> {body}</li>\n"
    
    html += """
        </ul>
        
        <div class="divider"></div>
        
        <h2>🛠️ 2. Tooling, Script References & Workspace Access</h2>
    """
    for tool in data["tools"]:
        path_link = f"file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/{tool['path']}" if tool['path'] else "file:///c:/Users/swaya/OneDrive/Desktop/Master_AG"
        html += f"""
        <h3>📂 <a href="{path_link}">{tool['name']}</a></h3>
        <p><strong>Description:</strong> {tool['desc']}</p>
        <p><strong>Execution Reference Commands:</strong></p>
        <pre><code>"""
        for cmd in tool.get("commands", []):
            html += f"{cmd}\n"
        html += """</code></pre>
        """
        
    html += """
        <div class="divider"></div>
        
        <h2>🔑 3. Configuration & Environment Variables</h2>
        <table>
            <thead>
                <tr>
                    <th>Variable Key</th>
                    <th>Purpose & Integration</th>
                </tr>
            </thead>
            <tbody>
    """
    for item in data["env_keys"]:
        html += f"<tr><td><code>{item['key']}</code></td><td>{item['desc']}</td></tr>\n"
        
    html += """
            </tbody>
        </table>
        
        <div class="divider"></div>
        
        <h2>📅 4. The First 30 Days Roadmap</h2>
    """
    for stage in data["roadmap"]:
        html += f"<h3>🗓️ {stage['phase']}</h3><ul>"
        for task in stage["tasks"]:
            html += f"<li>[ ] {task}</li>"
        html += "</ul>\n"
        
    html += """
        <div class="divider"></div>
        
        <h2>📈 5. Quality Gates & Success Standards</h2>
        <ol>
            <li><strong>Directives Check:</strong> Ensure your execution results align with the standard operating procedures under <a href="file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/directives">directives/</a>.</li>
            <li><strong>Lint & Verify:</strong> Run syntax audits: <code>npm run lint</code> or <code>pytest</code> locally depending on the module stack.</li>
            <li><strong>Git Branch Rule:</strong> Never commit directly to the <code>main</code> branch. Create a new branch prefixed with your role (e.g. <code>feature/backend-opt</code>).</li>
        </ol>
        
        <div class="divider"></div>
        
        <h2>☎️ 6. Support Contacts & HR Policies</h2>
        <table>
            <thead>
                <tr>
                    <th>Contact Persona</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Direct Line / Slack</th>
                </tr>
            </thead>
            <tbody>
    """
    html += f"""
                <tr>
                    <td><strong>Team Lead / Manager</strong></td>
                    <td>Sarah Jenkins</td>
                    <td>s.jenkins@{company.lower().replace(' ', '')}.com</td>
                    <td>+1 (555) 019-2834 / <code>@SarahJ</code></td>
                </tr>
                <tr>
                    <td><strong>HR Operations</strong></td>
                    <td>David Vance</td>
                    <td>d.vance@{company.lower().replace(' ', '')}.com</td>
                    <td>+1 (555) 014-9988 / <code>@DavidV</code></td>
                </tr>
                <tr>
                    <td><strong>IT Helpdesk Support</strong></td>
                    <td>Tech Support Team</td>
                    <td>support@{company.lower().replace(' ', '')}.com</td>
                    <td>Slack: <code>#helpdesk-support</code></td>
                </tr>
            </tbody>
        </table>
        
        <h3>📜 Corporate Documentation & Handbooks</h3>
        <ul>
            <li><a href="file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/docs/hr/policies.md">Corporate HR Policies Guide</a></li>
            <li><a href="file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/docs/hr/security_handbook.md">Workspace Security Handbook</a></li>
        </ul>
    </div>
</body>
</html>
    """
    return html

def generate_validation_script(data: dict) -> str:
    keys = [item["key"] for item in data["env_keys"]]
    code = f"""import os
import sys

def verify_environment():
    print("==================================================")
    print("       ONBOARDING ENVIRONMENT VERIFICATION        ")
    print("==================================================")
    
    # Read environment variables
    # (In production, load_dotenv() would be called first)
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass
        
    required_keys = {json.dumps(keys)}
    
    missing = []
    print("Checking active environment keys...")
    for key in required_keys:
        val = os.getenv(key)
        if val:
            # Mask value
            masked = val[:3] + "*" * (len(val) - 3) if len(val) > 3 else "*"
            print(f" [PASS] {{key:<20}} : Active ({{masked}})")
        else:
            print(f" [FAIL] {{key:<20}} : MISSING")
            missing.append(key)
            
    print("--------------------------------------------------")
    if missing:
        print(f"VERIFICATION STATUS: FAILED ({{len(missing)}} missing key(s))")
        print("Please configure the missing keys in your local .env file.")
        sys.exit(1)
    else:
        print("VERIFICATION STATUS: SUCCESS")
        print("All required role configurations are active.")
        sys.exit(0)

if __name__ == "__main__":
    verify_environment()
"""
    return code

async def main():
    parser = argparse.ArgumentParser(description="Automated Onboarding Document Generator")
    parser.add_argument("--jd", type=str, help="Path to raw Job Description text file")
    parser.add_argument("--role", type=str, help="Target role profile (optional if --jd is provided)")
    parser.add_argument("--company", type=str, default="Jack Enterprises", help="Company Name")
    parser.add_argument("--out-dir", type=str, default="output/onboarding", help="Output directory")
    
    args = parser.parse_args()
    
    role_clean = ""
    company_clean = args.company.strip()
    data = None
    
    # 1. Parse JD if provided
    if args.jd:
        jd_path = Path(args.jd)
        if not jd_path.exists():
            print(f"[ERROR] Job Description file not found at: {jd_path}")
            sys.exit(1)
            
        print(f"[Onboarding Engine] Reading Job Description from: {jd_path}")
        with open(jd_path, "r", encoding="utf-8", errors="ignore") as f:
            jd_text = f.read()
            
        # Try LLM parse
        data = parse_jd_with_llm(jd_text)
        if not data:
            print("[Onboarding Engine] Falling back to default pattern parser.")
            data = parse_jd_fallback(jd_text)
            
        role_clean = data["title"]
        company_clean = data["company"]
    else:
        # Require --role if --jd is missing
        if not args.role:
            print("[ERROR] Please provide either --jd <filepath> or --role <rolename>.")
            sys.exit(1)
        role_clean = args.role.strip()
        # Fetch template data
        role_key = role_clean.lower().strip()
        data = DEFAULT_ROLE_TEMPLATES.get(role_key, {
            "responsibilities": [
                f"Coordinate workflows relating to the role of {role_clean} inside the workstation environment.",
                "Maintain operational configurations, environment variables, and associated codebase directories."
            ],
            "tools": [{"name": "Workspace Root", "path": "", "desc": "General project directory.", "commands": []}],
            "env_keys": [
                {"key": "API_KEY", "desc": "Default authorization key for external queries."},
                {"key": "DB_URL", "desc": "Database connector route."}
            ],
            "roadmap": [
                {"phase": "Days 1-5: Setup & Verification", "tasks": ["Clone files and run initial diagnostics tests.", "Review workspace layout."]}
            ]
        })

    # 2. Match skills semantically
    skills = await fetch_matched_skills(role_clean)
    if skills:
        print(f"[Onboarding Engine] Extracted related skills: {skills}")
    
    # 3. Generate Output Formats
    md_content = generate_markdown(company_clean, role_clean, data)
    html_content = generate_html(company_clean, role_clean, data)
    validation_code = generate_validation_script(data)
    
    # 4. Save Files
    out_path = Path(BASE_DIR) / args.out_dir
    out_path.mkdir(parents=True, exist_ok=True)
    
    file_prefix = role_clean.lower().replace(" ", "_")
    
    # Save MD
    md_file = out_path / f"{file_prefix}_onboarding.md"
    with open(md_file, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"[Onboarding Engine] Saved Markdown: {md_file}")
        
    # Save HTML
    html_file = out_path / f"{file_prefix}_onboarding.html"
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"[Onboarding Engine] Saved HTML: {html_file}")
        
    # Save Script
    script_file = out_path / "verify_onboarding.py"
    with open(script_file, "w", encoding="utf-8") as f:
        f.write(validation_code)
    print(f"[Onboarding Engine] Saved Verification Script: {script_file}")

if __name__ == "__main__":
    asyncio.run(main())
