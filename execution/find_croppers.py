# -*- coding: utf-8 -*-
"""
find_croppers.py  — Travian Legends edition
-------------------------------------------
Supports all Travian Legends server variants including x3/x5 speed servers.

All Travian Legends x_world schemas:
  (id, x, y, type, kingdom_id, 'village_name', player_id, 'player_name', population, ...)

Older Legends servers (classic/com):
  - type < 0  → Oasis tile (-1=Crop+25%, -2=Crop+50%, etc.)
  - type 9    → 9-Cropper
  - type 12   → 15-Cropper variant
  - type 15   → 15-Cropper

Newer Legends servers (x3/x5 international, post-2023 engine):
  - No negative type codes — oases NOT stored as separate rows in map.sql
  - type 5    → Natar 9-Cropper
  - type 6    → 9-Cropper (player village)
  - type 3    → Natar villages (non-crop)
  - No 15c on x3 speed servers (they use condensed maps)
  Oasis score = N/A (data not available in map.sql on these servers)

Run example:
    python execution/find_croppers.py --server ts31.x3.international.travian.com ^
           --x 62 --y -29 --radius 40 --type both

Output:
    .tmp/croppers_ranked.json
    .tmp/croppers_ranked.csv
"""

import argparse
import csv
import json
import math
import os
import re
import sys
import urllib.request

# Force UTF-8 stdout so Unicode player names don't crash on Windows cp1252
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# -----------------------------------------------------------------------
# Village type codes — VERIFIED from live ts31.x3.international.travian.com
#
# There are 4 possible crop counts: 6, 7, 9, 15
# There are 4 player-village type codes: 1, 2, 6, 7
# Direct 1-to-1 mapping (flag is unrelated to crop count):
#
#   type=1 → 9-Cropper  (3,3,3,9)   ← CONFIRMED at (63|-29)
#   type=2 → 7c variant (w+c+i+7)   ← inferred
#   type=6 → 15-Cropper (1,1,1,15)  ← CONFIRMED at (60|-31)
#   type=7 → 6c Standard (4,4,4,6)  ← inferred
#
# Natar types:
#   type=3 → Natar standard village (non-crop)
#   type=5 → Natar 9-Cropper (crop Natar tile)
#
# Classic com/arabics Legends servers (negative oasis types present):
#   type=9  → 9c,  type=12/15 → 15c
# -----------------------------------------------------------------------
NINE_CROPPER_TYPES    = {1}         # type=1 (x3/x5) + type=9 (classic)
FIFTEEN_CROPPER_TYPES = {6}         # type=6 (x3/x5) + type=12,15 (classic)
NINE_CROPPER_CLASSIC    = {9}
FIFTEEN_CROPPER_CLASSIC = {12, 15}

OASIS_SCORE = {
    "Crop +50%":             100,
    "Crop +25%":              60,
    "Wood +25%, Crop +25%":   40,
    "Clay +25%, Crop +25%":   40,
    "Iron +25%, Crop +25%":   40,
    "Wood +25%":              10,
    "Clay +25%":              10,
    "Iron +25%":              10,
}


# Negative type = oasis (classic/com servers only; x3/x5 servers don't expose oases in map.sql)
OASIS_BONUS = {
    -1: "Crop +25%",
    -2: "Crop +50%",
    -3: "Wood +25%",
    -4: "Clay +25%",
    -5: "Iron +25%",
    -6: "Wood +25%, Crop +25%",
    -7: "Clay +25%, Crop +25%",
    -8: "Iron +25%, Crop +25%",
}


def dist(x1, y1, x2, y2):
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)


def download_map(server: str) -> list:
    url = f"https://{server}/map.sql"
    print(f"[INFO] Downloading: {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        raw = r.read().decode("utf-8", errors="replace")
    lines = raw.splitlines()
    print(f"[INFO] {len(lines):,} lines downloaded.")
    return lines


def detect_oasis_mode(lines: list) -> bool:
    """
    Detect if this server includes oasis tiles as separate rows in map.sql.
    Classic/com Legends servers have negative type codes for oases.
    Newer x3/x5 international servers do NOT — oasis data is absent from map.sql.
    Returns True if oasis tiles are present, False otherwise.
    """
    sample_re = re.compile(r'\(\d+,\s*-?\d+,\s*-?\d+,\s*(-?\d+),')
    for line in lines[:500]:
        for m in sample_re.finditer(line):
            if int(m.group(1)) < 0:
                print("[INFO] Oasis tiles found in map.sql (classic Legends server).")
                return True
    print("[INFO] No oasis tiles in map.sql (x3/x5 speed server — oasis score will be N/A).")
    return False


def parse_x_world(lines: list, has_oases: bool):
    """
    Parse all tiles from x_world INSERT statements.

    Full x_world schema (ts31.x3.international.travian.com verified):
      (id, x, y, type, kingdom_id, 'village_name', player_id, 'player_name',
       population, 'alliance_tag', extra_int, NULL, TRUE_or_FALSE, NULL, NULL, NULL)

    KEY: Column 13 (TRUE/FALSE) is the 15-CROPPER flag on newer Legends servers.
         type=6 + TRUE  = 15-Cropper
         type=6 + FALSE = 9-Cropper
         type=5         = Natar 9-Cropper (always 9c)

    Returns (villages, oases).
    """
    # Extended regex capturing the 15c flag (TRUE/FALSE at position 13)
    ext_re = re.compile(
        r"\((\d+),\s*(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*\d+,\s*"
        r"'([^']*)',\s*(\d+),\s*'([^']*)',\s*(-?\d+),\s*'[^']*',\s*\d+,\s*(?:NULL|\d+),\s*(TRUE|FALSE)"
    )
    # Fallback for classic servers or rows without the flag columns
    simple_re = re.compile(
        r"\((\d+),\s*(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*\d+,\s*"
        r"'([^']*)',\s*(\d+),\s*'([^']*)',\s*(-?\d+)"
    )

    villages, oases = [], []

    for line in lines:
        if "x_world" not in line and not line.startswith("INSERT INTO"):
            continue
        for m in ext_re.finditer(line):
            try:
                x         = int(m.group(2))
                y         = int(m.group(3))
                tile_type = int(m.group(4))
                vname     = m.group(5)
                pname     = m.group(7)
                pop       = int(m.group(8))
                is_15c_flag = m.group(9) == 'TRUE'  # The 15c discriminator
            except (ValueError, IndexError):
                continue

            if tile_type < 0 and has_oases:
                bonus = OASIS_BONUS.get(tile_type, f"Oasis({tile_type})")
                oases.append({"x": x, "y": y, "type_code": tile_type,
                               "bonus": bonus, "occupied": pop > 0,
                               "occupier": pname if pop > 0 else ""})
            elif tile_type > 0:
                villages.append({"x": x, "y": y, "type_code": tile_type,
                                  "name": vname, "player": pname, "population": pop,
                                  "is_15c_flag": is_15c_flag})

        # Fallback: try simple_re for lines that don't match ext_re (classic servers)
        matched_xs = {v["x"] for v in villages if True}  # quick lookup not ideal; skip for now

    print(f"[INFO] Parsed {len(villages):,} villages, {len(oases):,} oases.")
    if villages:
        flagged_15c = sum(1 for v in villages if v.get('is_15c_flag'))
        print(f"[INFO] {flagged_15c:,} villages have 15c flag (TRUE).")
    return villages, oases


def nearby_oases(cx, cy, all_oases, radius=3.0):
    result = []
    for o in all_oases:
        d = dist(cx, cy, o["x"], o["y"])
        if d <= radius:
            result.append({**o, "distance": round(d, 2)})
    return sorted(result, key=lambda o: o["distance"])


def score(oasis_list):
    return sum(OASIS_SCORE.get(o["bonus"], 0) for o in oasis_list if o["distance"] <= 3)


def get_label(v: dict, filter_type: str) -> str | None:
    """
    Classify a village tile. Returns label string or None if filtered out.

    x3/x5 Legends servers — type field alone determines crop count:
      type=1 = 9-Cropper  (3,3,3,9)    — CONFIRMED at (63|-29)
      type=2 = 7c variant               — inferred from 4-way mapping
      type=5 = Natar 9-Cropper
      type=6 = 15-Cropper (1,1,1,15)   — CONFIRMED at (60|-31)
      type=7 = 6c Standard (4,4,4,6)   — inferred
      type=3 = Natar standard

    TRUE/FALSE flag is unrelated to crop count (likely kingdom/territory marker).

    Classic com/arabics Legends: type 9=9c, 12/15=15c.
    """
    tile_type    = v["type_code"]
    player_lower = v["player"].lower()
    name_lower   = v["name"].lower()

    is_natar = player_lower == "natars"
    is_ww    = ("wonder of the world" in name_lower or
                "world wonder"        in name_lower or
                "natars wonder"       in name_lower)

    is_15c = tile_type in FIFTEEN_CROPPER_TYPES or tile_type in FIFTEEN_CROPPER_CLASSIC
    is_9c  = tile_type in NINE_CROPPER_TYPES    or tile_type in NINE_CROPPER_CLASSIC or tile_type == 5

    if is_ww:
        label = "WW"
    elif is_15c:
        label = "15c"
    elif is_9c:
        label = "9c"
    elif is_natar:
        label = "Natar"
    else:
        label = "Normal"

    # Apply filter
    if filter_type == "15c"    and label != "15c":   return None
    if filter_type == "9c"     and label != "9c":    return None
    if filter_type == "both"   and label not in ("15c", "9c"): return None
    if filter_type == "natars" and label != "Natar": return None
    if filter_type == "ww"     and label != "WW":    return None
    if filter_type == "all"    and label not in ("15c", "9c", "Natar", "WW"): return None

    return label


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--server",       required=True)
    ap.add_argument("--x",            type=int, required=True)
    ap.add_argument("--y",            type=int, required=True)
    ap.add_argument("--radius",       type=float, default=40)
    ap.add_argument("--min-pop",      type=int, default=0)
    ap.add_argument("--max-pop",      type=int, default=9999)
    ap.add_argument("--oasis-radius", type=float, default=3.0)
    ap.add_argument("--type",         choices=["9c","15c","both","natars","ww","all"], default="both")
    args = ap.parse_args()

    os.makedirs(".tmp", exist_ok=True)

    lines     = download_map(args.server)
    has_oases = detect_oasis_mode(lines)
    villages, oases = parse_x_world(lines, has_oases)

    results = []
    for v in villages:
        label = get_label(v, args.type)
        if label is None:
            continue

        d = dist(args.x, args.y, v["x"], v["y"])
        if d > args.radius:
            continue
        if not (args.min_pop <= v["population"] <= args.max_pop):
            continue

        near = nearby_oases(v["x"], v["y"], oases, args.oasis_radius)
        sc   = score(near)

        results.append({
            "label":             label,
            "coords":            f"({v['x']}|{v['y']})",
            "x": v["x"], "y": v["y"],
            "distance_from_you": round(d, 1),
            "name":              v["name"],
            "player":            v["player"],
            "population":        v["population"],
            "occupied":          v["population"] > 0,
            "oasis_score":       sc,
            "nearby_oases":      near,
            "has_oases":         has_oases,
        })

    results.sort(key=lambda r: (
        0 if r["label"] == "15c" else (1 if r["label"] == "9c" else (2 if r["label"] == "WW" else 3)),
        -r["oasis_score"],
        r["distance_from_you"]
    ))

    oasis_note = "" if has_oases else "  ⚠ x3/x5 speed server: oasis data not available in map.sql"
    print(f"\n[RESULTS] {len(results)} result(s) within {args.radius} tiles of ({args.x}|{args.y}){oasis_note}\n")
    for i, r in enumerate(results[:30], 1):
        ostr = ", ".join(f"{o['bonus']}({o['distance']}t)" for o in r["nearby_oases"][:3])
        st   = "FREE" if not r["occupied"] else "TAKEN"
        player_safe = r["player"].encode("ascii", "replace").decode()
        score_str = f"score:{r['oasis_score']:3d}" if has_oases else "score:N/A"
        print(f"  #{i:2d} [{r['label']}] ({r['x']:4d}|{r['y']:4d}) {r['distance_from_you']:5.1f}t "
              f"| {st:5s} {player_safe:16s} pop:{r['population']:4d} {score_str}"
              + (f" | {ostr}" if ostr else ""))

    # JSON output
    jp = ".tmp/croppers_ranked.json"
    with open(jp, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\n[OUT] JSON -> {jp}")

    # CSV output
    cp = ".tmp/croppers_ranked.csv"
    with open(cp, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["Rank","Type","Coords","Distance","Status","Player","Pop","OasisScore","NearbyOases"])
        for i, r in enumerate(results, 1):
            ostr = "; ".join(f"{o['bonus']} @{o['distance']}t" for o in r["nearby_oases"][:3])
            w.writerow([i, r["label"], r["coords"], r["distance_from_you"],
                        "FREE" if not r["occupied"] else "TAKEN",
                        r["player"], r["population"],
                        r["oasis_score"] if has_oases else "N/A",
                        ostr])
    print(f"[OUT] CSV  -> {cp}")


if __name__ == "__main__":
    main()
