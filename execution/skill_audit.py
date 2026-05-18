import os
import sys
import re
import json

def get_skills_dir():
    global_dir = os.path.abspath(os.path.expanduser("~/.gemini/skills"))
    local_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "skills"))
    return global_dir if os.path.exists(global_dir) else local_dir

def audit_skill_content(content):
    score = 0
    reasons = []

    # 1. Title Check (20 points)
    if re.search(r'^#\s+\S+', content, re.MULTILINE):
        score += 20
    elif re.search(r'^title:\s*\S+', content, re.IGNORECASE | re.MULTILINE):
        score += 10
        reasons.append("Missing primary H1 (# Title), used metadata title instead")
    else:
        reasons.append("Missing clear title")

    # Clean frontmatter and code blocks to evaluate description
    cleaned_content = re.sub(r'```[\s\S]*?```', '', content)
    cleaned_content = re.sub(r'---[\s\S]*?---', '', cleaned_content)

    # 2. Description Check (30 points)
    # Check for plain text introduction before list items
    lines = [line.strip() for line in cleaned_content.split('\n') if line.strip()]
    plain_text_lines = [l for l in lines if not l.startswith(('#', '-', '*', '1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.'))]
    
    total_plain_text_len = sum(len(l) for l in plain_text_lines)
    if total_plain_text_len >= 150:
        score += 30
    elif total_plain_text_len >= 50:
        score += 15
        reasons.append("Description is brief (under 150 characters)")
    else:
        reasons.append("Missing descriptive introduction section")

    # 3. Action Steps / SOP Procedure Check (50 points)
    # Count list items representing procedure steps
    steps = re.findall(r'^\s*[-*+]\s+\S+|^^\s*\d+\.\s+\S+', content, re.MULTILINE)
    step_count = len(steps)

    if step_count >= 5:
        score += 50
    elif step_count >= 3:
        score += 35
        reasons.append(f"Brief step procedure ({step_count} steps, recommended >= 5)")
    elif step_count >= 1:
        score += 20
        reasons.append(f"Insufficient execution steps ({step_count} step)")
    else:
        reasons.append("No execution steps or list-based SOP actions found")

    return score, reasons

def main():
    if sys.platform == "win32":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    skills_dir = get_skills_dir()
    print(f"[INIT] Scanning skill registry at: {skills_dir}")
    if not os.path.exists(skills_dir):
        print(f"[ERROR] Skills directory not found at {skills_dir}")
        sys.exit(1)

    logs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "logs"))
    os.makedirs(logs_dir, exist_ok=True)

    report_path = os.path.join(logs_dir, "audit_report.txt")
    failed_path = os.path.join(logs_dir, "audit_failed.txt")

    total_files = 0
    passed_files = 0
    failed_files = 0
    scores_by_sector = {}
    failures_by_sector = {}
    
    # Track details for report
    detailed_reports = []
    failed_reports = []

    for root, dirs, files in os.walk(skills_dir):
        for file in files:
            if file.endswith(".md"):
                total_files += 1
                path = os.path.join(root, file)
                rel_path = os.path.relpath(path, skills_dir)
                
                # Determine sector based on folder structure
                parts = rel_path.split(os.sep)
                sector = parts[0] if parts else "unknown"

                if sector not in scores_by_sector:
                    scores_by_sector[sector] = []
                    failures_by_sector[sector] = 0

                try:
                    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()

                    score, reasons = audit_skill_content(content)
                    scores_by_sector[sector].append(score)

                    status = "PASS" if score >= 70 else "FAIL"
                    if status == "PASS":
                        passed_files += 1
                    else:
                        failed_files += 1
                        failures_by_sector[sector] += 1
                        failed_reports.append({
                            "path": rel_path,
                            "sector": sector,
                            "score": score,
                            "reasons": reasons
                        })

                    detailed_reports.append({
                        "path": rel_path,
                        "sector": sector,
                        "score": score,
                        "status": status,
                        "reasons": reasons
                    })

                except Exception as e:
                    print(f"Error auditing {file}: {e}")

    # Write logs/audit_report.txt
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("=================================================================\n")
        f.write("                INDUSTRIAL SKILL REGISTRY AUDIT REPORT           \n")
        f.write("=================================================================\n\n")
        f.write(f"Total Skills Audited: {total_files}\n")
        f.write(f"Passed Completeness (>= 70): {passed_files}\n")
        f.write(f"Failed Completeness (< 70): {failed_files}\n\n")
        f.write("SECTOR SUMMARY:\n")
        f.write("-----------------------------------------------------------------\n")
        for sec, scores in scores_by_sector.items():
            avg_score = sum(scores) / len(scores) if scores else 0
            fails = failures_by_sector.get(sec, 0)
            f.write(f"Sector: {sec:<15} | Count: {len(scores):<5} | Avg Score: {avg_score:.2f}/100 | Failed: {fails:<4}\n")
        f.write("\nDETAILED MODULE LOG:\n")
        f.write("-----------------------------------------------------------------\n")
        for r in detailed_reports:
            reasons_str = "; ".join(r["reasons"]) if r["reasons"] else "None"
            f.write(f"[{r['status']}] {r['path']} | Score: {r['score']} | Issues: {reasons_str}\n")

    # Write logs/audit_failed.txt
    with open(failed_path, 'w', encoding='utf-8') as f:
        f.write("=================================================================\n")
        f.write("                FAILED SKILLS TARGET LIST (<70)                  \n")
        f.write("=================================================================\n\n")
        f.write(f"Total Action Items: {len(failed_reports)}\n\n")
        for r in failed_reports:
            f.write(f"File: {r['path']}\n")
            f.write(f"Sector: {r['sector']}\n")
            f.write(f"Score: {r['score']}/100\n")
            f.write("Deficiencies:\n")
            for reason in r["reasons"]:
                f.write(f" - {reason}\n")
            f.write("-----------------------------------------------------------------\n")

    # High-level stdout summary (purely structural, JSON format for parsability)
    summary = {
        "total_audited": total_files,
        "passed": passed_files,
        "failed": failed_files,
        "sector_averages": {sec: round(sum(scores)/len(scores), 2) for sec, scores in scores_by_sector.items() if scores},
        "sector_fails": failures_by_sector
    }
    print(json.dumps(summary))

if __name__ == "__main__":
    main()
