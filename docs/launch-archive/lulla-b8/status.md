# Lulla build 8: status (13 Nov 2026, about 1:00 AM BDT)

Branch `lulla/build8` (stacked on `lulla/sound-overhaul` @ 741b12b), pushed. Commits: 719b719 (lock screen), 9ac4450 (sound pipeline), 6849fe6 (gitignore). Type check, lint and 22 tests pass. No EAS build. Nothing written to ASC.

## Done
- Lock screen: bound to a silent looping control player; a remote pause/play fades every sound together; remote play goes through the trial gate; sleep timer minutes in the lock screen title. Unit tests in `scripts/lock.test.ts`.
- Paywall perk now shows the real sound count (was hard-coded "25").
- Pipeline `tools/sound-pipeline/b8/`: `config.json` `loop_mode` = `full` (Samay 12:30 AM); `cap3` is one value or `--loop-mode cap3`. `master.py` (EQ, steadiest window, seamless 5 s equal-power loop, texture extension for short stochastic sources, -20 LUFS with at most 6 dB limiting, TP <= -1 dBTP, AAC 160 kbps 48 kHz, verify). `--backup` uses the backup original.
- Batch 1 remasters PASS (file level): Rain on Puddle -20.1 LUFS / -2.9 dBTP / 4:00 / seam 0.9; Drip -20.1 / -5.4 / 4:00 / 1.0; Grassland -20.2 / -1.3 / 3:20 / 0.57 (179 Hz buzz harmonics notched, >9 kHz whine cut). Files in `masters/`.
- Generated (PASS): brown, pink, green, white noise (1:30), Om drone, Delta waves (2:00), Brahms music box (2:11), Twinkle piano (2:19), Ambient pad (3:12), all FluidR3_GM (MIT).
- freesound-needed.md: Batch 2 (6 ids, first + backup for Snow, Cave, Farm) and Batch 3 (21 ids).
- ASSET_LICENSES.md (repo root, copy here).
- sim-run-requirements.md; `.github/workflows/sim-qa.yml` is dispatch-only (not triggered).

## Remaining before the build
- Master Batch 2 + Batch 3 once downloaded (about 25 to 40 min of machine time), listen-proxy checks, update ASSET_LICENSES.md.
- Womb (needs Heartbeat #369017) and Schubert D 498 render (melody being verified).
- Catalog + UI: 38 sounds, Hum / Calm / Lullaby / Binaural chips, "use headphones" badge; SOUND_LICENSES/test updates.
- ASC planned-changes file (listing, 6.9" shots, age rating, availability, review + IAP notes, copyright); PR draft sound-overhaul -> main.

## Update, 13 Nov 2026 about 1:00 AM BDT
- cec94a7: all 38 sounds in the catalog; Hum/Calm/Lullaby/Binaural filters; "Use headphones" badge on Delta Waves; Schubert D 498 (melody from the public-domain Mutopia typesetting) and Brahms (checked against the CC0 OpenScore edition, ending fixed) rendered with FluidR3; 13 final masters in assets; 25 pending in assets/sounds/PENDING.json; `npm run check:sounds` gate (fails until all masters are in); `ingest.py` copies passing masters, clears PENDING and logs licences.
- cfc659a: ASC plan (planned-asc-changes.md), not applied.
- app-legal 3d02114 / 053b432: privacy + terms effective date placeholder replaced; support page sound section rewritten.
- lulla main 3c38b3b: only `.github/workflows/sim-qa.yml` added (manual trigger). No run started.
- Tests 24/24, type check and lint green.
