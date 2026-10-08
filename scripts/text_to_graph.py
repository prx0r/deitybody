"""Text → Graph compiler: decompose a spiritual text into a DeityBody framework
skeleton + syllabus. Output goes to site/frameworks/_incoming/<id>/ for human
review — NEVER auto-live. Everything extracted carries status needs_review.

Usage:
  python3 scripts/text_to_graph.py --text /tmp/dlshq.html --id sivananda-k --tradition yoga \\
      --lineage "Swami Sivananda" --source "dlshq.org Kundalini Yoga reprint (free)"

Pipeline: ingest(clean HTML/PDF-text/txt) → sections → entities → sequence →
framework skeleton (manifest/config/loci) + syllabus.json → (separately)
compile_syllabus.py turns syllabus steps into a practices/*.json score.
"""
import argparse, json, os, re, html as ihtml

BODY = ["crown","forehead","brow","eyes","nostrils","nose","ears","mouth","tongue",
 "throat","neck","shoulders","arms","elbows","hands","fingers","chest","heart","lungs",
 "belly","navel","solar plexus","hips","pelvis","thighs","knees","legs","ankles","feet","toes",
 "spine","base of spine","perineum","genitals","anus","coccyx","skull","palate","lips",
 "whole body","body","heart region","navel centre","eyebrows","chest"]
BREATH = ["inhale","exhale","inhalation","exhalation","retain","retention","hold the breath",
 "kumbhaka","puraka","rechaka","suspend","suspension","breathe","breathing","apana","prana"]
CHANNEL = ["nadi","nadis","channel","channels","sushumna","susumna","ida","pingala","shushumna",
 "kanda","chakra","chakras","lotus","knot","granthis","spine","vessel"]
SENSE = ["visualize","visualise","imagine","feel","concentrate","focus","meditate","contemplate",
 "think of","behold","picture","awareness","attention","observe","witness"]
STEPMARK = [r"\b(first|second|third|fourth|fifth|sixth|seventh)\b", r"\b(\d+)\s*[\.\)\-:]\s+[A-Z]",
 r"\bthen\b", r"\bnext\b", r"\bafter (that|this)\b", r"\bstep \d+"]
COUNT = [r"(\d+)\s*(times|rounds|minutes|seconds|counts|oms?\b)", r"(\d+)\s*:\s*(\d+)(?:\s*:\s*(\d+))?"]

def clean(raw, is_html):
    if is_html:
        raw = re.sub(r"<script.*?</script>|<style.*?</style>", " ", raw, flags=re.S)
        raw = re.sub(r"<[^>]+>", "\n", raw)
        raw = ihtml.unescape(raw)
    lines = [l.strip() for l in raw.split("\n")]
    return [l for l in lines if len(l) > 40 and len(re.findall(r"[A-Za-z]", l)) > 20]

def find_all(pats, text):
    out = []
    for p in pats:
        for m in re.finditer(p, text, re.I):
            out.append(m.group(0).lower())
    return sorted(set(out))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--text", required=True)
    ap.add_argument("--id", required=True)
    ap.add_argument("--tradition", default="unsorted")
    ap.add_argument("--lineage", default="unknown")
    ap.add_argument("--source", default="unknown")
    a = ap.parse_args()
    raw = open(a.text, errors="ignore").read()
    lines = clean(raw, a.text.endswith((".html", ".htm")))
    print(f"ingested {len(lines)} content lines")
    # sections: blank-line groups + headed chunks (ALL CAPS / numbered)
    full = "\n".join(lines)
    # entities per line, then aggregate with line refs
    ent = {"body": {}, "breath": {}, "channels": {}, "sense": {}}
    seq_hits = []
    for i, l in enumerate(lines):
        for k, pats in (("body", BODY), ("breath", BREATH), ("channels", CHANNEL), ("sense", SENSE)):
            for m in re.finditer("|".join(pats), l, re.I):
                w = m.group(0).lower()
                ent[k].setdefault(w, []).append(i)
        for p in STEPMARK:
            if re.search(p, l, re.I):
                seq_hits.append(i); break
    counts = []
    for p in COUNT:
        for m in re.finditer(p, full, re.I):
            counts.append(m.group(0)[:40])
    # candidate loci: body terms seen 2+ times
    loci = [{"term": w, "lines": ls[:6], "count": len(ls)}
            for w, ls in sorted(ent["body"].items(), key=lambda kv: -len(kv[1])) if len(ls) >= 2][:30]
    # candidate sequence: lines with step markers, in order
    seq = [{"line": i, "text": lines[i][:160]} for i in sorted(set(seq_hits))[:40]]
    # syllabus draft: group consecutive step lines into steps
    steps, cur = [], None
    for s in seq:
        near = steps and s["line"] - steps[-1]["lines"][-1] < 6
        if near: steps[-1]["lines"].append(s["line"]); steps[-1]["text"] += " / " + s["text"][:80]
        else: steps.append({"id": f"s{len(steps)+1}", "lines": [s["line"]], "text": s["text"][:200],
                            "kind": "unclassified", "status": "needs_review"})
    for st in steps:
        t = st["text"].lower()
        if re.search(r"inhale|puraka|breathe in", t): st["kind"] = "breathe-in"
        elif re.search(r"exhale|rechaka|breathe out", t): st["kind"] = "breathe-out"
        elif re.search(r"retain|kumbhaka|hold|suspend", t): st["kind"] = "hold"
        elif re.search(r"visual|imagine|picture|behold", t): st["kind"] = "visualize"
        elif re.search(r"concentrate|focus|meditat|contemplat", t): st["kind"] = "focus"
        elif re.search(r"repeat|japa|mantra|chant|times|rounds", t): st["kind"] = "repeat"
    out = f"site/frameworks/_incoming/{a.id}"
    os.makedirs(out + "/practices", exist_ok=True)
    fw = {"id": a.id, "status": "incoming-needs-review",
          "tradition": a.tradition, "lineage": a.lineage, "source": a.source,
          "manifest": f"frameworks/_incoming/{a.id}/manifest.json"}
    open(f"{out}/manifest.json", "w").write(json.dumps(fw, indent=1))
    open(f"{out}/entities.json", "w").write(json.dumps(
        {"loci": loci, "breath_terms": sorted(ent["breath"])[:30],
         "channel_terms": sorted(ent["channels"])[:30], "sense_terms": sorted(ent["sense"])[:30],
         "counts_found": sorted(set(counts))[:20]}, indent=1))
    open(f"{out}/syllabus.json", "w").write(json.dumps(
        {"id": a.id + "-syllabus", "status": "draft-needs-review",
         "note": "Steps grouped from sequence markers; kinds guessed. Map loci→regions and timings by hand before compiling.",
         "steps": steps}, indent=1))
    print(f"wrote {out}/ (manifest, entities, syllabus with {len(steps)} steps, {len(loci)} loci)")

if __name__ == "__main__":
    main()
