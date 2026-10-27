# -*- coding: utf-8 -*-
# Author: andreali9029-eng
# Copyright (c) 2026 andreali9029-eng

"""
Merge all daily Job Bank snapshots (data/jobcounts/*.jsonl) into one
front-end file public/data/trends/jobcounts-history.json:

{
  "updated": "2026-10-21",
  "occupations": {
    "72106": {
      "title_en": "...", "title_fr": "...",
      "series": { "ON": { "dates": ["2026-10-20", "2026-10-21"], "counts": [211, 211] } }
    }
  }
}

The PWA renders a "postings over time" chart from this; with a single day it
shows a "building history" hint, and a real trend line once 2+ days exist.
"""
import glob, json, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(BASE, "data", "jobcounts")
OS = os.path.join(BASE, "public", "data", "occupations.json")
OUT = os.path.join(BASE, "public", "data", "trends", "jobcounts-history.json")

files = sorted(glob.glob(os.path.join(SRC, "*.jsonl")))
if not files:
    print("no snapshots yet; run scripts/scrape_jobcount.py first")
    raise SystemExit(0)

with open(OS, encoding="utf-8") as f:
    occs = json.load(f)
title_by_noc = {}
for o in occs:
    code = o["code"].replace("NOC_", "")
    title_by_noc[code] = {"en": o.get("title", {}).get("en", ""),
                           "fr": o.get("title", {}).get("fr", "")}

occ = {}  # noc -> { title_en, title_fr, series: { prov: {dates:[], counts:[]} } }
for path in files:
    date = os.path.basename(path)[:10]
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            r = json.loads(line)
            noc = r.get("noc")
            prov = r.get("province")
            c = r.get("count")
            if not noc or not prov or c is None:
                continue
            o = occ.setdefault(noc, {"title_en": title_by_noc.get(noc, {}).get("en", ""),
                                     "title_fr": title_by_noc.get(noc, {}).get("fr", ""),
                                     "series": {}})
            s = o["series"].setdefault(prov, {"dates": [], "counts": []})
            if date not in s["dates"]:
                s["dates"].append(date)
                s["counts"].append(c)
            else:
                # replace same-day value (re-scrape)
                i = s["dates"].index(date)
                s["counts"][i] = c

# sort dates within each series
for o in occ.values():
    for prov, s in o["series"].items():
        pairs = sorted(zip(s["dates"], s["counts"]))
        s["dates"] = [d for d, _ in pairs]
        s["counts"] = [c for _, c in pairs]

out = {"updated": os.path.basename(files[-1])[:10], "occupations": occ}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False)

print(f"saved {OUT} ({len(occ)} occupations, {len(files)} snapshot files)")
for noc, o in list(occ.items())[:5]:
    provs = {p: len(s["dates"]) for p, s in o["series"].items()}
    print(f"  {noc}: {provs}")
