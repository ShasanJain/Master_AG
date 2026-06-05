# UI/UX Directives (Open Design Paradigm)

This document establishes the strict, agent-native design constraints for the Master_AG (Jack) architecture, heavily inspired by the deterministic `DESIGN.md` approach from `nexu-io/open-design`, combined with our foundational layout principles.

## 1. Iconography over Text
Always prioritize using icons instead of text labels for common, recognizable actions (e.g., toggles, edits, deletes). This reduces visual clutter and saves space.

## 2. Container Margins
Every time you create a bar, sidebar, dashboard matrix, or any sort of container, you MUST leave sufficient margin/padding around it. Ensure there is breathing room so the layout maintains a clean, premium look without elements touching the edges or looking cramped.

## 3. The Glassmorphism Base
All primary surfaces must use layered glassmorphism to establish a premium depth hierarchy.
- **Base Surface**: `bg-white/5` (Dark mode) or `bg-black/5` (Light mode)
- **Blur Engine**: `backdrop-blur-xl` is mandatory on floating panels.
- **Borders**: 1px translucent borders (`border-white/10`) to define edges without harsh lines.
- **Shadows**: Deep, soft shadows (`shadow-2xl shadow-black/50`) to lift elements.

## 4. Micro-Animations (The "Alive" Feel)
Static UI is dead UI. All interactive elements must feature micro-animations.
- **Hover States**: `hover:scale-[1.02] active:scale-[0.98]` on all buttons and cards.
- **Transitions**: `transition-all duration-300 ease-out` should be applied universally.
- **Entrance**: Use `framer-motion` for staggered fade-up entrances (`initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`).

## 5. Typography & Grids
- **Font Stack**: Primary headings must use **Outfit** or **Inter** with tight tracking (`tracking-tight`).
- **Data Densities**: Use strict CSS Grids for dashboards (`grid-cols-1 md:grid-cols-2 xl:grid-cols-4`).
- **Labeling**: Meta-text and small labels must be `uppercase text-[10px] tracking-widest text-[var(--muted)] font-mono`.

## 6. Iframe / Standalone Artifact Sandboxing
When generating "Artifacts" or Live Dashboards, ensure they are entirely self-contained.
- Do not bleed global styles into the artifact unless intended.
- Use explicit semantic variables (`var(--surface)`, `var(--primary)`) that can be tweaked via a side panel without requiring a full page reload.

## 7. Live Dashboard Constraints
Live dashboards must feature:
1. A **KPI Wall** (Top row numeric summaries with trend indicators).
2. A **Main Visualization** (Central graph or data table).
3. A **Tweaks Panel** (A side or floating control panel to mutate state).
