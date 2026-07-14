#!/usr/bin/env python3
"""Compact Overpass power data into static JSON snapshots for the web app.

- lines: voltage class (765/345/154/other), coordinates rounded + downsampled
- plants: center point, output MW parsed, source tag, name
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


def voltage_class(vtag):
    if not vtag:
        return 0
    volts = [int(v) for v in re.findall(r"\d+", vtag) if int(v) >= 1000]
    if not volts:
        return 0
    top = max(volts)
    if top >= 700000:
        return 765
    if top >= 300000:
        return 345
    if top >= 100000:
        return 154
    return 66


def simplify(coords, min_gap_m):
    if len(coords) <= 2:
        return coords
    out = [coords[0]]
    for pt in coords[1:-1]:
        if haversine_m(out[-1], pt) >= min_gap_m:
            out.append(pt)
    out.append(coords[-1])
    return out


def parse_mw(tags):
    raw = tags.get("plant:output:electricity", "")
    m = re.match(r"\s*([\d.,]+)\s*(GW|MW|kW|W)?", raw, re.I)
    if not m or not m.group(1):
        return None
    try:
        val = float(m.group(1).replace(",", ""))
    except ValueError:
        return None
    unit = (m.group(2) or "MW").upper()
    factor = {"GW": 1000, "MW": 1, "KW": 0.001, "W": 0.000001}[unit]
    mw = val * factor
    return round(mw, 2) if mw < 10 else round(mw)


# ---- lines ----
with open("lines.json") as f:
    lines_raw = json.load(f)["elements"]

lines = []
skipped = 0
for el in lines_raw:
    geom = el.get("geometry")
    if not geom:
        continue
    vclass = voltage_class(el.get("tags", {}).get("voltage", ""))
    if vclass == 0:
        vclass = 154 if el.get("tags", {}).get("cables") else 66
    # gap: aggressive for low voltage, fine for EHV
    gap = {765: 150, 345: 200, 154: 350, 66: 600}[vclass]
    coords = [[round(g["lat"], 4), round(g["lon"], 4)] for g in geom]
    coords = simplify(coords, gap)
    if len(coords) < 2:
        skipped += 1
        continue
    lines.append({"v": vclass, "c": coords})

with open(f"{OUT_DIR}/kr_power_lines.json", "w") as f:
    json.dump({
        "source": "OpenStreetMap via Overpass API (power=line)",
        "license": "ODbL 1.0",
        "extracted": EXTRACTED,
        "note": "voltage class = max tagged voltage; coordinates simplified for display",
        "count": len(lines),
        "lines": lines,
    }, f, ensure_ascii=False, separators=(",", ":"))

# ---- plants ----
with open("plants.json") as f:
    plants_raw = json.load(f)["elements"]

plants = []
for el in plants_raw:
    tags = el.get("tags", {})
    if el.get("type") == "node":
        lat, lon = el.get("lat"), el.get("lon")
    else:
        c = el.get("center") or {}
        lat, lon = c.get("lat"), c.get("lon")
    if lat is None:
        continue
    name = tags.get("name:ko") or tags.get("name") or ""
    source = tags.get("plant:source") or tags.get("plant:method") or ""
    plants.append([round(lat, 4), round(lon, 4), parse_mw(tags), name[:40], source])

with open(f"{OUT_DIR}/kr_power_plants.json", "w") as f:
    json.dump({
        "source": "OpenStreetMap via Overpass API (power=plant)",
        "license": "ODbL 1.0",
        "extracted": EXTRACTED,
        "note": "MW parsed from plant:output:electricity; null = untagged",
        "count": len(plants),
        "plants": plants,
    }, f, ensure_ascii=False, separators=(",", ":"))

total_mw = sum(p[2] for p in plants if p[2])
by_class = {}
for l in lines:
    by_class[l["v"]] = by_class.get(l["v"], 0) + 1
print(f"lines: {len(lines)} (skipped {skipped}) by class {by_class}")
print(f"plants: {len(plants)}, tagged MW total {total_mw:,.0f}")
