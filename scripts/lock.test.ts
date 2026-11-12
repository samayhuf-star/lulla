import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RemoteCommandTracker, mixTitle } from '../src/lockControl.ts';
import { parseQaUrl } from '../src/qa.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mixerSrc = readFileSync(join(root, 'src/mixer.ts'), 'utf8');

const st = (playing: boolean, extra: Partial<{ isBuffering: boolean; didJustFinish: boolean; isLoaded: boolean }> = {}) => ({
  isLoaded: true, playing, isBuffering: false, didJustFinish: false, ...extra,
});

describe('lock screen remote commands (silent control player)', () => {
  it('a remote pause while the mix plays asks the mixer to fade everything out', () => {
    const r = new RemoteCommandTracker();
    r.sync(true); // mixer started the control player
    assert.equal(r.onStatus(st(true), false, true), null);
    assert.equal(r.onStatus(st(false), false, true), 'pause');
    // repeated paused updates do not re-trigger
    assert.equal(r.onStatus(st(false), false, false), null);
  });
  it('a remote play while the mix is paused asks the mixer to fade everything in', () => {
    const r = new RemoteCommandTracker();
    r.sync(false);
    assert.equal(r.onStatus(st(true), false, false), 'play');
    assert.equal(r.onStatus(st(true), false, true), null);
  });
  it('ignores echoes of the mixer\'s own play/pause and unloaded or buffering states', () => {
    const r = new RemoteCommandTracker();
    r.sync(true);
    assert.equal(r.onStatus(st(false), true, true), null);
    assert.equal(r.onStatus(st(false, { isLoaded: false }), false, true), null);
    assert.equal(r.onStatus(st(false, { isBuffering: true }), false, true), null);
    assert.equal(r.onStatus(st(false, { didJustFinish: true }), false, true), null);
  });
  it('mixer binds the lock screen only to the silent control player', () => {
    assert.ok(mixerSrc.includes("require('../assets/silence.m4a')"));
    const lockCalls = [...mixerSrc.matchAll(/(\w+(?:\.\w+)*)\.setActiveForLockScreen\(/g)].map((m) => m[1]);
    assert.deepEqual(lockCalls, ['this.control']);
    assert.ok(!/t\.player\.setActiveForLockScreen/.test(mixerSrc));
  });
  it('remote play is gated (trial) before the mix starts', () => {
    assert.ok(mixerSrc.includes('this.remotePlayGuard()'));
    const app = readFileSync(join(root, 'App.tsx'), 'utf8');
    assert.ok(app.includes('mixer.setRemotePlayGuard('));
  });
});

describe('lock screen title', () => {
  it('names the mix and the sleep timer', () => {
    assert.equal(mixTitle([]), 'Lulla');
    assert.equal(mixTitle(['Rain']), 'Rain');
    assert.equal(mixTitle(['Rain', 'Fire']), 'Rain + Fire');
    assert.equal(mixTitle(['Rain', 'Fire', 'Wind']), 'Rain + 2 more');
    assert.equal(mixTitle(['Rain'], 125), 'Rain (3 min left)');
    assert.equal(mixTitle(['Rain'], 0), 'Rain');
  });
});

describe('QA deep links', () => {
  it('parses play and stop commands, rejects anything else', () => {
    assert.deepEqual(parseQaUrl('lulla://qa/play/snow'), { kind: 'play', ids: ['snow'] });
    assert.deepEqual(parseQaUrl('lulla://qa/play/rain,snow'), { kind: 'play', ids: ['rain', 'snow'] });
    assert.deepEqual(parseQaUrl('lulla://qa/stop'), { kind: 'stop' });
    assert.equal(parseQaUrl('lulla://qa/play/'), null);
    assert.equal(parseQaUrl('https://evil.example/qa/play/snow'), null);
    assert.equal(parseQaUrl(null), null);
  });
  it('QA mode only turns on from an explicit build-time flag', () => {
    const cfg = readFileSync(join(root, 'src/config.ts'), 'utf8');
    assert.ok(cfg.includes("process.env.EXPO_PUBLIC_LULLA_QA === '1'"));
    const eas = JSON.parse(readFileSync(join(root, 'eas.json'), 'utf8'));
    assert.ok(!JSON.stringify(eas).includes('EXPO_PUBLIC_LULLA_QA'));
  });
});
