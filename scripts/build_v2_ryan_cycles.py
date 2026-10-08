#!/usr/bin/env python3
"""V2 cycles: human phoneme clips + RyanNeural (Edge, en-GB) English cues.

Same structures as build_simple_cycles.py, two doctrine fixes:
- consonant loci follow verse-literal v2 (hand/fingers/nails, hip),
  NOT the apparatus elbow/wrist/buttock baked into v1.
- locus/instruction voice: en-GB-RyanNeural via edge_tts (keyless),
  replacing espeak robot.

Outputs cycle_*_v2.mp3 + guided v2 into deitybody tracks; copy the v2 set
into sanskrithelp public/memory/audio/ by hand after listening.
Phoneme clips stay HUMAN gold (grid set) — synth never enters install path.
"""
from __future__ import annotations

import asyncio
import subprocess
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / "audio"
TRACKS = AUDIO / "tracks"
PHON = AUDIO / "phoneme_clips"
LOCI2 = AUDIO / "loci_v2"
SRC = Path("/root/sanskrithelp/public/audio/phonemes")
TMP = AUDIO / "_tmp" / "cycles_v2"
VOICE = "en-GB-RyanNeural"


def run(cmd: list[str]) -> None:
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"{' '.join(map(str, cmd))}\n{r.stderr[-400:]}")


def silence(sec: float, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
         "-t", str(sec), "-c:a", "libmp3lame", "-q:a", "4", str(out)])


def as_mp3(src: Path, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    run(["ffmpeg", "-y", "-i", str(src), "-c:a", "libmp3lame", "-q:a", "4", str(out)])


async def ryan_tts(text: str, out: Path) -> Path:
    out.parent.mkdir(parents=True, exist_ok=True)
    if out.exists() and out.stat().st_size > 2000:
        return out
    await edge_tts.Communicate(text, VOICE, rate="-10%").save(str(out))
    return out


def ryan_sync(text: str, key: str) -> Path:
    return asyncio.run(ryan_tts(text, LOCI2 / f"{key}.mp3"))


# (iast, ogg, locus_key, locus_en) — loci are VERSE-LITERAL v2
NIGHT1 = [("a", "a.ogg", "forehead", "forehead"),
          ("ā", "aa.ogg", "mouth_face", "mouth and face")]
VOWELS = [
    ("a", "a.ogg", "forehead", "forehead"), ("ā", "aa.ogg", "mouth_face", "mouth and face"),
    ("i", "i.ogg", "right_eye", "right eye"), ("ī", "ii.ogg", "left_eye", "left eye"),
    ("u", "u.ogg", "right_ear", "right ear"), ("ū", "uu.ogg", "left_ear", "left ear"),
    ("ṛ", "r.ogg", "right_nostril", "right nostril"), ("ṝ", "rr.ogg", "left_nostril", "left nostril"),
    ("e", "e.ogg", "lower_teeth", "lower teeth"), ("ai", "ai.ogg", "upper_teeth", "upper teeth"),
    ("o", "o.ogg", "lower_lip", "lower lip"), ("au", "au.ogg", "upper_lip", "upper lip"),
    ("aṃ", "anusvara.ogg", "crown", "crown"), ("aḥ", "visarga.ogg", "tongue", "tongue"),
]
CONSONANTS_V2 = [
    ("ka", "ka.ogg", "right_shoulder", "right shoulder"),
    ("kha", "kha.ogg", "right_arm", "right arm"),
    ("ga", "ga.ogg", "right_hand", "right hand"),
    ("gha", "gha.ogg", "right_fingers", "right fingers"),
    ("ca", "ca.ogg", "left_shoulder", "left shoulder"),
    ("cha", "cha.ogg", "left_arm", "left arm"),
    ("ja", "ja.ogg", "left_hand", "left hand"),
    ("jha", "jha.ogg", "left_fingers", "left fingers"),
    ("ta", "ta.ogg", "left_hip", "left hip"),
    ("tha", "tha.ogg", "left_thigh", "left thigh"),
    ("da", "da.ogg", "left_knee", "left knee"),
    ("dha", "dha.ogg", "left_shank", "left shank"),
]



FULL50 = [
    ("a", "a.ogg", "forehead", "forehead"), ("ā", "aa.ogg", "mouth_face", "mouth and face"),
    ("i", "i.ogg", "right_eye", "right eye"), ("ī", "ii.ogg", "left_eye", "left eye"),
    ("u", "u.ogg", "right_ear", "right ear"), ("ū", "uu.ogg", "left_ear", "left ear"),
    ("ṛ", "r.ogg", "right_nostril", "right nostril"), ("ṝ", "rr.ogg", "left_nostril", "left nostril"),
    ("ḷ", "l.ogg", "right_cheek", "right cheek"), ("ḹ", "ll.ogg", "left_cheek", "left cheek"),
    ("e", "e.ogg", "lower_teeth", "lower teeth"), ("ai", "ai.ogg", "upper_teeth", "upper teeth"),
    ("o", "o.ogg", "lower_lip", "lower lip"), ("au", "au.ogg", "upper_lip", "upper lip"),
    ("aṃ", "anusvara.ogg", "crown", "crown"), ("aḥ", "visarga.ogg", "tongue", "tongue"),
    ("ka", "ka.ogg", "right_shoulder", "right shoulder"), ("kha", "kha.ogg", "right_arm", "right arm"),
    ("ga", "ga.ogg", "right_hand", "right hand"), ("gha", "gha.ogg", "right_fingers", "right fingers"),
    ("ṅa", "na_k.ogg", "right_nails", "right nails"),
    ("ca", "ca.ogg", "left_shoulder", "left shoulder"), ("cha", "cha.ogg", "left_arm", "left arm"),
    ("ja", "ja.ogg", "left_hand", "left hand"), ("jha", "jha.ogg", "left_fingers", "left fingers"),
    ("ña", "na_j.ogg", "left_nails", "left nails"),
    ("ṭa", "ta1.ogg", "right_hip", "right hip"), ("ṭha", "tha1.ogg", "right_thigh", "right thigh"),
    ("ḍa", "da1.ogg", "right_knee", "right knee"), ("ḍha", "dha1.ogg", "right_shank", "right shank"),
    ("ṇa", "na1.ogg", "right_toes", "right toes"),
    ("ta", "ta.ogg", "left_hip", "left hip"), ("tha", "tha.ogg", "left_thigh", "left thigh"),
    ("da", "da.ogg", "left_knee", "left knee"), ("dha", "dha.ogg", "left_shank", "left shank"),
    ("na", "na.ogg", "left_toes", "left toes"),
    ("pa", "pa.ogg", "right_side", "right side"), ("pha", "pha.ogg", "left_side", "left side"),
    ("ba", "ba.ogg", "back", "back"), ("bha", "bha.ogg", "belly", "belly"), ("ma", "ma.ogg", "heart", "heart"),
    ("ya", "ya.ogg", "skin", "skin"), ("ra", "ra.ogg", "blood", "blood"), ("la", "la.ogg", "flesh", "flesh"),
    ("va", "va.ogg", "sinews", "sinews"),
    ("śa", "sha.ogg", "bone", "bone"), ("ṣa", "shha.ogg", "marrow", "marrow"),
    ("sa", "sa.ogg", "essence", "generative essence"), ("ha", "ha.ogg", "prana", "prana"),
    ("kṣa", "ksha.ogg", "generative_organ", "generative organ"),
]

CLIPDIRS = [SRC, Path("/root/sanskrithelp/public/memory/clips")]
def ensure_clip(ogg: str) -> Path:
    for d in CLIPDIRS:
        src = d / ogg
        if src.exists():
            return src
    raise AssertionError(f"missing clip {ogg} in grid + memory/clips")


def build_cycle(items, out_name: str, gap_sec: float, lead_in: float = 1.0, tail: float = 3.0) -> Path:
    TMP.mkdir(parents=True, exist_ok=True)
    wd = TMP / out_name.replace(".mp3", "")
    wd.mkdir(parents=True, exist_ok=True)
    parts: list[Path] = []
    p = wd / "lead.mp3"
    silence(lead_in, p)
    parts.append(p)
    for idx, (iast, ogg, loc_key, loc_en) in enumerate(items):
        c = wd / f"ph{idx}.mp3"
        if ogg is None:
            # no human clip cut: hold silence, speak it yourself (honest gap)
            silence(1.2, c)
        else:
            as_mp3(ensure_clip(ogg), c)
        parts.append(c)
        g0 = wd / f"g0_{idx}.mp3"
        silence(0.6, g0)
        parts.append(g0)
        loc = wd / f"lo{idx}.mp3"
        as_mp3(ryan_sync(loc_en, loc_key), loc)
        parts.append(loc)
        gap = wd / f"gap{idx}.mp3"
        silence(gap_sec, gap)
        parts.append(gap)
        print(f"  {iast:4s} → {loc_en}", flush=True)
    t = wd / "tail.mp3"
    silence(tail, t)
    parts.append(t)
    out = TRACKS / out_name
    lst = wd / "list.txt"
    lst.write_text("\n".join(f"file '{f}'" for f in parts) + "\n", encoding="utf-8")
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
         "-c:a", "libmp3lame", "-q:a", "4", str(out)])
    print(f"{out.name}: {out.stat().st_size // 1024} KB  items={len(items)}  gap={gap_sec}s")
    return out


def main() -> None:
    TRACKS.mkdir(parents=True, exist_ok=True)
    build_cycle(NIGHT1, "cycle_night1_a_aa_v2.mp3", gap_sec=8.0)
    build_cycle(VOWELS, "cycle_vowels_v2.mp3", gap_sec=7.0)
    build_cycle(CONSONANTS_V2, "cycle_consonants_v2.mp3", gap_sec=7.0)
    build_cycle(VOWELS + CONSONANTS_V2, "cycle_full_starter_v2.mp3", gap_sec=6.0, tail=5.0)
    build_cycle(FULL50, "track_full50_installation.mp3", gap_sec=6.0, tail=6.0)


if __name__ == "__main__":
    main()
