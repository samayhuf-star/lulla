# Lulla sound files: file-level audio check

Date: 2026-11-12 (Asia/Dhaka). Branch `lulla/sound-overhaul`.

**QA status: NOT RUN.** These are file measurements only. No sound was played on a device or simulator.

Method: each `.m4a` was decoded with ffmpeg; codec, sample rate, channels, bitrate, duration from ffprobe. Loudness (integrated LUFS, LRA) and true peak (dBTP) from ffmpeg `ebur128=peak=true`, measured over three back-to-back copies so the loop seam is included. `seam` is the 10 ms average sample-to-sample change at the loop join divided by the median elsewhere: about 1 means no click (a click would show as 5 or more). `clip` counts decoded samples at or above 0.999 full scale. `3s sd` is the standard deviation of 3 s RMS in dB (steadiness).

Previous build 6 files for comparison: 22.0 s, mono, 64 kbps MP3, all identical length (synthetic).

| File | Codec | kHz | Ch | kbps | Dur s | Size KB | LUFS | LRA | dBTP | Seam | Clip | 3s sd | Limiter dB | Source |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| brown_noise.m4a | aac | 44.1 | 2 | 256 | 66.0 | 2076 | -20.1 | 0.2 | -7.6 | 0.64 | 0 | 0.07 | 0.0 | generated:brown |
| cave.m4a | aac | 44.1 | 2 | 261 | 66.0 | 2112 | -25.1 | 3.9 | -1.3 | 0.51 | 0 | 1.65 | 8.0 | Freesound #343742 |
| creek.m4a | aac | 44.1 | 2 | 226 | 61.06 | 1696 | -20.1 | 2.9 | -4.0 | 0.78 | 0 | 0.88 | 0.0 | Freesound #237328 |
| drip.m4a | aac | 44.1 | 2 | 305 | 66.0 | 2468 | -20.2 | 2.0 | -1.6 | 0.58 | 0 | 0.63 | 5.1 | Freesound #506072 |
| fan.m4a | aac | 44.1 | 2 | 268 | 66.0 | 2172 | -20.0 | 4.5 | -8.4 | 0.73 | 0 | 1.59 | 0.0 | Freesound #437342 |
| farm.m4a | aac | 44.1 | 2 | 232 | 66.0 | 1880 | -20.0 | 4.7 | -4.6 | 0.91 | 0 | 1.08 | 0.0 | Freesound #488050 |
| fire.m4a | aac | 44.1 | 2 | 274 | 66.0 | 2222 | -20.7 | 2.3 | -1.7 | 0.87 | 0 | 0.84 | 5.4 | Freesound #382616 |
| forest.m4a | aac | 44.1 | 2 | 228 | 66.0 | 1848 | -23.0 | 6.6 | -2.0 | 0.6 | 0 | 1.34 | 8.0 | Freesound #826326 |
| grassland.m4a | aac | 44.1 | 2 | 257 | 66.0 | 2083 | -20.2 | 9.2 | -2.5 | 0.63 | 0 | 2.53 | 0.0 | Freesound #164656 |
| lake.m4a | aac | 44.1 | 2 | 256 | 66.0 | 2079 | -20.1 | 4.2 | -5.3 | 0.67 | 0 | 1.45 | 0.0 | Freesound #523392 |
| night.m4a | aac | 44.1 | 2 | 257 | 66.0 | 2082 | -20.1 | 1.2 | -7.5 | 0.57 | 0 | 0.42 | 0.0 | Freesound #522299 |
| ocean.m4a | aac | 44.1 | 2 | 236 | 66.0 | 1916 | -20.1 | 6.1 | -1.6 | 0.97 | 0 | 1.54 | 3.2 | Freesound #549334 |
| pink_noise.m4a | aac | 44.1 | 2 | 256 | 66.0 | 2078 | -20.3 | 0.1 | -10.9 | 0.6 | 0 | 0.04 | 0.0 | generated:pink |
| rain.m4a | aac | 44.1 | 2 | 256 | 66.0 | 2076 | -20.3 | 0.8 | -4.0 | 0.52 | 0 | 0.22 | 0.0 | Freesound #527500 |
| rain_puddle.m4a | aac | 44.1 | 2 | 260 | 66.0 | 2107 | -21.1 | 1.6 | -1.3 | 1.19 | 0 | 0.53 | 6.6 | Freesound #735468 |
| rain_roof.m4a | aac | 44.1 | 2 | 263 | 66.0 | 2130 | -20.2 | 2.1 | -1.6 | 0.6 | 0 | 0.69 | 5.5 | Freesound #450360 |
| rain_umbrella.m4a | aac | 44.1 | 2 | 292 | 66.0 | 2362 | -20.3 | 3.1 | -1.2 | 0.29 | 0 | 0.95 | 4.7 | Freesound #593191 |
| rain_window.m4a | aac | 44.1 | 2 | 272 | 60.53 | 2022 | -20.1 | 3.5 | -1.6 | 1.16 | 0 | 0.9 | 2.7 | Freesound #243781 |
| snow.m4a | aac | 44.1 | 2 | 273 | 66.0 | 2215 | -23.3 | 1.8 | -1.2 | 1.14 | 0 | 0.55 | 8.0 | Freesound #551118 |
| thunder.m4a | aac | 44.1 | 2 | 259 | 66.0 | 2101 | -20.1 | 11.0 | -1.9 | 0.56 | 0 | 3.86 | 0.0 | Freesound #425174 |
| underwater.m4a | aac | 44.1 | 2 | 271 | 66.0 | 2195 | -20.0 | 2.4 | -4.9 | 0.73 | 0 | 0.88 | 0.0 | Freesound #482167 |
| waterfall.m4a | aac | 44.1 | 2 | 258 | 66.0 | 2094 | -20.3 | 0.5 | -1.5 | 0.65 | 0 | 0.18 | 2.1 | Freesound #650699 |
| white_noise.m4a | aac | 44.1 | 2 | 256 | 66.0 | 2077 | -20.3 | 0.0 | -14.5 | 0.6 | 0 | 0.01 | 0.0 | generated:white |
| wind.m4a | aac | 44.1 | 2 | 211 | 66.0 | 1714 | -20.0 | 7.5 | -4.9 | 0.61 | 0 | 2.57 | 0.0 | Freesound #760241 |
| wind_leaves.m4a | aac | 44.1 | 2 | 256 | 66.0 | 2076 | -20.2 | 5.5 | -4.2 | 0.58 | 0 | 1.44 | 0.0 | Freesound #150174 |

Total: 25 files, 50.7 MB.

## Summary

- All 25 files: AAC-LC, 44.1 kHz stereo, 60.5 to 66 s, zero clipped samples, true peak at or below -1.2 dBTP, no click at the loop seam (seam ratio 0.29 to 1.19).
- 22 recorded sounds are real CC0 field recordings from Freesound (links in SOUND_LICENSES.md). White, pink and brown noise are generated, because those sounds are mathematical signals by definition.
- Loudness: 22 files within -20 to -21.1 LUFS. Quieter on purpose, because their peaks could not be raised further without squashing: cave -25.1, snow -23.3, forest -23.0. Thunder keeps its natural dynamics (LRA 11).
- Bitrate: encoded at a 256 kbps target (320 kbps target where needed). Five low-complexity files still average under 256 kbps because the AAC encoder does not need the bits: wind 211, forest 228, creek 226, farm 232, ocean 236.
- Sources are Freesound HQ previews (OGG Vorbis about 190 to 330 kbps), not the original WAV/FLAC uploads, which need a signed-in Freesound account.
