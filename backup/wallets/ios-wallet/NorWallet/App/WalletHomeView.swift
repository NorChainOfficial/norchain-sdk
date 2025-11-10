import SwiftUI
import NorCore

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

struct WalletHomeView: View {
    let wallet: WalletInfo
    @ObservedObject var viewModel: WalletViewModel
    @State private var showQR = false
    @State private var showBalance = true
    @State private var selectedAsset: Asset?
    @State private var cardOffset: CGFloat = 0
    @State private var cardRotation: Double = 0
    @State private var showSend = false
    @State private var showReceive = false
    @State private var showSwap = false
    @State private var showStaking = false
    
    var body: some View {
        ZStack(alignment: .top) {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    
                    // Main balance card with 3D effect
                    BalanceCard(
                        viewModel: viewModel,
                        showBalance: $showBalance,
                        cardOffset: $cardOffset,
                        cardRotation: $cardRotation,
                        showSend: $showSend,
                        showReceive: $showReceive,
                        showSwap: $showSwap,
                        showStaking: $showStaking
                    )
                    .rotation3DEffect(
                        .degrees(cardRotation),
                        axis: (x: 0, y: 1, z: 0)
                    )
                    .offset(x: cardOffset)
                    .gesture(
                        DragGesture()
                            .onChanged { value in
                                cardOffset = value.translation.width
                                cardRotation = Double(value.translation.width / 20)
                            }
                            .onEnded { _ in
                                withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
                                    cardOffset = 0
                                    cardRotation = 0
                                }
                            }
                    )
                    .padding(.horizontal, 24)
                    
                    // Assets section with skeleton loading - Enhanced
                    VStack(alignment: .leading, spacing: 20) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Assets")
                                    .font(.system(size: 28, weight: .bold))
                                    .foregroundColor(.white)
                                
                                Text("\(viewModel.assets.count) tokens")
                                    .font(.system(size: 13))
                                    .foregroundColor(.white.opacity(0.6))
                            }
                            
                            Spacer()
                            
                            Button(action: {
                                HapticFeedbackManager.shared.lightImpact()
                            }) {
                                HStack(spacing: 6) {
                                    Text("See All")
                                        .font(.system(size: 15, weight: .semibold))
                                    Image(systemName: "chevron.right")
                                        .font(.system(size: 12, weight: .bold))
                                }
                                .foregroundColor(hexColor("A78BFA"))
                                .padding(.horizontal, 16)
                                .padding(.vertical, 10)
                                .background(
                                    Capsule()
                                        .fill(Color.white.opacity(0.1))
                                        .overlay(
                                            Capsule()
                                                .stroke(hexColor("A78BFA").opacity(0.3), lineWidth: 1)
                                        )
                                )
                            }
                        }
                        .padding(.horizontal, 24)
                        
                        if viewModel.isLoading {
                            VStack(spacing: 16) {
                                ForEach(0..<4, id: \.self) { _ in
                                    SkeletonAssetRow()
                                }
                            }
                            .padding(.horizontal, 24)
                        } else {
                            VStack(spacing: 16) {
                                ForEach(viewModel.assets) { asset in
                                    InteractiveAssetRow(
                                        asset: asset,
                                        isSelected: selectedAsset?.id == asset.id
                                    )
                                    .onTapGesture {
                                        HapticFeedbackManager.shared.mediumImpact()
                                        
                                        withAnimation(AnimationPresets.bouncySpring) {
                                            selectedAsset = selectedAsset?.id == asset.id ? nil : asset
                                        }
                                    }
                                }
                            }
                            .padding(.horizontal, 24)
                        }
                    }
                    
                    Spacer(minLength: 100)
                }
                .padding(.bottom, 20)
            }
            .refreshable {
                HapticFeedbackManager.shared.mediumImpact()
                await viewModel.refresh()
                ToastManager.shared.showSuccess("Balance updated")
            }
        }
        .sheet(isPresented: $showSend) {
            SendView(viewModel: viewModel)
        }
        .sheet(isPresented: $showReceive) {
            ReceiveView(viewModel: viewModel, wallet: wallet)
        }
        .sheet(isPresented: $showSwap) {
            SwapView(viewModel: viewModel)
        }
        .sheet(isPresented: $showStaking) {
            StakingView(viewModel: viewModel)
        }
    }
}

struct QuickStatCard: View {
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
        .frame(width: 220)
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

