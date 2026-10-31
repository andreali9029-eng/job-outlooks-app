# -*- coding: utf-8 -*-
"""Upgrade 3 map backdrops to higher-res / dark-background versions."""
import io, os, urllib.request
from PIL import Image

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)))
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

FILES = [
    # (filename, url, max_width, quality) — ca-maple now dark bg (no bright edge), AB/QC higher-res
    ('ca-maple.jpg',  'https://aka.doubaocdn.com/s/WuVpW94n02', 900, 74),
    ('ab-banff.jpg',  'https://aka.doubaocdn.com/s/mRNMQn9v9I', 900, 74),
    ('qc-quebec.jpg', 'https://aka.doubaocdn.com/s/Rp3VDPDOCG', 900, 74),
]

def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()

for name, url, mw, q in FILES:
    try:
        data = fetch(url)
        im = Image.open(io.BytesIO(data))
        if im.width > mw:
            im = im.resize((mw, int(im.height * mw / im.width)), Image.LANCZOS)
        if im.mode in ('RGBA', 'P'):
            im = im.convert('RGB')
        im.save(os.path.join(OUT, name), 'JPEG', quality=q, optimize=True)
        print('OK  ', name, im.size)
    except Exception as e:
        print('FAIL', name, repr(e)[:160])
print('done')
