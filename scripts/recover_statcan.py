# -*- coding: utf-8 -*-
"""Try to locate StatCan table zips via open.canada.ca CKAN mirrors."""
import json, re, urllib.request, urllib.parse

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.loads(r.read().decode("utf-8"))

for pid in ["14100287", "14100201", "14100416"]:
    print(f"\n### {pid}")
    try:
        d = get(f"https://open.canada.ca/data/api/3/action/package_search?q={pid}&rows=10")
        for pkg in d.get("result", {}).get("results", []):
            print("  PKG:", pkg.get("title", "")[:70])
            for res in pkg.get("resources", [])[:20]:
                url = res.get("url", "")
                fmt = res.get("format", "")
                print(f"     {fmt:6s} | {res.get('name','')[:50]:50s} | {url[:120]}")
    except Exception as e:
        print("  ERR", e)
