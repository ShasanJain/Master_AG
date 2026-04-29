---
name: professions
description: Map 150+ skills to logical profession bundles. Use to quickly identify relevant skill sets for specific roles without restricting access to the full library.
---

# Profession-Based Skill Bundles

Use this skill to identify the most relevant tools for a specific persona. These bundles are suggestions to optimize focus, not restrictions.

## 1. Full-Stack Product Engineer
*Core Goal: Deliver end-to-end features with high quality.*
- **Planning:** `prd_to_plan`, `write_a_prd`
- **Frontend:** `react`, `nextjs`, `tailwind`, `shadcn`
- **Backend:** `mysql`, `postgres`, `typescript`
- **QA:** `playwright`, `qa`, `systematic_debugging`

## 2. Data & AI Architect
*Core Goal: Scale data infrastructure and implement AI search.*
- **Databases:** `postgres` (pgvector), `mysql` (Vitess), `partitioning`
- **Analytics:** `analytics-reporting`, `chart-visualization`
- **Operations:** `gws-sheets`, `db_health_checks`

## 3. UI/UX Design Technologist
*Core Goal: Build pixel-perfect, accessible design systems.*
- **Design:** `figma-implement-design`, `inclusive-design`, `animations`
- **Styling:** `tailwind`, `web-design-guidelines`
- **Tools:** `figma-code-connect`

## 4. Technical Product Manager (TPM)
*Core Goal: Bridge business requirements and technical execution.*
- **Documents:** `write_a_prd`, `to_prd`, `ubiquitous_language`
- **Triage:** `github_triage`, `prd_to_issues`
- **Meetings:** `gws-calendar-agenda`, `gws-workflow-meeting-prep`

## 5. Automation & Ops Specialist
*Core Goal: Eliminate manual toil through workflow automation.*
- **Automations:** `gws-workflow`, `gws-script`, `slack-gif-creator`
- **Communications:** `gws-gmail-triage`, `gws-chat-send`
- **System:** `setup-pre-commit`, `git-guardrails`

## 6. Growth & Marketing Strategist
*Core Goal: Amplify brand reach and content consistency.*
- **Brand:** `brand-guardian`, `brand-voice`
- **Content:** `press-release`, `media-pitch`, `content-strategist`
- **Reporting:** `analytics-reporting`

## 7. Database Administrator (DBA)
*Core Goal: Maintain database health, performance, and integrity.*
- **Monitoring:** `db_health_checks`, `replication-lag`, `isolation-levels`
- **Maintenance:** `index-maintenance`, `deadlocks`, `online-ddl`

---

## Loading Protocol
1. User identifies a persona (e.g., "I'm acting as a DBA").
2. Agent prioritizes rules from the corresponding bundle.
3. ALL other 150+ skills remain active and available for cross-domain tasks.
