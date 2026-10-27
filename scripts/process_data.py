"""
Process Job Bank Employment Outlooks (EN+FR) and Wages into per-occupation JSON files.

Author: Xiaopeng Li
Copyright (c) 2026 Xiaopeng Li

Outputs:
  - public/data/occupations.json           (list of {code, title:{en,fr}} for search)
  - public/data/occ/NOC_XXXXX.json         (per-occupation: bilingual regions + wages)
"""
import pandas as pd
import json
import math
import os
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
OUT_DIR = BASE / "public" / "data"
OCC_DIR = OUT_DIR / "occ"
OCC_DIR.mkdir(parents=True, exist_ok=True)

# Input files can be overridden via env vars (used by update_statcan.py when a
# newer outlook year pair is published); defaults are the 2025-2027 release.
SRC_EN = Path(os.environ.get("OUTLOOK_EN", BASE / "data" / "outlooks_2025_2027_en.xlsx"))
SRC_FR = Path(os.environ.get("OUTLOOK_FR", BASE / "data" / "outlooks_2025_2027_fr.xlsx"))
SRC_WAGES = Path(os.environ.get("WAGES_CSV", BASE / "data" / "wages_2025.csv"))

# French -> canonical outlook key mapping
FR_OUTLOOK_MAP = {
    'très bonnes': 'very good',
    'bonnes': 'good',
    'modérées': 'moderate',
    'limitées': 'limited',
    'très limitées': 'very limited',
    'indéterminées': 'undetermined',
    'indisponible': 'undetermined',
}

def clean_value(v):
    """Convert NaN/None to empty string, everything else to string."""
    if v is None:
        return ""
    if isinstance(v, float) and math.isnan(v):
        return ""
    return str(v)

def clean_num(v):
    if v is None:
        return None
    if isinstance(v, float) and math.isnan(v):
        return None
    return v

def norm_outlook(v, lang):
    s = clean_value(v).strip().lower()
    if lang == 'fr':
        return FR_OUTLOOK_MAP.get(s, s)
    return s

print("Reading EN outlooks...")
df_en = pd.read_excel(SRC_EN)
df_en = df_en[df_en["LANG"] == "EN"].copy()
print(f"  EN rows: {len(df_en)}")

print("Reading FR outlooks...")
df_fr = pd.read_excel(SRC_FR)
df_fr = df_fr[df_fr["LANG"] == "FR"].copy()
print(f"  FR rows: {len(df_fr)}")

print("Reading wages...")
df_w = pd.read_csv(SRC_WAGES)
print(f"  Wage rows: {len(df_w)}")

# ---- Build per-NOC structures ----
en_by_noc = {code: grp for code, grp in df_en.groupby("NOC_Code")}
fr_by_noc = {code: grp for code, grp in df_fr.groupby("NOC_Code")}
w_by_noc = {code: grp for code, grp in df_w.groupby("NOC_CNP")}

all_codes = sorted(set(en_by_noc.keys()) | set(fr_by_noc.keys()) | set(w_by_noc.keys()))
print(f"Total occupations: {len(all_codes)}")

occupations_list = []

for noc in all_codes:
    en_grp = en_by_noc.get(noc)
    fr_grp = fr_by_noc.get(noc)
    w_grp = w_by_noc.get(noc)

    # Titles
    title_en = clean_value(en_grp["NOC Title"].iloc[0]) if en_grp is not None else ""
    title_fr = clean_value(fr_grp["NOC Title"].iloc[0]) if fr_grp is not None else ""
    # Fallback: wage file also has both titles (column case varies by year)
    if not title_en and w_grp is not None:
        title_en_col = next((c for c in w_grp.columns if 'noc_title' in c.lower() and '_eng' in c.lower()), None)
        if title_en_col:
            title_en = clean_value(w_grp[title_en_col].iloc[0])
    if not title_fr and w_grp is not None:
        title_fr_col = next((c for c in w_grp.columns if 'noc_title' in c.lower() and '_fra' in c.lower()), None)
        if title_fr_col:
            title_fr = clean_value(w_grp[title_fr_col].iloc[0])

    occupations_list.append({"code": noc, "title": {"en": title_en, "fr": title_fr}})

    # Regions (EN)
    regions_en = []
    if en_grp is not None:
        for _, row in en_grp.iterrows():
            regions_en.append({
                "province": clean_value(row["Province"]),
                "regionCode": clean_value(row["Economic Region Code"]),
                "regionName": clean_value(row["Economic Region Name"]),
                "outlook": norm_outlook(row["Outlook"], "en"),
                "trends": clean_value(row["Employment Trends"]),
            })

    # Regions (FR)
    regions_fr = []
    if fr_grp is not None:
        for _, row in fr_grp.iterrows():
            regions_fr.append({
                "province": clean_value(row["Province"]),
                "regionCode": clean_value(row["Economic Region Code"]),
                "regionName": clean_value(row["Economic Region Name"]),
                "outlook": norm_outlook(row["Outlook"], "fr"),
                "trends": clean_value(row["Employment Trends"]),
            })

    # Release date (use EN, fallback FR)
    release_date = ""
    if en_grp is not None:
        release_date = clean_value(en_grp["Release Date"].iloc[0])[:10]
    elif fr_grp is not None:
        release_date = clean_value(fr_grp["Release Date"].iloc[0])[:10]

    # Wages
    wages = []
    if w_grp is not None:
        for _, row in w_grp.iterrows():
            er_code = clean_value(row["ER_Code_Code_RE"]).replace("ER", "")
            # National row is marked NAT in some years, CA in others -> normalize to CA
            prov = clean_value(row["prov"]) or "CA"
            if prov == "NAT":
                prov = "CA"
            # Normalize province codes to match the outlook files (PE, NT)
            prov_map = {'PEI': 'PE', 'NWT': 'NT'}
            prov = prov_map.get(prov, prov)
            wages.append({
                "province": prov,
                "regionCode": er_code,
                "regionName": clean_value(row["ER_Name"]),
                "nomRegion": clean_value(row["Nom_RE"]),
                "low": clean_num(row["Low_Wage_Salaire_Minium"]),
                "median": clean_num(row["Median_Wage_Salaire_Median"]),
                "high": clean_num(row["High_Wage_Salaire_Maximal"]),
                "avg": clean_num(row["Average_Wage_Salaire_Moyen"]),
                "annual": int(row.get("Annual_Wage_Flag_Salaire_annuel", 0) or 0) == 1,
            })

    occ_file = {
        "code": noc,
        "title": {"en": title_en, "fr": title_fr},
        "releaseDate": release_date,
        "regions": {"en": regions_en, "fr": regions_fr},
        "wages": wages,
    }

    with open(OCC_DIR / f"{noc}.json", "w", encoding="utf-8") as f:
        json.dump(occ_file, f, ensure_ascii=False)

# Occupations list (for search)
with open(OUT_DIR / "occupations.json", "w", encoding="utf-8") as f:
    json.dump(occupations_list, f, ensure_ascii=False)

print(f"\nDone. {len(occupations_list)} occupations -> {OCC_DIR}")
print("occupations.json written.")

# Sanity check
sample = occupations_list[0]
print(f"\nSample: {sample['code']} - {sample['title']}")
occ_path = OCC_DIR / f"{sample['code']}.json"
print(f"File size: {occ_path.stat().st_size / 1024:.1f} KB")
with open(occ_path, encoding="utf-8") as f:
    d = json.load(f)
print(f"  EN regions: {len(d['regions']['en'])}, FR regions: {len(d['regions']['fr'])}, wages: {len(d['wages'])}")
print(f"  First EN region: {d['regions']['en'][0]['regionName']} ({d['regions']['en'][0]['outlook']})")
print(f"  First FR region: {d['regions']['fr'][0]['regionName']} ({d['regions']['fr'][0]['outlook']})")
print(f"  First wage: {d['wages'][0]['regionName']} median={d['wages'][0]['median']}")
