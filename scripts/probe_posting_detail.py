# -*- coding: utf-8 -*-
"""Probe v4: locate the actual job-description body in the posting detail page."""
import urllib.request, re, html as h

UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36',
      'Accept-Language': 'en-CA,en;q=0.9'}
req = urllib.request.Request('https://www.jobbank.gc.ca/jobsearch/jobsearch?term=welder&fn21=72106&fprov=ON', headers=UA)
page = urllib.request.urlopen(req, timeout=45).read().decode('utf-8', errors='replace')
ids = re.findall(r'href="(/jobsearch/jobposting/(\d+))[^"]*"', page)
pid = ids[0][1]
req2 = urllib.request.Request('https://www.jobbank.gc.ca/jobsearch/jobposting/' + pid, headers=UA)
det = urllib.request.urlopen(req2, timeout=45).read().decode('utf-8', errors='replace')

for m in re.finditer(r'description', det, re.I):
    s = max(0, m.start()-80)
    frag = det[s:m.start()+120]
    frag = re.sub(r'<[^>]+>', ' ', frag)
    frag = re.sub(r'\s+', ' ', h.unescape(frag)).strip()
    print('CTX:', frag[:200])
    print('---')

# Candidate containers: og:description meta, article, main, job details
for pat in [r'<meta[^>]*property="og:description"[^>]*>', r'<article[^>]*>', r'<div[^>]*class="[^"]*job[^"]*detail[^"]*"[^>]*>', r'<div[^>]*class="[^"]*posting[^"]*"[^>]*>']:
    for m in re.finditer(pat, det, re.I):
        print('CONTAINER:', m.group(0)[:140])
