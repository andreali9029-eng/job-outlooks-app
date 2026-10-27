# -*- coding: utf-8 -*-
# Author: Xiaopeng Li
# Copyright (c) 2026 Xiaopeng Li

"""Probe remaining StatCan tables with separator auto-detection."""
import urllib.request, zipfile, os, io

BASE = r"C:\Users\yaomu\Doubao\chats\2026-10-08\new-chat\job-outlooks-app\data"
import pandas as pd

def dl(url, dest):
    if os.path.exists(dest):
        print("exists:", dest); return
    print("downloading", url)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=180) as r, open(dest, "wb") as f:
        f.write(r.read())
    print("  saved", dest, os.path.getsize(dest))

def read_csv_any(fh):
    head = fh.read(2000)
    fh.seek(0)
    text = head.decode("utf-8-sig", errors="replace")
    # StatCan CSVs are comma-separated; some FR variants use ; with quoting
    if text.count(";") > text.count(",") * 3 and ";" in text:
        return pd.read_csv(fh, sep=";", encoding="utf-8-sig", low_memory=False)
    return pd.read_csv(fh, encoding="utf-8-sig", low_memory=False)

for pid, (en_zip, fr_zip) in {
    "14100287": ("14100287-eng.zip", "14100287-fra.zip"),
    "14100416": ("14100416-eng.zip", "14100416-fra.zip"),
}.items():
    for lang, zname in [("en", en_zip), ("fr", fr_zip)]:
        zpath = os.path.join(BASE, zname)
        dl(f"https://www150.statcan.gc.ca/n1/tbl/csv/{zname}", zpath)
        with zipfile.ZipFile(zpath) as z:
            csvname = [n for n in z.namelist() if n.endswith(".csv")][0]
            with z.open(csvname) as f:
                df = read_csv_any(f)
            print(f"\n[{pid}-{lang}] rows={len(df)} cols={list(df.columns)[:8]}")
            print("  row0:", df.iloc[0].to_dict())
            for c in df.columns[:4]:
                vals = df[c].dropna().unique()[:14]
                print(f"    col '{c}':", [str(v)[:42] for v in vals])
