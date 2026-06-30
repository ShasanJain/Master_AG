import os
import json
import math
import requests
from typing import Optional
from moviepy.editor import AudioFileClip, VideoFileClip, concatenate_videoclips, ImageClip

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config", "hardware_profile.json")

class AvatarAIEngine:
    """
    Audio-driven AI Avatar Video Generator.
    Implements Temporal Slicing to prevent VRAM OOM on low-end hardware.
    """
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        self.profile = self._load_profile()
        self.chunk_duration = 3.0  # seconds per slice to prevent VRAM overflow

    def _load_profile(self) -> dict:
        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        return {"model": "wan2.1", "backend": "comfyui", "vram_gb": 4.0, "comfyui_url": "http://127.0.0.1:8188"}

    def generate_avatar(self, image_path: str, audio_path: str, filename_stem: str) -> Optional[str]:
        final_out_path = os.path.join(self.output_dir, f"{filename_stem}.mp4")
        if os.path.exists(final_out_path):
            print(f"[Avatar AI] Cache hit -> {final_out_path}")
            return final_out_path

        model = self.profile.get("model", "wan2.1")
        backend = self.profile.get("backend", "comfyui")

        print(f"\n[Avatar AI] Starting Temporal Slicing generation.")
        print(f"[Avatar AI] Using: {model.upper()} via {backend.upper()} (Chunk size: {self.chunk_duration}s)")

        try:
            audio = AudioFileClip(audio_path)
            total_duration = audio.duration
            chunks = math.ceil(total_duration / self.chunk_duration)
            print(f"[Avatar AI] Slicing {total_duration:.1f}s audio into {chunks} chunks...")

            video_chunks = []
            for i in range(chunks):
                start = i * self.chunk_duration
                end = min((i + 1) * self.chunk_duration, total_duration)
                chunk_audio_path = os.path.join(self.output_dir, f"{filename_stem}_chunk_{i}.wav")
                
                audio_subclip = audio.subclip(start, end)
                audio_subclip.write_audiofile(chunk_audio_path, logger=None)
                
                print(f"[Avatar AI] Generating chunk {i+1}/{chunks} ({start:.1f}s - {end:.1f}s)...")
                chunk_video = self._generate_chunk(image_path, chunk_audio_path, model, backend)
                
                if chunk_video:
                    video_chunks.append(VideoFileClip(chunk_video))
                else:
                    raise RuntimeError("Chunk generation failed.")

            print("[Avatar AI] Stitching chunks back together...")
            final_video = concatenate_videoclips(video_chunks)
            # Reattach the original full audio to ensure perfect sync
            final_video = final_video.set_audio(audio)
            final_video.write_videofile(final_out_path, codec="libx264", audio_codec="aac", fps=30, logger=None)
            
            print(f"[Avatar AI] Success! Final avatar saved to: {final_out_path}")
            return final_out_path
            
        except Exception as e:
            print(f"[Avatar AI] X Generation failed: {e}")
            print("[Avatar AI] Returning 'FAILED' flag for renderer fallback.")
            return "FAILED"

    def _generate_chunk(self, image_path: str, audio_path: str, model: str, backend: str) -> Optional[str]:
        # Simulate processing time and return a dummy clip for now since Comfy isn't running
        if backend == "comfyui":
            url = f"{self.profile.get('comfyui_url')}/prompt"
            workflow = {
                "prompt": {
                    "3": {"class_type": "LoadImage", "inputs": {"image": image_path}},
                    "4": {"class_type": "LoadAudio", "inputs": {"audio": audio_path}},
                    # MultiTalk nodes go here...
                }
            }
            # Simulate a fail if ComfyUI isn't actually running
            try:
                # resp = requests.post(url, json=workflow, timeout=5)
                raise requests.exceptions.RequestException()
            except requests.exceptions.RequestException:
                raise RuntimeError("ComfyUI server not running.")
        return None

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True)
    parser.add_argument("--audio", required=True)
    parser.add_argument("--outdir", default="temp_avatar")
    parser.add_argument("--stem", default="avatar_test")
    args = parser.parse_args()
    
    engine = AvatarAIEngine(args.outdir)
    engine.generate_avatar(args.image, args.audio, args.stem)
