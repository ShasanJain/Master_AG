import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from duckduckgo_search import DDGS
import html

def fetch_trending_topics(silent=False):
    if not silent: print("Fetching trending topics from Reddit RSS (API-free)...")
    url = "https://www.reddit.com/r/todayilearned/top/.rss?t=day"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'AntigravityReelStudio/1.0'})
        with urllib.request.urlopen(req) as response:
            xml_data = response.read()
            
        root = ET.fromstring(xml_data)
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        
        trends = []
        for entry in root.findall('atom:entry', ns):
            title = entry.find('atom:title', ns).text
            trends.append({"topic": title, "traffic": "High"})
            
        if not silent:
            print("Top 5 Viral Topics:")
            for i, t in enumerate(trends[:5]):
                print(f"{i+1}. {t['topic']}")
            
        return trends[:5]
    except Exception as e:
        if not silent: print(f"Error fetching trends: {e}")
        return []

def search_reddit_topic(topic):
    """Searches Reddit RSS for a specific topic to find the top post."""
    query = urllib.parse.quote(topic)
    url = f"https://www.reddit.com/r/todayilearned/search.rss?q={query}&restrict_sr=on&sort=top&t=all"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'AntigravityReelStudio/1.0'})
        with urllib.request.urlopen(req) as response:
            xml_data = response.read()
            
        root = ET.fromstring(xml_data)
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        
        for entry in root.findall('atom:entry', ns):
            title = entry.find('atom:title', ns).text
            if title:
                return html.unescape(title)
            
    except Exception as e:
        print(f"Reddit search failed: {e}")
    return None

def search_reddit_multiple(topic, max_results=3):
    """Searches multiple subreddits for a topic and returns several post titles."""
    subreddits = ['todayilearned', 'facts', 'interestingasfuck', 'didyouknow']
    titles = []
    for subreddit in subreddits:
        if len(titles) >= max_results:
            break
        query = urllib.parse.quote(topic)
        url = f"https://www.reddit.com/r/{subreddit}/search.rss?q={query}&restrict_sr=on&sort=top&t=all"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'AntigravityReelStudio/1.0'})
            with urllib.request.urlopen(req, timeout=5) as response:
                xml_data = response.read()
            root = ET.fromstring(xml_data)
            ns = {'atom': 'http://www.w3.org/2005/Atom'}
            for entry in root.findall('atom:entry', ns):
                t = entry.find('atom:title', ns)
                if t is not None and t.text:
                    titles.append(html.unescape(t.text))
                    if len(titles) >= max_results:
                        break
        except Exception as e:
            print(f"Reddit search [{subreddit}] failed: {e}")
    return titles

def search_social_topic(topic):
    """Aggregates multiple Reddit posts + DDG snippets for rich multi-part script building."""
    print(f"[Social Scraper] Scanning social media for '{topic}'...")
    
    # Pull multiple Reddit post titles
    reddit_posts = search_reddit_multiple(topic, max_results=3)
    
    # Pull multiple DDG snippets (no length cap filter)
    BOILERPLATE = ['get the latest', 'subscribe now', 'breaking news', 'click here', 'privacy policy', 'terms of service', 'all rights reserved', 'sign up', 'log in', 'advertisement']
    ddg_snippets = []
    try:
        query = f'"{topic}" interesting facts'
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=5))
            for r in results:
                body = r.get('body', '').strip()
                if body and len(body) > 40:
                    # Skip boilerplate snippets
                    if not any(bp in body.lower() for bp in BOILERPLATE):
                        ddg_snippets.append(body)
    except Exception as e:
        print(f"DDG search failed: {e}")
    
    if not reddit_posts and not ddg_snippets:
        return None

    return {
        "reddit_posts": reddit_posts,
        "ddg_snippets": ddg_snippets,
    }

if __name__ == "__main__":
    import sys
    import json
    if len(sys.argv) > 1 and sys.argv[1] == '--json':
        trends = fetch_trending_topics(silent=True)
        print(json.dumps(trends))
    elif len(sys.argv) > 1:
        print(search_social_topic(sys.argv[1]))
    else:
        fetch_trending_topics()
