#!/usr/bin/env python3
"""Render replacement phoneme clips via Fish Audio free lane ($0, never metered).

Targeted job: vocalic ḷ/ḹ (cheek loci) whose Edge renders are mangled fragments.
Voice: slow guide voice (community Osho-style — direction/clip label only,
never worn as identity). Text sent as bare Devanagari syllable so the model
voices the letter itself, no carrier word.

Verbatim check after render: Qwen-Omni listen (bl omni --audio) + ear confirm
before flipping phonemes.json to verified. Until then clips stay
speaker=fish-oshostyle-unverified, verified=false.

Usage:
  python3 scripts/render_phonemes_fish.py --dry-run
  FISH_API_KEY=... python3 scripts/render_phonemes_fish.py [--only lr|lrr]
"""
import json
import os
import sys
import urllib.request

VOICE_ID = "06134e9a49cb4a36997b75402c8a0621"
MODEL_FREE = "s2.1-pro-free"
API_URL = "https://api.fish.audio/v1/tts"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOBS = [
    # (clip id, devanagari text, out file)
    ("lr", "ऌ", "site/audio/phonemes/lr.ogg"),
    ("lrr", "ॡ", "site/audio/phonemes/lrr.ogg"),
]

# Fish returns mp3/wav; we ask wav then encode ogg via ffmpeg for repo consistency.
FMT = "wav"


def render(text, key):
    body = json.dumps({"text": text, "reference_id": VOICE_ID,
                       "format": FMT}).encode()
    req = urllib.request.Request(
        API_URL, data=body,
        headers={"Authorization": f"Bearer {key}",
                 "Content-Type": "application/json",
                 "model": MODEL_FREE})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def main():
    dry = "--dry-run" in sys.argv
    only = None
    if "--only" in sys.argv:
        only = sys.argv[sys.argv.index("--only") + 1]
    jobs = [j for j in JOBS if not only or j[0] == only]
    print(f"jobs: {len(jobs)} (model {MODEL_FREE} = $0, voice slow-guide)")
    if dry:
        for cid, text, out in jobs:
            p = os.path.join(ROOT, out)
            have = os.path.exists(p)
            print(f"  [{cid}] send {text!r} -> {out} (exists: {have})")
        return
    key = os.getenv("FISH_API_KEY", "").strip()
    if not key:
        print("FISH_API_KEY not set — nothing rendered.")
        sys.exit(2)
    for cid, text, out in jobs:
        audio = render(text, key)
        tmp = f"/tmp/fish-{cid}.{FMT}"
        with open(tmp, "wb") as fh:
            fh.write(audio)
        print(f"  got {len(audio)} bytes for [{cid}] {text!r} -> {tmp}")
    print("Next: listen (ffplay/Qwen-Omni/ear), then ffmpeg to ogg + update phonemes.json.")


if __name__ == "__main__":
    main()
