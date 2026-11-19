#!/usr/bin/env python3
"""Mālinī chant ordering: the audio must follow the displayed order.

Regression: level 9 opened the Mālinī visual (edges ordered na→pha) but the
chant dock was hard-wired to the mātṛkā CHANT50 (starting a). These checks
pin the order data, the audio coverage, and the code path that joins them.
"""
from __future__ import annotations
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
SITE = ROOT / "site"


def load(p: Path):
    return json.loads(p.read_text(encoding="utf-8"))


class MaliniChantOrder(unittest.TestCase):
    def setUp(self):
        self.order = load(DATA / "malini_order.json")["order"]
        self.phonemes = load(SITE / "data" / "phonemes.json")["phonemes"]
        self.lab = (SITE / "lab.js").read_text(encoding="utf-8")

    def test_order_is_nadiphanta(self):
        self.assertEqual(len(self.order), 50)
        self.assertEqual(self.order[0], "na", "Mālinī begins with na (nādiphāntā)")
        self.assertEqual(self.order[-1], "pha", "Mālinī ends with pha")
        self.assertEqual(len(set(self.order)), 50, "no duplicate phonemes")

    def test_every_malini_phoneme_has_audio(self):
        have = {p["iast"]: (p.get("audio") or {}).get("reference") for p in self.phonemes}
        missing = [x for x in self.order if x not in have]
        self.assertEqual(missing, [], f"no registry record for {missing}")
        silent = [x for x in self.order if not have[x]]
        self.assertEqual(silent, [], f"no audio reference for {silent}")

    def test_chant_sequence_uses_malini_order(self):
        # The sequence builder must branch on the active map, not always CHANT50.
        self.assertIn("const malini = chantMap==='malini'", self.lab)
        self.assertIn("if(malini) return MALINI_ORDER.slice()", self.lab)
        self.assertIn("(malini?MALINI_ORDER:CHANT50).slice().reverse()", self.lab)
        # And the order must be loaded before a Mālinī round is built.
        self.assertIn("await MALINI_READY", self.lab)
        # The series menu must not offer mātṛkā varga cuts in Mālinī mode.
        self.assertIn("function syncChantSeriesUI", self.lab)
        self.assertIn("opt.hidden=malini&&mātṛkāOnly", self.lab)

    def test_display_and_audio_share_one_source(self):
        # Edges use MALINI_ORDER when cfg is malini; chant must too.
        self.assertRegex(self.lab, r"const order=\(cfg==='malini'&&MALINI_ORDER\)\?MALINI_ORDER:MATRIKA_ORDER")
        # The chant map is set from the lesson cfg, so level 9 selects malini.
        lessons = load(SITE / "data" / "lessons.json")["lessons"]
        l9 = next(x for x in lessons if x["n"] == 9)
        self.assertEqual(l9["title"], "Mālinī order")
        self.assertEqual(l9["actions"][0]["cfg"], "malini")


if __name__ == "__main__":
    unittest.main()
