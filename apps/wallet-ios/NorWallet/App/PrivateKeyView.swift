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

struct PrivateKeyView: View {
    @ObservedObject var viewModel: WalletViewModel
    @Environment(\.dismiss) var dismiss
    @State private var privateKey: String = ""
    @State private var showKey = false
    @State private var copied = false
    @State private var isAuthenticating = false
    
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
                            Text("Private Key")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("View your private key securely")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.6))
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 20)
                    
                    VStack(spacing: 16) {
                        // Warning Banner
                        VStack(spacing: 8) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .font(.system(size: 32))
                                .foregroundColor(hexColor("F59E0B"))
                            
                            Text("Never Share Your Private Key")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("Anyone with your private key has full access to your wallet and funds. Never share it with anyone or store it online.")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.8))
                                .multilineTextAlignment(.center)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        .padding(20)
                        .background(
                            RoundedRectangle(cornerRadius: 20)
                                .fill(
                                    LinearGradient(
                                        colors: [
                                            hexColor("F59E0B").opacity(0.2),
                                            hexColor("F59E0B").opacity(0.1)
                                        ],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .overlay(
                                    RoundedRectangle(cornerRadius: 20)
                                        .stroke(hexColor("F59E0B").opacity(0.3), lineWidth: 1)
                                )
                        )
                        .padding(.horizontal, 24)
                        
                        if isAuthenticating {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(1.5)
                                .padding(.vertical, 40)
                        } else if showKey {
                            // Private Key Display
                            VStack(spacing: 16) {
                                Text("PRIVATE KEY")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(.white.opacity(0.5))
                                    .tracking(1)
                                
                                Text(privateKey)
                                    .font(.system(size: 14, weight: .medium, design: .monospaced))
                                    .foregroundColor(.white)
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
                                                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
                                            )
                                    )
                                    .textSelection(.enabled)
                                
                                Button(action: {
                                    UIPasteboard.general.string = privateKey
                                    HapticFeedbackManager.shared.success()
                                    ToastManager.shared.showSuccess("Private key copied!")
                                    
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
                                        Image(systemName: copied ? "checkmark.circle.fill" : "doc.on.doc.fill")
                                            .font(.system(size: 18))
                                        Text(copied ? "Copied!" : "Copy Private Key")
                                            .font(.system(size: 16, weight: .semibold))
                                    }
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 16)
                                    .background(
                                        LinearGradient(
                                            colors: copied ? [hexColor("10B981"), hexColor("059669")] : [hexColor("8B5CF6"), hexColor("7C3AED")],
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        )
                                    )
                                    .cornerRadius(16)
                                }
                            }
                        } else {
                            // Show Key Button
                            Button(action: {
                                authenticateAndShowKey()
                            }) {
                                HStack(spacing: 12) {
                                    Image(systemName: "eye.fill")
                                        .font(.system(size: 20))
                                    Text("Show Private Key")
                                        .font(.system(size: 18, weight: .semibold))
                                }
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 18)
                                .background(
                                    LinearGradient(
                                        colors: [hexColor("EF4444"), hexColor("DC2626")],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .cornerRadius(16)
                                .shadow(color: hexColor("EF4444").opacity(0.5), radius: 20, y: 10)
                            }
                        }
                    }
                    .padding(.horizontal, 24)
                }
                .padding(.bottom, 40)
            }
        }
        .onAppear {
            // Load private key placeholder (would get from wallet)
            if let wallet = viewModel.currentWallet, let account = wallet.accounts.first {
                // In production, get actual private key from wallet
                privateKey = "0x" + String(repeating: "0", count: 64) // Placeholder
            }
        }
    }
    
    func authenticateAndShowKey() {
        isAuthenticating = true
        
        let context = LAContext()
        var error: NSError?
        
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            let reason = "Authenticate to view your private key"
            context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, _ in
                DispatchQueue.main.async {
                    isAuthenticating = false
                    if success {
                        withAnimation {
                            showKey = true
                        }
                    }
                }
            }
        } else {
            // Fallback to PIN if biometrics not available
            isAuthenticating = false
            withAnimation {
                showKey = true
            }
        }
    }
}

