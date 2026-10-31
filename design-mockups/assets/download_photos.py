# -*- coding: utf-8 -*-
"""Download & compress photo assets for mockup D (map backgrounds + industry cards)."""
import io, os, urllib.request
from PIL import Image

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)))
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

# (filename, url, max_width, quality)
FILES = [
    # --- map backgrounds (Canada default + 13 provinces/territories) ---
    ('ca-maple.jpg',  'https://aka.doubaocdn.com/s/3Xyp9Uj1Jq', 800, 72),
    ('bc-vancouver.jpg','https://aka.doubaocdn.com/s/CcU2SsXAZT', 800, 72),
    ('ab-banff.jpg',  'https://aka.doubaocdn.com/s/7CozJRycAs', 800, 72),
    ('sk-wheat.jpg',  'https://aka.doubaocdn.com/s/SeD0tNyZbQ', 800, 72),
    ('mb-polarbear.jpg','https://aka.doubaocdn.com/s/tCxOhg2k3u', 800, 72),
    ('on-toronto.jpg','https://aka.doubaocdn.com/s/wi7hO0V6vp', 800, 72),
    ('qc-quebec.jpg','https://aka.doubaocdn.com/s/2QRQ312w7D', 800, 72),
    ('nb-fundy.jpg',  'https://aka.doubaocdn.com/s/1hVgc5xVDW', 800, 72),
    ('ns-lighthouse.jpg','https://aka.doubaocdn.com/s/rE8Fm5fCdN', 800, 72),
    ('pe-coast.jpg',  'https://aka.doubaocdn.com/s/SHnARkkYDv', 800, 72),
    ('nl-iceberg.jpg','https://aka.doubaocdn.com/s/18mNIbsouK', 800, 72),
    ('yt-aurora.jpg','https://aka.doubaocdn.com/s/21Sbm4SCrM', 800, 72),
    ('nt-aurora.jpg','https://aka.doubaocdn.com/s/JghXUzbKMG', 800, 72),
    ('nu-tundra.jpg','https://aka.doubaocdn.com/s/7mLYT7CUfN', 800, 72),
    # --- industry card photos ---
    ('ind-management.jpg','https://aka.doubaocdn.com/s/m40iIagMmD', 440, 70),
    ('ind-business.jpg','https://aka.doubaocdn.com/s/0HoV2icrZL', 440, 70),
    ('ind-science.jpg','https://aka.doubaocdn.com/s/U0gGXxlILc', 440, 70),
    ('ind-health.jpg','https://aka.doubaocdn.com/s/61YpnnULtp', 440, 70),
    ('ind-education.jpg','https://aka.doubaocdn.com/s/9UdegH5W7Y', 440, 70),
    ('ind-art.jpg',  'https://aka.doubaocdn.com/s/j7LLTRLdpx', 440, 70),
    ('ind-sales.jpg','https://aka.doubaocdn.com/s/xXWxa1V3Cg', 440, 70),
    ('ind-trades.jpg','https://aka.doubaocdn.com/s/zVtFUQVJM2', 440, 70),
    ('ind-resources.jpg','https://aka.doubaocdn.com/s/eFEAugUIOP', 440, 70),
    ('ind-factory.jpg','https://aka.doubaocdn.com/s/DYDVXOWVYF', 440, 70),
]

def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()

ok = fail = 0
for name, url, mw, q in FILES:
    try:
        data = fetch(url)
        im = Image.open(io.BytesIO(data))
        if im.width > mw:
            im = im.resize((mw, int(im.height * mw / im.width)), Image.LANCZOS)
        if im.mode in ('RGBA', 'P'):
            im = im.convert('RGB')
        im.save(os.path.join(OUT, name), 'JPEG', quality=q, optimize=True)
        ok += 1
        print('OK  ', name, im.size)
    except Exception as e:
        fail += 1
        print('FAIL', name, repr(e)[:160])
print('done: ok=%d fail=%d' % (ok, fail))
