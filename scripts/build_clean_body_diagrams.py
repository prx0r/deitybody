#!/usr/bin/env python3
"""Static, readable phoneme body diagrams — no mermaid, no CDN, large type."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path("/root/deitybody")
m = json.loads((ROOT / "data/matrika_body_map.json").read_text(encoding="utf-8"))
mal = json.loads((ROOT / "data/malini_order.json").read_text(encoding="utf-8"))

# Precomputed readable positions (subject-right = viewer-left)
# Mātṛkā
MAT = [
    # head vowels — larger spread for readability
    ("aṃ", "अं", "crown", 210, 48),
    ("a", "अ", "forehead", 210, 72),
    ("ā", "आ", "mouth", 210, 98),
    ("i", "इ", "R eye", 175, 72),
    ("ī", "ई", "L eye", 245, 72),
    ("u", "उ", "R ear", 155, 68),
    ("ū", "ऊ", "L ear", 265, 68),
    ("ṛ", "ऋ", "R nostril", 175, 88),
    ("ṝ", "ॠ", "L nostril", 245, 88),
    ("ḷ", "ऌ", "R cheek", 150, 95),
    ("ḹ", "ॡ", "L cheek", 270, 95),
    ("e", "ए", "low teeth", 185, 112),
    ("ai", "ऐ", "up teeth", 235, 112),
    ("o", "ओ", "low lip", 185, 128),
    ("au", "औ", "up lip", 235, 128),
    ("aḥ", "अः", "tongue", 210, 140),
    # arms
    ("ka", "क", "R shoulder", 125, 160),
    ("kha", "ख", "R arm", 105, 205),
    ("ga", "ग", "R elbow", 95, 250),
    ("gha", "घ", "R wrist", 90, 295),
    ("ṅa", "ङ", "R fingers", 92, 330),
    ("ca", "च", "L shoulder", 295, 160),
    ("cha", "छ", "L arm", 315, 205),
    ("ja", "ज", "L elbow", 325, 250),
    ("jha", "झ", "L wrist", 330, 295),
    ("ña", "ञ", "L fingers", 328, 330),
    # torso
    ("pa", "प", "R side", 175, 160),
    ("pha", "फ", "L side", 245, 160),
    ("ba", "ब", "back", 210, 190),
    ("bha", "भ", "belly", 210, 220),
    ("ma", "म", "heart", 210, 250),
    # legs
    ("ṭa", "ट", "R buttock", 155, 340),
    ("ṭha", "ठ", "R thigh", 140, 400),
    ("ḍa", "ड", "R knee", 130, 460),
    ("ḍha", "ढ", "R shank", 125, 520),
    ("ṇa", "ण", "R toes", 130, 585),
    ("ta", "त", "L buttock", 265, 340),
    ("tha", "थ", "L thigh", 280, 400),
    ("da", "द", "L knee", 290, 460),
    ("dha", "ध", "L shank", 295, 520),
    ("na", "न", "L toes", 290, 585),
]
DEEP = [
    ("ya", "य", "skin", 40, 640),
    ("ra", "र", "blood", 110, 640),
    ("la", "ल", "flesh", 180, 640),
    ("va", "व", "sinews", 250, 640),
    ("śa", "श", "bone", 40, 670),
    ("ṣa", "ष", "marrow", 110, 670),
    ("sa", "स", "essence", 180, 670),
    ("ha", "ह", "prāṇa", 250, 670),
    ("kṣa", "क्ष", "generative", 330, 655),
]

# Mālinī (from mal body_map + stable loci)
MAL_ORDER = mal["order"]
MAL_BODY = mal["body_map"]
MAL_DEV = mal["devanagari"]
MAL_POS = {
    "na": (210, 42, "śikhā"),
    "ṛ": (190, 38, "headband"), "ṝ": (200, 38, "headband"),
    "ḷ": (220, 38, "headband"), "ḹ": (230, 38, "headband"),
    "tha": (210, 55, "top head"),
    "ca": (175, 72, "R eye"), "dha": (245, 72, "L eye"),
    "ī": (210, 88, "nose"),
    "ṇa": (155, 68, "ears"), "u": (150, 68, "ear R"), "ū": (270, 68, "ear L"),
    "ba": (210, 100, "mouth"),
    "ka": (180, 112, "teeth"), "kha": (192, 112, "teeth"),
    "ga": (204, 112, "teeth"), "gha": (216, 112, "teeth"), "ṅa": (228, 112, "teeth"),
    "i": (210, 122, "tongue"), "a": (210, 132, "speech"),
    "va": (210, 145, "throat"),
    "bha": (125, 160, "R shoulder"), "ya": (295, 160, "L shoulder"),
    "ḍa": (105, 205, "R arm"), "ḍha": (315, 205, "L arm"),
    "ṭha": (210, 185, "hands"),
    "jha": (92, 330, "R fingers"), "ña": (328, 330, "L fingers"),
    "ja": (80, 200, "trident"), "ra": (85, 240, "shaft"), "ṭa": (340, 200, "skull"),
    "pa": (210, 250, "heart"),
    "cha": (175, 185, "R chest"), "la": (245, 185, "L chest"),
    "ā": (210, 185, "milk"), "sa": (210, 200, "jīva"),
    "aḥ": (210, 210, "prāṇa"), "ha": (210, 220, "prāṇa"),
    "ṣa": (210, 235, "belly"), "kṣa": (210, 245, "navel"),
    "ma": (155, 340, "buttocks"), "śa": (210, 340, "guhya"),
    "aṃ": (265, 370, "R thigh"), "ta": (265, 400, "L thigh"),
    "e": (290, 460, "R knee"), "ai": (300, 460, "L knee"),
    "o": (295, 520, "R shank"), "au": (305, 520, "L shank"),
    "da": (290, 585, "R foot"), "pha": (305, 585, "L foot"),
}


def figure_svg() -> str:
    """Static body outline only."""
    return """
  <ellipse cx="210" cy="90" rx="38" ry="42" class="fig"/>
  <rect x="165" y="135" width="90" height="130" rx="22" class="fig"/>
  <path d="M165 155 L95 220 L88 340" class="limb"/>
  <path d="M255 155 L325 220 L332 340" class="limb"/>
  <path d="M185 265 L160 400 L145 530 L135 600" class="limb thick"/>
  <path d="M235 265 L260 400 L275 530 L285 600" class="limb thick"/>
  <circle cx="88" cy="345" r="10" class="fig"/>
  <circle cx="332" cy="345" r="10" class="fig"/>
  <circle cx="132" cy="610" r="11" class="fig"/>
  <circle cx="288" cy="610" r="11" class="fig"/>
"""


def label(x, y, dev, ia, loc, cls=""):
    # offset loc slightly so head labels don't collide
    return (
        f'<g class="lab {cls}">'
        f'<text x="{x}" y="{y}" text-anchor="middle" class="dev">{dev}</text>'
        f'<text x="{x}" y="{y+16}" text-anchor="middle" class="ia">{ia}</text>'
        f'<text x="{x}" y="{y+28}" text-anchor="middle" class="loc">{loc}</text>'
        f"</g>"
    )


def deep_band() -> str:
    parts = [
        '<g class="deep-band">',
        '<rect x="20" y="625" width="380" height="70" rx="10" class="panel"/>',
        '<text x="210" y="642" text-anchor="middle" class="zone">DEEP CONSTITUENTS</text>',
    ]
    for ia, dev, loc, x, y in DEEP:
        parts.append(label(x, y + 8, dev, ia, loc, "deep"))
    parts.append("</g>")
    return "\n".join(parts)


def matrika_svg() -> str:
    labs = [label(x, y, dev, ia, loc) for ia, dev, loc, x, y in MAT]
    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 720" class="diagram">
<style>
  .fig{{fill:#151a24;stroke:#c9a45c;stroke-width:2}}
  .limb{{fill:none;stroke:#c9a45c;stroke-width:10;stroke-linecap:round;opacity:.35}}
  .limb.thick{{stroke-width:12;opacity:.4}}
  .dev{{fill:#f0e6c8;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700}}
  .ia{{fill:#5ec4b6;font-family:ui-monospace,'Cascadia Code',Menlo,monospace;font-size:15px}}
  .loc{{fill:#c5c0b0;font-family:ui-sans-serif,system-ui,sans-serif;font-size:11px}}
  .zone{{fill:#c9a45c;font-family:ui-sans-serif,system-ui,sans-serif;font-size:12px;letter-spacing:.12em}}
  .panel{{fill:#12161f;stroke:#2a3142;stroke-width:1}}
  .title{{fill:#e8e6df;font-family:Georgia,serif;font-size:20px;font-weight:700}}
  .sub{{fill:#9aa3b5;font-family:ui-sans-serif,system-ui,sans-serif;font-size:12px}}
</style>
<rect width="420" height="720" fill="#0b0d12"/>
<text x="210" y="28" text-anchor="middle" class="title">MĀTṚKĀ — ordered alphabet on body</text>
<text x="210" y="46" text-anchor="middle" class="sub">TĀ 15 limb map · Night 1 = a + ā</text>
{figure_svg()}
{chr(10).join(labs)}
{deep_band()}
</svg>
"""


def malini_svg() -> str:
    labs = []
    for p in MAL_ORDER:
        if p not in MAL_POS:
            continue
        x, y, note = MAL_POS[p]
        dev = MAL_DEV.get(p, "")
        labs.append(label(x, y, dev, p, note, "mal"))
    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 720" class="diagram">
<style>
  .fig{{fill:#151a24;stroke:#7dcea0;stroke-width:2}}
  .limb{{fill:none;stroke:#7dcea0;stroke-width:10;stroke-linecap:round;opacity:.35}}
  .limb.thick{{stroke-width:12;opacity:.4}}
  .dev{{fill:#f0e6c8;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700}}
  .ia{{fill:#7dcea0;font-family:ui-monospace,'Cascadia Code',Menlo,monospace;font-size:15px}}
  .loc{{fill:#c5c0b0;font-family:ui-sans-serif,system-ui,sans-serif;font-size:11px}}
  .zone{{fill:#7dcea0;font-family:ui-sans-serif,system-ui,sans-serif;font-size:12px;letter-spacing:.12em}}
  .title{{fill:#e8e6df;font-family:Georgia,serif;font-size:20px;font-weight:700}}
  .sub{{fill:#9aa3b5;font-family:ui-sans-serif,system-ui,sans-serif;font-size:12px}}
</style>
<rect width="420" height="720" fill="#0b0d12"/>
<text x="210" y="28" text-anchor="middle" class="title">MĀLINĪ — bhinna-yoni na → pha</text>
<text x="210" y="46" text-anchor="middle" class="sub">MV 3.37–41 · after Mātṛkā is stable</text>
{figure_svg()}
{chr(10).join(labs)}
</svg>
"""


def table_matrika() -> str:
    rows = [
        "<table><thead><tr><th>IAST</th><th>Glyph</th><th>Locus</th></tr></thead><tbody>"
    ]
    for ia, dev, loc, x, y in MAT:
        rows.append(
            f'<tr><td class="ia">{ia}</td><td class="dev">{dev}</td><td>{loc}</td></tr>'
        )
    rows.append("</tbody></table>")
    return "\n".join(rows)


def table_malini() -> str:
    rows = [
        "<table><thead><tr><th>#</th><th>IAST</th><th>Glyph</th><th>Locus</th></tr></thead><tbody>"
    ]
    for i, p in enumerate(MAL_ORDER, 1):
        rows.append(
            f'<tr><td>{i}</td><td class="ia">{p}</td>'
            f'<td class="dev">{MAL_DEV.get(p,"")}</td>'
            f'<td>{MAL_BODY.get(p,"")}</td></tr>'
        )
    rows.append("</tbody></table>")
    return "\n".join(rows)


def conflict_table() -> str:
    return """
<table class="conflict">
<thead><tr><th>Phoneme</th><th>Mātṛkā limb</th><th>Mālinī MV 3.37–41</th></tr></thead>
<tbody>
<tr><td class="ia">ka</td><td>right shoulder</td><td><strong>teeth</strong></td></tr>
<tr><td class="ia">ta</td><td>left lower limb</td><td>left thigh cluster</td></tr>
<tr><td class="ia">pa</td><td>right diaphragm</td><td><strong>heart</strong></td></tr>
<tr><td class="ia">ma</td><td><strong>heart</strong></td><td>buttocks</td></tr>
<tr><td class="ia">e</td><td>lower teeth</td><td>right knee</td></tr>
<tr><td class="ia">na</td><td>left toes</td><td>śikhā / crown</td></tr>
</tbody>
</table>
"""


html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Phoneme Body Diagrams — Mātṛkā &amp; Mālinī</title>
<style>
:root {{
  --bg: #0b0d12; --panel: #12161f; --ink: #f0ebe0; --mut: #a8a294;
  --gold: #c9a45c; --teal: #5ec4b6; --green: #7dcea0; --line: #2a3142;
  --rose: #d4899a;
}}
* {{ box-sizing: border-box; }}
body {{
  margin: 0; background: var(--bg); color: var(--ink);
  font: 17px/1.6 Georgia, 'Times New Roman', serif;
}}
a {{ color: var(--teal); }}
header {{
  max-width: 980px; margin: 0 auto; padding: 1.2rem 1rem .8rem;
  border-bottom: 1px solid var(--line);
  display: flex; gap: 14px; align-items: center;
}}
header img {{ width: 52px; height: 52px; }}
h1 {{ font-size: clamp(1.4rem, 4vw, 1.9rem); margin: 0; font-weight: 700; }}
header p {{ margin: .25rem 0 0; color: var(--mut); font-size: 1rem; }}
main {{ max-width: 980px; margin: 0 auto; padding: 1rem 1rem 4rem; }}
.nav {{ margin-top: .7rem; font-family: ui-sans-serif, system-ui, sans-serif; font-size: .95rem; }}
.nav a {{ margin-right: 1rem; }}
.tabs {{
  display: flex; flex-wrap: wrap; gap: .5rem; margin: 1.2rem 0;
  position: sticky; top: 0; z-index: 5;
  background: var(--bg); padding: .6rem 0;
  border-bottom: 1px solid var(--line);
}}
.tabs button, .tabs a {{
  font-family: ui-sans-serif, system-ui, sans-serif; font-size: 1rem;
  padding: .65rem 1.1rem; border-radius: 10px; border: 1px solid var(--line);
  background: var(--panel); color: var(--ink); cursor: pointer; text-decoration: none;
  min-height: 44px;
}}
.tabs button.on {{
  border-color: var(--gold); color: #0b0d12; background: var(--gold); font-weight: 700;
}}
.panel {{ display: none; }}
.panel.on {{ display: block; }}
.card {{
  background: var(--panel); border: 1px solid var(--line);
  border-radius: 14px; padding: 1rem; margin: 1rem 0;
}}
.card h2 {{
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 1rem; letter-spacing: .08em; text-transform: uppercase;
  color: var(--gold); margin: 0 0 .8rem;
}}
.rec {{
  border: 2px solid var(--green); background: rgba(125,206,160,.08);
  border-radius: 14px; padding: 1rem 1.2rem; margin: 1rem 0;
}}
.rec h2 {{ color: var(--green); }}
.rec p {{ margin: .45rem 0; }}
.warn {{
  border-left: 4px solid var(--rose); background: rgba(212,137,154,.1);
  padding: .8rem 1rem; border-radius: 0 10px 10px 0; margin: 1rem 0;
}}
.figure {{
  background: #0e1219; border: 1px solid var(--line); border-radius: 14px;
  padding: .6rem; overflow-x: auto; text-align: center;
}}
svg.diagram {{
  width: 100%; max-width: 520px; height: auto; display: block; margin: 0 auto;
  min-height: 640px;
}}
table {{
  width: 100%; border-collapse: collapse; font-size: 1rem;
  font-family: ui-sans-serif, system-ui, sans-serif;
}}
th, td {{
  border-bottom: 1px solid var(--line); padding: .55rem .6rem;
  text-align: left; vertical-align: top;
}}
th {{
  color: var(--mut); font-size: .85rem; letter-spacing: .06em; text-transform: uppercase;
  background: #0e1219;
}}
td.dev {{ color: var(--gold); font-size: 1.45rem; font-family: Georgia, serif; }}
td.ia {{ color: var(--teal); font-family: ui-monospace, Menlo, monospace; font-size: 1.05rem; }}
.conflict td {{ font-size: .98rem; }}
.tables {{
  display: grid; gap: 1rem; grid-template-columns: 1fr;
}}
@media (min-width: 800px) {{ .tables {{ grid-template-columns: 1fr 1fr; }} }}
.scroll {{ max-height: 420px; overflow: auto; border: 1px solid var(--line); border-radius: 10px; }}
.scroll table {{ font-size: .95rem; }}
p, li {{ color: var(--ink); }}
.muted, small {{ color: var(--mut); }}
code {{
  font-family: ui-monospace, Menlo, monospace; color: var(--teal);
  background: #0e1219; padding: .1rem .35rem; border-radius: 4px;
}}
.btn-row {{ display: flex; flex-wrap: wrap; gap: .6rem; margin: 1rem 0; }}
.btn-row a {{
  font-family: ui-sans-serif, system-ui, sans-serif;
  padding: .7rem 1.1rem; border-radius: 10px; border: 1px solid var(--line);
  background: var(--panel); text-decoration: none; color: var(--ink);
  min-height: 44px; display: inline-flex; align-items: center;
}}
.btn-row a.primary {{ background: var(--gold); color: #0b0d12; border-color: var(--gold); font-weight: 700; }}
</style>
</head>
<body>
<header>
  <img src="/memory/icons/nyasa-icon.svg" alt=""/>
  <div>
    <h1>Phoneme body diagrams</h1>
    <p>Large, readable · Mātṛkā limb map · Mālinī MV 3.37–41</p>
    <div class="nav">
      <a href="/memory">Memory</a>
      <a href="/memory/nyasa">Nyāsa practice</a>
      <a href="/memory/audio/cycle_night1_a_aa.mp3">▶ Night 1 audio</a>
    </div>
  </div>
</header>
<main>

<div class="rec">
  <h2>Start here</h2>
  <p><strong>Use the Mātṛkā map first.</strong> Night 1 = <code>a</code> (forehead) + <code>ā</code> (mouth).</p>
  <p>TĀ 15 begins with Mātṛkānyāsa. Mālinī comes after the alphabet is automatic.
  Same phonemes, different body — don’t mix maps on the same night.</p>
  <div class="btn-row">
    <a class="primary" href="/memory/nyasa">Start Night 1</a>
    <a href="/memory/audio/cycle_night1_a_aa.mp3">▶ Play cycle</a>
  </div>
</div>

<div class="tabs" role="tablist">
  <button type="button" id="tabM" class="on" data-panel="panelM">Mātṛkā body</button>
  <button type="button" id="tabL" data-panel="panelL">Mālinī body</button>
  <button type="button" id="tabC" data-panel="panelC">Compare maps</button>
  <button type="button" id="tabT" data-panel="panelT">Full tables</button>
</div>

<!-- MATRIKA -->
<div class="panel on" id="panelM">
  <div class="figure">
    {matrika_svg()}
  </div>
  <div class="card">
    <h2>How to read this</h2>
    <p>Gold figure = Mātṛkā limb map (Tantrāloka 15).</p>
    <ul>
      <li><strong>Head/face</strong> — all 16 vowels (crown, forehead, mouth, eyes, ears, nostrils, cheeks, teeth, lips, tongue)</li>
      <li><strong>Right arm</strong> — ka kha ga gha ṅa (shoulder → fingers)</li>
      <li><strong>Left arm</strong> — ca cha ja jha ña</li>
      <li><strong>Legs</strong> — ṭa-varga right · ta-varga left</li>
      <li><strong>Torso</strong> — pa pha ba bha <strong>ma=heart</strong></li>
      <li><strong>Bottom band</strong> — deep constituents (skin → generative)</li>
    </ul>
    <p class="muted">Touch + chant each locus. Mouth decides the sound. Locus decides the install.</p>
  </div>
</div>

<!-- MALINI -->
<div class="panel" id="panelL">
  <div class="figure">
    {malini_svg()}
  </div>
  <div class="card">
    <h2>How to read this</h2>
    <p>Green figure = Mālinī map (Mālinīvijayottaratantra 3.37–41).</p>
    <ul>
      <li>Order runs <strong>na → pha</strong> (bhinna-yoni — vowels mixed with consonants)</li>
      <li><strong>ka-varga = teeth</strong> (not shoulders — that’s Mātṛkā)</li>
      <li><strong>pa = heart</strong> (Mātṛkā heart letter is <code>ma</code>)</li>
      <li><code>na</code> = crown flame · <code>da/pha</code> = feet</li>
    </ul>
    <p class="muted">Use this only after Mātṛkā order feels automatic.</p>
  </div>
</div>

<!-- COMPARE -->
<div class="panel" id="panelC">
  <div class="card">
    <h2>Same phoneme, different map</h2>
    <div class="warn">
      <strong>Don’t blend maps.</strong> One primary per night.
      Yoginī names vary across sources; body loci from MV 3.37–41 are the stable Mālinī core.
    </div>
    {conflict_table()}
  </div>
  <div class="card">
    <h2>When to switch</h2>
    <table>
      <thead><tr><th>Phase</th><th>Map</th></tr></thead>
      <tbody>
        <tr><td>Nights 1–14 + full install</td><td><strong>Mātṛkā</strong></td></tr>
        <tr><td>Months 3–4</td><td><strong>+ Mālinī</strong> (only when Mātṛkā automatic)</td></tr>
        <tr><td>Optional later</td><td>Batch aṅganyāsa · śabdarāśi</td></tr>
        <tr><td>Never first</td><td>Green-core chakra scaffold</td></tr>
      </tbody>
    </table>
  </div>
</div>

<!-- TABLES -->
<div class="panel" id="panelT">
  <div class="tables">
    <div class="card">
      <h2>Mātṛkā — 50 loci</h2>
      <div class="scroll">{table_matrika()}</div>
    </div>
    <div class="card">
      <h2>Mālinī — na → pha</h2>
      <div class="scroll">{table_malini()}</div>
    </div>
  </div>
</div>

<div class="card">
  <h2>Audio + practice</h2>
  <div class="btn-row">
    <a class="primary" href="/memory/nyasa">Nyāsa practice</a>
    <a href="/memory/audio/cycle_night1_a_aa.mp3">▶ Night 1 cycle</a>
    <a href="/memory/audio/cycle_vowels.mp3">▶ Vowels</a>
    <a href="/memory/bruno-wheels/index.html">Bruno wheels</a>
  </div>
  <p class="muted">
    Pattern: phoneme clip → locus word → gap for you → next.
    Mouth decides how it sounds. Locus decides where it is installed.
  </p>
</div>

<div class="card">
  <h2>Sources</h2>
  <ul class="muted">
    <li>Tantrāloka 15 — Mātṛkā / Mālinī / śabdarāśi nyāsa (volume Dyczkowski corpus)</li>
    <li>Mālinīvijayottaratantra 3.36–41 — bhinna-yoni · śākta-śarīra body map</li>
    <li>Tantrāloka 4.91 — don’t torment the body with prāṇāyāma</li>
    <li>Practice scaffold · not biomedical anatomy · no Hz doctrine</li>
  </ul>
</div>

</main>
<script>
(function () {{
  var tabs = document.querySelectorAll('.tabs button');
  var panels = document.querySelectorAll('.panel');
  function show(id) {{
    panels.forEach(function (p) {{ p.classList.toggle('on', p.id === id); }});
    tabs.forEach(function (t) {{ t.classList.toggle('on', t.dataset.panel === id); }});
  }}
  tabs.forEach(function (t) {{
    t.addEventListener('click', function () {{ show(t.dataset.panel); }});
  }});
}})();
</script>
</body>
</html>
"""

dests = [
    Path("/root/sanskrithelp/public/memory/body-diagram.html"),
    Path("/root/stoned/dist/reference/phoneme-body-diagram.html"),
    Path("/root/deitybody/corpus/online/phoneme-body-diagram.html"),
    Path("/root/deitybody/docs/PHONEME_BODY_DIAGRAM.html"),
]
for d in dests:
    d.parent.mkdir(parents=True, exist_ok=True)
    d.write_text(html, encoding="utf-8")
    print("wrote", d, d.stat().st_size)

# Also replace mermaid-dependent phoneme-maps.html with pointer to clean diagrams
pointer = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta http-equiv="refresh" content="0;url=/memory/body-diagram.html"/>
<title>Phoneme maps</title>
<style>
body{background:#0b0d12;color:#f0ebe0;font:18px Georgia,serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
a{color:#5ec4b6;font-size:1.2rem}
</style>
</head>
<body>
<p>Opening <a href="/memory/body-diagram.html">phoneme body diagrams</a>…</p>
</body>
</html>
"""
for d in [
    Path("/root/sanskrithelp/public/memory/phoneme-maps.html"),
    Path("/root/stoned/dist/reference/phoneme-maps.html"),
]:
    d.parent.mkdir(parents=True, exist_ok=True)
    d.write_text(pointer, encoding="utf-8")
    print("pointer", d)

# Update maps page to just link cleanly
maps = Path("/root/sanskrithelp/app/memory/maps/page.tsx")
maps.write_text('''"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MemoryMapsPage() {
  return (
    <div className="min-h-[80vh] py-6 pb-28">
      <Link
        href="/memory"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Memory
      </Link>

      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold mb-1">Phoneme Body Maps</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Clean diagrams — large readable labels. Mātṛkā limb map vs Mālinī MV 3.37–41.
          One primary map per night. Start with Mātṛkā · Night 1 = a + ā.
        </p>
      </div>

      <a
        href="/memory/body-diagram.html"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-base font-semibold"
      >
        Open full body diagrams →
      </a>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <a href="/memory/nyasa" className="p-4 rounded-xl border border-border bg-card hover:border-primary">
          Nyāsa practice
        </a>
        <a href="/memory/audio/cycle_night1_a_aa.mp3" className="p-4 rounded-xl border border-border bg-card hover:border-primary">
          Night 1 audio cycle
        </a>
        <a href="/memory/bruno-wheels/index.html" className="p-4 rounded-xl border border-border bg-card hover:border-primary">
          Bruno wheels
        </a>
        <a href="/memory/canonical/TANTRALOKA_CANONICAL.md" className="p-4 rounded-xl border border-border bg-card hover:border-primary">
          Tantrāloka canonical
        </a>
      </div>
    </div>
  );
}
''', encoding='utf-8')
print("maps page simplified")
print("MAT", len(MAT), "MAL", len(MAL_POS))
