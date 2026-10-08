# HANDOVER — deitybody

**Written:** 2026-10-04 (updated after audio + pathway work)
**Repo:** `/root/deitybody`
**Tests:** `python3 tests/test_maps.py` → **23 OK**
**Status script:** `python3 scripts/status.py`

---

## One-line handover

> **Abhinavagupta/Trika is the OS. Bruno is combinatorial memory machinery. Goswami is a tool. Learn each phoneme as sound + touch + locus (not anatomy). Practice = 2 phonemes/night, varṇamālā first. Reference audio is live on stonedoorway.com.**

---

## What this repo is

Phonemic-body training system:

```text
Mālinīvijayottaratantra
  → Tantrāloka / Tantrasāra / Parātrīśikāvivaraṇa
    → selected Vijñānabhairava dhāraṇās
```

Plus Flood’s entextualisation frame + Bruno dual-coordinate pedagogy + guided audio on Stonedoorway.

**Governing principle:** use Sanskrit learning as training in Abhinavagupta’s model of consciousness.

**Nyāsa means:** reconstructing the biological body as the body of Śakti by installing the matrix from which articulated experience arises — **not** “shoulder emits ka.”

**End = Pratyabhijñā recognition:** powers are expressions of consciousness, not external mechanisms.

---

## Locked decisions (do not reverse)

1. Textual spine: **MV → TĀ / Tantrasāra / PTv → selected VBT**
2. **Goswami = TOOL_NOT_BACKBONE**
3. Primary visual object = **Devanāgarī glyph**, not chakra color charts
4. Breath during phoneme install: **natural**; no forced 1:4:2 (TĀ 4.91)
5. Maps = tradition-specific entextualisation, **not biomedical anatomy**
6. Provenance: SOURCE_ATTESTED vs PEDAGOGICAL on associations
7. No Hz-per-phoneme doctrine · no medical claims · stop always available
8. **Mouth decides how it sounds. Locus decides where it is installed.**
   - `a` and `ā` = same open mouth quality; difference is **duration**
   - Touching a locus will lengthen the chant → pull back to short `a` when you mean `a`
9. Do not merge repos with bruno / stoned / sanskrithelp — plug via JSON contracts
10. Mālinī order only after Mātṛkā/varṇamālā is stable
11. Six-stage order is **pedagogical reconstruction** — components grounded, sequencing modern

---

## READ FIRST (order)

| # | File | Why |
|---|------|-----|
| 1 | `practice/START_HERE_TWO_PHONEMES.md` | **Owner practice start — Night 1 = a + ā** |
| 2 | `practice/NIGHT1_A_AA.md` | Tonight’s card + common confusion note |
| 3 | `docs/PATHWAY.md` | Full theory + 8 phases + six stages + MV 2.21 |
| 4 | `docs/ARCHITECTURE.md` | OS decision + spine |
| 5 | `data/architecture.json` | Machine architecture + starter + common_confusion |
| 6 | `data/six_stage_syllabus.json` | I Varṇa → VI Saṃhāra/sṛṣṭi |
| 7 | `data/anava_samavesa.json` | MV 2.21 five āṇava components |
| 8 | `corpus/extracts/FLOOD_TANTRIC_BODY.md` | Entextualisation + caveats |
| 9 | `corpus/extracts/MV_CH3_MALINI.md` | bhinna-yoni + body chart |
| 10 | `corpus/index/RESOURCES.md` | All corpus + live URLs |

---

## Practice path (what the owner is doing)

**Pace: 2 phonemes per night.** Do not chase altered states.

| Night | Pair | Loci |
|------:|------|------|
| **1** | **a ā** | **forehead · mouth/face** |
| 2 | i ī | right eye · left eye |
| 3 | u ū | ears |
| 4 | ṛ ṝ | nostrils |
| 5 | ḷ ḹ | cheeks (no dedicated .ogg — skip or nearest) |
| 6 | e ai | teeth |
| 7 | o au | lips |
| 8 | aṃ aḥ | crown · tongue |
| 9–14 | ka+kha … da+dha | first limb contrasts |

Calendar: `protocols/two_phoneme_nights.json`

**Per phoneme ladder (Stage I+II):**
1. Hear / say cleanly (mouth only)
2. Hear → touch locus → say
3. Hear → feel locus without touch → say
4. Internally generate → locus salient
5. Glyph only if 2–4 stable
6. One-line log

**Common confusion (already in cards + web page):**
Chanting `a` while attending forehead stretches into `ā`. Expected. Decouple **where you attend** from **how long you voice**.

Full install card (optional later): `practice/PHASE1_CHANT_BODY.md` · `protocols/phase1_chant_body.json`

---

## Audio — LIVE on Stonedoorway

**Reference page:**
```text
https://stonedoorway.com/reference/deitybody-nyasa
```

**Pattern the owner wants:**
```text
phoneme clip → locus TTS once → gap (you practice) → next
```
No in-track coaching loops. Replay file for another cycle.

| Track | URL | Time | Role |
|-------|-----|------|------|
| **Night 1 cycle** | https://stonedoorway.com/audio/nyasa/cycle_night1_a_aa.mp3 | 27s | **Primary reference** a→forehead·gap·ā→mouth and face |
| Vowels cycle | .../cycle_vowels.mp3 | 147s | 14 vowels, 7s gap each |
| Consonants cycle | .../cycle_consonants.mp3 | 126s | ka→dha |
| Full starter | .../cycle_full_starter.mp3 | 243s | all 26, 6s gap |
| Night 1 guided circuit | .../night1_guided_circuit.mp3 | 267s | full voice-guided session (secondary) |
| Sequences (no coach) | .../vowels_sequence… · consonants_sequence… | ~2min | clip→locus→5s gap |
| Deep drill loop | .../night1_a_aa_deep.mp3 | 224s | 24× a+forehead — **drill, not session** |
| Playlist JSON | .../playlist.json | — | item map |

Short alias: https://stonedoorway.com/nyasa

**Sources:**
- Phoneme clips: `/root/sanskrithelp/public/audio/phonemes/*.ogg`
- Locus TTS: espeak (`audio/loci/*.wav`). CF `aura-1` works with `{"text":"forehead"}` for optional regen
- Builders:
  - `scripts/build_simple_cycles.py` — **owner’s preferred format**
  - `scripts/build_night1_guided_circuit.py` — full coached circuit
  - `scripts/build_nyasa_audio.py` — deep drill / sequences
- Local audio: `audio/tracks/` · deployed: `stoned/dist/audio/nyasa/`

**Deploy (Stonedoorway Worker):**
```bash
cd /root/stoned/worker
set -a; while IFS= read -r line; do case "$line" in ''|'#'*) continue;; *=*) export "$line";; esac; done < /root/.r2-env; set +a
export CLOUDFLARE_API_TOKEN="${ICY_CF_API_TOKEN:-$CF_API_TOKEN}"
export CLOUDFLARE_ACCOUNT_ID="${ICY_CF_ACCOUNT_ID:-$CF_ACCOUNT_ID}"
npx wrangler deploy   # assets = ../dist
```
Note: `/user` API may 403; Worker deploy still succeeds. Custom domain `stonedoorway.com` attached.

---

## Key data maps

| File | Content |
|------|---------|
| `data/matrika_body_map.json` | 50 phonemes — vowels head/face + limb vargas + deep constituents |
| `data/malini_order.json` | na→pha order + MV 3.37–41 body chart |
| `data/phoneme_objects.json` | 41 dual-coordinate objects (production + tantric locus) |
| `data/articulation_matrix.json` | 5×5 mouth instrument + Bruno env/actor |
| `data/bruno_wheel.json` | 6-ring Bruno–Mātṛkā wheel |
| `data/body_overlays.json` | Selectable overlays — never one universal chakra chart |
| `data/pathway.json` | 8-phase machine pathway |
| `phoneme_grid.json` | Mātṛkā order + VBT saḥ/haṃ axis |

---

## Corpus / primary texts

**In repo `corpus/primary/`:**
- `paratrisika_jaideva_singh_text.pdf` (PTv, 42M) + djvu txt + R2/IA copies
- `the_tantric_body.pdf` (Flood 2006) + txt

**Extracts `corpus/extracts/`:**
- `FLOOD_TANTRIC_BODY.md` — entextualisation, nyāsa template, caveats
- `MV_CH3_MALINI.md` — bhinna-yoni, śākta-śarīra, body map, st.36
- `TA15_NYASA.md` — TĀ 15 karanyāsa / aṅganyāsa / Mālinīnyāsa
- `TA_KEY_LOCI.md` — TĀ 4.91 + sound-metaphysics anchors
- `TA_EXTRA_HITS.md` — auto deepdive hits

**On volume** `/mnt/HC_Volume_106959365/root/projects/`:
- `source-library/tantra/abhinavagupta/ahnika-15.txt` — nyāsa gold
- Dyczkowski vols + āhnika files
- Goswami Layayoga PDF (tool only)
- Lakshmanjoo VB

**Live stack audio:** `/root/sanskrithelp/public/audio/phonemes/` (49 files)

---

## Diagram validation (self-check, not guesswork)

```bash
cd /root/deitybody
python3 scripts/validate_diagrams.py   # exit 0 = PASS
```

Output: `corpus/canonical/DIAGRAM_VALIDATION.json`
Interactive wheels: `sanskrit.help/memory/bruno-wheels/` · body diagrams: `/memory/body-diagram.html`

## Verify

```bash
cd /root/deitybody
python3 tests/test_maps.py          # 23 tests
python3 scripts/status.py
python3 scripts/build_simple_cycles.py   # rebuild reference audio if needed
```

Online check:
```bash
curl -sSL -o /dev/null -w '%{http_code}\n' https://stonedoorway.com/reference/deitybody-nyasa
curl -sSL -o /dev/null -w '%{http_code}\n' https://stonedoorway.com/audio/nyasa/cycle_night1_a_aa.mp3
```

---

## Related repos (do not merge)

| Repo | Role |
|------|------|
| `/root/bruno` | Memory engine / Notoria / Pāṇini lab |
| `/root/stoned` | Stonedoorway web + Worker + dist (audio host) |
| `/root/stonedseed` | Kernel worlds/protocols |
| `/root/sanskrithelp` | Day frontend + phoneme audio |

---

## Next steps

| Priority | Task |
|----------|------|
| 1 | **Owner practices Night 1 cycle** — play `cycle_night1_a_aa.mp3`, do a/ā in the gaps, replay |
| 2 | Build next night’s cycle audio when they reach night 2 (`cycle` pattern, same builder) |
| 3 | Optional: CF aura locus voices (nicer “forehead”) — regenerate `audio/loci/*.wav` |
| 4 | Optional: night 2–8 cycle files batch-built |
| 5 | Deeper: extract TĀ 3.198–199 running English into `TA_KEY_LOCI.md` when browser available |
| 6 | Later: plug Day Protocol contracts into sanskrithelp |
| 7 | Later only: Goswami overlay / 1:4:2 integration after phonemic body is stable |

---

## What NOT to do

- Don’t rebuild theory when the owner asks for audio — they want **playable reference**
- Don’t put 24× loops as the primary track (that’s a drill bed)
- Don’t invent locus physiology texts don’t give
- Don’t make Goswami the backbone
- Don’t ship one universal chakra chart as “Abhinavagupta’s body”
- Don’t force breath ratios during phoneme install
- Don’t claim Hz-per-phoneme or medical effects

---

## One more line for the next agent

> Owner is **practicing**, not collecting. First need was **Night 1 audio**: phoneme → body part once → gap. That is live. Support the next cycle; don’t re-architect the OS unless asked.

---

## Session 2026-10-07 — v2 audio + build scripts (not committed; deitybody is working dir)

- `scripts/build_v2_ryan_cycles.py` (NEW): cycles with RyanNeural en-GB cues + verse-literal v2 loci. Consonant v1 taught apparatus (elbow/wrist/buttock) — v2 fixes it.
- `scripts/build_v2_guided_circuit.py` (NEW): same 144 events as guided v1, Ryan voice (8:36).
- Outputs in `audio/tracks/*_v2.mp3`, copied to sanskrithelp `public/memory/audio/` (shipped there).
- Locus TTS source of truth: espeak (v1) → edge-tts RyanNeural (v2, keyless lib). Phonemes stay human grid clips.
- TRANSCRIPTS live beside the audio in sanskrithelp (per-file contents + doctrine flags).

---

## Session 2026-10-07 — source-of-truth restored (files on disk; repo has no git/remote)

- `data/matrika_body_map.json` synced FROM sanskrithelp frozen v2 (was stale v0:
  va said "sinews / connective structures", missing freeze record + corrections).
  Rule going forward: **deitybody owns map + practice syllabi; sanskrithelp consumes.**
  Never edit the map in the app — edit here, re-freeze, propagate.
- `data/six_stage_syllabus.json` (v0 practice syllabus) stays the practice-side source;
  sanskrithelp `syllabus.json` (26-unit course index) references maps, doesn't replace them.
- NOTE: this repo has no git history and no remote. Nothing here is backed up
  except the disk. Init + push somewhere before this becomes the only copy of v2.
