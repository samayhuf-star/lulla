#!/usr/bin/env python3
"""Copy passing masters into assets/sounds, clear them from PENDING.json and log each one in
ASSET_LICENSES.md (author and licence from freesound-needed.md; CC BY rows get attribution).

  python ingest.py            # every passing result in master-results.json + generate-results.json
  python ingest.py --dry-run
"""
import json, os, re, shutil, sys
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
CFG = json.load(open(os.path.join(HERE, 'config.json')))
NEEDED = '/home/box/shared/app-monitor/reports/lulla-sounds/freesound-needed.md'
dry = '--dry-run' in sys.argv

# id -> (author, licence) from every table row in freesound-needed.md
lic = {}
for line in open(NEEDED):
    m = re.search(r'\|\s*(\d{4,7})\s*\|\s*(https://freesound\.org/\S+)\s*\|\s*([^|]+?)\s*\|\s*\**([^|*]+?)\**\s*\|', line)
    if m:
        lic[m.group(1)] = dict(url=m.group(2), author=m.group(3), licence=m.group(4))
lic.setdefault('735468', dict(url='https://freesound.org/s/735468/', author='bbrownmuse', licence='CC0 1.0'))
lic.setdefault('506072', dict(url='https://freesound.org/s/506072/', author='SpaceJoe', licence='CC0 1.0'))
lic.setdefault('164656', dict(url='https://freesound.org/s/164656/', author='DanGasior', licence='CC0 1.0'))

results = {}
for f in ('master-results.json', 'generate-results.json'):
    p = os.path.join(CFG['report_dir'], f)
    if os.path.exists(p):
        results.update(json.load(open(p)))
man = json.load(open(os.path.join(HERE, 'manifest.json')))['recorded']
pend_p = os.path.join(REPO, 'assets/sounds/PENDING.json')
pend = json.load(open(pend_p))
al_p = os.path.join(REPO, 'ASSET_LICENSES.md')
al = open(al_p).read()
done = []
for name, r in results.items():
    if r.get('status') != 'OK':
        continue
    checks = [v for k, v in r.items() if k.startswith('pass_')]
    if checks and not all(checks):
        print('SKIP (fails checks):', name, {k: v for k, v in r.items() if k.startswith('pass_')})
        continue
    src = os.path.join(HERE, CFG['out_dir'], r['file'])
    if not os.path.exists(src):
        continue
    if not dry:
        shutil.copy(src, os.path.join(REPO, 'assets/sounds', r['file']))
    if name in pend['pending']:
        pend['pending'].remove(name)
    if r.get('freesound_id') and ('`%s`' % r['file']) not in al:
        sid = r['original'].split('__')[0]
        L = lic.get(sid, dict(url='https://freesound.org/s/%s/' % sid, author=r['original'].split('__')[1], licence='CHECK'))
        attrib = 'No' if L['licence'].startswith('CC0') else 'Yes: "%s by %s (freesound.org/s/%s), %s"' % (r['original'].split('__', 2)[2].rsplit('.', 1)[0], L['author'], sid, L['licence'])
        row = '| %s | `%s` | %s | %s | %s | %s | %s | `%s` (%s s) | ingested |' % (
            man.get(name, {}).get('app_name', name), r['file'], sid, L['url'], L['author'], L['licence'], attrib, r['original'], r['original_s'])
        al = al.replace('\n\nPending download', '\n' + row + '\n\nPending download', 1)
    done.append(name)
if not dry:
    json.dump(pend, open(pend_p, 'w'), indent=1)
    open(al_p, 'w').write(al)
    shutil.copy(al_p, '/home/box/shared/app-monitor/reports/lulla-b8/ASSET_LICENSES.md')
print('ingested:', ', '.join(done))
print('still pending:', ', '.join(pend['pending']) or 'none')
