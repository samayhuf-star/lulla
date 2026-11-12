// Central product and legal config. Change here only.
export const FREE_SECONDS = 180; // 3 minutes of free listening, then paywall

export const PRODUCT_IDS = {
  yearly: 'lulla_premium_yearly',
  monthly: 'lulla_premium_monthly',
} as const;

export const PRODUCT_CATALOG = [
  { id: PRODUCT_IDS.yearly, kind: 'yearly' as const, type: 'subs' as const, label: 'Yearly', period: 'year' },
  { id: PRODUCT_IDS.monthly, kind: 'monthly' as const, type: 'subs' as const, label: 'Monthly', period: 'month' },
];

export const ALL_PRODUCT_IDS = PRODUCT_CATALOG.map((p) => p.id);

export const isKnownProduct = (id: string) => ALL_PRODUCT_IDS.includes(id as (typeof ALL_PRODUCT_IDS)[number]);

export const PRIVACY_URL = 'https://samayhuf-star.github.io/app-legal/lulla/privacy.html';
export const TERMS_URL = 'https://samayhuf-star.github.io/app-legal/lulla/terms.html';
export const SUPPORT_URL = 'https://samayhuf-star.github.io/app-legal/lulla/support.html';
