import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_PRODUCT_IDS, PRODUCT_CATALOG } from '../src/config.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sk = JSON.parse(readFileSync(join(root, 'storekit/Lulla.storekit'), 'utf8'));
const subs = sk.subscriptionGroups.flatMap((g: { subscriptions: { productID: string; recurringSubscriptionPeriod: string }[] }) => g.subscriptions);

describe('StoreKit test config', () => {
  it('has exactly the IAP product ids used in code', () => {
    assert.deepEqual(subs.map((s: { productID: string }) => s.productID).sort(), [...ALL_PRODUCT_IDS].sort());
  });
  it('periods match the catalog', () => {
    const want: Record<string, string> = { year: 'P1Y', month: 'P1M' };
    for (const p of PRODUCT_CATALOG) {
      assert.equal(subs.find((s: { productID: string }) => s.productID === p.id).recurringSubscriptionPeriod, want[p.period]);
    }
  });
  it('both subscriptions share one group', () => {
    assert.equal(sk.subscriptionGroups.length, 1);
  });
});

describe('StoreKit test session in the sim run (CI only)', () => {
  const wf = readFileSync(join(root, '.github/workflows/sim-qa.yml'), 'utf8');
  const rb = readFileSync(join(root, 'qa/scripts/prepare-xcode-qa.rb'), 'utf8');
  const swift = readFileSync(join(root, 'qa/LullaQATests/SimQATests.swift'), 'utf8');
  it('the UI test host opens storekit/Lulla.storekit in an SKTestSession and holds the app', () => {
    assert.match(swift, /import StoreKitTest/);
    assert.match(swift, /SKTestSession\(contentsOf:/);
    assert.match(swift, /disableDialogs = true/);
    assert.match(swift, /xcui-done/);
    assert.match(swift, /com\.apple\.springboard/);
    assert.match(swift, /buttons\["Open"\]/);
    assert.match(rb, /File\.join\(REPO, 'storekit', 'Lulla\.storekit'\)/);
    assert.match(rb, /StoreKitConfigurationFileReference/);
  });
  it('the workflow builds for testing, runs the host, and falls back to simctl launch', () => {
    assert.match(wf, /ruby qa\/scripts\/prepare-xcode-qa\.rb/);
    assert.match(wf, /xcodebuild build-for-testing/);
    assert.match(wf, /test-without-building[\s\S]*-only-testing:LullaQATests\/SimQATests\/testHoldAppForShellFlow/);
    assert.match(wf, /TEST_RUNNER_STOREKIT_CONFIG/);
    assert.match(wf, /StoreKit host did not start/);
    // Store builds never see the QA target: it is added only to the runner's generated ios/ folder.
    assert.ok(!readFileSync(join(root, 'eas.json'), 'utf8').includes('prepare-xcode-qa'));
  });
});
