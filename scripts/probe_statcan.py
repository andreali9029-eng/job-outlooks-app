# -*- coding: utf-8 -*-
"""Download StatCan LFS tables and inspect their structure."""
import urllib.request, zipfile, io, os

BASE = r"C:\Users\yaomu\Doubao\chats\2026-10-08\new-chat\job-outlooks-app\data"
os.makedirs(BASE, exist_ok=True)

files = {
    "14100287": ("unemployment", "14100287-eng.zip", "14100287-fra.zip"),
    "14100201": ("industry", "14100201-eng.zip", "14100201-fra.zip"),
    "14100416": ("occ_unemp", "14100416-eng.zip", "14100416-fra.zip"),
}

def dl(url, dest):
    if os.path.exists(dest):
        print("exists:", dest)
        return
    print("downloading", url)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
        f.write(r.read())
    print("  saved", dest, os.path.getsize(dest))

import pandas as pd

for pid, (tag, en_zip, fr_zip) in files.items():
    for lang, zname in [("en", en_zip), ("fr", fr_zip)]:
        zpath = os.path.join(BASE, zname)
        dl(f"https://www150.statcan.gc.ca/n1/tbl/csv/{zname}", zpath)
        # peek inside zip
        with zipfile.ZipFile(zpath) as z:
            names = z.namelist()
            print("  zip:", names[:3])
            # read first csv
            csvname = [n for n in names if n.endswith(".csv")][0]
            with z.open(csvname) as f:
                df = pd.read_csv(f, nrows=5)
            print(f"  [{pid}-{lang}] columns:", list(df.columns))
            print("  row0:", df.iloc[0].to_dict())
            # unique values of first 3 cols
            with z.open(csvname) as f:
                full = pd.read_csv(f, nrows=200000, low_memory=False)
            for c in full.columns[:4]:
                vals = full[c].dropna().unique()[:12]
                print(f"    col '{c}' sample:", [str(v)[:40] for v in vals])
            print()
