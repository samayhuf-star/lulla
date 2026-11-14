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
}
