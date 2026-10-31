"""Download the chosen maple-leaf backdrop and write it as ca-maple.jpg."""
import urllib.request, io, os
from PIL import Image

SRC = "https://aka.doubaocdn.com/l/ZYFCeZ54QY"
OUT = r"C:\Users\yaomu\Doubao\chats\2026-10-08\new-chat\job-outlooks-app\public\images\ca-maple.jpg"

data = urllib.request.urlopen(SRC, timeout=30).read()
im = Image.open(io.BytesIO(data)).convert("RGB")
print("downloaded", im.size)

# landscape target: long edge 1400px (map panel ~700px wide at 2x DPR)
w, h = im.size
if w < h:  # keep it landscape
    im = im.rotate(-90, expand=True)
    w, h = im.size
scale = 1400 / max(w, h)
if scale < 1:
    im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
im.save(OUT, "JPEG", quality=80, optimize=True)
print("saved", im.size, str(round(os.path.getsize(OUT) / 1024)) + "KB")
