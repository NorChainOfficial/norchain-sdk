import SwiftUI

// MARK: - Info Components
struct InfoCard: View {
    let icon: String
    let title: String
    let value: String
    let subtitle: String?
    let gradientColors: [Color]
    let iconColor: Color
    @State private var isPressed = false
    
    init(
        icon: String,
        title: String,
        value: String,
        subtitle: String? = nil,
        gradientColors: [Color] = [hexColor("8B5CF6"), hexColor("7C3AED")],
        iconColor: Color = hexColor("8B5CF6")
    ) {
        self.icon = icon
        self.title = title
        self.value = value
        self.subtitle = subtitle
        self.gradientColors = gradientColors
        self.iconColor = iconColor
    }
    
    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                RoundedRectangle(cornerRadius: 14)
                    .fill(
                        LinearGradient(
                            colors: [
                                iconColor.opacity(0.25),
                                iconColor.opacity(0.15)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 56, height: 56)
                    .overlay(
                        RoundedRectangle(cornerRadius: 14)
                            .stroke(iconColor.opacity(0.3), lineWidth: 1)
                    )
                
                Image(systemName: icon)
                    .font(.system(size: 24, weight: .semibold))
                    .foregroundColor(iconColor)
            }
            
            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
                
                Text(value)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.white)
                
                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.system(size: 12, weight: .regular))
                        .foregroundColor(.white.opacity(0.5))
                }
            }
            
            Spacer()
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        colors: [
                            Color.white.opacity(isPressed ? 0.18 : 0.15),
                            Color.white.opacity(isPressed ? 0.12 : 0.08)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(
                            LinearGradient(
                                colors: [
                                    Color.white.opacity(0.25),
                                    Color.white.opacity(0.1)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1
                        )
                )
        )
        .shadow(color: Color.black.opacity(isPressed ? 0.15 : 0.25), radius: isPressed ? 12 : 16, y: isPressed ? 4 : 8)
        .scaleEffect(isPressed ? 0.97 : 1.0)
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isPressed)
    }
}

struct QuickStatsCard: View {
    let stats: [(icon: String, title: String, value: String, color: Color)]
    
    var body: some View {
        VStack(spacing: 0) {
            ForEach(Array(stats.enumerated()), id: \.offset) { index, stat in
                HStack(spacing: 16) {
                    Image(systemName: stat.icon)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(stat.color)
                        .frame(width: 32)
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(stat.title)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.white.opacity(0.7))
                        
                        Text(stat.value)
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                    }
                    
                    Spacer()
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                
                if index < stats.count - 1 {
                    Divider()
                        .background(Color.white.opacity(0.1))
                        .padding(.horizontal, 20)
                }
            }
        }
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
        .shadow(color: Color.black.opacity(0.2), radius: 16, y: 8)
    }
}

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

struct SettingsView: View {
    @ObservedObject var viewModel: WalletViewModel
    @StateObject private var settingsManager = SettingsManager.shared
    @State private var showingNetworkSwitcher = false
    @State private var showingSecuritySettings = false
    @State private var showingBackupReminder = false
    @State private var showingAccountDetails = false
    @State private var showingNotifications = false
    @State private var showingHelpSupport = false
    @State private var showingTerms = false
    @State private var showingPrivacy = false
    @State private var showingSupabaseTest = false
    @State private var copiedAddress = false
    @State private var showSuccessToast = false
    @State private var successMessage = ""
    @State private var biometricType: BiometricType = .none
    
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
                    // Header with enhanced styling
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Settings")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("Manage your wallet preferences")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.6))
                        }
                        
                        Spacer()
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 20)
                    
                    // Quick Stats Cards - Enhanced Information Display
                    VStack(spacing: 12) {
                        QuickStatsCard(stats: [
                            (icon: "wallet.pass.fill", title: "Total Balance", value: viewModel.totalBalance, color: hexColor("10B981")),
                            (icon: "chart.line.uptrend.xyaxis", title: "24h Change", value: viewModel.balanceChange, color: viewModel.balanceChange.hasPrefix("+") ? hexColor("10B981") : hexColor("EF4444")),
                            (icon: "number.circle.fill", title: "Transactions", value: "\(Int.random(in: 12...156))", color: hexColor("8B5CF6")),
                            (icon: "network", title: "Network", value: settingsManager.selectedChainName, color: hexColor("3B82F6"))
                        ])
                    }
                    .padding(.horizontal, 24)
                    
                    // Account Section with spacing and interactive features
                    SettingsSection(title: "Account") {
                        InteractiveSettingsRow(
                            icon: "person.fill",
                            title: "Account",
                            subtitle: formatAddress(viewModel.currentWallet?.accounts.first?.address ?? ""),
                            badge: viewModel.currentWallet != nil ? nil : "No Wallet",
                            badgeColor: nil,
                            hasArrow: true,
                            showCopy: true,
                            address: viewModel.currentWallet?.accounts.first?.address,
                            showStatus: false,
                            iconColor: hexColor("3B82F6"),
                            action: {
                                HapticFeedbackManager.shared.mediumImpact()
                                withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                    showingAccountDetails = true
                                }
                            }
                        )
                        
                        InteractiveSettingsRow(
                            icon: "arrow.triangle.2.circlepath",
                            title: "Backup Wallet",
                            subtitle: settingsManager.walletBackedUp ? "Backed up \(formatDate(settingsManager.lastBackupDate))" : "Recovery phrase not backed up",
                            badge: settingsManager.walletBackedUp ? "✓" : "⚠️",
                            badgeColor: settingsManager.walletBackedUp ? hexColor("10B981") : hexColor("F59E0B"),
                            hasArrow: true,
                            showCopy: false,
                            address: nil,
                            showStatus: false,
                            iconColor: hexColor("10B981"),
                            action: {
                                HapticFeedbackManager.shared.mediumImpact()
                                if settingsManager.walletBackedUp {
                                    showingSecuritySettings = true
                                } else {
                                    showingBackupReminder = true
                                }
                            }
                        )
                    }
                    
                    // Network Section with live status
                    SettingsSection(title: "Network") {
                        InteractiveSettingsRow(
                            icon: "network",
                            title: "Network",
                            subtitle: settingsManager.selectedChainName,
                            badge: "Connected",
                            badgeColor: hexColor("10B981"),
                            hasArrow: true,
                            showCopy: false,
                            address: nil,
                            showStatus: true,
                            iconColor: hexColor("8B5CF6"),
                            action: {
                                HapticFeedbackManager.shared.mediumImpact()
                                withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                    showingNetworkSwitcher = true
                                }
                            }
                        )
                    }
                    
                    // Security Section with status indicators
                    SettingsSection(title: "Security") {
                        InteractiveSettingsRow(
                            icon: biometricType == .faceID ? "faceid" : (biometricType == .touchID ? "touchid" : "lock.fill"),
                            title: "Security",
                            subtitle: getSecurityStatus(),
                            badge: settingsManager.biometricEnabled || settingsManager.pinEnabled ? "✓" : nil,
                            badgeColor: hexColor("10B981"),
                            hasArrow: true,
                            showCopy: false,
                            address: nil,
                            showStatus: false,
                            iconColor: hexColor("EF4444"),
                            action: {
                                HapticFeedbackManager.shared.mediumImpact()
                                withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                    showingSecuritySettings = true
                                }
                            }
                        )
                        
                        InteractiveSettingsRow(
                            icon: "bell.fill",
                            title: "Notifications",
                            subtitle: getNotificationStatus(),
                            badge: getNotificationBadge(),
                            badgeColor: hexColor("10B981"),
                            hasArrow: true,
                            showCopy: false,
                            address: nil,
                            showStatus: false,
                            iconColor: hexColor("F59E0B"),
                            action: {
                                HapticFeedbackManager.shared.mediumImpact()
                                withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                    showingNotifications = true
                                }
                            }
                        )
                    }
                    
                    // Support Section with interactive actions
                    SettingsSection(title: "Support") {
                        InteractiveSettingsRow(
                            icon: "questionmark.circle.fill",
                            title: "Help & Support",
                            subtitle: "FAQ, contact us, tutorials",
                            badge: nil,
                            badgeColor: nil,
                            hasArrow: true,
                            showCopy: false,
                            address: nil,
                            showStatus: false,
                            iconColor: hexColor("6366F1"),
                            action: {
                                HapticFeedbackManager.shared.mediumImpact()
                                withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                    showingHelpSupport = true
                                }
                            }
                        )
                        
                        InteractiveSettingsRow(
                            icon: "doc.plaintext.fill",
                            title: "Terms of Service",
                            subtitle: "View legal agreements",
                            badge: nil,
                            badgeColor: nil,
                            hasArrow: true,
                            showCopy: false,
                            address: nil,
                            showStatus: false,
                            iconColor: hexColor("8B5CF6"),
                            action: {
                                HapticFeedbackManager.shared.lightImpact()
                                openTermsOfService()
                            }
                        )
                        
                        InteractiveSettingsRow(
                            icon: "hand.raised.fill",
                            title: "Privacy Policy",
                            subtitle: "Data protection & privacy",
                            badge: nil,
                            badgeColor: nil,
                            hasArrow: true,
                            showCopy: false,
                            address: nil,
                            showStatus: false,
                            iconColor: hexColor("06B6D4"),
                            action: {
                                HapticFeedbackManager.shared.lightImpact()
                                openPrivacyPolicy()
                            }
                        )
                    }
                    
                    // Developer Section (for testing) - Only in DEBUG builds
                    if SupabaseConfig.enableTestView {
                        SettingsSection(title: "Developer") {
                            InteractiveSettingsRow(
                                icon: "server.rack",
                                title: "Supabase Test",
                                subtitle: "Test Supabase integration",
                                badge: nil,
                                badgeColor: nil,
                                hasArrow: true,
                                showCopy: false,
                                address: nil,
                                showStatus: false,
                                iconColor: hexColor("8B5CF6"),
                                action: {
                                    HapticFeedbackManager.shared.mediumImpact()
                                    showingSupabaseTest = true
                                }
                            )
                        }
                    }
                    
                    // Version Info with enhanced styling
                    VStack(spacing: 12) {
                        HStack(spacing: 8) {
                            Image(systemName: "checkmark.seal.fill")
                                .font(.system(size: 16))
                                .foregroundColor(hexColor("10B981").opacity(0.7))
                            
                            Text("Nor Wallet")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.white.opacity(0.7))
                        }
                        
                        Text("Version 1.0.0")
                            .font(.system(size: 13))
                            .foregroundColor(.white.opacity(0.5))
                    }
                    .padding(.vertical, 24)
                }
                .padding(.bottom, 40)
            }
            .overlay(alignment: .top) {
                GlobalToastOverlay()
            }
        }
        .sheet(isPresented: $showingNetworkSwitcher) {
            NetworkSwitcherView(viewModel: viewModel)
        }
        .sheet(isPresented: $showingSecuritySettings) {
            SecurityView(viewModel: viewModel)
        }
        .sheet(isPresented: $showingAccountDetails) {
            AccountDetailsView(viewModel: viewModel)
        }
        .sheet(isPresented: $showingNotifications) {
            NotificationsSettingsView()
        }
        .sheet(isPresented: $showingHelpSupport) {
            HelpSupportView()
        }
        .alert("Backup Required", isPresented: $showingBackupReminder) {
            Button("Backup Now") {
                HapticFeedbackManager.shared.mediumImpact()
                showingSecuritySettings = true
            }
            Button("Remind Me Later", role: .cancel) { }
        } message: {
            Text("For security, please backup your wallet recovery phrase. Without it, you cannot recover your wallet if you lose access to this device.")
        }
        .sheet(isPresented: $showingTerms) {
            TermsOfServiceView()
        }
        .sheet(isPresented: $showingPrivacy) {
            PrivacyPolicyView()
        }
        .sheet(isPresented: $showingSupabaseTest) {
            NavigationView {
                SupabaseTestView()
            }
        }
        .onAppear {
            detectBiometricType()
            loadSettings()
        }
    }
    
    // MARK: - Helper Functions
    
    private func formatAddress(_ address: String) -> String {
        if address.isEmpty { return "No account" }
        guard address.count > 10 else { return address }
        return "\(address.prefix(6))...\(address.suffix(4))"
    }
    
    private func formatDate(_ date: Date?) -> String {
        guard let date = date else { return "" }
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .full
        return formatter.localizedString(for: date, relativeTo: Date())
    }
    
    private func getSecurityStatus() -> String {
        if settingsManager.biometricEnabled {
            return biometricType == .faceID ? "Face ID enabled" : "Touch ID enabled"
        } else if settingsManager.pinEnabled {
            return "PIN protection enabled"
        }
        return "No protection"
    }
    
    private func getNotificationStatus() -> String {
        let enabledCount = [settingsManager.transactionsEnabled, settingsManager.securityEnabled, 
                           settingsManager.priceAlertsEnabled, settingsManager.dappsEnabled].filter { $0 }.count
        return "\(enabledCount) of 4 enabled"
    }
    
    private func getNotificationBadge() -> String? {
        let enabledCount = [settingsManager.transactionsEnabled, settingsManager.securityEnabled, 
                           settingsManager.priceAlertsEnabled, settingsManager.dappsEnabled].filter { $0 }.count
        return enabledCount > 0 ? "\(enabledCount)" : nil
    }
    
    private func detectBiometricType() {
        let (available, type) = settingsManager.checkBiometricAvailability()
        biometricType = type
        if !available {
            settingsManager.biometricEnabled = false
        }
    }
    
    private func loadSettings() {
        // Settings loaded automatically via @AppStorage
    }
    
    private func openTermsOfService() {
        showingTerms = true
    }
    
    private func openPrivacyPolicy() {
        showingPrivacy = true
    }
}

struct SettingsSection<Content: View>: View {
    let title: String
    let content: Content
    
    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title.uppercased())
                .font(.system(size: 13, weight: .bold, design: .rounded))
                .foregroundColor(.white.opacity(0.5))
                .tracking(0.5)
                .padding(.horizontal, 24)
            
            VStack(spacing: 12) {
                content
            }
            .padding(.horizontal, 24)
        }
    }
}

struct SettingsRow: View {
    let icon: String
    let title: String
    let subtitle: String
    let hasArrow: Bool
    let hasToggle: Bool
    let iconColor: Color?
    let action: () -> Void
    @State private var isPressed = false
    @State private var isToggled = false
    
    init(icon: String, title: String, subtitle: String, hasArrow: Bool = true, hasToggle: Bool = false, iconColor: Color? = nil, action: @escaping () -> Void) {
        self.icon = icon
        self.title = title
        self.subtitle = subtitle
        self.hasArrow = hasArrow
        self.hasToggle = hasToggle
        self.iconColor = iconColor
        self.action = action
    }
    
    var body: some View {
        Button(action: {
            HapticFeedbackManager.shared.lightImpact()
            
            withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                isPressed = false
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                action()
            }
        }) {
            HStack(spacing: 16) {
                // Enhanced Icon with gradient
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(
                            LinearGradient(
                                colors: [
                                    (iconColor ?? hexColor("8B5CF6")).opacity(0.2),
                                    (iconColor ?? hexColor("8B5CF6")).opacity(0.1)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 44, height: 44)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke((iconColor ?? hexColor("8B5CF6")).opacity(0.3), lineWidth: 1)
                        )
                    
                    Image(systemName: icon)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(iconColor ?? .white)
                }
                
                // Text content with better spacing
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                    
                    Text(subtitle)
                        .font(.system(size: 13, weight: .regular))
                        .foregroundColor(.white.opacity(0.6))
                }
                
                Spacer()
                
                // Enhanced Toggle or arrow
                if hasToggle {
                    Toggle("", isOn: $isToggled)
                        .tint(hexColor("8B5CF6"))
                        .scaleEffect(0.85)
                } else if hasArrow {
                    Image(systemName: "chevron.right")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white.opacity(0.4))
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .background(
                ZStack {
                    // Glass morphism effect
                    RoundedRectangle(cornerRadius: 16)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color.white.opacity(isPressed ? 0.2 : 0.15),
                                    Color.white.opacity(isPressed ? 0.12 : 0.08)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                    
                    // Subtle border
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(
                            LinearGradient(
                                colors: [
                                    Color.white.opacity(0.2),
                                    Color.white.opacity(0.05)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1
                        )
                }
            )
            .shadow(color: Color.black.opacity(isPressed ? 0.1 : 0.2), radius: isPressed ? 8 : 12, y: isPressed ? 2 : 4)
            .scaleEffect(isPressed ? 0.97 : 1.0)
        }
        .buttonStyle(PlainButtonStyle())
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    withAnimation(.spring(response: 0.25, dampingFraction: 0.7)) {
                        isPressed = true
                    }
                }
                .onEnded { _ in
                    withAnimation(.spring(response: 0.25, dampingFraction: 0.7)) {
                        isPressed = false
                    }
                }
        )
    }
}

#if DEBUG
#Preview {
    SettingsView(viewModel: WalletViewModel())
}
#endif