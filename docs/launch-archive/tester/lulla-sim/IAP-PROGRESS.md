# Lulla IAP sim harness fix: progress
- 2026-11-13 18:5x BDT: TASK A done. Captioned sets: lulla-b8/store-shots/store69-captioned/, store65-captioned/ (5 each, exact sizes, RGB PNG). Script /workspace/lulla-captions/cap.py
- TASK B: in progress (investigating Klenzer/Scanwise harness)
- Root cause found in run 43415421100 logs: SKTestSession logged "Error saving configuration file: SKInternalErrorDomain Code=3" (also clearing overrides / deleting transactions) right at start, so the local config never attached and buy fell through to App Store sandbox sign-in. Same errors in run 43406249832. Scanwise/Klenzer (same harness code) show no such errors; differences: Lulla runs on simulators created with `simctl create` (fresh device) and Lulla.storekit carries _developerTeamID (runner builds unsigned).
- Harness branch: lulla/sim-qa-iap @ 5a9d5cc (off lulla/build8 36f0472; QA files only: qa/LullaQATests/SimQATests.swift testPurchaseAndRestore, qa/sim-qa/flow-iap.sh, qa/sim-qa/prepare-iap.sh). Pushed.
- Run dispatched 2026-11-13 18:50 BDT: 43428560402 (flow-iap.sh, prepare-iap.sh). Results to run-43428560402/
- 19:0x BDT: TASK A ASC upload done (parent scope change). Lulla 1.0.0 en-US loc 53e890c1: APP_IPHONE_67 set aa684d62 (5, COMPLETE, 1320x2868), APP_IPHONE_65 set 99c0d0f4 (5, COMPLETE, 1242x2688), order 1-5. Logs: lulla-b8/store-shots/asc-upload-log*.json
