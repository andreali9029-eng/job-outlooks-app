"""
# Author: Xiaopeng Li
# Copyright (c) 2026 Xiaopeng Li
Generate PWA icons for the app."""
from PIL import Image, ImageDraw, ImageFont
import math

def draw_icon(size, path):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Rounded-rect background (blue gradient-ish: solid blue with lighter top)
    r = size * 0.22
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=(37, 99, 235, 255))

    # Lighter accent band
    d.rounded_rectangle([0, 0, size - 1, int(size * 0.35)], radius=r, fill=(59, 130, 246, 255))

    # White star (5-pointed) in the center
    cx, cy = size * 0.5, size * 0.5
    outer_r = size * 0.30
    inner_r = outer_r * 0.5
    pts = []
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        rad = outer_r if i % 2 == 0 else inner_r
        pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    d.polygon(pts, fill=(255, 255, 255, 255))

    img.save(path, 'PNG')
    print(f"Saved {path} ({size}x{size})")

if __name__ == '__main__':
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else 'public'
    draw_icon(192, f"{out}/icon-192.png")
    draw_icon(512, f"{out}/icon-512.png")
