# -*- coding: utf-8 -*-
# Author: Xiaopeng Li
# Copyright (c) 2026 Xiaopeng Li

"""
Build labour-market trend JSON files for the PWA from StatCan LFS tables.
Inputs (already downloaded in data/):
  14100287-{eng,fra}.zip  -> unemployment.json     (monthly, seasonally adjusted, 15y)
  14100201-{eng,fra}.zip  -> industry.json         (monthly employment by NAICS sector, 10y)
  14100416-{eng,fra}.zip  -> occ-unemployment.json (annual unemployment rate by NOC group, latest year)
Outputs -> public/data/trends/
"""
import zipfile, os, re, json
import pandas as pd

BASE = r"C:\Users\yaomu\Doubao\chats\2026-10-08\new-chat\job-outlooks-app\data"
OUT = r"C:\Users\yaomu\Doubao\chats\2026-10-08\new-chat\job-outlooks-app\public\data\trends"
os.makedirs(OUT, exist_ok=True)

GEO_EN = {'Canada': 'CA', 'Newfoundland and Labrador': 'NL', 'Prince Edward Island': 'PE',
          'Nova Scotia': 'NS', 'New Brunswick': 'NB', 'Quebec': 'QC', 'Ontario': 'ON',
          'Manitoba': 'MB', 'Saskatchewan': 'SK', 'Alberta': 'AB', 'British Columbia': 'BC',
          'Yukon': 'YT', 'Northwest Territories': 'NT', 'Nunavut': 'NU'}
GEO_FR = {'Canada': 'CA', 'Terre-Neuve-et-Labrador': 'NL', 'Île-du-Prince-Édouard': 'PE',
          'Nouvelle-Écosse': 'NS', 'Nouveau-Brunswick': 'NB', 'Québec': 'QC', 'Ontario': 'ON',
          'Manitoba': 'MB', 'Saskatchewan': 'SK', 'Alberta': 'AB', 'Colombie-Britannique': 'BC',
          'Yukon': 'YT', 'Territoires du Nord-Ouest': 'NT', 'Nunavut': 'NU'}

# NAICS top-level sectors we track (matched by the bracketed code in the label)
INDUSTRY_CODES = ['21', '22,221', '23', '31-33', '41', '44-45', '48-49', '51', '52', '53',
                  '54,541', '55,551,5511', '56,561,562', '61,611', '62', '71', '72', '81', '91']


def read_csv_any(fh):
    head = fh.read(2000)
    fh.seek(0)
    text = head.decode("utf-8-sig", errors="replace")
    if text.count(";") > text.count(",") * 3 and ";" in text:
        return pd.read_csv(fh, sep=";", encoding="utf-8-sig", low_memory=False)
    return pd.read_csv(fh, encoding="utf-8-sig", low_memory=False)


def open_csv(zip_path):
    z = zipfile.ZipFile(zip_path)
    csvname = [n for n in z.namelist() if n.endswith(".csv")][0]
    return z, z.open(csvname)


def cols_of(df):
    return {c: c for c in df.columns}


def col(df, *names):
    for c in df.columns:
        if c in names:
            return c
    return None


def build_unemployment():
    print("== unemployment ==")
    out = {"updated": pd.Timestamp.today().strftime('%Y-%m-%d'),
           "months": None, "series": {}}
    for lang, zipname, geos in [("en", "14100287-eng.zip", GEO_EN), ("fr", "14100287-fra.zip", GEO_FR)]:
        z, fh = open_csv(os.path.join(BASE, zipname))
        df = read_csv_any(fh)
        c_ref = col(df, 'REF_DATE', 'PÉRIODE DE RÉFÉRENCE')
        c_geo = col(df, 'GEO', 'GÉO')
        c_chr = col(df, 'Labour force characteristics', 'Caractéristiques de la population active')
        c_gen = col(df, 'Gender', 'Genre')
        c_age = col(df, 'Age group', "Groupe d'âge")
        c_val = col(df, 'VALUE', 'VALEUR')
        unemp = 'Unemployment rate' if lang == 'en' else 'Taux de chômage'
        totg = 'Total - Gender' if lang == 'en' else 'Total - Genre'
        age15 = '15 years and over' if lang == 'en' else '15 ans et plus'
        est = 'Estimate' if lang == 'en' else 'Estimation'
        sadj = 'Seasonally adjusted' if lang == 'en' else 'Désaisonnalisées'
        c_stat = col(df, 'Statistics', 'Statistiques')
        c_dt = col(df, 'Data type', 'Type de données')
        m = (df[c_chr] == unemp) & (df[c_gen] == totg) & (df[c_age] == age15) & \
            (df[c_stat] == est) & (df[c_dt] == sadj)
        df = df[m]
        # keep last 15 years (180 months)
        dates = pd.to_datetime(df[c_ref], format='%Y-%m')
        df = df[dates >= pd.Timestamp.today() - pd.DateOffset(years=15)]
        for geo, code in geos.items():
            sub = df[df[c_geo] == geo].sort_values(c_ref)
            vals = pd.to_numeric(sub[c_val], errors='coerce').tolist()
            if not vals:
                print(f"  !! {lang} {geo}: no data")
                continue
            if code not in out["series"]:
                out["series"][code] = {}
            out["series"][code][lang] = {"dates": [str(d)[:7] for d in sub[c_ref].tolist()],
                                         "values": vals}
        z.close()
        print(f"  {lang}: {len(df)} rows kept")
    # use en dates as canonical; store months length
    ca = out["series"].get("CA", {})
    out["months"] = len(ca.get("en", {}).get("dates", []))
    with open(os.path.join(OUT, "unemployment.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False)
    print("  saved unemployment.json", os.path.getsize(os.path.join(OUT, "unemployment.json")), "bytes")


def build_industry():
    print("== industry ==")
    names = {"en": {}, "fr": {}}
    out = {"updated": pd.Timestamp.today().strftime('%Y-%m-%d'),
           "months": None, "series": {}}
    for lang, zipname, geos in [("en", "14100201-eng.zip", GEO_EN), ("fr", "14100201-fra.zip", GEO_FR)]:
        z, fh = open_csv(os.path.join(BASE, zipname))
        df = read_csv_any(fh)
        c_ref = col(df, 'REF_DATE', 'PÉRIODE DE RÉFÉRENCE')
        c_geo = col(df, 'GEO', 'GÉO')
        c_naics = col(df, 'North American Industry Classification System (NAICS)',
                      "Système de classification des industries de l'Amérique du Nord (SCIAN)")
        c_emp = col(df, 'Type of employee', 'Type de salariés')
        c_val = col(df, 'VALUE', 'VALEUR')
        allemployees = 'All employees' if lang == 'en' else 'Ensemble des salariés'
        # keep only top-level sectors
        pats = [re.compile(re.escape('[' + c + ']')) for c in INDUSTRY_CODES]
        mask = df[c_emp] == allemployees
        keep = [any(p.search(str(x)) for p in pats) for x in df[c_naics]]
        df = df[mask & pd.Series(keep)]
        for code in INDUSTRY_CODES:
            name_row = df[df[c_naics].astype(str).str.contains(re.escape('[' + code + ']'))]
            if len(name_row):
                names[lang][code] = str(name_row[c_naics].iloc[0])
        dates = pd.to_datetime(df[c_ref], format='%Y-%m')
        df = df[dates >= pd.Timestamp.today() - pd.DateOffset(years=10)]
        for geo, code in geos.items():
            for ind in INDUSTRY_CODES:
                sub = df[(df[c_geo] == geo) & (df[c_naics].astype(str).str.contains(re.escape('[' + ind + ']')))] \
                    .sort_values(c_ref)
                if sub.empty:
                    continue
                vals_num = pd.to_numeric(sub[c_val], errors='coerce').round(0)
                vals = [int(v) if pd.notna(v) else None for v in vals_num.tolist()]
                dts = [str(d)[:7] for d in sub[c_ref].tolist()]
                if code not in out["series"]:
                    out["series"][code] = {}
                out["series"][code][ind] = {"dates": dts, "values": vals,
                                            "latest": vals[-1] if vals else None}
        z.close()
        print(f"  {lang}: {len(df)} rows kept")
    out["industryNames"] = names
    ca = out["series"].get("CA", {})
    out["months"] = len(next(iter(ca.values()), {}).get("dates", [])) if ca else 0
    with open(os.path.join(OUT, "industry.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False)
    print("  saved industry.json", os.path.getsize(os.path.join(OUT, "industry.json")), "bytes")


def build_occ_unemployment():
    print("== occ-unemployment ==")
    out = {"updated": pd.Timestamp.today().strftime('%Y-%m-%d'), "year": None,
           "en": {}, "fr": {}}
    bylang = {}
    for lang, zipname, geos in [("en", "14100416-eng.zip", GEO_EN), ("fr", "14100416-fra.zip", GEO_FR)]:
        z, fh = open_csv(os.path.join(BASE, zipname))
        df = read_csv_any(fh)
        c_ref = col(df, 'REF_DATE', 'PÉRIODE DE RÉFÉRENCE')
        c_geo = col(df, 'GEO', 'GÉO')
        c_chr = col(df, 'Labour force characteristics', 'Caractéristiques de la population active')
        c_noc = col(df, 'National Occupational Classification (NOC)',
                    'Classification nationale des professions (CNP)')
        c_gen = col(df, 'Gender', 'Genre')
        c_val = col(df, 'VALUE', 'VALEUR')
        unemp = 'Unemployment rate' if lang == 'en' else 'Taux de chômage'
        totg = 'Total - Gender' if lang == 'en' else 'Total - Genre'
        df = df[(df[c_chr] == unemp) & (df[c_gen] == totg)]
        # latest year
        yr = int(df[c_ref].max())
        out["year"] = yr
        df = df[df[c_ref] == yr]
        # drop aggregate rows
        df = df[~df[c_noc].astype(str).str.contains('Total|total|all occupations|toutes les professions', regex=True)]
        rows = {code: [] for code in geos.values()}
        for geo, code in geos.items():
            sub = df[df[c_geo] == geo]
            for _, r in sub.iterrows():
                v = pd.to_numeric(r[c_val], errors='coerce')
                if pd.isna(v):
                    continue
                rows[code].append({"name": str(r[c_noc]), "rate": round(float(v), 1)})
        for code, lst in rows.items():
            lst.sort(key=lambda x: x["rate"], reverse=True)
            rows[code] = lst[:12]
        bylang[lang] = rows
        z.close()
        print(f"  {lang}: year={yr}, rows kept={len(df)}")
    out["en"] = bylang["en"]
    out["fr"] = bylang["fr"]
    with open(os.path.join(OUT, "occ-unemployment.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False)
    print("  saved occ-unemployment.json", os.path.getsize(os.path.join(OUT, "occ-unemployment.json")), "bytes")


if __name__ == "__main__":
    which = set(os.sys.argv[1:]) if len(os.sys.argv) > 1 else {"unemp", "industry", "occ"}
    if "unemp" in which:
        build_unemployment()
    if "industry" in which:
        build_industry()
    if "occ" in which:
        build_occ_unemployment()
    print("DONE")
