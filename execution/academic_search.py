#!/usr/bin/env python3
"""
academic_search.py — Unified academic literature search utility.
Wraps arXiv, OpenAlex, Europe PMC, and bioRxiv/medRxiv APIs.
Supports streaming structured JSON lines for SSE consumption.
"""

import argparse
import json
import sys
import time
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
import re

# ─────────────────────────────────────────────
# ARXIV SEARCH
# ─────────────────────────────────────────────
ARXIV_BASE = "https://export.arxiv.org/api/query"
ARXIV_NS = "http://www.w3.org/2005/Atom"
ARXIV_NS2 = "http://arxiv.org/schemas/atom"

def search_arxiv(query: str, max_results: int = 10, sort_by: str = "relevance") -> list[dict]:
    params = urllib.parse.urlencode({
        "search_query": query,
        "max_results": max_results,
        "sortBy": sort_by,
        "sortOrder": "descending",
    })
    url = f"{ARXIV_BASE}?{params}"
    print(f"[arXiv] Querying: {query}", flush=True)

    try:
        time.sleep(0.5)
        with urllib.request.urlopen(url, timeout=15) as resp:
            raw = resp.read().decode("utf-8")
    except Exception as e:
        print(f"[ERROR] arXiv request failed: {e}", flush=True)
        return []

    root = ET.fromstring(raw)
    results = []

    for entry in root.findall(f"{{{ARXIV_NS}}}entry"):
        title = entry.findtext(f"{{{ARXIV_NS}}}title", "").strip().replace("\n", " ")
        abstract = entry.findtext(f"{{{ARXIV_NS}}}summary", "").strip().replace("\n", " ")
        published = entry.findtext(f"{{{ARXIV_NS}}}published", "")[:10]
        arxiv_id = entry.findtext(f"{{{ARXIV_NS}}}id", "")
        arxiv_id_clean = arxiv_id.split("/abs/")[-1] if "/abs/" in arxiv_id else arxiv_id

        authors = [
            a.findtext(f"{{{ARXIV_NS}}}name", "")
            for a in entry.findall(f"{{{ARXIV_NS}}}author")
        ]

        pdf_link = ""
        for link in entry.findall(f"{{{ARXIV_NS}}}link"):
            if link.get("type") == "application/pdf":
                pdf_link = link.get("href", "")

        categories = [
            c.get("term", "")
            for c in entry.findall(f"{{{ARXIV_NS2}}}category", {ARXIV_NS2: "http://arxiv.org/schemas/atom"})
        ]
        if not categories:
            for c in entry.findall(f"{{http://www.w3.org/2005/Atom}}category"):
                categories.append(c.get("term", ""))

        results.append({
            "id": arxiv_id_clean,
            "title": title,
            "authors": authors[:5],
            "abstract": abstract[:600] + ("..." if len(abstract) > 600 else ""),
            "published": published,
            "pdf_url": pdf_link or f"https://arxiv.org/pdf/{arxiv_id_clean}",
            "abs_url": f"https://arxiv.org/abs/{arxiv_id_clean}",
            "source": "arXiv",
            "categories": categories[:3],
            "cited_by_count": None,
        })

    print(f"[arXiv] Found {len(results)} results.", flush=True)
    return results


# ─────────────────────────────────────────────
# OPENALEX SEARCH
# ─────────────────────────────────────────────
OPENALEX_BASE = "https://api.openalex.org"

def _openalex_get(path: str, params: dict) -> dict:
    qs = urllib.parse.urlencode(params)
    url = f"{OPENALEX_BASE}/{path}?{qs}"
    req = urllib.request.Request(url, headers={"User-Agent": "MasterAG/1.0 (mailto:jack@master-ag.ai)"})
    try:
        time.sleep(0.2)
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"[ERROR] OpenAlex request failed: {e}", flush=True)
        return {}

def search_openalex(query: str, max_results: int = 10) -> list[dict]:
    print(f"[OpenAlex] Querying works: {query}", flush=True)
    data = _openalex_get("works", {
        "search": query,
        "per-page": min(max_results, 25),
        "sort": "cited_by_count:desc",
        "select": "id,display_name,authorships,publication_date,abstract_inverted_index,primary_location,cited_by_count,concepts",
    })

    results = []
    for work in data.get("results", []):
        work_id = work.get("id", "").replace("https://openalex.org/", "")
        inv_idx = work.get("abstract_inverted_index") or {}
        abstract = _reconstruct_abstract(inv_idx)

        authors = [
            a.get("author", {}).get("display_name", "")
            for a in (work.get("authorships") or [])[:5]
        ]

        primary = work.get("primary_location") or {}
        pdf_url = primary.get("pdf_url") or ""
        landing = primary.get("landing_page_url") or f"https://openalex.org/{work_id}"

        concepts = [c.get("display_name", "") for c in (work.get("concepts") or [])[:3]]

        results.append({
            "id": work_id,
            "title": work.get("display_name", "Untitled"),
            "authors": [a for a in authors if a],
            "abstract": abstract[:600] + ("..." if len(abstract) > 600 else ""),
            "published": work.get("publication_date", "")[:10],
            "pdf_url": pdf_url,
            "abs_url": landing,
            "source": "OpenAlex",
            "categories": concepts,
            "cited_by_count": work.get("cited_by_count"),
        })

    print(f"[OpenAlex] Found {len(results)} results.", flush=True)
    return results

def _reconstruct_abstract(inv_idx: dict) -> str:
    if not inv_idx:
        return ""
    try:
        max_pos = max(pos for positions in inv_idx.values() for pos in positions)
        words = [""] * (max_pos + 1)
        for word, positions in inv_idx.items():
            for pos in positions:
                words[pos] = word
        return " ".join(words)
    except Exception:
        return ""


# ─────────────────────────────────────────────
# EUROPE PMC SEARCH & DETAILS
# ─────────────────────────────────────────────
EUROPEPMC_BASE = "https://www.ebi.ac.uk/europepmc/webservices/rest"

def _europepmc_get(endpoint: str, params: dict) -> dict:
    qs = urllib.parse.urlencode(params)
    url = f"{EUROPEPMC_BASE}/{endpoint}?{qs}"
    req = urllib.request.Request(url, headers={"User-Agent": "MasterAG/1.0"})
    try:
        time.sleep(0.3)
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"[ERROR] EuropePMC request failed: {e}", flush=True)
        return {}

def search_europepmc(query: str, max_results: int = 10) -> list[dict]:
    print(f"[EuropePMC] Querying: {query}", flush=True)
    # Enforce open access filter if not present
    q = query
    if "OPEN_ACCESS:" not in q.upper():
        q = f"({q}) AND OPEN_ACCESS:y"
    
    data = _europepmc_get("search", {
        "query": q,
        "format": "json",
        "resultType": "core",
        "pageSize": min(max_results, 50),
    })
    
    results = []
    for paper in data.get("resultList", {}).get("result", []):
        pmcid = paper.get("pmcid", "")
        pmid = paper.get("id", "")
        paper_id = pmcid or pmid
        if not paper_id:
            continue

        authors = [
            a.get("fullName", "")
            for a in paper.get("authorList", {}).get("author", [])
        ]
        
        pdf_url = ""
        for url_obj in paper.get("fullTextUrlList", {}).get("fullTextUrl", []):
            if url_obj.get("documentStyle") == "pdf":
                pdf_url = url_obj.get("url", "")
                break
        
        abstract = paper.get("abstractText", "")
        
        # Fallback pdf url via Europe PMC resolver
        if not pdf_url and pmcid:
            pdf_url = f"https://europepmc.org/backend/ptpmcrender.fcgi?accid={pmcid}&blobtype=pdf"

        results.append({
            "id": paper_id,
            "title": paper.get("title", "Untitled"),
            "authors": [a for a in authors if a][:5],
            "abstract": abstract[:600] + ("..." if len(abstract) > 600 else ""),
            "published": paper.get("firstPublicationDate", paper.get("journalInfo", {}).get("printPublicationDate", ""))[:10],
            "pdf_url": pdf_url,
            "abs_url": f"https://europepmc.org/article/PMC/{pmcid}" if pmcid else f"https://europepmc.org/article/MED/{pmid}",
            "source": "EuropePMC",
            "categories": [c.get("descriptorName", "") for c in paper.get("meshHeadingList", {}).get("meshHeading", [])][:3],
            "cited_by_count": paper.get("citedByCount"),
        })
        
    print(f"[EuropePMC] Found {len(results)} results.", flush=True)
    return results

def get_citations(source: str, article_id: str) -> list[dict]:
    print(f"[EuropePMC] Fetching citations for {source}/{article_id}", flush=True)
    data = _europepmc_get(f"{source}/{article_id}/citations", {
        "format": "json",
        "pageSize": 50
    })
    citations = []
    for cit in data.get("citationList", {}).get("citation", []):
        citations.append({
            "id": cit.get("id"),
            "title": cit.get("title", "Untitled"),
            "authors": [cit.get("authorString", "")],
            "published": cit.get("pubYear", ""),
            "source": cit.get("source", "MED")
        })
    return citations

def get_references(source: str, article_id: str) -> list[dict]:
    print(f"[EuropePMC] Fetching references for {source}/{article_id}", flush=True)
    data = _europepmc_get(f"{source}/{article_id}/references", {
        "format": "json",
        "pageSize": 50
    })
    references = []
    for ref in data.get("referenceList", {}).get("reference", []):
        references.append({
            "id": ref.get("id"),
            "title": ref.get("title", "Untitled"),
            "authors": [ref.get("authorString", "")],
            "published": ref.get("pubYear", ""),
            "source": ref.get("source", "MED")
        })
    return references

def _extract_all_text(elem) -> str:
    parts = []
    if elem.text:
        parts.append(elem.text)
    for child in elem:
        parts.append(_extract_all_text(child))
        if child.tail:
            parts.append(child.tail)
    return "".join(parts)

def get_fulltext(pmcid: str) -> str:
    print(f"[EuropePMC] Fetching full text XML for {pmcid}", flush=True)
    url = f"{EUROPEPMC_BASE}/{pmcid}/fullTextXML"
    req = urllib.request.Request(url, headers={"User-Agent": "MasterAG/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            xml_string = resp.read().decode("utf-8")
        
        # Parse XML
        root = ET.fromstring(xml_string)
        sections = []
        
        for title in root.iter("article-title"):
            sections.append(f"# {title.text}")
            break
            
        for abs_elem in root.iter("abstract"):
            sections.append(f"## Abstract\n\n{_extract_all_text(abs_elem).strip()}")
            
        for body in root.iter("body"):
            for p in body.iter("p"):
                sections.append(_extract_all_text(p).strip())
                
        return "\n\n".join(sections)
    except Exception as e:
        return f"[ERROR] Failed to fetch fulltext: {e}"


# ─────────────────────────────────────────────
# BIORXIV SEARCH (LOCAL FILTERING)
# ─────────────────────────────────────────────
BIORXIV_BASE = "https://api.biorxiv.org/details"

def search_biorxiv(query: str, max_results: int = 5, server: str = "biorxiv") -> list[dict]:
    # We poll the last 14 days and check for keywords locally
    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=14)).strftime("%Y-%m-%d")
    print(f"[bioRxiv] Polling {server} preprints ({start_date} to {end_date}) for keyword: {query}", flush=True)

    url = f"{BIORXIV_BASE}/{server}/{start_date}/{end_date}/0"
    req = urllib.request.Request(url, headers={"User-Agent": "MasterAG/1.0"})
    
    results = []
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            collection = data.get("collection", [])
            
            keywords = query.lower().split()
            for paper in collection:
                title = paper.get("title", "")
                abstract = paper.get("abstract", "")
                text_to_search = (title + " " + abstract).lower()
                
                # Check match
                if any(kw in text_to_search for kw in keywords):
                    results.append({
                        "id": paper.get("doi", ""),
                        "title": title,
                        "authors": paper.get("authors", "").split("; ")[:5],
                        "abstract": abstract[:600] + ("..." if len(abstract) > 600 else ""),
                        "published": paper.get("date", ""),
                        "pdf_url": f"https://www.biorxiv.org/content/{paper.get('doi')}.full.pdf",
                        "abs_url": f"https://doi.org/{paper.get('doi')}",
                        "source": "bioRxiv" if server == "biorxiv" else "medRxiv",
                        "categories": [paper.get("category", "")],
                        "cited_by_count": None,
                    })
                    if len(results) >= max_results:
                        break
    except Exception as e:
        print(f"[ERROR] bioRxiv fetch failed: {e}", flush=True)

    return results


# ─────────────────────────────────────────────
# MAIN DISPATCH
# ─────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Academic search utility")
    parser.add_argument("--action", default="search", choices=["search", "citations", "references", "fulltext"])
    parser.add_argument("--query", help="Search query string")
    parser.add_argument("--source", choices=["arxiv", "openalex", "europepmc", "biorxiv", "medrxiv", "all"], default="arxiv")
    parser.add_argument("--max_results", type=int, default=10)
    parser.add_argument("--id", help="Article/Work ID")
    parser.add_argument("--db", default="MED", help="Database identifier (MED, PMC, etc) for EuropePMC citation lookups")
    args = parser.parse_args()

    if args.action == "search":
        if not args.query:
            print("[ERROR] Missing --query", file=sys.stderr)
            sys.exit(1)
            
        results = []
        src = args.source
        
        if src in ("arxiv", "all"):
            results += search_arxiv(args.query, args.max_results)
        if src in ("openalex", "all"):
            results += search_openalex(args.query, args.max_results)
        if src in ("europepmc", "all"):
            results += search_europepmc(args.query, args.max_results)
        if src in ("biorxiv", "all"):
            results += search_biorxiv(args.query, args.max_results, "biorxiv")
        if src in ("medrxiv", "all"):
            results += search_biorxiv(args.query, args.max_results, "medrxiv")

        for r in results:
            print(f"RESULT:{json.dumps(r)}", flush=True)
            
        print("SEARCH_COMPLETE", flush=True)

    elif args.action == "citations":
        if not args.id:
            print("[ERROR] Missing --id", file=sys.stderr)
            sys.exit(1)
        cits = get_citations(args.db, args.id)
        print(json.dumps(cits))

    elif args.action == "references":
        if not args.id:
            print("[ERROR] Missing --id", file=sys.stderr)
            sys.exit(1)
        refs = get_references(args.db, args.id)
        print(json.dumps(refs))

    elif args.action == "fulltext":
        if not args.id:
            print("[ERROR] Missing --id", file=sys.stderr)
            sys.exit(1)
        text = get_fulltext(args.id)
        print(text)

if __name__ == "__main__":
    main()
