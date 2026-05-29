import os
import sys
import json
import random
import argparse

# Add parent dir to path to import ops
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ops.viral_scraper import fetch_trending_topics, search_social_topic

def clean_topic(topic_raw):
    cleaned = topic_raw.replace("TIL", "").replace("that", "").strip(" -:,.!")
    if cleaned:
        cleaned = cleaned[0].upper() + cleaned[1:]
    return cleaned

def generate_viral_from_title(raw_reddit_title):
    """Takes a raw Reddit post title and directly turns it into a polished reel script."""
    cleaned_fact = clean_social_text(raw_reddit_title)
    template = random.choice(HOOK_TEMPLATES)
    script = template.replace("{FACT}", cleaned_fact)
    return script

import re

HOOK_TEMPLATES = [
    "Stop scrolling! Did you know {FACT}? Let me know what you think in the comments.",
    "I just learned the craziest thing today. {FACT}. Hit the plus button if this blew your mind.",
    "You won't believe this, but {FACT}. Drop a comment if you already knew this!",
    "This fact is actually insane. {FACT}. Share this with a friend who needs to hear it."
]

def clean_social_text(text):
    """Strips internet jargon and formats the text as a natural sentence. No length cap."""
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'(?i)^(TIL|Today I Learned)\s*(that)?\s*:?-?\s*', '', text)
    text = re.sub(r'(?i)\[.*?\]', '', text)
    text = re.sub(r'(?i)\(.*?source.*?\)', '', text)
    # Collapse extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    if text:
        text = text[0].upper() + text[1:]
    if text and text[-1] not in '.!?':
        text += '.'
        
    return text

def generate_social_script(topic):
    """Builds a full multi-part reel script from aggregated social + web content."""
    print(f"[Script Generator] Scanning social platforms for '{topic}'...")
    
    social_data = search_social_topic(topic)
    if not social_data:
        print(f"[Script Generator] Social search found nothing for '{topic}'.")
        return None

    reddit_posts = social_data.get("reddit_posts", [])
    ddg_snippets = social_data.get("ddg_snippets", [])

    # --- Build the script in 3 parts ---

    # PART 1: Hook — use the most interesting Reddit title as the opener
    hook_fact = ""
    if reddit_posts:
        hook_fact = clean_social_text(reddit_posts[0])
    elif ddg_snippets:
        hook_fact = clean_social_text(ddg_snippets[0])

    hook = random.choice(HOOK_TEMPLATES).replace("{FACT}", hook_fact)

    # PART 2: Body — expand with additional Reddit posts and DDG snippets
    body_lines = []
    for post in reddit_posts[1:]:  # Skip the first since it's in the hook
        cleaned = clean_social_text(post)
        if cleaned and cleaned != hook_fact:
            body_lines.append(cleaned)
    for snippet in ddg_snippets[:3]:  # Take up to 3 web snippets
        cleaned = clean_social_text(snippet)
        if cleaned and len(cleaned) > 30 and cleaned not in body_lines:
            body_lines.append(cleaned)

    # PART 3: CTA
    ctas = [
        f"Follow for more facts about {topic} that no one talks about.",
        f"Share this with someone who loves learning new things about {topic}.",
        f"Drop a comment if you already knew this about {topic}. I bet you didn't.",
        f"Hit the plus button for more mind-blowing facts like this every day."
    ]
    cta = random.choice(ctas)

    # Assemble the full script
    parts = [hook]
    if body_lines:
        parts.append(" ".join(body_lines))
    parts.append(cta)

    full_script = " ".join(parts)
    print(f"[Script Generator] Script length: {len(full_script)} characters, ~{len(full_script.split())} words")
    return full_script

def generate_viral_script(output_dir="./scratch", topic=None, script=None):
    if script:
        final_script = script
        print(f"[Script Generator] Using provided custom script.")
    else:
        if topic:
            top_topic = topic
            print(f"[Script Generator] Using provided topic: {topic}")
            # Try to generate a social script
            social_script = generate_social_script(topic)
            if social_script:
                final_script = social_script
            else:
                # Better template fallback: construct dynamic 3-part structure
                hook = f"This fact about {topic} is actually insane."
                body = f"Many people don't realize that {topic} has massive global impact and is shifting rapidly in today's landscape."
                cta = f"Drop a comment if you want to know more about {topic}."
                final_script = f"{hook} {body} {cta}"
        else:
            print("[Script Generator] Fetching latest viral topics...")
            topics = fetch_trending_topics()
            if not topics:
                print("[Script Generator] Failed to fetch topics. Using fallback script.")
                final_script = "This is a fallback script because the viral scraper could not find any topics today. Please check your internet connection."
            else:
                top_topic = topics[0]['topic']
                cleaned_topic = clean_topic(top_topic)
                final_script = f"I just found this crazy fact on Reddit. {cleaned_topic}. Did you know about this? Let me know in the comments!"
        
    print(f"\n[Script Generator] Generated Script:\n{final_script}\n")
    
    os.makedirs(output_dir, exist_ok=True)
    script_path = os.path.join(output_dir, "viral_script.txt")
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(final_script)
        
    print(f"[Script Generator] Saved to {script_path}")
    return script_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--topic", type=str, default=None, help="Custom topic: social search + hook wrapping")
    parser.add_argument("--viral-topic", type=str, default=None, dest="viral_topic", help="A raw Reddit post title to turn directly into a script")
    parser.add_argument("--script", type=str, default=None, help="Exact script to use verbatim")
    args = parser.parse_args()

    if args.viral_topic:
        print(f"[Script Generator] Mode: Viral Topic (direct Reddit title)")
        final = generate_viral_from_title(args.viral_topic)
        print(f"\n[Script Generator] Generated Script:\n{final}\n")
        import os
        os.makedirs('./scratch', exist_ok=True)
        with open('./scratch/viral_script.txt', 'w', encoding='utf-8') as f:
            f.write(final)
        print("[Script Generator] Saved to ./scratch/viral_script.txt")
    else:
        generate_viral_script(topic=args.topic, script=args.script)
