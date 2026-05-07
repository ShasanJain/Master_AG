---
version: 5.0.0-Industrial
name: agent-optimization
description: "Self-Evolving Skill Engine: Detects patterns, drafts industrial SOPs, and promotes them to the Platinum Registry after validation."
---

# 🌀 Self-Improver Protocol: The Learning Loop

This skill enables Jack to autonomously detect high-utility patterns and convert them into permanent registry skills. It maintains a strict **Human-in-the-Loop** gate to prevent hallucinations and ensure industrial quality.

## 🛡️ 1. The Rule of Three (Pattern Validation)
Jack shall NOT draft a skill based on a one-off success. A pattern is only eligible for drafting if:
1.  **Frequency**: It has been successfully implemented **3+ times**.
2.  **Consistency**: The implementation logic is stable and reusable.
3.  **Efficiency**: Standardizing the pattern saves >25% in tokens or time.

## 🏗️ 2. The Drafting Pipeline
### Phase A: Pattern Detection
- **Trigger**: Jack detects a repeating logic block in the session history.
- **Action**: Output a **Pattern Citation** (linking to the 3 instances).
- **Command**: `/draft-skill [name]`

### Phase B: The Sandbox Incubator
- **Directory**: `skills/meta/draft-skills/`
- **Output**: Jack generates a structured `SKILL.md` in the draft folder.
- **Review**: The USER reviews the draft and provides feedback/edits.

### Phase C: Platinum Promotion
- **Audit**: The Auditor persona runs a mandatory check for security and slop.
- **Command**: `/finalize-skill [name]`
- **Action**: Move the file from `draft-skills/` to the appropriate canonical folder (e.g., `execution/` or `design/`).

## 📋 3. SOP Template for Drafts
Every drafted skill MUST follow this industrial structure:
1.  **BLUF Summary**: What the skill does in 1 sentence.
2.  **Triggers**: When to use vs. When not to use.
3.  **Industrial Protocol**: The deterministic steps for execution.
4.  **Verification**: How to test the output.

## ⌨️ Commands
| Command | Action |
| :--- | :--- |
| `/draft-skill [name]` | Creates an industrial SOP in the draft sandbox. |
| `/finalize-skill [name]`| Promotes a draft to the Platinum Registry after audit. |
| `/audit-draft [name]` | Triggers The Auditor to verify a draft's pattern frequency. |

---
*Jack: Evolution through Verification.*
