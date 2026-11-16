# Development Log: The Younger Dryas

- **2026-11-16**:
  - Initialized piece under `pieces/younger-dryas` with `cut-paper` style.
  - Scripted 7 narration lines covering the full geological & archaeological timeline.
  - Generated neural documentary audio takes with Edge-TTS (`en-US-ChristopherNeural` at +6% rate).
  - Aligned timeline to 50.0s (1,200 frames @ 24fps) using `tools/voice.mjs`.
  - Built standalone HTML canvas player `index.html` (1,919 lines, 0 external assets).
  - Captured preview still frames across all 5 eras: `dryas_preview.png`, `still_intro.png`, `still_mammoth.png`, `still_flood.png`, `still_gobekli.png`, `still_outro.png`.
  - Copied live preview assets to Jack dashboard at `http://localhost:3000/pieces/younger-dryas/index.html`.
  - Rendered headless frames via Playwright and muxed broadcast master `renders/final.mp4` with Gyan.FFmpeg.
