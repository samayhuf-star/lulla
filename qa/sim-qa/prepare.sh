#!/usr/bin/env bash
# Lulla prepare step for the public runner (AI-Samay/sim-qa-runner). CI only, never EAS.
# Runs after expo prebuild + pod install, before the runner's Release simulator build.
#  - EXPO_PUBLIC_LULLA_QA=1 for the build step (QA deep links + overlay; store builds never set it).
#  - Adds the LullaQATests UI test host and wires storekit/Lulla.storekit into the shared scheme
#    (from 085c158). The runner then picks build-for-testing because the scheme has a TestableReference.
set -euo pipefail
OUT="${OUT:-/tmp/sim-qa}"; mkdir -p "$OUT"
echo "EXPO_PUBLIC_LULLA_QA=1" >> "$GITHUB_ENV"
export EXPO_PUBLIC_LULLA_QA=1
gem list -i xcodeproj >/dev/null 2>&1 || gem install xcodeproj --no-document --user-install
export PATH="$(ruby -e 'print Gem.user_dir')/bin:$PATH"
ruby qa/scripts/prepare-xcode-qa.rb | tee "$OUT/prepare.log"
grep -n "StoreKitConfigurationFileReference" -A1 ios/*.xcodeproj/xcshareddata/xcschemes/*.xcscheme | tee -a "$OUT/prepare.log"
grep -q TestableReference ios/*.xcodeproj/xcshareddata/xcschemes/*.xcscheme && echo "scheme has the UI test host" | tee -a "$OUT/prepare.log"
