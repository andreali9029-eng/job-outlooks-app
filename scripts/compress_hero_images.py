"""Compress the 24 home-hero photos for phone GPU: short edge 600px, q76.
Originals stay intact in design-mockups/assets. Run: python compress_hero_images.py
"""
from PIL import Image
import glob, os

ROOT = r"C:\Users\yaomu\Doubao\chats\2026-10-08\new-chat\job-outlooks-app\public\images"
SHORT = 600
QUALITY = 76

for p in sorted(glob.glob(os.path.join(ROOT, "*.jpg"))):
    im = Image.open(p)
    w, h = im.size
    short = min(w, h)
    if short <= SHORT:
        print("skip", os.path.basename(p), im.size)
        continue
    scale = SHORT / short
    im2 = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    im2.convert("RGB").save(p, "JPEG", quality=QUALITY, optimize=True)
    print("compressed", os.path.basename(p), im.size, "->", im2.size,
          str(round(os.path.getsize(p) / 1024)) + "KB")
print("done")
