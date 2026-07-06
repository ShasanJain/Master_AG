# Repository Analysis: OpenWiki

## 1. What it does
OpenWiki is an open-source CLI tool built to generate and maintain structured codebase documentation (in `/openwiki`) tailored specifically for AI coding agents to read. It automatically constructs context-optimized files, updates top-level instruction files (`AGENTS.md` and `CLAUDE.md`), and prevents documentation drift via automated runs (e.g., CI/CD).

## 2. Compatibility & Resources
- **OS/Hardware:** Cross-platform (Windows, macOS, Linux). Requires Node.js >= 20.
- **Dependencies:** Built with React/Ink for interactive CLI rendering, LangChain (`@langchain/core`, `@langchain/openai`, `@langchain/anthropic`, `@langchain/openrouter`), `deepagents` SDK, and SQLite for persistence.
- **Feasibility:** High feasibility. Can be easily run locally using `npm run dev` or packaged via `npm run build`. Set up instructions require provider API keys (OpenAI, Anthropic, Fireworks, OpenRouter, etc.).

## 3. Skills Integration
- **Existing Skills:** Overlaps with workspace knowledge graph and code analysis features.
- **Recommendation:** Can be packaged as a custom workflow or plugin to automatically maintain the workspace knowledge graph or run local doc updates.
- **Global Subfolder:** `skills/openwiki`
- **Proposed Use Case:** Auto-generating context logs for LLM coding agents.

## 4. Architecture & Data Flow
- **CLI Layer:** [cli.tsx](file:///.tmp/repo-analysis-target/src/cli.tsx) (built on Ink) handles the interactive terminal UI and credential collection.
- **Environment & Configuration:** [env.ts](file:///.tmp/repo-analysis-target/src/env.ts) handles loading/saving credentials to `~/.openwiki/.env`.
- **Agent Core:** [index.ts](file:///.tmp/repo-analysis-target/src/agent/index.ts) runs the LangGraph/LangChain agent utilizing the `deepagents` sdk, reading file structure, executing shell commands for Git history, and generating/updating markdown files in `openwiki/`.
- **System Prompts:** [prompt.ts](file:///.tmp/repo-analysis-target/src/agent/prompt.ts) outlines strict rules for file discovery, planning (via temporary `_plan.md`), subagent usage, and `AGENTS.md` update blocks.

## 5. Implementation Roadmap
- **Phase 1 (Setup & Validation):** Run `pnpm install` and `npm run test` or `vitest` to run tests locally.
- **Phase 2 (Porting / Integration):** Use or adapt the core agent files in `src/agent` to generate documentation within other target repositories.
- **Phase 3 (Testing & Automation):** Set up GitHub action scripts to keep the documentation current on codebase edits.

## 6. Risks & Limitations
- **Token Usage / Cost:** Inspecting large repositories can consume considerable LLM tokens.
- **Rate Limits:** Depends on external LLM provider API limits.
- **Access Scope:** The agent executes shell commands and has filesystem read/write access.
