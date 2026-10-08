#!/usr/bin/env python3
"""Print deitybody status."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def load(p):
    return json.loads((ROOT / p).read_text(encoding="utf-8"))

def main():
    arch = load("data/architecture.json")
    mal = load("data/malini_order.json")
    mat = load("data/matrika_body_map.json")
    grid = load("data/phoneme_grid.json")
    daily = load("protocols/daily_practice.json")
    objs = load("data/phoneme_objects.json")
    art = load("data/articulation_matrix.json")
    print("deitybody status")
    print("  OS:", arch["goswami_role"]["status"])
    print("  bruno:", arch.get("bruno_role", {}).get("status", "?"))
    print("  spine top:", arch["textual_spine"][0]["text"])
    print("  matrika phonemes:", grid["matrika_forward_count"])
    print("  malini order:", mal["order"][0], "→", mal["order"][-1], f"({len(mal['order'])})")
    print("  phoneme objects:", objs["count"], "(dual-coordinate)")
    print("  articulation matrix:", len(art["places"]), "places ×", len(art["manners"]), "manners")
    print("  daily steps:", len(daily["steps"]), "· ~", daily["duration_sec"]//60, "min")
    print("  vowel head loci sample:", mat["vowels"][0]["iast"], "=", mat["vowels"][0]["locus"])
    print("  PTv local: corpus/primary/paratrisika_jaideva_singh_text.pdf")
    pw = load("data/pathway.json")
    print("  pathway phases:", len(pw["phases"]))
    print("  START (2/night): practice/START_HERE_TWO_PHONEMES.md — Night1 a+ā")
    print("  NIGHT1 CARD: practice/NIGHT1_A_AA.md")
    print("  calendar: protocols/two_phoneme_nights.json (14 nights)")
    print("  stages: I Varṇa · II Sthāna → III Karaṇa → IV Dhyāna → V Uccāra → VI Saṃhāra/sṛṣṭi")
    print("  theory: docs/PATHWAY.md")
    print("  online: https://stonedoorway.com/reference/deitybody-nyasa")
    print("  audio:  https://stonedoorway.com/audio/nyasa/cycle_night1_a_aa.mp3  (primary reference)")
    print("  handover: HANDOVER.md")
    print("  nyasa:", pw["nyasa_meaning"]["is"][:70], "…")

if __name__ == "__main__":
    main()
