# -*- coding: utf-8 -*-
# Author: andreali9029-eng
# Copyright (c) 2026 andreali9029-eng

"""Inspect open.canada.ca CKAN for the outlook resources naming."""
import json, re, urllib.request, urllib.parse

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.loads(r.read().decode("utf-8"))

for q in ["outlook occupation", "employment outlook", "job outlook"]:
    try:
        d = get(f"https://open.canada.ca/data/api/3/action/package_search?q={urllib.parse.quote(q)}&rows=8")
        res = d.get("result", {}).get("results", [])
        print(f"\n### q={q} -> {len(res)} packages")
        for pkg in res:
            title = pkg.get("title", "")
            reslist = pkg.get("resources", [])
            names = [r.get("name", "") for r in reslist][:14]
            print(f"  PKG: {title[:60]}")
            for n in names:
                print(f"     - {n[:90]}")
    except Exception as e:
        print(f"q={q} ERR {e}")
