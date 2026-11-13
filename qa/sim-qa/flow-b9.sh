#!/usr/bin/env bash
# Lulla build 9 sim flow: home screen category chip row at default text size and at the largest
# accessibility text size, then the purchase-and-restore XCUITest (shots 21 to 23).
# SIM-RUN (simulator only, not device). Env from the runner: UDID, BUNDLE_ID, WORKSPACE, SCHEME, OUT, DERIVED_DATA.
# Runs on the runner's own booted simulator. Nothing is playing on a fresh launch, so the QA overlay is hidden.
set -uo pipefail
OUT="${OUT:-/tmp/sim-qa}"; mkdir -p "$OUT"
note() { echo "$(date -u +%H:%M:%S) $*" | tee -a "$OUT/flow-notes.txt"; }
shot() { xcrun simctl io "$UDID" screenshot "$OUT/$1.png" >/dev/null 2>&1 && note "shot $1" || note "SHOT FAILED $1"; }
relaunch() { # content size category
  xcrun simctl terminate "$UDID" "$BUNDLE_ID" >/dev/null 2>&1 || true
  xcrun simctl ui "$UDID" content_size "$1" && note "content_size set: $1" || note "content_size FAILED: $1"
  note "content_size now: $(xcrun simctl ui "$UDID" content_size 2>&1)"
  sleep 2
  xcrun simctl launch "$UDID" "$BUNDLE_ID" >/dev/null 2>&1 || note "launch failed"
  sleep 10
}

note "device: $(xcrun simctl list devices | grep "$UDID" | sed 's/^ *//')"
APP=$(find "$DERIVED_DATA" -name '*.app' -path '*Release-iphonesimulator*' ! -name '*-Runner.app' ! -path '*.app/*' | head -n1)
note "app: $APP"
xcrun simctl install "$UDID" "$APP"
xcrun simctl privacy "$UDID" grant all "$BUNDLE_ID" >/dev/null 2>&1 || true

# Chip row (All / Rain / Water / Nature / Warmth) under the Frequencies card.
relaunch large;                                  shot 31-chips-default
relaunch extra-extra-extra-large;                shot 33-chips-xxxl
relaunch accessibility-extra-extra-extra-large;  shot 32-chips-ax-xxxl
relaunch large;                                  shot 34-chips-default-again
xcrun simctl terminate "$UDID" "$BUNDLE_ID" >/dev/null 2>&1 || true
sleep 2

# Purchase and restore (same as flow-iap.sh).
SCHEME="${SCHEME:-LullaSleepSounds}" bash qa/sim-qa/flow-iap.sh
note "flow-b9 done"
