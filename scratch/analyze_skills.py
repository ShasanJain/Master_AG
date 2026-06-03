import os
import glob
import re

SKILLS_DIR = r"C:\Users\swaya\.gemini\skills"
OUTPUT_FILE = r"C:\Users\swaya\.gemini\antigravity-ide\brain\9eec6f23-9508-4b78-9c47-b1177a83d7c2\skills_vault_analysis.md"

def clean_description(desc):
    if not desc: return desc
    desc = re.sub(r'(?i)Use (when|this skill when|this when).*', '', desc)
    desc = re.sub(r'(?i)This (protocol|skill) defines the exact standards.*', '', desc)
    desc = re.sub(r'(?i)By following this strict operational pattern.*', '', desc)
    desc = re.sub(r'(?i)Follow this step-by-step TDD procedure.*', '', desc)
    desc = desc.strip(' \n\r\t\"\'<>')
    return desc

def extract_meta(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
            name = os.path.basename(os.path.dirname(filepath))
            desc = ""
            if match:
                yaml_data = match.group(1)
                name_m = re.search(r'name:\s*(.+)', yaml_data)
                desc_m = re.search(r'description:\s*(.+)', yaml_data)
                if name_m: name = name_m.group(1).strip()
                if desc_m: desc = desc_m.group(1).strip()
            if not desc:
                lines = content.split('\n')
                for line in lines:
                    if line.strip() and not line.startswith('#') and not line.startswith('-') and not line.startswith('---'):
                        desc = line.strip()
                        break
            return name, clean_description(desc)
    except Exception as e:
        return os.path.basename(os.path.dirname(filepath)), str(e)

def extract_subskill_meta(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
            name = os.path.basename(filepath).replace('.md', '')
            desc = ""
            if match:
                yaml_data = match.group(1)
                desc_m = re.search(r'description:\s*(.+)', yaml_data)
                if desc_m: desc = desc_m.group(1).strip()
            
            if not desc:
                lines = content.split('\n')
                for line in lines:
                    stripped = line.strip()
                    if stripped and not stripped.startswith('#') and not stripped.startswith('-') and not stripped.startswith('---'):
                        if len(stripped) > 30 or name.replace('-', ' ').lower() not in stripped.lower():
                            desc = stripped
                            break
            
            desc = clean_description(desc)
            if not desc or len(desc) < 10 or desc.lower() == name.replace('-', ' ').lower():
                desc = "Execution template."
                
            return name, desc
    except Exception as e:
        return os.path.basename(filepath).replace('.md', ''), ""

def main():
    categories = {}
    for root, dirs, files in os.walk(SKILLS_DIR):
        for file in files:
            if file.lower() == 'skill.md' or file.endswith('_skill.md'):
                category = os.path.basename(os.path.dirname(os.path.dirname(root)))
                if category == 'skills' or category == '.gemini':
                    category = os.path.basename(os.path.dirname(root))
                if category not in categories:
                    categories[category] = []
                
                filepath = os.path.join(root, file)
                name, desc = extract_meta(filepath)
                
                # Expand sub-skills
                sub_dir = os.path.join(os.path.dirname(filepath), 'sub-skills')
                sub_parts = []
                if os.path.exists(sub_dir):
                    for sub_file in os.listdir(sub_dir):
                        if sub_file.endswith('.md'):
                            sub_path = os.path.join(sub_dir, sub_file)
                            s_name, s_desc = extract_subskill_meta(sub_path)
                            sub_parts.append((s_name, s_desc))
                
                categories[category].append((name, desc, sub_parts))
                
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("# Detailed Skills Vault Analysis\n\n")
        f.write("This artifact provides an expanded breakdown of all available skills in the global vault, including detailed explanations of each skill and its specific sub-parts/playbooks.\n\n")
        for cat, skills in sorted(categories.items()):
            f.write(f"## {cat.capitalize()}\n\n")
            for name, desc, sub_parts in sorted(skills):
                f.write(f"### {name}\n")
                f.write(f"**Description:** {desc}\n\n")
                if sub_parts:
                    f.write("**Sub-Parts / Playbooks:**\n")
                    for s_name, s_desc in sorted(sub_parts):
                        f.write(f"- **{s_name}**: {s_desc[:120]}{'...' if len(s_desc)>120 else ''}\n")
                else:
                    f.write("*(No specific sub-parts/playbooks documented)*\n")
                f.write("\n")
            f.write("---\n\n")
    print(f"Analysis saved to {OUTPUT_FILE}")

if __name__ == '__main__':
    main()
