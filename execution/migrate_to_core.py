import os
import sys
import shutil
import subprocess

SRC = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DEST = r"c:\Users\swaya\OneDrive\Desktop\Master_AG_Core"

print(f"[MIGRATION] Source: {SRC}")
print(f"[MIGRATION] Destination: {DEST}")

# 1. Root configuration files
ROOT_FILES = [
    "CLAUDE.md",
    "AGENTS.md",
    "GEMINI.md",
    "skills-lock.json",
    ".gitignore",
    "REPO_ARCHITECTURE_AND_CLEANUP_REPORT.md",
]

for rf in ROOT_FILES:
    s_path = os.path.join(SRC, rf)
    d_path = os.path.join(DEST, rf)
    if os.path.exists(s_path):
        shutil.copy2(s_path, d_path)
        print(f"  + Copied root file: {rf}")

# 2. Directives (Layer 1 SOPs)
s_dir = os.path.join(SRC, "directives")
d_dir = os.path.join(DEST, "directives")
if os.path.exists(s_dir):
    if os.path.exists(d_dir):
        shutil.rmtree(d_dir)
    shutil.copytree(s_dir, d_dir)
    print(f"  + Copied directives/ ({len(os.listdir(d_dir))} SOPs)")

# 3. Config
s_cfg = os.path.join(SRC, "config")
d_cfg = os.path.join(DEST, "config")
if os.path.exists(s_cfg):
    if os.path.exists(d_cfg):
        shutil.rmtree(d_cfg)
    shutil.copytree(s_cfg, d_cfg)
    print("  + Copied config/")

# 4. Neural Memory Databases
db_src = os.path.join(SRC, "openmemory.db")
db_dest = os.path.join(DEST, "openmemory.db")
if os.path.exists(db_src):
    shutil.copy2(db_src, db_dest)
    print("  + Copied openmemory.db (Neural Vector Matrix)")

vault_src = os.path.join(SRC, "skill_vault")
vault_dest = os.path.join(DEST, "skill_vault")
if os.path.exists(vault_src):
    if os.path.exists(vault_dest):
        shutil.rmtree(vault_dest)
    shutil.copytree(vault_src, vault_dest)
    print("  + Copied skill_vault/ (Deep Lake Vector Vault)")

# 5. Execution Scripts (Layer 3 - Purged of Domain Bloat)
EXCLUDE_EXEC = {
    "find_croppers.py",
    "generate_villageos_sheets.py",
    "run_openwiki.py",
    "run_trading_agents.py",
    "fincept_bridge.py",
    "install_comfy_wan.py",
    "generate_role_onboarding.py",
    "migrate_to_core.py",
}

d_exec = os.path.join(DEST, "execution")
os.makedirs(d_exec, exist_ok=True)
s_exec = os.path.join(SRC, "execution")
copied_exec = 0
for f in os.listdir(s_exec):
    if f.endswith(".py") and f not in EXCLUDE_EXEC:
        shutil.copy2(os.path.join(s_exec, f), os.path.join(d_exec, f))
        copied_exec += 1
print(f"  + Copied execution/ ({copied_exec} deterministic engine scripts)")

# 6. Essential Skills ONLY (Exclude Game-Design and Catan)
ESSENTIAL_SKILLS = [
    "acestep",
    "elevenlabs",
    "ffmpeg",
    "frontend-design",
    "ltx2",
    "moviepy",
    "playwright-recording",
    "qwen-edit",
    "remotion",
    "remotion-official",
    "runpod",
    "autonomous-agent-loop",
    "document-visualization-evaluator",
    "html-to-video-orchestrator",
    "repo-analyzer",
    "package-skills",
    "ghost_cms",
    "openmontage",
    "3d-websites",
    "3d-websites-settings",
]

s_skills = os.path.join(SRC, "skills")
d_skills = os.path.join(DEST, "skills")
os.makedirs(d_skills, exist_ok=True)

copied_skills = 0
for sk in ESSENTIAL_SKILLS:
    src_sk = os.path.join(s_skills, sk)
    dest_sk = os.path.join(d_skills, sk)
    if os.path.exists(src_sk):
        if os.path.exists(dest_sk):
            shutil.rmtree(dest_sk)
        shutil.copytree(src_sk, dest_sk)
        copied_skills += 1
print(f"  + Copied skills/ ({copied_skills} essential media, audio, video, UI modules; 0 game-design bloat)")

# 7. Dashboard (Jack Command Center - Excluding node_modules and .next)
d_dash = os.path.join(DEST, "dashboard")
s_dash = os.path.join(SRC, "dashboard")

def ignore_dash(dir, files):
    return [f for f in files if f in ("node_modules", ".next", ".git", "test-results")]

if os.path.exists(s_dash):
    if os.path.exists(d_dash):
        shutil.rmtree(d_dash)
    shutil.copytree(s_dash, d_dash, ignore=ignore_dash)
    print("  + Copied dashboard/ (Jack Command Center source code)")

# 8. Logs directory
os.makedirs(os.path.join(DEST, "logs"), exist_ok=True)

print("\n[MIGRATION SUCCESS] Master_AG_Core sanctuary successfully assembled!")

