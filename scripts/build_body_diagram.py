#!/usr/bin/env python3
"""Generate full-page phoneme body diagram HTML + variation deepdive."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path("/root/deitybody")
mal_data = json.loads((ROOT / "data/malini_order.json").read_text(encoding="utf-8"))

matrika_items: list[dict] = []

head_vowels = [
    ("aṃ", "अं", "crown", 210, 58),
    ("a", "अ", "forehead", 210, 78),
    ("ā", "आ", "mouth/face", 210, 100),
    ("i", "इ", "R eye", 186, 82),
    ("ī", "ई", "L eye", 234, 82),
    ("u", "उ", "R ear", 174, 78),
    ("ū", "ऊ", "L ear", 246, 78),
    ("ṛ", "ऋ", "R nostril", 186, 94),
    ("ṝ", "ॠ", "L nostril", 234, 94),
    ("ḷ", "ऌ", "R cheek", 172, 94),
    ("ḹ", "ॡ", "L cheek", 248, 94),
    ("e", "ए", "low teeth", 198, 112),
    ("ai", "ऐ", "up teeth", 222, 112),
    ("o", "ओ", "low lip", 198, 124),
    ("au", "औ", "up lip", 222, 124),
    ("aḥ", "अः", "tongue", 210, 134),
]
for ia, dev, loc, x, y in head_vowels:
    matrika_items.append(
        {"iast": ia, "dev": dev, "locus": loc, "group": "head", "x": x, "y": y, "note": ""}
    )

limb = [
    ("ka", "क", "right shoulder", 130, 155, "arm-r"),
    ("kha", "ख", "right arm", 118, 195, "arm-r"),
    ("ga", "ग", "right elbow", 110, 235, "arm-r"),
    ("gha", "घ", "right wrist", 108, 270, "arm-r"),
    ("ṅa", "ङ", "R fingers", 110, 300, "arm-r"),
    ("ca", "च", "left shoulder", 290, 155, "arm-l"),
    ("cha", "छ", "left arm", 302, 195, "arm-l"),
    ("ja", "ज", "left elbow", 310, 235, "arm-l"),
    ("jha", "झ", "left wrist", 312, 270, "arm-l"),
    ("ña", "ञ", "L fingers", 310, 300, "arm-l"),
    ("pa", "प", "R side", 188, 155, "torso"),
    ("pha", "फ", "L side", 232, 155, "torso"),
    ("ba", "ब", "back/spine", 210, 185, "torso"),
    ("bha", "भ", "belly", 210, 215, "torso"),
    ("ma", "म", "heart", 210, 240, "torso"),
    ("ṭa", "ट", "R buttock", 158, 315, "leg-r"),
    ("ṭha", "ठ", "R thigh", 150, 375, "leg-r"),
    ("ḍa", "ड", "R knee", 145, 435, "leg-r"),
    ("ḍha", "ढ", "R shank", 142, 495, "leg-r"),
    ("ṇa", "ण", "R toes", 148, 560, "leg-r"),
    ("ta", "त", "L buttock", 262, 315, "leg-l"),
    ("tha", "थ", "L thigh", 270, 375, "leg-l"),
    ("da", "द", "L knee", 275, 435, "leg-l"),
    ("dha", "ध", "L shank", 278, 495, "leg-l"),
    ("na", "न", "L toes", 272, 560, "leg-l"),
]
for ia, dev, loc, x, y, g in limb:
    matrika_items.append(
        {"iast": ia, "dev": dev, "locus": loc, "group": g, "x": x, "y": y, "note": ""}
    )

for ia, dev, loc, x, y in [
    ("ya", "य", "skin", 50, 620),
    ("ra", "र", "blood", 120, 620),
    ("la", "ल", "flesh", 190, 620),
    ("va", "व", "sinews", 260, 620),
    ("śa", "श", "bone", 50, 648),
    ("ṣa", "ष", "marrow", 120, 648),
    ("sa", "स", "essence", 190, 648),
    ("ha", "ह", "prāṇa", 260, 648),
    ("kṣa", "क्ष", "generative", 330, 648),
]:
    matrika_items.append(
        {"iast": ia, "dev": dev, "locus": loc, "group": "deep", "x": x, "y": y, "note": ""}
    )

# Mālinī coords — subject-right = viewer-left
mal_pos = {
    "na": (210, 52, "śikhā"),
    "ṛ": (195, 48, "headband"),
    "ṝ": (205, 48, "headband"),
    "ḷ": (215, 48, "headband"),
    "ḹ": (225, 48, "headband"),
    "tha": (210, 62, "top of head"),
    "ca": (186, 82, "R eye"),
    "dha": (234, 82, "L eye"),
    "ī": (210, 94, "nose"),
    "ṇa": (178, 78, "ears"),
    "u": (174, 78, "ear R"),
    "ū": (246, 78, "ear L"),
    "ba": (210, 104, "mouth"),
    "ka": (198, 112, "teeth"),
    "kha": (205, 112, "teeth"),
    "ga": (212, 112, "teeth"),
    "gha": (219, 112, "teeth"),
    "ṅa": (226, 112, "teeth"),
    "i": (210, 122, "tongue"),
    "a": (210, 130, "speech"),
    "va": (210, 140, "throat"),
    "bha": (130, 155, "R shoulder"),
    "ya": (290, 155, "L shoulder"),
    "ḍa": (118, 195, "R arm"),
    "ḍha": (302, 195, "L arm"),
    "ṭha": (210, 190, "hands"),
    "jha": (110, 300, "R fingers"),
    "ña": (310, 300, "L fingers"),
    "ja": (100, 200, "trident"),
    "ra": (105, 220, "shaft"),
    "ṭa": (320, 200, "skull"),
    "pa": (210, 240, "heart"),
    "cha": (188, 170, "R chest"),
    "la": (232, 170, "L chest"),
    "ā": (210, 175, "milk"),
    "sa": (210, 180, "jīva"),
    "aḥ": (210, 185, "prāṇa"),
    "ha": (210, 195, "prāṇa"),
    "ṣa": (210, 220, "belly"),
    "kṣa": (210, 230, "navel"),
    "ma": (160, 320, "buttocks"),
    "śa": (210, 320, "guhya"),
    "aṃ": (262, 340, "R thigh"),
    "ta": (262, 360, "L thigh"),
    "e": (262, 435, "R knee"),
    "ai": (275, 435, "L knee"),
    "o": (262, 495, "R shank"),
    "au": (278, 495, "L shank"),
    "da": (272, 560, "R foot"),
    "pha": (285, 560, "L foot"),
}
mal_items = []
for p, loc in mal_data["body_map"].items():
    if p in mal_pos:
        x, y, note = mal_pos[p]
        mal_items.append(
            {
                "iast": p,
                "dev": mal_data["devanagari"].get(p, ""),
                "locus": loc,
                "note": note,
                "x": x,
                "y": y,
            }
        )

m_json = json.dumps(matrika_items, ensure_ascii=False)
ml_json = json.dumps(mal_items, ensure_ascii=False)

html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Full Body Diagram — Phonemes · Mātṛkā &amp; Mālinī</title>
<style>
:root{--bg:#0b0d12;--panel:#12161f;--ink:#e8e6df;--mut:#9aa3b5;--gold:#c9a45c;--teal:#5ec4b6;--rose:#d4899a;--line:#2a3142;--ok:#7dcea0}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 Georgia,serif}
a{color:var(--teal)}
header{padding:1.2rem 1rem .8rem;max-width:1100px;margin:0 auto;border-bottom:1px solid var(--line);display:flex;gap:12px;align-items:center}
header img{width:44px;height:44px}
h1{font-size:1.4rem;margin:0;font-weight:600}
header p{margin:.2rem 0 0;color:var(--mut);font-size:.9rem}
main{max-width:1100px;margin:0 auto;padding:1rem}
section{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:1rem;margin:1rem 0}
h2{font:600 .9rem ui-sans-serif,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);margin:0 0 .7rem}
h3{font-family:Georgia,serif;margin:0 0 .4rem}
.callout{border-left:3px solid var(--gold);background:rgba(201,164,92,.08);padding:.7rem 1rem;border-radius:0 8px 8px 0;margin:.7rem 0;font-size:.93rem}
.callout.warn{border-left-color:var(--rose);background:rgba(212,137,154,.08)}
.callout.ok{border-left-color:var(--ok);background:rgba(125,206,160,.08)}
.toolbar{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:1rem;align-items:center}
.toolbar button,.toolbar a{padding:.45rem .85rem;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--ink);font:13px ui-sans-serif,sans-serif;cursor:pointer;text-decoration:none}
.toolbar button.on{border-color:var(--gold);color:var(--gold);background:rgba(201,164,92,.12)}
.stage{display:grid;gap:1rem;grid-template-columns:1fr}
@media(min-width:900px){.stage{grid-template-columns:1.15fr .85fr}}
.figure-wrap{background:#0e1219;border:1px solid var(--line);border-radius:12px;padding:.5rem;overflow:auto}
svg.body{width:100%;max-width:480px;height:auto;display:block;margin:0 auto}
.legend{display:flex;flex-wrap:wrap;gap:8px;font:12px ui-sans-serif,sans-serif;color:var(--mut);margin:.5rem 0}
.legend span{display:inline-flex;align-items:center;gap:4px}
.sw{width:10px;height:10px;border-radius:2px;display:inline-block}
.panel{background:#0e1219;border:1px solid var(--line);border-radius:12px;padding:.8rem;max-height:70vh;overflow:auto}
.panel h3{font:600 .8rem ui-sans-serif,sans-serif;color:var(--gold);margin:0 0 .5rem;letter-spacing:.06em}
table{width:100%;border-collapse:collapse;font-size:.88rem}
th,td{border-bottom:1px solid var(--line);padding:.35rem .4rem;text-align:left;vertical-align:top}
th{color:var(--mut);font:600 .7rem ui-sans-serif,sans-serif;text-transform:uppercase;letter-spacing:.05em}
td .dev,.dev{color:var(--gold);font-size:1.1rem}
td .ia,.ia{color:var(--teal);font-family:ui-monospace,monospace;font-size:.85rem}
.conflict td{font-size:.85rem}
.ph{cursor:pointer}
.ph:hover .halo{opacity:.35}
.ph .halo{opacity:0;transition:opacity .15s}
.ph.sel .halo{opacity:.45}
.nav{font:.9rem ui-sans-serif,sans-serif;margin-top:.8rem}
.nav a{margin-right:.9rem}
.grid2{display:grid;gap:1rem;grid-template-columns:1fr}
@media(min-width:800px){.grid2{grid-template-columns:1fr 1fr}}
.rec{border:2px solid var(--ok);border-radius:12px;padding:1rem;background:rgba(125,206,160,.06)}
.rec h3{color:var(--ok)}
small,.small{color:var(--mut)}
#tblMatrika,#tblMalini{max-height:420px;overflow:auto}
</style>
</head>
<body>
<header>
<img src="/memory/icons/nyasa-icon.svg" alt=""/>
<div>
<h1>Full body diagram — phoneme locations</h1>
<p>Mātṛkā limb map · Mālinī MV 3.37–41 · variations &amp; what to start with</p>
<div class="nav"><a href="/memory">Memory</a><a href="/memory/nyasa">Nyāsa</a><a href="/memory/maps">Maps</a></div>
</div>
</header>
<main>

<section>
<h2>Start here — recommendation</h2>
<div class="rec">
<h3>Start with Mātṛkā ordered limb map · Night 1 = a + ā</h3>
<p>
TĀ 15 normally begins with <strong>Mātṛkānyāsa</strong>. MV 3.36 authorises Mālinī for śākta-śarīra
when nyāsa has no special procedure — authorization, not a beginner mandate.
Pathway Phase 6 adds Mālinī only after Mātṛkā is automatic (months 3–4).
</p>
<p>
<strong>Why not Mālinī first?</strong> Mālinī is a reconfiguration. Know what you are permuteing first.
Night 1 <code>na</code> (śikhā) skips sounds you already produce; <code>a</code>/<code>ā</code> + forehead/mouth are precise touch targets.
</p>
<p>
<strong>Why not the green-core chakra map first?</strong> Pedagogical scaffold (tantrica2), not the TĀ limb body.
Keep dual labels; never collapse into one doctrine.
</p>
<p><a href="/memory/nyasa">→ Start Night 1 practice</a> · <a href="/memory/audio/cycle_night1_a_aa.mp3">▶ audio cycle</a></p>
</div>
</section>

<section>
<h2>Variations — same phoneme, different map</h2>
<div class="callout warn">
<strong>There is not one body chart.</strong> Sources hold at least three systems called “nyāsa maps.”
Blending them collapses the coordinate you are installing. Pick one primary; overlay later.
</div>
<div class="grid2">
<div>
<h3>Map A · Mātṛkā limb (TĀ 15 / MV 8)</h3>
<p class="small">Normal alphabetical order. Vowels on head/face. Vargas run down limbs.</p>
<table class="conflict">
<tr><th>Phoneme</th><th>Limb map</th></tr>
<tr><td><span class="dev">क</span> <span class="ia">ka</span></td><td>right shoulder</td></tr>
<tr><td><span class="dev">त</span> <span class="ia">ta</span></td><td>left lower limb (buttock→toes)</td></tr>
<tr><td><span class="dev">प</span> <span class="ia">pa</span></td><td>right diaphragm / torso</td></tr>
<tr><td><span class="dev">म</span> <span class="ia">ma</span></td><td>heart</td></tr>
<tr><td><span class="dev">ए</span> <span class="ia">e</span></td><td>lower teeth</td></tr>
</table>
</div>
<div>
<h3>Map B · Mālinī (MV 3.37–41)</h3>
<p class="small">Bhinna-yoni — mixed order na→pha. Install for śākta-śarīra.</p>
<table class="conflict">
<tr><th>Phoneme</th><th>Mālinī body</th></tr>
<tr><td><span class="dev">न</span> <span class="ia">na</span></td><td>śikhā / crown flame</td></tr>
<tr><td><span class="dev">क</span> <span class="ia">ka</span></td><td><strong>teeth</strong></td></tr>
<tr><td><span class="dev">त</span> <span class="ia">ta</span></td><td>left thigh cluster</td></tr>
<tr><td><span class="dev">प</span> <span class="ia">pa</span></td><td><strong>heart</strong></td></tr>
<tr><td><span class="dev">ए</span> <span class="ia">e</span></td><td>right knee</td></tr>
</table>
</div>
</div>
<div class="grid2" style="margin-top:1rem">
<div>
<h3>Map C · Batch aṅganyāsa (TĀ 15 formula)</h3>
<p class="small">Compressed deposits: heart / head / kavaca / netratraya / astra — different ritual unit.</p>
<table class="conflict">
<tr><th>Batch</th><th>Example</th></tr>
<tr><td>Heart</td><td>ka-varga sounds on heart</td></tr>
<tr><td>Head</td><td>ca-varga on head</td></tr>
<tr><td>Kavaca</td><td>ta-varga on shoulders</td></tr>
</table>
</div>
<div>
<h3>Map D · Chakra-scaffold (PEDAGOGICAL)</h3>
<p class="small">tantrica2 / modern charts — NOT early Trika body.</p>
<table class="conflict">
<tr><th>Claim</th><th>vs TĀ limb</th></tr>
<tr><td>ka-varga = root/red</td><td>limb map: right upper limb</td></tr>
<tr><td>ta-tha-da-dha-na = heart/green</td><td>limb map: left lower limb</td></tr>
<tr><td>pa-varga = throat/blue</td><td>limb map: torso; Mālinī pa = heart</td></tr>
</table>
</div>
</div>
<div class="callout" style="margin-top:1rem">
<strong>Tripwires:</strong> Where does <code>ka</code> sit? Limb=shoulder · Mālinī=teeth · scaffold=root · batch=heart.
Where is the heart letter? Mātṛkā=<code>ma</code> · Mālinī=<code>pa</code> · green-core=<code>ta</code>-varga row.
<strong>Rule:</strong> one primary map per night. Dual-label later. Don’t “fix” one map to match another.
</div>
</section>

<section>
<h2>Interactive body — toggle maps</h2>
<div class="toolbar">
  <button type="button" id="btnMatrika" class="on">Mātṛkā limb map</button>
  <button type="button" id="btnMalini">Mālinī map</button>
  <button type="button" id="btnBoth">Both (ghost)</button>
  <a href="/memory/audio/cycle_night1_a_aa.mp3">▶ Night 1 audio</a>
</div>
<div class="legend">
  <span><i class="sw" style="background:#c9a45c"></i> head/face</span>
  <span><i class="sw" style="background:#5ec4b6"></i> upper limbs</span>
  <span><i class="sw" style="background:#d4899a"></i> lower limbs</span>
  <span><i class="sw" style="background:#e8d5a3"></i> torso</span>
  <span><i class="sw" style="background:#9aa3b5"></i> deep</span>
  <span><i class="sw" style="background:#7dcea0"></i> Mālinī active</span>
</div>
<div class="stage">
  <div class="figure-wrap">
    <svg class="body" id="bodySvg" viewBox="0 0 420 700" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .fig{fill:#12161f;stroke:#c9a45c;stroke-width:1.4;opacity:.9}
          .limb{fill:none;stroke:#c9a45c;stroke-width:7;stroke-linecap:round;opacity:.28}
          .dev{fill:#c9a45c;font-family:Georgia,serif}
          .ia{fill:#5ec4b6;font-family:ui-monospace,monospace;font-size:11px}
          .loc{fill:#9aa3b5;font:9px ui-sans-serif,sans-serif}
          .halo{fill:#c9a45c;opacity:0}
          .zone{fill:#9aa3b5;font:10px ui-sans-serif,sans-serif;letter-spacing:.08em}
        </style>
      </defs>
      <rect width="420" height="700" fill="#0b0d12"/>
      <text x="210" y="22" text-anchor="middle" class="zone" id="svgTitle">MĀTṚKĀ · ordered alphabet on body</text>
      <ellipse cx="210" cy="95" rx="30" ry="34" class="fig"/>
      <rect x="172" y="132" width="76" height="125" rx="20" class="fig"/>
      <path d="M172 148 L115 205 L108 295" class="limb"/>
      <path d="M248 148 L305 205 L312 295" class="limb"/>
      <path d="M192 257 L175 365 L168 485 L162 565" class="limb" stroke-width="8"/>
      <path d="M228 257 L245 365 L252 485 L258 565" class="limb" stroke-width="8"/>
      <circle cx="108" cy="305" r="8" class="fig"/>
      <circle cx="312" cy="305" r="8" class="fig"/>
      <circle cx="160" cy="575" r="9" class="fig"/>
      <circle cx="260" cy="575" r="9" class="fig"/>
      <g id="layerMatrika"></g>
      <g id="layerMalini"></g>
    </svg>
  </div>
  <div class="panel" id="sidePanel">
    <h3 id="panelTitle">Mātṛkā loci</h3>
    <div id="panelBody"><p class="small">Click any phoneme on the body.</p></div>
  </div>
</div>
</section>

<section>
<h2>Full tables</h2>
<div class="grid2">
<div>
<h3>Mātṛkā · install points</h3>
<div id="tblMatrika"></div>
</div>
<div>
<h3>Mālinī · na → pha</h3>
<div id="tblMalini"></div>
</div>
</div>
</section>

<section>
<h2>Progression — when to switch maps</h2>
<table>
<tr><th>Phase</th><th>Map</th><th>What</th></tr>
<tr><td>Nights 1–8</td><td><strong>Mātṛkā</strong></td><td>16 vowels head/face · Night 1 = a+ā</td></tr>
<tr><td>Nights 9–14</td><td><strong>Mātṛkā</strong></td><td>ka kha · ca cha · ta tha contrasts</td></tr>
<tr><td>Full install</td><td><strong>Mātṛkā</strong></td><td>a→kṣa totalization + aham</td></tr>
<tr><td>Months 3–4</td><td><strong>+ Mālinī</strong></td><td>Only when Mātṛkā automatic · na→pha order</td></tr>
<tr><td>Later</td><td>Batch aṅganyāsa</td><td>Compressed TĀ 15 formula — different granularity</td></tr>
<tr><td>Optional</td><td>Śabdarāśi</td><td>After both maps stable</td></tr>
<tr><td>Never first</td><td>Green-core chakra</td><td>Overlay labels only</td></tr>
</table>
<div class="callout ok">
<strong>Switch rule:</strong> You can say the full alphabet and feel its Mātṛkā loci without hunting — then add Mālinī.
Before that, Mālinī is not practice; it is confusion with a harder chart.
</div>
</section>

<section>
<h2>Sources</h2>
<ul class="small">
<li>Tantrāloka 15 — Mātṛkānyāsa / Mālinīnyāsa / śabdarāśinyāsa (Dyczkowski apparatus on volume)</li>
<li>Mālinīvijayottaratantra 3.36–41 — bhinna-yoni · śākta-śarīra · body chart (Pradīpaka)</li>
<li>Tantrāloka 4.91 — don’t torment the body with prāṇāyāma</li>
<li>Flood, <em>The Tantric Body</em> — entextualisation; cakra maps late/variable</li>
<li>deitybody: <code>matrika_body_map.json</code> · <code>malini_order.json</code> · <code>docs/PATHWAY.md</code> · <code>corpus/extracts/MALINI_VARIATIONS.md</code></li>
<li>Practise: <a href="/memory/nyasa">Nyāsa</a> · audio cycles · Bruno wheels</li>
</ul>
<p class="small">Tradition-specific practice coordinates · not biomedical anatomy · no Hz doctrine · stop always available.</p>
</section>

</main>
<script>
const M = {items: __M_JSON__};
const ML = {items: __ML_JSON__};

function ns(tag) { return document.createElementNS('http://www.w3.org/2000/svg', tag); }

function groupColor(g) {
  if (g === 'head') return '#c9a45c';
  if (g === 'arm-r' || g === 'arm-l') return '#5ec4b6';
  if (g === 'leg-r' || g === 'leg-l') return '#d4899a';
  if (g === 'torso') return '#e8d5a3';
  if (g === 'deep') return '#9aa3b5';
  return '#7dcea0';
}

function addPh(layer, it, cls, color) {
  const g = ns('g');
  g.setAttribute('class', 'ph ' + cls);
  g.dataset.iast = it.iast;
  g.dataset.cls = cls;
  const halo = ns('circle');
  halo.setAttribute('cx', it.x);
  halo.setAttribute('cy', it.y - 6);
  halo.setAttribute('r', 13);
  halo.setAttribute('class', 'halo');
  halo.setAttribute('fill', color);
  const dev = ns('text');
  dev.setAttribute('x', it.x);
  dev.setAttribute('y', it.y - 4);
  dev.setAttribute('text-anchor', 'middle');
  dev.setAttribute('class', 'dev');
  dev.setAttribute('font-size', '13');
  dev.textContent = it.dev || it.iast;
  const ia = ns('text');
  ia.setAttribute('x', it.x);
  ia.setAttribute('y', it.y + 8);
  ia.setAttribute('text-anchor', 'middle');
  ia.setAttribute('class', 'ia');
  ia.textContent = it.iast;
  const loc = ns('text');
  loc.setAttribute('x', it.x);
  loc.setAttribute('y', it.y + 18);
  loc.setAttribute('text-anchor', 'middle');
  loc.setAttribute('class', 'loc');
  loc.textContent = String(it.note || it.locus || '').slice(0, 18);
  g.appendChild(halo);
  g.appendChild(dev);
  g.appendChild(ia);
  g.appendChild(loc);
  g.addEventListener('click', function () { select(it, cls); });
  layer.appendChild(g);
}

function render(mode) {
  const lm = document.getElementById('layerMatrika');
  const ll = document.getElementById('layerMalini');
  lm.innerHTML = '';
  ll.innerHTML = '';
  const title = document.getElementById('svgTitle');
  lm.style.opacity = '1';
  ll.style.opacity = '1';
  if (mode === 'matrika' || mode === 'both') {
    title.textContent = mode === 'both' ? 'MĀTṚKĀ + MĀLINĪ (compare)' : 'MĀTṚKĀ · ordered alphabet on body';
    M.items.forEach(function (it) { addPh(lm, it, 'm', groupColor(it.group)); });
    if (mode === 'both') lm.style.opacity = '0.35';
  }
  if (mode === 'malini' || mode === 'both') {
    title.textContent = mode === 'both' ? 'MĀTṚKĀ + MĀLINĪ (compare)' : 'MĀLINĪ · bhinna-yoni na→pha';
    ML.items.forEach(function (it) { addPh(ll, it, 'l', '#7dcea0'); });
  }
  if (mode === 'malini') lm.style.opacity = '0.12';
}

function select(it, cls) {
  document.querySelectorAll('.ph').forEach(function (p) { p.classList.remove('sel'); });
  document.querySelectorAll('.ph').forEach(function (p) {
    if (p.dataset.iast === it.iast && p.dataset.cls === cls) p.classList.add('sel');
  });
  document.getElementById('panelTitle').textContent =
    (cls === 'm' ? 'Mātṛkā' : 'Mālinī') + ' · ' + it.iast;
  document.getElementById('panelBody').innerHTML =
    '<div style="text-align:center;margin:.4rem 0"><div style="font-size:2.5rem;color:#c9a45c">' +
    (it.dev || it.iast) + '</div><div style="color:#5ec4b6">' + it.iast + '</div></div>' +
    '<table><tr><th>Locus</th><td>' + it.locus + '</td></tr>' +
    (it.note ? '<tr><th>Note</th><td>' + it.note + '</td></tr>' : '') +
    '<tr><th>Map</th><td>' + (cls === 'm' ? 'Mātṛkā limb / TĀ 15' : 'Mālinī / MV 3.37–41') +
    '</td></tr></table>' +
    '<p class="small">Mouth decides how it sounds. Locus decides where it is installed.</p>';
}

function buildTables() {
  let h = '<table><tr><th>#</th><th>Glyph</th><th>IAST</th><th>Locus</th><th>Group</th></tr>';
  M.items.forEach(function (it, i) {
    h += '<tr><td>' + (i + 1) + '</td><td class="dev">' + it.dev +
      '</td><td class="ia">' + it.iast + '</td><td>' + it.locus +
      '</td><td>' + it.group + '</td></tr>';
  });
  h += '</table>';
  document.getElementById('tblMatrika').innerHTML = h;

  h = '<table><tr><th>#</th><th>Glyph</th><th>IAST</th><th>Locus</th></tr>';
  ML.items.forEach(function (it, i) {
    h += '<tr><td>' + (i + 1) + '</td><td class="dev">' + (it.dev || '') +
      '</td><td class="ia">' + it.iast + '</td><td>' + it.locus + '</td></tr>';
  });
  h += '</table>';
  document.getElementById('tblMalini').innerHTML = h;
}

function setMode(m) {
  ['btnMatrika', 'btnMalini', 'btnBoth'].forEach(function (id) {
    document.getElementById(id).classList.remove('on');
  });
  if (m === 'matrika') document.getElementById('btnMatrika').classList.add('on');
  if (m === 'malini') document.getElementById('btnMalini').classList.add('on');
  if (m === 'both') document.getElementById('btnBoth').classList.add('on');
  render(m);
}

document.getElementById('btnMatrika').onclick = function () { setMode('matrika'); };
document.getElementById('btnMalini').onclick = function () { setMode('malini'); };
document.getElementById('btnBoth').onclick = function () { setMode('both'); };

render('matrika');
buildTables();
</script>
</body>
</html>
"""

html = html.replace("__M_JSON__", m_json).replace("__ML_JSON__", ml_json)

dests = [
    Path("/root/sanskrithelp/public/memory/body-diagram.html"),
    Path("/root/stoned/dist/reference/phoneme-body-diagram.html"),
    Path("/root/deitybody/corpus/online/phoneme-body-diagram.html"),
    Path("/root/deitybody/docs/PHONEME_BODY_DIAGRAM.html"),
]
for dest in dests:
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(html, encoding="utf-8")
    print("wrote", dest, dest.stat().st_size)

dd = """# Deepdive — Tantrāloka / Mālinī body-map variations

> Full-page diagram + what a beginner starts with
> Sources: TĀ 15 apparatus · MV 3.36–41 (Pradīpaka) · deitybody maps · Flood

## Full body diagram

- Sanskrit.help: `https://sanskrit.help/memory/body-diagram.html`
- Stonedoorway: `https://stonedoorway.com/reference/phoneme-body-diagram.html`
- Local: `deitybody/docs/PHONEME_BODY_DIAGRAM.html`
- Compact maps remain: `/memory/maps` · stonedoorway `/reference/phoneme-maps`

---

## Variations (same phoneme, different map)

| Map | Source | ka | ta | pa | ma | e |
|-----|--------|----|----|----|----|---|
| **Mātṛkā limb** | TĀ 15 / MV 8 | right shoulder | left lower limb | right diaphragm | heart | lower teeth |
| **Mālinī** | MV 3.37–41 | **teeth** | left thigh cluster | **heart** | buttocks | right knee |
| **Batch aṅganyāsa** | TĀ 15 formulas | heart batch | kavaca batch | netratraya | netratraya | face batches |
| **Chakra-scaffold** | tantrica2 (PEDAGOGICAL) | root/red | heart/green | throat/blue | throat | — |

**Tripwires**
1. Where does **ka** sit? Four answers in four rites.
2. Where is the **heart letter**? Mātṛkā `ma` · Mālinī `pa` · green-core `ta`-varga row.

### Yoginī names / order variants
- TĀ 15 does **not** list yoginī names; Dyczkowski uses **Triśirobhairava** via Jayaratha.
- TĀ 15/121–125 reproduces MV 3/37–41 **"with a few variants."**
- Comparative chart: KuKh · SSS · Ṭikā · MVT — content largely same; sequence differs in some recensions.
- **Body loci from MV 3.37–41 are the stable core.** Goddess names optional for self-study.

---

## Which map to START with

### Primary: **Mātṛkā ordered limb map** · Night 1 = `a` + `ā`

| Ground | Source |
|--------|--------|
| TĀ 15 normally begins with **Mātṛkānyāsa** | ahnika-15 appendix A |
| TĀ 15 allows Mātṛkā, Mālinī, **or both** | TĀ 15/115cd–145 |
| MV 3.36 authorises Mālinī for śākta-śarīra when nyāsa has no special procedure | authorization, not beginner mandate |
| Pathway Phase 6 = Mālinī **after** Mātṛkā automatic | `docs/PATHWAY.md` |
| START_HERE forbids Mālinī-na first | `practice/START_HERE_TWO_PHONEMES.md` |
| 2/night fits limb map | vowels = head/face easy touch; ka kha = clear limb arc |

**Why not Mālinī first:** it is a reconfiguration. Know what you are permuteing first.
**Why not green-core first:** pedagogical scaffold, not early Trika body (Flood: cakra maps late/variable).

---

## Progression

| Phase | Map | Action |
|------:|-----|--------|
| Nights 1–8 | Mātṛkā | vowels head/face · Night 1 a+ā |
| Nights 9–14 | Mātṛkā | ka kha · ca cha · ta tha |
| Full install | Mātṛkā | a→kṣa + aham |
| Months 3–4 | **+ Mālinī** | only when Mātṛkā automatic |
| Later | batch aṅganyāsa | compressed TĀ 15 formula |
| Optional | śabdarāśi | after both stable |
| Never first | green-core chakra | overlay labels only |

**Switch rule:** full alphabet + Mātṛkā loci without hunting → then Mālinī.

---

## Cautions

- One primary map per night — don't run ka on shoulder AND teeth
- Dual-label; don't collapse maps into one doctrine
- SOURCE_ATTESTED vs PEDAGOGICAL on every association
- Don't mix rites across traditions
- Yoginī name variants ≠ body-map errors
- Batch aṅganyāsa ≠ locus-by-locus limb map (different ritual unit)
- Breath: natural; TĀ 4.91 — no forced 1:4:2 in this OS
"""
for dest in [
    Path("/root/deitybody/corpus/extracts/MALINI_VARIATIONS.md"),
    Path("/root/deitybody/docs/MALINI_VARIATIONS.md"),
    Path("/root/sanskrithelp/public/memory/data/MALINI_VARIATIONS.md"),
]:
    dest.write_text(dd, encoding="utf-8")
    print("wrote", dest)

# Link from sanskrithelp Memory hub + maps page
mem = Path("/root/sanskrithelp/app/memory/page.tsx")
t = mem.read_text(encoding="utf-8")
if "body-diagram" not in t:
    needle = 'href: "/memory/maps",'
    insert = (
        'href: "/memory/body-diagram.html",\n'
        '    title: "Full Body Diagram",\n'
        '    subtitle: "Mātṛkā · Mālinī · variations",\n'
        '    desc: "Interactive full human body with phoneme loci. Toggle Mātṛkā limb map vs Mālinī MV 3.37–41. Deepdive: which map to start with.",\n'
        '    icon: MapIcon,\n'
        '  },\n'
        '  {\n'
        '    href: "/memory/maps",'
    )
    if needle in t:
        t = t.replace(needle, insert, 1)
        mem.write_text(t, encoding="utf-8")
        print("memory hub linked")
    else:
        print("memory hub needle missing")
else:
    print("memory hub already linked")

maps = Path("/root/sanskrithelp/app/memory/maps/page.tsx")
mt = maps.read_text(encoding="utf-8")
if "body-diagram" not in mt:
    mt = mt.replace(
        '<div className="rounded-xl border border-border bg-card overflow-hidden">',
        '<a\n'
        '        href="/memory/body-diagram.html"\n'
        '        className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"\n'
        '      >\n'
        '        Full body diagram (Mātṛkā · Mālinī · variations) →\n'
        '      </a>\n'
        '      <div className="rounded-xl border border-border bg-card overflow-hidden">',
        1,
    )
    maps.write_text(mt, encoding="utf-8")
    print("maps page linked")
else:
    print("maps already linked")

print("DONE matrika", len(matrika_items), "malini", len(mal_items))
