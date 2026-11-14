# Lulla build 8: sound proposal

Prepared 2026-11-12 (Asia/Dhaka) after Samay's feedback on build 7: better, but still "not that great", and he wants more sounds that genuinely help sleep.

**Updated 2026-11-12 after Samay's decisions (8:44 PM BDT / Asia/Dhaka, relayed by COO and Team Lead).** This is still a proposal file. No code changes and no EAS build until after Twist 21 build 4.

**Decided:**

- One single final build 8. There is no 8a or 8b split.
- AAC-LC 160 kbps stereo, 48 kHz (about 109 MB for the 32-sound plan) is OK. Keeping the 6 sounds below will raise the size; see Size and encoding.
- Piano: FluidR3_GM (MIT licence). Not Salamander, so no in-app piano credit line is needed.
- Snow, Cave, Drip, Farm, Grassland and Rain on Puddle are kept. None of them are dropped. Each is fixed by re-sourcing or remastering to the same standard: lossless source, a 3 to 5 min seamless loop, -20 LUFS, true peak at or below -1 dBTP.
- Queue: after Twist 21 build 4.
- Freesound access: option A. Samay will sign in on the box browser when this work starts. Login URL: https://freesound.org/home/login/

## Why build 7 still sounds "not that great"

1. **Lossy source files.** Every build 7 source was a Freesound *preview* (OGG Vorbis about 190 to 330 kbps) re-encoded to AAC, which stacks two lossy codecs. Rain and noise-like sounds are the hardest material for lossy codecs.
2. **Short loops** (60 to 66 s). With rain or waves you can notice the repeat after a few minutes.
3. **No EQ.** Close-miked rain and fire carry harsh 6 to 12 kHz energy. Nothing softened it.
4. **Three quiet files**: Cave -25.1, Snow -23.3 and Forest -23.0 LUFS.

## Getting original files: what's needed

- **Freesound originals need a signed-in account.** All picks below are CC0 on Freesound, and each page shows the original WAV/FLAC/AIFF. But `/download/` redirects anonymous users to the login page, and API downloads of originals need **OAuth2** (an API key alone only gives previews).
- **What I need, one of these:**
  - **A, simplest:** a free Freesound account (Samay's, or a new one he approves) signed in once in the box browser. I then download the originals there. No API work.
  - **B:** a Freesound API app (client id + secret) plus a one-time OAuth2 authorise click by the account owner. That gives an access token for `/apiv2/sounds/<id>/download/`.
- **Alternatives checked:**
  - **Pixabay** sound effects: the Pixabay Content License allows commercial use with no attribution, but downloads are **MP3 only** (not originals), and the site blocks scripted access (Cloudflare 403). Fallback only.
  - **Wikimedia Commons**: originals download freely, but there are few usable long CC0 ambiences. The best are Jarrod Stanley's CC0 ocean and rapids recordings, about 370 to 510 kbps OGG, so still lossy.
  - **archive.org**: licence tags are self-declared by uploaders, and its "CC0" search returns obviously wrong items (commercial albums tagged CC0). Not safe without a per-item check, so excluded.
  - **BBC Sound Effects**: RemArc licence is non-commercial. Excluded.
  - **Sonniss GDC bundles**: royalty-free and commercial OK, 24-bit WAV. But they come as 10 to 30 GB torrents or zips per year, with no per-file download. A good second source if Freesound login isn't possible: about 1 to 2 h of download and search on the box.

## Mastering plan (every file)

- Original WAV/FLAC/AIFF, then 48 kHz float.
- 20 Hz high-pass, plus a gentle **high-shelf -3 to -6 dB above 6 to 8 kHz**, or a 10 to 12 kHz low-pass for rain, fire and fan, to remove harshness.
- **3 to 5 minute loops** where the source allows (shorter ones are noted), with a seamless 4 to 6 s equal-power crossfaded loop point.
- **-20 LUFS integrated for every file**, true peak at or below -1 dBTP. Transient-heavy recordings get a look-ahead limiter of at most 6 dB, and a softer, less peaky source is picked if more would be needed. Forest is still replaced (see #18). Cave and Snow stay in the app and are re-sourced; they cannot hit -20 LUFS from the current files. See the fix plan for the 6 kept sounds.
- Music renders loop on a bar boundary with a reverb tail carried over, so no crossfade smear.
- Binaural loop length is an exact whole number of beat cycles.

## Proposed list (the earlier 32 sounds; the 6 that stay are listed after the table)

| # | Name | Category | Build 7 action | Source | Author | Licence | Original format | Orig. length | Planned loop |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Brown Noise | Noise | Keep (regenerate) | Generated (ffmpeg anoisesrc, brown, independent L/R) | In-house | CC0 (own work) | Generated 48 kHz float | n/a | 1:30 |
| 2 | Pink Noise | Noise | Keep (regenerate) | Generated (anoisesrc pink) | In-house | CC0 (own work) | Generated 48 kHz float | n/a | 1:30 |
| 3 | Green Noise | Noise | NEW | Generated (pink noise band-passed about 200 Hz to 1.5 kHz, centred near 500 Hz) | In-house | CC0 (own work) | Generated 48 kHz float | n/a | 1:30 |
| 4 | White Noise | Noise | Keep (regenerate, softer shelf) | Generated (anoisesrc white, -6 dB shelf above 6 kHz) | In-house | CC0 (own work) | Generated 48 kHz float | n/a | 1:30 |
| 5 | Rain | Rain | Keep, re-master from original | [Freesound #527500](https://freesound.org/people/timothyd4y/sounds/527500/) | timothyd4y | CC0 1.0 (checked on page) | Wave, 48 kHz, 24 bit, 2304 kbps PCM | 1:32 | 1:28 |
| 6 | Deep Rain on Roof | Rain | REPLACE Rain on Roof | [Freesound #406502](https://freesound.org/people/kyles/sounds/406502/) | kyles | CC0 1.0 (checked on page) | Wave, 48 kHz, 24 bit, 2304 kbps PCM | 4:34 | 4:00 |
| 7 | Rain on Tent | Rain | NEW | [Freesound #251233](https://freesound.org/people/pulswelle/sounds/251233/) | pulswelle | CC0 1.0 (checked on page) | Wave, 44.1 kHz, 24 bit, 2117 kbps PCM | 4:12 | 4:00 |
| 8 | Rain on Window | Rain | REPLACE | [Freesound #158690](https://freesound.org/people/RutgerMuller/sounds/158690/) | RutgerMuller | CC0 1.0 (checked on page) | AIFF, 48 kHz, 24 bit, 2304 kbps PCM | 5:08 | 4:30 |
| 9 | Rain on Umbrella | Rain | Keep, re-master from original | [Freesound #593191](https://freesound.org/people/dannydandanshababaloo/sounds/593191/) | dannydandanshababaloo | CC0 1.0 (checked on page) | Wave, 48 kHz, 24 bit, 2304 kbps PCM | 2:20 | 2:15 |
| 10 | Distant Thunder | Rain | REPLACE Thunder (current is a close storm) | [Freesound #352850](https://freesound.org/people/morvei01/sounds/352850/) | morvei01 | CC0 1.0 (checked on page) | Wave, 48 kHz, 16 bit, 1536 kbps PCM | 4:08 | 4:00 |
| 11 | Slow Ocean Waves | Water | REPLACE Ocean | [Freesound #176617](https://freesound.org/people/craiggroshek/sounds/176617/) | craiggroshek | CC0 1.0 (checked on page) | Flac, 44.1 kHz, 16 bit, 1411 kbps PCM (lossless) | 4:04 | 4:00 |
| 12 | Lake | Water | Keep, re-master from original | [Freesound #523392](https://freesound.org/people/Anya_Media/sounds/523392/) | Anya_Media | CC0 1.0 (checked on page) | Wave, 48 kHz, 16 bit, 1536 kbps PCM | 2:06 | 2:00 |
| 13 | Creek | Water | REPLACE (current source only 65 s) | [Freesound #580796](https://freesound.org/people/jasonm911/sounds/580796/) | jasonm911 | CC0 1.0 (checked on page) | Wave, 44.1 kHz, 16 bit, 1411 kbps PCM | 4:01 | 3:50 |
| 14 | Waterfall | Water | Keep, re-master from original | [Freesound #650699](https://freesound.org/people/datapopstar2/sounds/650699/) | datapopstar2 | CC0 1.0 (checked on page) | Wave, 48 kHz, 24 bit, 2304 kbps PCM | 2:01 | 1:55 |
| 15 | Underwater | Water | Keep, re-master from original | [Freesound #482167](https://freesound.org/people/Tim_Verberne/sounds/482167/) | Tim_Verberne | CC0 1.0 (checked on page) | Wave, 44.1 kHz, 16 bit, 1411 kbps PCM | 2:00 | 1:55 |
| 16 | Wind | Nature | Keep, re-master from original | [Freesound #760241](https://freesound.org/people/jackstraton/sounds/760241/) | jackstraton | CC0 1.0 (checked on page) | Wave, 44.1 kHz, 24 bit, 2117 kbps PCM | 4:16 | 4:00 |
| 17 | Wind & Leaves | Nature | Keep, re-master from original | [Freesound #150174](https://freesound.org/people/deleted_user_229898/sounds/150174/) | deleted_user_229898 | CC0 1.0 (checked on page) | Flac, 44.1 kHz, 16 bit, 1411 kbps PCM (lossless) | 2:00 | 1:55 |
| 18 | Forest | Nature | REPLACE (fixes -23 LUFS, more gentle) | [Freesound #856018](https://freesound.org/people/newlocknew/sounds/856018/) | newlocknew | CC0 1.0 (checked on page) | Wave, 48 kHz, 16 bit, 1536 kbps PCM | 6:06 | 4:00 |
| 19 | Night Crickets | Nature | Keep (was Night), re-master | [Freesound #522299](https://freesound.org/people/Defelozedd94/sounds/522299/) | Defelozedd94 | CC0 1.0 (checked on page) | Wave, 48 kHz, 16 bit, 1536 kbps PCM | 3:42 | 3:30 |
| 20 | Crackling Fireplace | Warmth | REPLACE Fireplace | [Freesound #501417](https://freesound.org/people/visionear/sounds/501417/) | visionear | CC0 1.0 (checked on page) | Wave, 48 kHz, 24 bit, 2304 kbps PCM | 11:54 | 4:00 |
| 21 | Fan | Hum | REPLACE | [Freesound #631405](https://freesound.org/people/Steve.Rufus/sounds/631405/) | Steve.Rufus | CC0 1.0 (checked on page) | Wave, 44.1 kHz, 16 bit, 1411 kbps PCM | 3:22 | 3:15 |
| 22 | Air Conditioner | Hum | NEW | [Freesound #482874](https://freesound.org/people/CantikFrantik/sounds/482874/) | CantikFrantik | CC0 1.0 (checked on page) | Wave, 48 kHz, 16 bit, 1536 kbps PCM | 5:02 | 4:00 |
| 23 | Airplane Cabin | Hum | NEW | [Freesound #868888](https://freesound.org/people/SMKoski02/sounds/868888/) | SMKoski02 | CC0 1.0 (checked on page) | Wave, 48 kHz, 24 bit, 2304 kbps PCM | 5:43 | 4:00 |
| 24 | Heartbeat | Calm | NEW (loop cut on a beat boundary) | [Freesound #369017](https://freesound.org/people/patobottos/sounds/369017/) | patobottos | CC0 1.0 (checked on page) | Wave, 48 kHz, 16 bit, 1536 kbps PCM | 2:05 | 2:00 |
| 25 | Womb | Calm | NEW | Mix: Heartbeat (Freesound #369017, CC0) slowed to about 70 bpm and low-passed, over low-passed brown noise "whoosh" | In-house mix of CC0 + generated | CC0 | From WAV 48 kHz 16 bit + generated | n/a | 2:00 |
| 26 | Singing Bowls | Calm | NEW | [Freesound #699447](https://freesound.org/people/zambolino/sounds/699447/) | zambolino | CC0 1.0 (checked on page) | Wave, 44.1 kHz, 16 bit, 1411 kbps PCM | 4:54 | 4:00 |
| 27 | Om Drone | Calm | NEW | Generated: 136.1 Hz fundamental + soft harmonics, slow 0.1 Hz swell, light reverb | In-house | CC0 (own work) | Generated 48 kHz float | n/a | 2:00 |
| 28 | Brahms Lullaby (music box) | Lullaby | NEW | Brahms Wiegenlied Op. 49 No. 4 (1868, public domain), MIDI typed in-house, rendered with FluidSynth + FluidR3_GM.sf2 Music Box | Brahms (PD); FluidR3_GM by Frank Wen | Melody PD; soundfont MIT licence (commercial OK) | Rendered 48 kHz 24 bit | n/a | 2:30 |
| 29 | Twinkle Twinkle (piano) | Lullaby | NEW | Trad. "Ah! vous dirai-je, maman" (PD), MIDI in-house, rendered with FluidSynth + FluidR3_GM.sf2 Acoustic Grand Piano | Trad. (PD); FluidR3_GM by Frank Wen | Melody PD; soundfont MIT licence (commercial OK, no in-app credit) | Rendered 48 kHz 24 bit | n/a | 2:30 |
| 30 | Schubert Lullaby (piano) | Lullaby | NEW | Schubert Wiegenlied D 498 (1816, PD), same FluidR3 piano render | Schubert (PD); FluidR3_GM | Melody PD; soundfont MIT licence (commercial OK, no in-app credit) | Rendered 48 kHz 24 bit | n/a | 2:30 |
| 31 | Ambient Pad | Lullaby | NEW | Slow I-vi-IV-V pad progression (own composition), FluidR3_GM Pad 2 (warm) + Pad 8 (sweep), heavy low-pass | In-house; FluidR3_GM | Own work CC0; soundfont MIT | Rendered 48 kHz 24 bit | n/a | 3:00 |
| 32 | Delta Waves (use headphones) | Binaural | NEW | Generated: 200 Hz left / 202 Hz right (2 Hz delta beat) under -18 dB pink noise; loop length a whole number of beat cycles | In-house | CC0 (own work) | Generated 48 kHz float | n/a | 2:00 |

**The 6 build 7 sounds that stay (none dropped):**

Figures below are from `audio-check.md` and `SOUND_LICENSES.md` / `process_all.json` (build 7 mastering of Freesound HQ previews, not lossless originals). On disk we only have the 66 s AAC files. Those cannot meet the lossless, 3 to 5 min standard by remastering alone, so a Freesound sign-in is required for all 6: either to download the same-id original, or to pick a new CC0 original.

| Sound | Build 7 (audio-check.md) | Why it failed the earlier drop proposal | Fix | Needs a new Freesound source? |
|---|---|---|---|---|
| Snow (`snow.m4a`, Freesound #551118) | -23.3 LUFS, LRA 1.8, -1.2 dBTP, seam 1.14, limiter 8.0 dB. Pre-master: integrated -25.7 LUFS, true peak +1.4 dBTP. Gain was only +5.4 dB because the source was already peaking. Window from 52 s, loop 66 s. | Snowfall is near silence. The current recording is too quiet and too peaky to reach -20 LUFS. The 8 dB limiter already exceeds the 6 dB cap, and the result is still -23.3 LUFS. The same recording, even as WAV/FLAC, cannot fix the loudness-to-peak ratio. | Re-source on Freesound: a denser, closer, longer snowfall or soft winter wind-through-snow CC0 WAV/FLAC, then master to -20 LUFS with at most 6 dB limiting, 3 to 5 min seamless loop. | **Yes. New source required.** Same id cannot hit the standard. |
| Cave (`cave.m4a`, Freesound #343742) | -25.1 LUFS, LRA 3.9, -1.3 dBTP, seam 0.51, limiter 8.0 dB. Pre-master: integrated -46.2 LUFS, true peak -17.7 dBTP. Gain +24.5 dB still left it at -25.1 LUFS after 8 dB limiting, and the noise floor showed. Window from 1 s, loop 66 s. | The current cave recording is extremely quiet. Boosting it to -20 LUFS would raise the noise floor further, and the limiter already exceeds the 6 dB cap. | Re-source on Freesound: a louder, cleaner cave or underground drip/ambiance original that can reach -20 LUFS without exposing a noisy floor. Same loop and limiter rules. | **Yes. New source required.** |
| Drip (`drip.m4a`, Freesound #506072) | -20.2 LUFS, LRA 2.0, -1.6 dBTP, seam 0.58, limiter 5.1 dB (within the 6 dB cap). Pre-master: integrated -23.9 LUFS, true peak 0.0 dBTP. Gain +3.9 dB. Window from 42 s, loop 66 s. | Sharp transients that are alerting, not calming. Loudness is already on target. | First pass: download the lossless original of #506072 after sign-in, soften the attacks (gentle transient control and a high-shelf cut), rebuild a seamless 3 to 5 min loop if the original is long enough, keep -20 LUFS and at most 6 dB limiting. If the drips still sound alerting, re-source a softer, more distant drip. | **First remaster of the same id (lossless original). Re-source only if the softened drip is still alerting.** The on-disk AAC is not enough. |
| Farm (`farm.m4a`, Freesound #488050) | -20.0 LUFS, LRA 4.7, -4.6 dBTP, seam 0.91, limiter 0 dB. Pre-master: integrated -29.4 LUFS, true peak -14.0 dBTP. Gain +9.4 dB. Window from 10 s, loop 66 s. | Loudness is fine. Animal calls in #488050 (`Ambience_Farm_Birds_02.wav`) are alerting and cannot be edited out cleanly. | Re-source on Freesound: a calm rural or barn-distance ambience with no close animal calls, lossless, 3 to 5 min loop, -20 LUFS. | **Yes. New source required.** |
| Grassland (`grassland.m4a`, Freesound #164656) | -20.2 LUFS, LRA 9.2, -2.5 dBTP, seam 0.63, limiter 0 dB, 3 s RMS sd 2.53 (unsteady). Pre-master: integrated -34.4 LUFS, true peak -16.7 dBTP. Gain +14.4 dB. Window from 107 s, so the preview is at least about 2:53. | Insect whine. Loudness is already on target, and there is peak headroom. | First pass: download the lossless original of #164656, try a narrow notch or dip on the whine, and build a 3 to 5 min loop if the original is long enough (the 107 s window start suggests it may be close). If the whine is the character of the recording and cannot be tamed, re-source a softer meadow or grassland without a prominent insect whine. | **First remaster of the same id (lossless original). Re-source if the whine remains.** The on-disk AAC is not enough. |
| Rain on Puddle (`rain_puddle.m4a`, Freesound #735468) | -21.1 LUFS, LRA 1.6, -1.3 dBTP, seam 1.19 (highest of the set, still below a click), limiter 6.6 dB (just over the 6 dB cap). Pre-master: integrated -28.6 LUFS, true peak -3.2 dBTP. Gain +8.6 dB. Window from 0 s, loop 66 s. | It overlaps Rain and Umbrella, which was a variety argument, not a technical fail. Samay wants it kept. Loudness is 1.1 LU short, and the limiter slightly overshoots the cap. | Remaster from the lossless original of #735468: try a different window or gentler gain so it hits -20 LUFS with at most 6 dB limiting, and a longer equal-power crossfade to bring the seam down. Keep a distinct puddle or splash character so it does not copy Rain or Umbrella. If the same recording still needs more than 6 dB of limiting, pick a slightly less peaky puddle source. | **Remaster of the same id (lossless original), with a new source only if the 6 dB cap still blocks -20 LUFS.** The on-disk AAC is not enough. |

**Freesound vs remaster, short list:**

- **New Freesound source required:** Snow, Cave, Farm.
- **Remaster from the current Freesound id, after downloading the lossless original:** Rain on Puddle; first pass also Drip and Grassland (re-source those two if the remaster does not fix the transients or the insect whine).
- **None of the 6 can be finished from the on-disk AAC files alone.** Every path needs the Freesound sign-in at https://freesound.org/home/login/ so originals can be downloaded.

**Replace (8):**

- Rain on Roof becomes Deep Rain on Roof.
- Rain on Window gets a new source.
- Thunder becomes Distant Thunder; the current one is a close storm.
- Ocean becomes Slow Ocean Waves.
- Creek: the current source is only 65 s.
- Forest becomes a quieter forest edge.
- Fireplace becomes a 12-minute 24-bit original.
- Fan: the new source is a steady box fan.

**Keep but re-master from the original file (13, including first-pass fixes):** Rain, Rain on Umbrella, Lake, Waterfall, Underwater, Wind, Wind & Leaves, Night (renamed Night Crickets), White, Pink and Brown Noise (regenerated, white noise softer), plus Rain on Puddle and first-pass Drip and Grassland from their current ids.

**Re-source (3, plus fallbacks):** Snow, Cave and Farm, and Drip or Grassland if the first remaster does not fix them.

**New (13):** Green Noise, Rain on Tent, Air Conditioner, Airplane Cabin, Heartbeat, Womb, Singing Bowls, Om Drone, 3 lullabies, Ambient Pad and Delta Waves.

**Total: 38 sounds** (the previous 32 plus the 6 that stay).

Notes:
- The new Fireplace (#501417) is a recording, but its long fade-in start is cut.
- Airplane Cabin (#868888) has only 4 downloads. It needs a listen for announcements or chimes before use; the fallback is #447825 (MP3, CC0).
- I avoided uploader "bassimat". Several of their recent CC0 uploads are titled "by GLORB" or "by Mantice", and some describe themselves as generative, so their origin is unclear.
- Wind (#760241) is a 3-channel original; it will be downmixed to stereo.
- Om Drone and Womb are partly generated and labelled honestly in SOUND_LICENSES.md. A real chanted Om with a clear commercial licence and length of at least 2 min wasn't found; the CC0 #250264 is 31 s.

## Lullaby rendering

- **Melodies:** Brahms *Wiegenlied* Op. 49 No. 4 (1868), Schubert *Wiegenlied* D 498 (1816) and trad. *Ah! vous dirai-je, maman* (Twinkle). All are public domain. MIDI is written by hand in-house with `mido`, not copied from any edition, so there are no arrangement rights. Tempo 60 to 66 bpm, soft velocities, 2 to 3 repeats per loop.
- **Renderer:** FluidSynth (LGPL tool; rendered audio is ours), 48 kHz 24 bit, light reverb, gentle low-pass.
- **Soundfonts (decided: FluidR3 only):**
  - **FluidR3_GM.sf2** by Frank Wen: **MIT licence**, commercial OK, no in-app credit needed. Used for the music box (GM 11), the piano lullabies (Acoustic Grand Piano), and pads (GM 89 and 96).
  - Salamander Grand Piano is not used.
  - Optional later, not for this build: Freesound #859607 "Sleepy Upright Piano Seamless Loop" (CC0, WAV 48 kHz 16 bit, 1:56).

## Size and encoding

- **Decided: 160 kbps is OK, and about 109 MB is OK** for the earlier 32-sound plan.
- The previous 32 sounds total about 91 min of loops. At AAC-LC 160 kbps stereo, 48 kHz, that is about 109 MB. Build 7 is 50.7 MB at 256 kbps with 66 s loops.
- **Keeping the 6 sounds adds loop time.** At 3 to 5 min each that is about +18 to +30 min, or about **130 to 145 MB** for all 38 sounds at 160 kbps. Using 3 min loops for those 6 keeps the total nearer 130 MB.
- 160 kbps stays the encoding for all. Starting from lossless originals, 160 kbps AAC is transparent for this material. Build 7's artefacts came from transcoding lossy previews, not from the AAC bitrate.
- Generated noise and binaural tones stay at 90 to 120 s, because noise has no recognisable pattern to repeat.
- If size must drop further after the 6 are added, move some 4-minute loops to 3 minutes: about -15 MB.
- Optional later: on-demand download for lullabies. Not for build 8.

## Code: what exists and effort

Checked on `lulla/sound-overhaul` @ 741b12b (`src/mixer.ts`, `App.tsx`).

- **(a) Mixing 2 or 3 sounds, each with its own volume: ALREADY EXISTS.** The mixer plays any number of sounds at once, and the Mix sheet has a per-sound volume bar and remove button. Build 8 work:
  - Cap at 3 sounds with a friendly message on the fourth.
  - Finer volume steps.
  - Save and restore the last mix.
  - Estimate: **1.5 h**.
- **(b) Sleep timer with fade-out: ALREADY EXISTS.** Options are No timer, 10, 15, 30 and 45 min, and 1, 2 and 3 h. Right now it fades over only the last 10 s, in 1 s steps. Build 8 work:
  - A smooth 30 to 60 s fade driven by the mixer's ramp ticker.
  - A 5 min option.
  - Show the remaining time on the lock screen title.
  - Estimate: **1 h**.
- **(c) Lock-screen pause where every sound fades together: NOT FIXED.** Today Now Playing is tied to the first real sound, so a remote pause stops that sound instantly while the others fade. The fix:
  - Register a tiny silent looping "control" player with the lock screen, so remote play, pause and toggle land on it.
  - The mixer fades every real sound together, and the lock screen title still shows the mix.
  - Also re-check the trial gate on remote play.
  - Estimate: **2 h**, including tests.
- **New categories and labels in the UI:** Hum, Calm, Lullaby and Binaural chips, plus the "use headphones" badge. Estimate: **1.5 h**.
- **Sound work:** downloading originals once Freesound sign-in exists, remastering and re-sourcing (including the 6 sounds that stay), mastering, rendering lullabies with FluidR3, generating noise and tones, licences and the file audio check. Estimate: **5 to 6.5 h** (the earlier 4 to 5 h plus the 6 fixes). Each source gets one listening pass for voices, alarms or clicks via spectrogram and RMS checks; no ears.
- **Build, TestFlight and report:** **1 h**.

**(d) Total: about 12 to 14 h of work**, in one single final build 8. There is no 8a or 8b split. The blocker is Freesound login access, not effort. Wall time after access is about one working day.

**Queue: after Twist 21 build 4.** When that work starts, Samay signs in to Freesound on the box browser at https://freesound.org/home/login/ (option A). After login, originals are downloaded from each sound's Freesound page `/download/` link.

## Decisions (Samay, 8:44 PM BDT / Asia/Dhaka on 2026-11-12, relayed by COO and Team Lead)

1. Freesound access: option A (Samay signs in on the box browser). Still needed when build 8 work starts. URL: https://freesound.org/home/login/
2. Do not drop Snow, Cave, Drip, Farm, Grassland or Rain on Puddle. Fix each by re-sourcing or remastering to lossless, a 3 to 5 min seamless loop, and -20 LUFS.
3. FluidR3 piano (MIT). Not Salamander.
4. 160 kbps, and about 109 MB for the 32-sound plan, is OK. The 6 kept sounds will raise the IPA size (about 130 to 145 MB unless those loops are held to 3 min).
5. One single final build 8. No 8a or 8b split. Queued after Twist 21 build 4.
