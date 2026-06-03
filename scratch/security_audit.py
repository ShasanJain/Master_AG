import os
import re

TARGET_DIRS = [r"c:\Users\swaya\OneDrive\Desktop\Master_AG\execution", r"c:\Users\swaya\OneDrive\Desktop\Master_AG\ops"]

# Basic vulnerability patterns
PATTERNS = {
    "Eval Used": r"\beval\(",
    "Exec Used": r"\bexec\(",
    "OS System Call": r"os\.system\(",
    "Subprocess Shell=True": r"subprocess\.(call|run|Popen).*shell\s*=\s*True",
    "Disabled SSL Verification": r"requests\.(get|post).*verify\s*=\s*False",
    "Hardcoded API Key": r"(api_key|api_secret|password|secret|token)\s*=\s*['\"][A-Za-z0-9_-]{10,}['\"]"
}

def audit_files():
    issues = []
    for d in TARGET_DIRS:
        if not os.path.exists(d): continue
        for root, dirs, files in os.walk(d):
            for file in files:
                if file.endswith('.py'):
                    path = os.path.join(root, file)
                    try:
                        with open(path, 'r', encoding='utf-8') as f:
                            for i, line in enumerate(f):
                                for issue_type, pattern in PATTERNS.items():
                                    if re.search(pattern, line, re.IGNORECASE):
                                        issues.append((path, i+1, issue_type, line.strip()))
                    except Exception:
                        pass
    return issues

if __name__ == '__main__':
    print("--- Security Audit Report ---")
    issues = audit_files()
    if issues:
        print(f"Found {len(issues)} potential security issues:\n")
        for p, line_num, issue_type, content in issues:
            print(f"[{issue_type}] {os.path.basename(p)}:{line_num} -> {content}")
    else:
        print("No high-level vulnerabilities detected. Codebase appears safely controllable.")
