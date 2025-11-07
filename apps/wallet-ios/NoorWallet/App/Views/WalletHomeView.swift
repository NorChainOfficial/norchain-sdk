import SwiftUI
import NorCore

struct WalletHomeView: View {
    let wallet: NorCore.WalletInfo
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
                    // Header with profile
                    HStack {
                        // Profile glass card
                        HStack(spacing: 12) {
                            Circle()
                                .fill(
                                    LinearGradient(
                                        colors: [
                                            Color(hex: "A78BFA"),
                                            Color(hex: "7C3AED")
                                        ],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 44, height: 44)
                                .overlay(
                                    Text("N")
                                        .font(.system(size: 20, weight: .bold))
                                        .foregroundColor(.white)
                                )
                            
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Welcome back!")
                                    .font(.system(size: 12))
                                    .foregroundColor(.white.opacity(0.7))
                                Text("User")
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundColor(.white)
                            }
                        }
                        
                        Spacer()
                        
                        // Notification button
                        Button(action: {
                            let impactFeedback = UIImpactFeedbackGenerator(style: .light)
                            impactFeedback.impactOccurred()
                        }) {
                            ZStack {
                                Circle()
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
                                    .frame(width: 44, height: 44)
                                    .overlay(
                                        Circle()
                                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                                    )
                                
                                Image(systemName: "bell.fill")
                                    .font(.system(size: 18))
                                    .foregroundColor(.white)
                                
                                // Notification badge
                                Circle()
                                    .fill(Color(hex: "EF4444"))
                                    .frame(width: 8, height: 8)
                                    .offset(x: 10, y: -10)
                            }
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 16)
                    
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
                    
                    // Assets section with skeleton loading
                    VStack(alignment: .leading, spacing: 16) {
                        HStack {
                            Text("Assets")
                                .font(.system(size: 22, weight: .bold))
                                .foregroundColor(.white)
                            
                            Spacer()
                            
                            Button(action: {
                                let impactFeedback = UIImpactFeedbackGenerator(style: .light)
                                impactFeedback.impactOccurred()
                            }) {
                                HStack(spacing: 4) {
                                    Text("See All")
                                        .font(.system(size: 14, weight: .medium))
                                    Image(systemName: "chevron.right")
                                        .font(.system(size: 12, weight: .semibold))
                                }
                                .foregroundColor(Color(hex: "A78BFA"))
                            }
                        }
                        .padding(.horizontal, 24)
                        
                        if viewModel.isLoading {
                            VStack(spacing: 12) {
                                ForEach(0..<4, id: \.self) { _ in
                                    SkeletonAssetRow()
                                }
                            }
                            .padding(.horizontal, 24)
                        } else {
                            VStack(spacing: 12) {
                                ForEach(viewModel.assets) { asset in
                                    InteractiveAssetRow(
                                        asset: asset,
                                        isSelected: selectedAsset?.id == asset.id
                                    )
                                    .onTapGesture {
                                        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                                        impactFeedback.impactOccurred()
                                        
                                        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
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
                let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                impactFeedback.impactOccurred()
                await viewModel.refresh()
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

