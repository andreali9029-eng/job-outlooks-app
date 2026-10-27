# -*- coding: utf-8 -*-
# Author: andreali9029-eng
# Copyright (c) 2026 andreali9029-eng

"""
Monthly automated data update for the Job Outlooks PWA.

1. Statistics Canada LFS tables (unemployment / industry / occupation rates):
   - HEAD each CSV zip; re-download only when Last-Modified has changed
   - rebuild public/data/trends/*.json (unemployment.json, industry.json, occ-unemployment.json)

2. Job Bank 3-year outlooks + wages (published ~December each year):
   - query the open.canada.ca CKAN API for the newest outlook year pair
   - if newer than the current release (2025-2027), download the new
     outlooks_XX_XX en/fr xlsx + wages CSV and rebuild the occupation data
     via process_data.py (env-var overrides for the input files).

Usage:
  python scripts/update_statcan.py            # normal monthly run
  python scripts/update_statcan.py --force    # force rebuild even if nothing changed
Logs to data/update.log
"""
import argparse, datetime as dt, json, os, re, subprocess, sys, time
import urllib.request, urllib.parse, http.cookiejar
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "data"
LOG = DATA / "update.log"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
CURRENT_OUTLOOK_PAIR = "2025-2027"  # what the app ships today

TABLES = {
    "14100287": ("14100287-eng.zip", "14100287-fra.zip"),
    "14100201": ("14100201-eng.zip", "14100201-fra.zip"),
    "14100416": ("14100416-eng.zip", "14100416-fra.zip"),
}

PY = os.environ.get("PYTHON_BIN", "python")


def log(msg):
    line = f"[{dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}"
    print(line)
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def http_opener():
    cj = http.cookiejar.CookieJar()
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    op.addheaders = [("User-Agent", UA), ("Accept-Language", "en-CA,en;q=0.9")]
    return op


def head_last_modified(op, url):
    try:
        req = urllib.request.Request(url, method="HEAD")
        with op.open(req, timeout=30) as r:
            return r.headers.get("Last-Modified")
    except Exception as e:
        log(f"  HEAD {url} failed: {e}")
        return None


def download(op, url, dest):
    with op.open(url, timeout=300) as r, open(dest, "wb") as f:
        f.write(r.read())


def max_ref_date(zip_path):
    """Read the last REF_DATE from the newest row of the first CSV inside a StatCan zip."""
    import zipfile
    import pandas as pd
    with zipfile.ZipFile(zip_path) as z:
        name = [n for n in z.namelist() if n.endswith(".csv")][0]
        with z.open(name) as fh:
            df = pd.read_csv(fh, usecols=[0], dtype=str, nrows=1_000_000_000)
        return df.iloc[-1, 0].strip()


def is_valid_zip(path):
    import zipfile
    try:
        with zipfile.ZipFile(path) as z:
            return bool(z.namelist())
    except Exception:
        return False


def head_last_modified(op, url):
    try:
        req = urllib.request.Request(url, method="HEAD")
        with op.open(req, timeout=30) as r:
            return r.headers.get("Last-Modified")
    except Exception as e:
        log(f"  HEAD {url} failed: {e}")
        return None


def update_statcan(op, force):
    """Check each table's Last-Modified via HEAD (cheap); download only when it
    changed, validate the payload is a real zip, then promote + rebuild.
    A failed/invalid download NEVER touches existing files, so running every
    day is safe — StatCan only republishes monthly."""
    import shutil
    lastmod = {}
    lm_file = DATA / ".statcan-lastmod.json"
    if lm_file.exists():
        try:
            lastmod = json.loads(lm_file.read_text(encoding="utf-8"))
        except Exception:
            lastmod = {}
    # safety net: force a full re-download at least every 28 days, because the
    # Last-Modified header is not guaranteed to change when the zip is republished
    today = dt.date.today().isoformat()
    force_due = False
    try:
        lf = lastmod.get("last_forced")
        if lf is None or (dt.date.today() - dt.date.fromisoformat(lf)).days >= 28:
            force_due = True
    except Exception:
        force_due = True
    if force_due and not force:
        log("28-day force window reached -> forcing re-download")
    force = force or force_due
    if force_due:
        # record the attempt date even if the download fails, so a dead server
        # doesn't trigger a forced download every single day
        lastmod["last_forced"] = today
    tmp = DATA / ".statcan_tmp"
    tmp.mkdir(parents=True, exist_ok=True)
    downloads = {}
    try:
        for pid, (en, fr) in TABLES.items():
            url_en = f"https://www150.statcan.gc.ca/n1/tbl/csv/{en}"
            url_fr = f"https://www150.statcan.gc.ca/n1/tbl/csv/{fr}"
            lm_en = head_last_modified(op, url_en)
            lm_fr = head_last_modified(op, url_fr)
            prev = lastmod.get(en)
            need = force or (lm_en and lm_en != prev)
            if not need:
                log(f"  {en}: unchanged ({prev})")
                continue
            log(f"  {en}: Last-Modified {prev} -> {lm_en}, downloading...")
            try:
                download(op, url_en, tmp / en)
                download(op, url_fr, tmp / fr)
            except Exception as e:
                log(f"  !! download {pid} failed: {e}")
                continue
            # validate BEFORE promoting: an error page must never overwrite real data
            if not (is_valid_zip(tmp / en) and is_valid_zip(tmp / fr)):
                log(f"  !! downloaded {pid} files are invalid (server issue?), keeping existing")
                continue
            downloads[pid] = (en, fr)
            lastmod[en] = lm_en or ""
        if not downloads:
            log("no StatCan change; trend JSONs already current")
            lm_file.write_text(json.dumps(lastmod, indent=2), encoding="utf-8")
            return True
        for pid, (en, fr) in downloads.items():
            shutil.move(str(tmp / en), str(DATA / en))
            shutil.move(str(tmp / fr), str(DATA / fr))
        lm_file.write_text(json.dumps(lastmod, indent=2), encoding="utf-8")
        log("StatCan files updated -> rebuilding trend JSONs...")
        r = subprocess.run([PY, "-X", "utf8", str(BASE / "scripts" / "build_trend_data.py")],
                           capture_output=True, text=True, timeout=1800)
        log(r.stdout[-1500:] if r.stdout else "")
        if r.returncode != 0:
            log(f"!! build_trend_data FAILED: {r.stderr[-2000:]}")
            return False
        log("trend JSONs rebuilt OK")
        return True
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def check_new_outlooks(op):
    """Return (pair, url_en, url_fr, wages_url) of the newest outlook release, or None."""
    try:
        q = urllib.parse.quote("outlook occupation")
        with op.open(f"https://open.canada.ca/data/api/3/action/package_search?q={q}&rows=20", timeout=40) as r:
            data = json.loads(r.read().decode("utf-8"))
    except Exception as e:
        log(f"  CKAN search failed: {e}")
        return None

    pair = None
    url_en = url_fr = None
    for pkg in data.get("result", {}).get("results", []):
        if "3-Year Employment Outlooks" not in pkg.get("title", ""):
            continue
        for res in pkg.get("resources", []):
            name = res.get("name", "") or ""
            m = re.search(r"(\d{4})-(\d{4}) Employment Outlooks.*NOC 2021", name)
            if not m:
                continue
            p = f"{m.group(1)}-{m.group(2)}"
            url = res.get("url", "")
            if pair is None or p > pair:
                pair, url_en, url_fr = p, None, None
            if p == pair:
                if re.search(r"_en[_\d]*\.xlsx", url):
                    url_en = url
                elif re.search(r"_fr[_\d]*\.xlsx", url):
                    url_fr = url
    if not pair:
        log("  no NOC 2021 outlook xlsx found on CKAN")
        return None
    base = "https://open.canada.ca"
    if url_en and not url_en.startswith("http"):
        url_en = base + url_en
    if url_fr and not url_fr.startswith("http"):
        url_fr = base + url_fr
    if not url_en or not url_fr:
        log(f"  outlook {pair} found but en/fr URLs incomplete (en={url_en}, fr={url_fr})")
        return None

    # wages: look for a Job Bank wages CSV (wages_20XX.csv or *_wages_20XX*.csv) on CKAN;
    # if not found we keep the existing wages file (yearly update, low risk)
    wages_url = None
    try:
        q2 = urllib.parse.quote("wages by occupation")
        with op.open(f"https://open.canada.ca/data/api/3/action/package_search?q={q2}&rows=20", timeout=40) as r:
            d2 = json.loads(r.read().decode("utf-8"))
        best_yr = 0
        for pkg in d2.get("result", {}).get("results", []):
            for res in pkg.get("resources", []):
                name = res.get("name", "") or ""
                m = re.search(r"wages[_\-]?(\d{4})\.csv", name, re.I)
                if m:
                    yr = int(m.group(1))
                    if yr > best_yr:
                        best_yr = yr
                        wages_url = res.get("url", "")
    except Exception as e:
        log(f"  wages CKAN lookup failed (keeping current wages): {e}")
    if wages_url and not wages_url.startswith("http"):
        wages_url = "https://open.canada.ca" + wages_url
    if not wages_url:
        log("  no newer wages CSV found on CKAN (will keep current wages file)")
    return (pair, url_en, url_fr, wages_url)


def update_outlooks(op, force):
    if not force and CURRENT_OUTLOOK_PAIR >= "2026-2027"[:7]:
        return
    info = check_new_outlooks(op)
    if not info:
        return
    pair, url_en, url_fr, wages_url = info
    log(f"  newest outlook pair on CKAN: {pair}")
    if pair <= CURRENT_OUTLOOK_PAIR and not force:
        log(f"  current app data ({CURRENT_OUTLOOK_PAIR}) is up to date")
        return
    log(f"  NEW outlook release {pair} detected -> downloading + rebuilding")
    en_dest = DATA / f"outlooks_{pair.replace('-', '_')}_en.xlsx"
    fr_dest = DATA / f"outlooks_{pair.replace('-', '_')}_fr.xlsx"
    try:
        download(op, url_en, en_dest)
        download(op, url_fr, fr_dest)
    except Exception as e:
        log(f"  outlook download failed: {e}")
        return
    wages_dest = None
    if wages_url:
        yr = re.search(r"(\d{4})", wages_url or "")
        wages_dest = DATA / f"wages_{yr.group(1) if yr else pair[:4]}.csv"
        try:
            download(op, wages_url, wages_dest)
        except Exception as e:
            log(f"  wages download failed (keeping old wages): {e}")
            wages_dest = None
    env = dict(os.environ)
    env["OUTLOOK_EN"] = str(en_dest)
    env["OUTLOOK_FR"] = str(fr_dest)
    if wages_dest:
        env["WAGES_CSV"] = str(wages_dest)
    log("  rebuilding occupation data (process_data.py)...")
    r = subprocess.run([PY, "-X", "utf8", str(BASE / "scripts" / "process_data.py")],
                       capture_output=True, text=True, env=env, timeout=1800)
    if r.returncode != 0:
        log(f"!! process_data FAILED: {r.stderr[-2000:]}")
        return
    log("  occupation data rebuilt OK")
    # update the shipped pair so the check won't re-run
    p = BASE / "scripts" / "update_statcan.py"
    src = p.read_text(encoding="utf-8")
    src = src.replace(f'CURRENT_OUTLOOK_PAIR = "{CURRENT_OUTLOOK_PAIR}"',
                      f'CURRENT_OUTLOOK_PAIR = "{pair}"')
    p.write_text(src, encoding="utf-8")
    log(f"  CURRENT_OUTLOOK_PAIR updated to {pair}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()
    LOG.parent.mkdir(parents=True, exist_ok=True)
    log("===== update run =====")
    op = http_opener()
    ok = update_statcan(op, args.force)
    if ok:
        update_outlooks(op, args.force)
    log("===== done =====\n")


if __name__ == "__main__":
    main()
