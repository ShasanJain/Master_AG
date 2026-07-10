# User Stories & Personas - VillageOS

## User Personas

### 1. Hardcore Hammer Builder (Marcus)
*   **Playstyle:** Offensive Teuton, highly active, coordinates massive military forces.
*   **Core Need:** Detailed crop consumption scheduling and troop training cost predictors. Marcus cannot afford a crop-lock (negative crop production exceeding crop storage limits, leading to troop death).
*   **Friction Points:** Manually summing crop consumption of multiple troop types across three military queues (Barracks, Stables, Great Barracks, Great Stables).

### 2. Casual Governor (Elena)
*   **Playstyle:** Defensive Gaul, low activity (logins 2-3 times daily).
*   **Core Need:** Clear, automated build queue guidance and warnings on when storage capacity limits (Warehouse/Granary) will be exceeded.
*   **Friction Points:** Calculating when to upgrade Warehouses before high-level building requirements exceed current capacity limits.

---

## User Stories & Acceptance Criteria

### US-101: Automated Data Upload via OCR
*   **As a** player,
*   **I want to** paste or upload a screenshot of my village overview,
*   **So that** my resource storage capacities, current resource totals, and active queue durations are updated in my spreadsheet without manual keyboard entry.
*   **Acceptance Criteria:**
    *   System identifies Wood, Clay, Iron, and Crop counts.
    *   System parses current Warehouse and Granary capacities.
    *   Parsed data is populated in the `SYS_LOG` and updates the active village row in `DB_VILLAGES`.

### US-102: Dual-Queue Romany Simulator
*   **As a** Roman player,
*   **I want to** schedule a resource field upgrade and an infrastructure building upgrade simultaneously,
*   **So that** I can accurately forecast construction completion times under Roman rules.
*   **Acceptance Criteria:**
    *   Calculates overlapping construction times.
    *   Properly respects the rule that a Roman cannot build two resource fields or two infrastructure buildings at the same time.

### US-103: Crop-Lock Alert
*   **As a** player with negative net crop production,
*   **I want to** receive alerts when my granary level falls below a 2-hour buffer threshold,
*   **So that** my troops do not starve.
*   **Acceptance Criteria:**
    *   Displays a prominent red indicator on the Dashboard if remaining crop time is under 120 minutes.
    *   Emits an estimated time-of-death (ETD) countdown for troops.
