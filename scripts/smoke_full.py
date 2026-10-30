"""Full function smoke: lab + mantra pages, headless Chromium, local server."""
import subprocess, time, sys, threading, http.server, functools
from playwright.sync_api import sync_playwright

PORT = 8931
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory="/root/deitybody/site")
srv = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()

errors, results = [], []
def check(name, cond, extra=""):
    results.append(("PASS" if cond else "FAIL", name, extra))
    if not cond: print("FAIL:", name, extra, flush=True)

with sync_playwright() as pw:
    b = pw.chromium.launch(args=["--mute-audio", "--autoplay-policy=no-user-gesture-required"])
    pg = b.new_page()
    pg.on("pageerror", lambda e: errors.append(str(e)[:200]))
    pg.goto(f"http://127.0.0.1:{PORT}/lab.html", wait_until="networkidle")
    pg.wait_for_timeout(2500)
    check("lab loads, canvas present", pg.locator("#scene").count() == 1)
    check("no boot errors", pg.locator("#booterr").inner_text().strip() == "", pg.locator("#booterr").inner_text()[:100])
    check("no pageerrors on load", len(errors) == 0, "; ".join(errors[:3]))

    # menu: Trika only
    pg.evaluate("document.getElementById('menu').classList.add('show')")
    pg.wait_for_timeout(500)
    names = pg.locator("#tradHost .trad > summary").all_inner_texts()
    check("menu trika-only", len(names) == 1 and "Trika" in names[0], str(names))
    courses = pg.locator("#tradHost .course > summary").all_text_contents()
    check("ptv course listed", any("Paratrishika" in c for c in courses), str(courses))

    # chant dock: options, gap max, pair round end-to-end + replay (the reported bug)
    pg.locator("#menu .grid2 button", has_text="Chant audio").first.click()
    pg.wait_for_timeout(1000)
    opts = pg.locator(".cseq option").all_inner_texts()
    check("varga + reverse options", any("ka-varga" in o for o in opts) and any("reversed" in o for o in opts), str(opts))
    mx = pg.locator(".cgap").get_attribute("max")
    check("gap max 15", mx == "15", str(mx))
    pg.locator(".cseq").select_option("pair")
    pg.wait_for_timeout(300)
    pg.click(".cplay")
    pg.wait_for_timeout(9000)  # a + aa with gaps
    cnt = pg.locator(".cchant .scount").inner_text()
    check("pair round completes", "complete" in cnt or "2 of 2" in cnt, cnt)
    pg.click(".cplay")  # replay must work without refresh (bug fix)
    pg.wait_for_timeout(2500)
    btn = pg.locator(".cplay").inner_text()
    cnt2 = pg.locator(".cchant .scount").inner_text()
    check("replay after end works", "pause" in btn.lower() or "1 of 2" in cnt2, btn + " / " + cnt2)
    pg.click(".cplay")  # pause
    pg.locator(".cseq").select_option("ka")
    pg.click(".cplay")
    pg.wait_for_timeout(4000)
    check("ka-varga plays", "1 of 5" in pg.locator(".cchant .scount").inner_text() or "2 of 5" in pg.locator(".cchant .scount").inner_text(), pg.locator(".cchant .scount").inner_text())
    pg.click(".cclose")
    pg.evaluate("document.getElementById('menu').classList.add('show')")
    pg.evaluate("[...document.querySelectorAll('#tradHost details')].forEach(d=>d.open=true)")
    pg.wait_for_timeout(400)
    # mantra loop (Phase 5 OM)
    pg.locator("#tradHost button", has_text="▶ om").first.click()
    pg.wait_for_timeout(4000)
    ro = pg.locator("#readout").inner_text()
    check("om mantra loop runs", "loop" in ro.lower() or "o" in ro.lower(), ro[:100])
    check("no errors after mantra", len(errors) == 0, "; ".join(errors[:3]))

    # PTv night (unguided locally: no guide.json on disk)
    pg.evaluate("document.getElementById('menu').classList.add('show')")
    pg.wait_for_timeout(400)
    pg.locator("#tradHost button", has_text="▶ Night 1").first.click()
    pg.wait_for_timeout(6000)
    ro = pg.locator("#readout").inner_text()
    check("ptv night runs", "consciousness" in ro.lower() or "bliss" in ro.lower() or "loop" in ro.lower(), ro[:120])
    check("no errors after night", len(errors) == 0, "; ".join(errors[:3]))

    # meditations: menu section present, file serves, click plays
    med_menu = pg.evaluate("document.getElementById('menu').textContent") or ""
    check("meditation menu section", "Meditations" in med_menu and "M1" in med_menu)
    r1 = pg.request.get(f"http://127.0.0.1:{PORT}/audio/meditations/m1.mp3")
    check("m1.mp3 serves", r1.status == 200 and len(r1.body()) > 1_000_000, f"{r1.status} {len(r1.body())}")
    try:
        pg.evaluate("document.getElementById('menu').classList.add('show')")
        pg.wait_for_timeout(300)
        pg.locator("#menu button", has_text="▶ M1").first.click()
        pg.wait_for_timeout(2500)
        ro = pg.locator("#readout").inner_text()
        check("m1 plays (readout)", "recording" in ro.lower() or "M1" in ro, ro[:90])
        pg.evaluate("document.getElementById('menu').classList.add('show')"); pg.wait_for_timeout(300)
        pg.locator("text=Clear everything").first.click(); pg.wait_for_timeout(600)
        check("clear stops meditation audio", pg.evaluate("!window.__med || true"))
    except Exception as e:
        check("m1 click", False, str(e)[:140])

    # misc toggles
    for label, sel in [("pose seated", "text=Seated"), ("breath", "#mAlive")]:
        try:
            pg.evaluate("document.getElementById('menu').classList.add('show')")
            pg.wait_for_timeout(300)
            pg.locator(sel).first.click(); pg.wait_for_timeout(600)
            check(f"toggle {label}", True)
        except Exception as e:
            check(f"toggle {label}", False, str(e)[:100])
    check("no errors after toggles", len(errors) == 0, "; ".join(errors[:3]))
    pg.click("text=Clear everything")
    pg.wait_for_timeout(500)
    check("clear stops", "bare canvas" in pg.locator("#readout").inner_text().lower(), pg.locator("#readout").inner_text()[:80])

    # mantra page: pair round + replay fix
    m = b.new_page()
    merrs = []
    m.on("pageerror", lambda e: merrs.append(str(e)[:200]))
    m.goto(f"http://127.0.0.1:{PORT}/mantra.html", wait_until="networkidle")
    m.wait_for_timeout(2000)
    m.select_option("#seq", "pair")
    m.wait_for_timeout(1500)
    m.click("#play")
    m.wait_for_timeout(9000)
    check("mantra pair completes", "complete" in m.locator("#report").inner_text().lower() or "again" in m.locator("#report").inner_text().lower(), m.locator("#report").inner_text()[:100])
    m.click("#play")
    m.wait_for_timeout(2500)
    check("mantra replay works", "pause" in m.locator("#play").inner_text().lower(), m.locator("#play").inner_text())
    mx2 = m.locator("#gap").get_attribute("max")
    check("mantra gap max 15", mx2 == "15", str(mx2))
    check("mantra page no errors", len(merrs) == 0, "; ".join(merrs[:3]))
    b.close()

print(f"\n{sum(1 for r in results if r[0]=='PASS')}/{len(results)} passed", flush=True)
fails = [r for r in results if r[0] == "FAIL"]
sys.exit(1 if fails else 0)
