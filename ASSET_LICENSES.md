# Lulla build 8: asset licences

Every audio asset that ships in build 8 is listed here with its source, author and licence. Build 8 uses only CC0 1.0 or CC BY (never NC) recordings, own generated audio, and FluidR3_GM (MIT). Spend: $0.

CC BY sounds need the attribution shown in the "Attribution" column. It is also shown on the in-app/hosted credits page if any CC BY sound ships. CC0 sounds need no attribution; they are credited here anyway.

Original files are kept (not shipped) under `/home/box/shared/app-monitor/reports/lulla-b8/originals/`, named `<freesound id>__<author>__<file>`.

## Recorded sounds (Freesound originals, lossless)

| App sound | File | Freesound id | Source URL | Author | Licence | Attribution required | Original file | Downloaded |
|---|---|---|---|---|---|---|---|---|
| Rain on Puddle | `rain_puddle.m4a` | 735468 | https://freesound.org/s/735468/ | bbrownmuse | CC0 1.0 | No | `735468__bbrownmuse__rain-in-puddle.wav` (WAV 48 kHz 24 bit mono, 1:21) | 2026-11-13 00:32 BDT |
| Drip | `drip.m4a` | 506072 | https://freesound.org/s/506072/ | SpaceJoe | CC0 1.0 | No | `506072__spacejoe__water-drip-3.wav` (WAV 44.1 kHz 24 bit stereo, 1:53) | 2026-11-13 00:32 BDT |
| Grassland | `grassland.m4a` | 164656 | https://freesound.org/s/164656/ | DanGasior | CC0 1.0 | No | `164656__dangasior__meadow_insects_sunny_afternoon.wav` (WAV 48 kHz 24 bit stereo, 3:27) | 2026-11-13 00:32 BDT |

Pending download (see `reports/lulla-sounds/freesound-needed.md`, Batches 2 and 3): Snow, Cave, Farm (new picks) and the 21 other proposal sounds. Each row is added here when its original lands.

## Generated and rendered audio (own work)

| App sound | File | Source | Licence |
|---|---|---|---|
| Lock screen control (silent) | `assets/silence.m4a` | Digital silence, generated with ffmpeg `anullsrc` | Own work, CC0 |

| Brown Noise | `brown_noise.m4a` | Generated brown noise (1/f^2), independent L/R | Own work, CC0 |
| Pink Noise | `pink_noise.m4a` | Generated pink noise (1/f), independent L/R | Own work, CC0 |
| Green Noise | `green_noise.m4a` | Generated pink noise band-passed 200 Hz to 1.5 kHz, centred near 500 Hz | Own work, CC0 |
| White Noise | `white_noise.m4a` | Generated white noise, -6 dB shelf above 6 kHz | Own work, CC0 |
| Om Drone | `om_drone.m4a` | Generated 136.1 Hz drone with soft harmonics, 0.1 Hz swell, light echo | Own work, CC0 |
| Delta Waves | `delta_waves.m4a` | Generated binaural beat: 200 Hz left, 202 Hz right (2 Hz delta), pink noise bed at -18 dB | Own work, CC0 |
| Brahms Musicbox | `brahms_musicbox.m4a` | FluidR3_GM Music Box (GM 11) + soft piano bass, Brahms Op. 49 No. 4 (PD), MIDI written in-house, 66 bpm | Own work, CC0 |
| Twinkle Piano | `twinkle_piano.m4a` | FluidR3_GM Acoustic Grand Piano, trad. melody (PD), MIDI written in-house, 62 bpm | Own work, CC0 |
| Ambient Pad | `ambient_pad.m4a` | FluidR3_GM Pad 2 warm + Pad 8 sweep, own I-vi-IV-V progression, 40 bpm | Own work, CC0 |

Lullaby melodies: Brahms Wiegenlied Op. 49 No. 4 (1868) and trad. "Ah! vous dirai-je, maman" are public domain; the MIDI is written in-house in `tools/sound-pipeline/b8/generate.py` (no edition copied). Schubert D 498 is not rendered yet.

## Soundfont

| Asset | Author | Licence | Notes |
|---|---|---|---|
| FluidR3_GM.sf2 (Debian package `fluid-soundfont-gm` 3.1-6, sha256 `74594e8f4250680adf590507a306655a299935343583256f3b722c48a1bc1cb0`) | Frank Wen (2000-2002, 2008), Toby Smithe (2008) | MIT | Used only to render lullabies offline. The .sf2 is not shipped; rendered audio is ours. No in-app credit needed. |
