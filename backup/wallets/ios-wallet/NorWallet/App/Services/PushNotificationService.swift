import Foundation
import UserNotifications
import UIKit

@MainActor
class PushNotificationService: NSObject, ObservableObject {
    static let shared = PushNotificationService()

    @Published var deviceToken: String?
    @Published var authorizationStatus: UNAuthorizationStatus = .notDetermined
    @Published var isRegistered: Bool = false

    private let notificationCenter = UNUserNotificationCenter.current()

    private override init() {
        super.init()
        checkAuthorizationStatus()
    }

    // MARK: - Authorization

    func checkAuthorizationStatus() {
        Task {
            let settings = await notificationCenter.notificationSettings()
            await MainActor.run {
                self.authorizationStatus = settings.authorizationStatus
            }
        }
    }

    func requestAuthorization() async throws -> Bool {
        let granted = try await notificationCenter.requestAuthorization(options: [.alert, .sound, .badge])
        await MainActor.run {
            self.authorizationStatus = granted ? .authorized : .denied
        }
        return granted
    }

    // MARK: - Registration

    func registerForRemoteNotifications() {
        guard authorizationStatus == .authorized else {
            if SupabaseConfig.enableDebugLogging {
                print("⚠️ Push notifications not authorized")
            }
            return
        }

        UIApplication.shared.registerForRemoteNotifications()
        if SupabaseConfig.enableDebugLogging {
            print("✅ Registering for remote notifications...")
        }
    }

    func setDeviceToken(_ tokenData: Data) {
        let token = tokenData.map { String(format: "%02.2hhx", $0) }.joined()
        self.deviceToken = token

        if SupabaseConfig.enableDebugLogging {
            print("✅ APNs device token: \(token)")
        }

        // Update Supabase device record with token
        Task {
            await updateDeviceToken(token)
        }
    }

    func handleRegistrationError(_ error: Error) {
        if SupabaseConfig.enableDebugLogging {
            print("❌ Failed to register for remote notifications: \(error.localizedDescription)")
        }
    }

    // MARK: - Supabase Integration

    private func updateDeviceToken(_ token: String) async {
        do {
            guard let supabaseService = try? await SupabaseService.shared,
                  supabaseService.isAuthenticated else {
                if SupabaseConfig.enableDebugLogging {
                    print("⚠️ Not authenticated, skipping device token update")
                }
                return
            }

            // Update device record with APNs token
            let deviceName = await UIDevice.current.name
            let platform = "ios"

            _ = try await supabaseService.registerDevice(
                platform: platform,
                label: deviceName,
                pushToken: token
            )

            await MainActor.run {
                self.isRegistered = true
            }

            if SupabaseConfig.enableDebugLogging {
                print("✅ Device token registered with Supabase")
            }
        } catch {
            if SupabaseConfig.enableDebugLogging {
                print("❌ Failed to update device token: \(error.localizedDescription)")
            }
        }
    }

    // MARK: - Notification Handling

    func handleNotification(_ userInfo: [AnyHashable: Any]) async {
        if SupabaseConfig.enableDebugLogging {
            print("📬 Received push notification: \(userInfo)")
        }

        // Parse notification payload
        guard let type = userInfo["type"] as? String else {
            return
        }

        switch type {
        case "transaction_confirmed":
            await handleTransactionNotification(userInfo)
        case "account_activity":
            await handleAccountActivity(userInfo)
        case "security_alert":
            await handleSecurityAlert(userInfo)
        case "price_alert":
            await handlePriceAlert(userInfo)
        default:
            if SupabaseConfig.enableDebugLogging {
                print("⚠️ Unknown notification type: \(type)")
            }
        }
    }

    private func handleTransactionNotification(_ userInfo: [AnyHashable: Any]) async {
        guard let txHash = userInfo["tx_hash"] as? String,
              let chain = userInfo["chain"] as? String,
              let status = userInfo["status"] as? String else {
            return
        }

        if SupabaseConfig.enableDebugLogging {
            print("💰 Transaction \(status): \(txHash) on \(chain)")
        }

        // Trigger app refresh or local notification
        await scheduleLocalNotification(
            title: "Transaction \(status.capitalized)",
            body: "Your transaction on \(chain) has been \(status)",
            identifier: "tx-\(txHash)"
        )
    }

    private func handleAccountActivity(_ userInfo: [AnyHashable: Any]) async {
        guard let activity = userInfo["activity"] as? String else {
            return
        }

        await scheduleLocalNotification(
            title: "Account Activity",
            body: activity,
            identifier: "activity-\(UUID().uuidString)"
        )
    }

    private func handleSecurityAlert(_ userInfo: [AnyHashable: Any]) async {
        guard let alert = userInfo["alert"] as? String else {
            return
        }

        await scheduleLocalNotification(
            title: "Security Alert",
            body: alert,
            identifier: "security-\(UUID().uuidString)",
            sound: .defaultCritical
        )
    }

    private func handlePriceAlert(_ userInfo: [AnyHashable: Any]) async {
        guard let message = userInfo["message"] as? String else {
            return
        }

        await scheduleLocalNotification(
            title: "Price Alert",
            body: message,
            identifier: "price-\(UUID().uuidString)"
        )
    }

    // MARK: - Local Notifications

    func scheduleLocalNotification(
        title: String,
        body: String,
        identifier: String,
        sound: UNNotificationSound = .default,
        delay: TimeInterval = 1
    ) async {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = sound

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: delay, repeats: false)
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)

        do {
            try await notificationCenter.add(request)
            if SupabaseConfig.enableDebugLogging {
                print("✅ Local notification scheduled: \(title)")
            }
        } catch {
            if SupabaseConfig.enableDebugLogging {
                print("❌ Failed to schedule notification: \(error.localizedDescription)")
            }
        }
    }

    // MARK: - Badge Management

    func updateBadgeCount(_ count: Int) {
        UIApplication.shared.applicationIconBadgeNumber = count
    }

    func clearBadge() {
        updateBadgeCount(0)
    }
}

// MARK: - UNUserNotificationCenterDelegate

extension PushNotificationService: UNUserNotificationCenterDelegate {
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        // Show notification even when app is in foreground
        completionHandler([.banner, .sound, .badge])
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo

        Task {
            await handleNotification(userInfo)
            completionHandler()
        }
    }
}
