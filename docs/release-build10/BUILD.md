# Lulla 1.0 build 10

Build 10 is the TestFlight line (builds 8 and 9) plus the large-text fix. Do not run `eas build` or `eas submit` from this note. It only records the settings the binary needs.

## Where builds 8 and 9 came from

| Build | Branch | Commit | How it was uploaded |
| --- | --- | --- | --- |
| 7 | `lulla/sound-overhaul` | `741b12b` | EAS. Not on `main`. |
| 8 | `lulla/build8` | `36f0472ceeaa8881dde1eb69274aa087491cbf6f` | altool (`local-ios-build`), not EAS. ASC `af8eae64`. |
| 9 | `lulla/build9` | `1613938974e8dd83ba995fb8b1feb0bbaa84f7cd` | altool, not EAS. ASC `ff8dbd38`. One commit on top of build 8. Failed the Dynamic Type check. |
| AX candidate | `lulla/ax-layout` | `56daece6556504375271ea8afab38b301b40fb81` | Not uploaded. One commit on top of build 9. This branch starts there. |

`lulla/build9` is build 8 plus the chip-row commit. `lulla/ax-layout` is build 9 plus the follow-up that caps the header and hero. `release/1.0-build10` is that line, with the large-text fix on top.

## Version settings for the build 10 binary

User-facing version stays **1.0.0** (same as builds 8 and 9).

`app.json`:

- `expo.ios.buildNumber`: **`"10"`** (`CFBundleVersion`). Must be above 9.

`eas.json`:

- `cli.appVersionSource`: **`local`**
- `build.production.autoIncrement`: **`false`**

`eas build -p ios --profile production` then reads `10` from `app.json` and does not bump it.

Do not switch this profile back to `appVersionSource: "remote"` with `autoIncrement: true` before that build. The last EAS iOS build is 7 (`741b12b`). Builds 8 and 9 were uploaded with altool, so the EAS remote counter is still 7 unless someone has since run `eas build:version:set`. A remote auto-increment from 7 produces build **8**, which App Store Connect rejects as a duplicate.

Android `versionCode` is still `1`. Local version source applies to Android as well. Do not ship an Android production build from this profile if Play already has a higher versionCode.

After build 10 is on App Store Connect, the next iOS build needs `ios.buildNumber` of `"11"` or higher. To return to the remote counter after that upload:

```sh
eas build:version:set
```

Initialize iOS with `10` (the build just uploaded), then set `appVersionSource` back to `remote` and `autoIncrement` back to `true`. The following build is 11.
