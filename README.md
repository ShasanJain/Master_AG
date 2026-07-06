# Master-AG: Industrialized Agentic Engine (Jack-05)

High-performance, domain-centric AI workstation for automated production, quant finance backtesting, and full-stack software engineering. 

---

## 🏗️ Architecture & Core Domains

The workspace is organized into functional submodules and directories to minimize cognitive load, maximize retrieval speed, and establish deterministic execution:

- **`production/`**: Media Engines (React Remotion scripting, OpenMontage clip assembly, Edge-TTS).
- **`intelligence/`**: Memory vaults, vector indexers, and LLM council wrappers.
- **`engineering/`**: Multi-stack development workspaces, sandbox executors, and testing frameworks.
- **`ops/`**: Cloud orchestration, SEO auditors, and automated workflows.
- **`design/`**: Branding, UI/UX presets, and design tokens.
- **`security/`**: Attack tree analyzers, web injection tests, and AD threat models.

---

## 🕹️ The Cockpit Dashboard

Jack comes equipped with an interactive Next.js dashboard workspace to coordinate runs, monitor live console logs, and review generated assets:

- 📊 **Trading Agents Swarm:** Select tickers, debate rounds, and LLM backends to backtest quant debate firms.
- 📝 **OpenWiki Workspace:** Configure LLM providers, set prompt guides, compile codebase context, and view markdown wikis.
- 🎙️ **Audio & Reel Studio:** Render voiceovers using Edge-TTS or ONNX, generate visual scripts, and compile shorts.
- 💡 **Ideas Lab (Incubator):** Self-anneal workflows, debate design pillars, and run LLM council verification.
- 🧠 **Memory & Brain Map:** Synchronize neural nodes and audit the global skills registry.

---

## ⚡ Skills & Capabilities Registry

Jack leverages high-density sovereign modules to execute domain-specific tasks. The historical log and GitHub reference sheet can be found at **[SKILLS-JOURNEY.md](file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/SKILLS-JOURNEY.md)**.

### Primary Capabilites Map:
| Date | Module / Tool | Category | Key Capabilities |
| :--- | :--- | :--- | :--- |
| `2026-07-06` | **OpenWiki** | Code Intelligence / Docs | Compiles agent-optimized codebase documentation; writes `AGENTS.md` and `CLAUDE.md` context overrides. |
| `2026-07-02` | **Trading Agents** | Quant Swarms / Finance | Multi-agent financial consensus simulator running market, fundamental, news, and sentiment analyst nodes. |
| `2026-07-02` | **KittenTTS** | Local Audio / Synthesis | High-fidelity offline ONNX-compiled text-to-speech engine with speed and pitch controls. |
| `2026-07-02` | **Remotion & Hyperframes** | Video Assembly / Canvas | React-based video creation framework combined with headless Chrome Canvas frame-by-frame renders. |
| `2026-06-30` | **OpenMontage** | Media Pipelines | Video-generation script runner mapping automated outline structures, narration, and background assets. |
| `2026-06-29` | **Game Design** | Frameworks / Psychology | 61 structured guidelines outlining behavioral motivators, core loops, and design mechanics. |
| `2026-07-01` | **repo-analyzer** | Workspace Audit | Scans and generates Overview and Detailed repository audit markdown profiles. |

---

## 🚀 How to Fully Utilise Jack

To achieve peak productivity and unlock all capabilities, ensure the following local tools are installed and configured:

### 1. Ollama (Local AI Orchestration)
Many modules (e.g. Trading Agents, local OpenWiki runs) support local LLMs to avoid paid API costs.
- **Install:** Download and install [Ollama](https://ollama.com).
- **Run local models:**
  ```bash
  ollama pull gemma4:latest
  ollama pull llama3.2:latest
  ```
- **Port mapping:** Ensure Ollama runs locally on `http://localhost:11434/v1` (configured inside `.env`).

### 2. Node.js & Package Managers
- Required to run the Next.js Dashboard and local compilers.
- Ensure **Node.js >= 20** is installed.
- The dashboard is powered by `npm` (run `npm run dev` to start).
- Submodules like `openwiki` run via local `pnpm` or `npm install` packages.

### 3. Python Environment & UV
- Most core execution scripts run on Python.
- Install [uv](https://github.com/astral-sh/uv) to manage workspace environments and dependency locking securely.

### 4. Media & Assembly Tools
- For video generation (`/clip`) and transcription, ensure **FFmpeg** is added to the system PATH.
- Edge-TTS is used for high-fidelity multi-lingual voice generation in scripts.

---

_Powered by Antigravity IDE • Industrial Excellence_
