// Central product and legal config. Change here only.
// Preview of the premium sounds only. The free sounds in src/access.ts have no time limit.
export const FREE_SECONDS = 180;

// RevenueCat project "Lulla": offering "default", entitlement "premium". Prices come from the store.
export const ENTITLEMENT_ID = 'premium';

export const PRODUCT_IDS = {
  weekly: 'lulla_premium_weekly',
  monthly: 'lulla_premium_monthly',
  yearly: 'lulla_premium_yearly',
  lifetime: 'lulla_premium_lifetime',
} as const;

// Paywall order: yearly first (best value). Package ids are RevenueCat defaults.
export const PRODUCT_CATALOG = [
  { id: PRODUCT_IDS.yearly, pkg: '$rc_annual', kind: 'yearly' as const, label: 'Yearly', period: 'year' },
  { id: PRODUCT_IDS.monthly, pkg: '$rc_monthly', kind: 'monthly' as const, label: 'Monthly', period: 'month' },
  { id: PRODUCT_IDS.weekly, pkg: '$rc_weekly', kind: 'weekly' as const, label: 'Weekly', period: 'week' },
  { id: PRODUCT_IDS.lifetime, pkg: '$rc_lifetime', kind: 'lifetime' as const, label: 'Lifetime', period: null },
];

export const ALL_PRODUCT_IDS = PRODUCT_CATALOG.map((p) => p.id);

export const isKnownProduct = (id: string) => ALL_PRODUCT_IDS.some((p) => id === p || id.startsWith(p + ':'));

export const PRIVACY_URL = 'https://samayhuf-star.github.io/app-legal/lulla/privacy.html';
export const TERMS_URL = 'https://samayhuf-star.github.io/app-legal/lulla/terms.html';
export const SUPPORT_URL = 'https://samayhuf-star.github.io/app-legal/lulla/support.html';

// QA builds only. Set EXPO_PUBLIC_LULLA_QA=1 for the CI simulator run; store builds never set it.
export const QA_MODE = process.env.EXPO_PUBLIC_LULLA_QA === '1';
