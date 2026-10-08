#!/usr/bin/env python3
"""Simple reference cycle: phoneme → locus → practice gap → next.

No coaching voice. No in-track repeats.
Play it, do the pair yourself during the gap, let it move on.
Replay the file when you want another cycle.
"""
from __future__ import annotations

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / "audio"
TRACKS = AUDIO / "tracks"
PHON = AUDIO / "phoneme_clips"
LOCI = AUDIO / "loci"
SRC = Path("/root/sanskrithelp/public/audio/phonemes")
TMP = AUDIO / "_tmp" / "cycles"

# (iast, ogg, locus_key, locus_en)
NIGHT1 = [
    ("a", "a.ogg", "forehead", "forehead"),
    ("ā", "aa.ogg", "mouth_face", "mouth and face"),
]
VOWELS = [
    ("a", "a.ogg", "forehead", "forehead"),
    ("ā", "aa.ogg", "mouth_face", "mouth and face"),
    ("i", "i.ogg", "right_eye", "right eye"),
    ("ī", "ii.ogg", "left_eye", "left eye"),
    ("u", "u.ogg", "right_ear", "right ear"),
    ("ū", "uu.ogg", "left_ear", "left ear"),
    ("ṛ", "r.ogg", "right_nostril", "right nostril"),
    ("ṝ", "rr.ogg", "left_nostril", "left nostril"),
    ("e", "e.ogg", "lower_teeth", "lower teeth"),
    ("ai", "ai.ogg", "upper_teeth", "upper teeth"),
    ("o", "o.ogg", "lower_lip", "lower lip"),
    ("au", "au.ogg", "upper_lip", "upper lip"),
    ("aṃ", "anusvara.ogg", "crown", "crown"),
    ("aḥ", "visarga.ogg", "tongue", "tongue"),
]
CONSONANTS = [
    ("ka", "ka.ogg", "right_shoulder", "right shoulder"),
    ("kha", "kha.ogg", "right_arm", "right arm"),
    ("ga", "ga.ogg", "right_elbow", "right elbow"),
    ("gha", "gha.ogg", "right_wrist", "right wrist"),
    ("ca", "ca.ogg", "left_shoulder", "left shoulder"),
    ("cha", "cha.ogg", "left_arm", "left arm"),
    ("ja", "ja.ogg", "left_elbow", "left elbow"),
    ("jha", "jha.ogg", "left_wrist", "left wrist"),
    ("ta", "ta.ogg", "left_buttock", "left buttock"),
    ("tha", "tha.ogg", "left_thigh", "left thigh"),
    ("da", "da.ogg", "left_knee", "left knee"),
    ("dha", "dha.ogg", "left_shank", "left shank"),
]


def run(cmd: list[str]) -> None:
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"{' '.join(map(str, cmd))}\n{r.stderr[-400:]}")


def silence(sec: float, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    run([
        "ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
        "-t", str(sec), "-c:a", "libmp3lame", "-q:a", "4", str(out),
    ])


def as_mp3(src: Path, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    run([
        "ffmpeg", "-y", "-i", str(src), "-ar", "44100", "-ac", "1",
        "-c:a", "libmp3lame", "-q:a", "4", str(out),
    ])


def tts(text: str, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    r = subprocess.run(
        ["espeak", "-v", "en-us", "-s", "140", "-p", "45", "-w", str(out), text],
        capture_output=True,
    )
    if r.returncode != 0 or out.stat().st_size < 200:
        raise RuntimeError(f"espeak: {text}")


def concat(files: list[Path], out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    lst = out.parent / "list.txt"
    lst.write_text("\n".join(f"file '{f}'" for f in files) + "\n", encoding="utf-8")
    run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
        "-c:a", "libmp3lame", "-q:a", "4", str(out),
    ])


def dur(path: Path) -> str:
    return subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)],
        text=True,
    ).strip()


def ensure_locus(key: str, text: str) -> Path:
    wav = LOCI / f"{key}.wav"
    LOCI.mkdir(parents=True, exist_ok=True)
    if wav.exists() and wav.stat().st_size > 500:
        return wav
    tts(text, wav)
    return wav


def ensure_clip(iast: str, ogg: str) -> Path:
    PHON.mkdir(parents=True, exist_ok=True)
    safe = (
        iast.replace("ā", "aa").replace("ī", "ii").replace("ū", "uu")
        .replace("ṛ", "r").replace("ṝ", "rr").replace("ṃ", "m").replace("ḥ", "h")
    )
    dest = PHON / f"{safe}_{ogg}"
    if not dest.exists():
        dest.write_bytes((SRC / ogg).read_bytes())
    return dest


def build_cycle(items, out_name: str, gap_sec: float, lead_in: float = 1.0, tail: float = 3.0) -> Path:
    """One pass: [lead] · for each: phoneme → locus → gap · [tail]"""
    TMP.mkdir(parents=True, exist_ok=True)
    wd = TMP / out_name.replace(".mp3", "")
    wd.mkdir(parents=True, exist_ok=True)
    parts: list[Path] = []

    p = wd / "lead.mp3"
    silence(lead_in, p)
    parts.append(p)

    for idx, (iast, ogg, loc_key, loc_en) in enumerate(items):
        ph = ensure_clip(iast, ogg)
        lo = ensure_locus(loc_key, loc_en)
        c = wd / f"ph{idx}.mp3"
        as_mp3(ph, c)
        parts.append(c)
        g0 = wd / f"g0_{idx}.mp3"
        silence(0.6, g0)
        parts.append(g0)
        loc = wd / f"lo{idx}.mp3"
        as_mp3(lo, loc)
        parts.append(loc)
        gap = wd / f"gap{idx}.mp3"
        silence(gap_sec, gap)
        parts.append(gap)
        print(f"  {iast:4s} → {loc_en}")

    t = wd / "tail.mp3"
    silence(tail, t)
    parts.append(t)

    out = TRACKS / out_name
    concat(parts, out)
    print(f"{out.name}: {out.stat().st_size // 1024} KB  {dur(out)}s  items={len(items)}  gap={gap_sec}s")
    return out


def main() -> None:
    TRACKS.mkdir(parents=True, exist_ok=True)
    print("Night 1 cycle (a ā) — play, do it yourself in the gap, replay file:")
    build_cycle(NIGHT1, "cycle_night1_a_aa.mp3", gap_sec=8.0, lead_in=1.0, tail=4.0)

    print("Vowels cycle (1–8) — one pass each:")
    build_cycle(VOWELS, "cycle_vowels.mp3", gap_sec=7.0, lead_in=1.0, tail=4.0)

    print("Consonants cycle (9–14):")
    build_cycle(CONSONANTS, "cycle_consonants.mp3", gap_sec=7.0, lead_in=1.0, tail=4.0)

    print("Full starter cycle (all 26):")
    build_cycle(VOWELS + CONSONANTS, "cycle_full_starter.mp3", gap_sec=6.0, lead_in=1.0, tail=5.0)


if __name__ == "__main__":
    main()
