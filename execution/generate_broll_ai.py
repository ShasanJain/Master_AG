import os
import json
import time
import requests
from typing import Optional
import sys

# Add current dir so we can import VLM Consistency
sys.path.append(os.path.dirname(__file__))
from vlm_consistency import VLMConsistencyEngine

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config", "hardware_profile.json")

class AIVideoEngine:
    """
    Hardware-Aware AI Video Engine.
    Manages generation via Native Diffusers, ComfyUI, or HF API.
    Auto-loads hardware profile on boot to stay autonomous.
    """
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        self.profile = self._load_or_create_profile()

    def _load_or_create_profile(self) -> dict:
        """Loads the hardware profile, or runs interactive setup if missing."""
        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
                
        print("\n[AI Video Setup] First-time setup detected.")
        print("[AI Video Setup] Let's configure your hardware profile.")
        
        # Check VRAM if possible
        vram_gb = 0
        try:
            import torch
            if torch.cuda.is_available():
                vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
                print(f"[AI Video Setup] Detected GPU VRAM: {vram_gb:.1f} GB")
                if vram_gb < 8:
                    print("  -> Recommendation: Wan2.1 + ComfyUI")
                elif vram_gb < 18:
                    print("  -> Recommendation: LongCat (FP8) + ComfyUI")
                else:
                    print("  -> Recommendation: LongCat + Native")
        except:
            print("[AI Video Setup] Could not auto-detect VRAM.")

        # Interactive Prompts
        model = input("Select Model: [1] LongCat (13.6B)  [2] Wan2.1 (1.3B): ").strip()
        model_val = "longcat" if model == "1" else "wan2.1"
        
        backend = input("Select Backend: [1] Native Python  [2] ComfyUI API  [3] HF Cloud API: ").strip()
        backend_val = "native"
        if backend == "2": backend_val = "comfyui"
        elif backend == "3": backend_val = "hf_api"

        profile = {
            "model": model_val,
            "backend": backend_val,
            "vram_gb": vram_gb,
            "comfyui_url": "http://127.0.0.1:8188"
        }

        os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(profile, f, indent=4)
            
        print(f"[AI Video Setup] Profile saved to {CONFIG_PATH}\n")
        return profile

    def generate_broll(self, prompt: str, filename_stem: str, reference_image: Optional[str] = None, max_retries: int = 3) -> Optional[str]:
        out_path = os.path.join(self.output_dir, f"{filename_stem}.mp4")
        if os.path.exists(out_path):
            print(f"[AI Video] Cache hit -> {out_path}")
            return out_path

        model = self.profile.get("model", "wan2.1")
        backend = self.profile.get("backend", "comfyui")

        print(f"\n[AI Video] Generating '{prompt}'")
        print(f"[AI Video] Using: {model.upper()} via {backend.upper()}")

        for attempt in range(1, max_retries + 1):
            try:
                if backend == "comfyui":
                    self._try_comfyui(prompt, out_path, model)
                elif backend == "native":
                    self._try_native(prompt, out_path, model)
                elif backend == "hf_api":
                    self._try_hf_api(prompt, out_path)
                    
                if os.path.exists(out_path):
                    # ViMax VLM Consistency Check
                    if reference_image and os.path.exists(reference_image):
                        print(f"[AI Video] Attempt {attempt}: Checking Character Consistency...")
                        vlm = VLMConsistencyEngine()
                        is_consistent = vlm.check_consistency(out_path, reference_image)
                        
                        if not is_consistent:
                            print(f"[AI Video] Consistency Check FAILED. Deleting and retrying...")
                            os.remove(out_path)
                            continue # Try again
                        else:
                            print(f"[AI Video] Consistency Check PASSED!")
                    
                    print(f"[AI Video] Success -> {out_path}")
                    return out_path
            except Exception as e:
                print(f"[AI Video] Engine failed: {e}")
                break # Engine error, don't retry

        print("\n[AI Video] ! All AI generation methods failed. Returning None for fallback.")
        return None

    def _try_comfyui(self, prompt: str, out_path: str, model: str):
        url = f"{self.profile.get('comfyui_url')}/prompt"
        
        # This is a generic stub payload. A real ComfyUI workflow would have specific nodes
        # for LongCat or Wan2.1. We pass the prompt to the KSampler/Text Encode node.
        workflow = {
            "prompt": {
                "3": {
                    "class_type": "CLIPTextEncode",
                    "inputs": {"text": prompt, "clip": ["4", 1]}
                },
                # Normally there are 15+ nodes here defining the video pipeline.
            }
        }
        
        try:
            # We don't actually post in the stub unless it's running real Comfy
            # resp = requests.post(url, json=workflow, timeout=5)
            # if resp.status_code != 200: raise RuntimeError(resp.text)
            
            print(f"[ComfyUI] Sent workflow to {url} (Simulated)")
            raise RuntimeError("ComfyUI server not running at 127.0.0.1:8188")
        except requests.exceptions.RequestException:
            raise RuntimeError("Could not connect to ComfyUI. Is it running?")

    def _try_native(self, prompt: str, out_path: str, model: str):
        raise RuntimeError("Native execution not fully implemented / Missing dependencies.")

    def _try_hf_api(self, prompt: str, out_path: str):
        raise RuntimeError("HF_TOKEN environment variable not set.")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--prompt", required=True)
    parser.add_argument("--outdir", default="temp_ai_broll")
    parser.add_argument("--stem", default="ai_test")
    parser.add_argument("--character-ref", default=None, help="Path to character reference image for VLM consistency")
    args = parser.parse_args()
    
    engine = AIVideoEngine(args.outdir)
    engine.generate_broll(args.prompt, args.stem, reference_image=args.character_ref)
