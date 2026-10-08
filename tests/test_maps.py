#!/usr/bin/env python3
"""Integrity tests for deitybody maps, protocols, Bruno×Abhinava objects."""
from __future__ import annotations
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
PROTO = ROOT / "protocols"


def load(name: str, base: Path = DATA):
    return json.loads((base / name).read_text(encoding="utf-8"))


class TestMaps(unittest.TestCase):
    def test_architecture_spine_and_bruno(self):
        arch = load("architecture.json")
        self.assertEqual(arch["goswami_role"]["status"], "TOOL_NOT_BACKBONE")
        self.assertEqual(arch["bruno_role"]["status"], "COMBINATORIAL_MACHINERY_NOT_ONTOLOGY")
        self.assertIn("coordinated event", arch["principle"])
        tiers = [t["tier"] for t in arch["textual_spine"]]
        self.assertEqual(tiers[0], 1)

    def test_matrika_counts_and_unique_iast(self):
        m = load("matrika_body_map.json")
        vowels = m["vowels"]
        vargas = m["vargas"]
        self.assertEqual(len(vowels), 16)
        total = len(vowels) + sum(len(v["sequence"]) for v in vargas)
        self.assertEqual(total, 50)
        all_p = [v["iast"] for v in vowels]
        for v in vargas:
            all_p.extend(s["iast"] for s in v["sequence"])
        self.assertEqual(len(all_p), len(set(all_p)), "duplicate iast in matrika map")

    def test_malini_order_and_body(self):
        mal = load("malini_order.json")
        order = mal["order"]
        body = mal["body_map"]
        de = mal["devanagari"]
        self.assertEqual(len(order), 50)
        self.assertEqual(len(set(order)), 50)
        self.assertEqual(order[0], "na")
        self.assertEqual(order[-1], "pha")
        for p in order:
            self.assertIn(p, body, f"missing body for {p}")
            self.assertIn(p, de, f"missing devanagari for {p}")

    def test_malini_zones_cover_order(self):
        mal = load("malini_order.json")
        zones = mal["zones_for_month2"]
        covered = []
        for k in ("week1_head", "week2_mouth_shoulders_arms", "week3_heart_torso", "week4_pelvis_legs"):
            covered.extend(zones[k])
        self.assertEqual(sorted(covered), sorted(mal["order"]))

    def test_phoneme_grid(self):
        g = load("phoneme_grid.json")
        self.assertEqual(g["matrika_forward_count"], 50)
        self.assertEqual(len(g["matrika_order"]), 50)
        self.assertEqual(g["vbt_axis"]["outward"], "saḥ")
        self.assertEqual(g["vbt_axis"]["inward"], "haṃ")

    def test_articulation_matrix(self):
        art = load("articulation_matrix.json")
        self.assertEqual(len(art["places"]), 5)
        self.assertEqual(len(art["manners"]), 5)
        for place_id, phs in art["vargas"].items():
            self.assertEqual(len(phs["phonemes"]), 5, place_id)

    def test_phoneme_objects_dual_coords(self):
        objs = load("phoneme_objects.json")
        self.assertEqual(objs["count"], 41)
        self.assertEqual(len(objs["objects"]), 41)
        cons = [o for o in objs["objects"] if o["class"] == "consonant"]
        vowels = [o for o in objs["objects"] if o["class"] == "vowel"]
        self.assertEqual(len(cons), 25)
        self.assertEqual(len(vowels), 16)
        for o in objs["objects"]:
            self.assertIn("production_locus", o)
            self.assertIn("tantric_locus", o)
            self.assertIn("devanagari", o)
            self.assertIn("imaginal_signature_rule", o)
            self.assertTrue(o["devanagari"])
        # gha dual coords present (verse-literal v2: TĀ 15.118, resolved 2026-10-05)
        gha = next(o for o in objs["objects"] if o["iast"] == "gha")
        self.assertEqual(gha["devanagari"], "घ")
        self.assertIn("aspirated", gha["manner_en"])
        self.assertIn("fingers", gha["tantric_locus"])

    def test_bruno_wheel_rings(self):
        w = load("bruno_wheel.json")
        names = [r["name"] for r in w["rings"]]
        self.assertEqual(names[0], "centre")
        self.assertIn("glyph", names)
        self.assertIn("articulation", names)
        self.assertIn("tantric_locus", names)
        self.assertIn("mnemonic_image", names)


class TestFlood(unittest.TestCase):
    def test_flood_pdf_and_extract(self):
        primary = ROOT / "corpus" / "primary"
        pdf = primary / "the_tantric_body.pdf"
        self.assertTrue(pdf.exists())
        self.assertGreater(pdf.stat().st_size > 1_000_000 and pdf.stat().st_size or 0, 1_000_000)
        text = (ROOT / "corpus" / "extracts" / "FLOOD_TANTRIC_BODY.md").read_text(encoding="utf-8")
        self.assertIn("entextualisation", text)
        self.assertIn("nyāsa", text)
        self.assertIn("not a given that is discovered", text.replace("**", ""))
        # flood does not claim to provide matrika maps
        self.assertIn("NOT the phoneme maps", text)

    def test_architecture_has_flood_support(self):
        arch = load("architecture.json")
        self.assertIn("flood_tantric_body", arch.get("corpus_support", {}))
        self.assertIn("entextualisation", str(arch["corpus_support"]))


class TestProtocols(unittest.TestCase):
    def test_daily_practice(self):
        d = load("daily_practice.json", PROTO)
        self.assertEqual(d["os"], "Abhinavagupta/Trika")
        types = [s["type"] for s in d["steps"]]
        self.assertIn("phonetic_embodiment", types)
        self.assertIn("nyasa_external", types)
        self.assertIn("nyasa_internal", types)
        self.assertIn("vbt_breath_axis", types)

    def test_curriculum_months(self):
        c = load("month_curriculum.json", PROTO)
        months = {m["month"]: m for m in c["months"] if "month" in m}
        self.assertIn(1, months)
        self.assertIn(2, months)
        self.assertIn(3, months)

    def test_vbt_selected(self):
        v = load("vbt_selected.json", PROTO)
        ids = {x["dhāraṇā"] for x in v["selected"]}
        self.assertIn(24, ids)
        self.assertIn(4, ids)


class TestCorpus(unittest.TestCase):
    def test_ptv_present(self):
        primary = ROOT / "corpus" / "primary"
        pdfs = list(primary.glob("*.pdf"))
        self.assertTrue(pdfs, "PTv PDF missing from corpus/primary")
        self.assertTrue(any(p.stat().st_size > 1_000_000 for p in pdfs))

    def test_mv_extract_mentions_key_stanza(self):
        text = (ROOT / "corpus" / "extracts" / "MV_CH3_MALINI.md").read_text(encoding="utf-8")
        self.assertIn("bhinna-yoni", text)
        self.assertIn("śākta-śarīra", text)
        self.assertIn("na ṛ ṝ ḷ ḹ", text)


class TestPathway(unittest.TestCase):
    def test_pathway_json(self):
        pw = load("pathway.json")
        self.assertEqual(len(pw["phases"]), 8)
        self.assertEqual(pw["phases"][0]["id"], 1)
        self.assertIn("Chant phonemes at body points", pw["phases"][0]["title"])
        self.assertIn("reconstructing", pw["nyasa_meaning"]["is"].lower())
        self.assertEqual(len(pw["sadadhvan"]["pairs"]), 3)
        self.assertIn("parā", pw["levels_of_speech"]["order_manifest"])
        self.assertEqual(pw["aham_master_key"]["phonematics"]["a"], "beginning / emergence")

    def test_phase1_protocol(self):
        d = load("phase1_chant_body.json", PROTO)
        self.assertEqual(d["phase"], 1)
        types = [s["type"] for s in d["steps"]]
        self.assertIn("vowel_install_head", types)
        self.assertIn("varga_chant_right", types)
        self.assertIn("totalization_pass", types)
        self.assertIn("aham_contraction", types)
        vowels = next(s for s in d["steps"] if s["type"] == "vowel_install_head")
        self.assertEqual(len(vowels["order"]), 16)
        self.assertEqual(vowels["order"][0]["iast"], "a")
        self.assertEqual(vowels["order"][0]["locus"], "forehead")

    def test_overlays(self):
        ov = load("body_overlays.json")
        ids = [o["id"] for o in ov["overlays"]]
        self.assertIn("phonemic", ids)
        self.assertIn("sensory_deity", ids)
        self.assertIn("speech_levels", ids)

    def test_practice_cards_exist(self):
        for rel in [
            "docs/PATHWAY.md",
            "practice/PHASE1_CHANT_BODY.md",
            "protocols/phase1_chant_body.json",
            "data/pathway.json",
            "data/body_overlays.json",
        ]:
            self.assertTrue((ROOT / rel).exists(), rel)
        text = (ROOT / "docs" / "PATHWAY.md").read_text(encoding="utf-8")
        self.assertIn("body of Śakti", text)
        self.assertIn("ṣaḍadhvan", text.lower())
        self.assertIn("aham", text)
        self.assertIn("Pratyabhijñā", text)


class TestStarter(unittest.TestCase):
    def test_mv221_components(self):
        d = load("anava_samavesa.json")
        ids = [c["id"] for c in d["components"]]
        self.assertEqual(ids, ["uccāra", "karana", "dhyana", "varna", "sthana_prakalpana"])
        self.assertIn("āṇava", d["en"])

    def test_six_stages(self):
        s = load("six_stage_syllabus.json")
        self.assertEqual(len(s["stages"]), 6)
        self.assertEqual(s["stages"][0]["id"], "I")
        self.assertEqual(s["stages"][0]["name"], "Varṇa")
        self.assertEqual(s["stages"][1]["name"], "Sthāna")
        self.assertIn("touch", s["rule_first"].lower())

    def test_calendar_night1(self):
        cal = load("two_phoneme_nights.json", PROTO)
        self.assertEqual(cal["where_to_begin"]["pair"], ["a", "ā"])
        n1 = cal["nights"][0]
        self.assertEqual(n1["pair"], ["a", "ā"])
        self.assertEqual(n1["items"][0]["locus"], "forehead")
        self.assertEqual(n1["items"][1]["locus"], "mouth/face")
        self.assertEqual(len(cal["nights"]), 14)
        # vowels nights 1-8
        vowel_nights = [n for n in cal["nights"] if n["night"] <= 8]
        self.assertEqual(len(vowel_nights), 8)

    def test_starter_cards(self):
        for rel in [
            "practice/START_HERE_TWO_PHONEMES.md",
            "practice/NIGHT1_A_AA.md",
            "protocols/two_phoneme_nights.json",
            "data/six_stage_syllabus.json",
            "data/anava_samavesa.json",
        ]:
            self.assertTrue((ROOT / rel).exists(), rel)
        text = (ROOT / "practice" / "START_HERE_TWO_PHONEMES.md").read_text(encoding="utf-8")
        self.assertIn("Night 1", text)
        self.assertIn("a", text)
        self.assertIn("forehead", text)
        self.assertIn("touch", text.lower())


class TestCanonical(unittest.TestCase):
    def test_volume_canonical_locked(self):
        arch = load("architecture.json")
        c = arch.get("canonical", {})
        self.assertIn("Tantrāloka", c.get("decision", ""))
        self.assertTrue(c.get("volume_root", "").endswith("source-library/tantra"))
        # spine marks Tantraloka canonical
        ta = [x for x in arch["textual_spine"] if "Tantr" in x.get("text","")]
        self.assertTrue(any(x.get("canonical") for x in ta), "Tantraloka not marked canonical on spine")

    def test_canonical_extract_exists(self):
        p = ROOT / "corpus/canonical/TANTRALOKA_CANONICAL.md"
        self.assertTrue(p.exists())
        text = p.read_text(encoding="utf-8")
        self.assertIn("CANONICAL", text)
        self.assertIn("TĀ 15", text)
        self.assertIn("TĀ 4.91", text)
        idx = json.loads((ROOT / "corpus/canonical/volume_index.json").read_text(encoding="utf-8"))
        self.assertGreaterEqual(len(idx["ahnika_files"]), 30)
        self.assertIn("CANONICAL", idx["canonical_decision"])
        self.assertIn("Tantrāloka", idx["canonical_decision"])


if __name__ == "__main__":
    rc = unittest.main(verbosity=2, exit=False).result.wasSuccessful()
    sys.exit(0 if rc else 1)
