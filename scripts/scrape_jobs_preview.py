# -*- coding: utf-8 -*-
# Author: Xiaopeng Li
# Copyright (c) 2026 Xiaopeng Li

"""
Job Bank job-preview collector.

For each curated occupation x province it GETs the Job Bank search page and
parses the first N live postings (title, employer, location, salary, date,
posting URL). Output goes to public/data/jobs-preview.json which the app shows
inside the occupation detail page ("Latest job postings").

Low-frequency by design (a handful of occupations), so it can run daily in the
same scheduled task as the job-count collector.

Usage:
  python scripts/scrape_jobs_preview.py                 # curated hot list x all provinces
  python scripts/scrape_jobs_preview.py --nocs 72106 31301 --provinces CA ON
  python scripts/scrape_jobs_preview.py --limit 3
"""
import argparse, datetime as dt, json, os, re, time
import urllib.request, urllib.parse, http.cookiejar

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "public", "data", "jobs-preview.json")
OS = os.path.join(BASE, "public", "data", "occupations.json")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")

PROVINCES = ["CA", "NL", "PE", "NS", "NB", "QC", "ON", "MB", "SK", "AB", "BC", "YT", "NT", "NU"]
DEFAULT_NOCS = ["72106", "31301", "21232", "72410", "72200", "62020", "13110", "31102"]

ARTICLE_RE = re.compile(r'<article[^>]*class="action-buttons".*?</article>', re.S)
TITLE_RE = re.compile(r'<span class="noctitle">\s*(.*?)\s*</span>', re.S)
HREF_RE = re.compile(r'href="(/jobsearch/jobposting/(\d+))[^"]*"')
BUSINESS_RE = re.compile(r'<li class="business">(.*?)</li>', re.S)
LOCATION_RE = re.compile(r'<li class="location">.*?</span>\s*(.*?)</li>', re.S)
SALARY_RE = re.compile(r'<li class="salary">.*?Salary\s*(.*?)</li>', re.S)
DATE_RE = re.compile(r'<li class="date">(.*?)</li>', re.S)

TAG_RE = re.compile(r'<[^>]+>')
WS_RE = re.compile(r'\s+')


def clean(s):
    return WS_RE.sub(' ', TAG_RE.sub('', s or '')).strip()


def get_page(op, url):
    with op.open(url, timeout=45) as r:
        return r.read().decode("utf-8", errors="replace")


def parse_jobs(html, limit):
    jobs = []
    for m in ARTICLE_RE.finditer(html):
        art = m.group(0)
        t = TITLE_RE.search(art)
        h = HREF_RE.search(art)
        b = BUSINESS_RE.search(art)
        l = LOCATION_RE.search(art)
        s = SALARY_RE.search(art)
        d = DATE_RE.search(art)
        if not h:
            continue
        title = clean(t.group(1)) if t else None
        if not title:
            continue
        loc = clean(l.group(1)) if l else None
        if loc and loc.startswith('Location '):
            loc = loc[len('Location '):]
        jobs.append({
            "title": title,
            "url": "https://www.jobbank.gc.ca/jobsearch/jobposting/" + h.group(2),
            "employer": clean(b.group(1)) if b else None,
            "location": loc,
            "wage": clean(s.group(1)) if s else None,
            "date": clean(d.group(1)) if d else None,
        })
        if len(jobs) >= limit:
            break
    return jobs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--nocs", nargs="*", default=None)
    ap.add_argument("--provinces", nargs="*", default=None)
    ap.add_argument("--limit", type=int, default=5)
    ap.add_argument("--delay", type=float, default=0.4)
    args = ap.parse_args()

    with open(OS, encoding="utf-8") as f:
        occs = json.load(f)
    occ_by_noc = {o["code"].replace("NOC_", ""): o for o in occs}
    nocs = args.nocs or DEFAULT_NOCS
    provinces = args.provinces or PROVINCES

    cj = http.cookiejar.CookieJar()
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    op.addheaders = [("User-Agent", UA), ("Accept-Language", "en-CA,en;q=0.9")]
    try:
        get_page(op, "https://www.jobbank.gc.ca/jobsearch/jobsearch?fn21=" + nocs[0])
    except Exception as e:
        print("warmup warning:", e)

    result = {"updated": dt.date.today().isoformat(), "occupations": {}}
    errs = 0
    for noc in nocs:
        occ = occ_by_noc.get(noc)
        if not occ:
            continue
        title_en = occ.get("title", {}).get("en") or ""
        per_prov = {}
        for prov in provinces:
            url = ("https://www.jobbank.gc.ca/jobsearch/jobsearch?term="
                   + urllib.parse.quote(title_en) + "&fn21=" + noc + "&fprov=" + prov)
            try:
                html = get_page(op, url)
                jobs = parse_jobs(html, args.limit)
                per_prov[prov] = jobs
                print(f"  {noc} {prov}: {len(jobs)} jobs")
                if not jobs:
                    errs += 1
            except Exception as e:
                per_prov[prov] = []
                errs += 1
                print(f"  {noc} {prov}: ERROR {e}")
            time.sleep(args.delay)
        result["occupations"][noc] = per_prov

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False)
    total = sum(len(v) for p in result["occupations"].values() for v in p.values())
    print(f"\nDONE: {total} postings -> {OUT} ({errs} empty/errors)")


if __name__ == "__main__":
    main()
