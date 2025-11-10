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

struct NetworkSwitcherView: View {
    @ObservedObject var viewModel: WalletViewModel
    @StateObject private var settingsManager = SettingsManager.shared
    @Environment(\.dismiss) var dismiss
    @State private var selectedNetwork: Network?
    
    var networks: [Network] {
        [
            Network(name: "Nor Chain", symbol: "NOR", chainId: 65001, rpcUrl: "https://rpc.norchain.org", color: hexColor("8B5CF6"), isTestnet: false),
            Network(name: "Ethereum", symbol: "ETH", chainId: 1, rpcUrl: "https://eth.llamarpc.com", color: hexColor("627EEA"), isTestnet: false),
            Network(name: "Polygon", symbol: "MATIC", chainId: 137, rpcUrl: "https://polygon-rpc.com", color: hexColor("8247E5"), isTestnet: false),
            Network(name: "BSC", symbol: "BNB", chainId: 56, rpcUrl: "https://bsc-dataseed.binance.org", color: hexColor("F3BA2F"), isTestnet: false),
            Network(name: "Arbitrum", symbol: "ARB", chainId: 42161, rpcUrl: "https://arb1.arbitrum.io/rpc", color: hexColor("28A0F0"), isTestnet: false),
            Network(name: "Nor Testnet", symbol: "NOR", chainId: 7861, rpcUrl: "https://testnet-rpc.norchain.org", color: hexColor("A78BFA"), isTestnet: true),
        ]
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
                            Text("Networks")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("Switch between blockchain networks")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.6))
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 20)
                    // Network Stats Card - using QuickStatsCard style
                    if let selectedNetwork = networks.first(where: { $0.chainId == settingsManager.selectedChainId }) {
                        QuickStatsCard(stats: [
                            (icon: "network", title: "Current Network", value: selectedNetwork.name, color: selectedNetwork.color),
                            (icon: "speedometer", title: "Latency", value: "\(Int.random(in: 45...120))ms", color: hexColor("10B981")),
                            (icon: "cube.fill", title: "Block Height", value: "#\(Int.random(in: 18000000...19500000))", color: hexColor("8B5CF6")),
                            (icon: "bolt.fill", title: "Gas Price", value: "\(String(format: "%.1f", Double.random(in: 12...45))) gwei", color: hexColor("F59E0B"))
                        ])
                        .padding(.horizontal, 24)
                    }
                    
                    // Mainnets Section - using SettingsSection style
                    SettingsSection(title: "Mainnets") {
                        ForEach(networks.filter { !$0.isTestnet }) { network in
                            NetworkRow(network: network, isSelected: network.chainId == settingsManager.selectedChainId) {
                                selectNetwork(network)
                            }
                        }
                    }
                    
                    // Testnets Section - using SettingsSection style
                    SettingsSection(title: "Testnets") {
                        ForEach(networks.filter { $0.isTestnet }) { network in
                            NetworkRow(network: network, isSelected: false) {
                                selectNetwork(network)
                            }
                        }
                    }
                }
                .padding(.bottom, 40)
            }
            .overlay(alignment: .top) {
                GlobalToastOverlay()
            }
        }
    }
    
    func selectNetwork(_ network: Network) {
        HapticFeedbackManager.shared.mediumImpact()
        selectedNetwork = network
        
        // Persist network selection
        settingsManager.updateNetwork(
            chainId: network.chainId,
            name: network.name,
            rpcUrl: network.rpcUrl
        )
        
        // Update viewModel
        viewModel.chainInfo = ChainInfo(
            name: network.name,
            rpcUrl: network.rpcUrl,
            chainId: network.chainId
        )
        
        HapticFeedbackManager.shared.success()
        ToastManager.shared.showSuccess("Network switched to \(network.name)")
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            withAnimation(AnimationPresets.smoothSpring) {
                dismiss()
            }
        }
    }
}

struct Network: Identifiable {
    let id = UUID()
    let name: String
    let symbol: String
    let chainId: UInt64
    let rpcUrl: String
    let color: Color
    let isTestnet: Bool
}

struct NetworkRow: View {
    let network: Network
    let isSelected: Bool
    let action: () -> Void
    @State private var isPressed = false
    
    var body: some View {
        Button(action: action) {
            rowContent
        }
        .buttonStyle(PlainButtonStyle())
        .scaleEffect(isPressed ? 0.98 : 1.0)
        .simultaneousGesture(dragGesture)
    }
    
    private var rowContent: some View {
        HStack(spacing: 14) {
            networkIcon
            networkInfo
            Spacer()
            selectionIndicator
        }
                        .padding(.horizontal, 20)
                        .padding(.vertical, 16)
                        .background(backgroundGradient)
    }
    
    private var networkIcon: some View {
        ZStack {
            Circle()
                .fill(network.color.opacity(0.2))
                .frame(width: 44, height: 44)
            
            Text(network.symbol.prefix(1))
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(.white)
        }
    }
    
    private var networkInfo: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                Text(network.name)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                
                if network.isTestnet {
                    Text("TESTNET")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(hexColor("F59E0B"))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(
                            Capsule()
                                .fill(hexColor("F59E0B").opacity(0.2))
                        )
                }
            }
            
            HStack(spacing: 8) {
                HStack(spacing: 4) {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 6, height: 6)
                    Text("Chain ID: \(network.chainId)")
                        .font(.system(size: 13))
                        .foregroundColor(.white.opacity(0.6))
                }
                
                Text("•")
                    .foregroundColor(.white.opacity(0.3))
                
                Text("\(Int.random(in: 25...150))ms")
                    .font(.system(size: 13))
                    .foregroundColor(.white.opacity(0.6))
            }
        }
    }
    
    private var selectionIndicator: some View {
        Group {
            if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 24))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [hexColor("10B981"), hexColor("059669")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
            } else {
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white.opacity(0.3))
            }
        }
    }
    
    private var backgroundGradient: some View {
        RoundedRectangle(cornerRadius: 20)
            .fill(
                LinearGradient(
                    colors: [
                        Color.white.opacity(isSelected ? 0.15 : 0.15),
                        Color.white.opacity(isSelected ? 0.08 : 0.08)
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
    }
    
    private var dragGesture: some Gesture {
        DragGesture(minimumDistance: 0)
            .onChanged { _ in
                withAnimation(.spring(response: 0.3)) {
                    isPressed = true
                }
            }
            .onEnded { _ in
                withAnimation(.spring(response: 0.3)) {
                    isPressed = false
                }
            }
    }
}

#if DEBUG
#Preview {
    NetworkSwitcherView(viewModel: WalletViewModel())
}
#endif
