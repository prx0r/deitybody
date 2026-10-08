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
