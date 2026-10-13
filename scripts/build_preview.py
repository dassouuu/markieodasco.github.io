"""Portable alternative to the included Windows double-click updater."""
import base64
import json
import mimetypes
from pathlib import Path
import re
root = Path(__file__).resolve().parents[1]
text = root.joinpath('portfolio.ini').read_text(encoding='utf-8-sig')
# Escape < to keep arbitrary user text safe inside an HTML script element.
def script_json(value):
    return json.dumps(value, ensure_ascii=True).replace('<', r'\u003c').replace('>', r'\u003e').replace('&', r'\u0026')
data = '// Generated from portfolio.ini. Do not edit.\nwindow.PORTFOLIO_TEXT = ' + script_json(text) + ';\n'
root.joinpath('config-data.js').write_text(data, encoding='utf-8')
assets = {}
for asset in sorted(root.joinpath('assets').rglob('*')):
    if asset.suffix.lower() in ('.svg', '.jpg', '.jpeg', '.png', '.webp', '.gif'):
        mime = mimetypes.guess_type(asset.name)[0]
        assets[asset.relative_to(root).as_posix()] = 'data:' + mime + ';base64,' + base64.b64encode(asset.read_bytes()).decode('ascii')
html = root.joinpath('index.html').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + root.joinpath('styles.css').read_text(encoding='utf-8') + '\n</style>')
html = re.sub(r'\s*<script defer src="(?:config-data|portfolio-config|app)\.js"></script>', '', html)
html = re.sub(r'\s*<!-- PREVIEW DIAGNOSTIC START -->[\s\S]*?<!-- PREVIEW DIAGNOSTIC END -->', '', html)
for path, uri in assets.items():
    html = html.replace('"' + path + '"', '"' + uri + '"')
scripts = [data + 'window.PORTFOLIO_EMBEDDED = true;\nwindow.PORTFOLIO_ASSETS = ' + script_json(assets) + ';', root.joinpath('portfolio-config.js').read_text(encoding='utf-8'), root.joinpath('app.js').read_text(encoding='utf-8')]
inline = '\n'.join('<script>\n' + s.replace('</script', '<\\/script') + '\n</script>' for s in scripts)
html = html.replace('</body>', inline + '\n</body>')
root.joinpath('START-HERE.html').write_text(html, encoding='utf-8')
print('Updated config-data.js and START-HERE.html from portfolio.ini. Videos stay in assets/videos; they are not embedded.')
