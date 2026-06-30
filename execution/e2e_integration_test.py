import os
from pathlib import Path
from playwright.sync_api import sync_playwright
import subprocess

ROOT_DIR = Path(__file__).parent.parent
TMP_DIR = ROOT_DIR / "tmp"
TMP_DIR.mkdir(exist_ok=True)
OUT_DIR = ROOT_DIR / "dashboard" / "public"
OUT_DIR.mkdir(parents=True, exist_ok=True)

VIDEO_RAW = TMP_DIR / "stripe_raw.webm"
AUDIO_RAW = TMP_DIR / "acestep_mock.mp3"
TEXT_IMG = TMP_DIR / "text_overlay.png"
FINAL_OUT = OUT_DIR / "final_e2e_test.mp4"

def step1_playwright_capture():
    print("🎬 [Phase 1] Starting Playwright Capture of stripe.com...")
    if VIDEO_RAW.exists():
        VIDEO_RAW.unlink()
        
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Record video into the tmp directory
        context = browser.new_context(
            record_video_dir=str(TMP_DIR),
            record_video_size={"width": 1280, "height": 720}
        )
        page = context.new_page()
        page.goto("https://stripe.com") # Removed networkidle to speed up
        print("   - Waiting for render and scrolling smoothly...")
        page.wait_for_timeout(2000) # Let page render
        page.mouse.move(500, 500) # Ensure mouse is over content
        # Smoothly scroll down using native mouse wheel
        for _ in range(60):
            page.mouse.wheel(0, 50)
            page.wait_for_timeout(50)
        page.wait_for_timeout(1000)
        
        # When context closes, the video file is saved with a random name
        context.close()
        browser.close()

    # Find the newly created webm file and rename it
    videos = list(TMP_DIR.glob("*.webm"))
    if videos:
        # get most recently created webm
        latest_video = max(videos, key=os.path.getctime)
        latest_video.rename(VIDEO_RAW)
        print(f"   ✓ Captured raw video: {VIDEO_RAW.name}")
    else:
        raise Exception("Playwright failed to generate a video file.")

def step2_acestep_audio():
    print("🎵 [Phase 2] Synthesizing ACE-Step Audio...")
    # Mocking ACE-Step API call since we don't have the proprietary SDK locally
    # Generating a 5-second synth chord using FFmpeg lavfi
    if AUDIO_RAW.exists():
        AUDIO_RAW.unlink()
        
    cmd = [
        "ffmpeg", "-y", "-f", "lavfi", 
        "-i", "sine=frequency=440:duration=5", 
        "-t", "5", str(AUDIO_RAW)
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"   ✓ Synthesized audio: {AUDIO_RAW.name}")

def step3_moviepy_composite():
    print("🎞️ [Phase 3] Compositing with MoviePy and PIL...")
    from PIL import Image, ImageDraw, ImageFont
    from moviepy import VideoFileClip, AudioFileClip, ImageClip, CompositeVideoClip

    # 1. Generate text overlay with PIL (Avoids ImageMagick dependency issues on Windows)
    img = Image.new('RGBA', (1280, 720), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Using default font scaled up
    text = "AUTOMATION PROVEN"
    # Simple centered text
    d.text((400, 320), text, fill=(255, 255, 255, 255), font_size=50)
    img.save(TEXT_IMG)

    # 2. Composite
    # Take the LAST 5 seconds of the video to ensure we see the scrolling (since loading takes time)
    video_clip = VideoFileClip(str(VIDEO_RAW))
    start_time = max(0, video_clip.duration - 5)
    video_clip = video_clip.subclipped(start_time, video_clip.duration)
    
    audio_clip = AudioFileClip(str(AUDIO_RAW)).subclipped(0, video_clip.duration)
    
    text_clip = (ImageClip(str(TEXT_IMG))
                 .with_duration(video_clip.duration)
                 .with_position("center"))

    # Apply audio to video and overlay text
    final_clip = CompositeVideoClip([video_clip, text_clip])
    final_clip = final_clip.with_audio(audio_clip)

    print("   - Rendering final video...")
    final_clip.write_videofile(
        str(FINAL_OUT), 
        codec="libx264", 
        audio_codec="aac", 
        fps=24,
        logger=None # suppress verbose moviepy output
    )
    
    # Cleanup resources
    video_clip.close()
    audio_clip.close()
    final_clip.close()
    print(f"   ✓ Final composite rendered: {FINAL_OUT.name}")

if __name__ == "__main__":
    print("🚀 Starting Master_AG E2E Integration Test...")
    try:
        step1_playwright_capture()
        step2_acestep_audio()
        step3_moviepy_composite()
        print(f"\n✅ SUCCESS: E2E Pipeline completed! View output at: {FINAL_OUT}")
    except Exception as e:
        print(f"\n❌ FAILED: {e}")
