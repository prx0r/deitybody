#!/usr/bin/env python3
"""Render the 10 practice-companion explainers (site/data/companions.json).

One Fish clip per stage → site/audio/companions/c{n}.mp3 (single segment, no assembly).
Same slow guide voice as guide/meditations. Free lane, $0.

Usage:
  python3 scripts/render_companions.py --dry-run
  FISH_API_KEY=... python3 scripts/render_companions.py [--stage N]
"""
import json
import os
import sys
import urllib.request

VOICE_ID = "06134e9a49cb4a36997b75402c8a0621"
MODEL_FREE = "s2.1-pro-free"
API_URL = "https://api.fish.audio/v1/tts"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "site", "data", "companions.json")
OUT = os.path.join(ROOT, "site", "audio", "companions")


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
    if "--stage" in sys.argv:
        try:
            want = int(sys.argv[sys.argv.index("--stage") + 1])
        except (IndexError, ValueError):
            pass
    doc = json.load(open(DATA))
    if doc.get("voice_id") != VOICE_ID or doc.get("model") != MODEL_FREE:
        print("voice/model drift vs companions.json — update script constants first.")
        sys.exit(3)
    stages = [s for s in doc["stages"] if not want or s["n"] == want]
    missing = [s for s in stages
               if not os.path.exists(os.path.join(OUT, f"c{s['n']}.mp3"))
               or os.path.getsize(os.path.join(OUT, f"c{s['n']}.mp3")) < 100_000]
    total = sum(len(s["say"].encode()) for s in missing)
    print(f"stages: {len(stages)}, to render: {len(missing)}, bytes: {total} "
          f"(model {MODEL_FREE} = $0)")
    if dry:
        for s in missing:
            print(f"  [c{s['n']}] {s['say'][:72]}")
        return
    if not missing:
        print("nothing to do.")
        return
    key = os.getenv("FISH_API_KEY", "").strip()
    if not key:
        print("FISH_API_KEY not set — nothing rendered.")
        sys.exit(2)
    os.makedirs(OUT, exist_ok=True)
    for s in missing:
        audio = render(s["say"], key)
        with open(os.path.join(OUT, f"c{s['n']}.mp3"), "wb") as fh:
            fh.write(audio)
        print(f"  c{s['n']}.mp3 ({len(audio)}B)")


if __name__ == "__main__":
    main()
