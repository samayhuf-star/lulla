import { Platform } from 'react-native';
import {
  currentEntitlementIOS,
  ErrorCode,
  fetchProducts,
  finishTransaction,
  getActiveSubscriptions,
  getAvailablePurchases,
  hasActiveSubscriptions,
  initConnection,
  isEligibleForIntroOfferIOS,
  isTransactionVerifiedIOS,
  isUserCancelledError,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  restorePurchases as storeRestore,
  syncIOS,
  type ProductOrSubscription,
  type Purchase,
} from 'expo-iap';
import { ALL_PRODUCT_IDS, INAPP_PRODUCT_IDS, isKnownProduct, PRODUCT_CATALOG, SUB_PRODUCT_IDS, type ProductDef } from './config';
import { freeTrialDays, type ProductLike } from './introOffer';

export type Plan = ProductDef & {
  price: string;
  product: ProductOrSubscription;
  /** Free-trial days, set only when the store reports a trial AND this user is eligible. */
  trialDays: number | null;
};

/** iOS: StoreKit says whether this Apple ID may still use the group's intro offer. Android: Play only returns offers the user can use. Errors count as not eligible. */
async function introEligible(product: ProductOrSubscription): Promise<boolean> {
  if (Platform.OS !== 'ios') return true;
  const group = (product as { subscriptionGroupIdIOS?: string | null }).subscriptionGroupIdIOS;
  if (!group) return false;
  try {
    return !!(await isEligibleForIntroOfferIOS(group));
  } catch (e) {
    logErr('isEligibleForIntroOfferIOS', e);
    return false;
  }
}

export type BuyResult = 'purchased' | 'cancelled' | 'pending' | 'error';

export type PlansLoad = { plans: Plan[]; error: string | null };

let connected = false;
let listeners = false;
const entitlementListeners = new Set<(isPremium: boolean) => void>();
let purchaseWaiter: ((result: BuyResult) => void) | null = null;

const emitPremium = (isPremium: boolean) => {
  entitlementListeners.forEach((cb) => cb(isPremium));
};

const logErr = (action: string, e: unknown) => {
  const err = e as { code?: unknown; message?: string; debugMessage?: string };
  console.log('[lulla-iap]', `${action} failed`, {
    code: err?.code,
    message: err?.message,
    debugMessage: err?.debugMessage,
  });
};

async function ensureConnected(): Promise<boolean> {
  if (connected) return true;
  try {
    connected = !!(await initConnection());
  } catch (e) {
    logErr('initConnection', e);
    connected = false;
  }
  return connected;
}

async function verifyOnDevice(purchase: Purchase): Promise<boolean> {
  if (purchase.purchaseState === 'pending') return false;
  if ('isSuspendedAndroid' in purchase && purchase.isSuspendedAndroid) return false;
  if (!isKnownProduct(purchase.productId)) return false;

  if (Platform.OS === 'ios') {
    try {
      if (await isTransactionVerifiedIOS(purchase.productId)) return true;
    } catch (e) {
      logErr('isTransactionVerifiedIOS', e);
    }
    try {
      const entitlement = await currentEntitlementIOS(purchase.productId);
      if (entitlement) return true;
    } catch (e) {
      logErr('currentEntitlementIOS', e);
    }
    // StoreKit 2 already signed this transaction if it arrived via Transaction.updates.
    // Do not call getAvailablePurchases or sync here — a listener firing at connect would prompt for the Apple ID.
    return purchase.purchaseState === 'purchased' || purchase.purchaseState === 'unknown';
  }

  return purchase.purchaseState === 'purchased' || purchase.purchaseState === 'unknown';
}

async function verifyAndFinish(purchase: Purchase): Promise<boolean> {
  if (purchase.purchaseState === 'pending') return false;
  const ok = await verifyOnDevice(purchase);
  if (!ok) return false;
  try {
    await finishTransaction({ purchase, isConsumable: false });
  } catch (e) {
    logErr('finishTransaction', e);
  }
  return true;
}

function attachListeners() {
  if (listeners) return;
  listeners = true;
  purchaseUpdatedListener(async (purchase) => {
    if (purchase.purchaseState === 'pending') {
      purchaseWaiter?.('pending');
      purchaseWaiter = null;
      return;
    }
    const ok = await verifyAndFinish(purchase);
    if (ok) {
      const entitled = await refreshEntitlements();
      emitPremium(entitled);
    }
    purchaseWaiter?.(ok ? 'purchased' : 'error');
    purchaseWaiter = null;
  });
  purchaseErrorListener((error) => {
    logErr('purchaseError', error);
    if (isUserCancelledError(error) || error.code === ErrorCode.UserCancelled) {
      purchaseWaiter?.('cancelled');
    } else if (error.code === ErrorCode.Pending || error.code === ErrorCode.DeferredPayment) {
      purchaseWaiter?.('pending');
    } else {
      purchaseWaiter?.('error');
    }
    purchaseWaiter = null;
  });
}

/** Connect and listen for transaction updates. Never calls AppStore.sync or restore — those prompt for the Apple ID password. */
export async function initIAP(): Promise<boolean> {
  attachListeners();
  return ensureConnected();
}

export async function loadPlans(): Promise<PlansLoad> {
  if (!(await ensureConnected())) {
    return { plans: [], error: 'Plans unavailable right now. Please try again shortly.' };
  }
  let subs: ProductOrSubscription[] = [];
  try {
    subs = (await fetchProducts({ skus: SUB_PRODUCT_IDS, type: 'subs' })) ?? [];
  } catch (e) {
    logErr('fetchProducts subs', e);
  }
  // Lifetime unlock (non-consumable). Empty when LIFETIME_ENABLED is false.
  let oneTime: ProductOrSubscription[] = [];
  if (INAPP_PRODUCT_IDS.length) {
    try {
      oneTime = ((await fetchProducts({ skus: INAPP_PRODUCT_IDS, type: 'in-app' })) ?? []) as ProductOrSubscription[];
    } catch (e) {
      logErr('fetchProducts in-app', e);
    }
  }
  const byId = new Map<string, ProductOrSubscription>();
  for (const product of [...subs, ...oneTime]) {
    if (product?.id && product.displayPrice) byId.set(product.id, product);
  }
  const plans: Plan[] = [];
  for (const def of PRODUCT_CATALOG) {
    const product = byId.get(def.id);
    if (!product) continue;
    // Only subscriptions can have a trial; the lifetime unlock never shows trial copy.
    const days = def.type === 'subs' ? freeTrialDays(product as unknown as ProductLike) : null;
    const trialDays = days && (await introEligible(product)) ? days : null;
    plans.push({ ...def, price: product.displayPrice, product, trialDays });
  }
  if (!plans.length) {
    return { plans: [], error: 'Plans unavailable right now. Please try again shortly.' };
  }
  return { plans, error: null };
}

export async function refreshEntitlements(): Promise<boolean> {
  if (!(await ensureConnected())) return false;
  try {
    // Current entitlements only. Do not call syncIOS, restorePurchases, or getAvailablePurchases here —
    // those can show Apple's "Sign in to Apple Account" prompt.
    if (Platform.OS === 'ios') {
      for (const id of ALL_PRODUCT_IDS) {
        try {
          if (await currentEntitlementIOS(id)) return true;
        } catch (e) {
          logErr(`currentEntitlementIOS ${id}`, e);
        }
      }
    }
    try {
      if (await hasActiveSubscriptions(SUB_PRODUCT_IDS)) return true;
    } catch (e) {
      logErr('hasActiveSubscriptions', e);
    }
    try {
      const active = await getActiveSubscriptions(SUB_PRODUCT_IDS);
      if (active.some((s) => s.isActive)) return true;
    } catch (e) {
      logErr('getActiveSubscriptions', e);
    }
    return false;
  } catch (e) {
    logErr('refreshEntitlements', e);
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
  if (!(await ensureConnected())) return 'error';
  const result = new Promise<BuyResult>((resolve) => {
    purchaseWaiter = resolve;
  });
  try {
    await requestPurchase({
      request: {
        apple: { sku: plan.id },
        google: { skus: [plan.id] },
      },
      type: plan.type,
    });
  } catch (e) {
    purchaseWaiter = null;
    if (isUserCancelledError(e) || (e as { code?: string })?.code === ErrorCode.UserCancelled) return 'cancelled';
    if ((e as { code?: string })?.code === ErrorCode.Pending || (e as { code?: string })?.code === ErrorCode.DeferredPayment) {
      return 'pending';
    }
    logErr('requestPurchase', e);
    return 'error';
  }
  return result;
}

export async function restore(): Promise<boolean> {
  if (!(await ensureConnected())) return false;
  if (Platform.OS === 'ios') {
    try {
      await syncIOS();
    } catch (e) {
      logErr('syncIOS restore', e);
    }
  }
  try {
    await storeRestore();
  } catch (e) {
    logErr('restorePurchases', e);
  }
  let ownsLifetime = false;
  try {
    const purchases = await getAvailablePurchases({ onlyIncludeActiveItemsIOS: false });
    for (const purchase of purchases) {
      if (purchase.purchaseState === 'pending') continue;
      if (!isKnownProduct(purchase.productId)) continue;
      try {
        if (await verifyOnDevice(purchase)) {
          if (INAPP_PRODUCT_IDS.includes(purchase.productId)) ownsLifetime = true;
          await finishTransaction({ purchase, isConsumable: false });
        }
      } catch (e) {
        logErr('restore finish', e);
      }
    }
  } catch (e) {
    logErr('restore getAvailablePurchases', e);
  }
  // iOS: currentEntitlementIOS in refreshEntitlements covers the lifetime unlock too.
  // Android: a restored lifetime purchase counts here.
  const entitled = (await refreshEntitlements()) || ownsLifetime;
  emitPremium(entitled);
  return entitled;
}
