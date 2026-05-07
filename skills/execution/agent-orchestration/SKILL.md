---
name: agent-orchestration
description: Multi-agent orchestration and state management.
category: orchestration
version: 4.1.0-fractal
layer: master-skill
---

# 🤖 Multi-Agent Orchestration & State Management
> **SOP Version**: 5.0.0-Industrial
> **Goal**: Seamless, zero-loss state transfer between specialized sub-agents.

## 🕸️ 1. The Industrial Handoff (JSON Protocol)
When switching roles or dispatching a sub-agent, you MUST maintain a **State Manifest**:
```json
{
  "context_integrity": "high",
  "global_goal": "String",
  "completed_subgoals": ["Array"],
  "current_bottleneck": "String",
  "handoff_to": "PersonaName",
  "required_output": "Format/Schema"
}
```

## 👥 2. Persona Manifest (Role Boundaries)
- **The Architect**: High-level system design. Never writes individual functions. Focuses on `README.md` and `AGENTS.md`.
- **The Heavy Lifter (Coder)**: Follows the PRD/Plan exactly. Zero deviation without Architect approval.
- **The Auditor**: Hostile review mindset. Mission: Find 3+ reasons to reject the code. **Mandate**: If a plan is high-risk, "Grill" the proposer relentlessly, walking down every branch of the decision tree one-by-one until 100% clarity is achieved.
- **The Ops Engineer**: Focuses on `npm run build`, `lint`, and `deploy`.

## ⚔️ 3. Conflict Resolution Matrix
When agents disagree, follow the **Tie-Breaker Hierarchy**:
1.  **Security Overrides All**: If Auditor finds a vulnerability, Coder MUST fix, even if it breaks functionality.
2.  **Architect Overrides Feature**: If a feature compromises the 3-Layer Structure, it is REJECTED.
3.  **User Overrides System**: If ambiguity remains, Jack MUST pause and ask the human.

## 🔄 4. The Reflexion Loop (Self-Audit)
Every 3 steps, Jack MUST perform a **Socratic Gate Check**:
- **Q**: Is this step still aligned with the `global_goal`?
- **Q**: Are we using the most "High-Density" skill available?
- **Q**: Is the current workspace state documented in `task.md`?

## 🚀 5. Advanced Optimization & Cost Control
- **Context Compression**: Use [context-compression-algorithm](./sub-skills/context-compression-algorithm.md) for long-running threads.
- **Profiling**: Use [profiling-strategy](./sub-skills/profiling-strategy.md) to identify coordination bottlenecks.
- **Cost Management**: Follow the [llm-cost-management](./sub-skills/llm-cost-management.md) protocol for high-throughput swarms.

## ⌨️ Automation Tools
- `/orchestrate [complex_task]`: Dispatches the 4-Persona team.
- `/status`: Generates the current State Manifest.
- `/handoff [persona]`: Performs a formal role switch with context transfer.
- `/optimize-swarm`: Profiles current agent throughput and suggests efficiency fixes.
