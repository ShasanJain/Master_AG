# Google Sheets Specification - VillageOS

## 1 Design Philosophy
The VillageOS spreadsheet interface is designed to emulate a native web dashboard. We avoid default grey grids, default font choices, and standard blue/white spreadsheet styling.

## 2 Layout Structure

### 2.1 The Dashboard Grid
*   **Column A (Width 20px):** Spacing border.
*   **Columns B to F (Dashboard Core):** Metric Cards (Wood, Clay, Iron, Crop).
*   **Columns G to K:** Build Queue progress bars and AI Suggestion console.
*   **Row Height Constraints:**
    *   Header row: 45px.
    *   Section title rows: 35px.
    *   Standard data rows: 22px.

### 2.2 Visual Hierarchy
```
+-------------------------------------------------------------+
|  V I L L A G E   O S  (Header - Dark Mode Primary Blue)     |
+------------------------------+------------------------------+
| [Wood Card]    [Clay Card]   | [Active Build Queue]         |
| 15,200/20,000  18,410/20,000 | MB Lvl 10 (00:14:12)         |
| Prod: +420/hr  Prod: +480/hr | Sawmill Lvl 3 (01:05:40)     |
+------------------------------+------------------------------+
| [Iron Card]    [Crop Card]   | [AI Coach Recommendations]   |
| 8,900/20,000   1,200/20,000  | * Upgrade Warehouse next.    |
| Prod: +320/hr  Prod: +120/hr | * Clay Pit level 9 ready.    |
+------------------------------+------------------------------+
```

## 3 Formatting Rules
*   **Typography:** Use the `Outfit` or `Inter` font family (available via Google Sheets custom fonts).
*   **Gridlines:** Explicitly disabled in sheet settings. Border lines are styled with custom thin separators in light charcoal colors.
*   **Card Styles:** Background color of cards set to light/dark themed containers with rounded appearance simulated using custom border sizing.
