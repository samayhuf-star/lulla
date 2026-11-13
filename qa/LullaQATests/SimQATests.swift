import XCTest
import StoreKitTest

/// Lulla simulator QA host. CI only, never part of a store build.
///
/// Starts a StoreKit test session from storekit/Lulla.storekit (prices and the 1-week free
/// trial), launches the app, then holds it open while the workflow's shell flow drives it
/// and takes screenshots with `simctl io`. The shell writes $SIM_QA_OUT/xcui-done when it
/// is finished.
///
/// Deep links are opened from this host (not by `simctl openurl`) so we can immediately
/// tap the iOS 18+ "Open in Lulla - Sleep Sounds?" SpringBoard confirmation:
/// `XCUIApplication(bundleIdentifier: "com.apple.springboard").buttons["Open"]`.
/// The shell drops the URL in $SIM_QA_OUT/xcui-url and waits for xcui-url-done.
final class SimQATests: XCTestCase {
    private var session: SKTestSession?

    private var outDir: URL {
        let path = ProcessInfo.processInfo.environment["SIM_QA_OUT"] ?? "/tmp/lulla-sim-qa"
        return URL(fileURLWithPath: path, isDirectory: true)
    }

    override func setUpWithError() throws {
        continueAfterFailure = true
        let candidates: [String] = [
            ProcessInfo.processInfo.environment["STOREKIT_CONFIG"],
            Bundle(for: SimQATests.self).path(forResource: "Lulla", ofType: "storekit"),
        ].compactMap { $0 }
        for path in candidates where FileManager.default.fileExists(atPath: path) {
            do {
                let s = try SKTestSession(contentsOf: URL(fileURLWithPath: path))
                s.resetToDefaultState()
                s.disableDialogs = true
                s.clearTransactions()
                session = s
                NSLog("[lulla-qa] SKTestSession from \(path)")
                break
            } catch {
                NSLog("[lulla-qa] SKTestSession failed for \(path): \(error)")
            }
        }
        if session == nil { NSLog("[lulla-qa] no StoreKit test session") }
    }

    func testHoldAppForShellFlow() throws {
        addUIInterruptionMonitor(withDescription: "Open in Lulla") { alert in
            let open = alert.buttons["Open"]
            if open.exists {
                NSLog("[lulla-qa] interruption monitor tapped Open")
                open.tap()
                return true
            }
            return false
        }
        let app = XCUIApplication()
        app.launchArguments += ["-AppleLanguages", "(en)", "-AppleLocale", "en_US"]
        app.launch()
        sleep(3)
        let fm = FileManager.default
        try? fm.createDirectory(at: outDir, withIntermediateDirectories: true)
        let note = "storekit=\(session != nil)\n"
        fm.createFile(atPath: outDir.appendingPathComponent("xcui-ready").path, contents: note.data(using: .utf8))
        NSLog("[lulla-qa] ready, \(note)")
        let done = outDir.appendingPathComponent("xcui-done").path
        let pending = outDir.appendingPathComponent("xcui-url").path
        let deadline = Date().addingTimeInterval(45 * 60)
        while !fm.fileExists(atPath: done) && Date() < deadline {
            if fm.fileExists(atPath: pending) {
                handlePendingURL(app: app)
                continue
            }
            confirmOpenInAppIfAsked(timeout: 0.2)
            RunLoop.current.run(until: Date().addingTimeInterval(0.1))
        }
        NSLog("[lulla-qa] shell flow finished: \(fm.fileExists(atPath: done))")
    }

    /// Open a QA link the same way Scanwise does: XCUIDevice.system.open, then tap
    /// SpringBoard's Open button. The shell waits on xcui-url-done before shooting.
    private func handlePendingURL(app: XCUIApplication) {
        let pending = outDir.appendingPathComponent("xcui-url")
        let raw = (try? String(contentsOf: pending, encoding: .utf8))?
            .trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        try? FileManager.default.removeItem(at: pending)
        guard let url = URL(string: raw), !raw.isEmpty else {
            writeURLDone("empty")
            return
        }
        NSLog("[lulla-qa] opening \(raw)")
        XCUIDevice.shared.system.open(url)
        Thread.sleep(forTimeInterval: 0.4)
        let tapped = confirmOpenInAppIfAsked(timeout: 4)
        _ = app.wait(for: .runningForeground, timeout: 8)
        writeURLDone(tapped ? "opened-tapped" : "opened-no-dialog")
        NSLog("[lulla-qa] open result tapped=\(tapped) url=\(raw)")
    }

    private func writeURLDone(_ status: String) {
        let done = outDir.appendingPathComponent("xcui-url-done")
        try? (status + "\n").data(using: .utf8)?.write(to: done)
    }

    /// The "Open in …?" sheet belongs to SpringBoard, so the interruption monitor may not
    /// see it while this test only polls. Tap Open directly when it shows.
    @discardableResult
    private func confirmOpenInAppIfAsked(timeout: TimeInterval) -> Bool {
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        let app = XCUIApplication()
        let deadline = Date().addingTimeInterval(timeout)
        repeat {
            for root in [springboard, app] {
                let button = root.buttons["Open"].firstMatch
                // waitForExistence refreshes the snapshot; do not require isHittable
                // (SpringBoard confirmations often report isHittable == false).
                let slice = max(0.05, min(0.4, deadline.timeIntervalSinceNow))
                if button.waitForExistence(timeout: slice) {
                    NSLog("[lulla-qa] tapped Open-in-app confirmation")
                    if button.isHittable {
                        button.tap()
                    } else {
                        button.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
                    }
                    return true
                }
                let alertButton = root.alerts.buttons["Open"].firstMatch
                if alertButton.exists {
                    NSLog("[lulla-qa] tapped Open-in-app alert")
                    alertButton.tap()
                    return true
                }
                let pred = NSPredicate(format: "label == 'Open' OR identifier == 'Open'")
                let anyOpen = root.descendants(matching: .any).matching(pred).firstMatch
                if anyOpen.exists {
                    NSLog("[lulla-qa] tapped Open descendant")
                    if anyOpen.isHittable { anyOpen.tap() }
                    else { anyOpen.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap() }
                    return true
                }
            }
        } while Date() < deadline
        return false
    }

    // MARK: - Purchase and Restore only (qa/sim-qa/flow-iap.sh)

    private var iapResults: [[String: Any]] = []

    private func iapShot(_ name: String) {
        let s = XCUIScreen.main.screenshot()
        try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)
        try? s.pngRepresentation.write(to: outDir.appendingPathComponent("\(name).png"))
        let a = XCTAttachment(screenshot: s)
        a.name = name
        a.lifetime = .keepAlways
        add(a)
    }

    private func iapRecord(_ step: Int, _ name: String, _ pass: Bool, _ detail: String) {
        iapResults.append(["step": step, "name": name, "pass": pass, "detail": detail])
        if let data = try? JSONSerialization.data(withJSONObject: ["steps": iapResults], options: [.prettyPrinted]) {
            try? data.write(to: outDir.appendingPathComponent("results.json"))
        }
        NSLog("[lulla-qa] step \(step) \(pass ? "PASS" : "FAIL") \(name): \(detail)")
    }

    private func labelContains(_ root: XCUIApplication, _ text: String) -> XCUIElement {
        root.descendants(matching: .any).matching(NSPredicate(format: "label CONTAINS %@", text)).firstMatch
    }

    private func tapElement(_ el: XCUIElement) {
        if el.isHittable { el.tap() } else { el.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap() }
    }

    /// The App Store sandbox sign-in prompt means the local StoreKit configuration did not attach.
    private func sandboxSignInShown() -> Bool {
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        for root in [springboard, XCUIApplication()] {
            if labelContains(root, "Sign in to Apple Account").exists { return true }
            if labelContains(root, "Sign In to Apple Account").exists { return true }
            if labelContains(root, "Sign in to the App Store").exists { return true }
        }
        return false
    }

    private func cancelSignIn() {
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        for root in [springboard, XCUIApplication()] {
            let b = root.buttons["Cancel"].firstMatch
            if b.exists { tapElement(b); Thread.sleep(forTimeInterval: 1); return }
        }
    }

    /// With disableDialogs the local StoreKit sheet should not show. If it does, confirm it.
    @discardableResult
    private func confirmLocalStoreSheet() -> Bool {
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        for root in [XCUIApplication(), springboard] {
            for label in ["Subscribe", "Purchase", "Buy", "Confirm", "Start Free Trial", "Try It Free"] {
                let b = root.buttons[label].firstMatch
                if b.exists && b.isHittable {
                    iapShot("22a-local-storekit-sheet")
                    NSLog("[lulla-qa] local StoreKit sheet: tapping \(label)")
                    b.tap()
                    Thread.sleep(forTimeInterval: 2)
                    return true
                }
            }
        }
        return false
    }

    private func openQA(_ path: String, app: XCUIApplication) {
        guard let url = URL(string: "lulla://qa/\(path)") else { return }
        XCUIDevice.shared.system.open(url)
        Thread.sleep(forTimeInterval: 0.4)
        confirmOpenInAppIfAsked(timeout: 4)
        _ = app.wait(for: .runningForeground, timeout: 8)
        Thread.sleep(forTimeInterval: 2)
    }

    private func startSession(_ tag: String) {
        let path = ProcessInfo.processInfo.environment["STOREKIT_CONFIG"]
            ?? Bundle(for: SimQATests.self).path(forResource: "Lulla", ofType: "storekit") ?? ""
        do {
            let s = try SKTestSession(contentsOf: URL(fileURLWithPath: path))
            s.resetToDefaultState()
            s.disableDialogs = true
            s.clearTransactions()
            session = s
            NSLog("[lulla-qa] SKTestSession (\(tag)) from \(path)")
        } catch {
            NSLog("[lulla-qa] SKTestSession (\(tag)) failed for \(path): \(error)")
        }
    }

    private func monthlyTransactionInfo() -> String {
        guard let session else { return "no SKTestSession" }
        let deadline = Date().addingTimeInterval(10)
        var txs: [SKTestTransaction] = []
        while Date() < deadline {
            txs = session.allTransactions()
            if txs.contains(where: { $0.productIdentifier == "lulla_premium_monthly" }) { break }
            Thread.sleep(forTimeInterval: 0.5)
        }
        guard let tx = txs.filter({ $0.productIdentifier == "lulla_premium_monthly" })
            .sorted(by: { $0.purchaseDate > $1.purchaseDate }).first else {
            return "no local monthly transaction (txs=\(txs.count))"
        }
        guard let exp = tx.expirationDate else { return "local tx lulla_premium_monthly, no expirationDate" }
        let days = exp.timeIntervalSince(tx.purchaseDate) / 86_400
        return "local tx lulla_premium_monthly expires in \(String(format: "%.1f", days))d"
    }

    /// Purchase (monthly, local StoreKit) and Restore with real taps. Shots 21 to 23.
    func testPurchaseAndRestore() throws {
        try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)
        let app = XCUIApplication()
        app.launchArguments += ["-AppleLanguages", "(en)", "-AppleLocale", "en_US"]
        var attempt = 1
        var purchased = false
        var purchaseDetail = ""
        while attempt <= 2 && !purchased {
            if attempt == 2 {
                NSLog("[lulla-qa] retry: new SKTestSession and relaunch")
                cancelSignIn()
                app.terminate()
                Thread.sleep(forTimeInterval: 3)
                startSession("retry")
                Thread.sleep(forTimeInterval: 3)
            }
            app.launch()
            Thread.sleep(forTimeInterval: 6)
            openQA("overlay/off", app: app)
            openQA("paywall", app: app)
            let monthly = labelContains(app, "$2.99/month")
            let yearly = labelContains(app, "$19.99/year")
            let pricesOK = monthly.waitForExistence(timeout: 40) && yearly.exists
            let trialOK = labelContains(app, "7 days free").exists
            iapShot(attempt == 1 ? "21-paywall" : "21-paywall-retry")
            iapRecord(21, "Paywall shows local StoreKit prices (attempt \(attempt))", pricesOK && trialOK,
                      "monthly $2.99=\(monthly.exists) yearly $19.99=\(yearly.exists) 7-day trial=\(trialOK) session=\(session != nil)")
            guard pricesOK else { purchaseDetail = "paywall prices missing"; attempt += 1; continue }

            tapElement(monthly)
            var sheet = false
            var signIn = false
            let closeBtn = app.buttons["Close"].firstMatch
            let deadline = Date().addingTimeInterval(40)
            while Date() < deadline {
                if sandboxSignInShown() { signIn = true; break }
                if confirmLocalStoreSheet() { sheet = true }
                if app.alerts.firstMatch.exists { break }
                if !labelContains(app, "$2.99/month").exists && !closeBtn.exists { break }
                Thread.sleep(forTimeInterval: 0.5)
            }
            if signIn {
                iapShot(attempt == 1 ? "22-purchase-FAIL-sandbox-signin" : "22-purchase-FAIL-sandbox-signin-retry")
                cancelSignIn()
                purchaseDetail = "attempt \(attempt): sandbox sign-in prompt, local StoreKit not attached"
                NSLog("[lulla-qa] \(purchaseDetail)")
                attempt += 1
                continue
            }
            if app.alerts.firstMatch.exists {
                let label = app.alerts.firstMatch.label
                iapShot("22-purchase-alert")
                purchaseDetail = "attempt \(attempt): app alert \(label)"
                app.alerts.firstMatch.buttons.firstMatch.tap()
                attempt += 1
                continue
            }
            let tx = monthlyTransactionInfo()
            Thread.sleep(forTimeInterval: 2)
            // Settings sheet says "Premium is active. Thank you." once the entitlement is on.
            let gear = app.buttons["Settings"].firstMatch
            if gear.waitForExistence(timeout: 8) { tapElement(gear) }
            let active = labelContains(app, "Premium is active").waitForExistence(timeout: 12)
            iapShot("22-purchase-success")
            purchased = active && tx.hasPrefix("local tx")
            purchaseDetail = "attempt \(attempt): localSheetShown=\(sheet) premiumActive=\(active); \(tx)"
            if !purchased { attempt += 1 }
        }
        iapRecord(22, "Monthly purchase through local StoreKit (no sandbox sign-in)", purchased, purchaseDetail)

        // Restore: real tap on Settings > Restore purchases.
        var restoreOK = false
        var restoreDetail = "skipped, purchase did not complete"
        if purchased {
            if !labelContains(app, "Restore purchases").exists {
                let gear = app.buttons["Settings"].firstMatch
                if gear.waitForExistence(timeout: 8) { tapElement(gear) }
            }
            let row = labelContains(app, "Restore purchases")
            if row.waitForExistence(timeout: 10) {
                tapElement(row)
                var signIn = false
                var alertLabel = ""
                let deadline = Date().addingTimeInterval(30)
                while Date() < deadline {
                    if sandboxSignInShown() { signIn = true; break }
                    if app.alerts.firstMatch.exists { alertLabel = app.alerts.firstMatch.label; break }
                    if !labelContains(app, "Restore purchases").exists { break }
                    Thread.sleep(forTimeInterval: 0.5)
                }
                if signIn {
                    iapShot("23-restore-FAIL-sandbox-signin")
                    cancelSignIn()
                    restoreDetail = "sandbox sign-in prompt on restore"
                } else if !alertLabel.isEmpty {
                    iapShot("23-restore-alert")
                    restoreDetail = "alert: \(alertLabel)"
                    app.alerts.firstMatch.buttons.firstMatch.tap()
                } else {
                    // Sheet closes on success; reopen Settings to show the restored state.
                    Thread.sleep(forTimeInterval: 2)
                    openQA("restore", app: app)
                    Thread.sleep(forTimeInterval: 6)
                    let gear = app.buttons["Settings"].firstMatch
                    if gear.waitForExistence(timeout: 8) { tapElement(gear) }
                    let active = labelContains(app, "Premium is active").waitForExistence(timeout: 12)
                    iapShot("23-restore-success")
                    restoreOK = active && !sandboxSignInShown()
                    restoreDetail = "settings closed after tap (no alert, no sign-in); premiumActive=\(active); \(monthlyTransactionInfo())"
                }
            } else {
                restoreDetail = "Restore purchases row not found"
                iapShot("23-restore-missing")
            }
        }
        iapRecord(23, "Restore purchases (Settings row)", restoreOK, restoreDetail)
    }
}
