# Lulla - Sleep Sounds

Expo (React Native) sleep-sounds app by Samay Vashsht. Listen for three minutes for free, then unlock Lulla Premium through the App Store or Google Play.

## What it does

- 25 original in-house sleep sound loops (rain, ocean, wind, fireplace, white / pink / brown noise, and more)
- Mix several sounds at once with per-sound volume
- Sleep timer (10 minutes to 3 hours) with a gentle fade-out
- Background / screen-off playback
- Lulla Premium: yearly (`lulla_premium_yearly`) or monthly (`lulla_premium_monthly`) auto-renewing subscription via StoreKit 2 / Google Play Billing (`expo-iap`). Prices come from the store and are not hard-coded.
- Lifetime: optional one-time non-consumable `lulla_premium_lifetime` (same premium, no trial), behind `LIFETIME_ENABLED` in `src/config.ts` (on). Planned USA prices: $2.99/month and $19.99/year (each with a 7-day free trial), $39.99 lifetime. The app shows only the store's localized price.

Field-recording replacements from Freesound are not in this build (account sign-up is still pending). The 25 original loops ship instead. No third-party audio with unclear licensing is included.

## Project layout

- `App.tsx`, `src/` — app code
- `assets/sounds/` — 25 original synthesized loops
- `store/` — listing copy and privacy notes
- `LAUNCH_GUIDE.md` — store and EAS setup

## Legal

Copyright © 2026 Samay Vashsht.

- Privacy: https://samayhuf-star.github.io/app-legal/lulla/privacy.html
- Terms: https://samayhuf-star.github.io/app-legal/lulla/terms.html
- Support: https://samayhuf-star.github.io/app-legal/lulla/support.html

Contact: samayhuf@gmail.com only. Postal address: 2/61 Bhim Street, Vishwas Nagar, Delhi 110032, India. Governing law: Delhi, India.

## Develop

```bash
npm install
npx expo start
npm run typecheck
npm run lint
npm test
```

iOS production builds use EAS on the krosz Expo account (`eas build --platform ios --profile production`). Bundle ID: `com.samay.lulla`.
