#!/usr/bin/env python3
import os
import sys
import subprocess
import argparse
import urllib.request

def run_cmd(cmd):
    try:
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=True)
        return res.stdout.strip()
    except subprocess.CalledProcessError as e:
        return f"Error ({e.returncode}): {e.stderr.strip() or e.stdout.strip()}"

def check_git(output_file=None):
    print("=== [1/3] Git Workspace Status ===")
    branch = run_cmd("git branch --show-current")
    status = run_cmd("git status --short")
    print(f"Active Branch: {branch or 'Detached/Unknown'}")
    if status:
        print("Uncommitted Local Changes:")
        for line in status.split('\n')[:10]:
            print(f"  {line}")
    else:
        print("Working tree is completely clean.")
    
    if output_file:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(f"branch: {branch}\nstatus: {status or 'clean'}\n")

def check_env():
    print("\n=== [2/3] Local Daemon & Environment Preflight ===")
    print(f"Python: {sys.version.split()[0]}")
    node_v = run_cmd("node -v")
    print(f"Node.js: {node_v or 'Not found'}")
    
    # Check Ollama
    try:
        with urllib.request.urlopen("http://127.0.0.1:11434/api/tags", timeout=2) as r:
            print("Ollama Service: ONLINE (HTTP 200)")
    except Exception:
        print("Ollama Service: OFFLINE (localhost:11434 unreachable)")

    # Check Dashboard
    try:
        with urllib.request.urlopen("http://127.0.0.1:3000", timeout=2) as r:
            print("Jack Dashboard: ONLINE (http://localhost:3000)")
    except Exception:
        print("Jack Dashboard: NOT RUNNING on port 3000")

def standup():
    print("\n=== [3/3] Standup Synthesis (Last 24 Hours) ===")
    logs = run_cmd('git log --since="24 hours ago" --oneline')
    if logs:
        print("Recent Commit History:")
        for line in logs.split('\n'):
            print(f"  * {line}")
    else:
        print("No commits recorded in the last 24 hours.")

def main():
    parser = argparse.ArgumentParser(description="Morning Developer Routine Tool")
    sub = parser.add_subparsers(dest="command")
    
    sub.add_parser("triage", help="Run full morning triage checklist")
    
    cg = sub.add_parser("check-git", help="Check working branch & uncommitted diffs")
    cg.add_argument("--output", help="Optional output path")
    
    sub.add_parser("check-env", help="Verify daemons & runtime versions")
    sub.add_parser("standup", help="Summarize last 24hr commit logs")
    
    args = parser.parse_args()
    cmd = args.command or "triage"
    
    if cmd == "check-git":
        check_git(args.output)
    elif cmd == "check-env":
        check_env()
    elif cmd == "standup":
        standup()
    elif cmd == "triage":
        check_git()
        check_env()
        standup()

if __name__ == "__main__":
    main()
