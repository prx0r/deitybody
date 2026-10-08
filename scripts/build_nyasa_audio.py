#!/usr/bin/env python3
"""Build guided nyasa practice audio: phoneme clip → locus TTS → gap.

Phoneme models: /root/sanskrithelp/public/audio/phonemes/*.ogg
Locus TTS: espeak (reliable). CF aura-1 accepts {"text": "..."} for optional regen.
"""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / "audio"
TRACKS = AUDIO / "tracks"
PHON = AUDIO / "phoneme_clips"
LOCI = AUDIO / "loci"
SRC = Path("/root/sanskrithelp/public/audio/phonemes")
TMP = AUDIO / "_tmp"

PLAN = [
    (1, "a", "a.ogg", "forehead", "forehead"),
    (1, "ā", "aa.ogg", "mouth and face", "mouth_face"),
    (2, "i", "i.ogg", "right eye", "right_eye"),
    (2, "ī", "ii.ogg", "left eye", "left_eye"),
    (3, "u", "u.ogg", "right ear", "right_ear"),
    (3, "ū", "uu.ogg", "left ear", "left_ear"),
    (4, "ṛ", "r.ogg", "right nostril", "right_nostril"),
    (4, "ṝ", "rr.ogg", "left nostril", "left_nostril"),
    (6, "e", "e.ogg", "lower teeth", "lower_teeth"),
    (6, "ai", "ai.ogg", "upper teeth", "upper_teeth"),
    (7, "o", "o.ogg", "lower lip", "lower_lip"),
    (7, "au", "au.ogg", "upper lip", "upper_lip"),
    (8, "aṃ", "anusvara.ogg", "crown", "crown"),
    (8, "aḥ", "visarga.ogg", "tongue", "tongue"),
    (9, "ka", "ka.ogg", "right shoulder", "right_shoulder"),
    (9, "kha", "kha.ogg", "right arm", "right_arm"),
    (10, "ga", "ga.ogg", "right elbow", "right_elbow"),
    (10, "gha", "gha.ogg", "right wrist", "right_wrist"),
    (11, "ca", "ca.ogg", "left shoulder", "left_shoulder"),
    (11, "cha", "cha.ogg", "left arm", "left_arm"),
    (12, "ja", "ja.ogg", "left elbow", "left_elbow"),
    (12, "jha", "jha.ogg", "left wrist", "left_wrist"),
    (13, "ta", "ta.ogg", "left buttock", "left_buttock"),
    (13, "tha", "tha.ogg", "left thigh", "left_thigh"),
    (14, "da", "da.ogg", "left knee", "left_knee"),
    (14, "dha", "dha.ogg", "left shank", "left_shank"),
]


def run(cmd: list[str]) -> None:
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"{' '.join(map(str, cmd))}\n{r.stderr[-500:]}")


def ensure_parent(p: Path) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)


def silence(sec: float, out: Path) -> None:
    ensure_parent(out)
    run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "anullsrc=r=44100:cl=mono",
            "-t",
            str(sec),
            "-c:a",
            "libmp3lame",
            "-q:a",
            "4",
            str(out),
        ]
    )


def as_mp3(src: Path, out: Path) -> None:
    ensure_parent(out)
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(src),
            "-ar",
            "44100",
            "-ac",
            "1",
            "-c:a",
            "libmp3lame",
            "-q:a",
            "4",
            str(out),
        ]
    )


def concat(files: list[Path], out: Path) -> None:
    ensure_parent(out)
    lst = out.parent / "concat_list.txt"
    lst.write_text("\n".join(f"file '{f}'" for f in files) + "\n", encoding="utf-8")
    run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(lst),
            "-c:a",
            "libmp3lame",
            "-q:a",
            "4",
            str(out),
        ]
    )


def dur(path: Path) -> str:
    return subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=nw=1:nk=1",
            str(path),
        ],
        text=True,
    ).strip()


def phon_file(iast: str, ogg: str) -> Path:
    src = SRC / ogg
    if not src.exists():
        raise FileNotFoundError(src)
    safe = (
        iast.replace("ā", "aa")
        .replace("ī", "ii")
        .replace("ū", "uu")
        .replace("ṛ", "r")
        .replace("ṝ", "rr")
        .replace("ṃ", "m")
        .replace("ḥ", "h")
    )
    dest = PHON / f"{safe}_{ogg}"
    if not dest.exists():
        dest.write_bytes(src.read_bytes())
    return dest


def ensure_locus(key: str, text: str) -> Path:
    wav = LOCI / f"{key}.wav"
    if wav.exists() and wav.stat().st_size > 500:
        return wav
    LOCI.mkdir(parents=True, exist_ok=True)
    r = subprocess.run(
        ["espeak", "-v", "en-us", "-s", "140", "-w", str(wav), text],
        capture_output=True,
    )
    if r.returncode != 0 or not wav.exists() or wav.stat().st_size < 200:
        raise RuntimeError(f"espeak failed for {text}")
    return wav


def make_block(
    phon_ogg: Path, locus_wav: Path, repeats: int, gap_before: float, wd: Path
) -> Path:
    wd.mkdir(parents=True, exist_ok=True)
    parts: list[Path] = []
    if gap_before > 0:
        s1 = wd / "gap.mp3"
        silence(gap_before, s1)
        parts.append(s1)
    for i in range(repeats):
        p = wd / f"ph{i}.mp3"
        as_mp3(phon_ogg, p)
        parts.append(p)
        p1 = wd / f"pa{i}.mp3"
        silence(0.8, p1)
        parts.append(p1)
        loc = wd / f"lo{i}.mp3"
        as_mp3(locus_wav, loc)
        parts.append(loc)
        p2 = wd / f"pb{i}.mp3"
        silence(1.2, p2)
        parts.append(p2)
    out = wd / "block.mp3"
    concat(parts, out)
    return out


def sequence_track(items: list[tuple], out_name: str) -> Path:
    work = TMP / out_name.replace(".mp3", "")
    work.mkdir(parents=True, exist_ok=True)
    parts: list[Path] = []
    intro = work / "intro.mp3"
    silence(2.0, intro)
    parts.append(intro)
    for idx, (_n, iast, ogg, _loc_en, loc_key) in enumerate(items):
        ph = phon_file(iast, ogg)
        lo = LOCI / f"{loc_key}.wav"
        p1 = work / f"ph{idx}.mp3"
        as_mp3(ph, p1)
        parts.append(p1)
        p2 = work / f"g{idx}.mp3"
        silence(0.7, p2)
        parts.append(p2)
        p3 = work / f"lo{idx}.mp3"
        as_mp3(lo, p3)
        parts.append(p3)
        p4 = work / f"gap{idx}.mp3"
        silence(5.0, p4)
        parts.append(p4)
    out = TRACKS / out_name
    concat(parts, out)
    print(f"  {out.name:42s} {out.stat().st_size // 1024:5d} KB  {dur(out)}s")
    return out


def main() -> None:
    for d in (TRACKS, PHON, LOCI, TMP):
        d.mkdir(parents=True, exist_ok=True)

    print("Locus TTS…")
    for _n, _i, _o, loc_en, loc_key in PLAN:
        ensure_locus(loc_key, loc_en)
    print(f"  loci ready: {len(list(LOCI.glob('*.wav')))}")

    print("Night 1 deep (24× clip+locus per phoneme ≈ 2 min each)…")
    night1 = [x for x in PLAN if x[0] == 1]
    blocks: list[Path] = []
    for idx, (_n, iast, ogg, _e, loc_key) in enumerate(night1):
        wd = TMP / f"n1_{idx}"
        ph = phon_file(iast, ogg)
        lo = LOCI / f"{loc_key}.wav"
        gap = 5.0 if idx > 0 else 1.5
        print(f"  {iast} → {loc_key}  gap_before={gap}s  x24")
        b = make_block(ph, lo, repeats=24, gap_before=gap, wd=wd)
        blocks.append(b)
        print(f"    block {b.stat().st_size // 1024}KB  {dur(b)}s")
    night1_out = TRACKS / "night1_a_aa_deep.mp3"
    concat(blocks, night1_out)
    print(
        f"  {night1_out.name:42s} {night1_out.stat().st_size // 1024:5d} KB  {dur(night1_out)}s"
    )

    print("Demo (8 reps a + forehead)…")
    demo_wd = TMP / "demo_a"
    demo = make_block(
        phon_file("a", "a.ogg"),
        LOCI / "forehead.wav",
        repeats=8,
        gap_before=1.0,
        wd=demo_wd,
    )
    demo_out = TRACKS / "demo_a_forehead_8reps.mp3"
    shutil.copy(demo, demo_out)
    print(
        f"  {demo_out.name:42s} {demo_out.stat().st_size // 1024:5d} KB  {dur(demo_out)}s"
    )

    print("Guided sequences…")
    sequence_track([x for x in PLAN if x[0] <= 8], "vowels_sequence_sound_locus.mp3")
    sequence_track([x for x in PLAN if x[0] >= 9], "consonants_sequence_sound_locus.mp3")

    playlist = {
        "id": "nyasa-audio-v1",
        "pattern": "phoneme_clip → locus_TTS → gap",
        "phoneme_source": str(SRC),
        "locus_tts": "espeak en-us (CF aura-1 available: POST text field)",
        "tracks": [
            {
                "file": "night1_a_aa_deep.mp3",
                "use": "Night 1 deep practice",
                "structure": "per phoneme: 24× (clip + 0.8s + locus + 1.2s); 5s gap between phonemes",
            },
            {
                "file": "demo_a_forehead_8reps.mp3",
                "use": "Quick pattern demo",
                "structure": "8× (a + forehead)",
            },
            {
                "file": "vowels_sequence_sound_locus.mp3",
                "use": "Guided pass nights 1–8",
                "structure": "each: clip → 0.7s → locus → 5.0s gap",
            },
            {
                "file": "consonants_sequence_sound_locus.mp3",
                "use": "Guided pass nights 9–14",
                "structure": "each: clip → 0.7s → locus → 5.0s gap",
            },
        ],
        "items": [
            {
                "night": n,
                "iast": i,
                "ogg": o,
                "locus_en": e,
                "locus_key": k,
                "clip": str(phon_file(i, o)),
                "locus_wav": str(LOCI / f"{k}.wav"),
            }
            for n, i, o, e, k in PLAN
        ],
    }
    (TRACKS / "playlist.json").write_text(json.dumps(playlist, indent=2), encoding="utf-8")
    print("playlist.json written")
    print("Tracks in", TRACKS)
    for p in sorted(TRACKS.glob("*.mp3")):
        print(f"  {p.name:42s} {p.stat().st_size // 1024:5d} KB  {dur(p)}s")


if __name__ == "__main__":
    main()
