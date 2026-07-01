---
name: repo-analyzer
description: >
  Standardized repository analysis workflow to generate overview, feasibility, and agent-skill integration reports.
  Produces reports matching the 'Repository Analysis' template.
---

# Repository Analysis Skill

Use this skill when the user requests a "repository analysis report", "analyze repo", "feasibility check on repo", or similar analysis for any codebase.

## 1. Output Format Contract

Every repo analysis report must follow the structures below.

### Option A: Basic Overview (Default)

```markdown
# Repository Analysis: [Repo Name]

## 1. What it does
[Provide a clear, high-level summary of what the repository does, what problem it solves, and its core features/mechanisms.]

## 2. Compatibility & Resources
-   **OS/Hardware:** [List compatible OS, architectures, and performance profiles]
-   **Dependencies:** [List essential packages, languages, runtimes, and external dependencies]
-   **Feasibility:** [Analyze the ease of local setup, environment constraints (e.g. Windows/macOS support), and build steps]

## 3. Skills Integration
-   **Existing Skills:** [Compare with current workspace skills to check for overlap or redundancy]
-   **Recommendation:** [Specify whether to create a new skill, extend an existing one, or map to a new plugin]
-   **Global Subfolder:** [Recommended subfolder inside the agent's customization directory]
-   **Proposed Use Case:** [Primary action-value trigger for the agent workspace]
```

### Option B: Detailed Version (Triggered on 'detailed analysis' or large repos)

Add the following sections after Section 3:

```markdown
## 4. Architecture & Data Flow
[Explain the directory structure, main entry points, module relationships, and execution timeline.]

## 5. Implementation Roadmap
-   **Phase 1 (Setup & Validation):** First steps to run tests locally.
-   **Phase 2 (Porting / Integration):** How to package the code as executable scripts in `execution/`.
-   **Phase 3 (Testing & Automation):** Diagnostic integration.

## 6. Risks & Limitations
-   [API rate limits, licensing boundaries, platform locks, or security considerations.]
```

## 2. Step-by-Step Workflow

1. **Locate Target Code**: If target repository is cloneable, clone it to `.tmp/repo-analysis-target/` to analyze contents locally.
2. **Scan Codebase**: Parse top-level directories, look for configuration files (e.g. `package.json`, `requirements.txt`, `Cargo.toml`), and inspect setup/installation docs.
3. **Formulate Feasibility**: Evaluate setup complexity, runtimes, and platform compatibility (specifically native Windows Command Prompt/PowerShell feasibility vs. bash/WSL).
4. **Skills Matching**: Compare the codebase's main utility with skills registered in `skills/skills.json` and standard plugin folders to find overlaps.
5. **Write Report**: Generate the markdown report to the workspace root or requested output path. Clean up any temporary clones.
