---
name: document-visualization-evaluator
description: Use when executing multi-agent document analysis, concept detection, sandboxed WebGL/Canvas visualization, and 4-axis student learning progress evaluation.
---

# Document Visualization & Evaluator: Execution Protocol

## ⚙️ Overview
This skill provides the operational profile and technical execution SOP for analyzing digital PDF documents, detecting instructional concepts, generating secure runtime-repairing 3D/2D visual sandboxes, and evaluating user comprehension across four monotone non-decreasing axes (memory, comprehension, structure, application).

## 🛠️ Implementation SOP
- **Step 1: Baseline Context** — Verify environment setup (Node.js v20+, Next.js standalone server, Electron shell, and Codex CLI connection state).
- **Step 2: Apply the Pattern** — Execute the batched concept-detection agent in parallel with the 4-axis evaluator queue.
- **Step 3: Enforce Constraints** — Restrict client-side UI calls to read-only state changes, enforce sandbox parameter sanitization (`compileFn` in viz-runtime), and ensure score modifications are strictly monotone non-decreasing.
- **Step 4: Execute Test Suite** — Run `npm run test` or Playwright smoke tests to ensure route/compile stability.
- **Step 5: Document and Commit** — Log all user interactions (chats, flashcards, Feynman sessions) to `workctx.json` and sync metrics.

## 📚 Reference Material

### 1. Visualizer Sandbox & Self-Repair Loop
The visualization generation is designed as a server-side job running inside the Next.js process. When the client loads a page:
- Visualizer types include `3d` (Three.js group auto-framed), `2d-anim` (Canvas2D rendering loop), `formula` (KaTeX), `graph` (Canvas plotted data), and `2d-text` (Markdown quotes).
- **Security Sandboxing**: The emitted JS function is wrapped in an IIFE shadowing dangerous global objects (window, document, fetch, eval, process) as undefined.
- **Self-Repair Loop**: If a runtime crash is caught, the system re-submits the code with the stack trace to the repair agent to output a corrected, compile-safe spec.

### 2. Four-Axis Rubric & Monotone Evaluator
A centralized evaluator reviews the student's append-only work context logs (`workctx.json`) and calculates/updates progress scores for each concept node:
- **Memory**: Evaluated based on flashcard ratings (Again/Hard/Good/Easy) and recall references.
- **Comprehension**: Evaluated using user-defined metaphors and child-explanation Feynman sessions.
- **Structure**: Evaluated by tracking connections between prerequisite and compound concepts.
- **Application**: Evaluated via original examples and applied discrimination quizzes.
- **Monotone Clamp**: All score modifications are passed through `clampMonotone` ensuring that progress never decreases.

### 3. Fail-Fast UI & Queue Coalescing
Evaluation calls are expensive and asynchronous. To manage model limits:
- Coalesce multiple chat/interaction events through a per-document queue.
- Chat turns are not evaluated immediately; they are batched and evaluated once when the user exits the chat view.
- Under model rate-limiting, background queues stop gracefully and revert to an idle, manual retry state rather than running in automatic request loops.
