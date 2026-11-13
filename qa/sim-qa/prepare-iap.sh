#!/usr/bin/env bash
# Lulla purchase-and-restore sim run: prepare step for AI-Samay/sim-qa-runner. CI only, never EAS.
# Same as prepare.sh, plus: on the CI checkout only (never committed), drop "_developerTeamID" from
# storekit/Lulla.storekit before it is wired into the scheme and the UI test bundle. The runner builds
# unsigned (no team), and the Scanwise/Klenzer configs that attach fine in the sim have no team id.
set -euo pipefail
OUT="${OUT:-/tmp/sim-qa}"; mkdir -p "$OUT"
python3 - <<'PY' | tee -a "$OUT/prepare.log"
import json
p = "storekit/Lulla.storekit"
d = json.load(open(p))
had = d.get("settings", {}).pop("_developerTeamID", None) is not None
json.dump(d, open(p, "w"), indent=2)
print(f"storekit: removed _developerTeamID on the CI checkout: {had}")
PY
bash qa/sim-qa/prepare.sh
