# -*- coding: utf-8 -*-
# Author: Xiaopeng Li
# Copyright (c) 2026 Xiaopeng Li

"""Test downloading one StatCan zip with different headers, inspect the payload."""
import http.cookiejar, urllib.request, os

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
url = "https://www150.statcan.gc.ca/n1/tbl/csv/14100287-eng.zip"
dst = r"C:\Users\yaomu\Doubao\chats\2026-10-08\new-chat\job-outlooks-app\data\.dl_test.bin"

variants = [
    ("plain", {"User-Agent": UA}),
    ("cookie+ua", {"User-Agent": UA, "Accept": "*/*", "Accept-Language": "en-CA,en;q=0.9"}),
]
for label, headers in variants:
    try:
        cj = http.cookiejar.CookieJar()
        op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
        op.addheaders = list(headers.items())
        req = urllib.request.Request(url)
        with op.open(req, timeout=120) as r:
            data = r.read(4096)
            final = r.url
        with open(dst, "wb") as f:
            f.write(data)
        print(f"[{label}] final_url={final}")
        print(f"[{label}] first bytes: {data[:40]!r}")
        print(f"[{label}] header CT: {r.headers.get('Content-Type')}")
    except Exception as e:
        print(f"[{label}] ERR {e}")
