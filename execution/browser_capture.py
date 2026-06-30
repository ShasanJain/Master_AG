import sys
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

def capture_url(url):
    print(f"[PLAYBACK] Starting Playwright Capture of URL: {url}")
    sys.stdout.flush()
    
    root_dir = Path(__file__).parent.parent
    tmp_dir = root_dir / "tmp"
    tmp_dir.mkdir(exist_ok=True)
    
    out_dir = root_dir / "dashboard" / "public"
    out_dir.mkdir(parents=True, exist_ok=True)
    final_out = out_dir / "browser_run.webm"
    
    # Remove existing video
    for p in [final_out, out_dir / "browser_run.mp4"]:
        if p.exists():
            try:
                p.unlink()
            except:
                pass
        
    try:
        with sync_playwright() as p:
            print("[+] Launching headless Chromium browser...")
            sys.stdout.flush()
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                record_video_dir=str(tmp_dir),
                record_video_size={"width": 1280, "height": 720}
            )
            page = context.new_page()
            print(f"[+] Navigating to {url}...")
            sys.stdout.flush()
            page.goto(url)
            page.wait_for_timeout(3000)
            
            print("[+] Performing smooth mouse scroll...")
            sys.stdout.flush()
            page.mouse.move(640, 360)
            for _ in range(30):
                page.mouse.wheel(0, 100)
                page.wait_for_timeout(100)
            page.wait_for_timeout(2000)
            
            context.close()
            browser.close()
            
        videos = list(tmp_dir.glob("*.webm"))
        if videos:
            latest_video = max(videos, key=os.path.getctime)
            latest_video.rename(final_out)
            print(f"[OK] Capture successfully saved to public/browser_run.webm")
            sys.stdout.flush()
        else:
            print("[X] Playwright failed to generate a video file.")
            sys.stdout.flush()
    except Exception as e:
        print(f"[X] Playwright Error: {e}")
        sys.stdout.flush()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python browser_capture.py <url>")
        sys.exit(1)
    capture_url(sys.argv[1])
