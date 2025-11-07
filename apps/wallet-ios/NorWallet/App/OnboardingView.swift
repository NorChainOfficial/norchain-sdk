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

struct OnboardingView: View {
    @ObservedObject var viewModel: WalletViewModel
    @State private var showImport = false
    @State private var showCreate = false
    @State private var animate = false
    
    var body: some View {
        VStack(spacing: 0) {
            Spacer()
            
            // Animated logo with glassmorphism
            ZStack {
                // Glow effect
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [
                                hexColor( "A78BFA").opacity(0.6),
                                hexColor( "7C3AED").opacity(0.3),
                                Color.clear
                            ],
                            center: .center,
                            startRadius: 20,
                            endRadius: 100
                        )
                    )
                    .frame(width: 200, height: 200)
                    .blur(radius: 40)
                    .scaleEffect(animate ? 1.2 : 1.0)
                
                // Glass card
                RoundedRectangle(cornerRadius: 40)
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
                    .frame(width: 120, height: 120)
                    .overlay(
                        RoundedRectangle(cornerRadius: 40)
                            .stroke(
                                LinearGradient(
                                    colors: [
                                        Color.white.opacity(0.5),
                                        Color.white.opacity(0.1)
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                lineWidth: 1
                            )
                    )
                    .shadow(color: Color.black.opacity(0.3), radius: 20, y: 10)
                
                Image(systemName: "sparkles")
                    .font(.system(size: 50, weight: .light))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [hexColor( "FBBF24"), hexColor( "F59E0B")],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .rotationEffect(.degrees(animate ? 10 : -10))
            }
            .onAppear {
                withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
                    animate = true
                }
            }
            
            VStack(spacing: 12) {
                Text("Nor Wallet")
                    .font(.system(size: 42, weight: .bold, design: .rounded))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.white, hexColor( "DDD6FE")],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                
                Text("Secure. Fast. Decentralized.")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(Color.white.opacity(0.6))
            }
            .padding(.top, 40)
            .padding(.bottom, 60)
            
            Spacer()
            
            // Action buttons with glassmorphism
            VStack(spacing: 16) {
                // Primary button
                Button(action: {
                    showCreate = true
                }) {
                    HStack(spacing: 12) {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 20))
                        Text("Create Wallet")
                            .font(.system(size: 17, weight: .semibold))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 18)
                    .background(
                        ZStack {
                            LinearGradient(
                                colors: [
                                    hexColor( "8B5CF6"),
                                    hexColor( "7C3AED")
                                ],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                            
                            LinearGradient(
                                colors: [
                                    Color.white.opacity(0.3),
                                    Color.clear
                                ],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                            .blendMode(.overlay)
                        }
                    )
                    .foregroundColor(.white)
                    .cornerRadius(16)
                    .shadow(color: hexColor( "7C3AED").opacity(0.5), radius: 20, y: 10)
                }
                
                // Secondary button
                Button(action: { showImport = true }) {
                    HStack(spacing: 12) {
                        Image(systemName: "square.and.arrow.down")
                            .font(.system(size: 20))
                        Text("Import Wallet")
                            .font(.system(size: 17, weight: .semibold))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 18)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(
                                LinearGradient(
                                    colors: [
                                        Color.white.opacity(0.1),
                                        Color.white.opacity(0.05)
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 16)
                                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
                            )
                    )
                    .foregroundColor(.white)
                }
                
                // Demo button
                Button(action: {
                    withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
                        viewModel.loadDummyWallet()
                    }
                }) {
                    HStack(spacing: 8) {
                        Image(systemName: "bolt.fill")
                        Text("Quick Demo")
                            .font(.system(size: 15, weight: .medium))
                    }
                    .foregroundColor(hexColor( "A78BFA"))
                    .padding(.vertical, 12)
                }
            }
            .padding(.horizontal, 30)
            .padding(.bottom, 50)
        }
        .sheet(isPresented: $showCreate) {
            CreateWalletSheet(viewModel: viewModel)
        }
        .sheet(isPresented: $showImport) {
            ImportWalletSheet(viewModel: viewModel)
        }
    }
}

