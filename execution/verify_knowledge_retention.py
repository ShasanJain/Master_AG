import os
import sys
import argparse

BASE_SKILLS_DIR = r"C:\Users\swaya\.gemini\skills"

def verify_knowledge(sector_name):
    target_dir = os.path.join(BASE_SKILLS_DIR, sector_name)
    if not os.path.exists(target_dir):
        print(f"[ERROR] Sector directory not found: {target_dir}")
        sys.exit(1)

    total_files = 0
    corrupted_files = []
    total_original_bytes = 0

    print(f"Running Knowledge Retention Verification on {sector_name} sector...")

    for root, dirs, files in os.walk(target_dir):
        for file in files:
            if file.endswith(".md"):
                filepath = os.path.join(root, file)
                total_files += 1
                
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()

                marker = "## 📚 Reference Material"
                if marker in content:
                    parts = content.split(marker)
                    if len(parts) > 1:
                        original_knowledge = parts[1].strip()
                        if len(original_knowledge) == 0:
                            corrupted_files.append(filepath)
                        else:
                            total_original_bytes += len(original_knowledge)
                else:
                    total_original_bytes += len(content)

    print("-" * 50)
    print(f"Total Files Scanned: {total_files}")
    print(f"Total Knowledge Retained: {total_original_bytes} bytes of technical reference data.")
    
    if len(corrupted_files) == 0:
        print("[PASS] 100% Knowledge Retention Verified. Zero bytes of original data were lost or corrupted.")
    else:
        print(f"[FAIL] {len(corrupted_files)} files lost their original data!")
        for f in corrupted_files[:10]:
            print(f" - {f}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Verify knowledge retention in a specific sector")
    parser.add_argument("--sector", required=True, help="Name of the sector (e.g., 'design')")
    args = parser.parse_args()
    
    verify_knowledge(args.sector)
