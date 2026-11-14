# Lulla 1.0.0 (build 8, not yet in ASC) — simulator + read-only presubmission verdict

Written 13 November 2026, 6:51 PM Asia/Dhaka (BDT, UTC+6).
Scope: review of simulator run **43415421100** and a live, GET-only App Store Connect readout of app `6833056218`. No EAS build, no ASC writes, no submission, no messages to other bots.

**Overall: FAIL. Do not submit.**

The simulator run passed for launch, Frequencies, playback, the paywall copy and prices, the locked-tile gate, the timer (including the 2-minute fade and All night), background/foreground, settings Restore row, and sound credits. The StoreKit test purchase is **UNVERIFIED** because of a harness issue, and is recorded as an open item, not a FAIL.

Submission is blocked by stale or missing store metadata: the live privacy, terms and support pages still describe a 3-minute-only free period and the terms never mention the 7-day trial; both IAP review screenshots still show the old “3 minutes / $1.99 a month” paywall; listing screenshots have not been uploaded; the age-rating questionnaire and the content-rights declaration are unset. There is also no ASC build 8 yet (version 1.0.0 currently has build **7** attached — do not submit that build).

---

## What was tested

| Item | Value |
|---|---|
| App | Lulla - Sleep Sounds (ASC `6833056218`, bundle `com.samay.lulla`, SKU `lulla-sleep-sounds`) |
| iOS version in ASC | **1.0.0**, version id `18c8454a-4685-4e4e-8b77-bcf619e18831`, `PREPARE_FOR_SUBMISSION` |
| Claimed sim commit | `lulla/build8` @ `36f0472`, app code the same as `8a34015` (reported by dev 1; SHA not stored on any ASC build object and not independently hashed from an IPA here) |
| Runner | AI-Samay/sim-qa-runner, run **43415421100**. Artifacts in `/home/box/shared/app-monitor/reports/tester/lulla-sim/run-43415421100/`. Review shots in `/workspace/shots-now/Lulla/`. Store sets (not uploaded) in `/home/box/shared/app-monitor/reports/lulla-b8/store-shots/store69` and `store65`. |
| Sim evidence time | Main XCTest 11:40:18–11:52:46 UTC, 13 Nov 2026 = **5:40–5:52 PM Asia/Dhaka**. 6.5" host 11:59:28–12:01:50 UTC = **5:59–6:01 PM Asia/Dhaka**. Xcode 26.6 (17F113). Devices: iPhone 16 Pro Max and iPhone 11 Pro Max, iOS 26.5. Both test suites passed. |
| ASC builds | **No build 8.** Existing VALID builds: 4, 5, 6, and **7** (`ccd5b466-ba86-4ebc-8c0a-b06842125cda`, uploaded 12 Nov 2026, 6:08:33-08:00 = **8:08 PM Asia/Dhaka** on 12 Nov). Build 7 is **attached** to version 1.0.0, `APP_STORE_ELIGIBLE`, `usesNonExemptEncryption: false`. Internal TestFlight: `IN_BETA_TESTING`; external: `WAITING_FOR_BETA_REVIEW`. |
| Seed / QA flags | `EXPO_PUBLIC_LULLA_QA` overlay is present on some flow shots (gold “rain 6.4s” / “timer All night: no stop scheduled” under the status bar). Dev 1 states it is off in store builds and hidden in the store sets; the store sets were checked and do not show it. StoreKit file was referenced in the scheme; `SKTestSession` logged errors at start (`SKInternalErrorDomain` code 3). |

Dev 1’s claims for the sim steps, legal URLs, categories, keywords, IAP ids and the missing purchase were checked against local artifacts and a live ASC GET. The git SHAs `36f0472` / `8a34015` were not independently re-hashed here.

---

## SIM verdict

**SIM: PASS**, with the StoreKit purchase **UNVERIFIED** (open item, not a FAIL).

Main host: `-[LullaQATests.SimQATests testHoldAppForShellFlow]` passed (748.454s). 6.5" host also passed (142.186s, used to capture the store65 set). `app-full.log` has no Fatal Exception, SIGABRT, uncaught exception, or panic.

### Launch and Frequencies hero — PASS

- `01-launch-settled.png` / `02-home-hero-a.png` (same frame as review `01-home-frequencies-hero.png`): home, “Sleep sounds, softly.”, Frequencies hero card (“432, 528 and 963 Hz tones over warm pads. 432 Hz Deep Sleep is free.”). No hard paywall at launch. Free Rain tile has no Premium badge.

### Frequencies category — PASS

- `03-frequencies-category.png` (store `s69-2-frequencies.png`): 432 Hz Deep Sleep (free), 528 Hz Calm, 963 Hz Night, 432+528 Blend, Deep Drone, with Premium locks on the paid tiles.

### Free Rain plays — PASS

- `06-free-rain-playing-*.png` / review `02-player-rain-playing.png`: Rain selected, Mix · 1, pause control. QA overlay “rain 6.4s” is visible on the review frame; it is **not** on the store mix frame (`s69-3-player-mix.png`).

### Paywall copy, prices, legal links, no lifetime — PASS

- `04-paywall-storekit-prices.png` (identical to store `s69-5-paywall.png` and `07-locked-snow-paywall.png`): “Unlock all sounds”; “Your free sounds stay free, with no time limit.”
- Buttons: **“7 days free, then $19.99/year”** and **“7 days free, then $2.99/month”**. No lifetime plan.
- 24-hour cancel / auto-renew disclosure is visible. Links: Restore purchases, Terms, Privacy, Support. Close (X) is present.
- QA log at 11:51:00 UTC: `plans: lulla_premium_yearly [7 days free, then $19.99/year] trialDays=7 | lulla_premium_monthly [7 days free, then $2.99/month] trialDays=7`. Prices came from StoreKit (product response parsed two products).

### Locked tile opens the paywall — PASS

- `07-locked-snow-paywall.png`: the same current paywall. `08-home-after-x.png` returns to home with free sounds still available (non-hard paywall).

### Timer options, All night, 2-minute fade — PASS

- `11-timer-options.png` / store `s69-4-timer-options.png`: 10, 15, 30, 45 minutes, 1, 2, 3, 4 hours, and All night.
- QA: `timer 120 min` scheduled; `timer All night: no stop scheduled`; `timer 2 min` fade over the last 60 s down to gain 0.000, then `timer done …: pausing (was playing true)`. Shots 14–17 show the 2-minute run.

### Background / foreground, credits, Settings Restore — PASS

- Flow notes: background 11:50:20–11:50:46 UTC (5:50 PM Asia/Dhaka). `20-foreground-again.png` after resume.
- `09-settings-restore-row.png`: Settings sheet with Restore purchases, Unlock all sounds, Terms of Use, Privacy Policy, Sound credits, Support.
- `10-sound-credits.png`: Farm / klankbeeld CC BY 4.0, other field recordings CC0, Frequencies original to Samay Vashsht, noises and lullabies generated or rendered in-house (FluidR3, MIT).

### StoreKit purchase and Restore — UNVERIFIED (open item, not a FAIL)

Dev 1’s account is confirmed by the artifacts. Tapping Monthly brought up the sandbox **“Sign in to Apple Account”** prompt, not a local StoreKit purchase sheet.

- `21-purchase-result.png`: Sign in to Apple Account over the paywall, plus the system keyboard.
- `22-home-after-purchase.png`: the same prompt over home; Premium badges and “Unlock all” are still present (no unlock).
- `23-restore-after-purchase.png`: the same prompt over the Settings sheet. QA log has `buy lulla_premium_monthly: pressing [7 days free, then $2.99/month]` and later `restore: start`, with no success path.
- `SKTestSession` errors at 11:40:20 UTC (`Error saving configuration file`, `clearing overrides`, `deleting all transactions`, domain `SKInternalErrorDomain` code 3) match a session that did not attach to the app.
- This can be checked in TestFlight sandbox once build 8 is up. It is not a reason to FAIL the sim or the overall gate by itself.

---

## Checklist

### P0 — no crashes — PASS

Cold start, home, Frequencies, player, paywall, timer, settings, credits, background/resume. No crash signatures in `app-full.log`. Rotation, offline and a deny-permission path were not in this run.

### P0 — no placeholders in the app or listing — PASS for the listing and the current app UI; FAIL on the IAP review screenshots (see IAP)

en-US name, subtitle, keywords, promo and description have no lorem, TODO, example.com, `[EFFECTIVE DATE]`, or dummy prices. The live legal pages use a real date (13 November 2026). “Settings › [your name] › Subscriptions” on the terms and support pages is Apple’s standard Settings path, not an unfilled field.

The IAP review screenshots still show **“Try free for 3 minutes”** and **“Subscribe · $1.99 / month”**. That is stale marketing copy and is scored under IAP below.

### P0 — paywall (store prices, legal, disclosure) — PASS, with purchase/restore UNVERIFIED

Store-loaded $2.99 / $19.99 and 7-day trial copy, auto-renew disclosure, Terms/Privacy/Support/Restore on the paywall and in Settings: evidenced. Sandbox buy, unlock-persists and Restore: **UNVERIFIED** (open item above). No lifetime plan in the app or in ASC.

### P0 — privacy policy URL live and linked — FAIL (pages are live, but they are not accurate)

- App info en-US `privacyPolicyUrl`: https://samayhuf-star.github.io/app-legal/lulla/privacy.html — HTTP 200, set.
- Version support URL: https://samayhuf-star.github.io/app-legal/lulla/support.html — HTTP 200, set.
- Description ends with Terms and Privacy links. Paywall and Settings also show Terms, Privacy and Support.

Accuracy problems on the live pages (fetched this turn):

- Privacy, terms, support and the legal index all still say **“You can listen for three minutes for free. After that, Lulla Premium is required.”** That contradicts the product, the listing, the review notes and the paywall (“seven sounds are free forever, with no time limit”). Privacy also describes a keychain “free-minute count” as if that were the only free access.
- **Terms do not mention the 7-day free trial** (or the $2.99 / $19.99 prices). They do state the 24-hour cancel / auto-renew rule.
- Support says “Lulla has 38 sounds”; the listing, paywall and IAP notes say 43 (7 free + 36 Premium).
- No `[EFFECTIVE DATE]` placeholder remains. Both privacy and terms are dated **Effective 13 November 2026**.

**App Privacy nutrition labels: UNVERIFIED (needs the web UI).** Every data-usage path probed returned 404 (`appDataUsages`, `dataUsages`, `appDataUsage`, `privacyDetails`, `appPrivacy`, `dataPrivacy`, `privacy`, and v2). The public API cannot say whether the declaration is saved or published. Confirm in the ASC web UI that App Privacy is published before submit (intended answer is typically Data Not Collected, but that was not re-read this turn).

### P0 — permissions — UNVERIFIED (not blocking on this evidence)

Launch and the store shots show no permission dialog. A sleep-sounds app may need no photos/mic/contacts permission. Usage strings and a deny-path were not in these artifacts. The run did not crash.

### P0 — iOS build from the stated commit — UNVERIFIED / not ready to attach

There is **no ASC build 8**. The sim ran a locally prepared `LullaSleepSounds` app (`MARKETING_VERSION=1.0`, `CURRENT_PROJECT_VERSION=1` in that Xcode log) from the claimed `lulla/build8` tree. Dev 1 is correctly waiting for a PASS before the single EAS build 8 (and will stop if EAS would bill).

Version 1.0.0 currently has **build 7** attached. Do not submit build 7. After the blockers below are fixed, attach build 8 in its place. Android was out of scope for this iOS checklist.

### P0 — content rights — FAIL (declaration not set)

`contentRightsDeclaration` on the app is **null**. It must be set before submit. This is not a clean “does not use third-party content” case: the in-app Sound credits screen and the review notes document CC BY 4.0 (Farm by klankbeeld / Freesound), other Freesound recordings under CC0, public-domain lullaby melodies, and the FluidR3 soundfont (MIT), plus original Frequencies loops by Samay Vashsht. Set the declaration **accurately** to match that. Nothing in the sim suggested unlicensed or pirated media.

### P0 — in-app account deletion — PASS (N/A)

No sign-up. Privacy policy, support page, Settings and the review notes all say there is no account.

### P1 — icon — PASS (on existing builds; confirm on build 8)

Build 7 App Store icon is 1024×1024 RGB, no alpha channel. Custom moon / sound-wave mark on a purple gradient; not a default Expo icon. The same asset is in `/workspace/7apps/Lulla/assets/icon.png` (1024×1024 RGB). Splash was not separately inspected.

### P1 — screenshots — FAIL (nothing is uploaded in ASC; local store sets are ready)

en-US localization `53e890c1-43fb-4895-8481-49a11c18cc31` has **zero** `appScreenshotSets` and zero previews. There are therefore **no stale $1.99 / 3-minute-trial listing images in ASC** — the slot is empty. Apple will not accept a submit without the required iPhone sizes.

Local store sets, byte-identical to the sim run’s `store69` / `store65` folders, are ready and were inspected:

| Set | Size | Files | Content |
|---|---|---|---|
| `store69` (6.9" / also valid for the 6.7" slot used on Scanwise and Klenzer) | 5 × **1320×2868**, RGBA fully opaque | home Frequencies hero, Frequencies category, player mix (Rain + Slow Ocean Waves, Mix · 2), timer options (10 minutes–4 hours + All night), paywall | Main screens only. No permission, Settings or Restore screens. No gold QA position overlay. Paywall shows 7 days free, then $19.99/year and $2.99/month, disclosure, Restore / Terms / Privacy / Support. |
| `store65` (6.5", iPhone 11 Pro Max / XS Max size) | 5 × **1242×2688**, opaque | Same five frames | Same content; paywall type is not cropped and prices match. |

Do **not** upload the `shots-now` review frames as store art: `02-player-rain-playing.png` still shows the gold QA overlay “rain 6.4s”. Use the store69 / store65 files. Captions are drafted in `/home/box/shared/app-monitor/reports/lulla-aso/captions.json` and still need to be applied on upload (for example: “Frequencies and tonight's sounds”, “Warm tones for relaxing and sleep”, “Layer rain, white noise and more”, “Timer: 2, 3, 4 hours or All night”, “7 days free, then $2.99 or $19.99”).

No iPad set (iPhone app, min iOS 16.4).

### P1 — title / subtitle / description / categories / age rating — FAIL because age rating is not set

Otherwise the listing text is in good shape (see ASO gate). `appStoreAgeRating` is **null**. The age-rating declaration exists but every content question is **null** (overrides are `NONE`). This is not a filled questionnaire (same gap as Scanwise). Complete it before submit.

Copyright on version 1.0.0 is already **`2026 Samay Vashsht`** (PASS; this was null on Scanwise). `usesIdfa` is still null — answer it when submitting if ASC asks (the app’s listing claims no tracking).

### P1 — version / build / release notes — PASS, with notes

Version 1.0.0, What’s New empty (acceptable for a first version that has never shipped). `releaseType` is **`AFTER_APPROVAL`** (manual release after review). If automatic release is required, change that before submit. Build 8 still has to be produced and attached after the blockers are fixed.

### P1 — core flows — PASS, except the unverified purchase

Covered by the sim run: launch, Frequencies, free playback, paywall, locked tile, timer (including fade and All night), background, credits, Settings. Purchase and Restore after a buy remain unverified.

### P1 — offline / layout / README — UNVERIFIED (P1, not the primary blockers)

Two simulator sizes were captured (1320×2868 and 1242×2688). Offline, Dynamic Type, dark mode and a README review were not scored in depth. Layout on the captured phones looks consistent, with safe-area home indicators and no clipped paywall.

### P2 — analytics, accessibility, startup, ratings prompt — reported, not blocking

Privacy page and listing say no ads, no tracking, no account, no third-party analytics SDK. No first-launch ratings prompt appeared. Accessibility, app size and console noise were not scored. The gold QA overlay is test-only and must stay out of store art (it already is, in the store sets).

### Review contact and review notes — PASS

`GET /v1/appStoreVersions/18c8454a-…/appStoreReviewDetail` returns id `1d936769-d1a4-4a2f-b887-09acd8900aea`:

- Contact: **Samay Vashsht**, **samayhuf@gmail.com**, phone matches **[phone redacted]** (stored in E.164 without a space).
- `demoAccountRequired: false` (correct; no account).
- Notes (1961 characters) explain the seven free sounds, the 3-minute Premium *preview* (a remaining in-app preview, distinct from the subscription trial), how to open the paywall (Premium lock or “Unlock all”), Restore (Settings gear or the subscription screen), the timer including All night, background audio, and the sound-credit licences.

The notes do **not** mention the 7-day free trial or the $2.99 / $19.99 prices. That is not a missing-contact FAIL, but the notes and the IAP review notes should be updated when the IAP screenshots are replaced, so App Review is not left with only the 3-minute preview story.

### Export compliance — PASS (on existing builds; keep the same answer on build 8)

`usesNonExemptEncryption: false` on builds 4, 5, 6 and the attached build 7. Keep that answer when build 8 is uploaded and attached, if it remains accurate. The version-level encryption relationship 404s (expected).

### Listing: no AI, no health or medical claims, no competitor brands — PASS

en-US name, subtitle, keywords, promotional text and the full description were scanned.

- No AI / A.I. / artificial intelligence / machine learning / GPT.
- No heal, cure, treat, treatment, insomnia, anxiety, therapy, sleep disorder, or stress-relief claims. The hook says “Fall asleep to … gentle frequencies.” Terms (live page) explicitly say Lulla “is not a medical device and is not a treatment for any condition.”
- “432 Hz Deep Sleep”, “528 Hz Calm”, “963 Hz Night” and “Delta Waves binaural beat (use headphones)” appear only as in-app sound names in the description body, not in the keyword field. Keywords contain **no** `528hz`, `432hz`, or `binaural`.
- No competitor brand names (Calm, BetterSleep, Sleep Pillow, etc.). The keyword `calm` is a generic sleep word, not the Calm app’s brand used as a title term.

The store paywall visible line “Lullabies, binaural tones and every nature scene” is descriptive, not a health claim.

### IAPs — products and trials PASS; review screenshots FAIL (stale $1.99 / 3-minute art)

Subscription group “Lulla Premium” (`22565177`). `inAppPurchasesV2` is empty (no lifetime or other IAP).

| ID | Product | Period | US price | State | Intro offers | Review screenshot |
|---|---|---|---|---|---|---|
| 6833063719 | `lulla_premium_monthly` | ONE_MONTH | **$2.99** | READY_TO_SUBMIT | **175** FREE_TRIAL / ONE_WEEK, `numberOfPeriods: 1`, start **13 Nov 2026**, no end date (USA confirmed; intro territories match the 175 available territories) | COMPLETE, 1290×2796, source checksum `fba1bca0cfa7ed9f3e728effe3293880` — **stale art** (see below) |
| 6833064591 | `lulla_premium_yearly` | ONE_YEAR | **$19.99** | READY_TO_SUBMIT | **175** FREE_TRIAL / ONE_WEEK, same start and no end date, territories match | COMPLETE, same source checksum and visually identical frame |

Both IAP review screenshots (downloaded this turn from the listing asset URLs) still show the **old paywall**: “Try free for 3 minutes”, “Then just $1.99 per month”, “Subscribe · $1.99 / month”, “25+ high-quality sleep sounds.” They must be replaced with the current paywall (the store `s69-5-paywall.png` frame already shows both plans, the 7-day trial copy, $19.99 / $2.99, the disclosure and the legal links). One current frame can be used for both products.

IAP review notes still mention only the 3-minute preview as the path to the paywall. Update them to also name the 7-day trial and the current prices.

---

## ASO gate

| Check | Result | Evidence |
|---|---|---|
| Title ≤30 with the top search term | **PASS** | `Lulla - Sleep Sounds` — 20 characters |
| Subtitle ≤30, next-best terms, no title-word repeat | **PASS** | `White Noise, Rain & Lullabies` — 29 characters. No exact title words (Lulla, Sleep, Sounds) reused. |
| Keywords ≤100, comma-separated, no spaces, no competitor brands, no “AI”, no exact title/subtitle words, no 528hz / 432hz / binaural | **PASS** | `brown,pink,fan,nature,relax,ocean,music,timer,baby,deep,machine,forest,thunder,nap,calm,night,rest` — **98/100**. No 528hz, 432hz or binaural. No AI. No exact title/subtitle tokens. |
| Description: first 3 lines are a benefit hook; no medical claims; no AI | **PASS** | “Fall asleep to white noise, rain, lullabies and gentle frequencies, all on your iPhone.” / “Seven sounds are free forever… 2, 3 or 4 hours or All night…” / “Try Premium free for 7 days, then $2.99 a month or $19.99 a year. Cancel anytime.” |
| Promotional text set, ≤170 | **PASS** | 162 characters: “Seven sounds free forever. Mix white noise, rain and Frequencies, set a 2, 3, 4 hour or All night timer. Try Premium 7 days free, then $2.99/month or $19.99/year.” |
| Screenshots: 4–5 main screens, benefit captions, no permission/settings/restore | **FAIL** | Local 5-frame sets pass the content rules and are not yet in ASC, so the live listing has no screenshots and no captions. |
| Primary / secondary categories | **PASS** | **Lifestyle** / **Music**. |
| Final title / subtitle / keywords (for relay) | — | Title: Lulla - Sleep Sounds. Subtitle: White Noise, Rain & Lullabies. Keywords: as quoted above. |

Standard EULA is kept (custom EULA resource is null).

---

## Open items (not FAILs)

1. **StoreKit sandbox purchase and Restore** — unverified in this sim because the `.storekit` session did not attach (Sign in to Apple Account in shots 21–23). Verify in TestFlight sandbox on build 8.
2. **App Privacy publish status** — API cannot read it; confirm in the ASC web UI.
3. **`usesIdfa`** is null on the version; answer it at submit if asked.
4. **`releaseType` is `AFTER_APPROVAL`**. Change it only if automatic release is required.
5. **Build 8 does not exist yet.** That is expected. Do not attach or submit build 7.

---

## Submission blockers (fix list)

1. **Update the live legal pages** (privacy, terms and support; the legal index has the same stale sentence). Replace “You can listen for three minutes for free. After that, Lulla Premium is required” with the real model: seven sounds are free forever with no time limit; Premium unlocks the rest of the library. **Terms must mention the 7-day free trial** on monthly $2.99 and yearly $19.99, and keep the 24-hour cancel rule. Keep “Effective 13 November 2026”. Align the support sound count with 43 if that is the shipping catalog. All three URLs must keep returning 200, with no date placeholders.
2. **Replace both IAP review screenshots** (monthly `6833063719` and yearly `6833064591`). The current COMPLETE assets still show “Try free for 3 minutes” and “$1.99 / month”. Use the current paywall frame (`/home/box/shared/app-monitor/reports/lulla-b8/store-shots/store69/s69-5-paywall.png`). Update the IAP review notes (and the version review notes) so they also name the 7-day trial and the $2.99 / $19.99 prices.
3. **Set the content-rights declaration** accurately (the app includes CC-licensed Freesound recordings and public-domain lullabies, credited in-app; it is not a default “no third-party content” answer).
4. **Complete the age-rating questionnaire** so `appStoreAgeRating` is no longer null.
5. **Upload the store screenshot sets** that are already on disk, with benefit captions, in both `APP_IPHONE_67` (1320×2868 from `store69`; add a 6.9" set if ASC now requires it separately) and `APP_IPHONE_65` (1242×2688 from `store65`). Do not upload `shots-now` frames that still show the gold QA overlay.
6. **Confirm in the ASC web UI that App Privacy is published** (API cannot read it).
7. **Then produce the single EAS build 8** (stop if EAS would bill), attach it **in place of build 7** (`ccd5b466-ba86-4ebc-8c0a-b06842125cda`), send it to internal groups and Family & Friends, and submit only after a re-check. Keep `usesNonExemptEncryption: false` if that remains accurate. Verify the StoreKit purchase and Restore in TestFlight sandbox.

No EAS, ASC write, or submit was performed.


---

## Re-verify — 13 November 2026, 9:13 PM Asia/Dhaka (BDT, UTC+6)

Scope: independent re-check of fixes 1–7 and the listing gate against live GET-only App Store Connect (app `6833056218`, version 1.0.0 id `18c8454a-4685-4e4e-8b77-bcf619e18831`, en-US localization `53e890c1-43fb-4895-8481-49a11c18cc31`), the live legal pages, local store and sim artifacts, and git on `samayhuf-star/lulla`. No ASC writes, no build, no submit.

**Overall: PASS, with build 8 still pending (expected).** Do not submit yet. Version 1.0.0 is still `PREPARE_FOR_SUBMISSION` (reviewSubmissions count is 0) and still has **build 7** attached. Produce the free local build 8 from `lulla/build8`, attach it in place of build 7, send it to TestFlight internal plus Family & Friends, and only then submit (set automatic release at submit if that is required; `releaseType` is still `AFTER_APPROVAL`).

Every earlier submission blocker (items 1–6) now passes. Item 7 is pending only because build 8 does not exist yet, which this re-check treats as expected rather than a FAIL.

---

### Item 1 — Legal pages — PASS

Live, cache-busted fetch this turn (all HTTP 200, `Last-Modified: Fri, 13 Nov 2026 12:57:35 GMT` = **6:57:35 PM Asia/Dhaka**):

| Page | URL | Result |
|---|---|---|
| Privacy | https://samayhuf-star.github.io/app-legal/lulla/privacy.html | 200. “Seven sounds are free forever, with no time limit.” Premium is $2.99 / month and $19.99 / year, each with a 7-day free trial. 24-hour cancel rule. Effective **13 November 2026**. Keychain text is only about the short Premium-sound preview, and says it never limits the seven free sounds. |
| Terms | https://samayhuf-star.github.io/app-legal/lulla/terms.html | 200. Same free-forever / 7-day trial / $2.99 / $19.99 model, plus the 24-hour cancel / auto-renew rule. Still says Lulla “is not a medical device and is not a treatment for any condition.” |
| Support | https://samayhuf-star.github.io/app-legal/lulla/support.html | 200. Same pricing and trial text. Catalog count is **43 sounds**. |
| Index | https://samayhuf-star.github.io/app-legal/lulla/index.html | 200. Same model (updated in the same commit; not one of the three listing URLs). |

Stale wording is gone: no “three minutes for free”, no “Lulla Premium is required” after a free period, no “free-minute count” as the only access, no “38 sounds”, no `$1.99`, no `[EFFECTIVE DATE]`. ASC listing URLs match: app-info en-US `privacyPolicyUrl` and version `supportUrl` are the privacy and support pages above. Description still ends with the terms and privacy links.

Repo evidence: `samayhuf-star/app-legal` commit `0eedaca` (`0eedacac0ca61bb900c1364150dc7093911d7e65`) on `main`, “Lulla legal: seven sounds free forever, 7-day trial on 2.99/19.99, 43 sounds.”

---

### Item 2 — IAP review screenshots and review notes — PASS

Live GET of both products, then a visual check of the CDN frames and a checksum check against the uncaptioned store paywall `/home/box/shared/app-monitor/reports/lulla-b8/store-shots/store69/s69-5-paywall.png` (MD5 `ed0550902842936afeb4851e24b20d93`):

| Product | Screenshot id | State | Source checksum | Size | Visual (CDN frame this turn) |
|---|---|---|---|---|---|
| Monthly `lulla_premium_monthly` (`6833063719`) | `aa6ee6eb-f254-4498-8519-561541b66001` | COMPLETE | `ed0550902842936afeb4851e24b20d93` | 1320×2868 | Current paywall: “7 days free, then $19.99/year” and “7 days free, then $2.99/month”. No `$1.99`, no “Try free for 3 minutes”. |
| Yearly `lulla_premium_yearly` (`6833064591`) | `6cb0b424-e203-44f6-9a3d-4ac566e7185f` | COMPLETE | same | 1320×2868 | Same frame. |

The old COMPLETE assets (`2fac4fba-…` / `6edbd761-…`, stale 1290×2796 checksum `fba1bca0cfa7ed9f3e728effe3293880`) are no longer attached.

Both products remain `READY_TO_SUBMIT`. IAP review notes (read back this turn) name the 7-day trial and the $2.99 / $19.99 US prices, the seven free sounds, Restore, and how to open the paywall. Version review notes (detail `1d936769-d1a4-4a2f-b887-09acd8900aea`, 2222 characters) also name the 7-day trial and both prices.

---

### Item 3 — Content rights declaration — PASS

`GET /v1/apps/6833056218`: `contentRightsDeclaration` = **USES_THIRD_PARTY_CONTENT**. That matches the in-app credits (CC-licensed Freesound recordings, public-domain lullabies, original Frequencies loops). The version endpoint still has no `ageRatingDeclaration` / content-rights relationship (404 / not a version attribute), which is expected; the declaration lives on the app record.

---

### Item 4 — Age rating — PASS

App info `6b4e37eb-8d2d-4fed-a068-6491e0b5c3db`: `appStoreAgeRating` = **FOUR_PLUS** (4+). `brazilAgeRating` = `L`, `brazilAgeRatingV2` = `SELF_RATED_L`. Questionnaire fields are all filled (`false` / `NONE`); `healthOrWellnessTopics` is false; `medicalOrTreatmentInformation` is NONE; both age-rating overrides are NONE. This is no longer a null questionnaire.

---

### Item 5 — Store screenshots — PASS

en-US localization `53e890c1-43fb-4895-8481-49a11c18cc31` now has two screenshot sets. Live GET of each set’s `appScreenshots` (display order 1–5), source checksums compared to the local captioned files, and the local captioned frames viewed this turn:

| Set | Id | Display type | Count | Size | State |
|---|---|---|---|---|---|
| 6.7" | `aa684d62-4976-44b0-899c-686a4cd02f4d` | `APP_IPHONE_67` | 5 | 1320×2868 | all COMPLETE |
| 6.5" | `99c0d0f4-8e14-4ce9-b289-59173ee4070b` | `APP_IPHONE_65` | 5 | 1242×2688 | all COMPLETE |

Order in both sets: (1) Home / Frequencies hero, (2) Frequencies, (3) Player mix (Rain + Slow Ocean Waves, Mix · 2), (4) Timer options (10 minutes–4 hours + All night), (5) Paywall. Benefit captions are baked into the frames: “Frequencies and tonight's sounds”, “Warm tones for relaxing and sleep”, “Layer rain, white noise and more”, “Timer: 2, 3, 4 hours or All night”, “7 days free, then $2.99 or $19.99”. Paywall shows “7 days free, then $19.99/year” and “7 days free, then $2.99/month”.

All ten ASC `sourceFileChecksum` values match the local files in `reports/lulla-b8/store-shots/store69-captioned/` and `store65-captioned/` exactly (paywall 6.7" MD5 `11761ac82b5b795e63ff3a8d74ee0b40`). No permission, Settings, or Restore screens. No gold QA overlay. No other display types are uploaded (no separate `APP_IPHONE_69` set; the 1320×2868 frames sit in the 6.7" slot, as on Scanwise and Klenzer).

---

### Item 6 — StoreKit purchase and restore (sim run 43428560402) — PASS

This closes the earlier UNVERIFIED purchase item. Artifacts in `/home/box/shared/app-monitor/reports/tester/lulla-sim/run-43428560402/sim-qa-43428560402/`. Run time 13:42:33–13:45:50 UTC = **7:42–7:45 PM Asia/Dhaka**, 13 Nov 2026. `xcodebuild test` exit 0, `** TEST EXECUTE SUCCEEDED **`, `testPurchaseAndRestore` passed in 92.414 s. `storekit_session_errors=no`. No `SKInternalErrorDomain` / Code=3 in the logs (the previous session-attach failure is gone). XCTest queries for “Sign in to Apple Account” returned empty (no sign-in sheet). Device: iPhone 17 Pro simulator, Xcode 26.6 (17F113).

Shots viewed this turn:

- **21-paywall.png** — current paywall with “7 days free, then $19.99/year” and “7 days free, then $2.99/month”, disclosure, Terms / Privacy / Support / Restore. No Apple ID prompt.
- **22-purchase-success.png** — home with a **Premium** badge (no “Unlock all”), locked tiles cleared, Settings open with “Premium is active. Thank you.”
- **23-restore-success.png** — same Premium state and “Premium is active. Thank you.” after Restore (Settings row).

`iap.log` / `results.json` / `summary.md`: plans loaded from local StoreKit with `trialDays=7`; `buy lulla_premium_monthly: purchased`; local transaction expires in 7.0 days; `restore: entitled true`. Note: `localSheetShown=false` — the local `SKTestSession` auto-completed the buy, so a system purchase sheet was not captured. That is accepted here because the transaction, 7-day trial, unlock, and restore are evidenced and no sandbox sign-in appeared. A TestFlight sandbox buy/restore remains a follow-up on build 8, not a current FAIL.

The run used QA branch `lulla/sim-qa-iap` @ `5a9d5cc`. `git diff lulla/build8..lulla/sim-qa-iap` changes only QA harness files (`qa/…`, flow-iap scripts, tests). `App.tsx` and product sources are identical to `lulla/build8`.

---

### Item 7 — Build 8 — PENDING (expected, not a FAIL)

No build 8 exists in ASC. VALID builds are still 4, 5, 6, and **7** (`ccd5b466-ba86-4ebc-8c0a-b06842125cda`, uploaded 12 Nov 2026, 6:08:33-08:00 = **8:08 PM Asia/Dhaka** on 12 Nov). Build 7 is still attached to version 1.0.0, `APP_STORE_ELIGIBLE`, `usesNonExemptEncryption: false`. Do not attach or submit build 7.

Branch for the free local build: `lulla/build8` @ `36f0472ceeaa8881dde1eb69274aa087491cbf6f` (matches `origin/lulla/build8`). App product commit `8a34015` (`8a3401535dc742096408d5ee9a0511a770d99231`, “Remove the lifetime product…”) is an ancestor. `git diff 8a34015..lulla/build8` is QA-only: `App.tsx` and `src/qa.ts` add `lulla://qa/buy|restore|overlay` hooks, overlay hiding, and QA logs, all gated on `QA_MODE` (`EXPO_PUBLIC_LULLA_QA === '1'` in `src/config.ts`; store builds do not set that flag). No unreviewed product, pricing, or catalog changes since `8a34015`.

---

### App price, subscriptions, ASO, review contact, App Privacy

| Check | Result | Evidence |
|---|---|---|
| App list price Free, all territories | **PASS** | `appPriceSchedule` base territory **USA**. One manual USA price, price point 10000, `customerPrice` **0.0**, start/end null. 174 automatic territories also **0.0** / **0**. Total **175**. |
| Subscriptions $2.99 / month and $19.99 / year, 7-day trials, no lifetime | **PASS** | Group “Lulla Premium” (`22565177`). Monthly `lulla_premium_monthly` (`6833063719`) ONE_MONTH, USA **$2.99**, `READY_TO_SUBMIT`. Yearly `lulla_premium_yearly` (`6833064591`) ONE_YEAR, USA **$19.99**, `READY_TO_SUBMIT`. Each has **175** `FREE_TRIAL` / `ONE_WEEK` / `numberOfPeriods: 1` offers, start 13 Nov 2026, no end date, 175 prices. `inAppPurchasesV2` is empty (no lifetime). |
| Age rating 4+ | **PASS** | See item 4. |
| Content rights | **PASS** | See item 3. |
| Review details | **PASS** | Contact **Samay Vashsht**, phone **[phone redacted]** (E.164 for [phone redacted]), email **samayhuf@gmail.com**. `demoAccountRequired: false`. Notes name the 7-day trial and both prices. |
| ASO title / subtitle / keywords / description / promo / categories | **PASS** | Title `Lulla - Sleep Sounds` (20). Subtitle `White Noise, Rain & Lullabies` (29), no title-word repeat. Keywords `brown,pink,fan,nature,relax,ocean,music,timer,baby,deep,machine,forest,thunder,nap,calm,night,rest` (98/100, no spaces, no AI, no 528hz / 432hz / binaural, no exact title/subtitle tokens). Promo 162 chars, includes the 7-day trial and $2.99 / $19.99. Description hook is the first three lines (free forever, timer, 7-day trial then $2.99 / $19.99, cancel anytime); no medical claims, no AI. Primary **Lifestyle**, secondary **Music**. Copyright `2026 Samay Vashsht`. Standard EULA. |
| App Privacy | **PASS (COO-confirmed)** | COO published App Privacy as Data Not Collected. The public API still cannot read the nutrition labels (unchanged). |

---

### Open items (not FAILs)

1. **Build 8 is not in ASC yet.** Produce it with the free local-ios-build workflow from `lulla/build8` (stop if a build would bill), attach it in place of build 7, send it to internal TestFlight and Family & Friends, then submit. Keep `usesNonExemptEncryption: false` if that remains accurate. Verify purchase and Restore once in TestFlight sandbox.
2. **`releaseType` is still `AFTER_APPROVAL`.** Change it to automatic release at submit if that is required.
3. **`usesIdfa` is still null** on the version; answer it at submit if ASC asks.

No EAS, ASC write, or submit was performed in this re-verify.
