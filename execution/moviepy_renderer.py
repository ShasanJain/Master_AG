import os
import sys
import json
import argparse
import random
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from moviepy import VideoFileClip, AudioFileClip, ImageClip, CompositeVideoClip, CompositeAudioClip

def hex_to_rgba(hex_code, alpha=255):
    hex_code = hex_code.lstrip('#')
    return tuple(int(hex_code[i:i+2], 16) for i in (0, 2, 4)) + (alpha,)

def get_windows_font(font_name="Impact"):
    """Returns a path to a font on Windows."""
    paths = [
        f"C:\\Windows\\Fonts\\{font_name}.ttf",
        f"C:\\Windows\\Fonts\\{font_name.lower()}.ttf",
        "C:\\Windows\\Fonts\\Impact.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf"
    ]
    for path in paths:
        if os.path.exists(path):
            return path
    return None

def create_caption_frame(width, height, words, active_word, font_path, profile):
    """
    Creates a transparent frame with the phrase, highlighting the active_word.
    """
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    font_size = profile.get("font_size", 70)
    font = ImageFont.truetype(font_path, font_size) if font_path else ImageFont.load_default()
    
    word_spacings = []
    total_width = 0
    
    for word_info in words:
        w_text = word_info["word"].upper()
        bbox = draw.textbbox((0, 0), w_text, font=font)
        w_width = bbox[2] - bbox[0]
        w_height = bbox[3] - bbox[1]
        word_spacings.append((w_text, w_width, w_height, word_info == active_word))
        total_width += w_width + 20
        
    total_width -= 20
    
    start_x = (width - total_width) // 2
    y_pos = int(height * 0.75)
    
    base_color = hex_to_rgba(profile.get("text_color", "#FFFFFF"))
    highlight_color = hex_to_rgba(profile.get("highlight_color", "#FFFF00"))
    stroke_color = hex_to_rgba(profile.get("stroke_color", "#000000"))
    sw = profile.get("stroke_width", 4)
    
    curr_x = start_x
    for w_text, w_width, w_height, is_active in word_spacings:
        color = highlight_color if is_active else base_color
        
        # Draw stroke
        if sw > 0:
            for dx in range(-sw, sw+1):
                for dy in range(-sw, sw+1):
                    if dx != 0 or dy != 0:
                        draw.text((curr_x + dx, y_pos + dy), w_text, font=font, fill=stroke_color)
                        
        # Draw text
        draw.text((curr_x, y_pos), w_text, font=font, fill=color)
        curr_x += w_width + 20
        
    return np.array(img)

def load_profile(profile_name):
    try:
        config_path = os.path.join(os.path.dirname(__file__), "..", "config", "profiles.json")
        with open(config_path, 'r') as f:
            profiles = json.load(f)
        return profiles["profiles"].get(profile_name, profiles["profiles"]["FastViral"])
    except:
        return {
            "aspect_ratio": "9:16", "font": "Impact", "font_size": 80,
            "text_color": "#FFFFFF", "highlight_color": "#FFFF00",
            "stroke_color": "#000000", "stroke_width": 4, "words_per_chunk": 3,
            "bg_music_volume": 0.1, "sfx_enabled": False, "transitions": "rapid"
        }

def render_beautiful_video(timeline_json: str, timings_json: str, output_path: str, profile_name: str, bg_music_path: str = None, avatar_video_path: str = None):
    print(f"[MoviePy Renderer] Loading profile: {profile_name}")
    profile = load_profile(profile_name)
    
    with open(timeline_json, 'r', encoding='utf-8') as f: timeline_data = json.load(f)
    with open(timings_json, 'r', encoding='utf-8') as f: timings_data = json.load(f)
        
    word_timings = timings_data.get("word_timings", [])
    segments = timeline_data.get("segments", [])
    audio_file = timings_data.get("audio_path", "./scratch/narration.mp3")
    if not os.path.exists(audio_file): audio_file = "./scratch/narration.mp3"
        
    target_w, target_h = (1080, 1920) if profile["aspect_ratio"] == "9:16" else (1920, 1080)
    font_path = get_windows_font(profile["font"])
    
    sfx_dir = os.path.join(os.path.dirname(__file__), "..", "assets", "sfx")
    audio_clips = [AudioFileClip(audio_file)]
    video_clips = []
    
    print("[MoviePy Renderer] Processing B-roll clips...")
    for seg in segments:
        clip_path = seg["clip_path"]
        start_t = seg["start"]
        duration = seg["end"] - start_t
        
        if os.path.exists(clip_path):
            is_image = clip_path.lower().endswith(('.png', '.jpg', '.jpeg'))
            
            if is_image:
                v_clip = ImageClip(clip_path).with_duration(duration)
            else:
                v_clip = VideoFileClip(clip_path)
                if v_clip.duration < duration:
                    from moviepy.video.fx import Loop
                    v_clip = v_clip.with_effects([Loop(duration=duration)])
                else:
                    v_clip = v_clip.subclipped(0, duration)
                
            w, h = v_clip.size
            clip_aspect = w / h if h != 0 else 1
            target_aspect = target_w / target_h
            if avatar_video_path and os.path.exists(avatar_video_path) and avatar_video_path != "FAILED":
                # Split screen mode: B-roll on bottom half
                target_h_broll = target_h // 2
                target_aspect = target_w / target_h_broll
                
                if clip_aspect > target_aspect:
                    new_w = int(h * target_aspect)
                    x1 = (w - new_w) // 2
                    v_clip = v_clip.cropped(x1=x1, y1=0, width=new_w, height=h)
                else:
                    new_h = int(w / target_aspect)
                    y1 = (h - new_h) // 2
                    v_clip = v_clip.cropped(x1=0, y1=y1, width=w, height=new_h)
                    
                v_clip = v_clip.resized((target_w, target_h_broll))
                v_clip = v_clip.with_position(("center", "bottom"))
            else:
                # Full screen mode
                if clip_aspect > target_aspect:
                    new_w = int(h * target_aspect)
                    x1 = (w - new_w) // 2
                    v_clip = v_clip.cropped(x1=x1, y1=0, width=new_w, height=h)
                else:
                    new_h = int(w / target_aspect)
                    y1 = (h - new_h) // 2
                    v_clip = v_clip.cropped(x1=0, y1=y1, width=w, height=new_h)
                    
                v_clip = v_clip.resized((target_w, target_h))
            
            if profile["transitions"] == "crossfade" and start_t > 0:
                from moviepy.video.fx import CrossFadeIn
                v_clip = v_clip.with_effects([CrossFadeIn(0.5)])
                
            v_clip = v_clip.with_start(start_t)
            video_clips.append(v_clip)
            
            if profile["sfx_enabled"] and start_t > 0:
                whoosh = os.path.join(sfx_dir, "whoosh.wav")
                if os.path.exists(whoosh):
                    from moviepy.audio.fx import MultiplyVolume
                    sfx = AudioFileClip(whoosh).with_start(start_t).with_effects([MultiplyVolume(0.3)])
                    audio_clips.append(sfx)
    
    print("[MoviePy Renderer] Generating kinetic subtitles...")
    subtitle_clips = []
    chunk_size = profile["words_per_chunk"]
    chunks = [word_timings[i:i+chunk_size] for i in range(0, len(word_timings), chunk_size)]
        
    for chunk in chunks:
        for word_info in chunk:
            w_start = word_info["start"]
            w_end = word_info["end"]
            frame_np = create_caption_frame(target_w, target_h, chunk, word_info, font_path, profile)
            sub_clip = ImageClip(frame_np).with_start(w_start).with_duration(w_end - w_start)
            subtitle_clips.append(sub_clip)
            
            if profile["sfx_enabled"]:
                pop = os.path.join(sfx_dir, "pop.wav")
                if os.path.exists(pop):
                    from moviepy.audio.fx import MultiplyVolume
                    sfx = AudioFileClip(pop).with_start(w_start).with_effects([MultiplyVolume(0.2)])
                    audio_clips.append(sfx)
            
    print("[MoviePy Renderer] Compositing clips...")
    
    if avatar_video_path == "FAILED":
        print("[MoviePy Renderer] Avatar generation failed. Adding fallback text overlay...")
        from moviepy.video.VideoClip import TextClip
        try:
            fallback_text = TextClip("Avatar couldn't render", fontsize=50, color='red', bg_color='black')
            fallback_text = fallback_text.with_position(("center", "top")).with_duration(AudioFileClip(audio_file).duration)
            subtitle_clips.append(fallback_text)
        except Exception as e:
            print(f"[MoviePy Renderer] Could not create TextClip: {e}")
            
    if avatar_video_path and os.path.exists(avatar_video_path) and avatar_video_path != "FAILED":
        print(f"[MoviePy Renderer] Adding Avatar clip (Split-Screen): {avatar_video_path}")
        avatar_clip = VideoFileClip(avatar_video_path)
        avatar_clip = avatar_clip.resized((target_w, target_h // 2)).with_position(("center", "top"))
        video_clips.insert(0, avatar_clip)
        
    final_video_track = CompositeVideoClip(video_clips + subtitle_clips, size=(target_w, target_h))
    
    final_duration = AudioFileClip(audio_file).duration
    final_video_track = final_video_track.with_duration(final_duration)
    
    if bg_music_path and os.path.exists(bg_music_path):
        bg_music = AudioFileClip(bg_music_path)
        if bg_music.duration < final_duration:
            from moviepy.audio.fx import AudioLoop
            bg_music = bg_music.with_effects([AudioLoop(duration=final_duration)])
        else:
            bg_music = bg_music.subclipped(0, final_duration)
        from moviepy.audio.fx import MultiplyVolume
        bg_music = bg_music.with_effects([MultiplyVolume(profile["bg_music_volume"])])
        audio_clips.append(bg_music)
        
    final_audio = CompositeAudioClip(audio_clips)
    final_video_track = final_video_track.with_audio(final_audio)
    
    print(f"[MoviePy Renderer] Rendering output to: {output_path}")
    final_video_track.write_videofile(
        output_path, fps=30, codec="libx264", audio_codec="aac",
        threads=4, preset="ultrafast"
    )
    print("[MoviePy Renderer] Render complete!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--timeline", type=str, default="./scratch/semantic_timeline.json")
    parser.add_argument("--timings", type=str, default="./scratch/timings.json")
    parser.add_argument("--output", type=str, default="./scratch/final_output.mp4")
    parser.add_argument("--profile", type=str, default="FastViral")
    parser.add_argument("--music", type=str, default=None)
    parser.add_argument("--avatar", type=str, default=None)
    args = parser.parse_args()
    render_beautiful_video(args.timeline, args.timings, args.output, args.profile, args.music, args.avatar)
