# VOLUME DEEPDIVE — what the attached library holds (surveyed 2026-10-30)

Base: `/mnt/HC_Volume_106959365/root/projects/`. NOTE: `source-library/INDEX.md`
sizes are stale (claims tantra/ 1.5G; du says 169M). Trust du below, not INDEX.

## 1. Project map (by size, live du)

| Project | Size | What it is |
|---------|------|------------|
| `patala/` | 5.6G | Translation corpus (Pāṭala working corpus: sivaqueue, L0 IAST, passages) |
| `source-library/` | 4.2G | THE shared text-source home (this guide's focus) |
| `renderio/` | 1.8G | Render packs (visual, not text) |
| `clean/` | 1.6G | Other project (authoring framework), not tantra |
| `essayviz-workspace/` | 1.5G | Essay viz workspace |
| `tantraloka/` | 883M | The TĀ project: essays, deepdives, goldrender, TTS/narration tooling |
| `reception/` | 335M | Social ingest, not source |
| `research-library/` | 150M | 162 research objects (ROs) |
| `media-os/` etc. | <150M | Tooling, not source |

## 2. source-library traditions (live du)

| Tradition | Size | Note |
|-----------|------|------|
| consciousness/ | 1.3G | 29-scholar library (Biernacki, Analayo…) — rasa/science-neuroscience relevant at the edges |
| frontier/ | 1.3G | Esoterica (Law of One, Steiner…), not tantra |
| platonism/ | 401M | Ficino/Plotinus/Iamblichus — comparative only |
| occult/ | 350M | Grimoires, Goswami (TOOL layer lives here: `occult/yoga/`) |
| sufism/ | 205M | Now also mirrored in R2 `atlas-sources/text/sufi/` |
| **tantra/** | **169M** | **The Trika core (this guide)** |
| buddhism/ | 44M | Analayo etc. — parked with the Trika-only pivot |
| acquisitions/ | 383M | Sanderson 367M + philosophy-encyclopedia 24M + vedic 10M |
| astrology/glossary/hermetica/modern | <30M | Marginal |

## 3. tantra/ contents (live du + files)

| Dir | Size | Contents |
|-----|------|----------|
| `abhinavagupta/` | 24M | TĀ complete + 37 āhnikas + Dyczkowski vols 1–11 + GRETIL TĀ. THE spine texts. |
| `texts-clean/` | 38M | Clean āhnikas, GRETIL TĀ/Tantrasāra/Vākyapadīya, Dyczkowski cleans, chunks |
| `hareesh-blog/` | 71M | 199 posts (2015–2026), 63 by topic + year archive. Topics: tantraloka(14), tantrasara(14), vbt(10), pratyabhijna(9), krama-kaula(5), spanda(3), twelve-kalis(3), shiva-sutras(1), upayas(1), kundalini, goddess-para, guru-disciple… |
| `source/` | 23M | `classical/` (2 epubs incl. Shaw Hellenic Tantra), `notes/` (~40 comparative/practice notes incl. laya-tantra-practice-guide, 36-tattvas, curriculum.md), `ratie_reason_revelation/` |
| `explained-hareesh/` | 6.3M | `tantraloka/` + `tantrasara/` chapter explainers (secondary, readable) |
| `lakshmanjoo/` | 4.7M | VB epubs + `vb_lakshmanjoo.json` (VBT source for v24 score verification) |
| `dyczkowski-translations/` | 2.8M | Spandakārikā, Doctrine of Vibration, Śivasūtra (full texts) |
| `matter-of-wonder/` | 28K | Biernacki RO README + extracted passages (camātkāra/panentheism) |
| `hermeneutics-of-absolute/` | 28K | Bäumer PTv study README + extracted passages (anuttara/SAUḤ/phonemic emanation) |
| `utpaladeva-ipk/` | 24K | ĪPK RO + commentary-notes (Torella-based; passages, not full text) |
| `trika/` | 8K | README index (paths partially stale — see §7) |
| EMPTY (4K): `utpaladeva/`, `ksemaraja/`, `jayaratha/`, `books/`, `notes/`, `comparative/` | — | Names reserved, no content. Gaps, not holdings. |

## 4. Krama holdings (the surprise — mostly in patala/, not tantra/)

`patala/data/corpus/passages/` JSONL, line counts:

| File | Lines | What |
|------|-------|------|
| `kubjikamata.jsonl` | 2437 | Kubjikāmata (large; Krama-adjacent Kaula mūla) |
| `kulasara.jsonl` | 711 | Kulasāra |
| `kramasadbhava.jsonl` | 563 | **Kramasadbhāva (Krama mūla)** |
| `cidgaganacandrika.jsonl` | 312 | **Cidgaganacandrikā (Krama, Jayaratha-adjacent)** |
| `isvarapratyabhijnavivrtivimarsini.jsonl` | 231 | IPVV (Abhinavagupta on Utpaladeva) |
| `timirodghatana.jsonl` | 231 | Timirodghāṭana |
| `maharthamanjari.jsonl` | 74 | **Mahārthamañjarī (Maheśvarānanda; Krama aesthetics)** |
| `tararahasya.jsonl` | 67 | Tārārahasya |

Plus `patala/data/corpus/companion-guides/`: Goodall editions (Nisvāsa, Pārakhya, Rauravāgama (!), Śivadharma) — primary Śaiva canon. Plus `sivaqueue2` targets/acquired (Siddhānta Āgamas: Kāmika, Ajita, Kriyākāṇḍakramāvalī…).

**IPVV translation status (corrected 2026-10-30 — it IS on R2):** the full layered
edition lives in the **`sanskritree` R2 bucket under `ipvv-translations/`** (229 objects):
L0 jsonl (145MB tarball), `t1-vol1/` (28 chunks), `t1-golden/` (35 chunks), `pilot/`
(109 files incl. full L2 reads), `artifacts/` (manifest, Vol-3 mined translations).
Primary Sanskrit (Muktabodha IAST: IPVV vols 1–3 M00020-22, IPV, Vimarśinīvyākhyā,
Akaumudī, Īśvarasiddhi, Parātrīśikāvivṛti/vivaraṇa/laghuvṛtti) + Ratié's 22 papers
per the anchor manifest. Plus `patala` bucket `public/published/ipvv/` (passages,
essays, clusters). The sanskritree *volume mount* is detached, but the R2 bucket
is the live copy — pull from there. Process layer (specs, audits, knowledge core)
is on this box at `/root/patalacheckpoints/translations/_stack/ipvv/`.

## 5. Research objects (research-library, 162 total — tantra-relevant)

Direct deitybody feeds: `ro-tantraloka-sound-metaphysics`, `-mantra-breath`, `-paratrisika-vivarana`, `-three-means`, `-initiation`, `-cosmology`, `-consciousness-states`, `-twelve-kalis`, `-reflection`, `-dialogical-revelation`, `-ontological-hierarchy`, `-matter-of-wonder`, `ro-lakshmanjoo-vijnana-bhairava`, `ro-lakshmanjoo-shiva-sutras`, `ro-utpaladeva-ipk`, `ro-layayoga-mantra-science`. Vol-specific: `-vol4`, `-vol7`, `-vol10`. Method: `ARG3-reflexion-proof-vs-IPK-1.5.11`.

**Ratié full apparatus (checked 2026-10-30, `research-library/recognition/`):** the complete Brill book in French (`books/Le-Soi-et-l-Autre-Ratie-2011.txt`, 37k lines) + full chapter-by-chapter English excavation (`RATIE-EXCAVATION-EN.md`) + per-chapter files (`ratie-chapters/CH0–CH10`) + literature review + breakdown + Torella-volume Ratié chapters (`ch6_ratie_other_streams`, `ch7_ratie_isvarasiddhi`). Integration essays triangulating **Ratié + Solms + IPVV**: `CONCORDANCE-Ratie-IPK-Solms`, `SOLMS-RATIE-IPK-SYNTHESIS` (in information-philosophy/solms/), `FULL-INTEGRATION-proofs-ratie-solms-stages-ipvv`, plus ~25 topic essays (`ESSAY-NONCONSTRUCTED-I`, `-KRAMA-IPVV`, `-SPANDA-IPVV`, `-SIVASUTRA-VB-IPVV`, `-TWO-ABHINAVAGUPTAS-IPVV-TANTRALOKA`, …). One-thesis summary per the excavation: Pratyabhijñā answers permanence/idealism/otherness/difference with one concept — svātantrya, the freedom of consciousness.

## 6. tantraloka/ project (883M — the other TĀ codebase)

Essays + deepdives + `goldrender/` (incl. `matter_wonder_platinum.py`) + `narration/` + `format_tts.py` + `extract_verses.py` + `notes/` (36-tattvas, layayoga guides, `pushing-ipvv/`, `recognitionexpounded/`, `tantraloka-decoded.md`, TĀ↔X mappings). NOTE: `read-clean/`, `texts-clean/`, `volumes/` dirs are EMPTY here — live copies are under `source-library/tantra/{abhinavagupta,texts-clean}/`. The `trika/README.md` paths (`/root/projects/tantraloka/...`) are stale on this box.

## 7. Secondary / scholarly anchors

- `acquisitions/sanderson/`: 53-work manifest (Śaiva Age, traditions, exegesis, academia_bundles 207 PDFs). The scholarship backbone.
- `acquisitions/philosophy-encyclopedia/`: Potter vols 1–5,7–10 + standalone (bibliography mine).
- Hareesh explainers + 199-post blog: the readable secondary layer (TĀ ch.1/29, Tantrasāra chapters, Krama, VBT).

## 8. Priority mining queue (mapped to the 20 todos)

1. VBT verify: `lakshmanjoo/vb_lakshmanjoo.json` + `ro-lakshmanjoo-vijnana-bhairava` (todo: v24 check)
2. Japa doctrine: HTW ch.7 already extracted; Alper still missing (acquire)
3. Krama mūlas: patala `kramasadbhava` + `cidgaganacandrika` + `maharthamanjari` jsonls + `ro-tantraloka-twelve-kalis` + hareesh twelve-kalis/krama posts
4. Upāya ladder: `ro-tantraloka-three-means` + hareesh upayas post
5. Initiation/grace: `ro-tantraloka-initiation` (backs the lock)
6. Mālinī loci: MV full text still missing everywhere (top acquisition)
7. Stotra audio: Vāgdhenu side; lab mapping needs syllable timings (nothing on volume generates these — build, don't mine)
8. TTS/narration patterns: `tantraloka/format_tts.py` + `narration/` conventions before further guide renders
