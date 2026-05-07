# 🎨 UI/UX Pro Max: The Art Director Engine
> **SOP Version**: 5.0.0-Industrial
> **Goal**: Generate premium, "WOW" factor interfaces that feel alive.

## 💎 1. The Design Tokens (Premium Aesthetics)
Every UI generated MUST adhere to these **Jack Visual Standards**:
- **Color Palettes**: Avoid browser defaults. Use HSL-tuned harmonious palettes (e.g., `hsl(210, 100%, 50%)` for primary).
- **Glassmorphism**: Use `backdrop-filter: blur(12px)` and semi-transparent backgrounds (`rgba(255,255,255,0.05)`) for card elements.
- **Typography**: Force modern fonts (Inter, Outfit, Roboto). Strict hierarchy: `h1` (Bold, 3rem), `p` (Regular, 1rem, line-height 1.6).

## 🚀 2. Interaction & Micro-Animations
A "Static" UI is a failure. Every element MUST feel responsive:
- **Hover Effects**: Subtle scaling (`scale(1.02)`) or shadow depth shifts on hover.
- **Transitions**: Global `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` for all interactive elements.
- **Entrance**: Use `IntersectionObserver` or CSS `@keyframes` for "Fade-in-Up" reveals on scroll.

## 🚧 3. Layout Architecture
- **Bento Grid**: Use modular, varied grid sizes for dashboards.
- **Negative Space**: Ensure a minimum of `2rem` padding between major sections to allow "Visual Breathing Room."
- **Responsive Gate**: Test at `320px`, `768px`, and `1440px`. Mobile-first is mandatory.

## 🛡️ 4. Anti-Patterns (The "Slop" List)
- **❌ Plain Red/Blue**: Never use `red`, `blue`, or `green` literals.
- **❌ Sharp Corners**: Minimum `0.5rem` border-radius for modern cards.
- **❌ Unlabeled Icons**: Every icon MUST have a visible or `aria-label` description.

## ⌨️ Automation Tools
- `Jack /ui-ux [description]`: Generates a full design system and mockup.
- `Jack /polish [file]`: Injects gradients and animations into existing CSS.
- `Jack /bento`: Generates a modern bento-style grid layout.
