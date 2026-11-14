# Lulla build 8 sim run: BLOCKED (no screenshots)

- Branch `lulla/build8`, head `12aa0c7` (sim not re-run since 9b1a901) (free tier + Frequencies + timer + flow).
- Run: https://github.com/samayhuf-star/lulla/actions/runs/43394819729, triggered 13 Nov 2026 2:38 PM BDT (UTC+6).
- Result: failure in 2 s, 0 steps, no runner. Annotation: "The job was not started because your account is locked due to a billing issue."
- Not retried, per the 2:29 PM instruction. Team Lead is setting up a separate public runner repo.
- Verdict: no PASS/FAIL possible. No screenshots were produced.

## What the flow captures once it runs (workflow file on lulla/build8)
00-home, <id>-a/-b for each default sound, zz-paywall (StoreKit prices),
f0-home-preview-used (Premium badges), f1-free-rain-playing-a/-b (free sound plays after the preview is used up),
f2-locked-snow-paywall (X, Unlock all sounds, Restore), f3-home-after-x-a/-b, f4-settings-restore,
h0-home-frequencies-hero, h1-after-hero-tap-frequencies, t0-timer-options (4 hours, All night), t1-timer-2h (overlay: start/fade/end ISO times),
t2-timer-allnight, w-wrap-1..8 (432 Hz Deep Sleep position across its loop point), app.log, qa-events.log.

## Offline evidence already available
- `seam-and-loudness-offline.json`: per-track LUFS, true peak, band split and seam ratio for the 5 new loops, measured on the master and on the decoded m4a (seam ratio about 1 = no click; 5 or more = click).

## Update 13 Nov 2026, 3:40 PM BDT (head 085c158, not run yet)
- New shot: f5-sound-credits (Settings > Sound credits).
- StoreKit on the paywall: simctl launch cannot load a .storekit file. The flow now builds for testing and starts a CI-only UI test (qa/LullaQATests/SimQATests.swift, same approach as Klenzer: SKTestSession from storekit/Lulla.storekit plus a StoreKitConfigurationFileReference in the shared scheme). The UI test launches the app and holds it while the shell flow drives deep links and takes screenshots. `storekit-note.txt` in the artifact says which path ran.
- Limitation: unproven until a run completes (no Actions run has ever started on this account). If build-for-testing or the host fails, the flow falls back to a plain build and simctl launch, and the paywall shots show no StoreKit prices or trial line. The 6.5 inch store step always uses simctl launch (home shots only, no paywall).
