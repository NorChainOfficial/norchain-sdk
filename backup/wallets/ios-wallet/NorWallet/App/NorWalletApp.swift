import SwiftUI
import NorCore
import UserNotifications

@main
struct NorWalletApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.class) private var appDelegate

    init() {
        // Initialize Nor Core logger
        NorCore.initLogger(level: .info)
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

// MARK: - App Delegate for Push Notifications

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        // Set up push notification delegate
        UNUserNotificationCenter.current().delegate = PushNotificationService.shared

        // Request push notification authorization
        Task {
            do {
                let granted = try await PushNotificationService.shared.requestAuthorization()
                if granted {
                    await MainActor.run {
                        PushNotificationService.shared.registerForRemoteNotifications()
                    }
                }
            } catch {
                if SupabaseConfig.enableDebugLogging {
                    print("❌ Failed to request notification authorization: \(error.localizedDescription)")
                }
            }
        }

        return true
    }

    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        PushNotificationService.shared.setDeviceToken(deviceToken)
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        PushNotificationService.shared.handleRegistrationError(error)
    }

    func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable: Any],
        fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        Task {
            await PushNotificationService.shared.handleNotification(userInfo)
            completionHandler(.newData)
        }
    }
}

#if DEBUG
struct NorWalletApp_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
#endif
