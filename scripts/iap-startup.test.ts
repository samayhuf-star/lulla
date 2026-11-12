import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function src(rel: string) {
  return readFileSync(join(root, rel), 'utf8');
}

function functionBody(source: string, name: string): string {
  const re = new RegExp(`(?:export )?(?:async )?function ${name}\\s*\\([^)]*\\)\\s*(?::[^{]+)?\\{`);
  const m = re.exec(source);
  if (!m || m.index == null) throw new Error(`Could not find function ${name}`);
  let i = m.index + m[0].length;
  let depth = 1;
  const start = i;
  while (i < source.length && depth > 0) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') depth--;
    i++;
  }
  return source.slice(start, i - 1);
}

/** First useEffect in App.tsx is the boot effect. */
function bootEffect(app: string): string {
  const marker = 'useEffect(() => {\n    SplashScreen.hideAsync()';
  const at = app.indexOf(marker);
  if (at < 0) throw new Error('Could not find the App boot effect');
  let i = app.indexOf('{', at);
  let depth = 0;
  const start = i;
  while (i < app.length) {
    if (app[i] === '{') depth++;
    else if (app[i] === '}') {
      depth--;
      if (depth === 0) return app.slice(start, i + 1);
    }
    i++;
  }
  throw new Error('Unclosed boot effect');
}

const PROMPTING = [/syncIOS\s*\(/, /storeRestore\s*\(/, /restorePurchases\s*\(/, /getAvailablePurchases\s*\(/];

describe('IAP startup must not prompt for Apple ID', () => {
  const purchases = src('src/purchases.ts');
  const app = src('App.tsx');
  const config = src('src/config.ts');

  it('initIAP only connects and listens — no sync, restore, or getAvailablePurchases', () => {
    const body = functionBody(purchases, 'initIAP');
    for (const re of PROMPTING) {
      assert.equal(re.test(body), false, `${re} must not run inside initIAP`);
    }
    assert.match(body, /ensureConnected|initConnection|attachListeners/);
  });

  it('refreshEntitlements uses current entitlements only — no sync or restore', () => {
    const body = functionBody(purchases, 'refreshEntitlements');
    for (const re of PROMPTING) {
      assert.equal(re.test(body), false, `${re} must not run inside refreshEntitlements`);
    }
    assert.match(body, /currentEntitlementIOS|hasActiveSubscriptions|getActiveSubscriptions/);
  });

  it('sync and restore run only from restore(), when the user taps Restore Purchases', () => {
    const body = functionBody(purchases, 'restore');
    assert.match(body, /syncIOS\s*\(/);
    assert.match(body, /storeRestore\s*\(/);
  });

  it('App boot hides the splash before any IAP work and never calls sync or restore', () => {
    const boot = bootEffect(app);
    assert.doesNotMatch(boot, /syncIOS\s*\(/);
    assert.doesNotMatch(boot, /\brestore\s*\(/);
    assert.doesNotMatch(boot, /restorePurchases\s*\(/);
    assert.doesNotMatch(boot, /getAvailablePurchases\s*\(/);
    const hideAt = boot.indexOf('SplashScreen.hideAsync');
    const iapAt = boot.indexOf('initIAP(');
    assert.ok(hideAt >= 0, 'boot must call SplashScreen.hideAsync');
    assert.ok(iapAt < 0 || hideAt < iapAt, 'SplashScreen.hideAsync must run before initIAP so the splash does not wait on StoreKit');
    const beforeHide = boot.slice(0, hideAt);
    assert.doesNotMatch(beforeHide, /initIAP\s*\(|refreshEntitlements\s*\(|loadPlans\s*\(/);
    assert.match(boot, /\(async \(\) => \{/);
  });

  it('the purchase-update listener path does not call getAvailablePurchases, sync, or restore', () => {
    for (const name of ['verifyOnDevice', 'verifyAndFinish', 'attachListeners'] as const) {
      const body = functionBody(purchases, name);
      for (const re of PROMPTING) {
        assert.equal(re.test(body), false, `${re} must not run inside ${name}`);
      }
    }
    const verify = functionBody(purchases, 'verifyOnDevice');
    assert.match(verify, /currentEntitlementIOS|isTransactionVerifiedIOS/);
    assert.match(verify, /purchase\.purchaseState/);
    const attach = functionBody(purchases, 'attachListeners');
    assert.match(attach, /purchaseUpdatedListener/);
    assert.match(attach, /verifyAndFinish/);
    const restore = functionBody(purchases, 'restore');
    const callRe = /getAvailablePurchases\s*\(/g;
    const allCalls = purchases.match(callRe) ?? [];
    const restoreCalls = restore.match(callRe) ?? [];
    assert.equal(allCalls.length, restoreCalls.length);
    assert.ok(restoreCalls.length >= 1, 'restore() may still call getAvailablePurchases after the user taps Restore');
  });

  it('uses the App Store Connect product IDs and does not hard-code a price in config', () => {
    assert.match(config, /lulla_premium_yearly/);
    assert.match(config, /lulla_premium_monthly/);
    assert.doesNotMatch(config, /RevenueCat|RC_API_KEY|PRICE_LABEL|\$1\.99|\$4\.99|\$41\.99/);
    assert.doesNotMatch(app, /react-native-purchases|PurchasesPackage|PRICE_LABEL|\$1\.99/);
    assert.match(app, /plan\.price/);
  });
});
