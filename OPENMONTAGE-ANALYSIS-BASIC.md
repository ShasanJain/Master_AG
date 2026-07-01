# Repository Analysis: OpenMontage

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
