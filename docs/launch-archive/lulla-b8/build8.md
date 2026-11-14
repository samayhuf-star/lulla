# Lulla build 8 (free local build) log
- 2026-11-13 20:45 IST: ASC builds before: max 7 (ccd5b466). eas.json production: autoIncrement only, no env; workflow sets no QA env.
- Dispatching local-ios-build.yml repo=samayhuf-star/lulla ref=36f0472ceeaa8881dde1eb69274aa087491cbf6f (lulla/build8) profile=production build_number=8 upload=true
- RESUME RULE: check `gh run list -R AI-Samay/sim-qa-runner -w local-ios-build.yml` and ASC builds for version 8 before dispatching again.
- 20:45 IST: run 43450741215 dispatched (build_number=8 override; remote EAS counter untouched)
- 21:08 IST: run 43450741215 SUCCESS (built + altool upload)
- 21:11 IST: ASC build 8 af8eae64-aa23-44cc-a542-6598e00150f6 VALID, usesNonExemptEncryption false
- 21:13 IST: What to Test set; build 8 attached to 1.0.0 (releaseType AFTER_APPROVAL, PREPARE_FOR_SUBMISSION, NOT submitted). Added to Team (Expo) + Family & Friends; Internal group has access to all builds (auto). internalBuildState IN_BETA_TESTING.
- Beta review for build 8 BLOCKED: 422 ANOTHER_BUILD_IN_REVIEW, build 7 (ccd5b466) beta review WAITING_FOR_REVIEW since 5:30 PM BDT. F&F waits. Not withdrawn (needs approval). App Review submissions on HOLD per Samay.
- Beta review contact updated to Samay Vashsht [phone redacted] samayhuf@gmail.com; beta localization privacy URL set.
