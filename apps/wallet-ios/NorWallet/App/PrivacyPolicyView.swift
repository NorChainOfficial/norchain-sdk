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

struct PrivacyPolicyView: View {
    @Environment(\.dismiss) var dismiss
    
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
                            Text("Privacy Policy")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("Data protection and privacy")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.6))
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 20)
                    
                    VStack(alignment: .leading, spacing: 24) {
                        Text("Last Updated: \(Date().formatted(date: .long, time: .omitted))")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.white.opacity(0.5))
                            .padding(.top, 4)
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("1. Data Collection")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("Nor Wallet is a non-custodial wallet. We do not collect, store, or transmit your private keys, recovery phrases, or transaction data. Your data remains on your device.")
                                .font(.system(size: 15, weight: .regular))
                                .foregroundColor(.white.opacity(0.8))
                                .lineSpacing(4)
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("2. Local Data")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("The app stores preferences and settings locally on your device using iOS Keychain and UserDefaults. This data is encrypted and never transmitted.")
                                .font(.system(size: 15, weight: .regular))
                                .foregroundColor(.white.opacity(0.8))
                                .lineSpacing(4)
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("3. Blockchain Data")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("Transaction data is stored on the blockchain and is publicly accessible. We may query blockchain data to display your balance and transaction history, but we do not store this information.")
                                .font(.system(size: 15, weight: .regular))
                                .foregroundColor(.white.opacity(0.8))
                                .lineSpacing(4)
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("4. Third-Party Services")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("We use RPC providers to interact with blockchain networks. These providers may log your IP address for rate limiting purposes. We do not share your personal information with third parties.")
                                .font(.system(size: 15, weight: .regular))
                                .foregroundColor(.white.opacity(0.8))
                                .lineSpacing(4)
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("5. Your Rights")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("You have the right to:\n• Access your local data\n• Delete your local data\n• Opt out of analytics (if enabled)\n• Contact us at privacy@norwallet.com")
                                .font(.system(size: 15, weight: .regular))
                                .foregroundColor(.white.opacity(0.8))
                                .lineSpacing(4)
                        }
                    }
                    .padding(.horizontal, 24)
                }
                .padding(.bottom, 40)
            }
        }
    }
}

