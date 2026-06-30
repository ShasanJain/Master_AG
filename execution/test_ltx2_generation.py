import os
import json
import base64
import requests
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
OUT_DIR = ROOT_DIR / "dashboard" / "public"
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_FILE = OUT_DIR / "ltx2_test.mp4"

def load_env():
    env_file = ROOT_DIR / ".env"
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    k, v = line.strip().split("=", 1)
                    os.environ[k] = v

def main():
    load_env()
    
    endpoint_url = os.environ.get("MODAL_LTX2_ENDPOINT_URL")
    if not endpoint_url:
        print("❌ Error: MODAL_LTX2_ENDPOINT_URL not found in .env.")
        return

    print("🚀 Pinging LTX-2 Modal Endpoint...")
    print(f"URL: {endpoint_url}")
    
    payload = {
        "prompt": "Cinematic slow motion macro shot of glowing blue neon particles floating in dark space.",
        "num_frames": 41,          # Fast test (approx 1.5 seconds)
        "num_inference_steps": 20, # Lower steps for speed
        "fps": 24
    }
    
    print("\n📦 Sending Payload:")
    print(json.dumps(payload, indent=2))
    print("\n⏳ Waiting for Modal A100 GPUs to render (this may take 1-2 minutes)...")
    
    try:
        response = requests.post(endpoint_url, json=payload, timeout=300)
        response.raise_for_status()
        
        data = response.json()
        if data.get("success"):
            print(f"✅ Success! Render took {data.get('duration', 0):.2f}s.")
            
            b64_video = data.get("video_base64")
            if b64_video:
                print(f"💾 Saving to {OUT_FILE}...")
                with open(OUT_FILE, "wb") as f:
                    f.write(base64.b64decode(b64_video))
                print("🎉 Test Complete!")
            else:
                print("❌ Error: No video_base64 found in response.")
        else:
            print(f"❌ Error: API returned success=False. {data}")
            
    except Exception as e:
        print(f"❌ Request Failed: {e}")

if __name__ == "__main__":
    main()
