import argparse
import json
import sys
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

def analyze_seo(url):
    try:
        response = requests.get(url, timeout=15, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        })
        response.raise_for_status()
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

    html = response.text
    soup = BeautifulSoup(html, "lxml")

    result = {
        "url": url,
        "title": None,
        "meta_description": None,
        "h1": [],
        "h2": [],
        "word_count": 0,
        "images": {"total": 0, "without_alt": 0},
        "links": {"internal": 0, "external": 0},
        "schema_types": [],
        "score": 100
    }

    # Title
    title_tag = soup.find("title")
    if title_tag:
        result["title"] = title_tag.get_text(strip=True)
    else:
        result["score"] -= 20

    # Meta tags
    for meta in soup.find_all("meta"):
        name = meta.get("name", "").lower()
        property_attr = meta.get("property", "").lower()
        content = meta.get("content", "")

        if name == "description":
            result["meta_description"] = content

    if not result["meta_description"]:
        result["score"] -= 15
    elif len(result["meta_description"]) < 50 or len(result["meta_description"]) > 160:
        result["score"] -= 5

    # Headings
    for tag in ["h1", "h2"]:
        for heading in soup.find_all(tag):
            text = heading.get_text(strip=True)
            if text:
                result[tag].append(text)

    if not result["h1"]:
        result["score"] -= 15
    elif len(result["h1"]) > 1:
        result["score"] -= 5

    # Images
    imgs = soup.find_all("img")
    result["images"]["total"] = len(imgs)
    for img in imgs:
        if not img.get("alt"):
            result["images"]["without_alt"] += 1

    if result["images"]["without_alt"] > 0:
        result["score"] -= min(15, result["images"]["without_alt"] * 2)

    # Links
    base_domain = urlparse(url).netloc
    for a in soup.find_all("a", href=True):
        href = a.get("href", "")
        if href.startswith("#") or href.startswith("javascript:"):
            continue
        full_url = urljoin(url, href)
        if urlparse(full_url).netloc == base_domain:
            result["links"]["internal"] += 1
        else:
            result["links"]["external"] += 1

    # Word count
    for element in soup(["script", "style", "nav", "footer", "header"]):
        element.decompose()
    text = soup.get_text(separator=" ", strip=True)
    words = re.findall(r"\b\w+\b", text)
    result["word_count"] = len(words)
    if result["word_count"] < 300:
        result["score"] -= 10

    # Schema
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string)
            if isinstance(data, dict):
                t = data.get("@type")
                if t:
                    result["schema_types"].append(t)
            elif isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and item.get("@type"):
                        result["schema_types"].append(item.get("@type"))
        except:
            pass

    # Ensure score doesn't drop below 0
    result["score"] = max(0, result["score"])
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    args = parser.parse_args()
    analyze_seo(args.url)
