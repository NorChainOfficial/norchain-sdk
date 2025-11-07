import SwiftUI

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

struct AutoLockSettingsView: View {
    @ObservedObject var settingsManager: SettingsManager
    @Environment(\.dismiss) var dismiss
    
    let lockOptions = [1, 5, 15, 30, 60] // minutes
    
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
            
            ScrollView(showsIndicators: false) {
                VStack(spacing: 24) {
                    // Header with enhanced styling - matching SettingsView
                    HStack {
                        Button(action: { dismiss() }) {
                            Image(systemName: "xmark")
                                .font(.system(size: 20, weight: .semibold))
                                .foregroundColor(.white)
                                .frame(width: 44, height: 44)
                                .background(Circle().fill(Color.white.opacity(0.1)))
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .trailing, spacing: 4) {
                            Text("Auto-Lock")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("Configure wallet auto-lock settings")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.6))
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 20)
                    
                    // Auto-Lock Section - using SettingsSection style
                    SettingsSection(title: "Auto-Lock") {
                        SecurityCard(
                            icon: "timer",
                            title: "Auto-Lock",
                            subtitle: "Automatically lock wallet after inactivity",
                            color: hexColor("3B82F6"),
                            isToggle: true,
                            isEnabled: settingsManager.autoLockEnabled,
                            onToggle: { enabled in
                                HapticFeedbackManager.shared.lightImpact()
                                settingsManager.autoLockEnabled = enabled
                            }
                        )
                        
                        if settingsManager.autoLockEnabled {
                            // Time Options - using SecurityCard style
                            ForEach(lockOptions, id: \.self) { minutes in
                                Button(action: {
                                    HapticFeedbackManager.shared.selection()
                                    withAnimation(AnimationPresets.quickSpring) {
                                        settingsManager.autoLockMinutes = minutes
                                    }
                                    ToastManager.shared.showSuccess("Auto-lock updated")
                                }) {
                                    SecurityCard(
                                        icon: "clock.fill",
                                        title: formatTime(minutes),
                                        subtitle: settingsManager.autoLockMinutes == minutes ? "Current setting" : "Tap to select",
                                        color: settingsManager.autoLockMinutes == minutes ? hexColor("10B981") : hexColor("8B5CF6"),
                                        showChevron: settingsManager.autoLockMinutes == minutes
                                    )
                                }
                            }
                        }
                    }
                }
                .padding(.bottom, 40)
            }
        }
    }
    
    private func formatTime(_ minutes: Int) -> String {
        if minutes < 60 {
            return "\(minutes) minute\(minutes == 1 ? "" : "s")"
        } else {
            let hours = minutes / 60
            return "\(hours) hour\(hours == 1 ? "" : "s")"
        }
    }
}

