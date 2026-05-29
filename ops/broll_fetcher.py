import os
import sys
import json
import requests
import argparse
import urllib.parse
import re

def clean_keyword(topic):
    # Get just the primary noun or keyword for better searching
    words = [w for w in topic.split() if len(w) > 3]
    return words[0] if words else "technology"

def fetch_wikimedia_broll(topic, output_dir, max_clips=3):
    keyword = clean_keyword(topic)
    print(f"[B-Roll Fetcher] Searching Wikimedia Commons for videos related to '{keyword}'...")
    
    search_url = "https://commons.wikimedia.org/w/api.php"
    search_params = {
        "action": "query",
        "list": "search",
        "srnamespace": "6", # File namespace
        "srsearch": f"{keyword} type:video",
        "format": "json"
    }
    headers = {'User-Agent': 'AntigravityReelStudio/1.0 (contact@example.com)'}
    
    try:
        response = requests.get(search_url, params=search_params, headers=headers)
        response.raise_for_status()
        data = response.json()
        search_results = data.get("query", {}).get("search", [])
        
        if not search_results:
            print(f"[B-Roll Fetcher] No results found for '{keyword}'. Using fallback keyword 'nature'.")
            search_params["srsearch"] = "nature type:video"
            response = requests.get(search_url, params=search_params, headers=headers)
            search_results = response.json().get("query", {}).get("search", [])
        
        os.makedirs(output_dir, exist_ok=True)
        downloaded = 0
        
        for result in search_results:
            if downloaded >= max_clips:
                break
                
            title = result["title"]
            # Fetch the actual video URL
            info_params = {
                "action": "query",
                "titles": title,
                "prop": "videoinfo",
                "viprop": "url",
                "format": "json"
            }
            info_res = requests.get(search_url, params=info_params, headers=headers)
            info_data = info_res.json()
            
            pages = info_data.get("query", {}).get("pages", {})
            for page_id, page_info in pages.items():
                videoinfo = page_info.get("videoinfo", [])
                if videoinfo:
                    video_url = videoinfo[0].get("url")
                    
                    if video_url and (video_url.endswith(".webm") or video_url.endswith(".mp4") or video_url.endswith(".ogv")):
                        # Next.js and typical players prefer mp4 or webm.
                        print(f"[B-Roll Fetcher] Downloading: {title}...")
                        try:
                            vid_data = requests.get(video_url, stream=True, headers=headers)
                            
                            safe_name = re.sub(r'[^A-Za-z0-9]', '_', keyword) + f"_{downloaded}.mp4"
                            out_path = os.path.join(output_dir, safe_name)
                            
                            with open(out_path, 'wb') as f:
                                for chunk in vid_data.iter_content(chunk_size=8192):
                                    f.write(chunk)
                                    
                            print(f"[B-Roll Fetcher] Saved -> {out_path}")
                            downloaded += 1
                        except Exception as e:
                            print(f"[B-Roll Fetcher] Failed to download {video_url}: {e}")
                            
        print(f"[B-Roll Fetcher] Successfully fetched {downloaded} clips.")
        return downloaded > 0
    except Exception as e:
        print(f"[B-Roll Fetcher] Critical error fetching B-Roll: {e}")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--topic", required=True, help="Topic to search for")
    parser.add_argument("--outdir", default=os.path.join(os.path.dirname(__file__), "..", "assets", "broll"))
    parser.add_argument("--count", type=int, default=3)
    args = parser.parse_args()
    
    fetch_wikimedia_broll(args.topic, args.outdir, args.count)
