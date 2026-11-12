import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { describe, it } from 'node:test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CROSSFADE_MS, DEFAULT_VOLUME, FADE_IN_MS, fadeInGain, fadeOutGain, rampGain } from '../src/fade.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

describe('fades', () => {
  it('equal-power curves keep constant power through a crossfade', () => {
    for (let p = 0; p <= 1; p += 0.05) {
      const power = fadeInGain(p) ** 2 + fadeOutGain(p) ** 2;
      assert.ok(Math.abs(power - 1) < 1e-9);
    }
  });
  it('ramps start and end exactly at their targets', () => {
    assert.equal(rampGain(0, 1, 0, 1500), 0);
    assert.equal(rampGain(0, 1, 1500, 1500), 1);
    assert.ok(Math.abs(rampGain(1, 0, 900, 900)) < 1e-12);
    assert.equal(rampGain(0.3, 1, 5000, 1500), 1);
  });
  it('ramps are monotonic', () => {
    let prev = -1;
    for (let t = 0; t <= 1500; t += 30) {
      const g = rampGain(0, 1, t, 1500);
      assert.ok(g >= prev);
      prev = g;
    }
  });
  it('uses soft defaults and audible fade lengths', () => {
    assert.ok(DEFAULT_VOLUME >= 0.5 && DEFAULT_VOLUME <= 0.6);
    assert.ok(FADE_IN_MS >= 1000);
    assert.ok(CROSSFADE_MS >= 1500 && CROSSFADE_MS <= 2000);
  });
});

describe('sound catalog', () => {
  const catalog = read('src/catalog.ts');
  const files = [...catalog.matchAll(/require\('\.\.\/assets\/sounds\/([a-z_]+\.m4a)'\)/g)].map((m) => m[1]);
  it('keeps all 25 sound slots, all as AAC m4a', () => {
    assert.equal(files.length, 25);
    assert.ok(!catalog.includes('.mp3'));
  });
  it('every sound file exists, is a real-sized loop and has a licence entry', () => {
    const lic = read('SOUND_LICENSES.md');
    for (const f of files) {
      const p = join(root, 'assets/sounds', f);
      assert.ok(existsSync(p), f);
      assert.ok(statSync(p).size > 1_000_000, `${f} too small for a 60 s 256 kbps loop`);
      assert.ok(lic.includes(f), `${f} missing from SOUND_LICENSES.md`);
    }
  });
});

describe('playback config', () => {
  it('keeps background audio and lock screen wiring', () => {
    const app = JSON.parse(read('app.json'));
    assert.ok(app.expo.ios.infoPlist.UIBackgroundModes.includes('audio'));
    const mixer = read('src/mixer.ts');
    assert.ok(mixer.includes('shouldPlayInBackground: true'));
    assert.ok(mixer.includes('playsInSilentMode: true'));
    assert.ok(mixer.includes('setActiveForLockScreen'));
    assert.ok(mixer.includes("interruptionMode: 'doNotMix'"));
  });
  it('has no ellipsis characters in the UI source', () => {
    for (const f of ['App.tsx', 'src/catalog.ts', 'src/mixer.ts']) {
      const s = read(f);
      assert.ok(!s.includes('\u2026'), `${f} has an ellipsis character`);
    }
  });
});
