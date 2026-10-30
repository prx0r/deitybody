#!/usr/bin/env python3
"""build_stotra_scores.py — kashaudio chant renders -> lab scores.

Source (read-only, separate repo — plug, never merge): /root/kashaudio
  word_timings.json per clip: MMS-aligned word windows + `syls` (matra-
  weighted syllable onsets from regen_syls.py — their rhythm law).

Output per clip:
  site/audio/stotra/<id>.ogg              (wav -> mono ogg q4)
  site/frameworks/trika/practices/stotra/<id>.json
     {audio, events: [audio@0, flash per syllable onset (+ pada cue)]}
  site/data/stotras.json                  (menu manifest)

ASSEMBLY rule (labeled in every score): flash node = the syllable's ONSET
phoneme (consonant cluster head, else nucleus vowel) — the same syllable→node
convention as site/data/mantras.json. Never presented as attested nyāsa.

  python3 scripts/build_stotra_scores.py [--dry-run] [--work NAME]
"""
import json
import os
import subprocess
import sys
from pathlib import Path

KASH = Path(os.environ.get("KASHAUDIO", "/root/kashaudio"))
ROOT = Path(__file__).resolve().parent.parent
AUDIO_OUT = ROOT / "site/audio/stotra"
SCORE_OUT = ROOT / "site/frameworks/trika/practices/stotra"
MANIFEST = ROOT / "site/data/stotras.json"

WORKS = [
    # (folder, menu title, label prefix, provenance line)
    ("bhairavastava", "Bhairavastava — AI chant (10 verses)", "bv",
     "kashaudio Bhairavastava AI render; syllable onsets = MMS + matra law (kashaudio PROCESS.md)"),
    ("anuttarashtika", "Anuttarāṣṭikā — AI chant (8 verses)", "an",
     "kashaudio Anuttarāṣṭikā AI render; syllable onsets = MMS + matra law (kashaudio PROCESS.md)"),
    ("anuttarashtika_trad", "Anuttarāṣṭikā — traditional recitation (8)", "ant",
     "kashaudio traditional recitation, segment+MMS aligned; syllable onsets = matra law"),
]

BASE = {"क": "ka", "ख": "kha", "ग": "ga", "घ": "gha", "ङ": "ṅa",
        "च": "ca", "छ": "cha", "ज": "ja", "झ": "jha", "ञ": "ña",
        "ट": "ṭa", "ठ": "ṭha", "ड": "ḍa", "ढ": "ḍha", "ण": "ṇa",
        "त": "ta", "थ": "tha", "द": "da", "ध": "dha", "न": "na",
        "प": "pa", "फ": "pha", "ब": "ba", "भ": "bha", "म": "ma",
        "य": "ya", "र": "ra", "ल": "la", "व": "va", "श": "śa",
        "ष": "ṣa", "स": "sa", "ह": "ha", "ळ": "la",
        "अ": "a", "आ": "ā", "इ": "i", "ई": "ī", "उ": "u", "ऊ": "ū",
        "ऋ": "ṛ", "ॠ": "ṝ", "ऌ": "ḷ", "ए": "e", "ऐ": "ai",
        "ओ": "o", "औ": "au"}


def matrika_nodes():
    m = json.loads((ROOT / "data/matrika_body_map.json").read_text())
    ids = [v["iast"] for v in m["vowels"]]
    for v in m["vargas"]:
        ids += [s["iast"] for s in v["sequence"]]
    return set(ids)


def node_of(dev: str, valid: set):
    d = (dev or "").strip()
    if d.startswith("क्ष"):
        return "kṣa" if "kṣa" in valid else None
    for ch in d:
        if ch in BASE:
            n = BASE[ch]
            return n if n in valid else None
        if ch in "ऽ॰।॥्ोौैेैीीांः":  # matras / marks: keep scanning for a base
            continue
        # unknown script char: stop scanning this syllable
        break
    return None


def ensure_ogg(wav: Path, cid: str) -> Path:
    ogg = AUDIO_OUT / f"{cid}.ogg"
    if ogg.exists() and ogg.stat().st_mtime >= wav.stat().st_mtime:
        return ogg
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(wav),
                    "-codec:a", "libvorbis", "-q:a", "4", "-ac", "1",
                    str(ogg)], check=True)
    return ogg


def build(work, title, prefix, prov, dry, valid):
    folder = KASH / work
    wt = json.loads((folder / "word_timings.json").read_text(encoding="utf-8"))
    # IAST word per (clip, pada) for pada-cues: first word of each pada
    menu = []
    skipped = 0
    import re as _re
    for clip in wt:
        cid = clip["id"]
        if work.endswith("_trad"):
            # trad folder reuses AI clip ids (anuttara_01…) — namespace them
            cid = "ant_" + cid.split("_")[-1]
        wav = folder / f'{clip["id"]}.wav' if work.endswith("_trad") else folder / f"{cid}.wav"
        if not wav.is_file():
            print(f"  MISSING wav {wav}")
            continue
        # pada cue: first word romanization per pada index
        pad_first = {}
        for w in clip.get("words", []):
            pad_first.setdefault(w["pada"], w.get("r") or w.get("w", ""))
        events = [{"t": 0.0, "do": "audio", "url": f"audio/stotra/{cid}.ogg"}]
        prev_pada = None
        for s in clip.get("syls", []):
            node = node_of(s.get("d", ""), valid)
            if not node:
                skipped += 1
                continue
            ev = {"t": round(float(s["t_on"]), 3), "do": "flash", "node": node}
            if s["pada"] != prev_pada:
                ev["cue"] = pad_first.get(s["pada"], "")[:40]
                prev_pada = s["pada"]
            events.append(ev)
        events.sort(key=lambda e: e["t"])
        score = {
            "id": cid,
            "title": f"{title.split(' — ')[0]} · {cid.split('_')[-1]}",
            "provenance": prov + "; syllable→node = onset phoneme (ASSEMBLY, "
                          "same convention as data/mantras.json)",
            "classification": {"kind": "stotra-recitation", "status": "assembly"},
            "dur": clip.get("dur"),
            "audio": f"audio/stotra/{cid}.ogg",
            "events": events,
        }
        _m = _re.search(r"_(\d+)(?:_(\w+))?$", cid)
        label_n = (_m.group(1) + ("-" + _m.group(2) if _m.group(2) else "")) if _m else cid
        menu.append({"label": f"v{label_n}", "score": f"frameworks/trika/practices/stotra/{cid}.json"})
        if dry:
            print(f"  [dry] {cid}: {len(events)} events, "
                  f"{sum(1 for e in events if e['do']=='flash')} flashes")
            continue
        ensure_ogg(wav, cid)
        SCORE_OUT.mkdir(parents=True, exist_ok=True)
        (SCORE_OUT / f"{cid}.json").write_text(
            json.dumps(score, ensure_ascii=False, indent=1))
    return menu, skipped


def main():
    dry = "--dry-run" in sys.argv
    only = None
    if "--work" in sys.argv:
        only = sys.argv[sys.argv.index("--work") + 1]
    valid = matrika_nodes()
    if not dry:
        AUDIO_OUT.mkdir(parents=True, exist_ok=True)
        SCORE_OUT.mkdir(parents=True, exist_ok=True)
    works_out = []
    total_skip = 0
    for work, title, prefix, prov in WORKS:
        if only and work != only:
            continue
        print(f"== {work}")
        menu, skipped = build(work, title, prefix, prov, dry, valid)
        total_skip += skipped
        print(f"  {len(menu)} verses, skipped flashes: {skipped}")
        works_out.append({"title": title, "provenance": prov, "verses": menu})
    print(f"TOTAL skipped (no node mapping): {total_skip}")
    if dry:
        return
    MANIFEST.write_text(json.dumps({
        "id": "stotras-v1",
        "note": "Chant audio from prx0r/kashaudio (read-only plug). ASSEMBLY: "
                "flash node = syllable onset phoneme; lights follow the "
                "recitation — never presented as attested nyāsa placement.",
        "works": works_out,
    }, ensure_ascii=False, indent=1))
    print(f"wrote {MANIFEST}")


if __name__ == "__main__":
    main()
