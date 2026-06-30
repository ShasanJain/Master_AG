import os
import re
from pathlib import Path

def parse_frontmatter(content):
    if not content.startswith("---"):
        return None, None
    parts = content.split("---")
    if len(parts) < 3:
        return None, None
    fm_text = parts[1]
    name_match = re.search(r"^name:\s*(.+)$", fm_text, re.MULTILINE)
    desc_match = re.search(r"^description:\s*(.+)$", fm_text, re.MULTILINE)
    
    name = name_match.group(1).strip() if name_match else None
    desc = desc_match.group(1).strip() if desc_match else None
    return name, desc

def audit_skills():
    search_dirs = [
        ("Gemini Global", Path(r"C:\Users\swaya\.gemini\skills")),
        ("Claude Global", Path(r"C:\Users\swaya\.claude\skills")),
        ("Workspace Skills", Path(r"c:\Users\swaya\OneDrive\Desktop\Master_AG\skills")),
        ("Workspace Agent Skills", Path(r"c:\Users\swaya\OneDrive\Desktop\Master_AG\.agent\skills"))
    ]
    
    skills = []
    for origin, base_path in search_dirs:
        if not base_path.exists():
            continue
        for p in base_path.rglob("*.md"):
            if p.name.lower() == "skill.md" or p.name.endswith("_skill.md"):
                try:
                    content = p.read_text(encoding="utf-8", errors="ignore")
                except Exception:
                    continue
                name, desc = parse_frontmatter(content)
                if not name:
                    name = p.parent.name
                if not desc:
                    desc = "No description provided."
                skills.append({
                    "origin": origin,
                    "name": name,
                    "description": desc,
                    "path": p.as_posix()
                })
                
    output_path = Path(r"c:\Users\swaya\OneDrive\Desktop\Master_AG\scratch\global_skills_list.md")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("# Skills Inventory Audit\n\n")
        f.write("Inventory of all global and workspace skills.\n\n")
        f.write("| Origin | Skill Name | Description | Path |\n")
        f.write("| --- | --- | --- | --- |\n")
        for s in sorted(skills, key=lambda x: (x["origin"], x["name"])):
            f.write(f"| {s['origin']} | `{s['name']}` | {s['description']} | [{s['name']}](file:///{s['path']}) |\n")
            
    print(f"SUCCESS: Audited {len(skills)} skills. Output saved to {output_path}")

if __name__ == "__main__":
    audit_skills()
