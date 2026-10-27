# -*- coding: utf-8 -*-
# Author: andreali9029-eng
# Copyright (c) 2026 andreali9029-eng

"""Show full URLs of the 2025-2027 XLSX resources (en/fr) and find wages dataset."""
import json, re, urllib.request, urllib.parse

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.loads(r.read().decode("utf-8"))

d = get("https://open.canada.ca/data/api/3/action/package_search?q=" + urllib.parse.quote("outlook occupation") + "&rows=10")
for pkg in d.get("result", {}).get("results", []):
    if "3-Year Employment Outlooks" in pkg.get("title", ""):
        for res in pkg.get("resources", []):
            name = res.get("name", "")
            if "2025-2027" in name:
                print("NAME:", name)
                print("  URL:", res.get("url"))
                print("  FORMAT:", res.get("format"), "| ID:", res.get("id"))
print()
# find wages by occupation
for q in ["wage rates occupation canada", "employment and social development wages occupation"]:
    try:
        d2 = get("https://open.canada.ca/data/api/3/action/package_search?q=" + urllib.parse.quote(q) + "&rows=8")
        for pkg in d2.get("result", {}).get("results", []):
            t = pkg.get("title", "")
            if "wage" in t.lower() or "salary" in t.lower():
                print("WAGES PKG:", t[:80])
                for res in pkg.get("resources", [])[:6]:
                    n = res.get("name", "")
                    if "2025" in n or "csv" in (res.get("format", "") or "").lower() or "xlsx" in (res.get("format", "") or "").lower():
                        print("   ", res.get("format"), "|", n[:70], "|", res.get("url", "")[:130])
    except Exception as e:
        print(q, "ERR", e)
