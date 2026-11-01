/* mouthSVG — per-phoneme mouth position for the chant dock (right window).
   Origin: port of sanskrithelp components/ArticulationDiagram.tsx (sagittal
   outline + greyscale place palette), EXTENDED with a tongue stroke + contact
   dot so each phoneme shows WHERE the tongue/lips articulate — the part the
   original lacked. Sanskrithelp remains source-of-truth for phoneme assets;
   this is the plug copy (AGENTS: repos plug, never merge).

   PROVENANCE:
   - Consonant places = the 5×5 varga places (data/articulation_matrix.json,
     SOURCE_ATTESTED matrix: kaṇṭhya/tālavya/mūrdhānya/danta/oṣṭhya).
   - CHECKED 2026-11-01 against Gabriel Pradīpaka, "Learning Sanskrit —
     Pronunciation 1 (The Letters)" (sanskrit-trikashaivism.com). Consonants
     matched in full. Corrections made: ḷ/ḹ are cerebral-DENTAL (not plain
     dental); e/ai are guttural-palatal and o/au guttural-labial (they glide
     from the throat — previously shown as a single point); kṣa cue said "ś"
     where the second element is ṣ (cerebral).
   - Vowel places = classical śikṣā five points (a=kaṇṭha throat, i=tālu
     palate, ṛ=mūrdhāni raised, ḷ=danta teeth, u=oṣṭhya lips) — SOURCE_ATTESTED
     traditional phonetics (Taittirīya/śikṣā lineage).
   - Long vowels sit at their short partner's point (classical quantity rule);
     e/ai grouped with the i-family, o/au with the u-family — PEDAGOGICAL
     grouping (labeled as such); aṃ = nasal close (velum), aḥ = open breath.
   Diagram is a teaching schematic, never anatomy. */

const GREY = {
  labial: "#fafafa", dental: "#a3a3a3", dental_retroflex: "#8b8b8b",
  retroflex: "#737373", palatal: "#404040", velar: "#171717", throat: "#525252",
};

const CUES = {
  velar: "tongue back · kaṇṭhya",
  palatal: "tongue mid · tālavya",
  retroflex: "tip curled up · mūrdhanya",
  dental: "tip at teeth · danta",
  dental_retroflex: "tip at teeth, then roof · danta-mūrdhanya",
  labial: "lips together · oṣṭhya",
  throat: "deep throat · kaṇṭha",
};

// contact point on the sagittal roof (viewBox 0 0 120 70): lips left, throat right
const DOT = {
  labial: [13, 39], dental: [25, 34], dental_retroflex: [30, 32],
  retroflex: [35, 31],
  palatal: [58, 35], velar: [92, 35], throat: [108, 45],
};

const VOWEL_PLACE = {
  a: "throat", "ā": "throat",
  i: "palatal", "ī": "palatal", e: "palatal", ai: "palatal",
  u: "labial", "ū": "labial", o: "labial", au: "labial",
  "ṛ": "retroflex", "ṝ": "retroflex",
  // ḷ is not purely dental: the source says the tongue presses the back of the
  // teeth and the sound is then felt in the roof — cerebral-dental.
  "ḷ": "dental_retroflex", "ḹ": "dental_retroflex",
  "aṃ": "velar", "aḥ": "throat",
};

function consonantPlace(id) {
  if ("ka kha ga gha ṅa ha kṣa".split(" ").includes(id)) return "velar";
  if ("ca cha ja jha ña ya śa".split(" ").includes(id)) return "palatal";
  if ("ṭa ṭha ḍa ḍha ṇa ra ṣa".split(" ").includes(id)) return "retroflex";
  if ("ta tha da dha na la s".split(" ").includes(id)) return "dental";
  if ("pa pha ba bha ma va".split(" ").includes(id)) return "labial";
  return null;
}

export function placeFor(id) {
  if (VOWEL_PLACE[id]) return VOWEL_PLACE[id];
  return consonantPlace(id);
}

function cueFor(id, place) {
  if (id === "aḥ") return "breath out, like h · visarga";
  if (id === "aṃ") return "mouth shut, through the nose · anusvāra";
  // kṣa is k (velar) + ṣ (cerebral) — the old cue said "ś", which is palatal.
  if (id === "kṣa") return "k then ṣ — back, then curled";
  // e/ai = a+i and o/au = a+u: the sound starts at the throat and lands at the
  // palate or the lips. Source: "Guttural-Palatal" / "Guttural-Labial".
  if (id === "e" || id === "ai") return "throat→palate · kaṇṭha-tālavya";
  if (id === "o" || id === "au") return "throat→lips · kaṇṭha-oṣṭhya";
  return CUES[place] || "";
}


// Movement cue: a dashed trace from the resting tongue to the contact point,
// drawn on each phoneme so the eye sees the travel required, not just the end
// state. Pure CSS (stroke-dashoffset) — no JS animation loop.
function guidePath(place) {
  if (place === "labial" || place === "throat") return "";
  const [dx, dy] = DOT[place];
  const cx = 55, cy = 50;
  const mx = (cx + dx) / 2, my = (cy + dy) / 2 - 4;
  return `M ${cx} ${cy} Q ${mx} ${my} ${dx} ${dy}`;
}

function tonguePath(place) {
  const [tx, ty] = DOT[place];
  if (place === "labial" || place === "throat") {
    // tongue rests low; the articulation is lips (dot at lips) or throat
    return "M 100 55 Q 70 58 45 54";
  }
  // thick-stroke tongue sweeping from back-floor up to the contact point
  return `M 100 55 Q ${tx + 22} ${ty + 24} ${tx + 7} ${ty + 8} L ${tx} ${ty}`;
}

export function mouthSVG(id) {
  const place = placeFor(id) || "velar";
  const col = GREY[place];
  const [dx, dy] = DOT[place];
  const cue = cueFor(id, place);
  const svg = `<svg viewBox="0 0 120 70" width="100%" aria-hidden="true">
    <style>.tg{fill:none;stroke:#9a9a9a;stroke-width:1.1;stroke-dasharray:3 3;
      animation:tgd .8s ease-out both}
      @keyframes tgd{from{stroke-dashoffset:44;opacity:0}
      to{stroke-dashoffset:0;opacity:.85}}</style>
    <path d="M 10 35 Q 25 25 45 32 Q 70 38 95 35 Q 108 32 112 38 L 112 48 Q 108 58 90 58 Q 55 58 20 55 Q 8 52 10 42 Z"
      fill="#ffffff" stroke="#525252" stroke-width="1.5"/>
    <path d="M 18 33 L 22 30 M 26 32 L 30 29" stroke="#a3a3a3" stroke-width="1"/>
    <path d="${tonguePath(place)}" fill="none" stroke="#3f3f46" stroke-width="6.5" stroke-linecap="round"/>
    ${guidePath(place) ? `<path class="tg" d="${guidePath(place)}"/>` : ""}
    <circle cx="${dx}" cy="${dy}" r="3.4" fill="${col}" stroke="#171717" stroke-width="1"/>
    <text x="8" y="52" font-size="7" fill="#737373">lips</text>
    <text x="97" y="43" font-size="7" fill="#737373">throat</text>
  </svg>`;
  return { svg, place, cue, color: col };
}
