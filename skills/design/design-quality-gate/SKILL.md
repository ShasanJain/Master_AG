# 🎨 Design Quality Gate: The Integrity Engine
> **SOP Version**: 5.0.0-Industrial
> **Goal**: 100% Inclusive, Low-Cognitive-Load, Premium UI.

## 🧠 1. Cognitive Load Assessment (SOP)
Before shipping any UI, Jack MUST audit the "Mental Weight":
- **Map the Journey**: List every decision, memory requirement, and step.
- **Identify Spikes**: Flag any screen with >3 primary decisions or >5 input fields.
- **Memory Bridges**: Ensure no user has to remember data from Screen A to complete Screen B.

## 🧹 2. Surgical Simplification (The "Art Director" Pass)
- **Plain Language**: Force Grade 6 reading level. Remove jargon. Shorten sentences to <20 words.
- **Visual De-clutter**: Identify the **One Primary Action** per screen. De-emphasize everything else.
- **Interaction Depth**: Minimize the clicks to reach the "Value Moment."

## ♿ 3. Inclusive Interaction Audit
Run the **Multi-Modal Pass**:
1.  **Keyboard Pass**: Every element MUST be reachable and focus-visible. No keyboard traps.
2.  **Touch Pass**: All targets >44px. No precision-dependent gestures without alternatives.
3.  **Feedback Pass**: Errors/Status MUST use both color AND icons/text.

## 🛡️ 4. Anti-Patterns
- **❌ Complexity Creep**: Never add a feature that increases the cognitive load of the core path.
- **❌ Aesthetic-Only Motion**: All animations MUST serve a functional purpose or respects `prefers-reduced-motion`.
- **❌ Color-Only Meaning**: Never rely on color alone to communicate state.

## ⌨️ Automation Tools
- `Jack /design-audit`: Runs the full 3-phase audit on the current interface.
- `Jack /simplify-ui`: Suggests a cognitively simplified version of the current layout.
- `Jack /load-map`: Generates a step-by-step cognitive weight report for a user flow.
