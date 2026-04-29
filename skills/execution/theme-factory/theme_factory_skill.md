---
name: theme-factory
description: High-performance design engine for styling artifacts (slides, docs, HTML, dashboards) with rule-dense themes. Includes 10 embedded premium themes and logic for on-the-fly design system generation.
version: 5.0
---

# Theme Factory Design System

This skill industrializes artifact styling by providing embedded design tokens, premium aesthetic rules, and automated theme application logic.

## 1. Core Implementation Rules

### Aesthetic Excellence (MANDATORY)
- **Visual Impact**: Use rich gradients, glassmorphism (blur: 8px-16px), and subtle micro-animations.
- **Typography**: Headers MUST use Bold/Display weights. Body text MUST prioritize readability (line-height: 1.6).
- **Accessibility**: Maintain minimum 4.5:1 contrast ratio for all text. Use WCAG 2.1 AA standards.

### Application Workflow
1. **Token Retrieval**: Identify the target theme from the Embedded Library below.
2. **Component Mapping**:
   - **Background**: Primary Dark or Neutral Light.
   - **Accents**: Primary Accent for buttons/headers; Secondary for highlights.
   - **Glass**: Apply `backdrop-filter: blur(12px) saturate(180%)` to cards.
3. **Motion**: Add `transition: all 0.3s ease-in-out` to interactive elements.

## 2. Embedded Theme Library

| Theme Name | Primary Palette (Hex) | Typography (Headers / Body) | Visual Aesthetic |
| :--- | :--- | :--- | :--- |
| **Ocean Depths** | `#1a2332`, `#2d8b8b`, `#a8dadc`, `#f1faee` | DejaVu Sans Bold / Sans | Deep Navy, Professional, Calm |
| **Sunset Boulevard** | `#e76f51`, `#f4a261`, `#e9c46a`, `#264653` | DejaVu Serif Bold / Sans | Warm, Vibrant, Energetic |
| **Forest Canopy** | `#2d4a2b`, `#7d8471`, `#a4ac86`, `#faf9f6` | FreeSerif Bold / Sans | Natural, Grounded, Organic |
| **Modern Minimalist** | `#36454f`, `#708090`, `#d3d3d3`, `#ffffff` | DejaVu Sans Bold / Sans | Charcoal, Grayscale, Clean |
| **Golden Hour** | `#f4a900`, `#c1666b`, `#d4b896`, `#4a403a` | FreeSans Bold / Sans | Mustard, Autumnal, Inviting |
| **Arctic Frost** | `#d4e4f7`, `#4a6fa5`, `#c0c0c0`, `#fafafa` | DejaVu Sans Bold / Sans | Ice Blue, Crisp, Clinical |
| **Desert Rose** | `#d4a5a5`, `#b87d6d`, `#e8d5c4`, `#5d2e46` | FreeSans Bold / Sans | Dusty Rose, Soft, Sophisticated |
| **Tech Innovation** | `#0066ff`, `#00ffff`, `#1e1e1e`, `#ffffff` | DejaVu Sans Bold / Sans | Electric Blue, Neon, Bold |
| **Botanical Garden** | `#4a7c59`, `#f9a620`, `#b7472a`, `#f5f3ed` | DejaVu Serif Bold / Sans | Fern Green, Floral, Fresh |
| **Midnight Galaxy** | `#2b1e3e`, `#4a4e8f`, `#a490c2`, `#e6e6fa` | FreeSans Bold / Sans | Deep Purple, Cosmic, Impactful |

## 3. Premium Design Tokens

### Gradients (CSS Patterns)
- **Vibrant Accent**: `linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)`
- **Soft Depth**: `radial-gradient(circle at top left, var(--bg-light) 0%, var(--bg-dark) 100%)`

### Glassmorphism System
- **Standard Card**: `background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); backdrop-filter: blur(12px);`
- **Dark Mode Card**: `background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.05);`

### Micro-Animations
- **Hover Scale**: `transform: scale(1.02); transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);`
- **Fade In**: `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`

## 4. Custom Theme Generation Engine

If the preset library is insufficient, generate a new theme following this formula:
1. **Core Selection**: Choose 1 Background (Neutral), 1 Dark (Contrast), and 2 Complementary Accents.
2. **Font Pairing**: Match a Serif/Display header with a high-readability Sans body.
3. **Contrast Check**: Validate colors using `webaim.org` simulation logic.
4. **Naming**: Assign a descriptive title (e.g., "Industrial Copper", "Cyber Neon").
5. **Output**: Present as a markdown table with Hex codes and CSS variable definitions.
