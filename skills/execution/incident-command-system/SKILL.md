---
version: 5.0.0-Industrial
name: incident-command-system
description: Expert SRE Incident Command System (ICS). Use when managing active outages, triaging production failures, or leading incident response swarms.
---

# 🚨 Incident Command System (ICS)
> **SOP Version**: 5.0.0-Industrial
> **Goal**: Rapid service restoration via structured coordination.

## 👨‍✈️ 1. The Command Structure
When an incident is declared, Jack MUST assign these roles immediately:
- **Incident Commander (IC)**: Holds the "Conch". Focuses on strategy and roadblocks. Does NOT touch code.
- **Ops Lead**: The primary engineer implementing fixes and rollbacks.
- **Comms Lead**: Maintains the 15-min update cadence for stakeholders.

## 🔄 2. The Hypothesis Loop (Diagnostic Protocol)
1.  **Detection**: Map SLI/SLO alerts to system components.
2.  **Symptom Mapping**: Start with error symptoms and work backward to the cause.
3.  **Log Triage**: Use regex patterns to extract stack traces; correlate errors with recent deployments.
4.  **Correlation**: Check for cascading failures across distributed services.
5.  **Isolation**: Use logs, traces, and metrics to isolate the fault.
6.  **Mitigation**: Rollback ➡️ Hotfix ➡️ Failover. **Safety First.**
7.  **Validation**: Verify recovery with automated health checks.

## 📋 3. Operational Gates
- **REQUIRED SUB-SKILL**: Use [incident-runbook-templates](../incident-runbook-templates/SKILL.md) for step-by-step procedures.
- **REQUIRED SUB-SKILL**: Use [postmortem-writing](../postmortem-writing/SKILL.md) after resolution.

## 🛡️ 4. Anti-Patterns
- **❌ Panic Fixes**: Never apply a fix without a reversible plan.
- **❌ Comms Blackout**: Silence > 15 mins during P0 is a failure.
- **❌ Blame Culture**: Focus on "Why the system allowed the failure," not "Who did it."

## 🧠 Knowledge Modules (Fractal Skills)

### 1. [Incident Management Lifecycle](./sub-skills/1-incident-detection-and-classification.md)
### 2. [Observability & Triage](./sub-skills/2-observability-analysis.md)
### 3. [Advanced Debugging](./sub-skills/4-deep-system-debugging.md)
### 4. [System Hardening](./sub-skills/15-system-hardening.md)
