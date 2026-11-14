# Lulla build 8: Freesound originals needed (signed-in download)

## Batch 1: remaster from the same id (lossless original)
| Sound | Freesound id | Page |
|---|---|---|
| Rain on Puddle | 735468 | https://freesound.org/s/735468/ |
| Drip | 506072 | https://freesound.org/s/506072/ |
| Grassland | 164656 | https://freesound.org/s/164656/ |

## Batch 2: new sources for Snow, Cave and Farm (first choice + backup)

Picked 13 Nov 2026, about 12:55 AM BDT (Asia/Dhaka), from Freesound's public search with filters: licence CC0 or CC BY only (no NC), type WAV/FLAC/AIFF, length 3 to 30 min. Licence, format and length were read from each public sound page. Please download **all six** (first choice and backup) so the mastering run can fall back without another round trip.

Caveat: the box shell cannot reach Freesound's preview CDN (cdn.freesound.org times out), so these were picked from page metadata (description, tags, recorder, length), not by listening. The mastering pipeline measures loudness, noise floor, transients and steadiness on the original, and the backup is used if the first choice fails.

| Sound | Choice | Freesound id | URL | Author | Licence | Format | Length | Why |
|---|---|---|---|---|---|---|---|---|
| Snow | First | 22606 | https://freesound.org/people/martypinso/sounds/22606/ | martypinso | CC0 1.0 | WAV 48 kHz 16 bit | 3:31 | Dense, steady snowstorm (snow gliding on snow, wind), Schoeps MS. Fixes build 7's near-silent, peaky snowfall; high band will be shelved down. 7,256 downloads. |
| Snow | Backup | 683347 | https://freesound.org/people/eqavox/sounds/683347/ | eqavox | CC0 1.0 | WAV 96 kHz 24 bit | 14:50 | Snow and sleet showers on a porch roof; long, dense. Author asks for a credit link (optional under CC0, logged anyway). |
| Cave | First | 196713 | https://freesound.org/people/Andy_Gardner/sounds/196713/ | Andy_Gardner | CC0 1.0 | WAV 96 kHz 16 bit | 5:11 | Sea cave on the Ayrshire coast: soft waves and drips with cave reverb. Loud enough to reach -20 LUFS without a noise floor; distinct from Drip. 5,210 downloads. |
| Cave | Backup | 131584 | https://freesound.org/people/voltae/sounds/131584/ | voltae | **CC BY 3.0** | AIFF 48 kHz 24 bit | 3:32 | Drops into a cave lake with the cave's room sound, Neumann RSM 191 + Sound Devices 722. Needs attribution: "cave_waterdrops.aif by voltae (freesound.org/s/131584), CC BY 3.0". |
| Farm | First | 840052 | https://freesound.org/people/klankbeeld/sounds/840052/ | klankbeeld | **CC BY 4.0** | FLAC 48 kHz 16 bit | 6:25 | Windless early Sunday morning on open polder farmland; birds, a distant river vessel; no animal calls listed. Needs attribution: "farmland at river-village Lage-Zwaluwe by klankbeeld (freesound.org/s/840052), CC BY 4.0". |
| Farm | Backup | 588216 | https://freesound.org/people/anttituo/sounds/588216/ | anttituo | **CC BY 4.0** | WAV 48 kHz 24 bit | 6:06 | Finnish countryside on a sunny day, MKH 418 + Sound Devices 833. Author notes some handling noise and close insects in places, so the steadiest window is used. Needs attribution: "Ambience_Finland_Countryside_20200814_LR by anttituo (freesound.org/s/588216), CC BY 4.0". |

If any CC BY sound ships, its attribution goes in ASSET_LICENSES.md and on the hosted support/credits page.

Batch 1 note: Rain on Puddle (1:21) and Drip (1:53) originals are shorter than 3 min. They were extended into 4 min non-repeating textures (random 8 to 20 s segments, equal-power joins, different L/R orders) and both pass -20 LUFS, -1 dBTP and the seam check. If Samay prefers a natural 3+ min take instead, say so and I will add longer backups.

## Batch 3: the rest of the build 8 proposal table (lossless originals, same ids as the proposal)

Licences were checked on each sound page when the proposal was written (2026-11-12). All are CC0 1.0, so no attribution is required (credited in ASSET_LICENSES.md anyway). Download the original file (the page's Download button), not the preview.

| # | App sound | Freesound id | URL | Author | Licence | Original format | Length |
|---|---|---|---|---|---|---|---|
| 5 | Rain | 527500 | https://freesound.org/people/timothyd4y/sounds/527500/ | timothyd4y | CC0 1.0 | Wave, 48 kHz, 24 bit, 2304 kbps PCM | 1:32 |
| 6 | Deep Rain on Roof | 406502 | https://freesound.org/people/kyles/sounds/406502/ | kyles | CC0 1.0 | Wave, 48 kHz, 24 bit, 2304 kbps PCM | 4:34 |
| 7 | Rain on Tent | 251233 | https://freesound.org/people/pulswelle/sounds/251233/ | pulswelle | CC0 1.0 | Wave, 44.1 kHz, 24 bit, 2117 kbps PCM | 4:12 |
| 8 | Rain on Window | 158690 | https://freesound.org/people/RutgerMuller/sounds/158690/ | RutgerMuller | CC0 1.0 | AIFF, 48 kHz, 24 bit, 2304 kbps PCM | 5:08 |
| 9 | Rain on Umbrella | 593191 | https://freesound.org/people/dannydandanshababaloo/sounds/593191/ | dannydandanshababaloo | CC0 1.0 | Wave, 48 kHz, 24 bit, 2304 kbps PCM | 2:20 |
| 10 | Distant Thunder | 352850 | https://freesound.org/people/morvei01/sounds/352850/ | morvei01 | CC0 1.0 | Wave, 48 kHz, 16 bit, 1536 kbps PCM | 4:08 |
| 11 | Slow Ocean Waves | 176617 | https://freesound.org/people/craiggroshek/sounds/176617/ | craiggroshek | CC0 1.0 | Flac, 44.1 kHz, 16 bit, 1411 kbps PCM (lossless) | 4:04 |
| 12 | Lake | 523392 | https://freesound.org/people/Anya_Media/sounds/523392/ | Anya_Media | CC0 1.0 | Wave, 48 kHz, 16 bit, 1536 kbps PCM | 2:06 |
| 13 | Creek | 580796 | https://freesound.org/people/jasonm911/sounds/580796/ | jasonm911 | CC0 1.0 | Wave, 44.1 kHz, 16 bit, 1411 kbps PCM | 4:01 |
| 14 | Waterfall | 650699 | https://freesound.org/people/datapopstar2/sounds/650699/ | datapopstar2 | CC0 1.0 | Wave, 48 kHz, 24 bit, 2304 kbps PCM | 2:01 |
| 15 | Underwater | 482167 | https://freesound.org/people/Tim_Verberne/sounds/482167/ | Tim_Verberne | CC0 1.0 | Wave, 44.1 kHz, 16 bit, 1411 kbps PCM | 2:00 |
| 16 | Wind | 760241 | https://freesound.org/people/jackstraton/sounds/760241/ | jackstraton | CC0 1.0 | Wave, 44.1 kHz, 24 bit, 2117 kbps PCM | 4:16 |
| 17 | Wind & Leaves | 150174 | https://freesound.org/people/deleted_user_229898/sounds/150174/ | deleted_user_229898 | CC0 1.0 | Flac, 44.1 kHz, 16 bit, 1411 kbps PCM (lossless) | 2:00 |
| 18 | Forest | 856018 | https://freesound.org/people/newlocknew/sounds/856018/ | newlocknew | CC0 1.0 | Wave, 48 kHz, 16 bit, 1536 kbps PCM | 6:06 |
| 19 | Night Crickets | 522299 | https://freesound.org/people/Defelozedd94/sounds/522299/ | Defelozedd94 | CC0 1.0 | Wave, 48 kHz, 16 bit, 1536 kbps PCM | 3:42 |
| 20 | Crackling Fireplace | 501417 | https://freesound.org/people/visionear/sounds/501417/ | visionear | CC0 1.0 | Wave, 48 kHz, 24 bit, 2304 kbps PCM | 11:54 |
| 21 | Fan | 631405 | https://freesound.org/people/Steve.Rufus/sounds/631405/ | Steve.Rufus | CC0 1.0 | Wave, 44.1 kHz, 16 bit, 1411 kbps PCM | 3:22 |
| 22 | Air Conditioner | 482874 | https://freesound.org/people/CantikFrantik/sounds/482874/ | CantikFrantik | CC0 1.0 | Wave, 48 kHz, 16 bit, 1536 kbps PCM | 5:02 |
| 23 | Airplane Cabin | 868888 | https://freesound.org/people/SMKoski02/sounds/868888/ | SMKoski02 | CC0 1.0 | Wave, 48 kHz, 24 bit, 2304 kbps PCM | 5:43 |
| 24 | Heartbeat | 369017 | https://freesound.org/people/patobottos/sounds/369017/ | patobottos | CC0 1.0 | Wave, 48 kHz, 16 bit, 1536 kbps PCM | 2:05 |
| 26 | Singing Bowls | 699447 | https://freesound.org/people/zambolino/sounds/699447/ | zambolino | CC0 1.0 | Wave, 44.1 kHz, 16 bit, 1411 kbps PCM | 4:54 |

Notes:
- Womb (#25) is an in-house mix that reuses Heartbeat #369017, so no extra download.
- Airplane Cabin #868888 needs a listen for announcements or chimes. Optional fallback #447825 (https://freesound.org/s/447825/, CC0) is MP3 only, so download it only if #868888 fails.
- Generated sounds need no download: Brown, Pink, Green and White Noise, Om Drone, Delta Waves, and the FluidR3 lullabies (Brahms music box, Twinkle piano, Schubert piano, Ambient Pad).
- Batch 3 total: 21 files.
