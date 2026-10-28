"""Run on the publishing runner: real HTTPS bytes, never substitute local responses."""
from pathlib import Path
import hashlib
import json
import os
import time
import urllib.request

root = Path(__file__).resolve().parents[3]
base = 'https://hd022311.github.io/family-wealth-empire/'
prefix = 'theatre-preview/prologue/'
files = [p for p in (root / prefix).rglob('*') if p.is_file()]

def fetch_verified(relative, expected):
    for attempt in range(8):
        try:
            request = urllib.request.Request(base + relative + '?build=' + os.environ.get('GITHUB_SHA', 'acceptance'), headers={'Accept-Encoding': 'identity'})
            data = urllib.request.urlopen(request, timeout=40).read()
            assert hashlib.sha256(data).hexdigest() == expected, 'Published bytes differ: ' + relative
            return
        except Exception:
            if attempt == 7:
                raise
            time.sleep(4)

for path in files:
    fetch_verified(path.relative_to(root).as_posix(), hashlib.sha256(path.read_bytes()).hexdigest())
manifest = json.loads((root / '.github/pages-game-manifest.json').read_text())
for relative, digest in manifest['files'].items():
    fetch_verified(relative, digest)
proof = {'status': 'external_https_verified', 'url': base + prefix, 'workflow_run': os.environ.get('GITHUB_RUN_ID'), 'verified_prologue_files': len(files), 'preserved_formal_game_files': len(manifest['files']), 'browser_interaction': 'local_Chromium_acceptance_only', 'physical_devices': 'not_tested'}
print(json.dumps(proof, indent=2))
if os.environ.get('GITHUB_STEP_SUMMARY'):
    with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as summary:
        summary.write('## 獨立前言公開檔案驗證\n\n```json\n' + json.dumps(proof, indent=2) + '\n```\n')
