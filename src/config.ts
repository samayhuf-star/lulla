// Central product config. Change here only.
export const FREE_SECONDS = 180; // 3 minutes of free listening, then paywall
export const ENTITLEMENT_ID = 'premium';
// Products (must match App Store Connect / Play Console and RevenueCat):
// monthly $4.99, annual = 30% off the monthly price ($41.99/yr)
export const PRODUCT_ID_MONTHLY = 'lulla_premium_monthly';
export const PRODUCT_ID_YEARLY = 'lulla_premium_yearly';

// RevenueCat PUBLIC SDK keys (safe to ship in the app). Replace before building.
export const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_RC_IOS_KEY ?? 'appl_REPLACE_ME';
export const RC_API_KEY_ANDROID = process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? 'goog_REPLACE_ME';

export const PRIVACY_URL = 'https://samay-app-legal.netlify.app/lulla/privacy/';
export const TERMS_URL = 'https://samay-app-legal.netlify.app/lulla/terms/';
