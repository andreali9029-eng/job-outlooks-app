# -*- coding: utf-8 -*-
# Author: Xiaopeng Li
# Copyright (c) 2026 Xiaopeng Li

"""Verify trend JSON outputs."""
import json, os

BASE = r"C:\Users\yaomu\Doubao\chats\2026-10-08\new-chat\job-outlooks-app\public\data\trends"

print("=== unemployment.json ===")
d = json.load(open(os.path.join(BASE, "unemployment.json"), encoding="utf-8"))
print("keys:", list(d.keys()))
print("months:", d["months"], "| series:", {k: v.keys() for k, v in d["series"].items()})
for code in ["CA", "ON", "QC", "BC", "AB"]:
    s = d["series"].get(code)
    if s:
        en = s["en"]["values"]
        fr = s["fr"]["values"]
        print(f"  {code}: en len={len(en)} first={en[0]} last={en[-1]} | fr last={fr[-1]} | dates 0={s['en']['dates'][0]} last={s['en']['dates'][-1]}")

print("\n=== industry.json ===")
d = json.load(open(os.path.join(BASE, "industry.json"), encoding="utf-8"))
print("keys:", list(d.keys()), "| months:", d["months"])
print("industries en:", {k: v[:30] for k, v in d["industryNames"]["en"].items()})
print("industries fr:", {k: v[:30] for k, v in d["industryNames"]["fr"].items()})
ca = d["series"].get("CA", {})
print("CA industries:", list(ca.keys()))
for ind in ["23", "31-33", "62", "52"]:
    s = ca.get(ind)
    if s:
        print(f"  CA [{ind}] {d['industryNames']['en'][ind]}: dates {s['dates'][0]}..{s['dates'][-1]} latest={s['latest']} len={len(s['values'])}")
on = d["series"].get("ON", {})
for ind in ["23", "62"]:
    s = on.get(ind)
    if s:
        print(f"  ON [{ind}]: latest={s['latest']}")

print("\n=== occ-unemployment.json ===")
d = json.load(open(os.path.join(BASE, "occ-unemployment.json"), encoding="utf-8"))
print("keys:", list(d.keys()), "| year:", d["year"])
print("geo coverage:", sorted(d["en"].keys()))
for code in ["CA", "ON", "QC", "BC", "AB"]:
    lst = d["en"].get(code, [])
    frs = d["fr"].get(code, [])
    print(f"  {code}: top3 EN:", [(x["name"][:45], x["rate"]) for x in lst[:3]])
    print(f"        top3 FR:", [(x["name"][:45], x["rate"]) for x in frs[:3]])
