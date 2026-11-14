import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CREDITS, CREDITS_PAGE_URL } from '../src/credits.ts';
import { parseQaUrl } from '../src/qa.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');
const app = read('App.tsx');
const lic = read('ASSET_LICENSES.md');

describe('Sound credits screen', () => {
  it('Settings has a Sound credits row that opens the credits screen', () => {
    const sheet = app.slice(app.indexOf('{/* Settings sheet'), app.indexOf('{/* Sound credits'));
    assert.match(sheet, />Sound credits</);
    assert.match(sheet, /setShowCredits\(true\)/);
    assert.match(app, /<Modal visible=\{showCredits\}/);
    assert.match(app, /CREDITS\.map/);
    assert.deepEqual(parseQaUrl('lulla://qa/credits'), { kind: 'credits' });
  });

  it('carries the Farm CC BY 4.0 attribution exactly as ASSET_LICENSES.md, with links', () => {
    const farm = CREDITS.find((c) => c.title === 'Farm')!;
    assert.ok(lic.includes('"farmland at river-village Lage-Zwaluwe" by klankbeeld (https://freesound.org/s/840052/), licensed under CC BY 4.0'));
    assert.match(farm.body, /"farmland at river-village Lage-Zwaluwe" by klankbeeld \(Freesound 840052\), licensed under CC BY 4\.0/);
    assert.match(farm.body, /Changes: trimmed, equalised, compressed, level-matched and looped\./);
    const urls = (farm.links ?? []).map((l) => l.url);
    assert.ok(urls.includes('https://freesound.org/s/840052/'));
    assert.ok(urls.includes('https://creativecommons.org/licenses/by/4.0/'));
  });

  it('covers the CC0 recordings and the original Frequencies loops by Samay Vashsht', () => {
    const all = CREDITS.map((c) => c.body).join('\n');
    assert.match(all, /CC0 1\.0/);
    assert.match(all, /original loops by Samay Vashsht/);
    for (const n of ['432 Hz Deep Sleep', '528 Hz Calm', '963 Hz Night', '432+528 Blend', 'Deep Drone']) assert.ok(all.includes(n), n);
    // Only Farm is CC BY in the shipped set.
    assert.ok(lic.includes('No other shipped sound is CC BY'));
    assert.equal(CREDITS.filter((c) => /CC BY/.test(c.body)).length, 1);
    assert.match(CREDITS_PAGE_URL, /support\.html#sound-credits$/);
  });

  it('copy has no ellipsis, AI mention or health claim', () => {
    const text = JSON.stringify(CREDITS);
    assert.doesNotMatch(text, /…|\.\.\./);
    assert.doesNotMatch(text, /\bAI\b|heal|cure|therap/i);
  });
});
