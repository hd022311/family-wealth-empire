"""Post-deploy real HTTPS verification, executed by GitHub Actions runner."""
from pathlib import Path
import hashlib
import json
import os
import time
import urllib.request
root = Path(__file__).resolve().parents[3]
base = 'https://hd022311.github.io/family-wealth-empire/'
folder = root / 'theatre-preview/volume1'
files = [p for p in folder.rglob('*') if p.is_file()]
dependencies = ['theatre-preview/story.mjs','theatre-preview/reading-state.mjs','theatre-preview/subtitle-style.mjs','theatre-preview/ending-gallery.mjs','theatre-preview/prologue/style.css','theatre-preview/prologue/scene.mjs','theatre-preview/prologue/renderer.mjs','theatre-preview/prologue/speakers.mjs','theatre-preview/prologue/emotions.mjs','theatre-preview/dual-stage/renderer.mjs','theatre-preview/dual-stage/scene.mjs','theatre-preview/dual-stage/framing.mjs','theatre-preview/performance/scene.mjs','theatre-preview/assets/scenes-concept.png']
files += [root / p for p in dependencies]
files += list((root / 'theatre-preview/prologue/assets').glob('*.webp'))
files += list((root / 'theatre-preview/dual-stage/assets').glob('*.webp'))
def check(relative, digest):
    for attempt in range(8):
        try:
            request = urllib.request.Request(base + relative + '?build=' + os.environ.get('GITHUB_SHA','acceptance'), headers={'Accept-Encoding':'identity'})
            content = urllib.request.urlopen(request,timeout=40).read()
            assert hashlib.sha256(content).hexdigest() == digest, relative
            return
        except Exception:
            if attempt == 7: raise
            time.sleep(4)
for p in files:
    check(p.relative_to(root).as_posix(),hashlib.sha256(p.read_bytes()).hexdigest())
manifest = json.loads((root / '.github/pages-game-manifest.json').read_text())
for relative,digest in manifest['files'].items():check(relative,digest)
proof = {'status':'external_https_verified','url':base+'theatre-preview/volume1/','verified_integrated_files_and_dependencies':len(files),'formal_game_files_unchanged':len(manifest['files']),'workflow_run':os.environ.get('GITHUB_RUN_ID'),'browser_tests':'local_Chromium','physical_devices':'not_tested'}
print(json.dumps(proof,indent=2))
if os.environ.get('GITHUB_STEP_SUMMARY'):
    with open(os.environ['GITHUB_STEP_SUMMARY'],'a') as f:f.write('## 第一卷整合版外部HTTPS驗證\n\n```json\n'+json.dumps(proof,indent=2)+'\n```\n')
