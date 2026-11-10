# Lulla – Launch Guide (iOS + Android)

Paid model: **3 minutes free listening, then $4.99 / month or $41.99 / year auto-renewing subscription.**
Stack: Expo (React Native) + RevenueCat. Bundle ID / package: `com.samay.lulla` (change in `app/app.json` before first build if you want another).

## What is built
| Area | Status |
|---|---|
| 25 original sleep sounds (rain, ocean, wind, fire, noise…), seamless loops, synthesized in-house, no third-party licensing | Done |
| Multi-sound mixer with per-sound volume | Done |
| Sleep timer (10 min – 3 h) with 10 s fade-out | Done |
| Background / screen-off playback, keep-awake while playing | Done |
| 3-min free gate (counts only time actually playing; stored in OS keychain, survives restart/reinstall on iOS) | Done |
| Paywall: subscribe, restore purchases, Terms, Privacy, auto-renew disclosure | Done |
| RevenueCat entitlement check (`premium`) | Done, needs your keys |
| Original icon, adaptive Android icon | Done |
| Privacy policy text, store listing copy | Done (`store/`) |

## Steps only you can do (accounts / credentials)

### 1. Apple App Store Connect
1. Create app: name **Lulla - Sleep Sounds**, bundle ID `com.samay.lulla`, SKU `lulla`.
2. Monetization > Subscriptions > new group `Lulla Premium` > product ID `lulla_premium_monthly`, duration 1 month, price **$4.99**; add a second product `lulla_premium_yearly`, duration 1 year, price **$41.99** (same group, ranked above monthly). Add localization + review screenshot of paywall.
3. Agreements, Tax, Banking must be Active (paid apps agreement).
4. App Privacy: "Data Not Collected" is accurate unless you add analytics (RevenueCat collects an anonymous ID – declare "Purchases" / "Identifiers" as not linked to user if prompted).
5. Category: Health & Fitness (or Lifestyle). Age rating 4+.

### 2. Google Play Console
1. Create app, package `com.samay.lulla`, Paid features = in-app subscriptions (app itself is Free to download).
2. Monetize > Subscriptions > product ID `lulla_premium_monthly`, base plan monthly, **$4.99**; plus `lulla_premium_yearly`, base plan yearly, **$41.99**.
3. Fill Data safety (no data collected / purchases only), content rating, target audience 13+.
4. First upload must be done manually once in Play Console (internal testing) before API submit works; EAS `submit` needs a Play service-account JSON.

### 3. RevenueCat
1. New project, add iOS and Android apps with the bundle ID/package.
2. Connect store credentials (App Store Connect API key; Play service account).
3. Create entitlement **`premium`**, attach both products. Create Offering `default` with package **Monthly** (`$rc_monthly`).
4. Copy the two public SDK keys into `app/.env` (see `.env.example`) or EAS secrets.

### 4. Build & submit
```bash
cd app
npm i -g eas-cli && eas login
eas init                                 # fills extra.eas.projectId
eas secret:create --name EXPO_PUBLIC_RC_IOS_KEY --value appl_xxx
eas secret:create --name EXPO_PUBLIC_RC_ANDROID_KEY --value goog_xxx
eas build --platform all --profile production
eas submit --platform ios --latest
eas submit --platform android --latest
```
Test first with TestFlight / Play internal testing + sandbox tester accounts. Verify: free minutes count down, paywall appears at 0:00, purchase unlocks, restore works.

### 5. Host the privacy policy
`store/privacy-policy.md` must be live at a public URL. Update `PRIVACY_URL` in `app/src/config.ts` (currently placeholder `https://krosz-app-policies.netlify.app/privacy`).

## Known limits / decisions
- Trial is device-local. A user who wipes keychain (Android reinstall) gets a new 3 minutes; acceptable at this price. Server-side enforcement would need accounts.
- Sound loops are synthesized (noise-based), so they're clean and license-free but less "recorded" than field recordings. Swap in licensed recordings later by replacing files in `app/assets/sounds/` (same names).
- Apple reviewers require the paywall to show price, period, auto-renew text, Restore, Terms and Privacy. All present.
- Do not copy another listing's name, icon, screenshots or description. Lulla's are original.
