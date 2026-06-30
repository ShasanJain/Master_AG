import argparse
import json
import sys
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

# Curated lists of AI search bot patterns to inspect in robots.txt
AI_BOTS = ["GPTBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Applebot-Extended", "Google-Extended", "Bytespider", "CCBot"]

def check_ai_crawlers(url):
    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    blocked = []
    allowed = []
    
    try:
        res = requests.get(robots_url, timeout=8, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        })
        if res.status_code == 200:
            content = res.text
            # Simple robots.txt block parser
            current_user_agents = []
            for line in content.splitlines():
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                
                ua_match = re.match(r"^User-agent:\s*(.*)$", line, re.IGNORECASE)
                if ua_match:
                    current_user_agents.append(ua_match.group(1).strip())
                
                disallow_match = re.match(r"^Disallow:\s*(.*)$", line, re.IGNORECASE)
                if disallow_match and current_user_agents:
                    rule = disallow_match.group(1).strip()
                    if rule in ["/", "/*"]:
                        for ua in current_user_agents:
                            if any(bot.lower() in ua.lower() for bot in AI_BOTS):
                                blocked.append(ua)
            
            for bot in AI_BOTS:
                if bot not in blocked:
                    allowed.append(bot)
        else:
            allowed = list(AI_BOTS)
    except:
        allowed = list(AI_BOTS)
        
    return {"blocked": list(set(blocked)), "allowed": list(set(allowed))}

def check_security_headers(headers):
    # Standard security headers audit
    checks = {
        "Strict-Transport-Security": False,
        "Content-Security-Policy": False,
        "X-Frame-Options": False,
        "X-Content-Type-Options": False,
        "Referrer-Policy": False
    }
    for header in checks:
        for actual_header in headers:
            if actual_header.lower() == header.lower():
                checks[header] = True
    return checks

def check_pagespeed_metrics(url):
    # Free, open PageSpeed API endpoint for quick performance measurements
    # Strategy: mobile is Google default
    api_url = f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={url}&strategy=mobile"
    metrics = {
        "PerformanceScore": None,
        "LCP": "N/A",
        "INP": "N/A",
        "CLS": "N/A"
    }
    try:
        res = requests.get(api_url, timeout=12)
        if res.status_code == 200:
            data = res.json()
            lighthouse = data.get("lighthouseResult", {})
            categories = lighthouse.get("categories", {})
            perf = categories.get("performance", {})
            if perf:
                metrics["PerformanceScore"] = int(perf.get("score", 0) * 100)
            
            # Fetch core web vitals audits
            audits = lighthouse.get("audits", {})
            metrics["LCP"] = audits.get("largest-contentful-paint", {}).get("displayValue", "N/A")
            metrics["INP"] = audits.get("interactive", {}).get("displayValue", "N/A") # Interactive serves as INP proxy when INP is uncalculated
            metrics["CLS"] = audits.get("cumulative-layout-shift", {}).get("displayValue", "N/A")
    except Exception as e:
        pass # Fallback on default null metrics if API is rate-limited or times out
    return metrics

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
    soup = BeautifulSoup(html, "html.parser")

    result = {
        "url": url,
        "title": None,
        "meta_description": None,
        "h1": [],
        "h2": [],
        "word_count": 0,
        "images": {"total": 0, "without_alt": 0},
        "links": {"total": 0, "internal": 0, "external": 0},
        "schema_types": [],
        "schema_audit": {"valid": True, "deprecated_types": [], "total_detected": 0},
        "ai_crawlers": {"blocked": [], "allowed": []},
        "security_headers": {},
        "performance": {"score": None, "lcp": "N/A", "inp": "N/A", "cls": "N/A"},
        "score": 100
    }

    # 1. PageSpeed Baseline
    result["performance"] = check_pagespeed_metrics(url)

    # 2. AI Crawlers
    result["ai_crawlers"] = check_ai_crawlers(url)

    # 3. Security Headers
    result["security_headers"] = check_security_headers(response.headers)

    # 4. Sitemap Validation
    parsed = urlparse(url)
    sitemap_url = f"{parsed.scheme}://{parsed.netloc}/sitemap.xml"
    result["sitemap"] = {"detected": False, "url": sitemap_url}
    try:
        s_res = requests.head(sitemap_url, timeout=5)
        if s_res.status_code == 200:
            result["sitemap"]["detected"] = True
    except:
        pass

    # 5. SSL & Redirect checks
    result["ssl"] = {
        "is_ssl": url.startswith("https://"),
        "redirect_chain": [r.url for r in response.history] + [response.url]
    }
    if not result["ssl"]["is_ssl"]:
        result["score"] -= 10

    # Title
    title_tag = soup.find("title")
    if title_tag:
        result["title"] = title_tag.get_text(strip=True)
        if len(result["title"]) < 30 or len(result["title"]) > 60:
            result["score"] -= 5 # Suboptimal title length penalty
    else:
        result["score"] -= 20

    # Meta description
    for meta in soup.find_all("meta"):
        name = meta.get("name", "").lower()
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

    # Links & Broken Links Check (Multi-threaded verify)
    from concurrent.futures import ThreadPoolExecutor
    
    base_domain = urlparse(url).netloc
    anchors = soup.find_all("a", href=True)
    result["links"] = {"total": len(anchors), "internal": 0, "external": 0, "broken_count": 0, "broken_links": []}
    
    unique_links = set()
    for a in anchors:
        href = a.get("href", "")
        if href.startswith("#") or href.startswith("javascript:") or href.startswith("tel:") or href.startswith("mailto:"):
            continue
        full_url = urljoin(url, href)
        unique_links.add(full_url)
        if urlparse(full_url).netloc == base_domain:
            result["links"]["internal"] += 1
        else:
            result["links"]["external"] += 1
            
    # Verify link health concurrently (limit to max 5 targets to prevent speed bails)
    def check_link(target):
        try:
            r = requests.head(target, timeout=4, headers={"User-Agent": "Mozilla/5.0"})
            if r.status_code >= 400:
                return (target, r.status_code)
        except:
            return (target, 999)
        return None

    # Check top 8 unique links to verify baseline link quality
    targets_to_test = list(unique_links)[:8]
    with ThreadPoolExecutor(max_workers=4) as executor:
        link_checks = executor.map(check_link, targets_to_test)
        for check in link_checks:
            if check:
                result["links"]["broken_count"] += 1
                result["links"]["broken_links"].append({"url": check[0], "status": check[1]})
                
    if result["links"]["broken_count"] > 0:
        result["score"] -= min(15, result["links"]["broken_count"] * 3)

    # Word count
    for element in soup(["script", "style", "nav", "footer", "header"]):
        element.decompose()
    text = soup.get_text(separator=" ", strip=True)
    words = re.findall(r"\b\w+\b", text)
    result["word_count"] = len(words)
    if result["word_count"] < 300:
        result["score"] -= 10

    # JSON-LD Schema & Deprecation Audit (FAQPage and HowTo restrictions check)
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string)
            result["schema_audit"]["total_detected"] += 1
            
            def check_item(item):
                if isinstance(item, dict):
                    t = item.get("@type")
                    if t:
                        result["schema_types"].append(t)
                        # Flag deprecated types
                        if t in ["FAQPage", "HowTo"]:
                            result["schema_audit"]["deprecated_types"].append(t)
                            result["schema_audit"]["valid"] = False
                    # Check nested objects
                    for v in item.values():
                        if isinstance(v, (dict, list)):
                            check_item(v)
                elif isinstance(item, list):
                    for sub in item:
                        check_item(sub)
                        
            check_item(data)
        except:
            pass

    # Penalize score for deprecated schema usages
    if len(result["schema_audit"]["deprecated_types"]) > 0:
        result["score"] -= 5

    # Extract Typography, Colors, and Style Rules for Theme Synthesis
    styles = {
        "primary": "#6366f1", # Fallback default
        "dark": "#0f172a",
        "light": "#fafafa",
        "fonts": ["Inter"],
        "radius": "8px"
    }
    
    # 1. Look for color hints in inline styles or style tags
    style_tags = soup.find_all("style")
    all_css_content = "".join([tag.string or "" for tag in style_tags])
    
    # Simple regex matchers for common color properties
    color_hexes = re.findall(r"#[0-9a-fA-F]{6}\b", all_css_content)
    if color_hexes:
        # Deduplicate and prioritize primary colors
        unique_colors = list(set(color_hexes))
        styles["primary"] = unique_colors[0]
        if len(unique_colors) > 1:
            styles["dark"] = unique_colors[1]
        if len(unique_colors) > 2:
            styles["light"] = unique_colors[2]
            
    # Simple regex for font-family
    font_matches = re.findall(r"font-family:\s*([^;\}]+)", all_css_content)
    if font_matches:
        extracted_fonts = []
        for match in font_matches:
            # Clean quotes and commas
            clean_font = match.split(",")[0].strip().replace("'", "").replace('"', "")
            if clean_font and clean_font not in extracted_fonts:
                extracted_fonts.append(clean_font)
        if extracted_fonts:
            styles["fonts"] = extracted_fonts[:3]

    # Simple regex for border-radius
    radius_matches = re.findall(r"border-radius:\s*([^;\}]+)", all_css_content)
    if radius_matches:
        styles["radius"] = radius_matches[0].strip()

    result["extracted_theme"] = styles

    # Ensure score doesn't drop below 0
    result["score"] = max(0, result["score"])
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    args = parser.parse_args()
    analyze_seo(args.url)
