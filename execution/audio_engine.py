import argparse
import json
import os
import sys
from pydub import AudioSegment

def process_audio(input_file, output_file, volume_change=0):
    try:
        if not os.path.exists(input_file):
            print(json.dumps({"error": f"Input file not found: {input_file}"}))
            sys.exit(1)

        # Load audio (assuming wav or mp3)
        ext = input_file.split('.')[-1].lower()
        if ext not in ['wav', 'mp3', 'ogg', 'flv', 'mp4']:
            ext = 'mp4' if ext == 'mp4' else 'wav'
            
        audio = AudioSegment.from_file(input_file)

        # Apply volume change (db)
        if volume_change != 0:
            audio = audio + volume_change

        # Export audio
        out_ext = output_file.split('.')[-1].lower()
        out_format = 'mp3' if out_ext == 'mp3' else 'wav'
        
        audio.export(output_file, format=out_format)

        result = {
            "success": True,
            "input_file": input_file,
            "output_file": output_file,
            "volume_change": volume_change,
            "duration_ms": len(audio)
        }
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--volume", type=float, default=0, help="Volume change in dB")
    args = parser.parse_args()
    
    process_audio(args.input, args.output, args.volume)
