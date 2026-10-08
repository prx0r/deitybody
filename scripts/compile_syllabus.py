"""Compile a reviewed syllabus.json into a practices/*.json score skeleton.
Reviewer must set loci→regions, timings, and cues first (fields marked TODO).
Usage: python3 scripts/compile_syllabus.py site/frameworks/_incoming/<id>/syllabus.json
"""
import json, sys

KINDMAP = {
    "breathe-in":  lambda s, t: {"t": t, "do": "breath", "phase": "inhale",
        "from": s.get("region_from", "TODO"), "to": s.get("region_to", "TODO"),
        "dur": s.get("dur", 5.0), "cue": s.get("cue", "TODO-cue")},
    "breathe-out": lambda s, t: {"t": t, "do": "breath", "phase": "exhale",
        "from": s.get("region_from", "TODO"), "to": s.get("region_to", "TODO"),
        "dur": s.get("dur", 5.0), "cue": s.get("cue", "TODO-cue")},
    "hold":       lambda s, t: {"t": t, "do": "breath", "phase": "hold",
        "from": s.get("region", "TODO"), "to": s.get("region", "TODO"),
        "dur": s.get("dur", 8.0), "cue": s.get("cue", "TODO-cue")},
    "visualize":  lambda s, t: {"t": t, "do": "info", "dev": s.get("glyph", "ॐ"),
        "iast": s.get("title", s["id"]), "cue": s.get("cue", "TODO-cue")},
    "focus":      lambda s, t: {"t": t, "do": "ring", "at": s.get("region", "TODO"),
        "cue": s.get("cue", "TODO-cue")},
    "repeat":     lambda s, t: {"t": t, "do": "info", "dev": "↻",
        "iast": s.get("title", s["id"]), "cue": s.get("cue", "TODO-cue")},
    "unclassified": lambda s, t: {"t": t, "do": "info", "dev": "?",
        "iast": s.get("title", s["id"]), "cue": "TODO-classify"},
}
DEFAULT_DUR = {"breathe-in": 6, "breathe-out": 6, "hold": 10, "visualize": 6,
               "focus": 8, "repeat": 6, "unclassified": 5}

def main():
    src = sys.argv[1]
    sy = json.load(open(src))
    evts, t = [], 0.0
    todos = 0
    for st in sy["steps"]:
        fn = KINDMAP.get(st.get("kind"), KINDMAP["unclassified"])
        e = fn(st, round(t, 1))
        evts.append(e)
        if "TODO" in json.dumps(e): todos += 1
        t += st.get("dur", DEFAULT_DUR.get(st.get("kind"), 5)) + 1.5
    score = {"id": sy["id"].replace("-syllabus", "-v1"),
             "title": sy["id"], "provenance": "compiled from syllabus draft — REVIEW REQUIRED",
             "events": evts}
    out = src.replace("syllabus.json", "score-draft.json")
    json.dump(score, open(out, "w"), indent=1)
    print(f"wrote {out}: {len(evts)} events, {todos} TODO fields — review before use")

if __name__ == "__main__":
    main()
