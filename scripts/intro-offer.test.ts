import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { freeTrialDays, planButtonText } from '../src/introOffer.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

const weekTrial = { subscriptionOffers: [{ type: 'introductory', paymentMode: 'free-trial', period: { unit: 'week', value: 1 }, periodCount: 1 }] };
const dayTrial = { subscriptionOffers: [{ type: 'introductory', paymentMode: 'free-trial', period: { unit: 'day', value: 7 }, periodCount: 1 }] };
const paidIntro = { subscriptionOffers: [{ type: 'introductory', paymentMode: 'pay-as-you-go', period: { unit: 'month', value: 1 }, periodCount: 3 }] };
const legacyIOS = { introductoryPricePaymentModeIOS: 'free-trial', introductoryPriceSubscriptionPeriodIOS: 'week', introductoryPriceNumberOfPeriodsIOS: '1' };

describe('7-day free trial copy', () => {
  it('reads the trial length from the store offer', () => {
    assert.equal(freeTrialDays(weekTrial), 7);
    assert.equal(freeTrialDays(dayTrial), 7);
    assert.equal(freeTrialDays(legacyIOS), 7);
    assert.equal(freeTrialDays(paidIntro), null);
    assert.equal(freeTrialDays({ introductoryPricePaymentModeIOS: 'empty' }), null);
    assert.equal(freeTrialDays({}), null);
    assert.equal(freeTrialDays(null), null);
  });

  it('eligible user with a trial: "7 days free, then <price>/month" (or /year)', () => {
    assert.equal(planButtonText({ label: 'Monthly', price: '$4.99', kind: 'monthly', trialDays: 7 }), '7 days free, then $4.99/month');
    assert.equal(planButtonText({ label: 'Yearly', price: '41,99 €', kind: 'yearly', trialDays: 7 }), '7 days free, then 41,99 €/year');
  });

  it('no trial or not eligible: the current copy stays', () => {
    assert.equal(planButtonText({ label: 'Monthly', price: '$4.99', kind: 'monthly', trialDays: null }), 'Monthly · $4.99 / month');
    assert.equal(planButtonText({ label: 'Yearly', price: '$41.99', kind: 'yearly' }), 'Yearly · $41.99 / year');
  });

  it('trial days are only set when StoreKit says the user is eligible', () => {
    const src = read('src/purchases.ts');
    assert.match(src, /const trialDays = days && \(await introEligible\(product\)\) \? days : null;/);
    assert.match(src, /isEligibleForIntroOfferIOS\(group\)/);
    const fn = src.slice(src.indexOf('async function introEligible'), src.indexOf('export type BuyResult'));
    assert.match(fn, /catch[\s\S]*return false/);
    assert.match(read('App.tsx'), /planButtonText\(plan\)/);
    assert.match(read('src/introOffer.ts'), /plan\.price/);
  });

  it('StoreKit test config gives both products a 1-week free intro offer', () => {
    const sk = JSON.parse(read('storekit/Lulla.storekit'));
    const subs = sk.subscriptionGroups[0].subscriptions;
    for (const id of ['lulla_premium_monthly', 'lulla_premium_yearly']) {
      const s = subs.find((x: { productID: string }) => x.productID === id);
      assert.deepEqual({ mode: s.introductoryOffer.paymentMode, period: s.introductoryOffer.subscriptionPeriod }, { mode: 'free', period: 'P1W' }, id);
    }
  });
});
