"""Take QA screenshots of each page at phone (390) and PC (1440) widths. Usage: python -I tools/shots.py <base_url> <out_dir>"""
import sys, pathlib
from playwright.sync_api import sync_playwright
base, out = sys.argv[1].rstrip('/'), pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
pages = [('home', '/'), ('manual', '/manual/'), ('manual_register', '/manual/#register-5'), ('manual_ex', '/manual/#exercise-1'), ('library', '/library/'), ('evidence', '/library/#evidence'), ('support', '/support/'), ('privacy', '/privacy/'), ('notfound', '/nope/')]
with sync_playwright() as pw:
    b = pw.chromium.launch()
    for w, h, tag in [(390, 844, 'phone'), (1440, 900, 'pc')]:
        ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if w < 500 else 1, is_mobile=w < 500, has_touch=w < 500)
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        for name, path in pages:
            pg.goto(base + path, wait_until='networkidle'); pg.wait_for_timeout(500)
            pg.evaluate("async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}window.scrollTo(0,0)}"); pg.wait_for_timeout(600)
            sw = pg.evaluate('document.documentElement.scrollWidth')
            small = pg.evaluate("""()=>{let n=0;document.querySelectorAll('body *').forEach(e=>{if(e.children.length===0&&e.textContent.trim()&&e.offsetParent){const fs=parseFloat(getComputedStyle(e).fontSize);if(fs<13)n++}});return n}""")
            pg.screenshot(path=str(out / f'{tag}_{name}.png'), full_page=True)
            print(tag, name, 'scrollWidth', sw, 'viewport', w, 'tiny_text', small)
        print(tag, 'page errors:', errs[:5])
        ctx.close()
    b.close()
