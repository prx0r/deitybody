"""Build site/audio/library/library.json from render-log + human grid clips.
Run after render_library.py finishes. Statuses: human clips are the
long-standing reference (unverified); engine renders are rendered-unverified
until a human ear promotes them. Nothing auto-promotes.
"""
import json, os

LIB = "/root/deitybody/site/audio/library"
HUMAN = "/root/deitybody/site/audio/phonemes"
HMAP = {"a":"a.ogg","ā":"aa.ogg","i":"i.ogg","ī":"ii.ogg","u":"u.ogg","ū":"uu.ogg",
 "ṛ":"r.ogg","ṝ":"rr.ogg","e":"e.ogg","ai":"ai.ogg","o":"o.ogg","au":"au.ogg",
 "aṃ":"anusvara.ogg","aḥ":"visarga.ogg","ka":"ka.ogg","kha":"kha.ogg","ga":"ga.ogg",
 "gha":"gha.ogg","ca":"ca.ogg","cha":"cha.ogg","ja":"ja.ogg","jha":"jha.ogg",
 "ña":"na_j.ogg","ṭa":"ta1.ogg","ṭha":"tha1.ogg","ḍa":"da1.ogg","ḍha":"dha1.ogg",
 "ṇa":"na_k.ogg","ta":"ta.ogg","tha":"tha.ogg","da":"da.ogg","dha":"dha.ogg",
 "na":"na.ogg","pa":"pa.ogg","pha":"pha.ogg","ba":"ba.ogg","bha":"bha.ogg",
 "ma":"ma.ogg","ya":"ya.ogg","ra":"ra.ogg","la":"la.ogg","va":"va.ogg",
 "śa":"sha.ogg","ṣa":"shha.ogg","sa":"sa.ogg","ha":"ha.ogg"}
render = json.load(open(os.path.join(LIB, "render-log.json")))
lib = {"id": "phoneme-library-v1",
       "note": "Canonical stays human-grid-v1 until ear promotion. Engine takes are variants.",
       "phonemes": {}}
for iast, item in render["items"].items():
    variants = []
    if iast in HMAP and os.path.exists(os.path.join(HUMAN, HMAP[iast])):
        variants.append({"id": "human-grid-v1", "file": "../../phonemes/" + HMAP[iast],
                         "status": "reference-unverified"})
    ogg = os.path.join(LIB, iast, "v1_hm_omega.ogg")
    if item["status"].startswith("rendered") and os.path.exists(ogg):
        variants.append({"id": "edgesanskrit-v1-hm_omega", "file": f"{iast}/v1_hm_omega.ogg",
                         "status": item["status"], "samples": item.get("samples")})
    elif item["status"] == "fail":
        variants.append({"id": "edgesanskrit-v1-hm_omega", "file": None,
                         "status": "fail", "reason": item.get("reason")})
    else:
        variants.append({"id": "edgesanskrit-v1-hm_omega", "file": None, "status": "missing"})
    lib["phonemes"][iast] = {
        "variants": variants,
        "canonical": "human-grid-v1" if any(v["id"] == "human-grid-v1" for v in variants) else None,
        "needs_ear": True,
    }
json.dump(lib, open(os.path.join(LIB, "library.json"), "w"), ensure_ascii=False, indent=1)
n_ok = sum(1 for p in lib["phonemes"].values()
           for v in p["variants"] if v["id"].startswith("edgesanskrit") and v["file"])
print(f"engine renders present: {n_ok}/50, phonemes: {len(lib['phonemes'])}")
