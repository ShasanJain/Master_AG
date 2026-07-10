# 🌐 Onboarding Guide: Social Media Manager at Jack Media Swarm

Welcome to **Jack Media Swarm**! This document provides a highly detailed, role-specific onboarding breakdown mapping the tools, repositories, configurations, and schedules you need to start operating immediately.

---

## 🎯 1. Core Responsibilities & Operations
As a member of our team, your primary tasks focus on keeping execution lines operating with zero errors. Your core daily operational loops include:

*   **Coordinating daily quantitative finance video releases:**  You will monitor the output of the Trading Agents simulation daily, extract key consensus summaries, and select high-performing ticker discussions to highlight.
*   **Creating dynamic charts, visual assets, and voice narration audio clips:**  You will use `video_brain_tts.py` to generate narration audio overlays, and compile dynamic layout screens using Remotion and HTML Chrome canvas templates.
*   **Structuring social workflows and running scheduling loops:**  You will configure the task scheduler to run rendering scripts automatically, compile finished reels, and queue them for social media platforms.

---

## 🛠️ 2. Tooling, Script References & Workspace Access
You will interact directly with these specific codebase directories. Please ensure you familiarize yourself with their folder paths and run commands:

### 📂 [Video Engine (openmontage)](file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/openmontage)
**Description:** Pipeline to automate outline compilation, asset sourcing, audio pairing, and rendering.

**Execution Reference Commands:**
```bash
python execution/process_media.py --validate
python execution/moviepy_renderer.py
```

### 📂 [TTS Engine (kittentts)](file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/FinBuddy_PromptWarsMUM)
**Description:** ONNX offline text-to-speech audio synthesis engine featuring local voice presets.

**Execution Reference Commands:**
```bash
python execution/video_brain_tts.py --text "hello" --voice "preset1"
```

---

## 🔑 3. Configuration & Environment Variables
You must configure a local `.env` file in the project root containing these variables. Coordinate with your team leader to obtain valid tokens:

| Variable Key | Purpose & Integration | Expected Format / Default |
| :--- | :--- | :--- |
| `EDGETTS_VOICE` | The primary neural voice identifier for speech generation fallback. | Configured in local `.env` |
| `TIKTOK_API_KEY` | Developer token to authenticate automated post uploads to TikTok. | Configured in local `.env` |
| `YOUTUBE_API_KEY` | API token to push automated reels directly to YouTube Shorts. | Configured in local `.env` |

---

## 📅 4. The First 30 Days Roadmap
Follow this phased roadmap to ensure you align with our performance expectations during your first month:

### 🗓️ Days 1-5: Setup & Local Verification
- [ ] Clone the repository and run python execution/run_diagnostics.py.
- [ ] Verify local Edge-TTS and ONNX voice synthesis run correctly.
- [ ] Review aesthetic guidelines and Remotion timeline components.

### 🗓️ Days 6-15: Content Compilation Loop
- [ ] Run a manual consensus run on Trading Agents and compile an outline.
- [ ] Render a 30-second financial short locally using openmontage and check frame sync.
- [ ] Verify voiceovers match overlays.

### 🗓️ Days 16-30: Automation & Scheduling
- [ ] Set up the scheduler engine to trigger automated daily compilations.
- [ ] Configure API hooks for auto-uploading to testing endpoints.
- [ ] Monitor rendering performance logs under logs/ directory.

---

## 📈 5. Quality Gates & Success Standards
Before submitting any task, you must enforce the following checks:

1.  **Directives Check:** Ensure your execution results align with the standard operating procedures under [directives/](file:///c:/Users/swaya/OneDrive/Desktop/Master_AG/directives).
2.  **Lint & Verify:** Run syntax audits: `npm run lint` or `pytest` locally depending on the module stack.
3.  **Git Branch Rule:** Never commit directly to the `main` branch. Create a new branch prefixed with your role or feature area (e.g. `feature/backend-opt`).
