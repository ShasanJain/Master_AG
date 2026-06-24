---
name: autonomous-agent-loop
description: Use when executing long-running multi-iteration autonomous coding loops, stateful PRD story completions, and self-healing test-and-commit cycles.
---

# Autonomous Agent Loop: Execution Protocol

## ⚙️ Overview
This skill provides the operational profile and technical execution SOP for running autonomous multi-iteration coding loops (based on the Ralph pattern). It breaks large software requirements into context-isolated steps, executes them using a fresh context window on each turn, auto-runs tests, automatically commits passing code, and accumulates learnings across runs.

## 🛠️ Implementation SOP
- **Step 1: Baseline Context** — Verify dependencies: coding agent (Claude Code, Amp), git, `jq` or utility scripts. On Windows, use Git Bash or PowerShell loop configurations.
- **Step 2: Apply the Pattern** — Create a PRD (`tasks/prd-[name].md`), convert it to structured JSON (`prd.json`), and launch the loop script (`ralph.sh` or `ralph.ps1`).
- **Step 3: Enforce Constraints** — Restrict edits to a single `passes: false` user story per iteration. Run quality check suites (tests, lints, compile checks) and commit changes only when all checks pass.
- **Step 4: Execute Test Suite** — Verify git branch history, inspect `prd.json` states, and check `progress.txt` logs.
- **Step 5: Document and Commit** — Consolidate newly discovered conventions into `## Codebase Patterns` at the top of `progress.txt` and update directory `AGENTS.md` / `CLAUDE.md` files.

## 📚 Reference Material

### 1. The Iterative Handoff & State Storage
To handle tasks that exceed a single context window without state drift:
*   **Fresh Context**: Every iteration spins up a clean agent instance.
*   **prd.json Schema**: Keeps track of stories, priorities, and status:
    ```json
    {
      "branchName": "ralph/feature-name",
      "userStories": [
        { "id": "STORY-1", "title": "Add DB Migration", "priority": 1, "passes": false }
      ]
    }
    ```
*   **progress.txt**: Append-only log containing step progress and critical learnings for subsequent iterations.

### 2. Windows Native PowerShell Execution (ralph.ps1)
For Windows hosts without Git Bash, run this PowerShell script to coordinate the loop:
```powershell
param (
    [string]$Tool = "claude",
    [int]$MaxIterations = 10
)

$prdFile = "./scripts/ralph/prd.json"
$progressFile = "./scripts/ralph/progress.txt"

for ($i = 1; $i -le $MaxIterations; $i++) {
    Write-Host "======================================================="
    Write-Host "  Ralph Iteration $i of $MaxIterations ($Tool)"
    Write-Host "======================================================="

    if ($Tool -eq "claude") {
        $output = Get-Content "./scripts/ralph/CLAUDE.md" | claude --dangerously-skip-permissions --print 2>&1
    } else {
        $output = Get-Content "./scripts/ralph/prompt.md" | amp --dangerously-allow-all 2>&1
    }

    if ($output -match "<promise>COMPLETE</promise>") {
        Write-Host "Ralph completed all tasks!"
        break
    }
    Start-Sleep -Seconds 2
}
```

## 🔗 Related & Redundant Skills
- **`task-scheduler`**: Can be used to schedule and trigger the autonomous loop to run overnight or at scheduled intervals.
- **`agent-performance-engineer`**: Utilizes this loop to run iterative profiling and performance optimizations.
