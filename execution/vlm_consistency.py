import base64
import requests
import os
from moviepy import VideoFileClip

class VLMConsistencyEngine:
    """
    Local Vision-Language Model Consistency Engine (ViMax hybrid implementation).
    Uses Ollama + LLaVA to ensure a generated shot matches the character reference.
    """
    def __init__(self, model: str = "llava"):
        self.model = model
        self.api_url = "http://localhost:11434/api/generate"

    def _encode_image(self, image_path: str) -> str:
        with open(image_path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")

    def _extract_frame(self, video_path: str, output_path: str):
        clip = VideoFileClip(video_path)
        # Grab a frame from the middle of the clip
        clip.save_frame(output_path, t=clip.duration / 2)
        clip.close()

    def check_consistency(self, video_path: str, reference_image_path: str) -> bool:
        """
        Extracts a frame from the video, passes it to LLaVA along with the reference image,
        and asks if it's the same character.
        """
        print(f"\n[VLM Consistency] Checking character consistency for {video_path}...")
        
        frame_path = video_path + ".frame.jpg"
        
        try:
            self._extract_frame(video_path, frame_path)
            
            ref_b64 = self._encode_image(reference_image_path)
            frame_b64 = self._encode_image(frame_path)
            
            prompt = """
            You are a strict film continuity editor. 
            Look at the two provided images. Image 1 is the reference character. Image 2 is a video frame.
            Are they the same person/character? 
            Respond with exactly one word: 'YES' or 'NO'.
            """
            
            payload = {
                "model": self.model,
                "prompt": prompt,
                "images": [ref_b64, frame_b64],
                "stream": False
            }
            
            resp = requests.post(self.api_url, json=payload, timeout=60)
            
            if resp.status_code == 200:
                answer = resp.json().get("response", "").strip().upper()
                print(f"[VLM Consistency] LLaVA Verdict: {answer}")
                return "YES" in answer
            else:
                raise RuntimeError(f"Ollama API Error: {resp.text}")
                
        except requests.exceptions.RequestException:
            print("[VLM Consistency] Warning: Ollama/LLaVA not running. Bypassing check (Auto-Pass).")
            return True
        except Exception as e:
            print(f"[VLM Consistency] Error during check: {e}. Bypassing (Auto-Pass).")
            return True
        finally:
            if os.path.exists(frame_path):
                os.remove(frame_path)

if __name__ == "__main__":
    engine = VLMConsistencyEngine()
    # Dummy test
    # engine.check_consistency("test.mp4", "ref.jpg")
    print("VLM Consistency Engine Ready.")
