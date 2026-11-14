#!/usr/bin/env python3
"""Regenerates manifest.json from the build 8 proposal table plus the 6 kept sounds."""
import re, json, sys
PROPOSAL = '/home/box/shared/app-monitor/reports/lulla-sounds/build8-proposal.md'
rows = [l for l in open(PROPOSAL) if re.match(r'^\| \d+ \|', l) and 'freesound.org/people' in l]
fmap = {'Rain': 'rain', 'Deep Rain on Roof': 'rain_roof', 'Rain on Tent': 'rain_tent', 'Rain on Window': 'rain_window', 'Rain on Umbrella': 'rain_umbrella',
        'Distant Thunder': 'thunder', 'Slow Ocean Waves': 'ocean', 'Lake': 'lake', 'Creek': 'creek', 'Waterfall': 'waterfall', 'Underwater': 'underwater',
        'Wind': 'wind', 'Wind & Leaves': 'wind_leaves', 'Forest': 'forest', 'Night Crickets': 'night', 'Crackling Fireplace': 'fire', 'Fan': 'fan',
        'Air Conditioner': 'air_conditioner', 'Airplane Cabin': 'airplane', 'Heartbeat': 'heartbeat', 'Singing Bowls': 'singing_bowls'}
secs = lambda s: int(s.split(':')[0]) * 60 + int(s.split(':')[1])
soft_hf = 'highshelf=f=7000:g=-4:t=q:w=0.7'
harsh = 'lowpass=f=11000:poles=2,highshelf=f=6500:g=-4:t=q:w=0.7'
eq = {'rain': harsh, 'rain_roof': harsh, 'rain_tent': harsh, 'rain_window': harsh, 'rain_umbrella': harsh, 'fire': harsh,
      'fan': 'lowpass=f=10000:poles=2,' + soft_hf, 'air_conditioner': 'lowpass=f=10000:poles=2', 'airplane': 'lowpass=f=10000:poles=2',
      'thunder': 'lowpass=f=12000:poles=2', 'heartbeat': 'lowpass=f=4000:poles=2'}
man = {}
for l in rows:
    c = [x.strip() for x in l.strip().strip('|').split('|')]
    sid = re.search(r'#(\d+)\]', c[4]).group(1)
    nm = fmap[c[1]]
    man[nm] = dict(app_name=c[1], freesound_id=sid, file=nm + '.m4a', loop_s=secs(c[9]), af=eq.get(nm, soft_hf), kind='recorded', category=c[2])
man['rain_puddle'] = dict(app_name='Rain on Puddle', freesound_id='735468', file='rain_puddle.m4a', loop_s=240, extend=True, kind='recorded', category='Rain',
                          af='acompressor=threshold=0.05:ratio=3:attack=0.5:release=60:knee=4,lowpass=f=12000:poles=2,highshelf=f=7000:g=-4:t=q:w=0.7', note='81 s original, drop transients gently compressed,, extended into a 4 min non-periodic texture')
man['drip'] = dict(app_name='Drip', freesound_id='506072', file='drip.m4a', loop_s=240, extend=True, kind='recorded', category='Water',
                   af='acompressor=threshold=0.06:ratio=3:attack=0.3:release=80:knee=4,lowpass=f=8000:poles=2,highshelf=f=4000:g=-6:t=q:w=0.7',
                   note='113 s original, transients softened, extended into a 4 min texture')
man['grassland'] = dict(app_name='Grassland', freesound_id='164656', file='grassland.m4a', loop_s=200, kind='recorded', category='Nature',
                        af=','.join('equalizer=f=%d:t=q:w=8:g=%d' % fg for fg in [(179, -8), (357, -12), (536, -9), (718, -8), (902, -6), (1093, -4)]) + ',lowpass=f=9000:poles=2,highshelf=f=6000:g=-5:t=q:w=0.7',
                        note='insect buzz harmonics (179 Hz series) notched, high insect whine above 9 kHz cut')
# Rain on Tent: very quiet bed (-54 LUFS) with loud drop hits; two-stage compression at a normalised level
man['rain_tent']['af'] = ('volume=34dB,acompressor=threshold=0.06:ratio=8:attack=0.2:release=50:knee=4,'
                          'acompressor=threshold=0.08:ratio=6:attack=0.05:release=30:knee=2,volume=-34dB,' + man['rain_tent']['af'])
man['rain_tent']['note'] = 'drop transients two-stage compressed so the bed reaches -20 LUFS inside the 6 dB limiter budget'
picks = json.load(open('batch2_picks.json')) if __import__('os').path.exists('batch2_picks.json') else {}
for nm, cat in [('snow', 'Rain'), ('cave', 'Nature'), ('farm', 'Nature')]:
    p = picks.get(nm, {})
    man[nm] = dict(app_name=nm.capitalize(), freesound_id=p.get('id', 'TBD'), backup_id=p.get('backup_id', 'TBD'), file=nm + '.m4a', loop_s=p.get('loop_s', 240),
                   kind='recorded', category=cat, af=p.get('af', soft_hf), note=p.get('note', 'Batch 2 new source'), **({'avoid_s': p['avoid_s']} if p.get('avoid_s') else {}))
json.dump({'_comment': 'Recorded sounds for build 8. loop_s is the full planned loop; config.json loop_mode=cap3 caps these at 180 s. Generated sounds come from generate.py.', 'recorded': man}, open('manifest.json', 'w'), indent=1)
print(len(man), 'recorded sounds,', round(sum(v['loop_s'] for v in man.values()) / 60, 1), 'min of loops')
