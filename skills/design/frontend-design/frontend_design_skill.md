---
name: frontend-design
description: Create distinctive, premium UI/UX frontend interfaces avoiding generic AI slop. Combines Anthropic's creative typography/color constraints with Google Stitch's semantic DESIGN.md generation rules. Use when asked to build or design web components, pages, artifacts, or when asked to define the 'taste' or style of a project via DESIGN.md.
license: Complete terms in LICENSE.txt
---

# Unified Frontend Design Taste & Semantic Generation

## Overview
This skill guides the creation of distinctive, production-grade frontend interfaces that strictly avoid generic "AI slop" aesthetics. It also heavily enforces how to synthesize **Semantic Design Systems (`DESIGN.md`)** for programmatic frontend generators like Google Stitch MCP. 

## 1. Aesthetic Thinking & The "Anti-Slop" Constraints
Before coding or generating a DESIGN.md, understand the context and commit to a BOLD aesthetic direction. Every interface must choose a flavor (from Brutally Minimal to Artsy Chaotic) and stick to it. 

### Critical Universal Constraints (BANNED Patterns)
- **No Emojis Anywhere**
- **No `Inter` Font**: Generic system fonts are BANNED for premium contexts. Force unique character: `Geist`, `Outfit`, `Cabinet Grotesk`, or `Satoshi`.
- **No Generic Serifs**: `Times New Roman`, `Georgia`, or `Garamond` are banned. Use `Fraunces`, `Gambarino`, or `Editorial New`.
- **No Pure Black (`#000000`)**: Use Charcoal Ink (`#18181B`) or Zinc-950.
- **No Purple Neon/Glows**: AI loves purple outer glows. They are strictly BANNED.
- **No Fabricated Data**: Never generate fake metrics ("99.98% UPTIME") or placeholder statistics if real data isn't provided.
- **No AI Copywriting Clichés**: "Elevate", "Seamless", "Unleash", "Next-Gen".
- **No Lazy Filler**: Scroll arrows, "Scroll to explore", bouncing chevrons.

### Frontend Aesthetics Guidelines
- **Color Calibration**: Maximum 1 accent color with saturation below 80%. Use absolute neutral bases (Zinc/Slate) with high-contrast singular accents.
- **Typographic Architecture**: Track-tight headlines (Display). Relaxed leading for body (max 65ch). If layout density is high, force Mono fonts for numbers.
- **Motion Philosophy**: `stiffness: 100, damping: 20` (Spring Physics default). Premium, weighty feel. No linear easing. Animate exclusively via `transform` and `opacity`. Use perpetual micro-loops on active dashboard components.
- **Spatial Composition**: Grid-first responsive architecture. No overlapping elements. Asymmetric Hero sections over centered generic ones. Generous negative space. Strict single-column collapse below 768px.

## 2. Generating a `DESIGN.md` for Stitch
When prompted to establish the "taste" or synthesize a Design System for a target project (often to guide the Stitch MCP), generate a `DESIGN.md` file following this semantic structure exactly. Include descriptive natural-language rules paired with specific values.

### `DESIGN.md` Structure Format:
```markdown
# Design System: [Project Title]

## 1. Visual Theme & Atmosphere
(Evocative description: "A restrained, gallery-airy interface with confident asymmetric layouts and fluid spring-physics...")

## 2. Color Palette & Roles
- **Canvas White** (#F9FAFB) — Primary background surface
- **Charcoal Ink** (#18181B) — Primary text, Zinc-950 depth
- **[Accent Name]** (#XXXXXX) — Single accent (Saturation < 80%. No purple/neon.)

## 3. Typography Rules
- **Display:** [Font Name] — Track-tight, controlled scale, weight-driven hierarchy
- **Body:** [Font Name] — Relaxed leading, 65ch max-width
- **Banned:** Inter, generic system fonts.

## 4. Component Stylings
* **Buttons:** Flat, no outer glow. Tactile -1px translate on active.
* **Cards:** Generously rounded corners (e.g., 2.5rem). Diffused whisper shadow.
* **Inputs/Forms:** Label above, error below. Focus ring in accent color.

## 5. Layout Principles
(Asymmetric splits. Strict single-column collapse. No flexbox percentage math.)

## 6. Motion & Interaction
(Spring physics. Staggered cascade reveals.)

## 7. Anti-Patterns (Banned)
(Explicit list of forbidden AI patterns as defined in constraints.)
```

## 3. Workflow Routing
Based on the user's request, apply these rules:
| User Intent | Workflow Action |
|:---|:---|
| "Design a [page]..." | Apply aesthetic constraints, choose a bold vision, build distinctive HTML/React components directly. |
| "Analyze this screen's design" | Extract colors, shapes, typography into natural language rules mapping `rounded-full` to "Pill-shaped". |
| "Create/Update .stitch/DESIGN.md" | Generate the rigorous DESIGN.md using output format to guide the Stitch generative models. |
