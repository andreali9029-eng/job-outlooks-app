# -*- coding: utf-8 -*-
# Author: Xiaopeng Li
# Copyright (c) 2026 Xiaopeng Li

"""List all resources of the 3-Year Employment Outlooks package with URLs."""
import json, re, urllib.request, urllib.parse

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.loads(r.read().decode("utf-8"))

d = get(f"https://open.canada.ca/data/api/3/action/package_search?q={urllib.parse.quote('outlook occupation')}&rows=10")
for pkg in d.get("result", {}).get("results", []):
    if "3-Year Employment Outlooks" in pkg.get("title", ""):
        print("PKG:", pkg.get("title"), "| id:", pkg.get("id"))
        for res in pkg.get("resources", []):
            name = res.get("name", "")
            url = res.get("url", "")
            fmt = res.get("format", "")
            if re.search(r"\d{4}-\d{4}", name) or re.search(r"wage", name, re.I):
                print(f"  {fmt:6s} | {name[:60]:60s} | {url[:110]}")
        # also check newest wages package separately
print("\n--- wages search ---")
d2 = get(f"https://open.canada.ca/data/api/3/action/package_search?q={urllib.parse.quote('wages occupation employment outlook')}&rows=6")
for pkg in d2.get("result", {}).get("results", []):
    print("PKG:", pkg.get("title", "")[:70])
    for res in pkg.get("resources", [])[:10]:
        name = res.get("name", "")
        if re.search(r"wage", name, re.I) or re.search(r"\d{4}", name):
            print(f"   {res.get('format',''):6s} | {name[:60]:60s} | {res.get('url','')[:110]}")
