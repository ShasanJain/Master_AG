# VillageOS Product Requirements Document
**Version:** 1.0  
**Author:** Antigravity / Jack  
**Date:** 2026-07-10  

---

## 1 Executive Summary

VillageOS is an enterprise-grade optimization companion designed for players of the Massively Multiplayer Online Real-Time Strategy (MMORTS) game *Travian: Legends*. Rather than functioning as a basic data repository, VillageOS operates as a **decision engine** designed to answer one central question: **"What should I do next?"** 

The system functions like a **Formula 1 race engineer** for the player, providing tactical upgrade orders, resource allocations, and safety metrics. The system integrates a three-layer architecture (Presentation, Calculation, Data) inside a highly styled, mobile-first Google Sheet, evolving into a responsive Next.js/Firebase web application.

---

## 2 Mission

Empower players to run their empires with mathematical certainty. We eliminate spreadsheet churn, broken formulas, and crop starvation through automated data digestion, unified UI styling, and heuristics.

---

## 3 Vision

To construct the definitive planning workspace for Travian players, shifting active gameplay from reactive maintenance to automated, long-term strategic execution. The system renders complex troop-upkeep and expansion formulas into actionable, priority-sorted prompts, providing a dashboard interface that feels like a native app.

---

## 4 Problem Statement

Standard gameplay assistants for Travian function primarily as passive calculators or database grids. Players must manually type and copy values (current crop production, warehouse levels, army size) across multiple screens, leading to data fatigue and eventual neglect. 

Furthermore, standard spreadsheets lack the intelligence to predict critical failures like negative-crop troop starvation (crop-lock), nor do they proactively suggest high-ROI actions. Players lack an unified "decision center" that integrates historical daily metrics, active build planners, and visual layout parsers.

---

## 5 Success Metrics

* **Time to Ingest:** Under 5 seconds to upload/paste a screenshot and run updates.
* **Accuracy:** 99.8% layout parsing accuracy on resource counts and building levels.
* **Adherence:** Zero crop starvation events for active users utilizing the crop-planner.
* **Queue Optimization:** Minimizing idle queue time by Roman, Gaul, or Teuton builders down to under 1% of total daily uptime.

---

## 6 User Personas

### 6.1 Marcus (The Teuton Hammer Builder)
*   **Playstyle:** Offensive Teuton, highly active, coordinates massive military forces.
*   **Core Need:** Detailed crop consumption scheduling and troop training cost predictors. Marcus cannot afford a crop-lock (negative crop production exceeding crop storage limits, leading to troop death).
*   **Friction Points:** Manually summing crop consumption of multiple troop types across three military queues (Barracks, Stables, Great Barracks, Great Stables).

### 6.2 Elena (The Casual Gaul Governor)
*   **Playstyle:** Defensive Gaul, low activity (logins 2-3 times daily).
*   **Core Need:** Clear, automated build queue guidance and warnings on when storage capacity limits (Warehouse/Granary) will be exceeded.
*   **Friction Points:** Calculating when to upgrade Warehouses before high-level building requirements exceed current capacity limits.

---

## 7 User Journey

1.  **Ingestion:** The player opens VillageOS on their phone and uploads a screenshot of their current Village Overview (d2) or Village Center (d1).
2.  **Parsing:** The Travian-specific parser identifies visual layout grids (slots, header bar) and updates the database without manual typing.
3.  **Calculation:** The formulas update net production rates, warehouse caps, and CP expansion targets.
4.  **Coach Action:** The Dashboard displays the single highest-priority action (e.g., "Upgrade Clay Pit Level 6 - Highest ROI - Ready in 42 minutes") along with the top 5 next steps.

---

## 8 Competitive Analysis

*   **Getter-Tools:** Excellent for troop coordination and distance checks, but lacks resource production forecasting and personal crop planning.
*   **Kirilloid Calculators:** The gold standard for individual building and troop training math, but operates as isolated calculators. It does not store historical state or coordinate multi-village accounts.
*   **Travian Plus (In-game):** Offers a larger build queue, but lacks predictive optimization, historical logs, or AI coaching.
*   **VillageOS Advantage:** Unifies layout-based app parsing, multi-village databases, crop-lock planning, and AI recommendation engines into a single workspace.

---

## 9 Feature List (MoSCoW Prioritization)

### 9.1 Must-Have (M)
*   Flat databases for village levels (`02_Village_Data`) and configuration parameters (`00_Settings`).
*   Automated building timer equations adjusting for server speed and Main Building levels.
*   Crop-lock safety alerts indicating estimated time to starvation.
*   Mobile-first Dashboard card UI with no horizontal scrolling.
*   Tribe-agnostic support (Romans, Gauls, Teutons, Huns, Egyptians, Spartans).
*   Speed adjustments (1x, 2x, 3x, 5x, 10x).

### 9.2 Should-Have (S)
*   Travian-specific layout parser for screenshot ingestion (parsing instead of raw OCR).
*   Hero RPG tracker capturing level, attributes, and equipment checklists.
*   Build queue planner that shifts items dynamically upon completion.

### 9.3 Could-Have (C)
*   Raid Planner ranking nearby oases based on animal respawns and loot limits.
*   Map Planner identifying and scoring optimal 9c/15c cropper coordinates.
*   Town Hall small/great celebration scheduler.

### 9.4 Won't-Have (W)
*   Direct browser automation (botting) or scraping of active live Travian accounts (to maintain full compliance with Travian Terms of Service).

---

## 10 Functional Requirements

*   **System Configuration:** The settings page must hold the primary account profile (Tribe, Server Speed, Gold Strategy).
*   **Calculations:** Building ROI, Resource production, and CP ETAs must use hidden calculation tabs.
*   **UI Cards:** All mobile metrics must render inside card layouts with large tap targets.

---

## 11 Non-Functional Requirements

*   **Performance:** Calculation completion under 1.5 seconds.
*   **Security:** Script keys and API tokens encrypted within Google script properties.
*   **Offline Mode:** Fundamental spreadsheet logic remains functional without network connectivity.

---

## 12 Google Sheets Architecture

The workbook is structured across three layers to ensure modularity:

*   **Presentation Layer:** `01_Dashboard`, `04_Hero`, `06_Build Planner`, `10_AI Analysis`.
*   **Calculation Layer (Hidden):** `Calculations`, `Building ROI`, `Resource Engine`, `CP Engine`, `Hero Engine`.
*   **Data Layer:** `00_Settings`, `02_Village_Data`, `03_Resources`, `09_Daily Log`.

---

## 13 AI Screenshot Recognition & Layout Parser

### 13.1 Layout Parsing Over Raw OCR
Raw OCR is highly error-prone on games due to small fonts, icons, and dynamic color filters. Instead, VillageOS uses a **Travian-specific layout parser**. It analyzes the screen structure by identifying consistent UI coordinate anchors (such as the resource bar header or the circular building slots grid of the mobile view).

### 13.2 Parsing Coordinates & Anchors (1920x1080)
*   **Resource Header Bar:** Fixed coordinates for Wood, Clay, Iron, and Crop slot overlays.
*   **Slot Mapping (d2 Overview):** Maps circular slot coordinate regions $1$ through $18$ to specific resource fields.
*   **Level Badge Recognition:** Isolates level indicator circular badges (green/brown circles) to extract current level integers.

---

## 14 Apps Script Automation

*   **Ingestion Endpoint:** Handles screenshot uploads via Google Sheets custom sidebar.
*   **Queue Automations:** Moves items dynamically within the Build Planner queue upon execution.
*   **Storage properties:** Utilizes Apps Script `PropertiesService` to keep API credentials secure.

---

## 15 Web App Architecture

The system is designed to scale into a React-based Next.js web application utilizing Firebase:
*   **Firestore:** Synchronizes database sheets with cloud-hosted village state records.
*   **Firebase Authentication:** Secures user statistics.
*   **Firebase Cloud Functions:** Executes layout parser algorithms and triggers AI strategist recommendations.

---

## 16 Technical Stack

*   **Spreadsheet UI:** Google Sheets, Google Apps Script V8 Engine.
*   **OCR & Layout Parser:** Custom Canvas/Node-canvas layout parser.
*   **AI Coach:** Gemini / OpenAI API endpoints.
*   **Cloud Dashboard:** Next.js (TypeScript), React, TailwindCSS, Firebase Auth, Firestore.

---

## 17 UI/UX Guidelines & Color System

The system enforces a strict color system:
*   **Green (`#10B981`):** Progress, completed tasks, and production gains.
*   **Blue (`#3B82F6`):** General information, static indices, and navigation targets.
*   **Orange (`#F59E0B`):** System recommendations and warnings.
*   **Red (`#EF4444`):** Problems, capacity overflows, and crop lockouts.
*   **Grey (`#E2E8F0`):** Silent references and inactive grid boundaries.

---

## 18 Development & Versioning Plan

VillageOS is designed as a generic Travian Legends Command Center (configurable for tribe, server speed, gold strategy, and village count) across four developmental versions:

### **Version 1.0 – Google Sheets Command Center**
*   Dashboard layout with cards and progress bars.
*   Automated calculation formulas (weakest resource, bottlenecks, CP growth, and settlement ETAs).
*   Planning sheets for buildings, hero, and settlements.

### **Version 1.5 – AI Integration**
*   Screenshot paste workflow: user pastes screenshots of Overview/Fields/Hero.
*   The AI parses the interface, updates target sheets, and displays optimized next-step recommendations.

### **Version 2.0 – Apps Script Automation**
*   Interactive UI buttons (e.g., "Add Celebration", "Complete Upgrade").
*   Automated daily tracking log snapshots and progress charts.
*   Notification/Star alerts for queue expirations.

### **Version 3.0 – Web Application**
*   Responsive React Next.js mobile/desktop web portal (`travian.shasan.ai`).
*   Direct screenshot upload, layout OCR parsing, and database synchronization.
*   Multi-account alliance coordination profiles (fully compliant with Travian rules).

---

## 19 Future AI Features

*   **Automatic Trade Routes Planner:** Evaluates resource production disparities and suggests ideal merchant shipments.
*   **Catapult Damage Predictor:** Recommends optimal targets based on defensive structures.
*   **Aggression Alerts:** Scans raid reports to identify nearby threat developments.

---

## 20 Risks & Mitigations

*   **API Execution Limits:** Script executions are subject to Google's 6-minute timeout. *Mitigation:* Heavy calculations are computed inside spreadsheet cell formulas.
*   **TOS Compliance:** Automations might conflict with game rules. *Mitigation:* The system remains purely analytical, reading manual screenshots and outputting advice with zero direct game actions.

---

## 21 Backlog

### 21.1 Core & Settings
*   [ ] Multi-village CP expansion calculator.
*   [ ] Main building demolition queue timer integration.
*   [ ] Account-wide trade route optimization matrix.

### 21.2 Military & Hero
*   [ ] Smithy upgrade ROI metrics (upkeep cost vs combat efficiency).
*   [ ] Hero resurrection timer and cost table.
*   [ ] Animal capture planning (using cages vs fighting strength).

### 21.3 Raiding & Mapping
*   [ ] Automated target farm list prioritization.
*   [ ] Nearby inactive player scan generator.
*   [ ] Defended vs undefended oasis calculator.

---

## 22 Edge Case Specification

### 22.1 Tribe Rules
1.  **Roman Dual Queue:** Timings calculated based on tags (`d1` vs `d2`) to simulate parallel building.
2.  **Teuton Cranny Bypass:** Subtracts $20\%$ from cranny values in defensive safety metrics.
3.  **Gaul Trapper Upkeep:** Keeps trapped troops registered as home village crop consumption.

### 22.2 Crop Lock (Rule of 1 / Rule of 2)
*   Simulated queues block upgrades that drop free crop production below $+1$/hr, except for Croplands, Mills, Bakeries, and level 10 storage exceptions when base crop production is $\ge 276$/hr.

### 22.3 Town Hall Celebrations
*   Small and Great celebrations scale dynamically based on village and account daily production (capped at 500/2000 CP respectively).
*   Town Hall cooldown scales as:
    $$\text{Cooldown Hours} = \frac{\text{Base Cooldown}}{\text{Server Speed}} \times 0.96^{(\text{TH Level} - 1)}$$
*   Ongoing celebrations are allowed to complete if the Town Hall is destroyed, but further actions are blocked.

### 22.4 Storage Overflows during Queue Simulations
*   *Edge Case:* A resource card or build recommendation requires more resources than the current Warehouse or Granary capacity.
*   *System Requirement:* The system must prevent suggesting upgrades that exceed storage caps and automatically prompt a Warehouse or Granary upgrade as a prerequisite.

---

## 23 Operational Workflow & User Value Proposition

### 23.1 Operational Workflow (How It Works)
VillageOS operates in a continuous four-step loop that translates raw game interfaces into tactical guidance:
1.  **Ingestion:** The player takes a screenshot of their Travian Village Center (`d1`) or Village Overview (`d2`) and drops it into the dashboard interface.
2.  **Analysis:** The layout parser identifies UI anchors and processes numbers.
3.  **Synchronization:** The database updates and recalculates active queues.
4.  **Coaching:** The AI strategist delivers clear, priority-sorted action items.

### 23.2 User Value Proposition (How It Helps the User)
*   **Zero manual bookkeeping:** Updates entire village metrics via screenshots.
*   **Proactive crop-lock warning:** Calculates starvation countdowns.
*   **Optimized build paths:** Displays ROI metrics for all upgrades.
*   **Speed-calibrated calculations:** Scales calculations based on server multipliers.
