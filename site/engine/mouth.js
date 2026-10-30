/* mouthSVG — per-phoneme mouth position for the chant dock (right window).
   Origin: port of sanskrithelp components/ArticulationDiagram.tsx (sagittal
   outline + greyscale place palette), EXTENDED with a tongue stroke + contact
   dot so each phoneme shows WHERE the tongue/lips articulate — the part the
   original lacked. Sanskrithelp remains source-of-truth for phoneme assets;
   this is the plug copy (AGENTS: repos plug, never merge).

   PROVENANCE:
   - Consonant places = the 5×5 varga places (data/articulation_matrix.json,
     SOURCE_ATTESTED matrix: kaṇṭhya/tālavya/mūrdhānya/danta/oṣṭhya).
   - Vowel places = classical śikṣā five points (a=kaṇṭha throat, i=tālu
     palate, ṛ=mūrdhāni raised, ḷ=danta teeth, u=oṣṭhya lips) — SOURCE_ATTESTED
     traditional phonetics (Taittirīya/śikṣā lineage).
   - Long vowels sit at their short partner's point (classical quantity rule);
     e/ai grouped with the i-family, o/au with the u-family — PEDAGOGICAL
     grouping (labeled as such); aṃ = nasal close (velum), aḥ = open breath.
   Diagram is a teaching schematic, never anatomy. */

const GREY = {
  labial: "#fafafa", dental: "#a3a3a3", retroflex: "#737373",
  palatal: "#404040", velar: "#171717", throat: "#525252",
};

const CUES = {
  velar: "tongue back · kaṇṭhya",
  palatal: "tongue mid · tālavya",
  retroflex: "tip curled up · mūrdhanya",
  dental: "tip at teeth · danta",
  labial: "lips together · oṣṭhya",
  throat: "deep throat · kaṇṭha",
};

// contact point on the sagittal roof (viewBox 0 0 120 70): lips left, throat right
const DOT = {
  labial: [13, 39], dental: [25, 34], retroflex: [35, 31],
  palatal: [58, 35], velar: [92, 35], throat: [108, 45],
};

const VOWEL_PLACE = {
  a: "throat", "ā": "throat",
  i: "palatal", "ī": "palatal", e: "palatal", ai: "palatal",
  u: "labial", "ū": "labial", o: "labial", au: "labial",
  "ṛ": "retroflex", "ṝ": "retroflex",
  "ḷ": "dental", "ḹ": "dental",
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
  if (id === "aḥ") return "open — breath streams out";
  if (id === "aṃ") return "nose — velum down (nasal)";
  if (id === "kṣa") return "k then ś — back to mid";
  if ("e ai o au".split(" ").includes(id)) {
    return CUES[place] + " · " + (id === "e" || id === "ai" ? "i-family" : "u-family");
  }
  return CUES[place] || "";
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
    <path d="M 10 35 Q 25 25 45 32 Q 70 38 95 35 Q 108 32 112 38 L 112 48 Q 108 58 90 58 Q 55 58 20 55 Q 8 52 10 42 Z"
      fill="#ffffff" stroke="#525252" stroke-width="1.5"/>
    <path d="M 18 33 L 22 30 M 26 32 L 30 29" stroke="#a3a3a3" stroke-width="1"/>
    <path d="${tonguePath(place)}" fill="none" stroke="#3f3f46" stroke-width="6.5" stroke-linecap="round"/>
    <circle cx="${dx}" cy="${dy}" r="3.4" fill="${col}" stroke="#171717" stroke-width="1"/>
    <text x="8" y="52" font-size="7" fill="#737373">lips</text>
    <text x="97" y="43" font-size="7" fill="#737373">throat</text>
  </svg>`;
  return { svg, place, cue, color: col };
}
