# Sanskrit as formal language → inhabitable geometry

## Existing computational substrate

We should not rewrite Sanskrit grammar from scratch.

- **Vidyut** is the best candidate for a Pāṇinian morphology backend: word generation, reverse lookup, sandhi, segmentation, transliteration, meter, and—critically—`vidyut-prakriya`, which emits a rule-by-rule *prakriyā* history.
- **Sanskrit Heritage Platform** supplies mature finite-state/relational morphology, segmentation, sandhi-viccheda and shallow semantic-role analysis.
- **Samsaadhanii** supplies Pāṇinian morphological analysis/generation, sandhi, compound processing, parsing and Aṣṭādhyāyī simulation.
- **SanskritShala** supplies neural segmentation, morphological tagging, dependency parsing and compound-type identification.
- **UD Sanskrit** gives a portable dependency/morphology graph format.

There is no one universal Sanskrit "bytecode". This project adds an application-specific IR that can ingest any of those outputs.

## The compiler contract

```text
Sanskrit text
  ↓
segment / analyze / derive
  ↓
SanskritWorldIR                     ← shared objective representation
  ↓
deterministic geometry compiler
  ↓
World JSON                          ← same analyzed verse = same skeleton
  +
MemoryOverlay                       ← colour / rhythm / body / image / emotion
  ↓
SanskritHelp / StoneDoorway / imagination
```

## Geometry rules v0.1

- **Phonological floor**: `place × manner` gives the fixed 5×5 consonant/nasal matrix.
- **Vowel ring**: fixed base sound ring around the floor. Future version should represent all 14 Māheśvara-sūtras as traversable arcs.
- **Surface promenade**: words of the current verse occupy an ordered ring at `z=2`.
- **Lexical inhabitants**: roots and lemmas live inward/upward from their surface words. A root is a persistent Bruno-style agent.
- **Pāṇinian derivation**: each rule application becomes a `Catena` node between root and surface form.
- **Sandhi**: boundary transformations are literal gates between words.
- **Kāraka/event geometry**: verbal predicates become event hubs; kartṛ/karman/karaṇa/sampradāna/apādāna/adhikaraṇa occupy fixed semantic sectors around them.
- **Concept dome**: philosophical/conceptual graph occupies the upper layer.

This is Rowe's *compiler principle* generalized: formal relations determine architecture. Bruno supplies loci/images/bindings and combinatorial manipulation. Neither changes the linguistic facts.

## Why the overlay is separate

The shared shell should be teachable, testable and portable. Your private experience can attach:

- colour
- emotion
- body locus
- rhythm
- tone
- motion
- texture
- image/character

but those never rewrite a Pāṇinian rule, morphological tag, dependency or coordinate.

That means ten users can inhabit recognizable versions of the **same Sanskrit architecture**, while each develops a personal phenomenal surface.

## Generalization: Mind Monastery

The compiler can later become:

```text
FormalKnowledgeIR → deterministic WorldGeometry + PersonalOverlay
```

For Buddhist systems, the invariant shell might be generated from e.g. dependent-origination relations, Abhidharma taxonomies, path/stage structures, text dependencies, or meditative state-transition graphs. The domain supplies its formal ontology; StoneDoorway supplies inhabitation.
