# -*- coding: utf-8 -*-
"""Find where '211' appears in Job Bank HTML."""
import re, urllib.request, http.cookiejar

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
cj = http.cookiejar.CookieJar()
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
op.addheaders = [("User-Agent", UA), ("Accept-Language", "en-CA,en;q=0.9")]

def get(url):
    with op.open(url, timeout=40) as r:
        return r.read().decode("utf-8", errors="replace")

get("https://www.jobbank.gc.ca/jobsearch/jobsearch?fn21=72106")
url = ("https://www.jobbank.gc.ca/jobsearch/jobsearch?term=Soudeurs%2Fsoudeuses%20et%20op%C3%A9rateurs%2Fop%C3%A9ratrices%20de%20machines%20%C3%A0%20souder%20et%20%C3%A0%20braser&fn21=72106&fprov=ON")
html = get(url)

for m in re.finditer(r'211', html):
    s = max(0, m.start() - 90)
    ctx = html[s:m.start() + 90].replace('\n', ' ')
    print(f"--- @{m.start()} ---")
    print(ctx[:220])
    print()
