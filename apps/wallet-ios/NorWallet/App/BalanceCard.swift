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

struct BalanceCard: View {
    @ObservedObject var viewModel: WalletViewModel
    @Binding var showBalance: Bool
    @Binding var cardOffset: CGFloat
    @Binding var cardRotation: Double
    @Binding var showSend: Bool
    @Binding var showReceive: Bool
    @Binding var showSwap: Bool
    @Binding var showStaking: Bool
    
    var body: some View {
        ZStack {
            // Background glow
            RoundedRectangle(cornerRadius: 32)
                .fill(
                    LinearGradient(
                        colors: [
                            hexColor( "8B5CF6").opacity(0.4),
                            hexColor( "7C3AED").opacity(0.2)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .blur(radius: 30)
                .offset(y: 10)
            
            // Glass card
            VStack(spacing: 24) {
                HStack {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Total Balance")
                            .font(.system(size: 14))
                            .foregroundColor(.white.opacity(0.7))
                        
                        HStack(spacing: 8) {
                            if viewModel.isRefreshing {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .scaleEffect(0.8)
                            } else {
                                Text(showBalance ? viewModel.totalBalance : "••••••")
                                    .font(.system(size: 36, weight: .bold, design: .rounded))
                                    .foregroundColor(.white)
                                    .animation(.default, value: viewModel.totalBalance)
                            }
                            
                            Button(action: {
                                HapticFeedbackManager.shared.lightImpact()
                                
                                withAnimation(AnimationPresets.bouncySpring) {
                                    showBalance.toggle()
                                }
                            }) {
                                Image(systemName: showBalance ? "eye.fill" : "eye.slash.fill")
                                    .font(.system(size: 16))
                                    .foregroundColor(.white.opacity(0.6))
                            }
                        }
                        
                        HStack(spacing: 4) {
                            Image(systemName: "arrow.up.right")
                                .font(.system(size: 12, weight: .bold))
                            Text(viewModel.balanceChange)
                                .font(.system(size: 14, weight: .semibold))
                        }
                        .foregroundColor(hexColor( "10B981"))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(
                            Capsule()
                                .fill(hexColor( "10B981").opacity(0.2))
                        )
                    }
                    
                    Spacer()
                }
                
                // Quick actions
                HStack(spacing: 12) {
                    GlassActionButton(
                        icon: "arrow.up",
                        title: "Send",
                        gradient: [hexColor( "EF4444"), hexColor( "DC2626")]
                    ) {
                        HapticFeedbackManager.shared.mediumImpact()
                        showSend = true
                    }
                    
                    GlassActionButton(
                        icon: "arrow.down",
                        title: "Receive",
                        gradient: [hexColor( "10B981"), hexColor( "059669")]
                    ) {
                        HapticFeedbackManager.shared.mediumImpact()
                        showReceive = true
                    }
                    
                    GlassActionButton(
                        icon: "arrow.2.squarepath",
                        title: "Swap",
                        gradient: [hexColor( "8B5CF6"), hexColor( "7C3AED")]
                    ) {
                        HapticFeedbackManager.shared.mediumImpact()
                        showSwap = true
                    }
                    
                    GlassActionButton(
                        icon: "chart.line.uptrend.xyaxis",
                        title: "Stake",
                        gradient: [hexColor( "3B82F6"), hexColor( "2563EB")]
                    ) {
                        HapticFeedbackManager.shared.mediumImpact()
                        showStaking = true
                    }
                }
            }
            .padding(24)
            .background(
                ZStack {
                    RoundedRectangle(cornerRadius: 32)
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
                    
                    RoundedRectangle(cornerRadius: 32)
                        .stroke(
                            LinearGradient(
                                colors: [
                                    Color.white.opacity(0.3),
                                    Color.white.opacity(0.1)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1
                        )
                }
            )
            .shadow(color: Color.black.opacity(0.2), radius: 30, y: 15)
        }
    }
}

