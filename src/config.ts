// Central product and legal config. Change here only.
// Preview of the premium sounds only. The free sounds in src/access.ts have no time limit.
export const FREE_SECONDS = 180;

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

// QA builds only. Set EXPO_PUBLIC_LULLA_QA=1 for the CI simulator run; store builds never set it.
export const QA_MODE = process.env.EXPO_PUBLIC_LULLA_QA === '1';
