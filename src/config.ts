// Central product config. Change here only.
export const FREE_SECONDS = 180; // 3 minutes of free listening, then paywall
export const PRICE_LABEL = '$4.99 / month';
export const ENTITLEMENT_ID = 'premium';
export const PRODUCT_ID_IOS = 'lulla_premium_monthly';
export const PRODUCT_ID_ANDROID = 'lulla_premium_monthly';

// RevenueCat PUBLIC SDK keys (safe to ship in the app). Replace before building.
export const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_RC_IOS_KEY ?? 'appl_REPLACE_ME';
export const RC_API_KEY_ANDROID = process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? 'goog_REPLACE_ME';

export const PRIVACY_URL = 'https://momentumbysamay.com/lulla/privacy';
export const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
