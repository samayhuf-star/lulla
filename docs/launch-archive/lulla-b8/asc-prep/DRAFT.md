# Lulla 1.0: App Store Connect draft (build 8)

**Partly written to ASC on 13 Nov 2026, about 3:25 PM BDT (UTC+6)**, cleared metadata only, in the no-trial variant (see write-log.json and after.json). Not written: intro offer, pricing, builds, screenshots, submission. The 7-day trial sentences below are the trial variant, kept for when the intro offer exists. Drafted 13 Nov 2026, about 3:30 PM BDT (UTC+6). App 6833056218, bundle `com.samay.lulla`. Code reference: `lulla/build8` at `085c158`.

Current ASC state (read-only GETs, saved in `before.json`):
- Version **1.0**, `PREPARE_FOR_SUBMISSION`, release type `AFTER_APPROVAL`, no build attached, copyright empty.
- en-US version text: description, keywords, promo text, support URL and What's New are all empty.
- App Review details: none (no `appStoreReviewDetail` record yet).
- App info en-US: name `Lulla - Sleep Sounds`, subtitle empty, privacy policy URL empty.
- Subscription group `Lulla Premium`: `lulla_premium_monthly` (6833063719, ONE_MONTH) and `lulla_premium_yearly` (6833064591, ONE_YEAR), both `READY_TO_SUBMIT`, review note empty, review screenshot present (file named `SOURCE`). No intro offer is configured in ASC yet (see open points).

Rules applied: no health or medical claims and no "heal" words (Apple 1.4.1), no AI mentions, no ellipsis characters, Samay Vashsht named as developer and contact. Reused from `planned-asc-changes.md`: subtitle, privacy/support URLs, copyright, age rating answers, availability plan, contact.

## 1. App information (reused, unchanged from the plan)

| Field | Draft |
|---|---|
| Subtitle (30) | `Calm sounds to fall asleep` (26) |
| Privacy Policy URL | https://samayhuf-star.github.io/app-legal/lulla/privacy.html |
| Copyright (version) | `2026 Samay Vashsht` |
| Support URL | https://samayhuf-star.github.io/app-legal/lulla/support.html |
| Marketing URL | empty |
| Age rating | every content question NONE / NO, result 4+ |

## 2. Version 1.0 text (en-US)

**Promotional text (160/170):**
> Seven calm sounds free forever, plus the new Frequencies collection of warm 432, 528 and 963 Hz pads. Layer your mix and set a timer up to 4 hours or All night.

**Keywords (100/100):** `sleep,white noise,rain,brown noise,lullaby,432hz,528hz,frequency,relax,calm,ocean,fan,timer,binaural`

**Description (2325/4000):**
> Fall asleep to calm sound with Lulla. Pick a sound, layer your own mix, set a sleep timer and drift off.
>
> FREE FOREVER, NO TIME LIMIT
> Seven sounds are free for everyone, with no time limit and no subscription:
> - Rain
> - Slow Ocean Waves
> - Forest
> - Fan
> - White Noise
> - Brown Noise
> - 432 Hz Deep Sleep
> Mix them, use the sleep timer and keep them playing with the screen off, all for free.
>
> LULLA PREMIUM
> Premium unlocks the other 36 sounds, including four more in the Frequencies collection. You can preview premium sounds for 3 minutes before you decide.
> - Rain: deep rain on roof, rain on tent, window, umbrella and puddle, distant thunder, snow
> - Water: lake, creek, waterfall, underwater, drip
> - Nature: wind, wind and leaves, night crickets, cave, grassland, farm
> - Warmth and hum: crackling fireplace, air conditioner, airplane cabin
> - Calm: heartbeat, womb, singing bowls, Om drone
> - Lullabies: Brahms, Schubert and Twinkle Twinkle, plus a soft ambient pad
> - Pink and green noise
> - Delta Waves binaural beat (use headphones)
>
> FREQUENCIES
> A collection of warm, slow synth pads with soft tones: 432 Hz Deep Sleep (free), 528 Hz Calm, 963 Hz Night, 432+528 Blend and Deep Drone. Original music made for Lulla, mastered as long seamless loops.
>
> MAKE IT YOURS
> - Layer several sounds and set each volume
> - Sleep timer from 10 minutes to 4 hours with a gentle 60 second fade-out, or All night to keep playing until you stop
> - Keeps playing with the screen off; pause from the lock screen and every sound fades out together
>
> No account, no ads and no tracking.
>
> SUBSCRIPTION
> Lulla Premium is an auto-renewing subscription, billed monthly or yearly at the price shown in the app before you buy. If you are eligible, the subscription starts with a 7-day free trial; the app shows the trial on the plan button only when it applies to you. Payment is charged to your Apple ID when the trial ends, or at purchase if there is no trial. The subscription renews unless cancelled at least 24 hours before the end of the trial or period. Manage or cancel it in your Apple ID settings. Already subscribed on another device? Tap Restore purchases in Settings or on the subscription screen.
>
> Terms of Use: https://samayhuf-star.github.io/app-legal/lulla/terms.html
> Privacy Policy: https://samayhuf-star.github.io/app-legal/lulla/privacy.html

**What's New:** not editable. ASC does not accept What's New for an app's first version (1.0 has never been released). Suggested text for the first update instead:
> New: the Frequencies collection of warm synth pads, a 4 hour and an All night sleep timer with a gentle 60 second fade-out, and seven sounds that are free forever.

Claims check against `lulla/build8`:
- 43 sounds, 7 free (`FREE_SOUND_IDS` in src/access.ts: rain, ocean, forest, fan, white_noise, brown_noise, freq_432), 36 Premium. Tests assert both counts.
- 3-minute preview of premium sounds only (`FREE_SECONDS` 180, counted only while a premium sound plays).
- Timer: 10 min to 4 h plus All night (no stop scheduled), 60 s fade (`SLEEP_FADE_SEC`). Tests in scripts/timer.test.ts.
- 7-day free trial wording appears only when StoreKit reports a free-trial intro offer and the user is eligible (src/introOffer.ts, commit 926eab3).
- Restore purchases: Settings sheet (gear, top right) and paywall.
- Background audio: `UIBackgroundModes: audio`; lock screen pause fades the mix.
- No account, ads or analytics SDKs in package.json.

## 3. App Review information

- Contact (to set in `appStoreReviewDetail`, not written yet): first name `Samay`, last name `Vashsht`, email `samayhuf@gmail.com`, phone `[phone redacted]`.
- Sign-in required: No.
- Notes:
> Lulla plays sleep sounds. There is no account or sign-in.
>
> What is free: seven sounds play forever with no time limit and no subscription: Rain, Slow Ocean Waves, Forest, Fan, White Noise, Brown Noise and 432 Hz Deep Sleep. They have no lock badge. Mixing, the sleep timer and background playback all work with the free sounds.
>
> Premium: the other 36 sounds show a "Premium" lock badge. Each install can preview premium sounds for 3 minutes in total (counted only while a premium sound plays). After that, tapping a premium sound opens the subscription screen. The screen can also be opened at any time from the "Unlock all" button at the top right of the home screen. It has a close (X) button that returns to the home screen, where the free sounds keep working.
>
> Subscriptions: Lulla Premium Monthly (lulla_premium_monthly) and Lulla Premium Yearly (lulla_premium_yearly), one group "Lulla Premium", sold with StoreKit 2. Prices are the App Store's localized prices. Both include a 7-day free trial for eligible new subscribers; the plan button reads "7 days free, then <price>/month" (or /year) only when the trial applies, otherwise it shows the plain price. Please test with a Sandbox account.
>
> Restore: tap the gear (Settings) at the top right of the home screen, then "Restore purchases". "Restore purchases" is also on the subscription screen.
>
> Sleep timer: tap Timer in the bottom bar. Options run from 10 minutes to 4 hours, each with a gentle 60 second fade-out, plus "All night", which does not stop playback.
>
> Background audio: the app uses the audio background mode so sounds keep playing with the screen locked. The lock screen and Control Center play and pause control the whole mix.
>
> Content: the Frequencies sounds and the noises are original audio made for Lulla by Samay Vashsht. Field recordings are CC0 or CC BY from Freesound; lullabies are public-domain melodies rendered in-house. Credits are in the app: tap the gear (Settings), then "Sound credits" (the CC BY 4.0 credit for Farm by klankbeeld with licence link, the CC0 note, and the original Frequencies loops). Delta Waves is a binaural beat and is labelled "Use headphones".

## 4. Subscription (IAP) review notes

**Pricing (decision 13 Nov 2026, 3:45 PM BDT; no lifetime per Samay, 3:51 PM; code in `lulla/build8` at `8a34015`; ASC prices and trials are being applied by a separate worker):**

| Product | Type | USA price | Trial |
|---|---|---|---|
| `lulla_premium_monthly` (6833063719) | auto-renewing, 1 month | **$2.99** (was $4.99) | 7-day free trial (intro offer) |
| `lulla_premium_yearly` (6833064591) | auto-renewing, 1 year | **$19.99** (was $41.99) | 7-day free trial (intro offer) |

The app never shows a hard-coded price: plan buttons use the store's localized `displayPrice`, with "7 days free, then <price>/month" (or /year) only when StoreKit reports an eligible free trial. No lifetime option.

- **lulla_premium_monthly** (6833063719):
> Lulla Premium Monthly unlocks all 43 sounds with unlimited listening, billed monthly at the App Store price. Eligible new subscribers get a 7-day free trial first. To reach it: tap any sound with a Premium lock badge after the 3-minute preview, or tap "Unlock all" at the top right of the home screen. Seven sounds stay free without a subscription. Restore is in Settings (gear icon) and on the subscription screen.
- **lulla_premium_yearly** (6833064591):
> Lulla Premium Yearly unlocks all 43 sounds with unlimited listening, billed yearly at the App Store price. Eligible new subscribers get a 7-day free trial first. To reach it: tap any sound with a Premium lock badge after the 3-minute preview, or tap "Unlock all" at the top right of the home screen. Seven sounds stay free without a subscription. Restore is in Settings (gear icon) and on the subscription screen.
- Product descriptions (en-US, current: "Unlimited sleep sounds, billed monthly/yearly"): suggest `All 43 sounds, billed monthly` / `All 43 sounds, billed yearly` (limit 55).
- Review screenshot: replace with the build 8 paywall shot (`zz-paywall.png` or `f2-locked-snow-paywall.png`) once the sim run produces it.
- **Intro offer (needs Samay's go, it is a pricing decision):** create a 7-day (1 week) FREE_TRIAL introductory offer on both subscriptions, all territories, new subscribers. Without it in ASC, the store reports no trial and the app correctly shows the plain price, so the description and notes above would overstate the offer.

## 5. Screenshot slots and sim-shot mapping

Honest in-app UI from the simulator run only, no mockups. The old `store/images/*` (25 sounds) must not be used. Lulla has no uploaded store shots today, so there is no existing caption band style; plan is plain screenshots with no caption band unless Samay asks for one. QA overlay text is kept out of these shots (playback is stopped first).

**6.9 inch, `APP_IPHONE_69`, 1320 x 2868 (iPhone 16 Pro Max on the runner):**

| # | Sim shot | Shows |
|---|---|---|
| 1 | `h0-home-frequencies-hero.png` | Home with the Frequencies hero card, Premium badges (featured shot) |
| 2 | `h1-after-hero-tap-frequencies.png` | Frequencies category after tapping the card (432 Hz Deep Sleep free, four Premium) |
| 3 | `f0-home-preview-used.png` | Full sound grid, free sounds without badges |
| 4 | `t0-timer-options.png` | Sleep timer list with 4 hours and All night |
| 5 | `f2-locked-snow-paywall.png` | Subscription screen with X, prices, Restore, Terms, Privacy |
| 6 | `f4-settings-restore.png` | Settings sheet with Restore purchases |
| (spare) | `f5-sound-credits.png` | Sound credits screen |

**6.5 inch, `APP_IPHONE_65`, 1242 x 2688 (iPhone 11 Pro Max / XS Max) or 1284 x 2778 (iPhone 14 Plus fallback):** from the new "Store shots at 6.5 inch" step (`store65/`):

| # | Sim shot | Shows |
|---|---|---|
| 1 | `store65/s65-home-frequencies-hero.png` | Home with the Frequencies hero card (featured shot) |
| 2 | `store65/s65-after-hero-tap.png` | Frequencies category |

If the runner has no 6.5 inch device type, the step writes `store65/s65-RESIZED-*.png`, the 6.9 inch shots scaled to 1242 x 2688 (about 0.4 percent aspect change), and `store65/device.txt` says so. ASC uses the 6.9 inch set for smaller sizes when 6.5 inch is left empty, so the 6.5 set may be just these two shots, or the 6.9 set alone.

Hero art preview (generated, not a store asset): `asc-prep/hero-art-preview.png`.

## 6. Open points for Samay

1. **Pricing (decided 13 Nov, 3:45 PM BDT; no lifetime, 3:51 PM)**: $2.99/month and $19.99/year, each with a 7-day free trial. Code is ready (`8a34015`); a separate worker is applying the prices and intro offers in ASC. The ASC text was written without trial lines; add them back (trial variant above) once the intro offers exist.
2. **Phone number**: provided ([phone redacted]); in the draft, to be written with the rest after the sim run.
3. **Version string**: ASC version is `1.0`, app.json is `1.0.0`. Check that the build 8 upload matches the 1.0 version before attaching (or rename the ASC version to 1.0.0).
4. **Credits**: now in the app (Settings > Sound credits, commit 40eefb3). Two app-legal commits (0d7d016, 2514506, the Farm credit on the support page) are still unpushed; the in-app screen's "Full list of sources" link points at that anchor.
5. **Category**: the earlier plan said Health & Fitness. Lifestyle avoids any health framing; your call.
6. **StoreKit in the sim**: wired in commit 085c158. A CI-only UI test (`qa/LullaQATests`) launches the app inside an SKTestSession from `storekit/Lulla.storekit` and holds it while the shell flow takes the shots, so the paywall should show the .storekit prices and the 7-day trial line. Not proven until a run completes; if the host fails to start, the flow falls back to `simctl launch` and `storekit-note.txt` says the paywall has no StoreKit prices.
