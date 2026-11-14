# Lulla build 8: iOS Simulator run, what it needs

Written 13 Nov 2026, about 12:50 AM BDT (Asia/Dhaka). **Nothing was triggered.** No workflow run was started for Lulla, and no Actions minutes were used.

## Repo

- `samayhuf-star/lulla`, **public** (`visibility: public`, `private: false`, checked with the GitHub API tonight). Default branch `main`.
- Workflow is on branch `lulla/build8` (not on `main` yet).

## Workflow

- Path: `.github/workflows/sim-qa.yml` (branch `lulla/build8`).
- Trigger: **`workflow_dispatch` only.** Pushing never starts it. Input `sounds` (default `snow,cave,drip,farm,grassland,rain_puddle`).
- Runner: `macos-latest`, timeout 60 min.
- Steps: boot an iPhone simulator (prefers iPhone 16 Pro Max) -> `npm ci` -> `expo prebuild --platform ios` -> `pod install` (Pods cached) -> `xcodebuild build` Release, `iphonesimulator`, `CODE_SIGNING_ALLOWED=NO` -> `simctl install` + `launch` -> home screenshot -> for each sound, `simctl openurl lulla://qa/play/<id>`, screenshot after 6 s and again 4 s later -> upload `/tmp/lulla-sim-qa/**` as artifact `lulla-sim-qa`.
- Proof that a sound is really playing: the build sets `EXPO_PUBLIC_LULLA_QA=1`, which turns on the QA deep links and a small overlay listing each playing sound and its playback position (from `player.currentTime`). The position in screenshot `-b` must be about 4 s later than in `-a`. Store/EAS builds never set that variable (a unit test checks `eas.json`).
- It cannot hear the audio, and the simulator has no lock screen remote commands, so the lock-screen fade still needs Samay's phone (TestFlight).

## Minutes and cost per run

Planning estimates for this app (Expo SDK 58, 7 native modules, no photo seeding). They are not measured, because no run has ever started.

| | Cold (no Pods cache) | Cached |
|---|---|---|
| Runner time | about 30 to 35 min | about 18 to 25 min |
| **Public repo (Lulla today)** | **$0** | **$0** |
| Private repo, billed rate ($0.062/min standard macOS) | about $1.86 to $2.17 | about $1.12 to $1.55 |
| Private repo, against the Free plan's included allowance | macOS minutes count 10x, so 30 to 35 min uses 300 to 350 of the 2,000 included minutes | 180 to 250 of 2,000 |

On a public repo, standard GitHub-hosted runners (including macOS) are free and do not draw from the allowance. Lulla is public, so a run costs $0. If the repo is ever made private, the Free plan covers about 6 to 10 runs a month.

## Secrets

**None.** A simulator build needs no signing, no Apple account, no `EXPO_TOKEN` and no App Store Connect key. Nothing is read from repo secrets.

## What Samay must do

1. **Clear the GitHub account billing lock** on `samayhuf-star`: github.com -> Settings -> Billing and plans, fix the payment problem shown there. Even public-repo jobs cannot get a runner while the account is locked.
2. Make the workflow dispatchable. GitHub only lists `workflow_dispatch` workflows that exist on the default branch. Either merge the build 8 PR into `main`, or let me add just `.github/workflows/sim-qa.yml` to `main`. Then run it from the Actions tab or with `gh workflow run sim-qa.yml --ref lulla/build8`.
3. Nothing else: Actions is enabled on the repo, and no paid features are needed.

## Current lock state

- **Still locked as of the last real attempt.** Klenzer's `iOS Simulator QA` run 43231997861 on 12 Nov 2026 at 7:55 PM BDT failed in 4 s, with 0 steps: "The job was not started because your account is locked due to a billing issue." The two earlier Klenzer runs (6:35 PM and 6:42 PM BDT) and Playsz run 43221222262 (6:48 PM BDT) failed the same way.
- GitHub Pages deployments on `app-legal` still succeed (latest 10:06 PM BDT). Pages builds are exempt from the lock, so they are not evidence that the lock is gone.
- Not re-tested tonight, because the instruction was not to trigger anything. The first dispatched run will show the state; if it is still locked, it fails in seconds and uses 0 minutes.
