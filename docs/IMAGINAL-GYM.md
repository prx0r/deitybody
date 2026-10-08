# Imaginal Gym — SPEC (not yet built; Matrika body stays the focus)

Foundational imagery training inside DeityBody: construct → sustain → move →
transform → integrate → apply. A learner who can hold a luminous point without
the screen can install a phoneme; one who can't should train here first.

## Status

SPEC ONLY. No code, no curriculum content, no wearables. The atlas (Trika
phoneme install) remains the active build. This doc exists so the Gym, when
built, plugs into the same engine instead of becoming a second app.

## The loop (per drill)

Show → Imagine → Withdraw → Test → Adapt → repeat until reproducible
without the display.

## Six stages

1. **Establish** — luminous point at a named locus. Observe position/colour/
   brightness/size; recreate mentally.
2. **Sustain** — reference fades over lengthening intervals; hold without support.
3. **Move** — point travels chest/head/abdomen/hands; rehearse, reconstruct unwatched.
4. **Transform** — change shape/brightness/number/orientation/colour in place.
5. **Integrate** — coordinate image with felt sensation or unforced breath rhythm.
6. **Apply** — enter a source-verified practice (Mātṛkā placement, lotus, …).

## Tracked skills (optimize control, NOT vividness)

stability · spatial precision · manipulation · reconstruction · transfer.
Allow nonvisual strategies throughout (spatial knowing, felt sense —
aphantasia is a difference, not a failure).

## Engine mapping (how it reuses DeityBody)

| Gym need | Engine piece (exists) |
|---|---|
| show/atlas locus | Body Graph regions + `highlightRegion` tool |
| timed fade/move | Session clock + scores (`pulse`, `sweep`, `ring`) |
| withdraw/test prompts | `cue` events + Guide voice |
| report stability/clarity/effort | `recordExperience` (session-stamped) |
| adapt difficulty | `adjustGuidance` + score parameters |
| gate to atlas practice | Stage 6 links a practice id (e.g. Trika install) |

Scores gain two future event types: `fade {target, dur}` (scaffold withdrawal)
and `prompt {kind: report-stability|report-clarity|report-effort}`.

## Wearable honesty (locked constraints for later)

- Physiology (breath/HR/EEG) NEVER certifies imagery success.
- Consumer meditation neurofeedback is unproven (2025 meta-analysis) — no claims.
- Sensors contribute `sensors.observedState`; they never rewrite instruction.
- Breath-audio timing aid is allowed; "detection of visualization" is not.
