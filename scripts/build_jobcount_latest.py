# -*- coding: utf-8 -*-
# Author: Xiaopeng Li
# Copyright (c) 2026 Xiaopeng Li

"""
Collapse the latest daily Job Bank snapshot into a small front-end JSON:
public/data/trends/jobcounts-latest.json
  { "date": "2026-10-20", "counts": { "72106": { "ON": 211, "BC": 89 }, ... } }
Run after (or alongside) scrape_jobcount.py.
"""
import glob, json, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(BASE, "data", "jobcounts")
OUT = os.path.join(BASE, "public", "data", "trends", "jobcounts-latest.json")

files = sorted(glob.glob(os.path.join(SRC, "*.jsonl")))
if not files:
    print("no snapshots yet; run scripts/scrape_jobcount.py first")
    raise SystemExit(0)

latest = files[-1]
date = os.path.basename(latest)[:10]
counts = {}
with open(latest, encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        r = json.loads(line)
        c = r.get("count")
        if c is None:
            continue
        counts.setdefault(r["noc"], {})[r["province"]] = c

out = {"date": date, "counts": counts}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False)
print(f"saved {OUT} ({len(counts)} occupations, date={date})")
