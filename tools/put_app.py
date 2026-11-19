"""Copy the Expo web export into ./app and patch index.html for GitHub Pages (sub-path SPA restore, Korean meta).
Also fills SUPABASE_URL / SUPABASE_KEY in site.config.js from the Windows user environment (public publishable key only).
Usage: python -I tools/put_app.py C:/hb/kirok_web_out
Never prints secret values."""
import os, re, shutil, subprocess, sys, pathlib

SITE = pathlib.Path(__file__).resolve().parent.parent
src = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'C:/hb/kirok_web_out')
dst = SITE / 'app'
if not (src / 'index.html').exists():
    sys.exit('export folder has no index.html')
if dst.exists():
    shutil.rmtree(dst)
shutil.copytree(src, dst)

idx = dst / 'index.html'
h = idx.read_text(encoding='utf-8')
h = h.replace('<html lang="en">', '<html lang="ko">')
h = h.replace('<title>키록</title>', '<title>키록 웹 체험판</title>')
inject = (
    '<meta name="description" content="키록 앱을 설치 없이 인터넷 창에서 써 보는 체험판입니다." />'
    '<meta property="og:title" content="키록 웹 체험판" />'
    '<meta property="og:description" content="설치 없이 아이 등록부터 예측 결과, 오늘 미션, 리포트까지 써 보세요." />'
    '<meta property="og:image" content="https://wonyul01-collab.github.io/kirok/og.jpg" />'
    '<script>(function(){try{var p=sessionStorage.getItem("kirok_spa_path");if(p){sessionStorage.removeItem("kirok_spa_path");'
    'if(p.indexOf("/kirok/app")===0)history.replaceState(null,"",p);}}catch(e){}})();</script>'
)
if 'kirok_spa_path' not in h:
    h = h.replace('</head>', inject + '</head>', 1)
idx.write_text(h, encoding='utf-8')


def user_env(name):
    try:
        out = subprocess.run(['powershell', '-NoProfile', '-Command', f"[Environment]::GetEnvironmentVariable('{name}','User')"],
                             capture_output=True, text=True, timeout=30).stdout.strip()
        return out
    except Exception:
        return ''


cfg = SITE / 'site.config.js'
c = cfg.read_text(encoding='utf-8')
url, key = user_env('EXPO_PUBLIC_SUPABASE_URL'), user_env('EXPO_PUBLIC_SUPABASE_ANON_KEY')
if url and key.startswith('sb_publishable'):
    c = re.sub(r"SUPABASE_URL: '[^']*'", "SUPABASE_URL: '" + url + "'", c)
    c = re.sub(r"SUPABASE_KEY: '[^']*'", "SUPABASE_KEY: '" + key + "'", c)
    cfg.write_text(c, encoding='utf-8')
    print('config: supabase public values set')
else:
    print('config: supabase values not found or not publishable; left as is')
print('app copied:', sum(1 for _ in dst.rglob('*') if _.is_file()), 'files')
