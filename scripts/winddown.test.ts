import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PATTERNS, cycleSeconds, patternById, phaseAt, ritualDone, ritualGain, SWELL_MIN } from '../src/ritual.ts';
import { addMix, cleanName, parseMixes, removeMix, MAX_SAVED } from '../src/mixesLogic.ts';
import { dayKey, logEntry, parseEntries, weekSummary } from '../src/journalLogic.ts';

describe('ritual pacer', () => {
  it('walks in, hold, out for 4-7-8', () => {
    const p = patternById('relax478');
    assert.equal(cycleSeconds(p), 19);
    assert.equal(phaseAt(p, 0).phase, 'in');
    assert.equal(phaseAt(p, 4000).phase, 'hold');
    assert.equal(phaseAt(p, 11000).phase, 'out');
    assert.equal(phaseAt(p, 19000).breaths, 1);
    assert.equal(phaseAt(p, 19000).phase, 'in');
  });
  it('fullness rises on in, stays on hold, falls on out', () => {
    const p = patternById('box');
    assert.equal(phaseAt(p, 2000).fullness, 0.5);
    assert.equal(phaseAt(p, 6000).fullness, 1);
    assert.equal(phaseAt(p, 10000).fullness, 0.5);
    assert.equal(phaseAt(p, 13000).fullness, 0);
  });
  it('skips zero-length phases and never shows 0 seconds', () => {
    const p = patternById('calm');
    for (let t = 0; t < 30000; t += 250) {
      const st = phaseAt(p, t);
      assert.ok(st.secondsLeft >= 1);
      assert.notEqual(st.phase, 'hold');
      assert.notEqual(st.phase, 'rest');
    }
  });
  it('volume swell stays gentle and in range', () => {
    assert.equal(ritualGain(0), SWELL_MIN);
    assert.equal(ritualGain(1), 1);
    assert.equal(ritualGain(5), 1);
    assert.equal(ritualGain(-1), SWELL_MIN);
  });
  it('finishes after the chosen minutes', () => {
    assert.equal(ritualDone(179_999, 3), false);
    assert.equal(ritualDone(180_000, 3), true);
    assert.ok(PATTERNS.length >= 3);
  });
});

describe('saved nights', () => {
  it('adds newest first, replaces same name, ignores empty', () => {
    let l = addMix([], 'Rainy cabin', [{ id: 'rain', vol: 0.6 }, { id: 'fire', vol: 2 }], 1);
    assert.equal(l[0].items[1].vol, 1);
    l = addMix(l, 'rainy CABIN', [{ id: 'rain', vol: 0.3 }], 2);
    assert.equal(l.length, 1);
    assert.equal(l[0].items[0].vol, 0.3);
    assert.equal(addMix(l, 'x', [], 3), l);
    l = addMix(l, '   ', [{ id: 'wind', vol: 0.5 }], 4);
    assert.equal(l[0].name, 'Night 2');
  });
  it('caps the list, trims names, removes by id', () => {
    let l: ReturnType<typeof addMix> = [];
    for (let i = 0; i < 30; i += 1) l = addMix(l, `n${i}`, [{ id: 'rain', vol: 1 }], i);
    assert.equal(l.length, MAX_SAVED);
    assert.equal(cleanName('  a   b  '), 'a b');
    assert.equal(removeMix(l, l[0].id).length, MAX_SAVED - 1);
  });
  it('parses defensively and drops unknown sounds', () => {
    const known = new Set(['rain', 'fire']);
    assert.deepEqual(parseMixes('nope', known), []);
    const out = parseMixes(JSON.stringify([{ id: 'a', name: 'A', items: [{ id: 'rain', vol: 0.5 }, { id: 'zzz', vol: 1 }] }, { id: 'b', name: 'B', items: [{ id: 'zzz', vol: 1 }] }]), known);
    assert.equal(out.length, 1);
    assert.equal(out[0].items.length, 1);
  });
});

describe('sleep journal', () => {
  it('keeps one entry per day and summarises the week', () => {
    const today = new Date(2026, 10, 17);
    let l = logEntry([], { day: '2026-11-17', rested: 2, ease: 'slow' });
    l = logEntry(l, { day: '2026-11-17', rested: 4, ease: 'fast', mixName: 'Rain' });
    l = logEntry(l, { day: '2026-11-16', rested: 5, ease: 'fast', mixName: 'Rain' });
    assert.equal(l.length, 2);
    const w = weekSummary(l, today);
    assert.equal(w.days.length, 7);
    assert.equal(w.days[6].day, '2026-11-17');
    assert.equal(w.logged, 2);
    assert.equal(w.avgRested, 4.5);
    assert.equal(w.topMix, 'Rain');
    assert.equal(dayKey(today), '2026-11-17');
  });
  it('rejects malformed stored entries', () => {
    assert.deepEqual(parseEntries('{"a":1}'), []);
    assert.equal(parseEntries(JSON.stringify([{ day: 'bad', rested: 3, ease: 'okay' }, { day: '2026-01-02', rested: 3, ease: 'okay' }])).length, 1);
  });
});
