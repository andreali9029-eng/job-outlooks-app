#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: Xiaopeng Li
# Copyright (c) 2026 Xiaopeng Li

"""Build public/data/match-index.json — lightweight per-occupation market profile
used by the Career Match calculator (prospect rating, provincial ratings, wages,
live posting counts). One file, one fetch, no per-occupation network calls."""

import json
import os
import glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, 'public', 'data')
OCC_DIR = os.path.join(PUB, 'occ')

OUTLOOK_SCORE = {
    'very good': 4, 'good': 3, 'moderate': 2, 'limited': 1,
    'very limited': 0, 'undetermined': None,
}

# provinces in Job Bank region order (regions.en includes CA + 13 provinces first)
PROVINCES = ['CA', 'NL', 'PE', 'NS', 'NB', 'QC', 'ON', 'MB', 'SK', 'AB', 'BC', 'YT', 'NT', 'NU']


def main():
    with open(os.path.join(PUB, 'occupations.json'), encoding='utf-8') as f:
        occ_index = json.load(f)

    # live posting counts (14 hot occupations only)
    jobs = {}
    try:
        with open(os.path.join(PUB, 'trends', 'jobcounts-latest.json'), encoding='utf-8') as f:
            jc = json.load(f)
            jobs = jc.get('counts', {})
    except Exception:
        pass

    occs = []
    missing = 0
    for item in occ_index:
        code = item['code']
        path = os.path.join(OCC_DIR, f'{code}.json')
        if not os.path.exists(path):
            missing += 1
            continue
        with open(path, encoding='utf-8') as f:
            j = json.load(f)

        # outlook ratings per region
        outlook = {}
        regions = (j.get('regions') or {}).get('en') or []
        for r in regions:
            prov = r.get('province')
            if prov:
                outlook[prov] = OUTLOOK_SCORE.get((r.get('outlook') or '').lower())

        # wages per province (regionCode '00' = Canada, 2-digit = province rows)
        wage = {}
        for w in (j.get('wages') or []):
            prov = w.get('province')
            if prov and len(str(w.get('regionCode', ''))) <= 2 and w.get('median') is not None:
                wage[prov] = w['median']

        occs.append({
            'code': code,
            'title': item['title'],
            'noc5': code.replace('NOC_', ''),
            'group': code.replace('NOC_', '')[:1],
            'outlook': outlook,
            'wage': wage,
            'jobs': jobs.get(code.replace('NOC_', ''), {}),
            'hot': code.replace('NOC_', '') in jobs,
        })

    payload = {
        'meta': {
            'builtAt': None,  # filled below via time import
            'count': len(occs),
            'occupationsTotal': len(occ_index),
        },
        'occs': occs,
    }

    import datetime
    payload['meta']['builtAt'] = datetime.date.today().isoformat()

    out = os.path.join(PUB, 'match-index.json')
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, separators=(',', ':'))

    hot = [o for o in occs if o['hot']]
    print(f'match-index.json: {len(occs)} occupations ({len(occ_index) - len(occs) - missing} skipped/ {missing} missing)')
    print(f'hot occupations with live jobs: {len(hot)}')
    print('sample:', json.dumps(occs[0], ensure_ascii=False)[:220])


if __name__ == '__main__':
    main()
