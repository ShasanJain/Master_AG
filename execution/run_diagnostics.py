import os
import json
import sys
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).parent.parent
DASHBOARD_PUBLIC_DIR = ROOT_DIR / "dashboard" / "public" / "diagnostics"
DASHBOARD_PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

results = {
    "acestep": {"status": "UNKNOWN", "message": "", "guide": ""},
    "runpod": {"status": "UNKNOWN", "message": "", "guide": ""},
    "ltx2": {"status": "UNKNOWN", "message": "", "guide": ""},
    "moviepy": {"status": "UNKNOWN", "message": "", "guide": "", "file": ""},
    "playwright": {"status": "UNKNOWN", "message": "", "guide": "", "file": ""}
}

def check_env():
    # Load .env manually if needed, but assuming process env for now
    env_file = ROOT_DIR / ".env"
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    k, v = line.strip().split("=", 1)
                    os.environ[k] = v

def test_acestep():
    key = os.environ.get("ACEMUSIC_API_KEY")
    if not key:
        results["acestep"] = {
            "status": "NOT_CONFIGURED",
            "message": "ACEMUSIC_API_KEY not found in .env.",
            "guide": "You can get a free API key at https://acemusic.ai/api-key. Add it to .env as ACEMUSIC_API_KEY."
        }
    else:
        results["acestep"] = {"status": "OK", "message": "API Key found.", "guide": ""}

def test_runpod():
    key = os.environ.get("RUNPOD_API_KEY")
    if not key:
        results["runpod"] = {
            "status": "NOT_CONFIGURED",
            "message": "RUNPOD_API_KEY not found in .env.",
            "guide": "RunPod is a paid cloud GPU service. Create an account at https://runpod.io, load $10 in credits, and add RUNPOD_API_KEY to your .env."
        }
    else:
        results["runpod"] = {"status": "OK", "message": "API Key found.", "guide": ""}

def test_ltx2():
    url = os.environ.get("MODAL_LTX2_ENDPOINT_URL")
    if not url:
        results["ltx2"] = {
            "status": "NOT_CONFIGURED",
            "message": "MODAL_LTX2_ENDPOINT_URL not found in .env.",
            "guide": "LTX-2 requires deploying a Modal backend. Sign up at https://modal.com, run `modal deploy docker/modal-ltx2/app.py`, and add the resulting URL to .env."
        }
    else:
        results["ltx2"] = {"status": "OK", "message": "Endpoint configured.", "guide": ""}

def test_moviepy():
    try:
        import moviepy
        from PIL import Image
        results["moviepy"] = {
            "status": "OK", 
            "message": "MoviePy and Pillow are installed. Capable of local compositing.", 
            "guide": ""
        }
    except ImportError:
        results["moviepy"] = {
            "status": "NOT_CONFIGURED",
            "message": "Missing dependencies.",
            "guide": "Run: python -m pip install moviepy Pillow"
        }

def test_playwright():
    try:
        from playwright.sync_api import sync_playwright
        results["playwright"] = {
            "status": "OK",
            "message": "Playwright is installed. Ready for browser automation.",
            "guide": ""
        }
    except ImportError:
        results["playwright"] = {
            "status": "NOT_CONFIGURED",
            "message": "Missing dependencies.",
            "guide": "Run: npm install -D playwright @playwright/test && npx playwright install chromium"
        }

if __name__ == "__main__":
    check_env()
    test_acestep()
    test_runpod()
    test_ltx2()
    test_moviepy()
    test_playwright()
    print(json.dumps(results))
