# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
from PIL import Image, ImageStat

def analyze(path, box, label):
    img = Image.open(path).convert('RGB').crop(box)
    hsv = img.convert('HSV')
    lum = ImageStat.Stat(img.convert('L'))
    sat = ImageStat.Stat(hsv.split()[1])
    # brightness distribution: fraction of pixels above 140 (photo brights)
    g = img.convert('L')
    px = list(g.getdata())
    bright = sum(1 for v in px if v > 140) / len(px)
    dark = sum(1 for v in px if v < 40) / len(px)
    print('%s: lum=%.1f sat=%.1f bright%%=%.1f dark%%=%.1f' % (
        label, lum.mean[0], sat.mean[0], bright*100, dark*100))

# user screenshot map region
analyze(r'C:\Users\yaomu\AppData\Local\Doubao\User Data\ClipboardTemp\85a5d561-7fdd-4b8d-be0f-d69d03180283.png',
        (0, 90, 988, 560), 'USER-SHOT')
# current final render, AB state, map region x .20-.79*798, y .45-.80*1291
analyze(r'C:\Users\yaomu\Doubao\chats\2026-10-08\new-chat\job-outlooks-app\design-mockups\_shots\bu-final-ab.png',
        (160, 581, 630, 1033), 'FINAL-AB')
# current final render, default maple
analyze(r'C:\Users\yaomu\Doubao\chats\2026-10-08\new-chat\job-outlooks-app\design-mockups\_shots\bu-final-default.png',
        (160, 581, 630, 1033), 'FINAL-DEFAULT')
