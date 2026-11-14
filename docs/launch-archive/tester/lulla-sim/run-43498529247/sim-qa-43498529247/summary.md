# Lulla purchase and restore: SIM-RUN (simulator only, not device)

xcodebuild test exit: 0

storekit_session_errors=no

| Step | Result | Detail |
| --- | --- | --- |
| 21 Paywall shows local StoreKit prices (attempt 1) | PASS | monthly $2.99=true yearly $19.99=true 7-day trial=true session=true |
| 22 Monthly purchase through local StoreKit (no sandbox sign-in) | PASS | attempt 1: localSheetShown=false premiumActive=true; local tx lulla_premium_monthly expires in 7.0d |
| 23 Restore purchases (Settings row) | PASS | settings closed after tap (no alert, no sign-in); premiumActive=true; local tx lulla_premium_monthly expires in 7.0d |
