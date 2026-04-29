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

## 6. SEO & Content Marketer
*Core Goal: Optimize search visibility and content performance.*
- **Performance:** `analytics-reporting`, `brand-guardian`
- **Strategy:** `content-strategist`, `edit-article`
- **GWS:** `gws-sheets` (for keyword tracking)

## 7. Copywriter & Creative Lead
*Core Goal: Craft compelling, brand-aligned narratives.*
- **Voice:** `brand-voice`, `brand-guardian`
- **Production:** `gws-docs`, `edit-article`
- **Ideation:** `brainstorming`

## 8. Media & PR Specialist
*Core Goal: Manage public relations and media outreach.*
- **Outreach:** `media-pitch`, `press-release`
- **Communication:** `gws-gmail-send`, `gws-chat`
- **GWS:** `gws-docs` (for press kits)

## 9. Economic & Strategic Analyst
*Core Goal: Drive decisions through data-backed market analysis.*
- **Insights:** `chart-visualization`, `analytics-reporting`
- **Decisioning:** `tradeoff-analysis`, `zoom-out`
- **Tools:** `gws-sheets`, `gws-slides`

## 10. Software Architect
*Core Goal: Define robust system structures and navigate technical trade-offs.*
- **Strategic:** `prd-to-plan`, `ubiquitous-language`
- **Analysis:** `tradeoff-analysis`, `zoom-out`
- **Review:** `diagnose`, `request-refactor-plan`

## 11. Security & Compliance Engineer
*Core Goal: Safeguard data and ensure model/code safety.*
- **Safety:** `gws-modelarmor`, `gws-modelarmor-sanitize-prompt`
- **Audit:** `gws-admin-reports`, `git-guardrails`
- **Diagnosis:** `diagnose`

## 12. Customer Success / Support
*Core Goal: Resolve user issues and maintain community engagement.*
- **Tickets:** `gws-gmail-triage`, `gws-gmail-reply`
- **Chat:** `gws-chat-send`, `slack-gif-creator`
- **Users:** `gws-people`

## 13. HR & People Operations
*Core Goal: Manage talent, onboarding, and organizational culture.*
- **Directory:** `gws-people`, `gws-classroom`
- **Admin:** `gws-calendar`, `gws-tasks`
- **Policy:** `gws-docs-write`

## 14. Instructional Designer / Educator
*Core Goal: Develop curriculum and facilitate learning experiences.*
- **Learning:** `gws-classroom`, `gws-slides`
- **Creative:** `brainstorming`, `gws-docs-write`

## 15. Legal & Risk Lead
*Core Goal: Mitigate organizational risk and ensure regulatory compliance.*
- **Governance:** `gws-admin-reports`, `gws-modelarmor`
- **Review:** `gws-docs`, `github-triage`

## 16. Database Administrator (DBA)
*Core Goal: Maintain database health, performance, and integrity.*
- **Monitoring:** `db_health_checks`, `replication-lag`, `isolation-levels`
- **Maintenance:** `index-maintenance`, `deadlocks`, `online-ddl`

---

## Loading Protocol
1. User identifies a persona (e.g., "I'm acting as a DBA").
2. Agent prioritizes rules from the corresponding bundle.
3. ALL other 150+ skills remain active and available for cross-domain tasks.
