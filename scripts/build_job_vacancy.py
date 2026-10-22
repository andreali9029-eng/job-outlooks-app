#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Build trends/job-vacancy.json from StatCan table 14-10-0326 (JVW).

Extracts the monthly "Job vacancy rate" (Total, all industries) for Canada and
each province/territory, in both languages, for the last N years.

Usage:
  python -X utf8 scripts/build_job_vacancy.py [--years 5] [--out public/data/trends/job-vacancy.json]
"""
import argparse
import io
import json
import os
import sys
import zipfile

import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, 'data')

# geo names as they appear in the table (EN / FR CSV files use the same GEO labels
# except for the French ones, e.g. "Canada" stays, provinces are French)
GEO_MAP = {
    'en': {
        'Canada': 'CA',
        'Newfoundland and Labrador': 'NL',
        'Prince Edward Island': 'PE',
        'Nova Scotia': 'NS',
        'New Brunswick': 'NB',
        'Quebec': 'QC',
        'Ontario': 'ON',
        'Manitoba': 'MB',
        'Saskatchewan': 'SK',
        'Alberta': 'AB',
        'British Columbia': 'BC',
        'Yukon': 'YT',
        'Northwest Territories': 'NT',
        'Nunavut': 'NU',
    },
    'fr': {
        'Canada': 'CA',
        'Terre-Neuve-et-Labrador': 'NL',
        'Île-du-Prince-Édouard': 'PE',
        'Nouvelle-Écosse': 'NS',
        'Nouveau-Brunswick': 'NB',
        'Québec': 'QC',
        'Ontario': 'ON',
        'Manitoba': 'MB',
        'Saskatchewan': 'SK',
        'Alberta': 'AB',
        'Colombie-Britannique': 'BC',
        'Yukon': 'YT',
        'Territoires du Nord-Ouest': 'NT',
        'Nunavut': 'NU',
    },
}


def read_csv_any(src):
    """Read a StatCan CSV whether it is ;- or ,-separated, with BOM. Accepts a path or BytesIO."""
    if hasattr(src, 'read'):
        raw = src.read()
    else:
        with open(src, 'rb') as f:
            raw = f.read()
    if raw.startswith(b'\xef\xbb\xbf'):
        text = raw.decode('utf-8-sig')
    else:
        text = raw.decode('utf-8')
    if ';' in text.split('\n')[0]:
        return pd.read_csv(io.StringIO(text), sep=';')
    return pd.read_csv(io.StringIO(text))


def find_col(df, *keys):
    for c in df.columns:
        cu = str(c).upper()
        if any(k.upper() in cu for k in keys):
            return c
    return None


def build(years, out_path):
    series = {}
    # value filters per language (EN/FRA CSV column names and values differ)
    FILTERS = {
        'en': ('North American Industry Classification', 'Statistics', 'GEO',
               'REF_DATE', 'Total, all industries', 'Job vacancy rate'),
        'fr': ('SCIAN', 'Statistiques', 'GÉO', 'PÉRIODE DE RÉFÉRENCE',
               'Total, toutes les industries', 'Taux de postes vacants'),
    }
    for lang, suf in (('en', 'eng'), ('fr', 'fra')):
        zpath = os.path.join(DATA, f'14100326-{suf}.zip')
        if not os.path.exists(zpath):
            print(f'MISSING {zpath}')
            continue
        z = zipfile.ZipFile(zpath)
        csv_name = [n for n in z.namelist() if n.endswith('.csv') and 'MetaData' not in n][0]
        df = read_csv_any(io.BytesIO(z.read(csv_name)))
        naics_k, stat_k, geo_k, date_k, total_val, rate_val = FILTERS[lang]
        naics_col = find_col(df, naics_k)
        stat_col = find_col(df, stat_k)
        geo_col = find_col(df, geo_k)
        date_col = find_col(df, date_k)
        if not (naics_col and stat_col and geo_col and date_col):
            print(f'WARN {suf}: missing cols, got {list(df.columns)}')
            continue
        df = df[df[naics_col].astype(str).str.strip() == total_val]
        df = df[df[stat_col].astype(str).str.strip() == rate_val]
        df[date_col] = pd.to_datetime(df[date_col])
        df = df[df[date_col] >= pd.Timestamp('2019-01-01')]
        val_col = find_col(df, 'VALUE', 'VALEUR')
        prov_series = {}
        for _, row in df.iterrows():
            code = GEO_MAP[lang].get(str(row[geo_col]).strip())
            if not code:
                continue
            prov_series.setdefault(code, []).append({
                'date': row[date_col].strftime('%Y-%m'),
                'value': float(row[val_col]) if pd.notna(row[val_col]) else None,
            })
        for code, rows in prov_series.items():
            rows.sort(key=lambda r: r['date'])
            series.setdefault(code, {})[lang] = {
                'dates': [r['date'] for r in rows],
                'values': [r['value'] for r in rows],
            }
    if not series:
        print('NO DATA — check JVW zip files in data/')
        sys.exit(1)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump({'series': series}, f, ensure_ascii=False)
    print(f'saved {out_path} ({len(series)} geos, latest: '
          f'{[s["en"]["dates"][-1] for s in list(series.values())[:1]]})')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--years', type=int, default=7)
    ap.add_argument('--out', default=os.path.join(ROOT, 'public', 'data', 'trends', 'job-vacancy.json'))
    args = ap.parse_args()
    build(args.years, args.out)
