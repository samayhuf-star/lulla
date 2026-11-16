# Lulla 1.0.0 — Guideline 4.3(a) (Spam) rejection, 16 Nov 2026 9:26 PM

Apple: app "shares a similar binary, metadata, and/or concept" with apps from other developers.
Cause (our read): generic sleep-sound player (sound grid + mixer + timer), same free CC0 field
recordings, and generic metadata ("sleep sounds, white noise, rain") — the most crowded category.

## What changed in the app (branch fix/4.3a-differentiation, build 11, NOT submitted)
1. **Wind-down ritual** — guided breathing pacer (Slow 4·6, 4·7·8, Box) with the user's sounds; the
   mix volume gently swells on the inhale and ebbs on the exhale; on finish it starts the sleep timer.
2. **My nights** — save named mixes with per-sound volumes (20 max, on-device), one-tap recall.
3. **Sleep journal** — 10-second morning check-in, 7-day chart, "most rested after" mix. On-device only.
Home screen leads with a "Tonight" card for these three. Tests: scripts/winddown.test.ts (+13 asserts).

## Metadata to change in App Store Connect (do in this order, before resubmitting)
- Subtitle: `Breathe, mix & sleep better` (27)  — drops the generic "white noise, rain, lullabies" line
- Promo: `Wind down with guided breathing, save the sound mixes that work, and see how you slept. 7 days free.`
- Description opening: replace with the wind-down / My nights / Journal story; sounds become supporting detail.
- Keywords: `breathing,wind down,bedtime,routine,journal,nap,calm,mix,432hz,528hz,timer,rest,baby,relax`
- Screenshots: lead with Wind-down pacer, My nights, Journal (new captured set needed with build 11).
- Do NOT use any competitor names.

## Reply for Resolution Center (send only with the new build)
Hello App Review team,
Thank you for the feedback. Lulla is our own app, built from scratch by one developer, with no
template and no code or assets from other apps. Audio is original synthesis (Frequencies, noises,
lullabies) plus CC0/CC BY field recordings, all documented in the in-app Sound credits.
In version 1.0.0 (build 11) we added features that go well beyond a sound player: a guided
breathing wind-down ritual that moves the sound mix with the user's breath and then starts the sleep
timer, named saved mixes ("My nights"), and a private on-device sleep journal. We also rewrote the
subtitle, description, keywords and screenshots to match. We only have this one app and one account.
Please let us know if anything else needs clarification.

## Still to do before resubmission (waiting for your go-ahead)
- EAS build 11, TestFlight, capture new screenshots, update ASC metadata, update privacy page
  (journal/mixes stored on device only), then you confirm -> submit.
