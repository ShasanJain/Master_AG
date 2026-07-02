# Repository Analysis: KittenTTS

## 1. What it does
KittenTTS is an open-source, ultra-lightweight text-to-speech library optimized for CPU-only edge environments. Built on top of ONNX, it packages pre-trained models (ranging from 15M to 80M parameters / 25-80 MB footprint) and 8 built-in voices. It includes smart text normalization pipelines that automatically format abbreviations, currencies, times, and numbers before voice synthesis.

## 2. Compatibility & Resources
-   **OS/Hardware:** Cross-platform (Windows, macOS, Linux). Optimized for CPU-only inference; supports CUDA acceleration as an optional backend.
-   **Dependencies:** Python >= 3.8, NumPy, ONNX Runtime (`onnxruntime`), SymSpell/text normalization packages, and `soundfile` for file I/O.
-   **Feasibility:** Extremely High. Easily installed via pre-built `.whl` files or pip directly from release assets. Does not require heavy compilation or massive GPU resource allocations.

## 3. Skills Integration
-   **Existing Skills:** Overlaps conceptually with our existing TTS workflows (Edge TTS, Piper, Bark) in `audio-studio`.
-   **Recommendation:** Integrate KittenTTS as a new dedicated engine tab inside the **Audio Studio** dashboard.
-   **Global Subfolder:** `skills/audio-synthesis/kittentts`
-   **Proposed Use Case:** Fast, offline local voice generation inside the Audio Studio cockpit for low-latency script preview and narration generation.
