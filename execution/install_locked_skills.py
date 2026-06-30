import os
import sys
import json
import subprocess
import shutil

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LOCK_PATH = os.path.join(BASE_DIR, "skills-lock.json")
GLOBAL_SKILLS = os.path.join(os.environ.get("USERPROFILE", ""), ".gemini", "skills")
TMP_REPOS = os.path.join(BASE_DIR, ".tmp", "repos")

SECTOR_MAP = {
    "agent-performance-engineer": "engineering/performance",
    "performing-security-code-review": "security/audit",
    "chart-visualization": "design/data-visualization",
    "antv-s2-expert": "design/data-visualization",
    "antv-skills-maintainer": "design/data-visualization",
    "icon-retrieval": "design/data-visualization",
    "infographic-creator": "design/data-visualization",
    "narrative-text-visualization": "design/data-visualization",
    "motion-framer": "design/motion",
    "oracle-dba": "engineering/data"
}

def install_skills():
    if not os.path.exists(LOCK_PATH):
        print(f"Error: {LOCK_PATH} not found.")
        sys.exit(1)

    with open(LOCK_PATH, "r", encoding="utf-8") as f:
        lock_data = json.load(f)

    os.makedirs(TMP_REPOS, exist_ok=True)
    os.makedirs(GLOBAL_SKILLS, exist_ok=True)

    skills = lock_data.get("skills", {})
    for skill_name, entry in skills.items():
        source = entry.get("source")
        if not source or entry.get("sourceType") != "github":
            continue

        repo_url = f"https://github.com/{source}.git"
        repo_dir = os.path.join(TMP_REPOS, source.replace("/", "_"))

        print(f"\nProcessing {skill_name} from {repo_url}...")

        if not os.path.exists(repo_dir):
            try:
                subprocess.run(["git", "clone", "--depth", "1", repo_url, repo_dir], check=True, capture_output=True)
                print(f"  Cloned repo.")
            except subprocess.CalledProcessError as e:
                print(f"  Failed to clone: {e.stderr.decode('utf-8', errors='ignore')}")
                continue
        else:
            print(f"  Repo already cloned.")

        # Determine source file path
        skill_path = entry.get("skillPath")
        if skill_path:
            src_file = os.path.join(repo_dir, skill_path)
            src_dir = os.path.dirname(src_file)
        else:
            # Fallback 1: look for SKILL.md in a folder matching the skill name
            src_dir = os.path.join(repo_dir, skill_name)
            src_file = os.path.join(src_dir, "SKILL.md")
            
            # Fallback 2: look inside a 'skills' subdirectory (e.g. repo/skills/skill_name)
            if not os.path.exists(src_file):
                src_dir = os.path.join(repo_dir, "skills", skill_name)
                src_file = os.path.join(src_dir, "SKILL.md")

            # Fallback 3: look at repo root
            if not os.path.exists(src_file):
                src_file = os.path.join(repo_dir, "SKILL.md")
                src_dir = repo_dir

        if not os.path.exists(src_file):
            print(f"  Could not find SKILL.md at {src_file}")
            continue

        # Target directory using SECTOR_MAP
        sector = SECTOR_MAP.get(skill_name, "misc")
        target_dir = os.path.normpath(os.path.join(GLOBAL_SKILLS, sector, skill_name))
        os.makedirs(target_dir, exist_ok=True)
        target_file = os.path.join(target_dir, "SKILL.md")

        # Copy files
        if src_dir == repo_dir:
            shutil.copy2(src_file, target_file)
            print(f"  Copied SKILL.md to {target_dir}")
        else:
            shutil.copytree(src_dir, target_dir, dirs_exist_ok=True)
            print(f"  Copied skill directory to {target_dir}")

    print("\nDone installing skills.")

if __name__ == "__main__":
    install_skills()

