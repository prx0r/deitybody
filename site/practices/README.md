# Practice score schema (machine-readable contract)

Scores are JSON an AI assistant (or TTS narrator) can read to guide a
practitioner in time: which region, what sensation, what words, when.

## Event types

| do | fields | effect |
|---|---|---|
| `info` | dev, iast, locus? | info panel text |
| `flash` | node, sound?, cue?, feel? | glyph lights (+clip if sound) |
| `pulse`/`sweep` | from, to (addresses), dur, color?, cue?, feel? | light travels; sweep also kindles endpoint regions |
| `ring` | at (address), cue?, feel? | expanding ring at address |
| `breath` | phase, from, to, dur, cue, feel | slow breath-paced pulse + guidance words |
| `splat` | node, dx?, dy? | fluid dye at node's screen pos |
| `audio` | url | play clip |
| `mpfire` | id | Middle Pillar orb kindle |

## Feel taxonomy (closed set — extend deliberately)

pressure · warmth · expansion · contraction · tingling · heaviness ·
lightness · dissolution · luminosity · pulsation · stillness ·
offering-release · pervasion · rising warmth · fullness · fullness gathering

## Addresses

`body/canonical-body.json` regions + centers (heart, crown, dvadasanta,
feet, …). Unknown addresses throw — scores fail loud, never silently.

## Guide mode

`guideOn` speaks every `cue` via local speechSynthesis in time with the
visuals. An external assistant can do the same by fetching the score JSON
and reading `t` + `cue` + `feel` + region addresses.

## Imported engine (from prx0r/the-library, vendored under site/engine/)

| File | Source | Use |
|---|---|---|
| `operators.json` | ontology-engine/canonical (16 ops) | player opcodes |
| `primitive-registry.json` | ontology-engine/canonical (24 archetypes) | primitive catalog (**missing `channel` — add as Tube/Curve**) |
| `particles/*` | skia-engine particles (system/emitters/fields/constraints) | pure-math core; `draw(ctx)` → Three.js Points next |
| `cymatics/*` | essayviz Chladni modes + superposition | real Chladni math for the cymatics panel |
| `audio/*` | cymatics phoneme/spectrum + runtime audio-features/router | phoneme acoustic analysis; feature→visual routing |
| `../body/reference/anatomy-geometry.json` | renderio anatomy-geometry.mjs (data only) | 24 landmarks, 7 cakra table, **12 dvādaśānta stations** |

Operator → visual mapping (initial): appear→flash · pulse→ringPing ·
recognize→hold+glow · expand/contract→scale field · dissolve→fade+release ·
suspend→stillness hold. Per visual-grammar rule: semantics decide, renderer interprets.

Reference score: `frameworks/trika/practices/spanda-triadic-pulse.json`
(ontology-engine example shape; breath-phased cues to be authored on top).
