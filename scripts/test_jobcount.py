# -*- coding: utf-8 -*-
"""Test Job Bank job-count extraction with urllib (stdlib only)."""
import re, urllib.request, http.cookiejar

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
cj = http.cookiejar.CookieJar()
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
op.addheaders = [("User-Agent", UA), ("Accept-Language", "en-CA,en;q=0.9")]

def get(url):
    with op.open(url, timeout=40) as r:
        return r.read().decode("utf-8", errors="replace")

# warm up
try:
    get("https://www.jobbank.gc.ca/jobsearch/jobsearch?fn21=72106")
except Exception as e:
    print("warmup err:", e)

url = ("https://www.jobbank.gc.ca/jobsearch/jobsearch?term=Soudeurs%2Fsoudeuses%20et%20op%C3%A9rateurs%2Fop%C3%A9ratrices%20de%20machines%20%C3%A0%20souder%20et%20%C3%A0%20braser&fn21=72106&fprov=ON")
try:
    html = get(url)
    print("len:", len(html))
    m = re.search(r'og:description"\s+content="([^"]+)"', html)
    print("og:", m.group(1) if m else None)
    m2 = re.search(r'"numFound"\s*:\s*([0-9]+)', html)
    print("numFound:", m2.group(1) if m2 else None)
    mm = re.findall(r'([0-9][0-9,]*)\s*(?:job posting|offres d.emploi)', html)
    print("count-ish:", mm[:5])
except Exception as e:
    print("ERR:", e)
