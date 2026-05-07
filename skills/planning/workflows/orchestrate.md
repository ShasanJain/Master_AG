description: Orchestrate a multi-agent swarm for complex, multi-domain tasks.

# /orchestrate - Industrial Swarm System
> **SOP Version**: 5.0.0-Industrial
> **Goal**: 100% mission success via parallel specialization.

---

## 🔴 THE CONSTITUTION OF ORCHESTRATION
1.  **Min 3 Agents**: Single-agent delegation is NOT orchestration.
2.  **Context Passing**: Every sub-agent MUST receive the original intent + the previous agent's JSON State Manifest.
3.  **Phase Separation**: Planning MUST be finalized before any execution agent is dispatched.

---

## 🟢 PHASE 1: Strategic Planning (Sequential)
**Agent**: `project-planner`
- **Task**: Create a detailed `implementation_plan.md` in the brain directory.
- **Gate**: Stop and wait for User Approval. **DO NOT PROCEED** without explicit confirmation.

## 🔵 PHASE 2: Swarm Execution & Parallel Routing
**Agent**: `swarm-master`
- **Dashboard**: Generate a `task.md` tracking all parallel threads.
- **Execution Matrix**:
  - **Group 0 (Intelligence)**: `browser-subagent` + `strategic-research`. (Harvesting realtime data/competitor intel).
  - **Group A (Architecture)**: `database-architect` + `security-auditor`. (Foundational hardening).
  - **Group B (Production)**: `full-stack-developer` + `ui-ux-pro-max`. (Building the feature).
  - **Group C (Polish)**: `performance-optimizer` + `seo-specialist`. (Final Vitals hardening).

## 🔴 PHASE 3: Systemic Review & Self-Healing
**Agent**: `quality-inspector`
- **Task**: Verify cross-component integration. Run `npm test` or equivalent.
- **Automation**: Trigger `security` and `audit` workflows for final sign-off.
- **Handoff**: Generate the unified `walkthrough.md`.

---

## 📋 Reporting Standards:
- **Swarm Report**:
  - Mission Objective Summary.
  - Active Agents + specific code contributions.
  - Verification results (Tests passed/failed).
  - Direct links to artifacts/deliverables.

---

## ⚠️ Critical Failure Modes (REJECT IF):
- `agent_count < 3`.
- Missing `implementation_plan.md` or `walkthrough.md`.
- No JSON state transfer between groups.
- Parallel agents editing the same line of code without a lock strategy.
