# Lulla ASO (ASC 6833056218)

Applied 13 Nov 2026, 4:49 PM BDT (Asia/Dhaka). Metadata only. No builds, prices, subscriptions, screenshots, TestFlight or review submissions were touched. Version 1.0.0 was PREPARE_FOR_SUBMISSION and all written fields stayed editable.

## Final (live read-back)

| Field | Value | Chars |
|---|---|---|
| Name | Lulla - Sleep Sounds | 20/30 |
| Subtitle | White Noise, Rain & Lullabies | 29/30 |
| Keywords | brown,pink,fan,nature,relax,ocean,music,timer,baby,deep,machine,forest,thunder,nap,calm,night,rest | 98/100 |
| Promo text | Seven sounds free forever. Mix white noise, rain and Frequencies, set a 2, 3, 4 hour or All night timer. Try Premium 7 days free, then $2.99/month or $19.99/year. | 162/170 |
| Primary category | LIFESTYLE | |
| Secondary category | MUSIC | |
| Description | (see below) | 2519/4000 |

First 3 lines of the description (benefit hook):

> Fall asleep to white noise, rain, lullabies and gentle frequencies, all on your iPhone.
>
> Seven sounds are free forever. Layer a mix, set a timer for 2, 3 or 4 hours or All night, and keep playing with the screen off.
>
> Try Premium free for 7 days, then $2.99 a month or $19.99 a year. Cancel anytime.

Screenshot captions (not uploaded): `/home/box/shared/app-monitor/reports/lulla-aso/captions.json`

Failed fields: none. What's New was left alone (not editable on a first 1.0.0 version). Support URL and privacy URL were left unchanged.

## Before → after

| Field | Before | After |
|---|---|---|
| Name | Lulla - Sleep Sounds | Lulla - Sleep Sounds (unchanged; already had the top term) |
| Subtitle | Calm sounds to fall asleep | White Noise, Rain & Lullabies |
| Keywords | `sleep,white noise,rain,brown noise,lullaby,432hz,528hz,frequency,relax,calm,ocean,fan,timer,binaural` (100) | `brown,pink,fan,nature,relax,ocean,music,timer,baby,deep,machine,forest,thunder,binaural,528hz,432hz` (99) |
| Promo | Seven calm sounds free forever, plus the new Frequencies collection of warm 432, 528 and 963 Hz pads. Layer your mix and set a timer up to 4 hours or All night. (160) | new promo (162), adds the 7-day trial and prices |
| Categories | LIFESTYLE / MUSIC | HEALTH_AND_FITNESS / LIFESTYLE |
| Description hook | Fall asleep to calm sound with Lulla. Pick a sound, layer your own mix, set a sleep timer and drift off. | New 3-line hook above. Body kept accurate. Subscription section now states the 7-day trial for eligible users, at $2.99/month or $19.99/year. |

The old subtitle repeated the title word "sounds". The new subtitle uses the next-best terms and does not repeat title words (Lulla, Sleep, Sounds).

The old keyword field repeated several title/subtitle words (sleep, rain, white, noise, lullaby). Those were removed. 432hz stays; 528hz was added from App Store hints.

## Sources (free only, $0)

App Store search autocomplete, with `X-Apple-Store-Front: 143441-1,29` (US) against `search.itunes.apple.com/WebObjects/MZSearchHints.woa/wa/hints?clientApplication=Software&term=...`. Raw dump: `apple-hints.json` in this folder.

Top Lulla hints:

- "sleep sounds" and "sleep sounds free" were the dominant suggestions under sleep / sleep s / sleep so / sleep sounds.
- Closely related suggestions: "sleep sounds white noise, rain", "sleep sounds fan", "white noise", "white noise fan", "white noise baby", "brown noise", "pink noise", "rain sounds", "sleep music", "sleep timer", "fall asleep", "baby sleep", "fan noise", "ocean sounds", "nature sounds", "432 hz" / "432hz", "528 hz", "binaural beats".
- Ignored as off-product or competitor-branded: sleep tracker, sleep cycle, sleep stories (Lulla has no stories), Calm, BetterSleep, Sleep Pillow, Rain Rain, Sleep Number.

Google autocomplete (`suggestqueries.google.com/complete/search?client=firefox`): sleep sounds, sleep sounds for adults/babies/kids/deep sleep, white noise app / for sleep, rain sounds for sleep, lullaby app, brown noise sleep, sleep music app, relaxing / soothing / calming sounds to fall asleep, nature sounds sleep, sleep timer app. Saved in `google-suggest.json`. Medical-intent suggestions (insomnia, anxiety, tinnitus) were not used in copy.

iTunes Search API (`itunes.apple.com/search?entity=software&country=us`) competitor listings, read only, in `itunes-competitors.json`:

- "sleep sounds" and "white noise" results are almost all primary Health & Fitness (54 of the Lulla-query hits). The most common pair is Health & Fitness + Lifestyle (24). Music was a distant secondary (4 primary, 5 secondary). That is why categories were first moved from Lifestyle / Music to Health & Fitness / Lifestyle. A later instruction overrode this; see the follow-up below, which restored Lifestyle / Music.
- Competitor brand names were not used in the name, subtitle, keywords, promo or description.
- No "AI" wording. Frequencies are described as warm, slow synth pads and gentle sounds for relaxing and sleep. No heal, cure or treat claims. "heartbeat" remains only as the name of a sound in the catalog.

## Notes

- Name kept "Lulla - Sleep Sounds" because it already leads with the brand and the top search term, in 20 characters, with no stuffing.
- Keywords are comma-separated with no spaces after commas, and share no words with the title or subtitle.
- Trial and prices in the hook, promo and subscription legal block match the approved $2.99 / $19.99 plans with a 7-day free trial (shown only when the user is eligible). No lifetime plan.
- Privacy and terms URLs in the description were already live (HTTP 200).

## Follow-up, 13 Nov 2026, 5:02 PM BDT (Asia/Dhaka)

This overrides the Health & Fitness / Lifestyle choice and the 528hz / 432hz / binaural keywords from the first write. Name, subtitle, promo, description, screenshots, prices, subscriptions, builds and TestFlight were not changed.

Live read-back after the override:

| Field | Value | Chars |
|---|---|---|
| Primary category | LIFESTYLE | |
| Secondary category | MUSIC | |
| Keywords | brown,pink,fan,nature,relax,ocean,music,timer,baby,deep,machine,forest,thunder,nap,calm,night,rest | 98/100 |

Keyword changes: removed `528hz`, `432hz`, and `binaural`. The last of those was dropped because the description still names a catalog sound as "Delta Waves binaural beat (use headphones)", which pairs "binaural" with a brainwave term. The freed space was refilled with the neutral terms `nap`, `calm`, `night`, and `rest`. `bedtime`, `quiet`, and `soothing` did not fit in the 100-character cap. No title or subtitle words are in the keyword field (title: Lulla, Sleep, Sounds; subtitle: White, Noise, Rain, Lullabies).

Description and promo: re-read in full. No edits. Neither contains heal, cure, treat, anxiety, insomnia, therapy, or stress relief. The first 3 lines are unchanged. "432 Hz Deep Sleep", "528 Hz Calm", and "Delta Waves binaural beat (use headphones)" remain only as in-app sound names, not as medical claims.
