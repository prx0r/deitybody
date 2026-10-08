"""DeityBody smoke test: interact with the lab like a user, report console errors.
Usage: python3 scripts/smoke.py [--url https://body.stonedoorway.com/lab]
"""
import sys, time
from playwright.sync_api import sync_playwright

URL = sys.argv[sys.argv.index('--url')+1] if '--url' in sys.argv else 'https://body.stonedoorway.com/lab'

with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={'width': 1280, 'height': 800})
    errors, logs = [], []
    pg.on('console', lambda m: (errors if m.type in ('error',) else logs).append(f'{m.type}: {m.text[:220]}'))
    pg.on('pageerror', lambda e: errors.append(f'pageerror: {str(e)[:300]}'))
    pg.goto(URL, wait_until='networkidle', timeout=45000)
    pg.wait_for_timeout(6000)
    state = pg.evaluate("""() => ({
      glyphs: document.querySelectorAll('.glyph').length,
      canvas: !!document.querySelector('#scene'),
      bootErrors: (window.__bootErrors||[]),
      webgl: (()=>{try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'));}catch(e){return false;}})(),
      three_ready: !!(window.deitybody),
    })""")
    print('STATE:', state)
    # interact: click first glyph chip if present
    try:
        g = pg.query_selector('.glyph')
        if g:
            g.click(timeout=5000)
            pg.wait_for_timeout(2500)
            print('TAP-OK lit=', pg.evaluate("document.querySelectorAll('.glyph.lit').length"))
        else:
            print('TAP-SKIP: no .glyph nodes')
    except Exception as e:
        print('TAP-FAIL:', str(e)[:200])
    pg.screenshot(path='/tmp/lab_smoke.png')
    print('ERRORS:', len(errors))
    for e in errors[:15]:
        print(' -', e)
    b.close()
print('screenshot: /tmp/lab_smoke.png')
