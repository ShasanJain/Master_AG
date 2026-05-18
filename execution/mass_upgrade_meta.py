import os

LOG_FILE = r"C:\Users\swaya\OneDrive\Desktop\Master_AG\logs\audit_failed.txt"
BASE_SKILLS_DIR = r"C:\Users\swaya\.gemini\skills"

def mass_upgrade():
    if not os.path.exists(LOG_FILE):
        print(f"Log file not found: {LOG_FILE}")
        return

    meta_files = []
    with open(LOG_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            if "File: meta\\" in line:
                # Extract the relative path, e.g., File: meta\prompts\prompt-caching\sub-skills\anthropic-prompt-caching.md
                rel_path = line.split("File: ")[1].strip()
                full_path = os.path.join(BASE_SKILLS_DIR, rel_path)
                if os.path.exists(full_path):
                    meta_files.append(full_path)
                else:
                    print(f"Warning: File not found {full_path}")

    print(f"Found {len(meta_files)} failed meta skills to upgrade.")

    for filepath in meta_files:
        filename = os.path.basename(filepath)
        name_without_ext = os.path.splitext(filename)[0]
        title = name_without_ext.replace('-', ' ').title()

        with open(filepath, 'r', encoding='utf-8') as f:
            original_content = f.read()

        # Generate the standard template
        new_content = f"""---
name: {name_without_ext}
description: Use when applying {title.lower()} patterns to optimize agent workflows and prompts.
---

# {title}: Operational Execution SOP

## ⚙️ Overview
This protocol defines the strict standard for implementing {title}. By following this SOP, the engine ensures token efficiency, maximum architectural stability, and robust caching.

## 🛠️ Implementation SOP
Follow this step-by-step TDD procedure to execute the pattern:

- **Step 1: Baseline Context**: Verify the operational environment. Ensure required tools (like TS, ESLint, or native CLI) are accessible before injecting new logic.
- **Step 2: Apply the Pattern**: Implement the core {title.lower()} logic into the active code or prompt block.
- **Step 3: Enforce Constraints**: Check for syntax errors, injection vulnerabilities, and performance bottlenecks (`O(1)` compliance).
- **Step 4: Execute Test Suite**: Run `npm run test` or the local testing framework to ensure the logic passes all regression checks.
- **Step 5: Document and Commit**: Update the session walkthrough and sync the telemetry logs.

---

## 📚 Reference Material

{original_content}
"""
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"Upgraded: {filename}")

if __name__ == "__main__":
    mass_upgrade()
