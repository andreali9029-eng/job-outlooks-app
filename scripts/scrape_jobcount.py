# -*- coding: utf-8 -*-
"""
Daily Job Bank job-count collector.
For each occupation x province it GETs the Job Bank search page (the same URL
the app uses for "View job postings") and reads the live posting count from
`<span class="found" id="results-count">N</span>`.

Because Job Bank publishes no historical posting counts, this script is the
"self-accumulate" side of the "available jobs over time" chart: run it once a
day (Windows Task Scheduler / cron) and it appends one snapshot row per
occupation-province to data/jobcounts/. Over weeks you get a real series.

Usage:
  python scripts/scrape_jobcount.py                    # default: curated hot list
  python scripts/scrape_jobcount.py --all              # all 516 occupations x 14 regions
  python scripts/scrape_jobcount.py --nocs 72106 31301 --provinces CA ON
  python scripts/scrape_jobcount.py --force            # re-scrape today even if file exists
"""
import argparse, datetime as dt, json, os, re, sys, time
import urllib.request, http.cookiejar

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE, "data", "jobcounts")
OS = os.path.join(BASE, "public", "data", "occupations.json")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")

PROVINCES = ["CA", "NL", "PE", "NS", "NB", "QC", "ON", "MB", "SK", "AB", "BC", "YT", "NT", "NU"]

# Curated list for the default daily run (hot/example occupations the app highlights)
DEFAULT_NOCS = ["72106", "31301", "21232", "72410", "72200", "62020", "13110",
                "31102", "00010", "73300", "62200", "65201", "12200", "10010"]

CURATED_TERMS = {
    "72106": "Welders and related machine operators",
    "31301": "Registered nurses and registered psychiatric nurses",
    "21232": "Software engineers and designers",
    "72410": "Automotive service technicians",
    "72200": "Electricians (except industrial and power system)",
    "62020": "Food service supervisors",
    "13110": "Administrative assistants",
    "31102": "General practitioners and family physicians",
    "00010": "Legislators",
    "73300": "Transport truck drivers",
    "62200": "Chefs",
    "65201": "Food counter attendants, kitchen helpers and related support occupations",
    "12200": "Accounting technicians and bookkeepers",
    "10010": "Financial managers",
}


def get_page(op, url):
    with op.open(url, timeout=45) as r:
        return r.read().decode("utf-8", errors="replace")


def extract_count(html):
    m = re.search(r'id="results-count">\s*([0-9][0-9,]*)\s*<', html)
    if m:
        return int(m.group(1).replace(",", ""))
    m2 = re.search(r'og:description"[^>]*content="View ([0-9,]+) job postings', html)
    if m2:
        return int(m2.group(1).replace(",", ""))
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true", help="scrape every occupation x every region")
    ap.add_argument("--nocs", nargs="*", default=None, help="NOC codes to scrape")
    ap.add_argument("--provinces", nargs="*", default=None, help="province codes (default all)")
    ap.add_argument("--force", action="store_true", help="re-scrape today even if file exists")
    ap.add_argument("--delay", type=float, default=0.35, help="seconds between requests")
    args = ap.parse_args()

    today = dt.date.today().isoformat()
    os.makedirs(DATA_DIR, exist_ok=True)
    out_path = os.path.join(DATA_DIR, f"{today}.jsonl")

    if os.path.exists(out_path) and not args.force:
        print(f"Snapshot for {today} already exists ({out_path}); use --force to re-scrape.")
        return

    with open(OS, encoding="utf-8") as f:
        occs = json.load(f)
    occ_by_noc = {o["code"].replace("NOC_", ""): o for o in occs}

    if args.nocs:
        nocs = args.nocs
    elif args.all:
        nocs = list(occ_by_noc.keys())
    else:
        nocs = DEFAULT_NOCS

    provinces = args.provinces or PROVINCES

    cj = http.cookiejar.CookieJar()
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    op.addheaders = [("User-Agent", UA), ("Accept-Language", "en-CA,en;q=0.9")]

    # warm the session once
    try:
        get_page(op, "https://www.jobbank.gc.ca/jobsearch/jobsearch?fn21=" + nocs[0])
    except Exception as e:
        print("warmup warning:", e)

    rows = []
    errs = 0
    for noc in nocs:
        occ = occ_by_noc.get(noc)
        if not occ:
            print(f"  skip unknown NOC {noc}")
            continue
        title_en = occ.get("title", {}).get("en") or CURATED_TERMS.get(noc, "")
        for prov in provinces:
            url = ("https://www.jobbank.gc.ca/jobsearch/jobsearch?term="
                   + urllib.parse.quote(title_en) + "&fn21=" + noc + "&fprov=" + prov)
            try:
                html = get_page(op, url)
                count = extract_count(html)
                rows.append({"date": today, "noc": noc, "province": prov,
                             "term_en": title_en, "count": count,
                             "ts": dt.datetime.now(dt.timezone.utc).isoformat()})
                print(f"  {noc} {prov}: {count}")
                if count is None:
                    errs += 1
            except Exception as e:
                rows.append({"date": today, "noc": noc, "province": prov,
                             "term_en": title_en, "count": None,
                             "error": str(e)[:120],
                             "ts": dt.datetime.now(dt.timezone.utc).isoformat()})
                errs += 1
                print(f"  {noc} {prov}: ERROR {e}")
            time.sleep(args.delay)

    with open(out_path, "w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    ok = sum(1 for r in rows if r.get("count") is not None)
    print(f"\nDONE: {len(rows)} rows -> {out_path} ({ok} ok, {errs} missing/errors)")


if __name__ == "__main__":
    main()
