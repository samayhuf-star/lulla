# Lulla build 8: where it stands (13 Nov 2026, 2:07 AM BDT)

## Done
- All 38 sounds final in `lulla/build8` (fd3416a). `npm run check:sounds`: "38 sounds, 136.6 MB of audio. All build 8 sounds ready." PENDING list empty.
- Every recorded master: -20 LUFS (+/-0.5), true peak <= -1 dBTP, limiter <= 6 dB, seam ratio < 3. Results: `masters/master-results.json`, `masters/generate-results.json`.
- Snow 22606 (200 s), Cave 196713 (240 s), Farm 840052 (188 s) all passed with the FIRST choice. No backups used.
- Farm: a loud close low-frequency event (+10 dB, 100-125 Hz, 184-187 s; probably the river vessel in the description) is kept out of the loop (window starts at 190 s).
- Airplane 868888 content screen: no sustained tones (chimes), no speech-rate modulation (announcements), no transient events; level SD 0.73 dB. Clean. Screen data: `checks/screen.json` (automated spectral screen, nobody has listened by ear).
- Womb made from Heartbeat 369017: -20.2 LUFS, -1.5 dBTP, 119.9 s loop, seam 1.24.
- Peaky sources got gentle compression ahead of the limiter (rain_tent two-stage, rain_window, rain_umbrella, thunder, creek, waterfall, fire, air_conditioner, cave, farm).
- Licences: the only CC BY sound shipped is Farm 840052 (klankbeeld, CC BY 4.0). Credit is in ASSET_LICENSES.md and in app-legal lulla/support.html#sound-credits (commits 0d7d016, 2514506, LOCAL ONLY: the push to app-legal main was blocked by Auto-review, "Push to GitHub on main before billing is cleared and simulator tests pass").
- StoreKit test config `storekit/Lulla.storekit` (lulla_premium_yearly P1Y $41.99, lulla_premium_monthly P1M $4.99, one group) plus a test that it matches PRODUCT_IDS.
- QA-only `lulla://qa/paywall` deep link; the sim workflow now screenshots the paywall.
- typecheck clean, lint clean, tests 27/27 pass.

## Simulator run: NOT RUN (billing lock)
- Triggered once at 2:06 AM BDT: https://github.com/samayhuf-star/lulla/actions/runs/43296900071 (ref lulla/build8, sha fd3416a).
- Failed in 2 s, no runner: "The job was not started because your account is locked due to a billing issue." Not retried.
- No screenshots, so no per-sound result and no paywall prices.

## EAS: NOT STARTED
- Held for Klenzer build 27 (single EAS slot). Account had no build running at 1:4x AM BDT; remote iOS buildNumber is 7 (build 8 comes from autoIncrement).
- No submit, nothing touched in ASC.

## Commits on lulla/build8 this session
fcec954 masters + licences, 671770a StoreKit config, fd3416a QA paywall link. Earlier: 719b719, 9ac4450, 6849fe6, cec94a7, cfc659a.
