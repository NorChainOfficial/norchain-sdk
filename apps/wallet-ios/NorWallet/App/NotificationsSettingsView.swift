import SwiftUI
import UserNotifications
// Helper function for hex colors
private func hexColor(_ hex: String) -> Color {
    let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
    var int: UInt64 = 0
    Scanner(string: hex).scanHexInt64(&int)
    let r, g, b: UInt64
    switch hex.count {
    case 3: (r, g, b) = ((int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
    case 6: (r, g, b) = (int >> 16, int >> 8 & 0xFF, int & 0xFF)
    default: (r, g, b) = (0, 0, 0)
    }
    return Color(red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255)
}

struct NotificationsSettingsView: View {
    @StateObject private var settingsManager = SettingsManager.shared
    @Environment(\.dismiss) var dismiss
    @State private var showSoundSelection = false
    @State private var showDNDSettings = false
    @State private var showSuccessToast = false
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [
                    hexColor( "5B47ED"),
                    hexColor( "2D1B69"),
                    hexColor( "1A0F3D")
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            ScrollView(showsIndicators: false) {
                VStack(spacing: 24) {
                    // Header with enhanced styling - matching SettingsView
                    HStack {
                        Button(action: {
                            HapticFeedbackManager.shared.lightImpact()
                            withAnimation(AnimationPresets.smoothSpring) {
                                dismiss()
                            }
                        }) {
                            Image(systemName: "xmark")
                                .font(.system(size: 20, weight: .semibold))
                                .foregroundColor(.white)
                                .frame(width: 44, height: 44)
                                .background(Circle().fill(Color.white.opacity(0.1)))
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .trailing, spacing: 4) {
                            Text("Notifications")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("Manage notification preferences")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.6))
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 20)
                    
                    // Notification Preferences Section - using SettingsSection style
                    SettingsSection(title: "Notification Preferences") {
                        SecurityCard(
                            icon: "arrow.up.arrow.down",
                            title: "Transactions",
                            subtitle: "Sent, received, swapped",
                            color: hexColor("3B82F6"),
                            isToggle: true,
                            isEnabled: settingsManager.transactionsEnabled,
                            onToggle: { enabled in
                                settingsManager.transactionsEnabled = enabled
                            }
                        )
                        
                        SecurityCard(
                            icon: "lock.shield",
                            title: "Security",
                            subtitle: "Login attempts, suspicious activity",
                            color: hexColor("EF4444"),
                            isToggle: true,
                            isEnabled: settingsManager.securityEnabled,
                            onToggle: { enabled in
                                settingsManager.securityEnabled = enabled
                            }
                        )
                        
                        SecurityCard(
                            icon: "chart.line.uptrend.xyaxis",
                            title: "Price Alerts",
                            subtitle: "Price changes, market updates",
                            color: hexColor("10B981"),
                            isToggle: true,
                            isEnabled: settingsManager.priceAlertsEnabled,
                            onToggle: { enabled in
                                settingsManager.priceAlertsEnabled = enabled
                            }
                        )
                        
                        SecurityCard(
                            icon: "network",
                            title: "DApp Activity",
                            subtitle: "DApp interactions, approvals",
                            color: hexColor("8B5CF6"),
                            isToggle: true,
                            isEnabled: settingsManager.dappsEnabled,
                            onToggle: { enabled in
                                settingsManager.dappsEnabled = enabled
                            }
                        )
                    }
                    
                    // Settings Section - using SettingsSection style
                    SettingsSection(title: "Settings") {
                        Button(action: {
                            HapticFeedbackManager.shared.mediumImpact()
                            showSoundSelection = true
                        }) {
                            SecurityCard(
                                icon: "bell.badge.fill",
                                title: "Notification Sound",
                                subtitle: settingsManager.notificationSound.capitalized,
                                color: hexColor("F59E0B"),
                                showChevron: true
                            )
                        }
                        
                        Button(action: {
                            HapticFeedbackManager.shared.mediumImpact()
                            showDNDSettings = true
                        }) {
                            SecurityCard(
                                icon: "timer",
                                title: "Do Not Disturb",
                                subtitle: settingsManager.doNotDisturbEnabled ? "\(settingsManager.doNotDisturbStart) - \(settingsManager.doNotDisturbEnd)" : "Disabled",
                                color: hexColor("6366F1"),
                                showChevron: true
                            )
                        }
                        
                        Button(action: {
                            HapticFeedbackManager.shared.mediumImpact()
                            openSystemSettings()
                        }) {
                            SecurityCard(
                                icon: "gear",
                                title: "System Settings",
                                subtitle: "Manage in iOS Settings",
                                color: hexColor("8B5CF6"),
                                showChevron: true
                            )
                        }
                    }
                }
                .padding(.bottom, 40)
            }
            .overlay(alignment: .top) {
                GlobalToastOverlay()
            }
        }
        .sheet(isPresented: $showSoundSelection) {
            SoundSelectionSheet(settingsManager: settingsManager)
        }
        .sheet(isPresented: $showDNDSettings) {
            DNDSettingsSheet(settingsManager: settingsManager)
        }
        .overlay(alignment: .top) {
            if showSuccessToast {
                SuccessToast(message: "Settings saved!")
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .zIndex(1000)
            }
        }
    }
    
    func openSystemSettings() {
        if let url = URL(string: UIApplication.openSettingsURLString) {
            UIApplication.shared.open(url)
        }
    }
}

struct SoundSelectionSheet: View {
    @ObservedObject var settingsManager: SettingsManager
    @Environment(\.dismiss) var dismiss
    
    let sounds = ["Default", "Chime", "Bell", "Note", "Alert", "Silent"]
    
    var body: some View {
        ZStack {
            LinearGradient(
                gradient: Gradient(colors: [
                    hexColor("5B47ED"),
                    hexColor("2D1B69"),
                    hexColor("1A0F3D")
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("Notification Sound")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Button(action: {
                        HapticFeedbackManager.shared.lightImpact()
                        withAnimation(AnimationPresets.smoothSpring) {
                            dismiss()
                        }
                    }) {
                        Image(systemName: "xmark")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
                .padding(.horizontal, 24)
                .padding(.top, 8)
                .padding(.bottom, 4)
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 16) {
                        ForEach(sounds, id: \.self) { sound in
                            Button(action: {
                                HapticFeedbackManager.shared.lightImpact()
                                settingsManager.notificationSound = sound.lowercased()
                                dismiss()
                            }) {
                                SecurityCard(
                                    icon: sound == "Silent" ? "bell.slash.fill" : "speaker.wave.2.fill",
                                    title: sound,
                                    subtitle: settingsManager.notificationSound.lowercased() == sound.lowercased() ? "Current selection" : "Tap to select",
                                    color: settingsManager.notificationSound.lowercased() == sound.lowercased() ? hexColor("10B981") : hexColor("8B5CF6"),
                                    showChevron: settingsManager.notificationSound.lowercased() == sound.lowercased()
                                )
                            }
                            .padding(.horizontal, 24)
                        }
                    }
                    .padding(.bottom, 40)
                }
            }
        }
    }
}

struct DNDSettingsSheet: View {
    @ObservedObject var settingsManager: SettingsManager
    @Environment(\.dismiss) var dismiss
    @State private var startTime: Date
    @State private var endTime: Date
    
    init(settingsManager: SettingsManager) {
        self.settingsManager = settingsManager
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        
        let start = formatter.date(from: settingsManager.doNotDisturbStart) ?? formatter.date(from: "22:00")!
        let end = formatter.date(from: settingsManager.doNotDisturbEnd) ?? formatter.date(from: "08:00")!
        
        _startTime = State(initialValue: start)
        _endTime = State(initialValue: end)
    }
    
    var body: some View {
        ZStack {
            LinearGradient(
                gradient: Gradient(colors: [
                    hexColor("5B47ED"),
                    hexColor("2D1B69"),
                    hexColor("1A0F3D")
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 24) {
                // Header
                HStack {
                    Text("Do Not Disturb")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Button(action: {
                        HapticFeedbackManager.shared.lightImpact()
                        withAnimation(AnimationPresets.smoothSpring) {
                            dismiss()
                        }
                    }) {
                        Image(systemName: "xmark")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
                .padding(.horizontal, 24)
                .padding(.top, 8)
                .padding(.bottom, 4)
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 16) {
                        // Enable/Disable Toggle
                        SecurityCard(
                            icon: "timer",
                            title: "Do Not Disturb",
                            subtitle: "Quiet hours for notifications",
                            color: hexColor("6366F1"),
                            isToggle: true,
                            isEnabled: settingsManager.doNotDisturbEnabled,
                            onToggle: { enabled in
                                HapticFeedbackManager.shared.lightImpact()
                                settingsManager.doNotDisturbEnabled = enabled
                            }
                        )
                        .padding(.horizontal, 24)
                        
                        if settingsManager.doNotDisturbEnabled {
                            // Time Pickers
                            VStack(spacing: 16) {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Start Time")
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundColor(.white.opacity(0.7))
                                    
                                    DatePicker("", selection: $startTime, displayedComponents: .hourAndMinute)
                                        .datePickerStyle(.wheel)
                                        .labelsHidden()
                                        .accentColor(hexColor("8B5CF6"))
                                        .onChange(of: startTime) { newValue in
                                            let formatter = DateFormatter()
                                            formatter.dateFormat = "HH:mm"
                                            settingsManager.doNotDisturbStart = formatter.string(from: newValue)
                                        }
                                }
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("End Time")
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundColor(.white.opacity(0.7))
                                    
                                    DatePicker("", selection: $endTime, displayedComponents: .hourAndMinute)
                                        .datePickerStyle(.wheel)
                                        .labelsHidden()
                                        .accentColor(hexColor("8B5CF6"))
                                        .onChange(of: endTime) { newValue in
                                            let formatter = DateFormatter()
                                            formatter.dateFormat = "HH:mm"
                                            settingsManager.doNotDisturbEnd = formatter.string(from: newValue)
                                        }
                                }
                            }
                            .padding(20)
                            .background(
                                RoundedRectangle(cornerRadius: 20)
                                    .fill(
                                        LinearGradient(
                                            colors: [
                                                Color.white.opacity(0.15),
                                                Color.white.opacity(0.08)
                                            ],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 20)
                                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                                    )
                            )
                            .padding(.horizontal, 24)
                        }
                    }
                    .padding(.bottom, 40)
                }
            }
        }
    }
}

#if DEBUG
#Preview {
    NotificationsSettingsView()
}
#endif
