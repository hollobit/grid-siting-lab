#!/usr/bin/env python3
"""Compact Overpass rail/motorway data into a static JSON snapshot.

Input (cwd): rail.json (railway=rail, usage=main|branch), motorway.json (highway=motorway)
Output: kr_transport.json — { rail: [{h: 0|1, c: [[lat,lng],...]}], road: [[[lat,lng],...]] }
  h=1 → 고속철(highspeed=yes 또는 maxspeed>=200)
"""
import json
import math
import re
import sys

OUT_DIR = sys.argv[1] if len(sys.argv) > 1 else "."
EXTRACTED = "2026-07-15"


def haversine_m(a, b):
    lat1, lon1, lat2, lon2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    dlat, dlon = lat2 - lat1, lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * 6371000 * math.asin(math.sqrt(h))


def simplify(coords, min_gap_m):
    if len(coords) <= 2:
        return coords
    out = [coords[0]]
    for pt in coords[1:-1]:
        if haversine_m(out[-1], pt) >= min_gap_m:
            out.append(pt)
    out.append(coords[-1])
    return out


def coords_of(el):
    return [[round(g["lat"], 4), round(g["lon"], 4)] for g in el.get("geometry", [])]


def is_highspeed(tags):
    if tags.get("highspeed") == "yes":
        return True
    speed = re.match(r"\d+", tags.get("maxspeed", ""))
    return bool(speed and int(speed.group()) >= 200)


with open("rail.json") as f:
    rail_raw = json.load(f)["elements"]
rail = []
for el in rail_raw:
    coords = simplify(coords_of(el), 400)
    if len(coords) < 2:
        continue
    rail.append({"h": 1 if is_highspeed(el.get("tags", {})) else 0, "c": coords})

with open("motorway.json") as f:
    road_raw = json.load(f)["elements"]
road = []
for el in road_raw:
    coords = simplify(coords_of(el), 400)
    if len(coords) < 2:
        continue
    road.append(coords)

with open(f"{OUT_DIR}/kr_transport.json", "w") as f:
    json.dump({
        "source": "OpenStreetMap via Overpass API (railway=rail usage=main|branch, highway=motorway)",
        "license": "ODbL 1.0",
        "extracted": EXTRACTED,
        "note": "coordinates simplified for display; h=1 marks high-speed rail",
        "railCount": len(rail),
        "roadCount": len(road),
        "rail": rail,
        "road": road,
    }, f, ensure_ascii=False, separators=(",", ":"))

hs = sum(1 for r in rail if r["h"])
print(f"rail: {len(rail)} ways ({hs} high-speed), road: {len(road)} motorway ways")
