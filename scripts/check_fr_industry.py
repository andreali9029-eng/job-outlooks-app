# -*- coding: utf-8 -*-
# Author: Xiaopeng Li
# Copyright (c) 2026 Xiaopeng Li

"""Check FR employee-type values and sample rows in 14100201."""
import zipfile, os
import pandas as pd

BASE = r"C:\Users\yaomu\Doubao\chats\2026-10-08\new-chat\job-outlooks-app\data"
z = zipfile.ZipFile(os.path.join(BASE, "14100201-fra.zip"))
csvname = [n for n in z.namelist() if n.endswith(".csv")][0]
fh = z.open(csvname)
head = fh.read(2000)
fh.seek(0)
text = head.decode("utf-8-sig", errors="replace")
df = pd.read_csv(fh, sep=";", encoding="utf-8-sig", low_memory=False, nrows=2000) if ";" in text else pd.read_csv(fh, encoding="utf-8-sig", low_memory=False, nrows=2000)
print("cols:", list(df.columns))
for c in df.columns:
    if "salari" in c.lower() or "employ" in c.lower() or "Type" in c:
        print("col:", c, "->", [str(v)[:40] for v in df[c].dropna().unique()])
