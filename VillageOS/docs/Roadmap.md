# Project Roadmap - VillageOS

This roadmap outlines the milestones required to design, develop, test, and release VillageOS.

## Development Roadmap

```mermaid
gantt
    title VillageOS Release Schedule
    dateFormat  YYYY-MM-DD
    section Milestone 1: Design
    Docs & Specs           :active, des1, 2026-07-10, 3d
    section Milestone 2: Sheets MVP
    Core Formula Engine    :        mvp1, after des1, 5d
    Dashboard UI & Sheets  :        mvp2, after mvp1, 5d
    section Milestone 3: Apps Script
    OCR & API Integrations :        as1, after mvp2, 7d
    section Milestone 4: AI Coach
    AI Logic & Heuristics  :        ai1, after as1, 5d
    section Milestone 5: Web Dashboard
    React Frontend         :        web1, after ai1, 10d
```

## Milestone Details

### Milestone 1 — Product Design (Current)
*   **Deliverables:** PRD, Architecture documents, and user stories.
*   **Verification:** All requirements peer-reviewed and saved.

### Milestone 2 — Google Sheets MVP
*   **Deliverables:** First release of the functional workbook with basic tables.
*   **Focus:** Production formulas, tribe variables, culture point calculators.

### Milestone 3 — Apps Script Integration
*   **Deliverables:** Google Apps Script backend.
*   **Focus:** API connections for OCR processing and side-bar dashboard logic.

### Milestone 4 — AI Coach & Recommendation
*   **Deliverables:** Recommendation pipeline.
*   **Focus:** LLM prompts parsing sheet metrics and returning building suggestions.

### Milestone 5 — React / Web Dashboard
*   **Deliverables:** Next.js application with Firebase integration.
*   **Focus:** Interactive dashboards and cloud backups of user statistics.
