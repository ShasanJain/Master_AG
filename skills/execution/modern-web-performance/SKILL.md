---
name: modern-web-performance
description: High-Performance Web Engineering.
category: performance
version: 4.1.0-fractal
layer: master-skill
---

# ⚡ High-Performance Web Engineering
> **SOP Version**: 5.0.0-Industrial
> **Goal**: 100/100 Vitals without compromising premium aesthetics.

## 🚧 1. The Performance Gate (Hard Thresholds)
Every build or PR MUST pass these **Audit Gates**. Failure = REJECTION.
- **LCP (Largest Contentful Paint)**: < 2.5s (Target: < 1.2s)
- **CLS (Cumulative Layout Shift)**: < 0.1 (Target: 0.0)
- **FID (First Input Delay)**: < 100ms (Target: < 50ms)
- **TBT (Total Blocking Time)**: < 200ms

## 📦 2. Payload Budgets (Industrial Limits)
Strict limits on asset sizes to prevent "Hydration Bloat":
- **Critical JS Bundle**: < 50KB (Gzipped).
- **Total Initial Page Load**: < 250KB (Gzipped).
- **Fonts**: Preloaded, WOFF2 format only, < 30KB per weight.
- **Images**: NextGen formats only (AVIF/WebP). No raw PNG/JPG in production.

## 🎨 3. Aesthetic-Performance Synergy
High aesthetics (animations/blur) must be performance-isolated:
- **GPU Acceleration**: Use `transform` and `opacity` only for animations.
- **Lazy Visuals**: High-res hero images MUST use a low-res blurred placeholder (LQIP) first.
- **Layout Trashing**: Never read/write DOM properties in a loop (e.g., `offsetWidth`).

## 🧪 4. Audit SOP (The Toolbox)
- **Local Audit**: `npx unlighthouse --site [url]` for site-wide scans.
- **CI/CD Gate**: Integration of Lighthouse CI with a `budgets.json` file.
- **Bundle Triage**: `next-bundle-analyzer` to identify rogue transitive dependencies.

## ⌨️ Automation Tools
- `Jack /performance [url]`: Runs a full vitals scan.
- `Jack /optimize-images`: Converts all local assets to WebP/AVIF.
- `Jack /audit-bundle`: Analyzes `node_modules` for bloat.
