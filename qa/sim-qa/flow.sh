#!/usr/bin/env bash
# Lulla build 8 flow for the public runner (AI-Samay/sim-qa-runner). SIM-RUN (simulator only, not device).
# Env from the runner: UDID, BUNDLE_ID, WORKSPACE, SCHEME, OUT, DERIVED_DATA.
# The app is launched by the LullaQATests UI test inside an SKTestSession (storekit/Lulla.storekit:
# monthly 2.99, yearly 19.99, 1-week free trials) and held open while this script drives it with
# lulla://qa/... deep links (QA build only) and takes screenshots with simctl.
set -uo pipefail
OUT="${OUT:-/tmp/sim-qa}"; mkdir -p "$OUT/launch" "$OUT/store69" "$OUT/store65"
SCHEME="${SCHEME:-Lulla}"
shot() { xcrun simctl io "$UDID" screenshot "$OUT/$1.png" >/dev/null 2>&1 && echo "shot $1" || echo "SHOT FAILED $1"; }
go() {
  # iOS 18+ shows "Open in Lulla - Sleep Sounds?" for simctl openurl. The StoreKit
  # UI-test host taps Open; wait at least 2 s so the tap and the link both land.
  local wait="${2:-3}"
  [ "$wait" -lt 2 ] && wait=2
  xcrun simctl openurl "$UDID" "lulla://qa/$1"
  sleep "$wait"
}
note() { echo "$(date -u +%H:%M:%S) $*" | tee -a "$OUT/flow-notes.txt"; }

RT=$(xcrun simctl list runtimes -j | python3 -c 'import json,sys; r=[x for x in json.load(sys.stdin)["runtimes"] if x["isAvailable"] and x["platform"]=="iOS"]; print(r[-1]["identifier"])')
TYPES=$(xcrun simctl list devicetypes -j | python3 -c 'import json,sys; print(" ".join(t["identifier"] for t in json.load(sys.stdin)["devicetypes"]))')
mkdev() { # label types... -> prints UDID of a new booted device
  local label=$1; shift
  for T in "$@"; do
    echo "$TYPES" | grep -q "SimDeviceType.$T\b" || continue
    local U; U=$(xcrun simctl create "QA $label $T" "com.apple.CoreSimulator.SimDeviceType.$T" "$RT" 2>/dev/null) || continue
    xcrun simctl boot "$U" >/dev/null 2>&1; xcrun simctl bootstatus "$U" -b >/dev/null 2>&1
    xcrun simctl status_bar "$U" override --time "9:41" --batteryState charged --batteryLevel 100 --cellularBars 4 --wifiBars 3 >/dev/null 2>&1 || true
    echo "$label device: $T on $RT" >> "$OUT/devices.txt"; echo "$U"; return 0
  done
  return 1
}
RUNNER_UDID="$UDID"
if U69=$(mkdev 6.9 iPhone-16-Pro-Max iPhone-17-Pro-Max); then
  xcrun simctl shutdown "$RUNNER_UDID" >/dev/null 2>&1 || true
  UDID="$U69"
else
  echo "no 6.9 inch device type; main flow stays on the runner device" >> "$OUT/devices.txt"
fi

APP=$(find "$DERIVED_DATA" -name '*.app' -path '*Release-iphonesimulator*' ! -name '*-Runner.app' ! -path '*.app/*' | head -n1)
note "app: $APP"
xcrun simctl install "$UDID" "$APP"
xcrun simctl privacy "$UDID" grant all "$BUNDLE_ID" >/dev/null 2>&1 || true

# 1. Launch through the StoreKit host; screenshot every second from launch (splash + first frames).
XCUI_PID=""
start_host() { # tag
  rm -f "$OUT/xcui-ready" "$OUT/xcui-done"
  cp storekit/Lulla.storekit /tmp/Lulla.storekit
  TEST_RUNNER_SIM_QA_OUT="$OUT" TEST_RUNNER_STOREKIT_CONFIG="/tmp/Lulla.storekit" \
  xcodebuild test-without-building -workspace "$WORKSPACE" -scheme "$SCHEME" -configuration Release \
    -destination "platform=iOS Simulator,id=$UDID" -derivedDataPath "$DERIVED_DATA" \
    -resultBundlePath "$OUT/host-$1.xcresult" -only-testing:LullaQATests/SimQATests/testHoldAppForShellFlow \
    > "$OUT/xcodebuild-test-$1.log" 2>&1 &
  XCUI_PID=$!
}
finish_host() { touch "$OUT/xcui-done"; [ -n "$XCUI_PID" ] && wait "$XCUI_PID" 2>/dev/null || true; XCUI_PID=""; }
trap finish_host EXIT
start_host main
STOREKIT=1
n=0
for i in $(seq 1 600); do
  if pgrep -f "$SCHEME.app/$SCHEME" >/dev/null 2>&1 && [ $n -lt 25 ]; then n=$((n+1)); shot "launch/l$(printf %02d $n)"; fi
  [ -f "$OUT/xcui-ready" ] && [ $n -ge 10 ] && break
  [ -f "$OUT/xcui-ready" ] && [ $n -eq 0 ] && break
  sleep 1
done
if [ -f "$OUT/xcui-ready" ]; then
  note "StoreKit host ready: $(cat "$OUT/xcui-ready")"
else
  STOREKIT=0
  note "StoreKit host did not start in 10 min; simctl launch fallback, paywall WITHOUT StoreKit prices"
  tail -n 80 "$OUT/xcodebuild-test-main.log"
  xcrun simctl launch "$UDID" "$BUNDLE_ID"; sleep 2
  for k in 1 2 3 4 5 6; do shot "launch/l-fallback-$k"; sleep 1; done
fi
echo "storekit_host=$STOREKIT" > "$OUT/storekit-note.txt"
sleep 3
shot 01-launch-settled

# Store pass (honest in-app UI, QA overlay hidden): hero, Frequencies, player, timer options, paywall.
store_pass() { # dir prefix
  local d=$1 p=$2
  go overlay/off 1; go stop 2; go cat/all 3
  shot "$d/${p}-1-home-frequencies-hero"
  go hero 3; shot "$d/${p}-2-frequencies"
  go cat/all 2; go tap/rain 2; go tap/ocean 5; shot "$d/${p}-3-player-mix"
  go timersheet 3; shot "$d/${p}-4-timer-options"
  go close 2; go stop 2
  go paywall 12; shot "$d/${p}-5-paywall"
  go close 3; go overlay/on 1
}
store_pass store69 s69

# 2. Home with the Frequencies hero card (nothing playing: no QA overlay). Two frames 2 s apart for the glow.
go stop 2; go cat/all 3
shot 02-home-hero-a; sleep 2; shot 02-home-hero-b
# 3. Frequencies category via the hero card.
go hero 3
shot 03-frequencies-category

# 4. Paywall with StoreKit prices and the trial line (fresh install, preview unused).
go cat/all 2
go paywall 12
shot 04-paywall-storekit-prices
go close 3

# 5. Free sound playing after the premium preview is used up.
go preview/used 2
shot 05-home-premium-badges
go tap/rain 6; shot 06-free-rain-playing-a; sleep 4; shot 06-free-rain-playing-b
# 6. Locked premium sound opens the paywall; X returns home with rain still playing.
go tap/snow 10; shot 07-locked-snow-paywall
go close 4; shot 08-home-after-x
# 7. Settings: Restore outside the paywall, then Sound credits.
go settings 4; shot 09-settings-restore-row
go credits 4; shot 10-sound-credits
go close 2

# 8. Timer sheet (2h, 3h, 4h, All night), a real 2 h plan (end and fade logged), All night.
go timersheet 3; shot 11-timer-options
go close 2
go timer/120 4; shot 12-timer-2h-planned
go timer/allnight 4; shot 13-timer-allnight

# 9. Accelerated timer: a 2 min timer on the same code path (fade starts at end - 60 s).
go timer/2 5; shot 14-timer2min-start
sleep 50; shot 15-timer2min-before-fade
sleep 35; shot 16-timer2min-fading
sleep 40; shot 17-timer2min-after-end
go timer/allnight 2

# 10. Loop wrap: 432 Hz Deep Sleep from 4 s before its loop point.
go wrap/freq_432 4
for i in 1 2 3 4 5 6 7 8; do shot "18-wrap-$i"; sleep 1; done

# 11. Background audio: send the app to the background (Settings app) while rain plays, then come back.
go stop 2; go tap/rain 5
note "background: start"
xcrun simctl launch "$UDID" com.apple.Preferences >/dev/null 2>&1; sleep 12
shot 19-background-settings-app
note "background: end"
go cat/all 4; shot 20-foreground-again

# 12. Test purchase (StoreKit test session, dialogs off) and Restore.
go stop 2
go buy/monthly 20; shot 21-purchase-result
go close 4; shot 22-home-after-purchase
go restore 12; go settings 4; shot 23-restore-after-purchase
go close 2

xcrun simctl spawn "$UDID" log show --last 45m --style compact --predicate 'process CONTAINS "Lulla"' > "$OUT/app-full.log" 2>&1 || true
grep -F '[QA]' "$OUT/app-full.log" > "$OUT/qa-events.log" || echo "no [QA] lines" > "$OUT/qa-events.log"
grep -E '\[lulla-iap\]|\[lulla-qa\]' "$OUT/app-full.log" > "$OUT/iap.log" || true
finish_host

# 13. 6.5 inch store shots: a second StoreKit host session on an iPhone 11 Pro Max class device.
MAIN_UDID="$UDID"
if U65=$(mkdev 6.5 iPhone-11-Pro-Max iPhone-XS-Max iPhone-14-Plus); then
  xcrun simctl shutdown "$MAIN_UDID" >/dev/null 2>&1 || true
  UDID="$U65"
  xcrun simctl install "$UDID" "$APP"
  start_host s65
  for i in $(seq 1 300); do [ -f "$OUT/xcui-ready" ] && break; sleep 2; done
  if [ -f "$OUT/xcui-ready" ]; then note "6.5 host ready"; sleep 5; store_pass store65 s65
  else note "6.5 host did not start; plain launch, paywall without StoreKit prices"; xcrun simctl launch "$UDID" "$BUNDLE_ID"; sleep 12; store_pass store65 s65-noStoreKit; fi
  finish_host
else
  note "no 6.5 inch device type; resizing the 6.9 inch store shots"
  for f in "$OUT"/store69/*.png; do [ -f "$f" ] && sips -z 2688 1242 "$f" --out "$OUT/store65/RESIZED-$(basename "$f")" >/dev/null; done
fi
ls -R "$OUT" | head -100 > "$OUT/files.txt"
echo "flow done"
