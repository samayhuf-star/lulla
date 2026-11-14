# Lulla 1.0.0 listing fixes 1-4

Written 13 November 2026, 7:03 PM Asia/Dhaka (BDT, UTC+6).
ASC app `6833056218`, version 1.0.0 (`18c8454a-4685-4e4e-8b77-bcf619e18831`).
No review submission (reviewSubmissions count is 0). Version state remains `PREPARE_FOR_SUBMISSION`. No cloud EAS build. $0 spend. The ASC key was read from disk and never printed or committed.

Supporting dumps: `fixes-1-4-before.json`, `fixes-1-4-writes.json`, `fixes-1-4-readback.json`.

---

## Item 1 — Legal pages: DONE

Repo `samayhuf-star/app-legal`, normal push (no force-push): commit `0eedaca` (`0eedacac0ca61bb900c1364150dc7093911d7e65`) on `main`, 13 Nov 2026, 6:56 PM Asia/Dhaka.

What changed in `privacy.html`, `terms.html`, `support.html`, and `index.html` (the index had the same stale sentence flagged in VERDICT.md):
- Replaced "You can listen for three minutes for free. After that, Lulla Premium is required" with: seven sounds are free forever, with no time limit; Premium unlocks the rest of the library.
- Premium is $2.99 a month and $19.99 a year in the US, each with a 7-day free trial for new subscribers.
- Kept the cancel-at-least-24-hours-before-renewal (and before the trial ends) rule.
- Support catalog count changed from 38 to 43 sounds.
- Privacy no longer treats a 3-minute countdown as the only free access. It still records that a short Premium-sound preview count may stay in the iOS keychain (that preview is still how locked sounds work in the app, and it never limits the seven free sounds).
- Publisher remains Samay Vashsht, email samayhuf@gmail.com only (no phone on these pages).
- Effective date kept: 13 November 2026.
- No typographic ellipsis, no AI wording, no health claims. The existing terms disclaimer "is not a medical device and is not a treatment for any condition" was kept.

Live poll (cache-busted):
- Try 1 at 6:57:23 PM Asia/Dhaka still served the old pages (Last-Modified 12:15:42 GMT = 6:15:42 PM Asia/Dhaka).
- Try 2 at 6:57:38 PM Asia/Dhaka: all pages HTTP 200, Last-Modified 12:57:35 GMT = 6:57:35 PM Asia/Dhaka, with the new text and none of the stale sentences.

| Page | URL | HTTP | Last-Modified (UTC) | New text present | Stale text absent |
|---|---|---|---|---|---|
| Privacy | https://samayhuf-star.github.io/app-legal/lulla/privacy.html | 200 | 12:57:35 GMT | Seven sounds are free forever; 7-day free trial; $2.99; $19.99 | no "three minutes for free", no "free-minute count" |
| Terms | https://samayhuf-star.github.io/app-legal/lulla/terms.html | 200 | 12:57:35 GMT | same, plus 24-hour cancel rule | no "three minutes for free" |
| Support | https://samayhuf-star.github.io/app-legal/lulla/support.html | 200 | 12:57:35 GMT | same, plus "43 sounds" | no "three minutes for free", no "38 sounds" |
| Index (also updated; not in the 3-page poll list) | https://samayhuf-star.github.io/app-legal/lulla/index.html | 200 | 12:57:35 GMT | Seven sounds are free forever; 7-day trial; $2.99 / $19.99 | no "three minutes for free" |

Blocker: none.

---

## Item 2 — IAP review screenshots and review notes: DONE

Paywall frame used: `/home/box/shared/app-monitor/reports/lulla-b8/store-shots/store69/s69-5-paywall.png` (1320x2868, MD5 `ed0550902842936afeb4851e24b20d93`). Viewed before upload: "7 days free, then $19.99/year", "7 days free, then $2.99/month", "All 43 sleep sounds", free sounds stay free, 24-hour cancel disclosure. No $1.99, no "Try free for 3 minutes", no QA overlay.

Old COMPLETE assets deleted (HTTP 204):
- Monthly `6833063719`: deleted `2fac4fba-f3a0-4ffb-967b-57d11196bd5d` (stale 1290x2796, checksum `fba1bca0cfa7ed9f3e728effe3293880`).
- Yearly `6833064591`: deleted `6edbd761-3f2d-4d31-8dab-26ccad5e4355` (same stale art).

New screenshots, read back from `GET /v1/subscriptions/{id}/appStoreReviewScreenshot`, then re-downloaded from the listing asset URLs and viewed:

| Product | New screenshot id | State | Checksum | Size | Visual check of the live CDN frame |
|---|---|---|---|---|---|
| Monthly `lulla_premium_monthly` (`6833063719`) | `aa6ee6eb-f254-4498-8519-561541b66001` | COMPLETE | `ed0550902842936afeb4851e24b20d93` | 1320x2868 | Shows 7 days free, then $19.99/year and $2.99/month. No $1.99, no 3-minute trial art. |
| Yearly `lulla_premium_yearly` (`6833064591`) | `6cb0b424-e203-44f6-9a3d-4ac566e7185f` | COMPLETE | `ed0550902842936afeb4851e24b20d93` | 1320x2868 | Same frame. |

(The first yearly chunk upload dropped with a connection reset; the reserved asset `6cb0b424-…` was retried, committed, and reached COMPLETE. Monthly was not redone.)

Both products remain `READY_TO_SUBMIT`.

### IAP review notes (read back)

Monthly:
> Lulla Premium Monthly unlocks all 43 sounds with unlimited listening. In the US it is $2.99 a month, with a 7-day free trial for new subscribers. After the trial, the subscription starts automatically unless cancelled at least 24 hours before the trial ends. Prices are the App Store's localized prices. To reach the subscription screen: tap any sound with a Premium lock badge after the 3-minute premium-sound preview, or tap "Unlock all" at the top right of the home screen. Seven sounds stay free forever without a subscription. Restore is in Settings (gear icon) and on the subscription screen.

Yearly:
> Lulla Premium Yearly unlocks all 43 sounds with unlimited listening. In the US it is $19.99 a year, with a 7-day free trial for new subscribers. After the trial, the subscription starts automatically unless cancelled at least 24 hours before the trial ends. Prices are the App Store's localized prices. To reach the subscription screen: tap any sound with a Premium lock badge after the 3-minute premium-sound preview, or tap "Unlock all" at the top right of the home screen. Seven sounds stay free forever without a subscription. Restore is in Settings (gear icon) and on the subscription screen.

### Version 1.0.0 review notes (read back)

Review detail `1d936769-d1a4-4a2f-b887-09acd8900aea`. Contact unchanged: **Samay Vashsht**, **samayhuf@gmail.com**, phone **[phone redacted]** (E.164 for [phone redacted]). `demoAccountRequired: false`. Notes (2222 chars) now name the 7-day trial and the $2.99 / $19.99 prices, and keep the seven free sounds, the 3-minute premium-sound preview (distinct from the subscription trial), Restore, timer, and content-rights explanation:

> Lulla plays sleep sounds. There is no account or sign-in.
>
> What is free: seven sounds play forever with no time limit and no subscription: Rain, Slow Ocean Waves, Forest, Fan, White Noise, Brown Noise and 432 Hz Deep Sleep. They have no lock badge. Mixing, the sleep timer and background playback all work with the free sounds.
>
> Premium: the other 36 sounds show a "Premium" lock badge. Each install can preview premium sounds for 3 minutes in total (counted only while a premium sound plays). After that, tapping a premium sound opens the subscription screen. The screen can also be opened at any time from the "Unlock all" button at the top right of the home screen. It has a close (X) button that returns to the home screen, where the free sounds keep working.
>
> Subscriptions: Lulla Premium Monthly (lulla_premium_monthly, $2.99 a month in the US) and Lulla Premium Yearly (lulla_premium_yearly, $19.99 a year in the US), one group "Lulla Premium", sold with StoreKit 2. Both include a 7-day free trial for new subscribers. After the trial, the subscription starts automatically unless cancelled at least 24 hours before the trial ends. Prices are the App Store's localized prices. Please test with a Sandbox account.
>
> Restore: tap the gear (Settings) at the top right of the home screen, then "Restore purchases". "Restore purchases" is also on the subscription screen.
>
> Sleep timer: tap Timer in the bottom bar. Options run from 10 minutes to 4 hours, each with a gentle 60 second fade-out, plus "All night", which does not stop playback.
>
> Background audio: the app uses the audio background mode so sounds keep playing with the screen locked. The lock screen and Control Center play and pause control the whole mix.
>
> Content: the Frequencies sounds and the noises are original audio made for Lulla by Samay Vashsht. Field recordings are CC-licensed Freesound recordings (CC0 or CC BY) and public-domain lullabies, credited in-app, and we have the rights to use them. Credits are in the app: tap the gear (Settings), then "Sound credits" (the CC BY 4.0 credit for Farm by klankbeeld with licence link, the CC0 note, and the original Frequencies loops). Delta Waves is a binaural beat and is labelled "Use headphones".

Blocker: none.

---

## Item 3 — Content rights declaration: DONE

`PATCH /v1/apps/6833056218` with `contentRightsDeclaration = USES_THIRD_PARTY_CONTENT` returned 200.

Read-back: app `contentRightsDeclaration` = **USES_THIRD_PARTY_CONTENT**.

A follow-up `PATCH` on the version was rejected 409 (`ENTITY_ERROR.ATTRIBUTE.UNKNOWN`: `'contentRightsDeclaration' is not an attribute on the resource 'appStoreVersions'`). A GET of the version still shows that key as null because it is not a version attribute. The declaration the checklist flagged lives on the app record, and that is now set.

Blocker: none.

---

## Item 4 — Age rating declaration: DONE

Declaration id / appInfo id: `6b4e37eb-8d2d-4fed-a068-6491e0b5c3db`. The version has no `ageRatingDeclaration` relationship (404). GET on `/v1/ageRatingDeclarations/{id}` is forbidden; read-back is via `/v1/appInfos/{id}/ageRatingDeclaration`.

First PATCH that sent both `ageRatingOverride` and `ageRatingOverrideV2` was rejected 409 (`STATE_ERROR.AGE_RATING_OVERRIDE_V1_AND_V2_NOT_ALLOWED`). Retry without the v1 override field succeeded (200).

Computed ratings on appInfo, read back after the write:
- `appStoreAgeRating`: **FOUR_PLUS** (4+)
- `brazilAgeRating`: `L`
- `brazilAgeRatingV2`: `SELF_RATED_L`
- `australiaAgeRating`, `franceAgeRating`, `koreaAgeRating`: null
- appInfo / version state still `PREPARE_FOR_SUBMISSION`

Questionnaire fields, read back:

| Field | Value |
|---|---|
| advertising | false |
| alcoholTobaccoOrDrugUseOrReferences | NONE |
| contests | NONE |
| gambling | false |
| gamblingSimulated | NONE |
| gunsOrOtherWeapons | NONE |
| healthOrWellnessTopics | false |
| kidsAgeBand | null |
| lootBox | false |
| medicalOrTreatmentInformation | NONE |
| messagingAndChat | false |
| parentalControls | false |
| profanityOrCrudeHumor | NONE |
| ageAssurance | false |
| sexualContentGraphicAndNudity | NONE |
| sexualContentOrNudity | NONE |
| socialMedia | false |
| socialMediaAgeRestricted | false |
| horrorOrFearThemes | NONE |
| matureOrSuggestiveThemes | NONE |
| unrestrictedWebAccess | false |
| userGeneratedContent | false |
| violenceCartoonOrFantasy | NONE |
| violenceRealisticProlongedGraphicOrSadistic | NONE |
| violenceRealistic | NONE |
| ageRatingOverride | NONE |
| ageRatingOverrideV2 | NONE |
| koreaAgeRatingOverride | NONE |
| gracRatingClassificationNumber | null |
| developerAgeRatingInfoUrl | null |

Blocker: none.

---

## Not in this pass (still open from the checklist)

Items 5-7 were out of scope here: store69 / store65 screenshot upload, StoreKit purchase/restore sim rerun, and the local-ios-build of build 8. Nothing was submitted for App Review. `releaseType` is still `AFTER_APPROVAL`.
