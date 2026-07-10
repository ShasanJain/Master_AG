# Technical Architecture Specification - VillageOS

This document defines the schema, columns, named ranges, formulas, and relationships across the 11 sheets of the VillageOS workbook.

---

## 1. Data Layer Sheets

### 1.1 `00_Settings`
*   **Purpose:** Configures global account properties and environment variables.
*   **Schema:**
    *   `A2: Key` (Key name identifier)
    *   `B2: Value` (Input value)
*   **Cells & Named Ranges:**
    *   `B3` Name: `SETTING_ACCOUNT_NAME`
    *   `B4` Name: `SETTING_TRIBE` (Data validation: `Romans`, `Gauls`, `Teutons`, `Huns`, `Egyptians`, `Spartans`)
    *   `B5` Name: `SETTING_SERVER_SPEED` (Data validation: `1`, `2`, `3`, `5`, `10`)
    *   `B6` Name: `SETTING_GOLD_STRATEGY` (Data validation: `F2P`, `Light Gold`, `Heavy Gold`)
    *   `B7` Name: `SETTING_TIMEZONE`
    *   `B8` Name: `SETTING_START_DATE`
    *   `B9` Name: `SETTING_CURRENT_VILLAGE`
    *   `B10` Name: `SETTING_CAPITAL_COORDINATES`

### 1.2 `02_Village_Data`
*   **Purpose:** Central database of all buildings and resource fields across all villages.
*   **Schema (Columns):**
    *   `Col A: Village_ID` (Integer)
    *   `Col B: Village_Name` (String)
    *   `Col C: Category` (String: `d1` / `d2`)
    *   `Col D: Slot_ID` (Integer, 1-18 for d2, 19-40 for d1)
    *   `Col E: Building_Name` (String, e.g. "Woodcutter", "Main Building")
    *   `Col F: Current_Level` (Integer, 0-20)
    *   `Col G: Target_Level` (Integer, 0-20)
    *   `Col H: Upgrade_Priority` (Integer, 1-5)
*   **Named Ranges:**
    *   `A2:H` Name: `DB_VILLAGE_RAW`

### 1.3 `03_Resources`
*   **Purpose:** Raw resource counters, hourly production, and storage metrics per village.
*   **Schema (Columns):**
    *   `Col A: Village_ID`
    *   `Col B: Wood_Current`
    *   `Col C: Wood_Prod` (Hourly net)
    *   `Col D: Wood_Cap` (Warehouse limit)
    *   `Col E: Clay_Current`
    *   `Col F: Clay_Prod`
    *   `Col G: Clay_Cap`
    *   `Col H: Iron_Current`
    *   `Col I: Iron_Prod`
    *   `Col J: Iron_Cap`
    *   `Col K: Crop_Current`
    *   `Col L: Crop_Prod` (Free crop net)
    *   `Col M: Crop_Cap` (Granary limit)
*   **Named Ranges:**
    *   `A2:M` Name: `DB_RESOURCES_RAW`

### 1.4 `09_Daily Log`
*   **Purpose:** Captures historical snapshots for progress graphing.
*   **Schema (Columns):**
    *   `Col A: Date` (YYYY-MM-DD)
    *   `Col B: Total_Population`
    *   `Col C: Hero_Level`
    *   `Col D: Total_Hourly_Production`
    *   `Col E: Total_CP`
    *   `Col F: Village_Count`
    *   `Col G: Server_Rank`

---

## 2. Presentation Layer Sheets

### 2.1 `01_Dashboard`
*   **Purpose:** User's main cockpit. Emits key KPI cards.
*   **KPI Widgets:**
    *   `Card 1: Active Village Profile` (Name, Tribe, Speed). Formula: `=SETTING_CURRENT_VILLAGE & " (" & SETTING_TRIBE & " x" & SETTING_SERVER_SPEED & ")"`
    *   `Card 2: Warehouse Status` (Total Wood/Clay/Iron vs Capacity, bar graphs).
    *   `Card 3: Granary Status` (Crop vs Granary capacity, time until empty if net is negative).
    *   `Card 4: CP Expansion Tracker` (Current CP, CP/Day, Days until next village slot).
*   **Next Action Card:**
    *   Displays values from the top row of the Build Planner.

### 2.2 `04_Hero`
*   **Purpose:** Hero status dashboard.
*   **Fields:** Health %, XP, Level, Stats, Active Gear slots, Current Adventure ETA.

### 2.3 `06_Build Planner`
*   **Purpose:** Sorted queue execution list.
*   **Schema (Columns):**
    *   `Col A: Active_State` (Enum: `NOW` / `NEXT` / `FUTURE`)
    *   `Col B: Village`
    *   `Col C: Building`
    *   `Col D: Level`
    *   `Col E: Time_Required` (Calculated using MB and speed formulas)
    *   `Col F: Cost` (Formatted string summing Wood/Clay/Iron/Crop)
    *   `Col G: Status` (Checkbox for complete)

### 2.4 `10_AI Analysis`
*   **Purpose:** Interactive panel showing pasted screenshot inputs on the left and recommendation logs on the right.

---

## 3. Calculation Layer (Hidden Engines)

### 3.1 `Calculations`
*   **Purpose:** Global formula tables computing building costs and upgrade durations.
*   **Duration Equation:**
    `=ROUND((BASE_TIME * MULTIPLIER) / SETTING_SERVER_SPEED * (0.96 ^ MB_LEVEL))`
*   **Crop Starvation Equation (Countdown to Zero):**
    `=IF(CROP_PROD < 0, ABS(CROP_CURRENT / CROP_PROD) * 60, "Infinite")` (Returns minutes remaining)
