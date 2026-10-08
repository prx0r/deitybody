"""Render the full 50-phoneme library with EdgeSanskrit v1. One take per phoneme.
Run: nohup python3 scripts/render_library.py > /tmp/lib_render.log 2>&1 &
Output: site/audio/library/<iast>/v1_hm_omega.{wav,ogg} + render-log.json
"""
import json, os, subprocess, sys, datetime

PHONEMES = ["a","ā","i","ī","u","ū","ṛ","ṝ","ḷ","ḹ","e","ai","o","au","aṃ","aḥ",
 "ka","kha","ga","gha","ṅa","ca","cha","ja","jha","ña","ṭa","ṭha","ḍa","ḍha","ṇa",
 "ta","tha","da","dha","na","pa","pha","ba","bha","ma",
 "ya","ra","la","va","śa","ṣa","sa","ha","kṣa"]
DEV = {"a":"अ","ā":"आ","i":"इ","ī":"ई","u":"उ","ū":"ऊ","ṛ":"ऋ","ṝ":"ॠ","ḷ":"ऌ","ḹ":"ॡ",
 "e":"ए","ai":"ऐ","o":"ओ","au":"औ","aṃ":"अं","aḥ":"अः","ka":"क","kha":"ख","ga":"ग","gha":"घ","ṅa":"ङ",
 "ca":"च","cha":"छ","ja":"ज","jha":"झ","ña":"ञ","ṭa":"ट","ṭha":"ठ","ḍa":"ड","ḍha":"ढ","ṇa":"ण",
 "ta":"त","tha":"थ","da":"द","dha":"ध","na":"न","pa":"प","pha":"फ","ba":"ब","bha":"भ","ma":"म",
 "ya":"य","ra":"र","la":"ल","va":"व","śa":"श","ṣa":"ष","sa":"स","ha":"ह","kṣa":"क्ष"}

ROOT = "/root/deitybody/site/audio/library"
os.makedirs(ROOT, exist_ok=True)
sys.path.insert(0, "/root/edgesanskrit-tts")
from generate_sanskrit import SanskritKokoroTTS
import soundfile as sf

tts = SanskritKokoroTTS(device="cpu")
log = {"engine": "edgesanskrit-v1", "voice": "hm_omega", "speed": 1.0,
       "date": datetime.date.today().isoformat(), "items": {}}
for iast in PHONEMES:
    d = os.path.join(ROOT, iast)
    os.makedirs(d, exist_ok=True)
    try:
        a = tts.synthesize(DEV[iast] + " ।", voice_name="hm_omega", speed=1.0)
        if a is None:
            log["items"][iast] = {"status": "fail", "reason": "null render"}
            print(iast, "FAIL null", flush=True)
            continue
        wav = os.path.join(d, "v1_hm_omega.wav")
        ogg = os.path.join(d, "v1_hm_omega.ogg")
        sf.write(wav, a.numpy(), 24000)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", wav,
                        "-c:a", "libvorbis", "-q:a", "4", ogg], check=True)
        n = len(a)
        status = "rendered-unverified" if n > 8000 else "rendered-short-flag"
        log["items"][iast] = {"status": status, "samples": n}
        print(iast, status, n, flush=True)
    except Exception as e:
        log["items"][iast] = {"status": "fail", "reason": str(e)[:120]}
        print(iast, "FAIL", str(e)[:120], flush=True)
json.dump(log, open(os.path.join(ROOT, "render-log.json"), "w"), ensure_ascii=False, indent=1)
print("DONE")
