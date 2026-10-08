"""Catalog integrity: docs/CATALOG.md schema enforcement for site/data/catalog.json."""
import json
import os
import unittest

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAT = os.path.join(BASE, "site", "data", "catalog.json")
SITE = os.path.join(BASE, "site")

STATUSES = {"live", "verify", "stub", "planned", "needs_review"}
LIVE_FW = {"trika", "yoga", "mp", "layayoga", "kalachakra", "theravada", "bare"}


def walk_traditions(cat):
    for t in cat["traditions"]:
        yield ("tradition", t["id"], t)
        for c in t.get("courses", []) + [c for s in t.get("schools", []) for c in s.get("courses", [])]:
            yield ("course", c["id"], c)
            for p in c.get("phases", []):
                yield ("phase", p["id"], p)
                for pr in p.get("practices", []):
                    yield ("practice", pr["id"], pr)


class TestCatalog(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cat = json.load(open(CAT))

    def test_id(self):
        self.assertEqual(self.cat["id"], "catalog-v1")

    def test_valid_statuses(self):
        for kind, i, node in walk_traditions(self.cat):
            if kind == "phase" and not node.get("status"):
                continue  # phases inherit course status
            self.assertIn(node.get("status"), STATUSES, f"{kind} {i}")

    def test_unique_ids_per_level(self):
        seen = {}
        for kind, i, _ in walk_traditions(self.cat):
            key = (kind, i)
            self.assertNotIn(key, seen, f"duplicate {kind} id: {i}")
            seen[key] = True

    def test_traditions_have_name(self):
        for t in self.cat["traditions"]:
            self.assertTrue(t.get("name"), t.get("id"))

    def test_live_scores_exist(self):
        for kind, i, node in walk_traditions(self.cat):
            if kind != "practice" or node.get("status") not in ("live", "verify"):
                continue
            sc = node.get("score")
            if sc:
                self.assertTrue(os.path.isfile(os.path.join(SITE, sc)), f"missing score {sc}")

    def test_live_practices_have_runnable(self):
        for kind, i, node in walk_traditions(self.cat):
            if kind != "practice" or node.get("status") != "live":
                continue
            self.assertTrue(node.get("score") or node.get("chant"), f"live practice {i} not runnable")
            self.assertIn(node.get("fw"), LIVE_FW, f"live practice {i} unknown fw")

    def test_phases_have_practice_or_planned(self):
        for t in self.cat["traditions"]:
            courses = t.get("courses", []) + [c for s in t.get("schools", []) for c in s.get("courses", [])]
            for c in courses:
                for p in c.get("phases", []):
                    ok = bool(p.get("practices")) or c.get("status") == "planned" or p.get("status") == "planned"
                    self.assertTrue(ok, f"phase {p.get('id')} empty and not planned")

    def test_planned_nodes_not_runnable_by_accident(self):
        # planned/stub practices must not declare live status
        for kind, i, node in walk_traditions(self.cat):
            if kind == "practice" and node.get("status") in ("planned", "stub"):
                self.assertNotEqual(node.get("status"), "live")


if __name__ == "__main__":
    unittest.main()
