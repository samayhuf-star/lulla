# Lulla: planned App Store Connect changes for build 8

**Plan only. Nothing here has been written to App Store Connect.** ASC app 6833056218, bundle `com.samay.lulla`, version 1.0.0 (`PREPARE_FOR_SUBMISSION`). Prepared 13 Nov 2026, about 1:00 AM BDT (Asia/Dhaka). Covers every Lulla blocker in `presubmission-audit-2026-11-12.md`. No App Review submission.

## 1. App information

| Field | Now | Planned |
|---|---|---|
| Name | Lulla - Sleep Sounds | unchanged |
| Subtitle (30) | empty | `Calm sounds to fall asleep` (26) |
| Primary category | check | Health & Fitness |
| Privacy Policy URL | empty | https://samayhuf-star.github.io/app-legal/lulla/privacy.html (live, HTTP 200; names Samay Vashsht and samayhuf@gmail.com; effective date set to 13 November 2026 tonight, commit app-legal 3d02114) |
| Copyright | empty | `2026 Samay Vashsht` |
| Content rights | check | Does not contain third-party content that needs rights (CC0/CC BY recordings and public-domain melodies are cleared; see ASSET_LICENSES.md) |

## 2. Version 1.0.0 text (en-US)

**Promotional text (170):**
> 38 sleep sounds, from soft rain and slow ocean waves to brown noise and gentle lullabies. Layer your own mix, set a timer and drift off.

**Description:**
> Fall asleep faster with Lulla. Pick a sound, layer your own mix, set a sleep timer and drift off.
>
> 38 SLEEP SOUNDS
> - Rain: rain, deep rain on roof, rain on tent, window, umbrella and puddle, distant thunder, snow
> - Water: slow ocean waves, lake, creek, waterfall, underwater, drip
> - Nature: wind, wind and leaves, forest, night crickets, cave, grassland, farm
> - Warmth and hum: crackling fireplace, fan, air conditioner, airplane cabin
> - Calm: heartbeat, womb, singing bowls, Om drone
> - Lullabies: Brahms, Schubert and Twinkle Twinkle on piano and music box, plus a soft ambient pad
> - White, pink, green and brown noise
> - Delta Waves binaural beat (use headphones)
>
> Real field recordings, mastered as long seamless loops, so you will not hear a repeat.
>
> MAKE IT YOURS
> - Layer several sounds and set each volume
> - Sleep timer from 10 minutes to 3 hours, with a gentle fade-out
> - Keeps playing with the screen off; pause from the lock screen and every sound fades out together
>
> No account, no ads and no tracking.
>
> Try Lulla free for 3 minutes. Lulla Premium is an auto-renewing monthly or yearly subscription. The price is shown in the app before you buy. Payment is charged to your Apple ID, and the subscription renews unless cancelled at least 24 hours before the end of the period. Manage or cancel it in your Apple ID settings.
>
> Terms of Use: https://samayhuf-star.github.io/app-legal/lulla/terms.html
> Privacy Policy: https://samayhuf-star.github.io/app-legal/lulla/privacy.html

Claims check against build 8 code: 38 sounds (catalog test asserts 38), per-sound volume (Mix sheet), timer options 10 min to 3 h with fade (TIMER_OPTIONS, 10 s master fade), background audio (UIBackgroundModes audio), lock-screen fade (silent control player, commit 719b719), 3 free minutes (FREE_SECONDS 180), no account/ads/analytics (no such SDKs in package.json). No "AI" wording, no ellipsis characters.

**Keywords (100 max):** `sleep,white noise,rain,brown noise,lullaby,baby,relax,calm,ocean,nature,timer,binaural,fan` (88)

**Support URL:** https://samayhuf-star.github.io/app-legal/lulla/support.html (live, 200; sound section updated tonight, app-legal 3d02114 / 053b432)
**Marketing URL:** leave empty.

## 3. Screenshots

- **6.9" iPhone (`APP_IPHONE_69`, 1320 x 2868), 5 shots**, from the build 8 code (simulator run on `lulla/build8` once the masters are in, or Samay's phone): 1 sound grid with new categories, 2 Lullaby/Calm filter, 3 Mix sheet with volumes, 4 Sleep timer, 5 Paywall with Restore/Terms/Privacy. Captions are original and factual, for example "38 calm sounds", "Layer your own mix", "Fall asleep with a timer". No fake prices; the paywall shot shows whatever StoreKit returns.
- The old `store/images/*` files show 25 sounds and must not be uploaded.
- Previews go to Team Lead / Samay before upload.

## 4. Age rating

Answer every content question NONE / NO (no violence, gambling, contests, user content, web access or medical claims). Result: **4+**. Lulla does not claim to treat sleep disorders or tinnitus (the old listing's "tinnitus relief" line is dropped).

## 5. Availability and price

- Create the `appAvailabilityV2` record (the audit got 404): all 175 territories, `availableInNewTerritories: true`.
- App price: Free (base territory USA).

## 6. App Privacy

Data Not Collected. Samay does this on the web (the API cannot edit it). The privacy policy matches: no accounts, nothing collected, only the free-seconds counter and sound/timer choices stored on device.

## 7. App Review information

- Contact: Samay Vashsht, samayhuf@gmail.com, phone: **needs Samay's number** (ASC requires one).
- Sign-in required: No.
- Notes:
> Lulla plays sleep sounds. No account or sign-in.
> Free trial: any sound can be played for 3 minutes in total. When the 3 minutes are used, playback stops and the paywall opens. The paywall can also be opened at any time from the "Free: m:ss left" pill at the top right.
> Subscriptions: Lulla Premium monthly (lulla_premium_monthly) and yearly (lulla_premium_yearly), in the "Lulla Premium" group, sold with StoreKit 2. Prices come from the App Store.
> Restore: on the paywall, tap "Restore purchases".
> Background audio: the app uses the audio background mode so sounds keep playing with the screen locked. Lock screen and Control Center play/pause control the whole mix.
> Delta Waves is a binaural beat and is labelled "Use headphones".
> All recordings are CC0 or CC BY field recordings; lullabies are public-domain melodies rendered in-house. Credits: ASSET_LICENSES.md / support page.

## 8. Subscriptions (group "Lulla Premium", id 22565177)

- Both products: add the **review note** (currently none): "Unlocks unlimited playback of every Lulla sound. Open the paywall from the Free pill at the top right of the home screen, or play past the 3 free minutes."
- Keep display names "Lulla Premium Monthly" / "Lulla Premium Yearly", USA $2.99 / $19.99 (13 Nov 2026 decision, each with a 7-day free trial; ASC still has $4.99 / $41.99 until the pricing write is cleared), plus new non-consumable `lulla_premium_lifetime` at $39.99 with no trial, existing review screenshots (replace with a build 8 paywall shot if the old one shows 25 sounds).
- Group localization en-US: display name "Lulla Premium". Attach both subscriptions to the version's first submission.
- Prices only load once the Paid Apps agreement and bank are Active (Samay; Processing as of 12 Nov, 8:06 PM BDT). Retest prices on the phone after that (audit C6).

## 9. Build

- Attach **build 8** (not 7) to version 1.0.0 once it is VALID, export compliance answered (`ITSAppUsesNonExemptEncryption: false` is already in app.json), and in Internal + Team (Expo) TestFlight groups labelled NOT RUN.
- Real-run evidence: simulator screenshots of every fixed sound playing (sim-shots/), then Samay's phone check of the lock-screen fade and the paywall (audit C14).

## Audit blockers: where each stands

| # | Audit blocker | Status |
|---|---|---|
| 1 | ASC listing, privacy URL, support, copyright, 6.9" shots, review notes, age rating, availability, attach build | Planned above; written to ASC only after approval. Privacy/terms placeholder date fixed and published. |
| 2 | Build 8 (fix the 6 weak sounds, FluidR3 piano) | In progress: 3 of the 6 remastered, FluidR3 renders done, 25 masters waiting on Batches 2 and 3. |
| 3 | C6 prices + real-device paywall retest | Deferred: needs the Paid Apps agreement Active and Samay's phone. |
| 4 | C14 real-iPhone evidence | Simulator run approved, triggered after mastering; phone check by Samay after TestFlight. |
