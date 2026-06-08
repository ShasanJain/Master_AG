# UI-Master: The Ultimate Hybrid Design System & Workflow

This document is the absolute Source of Truth for the Master_AG design architecture. It merges the **Open Design Paradigm** (premium, emotional aesthetics) with the **UI-UX-Pro-Max Skill** (extreme utility, Python-based design retrieval, and strict accessibility). 

Whenever you are tasked with UI/UX work, this document supersedes all individual skills and provides both the **Visual Rules** and the **Implementation Workflow**.

---

## PART 1: The UI/UX Workflow & Engine

This system uses a Python-based retrieval engine containing 67 styles, 96 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types across 13 technology stacks.

### 1. Prerequisites
Ensure Python is installed to use the design retrieval engine.
- **macOS**: `brew install python3`
- **Ubuntu/Debian**: `sudo apt update && sudo apt install python3`
- **Windows**: `winget install Python.Python.3.12`

### 2. Implementation Workflow

When tasked with creating or fixing UI, follow these steps:

#### Step 1: Analyze Requirements
Extract the Product type, Style keywords, Industry, and Tech Stack (default to `html-tailwind`).

#### Step 2: Generate & Persist Design System
Always start with the `--design-system` command to fetch the comprehensive logic:
```bash
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system --persist -p "Project Name"
```
*Note: We have already run this to establish this `UI-Master.md` file, but you may run it for specific sub-projects.*

**Hierarchical Retrieval**:
When building specific pages, you can generate page-level overrides:
```bash
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name" --page "dashboard"
```
1. Check `design-system/pages/[page_name].md` first.
2. If it exists, its rules **override** this UI-Master file.
3. If not, use this `UI-Master.md` exclusively.

#### Step 3: Supplement with Detailed Searches
Run domain-specific searches when you need granular inspiration:
```bash
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

**Available Domains Reference:**
| Domain | Use For | Example Keywords |
|--------|---------|------------------|
| `product` | Product type recommendations | SaaS, e-commerce, portfolio, healthcare, beauty, service |
| `style` | UI styles, colors, effects | glassmorphism, minimalism, dark mode, brutalism |
| `typography` | Font pairings, Google Fonts | elegant, playful, professional, modern |
| `color` | Color palettes by product type | saas, ecommerce, healthcare, beauty, fintech, service |
| `landing` | Page structure, CTA strategies | hero, hero-centric, testimonial, pricing, social-proof |
| `chart` | Chart types, library recommendations | trend, comparison, timeline, funnel, pie |
| `ux` | Best practices, anti-patterns | animation, accessibility, z-index, loading |
| `react` | React/Next.js performance | waterfall, bundle, suspense, memo, rerender, cache |
| `web` | Web interface guidelines | aria, focus, keyboard, semantic, virtualize |
| `prompt` | AI prompts, CSS keywords | (style name) |

#### Step 4: Stack Guidelines
Get stack-specific implementation rules (Default: `html-tailwind`):
```bash
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack <stack_name>
```

**Available Stacks Reference:**
| Stack | Focus |
|-------|-------|
| `html-tailwind` | Tailwind utilities, responsive, a11y (DEFAULT) |
| `react` | State, hooks, performance, patterns |
| `nextjs` | SSR, routing, images, API routes |
| `vue` | Composition API, Pinia, Vue Router |
| `svelte` | Runes, stores, SvelteKit |
| `swiftui` | Views, State, Navigation, Animation |
| `react-native` | Components, Navigation, Lists |
| `flutter` | Widgets, State, Layout, Theming |
| `shadcn` | shadcn/ui components, theming, forms, patterns |
| `jetpack-compose` | Composables, Modifiers, State Hoisting, Recomposition |

#### 3. Example Workflow

**User request:** "Làm landing page cho dịch vụ chăm sóc da chuyên nghiệp"

1. **Analyze**: Product type: Beauty/Spa service, Style: elegant/soft, Stack: `html-tailwind`
2. **Generate Design System (REQUIRED)**:
   ```bash
   python3 .agent/skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness service elegant" --design-system -p "Serenity Spa"
   ```
3. **Supplement**:
   ```bash
   python3 .agent/skills/ui-ux-pro-max/scripts/search.py "animation accessibility" --domain ux
   python3 .agent/skills/ui-ux-pro-max/scripts/search.py "elegant luxury serif" --domain typography
   ```
4. **Stack Guidelines**:
   ```bash
   python3 .agent/skills/ui-ux-pro-max/scripts/search.py "layout responsive form" --stack html-tailwind
   ```

#### 4. Tips for Better Results & Output Formats
1. **Be specific with keywords**: "healthcare SaaS dashboard" > "app".
2. **Combine domains**: Style + Typography + Color = Complete design system.
3. **Always check UX**: Search "animation", "z-index", "accessibility".
4. **Output Formats**: Append `-f markdown` to the script for documentation formatting (best for writing files), or leave blank for ASCII boxes (best for terminal reading).

---

## PART 2: Visual Constraints & Design Rules

We engineer dual-mode environments. The aesthetic strategy changes significantly between modes to maximize impact and utility.

### 1. Dual-Mode Theming Engine

#### 🌑 Dark Mode (Open Design Influence)
*Goal: Establish a premium depth hierarchy and "wow" factor.*
- **Base Surface**: `bg-white/5` or semantic `var(--surface)` over a deep `bg-[#0f172a]` (slate-900) background.
- **Blur Engine**: `backdrop-blur-xl` is mandatory on floating panels.
- **Borders**: 1px translucent borders (`border-white/10`) to define edges without harsh lines.
- **Shadows**: Deep, soft shadows (`shadow-2xl shadow-black/50`) to lift elements.
- **Text**: High contrast `text-slate-50`. Muted text should be `text-slate-400`.

#### ☀️ Light Mode (UI-UX-Pro-Max Influence)
*Goal: Deliver maximum readability and strict WCAG AA accessibility.*
- **Base Surface**: Solid or semi-solid colors (`bg-white/80` minimum opacity, or `bg-slate-50`).
- **Borders**: Highly visible structural borders (`border-gray-200` or `border-slate-200`). **Do not use `border-white/10` in light mode.**
- **Shadows**: Crisp, subtle shadows (`shadow-sm hover:shadow-md`).
- **Text**: `text-slate-900` (#0F172A) for body/headings. Muted text must be `#475569` (slate-600) minimum.

### 2. Typography & Grids
- **Primary Headings & UI Labels**: Use **Outfit** or **Inter** with tight tracking (`tracking-tight`).
- **Data Densities & Numbers**: Use **Fira Code** or **Fira Sans** strictly for numerical data, IDs, and financial metrics.
- **Meta-Labeling**: Secondary text, tags, and small labels MUST be `uppercase text-[10px] tracking-widest text-[var(--muted)] font-mono`.
- **Layout Grids**: Dashboards must use strict CSS grids (`grid-cols-1 md:grid-cols-2 xl:grid-cols-4`).
- **Container Consistency**: Maintain a consistent `max-w-6xl` or `max-w-7xl` container. Do not mix widths.

### 3. Interaction & Micro-Animations (The "Alive" Feel)
- **Hover States**: Apply `hover:scale-[1.02] active:scale-[0.98]` on buttons and cards. Hover states must use color/opacity transitions and must NEVER cause the layout to shift or jump.
- **Transitions**: Apply `transition-all duration-200 ease-out` universally. Instant state changes or >500ms animations are forbidden.
- **Entrance**: Use `framer-motion` for staggered fade-up entrances (`initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`).
- **Cursor**: All clickable/hoverable elements MUST have `cursor-pointer`.

### 4. Layout, Spacing & Visual Elements
- **Container Margins**: Every time you create a bar, sidebar, dashboard matrix, or container, you MUST leave sufficient margin/padding around it. Elements must not touch the edges or look cramped.
- **Floating Navbars**: Add `top-4 left-4 right-4` spacing. Do not stick navbars to `top-0 left-0 right-0`.
- **Content Padding**: Always account for fixed navbar height so content doesn't hide behind it.
- **Iconography over Text**: Prioritize icons instead of text labels for common actions (e.g., toggles, edits, deletes).
- **No Emojis**: NEVER use emojis (🎨 🚀 ⚙️) as UI icons. Always use SVG icons (Heroicons, Lucide, Simple Icons).
- **Consistent Icons**: Use a fixed viewBox (e.g., 24x24) with `w-6 h-6`.

### 5. Conflict Resolution Scenarios
When layout logic conflicts, apply the appropriate Scenario:
- **Scenario A (Command Center / Exec Dashboard)**: Low Density. Maximize container margins. Prioritize massive KPI numbers. Hide data tables behind drill-downs. Heavy use of framer-motion staggered entrances.
- **Scenario B (Data Matrix / Admin Panel)**: High Density. Minimize padding (`p-2` or `p-4`). Use massive data tables as the primary view. Limit motion to practical interactions to prevent visual fatigue.

### 6. Artifact Sandboxing & Live Dashboard Constraints
- **Isolation**: Do not bleed global styles into the artifact unless intended. Use explicit semantic variables (`var(--surface)`, `var(--primary)`).
- **Live Dashboards MUST include**:
  1. A **KPI Wall**: Top row numeric summaries with trend indicators.
  2. A **Main Visualization**: Central graph or massive data table.
  3. A **Tweaks Panel**: A side or floating control panel to mutate state without reloading.

---

## PART 3: Pre-Delivery Strict Checklist

Before delivering ANY UI code, you MUST verify these items:

### Visual Quality
- [ ] No emojis used as icons (use SVG instead).
- [ ] All icons from a consistent icon set (Heroicons/Lucide).
- [ ] Brand logos are correct (verified from Simple Icons).
- [ ] Hover states don't cause layout shift.
- [ ] Used theme colors directly (e.g., `bg-primary`) rather than hardcoded hex values where applicable.

### Interaction
- [ ] All clickable elements have `cursor-pointer`.
- [ ] Hover states provide clear visual feedback (color, shadow, border).
- [ ] Transitions are smooth (150-300ms).
- [ ] Focus states are highly visible for keyboard navigation.

### Light/Dark Mode
- [ ] Light mode text has sufficient contrast (4.5:1 minimum).
- [ ] Glass/transparent elements are clearly visible in light mode (`bg-white/80` min).
- [ ] Borders are visible in both modes (`border-gray-200` for light, `border-white/10` for dark).
- [ ] Tested both modes before delivery.

### Layout
- [ ] Floating elements have proper spacing from edges.
- [ ] No content is hidden behind fixed navbars.
- [ ] Responsive at 375px, 768px, 1024px, 1440px.
- [ ] No horizontal scroll on mobile.

### Accessibility
- [ ] All images have alt text.
- [ ] Form inputs have accessible labels.
- [ ] Color is not the only indicator of system status.
- [ ] `prefers-reduced-motion` is respected where applicable.
