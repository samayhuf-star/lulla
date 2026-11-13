import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseQaUrl } from '../src/qa.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

describe('QA links for the public-runner sim flow (QA builds only)', () => {
  it('buy and restore parse', () => {
    assert.deepEqual(parseQaUrl('lulla://qa/buy/monthly'), { kind: 'buy', plan: 'monthly' });
    assert.deepEqual(parseQaUrl('lulla://qa/buy/yearly'), { kind: 'buy', plan: 'yearly' });
    assert.equal(parseQaUrl('lulla://qa/buy/lifetime'), null);
    assert.deepEqual(parseQaUrl('lulla://qa/restore'), { kind: 'restore' });
    assert.equal(parseQaUrl('lulla://qa/restore/x'), null);
    assert.deepEqual(parseQaUrl('lulla://qa/timer/2'), { kind: 'timer', minutes: 2 });
    assert.deepEqual(parseQaUrl('lulla://qa/overlay/off'), { kind: 'overlay', on: false });
    assert.equal(parseQaUrl('lulla://qa/overlay'), null);
  });
  it('the QA hooks are gated on QA_MODE and use the real buy/restore', () => {
    const app = read('App.tsx');
    assert.match(app, /const qaLog = \(msg: string\) => \{\s*\/\/[^\n]*\n\s*if \(QA_MODE\)/);
    assert.match(app, /if \(!QA_MODE\) return;\s*const handle/);
    assert.match(app, /const qaBuyPlan = \(plan: Plan\) =>\s*buy\(plan\)/);
    assert.match(app, /if \(QA_MODE\) \{\s*qaLog\(`plans:/);
  });
  it('runner scripts: prepare sets the QA env and the StoreKit host, flow covers every requested screen', () => {
    const prep = read('qa/sim-qa/prepare.sh');
    assert.match(prep, /EXPO_PUBLIC_LULLA_QA=1" >> "\$GITHUB_ENV"/);
    assert.match(prep, /prepare-xcode-qa\.rb/);
    const flow = read('qa/sim-qa/flow.sh');
    for (const s of ['launch/l', '02-home-hero', '03-frequencies-category', '04-paywall-storekit-prices', '06-free-rain-playing', '07-locked-snow-paywall',
      '11-timer-options', '10-sound-credits', '21-purchase-result', '23-restore-after-purchase', '19-background', 'store69', 'store65', 'overlay/off', '-5-paywall', 'store_pass store65 s65', 'timer/2', 'wrap/freq_432']) {
      assert.ok(flow.includes(s), s);
    }
    assert.ok(flow.includes('Open in Lulla'), 'go() documents the Open-in-app confirmation');
    assert.ok(flow.includes('[ "$wait" -lt 2 ] && wait=2'), 'go() waits at least 2s for the host to tap Open');
    assert.ok(!read('eas.json').includes('sim-qa'));
  });
});
