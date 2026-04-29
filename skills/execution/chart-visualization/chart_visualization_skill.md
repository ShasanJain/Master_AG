---
name: chart-visualization
description: High-performance data visualization engine using AntV. Intelligently selects and generates 26+ chart types (Line, Bar, Sankey, Maps, etc.) using embedded schemas and premium design tokens.
version: 5.0
---

# AntV Visualization Design System

This skill industrializes data visualization by providing embedded schemas for 26 chart types, premium styling tokens, and automated generation logic.

## 1. Intelligent Chart Selection Matrix

| Category | Chart Type | Use Case | Primary Arguments |
| :--- | :--- | :--- | :--- |
| **Trend** | `line`, `area` | Time-series, KPI trends | `data` (time, value), `group` |
| **Comparison** | `bar`, `column` | Categorical ranking (Top-N) | `data` (category, value), `stack` |
| **Composition** | `pie`, `treemap` | Part-to-whole, Hierarchies | `data` (category, value), `innerRadius` |
| **Distribution** | `histogram`, `boxplot` | Frequency, Statistical spread | `data` (value), `binWidth` |
| **Flow** | `sankey`, `flow-diagram` | Resource/User path analysis | `data` (source, target, value) |
| **Maps** | `district`, `pin`, `path` | Geospatial regions, points, routes | `data` (name/coord, value) |
| **Specialized** | `radar`, `funnel`, `liquid` | Multi-dim, Process stages, % | `data` (name, value) |
| **Complex** | `network`, `mind-map` | Node-edge relations, Brainstorming | `nodes`, `edges` |

## 2. Embedded Schema Library (Core Arguments)

All charts support common arguments: `title`, `width` (default 600), `height` (400), `theme` (default/dark/academy), and `style`.

### Time-Series & Trends
- **`generate_line_chart` / `generate_area_chart`**:
  - `data`: `[{ time: string, value: number, group?: string }]`
- **`generate_dual_axes_chart`**:
  - `categories`: `string[]` (X-axis)
  - `series`: `[{ type: "line"|"column", data: number[], axisYTitle: string }]`

### Categorical & Comparison
- **`generate_bar_chart` / `generate_column_chart`**:
  - `data`: `[{ category: string, value: number, group?: string }]`
  - `stack`: `boolean` (Default: true if group exists)
- **`generate_radar_chart`**:
  - `data`: `[{ name: string, value: number, group?: string }]`

### Flow & Relationship
- **`generate_sankey_chart`**:
  - `data`: `[{ source: string, target: string, value: number }]`
- **`generate_scatter_chart`**:
  - `data`: `[{ x: number, y: number, size?: number, color?: string }]`

### Maps & Specialized
- **`generate_district_map`**: `data: [{ name: string, value: number }]`
- **`generate_liquid_chart`**: `percent: number` (0 to 1)

## 3. Premium Aesthetic Tokens (AntV Studio)

### Color Palettes
- **Corporate Blue**: `["#1677ff", "#1890ff", "#0050b3", "#003a8c"]`
- **Vibrant Sunset**: `["#e76f51", "#f4a261", "#e9c46a", "#264653"]`
- **Modern Dark**: Set `theme: "dark"` + `style.backgroundColor: "#1e1e1e"`.

### Visual Enhancements
- **Texture**: Set `style.texture: "rough"` for hand-drawn aesthetic.
- **Glassmorphism**: When embedding in UI, use `rgba(255, 255, 255, 0.1)` backgrounds.
- **Precision**: Ensure `axisXTitle` and `axisYTitle` are present for technical reports.

## 4. Execution Workflow

1. **Format Payload**: Create JSON following the target chart's `args`.
2. **Execute Script**: 
   ```powershell
   node ./scripts/generate.js '{"tool": "generate_bar_chart", "args": {"title": "Sales", "data": [...]}}'
   ```
3. **Verify Output**: The script returns a URL. Ensure the generated image matches the "Aesthetic Excellence" standard.

## 5. Industrialized Mapping
| Skill Tool | AntV Internal ID |
| :--- | :--- |
| `generate_area_chart` | `area` |
| `generate_bar_chart` | `bar` |
| `generate_boxplot_chart` | `boxplot` |
| `generate_dual_axes_chart` | `dual-axes` |
| `generate_sankey_chart` | `sankey` |
| `generate_word_cloud_chart`| `word-cloud` |
| `generate_spreadsheet` | `spreadsheet` |
*(Refer to `scripts/generate.js` for full mapping)*
