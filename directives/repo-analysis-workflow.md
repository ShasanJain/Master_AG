# Repo Analysis Workflow

**Trigger:** When a user attaches or links a new GitHub repository and requests integration or analysis.

## Phase 1: Ingestion
1. **Clone to Scratchpad**: Never clone directly into the production source. Use the `run_command` tool to execute `git clone <URL> .tmp/<repo-name>`.
2. **Initial Scan**: Use `list_dir` to view the repository structure.

## Phase 2: Core Analysis
Use `view_file` to read the `README.md`, `package.json`, `pyproject.toml`, or `requirements.txt`.
Answer the following questions:
1. **Purpose**: What does this repository do? What problem does it solve?
2. **Requirements**: What are the OS, Hardware (GPU/CPU), and Software dependencies?
3. **Compatibility**: Does this run natively on the current host OS (e.g., Windows)? Does it require Linux, Docker, or heavy GPU compute that is not locally available?

## Phase 3: Skill Integration Strategy
Review the current `skills/` folder to determine the integration path.
1. **Compare**: Do we already have a skill that does something similar?
2. **Append vs. Create**: 
   - If the repository provides an incremental enhancement to an existing capability, **Append** it to the existing skill.
   - If it provides a wholly new capability (e.g., video rendering when we only have audio), **Create** a new skill.

## Phase 4: Reporting
Create a markdown Artifact (`repo_analysis_<name>.md`) presenting the findings to the user. Use the following format:
```markdown
# Repository Analysis: [Repo Name]

## 1. What it does
[Summary of purpose and capabilities]

## 2. Compatibility & Resources
- **OS/Hardware:** [Requirements]
- **Feasibility:** [Can we run this right now? Why or why not?]

## 3. Skills Integration
- **Existing Skills:** [Comparison to current capabilities]
- **Recommendation:** [Create NEW skill vs. Append to EXISTING skill]
- **Proposed Use Case:** [How it fits into the broader system]
```
Do NOT proceed with actual code integration until the user explicitly approves the analysis artifact.

## Phase 5: Meticulous Merge Protocol
Once the user approves the merge:
1. **Never do a lazy copy/overwrite.** Changes are made rarely but used regularly, so structural integrity is paramount.
2. **Stage the files:** Copy all incoming skills/files to a temporary `staging/` directory first.
3. **Deep Merge:** Load the staged file alongside the existing skill file. Manually read both, extract *only* the net-new concepts from the incoming file, and weave them carefully and seamlessly into the existing documentation.
4. **Generalize:** When creating new skills, rewrite their prompts to expand their scope beyond the original repository's narrow use-case, empowering them as system-wide primitives.
