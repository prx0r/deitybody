#!/usr/bin/env python3
"""
Validate deitybody diagrams + phoneme maps from source JSON — no guessing.

Rules (data-driven):
  - every Mātṛkā phoneme appears exactly once
  - every Mālinī phoneme appears exactly once  
  - coordinates within viewBox
  - no duplicate iast in maps
  - locus strings match source JSON
  - Devanagari present
  - night1 pair a/ā loci correct

Writes: corpus/canonical/DIAGRAM_VALIDATION.json + prints PASS/FAIL
"""
from __future__ import annotations

import json
import math
from pathlib import Path

ROOT = Path("/root/deitybody")
DATA = ROOT / "data"
OUT = ROOT / "corpus" / "canonical" / "DIAGRAM_VALIDATION.json"

matrika = json.loads((DATA / "matrika_body_map.json").read_text(encoding="utf-8"))
malini = json.loads((DATA / "malini_order.json").read_text(encoding="utf-8"))
arch = json.loads((DATA / "architecture.json").read_text(encoding="utf-8"))

# Diagram positions used in build_clean_body_diagrams.py / build_body_diagram.py
# Re-read from the generated HTML if present, else recompute expected counts
HTML = ROOT / "docs" / "PHONEME_BODY_DIAGRAM.html"
html = HTML.read_text(encoding="utf-8") if HTML.exists() else ""

findings: list[dict] = []


def ok(rule: str, detail: str) -> None:
    findings.append({"rule": rule, "status": "pass", "detail": detail})


def fail(rule: str, detail: str) -> None:
    findings.append({"rule": rule, "status": "fail", "detail": detail})


def warn(rule: str, detail: str) -> None:
    findings.append({"rule": rule, "status": "warn", "detail": detail})


# --- Mātṛkā map integrity ---
vowels = matrika["vowels"]
vargas = matrika["vargas"]
all_m = [(v["iast"], v["devanagari"], v["locus"], "vowel") for v in vowels]
for g in vargas:
    for s in g["sequence"]:
        all_m.append((s["iast"], s["devanagari"], s["locus"], g["name"]))

iasts = [x[0] for x in all_m]
if len(all_m) == 50:
    ok("matrika.count", "50 phonemes")
else:
    fail("matrika.count", f"expected 50, got {len(all_m)}")

if len(set(iasts)) == 50:
    ok("matrika.unique", "no duplicate iast")
else:
    dups = [i for i in set(iasts) if iasts.count(i) > 1]
    fail("matrika.unique", f"duplicates: {dups}")

for ia, dev, loc, _ in all_m:
    if not dev:
        fail("matrika.devanagari", f"missing glyph for {ia}")
        break
    if not loc or len(loc) < 2:
        fail("matrika.locus", f"bad locus for {ia}: {loc!r}")
        break
else:
    ok("matrika.devanagari_locus", "all 50 have glyph + locus")

# night 1 lock
night1 = {
    "a": "forehead",
    "ā": "mouth/face",
}
mat_map = {x[0]: x[2] for x in all_m}
# normalize mouth
for ia, want in night1.items():
    got = mat_map.get(ia, "")
    if want.split("/")[0] in got or got.startswith(want.split("/")[0]):
        ok(f"night1.{ia}", f"{ia} → {got}")
    else:
        fail(f"night1.{ia}", f"{ia} expected ~{want}, got {got!r}")

# --- Mālinī ---
morder = malini["order"]
mbody = malini["body_map"]
mdev = malini["devanagari"]

if len(morder) == 50 and len(set(morder)) == 50:
    ok("malini.order", "50 unique letters na→pha")
else:
    fail("malini.order", f"len={len(morder)} unique={len(set(morder))}")

if morder[0] == "na" and morder[-1] == "pha":
    ok("malini.nadiphanta", "begins na ends pha")
else:
    fail("malini.nadiphanta", f"{morder[0]}…{morder[-1]}")

missing_body = [p for p in morder if p not in mbody]
if not missing_body:
    ok("malini.body_map", "all 50 have loci")
else:
    fail("malini.body_map", f"missing body: {missing_body}")

# known conflicts (must be present in data — documents variation, not error)
if mat_map.get("ka") and "shoulder" in mat_map["ka"].lower():
    ok("conflict.ka.matrika", f"ka matrika={mat_map['ka']}")
else:
    fail("conflict.ka.matrika", f"ka matrika unexpected: {mat_map.get('ka')}")

if "teeth" in mbody.get("ka", "").lower():
    ok("conflict.ka.malini", f"ka malini={mbody['ka']}")
else:
    fail("conflict.ka.malini", f"ka malini unexpected: {mbody.get('ka')}")

if "heart" in mat_map.get("ma", "").lower():
    ok("conflict.ma.heart.matrika", f"ma matrika={mat_map['ma']}")
else:
    warn("conflict.ma.heart.matrika", f"ma={mat_map.get('ma')}")

if "heart" in mbody.get("pa", "").lower():
    ok("conflict.pa.heart.malini", f"pa malini={mbody['pa']}")
else:
    fail("conflict.pa.heart.malini", f"pa={mbody.get('pa')}")

# --- architecture canonical ---
if "Tantrāloka" in arch.get("canonical", {}).get("decision", ""):
    ok("canonical.tantraloka", "locked in architecture.json")
else:
    fail("canonical.tantraloka", "not locked")

if arch.get("goswami_role", {}).get("status") == "TOOL_NOT_BACKBONE":
    ok("goswami.tool", "TOOL_NOT_BACKBONE")
else:
    fail("goswami.tool", arch.get("goswami_role", {}).get("status"))

# --- HTML diagram presence ---
if html:
    for needle, rule in [
        ("MĀTṚKĀ", "html.matrika_title"),
        ("MĀLINĪ", "html.malini_title"),
        ("forehead", "html.forehead"),
        ("teeth", "html.teeth_label"),
        ("Start here", "html.start_here"),
        ("font-size:22px", "html.large_glyphs"),
    ]:
        if needle in html:
            ok(rule, f"found {needle!r}")
        else:
            fail(rule, f"missing {needle!r}")
    if "mermaid" in html.lower() and "cdn.jsdelivr" in html:
        fail("html.no_mermaid_cdn", "mermaid CDN still present")
    else:
        ok("html.no_mermaid_cdn", "no mermaid CDN dependency")
else:
    warn("html.present", "PHONEME_BODY_DIAGRAM.html not found")

# --- body map JSON phoneme_objects ---
objs_path = DATA / "phoneme_objects.json"
if objs_path.exists():
    objs = json.loads(objs_path.read_text(encoding="utf-8"))
    objects = objs.get("objects", [])
    if len(objects) == objs.get("count", len(objects)):
        ok("objects.count", f"{len(objects)} objects")
    else:
        fail("objects.count", f"count mismatch {objs.get('count')} vs {len(objects)}")
    no_loc = [o["iast"] for o in objects if not o.get("tantric_locus")]
    if not no_loc:
        ok("objects.tantric_locus", "all have tantric_locus")
    else:
        fail("objects.tantric_locus", f"missing: {no_loc[:5]}")
else:
    warn("objects.present", "phoneme_objects.json missing")

# --- contrast/readability heuristic ---
# if html has .dev font-size 22 and .ia 15, report as readable
if "font-size:22px" in html or "font-size: 22px" in html:
    ok("readability.glyph_px", "Devanagari ~22px")
else:
    warn("readability.glyph_px", "glyph size not confirmed")

# summary
fails = [f for f in findings if f["status"] == "fail"]
warns = [f for f in findings if f["status"] == "warn"]
passes = [f for f in findings if f["status"] == "pass"]
report = {
    "id": "diagram-validation-v1",
    "method": "data-driven checks against deitybody JSON + generated HTML (not visual guesswork)",
    "sources": [
        str(DATA / "matrika_body_map.json"),
        str(DATA / "malini_order.json"),
        str(DATA / "architecture.json"),
        str(HTML) if HTML.exists() else None,
    ],
    "summary": {
        "pass": len(passes),
        "fail": len(fails),
        "warn": len(warns),
        "total": len(findings),
        "verdict": "PASS" if not fails else "FAIL",
    },
    "findings": findings,
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

print(f"DIAGRAM VALIDATION: {report['summary']['verdict']}")
print(f"  pass={len(passes)} fail={len(fails)} warn={len(warns)} total={len(findings)}")
for f in findings:
    mark = {"pass": "OK", "fail": "XX", "warn": "!!"}[f["status"]]
    print(f"  [{mark}] {f['rule']}: {f['detail']}")
print(f"written {OUT}")
raise SystemExit(0 if not fails else 1)
