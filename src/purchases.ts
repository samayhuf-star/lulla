// Lulla Premium billing via RevenueCat (react-native-purchases). Offering "default", entitlement "premium".
// Startup only configures the SDK and reads cached customer info: it never restores (no Apple ID prompt).
import { Platform } from 'react-native';
import Purchases, { PURCHASES_ERROR_CODE, type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';
import { ENTITLEMENT_ID, PRODUCT_CATALOG } from './config';

export type Plan = (typeof PRODUCT_CATALOG)[number] & {
  price: string;
  rcPackage: PurchasesPackage;
  /** Free-trial days, set only when RevenueCat reports a free intro offer this user can still use. */
  trialDays: number | null;
};

export type BuyResult = 'purchased' | 'cancelled' | 'pending' | 'error';
export type PlansLoad = { plans: Plan[]; error: string | null };

const KEY = Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_RC_IOS_KEY : process.env.EXPO_PUBLIC_RC_ANDROID_KEY;
const UNAVAILABLE = 'Plans unavailable right now. Please try again shortly.';
const DAYS: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };
let configured = false;
const entitlementListeners = new Set<(isPremium: boolean) => void>();

const logErr = (action: string, e: unknown) => {
  const err = e as { code?: unknown; message?: string };
  console.log('[lulla-rc]', `${action} failed`, { code: err?.code, message: err?.message });
};

const isPremium = (info: CustomerInfo | null | undefined) => !!info?.entitlements.active[ENTITLEMENT_ID];
const emitPremium = (value: boolean) => entitlementListeners.forEach((cb) => cb(value));

/** Configure the SDK and listen for customer-info updates. Never restores or syncs. */
export async function initIAP(): Promise<boolean> {
  if (configured) return true;
  if (!KEY) return false;
  try {
    Purchases.configure({ apiKey: KEY });
    Purchases.addCustomerInfoUpdateListener((info) => emitPremium(isPremium(info)));
    configured = true;
  } catch (e) {
    logErr('configure', e);
  }
  return configured;
}

/** Trial length when the package has a free intro offer and RevenueCat says this user is eligible. */
async function trialDaysFor(p: PurchasesPackage): Promise<number | null> {
  const intro = p.product.introPrice;
  if (!intro || intro.price !== 0) return null;
  const days = (DAYS[intro.periodUnit] ?? 0) * (intro.periodNumberOfUnits || 1) * (intro.cycles || 1);
  if (!days) return null;
  if (Platform.OS !== 'ios') return days;
  try {
    const res = await Purchases.checkTrialOrIntroductoryPriceEligibility([p.product.identifier]);
    return res[p.product.identifier]?.status === Purchases.INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE ? days : null;
  } catch (e) {
    logErr('checkTrialOrIntroductoryPriceEligibility', e);
    return null;
  }
}

export async function loadPlans(): Promise<PlansLoad> {
  if (!(await initIAP())) return { plans: [], error: UNAVAILABLE };
  try {
    const offerings = await Purchases.getOfferings();
    const pkgs = offerings.current?.availablePackages ?? [];
    const plans: Plan[] = [];
    for (const def of PRODUCT_CATALOG) {
      const p = pkgs.find((x) => x.identifier === def.pkg);
      if (p) plans.push({ ...def, price: p.product.priceString, rcPackage: p, trialDays: await trialDaysFor(p) });
    }
    return plans.length ? { plans, error: null } : { plans: [], error: UNAVAILABLE };
  } catch (e) {
    logErr('getOfferings', e);
    return { plans: [], error: UNAVAILABLE };
  }
}

/** Cached customer info only: no restore, no Apple ID prompt. */
export async function refreshEntitlements(): Promise<boolean> {
  if (!(await initIAP())) return false;
  try {
    return isPremium(await Purchases.getCustomerInfo());
  } catch (e) {
    logErr('getCustomerInfo', e);
    return false;
  }
}

export function onEntitlementChange(cb: (isPremium: boolean) => void): () => void {
  entitlementListeners.add(cb);
  return () => {
    entitlementListeners.delete(cb);
  };
}

export async function buy(plan: Plan): Promise<BuyResult> {
  if (!(await initIAP())) return 'error';
  try {
    const { customerInfo } = await Purchases.purchasePackage(plan.rcPackage);
    const ok = isPremium(customerInfo);
    emitPremium(ok);
    return ok ? 'purchased' : 'error';
  } catch (e) {
    const err = e as { userCancelled?: boolean; code?: string };
    if (err?.userCancelled || err?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return 'cancelled';
    if (err?.code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) return 'pending';
    logErr('purchasePackage', e);
    return 'error';
  }
}

/** User-initiated only (Restore purchases on the paywall or in Settings). */
export async function restore(): Promise<boolean> {
  if (!(await initIAP())) return false;
  const ok = isPremium(await Purchases.restorePurchases());
  emitPremium(ok);
  return ok;
}
