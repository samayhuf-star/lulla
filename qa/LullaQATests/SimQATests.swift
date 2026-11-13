import XCTest
import StoreKitTest

/// Lulla simulator QA host. CI only, never part of a store build.
///
/// Starts a StoreKit test session from storekit/Lulla.storekit (prices and the 1-week free
/// trial), launches the app, then holds it open while the workflow's shell flow drives it with
/// lulla://qa/... deep links and takes screenshots with `simctl io`. The shell writes
/// $SIM_QA_OUT/xcui-done when it is finished.
///
/// On iOS 18+ `simctl openurl` shows an "Open in Lulla - Sleep Sounds?" confirmation.
/// This host taps Open as soon as it appears, so the deep links reach the app.
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
        let deadline = Date().addingTimeInterval(45 * 60)
        while !fm.fileExists(atPath: done) && Date() < deadline {
            confirmOpenInAppIfAsked(app: app)
            RunLoop.current.run(until: Date().addingTimeInterval(0.25))
        }
        NSLog("[lulla-qa] shell flow finished: \(fm.fileExists(atPath: done))")
    }

    /// The "Open in …?" sheet belongs to SpringBoard, so the interruption monitor may not
    /// see it while this test only polls. Tap Open directly when it shows.
    @discardableResult
    private func confirmOpenInAppIfAsked(app: XCUIApplication) -> Bool {
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        for root in [springboard, app] {
            let button = root.buttons["Open"]
            if button.exists && button.isHittable {
                NSLog("[lulla-qa] tapped Open-in-app confirmation")
                button.tap()
                return true
            }
            let alertButton = root.alerts.buttons["Open"]
            if alertButton.exists {
                NSLog("[lulla-qa] tapped Open-in-app alert")
                alertButton.tap()
                return true
            }
        }
        return false
    }
}
