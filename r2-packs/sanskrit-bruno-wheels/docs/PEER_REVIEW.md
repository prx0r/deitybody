# Peer review — `prx0r/bruno` (2026-10-04)

## Verdict

The repo has the right high-level architecture:

- **Bruno = representation / imaginal runtime**
- **Pāṇini = transformation runtime**
- **SanskritHelp = daytime learning frontend**
- **StoneDoorway = night/experiential renderer**
- `WorldIR` + provenance is the correct boundary between historical source, linguistic fact, and personal mnemonic invention.

Do **not** merge these concepts into one historical doctrine. The repo is strongest when it treats them as independent compilers over the same knowledge graph.

## Strongest pieces

1. `sanskrit/BRUNO-WHEELS-IMAGINAL-COMPILER.md` correctly separates **knowledge** from **representation**.
2. `sanskrit/lab/panini_runtime.py` is honest that its √gam trace is a *teaching trace*, not a full Aṣṭādhyāyī implementation.
3. `triginta-sigilli-inventory.json` is useful as a repertoire of **information topologies**: chain, tree, field, sphere, graded ladder, combiner, interpreter.
4. `sourceAttested` vs `pedagogicalInvention` is essential and should survive every export.
5. The day→night split is clean: install/test structure by day; replay/reconstruct experientially at night.

## Fix before serious use

### 1. Replace the current pratyāhāra expansion data
The repo copy derived from SanskritHelp is not a canonical Pāṇinian expansion table. Example: its `ac` entry omits `i u ṛ ḷ`.

Recommendation:
- store the 14 Māheśvara/Śiva sūtras as the source string,
- generate pratyāhāra base spans algorithmically,
- separately model savarṇa expansion where a rule requires it,
- never hand-maintain arbitrary member lists as canonical truth.

This bundle therefore includes only a small, explicitly curated `key-pratyaharas.json`.

### 2. Audit starter dhātu metadata
Examples in the current SanskritHelp/Bruno data that should not be internalized:
- √gam → `gacchati` is annotated as a “redup. class” formation. Do not teach that.
- √dṛś → `paśyati` is annotated “causal-like.” Do not teach that.
- √labh is marked parasmaipada while its supplied form is `labhate`; for a beginner model, treat the common classical present as ātmanepada.

The wheel package intentionally uses a tiny curated root set and does **not** attempt free surface-form generation.

### 3. Current `varna_series` wheel has the wrong dimensionality
`default_series_wheel()` treats gutturals, dentals, labials as separate simultaneous axes. For learning Sanskrit articulation the natural deterministic wheel is:

`PLACE × MANNER → PHONEME`

Example:

`dental × voiced aspirated → dh`

That is the first wheel in this package.

### 4. Remove hard-coded mystical colour/body correspondences from the canonical layer
The repo marks them as pedagogical, which is good, but labels such as “green/heart series” are still too easy to reify.

Use:
- objective layer: articulation, acoustic features, script, Pāṇinian membership;
- subjective layer: **user-assigned** colour, emotion, body-locus, rhythm, image, texture.

### 5. Make every morphology wheel prediction-first
Bruno supplies the combinatorial interface. Pāṇini must decide legality.

Correct interaction:

`select root + operator → learner predicts → grammar runtime validates → transformation becomes reinforced`

Incorrect interaction:

`spin arbitrary rings → app invents plausible-looking Sanskrit`

### 6. Keep the “Thirty Seals” computational abstraction provisional
The repo already warns about this. Preserve three levels:
1. Bruno’s source text.
2. Historical interpretation.
3. Our computational abstraction.

Never silently promote level 3 into “what Bruno taught.”

## Historical peer-review note

Frances Yates' influential magical/talismanic reconstruction of Bruno is not the only modern reading. The Warburg Institute summarizes later work by Rita Sturlese and Francesco Torchia that gives the *De umbris* wheel a strong phonetic/foreign-word mnemonic interpretation. That is particularly relevant here: our Sanskrit adaptation is historically analogous in **function**, even though our Pāṇinian operator layer is entirely modern.

## Build recommendation

Treat `bruno` as the engine/schema repo and expose only these APIs to SanskritHelp:

- `encodeSound(atom, personalBindings)`
- `composeScene(units[])`
- `predictTransform(root, operator, context)`
- `validateTransform(prediction)`
- `compileVerse(analysis)`
- `exportStoneDoorway(memoryWorld)`

The frontend should never have to understand Bruno scholarship.
