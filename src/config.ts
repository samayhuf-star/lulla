// Central product and legal config. Change here only.
// Preview of the premium sounds only. The free sounds in src/access.ts have no time limit.
export const FREE_SECONDS = 180;

// One-time lifetime unlock (non-consumable, no trial). Same premium as the subscriptions.
// Set to false to hide it from the paywall and stop querying it.
export const LIFETIME_ENABLED = true;

export const PRODUCT_IDS = {
  yearly: 'lulla_premium_yearly',
  monthly: 'lulla_premium_monthly',
  lifetime: 'lulla_premium_lifetime',
} as const;

export type PlanKind = 'monthly' | 'yearly' | 'lifetime';
export type ProductDef = { id: string; kind: PlanKind; type: 'subs' | 'in-app'; label: string; period: 'year' | 'month' | null };

// USA list prices for reference only; the app always shows the store's localized price.
// yearly $19.99 and monthly $2.99 (each with a 7-day free trial), lifetime $39.99 (no trial).
const SUBSCRIPTIONS: ProductDef[] = [
  { id: PRODUCT_IDS.yearly, kind: 'yearly', type: 'subs', label: 'Yearly', period: 'year' },
  { id: PRODUCT_IDS.monthly, kind: 'monthly', type: 'subs', label: 'Monthly', period: 'month' },
];
const LIFETIME: ProductDef = { id: PRODUCT_IDS.lifetime, kind: 'lifetime', type: 'in-app', label: 'Lifetime', period: null };

export const PRODUCT_CATALOG: ProductDef[] = LIFETIME_ENABLED ? [...SUBSCRIPTIONS, LIFETIME] : SUBSCRIPTIONS;

export const ALL_PRODUCT_IDS = PRODUCT_CATALOG.map((p) => p.id);
export const SUB_PRODUCT_IDS = PRODUCT_CATALOG.filter((p) => p.type === 'subs').map((p) => p.id);
export const INAPP_PRODUCT_IDS = PRODUCT_CATALOG.filter((p) => p.type === 'in-app').map((p) => p.id);

export const isKnownProduct = (id: string) => ALL_PRODUCT_IDS.includes(id);

export const PRIVACY_URL = 'https://samayhuf-star.github.io/app-legal/lulla/privacy.html';
export const TERMS_URL = 'https://samayhuf-star.github.io/app-legal/lulla/terms.html';
export const SUPPORT_URL = 'https://samayhuf-star.github.io/app-legal/lulla/support.html';

// QA builds only. Set EXPO_PUBLIC_LULLA_QA=1 for the CI simulator run; store builds never set it.
export const QA_MODE = process.env.EXPO_PUBLIC_LULLA_QA === '1';
