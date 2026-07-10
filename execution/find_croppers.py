# -*- coding: utf-8 -*-
"""
find_croppers.py  (ts31.x3.international.travian.com edition)
-------------------------------------------------------------
Actual x_world schema discovered from live map.sql:
  INSERT INTO `x_world` VALUES
    (id, x, y, type, kingdom_id, 'village_name', player_id, 'player_name',
     population, ...)

Run once:
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

# ---------------------------------------------------------------------------
# Village type codes
# ---------------------------------------------------------------------------
# In Travian Legends x_world, the `type` field encodes the village layout.
# The value is a compound integer: each digit = number of that resource field.
# We match on the raw integer value.
#
# 15c = type 15  (all 15 resource slots are crop)
# 9c  = type 9   (9 crop fields layout — most common 9c)
# Some servers use different integers; add if you discover more.

FIFTEEN_CROPPER_TYPES = {15}
NINE_CROPPER_TYPES    = {9, 5}   # 5 = alternate 4-4-4-5 / 9c variant

# Negative type = oasis
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


def parse_x_world(lines: list):
    """
    Actual x_world schema on ts31.x3.international.travian.com:
        (id, x, y, type, kingdom_id, 'village_name', player_id, 'player_name',
         population, 'tribe_or_empty', alliance_id, bool, NULL, NULL, NULL)

    Note: player_id is an INTEGER between village_name and player_name.
    """
    # id, x, y, type, kingdom_id, 'village_name', player_id, 'player_name', pop
    simple_re = re.compile(
        r"\((\d+),\s*(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*\d+,\s*"
        r"'([^']*)',\s*(\d+),\s*'([^']*)',\s*(-?\d+)"
    )

    villages, oases = [], []

    for line in lines:
        if "x_world" not in line and not line.startswith("INSERT INTO"):
            continue
        for m in simple_re.finditer(line):
            try:
                tile_id   = int(m.group(1))
                x         = int(m.group(2))
                y         = int(m.group(3))
                tile_type = int(m.group(4))
                vname     = m.group(5)
                # group 6 = player_id (integer, skipped)
                pname     = m.group(7)
                pop       = int(m.group(8))
            except (ValueError, IndexError):
                continue

            if tile_type < 0:
                bonus = OASIS_BONUS.get(tile_type, f"Oasis({tile_type})")
                oases.append({"x": x, "y": y, "type_code": tile_type,
                               "bonus": bonus, "occupied": pop > 0,
                               "occupier": pname if pop > 0 else ""})
            elif tile_type > 0:
                villages.append({"x": x, "y": y, "type_code": tile_type,
                                  "name": vname, "player": pname, "population": pop})

    print(f"[INFO] Parsed {len(villages):,} villages, {len(oases):,} oases.")
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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--server",       required=True)
    ap.add_argument("--x",            type=int, required=True)
    ap.add_argument("--y",            type=int, required=True)
    ap.add_argument("--radius",       type=float, default=40)
    ap.add_argument("--min-pop",      type=int, default=0)
    ap.add_argument("--max-pop",      type=int, default=9999)
    ap.add_argument("--oasis-radius", type=float, default=3.0)
    ap.add_argument("--type",         choices=["9c","15c","both"], default="both")
    args = ap.parse_args()

    os.makedirs(".tmp", exist_ok=True)

    lines    = download_map(args.server)
    villages, oases = parse_x_world(lines)

    target_types = set()
    if args.type in ("15c","both"): target_types |= FIFTEEN_CROPPER_TYPES
    if args.type in ("9c","both"):  target_types |= NINE_CROPPER_TYPES

    results = []
    for v in villages:
        if v["type_code"] not in target_types: continue
        d = dist(args.x, args.y, v["x"], v["y"])
        if d > args.radius: continue
        if not (args.min_pop <= v["population"] <= args.max_pop): continue

        label  = "15c" if v["type_code"] in FIFTEEN_CROPPER_TYPES else "9c"
        near   = nearby_oases(v["x"], v["y"], oases, args.oasis_radius)
        sc     = score(near)

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
        })

    results.sort(key=lambda r: (
        0 if r["label"] == "15c" else 1,
        -r["oasis_score"],
        r["distance_from_you"]
    ))

    print(f"\n[RESULTS] {len(results)} cropper(s) within {args.radius} tiles of ({args.x}|{args.y})\n")
    for i, r in enumerate(results[:30], 1):
        ostr = ", ".join(f"{o['bonus']}({o['distance']}t)" for o in r["nearby_oases"][:3])
        st   = "FREE" if not r["occupied"] else "TAKEN"
        player_safe = r["player"].encode("ascii","replace").decode()
        print(f"  #{i:2d} [{r['label']}] ({r['x']:4d}|{r['y']:4d}) {r['distance_from_you']:5.1f}t "
              f"| {st:5s} {player_safe:16s} pop:{r['population']:4d} score:{r['oasis_score']:3d}"
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
                        r["player"], r["population"], r["oasis_score"], ostr])
    print(f"[OUT] CSV  -> {cp}")


if __name__ == "__main__":
    main()
