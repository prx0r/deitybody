# CATALOG — backend spec (northstar-oriented)

> North star: `northstar.md`. Read it first. This file engineers toward it.
> Rule: **text or method in → syllabus out → each practice a visualisation
> mapping their system onto our body, in one standard grammar.**

---

## 1. Taxonomy (nesting the grid renders)

```text
tradition            e.g. trika, buddhism, occult, yoga, nightly, movement
 └ school            optional mid-level, e.g. theravada, tibetan (under buddhism)
    └ source         the full text or method: book, teacher, oral instruction
       └ course      ordered syllabus, e.g. matrika, middle-pillar
          └ phase   gated step with a graduation test
             └ practice   ONE runnable: body preset + sound + timed score
```

Grid rule: **levels collapse when there is only one child.**
A tradition with no schools renders courses directly (today's menu).
A course with one phase renders its practice directly. The frontend never
hardcodes depth — it walks the tree.

Every node carries `status`. Statuses:

| status | meaning |
|--------|---------|
| `live` | reviewed, on the menu, playable |
| `verify` | encoded, needs checking against source before teaching |
| `stub` | structure only, no content yet |
| `planned` | spec'd, not started |
| `needs_review` | compiler output in `_incoming/`, NEVER auto-live |

Promotion is one-way by human review: `needs_review → verify → live`.
Nothing promotes itself.

---

## 2. Pipeline: text → visualisation

```text
full text / method
  → scripts/text_to_graph.py        skeleton into site/frameworks/_incoming/<id>/
  → human review                     loci, timings, cues, provenance
  → scripts/compile_syllabus.py      score skeleton into practices/
  → human review                     fill TODO loci, verify against source
  → catalog entry                    status verify → live
  → grid shows it                    tradition → school → course → phase → play
```

The two scripts already exist. What changes: their outputs must conform
to the schemas below, and every score carries provenance
(`SOURCE_ATTESTED` vs `PEDAGOGICAL` vs `needs_review`).

---

## 3. Score grammar v1 (standardised visualisation language)

A score is a JSON list of timed events on one clock. One player runs all
traditions (`runScore`). New traditions add **data**, never new machinery,
unless a new op is specified here first.

Event envelope (all ops):

| field | required | meaning |
|-------|----------|---------|
| `t` | yes | seconds from score start |
| `do` | yes | op name |
| `cue` | no | spoken/shown instruction line |
| `feel` | no | felt sense to notice (never a medical claim) |

Ops:

| `do` | params | does |
|------|--------|------|
| `info` | `dev`, `iast`, `locus` | text panel: glyph + name + place |
| `flash` | `node`, `sound?`, `shape?`, `color?` | light one body point (+ its clip) |
| `pulse` | `from`, `to`, `dur?` | travelling pulse between regions |
| `sweep` | `from`, `to`, `dur?` | pulse + wakes the phonemes at both ends |
| `ring` | `at`/`y` | expanding ring at a region |
| `breath` | `phase` (inhale/exhale/hold), `from`, `to`, `dur` | pacer + breath sound + pulse |
| `field` | `dur?` | whole-body suffusion |
| `splat` | `node`, `dx?`, `dy?` | decorative splash at a point |
| `audio` | `url` | play a clip/track |
| `mpfire` | `id` | light one Middle-Pillar centre |

Regions are address-space names (`crown`, `heart`, `feet`, …), never pixels.
A practice declares its body preset separately (`fw` + `cfg`): the score
assumes the body is already loaded. **Load first, then play.**

Reserved namespaces (specified, not implemented — see §5):
`guide.*` (speak/listen), `sense.*` (wearable/voice sample), `motion.*`
(movement cue). Nobody invents sibling ops outside this file.

---

## 4. Catalog schema (machine-readable taxonomy)

`site/data/catalog.json`, id `catalog-v1`. Shape:

```json
{
  "id": "catalog-v1",
  "traditions": [{
    "id": "buddhism", "name": "Buddhism", "status": "planned",
    "schools": [{
      "id": "theravada", "name": "Theravada", "status": "verify",
      "sources": [{"id": "ajahn-lee-m1", "kind": "method",
                   "title": "Ajahn Lee Method 1", "status": "verify"}],
      "courses": [{
        "id": "breath-energy", "title": "Breath energy course",
        "status": "verify",
        "phases": [{
          "id": "aj1", "title": "Phase 1 — Breath energy",
          "graduation": "…",
          "practices": [{"id": "ajahn-m1", "fw": "theravada",
                         "score": "frameworks/theravada/practices/ajahn-lee-1.json",
                         "status": "verify"}]
        }]
      }]
    }]
  }]
}
```

Node fields: `id` (unique within its level), `title`/`name`, `desc`,
`status`, children. A phase without its own `status` inherits its course's.
Practice fields: `fw`, `cfg?`, `score?`, `chant?`,
`audio?`, `duration_min?`, `status`. A practice with no `score`/`chant`
yet is `planned` — the grid shows it greyed, never playable.

`site/data/traditions.json` (menu-v2) stays the live menu until the
frontend migrates to the catalog. Migration = menu walks catalog instead
of traditions; no menu logic changes otherwise.

---

## 5. Future hooks (reserved, not built)

- **nightly** — reserved tradition id. Session kind `day|night` on every
  practice (default `day`). Night practices get slower timings, no sudden
  light. Nothing time-gates the user; the kind only tunes defaults.
- **movement** — reserved tradition id + `motion.*` op namespace
  (cue a posture/gesture; body preset includes pose). Pose system already
  exists (`standing|seated|lying`); movement extends it, never forks it.
- **realtime AI guide** — reserved op namespaces `guide.*` (say a line,
  listen for a reply) and `sense.*` (sample wearables/voice). Engine hooks
  exist as stubs (`engine/sensors.js`: sim/BLE/Muse). Rules, locked:
  explicit consent per session; sensors **never certify experience**
  (same rule as today); guide lines are cues, not claims; every AI-driven
  branch logged as `PEDAGOGICAL`. No implementation until the catalog +
  grammar above are stable — the guide can only say lines and trigger ops
  that already exist here.

---

## 6. Worked example (the pattern every new text follows)

1. Pick the text: e.g. Quariae Apprentice module on the Middle Pillar.
2. `text_to_graph.py` → `_incoming/quariae-mp/` skeleton (`needs_review`).
3. Reviewer maps Quariae centres to our address space, sets timings/cues.
4. `compile_syllabus.py` → score skeleton; reviewer fills TODOs, marks
   provenance per line (Quariae text vs our pedagogy).
5. Catalog entry under `occult → quariae → middle-pillar course → phases`,
   status `verify`, then `live` after a second read against the source.
6. Grid shows: Occult → Quariae → Middle Pillar → Phase 1 → ▶ Play.
   No code changes. That is the whole point.
