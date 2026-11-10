// Central product config. Change here only.
export const FREE_SECONDS = 180; // 3 minutes of free listening, then paywall
export const PRICE_MONTHLY = '$4.99';
export const PRICE_ANNUAL = '$41.99';
export const PRICE_ANNUAL_PER_MONTH = '$3.50';
export const ANNUAL_SAVE_PCT = 30; // 12 x $4.99 = $59.88 vs $41.99 -> about 30% off, so the claim is true
export const ENTITLEMENT_ID = 'premium';
export const PRODUCT_ID_MONTHLY = 'lulla_premium_monthly';
export const PRODUCT_ID_ANNUAL = 'lulla_premium_yearly';

// RevenueCat PUBLIC SDK keys (safe to ship in the app). Replace before building.
export const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_RC_IOS_KEY ?? 'appl_REPLACE_ME';
export const RC_API_KEY_ANDROID = process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? 'goog_REPLACE_ME';

export const PRIVACY_URL = 'https://samayhuf-star.github.io/lulla/privacy';
export const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
