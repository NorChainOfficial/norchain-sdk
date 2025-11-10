import SwiftUI
import LocalAuthentication

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
import NorCore

struct AccountDetailsView: View {
    @ObservedObject var viewModel: WalletViewModel
    @StateObject private var settingsManager = SettingsManager.shared
    @Environment(\.dismiss) var dismiss
    @State private var showPrivateKey = false
    @State private var showRenameSheet = false
    @State private var showAddAccount = false
    @State private var showDeleteConfirmation = false
    @State private var showCopiedToast = false
    @State private var newAccountName = ""
    
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
                            Text("Account")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("Manage your account details")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.6))
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 20)
                    // Account Card with enhanced interactivity
                    if let wallet = viewModel.currentWallet, let account = wallet.accounts.first {
                        AccountCard(account: account, showCopiedToast: $showCopiedToast)
                            .padding(.horizontal, 24)
                        
                        // Account Stats Cards - using QuickStatsCard style
                        QuickStatsCard(stats: [
                            (icon: "arrow.up.arrow.down", title: "Transactions", value: "\(Int.random(in: 45...234))", color: hexColor("8B5CF6")),
                            (icon: "clock.fill", title: "Last Activity", value: "2h ago", color: hexColor("10B981"))
                        ])
                        .padding(.horizontal, 24)
                    }
                    
                    // Account Actions Section - using SettingsSection style
                    SettingsSection(title: "Account Actions") {
                        Button(action: {
                            HapticFeedbackManager.shared.mediumImpact()
                            authenticateAndShowPrivateKey()
                        }) {
                            SecurityCard(
                                icon: "square.and.arrow.up",
                                title: "Export Private Key",
                                subtitle: "View private key for this account",
                                color: hexColor("EF4444"),
                                showChevron: true
                            )
                        }
                        .padding(.horizontal, 24)
                        
                        Button(action: {
                            HapticFeedbackManager.shared.mediumImpact()
                            if let account = viewModel.currentWallet?.accounts.first {
                                newAccountName = settingsManager.getAccountName(for: account.address) ?? "Main Account"
                            }
                            withAnimation(AnimationPresets.smoothSpring) {
                                showRenameSheet = true
                            }
                        }) {
                            SecurityCard(
                                icon: "pencil",
                                title: "Rename Account",
                                subtitle: settingsManager.getAccountName(for: viewModel.currentWallet?.accounts.first?.address ?? "") ?? "Main Account",
                                color: hexColor("3B82F6"),
                                showChevron: true
                            )
                        }
                        .padding(.horizontal, 24)
                        
                        Button(action: {
                            HapticFeedbackManager.shared.mediumImpact()
                            withAnimation(AnimationPresets.smoothSpring) {
                                showAddAccount = true
                            }
                        }) {
                            SecurityCard(
                                icon: "plus.circle",
                                title: "Add Account",
                                subtitle: "Create a new account",
                                color: hexColor("10B981"),
                                showChevron: true
                            )
                        }
                    }
                    
                    // Danger Zone Section - using SettingsSection style
                    SettingsSection(title: "Danger Zone") {
                        Button(action: {
                            HapticFeedbackManager.shared.heavyImpact()
                            withAnimation(AnimationPresets.quickSpring) {
                                showDeleteConfirmation = true
                            }
                        }) {
                            SecurityCard(
                                icon: "trash",
                                title: "Delete Account",
                                subtitle: "Remove this account from wallet",
                                color: hexColor("EF4444"),
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
        .sheet(isPresented: $showPrivateKey) {
            PrivateKeyView(viewModel: viewModel)
        }
        .sheet(isPresented: $showRenameSheet) {
            RenameAccountSheet(
                accountName: $newAccountName,
                accountAddress: viewModel.currentWallet?.accounts.first?.address ?? "",
                onSave: { name in
                    if let address = viewModel.currentWallet?.accounts.first?.address {
                        settingsManager.setAccountName(name, for: address)
                        HapticFeedbackManager.shared.success()
                    }
                }
            )
        }
        .sheet(isPresented: $showAddAccount) {
            AddAccountSheet(viewModel: viewModel)
        }
        .alert("Delete Account", isPresented: $showDeleteConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                deleteAccount()
            }
        } message: {
            Text("Are you sure you want to delete this account? This action cannot be undone. Make sure you have backed up your private key or recovery phrase.")
        }
        .overlay(alignment: .top) {
            if showCopiedToast {
                SuccessToast(message: "Address copied!")
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .zIndex(1000)
                    .onAppear {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            withAnimation {
                                showCopiedToast = false
                            }
                        }
                    }
            }
        }
    }
    
    func authenticateAndShowPrivateKey() {
        let context = LAContext()
        var error: NSError?
        
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            let reason = "Authenticate to view your private key"
            context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, _ in
                DispatchQueue.main.async {
                    if success {
                        showPrivateKey = true
                    }
                }
            }
        } else {
            // Fallback - show anyway after PIN verification
            showPrivateKey = true
        }
    }
    
    func deleteAccount() {
        // In production, this would actually delete the account
        HapticFeedbackManager.shared.warning()
        ToastManager.shared.showWarning("Account deleted")
        withAnimation(AnimationPresets.smoothSpring) {
            dismiss()
        }
    }
}

struct AccountStatCard: View {
    let icon: String
    let title: String
    let value: String
    let subtitle: String?
    let iconColor: Color
    
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
        .frame(maxWidth: .infinity)
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
        .shadow(color: Color.black.opacity(0.25), radius: 16, y: 8)
    }
}

struct AccountCard: View {
    let account: Account
    @Binding var showCopiedToast: Bool
    
    var body: some View {
        VStack(spacing: 20) {
            // Account Icon with animation
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [
                                hexColor( "8B5CF6").opacity(0.3),
                                hexColor( "7C3AED").opacity(0.1)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 80, height: 80)
                    .shadow(color: hexColor("8B5CF6").opacity(0.3), radius: 20, y: 10)
                
                Text("N")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.white)
            }
            
            // Account Name
            VStack(spacing: 4) {
                Text(SettingsManager.shared.getAccountName(for: account.address) ?? "Main Account")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.white)
                
                Text("Account #\(formatAddress(account.address))")
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.6))
            }
            
            // Address with enhanced copy button
            VStack(spacing: 8) {
                Text("ADDRESS")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white.opacity(0.5))
                    .tracking(1)
                
                Button(action: {
                    UIPasteboard.general.string = account.address
                    HapticFeedbackManager.shared.success()
                    ToastManager.shared.showSuccess("Address copied!")
                    withAnimation(AnimationPresets.quickSpring) {
                        showCopiedToast = true
                    }
                }) {
                    HStack(spacing: 12) {
                        Text(formatAddress(account.address))
                            .font(.system(size: 14, weight: .medium, design: .monospaced))
                            .foregroundColor(.white)
                            .lineLimit(1)
                        
                        Image(systemName: "doc.on.doc")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(hexColor("8B5CF6"))
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.white.opacity(0.1))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(hexColor("8B5CF6").opacity(0.3), lineWidth: 1)
                            )
                    )
                }
            }
            
            // Balance
            VStack(spacing: 8) {
                Text("BALANCE")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white.opacity(0.5))
                    .tracking(1)
                
                Text("0.00 NOR")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(.white)
                
                Text("$0.00 USD")
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.6))
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 24)
                .fill(
                    LinearGradient(
                        colors: [
                            Color.white.opacity(0.15),
                            Color.white.opacity(0.05)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 24)
                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                )
                .shadow(color: Color.black.opacity(0.2), radius: 20, y: 10)
        )
    }
    
    func formatAddress(_ address: String) -> String {
        guard address.count > 10 else { return address }
        let prefix = address.prefix(6)
        let suffix = address.suffix(4)
        return "\(prefix)...\(suffix)"
    }
}

struct RenameAccountSheet: View {
    @Environment(\.dismiss) var dismiss
    @Binding var accountName: String
    let accountAddress: String
    let onSave: (String) -> Void
    @State private var tempName: String
    
    init(accountName: Binding<String>, accountAddress: String, onSave: @escaping (String) -> Void) {
        self._accountName = accountName
        self.accountAddress = accountAddress
        self.onSave = onSave
        _tempName = State(initialValue: accountName.wrappedValue)
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
                    Text("Rename Account")
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
                .padding(.bottom, 16)
                
                // Input
                VStack(alignment: .leading, spacing: 12) {
                    Text("Account Name")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                    
                    TextField("Enter account name", text: $tempName)
                        .font(.system(size: 16))
                        .foregroundColor(.white)
                        .padding(16)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.white.opacity(0.1))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                                )
                        )
                }
                .padding(.horizontal, 24)
                
                Spacer()
                
                // Save Button
                Button(action: {
                    HapticFeedbackManager.shared.success()
                    ToastManager.shared.showSuccess("Account renamed")
                    onSave(tempName)
                    accountName = tempName
                    withAnimation(AnimationPresets.smoothSpring) {
                        dismiss()
                    }
                }) {
                    Text("Save")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(
                            LinearGradient(
                                colors: [hexColor("8B5CF6"), hexColor("7C3AED")],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(16)
                }
                .disabled(tempName.isEmpty)
                .opacity(tempName.isEmpty ? 0.5 : 1.0)
                .padding(.horizontal, 24)
                .padding(.bottom, 32)
            }
        }
    }
}

struct AddAccountSheet: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var viewModel: WalletViewModel
    @State private var isCreating = false
    @State private var showSuccess = false
    
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
                    Text("Add Account")
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
                .padding(.bottom, 16)
                
                if showSuccess {
                    VStack(spacing: 16) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(hexColor("10B981"))
                        
                        Text("Account Created!")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(.white)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    VStack(spacing: 24) {
                        Text("Create a new account from your existing wallet. This account will share the same recovery phrase.")
                            .font(.system(size: 14))
                            .foregroundColor(.white.opacity(0.7))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 24)
                        
                        Spacer()
                        
                        // Create Button
                        Button(action: {
                            createAccount()
                        }) {
                            HStack {
                                if isCreating {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                } else {
                                    Image(systemName: "plus.circle.fill")
                                    Text("Create Account")
                                        .font(.system(size: 17, weight: .semibold))
                                }
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                LinearGradient(
                                    colors: [hexColor("8B5CF6"), hexColor("7C3AED")],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(16)
                        }
                        .disabled(isCreating)
                        .opacity(isCreating ? 0.5 : 1.0)
                    }
                    .padding(.horizontal, 24)
                    .padding(.bottom, 32)
                }
            }
        }
    }
    
    func createAccount() {
        HapticFeedbackManager.shared.mediumImpact()
        isCreating = true
        
        // Simulate account creation
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            isCreating = false
            HapticFeedbackManager.shared.success()
            ToastManager.shared.showSuccess("Account created successfully!")
            
            withAnimation(AnimationPresets.smoothSpring) {
                showSuccess = true
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                withAnimation(AnimationPresets.smoothSpring) {
                    dismiss()
                }
            }
        }
    }
}

#Preview {
    AccountDetailsView(viewModel: WalletViewModel())
}
