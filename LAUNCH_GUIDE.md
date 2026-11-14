# Lulla – Launch Guide (iOS + Android)

Paid model: **3 minutes free listening, then Lulla Premium** (yearly or monthly auto-renewing subscription). Prices come from the App Store or Google Play and are shown in the app.
Stack: Expo (React Native) + StoreKit 2 / Play Billing via `expo-iap`. No RevenueCat. Bundle ID / package: `com.samay.lulla`.

## What is built
| Area | Status |
|---|---|
| 25 original sleep sounds, seamless loops, synthesized in-house, no third-party licensing | Done |
| Multi-sound mixer with per-sound volume | Done |
| Sleep timer (10 min – 3 h) with 10 s fade-out | Done |
| Background / screen-off playback, keep-awake while playing | Done |
| 3-min free gate (counts only time actually playing; stored in OS keychain) | Done |
| Paywall: store prices, subscribe, restore purchases, Terms, Privacy, Support, auto-renew disclosure | Done |
| Entitlement check via StoreKit 2 current entitlements (no sync/restore at launch) | Done |
| Original icon, adaptive Android icon | Done |
| Legal pages | Hosted on app-legal |

## Steps only you can do (accounts / credentials)

### 1. Apple App Store Connect
1. App is already created: name **Lulla - Sleep Sounds**, bundle ID `com.samay.lulla`, ASC app id `6833056218`.
2. Subscription group `Lulla Premium` already has `lulla_premium_monthly` and `lulla_premium_yearly`. Complete any missing metadata and review screenshots.
3. Agreements, Tax, Banking must be Active (Paid Apps agreement). Until this is signed, store prices may not load.
4. App Privacy: "Data Not Collected" is accurate unless you add analytics. There is no third-party purchase SDK.
5. Set privacy, terms and support URLs to the app-legal pages listed in the README.
6. Category: Health & Fitness (or Lifestyle). Age rating 4+. Copyright: Samay Vashsht.

### 2. Google Play Console
1. Create app, package `com.samay.lulla`, Paid features = in-app subscriptions (app itself is Free to download).
2. Monetize > Subscriptions > product IDs `lulla_premium_monthly` and `lulla_premium_yearly`.
3. Fill Data safety (no data collected / purchases only), content rating, target audience 13+.
4. First upload must be done manually once in Play Console (internal testing) before API submit works; EAS `submit` needs a Play service-account JSON, which is not on the krosz Expo account yet.

### 3. Build
```bash
npm install
npx eas-cli@latest build --platform ios --profile production --non-interactive
```
Test first with TestFlight / Play internal testing + sandbox tester accounts. Verify: free minutes count down, paywall appears at 0:00, store prices load, purchase unlocks, restore works, and launch does not show an Apple ID password prompt.

## Known limits / decisions
- Trial is device-local. A user who wipes keychain (Android reinstall) gets a new 3 minutes; acceptable at this price. Server-side enforcement would need accounts.
- Sound loops are synthesized (noise-based), so they're clean and license-free but less "recorded" than field recordings. Swap in licensed recordings later by replacing files in `assets/sounds/` (same names). Freesound replacements are pending an account.
- Apple reviewers require the paywall to show price, period, auto-renew text, Restore, Terms and Privacy. All present; prices come from the store.
- Do not copy another listing's name, icon, screenshots or description. Lulla's are original.
