---
name: html-to-video-orchestrator
description: Use when executing HTML-to-Video generation pipelines, template selection, multi-frame storyboarding, and MP4 rendering via headless Chromium and ffmpeg.
---

# HTML-to-Video Orchestrator: Execution Protocol

## ⚙️ Overview
This skill provides the operational profile and technical execution SOP for converting structured text sources, web articles, or GitHub repositories into fully animated video sequences (MP4) right on the local host. It coordinates multi-scene storyboarding, template selection, headless Chromium (Playwright) frame recording, and ffmpeg muxing.

## 🛠️ Implementation SOP
- **Step 1: Baseline Context** — Verify dependencies: Node.js (v20+), `pnpm` (v9+), `ffmpeg` on PATH, and Playwright's Chromium browser (`npx playwright install chromium`).
- **Step 2: Apply the Pattern** — Run `node packages/cli/dist/bin.js studio` or scriptable CLI actions to select templates, edit content graphs, and output frame animations.
- **Step 3: Enforce Constraints** — Verify template YAML manifests (`template.html-video.yaml`) for clean licensing (SPDX), correct resolutions, aspect ratios, and input schemas before running renders.
- **Step 4: Execute Test Suite** — Run CLI diagnostic tools (`doctor`, `search-templates`) and verify output MP4 resolution and bitrate.
- **Step 5: Document and Commit** — Log rendering completion times, sync audio tracks, and save projects under the user's workspace.

## 📚 Reference Material

### 1. Pluggable Render Engines & Hyperframes
The core engine compiles animated HTML/CSS/GSAP pages and processes them as follows:
- **Headless Chromium Recording**: Puppeteer/Playwright opens each HTML scene page and records the animation frame-by-frame into high-quality WebM slices.
- **ffmpeg Concat & Encode**: ffmpeg stitches all WebM scene slices together and encodes them into a standard MP4 file (`libx264`).
- **Soundtrack Muxing**: Integrates optional background audio and TTS narration (via MiniMax API) directly into the final MP4 container using custom audio ducking filters.

### 2. Multi-Scene ContentGraph Storyboarding
Instead of single slide renders, the system splits source content (URLs, text articles, repositories) into a ContentGraph:
- **Nodes**: Represent individual scenes containing specific text, data cards, or titles.
- **Edges**: Define sequential flow, dependencies, or visual transitions between scenes.
- **Topo-Sorting**: Resolves nodes in correct chronological order and maps durations based on visual complexity.

### 3. HyperFrames HTML Schema & Seekable Timelines
Compositions are defined as plain HTML pages using seekable timeline variables:
*   **Composition Element**: `<div id="stage" data-composition-id="launch" data-start="0" data-width="1920" data-height="1080">`
*   **Media Tracks**: `<video class="clip" data-start="0" data-duration="6" data-track-index="0" src="intro.mp4" muted playsinline></video>`
*   **Audio Tracks**: `<audio data-start="0" data-duration="6" data-track-index="2" data-volume="0.5" src="music.wav"></audio>`
*   **GSAP Bindings**: Expose GSAP timelines on `window.__timelines` so the engine can seek dynamically:
    ```javascript
    const tl = gsap.timeline({ paused: true });
    tl.from("#title", { opacity: 0, y: 40, duration: 0.8 }, 1);
    window.__timelines = window.__timelines || {};
    window.__timelines.launch = tl;
    ```

### 4. HyperFrames CLI & AWS Lambda Scaling
*   **Scaffolding**: `npx hyperframes init my-video`
*   **Local Preview (HMR)**: `npx hyperframes preview`
*   **Local Compilation**: `npx hyperframes render`
*   **AWS Lambda**: Uses `@hyperframes/aws-lambda` to distribute capture tasks and compile highly complex videos serverlessly.
