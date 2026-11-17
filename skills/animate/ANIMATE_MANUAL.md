# 🎬 `animate`: Procedural Canvas Animation & Algorithmic Scoring Engine

The `animate` skill enables autonomous procedural video generation entirely from code. It produces broadcast-ready explainer animations, visual essays, and technical narratives rendered to deterministic, single-file HTML5 `<canvas>` containers and exported to MP4 via headless Playwright and ffmpeg.

---

## 🏛️ Core Architectural Paradigm

Unlike standard DOM-based presentation tools (e.g., GSAP/HTML slide decks) or heavy timeline video editors, `animate` operates on **pure algorithmic canvas graphics** combined with **procedural WebAudio sound synthesis**.

```mermaid
flowchart TD
    subgraph Authoring ["1. Authoring & Composition"]
        Brief["brief.md / piece.json"]
        Scenes["src/scenes.js<br/>(Algorithmic Frame Draw)"]
        Bridges["src/bridges.js<br/>(Era-to-Era Morph Transitions)"]
        Score["src/score.js<br/>(Algorithmic WebAudio Synth)"]
    end

    subgraph Assembly ["2. Deterministic Assembly (tools/build.mjs)"]
        Kit["kit/core.js + kit/morph.js + kit/board.js"]
        StyleKit["styles/<style>/kit.js<br/>(Crosshatch, Riso, Math, etc.)"]
        Index["Compiled Single-File index.html<br/>(Zero External Assets, Zero Network)"]
    end

    subgraph Rendering ["3. Headless Capture & Export"]
        Chromium["Headless Chromium (Playwright)<br/>Deterministic Per-Frame Stepping"]
        FFmpeg["FFmpeg Pipeline<br/>Video (libx264) + Muxed Audio"]
        MP4["Final Artifact: output.mp4"]
    end

    Authoring --> Assembly
    Kit --> Index
    StyleKit --> Index
    Scenes --> Index
    Bridges --> Index
    Score --> Index
    Index --> Chromium
    Chromium --> FFmpeg
    FFmpeg --> MP4
```

---

## 🎨 The 7 Native Art Styles

Every piece inherits a specialized aesthetic kit from `styles/<name>/`:

| Style Name | Aesthetic Character | Ideal Use Case | Visual Characteristics |
| :--- | :--- | :--- | :--- |
| **`cut-paper`** | Layered silhouette cutouts | Histories, conceptual essays, children's fables | Flat vector shapes, organic paper edges, subtle drop shadows, clean silhouettes. |
| **`crosshatch`** | Hand-inked editorial engraving | Documentary explainers, historical retrospectives | Fine directional hatching, line density gradients, parchment background texture. |
| **`riso`** | Multi-pass Risograph spot color | Indie culture, design manifestos, modern tech shorts | Dual spot-color inks, intentional misregistration, screen halftone grain, bold typography. |
| **`math`** | Manim-style vector coordinate plane | Educational lectures, mathematical proofs, physics | Coordinate grids, LaTeX formulas, parametric curve drawing, glowing vector paths. |
| **`pixel`** | 8-bit / 16-bit retro computing | Gaming history, software engineering stories | Strict pixel grid snapping, retro color palettes, dithered shading. |
| **`isometric`** | Axonometric architectural line art | System architecture, infrastructure, mechanical explainers | 30-degree isometric grid, isometric cubes, conveyor belts, mechanical flow. |
| **`sketchbook`** | Rough pencil and ink journal | Ideation logs, biographical notes, architectural sketches | Controlled line wobble, pencil lead texture, loose gesture fills. |

---

## 🛠️ The Deterministic Tool Suite

The skill is powered by high-density Node.js/Python CLI scripts located in `tools/`:

```
skills/animate/tools/
├── build.mjs        # Compiles piece source parts + kit + style into single index.html
├── still.mjs        # Renders single frames or multi-frame contact sheets to PNG
├── storyboard.mjs   # Generates 3x3 or 4x4 storyboard overview images
├── review.mjs       # Automated QA suite: checks contrast, duration, readability, and FPS
├── beats.mjs        # Analyzes audio transients and generates beat grids (BPM map)
├── voice.mjs        # Formats and synchronizes voice-over cues
├── export.mjs       # Headless Chromium frame recorder + FFmpeg MP4 encoder
└── gallery.mjs      # Compiles style preview tiles from all installed art kits
```

---

## ⚙️ Step-by-Step Creation Flow

```mermaid
flowchart LR
    S0["Step 0: Intake<br/>(Brief & Reference)"] --> S1["Step 1: Story Check<br/>(Beats & Format)"]
    S1 --> S2["Step 2: Look Check<br/>(2-4 Style Frames)"]
    S2 --> S3["Step 3: Storyboard<br/>(Keyframe Grid)"]
    S3 --> S4["Step 4: Build<br/>(tools/build.mjs)"]
    S4 --> S5["Step 5: Review & Export<br/>(tools/review.mjs -> MP4)"]
```

### 1. Project Scaffolding
Scaffold a piece with the unified CLI:
```bash
node skills/animate/tools/new.mjs pieces/<name> --style cut-paper --duration 50 --title "Piece Title"
```
This generates the full directory and validates immediate compilation:
```
pieces/<name>/
├── piece.json       # Metadata, selected style, dimensions, and FPS
├── brief.md         # Narrative premise, research facts, and core visual metaphor
├── LOG.md           # Engineering log and change tracking
├── voice/           # Voiceover directory (script.json and takes)
└── src/
    ├── head.html    # Timeline, acts, safe areas, canvas
    ├── scenes.js    # Scene drawing definitions
    ├── bridges.js   # Morph bridges between scenes
    └── score.js     # Procedural synthesizer notes and BPM timing
```

### 2. Neural Voiceover & Karaoke Timing
Generate studio-grade neural voice takes directly from `script.json` and time words via local Whisper:
```bash
node skills/animate/tools/tts.mjs pieces/<name> --voice en-US-ChristopherNeural --rate +6%
```
- Automatically generates 48kHz mono takes via Edge-TTS.
- Extracts millisecond-accurate word boundaries using dual Whisper fallback (`faster-whisper` -> `openai-whisper` -> heuristic).
- Assembles `voice/voice.wav` and `voice.json`.

### 3. Assembly & Verification
```bash
# 1. Compile into single standalone index.html
node skills/animate/tools/build.mjs pieces/<name>

# 2. Check text boundaries, safe-zones, and UI overlaps (0 errors required)
node skills/animate/tools/textcheck.mjs pieces/<name>

# 3. Render test still frames at 2.5s, 8.0s, and 15.0s
node skills/animate/tools/still.mjs pieces/<name> 2.5,8.0,15.0 preview.png

# 4. Export broadcast master with Direct3D 11 GPU acceleration and kinetic karaoke subtitles
node skills/animate/tools/export.mjs pieces/<name> --gpu

# 5. Rapid audio / caption re-mix without re-rendering frames (takes ~2 seconds)
node skills/animate/tools/export.mjs pieces/<name> --skip-frames
```

---

## 📐 Safe Zone & Vertical Layout Standards (9:16)

1. **Phone UI Safe Boundaries**:
   - `SAFE = { top: 240, bottom: 420, right: 140 }`
   - Top banner zone: $y \ge 240$ (below status bar and search icons).
   - Bottom UI zone: $y \le 1480$ (above account tags, sound discs, and progress scrubbers).
   - Right action column: $x \le 940$ (away from like, comment, and share buttons).
2. **Kinetic Caption Channel**:
   - Captions are chunked to 2–4 words per phrase (max 22 characters), centered at $y \approx 1373$ (`MarginV: 0.285 * H`).
   - Sits cleanly on a single line, highlighted in active gold/yellow with dark outline.
3. **Elevated Focal Geometry**:
   - Keep primary character and landscape focal points centered at $y \approx 750–1050$.
   - Keep camera push zoom conservative ($z \le 1.02$) to prevent perspective transforms from pushing edges into UI gutters.

---

## 🔒 Safety & Validation Rules

1. **Zero External Assets**: All visual rendering must execute inside standard Canvas 2D / WebGL contexts without relying on CDN font links or remote unverified image URLs.
2. **Deterministic Seeded Randomness**: Use the internal `RNG(seed)` and the boil index `B` for line jitter. Never call native unseeded `Math.random()`.
3. **Audio-Video Lockstep**: Frame step `T` drives both visual canvas draw routines and WebAudio buffer evaluation, ensuring zero drift during headless export.
4. **Integrity Baseline**: Any updates to `skills/animate/` are verified against `skills-lock.json` and audited to maintain 100/100 quality compliance.
