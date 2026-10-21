"""
Process Job Bank Wages CSV into clean JSON for the frontend.
Outputs: public/data/wages.json (keyed by NOC code)
"""
import pandas as pd
import json
import math
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
SRC = BASE / "data" / "wages_2023.csv"
OUT_DIR = BASE / "public" / "data"
OUT_DIR.mkdir(parents=True, exist_ok=True)

def clean_value(v):
    if v is None:
        return ""
    if isinstance(v, float) and math.isnan(v):
        return ""
    return v

print(f"Reading {SRC} ...")
df = pd.read_csv(SRC)
print(f"Total rows: {len(df)}")

# Filter to English only (already is, but just in case)
# Keep only rows with actual wage data
df = df[df['Median_Wage_Salaire_Median'].notna()].copy()
print(f"Rows with wage data: {len(df)}")

# Group by NOC code
wages = {}
for noc_code, grp in df.groupby("NOC_CNP"):
    title = clean_value(grp["NOC_TITLE_ENG"].iloc[0])
    regions = []
    for _, row in grp.iterrows():
        is_annual = int(row.get("Annual_Wage_Flag_Salaire_annuel", 0) or 0)
        regions.append({
            "province": clean_value(row["prov"]) or "CA",
            "regionCode": str(clean_value(row["ER_Code_Code_RE"]) or "").replace("ER", ""),
            "regionName": clean_value(row["ER_Name"]),
            "lowWage": clean_value(row["Low_Wage_Salaire_Minium"]),
            "medianWage": clean_value(row["Median_Wage_Salaire_Median"]),
            "highWage": clean_value(row["High_Wage_Salaire_Maximal"]),
            "avgWage": clean_value(row["Average_Wage_Salaire_Moyen"]),
            "isAnnual": is_annual == 1,
        })
    wages[clean_value(noc_code)] = {
        "title": title,
        "regions": regions,
    }

with open(OUT_DIR / "wages.json", "w", encoding="utf-8") as f:
    json.dump(wages, f, ensure_ascii=False, indent=2)

print(f"Wage entries: {len(wages)}")
print(f"Output written to {OUT_DIR / 'wages.json'}")

# Sample check
sample = list(wages.keys())[0]
print(f"\nSample: {sample} - {wages[sample]['title']}")
print(f"  Regions: {len(wages[sample]['regions'])}")
print(f"  First: {wages[sample]['regions'][0]}")
