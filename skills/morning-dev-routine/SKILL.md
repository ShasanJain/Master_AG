---
name: morning-dev-routine
description: Automated daily engineering routine for repository sync, environment preflight, git log standup synthesis, and task prioritization.
metadata:
  tags: [automation, developer-workflow, git, daily-routine, productivity]
---

# Morning Developer Routine: Automated Workspace Triage & Standup Protocol

The morning developer routine protocol standardizes the first 15 minutes of every engineering work session. By deterministically inspecting git branches, uncommitted workspace diffs, external dependencies, and local support daemons, it eliminates morning context-switching friction and provides a structured daily agenda.

## ⚙️ Execution SOP

Follow this step-by-step procedure to perform morning workspace triage and standup generation:

- **Step 1: Workspace & Branch Synchronization**: Verify current working branch, pull latest upstream commits, and flag uncommitted local changes or stash collisions.
- **Step 2: Environment & Daemon Preflight**: Confirm necessary local background services (Docker containers, DB instances, Next.js servers, Ollama nodes) are running and responsive.
- **Step 3: Dependency & Security Audit**: Check lockfile integrity (`skills_lock_verify.py` or `npm audit`) to catch drifted dependencies or tampered binaries before feature work.
- **Step 4: Standup Synthesis & Telemetry**: Extract yesterday's commit logs across active repos and generate a concise 3-bullet standup summary of completed items.
- **Step 5: Prioritized Agenda Generation**: Cross-reference active sprint issues, directives, and open PRs to produce a ranked 3-item task agenda for the day.

## 💻 CLI Usage

Execute the automated triage runner:

```bash
# Full morning automated triage
python scripts/skill_cli.py triage

# Check repository and branch state
python scripts/skill_cli.py check-git

# Generate yesterday's standup summary
python scripts/skill_cli.py standup
```
