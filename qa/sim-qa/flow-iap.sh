#!/usr/bin/env bash
# Lulla purchase-and-restore only flow (shots 21 to 23). SIM-RUN (simulator only, not device).
# Env from the runner: UDID, BUNDLE_ID, WORKSPACE, SCHEME, OUT, DERIVED_DATA.
# Runs on the runner's own booted simulator (the one build-for-testing targeted), like the
# Scanwise and Klenzer flows whose SKTestSession attaches. The earlier Lulla flow created fresh
# devices with simctl create, and there SKTestSession logged SKInternalErrorDomain Code=3 on every
# write, so purchases fell through to the App Store sandbox sign-in.
# The XCUITest SimQATests/testPurchaseAndRestore does real taps: paywall ($2.99/month, $19.99/year,
# 7-day trial), Monthly button, local StoreKit purchase (dialogs off; any sheet is confirmed),
# Settings shows Premium is active, then Settings > Restore purchases.
set -uo pipefail
OUT="${OUT:-/tmp/sim-qa}"; mkdir -p "$OUT"
SCHEME="${SCHEME:-LullaSleepSounds}"
note() { echo "$(date -u +%H:%M:%S) $*" | tee -a "$OUT/flow-notes.txt"; }

note "device: $(xcrun simctl list devices | grep "$UDID" | sed 's/^ *//')"
APP=$(find "$DERIVED_DATA" -name '*.app' -path '*Release-iphonesimulator*' ! -name '*-Runner.app' ! -path '*.app/*' | head -n1)
note "app: $APP"
xcrun simctl install "$UDID" "$APP"
xcrun simctl privacy "$UDID" grant all "$BUNDLE_ID" >/dev/null 2>&1 || true
# Prime the device's StoreKit daemon with one plain launch before the test session starts.
xcrun simctl launch "$UDID" "$BUNDLE_ID" >/dev/null 2>&1 || true
sleep 8
xcrun simctl terminate "$UDID" "$BUNDLE_ID" >/dev/null 2>&1 || true
sleep 2

mkdir -p /tmp/lulla-sk && cp storekit/Lulla.storekit /tmp/lulla-sk/Lulla.storekit
grep -q _developerTeamID /tmp/lulla-sk/Lulla.storekit && note "storekit copy still has a team id" || note "storekit copy: no team id"
START=$(date "+%Y-%m-%d %H:%M:%S")
set +e
TEST_RUNNER_SIM_QA_OUT="$OUT" TEST_RUNNER_STOREKIT_CONFIG="/tmp/lulla-sk/Lulla.storekit" \
xcodebuild test-without-building -workspace "$WORKSPACE" -scheme "$SCHEME" -configuration Release \
  -destination "platform=iOS Simulator,id=$UDID" -derivedDataPath "$DERIVED_DATA" \
  -resultBundlePath "$OUT/iap.xcresult" -only-testing:LullaQATests/SimQATests/testPurchaseAndRestore \
  > "$OUT/xcodebuild-test-iap.log" 2>&1
RC=$?
set -e
note "xcodebuild test exit: $RC"
tail -n 60 "$OUT/xcodebuild-test-iap.log"

xcrun simctl spawn "$UDID" log show --start "$START" --style compact \
  --predicate 'process CONTAINS "Lulla" OR process == "storekitd" OR process CONTAINS "StoreKit"' > "$OUT/app-full.log" 2>&1 || true
grep -E 'SKTestSession|SKInternalErrorDomain|\[lulla-qa\]|\[lulla-iap\]|\[QA\]' "$OUT/app-full.log" > "$OUT/iap.log" || true
grep -E 'SKInternalErrorDomain' "$OUT/xcodebuild-test-iap.log" >> "$OUT/iap.log" || true
if grep -q SKInternalErrorDomain "$OUT/iap.log"; then
  echo "storekit_session_errors=yes" > "$OUT/storekit-note.txt"
else
  echo "storekit_session_errors=no" > "$OUT/storekit-note.txt"
fi
mkdir -p "$OUT/attachments"
xcrun xcresulttool export attachments --path "$OUT/iap.xcresult" --output-path "$OUT/attachments" >/dev/null 2>&1 || true

python3 - "$OUT" "$RC" <<'PY'
import json, os, sys
out, rc = sys.argv[1], sys.argv[2]
try:
    steps = json.load(open(os.path.join(out, "results.json")))["steps"]
except Exception as e:
    steps = []
lines = ["# Lulla purchase and restore: SIM-RUN (simulator only, not device)", "",
         f"xcodebuild test exit: {rc}", "", open(os.path.join(out, "storekit-note.txt")).read().strip(), "",
         "| Step | Result | Detail |", "| --- | --- | --- |"]
for s in steps:
    lines.append(f"| {s['step']} {s['name']} | {'PASS' if s['pass'] else 'FAIL'} | {s['detail']} |")
open(os.path.join(out, "summary.md"), "w").write("\n".join(lines) + "\n")
print("\n".join(lines))
PY
ls -R "$OUT" | head -80 > "$OUT/files.txt"
echo "flow done"
