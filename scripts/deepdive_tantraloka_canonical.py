#!/usr/bin/env python3
"""Tantrāloka canonical deepdive — build corpus index + extracts from volume."""
from __future__ import annotations

import json
import re
from pathlib import Path

VOL = Path("/mnt/HC_Volume_106959365/root/projects/source-library/tantra")
TA = VOL / "abhinavagupta"
CLEAN = VOL / "texts-clean"
ROOT = Path("/root/deitybody")
CANON = ROOT / "corpus" / "canonical"
CANON.mkdir(parents=True, exist_ok=True)

# --- inventory ---
ahnika_files = sorted(TA.glob("ahnika-*.txt"))
vol_files = sorted(TA.glob("tantraloka-vol*-dyczkowski.txt"))
clean_vols = sorted(CLEAN.glob("tantraloka-vol*-clean.txt"))

# parse ahnika headers for TOC
ahnika_index = []
for f in ahnika_files:
    text = f.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()[:15]
    title = ""
    for ln in lines:
        if ln.strip() and not ln.startswith("=") and not ln.startswith("-"):
            title = ln.strip()
            break
    ahnika_index.append({
        "file": f.name,
        "path": str(f),
        "lines": text.count("\n") + 1,
        "bytes": f.stat().st_size,
        "title_hint": title[:100],
    })

vol_index = []
for f in vol_files + clean_vols:
    vol_index.append({
        "file": f.name,
        "path": str(f),
        "bytes": f.stat().st_size,
        "lines": f.read_text(encoding="utf-8", errors="replace").count("\n") + 1,
    })

complete = TA / "tantraloka-complete.txt"
gretil = TA / "gretil_tantraloka.txt"

# --- practice-relevant loci from ahnika-02 contents map ---
# Read ahnika-02 contents section for chapter map
a2 = (TA / "ahnika-02.txt").read_text(encoding="utf-8", errors="replace")
# pull lines that look like contents entries with verses/pages
toc_lines = []
for ln in a2.splitlines():
    if re.search(r"verses?\s+\d|pages?\s+\d|Āhnika|Chapter|Mālinī|Śabda|Mātṛkā|nyāsa|samāveśa|varṇa", ln, re.I):
        if len(ln.strip()) > 15 and len(ln) < 200:
            toc_lines.append(ln.strip())

# ahnika-04 TĀ 4.91 full verse context
a4 = (TA / "ahnika-04.txt").read_text(encoding="utf-8", errors="replace")
ta491_context = ""
idx = a4.find("prāṇāyāmo na kartavyaḥ")
if idx >= 0:
    ta491_context = a4[max(0, idx - 400): idx + 400]

# ahnika-15 nyasa appendix headings
a15 = (TA / "ahnika-15.txt").read_text(encoding="utf-8", errors="replace")
nyasa_headings = []
for ln in a15.splitlines():
    if re.search(r"Deposition|Mātṛkānyāsa|Mālinīnyāsa|Śabdarāśi|karanyāsa|aṅganyāsa|Comparative Chart", ln):
        if 10 < len(ln) < 120:
            nyasa_headings.append(ln.strip())

# PTv TOC for Mālinī/madhyama
ptv_txt = ROOT / "corpus" / "primary" / "paratrisika_jaideva_singh_djvu.txt"
ptv_hits = []
if ptv_txt.exists():
    for i, ln in enumerate(ptv_txt.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
        if re.search(r"Matrka|Mātṛkā|Malini|Mālinī|madhyam|phoneme|arrangement of letters", ln, re.I):
            if 20 < len(ln) < 180:
                ptv_hits.append({"line": i, "text": ln.strip()[:160]})
        if len(ptv_hits) >= 40:
            break

index = {
    "id": "tantraloka-volume-canonical-v0",
    "canonical_decision": "Tantrāloka (volume Dyczkowski corpus) is CANONICAL for deitybody practice. MV remains root scripture for Mālinī content that Abhinavagupta unfolds. PTv = Abhinavagupta on madhyamā / Mālinī letters. VBT = selected techniques.",
    "volume_root": str(VOL),
    "complete_text": {
        "path": str(complete),
        "bytes": complete.stat().st_size if complete.exists() else 0,
        "lines": complete.read_text(encoding="utf-8", errors="replace").count("\n") + 1 if complete.exists() else 0,
    },
    "gretil": {"path": str(gretil), "bytes": gretil.stat().st_size if gretil.exists() else 0},
    "ahnika_files": ahnika_index,
    "volumes": vol_index,
    "practice_loci": [
        {"ref": "TĀ contents ch.3", "topic": "Śabdarāśi / Mātṛkā / Mālinī; Mālinī as Parā; alphabet of 50 forms", "where": "ahnika-02.txt contents"},
        {"ref": "TĀ 4.91", "topic": "prāṇāyāma must not torment the body", "where": "ahnika-04.txt ~7333"},
        {"ref": "TĀ 15/115cd-145", "topic": "Three nyāsas: Mātṛkā · Mālinī · śabdarāśi", "where": "ahnika-15.txt appendix A"},
        {"ref": "TĀ 15/117-120", "topic": "Karanyāsa + aṅganyāsa formulas", "where": "ahnika-15.txt appendix A"},
        {"ref": "TĀ 15/121-125ab", "topic": "Mālinī alphabet order (from MV 3/37-41)", "where": "ahnika-15.txt appendix B"},
        {"ref": "TĀ 15/128cd-130ab", "topic": "Mālinī tattva distribution", "where": "ahnika-15.txt appendix B"},
        {"ref": "TĀ 15/130cd-133ab", "topic": "Śabdarāśinyāsa", "where": "ahnika-15.txt appendix C"},
        {"ref": "PTv", "topic": "Mālinī at madhyamā-vāc; letters as powers", "where": "corpus/primary/paratrisika_jaideva_singh*"},
        {"ref": "MV 3.36-41", "topic": "Bhinna-yoni nyāsa for śākta-śarīra + body map", "where": "extract MV_CH3_MALINI.md + volume apparatus"},
    ],
    "ahinka_toc_sample": toc_lines[:80],
    "ta491_context": ta491_context,
    "nyasa_headings": nyasa_headings[:40],
    "ptv_hits": ptv_hits,
}

(CANON / "volume_index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
print("volume_index.json", (CANON / "volume_index.json").stat().st_size)

# --- master canonical extract markdown ---
md = f"""# CANONICAL — Tantrāloka (volume corpus)

> **Decision:** Tantrāloka is the canonical practice spine for deitybody.
> MV remains the **root scripture** whose Mālinī content Abhinavagupta unfolds.
> PTv = Abhinavagupta on madhyamā / Mālinī letters.
> VBT = selected techniques only.
> Built: 2026-10-04 from `/mnt/HC_Volume_106959365/.../source-library/tantra/`

---

## Volume inventory

| Asset | Path | Scale |
|-------|------|-------|
| Complete text | `{complete}` | {index['complete_text']['lines']} lines · {index['complete_text']['bytes']//1024} KB |
| GRETIL | `{gretil}` | {index['gretil']['bytes']//1024} KB |
| Āhnika files | `{TA}/ahnika-*.txt` | **{len(ahnika_files)} files** |
| Dyczkowski vols | `{TA}/tantraloka-vol*-dyczkowski.txt` | {len(vol_files)} vols |
| Clean vols | `{CLEAN}/tantraloka-vol*-clean.txt` | {len(clean_vols)} vols |

Machine index: `corpus/canonical/volume_index.json`

---

## Canonical hierarchy (locked)

```text
MĀLINĪVIJAYOTTARATANTRA (root — Mālinī order + nyāsa + body map)
        ↓ unfolds as
TANTRĀLOKA (CANONICAL practice spine — Abhinavagupta)
        ↓ digests
TANTRASĀRA (ch.5 āṇava method)
        ↓ comments on
PARĀTRĪŚIKĀVIVARAÑA (madhyamā · Mālinī letters as powers)
        ↓ technique catalog
VIJÑĀNABHAIRAVA (selected dhāraṇās only)
```

**For deitybody practice:** install phonemes using **TĀ 15 maps** (Mātṛkā limb + Mālinī order) as encoded in `data/matrika_body_map.json` and `data/malini_order.json`. Breath policy from **TĀ 4.91**. Interpretive frame from Flood + PTv. Goswami = tool only.

---

## Practice-relevant TĀ loci (volume-verified)

| Ref | Topic | Volume file |
|-----|-------|-------------|
| TĀ contents ch.3 | Śabdarāśi / Mātṛkā / Mālinī; Mālinī as Parā; 50 forms of reflective awareness | ahnika-02.txt |
| TĀ 4.91 | prāṇāyāma must not torment the body | ahnika-04.txt ~7333 |
| TĀ 15/115cd–145 | Three nyāsas | ahnika-15.txt appendix A |
| TĀ 15/117–120 | Karanyāsa + aṅganyāsa | ahnika-15.txt appendix A |
| TĀ 15/121–125ab | Mālinī order from MV | ahnika-15.txt appendix B |
| TĀ 15/130cd–133ab | Śabdarāśinyāsa | ahnika-15.txt appendix C |

### TĀ 4.91 (volume context)

```
{ta491_context.strip()[:500] if ta491_context else 'see ahnika-15/ahinka-04 on volume'}
```

### TĀ 15 nyāsa headings found on volume

"""
for h in nyasa_headings[:25]:
    md += f"- {h}\n"

md += f"""

### TĀ ch.3 contents sample (sound metaphysics map)

"""
for h in toc_lines[:40]:
    md += f"- {h}\n"

md += f"""

### PTv — Mālinī / letters (local Jaideva Singh OCR)

"""
for hit in ptv_hits[:20]:
    md += f"- L{hit['line']}: {hit['text']}\n"

md += f"""

---

## How this locks practice

| Practice element | Canonical source on volume |
|------------------|---------------------------|
| Which map to install | TĀ 15 — Mātṛkā first, then Mālinī, then śabdarāśi |
| Mālinī order | TĀ 15/121–125 ← MV 3/37–41 |
| Mātṛkā body | TĀ 15 appendix A aṅganyāsa / tattvamudrā |
| Breath safety | TĀ 4.91 |
| Why phonemes are body-text | TĀ 3 contents: Śabdarāśi / 50 forms; PTv madhyamā |
| Night audio / maps | encoded from these maps in deitybody data |

---

## Next deepdive extracts (pending)

1. Running English of TĀ 3.198–199 (browser / Wisdom Library) → paste into `TA_KEY_LOCI.md`
2. Clean vol excerpts for Āhnika 3, 5, 15 practice sections
3. PTv pp. 148–156 madhyamā-vāc passage from Singh PDF
4. Cross-check Mālinī yoginī names: Triśirobhairava via ahnika-15 appendix B

---

## Related extracts

- `corpus/extracts/TA15_NYASA.md`
- `corpus/extracts/TA_KEY_LOCI.md`
- `corpus/extracts/MV_CH3_MALINI.md`
- `corpus/extracts/FLOOD_TANTRIC_BODY.md`
- `corpus/extracts/MALINI_VARIATIONS.md`
- `docs/PATHWAY.md` · `data/architecture.json`
"""
(CANON / "TANTRALOKA_CANONICAL.md").write_text(md, encoding="utf-8")
print("TANTRALOKA_CANONICAL.md", (CANON / "TANTRALOKA_CANONICAL.md").stat().st_size)

# also copy ahinka index compact to public for sanskrithelp later
(ROOT / "corpus" / "canonical" / "AHNIKA_INDEX.md").write_text(
    "# Āhnika index (volume)\n\n| File | Lines | Title hint |\n|------|------:|------------|\n"
    + "\n".join(f"| `{a['file']}` | {a['lines']} | {a['title_hint']} |" for a in ahnika_index)
    + "\n",
    encoding="utf-8",
)
print("AHNIKA_INDEX.md ok")

# architecture update
arch_path = ROOT / "data" / "architecture.json"
arch = json.loads(arch_path.read_text(encoding="utf-8"))
arch["canonical"] = {
    "decision": "Tantrāloka (volume Dyczkowski corpus) = CANONICAL practice spine",
    "root_scripture": "Mālinīvijayottaratantra — content Abhinavagupta unfolds",
    "commentary": "Parātrīśikāvivaraṇa — madhyamā / Mālinī letters",
    "digest": "Tantrasāra ch.5 āṇava",
    "techniques": "Vijñānabhairava selected dhāraṇās only",
    "volume_root": str(VOL),
    "canonical_extract": "corpus/canonical/TANTRALOKA_CANONICAL.md",
    "volume_index": "corpus/canonical/volume_index.json",
    "encoded_maps": ["data/matrika_body_map.json", "data/malini_order.json"],
    "breath_policy_ref": "TĀ 4.91",
}
# update textual spine first entry note
if arch.get("textual_spine"):
    for t in arch["textual_spine"]:
        if "Tantrāloka" in t.get("text", "") or "Tantraloka" in t.get("text", ""):
            t["canonical"] = True
            t["role"] = "CANONICAL practice spine — volume Dyczkowski corpus on attached disk"
arch_path.write_text(json.dumps(arch, ensure_ascii=False, indent=2), encoding="utf-8")
print("architecture canonical locked")

print("ahnika", len(ahnika_files), "vols", len(vol_files), "clean", len(clean_vols))
print("toc sample", len(toc_lines), "nyasa heads", len(nyasa_headings), "ptv hits", len(ptv_hits))
