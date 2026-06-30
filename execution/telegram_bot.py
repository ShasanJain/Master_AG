import time
import requests
import json
import os
import subprocess

# Load .env file manually
for env_path in [".env", "../.env"]:
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                if "=" in line and not line.strip().startswith("#"):
                    key, val = line.strip().split("=", 1)
                    os.environ[key] = val

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
ALLOWED_USER_ID = os.environ.get("TELEGRAM_USER_ID")

def send_message(chat_id, text):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    requests.post(url, json={"chat_id": chat_id, "text": text})

def get_updates(offset=None):
    url = f"https://api.telegram.org/bot{TOKEN}/getUpdates"
    params = {"timeout": 30, "offset": offset}
    try:
        r = requests.get(url, params=params)
        return r.json().get("result", [])
    except Exception as e:
        print("Error getting updates:", e)
        return []

def main():
    if not TOKEN:
        print("Error: TELEGRAM_BOT_TOKEN env var not set")
        return
    offset = None
    print("Telegram bot started...")
    while True:
        updates = get_updates(offset)
        for update in updates:
            offset = update["update_id"] + 1
            message = update.get("message")
            if not message:
                continue
            chat_id = message["chat"]["id"]
            user_id = str(message["from"]["id"])
            
            if ALLOWED_USER_ID and user_id != ALLOWED_USER_ID:
                send_message(chat_id, "Unauthorized user.")
                continue
                
            text = message.get("text", "")
            if text.startswith("/start") or text.startswith("/help"):
                help_msg = (
                    "🤖 *Jack Mobile Gateway Commands*\n\n"
                    "• `/add_skill <subfolder>`\n"
                    "  Save a new skill. Format must include YAML frontmatter:\n"
                    "  `---` \n"
                    "  `name: my-skill` \n"
                    "  `description: detailed explanation` \n"
                    "  `---` \n"
                    "  `# Content...`\n\n"
                    "• `/list_skills` - View all active skill registry folders.\n"
                    "• `/search_skills <query>` - Search the registry for a specific skill.\n"
                    "• `/status` - Check Git status of the main repository and the skills database."
                )
                send_message(chat_id, help_msg)
                
            elif text.startswith("/list_skills"):
                skills_base = os.path.abspath(os.path.expanduser("~/.gemini/skills"))
                if not os.path.exists(skills_base):
                    send_message(chat_id, "Skills registry directory not found.")
                    continue
                
                folders = []
                for root, dirs, files in os.walk(skills_base):
                    if ".git" in root or "node_modules" in root:
                        continue
                    for f in files:
                        if f == "SKILL.md" or f.endswith("_skill.md"):
                            rel_dir = os.path.relpath(root, skills_base)
                            folders.append(rel_dir.replace("\\", "/"))
                
                if folders:
                    send_message(chat_id, "📁 *Skills Registry Categories:*\n\n" + "\n".join(f"• `{f}`" for f in sorted(folders)))
                else:
                    send_message(chat_id, "No skill modules found in the registry.")
                    
            elif text.startswith("/search_skills"):
                parts = text.split(maxsplit=1)
                if len(parts) < 2:
                    send_message(chat_id, "Usage: `/search_skills <query>`")
                    continue
                query = parts[1].lower()
                skills_base = os.path.abspath(os.path.expanduser("~/.gemini/skills"))
                results = []
                
                for root, _, files in os.walk(skills_base):
                    if ".git" in root: continue
                    for f in files:
                        if f == "SKILL.md" or f.endswith("_skill.md"):
                            path = os.path.join(root, f)
                            try:
                                with open(path, "r", encoding="utf-8") as file_obj:
                                    content = file_obj.read()
                                if query in content.lower() or query in path.lower():
                                    rel = os.path.relpath(path, skills_base).replace("\\", "/")
                                    results.append(rel)
                            except:
                                pass
                if results:
                    send_message(chat_id, f"🔍 *Found {len(results)} matching skills:*\n\n" + "\n".join(f"• `{r}`" for r in results))
                else:
                    send_message(chat_id, f"No skills found matching: `{query}`")
                    
            elif text.startswith("/status"):
                skills_base = os.path.abspath(os.path.expanduser("~/.gemini/skills"))
                main_base = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
                
                def get_git_status(path, name):
                    try:
                        res = subprocess.run(["git", "status", "-s"], cwd=path, capture_output=True, text=True, check=True)
                        out = res.stdout.strip()
                        return f"*{name}*:\n{out if out else 'Clean'}"
                    except Exception as e:
                        return f"*{name}* Error: {e}"
                
                msg = get_git_status(main_base, "Master_AG Repo") + "\n\n" + get_git_status(skills_base, "Skills Registry")
                send_message(chat_id, msg)
                
            elif text.startswith("/add_skill"):
                lines = text.split("\n")
                header = lines[0].split()
                if len(header) < 2:
                    send_message(chat_id, "Usage: /add_skill <relative/subfolder/path>\nFollowed by markdown content on new lines.")
                    continue
                subfolder = header[1]
                content = "\n".join(lines[1:])
                
                # Format Validation
                if not content.strip().startswith("---") or "name:" not in content or "description:" not in content:
                    send_message(chat_id, "❌ *Validation Failed*\nSkill content must contain valid YAML frontmatter (with 'name:' and 'description:') at the top.")
                    continue
                
                skills_base = os.path.abspath(os.path.expanduser("~/.gemini/skills"))
                dest_dir = os.path.join(skills_base, subfolder)
                os.makedirs(dest_dir, exist_ok=True)
                dest_file = os.path.join(dest_dir, "SKILL.md")
                
                with open(dest_file, "w", encoding="utf-8") as f:
                    f.write(content)
                    
                send_message(chat_id, f"Saved skill to: {subfolder}/SKILL.md. Committing changes...")
                
                try:
                    subprocess.run(["git", "add", "."], cwd=skills_base, check=True)
                    subprocess.run(["git", "commit", "-m", f"Add skill: {subfolder} via Telegram bot"], cwd=skills_base, check=True)
                    subprocess.run(["git", "push"], cwd=skills_base, check=True)
                    send_message(chat_id, "Pushed changes to GitHub successfully!")
                except Exception as e:
                    send_message(chat_id, f"Git error: {e}")
            else:
                send_message(chat_id, "Command not recognized. Send /help for instructions.")
        time.sleep(1)

if __name__ == "__main__":
    main()
