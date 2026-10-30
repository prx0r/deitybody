#!/usr/bin/env python3
"""Render PTv-night spoken direction via Fish Audio free lane ($0, never metered).

Reads site/data/guide_ptv.json, renders each night's intro / 2 dirs / close
with the slow guide voice, writes mp3s to site/audio/guide/ + manifest
site/audio/guide/guide.json (night -> files), which the lab night player
picks up automatically. Missing manifest or clips = night runs unguided.

Uses raw REST (urllib, no SDK needed): POST https://api.fish.audio/v1/tts
  headers: Authorization: Bearer $FISH_API_KEY, Content-Type: application/json,
           model: s2.1-pro-free
  body: {"text": ..., "reference_id": <slow guide voice>, "format": "mp3"}

Usage:
  python3 scripts/render_guide.py --dry-run   # always works, no key needed
  FISH_API_KEY=... python3 scripts/render_guide.py [--night N]
"""
import json
import os
import sys
import urllib.request

VOICE_ID = "06134e9a49cb4a36997b75402c8a0621"  # slow guide (see guide_ptv.json note)
MODEL_FREE = "s2.1-pro-free"
API_URL = "https://api.fish.audio/v1/tts"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "site", "data", "guide_ptv.json")
OUTDIR = os.path.join(ROOT, "site", "audio", "guide")
MANIFEST = os.path.join(OUTDIR, "guide.json")


def plan():
    guide = json.load(open(DATA))
    if guide.get("voice_id") != VOICE_ID or guide.get("model") != MODEL_FREE:
        print("voice/model drift vs guide_ptv.json — update script constants first.")
        sys.exit(3)
    jobs = []
    for night in guide["nights"]:
        n = night["n"]
        jobs.append((n, "intro", f"night{n}-intro.mp3", night["intro"]))
        for i, d in enumerate(night["dirs"]):
            jobs.append((n, f"dir{i+1}", f"night{n}-dir{i+1}.mp3", d))
        jobs.append((n, "close", f"night{n}-close.mp3", night["close"]))
    return jobs


def render(text, key):
    body = json.dumps({"text": text, "reference_id": VOICE_ID, "format": "mp3"}).encode()
    req = urllib.request.Request(
        API_URL, data=body,
        headers={"Authorization": f"Bearer {key}",
                 "Content-Type": "application/json",
                 "model": MODEL_FREE})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def main():
    dry = "--dry-run" in sys.argv
    want = None
    for a in sys.argv[1:]:
        if a == "--night":
            continue
        if a.startswith("--"):
            continue
        try:
            want = int(a)
        except ValueError:
            pass
    # support `--night N` positionally independent
    if "--night" in sys.argv:
        i = sys.argv.index("--night")
        try:
            want = int(sys.argv[i + 1])
        except (IndexError, ValueError):
            pass
    jobs = [j for j in plan() if not want or j[0] == want]
    missing = [j for j in jobs
               if (not os.path.exists(os.path.join(OUTDIR, j[2]))
                   or os.path.getsize(os.path.join(OUTDIR, j[2])) < 2000)]
    total = sum(len(t.encode()) for _, _, _, t in missing)
    print(f"nights: 8, lines: {len(jobs)}, to render: {len(missing)}, "
          f"bytes: {total} (model {MODEL_FREE} = $0)")
    if dry:
        for n, kind, f, t in missing:
            print(f"  [night{n}/{kind}] {f} :: {t[:64]}")
        return
    if not missing:
        print("nothing to do.")
        return
    key = os.getenv("FISH_API_KEY", "").strip()
    if not key:
        print("FISH_API_KEY not set — nothing rendered.")
        sys.exit(2)
    os.makedirs(OUTDIR, exist_ok=True)
    manifest = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {}
    for n, kind, f, t in missing:
        audio = render(t, key)
        with open(os.path.join(OUTDIR, f), "wb") as fh:
            fh.write(audio)
        manifest.setdefault(str(n), {})[kind] = f"audio/guide/{f}"
        print(f"  wrote {f} ({len(audio)} bytes)")
    json.dump(manifest, open(MANIFEST, "w"), ensure_ascii=False, indent=1)
    print(f"manifest: {MANIFEST}")


if __name__ == "__main__":
    main()
