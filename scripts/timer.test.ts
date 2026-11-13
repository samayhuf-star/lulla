import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SLEEP_FADE_SEC, planTimer, timerDone, timerGain } from '../src/timer.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');
const catalog = read('src/catalog.ts');
const app = read('App.tsx');
const options = [...catalog.matchAll(/\{ label: '([^']+)', minutes: (\d+|null) \}/g)].map((m) => ({
  label: m[1], minutes: m[2] === 'null' ? null : +m[2],
}));

describe('sleep timer options', () => {
  it('keeps 2 h and 3 h and adds 4 h (240 min) and All night', () => {
    const byMin = new Map(options.map((o) => [o.minutes, o.label]));
    assert.equal(byMin.get(120), '2 hours');
    assert.equal(byMin.get(180), '3 hours');
    assert.equal(byMin.get(240), '4 hours');
    assert.equal(byMin.get(null), 'All night');
  });
});

describe('All night', () => {
  it('never schedules a stop, so the loops keep going', () => {
    const t0 = Date.UTC(2026, 10, 13, 22, 0, 0);
    assert.equal(planTimer(t0, null), null);
    for (const h of [1, 4, 8, 12, 24]) {
      const later = t0 + h * 3_600_000;
      assert.equal(timerGain(later, null), 1);
      assert.equal(timerDone(later, null), false);
    }
    // App: All night (null) goes through planTimer and so sets no end time.
    assert.match(app, /const plan = planTimer\(now, minutes\);/);
  });
});

describe('fade-out', () => {
  it('is about 60 s and starts at end minus 60 s', () => {
    assert.equal(SLEEP_FADE_SEC, 60);
    const t0 = 1_000_000;
    const p = planTimer(t0, 120)!;
    assert.equal(p.endMs - t0, 120 * 60_000);
    assert.equal(p.endMs - p.fadeStartMs, 60_000);
    assert.equal(timerGain(p.fadeStartMs - 1, p), 1);
    assert.equal(timerGain(p.fadeStartMs, p), 1);
    assert.ok(Math.abs(timerGain(p.fadeStartMs + 30_000, p) - 0.5) < 1e-9);
    assert.equal(timerGain(p.endMs, p), 0);
    assert.equal(timerDone(p.endMs - 1, p), false);
    assert.equal(timerDone(p.endMs, p), true);
    const p4 = planTimer(t0, 240)!;
    assert.equal(p4.endMs - t0, 240 * 60_000);
  });
  it('the app uses the planned fade, not the old 10 s fade', () => {
    assert.match(app, /timerGain\(now, timerPlan\)/);
    assert.doesNotMatch(app, /tl <= 10/);
  });
});

describe('background playback config', () => {
  it('iOS keeps audio running with the screen locked; every sound loops', () => {
    const cfg = JSON.parse(read('app.json'));
    assert.ok(cfg.expo.ios.infoPlist.UIBackgroundModes.includes('audio'));
    const mixer = read('src/mixer.ts');
    assert.match(mixer, /shouldPlayInBackground: true/);
    assert.match(mixer, /playsInSilentMode: true/);
    assert.match(mixer, /player\.loop = true/);
    assert.match(mixer, /control\.loop = true/);
  });
});

describe('Healing / Frequencies category', () => {
  const entries = [...catalog.matchAll(/\{ id: '([a-z0-9_]+)', name: '([^']+)'[^\n]*\}/g)].map((m) => ({ id: m[1], name: m[2], line: m[0] }));
  it('has the 5 original loops, one of them free', () => {
    const heal = entries.filter((e) => e.line.includes("category: 'Healing / Frequencies'"));
    assert.deepEqual(heal.map((e) => e.name), ['432 Hz Deep Sleep', '528 Hz Calm', '963 Hz Night', '432+528 Blend', 'Deep Drone']);
    assert.ok(catalog.includes("'Healing / Frequencies'];"));
  });
  it('titles and descriptions make no medical or health claims (App Review 1.4.1)', () => {
    const BANNED = /\b(cure[sd]?|curing|heals? you|heals|treat(s|ment|ing)?|therap(y|eutic)|repairs?|DNA|anxiety|depression|insomnia|pain|detox|medical|medicine|clinically|doctor|disease|immune|chakra|miracle|regenerat\w*|stress relief|reduces? stress|lowers? blood)\b/i;
    const texts: string[] = [];
    for (const e of entries) {
      texts.push(e.name);
      const d = /description: '([^']+)'/.exec(e.line);
      if (d) texts.push(d[1]);
    }
    assert.ok(texts.length >= 48);
    for (const t of texts) assert.doesNotMatch(t, BANNED, t);
    const listing = read('store/listing.md');
    for (const phrase of ['heals you', 'repairs DNA', 'reduces anxiety', 'cures']) {
      assert.ok(!listing.toLowerCase().includes(phrase.toLowerCase()), `store listing: ${phrase}`);
    }
  });
});
