import os
import re

TARGET_DIR = r"c:\Users\swaya\OneDrive\Desktop\Master_AG"
EXCLUDE_DIRS = ['node_modules', '.git', '.next', 'scratch', 'graphify-out']

def contains_chinese(text):
    return bool(re.search(r'[\u4e00-\u9fff]', text))

def scan_files():
    found = []
    for root, dirs, files in os.walk(TARGET_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for file in files:
            if file.endswith('.py') or file.endswith('.ts') or file.endswith('.tsx') or file.endswith('.md') or file.endswith('.json'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        for i, line in enumerate(f):
                            if contains_chinese(line):
                                found.append((path, i+1, line.strip()))
                except Exception:
                    pass
    return found

if __name__ == '__main__':
    results = scan_files()
    if results:
        print(f"Found {len(results)} instances of Chinese characters.")
        for p, line_num, content in results[:20]:
            print(f"{p}:{line_num} -> {content}")
        if len(results) > 20:
            print("... (truncated)")
    else:
        print("No Chinese characters found in target files.")
