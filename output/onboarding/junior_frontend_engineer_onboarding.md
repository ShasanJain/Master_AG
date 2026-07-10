# 🌐 Onboarding Guide: Junior Frontend Engineer at Jack Media Swarm

Welcome to **Jack Media Swarm**! This document provides a highly detailed, role-specific onboarding breakdown mapping the tools, repositories, configurations, and schedules you need to start operating immediately.

---

## 🎯 1. Core Responsibilities & Operations
As a member of our team, your primary tasks focus on keeping execution lines operating with zero errors. Your core daily operational loops include:

*   **Support building React component layouts and video composites:** You will manage user interface components and visual overlay frames rendered via Remotion.
*   **Maintain UI theme configs and branding assets:** Update corporate styles, variables, colors, and layout presets.
*   **Integrate voice narration outputs with front-end visual widgets:** Bridge synthesized TTS audio outputs with browser canvas timelines.
*   **Clean up workspace build pipelines and run formatting tests:** Enforce coding quality standard checks before deployment.

---

## 🛠️ 2. Tooling, Script References & Workspace Access
You will interact directly with these specific codebase directories. Please ensure you familiarize yourself with their folder paths and run commands:

### 📂 [React Remotion (remotion)](file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/remotion)
**Description:** React-based video creation framework with visual timeline scrubbing.

**Execution Reference Commands:**
```bash
npm run build
npx remotion preview
```

### 📂 [Design Presets (design-system)](file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/design-system)
**Description:** Shared design system configuration file containing branding styles.

**Execution Reference Commands:**
```bash
python execution/test_design_system.py
```

---

## 🔑 3. Configuration & Environment Variables
You must configure a local `.env` file in the project root containing these variables. Coordinate with your team leader to obtain valid tokens:

| Variable Key | Purpose & Integration | Expected Format / Default |
| :--- | :--- | :--- |
| `EDGETTS_VOICE` | Standard neural voice key used in narration overlays. | Configured in local `.env` |
| `TIKTOK_API_KEY` | Publishing token for automated short posts. | Configured in local `.env` |

---

## 📅 4. The First 30 Days Roadmap
Follow this phased roadmap to ensure you align with our performance expectations during your first month:

### 🗓️ Days 1-5: UI Workspace Setup
- [ ] Clone repository and install node packages in dashboard.
- [ ] Run diagnostics test: python execution/run_diagnostics.py.
- [ ] Verify Remotion compiler previews locally.

### 🗓️ Days 6-15: Overlay Development
- [ ] Design a custom video frame template in dashboard workspace.
- [ ] Verify that text overlays align cleanly in vertical previews.

### 🗓️ Days 16-30: Component Integration
- [ ] Expose audio synthesis controls in Next.js frontend panels.
- [ ] Verify page builds with zero typescript errors.

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
| **Team Lead / Manager** | Sarah Jenkins | s.jenkins@jackmediaswarm.com | +1 (555) 019-2834 / `@SarahJ` |
| **HR Operations** | David Vance | d.vance@jackmediaswarm.com | +1 (555) 014-9988 / `@DavidV` |
| **IT Helpdesk Support** | Tech Support Team | support@jackmediaswarm.com | Slack: `#helpdesk-support` |

### 📜 Corporate Documentation & Handbooks
*   **[Corporate HR Policies Guide](file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/docs/hr/policies.md):** Information on leave policies, holidays, benefits, and standard conduct codes.
*   **[Workspace Security Handbook](file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/docs/hr/security_handbook.md):** Password management policies, environment file handling, and code compilation policies.
