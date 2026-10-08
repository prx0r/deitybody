# AGENTS.md — deitybody

> Trika phonemic-body OS. **Abhinavagupta is the operating system. Goswami is a tool.**

## Locked decisions

1. Textual spine: **MV → Tantrāloka / Tantrasāra / PTv → selected VBT**
2. Do **not** make Goswami/Laya Yoga the backbone
3. Primary visual object = **Devanāgarī glyph**, not chakra color charts
4. Breath during nyāsa: natural + phonation-lengthened exhale; **no forced 1:4:2**
5. TĀ 4.91: prāṇāyāma must not torment the body
6. Provenance: SOURCE_ATTESTED vs PEDAGOGICAL on every map/claim
7. No Hz-per-phoneme doctrine. No medical claims. Stop always available
8. Do not merge with bruno/stoned/sanskrithelp — plug via JSON contracts

## How to work here

| Do | Don’t |
|----|-------|
| Edit `data/*` maps carefully (50 phonemes each) | Silently “fix” body-map source variants |
| Keep extracts sourced to volume paths | Invent verses |
| Run `python3 -m tests.test_maps` after data edits | Ship broken counts |
| Prefer practice cards over new theory docs | Dump architecture essays into protocols |

## Key files

| Path | Why |
|------|-----|
| **`practice/PHASE1_CHANT_BODY.md`** | **START HERE — chant phonemes at body points** |
| **`docs/PATHWAY.md`** | Full 8-phase integrated pathway |
| `data/pathway.json` | Machine-readable pathway |
| `protocols/phase1_chant_body.json` | Phase 1 ritual protocol |
| `data/body_overlays.json` | Selectable body overlays (not one chakra chart) |
| `docs/ARCHITECTURE.md` | OS decision + spine |
| `data/matrika_body_map.json` | Install map |
| `data/malini_order.json` | Mālinī order + body |
| `corpus/extracts/FLOOD_TANTRIC_BODY.md` | Entextualisation + caveats |
| `corpus/extracts/TA15_NYASA.md` | Source passages |

## Verify

```bash
cd /root/deitybody
python3 tests/test_maps.py
python3 scripts/status.py
```

## Practice note

Owner practice order: **Phase 1 chant-at-body → Phase 2 dual coordinates → … → Pratyabhijñā recognition.**
Governing principle: *use Sanskrit learning as training in Abhinavagupta's model of consciousness.*
Nyāsa = install phonemic matrix as Śakti-body (Flood: entextualisation), not anatomy.
