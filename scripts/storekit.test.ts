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
