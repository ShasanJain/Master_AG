# 🌐 Onboarding Guide: Backend Developer at Jack Quant Swarm

Welcome to **Jack Quant Swarm**! This document provides a highly detailed, role-specific onboarding breakdown mapping the tools, repositories, configurations, and schedules you need to start operating immediately.

---

## 🎯 1. Core Responsibilities & Operations
As a member of our team, your primary tasks focus on keeping execution lines operating with zero errors. Your core daily operational loops include:

*   **Maintaining the quantitative trading agent simulation algorithms and consensus nodes:**  You will optimize the analyst node communication paths, integrate local LLM providers (Ollama), and refine prompt engineering logic.
*   **Optimizing semantic graph database operations and indexing logic:**  You will maintain the AST relationship parser (graphify), keep the `graph.json` index up to date, and build semantic retrieval routes.
*   **Developing and testing robust API routers and background tasks:**  You will write clean, well-documented FastAPI endpoints, manage database health/vacuum processes, and run integration validation suites.

---

## 🛠️ 2. Tooling, Script References & Workspace Access
You will interact directly with these specific codebase directories. Please ensure you familiarize yourself with their folder paths and run commands:

### 📂 [Consensus Simulation (trading-agents)](file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/trading-agents)
**Description:** Multi-agent consensus framework running analyst nodes to debate stock values.

**Execution Reference Commands:**
```bash
python execution/run_trading_agents.py --ticker AAPL --rounds 3
```

### 📂 [Knowledge Graph (graphify)](file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/graphify-out)
**Description:** AST relationship parser and query CLI used to build codebase maps.

**Execution Reference Commands:**
```bash
graphify query "explain vector memory"
graphify update .
```

### 📂 [OpenWiki Integration](file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/openwiki)
**Description:** Agentic documentation compiler and sidebar configurations.

**Execution Reference Commands:**
```bash
python execution/run_openwiki.py --provider openai --update
```

---

## 🔑 3. Configuration & Environment Variables
You must configure a local `.env` file in the project root containing these variables. Coordinate with your team leader to obtain valid tokens:

| Variable Key | Purpose & Integration | Expected Format / Default |
| :--- | :--- | :--- |
| `OLLAMA_URL` | The local Ollama server address (default: http://localhost:11434). | Configured in local `.env` |
| `OLLAMA_MODEL` | The local model identifier used for agent inference (default: llama3.2). | Configured in local `.env` |
| `OPENAI_API_KEY` | Primary OpenAI key used for production grade consensus runs. | Configured in local `.env` |
| `OM_DATABASE_URL` | Sqlite database location path for local vector database memory. | Configured in local `.env` |

---

## 📅 4. The First 30 Days Roadmap
Follow this phased roadmap to ensure you align with our performance expectations during your first month:

### 🗓️ Days 1-5: Workspace & AST Setup
- [ ] Install Python dependencies, Node, and ensure Ollama runs locally.
- [ ] Initialize the knowledge graph with graphify update . to index all nodes.
- [ ] Run the local database validation script: python execution/db_health.py.

### 🗓️ Days 6-15: Consensus API Integration
- [ ] Configure custom analyst prompts inside the tradingagents directory.
- [ ] Verify that local Ollama models run queries without timing out.
- [ ] Expose simulation logs to the dashboard page.

### 🗓️ Days 16-30: Scaling & Documentation
- [ ] Add automated unit tests for trading agent state consensus.
- [ ] Compile updated codebase wikis using openwiki.
- [ ] Verify design patterns against AGENTS.md before main branch merge.

---

## 📈 5. Quality Gates & Success Standards
Before submitting any task, you must enforce the following checks:

1.  **Directives Check:** Ensure your execution results align with the standard operating procedures under [directives/](file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/directives).
2.  **Lint & Verify:** Run syntax audits: `npm run lint` or `pytest` locally depending on the module stack.
3.  **Git Branch Rule:** Never commit directly to the `main` branch. Create a new branch prefixed with your role or feature area (e.g. `feature/backend-opt`).

---

## ☎️ 6. Support Contacts & HR Policies
If you encounter any roadblock, please reach out to the appropriate contact:

| Contact Persona | Name | Email | Direct Line / Slack |
| :--- | :--- | :--- | :--- |
| **Team Lead / Manager** | Sarah Jenkins | s.jenkins@jackquantswarm.com | +1 (555) 019-2834 / `@SarahJ` |
| **HR Operations** | David Vance | d.vance@jackquantswarm.com | +1 (555) 014-9988 / `@DavidV` |
| **IT Helpdesk Support** | Tech Support Team | support@jackquantswarm.com | Slack: `#helpdesk-support` |

### 📜 Corporate Documentation & Handbooks
*   **[Corporate HR Policies Guide](file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/docs/hr/policies.md):** Information on leave policies, holidays, benefits, and standard conduct codes.
*   **[Workspace Security Handbook](file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/docs/hr/security_handbook.md):** Password management policies, environment file handling, and code compilation policies.
