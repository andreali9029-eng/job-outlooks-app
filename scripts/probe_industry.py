# -*- coding: utf-8 -*-
# Author: andreali9029-eng
# Copyright (c) 2026 andreali9029-eng

"""Probe NAICS values in 14100201 (both languages) and Type of employee."""
import zipfile, os
import pandas as pd

BASE = r"C:\Users\yaomu\Doubao\chats\2026-10-08\new-chat\job-outlooks-app\data"

def read_csv_any(fh):
    head = fh.read(2000)
    fh.seek(0)
    text = head.decode("utf-8-sig", errors="replace")
    if text.count(";") > text.count(",") * 3 and ";" in text:
        return pd.read_csv(fh, sep=";", encoding="utf-8-sig", low_memory=False)
    return pd.read_csv(fh, encoding="utf-8-sig", low_memory=False)

for lang, zname in [("en", "14100201-eng.zip"), ("fr", "14100201-fra.zip")]:
    with zipfile.ZipFile(os.path.join(BASE, zname)) as z:
        csvname = [n for n in z.namelist() if n.endswith(".csv")][0]
        with z.open(csvname) as f:
            df = read_csv_any(f)
    print(f"\n===== 14100201-{lang} rows={len(df)} cols={list(df.columns)[:7]}")
    # NAICS column
    naics_col = [c for c in df.columns if 'NAICS' in c or 'SCIAN' in c or 'Classification' in c or 'Industrie' in c]
    emp_col = [c for c in df.columns if 'Type of employee' in c or "Type d'employé" in c or 'employé' in c.lower()]
    print("NAICS col:", naics_col, "| employee col:", emp_col)
    if naics_col:
        vals = df[naics_col[0]].dropna().unique()
        print(f"  NAICS values ({len(vals)}):")
        for v in vals:
            print("   -", str(v)[:70])
    if emp_col:
        print("  employee types:", [str(v)[:40] for v in df[emp_col[0]].dropna().unique()])
    print("  GEO count:", df.iloc[:,1].nunique())
