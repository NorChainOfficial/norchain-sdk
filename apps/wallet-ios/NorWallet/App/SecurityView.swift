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

struct SecurityView: View {
    @ObservedObject var viewModel: WalletViewModel
    @Environment(\.dismiss) var dismiss
    
    @StateObject private var settingsManager = SettingsManager.shared
    @State private var showSeedPhrase = false
    @State private var showPinSetup = false
    @State private var showBackupWarning = true
    @State private var showAutoLockSettings = false
    @State private var showPrivateKey = false
    @State private var biometricType: BiometricType = .none
    @State private var showSuccessMessage = false
    @State private var successMessage = ""
    @State private var showError = false
    @State private var errorMessage = ""
    
    var body: some View {
        ZStack {
            // Background
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
                                .background(
                                    Circle()
                                        .fill(Color.white.opacity(0.1))
                                )
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .trailing, spacing: 4) {
                            Text("Security")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("Protect your wallet and funds")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.6))
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 20)
                    // Backup Warning Banner
                    if showBackupWarning {
                        BackupWarningBanner(onBackup: {
                            showSeedPhrase = true
                        }, onDismiss: {
                            withAnimation {
                                showBackupWarning = false
                            }
                        })
                        .padding(.horizontal, 24)
                    }
                    
                    // Security Section - using SettingsSection style
                    SettingsSection(title: "Authentication") {
                        // Biometric Authentication with enhanced UX
                        SecurityCard(
                            icon: biometricType == .faceID ? "faceid" : (biometricType == .touchID ? "touchid" : "lock.fill"),
                            title: biometricType == .faceID ? "Face ID" : (biometricType == .touchID ? "Touch ID" : "Biometric"),
                            subtitle: biometricType == .none ? "Not available on this device" : (settingsManager.biometricEnabled ? "Enabled" : "Enable to unlock wallet"),
                            color: hexColor( "10B981"),
                            isToggle: true,
                            isEnabled: settingsManager.biometricEnabled,
                            isDisabled: biometricType == .none
                        ) { enabled in
                            if biometricType != .none {
                                HapticFeedbackManager.shared.mediumImpact()
                                
                                if enabled {
                                    authenticateBiometric { success in
                                        if success {
                                            settingsManager.biometricEnabled = true
                                            showSuccess("Biometric authentication enabled")
                                        } else {
                                            showError("Biometric authentication failed")
                                        }
                                    }
                                } else {
                                    settingsManager.biometricEnabled = false
                                    showSuccess("Biometric authentication disabled")
                                }
                            }
                        }
                        
                        // PIN Security with enhanced UX
                        SecurityCard(
                            icon: "lock.shield.fill",
                            title: "PIN Code",
                            subtitle: settingsManager.pinEnabled ? "PIN protection active" : "Set up 6-digit PIN",
                            color: hexColor( "8B5CF6"),
                            isToggle: true,
                            isEnabled: settingsManager.pinEnabled
                        ) { enabled in
                            let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                            impactFeedback.impactOccurred()
                            
                            if enabled {
                                showPinSetup = true
                            } else {
                                // Require PIN to disable
                                showPinVerification { verified in
                                    if verified {
                                        settingsManager.removePIN()
                                        showSuccess("PIN protection disabled")
                                    }
                                }
                            }
                        }
                    }
                    
                    // Backup Section - using SettingsSection style
                    SettingsSection(title: "Backup") {
                        // Seed Phrase Backup
                        Button(action: {
                            authenticateAndShow {
                                showSeedPhrase = true
                            }
                        }) {
                            SecurityCard(
                                icon: "key.fill",
                                title: "Backup Seed Phrase",
                                subtitle: "View your recovery phrase",
                                color: hexColor( "FBBF24"),
                                showChevron: true
                            )
                        }
                    }
                    
                    // Settings Section - using SettingsSection style
                    SettingsSection(title: "Settings") {
                        // Auto-Lock with interactive settings
                        Button(action: {
                            let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                            impactFeedback.impactOccurred()
                            showAutoLockSettings = true
                        }) {
                            SecurityCard(
                                icon: "timer",
                                title: "Auto-Lock",
                                subtitle: settingsManager.autoLockEnabled ? "Lock after \(settingsManager.autoLockMinutes) min" : "Disabled",
                                color: hexColor( "3B82F6"),
                                showChevron: true
                            )
                        }
                        
                        // Transaction Signing with toggle
                        SecurityCard(
                            icon: "signature",
                            title: "Transaction Signing",
                            subtitle: settingsManager.requireAuthForTransactions ? "Authentication required" : "No authentication required",
                            color: hexColor( "EC4899"),
                            isToggle: true,
                            isEnabled: settingsManager.requireAuthForTransactions
                        ) { enabled in
                            let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                            impactFeedback.impactOccurred()
                            settingsManager.requireAuthForTransactions = enabled
                            showSuccess(enabled ? "Transaction authentication enabled" : "Transaction authentication disabled")
                        }
                    }
                    
                    // Advanced Section - using SettingsSection style
                    SettingsSection(title: "Advanced") {
                        // Private Key Export with warning
                        Button(action: {
                            let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                            impactFeedback.impactOccurred()
                            showPrivateKeyWarning {
                                authenticateAndShow {
                                    showPrivateKey = true
                                }
                            }
                        }) {
                            SecurityCard(
                                icon: "key.viewfinder",
                                title: "Export Private Key",
                                subtitle: "View private key (Advanced)",
                                color: hexColor( "EF4444"),
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
        .sheet(isPresented: $showSeedPhrase) {
            SeedPhraseView(viewModel: viewModel)
        }
        .sheet(isPresented: $showPinSetup) {
            PinSetupView(onComplete: { pin in
                settingsManager.setPIN(pin)
                showPinSetup = false
            })
        }
        .sheet(isPresented: $showAutoLockSettings) {
            AutoLockSettingsView(settingsManager: settingsManager)
        }
        .sheet(isPresented: $showPrivateKey) {
            PrivateKeyView(viewModel: viewModel)
        }
        .alert("Warning", isPresented: $showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage)
        }
        .overlay(alignment: .top) {
            if showSuccessMessage {
                SuccessToast(message: successMessage)
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .zIndex(1000)
            }
        }
        .onAppear {
            detectBiometricType()
        }
    }
    
    func detectBiometricType() {
        let (available, type) = settingsManager.checkBiometricAvailability()
        biometricType = type
    }
    
    func authenticateBiometric(completion: @escaping (Bool) -> Void) {
        let context = LAContext()
        var error: NSError?
        
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            let reason = "Enable biometric authentication for Nor Wallet"
            context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, _ in
                DispatchQueue.main.async {
                    completion(success)
                }
            }
        } else {
            completion(false)
        }
    }
    
    func showPinVerification(completion: @escaping (Bool) -> Void) {
        // Show PIN verification sheet
        // For now, just complete
        completion(true)
    }
    
    func showPrivateKeyWarning(confirmed: @escaping () -> Void) {
        // Show warning alert before showing private key
        let alert = UIAlertController(
            title: "Export Private Key",
            message: "Warning: Never share your private key with anyone. Anyone with your private key can access your funds.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        alert.addAction(UIAlertAction(title: "I Understand", style: .destructive) { _ in
            confirmed()
        })
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let rootViewController = windowScene.windows.first?.rootViewController {
            rootViewController.present(alert, animated: true)
        }
    }
    
    func showSuccess(_ message: String) {
        successMessage = message
        withAnimation {
            showSuccessMessage = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            withAnimation {
                showSuccessMessage = false
            }
        }
    }
    
    func showError(_ message: String) {
        errorMessage = message
        showError = true
    }
    
    func authenticateAndShow(completion: @escaping () -> Void) {
        let context = LAContext()
        var error: NSError?
        
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            let reason = "Authenticate to view sensitive information"
            
            context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, error in
                DispatchQueue.main.async {
                    if success {
                        completion()
                    }
                }
            }
        } else {
            completion()
        }
    }
}


// MARK: - Security Card Component
struct SecurityCard: View {
    let icon: String
    let title: String
    let subtitle: String
    let color: Color
    var isToggle: Bool = false
    var isEnabled: Bool = false
    var isDisabled: Bool = false
    var showChevron: Bool = false
    var onToggle: ((Bool) -> Void)? = nil
    
    @State private var toggleState: Bool = false
    @State private var isPressed = false
    
    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                RoundedRectangle(cornerRadius: 14)
                    .fill(
                        LinearGradient(
                            colors: [
                                color.opacity(isDisabled ? 0.1 : 0.25),
                                color.opacity(isDisabled ? 0.05 : 0.15)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 56, height: 56)
                    .overlay(
                        RoundedRectangle(cornerRadius: 14)
                            .stroke(color.opacity(0.3), lineWidth: 1)
                    )
                
                Image(systemName: icon)
                    .font(.system(size: 24, weight: .semibold))
                    .foregroundColor(isDisabled ? .white.opacity(0.3) : color)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 8) {
                    Text(title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                    
                    if isDisabled {
                        Text("Unavailable")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(
                                Capsule()
                                    .fill(Color.white.opacity(0.2))
                            )
                    }
                }
                
                Text(subtitle)
                    .font(.system(size: 13))
                    .foregroundColor(.white.opacity(0.6))
            }
            
            Spacer()
            
            if isToggle {
                Toggle("", isOn: Binding(
                    get: { isEnabled },
                    set: { newValue in
                        HapticFeedbackManager.shared.lightImpact()
                        onToggle?(newValue)
                    }
                ))
                .labelsHidden()
                .tint(color)
                .disabled(isDisabled)
            } else if showChevron {
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white.opacity(0.4))
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        colors: [
                            Color.white.opacity(isPressed ? 0.18 : 0.15),
                            Color.white.opacity(isPressed ? 0.1 : 0.08)
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
        .shadow(color: Color.black.opacity(isPressed ? 0.1 : 0.2), radius: isPressed ? 8 : 12, y: isPressed ? 2 : 4)
        .scaleEffect(isPressed ? 0.97 : 1.0)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    if !isToggle {
                        withAnimation(.spring(response: 0.25, dampingFraction: 0.7)) {
                            isPressed = true
                        }
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

// MARK: - Backup Warning Banner
struct BackupWarningBanner: View {
    let onBackup: () -> Void
    let onDismiss: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 20))
                    .foregroundColor(hexColor( "FBBF24"))
                
                Text("Backup Your Wallet")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.white)
                
                Spacer()
                
                Button(action: onDismiss) {
                    Image(systemName: "xmark")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.white.opacity(0.6))
                }
            }
            
            Text("Save your seed phrase in a safe place. This is the only way to recover your wallet.")
                .font(.system(size: 14))
                .foregroundColor(.white.opacity(0.8))
                .fixedSize(horizontal: false, vertical: true)
            
            Button(action: onBackup) {
                Text("Backup Now")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(
                        LinearGradient(
                            colors: [hexColor( "FBBF24"), hexColor( "F59E0B")],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(12)
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(hexColor( "FBBF24").opacity(0.15))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(hexColor( "FBBF24").opacity(0.3), lineWidth: 1)
                )
        )
    }
}

// MARK: - Seed Phrase View
struct SeedPhraseView: View {
    @ObservedObject var viewModel: WalletViewModel
    @Environment(\.dismiss) var dismiss
    @State private var words: [String] = []
    @State private var copied = false
    
    var body: some View {
        ZStack {
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
            
            VStack(spacing: 24) {
                // Header
                HStack {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .font(.system(size: 20, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(width: 44, height: 44)
                            .background(Circle().fill(Color.white.opacity(0.1)))
                    }
                    
                    Spacer()
                    
                    Text("Seed Phrase")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Color.clear.frame(width: 44)
                }
                .padding(.horizontal, 24)
                .padding(.top, 20)
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 24) {
                        // Warning
                        VStack(spacing: 12) {
                            Image(systemName: "eye.slash.fill")
                                .font(.system(size: 32))
                                .foregroundColor(hexColor( "EF4444"))
                            
                            Text("Keep it Secret")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("Never share your seed phrase. Anyone with this phrase can access your funds.")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.7))
                                .multilineTextAlignment(.center)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        .padding(24)
                        .background(
                            RoundedRectangle(cornerRadius: 20)
                                .fill(hexColor( "EF4444").opacity(0.15))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 20)
                                        .stroke(hexColor( "EF4444").opacity(0.3), lineWidth: 1)
                                )
                        )
                        
                        // Seed Words Grid
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                            ForEach(Array(words.enumerated()), id: \.offset) { index, word in
                                HStack(spacing: 8) {
                                    Text("\(index + 1)")
                                        .font(.system(size: 12, weight: .medium))
                                        .foregroundColor(.white.opacity(0.5))
                                        .frame(width: 24)
                                    
                                    Text(word)
                                        .font(.system(size: 15, weight: .medium))
                                        .foregroundColor(.white)
                                    
                                    Spacer()
                                }
                                .padding(12)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(Color.white.opacity(0.08))
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 12)
                                                .stroke(Color.white.opacity(0.15), lineWidth: 1)
                                        )
                                )
                            }
                        }
                        
                        // Copy Button
                        Button(action: {
                            UIPasteboard.general.string = words.joined(separator: " ")
                            withAnimation {
                                copied = true
                            }
                            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                withAnimation {
                                    copied = false
                                }
                            }
                        }) {
                            HStack(spacing: 8) {
                                Image(systemName: copied ? "checkmark" : "doc.on.doc")
                                Text(copied ? "Copied!" : "Copy to Clipboard")
                                    .font(.system(size: 16, weight: .semibold))
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                LinearGradient(
                                    colors: [hexColor( "8B5CF6"), hexColor( "7C3AED")],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(16)
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.bottom, 40)
                }
            }
        }
        .onAppear {
            // Generate dummy mnemonic for demo
            words = generateDummyMnemonic()
        }
    }
    
    func generateDummyMnemonic() -> [String] {
        let dummyWords = ["abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse", "access", "accident"]
        return dummyWords
    }
}

// MARK: - PIN Setup View
struct PinSetupView: View {
    @Environment(\.dismiss) var dismiss
    let onComplete: (String) -> Void
    
    @State private var pin = ""
    @State private var confirmPin = ""
    @State private var step = 1
    @State private var error = ""
    
    var body: some View {
        ZStack {
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
            
            VStack(spacing: 40) {
                VStack(spacing: 12) {
                    Text(step == 1 ? "Create PIN" : "Confirm PIN")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text(step == 1 ? "Enter a 6-digit PIN" : "Enter your PIN again")
                        .font(.system(size: 16))
                        .foregroundColor(.white.opacity(0.7))
                }
                
                // PIN Dots
                HStack(spacing: 16) {
                    ForEach(0..<6, id: \.self) { index in
                        Circle()
                            .fill(index < (step == 1 ? pin.count : confirmPin.count) ? hexColor( "8B5CF6") : Color.white.opacity(0.2))
                            .frame(width: 16, height: 16)
                    }
                }
                
                if !error.isEmpty {
                    Text(error)
                        .font(.system(size: 14))
                        .foregroundColor(hexColor( "EF4444"))
                }
                
                Spacer()
                
                // Number Pad
                VStack(spacing: 16) {
                    ForEach(0..<3, id: \.self) { row in
                        HStack(spacing: 24) {
                            ForEach(1..<4, id: \.self) { col in
                                let number = row * 3 + col
                                PinButton(number: "\(number)") {
                                    addDigit("\(number)")
                                }
                            }
                        }
                    }
                    
                    HStack(spacing: 24) {
                        Color.clear.frame(width: 72, height: 72)
                        
                        PinButton(number: "0") {
                            addDigit("0")
                        }
                        
                        Button(action: deleteDigit) {
                            Image(systemName: "delete.left")
                                .font(.system(size: 24))
                                .foregroundColor(.white)
                                .frame(width: 72, height: 72)
                        }
                    }
                }
                .padding(.bottom, 40)
            }
            .padding(.top, 60)
        }
    }
    
    func addDigit(_ digit: String) {
        let currentPin = step == 1 ? pin : confirmPin
        guard currentPin.count < 6 else { return }
        
        if step == 1 {
            pin += digit
            if pin.count == 6 {
                step = 2
            }
        } else {
            confirmPin += digit
            if confirmPin.count == 6 {
                if pin == confirmPin {
                    onComplete(pin)
                } else {
                    error = "PINs don't match"
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                        confirmPin = ""
                        error = ""
                    }
                }
            }
        }
    }
    
    func deleteDigit() {
        if step == 1 {
            if !pin.isEmpty {
                pin.removeLast()
            }
        } else {
            if !confirmPin.isEmpty {
                confirmPin.removeLast()
                error = ""
            }
        }
    }
}

struct PinButton: View {
    let number: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(number)
                .font(.system(size: 28, weight: .medium))
                .foregroundColor(.white)
                .frame(width: 72, height: 72)
                .background(
                    Circle()
                        .fill(Color.white.opacity(0.1))
                        .overlay(
                            Circle()
                                .stroke(Color.white.opacity(0.2), lineWidth: 1)
                        )
                )
        }
    }
}

#if DEBUG
#Preview {
    SecurityView(viewModel: WalletViewModel())
}
#endif
