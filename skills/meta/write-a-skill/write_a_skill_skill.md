---
name: write-a-skill
description: Use when creating new agent skills, editing existing agent skills, or verifying that skills work properly before deployment.
---

# Writing Skills

## Overview

**Writing skills IS Test-Driven Development applied to process documentation.**

Personal skills live in the workspace `skills/` directory. You write test cases (pressure scenarios), watch them fail, write the skill documentation (like `[skill_name]_skill.md`), watch tests pass, and refactor (close loopholes).

**Core principle:** If you didn't watch the agent fail without the skill, you don't know if the skill teaches the right thing.

## Process & Structure
1. **Gather requirements** - ask the USER about the domain, use cases, and reference availability.
2. **Draft the skill** - create `[skill_name]_skill.md` (replacing hyphens with underscores) and keep it concise.
3. **Review with user** - present draft and ask for confirmation.

```
skill-name/
├── [skill_name]_skill.md      # Main instructions (required)
├── REFERENCE.md               # Detailed docs (if needed > 500 lines)
├── EXAMPLES.md                # Usage examples
└── scripts/           # Utility scripts (for deterministic tasks)
```

## Agent Search Optimization (ASO)

The description block is **the only thing the agent sees** when deciding which skill to load. 

**Goal**: Give the agent enough info to know when/why to trigger the skill (symptoms, contexts). 
**Format**: Max 1024 chars, Third person, First sentence what it does, Second sentence "Use when [triggers]". **NEVER summarize the workflow**.

```yaml
# ❌ BAD: Summarizes workflow
description: Use when executing plans - dispatches subagent per task with code review
# ✅ GOOD: Just triggering conditions
description: Use when executing implementation plans with independent tasks in the current session
```

## The Iron Law of Skills

```
NO SKILL WITHOUT A FAILING TEST FIRST
```

Write the skill to directly address the rationalizations the agent uses during the failing "baseline" test. Close loopholes explicitly.

## Example SKILL.md Frontmatter Template

```md
---
name: skill-name-with-hyphens
description: Use when [specific triggering conditions and symptoms].
---
# Skill Name
## Overview
[Core principle]
## Core Pattern / Quick Start
[Concrete examples and workflow]
```
