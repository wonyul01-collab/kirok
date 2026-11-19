"""Walk the web trial like a person on a phone: first screen -> start -> a few registration steps; also deep-link refresh.
Usage: python tools/app_check.py <base_url_of_site> <out_dir>"""
import sys, pathlib
from playwright.sync_api import sync_playwright
base, out = sys.argv[1].rstrip('/'), pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)

def click_text(pg, t, timeout=8000):
    pg.get_by_text(t, exact=True).first.click(timeout=timeout); pg.wait_for_timeout(700)

with sync_playwright() as pw:
    b = pw.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True, locale='ko-KR')
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + '/app/?unlock=1', wait_until='networkidle'); pg.wait_for_timeout(2500)
    pg.screenshot(path=str(out / 'app_01_first.png'))
    print('first screen has 시작하기:', pg.get_by_text('시작하기', exact=True).count() > 0)
    print('unlock stored:', pg.evaluate("localStorage.getItem('height_dev_unlock')"))
    steps = []
    try:
        click_text(pg, '시작하기'); pg.screenshot(path=str(out / 'app_02_who.png')); steps.append('who')
        click_text(pg, '보호자(부모)입니다')
        pg.get_by_placeholder('예: 지우 엄마').fill('지우 엄마'); pg.wait_for_timeout(300)
        click_text(pg, '다음'); pg.screenshot(path=str(out / 'app_03_sex.png')); steps.append('sex')
        click_text(pg, '딸'); click_text(pg, '다음'); steps.append('name')
        pg.locator('input').first.fill('지우'); pg.wait_for_timeout(300); click_text(pg, '다음')
        pg.screenshot(path=str(out / 'app_04_birth.png')); steps.append('birth')
        ins = pg.locator('input'); ins.nth(0).fill('2016'); ins.nth(1).fill('4'); pg.wait_for_timeout(300); click_text(pg, '다음')
        pg.screenshot(path=str(out / 'app_05_consent.png')); steps.append('consent')
        pg.get_by_role('checkbox').nth(0).click(); pg.get_by_role('checkbox').nth(1).click(); pg.wait_for_timeout(300); click_text(pg, '다음'); steps.append('dad')
        pg.locator('input').first.fill('176'); click_text(pg, '다음'); steps.append('mom')
        pg.locator('input').first.fill('161'); click_text(pg, '다음'); steps.append('sibling')
        click_text(pg, '형제·자매가 없거나 모르면 건너뛰기'); steps.append('height')
        pg.locator('input').first.fill('136.4'); click_text(pg, '다음'); steps.append('sleep')
        click_text(pg, '9~10시간'); click_text(pg, '다음'); steps.append('puberty')
        click_text(pg, '아직 변화가 없어요'); click_text(pg, '다음'); steps.append('menarche')
        click_text(pg, '아직 안 했어요'); click_text(pg, '결과 보기'); pg.wait_for_timeout(1500)
        pg.screenshot(path=str(out / 'app_07_result.png')); steps.append('result')
        click_text(pg, '리포트'); pg.wait_for_timeout(1500)
        pg.screenshot(path=str(out / 'app_08_report.png'), full_page=False); steps.append('report')
        print('report locked text present:', pg.get_by_text('잠겨', exact=False).count(), 'unlock:', pg.evaluate("localStorage.getItem('height_dev_unlock')"))
    except Exception as e:
        print('stopped at step after', steps, '-', str(e)[:160])
    print('steps reached:', steps)
    # deep link refresh through 404.html
    pg2 = ctx.new_page(); pg2.goto(base + '/app/settings', wait_until='networkidle'); pg2.wait_for_timeout(2500)
    print('deep link final url:', pg2.url)
    pg2.screenshot(path=str(out / 'app_06_deeplink_settings.png'))
    print('page errors:', errs[:5])
    b.close()
