import os
import sys
import time
import requests
import jwt
import re
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# --- Configuration ---
GHOST_API_URL = os.environ.get('GHOST_API_URL', 'http://localhost:2368')
GHOST_ADMIN_KEY = os.environ.get('GHOST_ADMIN_API_KEY')
MODAL_LTX2_URL = os.environ.get('MODAL_LTX2_ENDPOINT_URL')
MODEL = "llama3.2"

def get_ghost_token():
    if not GHOST_ADMIN_KEY:
        raise ValueError("Missing GHOST_ADMIN_API_KEY in .env.")
    id_str, secret = GHOST_ADMIN_KEY.split(':')
    iat = int(datetime.now().timestamp())
    header = {'alg': 'HS256', 'typ': 'JWT', 'kid': id_str}
    payload = {'iat': iat, 'exp': iat + 5 * 60, 'aud': '/admin/'}
    return jwt.encode(payload, bytes.fromhex(secret), algorithm='HS256', headers=header)

def generate_text_content(topic):
    print(f"[+] Researching and writing article about: '{topic}' via Ollama ({MODEL})")
    print(f"[!] Warning: Local generation can take several minutes. Timeout is disabled.")
    sys.stdout.flush()
    
    prompt = f"""
Write a professional, deep-dive article about '{topic}'. 
Incorporate a multi-faceted perspective (potential risks, future upside, and pragmatic first steps).
CRITICAL: The very first line of your output MUST be an <h1> tag containing a highly engaging, punchy, clickbait title for the article.
Format the rest of the output in STRICT HTML using <h2>, <h3>, <ul>, <li>, <strong>, and <p> tags. 
Do NOT use Markdown asterisks (*) for bolding or bullet points. 
Start directly with the <h1> tag.
"""
    
    fallback_html = f"""
    <h2>The AI Revolution in {topic.title()}</h2>
    <p>We are currently experiencing unprecedented delays in local neural generation due to hardware constraints. However, the ecosystem around <strong>{topic}</strong> remains one of the most rapidly evolving sectors in technology.</p>
    <h3>Immediate Implications</h3>
    <ul>
        <li><strong>Infrastructure:</strong> Scalability remains the core bottleneck.</li>
        <li><strong>Economics:</strong> Early adopters are capturing exponential value.</li>
    </ul>
    <p><em>(This is a fallback article generated because the local Ollama instance timed out or failed to respond).</em></p>
    """

    try:
        # 5-minute timeout. High enough to let Llama think, but finite enough to prevent a permanent silent hang.
        res = requests.post("http://localhost:11434/api/generate", json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False
        }, timeout=300)
        
        res.raise_for_status()
        html_content = res.json().get('response', '')
        
        if not html_content.strip():
            print("[X] Ollama returned an empty string. Using fallback.")
            sys.stdout.flush()
            return f"System Failure: {topic.title()}", fallback_html
            
        if html_content.startswith("```html"):
            html_content = html_content.replace("```html", "", 1).strip()
            if html_content.endswith("```"):
                html_content = html_content[:-3].strip()
                
        # Deterministically destroy markdown asterisks the LLM leaks
        html_content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html_content)
        
        # Convert stubborn markdown bullet lists (* or -) into strict HTML lists
        html_content = re.sub(r'^\s*[\*\-]\s+(.*?)$', r'<ul><li>\1</li></ul>', html_content, flags=re.MULTILINE)
        # Merge adjacent list tags created by the previous regex
        html_content = re.sub(r'</ul>\s*<ul>', '', html_content)
        
        # Clean up any leftover paired asterisks into italics
        html_content = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html_content)
        
        # Bulletproof header fallbacks (just in case)
        html_content = re.sub(r'^###\s+(.*?)$', r'<h3>\1</h3>', html_content, flags=re.MULTILINE)
        html_content = re.sub(r'^##\s+(.*?)$', r'<h2>\1</h2>', html_content, flags=re.MULTILINE)
        html_content = re.sub(r'^#\s+(.*?)$', r'<h1>\1</h1>', html_content, flags=re.MULTILINE)
        
        # Extract the title from the <h1> tag
        title_match = re.search(r'<h1>(.*?)</h1>', html_content, flags=re.IGNORECASE | re.DOTALL)
        if title_match:
            extracted_title = title_match.group(1).strip()
            # Remove the h1 from the body so Ghost doesn't duplicate the title
            html_content = re.sub(r'<h1>.*?</h1>', '', html_content, count=1, flags=re.IGNORECASE | re.DOTALL)
        else:
            extracted_title = f"The Definitive Guide to {topic.title()}"
            
        return extracted_title, html_content
        
    except Exception as e:
        print(f"[X] Ollama generation failed: {e}")
        sys.stdout.flush()
        return f"Emergency Broadcast: {topic.title()}", fallback_html

def generate_video(topic):
    fallback_video = "https://cdn.coverr.co/videos/coverr-abstract-neon-lights-5136/1080p.mp4"
    if not MODAL_LTX2_URL:
        print("[!] No LTX-2 Endpoint found in .env. Injecting stock B-Roll for demo.")
        sys.stdout.flush()
        return fallback_video
        
    print(f"[+] Generating cinematic video for '{topic}' via LTX-2...")
    sys.stdout.flush()
    try:
        res = requests.post(MODAL_LTX2_URL, json={"prompt": f"Cinematic slow motion shot representing {topic}, highly detailed"})
        if res.status_code == 200:
            return res.json().get('video_url', fallback_video)
    except Exception as e:
        print(f"[X] Video API failed: {e}")
        
    return fallback_video

def publish_to_ghost(title, html_content):
    print(f"[+] Broadcasting to Ghost CMS...")
    sys.stdout.flush()
    url = f"{GHOST_API_URL}/ghost/api/admin/posts/?source=html"
    headers = {
        'Authorization': f'Ghost {get_ghost_token()}',
        'Content-Type': 'application/json'
    }
    body = {
        "posts": [{
            "title": title,
            "html": html_content,
            "status": "published",
            "tags": [{"name": "AI Generated"}]
        }]
    }
    res = requests.post(url, json=body, headers=headers)
    if res.status_code in [200, 201]:
        return res.json()['posts'][0].get('url')
    else:
        print(f"[X] Ghost Publishing Failed: {res.text}")
        sys.stdout.flush()
        return None

def run_pipeline(topic):
    print(f"=== Starting Autonomous Pipeline for: '{topic}' ===")
    sys.stdout.flush()
    
    # 1. Text Generation & Title Extraction
    title, html = generate_text_content(topic)
    
    # 2. Media Generation
    video_path = generate_video(topic)
    if video_path:
        video_html = f'''
<!--kg-card-begin: html-->
<div style="margin-bottom: 2rem; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
    <video autoplay loop muted playsinline controls style="width: 100%; height: auto; display: block;">
        <source src="{video_path}" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>
<!--kg-card-end: html-->
'''
        html = video_html + html
    
    # 3. Distribution
    post_url = publish_to_ghost(title, html)
    
    if post_url:
        print(f"\n>>> PIPELINE SUCCESS <<<")
        print(f"Live Article URL: {post_url}")
    else:
        print("\n>>> PIPELINE FAILED <<<")
    sys.stdout.flush()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python hackathon_pipeline.py \"Your Topic\"")
        sys.exit(1)
    
    run_pipeline(sys.argv[1])
