# Lulla 1.0.0 — Guideline 4.3(a) (Spam) rejection, 16 Nov 2026 9:26 PM

Apple: app "shares a similar binary, metadata, and/or concept" with apps from other developers.
Cause (our read): generic sleep-sound player (sound grid + mixer + timer), same free CC0 field
recordings, and generic metadata ("sleep sounds, white noise, rain") — the most crowded category.

## What changed in the app (branch fix/4.3a-differentiation, build 11, NOT submitted)
1. **Wind-down ritual** — guided breathing pacer (Slow 4·6, 4·7·8, Box) with the user's sounds; the
   mix volume gently swells on the inhale and ebbs on the exhale; on finish it starts the sleep timer.
2. **My nights** — save named mixes with per-sound volumes (20 max, on-device), one-tap recall.
3. **Sleep journal** — 10-second morning check-in, 7-day chart, "most rested after" mix. On-device only.
4. **Night arc** — a bedtime routine that plays by itself: scenes with their own sounds and lengths,
   quiet dip and blend between scenes, last scene fades to silence. Three free-sound presets, or chain
   your own saved nights (up to 5 scenes).
Home screen leads with a "Tonight" card for these three. Tests: scripts/winddown.test.ts (+13 asserts).

## Metadata to change in App Store Connect (do in this order, before resubmitting)
- Subtitle: `Breathe, blend & drift off` (28)  — drops the generic "white noise, rain, lullabies" line
- Promo: `Guided breathing that moves your sounds, bedtime routines that play themselves, and a private sleep journal. 7 days free.`
- Description opening: replace with the wind-down / My nights / Journal story; sounds become supporting detail.
- Keywords: `breathing,wind down,bedtime,routine,journal,nap,calm,mix,432hz,528hz,timer,rest,baby,relax`
- Screenshots: lead with Wind-down pacer, Night arc, My nights, Journal (new captured set needed with build 11).
- Do NOT use any competitor names.

## Reply for Resolution Center (send only with the new build; tap paths are exact)
Hello App Review team,
Thank you for the feedback. Lulla is our own app, written by one developer with no template and no
code or assets from other apps. We have a single app on a single account. Audio is original
synthesis (Frequencies, noises, lullabies) plus CC0 / CC BY field recordings, all listed under
Settings > Sound credits.
Version 1.0.0 (build 11) goes well beyond a sound player. To see it:
1. Home > "Tonight" card > Wind-down > Begin: a breathing pacer runs while the volume of the user's
   sound mix swells on the inhale and ebbs on the exhale; at the end the sleep timer starts.
2. Home > Tonight > Night arc > Start: a bedtime routine that plays scenes in sequence by itself,
   blending from one sound scene to the next and fading to silence at the end. Users can chain their
   own saved mixes into a routine.
3. Home > Tonight > My nights: named saved mixes with per-sound volumes.
4. Home > Tonight > Journal: a private on-device morning check-in and 7-day chart.
We also rewrote the subtitle, description, keywords and screenshots to describe these features.
Please let us know if anything needs clarification.

## Still to do before resubmission (waiting for your go-ahead)
- EAS build 11, TestFlight, capture new screenshots, update ASC metadata, update privacy page
  (journal/mixes stored on device only), then you confirm -> submit.
