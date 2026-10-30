#!/usr/bin/env python3
"""Render the 10 recorded meditations (site/data/meditations.json).

Per stage: Fish-render each `say` segment (slow guide voice, free lane, $0),
then assemble m{n}.mp3 = seg + baked silence (hold seconds) + seg with ffmpeg.
Silence carries the practice time; recordings never stretch.

Usage:
  python3 scripts/render_meditations.py --dry-run
  FISH_API_KEY=... python3 scripts/render_meditations.py [--stage N]
"""
import json
import os
import subprocess
import sys
import urllib.request

VOICE_ID = "06134e9a49cb4a36997b75402c8a0621"
MODEL_FREE = "s2.1-pro-free"
API_URL = "https://api.fish.audio/v1/tts"
SR = 44100

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "site", "data", "meditations.json")
OUT = os.path.join(ROOT, "site", "audio", "meditations")
SEG = os.path.join(OUT, "seg")


def render(text, key):
    body = json.dumps({"text": text, "reference_id": VOICE_ID, "format": "mp3"}).encode()
    req = urllib.request.Request(
        API_URL, data=body,
        headers={"Authorization": f"Bearer {key}",
                 "Content-Type": "application/json",
                 "model": MODEL_FREE})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def assemble(stage):
    """m{n}.mp3 = seg1 + silence(hold1) + seg2 + silence(hold2) + ..."""
    segs = [os.path.join(SEG, f"m{stage['n']}-{i}.mp3")
            for i in range(len(stage["segments"]))]
    final = os.path.join(OUT, f"m{stage['n']}.mp3")
    if os.path.exists(final):
        fnew = os.path.getmtime(final)
        if all(os.path.getmtime(s) < fnew for s in segs if os.path.exists(s)) \
                and len([s for s in segs if os.path.exists(s)]) == len(segs):
            return False  # fresh
    inputs, filters, labels = [], [], []
    idx = 0
    for i, seg in enumerate(segs):
        if not os.path.exists(seg):
            raise RuntimeError(f"missing segment {seg}")
        inputs += ["-i", seg]
        filters.append(f"[{idx}:a]aresample={SR}[a{idx}]")
        labels.append(f"[a{idx}]")
        idx += 1
        hold = stage["segments"][i].get("hold", 0)
        if hold:
            inputs += ["-f", "lavfi", "-t", str(int(hold)),
                       "-i", f"anullsrc=r={SR}:cl=mono"]
            filters.append(f"[{idx}:a]aresample={SR}[a{idx}]")
            labels.append(f"[a{idx}]")
            idx += 1
    filters.append(f"{''.join(labels)}concat=n={idx}:v=0:a=1[out]")
    cmd = (["ffmpeg", "-y", "-v", "error"] + inputs +
           ["-filter_complex", ";".join(filters),
            "-map", "[out]", "-ac", "1", "-b:a", "64k", final])
    subprocess.run(cmd, check=True)
    return True


def main():
    dry = "--dry-run" in sys.argv
    want = None
    if "--stage" in sys.argv:
        try:
            want = int(sys.argv[sys.argv.index("--stage") + 1])
        except (IndexError, ValueError):
            pass
    doc = json.load(open(DATA))
    stages = [s for s in doc["stages"] if not want or s["n"] == want]
    if doc.get("voice_id") != VOICE_ID or doc.get("model") != MODEL_FREE:
        print("voice/model drift vs meditations.json — update script constants first.")
        sys.exit(3)
    jobs = []
    for st in stages:
        for i, seg in enumerate(st["segments"]):
            jobs.append((st["n"], i, seg["say"]))
    missing = [j for j in jobs
               if not os.path.exists(os.path.join(SEG, f"m{j[0]}-{j[1]}.mp3"))
               or os.path.getsize(os.path.join(SEG, f"m{j[0]}-{j[1]}.mp3")) < 2000]
    total = sum(len(s.encode()) for _, _, s in missing)
    print(f"stages: {len(stages)}, segs: {len(jobs)}, to render: {len(missing)}, "
          f"bytes: {total} (model {MODEL_FREE} = $0)")
    if dry:
        for n, i, s in missing:
            print(f"  [m{n}-{i}] {s[:72]}")
        return
    if missing:
        key = os.getenv("FISH_API_KEY", "").strip()
        if not key:
            print("FISH_API_KEY not set — nothing rendered.")
            sys.exit(2)
        os.makedirs(SEG, exist_ok=True)
        for n, i, s in missing:
            audio = render(s, key)
            with open(os.path.join(SEG, f"m{n}-{i}.mp3"), "wb") as fh:
                fh.write(audio)
            print(f"  seg m{n}-{i} ({len(audio)}B)")
    for st in stages:
        built = assemble(st)
        hold = sum(x.get("hold", 0) for x in st["segments"])
        print(f"  m{st['n']}.mp3 {'BUILT' if built else 'fresh'} (~{hold//60}min practice silence)")


if __name__ == "__main__":
    main()
