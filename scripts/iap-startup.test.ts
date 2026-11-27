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

const PROMPTING = [/restorePurchases\s*\(/, /syncPurchases\s*\(/, /\brestore\s*\(/];

describe('IAP startup must not prompt for Apple ID (RevenueCat)', () => {
  const purchases = src('src/purchases.ts');
  const app = src('App.tsx');
  const config = src('src/config.ts');

  it('initIAP only configures the SDK and listens: no restore or sync', () => {
    const body = functionBody(purchases, 'initIAP');
    for (const re of PROMPTING) assert.equal(re.test(body), false, `${re} must not run inside initIAP`);
    assert.match(body, /Purchases\.configure/);
    assert.match(body, /addCustomerInfoUpdateListener/);
  });

  it('refreshEntitlements reads cached customer info only', () => {
    const body = functionBody(purchases, 'refreshEntitlements');
    for (const re of PROMPTING) assert.equal(re.test(body), false, `${re} must not run inside refreshEntitlements`);
    assert.match(body, /getCustomerInfo/);
  });

  it('restorePurchases runs only from restore(), when the user taps Restore purchases', () => {
    const all = purchases.match(/restorePurchases\s*\(/g) ?? [];
    const inRestore = functionBody(purchases, 'restore').match(/restorePurchases\s*\(/g) ?? [];
    assert.equal(all.length, 1);
    assert.equal(inRestore.length, 1);
  });

  it('App boot hides the splash before any IAP work and never restores', () => {
    const boot = bootEffect(app);
    assert.doesNotMatch(boot, /\brestore\s*\(/);
    assert.doesNotMatch(boot, /restorePurchases\s*\(/);
    const hideAt = boot.indexOf('SplashScreen.hideAsync');
    const iapAt = boot.indexOf('initIAP(');
    assert.ok(hideAt >= 0, 'boot must call SplashScreen.hideAsync');
    assert.ok(iapAt < 0 || hideAt < iapAt, 'SplashScreen.hideAsync must run before initIAP');
    assert.doesNotMatch(boot.slice(0, hideAt), /initIAP\s*\(|refreshEntitlements\s*\(|loadPlans\s*\(/);
    assert.match(boot, /\(async \(\) => \{/);
  });

  it('uses the four store product ids, RevenueCat packages, and no hard-coded price', () => {
    for (const id of ['lulla_premium_weekly', 'lulla_premium_monthly', 'lulla_premium_yearly', 'lulla_premium_lifetime']) assert.match(config, new RegExp(id));
    for (const pkg of ['\\$rc_weekly', '\\$rc_monthly', '\\$rc_annual', '\\$rc_lifetime']) assert.match(config, new RegExp(pkg));
    assert.match(purchases, /from 'react-native-purchases'/);
    assert.doesNotMatch(purchases + app, /expo-iap/);
    assert.doesNotMatch(config + app, /PRICE_LABEL|\$\d+\.\d\d/);
    assert.match(app, /planButtonText\(plan\)/);
  });
});

describe('onboarding and push consent', () => {
  const onb = src('src/Onboarding.tsx');
  const push = src('src/push.ts');
  it('exports ONBOARDING_SCREENS = 10 and has 10 steps', () => {
    assert.match(onb, /export const ONBOARDING_SCREENS = 10;/);
    const steps = onb.slice(onb.indexOf('const STEPS'), onb.indexOf('];', onb.indexOf('const STEPS')));
    assert.equal((steps.match(/\{ kind: '/g) ?? []).length, 10);
  });
  it('OneSignal requires consent before init and only asks permission after opt-in', () => {
    assert.ok(push.indexOf('setConsentRequired(true)') < push.indexOf('OneSignal.initialize('));
    assert.match(functionBody(push, 'setPushConsent'), /if \(given\) await OneSignal\.Notifications\.requestPermission/);
    assert.doesNotMatch(functionBody(push, 'initPush'), /requestPermission/);
  });
});
