# Master-AG: Industrialized Agentic Engine (Jack)

Jack is a high-performance, domain-centric AI workstation and decision engine optimized for automated media production, quant finance debate simulations, local codebase intelligence, and MMORTS game planning.

---

## 🏗️ Architecture & Core Domains

The workspace structure partitions operational domains to maintain cognitive isolation, quick lookup speeds, and zero-error execution paths:

- **`dashboard/`**: Next.js (TypeScript) local command center running on `http://localhost:3000`.
- **`VillageOS/`**: MMORTS Travian optimizer containing the calculations layer, OCR screenshot parsers, and AppScript endpoints.
- **`production/`**: Automated narration and video synthesis pipelines (Remotion canvas, Edge-TTS, OpenMontage clip compilers).
- **`execution/`**: Deterministic Python backends handling map scraping, vector math, and quantitative simulations.
- **`extension/`**: Chrome browser extension for live overlay helpers and sandbox interactions.
- **`directives/`**: Standard Operating Procedures (SOPs) managing agent actions.
- **`skills/`**: Sovereign task-oriented skill modules and behavior parameters.

---

## 🕹️ Interactive Dashboard Features

Jack's Next.js dashboard integrates core workstation engines into a unified local interface:

### 1. 📊 Quant Trading Swarms
- Simulates analyst debates (market, fundamental, sentiment, news) to backtest stock ticker consensus.
- Evaluates multi-agent debate structures and logs live metrics.

### 2. 📝 OpenWiki Documentation
- Interrogates codebase directory structures and compiles agent-optimized markdown documentation.
- Automatically synchronizes memory overrides (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`).

### 3. 🎙️ Audio & Reel Studio
- Renders text scripts to offline high-fidelity voice narration using local ONNX or cloud APIs.
- Chains script generation to timeline video compilers for quick short-form reels.

### 4. 🏰 VillageOS (MMORTS Optimizer)
- **Screenshot AI Parser**: Vision-based container splits inputs (`dorf1`, `dorf2`, `heroAttrs`, `heroInv`) to extract building queues, resources, and inventory.
- **CP & Expansion Planner**: Computes slot milestones and Town Hall celebration cooldown counters based on speed variables:
  $$\text{Cooldown Hours} = \frac{\text{Base Cooldown}}{\text{Server Speed}} \times 0.96^{(\text{TH Level} - 1)}$$
- **Oasis & Cropper Finder**: Connects with live `x_world` databases via `find_croppers.py` to identify unoccupied 9c/15c tiles ranked by surrounding crop bonuses.

---

## ⚡ Setup & Prerequisites

To run Jack's full automation toolkit locally, ensure the following applications are configured:

### 1. Local LLM Host (Ollama)
Required to run offline consensus debates, code compilation, and council audits.
- Install [Ollama](https://ollama.com).
- Download model weight dependencies:
  ```bash
  ollama pull gemma4:latest
  ollama pull llama3.2:latest
  ```

### 2. Python Environment & UV
- Core backends run on Python 3.10+.
- Manage local dependency isolation and package lockfiles using [uv](https://github.com/astral-sh/uv).

### 3. Node.js & Playwright
- Runs the web portal and integration test suite (requires Node >= 20).
- Run dev server:
  ```bash
  cmd.exe /c npm run dev
  ``` (in `dashboard`)
- Run Playwright E2E UI verification checks:
  ```bash
  cmd.exe /c npx playwright test
  ```

---

## 🛠️ Workspace Refinement Roadmap

To keep Jack operating with peak efficiency, we adhere to the following refinement roadmap:

1. **E2E UI Test Coverage Expansion**: Integrate Playwright specs for Trading Agent debate prompts and OpenWiki configuration saves.
2. **Vision API Boundary Optimization**: Scaffolding local crop boundary helper scripts to trim images before cloud Vision ingestion.
3. **Dirty Submodule Cleanup**: Clean up dirty git states across subprojects (e.g. `ComfyUI`, `FinSwipe`) and retire outdated patch files (`_patch_*.py`).

---

_Powered by Antigravity IDE • Industrial Excellence_
