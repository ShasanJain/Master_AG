import os
import sys
import json
import argparse
import subprocess
from pathlib import Path
from datetime import datetime

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

if os.getenv("GEMINI_API_KEY") and not os.getenv("GOOGLE_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KEY")

# Setup paths to ensure local imports work
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

def run_daily_pipeline(ticker: str, provider: str, rounds: int, model: str = None, bypass_swarm: bool = False, voice: str = "en-US-AndrewNeural"):

    print("==================================================")
    print("      JACK QUANT-MEDIA PASSIVE CONTENT FARM       ")
    print("==================================================")
    
    scratch_dir = BASE_DIR / "scratch"
    output_dir = BASE_DIR / "output" / "media"
    
    scratch_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Run multi-agent consensus backtest
    if not bypass_swarm:
        print(f"\n[Step 1] Running Swarm debate for stock ticker: {ticker}...")
        run_swarm_cmd = [
            sys.executable,
            str(BASE_DIR / "execution" / "run_trading_agents.py"),
            "--ticker", ticker,
            "--provider", provider,
            "--rounds", str(rounds)
        ]
        if model:
            run_swarm_cmd.extend(["--model", model])
            
        subprocess.run(run_swarm_cmd, check=True)
    else:
        print("\n[Step 1] Bypassing swarm simulation. Using existing result file...")

    
    # 2. Parse consensus results
    swarm_output_file = scratch_dir / "trading_agents_output.json"
    if not swarm_output_file.exists():
        print(f"[ERROR] Swarm output file not found at: {swarm_output_file}")
        sys.exit(1)
        
    with open(swarm_output_file, "r", encoding="utf-8") as f:
        result = json.load(f)
        
    if not result.get("success", False):
        print(f"[ERROR] Swarm execution failed: {result.get('error', 'Unknown Error')}")
        sys.exit(1)
        
    action = result.get("action", "HOLD")
    confidence = result.get("confidence", "50%")
    details = result.get("details", "AI consensus reached.")
    
    # Build narration script outline
    script_text = f"Our quant AI swarm just finished debating {ticker} stock. " \
                  f"The final consensus verdict is a {action} with {confidence} confidence. " \
                  f"Here is why: {details}. Stay tuned for daily automated backtests!"
                  
    print(f"\n[Step 2] Compiled Short Video Script Outline:\n\"{script_text}\"")
    
    # 3. Generate voiceover and timings using Whisper
    print("\n[Step 3 & 4] Generating synthesized voice track and timing map...")
    run_tts_cmd = [
        sys.executable,
        str(BASE_DIR / "execution" / "video_brain_tts.py"),
        "--text", script_text,
        "--engine", "edge",
        "--voice", voice,
        "--outdir", str(scratch_dir)
    ]


    subprocess.run(run_tts_cmd, check=True)
    
    # 4. Construct timeline JSON for MoviePy
    # Find background video
    bg_video = BASE_DIR / "assets" / "broll" / "abstract_new.mp4"
    if not bg_video.exists():
        # Fallback to any mp4 in broll
        broll_clips = list((BASE_DIR / "assets" / "broll").glob("*.mp4"))
        if broll_clips:
            bg_video = broll_clips[0]
        else:
            print("[ERROR] No background video files found under assets/broll/")
            sys.exit(1)
            
    print(f"\n[Step 5] Mapping timeline.json with background asset: {bg_video.name}...")
    
    product_img = BASE_DIR / "assets" / "broll" / f"{ticker}_product.png"
    chart_img = BASE_DIR / "assets" / "broll" / f"{ticker}_chart.png"
    
    segments = []
    # 0 to 5s: B-roll Video
    segments.append({
        "type": "video",
        "clip_path": str(bg_video),
        "start": 0,
        "end": 5
    })
    # 5 to 12s: Product image if exists, else B-roll
    segments.append({
        "type": "image" if product_img.exists() else "video",
        "clip_path": str(product_img) if product_img.exists() else str(bg_video),
        "start": 5,
        "end": 12
    })
    # 12 to 18s: B-roll Video
    segments.append({
        "type": "video",
        "clip_path": str(bg_video),
        "start": 12,
        "end": 18
    })
    # 18 to 25s: Chart image if exists, else B-roll
    segments.append({
        "type": "image" if chart_img.exists() else "video",
        "clip_path": str(chart_img) if chart_img.exists() else str(bg_video),
        "start": 18,
        "end": 25
    })
    # 25 to 35s: B-roll Video
    segments.append({
        "type": "video",
        "clip_path": str(bg_video),
        "start": 25,
        "end": 35
    })
    
    timeline_data = {
        "segments": segments
    }


    
    timeline_file = scratch_dir / "timeline.json"
    with open(timeline_file, "w", encoding="utf-8") as f:
        json.dump(timeline_data, f, indent=2)
        
    # 5. Render Video
    output_video = output_dir / f"{ticker}_verdict_{datetime.today().strftime('%Y%m%d')}.mp4"
    print(f"\n[Step 6] Rendering finished caption-overlay short video to: {output_video}...")
    
    run_render_cmd = [
        sys.executable,
        str(BASE_DIR / "execution" / "moviepy_renderer.py"),
        "--timeline", str(timeline_file),
        "--timings", str(scratch_dir / "timings.json"),
        "--output", str(output_video),
        "--profile", "FastViral"
    ]
    
    # Add background music if available
    bg_music = BASE_DIR / "assets" / "background.mp3"
    if bg_music.exists():
        run_render_cmd.extend(["--music", str(bg_music)])
        
    subprocess.run(run_render_cmd, check=True)
    print("==================================================")
    print(f"PIPELINE COMPLETED SUCCESS: {output_video.name}")
    print("==================================================")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Quant-Media Content Farm Orchestrator")
    parser.add_argument("--ticker", type=str, default="TSLA", help="Stock ticker to simulate.")
    parser.add_argument("--provider", type=str, default="ollama", help="LLM Provider to use.")
    parser.add_argument("--model", type=str, default=None, help="Specific LLM model to run.")
    parser.add_argument("--rounds", type=int, default=1, help="Number of debate rounds.")
    parser.add_argument("--bypass-swarm", action="store_true", help="Bypass the swarm backtest simulation and use existing output.")
    parser.add_argument("--voice", type=str, default="en-US-AndrewNeural", help="Voice profile for edge-tts neural voice.")
    
    args = parser.parse_args()
    run_daily_pipeline(args.ticker, args.provider, args.rounds, args.model, args.bypass_swarm, args.voice)


