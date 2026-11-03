#!/usr/bin/env python3
"""Render voice2 phoneme clips — Fish Audio voice 4e873c37… (owner-requested),
free lane only (model s2.1-pro-free, $0, never metered).

Voice1 stays the human guide clips (site/audio/phonemes/). Voice2 writes the
same filenames under site/audio/phonemes_v2/; the chant dock swaps the base
path at load time (lab.js chantVoice). Text = bare Devanagari syllable so the
model voices the letter itself (same rule as render_phonemes_fish.py).

Usage:
  python3 scripts/render_phonemes_voice2.py --dry-run
  python3 scripts/render_phonemes_voice2.py            # all missing
  python3 scripts/render_phonemes_voice2.py --only a,ka
"""
import json
import os
import subprocess
import sys
import time
import urllib.request

VOICE_ID = "4e873c37d4cb439e9bccc4dc1f633290"
MODEL_FREE = "s2.1-pro-free"
API_URL = "https://api.fish.audio/v1/tts"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PH = os.path.join(ROOT, "site", "data", "phonemes.json")
OUTDIR = os.path.join(ROOT, "site", "audio", "phonemes_v2")


def fish(text, key):
    body = json.dumps({"text": text, "reference_id": VOICE_ID, "format": "wav"}).encode()
    req = urllib.request.Request(
        API_URL, data=body,
        headers={"Authorization": f"Bearer {key}",
                 "Content-Type": "application/json",
                 "model": MODEL_FREE})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def jobs(only=None):
    recs = json.load(open(PH, encoding="utf-8"))["phonemes"]
    out = []
    for p in recs:
        ref = (p.get("audio") or {}).get("reference") or ""
        base = ref.rsplit("/", 1)[-1]
        if not base or not p.get("dev"):
            continue
        if only and p.get("iast") not in only:
            continue
        out.append((p["iast"], p["dev"], base))
    return out


def main():
    dry = "--dry-run" in sys.argv
    only = None
    if "--only" in sys.argv:
        only = set(sys.argv[sys.argv.index("--only") + 1].split(","))
    js = jobs(only)
    print(f"voice2: {len(js)} phonemes -> phonemes_v2/ (voice {VOICE_ID[:8]}…, {MODEL_FREE})")
    if dry:
        for iast, dev, base in js:
            have = os.path.exists(os.path.join(OUTDIR, base))
            print(f"  [{iast}] {dev!r} -> {base} (exists: {have})")
        return 0

    key = ""
    for line in open(os.path.expanduser("~/.fish-env"), encoding="utf-8"):
        line = line.strip()
        if line.startswith("FISH_API_KEY="):
            key = line.split("=", 1)[1].strip()
    if not key:
        print("FISH_API_KEY missing from ~/.fish-env")
        return 2
    os.makedirs(OUTDIR, exist_ok=True)
    made = skipped = failed = 0
    for iast, dev, base in js:
        dst = os.path.join(OUTDIR, base)
        if os.path.exists(dst) and os.path.getsize(dst) > 400:
            skipped += 1
            continue
        wav = dst + ".wav"
        ok = False
        for attempt in range(2):
            try:
                data = fish(dev, key)
                open(wav, "wb").write(data)
                subprocess.run(
                    ["ffmpeg", "-y", "-loglevel", "error", "-i", wav,
                     "-c:a", "libvorbis", "-q:a", "5", dst],
                    check=True, timeout=60)
                os.remove(wav)
                ok = True
                break
            except Exception as e:
                print(f"  retry {iast}: {str(e)[:90]}")
                time.sleep(1.5)
        if ok:
            made += 1
            print(f"  ok {iast} ({dev})")
        else:
            failed += 1
            print(f"  FAIL {iast}")
        time.sleep(0.25)
    print(f"done: {made} made, {skipped} skipped, {failed} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
