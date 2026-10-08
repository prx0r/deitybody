#!/usr/bin/env python3
"""Guided Night 1 circuit audio — full practice, not a 24x loop.

Structure follows practice/NIGHT1_A_AA.md:
  frame → breath → phonetics → hear/touch/say → feel without touch
  → internal → glyph → aham → close

Pattern per practice step:
  instruction (TTS) → phoneme clip → timed pause for YOU → next
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
TMP = AUDIO / "_tmp" / "guided_n1_v2"
OUT = TRACKS / "night1_guided_circuit_v2.mp3"

# ensure sources
for d in (TRACKS, PHON, LOCI, TMP):
    d.mkdir(parents=True, exist_ok=True)


def run(cmd: list[str]) -> None:
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"{' '.join(map(str, cmd))}\n{r.stderr[-400:]}")


def ensure_parent(p: Path) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)


def silence(sec: float, out: Path) -> None:
    ensure_parent(out)
    run(
        [
            "ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
            "-t", str(sec), "-c:a", "libmp3lame", "-q:a", "4", str(out),
        ]
    )


def tts(text: str, out: Path, rate: int = 135) -> Path:
    """RyanNeural (Edge, en-GB) instead of espeak. rate arg kept for signature."""
    import asyncio
    import edge_tts
    ensure_parent(out)
    out = out.with_suffix(".mp3")
    if out.exists() and out.stat().st_size > 2000:
        return out
    asyncio.run(edge_tts.Communicate(text, "en-GB-RyanNeural", rate="-10%").save(str(out)))
    return out


def clip(ogg_name: str, out: Path) -> Path:
    src = SRC / ogg_name
    ensure_parent(out)
    run(
        [
            "ffmpeg", "-y", "-i", str(src), "-ar", "44100", "-ac", "1",
            "-c:a", "libmp3lame", "-q:a", "4", str(out),
        ]
    )
    return out


def concat(files: list[Path], out: Path) -> None:
    ensure_parent(out)
    lst = out.parent / "list.txt"
    lst.write_text("\n".join(f"file '{f}'" for f in files) + "\n", encoding="utf-8")
    run(
        [
            "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
            "-c:a", "libmp3lame", "-q:a", "4", str(out),
        ]
    )


def dur(path: Path) -> str:
    return subprocess.check_output(
        [
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=nw=1:nk=1", str(path),
        ],
        text=True,
    ).strip()


def main() -> None:
    parts: list[Path] = []
    n = 0

    def add_silence(sec: float) -> None:
        nonlocal n
        n += 1
        p = TMP / f"s{n:03d}.mp3"
        silence(sec, p)
        parts.append(p)

    def add_tts(text: str, rate: int = 135) -> None:
        nonlocal n
        n += 1
        p = TMP / f"t{n:03d}.mp3"
        tts(text, p, rate=rate)
        parts.append(p)

    def add_clip(ogg: str) -> None:
        nonlocal n
        n += 1
        p = TMP / f"c{n:03d}.mp3"
        clip(ogg, p)
        parts.append(p)

    print("Building guided Night 1 circuit…")

    # ── INTRO ──────────────────────────────────────────────
    add_silence(2.0)
    add_tts("Night one. Sanskrit phoneme practice.")
    add_tts("Pair: a and long a.")
    add_tts("Sit comfortably. Spine long. Jaw soft.")
    add_silence(2.0)
    add_tts("Nyasa means installing sound on the body. Not anatomy.")
    add_tts("Mouth decides how it sounds. Locus decides where it is installed.")
    add_tts("If short a stretches into long a, pull it back. That is the skill.")
    add_silence(2.0)

    # ── BREATH ─────────────────────────────────────────────
    add_tts("Step one. Breath.")
    add_tts("Natural breath only. No forced holds.")
    add_tts("Five easy breaths. I will count.")
    add_tts("In.")
    add_silence(3.0)
    add_tts("Out.")
    add_silence(4.0)
    add_tts("In.")
    add_silence(3.0)
    add_tts("Out.")
    add_silence(4.0)
    add_tts("In.")
    add_silence(3.0)
    add_tts("Out.")
    add_silence(4.0)
    add_tts("In.")
    add_silence(3.0)
    add_tts("Out.")
    add_silence(4.0)
    add_tts("In.")
    add_silence(3.0)
    add_tts("Out.")
    add_silence(5.0)
    add_tts("Good. Attention on mouth and breath now.")

    # ── PHONETICS ──────────────────────────────────────────
    add_tts("Step two. Phonetics only.")
    add_tts("No touching yet. Just the mouth.")
    add_tts("Listen.")
    add_clip("a.ogg")
    add_silence(2.0)
    add_tts("That is short a. One beat.")
    add_tts("Listen to long a.")
    add_clip("aa.ogg")
    add_silence(2.0)
    add_tts("Same open mouth. Held longer. Two beats.")
    add_tts("Now say short a three times.")
    add_silence(1.0)
    add_clip("a.ogg")
    add_silence(4.0)
    add_clip("a.ogg")
    add_silence(4.0)
    add_clip("a.ogg")
    add_silence(5.0)
    add_tts("Now say long a three times.")
    add_silence(1.0)
    add_clip("aa.ogg")
    add_silence(5.0)
    add_clip("aa.ogg")
    add_silence(5.0)
    add_clip("aa.ogg")
    add_silence(5.0)
    add_tts("Short. Long. Same sound. Different length.")

    # ── HEAR / TOUCH / SAY ─────────────────────────────────
    add_tts("Step three. Hear. Touch. Say.")
    add_tts("Touch your forehead lightly.")
    add_tts("Listen to short a.")
    add_clip("a.ogg")
    add_tts("Now say a while touching forehead.")
    add_silence(6.0)
    add_tts("Again.")
    add_clip("a.ogg")
    add_silence(6.0)
    add_tts("One more time.")
    add_clip("a.ogg")
    add_silence(6.0)
    add_tts("Now touch mouth or face.")
    add_tts("Listen to long a.")
    add_clip("aa.ogg")
    add_tts("Say long a while touching mouth.")
    add_silence(7.0)
    add_tts("Again.")
    add_clip("aa.ogg")
    add_silence(7.0)
    add_tts("One more.")
    add_clip("aa.ogg")
    add_silence(7.0)
    add_tts("Alternate once. Forehead, then mouth.")
    add_clip("a.ogg")
    add_tts("Forehead. Say a.")
    add_silence(5.0)
    add_clip("aa.ogg")
    add_tts("Mouth. Say long a.")
    add_silence(6.0)

    # ── FEEL WITHOUT TOUCH ─────────────────────────────────
    add_tts("Step four. No touching.")
    add_tts("Say a. Let forehead become obvious.")
    add_clip("a.ogg")
    add_silence(6.0)
    add_tts("Say long a. Let mouth become obvious.")
    add_clip("aa.ogg")
    add_silence(6.0)
    add_tts("Again. Short a.")
    add_clip("a.ogg")
    add_silence(5.0)
    add_tts("Long a.")
    add_clip("aa.ogg")
    add_silence(5.0)

    # ── INTERNAL ───────────────────────────────────────────
    add_tts("Step five. Eyes soft. Internal only.")
    add_tts("Think short a. Forehead lights. No mouth movement.")
    add_silence(7.0)
    add_tts("Think long a. Mouth and face lights.")
    add_silence(7.0)
    add_tts("Think short a again.")
    add_silence(6.0)
    add_tts("Think long a.")
    add_silence(6.0)

    # ── GLYPH ──────────────────────────────────────────────
    add_tts("Step six. Glyph, if the last step was stable.")
    add_tts("See the Devanagari letter A, while you say short a. Forehead.")
    add_clip("a.ogg")
    add_silence(7.0)
    add_tts("See the long A letter, while you say long a. Mouth.")
    add_clip("aa.ogg")
    add_silence(7.0)
    add_tts("One more each. Letter, sound, locus together.")
    add_clip("a.ogg")
    add_silence(6.0)
    add_clip("aa.ogg")
    add_silence(6.0)

    # ── AHAM ───────────────────────────────────────────────
    add_tts("Step seven. Aham contraction.")
    add_tts("Stop chanting. Natural breath.")
    add_silence(3.0)
    add_tts("A. Forehead. Emergence.")
    add_silence(4.0)
    add_tts("Ha. Terminal edge.")
    add_silence(4.0)
    add_tts("M. Bindu. Crown.")
    add_silence(4.0)
    add_tts("Let the field contract to the sense of I.")
    add_tts("Rest. No forcing.")
    add_silence(20.0)
    add_tts("If it rises, let the field expand once. Then stop.")

    # ── CLOSE ──────────────────────────────────────────────
    add_tts("Step eight. Close.")
    add_tts("One line log. Pair a and long a. Was each locus clear?")
    add_tts("Any tension? End of night one.")
    add_silence(3.0)

    print(f"  parts: {len(parts)}")
    concat(parts, OUT)
    print(f"  {OUT}")
    print(f"  {OUT.stat().st_size // 1024} KB  {dur(OUT)}s")

    # shorter companion: pure guided loop for tomorrow-style use (~8 min)
    # not required now — primary is full circuit


if __name__ == "__main__":
    main()
