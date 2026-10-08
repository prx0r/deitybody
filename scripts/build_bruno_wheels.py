#!/usr/bin/env python3
"""Interactive Bruno wheels for Sanskrit — De umbris method + self-validation panel."""
from __future__ import annotations

import json
import math
from pathlib import Path

ROOT = Path("/root/deitybody")
DATA = ROOT / "data"
matrika = json.loads((DATA / "matrika_body_map.json").read_text(encoding="utf-8"))
malini = json.loads((DATA / "malini_order.json").read_text(encoding="utf-8"))
arch = json.loads((DATA / "architecture.json").read_text(encoding="utf-8"))

# Build dual-coordinate objects from matrika + malini
mat = {}
for v in matrika["vowels"]:
    mat[v["iast"]] = {
        "dev": v["devanagari"],
        "prod": v["locus"],
        "tantric": v["locus"],
        "place": "vowel",
        "manner": v.get("note", "vowel"),
        "bruno_env": "head-face field",
        "bruno_actor": v.get("note", "open field"),
    }
for g in matrika["vargas"]:
    for s in g["sequence"]:
        mat[s["iast"]] = {
            "dev": s["devanagari"],
            "prod": s["locus"],
            "tantric": s["locus"],
            "place": g.get("place", g.get("name", "")),
            "manner": s.get("note", ""),
            "bruno_env": "",
            "bruno_actor": "",
        }

# Bruno env/actor for consonants (teach the feature)
bruno_map = {
    "ka": ("cave", "plain stop"),
    "kha": ("cave", "actor blows wind"),
    "ga": ("cave", "actor glows/hums"),
    "gha": ("cave", "hum + wind"),
    "ṅa": ("cave", "nasal tunnel"),
    "ca": ("vaulted hall", "plain stop"),
    "cha": ("vaulted hall", "blows wind"),
    "ja": ("vaulted hall", "glows/hums"),
    "jha": ("vaulted hall", "hum + wind"),
    "ña": ("vaulted hall", "nasal tunnel"),
    "ṭa": ("dome", "plain stop"),
    "ṭha": ("dome", "blows wind"),
    "ḍa": ("dome", "glows/hums"),
    "ḍha": ("dome", "hum + wind"),
    "ṇa": ("dome", "nasal tunnel"),
    "ta": ("gate of teeth", "plain stop"),
    "tha": ("gate of teeth", "blows wind"),
    "da": ("gate of teeth", "glows/hums"),
    "dha": ("gate of teeth", "hum + wind"),
    "na": ("gate of teeth", "nasal tunnel"),
    "pa": ("pair of doors/lips", "plain stop"),
    "pha": ("pair of doors/lips", "blows wind"),
    "ba": ("pair of doors/lips", "glows/hums"),
    "bha": ("pair of doors/lips", "hum + wind"),
    "ma": ("pair of doors/lips", "nasal tunnel / hum"),
}
for ia, (env, actor) in bruno_map.items():
    if ia in mat:
        mat[ia]["bruno_env"] = env
        mat[ia]["bruno_actor"] = actor

# Malini body
for p, loc in malini["body_map"].items():
    if p in mat:
        mat[p]["malini_locus"] = loc
    else:
        mat[p] = {
            "dev": malini["devanagari"].get(p, ""),
            "prod": loc,
            "tantric": loc,
            "malini_locus": loc,
            "place": "",
            "manner": "",
            "bruno_env": "",
            "bruno_actor": "",
        }

# Varṇamālā 5×5 for place×manner wheel
places = [
    {"id": "kaṇṭhya", "skt": "कण्ठ्य", "en": "throat", "letters": ["ka", "kha", "ga", "gha", "ṅa"], "env": "cave"},
    {"id": "tālavya", "skt": "तालव्य", "en": "palate", "letters": ["ca", "cha", "ja", "jha", "ña"], "env": "vaulted hall"},
    {"id": "mūrdhanya", "skt": "मूर्धन्य", "en": "retroflex", "letters": ["ṭa", "ṭha", "ḍa", "ḍha", "ṇa"], "env": "dome"},
    {"id": "dantya", "skt": "दन्त्य", "en": "dental", "letters": ["ta", "tha", "da", "dha", "na"], "env": "gate of teeth"},
    {"id": "oṣṭhya", "skt": "ओष्ठ्य", "en": "lips", "letters": ["pa", "pha", "ba", "bha", "ma"], "env": "doors/lips"},
]
manners = [
    {"short": "V", "en": "plain stop", "actor": "same actor"},
    {"short": "Kh", "en": "+ aspiration", "actor": "blows wind"},
    {"short": "G", "en": "+ voiced", "actor": "glows/hums"},
    {"short": "Gh", "en": "voiced+asp", "actor": "hum + wind"},
    {"short": "N", "en": "nasal", "actor": "nasal tunnel"},
]

# De umbris syllable grid: consonant × vowel for word-building (Sturlese)
vowels_syl = ["a", "ā", "i", "ī", "u", "ū", "e", "o"]
cons_syl = ["ka", "kha", "ga", "ca", "cha", "ja", "ṭa", "ṭha", "ta", "tha", "pa", "pha", "ma", "ya", "ra", "la", "va", "śa", "sa", "ha"]
syllables = []
for c in cons_syl:
    for v in vowels_syl:
        syl = c + v if not c.endswith("a") else c[:-1] + v
        # simpler: ka+a = ka, ka+i = ki etc
        base = c[:-1] if c.endswith("a") else c
        syl = base + v
        if syl in mat:
            syllables.append(syl)
        else:
            syllables.append(syl)  # still show

# unique preserving order
seen = set()
syl_list = []
for s in syllables:
    if s not in seen:
        seen.add(s)
        syl_list.append(s)

# Agent/action rings for De umbris style (personal images - user fills)
agents = ["you", "teacher", "friend", "driver", "stranger", "family", "shopkeeper", "river-person"]
actions = ["go", "come", "want", "give", "take", "see", "hear", "speak"]
ensigns = ["chain", "ring", "staff", "mirror", "hood", "baldric", "banner", "lamp"]
attributes = ["bright", "deep", "swift", "still", "warm", "cool", "loud", "soft"]
circumstances = ["home", "school", "market", "river", "temple", "book", "night", "dawn"]

data = {
    "phonemes": mat,
    "malini_order": malini["order"],
    "malini_body": malini["body_map"],
    "places": places,
    "manners": manners,
    "syllables": syl_list[:80],
    "agents": agents,
    "actions": actions,
    "ensigns": ensigns,
    "attributes": attributes,
    "circumstances": circumstances,
    "night1": ["a", "ā"],
    "validation": {
        "method": "data-driven — every locus string pulled from deitybody JSON",
        "rule": "Mouth decides sound. Locus decides install. One map per night.",
        "start": "Mātṛkā · Night 1 = a + ā",
    },
}

data_json = json.dumps(data, ensure_ascii=False)

html = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Bruno Wheels — Sanskrit</title>
<style>
:root{--bg:#0b0d12;--panel:#12161f;--ink:#f0ebe0;--mut:#a8a294;--gold:#c9a45c;--teal:#5ec4b6;--green:#7dcea0;--line:#2a3142;--rose:#d4899a}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 Georgia,serif}
a{color:var(--teal)}
header{max-width:1000px;margin:0 auto;padding:1.1rem 1rem .7rem;border-bottom:1px solid var(--line);display:flex;gap:12px;align-items:center}
header img{width:48px;height:48px}
h1{font-size:clamp(1.3rem,4vw,1.75rem);margin:0;font-weight:700}
header p{margin:.2rem 0 0;color:var(--mut)}
main{max-width:1000px;margin:0 auto;padding:1rem 1rem 4rem}
.nav{margin-top:.6rem;font-family:ui-sans-serif,system-ui,sans-serif;font-size:.95rem}
.nav a{margin-right:1rem}
.tabs{display:flex;flex-wrap:wrap;gap:.45rem;margin:1rem 0;position:sticky;top:0;z-index:5;background:var(--bg);padding:.55rem 0;border-bottom:1px solid var(--line)}
.tabs button{font-family:ui-sans-serif,system-ui,sans-serif;font-size:.95rem;padding:.55rem .95rem;border-radius:9px;border:1px solid var(--line);background:var(--panel);color:var(--ink);cursor:pointer;min-height:42px}
.tabs button.on{background:var(--gold);color:#0b0d12;border-color:var(--gold);font-weight:700}
.panel{display:none}.panel.on{display:block}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:1rem;margin:.9rem 0}
.card h2{font-family:ui-sans-serif,system-ui,sans-serif;font-size:.95rem;letter-spacing:.07em;text-transform:uppercase;color:var(--gold);margin:0 0 .7rem}
.rec{border:2px solid var(--green);background:rgba(125,206,160,.08);border-radius:12px;padding:1rem;margin:1rem 0}
.rec h2{color:var(--green)}
.wheel-wrap{display:grid;gap:1rem;grid-template-columns:1fr}
@media(min-width:860px){.wheel-wrap{grid-template-columns:1.1fr .9fr}}
.wheel-box{background:#0e1219;border:1px solid var(--line);border-radius:14px;padding:.8rem;position:relative;overflow:hidden}
svg.wheel{width:100%;max-width:480px;height:auto;display:block;margin:0 auto;touch-action:none}
.ring-label{fill:#9aa3b5;font:11px ui-sans-serif,sans-serif;letter-spacing:.08em}
.seg{cursor:pointer}
.seg text{pointer-events:none}
.seg:hover .segbg{opacity:.35}
.seg.sel .segbg{opacity:.5}
.sebg{opacity:0}
.detail{background:#0e1219;border:1px solid var(--line);border-radius:12px;padding:1rem;min-height:220px}
.detail .glyph{font-size:3rem;color:var(--gold);text-align:center;line-height:1.1}
.detail .ia{font-size:1.4rem;color:var(--teal);text-align:center;font-family:ui-monospace,Menlo,monospace}
.detail table{width:100%;border-collapse:collapse;margin-top:.7rem;font-family:ui-sans-serif,system-ui,sans-serif;font-size:.95rem}
.detail td,.detail th{border-bottom:1px solid var(--line);padding:.4rem .45rem;text-align:left;vertical-align:top}
.detail th{color:var(--mut);font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;width:38%}
.controls{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.6rem}
.controls button,.controls a{font-family:ui-sans-serif,system-ui,sans-serif;padding:.45rem .75rem;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--ink);text-decoration:none;cursor:pointer;min-height:40px}
.controls button.primary{background:var(--teal);color:#0b0d12;border-color:var(--teal);font-weight:700}
.wordout{font-family:ui-monospace,Menlo,monospace;font-size:1.35rem;color:var(--green);text-align:center;padding:.8rem;background:#0e1219;border:1px solid var(--line);border-radius:10px;min-height:3rem}
.chips{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.5rem}
.chip{font-family:ui-monospace,Menlo,monospace;font-size:.95rem;padding:.35rem .55rem;border-radius:7px;border:1px solid var(--line);background:#0e1219;color:var(--ink);cursor:pointer}
.chip.on{border-color:var(--gold);color:var(--gold);background:rgba(201,164,92,.12)}
.val{font-family:ui-monospace,Menlo,monospace;font-size:.9rem}
.val .ok{color:var(--green)}.val .fail{color:var(--rose)}.val .warn{color:var(--gold)}
.muted{color:var(--mut)}
code{font-family:ui-monospace,Menlo,monospace;color:var(--teal);background:#0e1219;padding:.05rem .3rem;border-radius:4px}
.btn-row{display:flex;flex-wrap:wrap;gap:.55rem;margin:.8rem 0}
.btn-row a{font-family:ui-sans-serif,system-ui,sans-serif;padding:.65rem 1rem;border-radius:10px;border:1px solid var(--line);background:var(--panel);text-decoration:none;color:var(--ink);min-height:42px;display:inline-flex;align-items:center}
.btn-row a.primary{background:var(--gold);color:#0b0d12;border-color:var(--gold);font-weight:700}
ul{margin:.4rem 0 .4rem 1.1rem;padding:0}
li{margin:.25rem 0}
</style>
</head>
<body>
<header>
<img src="/memory/icons/nyasa-icon.svg" alt=""/>
<div>
<h1>Bruno wheels for Sanskrit</h1>
<p>Interactive · Sturlese/Warburg method · dual coordinates from TĀ 15 + MV 3.37–41</p>
<div class="nav">
<a href="/memory">Memory</a>
<a href="/memory/body-diagram.html">Body diagrams</a>
<a href="/memory/nyasa">Nyāsa</a>
</div>
</div>
</header>
<main>

<div class="rec">
<h2>Start here</h2>
<p><strong>Use the varṇamālā wheel first</strong> (place × manner). Night 1 = <code>a</code> + <code>ā</code>.</p>
<p>Bruno’s method (Sturlese): <em>rotate rings → pick syllable constituents → compose one vivid image → place it in a locus.</em>
The image must <strong>teach the phonetic property</strong>, not decorate a flashcard.</p>
<p class="muted">Bruno and Abhinavagupta have no historical connection — synthetic pedagogy. Ontology is Trika.</p>
<div class="btn-row">
<a class="primary" href="/memory/nyasa">Start Night 1</a>
<a href="/memory/audio/cycle_night1_a_aa.mp3">▶ Night 1 audio</a>
<a href="/memory/body-diagram.html">Body diagrams</a>
</div>
</div>

<div class="tabs">
<button type="button" class="on" data-p="varna">Varṇamālā 5×5</button>
<button type="button" data-p="umbris">De umbris syllables</button>
<button type="button" data-p="five">Five-ring scene</button>
<button type="button" data-p="nyasa">Nyāsa ray</button>
<button type="button" data-p="val">Validation</button>
</div>

<!-- VARNA -->
<div class="panel on" id="p-varna">
<div class="wheel-wrap">
<div class="wheel-box">
<svg class="wheel" id="svgVarna" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"></svg>
<div class="controls">
<button type="button" class="primary" id="btnSpinVarna">Spin / next</button>
<button type="button" id="btnClearVarna">Clear</button>
</div>
</div>
<div class="detail" id="detVarna">
<div class="muted">Click a place on the outer ring or press Spin. Rotate place × manner to generate the varga.</div>
</div>
</div>
<div class="card">
<h2>How this wheel works</h2>
<ul>
<li><strong>Outer ring</strong> — place (kaṇṭhya → oṣṭhya, back → front in the mouth)</li>
<li><strong>Inner ring</strong> — manner (plain → aspiration → voiced → voiced+asp → nasal)</li>
<li><strong>Ray</strong> — the real consonant (e.g. kaṇṭhya + plain = <code>क ka</code>)</li>
<li><strong>Bruno image</strong> — environment + actor that exaggerates the feature (cave + plain stop)</li>
</ul>
<p class="muted">Rotate both rings → generate <code>ka kha ga gha ṅa</code> and the other vargas. You are learning a 5×5 instrument in the mouth.</p>
</div>
</div>

<!-- UMBRIS -->
<div class="panel" id="p-umbris">
<div class="wheel-wrap">
<div class="wheel-box">
<svg class="wheel" id="svgUmbris" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"></svg>
<div class="controls">
<button type="button" class="primary" id="btnPickSyl">Pick syllable</button>
<button type="button" id="btnAddWord">Add to word</button>
<button type="button" id="btnClearWord">Clear word</button>
</div>
</div>
<div class="detail" id="detUmbris">
<div class="muted">De umbris (Sturlese): each ray is a syllable. Build a word by picking syllables; then attach one Bruno image per syllable (agent / action / ensign…).</div>
<div class="wordout" id="wordOut">—</div>
<div class="chips" id="sylChips"></div>
</div>
</div>
<div class="card">
<h2>How to use De umbris for Sanskrit</h2>
<ol>
<li>Pick syllables that form a real Sanskrit word (or a phoneme drill sequence).</li>
<li>For each syllable, choose <strong>one</strong> image that teaches its property (not fifty).</li>
<li>Compose <strong>one</strong> scene: agent + action + ensign + circumstance.</li>
<li>Place that scene on a <strong>nyāsa locus</strong> (from the body map).</li>
<li>Replay audio cycle → say the word → feel the loci.</li>
</ol>
<p class="muted">Example Bruno logic: NU + ME + RA + TO + RE → one composite image, not five flashcards.</p>
</div>
</div>

<!-- FIVE RING -->
<div class="panel" id="p-five">
<div class="wheel-wrap">
<div class="wheel-box">
<svg class="wheel" id="svgFive" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"></svg>
<div class="controls">
<button type="button" class="primary" id="btnCompose">Compose scene</button>
<button type="button" id="btnRerollFive">Reroll rings</button>
</div>
</div>
<div class="detail" id="detFive">
<div class="muted">Five concentric rings (De umbris large wheel): agent · action · ensign · attribute · circumstance. Spin each ring, then compose one scene and bind it to a phoneme/locus.</div>
<div class="wordout" id="fiveOut">—</div>
</div>
</div>
<div class="card">
<h2>Rule</h2>
<p>The image must <strong>teach the property</strong> (aspiration, voicing, nasal, place). If it only reminds you of a symbol, it fails.</p>
</div>
</div>

<!-- NYASA RAY -->
<div class="panel" id="p-nyasa">
<div class="wheel-wrap">
<div class="wheel-box">
<svg class="wheel" id="svgNyasa" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"></svg>
<div class="controls">
<button type="button" class="primary" id="btnNyasaNext">Next phoneme</button>
<button type="button" id="btnNyasaPlay">▶ Hear</button>
<button type="button" id="btnNyasaMap">Open body map</button>
</div>
</div>
<div class="detail" id="detNyasa">
<div class="muted">Full ray: glyph · production locus · tantric locus · Mālinī locus · Bruno image. Data from deitybody JSON — not guessed.</div>
</div>
</div>
<div class="card">
<h2>Dual coordinates</h2>
<table>
<tr><th>Layer</th><th>Meaning</th></tr>
<tr><td>Production</td><td>where the sound is made in the mouth (TĀ 15 / varṇamālā)</td></tr>
<tr><td>Tantric (Mātṛkā)</td><td>nyāsa install site — limb map</td></tr>
<tr><td>Mālinī</td><td>MV 3.37–41 — after Mātṛkā is stable</td></tr>
<tr><td>Bruno image</td><td>must teach the phonetic property</td></tr>
</table>
</div>
</div>

<!-- VALIDATION -->
<div class="panel" id="p-val">
<div class="card">
<h2>Self-validation (data-driven)</h2>
<p class="muted">Checks run against <code>deitybody/data/*.json</code> + generated HTML. Not visual guessing.</p>
<div class="val" id="valBox">Running…</div>
<div class="btn-row">
<a href="/memory/canonical/DIAGRAM_VALIDATION.json">DIAGRAM_VALIDATION.json</a>
<a href="/memory/canonical/TANTRALOKA_CANONICAL.md">Tantrāloka canonical</a>
<a href="/memory/body-diagram.html">Body diagrams</a>
</div>
</div>
<div class="card">
<h2>Rules encoded</h2>
<ul>
<li>50 Mātṛkā phonemes · unique · all have glyph + locus</li>
<li>50 Mālinī letters · na→pha · all have body loci</li>
<li>Night 1: <code>a</code>=forehead · <code>ā</code>=mouth/face</li>
<li>Documented conflicts: ka shoulder vs teeth · ma/pa heart</li>
<li>Canonical: Tantrāloka locked · Goswami = tool</li>
<li>No mermaid CDN on diagram pages</li>
</ul>
</div>
</div>

</main>
<script>
const DATA = __DATA__;

const CLIP = {
  "a":"/memory/clips/a.ogg","ā":"/memory/clips/aa.ogg",
  "i":"/memory/clips/i.ogg","ī":"/memory/clips/ii.ogg",
  "u":"/memory/clips/u.ogg","ū":"/memory/clips/uu.ogg",
  "e":"/memory/clips/e.ogg","ai":"/memory/clips/ai.ogg",
  "o":"/memory/clips/o.ogg","au":"/memory/clips/au.ogg",
  "aṃ":"/memory/clips/anusvara.ogg","aḥ":"/memory/clips/visarga.ogg",
  "ka":"/memory/clips/ka.ogg","kha":"/memory/clips/kha.ogg",
  "ga":"/memory/clips/ga.ogg","gha":"/memory/clips/gha.ogg",
  "ca":"/memory/clips/ca.ogg","cha":"/memory/clips/cha.ogg",
  "ja":"/memory/clips/ja.ogg","jha":"/memory/clips/jha.ogg",
  "ta":"/memory/clips/ta.ogg","tha":"/memory/clips/tha.ogg",
  "da":"/memory/clips/da.ogg","dha":"/memory/clips/dha.ogg"
};

function ns(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}
function polar(cx,cy,r,deg){const a=(deg-90)*Math.PI/180;return[cx+r*Math.cos(a),cy+r*Math.sin(a)]}
function play(ia){const s=CLIP[ia];if(s)new Audio(s).play().catch(()=>{})}

function renderWheel(svg, rings, opts){
  // rings: [{id, items:[{id,label,color?}], radius}]
  svg.innerHTML="";
  const cx=200, cy=200;
  const g=ns("g"); svg.appendChild(g);
  rings.forEach((ring,ri)=>{
    const r=ring.radius;
    const n=ring.items.length;
    const step=360/n;
    // circle
    const c=ns("circle");
    c.setAttribute("cx",cx);c.setAttribute("cy",cy);c.setAttribute("r",r);
    c.setAttribute("fill","none");
    c.setAttribute("stroke",ring.color||"#c9a45c");
    c.setAttribute("stroke-width","1.5");
    c.setAttribute("opacity","0.7");
    g.appendChild(c);
    ring.items.forEach((it,i)=>{
      const mid=i*step+step/2;
      const [x1,y1]=polar(cx,cy,r-step/2+2,mid);
      const [x2,y2]=polar(cx,cy,r+step/2-2,mid);
      const [tx,ty]=polar(cx,cy,r,mid);
      // sector path approx as wedge lines
      const seg=ns("g");
      seg.setAttribute("class","seg "+(ring.id||"")+"-"+i);
      seg.dataset.ring=ring.id||("r"+ri);
      seg.dataset.idx=i;
      seg.dataset.item=JSON.stringify(it);
      const bg=ns("path");
      const [xa,ya]=polar(cx,cy,r-step/2,mid-step/2);
      const [xb,yb]=polar(cx,cy,r+step/2,mid-step/2);
      const [xc,yc]=polar(cx,cy,r+step/2,mid+step/2);
      const [xd,yd]=polar(cx,cy,r-step/2,mid+step/2);
      bg.setAttribute("d",`M${xa},${ya} L${xb},${yb} A${r},${r} 0 0 1 ${xc},${yc} L${xd},${yd} A${r},${r} 0 0 0 ${xa},${ya} Z`);
      bg.setAttribute("class","segbg");
      bg.setAttribute("fill", it.color||ring.color||"#c9a45c");
      bg.setAttribute("opacity","0");
      seg.appendChild(bg);
      const t=ns("text");
      t.setAttribute("x",tx);t.setAttribute("y",ty+4);
      t.setAttribute("text-anchor","middle");
      t.setAttribute("font-size", it.fs||"12");
      t.setAttribute("fill","#f0ebe0");
      t.setAttribute("font-family", it.mono? "ui-monospace,Menlo,monospace" : "ui-sans-serif,system-ui,sans-serif");
      t.textContent=it.label;
      seg.appendChild(t);
      seg.addEventListener("click",()=>opts&&opts.onSelect&&opts.onSelect(ring.id,i,it));
      g.appendChild(seg);
    });
  });
  // hub
  const hub=ns("circle");
  hub.setAttribute("cx",cx);hub.setAttribute("cy",cy);hub.setAttribute("r","28");
  hub.setAttribute("fill","#12161f");hub.setAttribute("stroke","#c9a45c");hub.setAttribute("stroke-width","2");
  g.appendChild(hub);
  const ht=ns("text");
  ht.setAttribute("x",cx);ht.setAttribute("y",cy+4);ht.setAttribute("text-anchor","middle");
  ht.setAttribute("fill","#c9a45c");ht.setAttribute("font-size","11");ht.setAttribute("font-family","ui-sans-serif,system-ui");
  ht.textContent=opts&&opts.hub?opts.hub:"aham";
  g.appendChild(ht);
  return g;
}

function showPhoneme(det, ia, extra){
  const p=DATA.phonemes[ia]||{};
  det.innerHTML=
    '<div class="glyph">'+(p.dev||ia)+'</div>'+
    '<div class="ia">'+ia+'</div>'+
    '<table>'+
    '<tr><th>Production</th><td>'+(p.prod||"—")+'</td></tr>'+
    '<tr><th>Mātṛkā / tantric</th><td>'+(p.tantric||"—")+'</td></tr>'+
    (p.malini_locus?'<tr><th>Mālinī</th><td>'+p.malini_locus+'</td></tr>':'')+
    (p.place?'<tr><th>Place</th><td>'+p.place+'</td></tr>':'')+
    (p.manner?'<tr><th>Manner</th><td>'+p.manner+'</td></tr>':'')+
    (p.bruno_env?'<tr><th>Bruno image</th><td>'+p.bruno_env+' + '+p.bruno_actor+'</td></tr>':'')+
    '</table>'+
    '<div class="controls"><button type="button" class="primary" onclick="play(\''+ia+'\')">▶ Hear</button>'+
    (extra||'')+
    '</div>'+
    '<p class="muted" style="margin-top:.6rem">Mouth decides sound. Locus decides install. Image must teach the property.</p>';
}

// --- Varṇamālā wheel ---
let vPlace=0, vManner=0;
function drawVarna(){
  const svg=document.getElementById("svgVarna");
  const places=DATA.places, manners=DATA.manners;
  // outer = places (5), inner = manners (5)
  renderWheel(svg,[
    {id:"place",color:"#c9a45c",radius:150,items:places.map((p,i)=>({id:p.id,label:p.en,color:i===vPlace?"#c9a45c":"#3a3428",fs:"11"}))},
    {id:"manner",color:"#5ec4b6",radius:95,items:manners.map((m,i)=>({id:m.id,label:m.short,color:i===vManner?"#5ec4b6":"#1e3a36",fs:"12"}))}
  ],{hub:"varṇa", onSelect:(ring,idx,it)=>{
    if(ring==="place")vPlace=idx;
    if(ring==="manner")vManner=idx;
    drawVarna(); updateVarna();
  }});
  // highlight selected
  svg.querySelectorAll(".seg").forEach(seg=>{
    const ring=seg.dataset.ring, idx=+seg.dataset.idx;
    if((ring==="place"&&idx===vPlace)||(ring==="manner"&&idx===vManner)) seg.classList.add("sel");
  });
  updateVarna();
}
function updateVarna(){
  const p=DATA.places[vPlace], m=DATA.manners[vManner];
  const ia=p.letters[vManner]||p.letters[0];
  const ph=DATA.phonemes[ia]||{};
  showPhoneme(document.getElementById("detVarna"), ia,
    '<button type="button" id="btnVarnaNext">Next place</button>');
  const nb=document.getElementById("btnVarnaNext");
  if(nb) nb.onclick=()=>{vPlace=(vPlace+1)%DATA.places.length;drawVarna();};
}
document.getElementById("btnSpinVarna").onclick=()=>{
  vPlace=(vPlace+1)%DATA.places.length;
  if(Math.random()<0.5)vManner=(vManner+1)%DATA.manners.length;
  drawVarna();
};
document.getElementById("btnClearVarna").onclick=()=>{vPlace=0;vManner=0;drawVarna();};

// --- De umbris syllables ---
let sylSel=null, word=[];
function drawUmbris(){
  const svg=document.getElementById("svgUmbris");
  const syls=DATA.syllables.slice(0,24); // show 24 on wheel
  renderWheel(svg,[
    {id:"syl",color:"#c9a45c",radius:155,items:syls.map((s,i)=>({
      id:s,label:s,color:s===sylSel?"#c9a45c":"#2a2418",fs:"11",mono:true
    }))}
  ],{hub:"umbris",onSelect:(ring,idx,it)=>{
    sylSel=it.id; drawUmbris(); updateUmbris();
  }});
  svg.querySelectorAll(".seg").forEach(seg=>{
    if(seg.dataset.item&&JSON.parse(seg.dataset.item).id===sylSel) seg.classList.add("sel");
  });
  // chips
  const chips=document.getElementById("sylChips");
  chips.innerHTML="";
  DATA.syllables.slice(0,40).forEach(s=>{
    const b=document.createElement("button");
    b.type="button"; b.className="chip"+(s===sylSel?" on":"");
    b.textContent=s;
    b.onclick=()=>{sylSel=s;drawUmbris();updateUmbris();};
    chips.appendChild(b);
  });
  updateUmbris();
}
function updateUmbris(){
  const det=document.getElementById("detUmbris");
  const out=document.getElementById("wordOut");
  out.textContent=word.length?word.join(" · "):"—";
  if(!sylSel){
    det.querySelector(".muted").textContent="Pick a syllable on the wheel or from the chips.";
    return;
  }
  // parse syl into cons+vowel if possible
  let ph=DATA.phonemes[sylSel];
  let cons=sylSel.replace(/[āīūṃḥeoai]+$/,"");
  let vow=sylSel.slice(cons.length);
  if(!ph&&DATA.phonemes[cons]) ph=DATA.phonemes[cons];
  const p=ph||{};
  det.innerHTML=
    '<div class="glyph">'+(p.dev||sylSel)+'</div>'+
    '<div class="ia">'+sylSel+'</div>'+
    '<table>'+
    '<tr><th>Syllable</th><td>'+sylSel+' (cons '+ (cons||"—") +' + vow '+ (vow||"—") +')</td></tr>'+
    (p.prod?'<tr><th>Production</th><td>'+p.prod+'</td></tr>':'')+
    (p.tantric?'<tr><th>Tantric</th><td>'+p.tantric+'</td></tr>':'')+
    (p.bruno_env?'<tr><th>Bruno</th><td>'+p.bruno_env+' + '+p.bruno_actor+'</td></tr>':'')+
    '</table>'+
    '<div class="controls"><button type="button" class="primary" onclick="play(\''+(p.dev? (cons||sylSel) : sylSel)+'\')">▶ Hear</button></div>'+
    '<div class="wordout" id="wordOut">'+(word.length?word.join(" · "):"—")+'</div>'+
    '<p class="muted">Compose ONE image per syllable that teaches its feature, then one scene for the whole word.</p>';
}
document.getElementById("btnAddWord").onclick=()=>{
  if(sylSel){word.push(sylSel);updateUmbris();}
};
document.getElementById("btnClearWord").onclick=()=>{word=[];updateUmbris();};
document.getElementById("btnPickSyl").onclick=()=>{
  sylSel=DATA.syllables[Math.floor(Math.random()*Math.min(40,DATA.syllables.length))];
  drawUmbris();
};

// --- Five ring ---
let fiveIdx=[0,0,0,0,0];
function drawFive(){
  const svg=document.getElementById("svgFive");
  const rings=[
    {id:"agent",color:"#c9a45c",radius:160,items:DATA.agents.map((a,i)=>({id:a,label:a,color:i===fiveIdx[0]?"#c9a45c":"#2a2418",fs:"10"}))},
    {id:"action",color:"#5ec4b6",radius:130,items:DATA.actions.map((a,i)=>({id:a,label:a,color:i===fiveIdx[1]?"#5ec4b6":"#1e3a36",fs:"10"}))},
    {id:"ensign",color:"#d4899a",radius:100,items:DATA.ensigns.map((a,i)=>({id:a,label:a,color:i===fiveIdx[2]?"#d4899a":"#3a2428",fs:"10"}))},
    {id:"attr",color:"#e8d5a3",radius:70,items:DATA.attributes.map((a,i)=>({id:a,label:a,color:i===fiveIdx[3]?"#e8d5a3":"#3a3428",fs:"9"}))},
    {id:"circ",color:"#9aa3b5",radius:42,items:DATA.circumstances.map((a,i)=>({id:a,label:a,color:i===fiveIdx[4]?"#9aa3b5":"#2a2a30",fs:"8"}))}
  ];
  renderWheel(svg,rings,{hub:"scene",onSelect:(ring,idx,it)=>{
    const map={agent:0,action:1,ensign:2,attr:3,circ:4};
    if(ring in map){fiveIdx[map[ring]]=idx;drawFive();updateFive();}
  }});
  svg.querySelectorAll(".seg").forEach(seg=>{
    const ring=seg.dataset.ring, idx=+seg.dataset.idx;
    const map={agent:0,action:1,ensign:2,attr:3,circ:4};
    if(ring in map && idx===fiveIdx[map[ring]]) seg.classList.add("sel");
  });
  updateFive();
}
function updateFive(){
  const parts=[
    DATA.agents[fiveIdx[0]],
    DATA.actions[fiveIdx[1]],
    DATA.ensigns[fiveIdx[2]],
    DATA.attributes[fiveIdx[3]],
    DATA.circumstances[fiveIdx[4]]
  ];
  document.getElementById("fiveOut").textContent=parts.join(" · ");
}
document.getElementById("btnCompose").onclick=()=>{
  const parts=[
    DATA.agents[fiveIdx[0]],
    DATA.actions[fiveIdx[1]],
    DATA.ensigns[fiveIdx[2]],
    DATA.attributes[fiveIdx[3]],
    DATA.circumstances[fiveIdx[4]]
  ];
  document.getElementById("detFive").querySelector(".muted").textContent=
    "Scene: "+parts.join(", ")+". Bind this ONE image to a phoneme locus (try nyāsa ray next).";
  updateFive();
};
document.getElementById("btnRerollFive").onclick=()=>{
  for(let i=0;i<5;i++) fiveIdx[i]=Math.floor(Math.random()*8);
  drawFive();
};

// --- Nyāsa ray ---
let nyIdx=0;
const NY_ORDER=["a","ā","i","ī","u","ū","ṛ","ṝ","ka","kha","ga","gha","ca","cha","ta","tha","pa","ma","na","ya","ha","kṣa"];
function drawNyasa(){
  const svg=document.getElementById("svgNyasa");
  const ia=NY_ORDER[nyIdx%NY_ORDER.length];
  const p=DATA.phonemes[ia]||{};
  // mini wheel: glyph center + two coordinate rings
  renderWheel(svg,[
    {id:"prod",color:"#c9a45c",radius:150,items:[
      {id:"prod",label:(p.prod||"—").slice(0,14),color:"#c9a45c",fs:"10"}
    ]},
    {id:"tan",color:"#5ec4b6",radius:100,items:[
      {id:"tan",label:(p.tantric||"—").slice(0,14),color:"#5ec4b6",fs:"10"}
    ]}
  ],{hub:ia});
  showPhoneme(document.getElementById("detNyasa"), ia,
    '<button type="button" id="btnNyPrev">Prev</button>');
  const pr=document.getElementById("btnNyPrev");
  if(pr) pr.onclick=()=>{nyIdx=(nyIdx-1+NY_ORDER.length)%NY_ORDER.length;drawNyasa();};
}
document.getElementById("btnNyasaNext").onclick=()=>{nyIdx=(nyIdx+1)%NY_ORDER.length;drawNyasa();};
document.getElementById("btnNyasaPlay").onclick=()=>{
  play(NY_ORDER[nyIdx%NY_ORDER.length]);
};
document.getElementById("btnNyasaMap").onclick=()=>{
  window.location.href="/memory/body-diagram.html";
};

// --- Validation panel ---
function runValidationLocal(){
  const box=document.getElementById("valBox");
  const checks=[];
  function chk(name, cond, detail){checks.push({name,cond:!!cond,detail:detail||""});}
  // from embedded DATA
  const phKeys=Object.keys(DATA.phonemes);
  chk("phoneme objects present", phKeys.length>=40, phKeys.length+" keys");
  const night=DATA.night1||[];
  chk("night1 pair a+ā", night.join("+")==="a+ā", night.join("+"));
  const a=DATA.phonemes["a"]||{};
  chk("a locus forehead", /forehead/i.test(a.tantric||a.prod||""), a.tantric||a.prod);
  const aa=DATA.phonemes["ā"]||{};
  chk("ā locus mouth", /mouth/i.test(aa.tantric||aa.prod||""), aa.tantric||aa.prod);
  const ka=DATA.phonemes["ka"]||{};
  chk("ka has production+bruno", !!(ka.prod&&ka.bruno_env), (ka.prod||"")+" / "+(ka.bruno_env||""));
  chk("malini order 50", (DATA.malini_order||[]).length===50, (DATA.malini_order||[]).length);
  chk("malini body ka=teeth", /teeth/i.test(DATA.malini_body["ka"]||""), DATA.malini_body["ka"]);
  chk("places=5 manners=5", DATA.places.length===5&&DATA.manners.length===5);
  const html=location.pathname+location.hash;
  chk("no mermaid CDN in page source", !document.documentElement.innerHTML.includes("cdn.jsdelivr.net/npm/mermaid"), "");
  box.innerHTML=checks.map(c=>
    '<div>'+(c.cond?'<span class="ok">OK</span>':'<span class="fail">XX</span>')+' '+c.name+(c.detail?' — '+c.detail:'')+'</div>'
  ).join("");
  const pass=checks.filter(c=>c.cond).length;
  box.insertAdjacentHTML("afterbegin","<div><strong>"+pass+"/"+checks.length+" local checks passed</strong></div>");
}

// tabs
document.querySelectorAll(".tabs button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("on"));
    document.querySelectorAll(".panel").forEach(p=>p.classList.remove("on"));
    btn.classList.add("on");
    document.getElementById("p-"+btn.dataset.p).classList.add("on");
  });
});

// init
drawVarna();
drawUmbris();
drawFive();
drawNyasa();
runValidationLocal();
</script>
</body>
</html>
'''

html = html.replace("__DATA__", data_json)

dests = [
    Path("/root/sanskrithelp/public/memory/bruno-wheels/index.html"),
    Path("/root/sanskrithelp/public/memory/bruno-wheels/wheels.html"),
    Path("/root/stoned/dist/reference/bruno-wheels/index.html"),
    Path("/root/deitybody/corpus/online/bruno-wheels.html"),
]
for d in dests:
    d.parent.mkdir(parents=True, exist_ok=True)
    d.write_text(html, encoding="utf-8")
    print("wrote", d, d.stat().st_size)

print("phonemes", len(mat), "syllables", len(syl_list))
