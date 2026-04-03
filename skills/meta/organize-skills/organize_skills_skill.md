---
name: organize-skills
description: Dynamically scans the root skills directory for newly imported, flat folders and intelligently categorizes them into our 8-folder nesting structure. Use when asked to organize skills, declutter the workspace, or after importing new skills from github or the skills.sh registry.
license: MIT
---

# Organize Skills

## Overview
This is a critical "meta-skill" designed to preserve Agent Search Optimization (ASO) and file tree cleanliness. The `skills/` workspace relies on an 8-folder nested architecture. Whenever a user or agent dynamically imports a new skill via `git clone` or `npx skills`, it often lands as a "flat" folder in the root `skills/` directory, causing clutter. Furthermore, third-party skills often use the hardcoded `SKILL.md` filename, which we replace with fluid `[folder_name]_skill.md` names. This skill empowers you to detect, analyze, rename, and relocate those rogue folders instantly.

## The 8 Canonical Folders (Target Destinations)
1. `google/` (Vendor: Google Workspace integrations, recipes, API wrappers)
2. `figma/` (Vendor: Figma MCPs, code-connect, generation tools)
3. `design/` (Function: Aesthetics constraints, Shadcn, architecture design rules)
4. `planning/` (Function: PRDs, brainstorming, spec documentation, issue mapping)
5. `review/` (Function: Debugging, QA, GitHub triage, verification steps)
6. `environment/` (Function: Pre-commits, git guardrails, MCP/Claude integrations)
7. `meta/` (Function: Agent self-management, finding/writing/organizing skills)
8. `execution/` (Function: TDD loops, script compilers, file editors, parallel agents)

## Execution Workflow

When invoked to "organize skills" or "clean the workspace", follow these steps strictly:

### Step 1: Broad Scan
Run a `list_dir` on the `skills/` directory.

### Step 2: Isolation
Identify any folders present that are NOT on the canonical list of 8 above. (Ignore files like `.DS_Store`).

### Step 3: Contextual Analysis
For every rogue folder discovered:
1. `view_file` on its interior markdown file (usually `SKILL.md`) to rapidly assess its YAML description.
2. Intellectually map its primary utility to the single best-fitting Canonical Folder.

### Step 4: Fluid Rename
Before moving, rename the main `SKILL.md` file inside the new folder to strictly match: `[folder_name]_skill.md` (converting hyphens to underscores).

### Step 5: The Cleanup Sweep
Construct a single, efficient terminal command (Powershell on Windows) linking all the `Move-Item` instructions at once. Ensure you use `-Force` and `-ErrorAction SilentlyContinue` to avoid stopping on minor hiccups. Wait for the command to return successfully.

### Step 6: Verification & Log Updates
Run `list_dir` on `skills/` to guarantee the root scope has reverted to exactly 8 categorical folders. 
**Crucial Requirement**: If successful, you MUST update the `artifacts/skills_summary.md` artifact to include the names of the newly nested tools so the user can easily reference them later.

## Exceptions
If the user explicitly requests you to create a *brand new* canonical category, you may do so. You must then edit *this* `organize-skills/SKILL.md` file to add the 9th canonical folder to the reference list above.
