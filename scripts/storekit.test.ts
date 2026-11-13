import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_PRODUCT_IDS, INAPP_PRODUCT_IDS, LIFETIME_ENABLED, PRODUCT_CATALOG, PRODUCT_IDS, SUB_PRODUCT_IDS } from '../src/config.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sk = JSON.parse(readFileSync(join(root, 'storekit/Lulla.storekit'), 'utf8'));
const subs = sk.subscriptionGroups.flatMap((g: { subscriptions: { productID: string; recurringSubscriptionPeriod: string }[] }) => g.subscriptions);

describe('StoreKit test config', () => {
  it('has exactly the IAP product ids used in code', () => {
    assert.deepEqual(subs.map((s: { productID: string }) => s.productID).sort(), [...SUB_PRODUCT_IDS].sort());
    assert.deepEqual(sk.products.map((s: { productID: string }) => s.productID).sort(), [...INAPP_PRODUCT_IDS].sort());
  });
  it('lifetime unlock: flag on, non-consumable lulla_premium_lifetime, bought and restored like the rest', () => {
    assert.equal(LIFETIME_ENABLED, true);
    assert.equal(PRODUCT_IDS.lifetime, 'lulla_premium_lifetime');
    assert.ok(ALL_PRODUCT_IDS.includes('lulla_premium_lifetime'));
    const def = PRODUCT_CATALOG.find((p) => p.kind === 'lifetime');
    assert.deepEqual({ type: def?.type, period: def?.period }, { type: 'in-app', period: null });
    const src = readFileSync(join(root, 'src/purchases.ts'), 'utf8');
    assert.match(src, /fetchProducts\(\{ skus: INAPP_PRODUCT_IDS, type: 'in-app' \}\)/);
    assert.match(src, /type: plan\.type/); // requestPurchase uses 'in-app' for lifetime
    assert.match(src, /for \(const id of ALL_PRODUCT_IDS\)[\s\S]*currentEntitlementIOS\(id\)/); // iOS entitlement covers lifetime
    assert.match(src, /isConsumable: false/);
    assert.match(src, /INAPP_PRODUCT_IDS.includes\(purchase.productId\)\) ownsLifetime = true/); // restore unlocks lifetime
  });
  it('periods match the catalog', () => {
    const want: Record<string, string> = { year: 'P1Y', month: 'P1M' };
    for (const p of PRODUCT_CATALOG.filter((x) => x.period)) {
      assert.equal(subs.find((s: { productID: string }) => s.productID === p.id).recurringSubscriptionPeriod, want[p.period as string]);
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
