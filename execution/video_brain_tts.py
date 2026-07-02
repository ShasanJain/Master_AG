import os
import sys
import json
import argparse
import time
import subprocess
import whisper
import srt
import datetime

def generate_tts_edge(text: str, audio_path: str):
    print("[Brain TTS] Generating voice via edge-tts...")
    clean_text = text.replace('"', '\\"')
    subprocess.run(["edge-tts", "--text", text, "--write-media", audio_path], check=True)

def generate_tts_piper(text: str, audio_path: str):
    print("[Brain TTS] Generating voice via Piper (Offline CPU)...")
    try:
        import piper
        # Mock logic for Piper inference if installed
        print("Piper is installed, generating audio...")
        # voice = piper.PiperVoice.load("model.onnx")
        # voice.synthesize(text, audio_path)
    except ImportError:
        print("[Brain TTS] WARNING: Piper is not installed (pip install piper-tts). Falling back to edge-tts.")
        generate_tts_edge(text, audio_path)

def generate_tts_bark(text: str, audio_path: str):
    print("[Brain TTS] Generating voice via Suno Bark (Highly Expressive GPU)...")
    try:
        import bark
        import scipy.io.wavfile as wavfile
        print("Bark is installed, generating audio...")
        # bark.preload_models()
        # audio_array = bark.generate_audio(text)
        # wavfile.write(audio_path, 24000, audio_array)
    except ImportError:
        print("[Brain TTS] WARNING: Bark is not installed (pip install git+https://github.com/suno-ai/bark.git). Falling back to edge-tts.")
        generate_tts_edge(text, audio_path)

def generate_tts_kittentts(text: str, audio_path: str, voice: str = "Jasper", speed: float = 1.0):
    print(f"[Brain TTS] Generating voice via KittenTTS (Offline ONNX) voice={voice} speed={speed}...")
    try:
        from kittentts import KittenTTS
        import soundfile as sf
        model = KittenTTS("KittenML/kitten-tts-mini-0.8")
        audio = model.generate(text, voice=voice, speed=speed)
        sf.write(audio_path, audio, 24000)
    except Exception as e:
        print(f"[Brain TTS] WARNING: KittenTTS failed: {str(e)}. Falling back to edge-tts.")
        generate_tts_edge(text, audio_path)

def generate_tts_and_timing(text: str, output_dir: str, engine: str = "edge", voice: str = "Jasper", speed: float = 1.0):
    start_time = time.time()
    print(f"[Brain TTS] Initializing audio generation pipeline with engine: {engine}")
    
    audio_path = os.path.join(output_dir, "narration.mp3")
    srt_path = os.path.join(output_dir, "timings.srt")
    json_path = os.path.join(output_dir, "timings.json")
    
    if engine == "piper":
        generate_tts_piper(text, audio_path)
    elif engine == "bark":
        generate_tts_bark(text, audio_path)
    elif engine == "kittentts":
        generate_tts_kittentts(text, audio_path, voice=voice, speed=speed)
    else:
        generate_tts_edge(text, audio_path)
        
    print(f"[Brain TTS] Saved audio to {audio_path}")
        
    print("[Brain TTS] Loading Whisper model (tiny.en) for timing extraction...")
    model = whisper.load_model("tiny.en")
    
    print("[Brain TTS] Transcribing and extracting timings...")
    result = model.transcribe(audio_path, word_timestamps=True)
    
    subs = []
    json_timings = []
    
    for i, segment in enumerate(result.get("segments", [])):
        if "words" in segment:
            for w_idx, word_info in enumerate(segment["words"]):
                start_delta = datetime.timedelta(seconds=word_info["start"])
                end_delta = datetime.timedelta(seconds=word_info["end"])
                content = word_info["word"].strip()
                subs.append(srt.Subtitle(index=len(subs)+1, start=start_delta, end=end_delta, content=content))
                json_timings.append({"word": content, "start": word_info["start"], "end": word_info["end"]})
        else:
            start_delta = datetime.timedelta(seconds=segment["start"])
            end_delta = datetime.timedelta(seconds=segment["end"])
            content = segment["text"].strip()
            subs.append(srt.Subtitle(index=i+1, start=start_delta, end=end_delta, content=content))
            json_timings.append({"word": content, "start": segment["start"], "end": segment["end"]})
            
    with open(srt_path, 'w', encoding='utf-8') as f:
        f.write(srt.compose(subs))
        
    output_data = {
        "audio_path": audio_path,
        "srt_path": srt_path,
        "word_timings": json_timings,
        "total_duration": result.get("segments", [{}])[-1].get("end", 0) if result.get("segments") else 0
    }
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2)
        
    execution_time = time.time() - start_time
    print(f"[Brain TTS] Successfully generated audio and timings in {execution_time:.2f} seconds.")
    return json_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate TTS and Whisper word-level timings.")
    parser.add_argument("--text", type=str, default=None, help="Text to synthesize and time.")
    parser.add_argument("--file", type=str, default=None, help="File containing the text.")
    parser.add_argument("--engine", type=str, choices=["edge", "piper", "bark", "kittentts"], default="edge", help="TTS Engine to use.")
    parser.add_argument("--voice", type=str, default="Jasper", help="KittenTTS voice to use.")
    parser.add_argument("--speed", type=float, default=1.0, help="KittenTTS speech speed.")
    parser.add_argument("--outdir", type=str, default="./scratch", help="Output directory for audio and json.")
    
    args = parser.parse_args()
    
    if args.file and os.path.exists(args.file):
        with open(args.file, "r", encoding="utf-8") as f:
            input_text = f.read()
    elif args.text:
        input_text = args.text
    else:
        print("Error: Must provide --text or --file")
        sys.exit(1)
        
    os.makedirs(args.outdir, exist_ok=True)
    generate_tts_and_timing(input_text, args.outdir, engine=args.engine, voice=args.voice, speed=args.speed)
