# Repository Analysis: OpenMontage (Detailed)

## 1. What it does
`OpenMontage` is an autonomous, agentic video production studio. It enables AI coding assistants (like Cursor, Windsurf, or Claude Code) to build, narrate, score, animate, and compose professional videos from a single prompt. It bridges the gap between text generators and video compositing engines by orchestrating multi-agent workflows across audio synthesis, asset creation, and automated timeline rendering.

Key features:
*   **Asset Pipeline (52 Tools)**: Modular tools for Text-to-Speech (TTS), image generation, background music, video overlays, and audio track alignment.
*   **Timeline Composition**: Combines assets using FFmpeg or React-based Remotion video composition.
*   **Instruction Set**: Includes structured workflow playbooks (`pipeline_defs`) and modular agent instructions (`skills`).

## 2. Compatibility & Resources
-   **OS/Hardware:** macOS, Linux, Windows. Remotion and FFmpeg processing benefit greatly from multi-core CPU and GPU acceleration (optionally supports PyTorch CUDA drivers).
-   **Dependencies:** Python 3.10+, Node.js (for Remotion), FFmpeg (system level), and optional external API credentials (OpenAI, ElevenLabs, Replicate).
-   **Feasibility:** Highly feasible. While local setup requires installing FFmpeg and configuring API keys, it provides local CPU-only alternatives (e.g. Piper TTS, local SD) making it highly adaptable.

## 3. Skills Integration
-   **Existing Skills:** We have general execution scripts, but no comprehensive automated media production or scene editing workflows.
-   **Recommendation:** Create a new custom skill named `html-to-video-orchestrator` or import OpenMontage's core editing skills into our `skills/` structure.
-   **Global Subfolder:** `skills/media-production/`
-   **Proposed Use Case:** Auto-generate video walk-throughs, feature explainers, or prompt demo videos directly inside the workspace command line.

## 4. Architecture & Data Flow
OpenMontage operates on a 3-layer architecture similar to Master-AG:
1.  **Orchestration / Skills**: Prompts trigger specific production scripts based on markdown guidelines in `skills/`.
2.  **Manifest Execution**: Workflows read pipeline definitions (`pipeline_defs/*.yaml`) outlining production sequences: script generation -> voice recording -> image prompting -> audio alignment -> video rendering.
3.  **Core Tools (`tools/`)**: Modular Python scripts executing individual utilities:
    *   `tools/audio/tts.py`: Speech synthesis using ElevenLabs, OpenAI, or local Piper.
    *   `tools/video/ffmpeg_blend.py`: High-performance track overlays.
    *   `tools/video/remotion_render.py`: Runs the React compilation engine.

## 5. Implementation Roadmap
-   **Phase 1 (Core Clone & Local Feasibility):** Cloned codebase into `.tmp/OpenMontage` and verified configuration templates.
-   **Phase 2 (Dependencies):** Verify local FFmpeg is registered on user PATH. Install python packages (`pydantic`, `ruamel.yaml`, `diffusers`).
-   **Phase 3 (Remotion Integration):** Install Node modules under `remotion-composer/` and run `npm run build` to confirm output compilation.

## 6. Risks & Limitations
-   **API Cost Barriers**: Advanced rendering modes default to paid services (ElevenLabs / Replicate / OpenAI) which can accumulate costs on long rendering pipelines.
-   **FFmpeg Path Errors**: On Windows, FFmpeg path resolution can fail if the binaries are not registered globally in System Environment variables.
-   **Remotion Render Overhead**: Remotion spins up headless Chrome instances (puppeteer) to render HTML frames, which requires significant RAM.
