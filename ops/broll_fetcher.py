"""
broll_fetcher.py  — download topic-matched B-roll via yt-dlp (no API key required).

Strategy:
  1. `ytsearch<N>:<topic>` -> yt-dlp finds real YouTube videos
  2. Download only the first MAX_CLIP_SEC seconds (ffmpeg post-process)
  3. Validate file size; fall back to built-in clips if yt-dlp yields nothing
"""

import os
import re
import sys
import json
import shutil
import argparse
import subprocess

MAX_CLIP_SEC  = 20       # seconds to grab from each YouTube video
MIN_FILE_BYTES = 100_000  # reject anything smaller (error pages / corrupt)

BUILTIN_CLIPS = [
    os.path.join(os.path.dirname(__file__), "..", "assets", "broll", "abstract_new.mp4"),
    os.path.join(os.path.dirname(__file__), "..", "assets", "broll", "city_new.mp4"),
    os.path.join(os.path.dirname(__file__), "..", "assets", "broll", "nature_new.mp4"),
    os.path.join(os.path.dirname(__file__), "..", "assets", "broll", "MVI_1584.MP4"),
]


# ─── helpers ──────────────────────────────────────────────────────────────────

def safe_stem(topic: str) -> str:
    words = re.sub(r"[^A-Za-z0-9 ]", "", topic).split()
    return "_".join(words[:3]) if words else "broll"


def is_valid(path: str) -> bool:
    return os.path.exists(path) and os.path.getsize(path) >= MIN_FILE_BYTES


def cleanup_invalid(path: str):
    if os.path.exists(path) and not is_valid(path):
        os.remove(path)


# ─── yt-dlp fetcher ───────────────────────────────────────────────────────────

def fetch_youtube(topic: str, output_dir: str, max_clips: int = 3) -> int:
    """
    Search YouTube for `topic`, download first MAX_CLIP_SEC seconds of each
    result as an mp4.  Returns number of valid clips saved.
    """
    stem = safe_stem(topic)
    # yt-dlp search query — grab 2× as many results in case some fail
    search_query = f"ytsearch{max_clips * 2}:{topic} b-roll footage"

    print(f"[B-Roll] yt-dlp search: '{search_query}'")

    # First, collect video URLs/IDs with --print id (fast, no download)
    id_cmd = [
        "yt-dlp",
        "--flat-playlist",
        "--print", "id",
        "--no-warnings",
        search_query,
    ]
    try:
        result = subprocess.run(id_cmd, capture_output=True, text=True, timeout=30)
        video_ids = [v.strip() for v in result.stdout.strip().splitlines() if v.strip()]
    except Exception as e:
        print(f"[B-Roll] yt-dlp ID fetch failed: {e}")
        return 0

    if not video_ids:
        print(f"[B-Roll] No YouTube results for '{topic}'")
        return 0

    print(f"[B-Roll] Found {len(video_ids)} candidates -> downloading {max_clips}")

    downloaded = 0
    for i, vid_id in enumerate(video_ids):
        if downloaded >= max_clips:
            break

        out_path = os.path.join(output_dir, f"{stem}_{downloaded}.mp4")

        # Skip if a valid clip already exists (cache)
        if is_valid(out_path):
            print(f"[B-Roll] Cache hit: {out_path}")
            downloaded += 1
            continue

        url = f"https://www.youtube.com/watch?v={vid_id}"
        print(f"[B-Roll] Downloading clip {downloaded+1}/{max_clips}: {url}")

        dl_cmd = [
            "yt-dlp",
            "-f", "bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/best[ext=mp4][height<=720]/best",
            "--merge-output-format", "mp4",
            # clip to first MAX_CLIP_SEC seconds via ffmpeg
            "--postprocessor-args", f"ffmpeg:-ss 0 -t {MAX_CLIP_SEC}",
            "--no-playlist",
            "--no-warnings",
            "-o", out_path,
            url,
        ]

        try:
            proc = subprocess.run(dl_cmd, capture_output=True, text=True, timeout=120)
            if is_valid(out_path):
                print(f"[B-Roll] Saved -> {out_path}  ({os.path.getsize(out_path)//1024} KB)")
                downloaded += 1
            else:
                cleanup_invalid(out_path)
                print(f"[B-Roll] Clip invalid, skipping ({url})")
        except subprocess.TimeoutExpired:
            print(f"[B-Roll] Timeout on {url}, skipping")
            cleanup_invalid(out_path)
        except Exception as e:
            print(f"[B-Roll] Error on {url}: {e}")
            cleanup_invalid(out_path)

    return downloaded


# ─── built-in fallback ────────────────────────────────────────────────────────

def use_builtin_fallback(topic: str, output_dir: str, max_clips: int = 3) -> int:
    print("[B-Roll] Using built-in clip library as fallback")
    real = [c for c in BUILTIN_CLIPS if is_valid(c)]
    if not real:
        print("[B-Roll] ERROR: No built-in clips found!")
        return 0

    stem = safe_stem(topic)
    copied = 0
    for i in range(min(max_clips, len(real))):
        src  = real[i % len(real)]
        dest = os.path.join(output_dir, f"{stem}_{i}.mp4")
        if not is_valid(dest):
            shutil.copy2(src, dest)
            print(f"[B-Roll] Copied built-in {os.path.basename(src)} -> {dest}")
        copied += 1
    return copied


# ─── main ─────────────────────────────────────────────────────────────────────

def fetch_broll(topic: str, output_dir: str, max_clips: int = 3) -> int:
    os.makedirs(output_dir, exist_ok=True)

    n = fetch_youtube(topic, output_dir, max_clips)

    if n == 0:
        print("[B-Roll] yt-dlp yielded nothing -> falling back to built-in clips")
        n = use_builtin_fallback(topic, output_dir, max_clips)

    print(f"[B-Roll] Done — {n} clips ready in {output_dir}")
    return n


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--topic",  required=True,  help="Topic to search on YouTube")
    parser.add_argument("--outdir", default=os.path.join(os.path.dirname(__file__), "..", "assets", "broll"))
    parser.add_argument("--count",  type=int, default=3)
    args = parser.parse_args()
    fetch_broll(args.topic, args.outdir, args.count)
