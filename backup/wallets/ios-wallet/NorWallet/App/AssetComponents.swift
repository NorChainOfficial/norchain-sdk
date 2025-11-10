import SwiftUI
import Foundation

// MARK: - Token Logo Service (Professional Multi-Source System)
// Similar to MetaMask's approach - hierarchical fallback system
class TokenLogoService {
    static let shared = TokenLogoService()
    
    private init() {}
    
    func getLogoURL(symbol: String, contractAddress: String? = nil, chainId: Int? = nil) -> String? {
        let lowercaseSymbol = symbol.lowercased()
        
        // Priority 1: Trust Wallet Assets (most reliable, supports contract addresses)
        let contract = contractAddress ?? TokenLogoService.getCommonTokenContractAddress(symbol: lowercaseSymbol)
        if let contract = contract {
            return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/\(contract.lowercased())/logo.png"
        }
        
        // Priority 2: Trust Wallet native coins
        if let nativeCoinURL = getTrustWalletNativeCoinURL(symbol: lowercaseSymbol) {
            return nativeCoinURL
        }
        
        // Priority 3: SpotHQ Cryptocurrency Icons (7,500+ icons, CC0 license)
        let symbolUpper = symbol.uppercased()
        return "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/200/color/\(symbolUpper).png"
    }
    
    private func getTrustWalletNativeCoinURL(symbol: String) -> String? {
        let nativeCoins: [String: String] = [
            "eth": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
            "btc": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png",
            "bnb": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png",
            "matic": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png",
            "polygon": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png",
            "avax": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png",
            "sol": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
            "dot": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polkadot/info/logo.png",
            "ada": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cardano/info/logo.png",
            "xrp": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/xrp/info/logo.png",
            "trx": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/info/logo.png",
            "ltc": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/litecoin/info/logo.png"
        ]
        return nativeCoins[symbol]
    }
    
    static func getCommonTokenContractAddress(symbol: String) -> String? {
        let contracts: [String: String] = [
            "usdt": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            "usdc": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            "dai": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            "link": "0x514910771AF9Ca656af840dff83E8264EcF986CA",
            "wbtc": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            "uni": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
            "aave": "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
            "comp": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
            "mkr": "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
            "crv": "0xD533a949740bb3306d119CC777fa900bA034cd52",
            "sushi": "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
            "1inch": "0x111111111117dC0aa78b770fA6A738034120C302"
        ]
        return contracts[symbol.lowercased()]
    }
    
    func getNetworkLogoURL(chainName: String) -> String? {
        let chainLower = chainName.lowercased()
        let networkMap: [String: String] = [
            "ethereum": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
            "bitcoin": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png",
            "binance": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png",
            "polygon": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png",
            "avalanche": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png",
            "solana": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
            "polkadot": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polkadot/info/logo.png",
            "cardano": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cardano/info/logo.png",
            "xrp": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/xrp/info/logo.png",
            "tron": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/info/logo.png",
            "litecoin": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/litecoin/info/logo.png",
            "nor": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png"
        ]
        return networkMap[chainLower]
    }
}

// MARK: - Token Icon Component with Professional Logo System
struct TokenIcon: View {
    let symbol: String
    let size: CGFloat
    let contractAddress: String?
    
    @State private var imageLoaded = false
    @State private var loadFailed = false
    @State private var logoURL: URL?
    
    init(symbol: String, size: CGFloat = 40, contractAddress: String? = nil) {
        self.symbol = symbol
        self.size = size
        self.contractAddress = contractAddress
    }
    
    var body: some View {
        ZStack {
            // Priority 1: Local asset catalog (fastest, offline support)
            if let localImage = UIImage(named: symbol.uppercased()) {
                Image(uiImage: localImage)
                    .resizable()
                    .scaledToFit()
                    .frame(width: size, height: size)
                    .clipShape(Circle())
            }
            // Priority 2: Remote URL from TokenLogoService
            else if let url = getLogoURL() {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .empty:
                        // Show subtle placeholder while loading (not monogram yet)
                        ZStack {
                            Circle()
                                .fill(Color.white.opacity(0.1))
                            ProgressView()
                                .scaleEffect(0.5)
                                .tint(.white.opacity(0.7))
                        }
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                            .frame(width: size, height: size)
                            .clipShape(Circle())
                            .onAppear {
                                imageLoaded = true
                            }
                    case .failure(_):
                        // Only show monogram after confirmed failure
                        generateMonogram()
                            .onAppear {
                                loadFailed = true
                            }
                    @unknown default:
                        generateMonogram()
                    }
                }
                .frame(width: size, height: size)
            }
            // Priority 3: Monogram fallback (always available)
            else {
                generateMonogram()
            }
        }
        .frame(width: size, height: size)
    }
    
    // Get logo URL using TokenLogoService
    private func getLogoURL() -> URL? {
        // Get URL from service - it handles contract addresses internally
        let urlString = TokenLogoService.shared.getLogoURL(
            symbol: symbol,
            contractAddress: contractAddress,
            chainId: Optional<Int>.none
        )
        
        guard let urlString = urlString else { return nil }
        return URL(string: urlString)
    }
    
    // Generate monogram (first letter of symbol)
    @ViewBuilder
    private func generateMonogram() -> some View {
        ZStack {
            Circle()
                .fill(
                    LinearGradient(
                        colors: [
                            Color.white.opacity(0.2),
                            Color.white.opacity(0.1)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
            
            Text(symbol.prefix(1).uppercased())
                .font(.system(size: size * 0.5, weight: .bold, design: .rounded))
                .foregroundColor(.white)
        }
        .frame(width: size, height: size)
    }
}

// MARK: - Interactive Asset Row with Chart
struct InteractiveAssetRow: View {
    let asset: Asset
    let isSelected: Bool
    @State private var animateChart = false
    
    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 16) {
                // Token icon
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [asset.color.opacity(0.3), asset.color.opacity(0.1)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .blur(radius: 8)
                    
                    Circle()
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
                            Circle()
                                .stroke(Color.white.opacity(0.2), lineWidth: 1)
                        )
                    
                    // Use TokenIcon component for actual logos (larger size for better visibility)
                    TokenIcon(symbol: asset.symbol, size: 40)
                }
                .frame(width: 52, height: 52)
                
                VStack(alignment: .leading, spacing: 4) {
                    // Token name - prevent wrapping
                    Text(asset.name)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                    
                    // Balance and symbol - prevent wrapping
                    HStack(spacing: 4) {
                        Text(asset.balance)
                            .font(.system(size: 13))
                            .foregroundColor(.white.opacity(0.6))
                            .lineLimit(1)
                            .minimumScaleFactor(0.85)
                        Text(asset.symbol)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.white.opacity(0.4))
                            .lineLimit(1)
                    }
                }
                .frame(minWidth: 0, maxWidth: .infinity, alignment: .leading)
                
                // Mini chart - fixed width
                if !isSelected {
                    MiniSparkline(data: asset.chartData, color: asset.color)
                        .frame(width: 60, height: 30)
                        .transition(.scale.combined(with: .opacity))
                }
                
                // Value and change - prevent wrapping
                VStack(alignment: .trailing, spacing: 4) {
                    Text(asset.usdValue)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                        .lineLimit(1)
                        .minimumScaleFactor(0.75)
                    
                    HStack(spacing: 2) {
                        Image(systemName: asset.change.hasPrefix("+") ? "arrow.up" : "arrow.down")
                            .font(.system(size: 10, weight: .bold))
                        Text(asset.change)
                            .font(.system(size: 13, weight: .medium))
                            .lineLimit(1)
                    }
                    .foregroundColor(asset.changeColor)
                }
                .frame(minWidth: 80, alignment: .trailing)
            }
            .padding(16)
            
            // Expanded chart view
            if isSelected {
                VStack(spacing: 12) {
                    Divider()
                        .background(Color.white.opacity(0.1))
                    
                    HStack {
                        Text("24h Chart")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.white.opacity(0.6))
                        
                        Spacer()
                        
                        HStack(spacing: 8) {
                            Button(action: {}) {
                                Text("1D")
                                    .font(.system(size: 11, weight: .semibold))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 4)
                                    .background(asset.color.opacity(0.3))
                                    .cornerRadius(6)
                            }
                            Button(action: {}) {
                                Text("1W")
                                    .font(.system(size: 11, weight: .medium))
                                    .foregroundColor(.white.opacity(0.5))
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 4)
                            }
                            Button(action: {}) {
                                Text("1M")
                                    .font(.system(size: 11, weight: .medium))
                                    .foregroundColor(.white.opacity(0.5))
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 4)
                            }
                        }
                    }
                    
                    DetailedChart(data: asset.chartData, color: asset.color, animate: animateChart)
                        .frame(height: 120)
                        .onAppear {
                            withAnimation(.easeOut(duration: 1.0)) {
                                animateChart = true
                            }
                        }
                        .onDisappear {
                            animateChart = false
                        }
                }
                .padding(16)
                .transition(.asymmetric(
                    insertion: .scale.combined(with: .opacity),
                    removal: .scale.combined(with: .opacity)
                ))
            }
        }
        .background(
            ZStack {
                RoundedRectangle(cornerRadius: 20)
                    .fill(
                        LinearGradient(
                            colors: [
                                Color.white.opacity(isSelected ? 0.15 : 0.1),
                                Color.white.opacity(isSelected ? 0.08 : 0.05)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                
                RoundedRectangle(cornerRadius: 20)
                    .stroke(
                        LinearGradient(
                            colors: [
                                Color.white.opacity(isSelected ? 0.3 : 0.2),
                                Color.white.opacity(0.1)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: isSelected ? 1.5 : 1
                    )
            }
        )
        .scaleEffect(isSelected ? 1.02 : 1.0)
        .shadow(color: isSelected ? asset.color.opacity(0.3) : Color.clear, radius: 20, y: 10)
    }
}

// MARK: - Mini Sparkline Chart
struct MiniSparkline: View {
    let data: [Double]
    let color: Color
    
    var body: some View {
        GeometryReader { geometry in
            Path { path in
                guard !data.isEmpty else { return }
                
                let maxValue = data.max() ?? 1
                let minValue = data.min() ?? 0
                let range = maxValue - minValue
                
                let stepX = geometry.size.width / CGFloat(data.count - 1)
                
                for (index, value) in data.enumerated() {
                    let x = CGFloat(index) * stepX
                    let normalizedValue = range > 0 ? (value - minValue) / range : 0.5
                    let y = geometry.size.height * (1 - normalizedValue)
                    
                    if index == 0 {
                        path.move(to: CGPoint(x: x, y: y))
                    } else {
                        path.addLine(to: CGPoint(x: x, y: y))
                    }
                }
            }
            .stroke(color, lineWidth: 1.5)
        }
    }
}

// MARK: - Detailed Chart
struct DetailedChart: View {
    let data: [Double]
    let color: Color
    let animate: Bool
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .bottom) {
                // Gradient fill
                Path { path in
                    guard !data.isEmpty else { return }
                    
                    let maxValue = data.max() ?? 1
                    let minValue = data.min() ?? 0
                    let range = maxValue - minValue
                    
                    let stepX = geometry.size.width / CGFloat(data.count - 1)
                    
                    path.move(to: CGPoint(x: 0, y: geometry.size.height))
                    
                    for (index, value) in data.enumerated() {
                        let x = CGFloat(index) * stepX
                        let normalizedValue = range > 0 ? (value - minValue) / range : 0.5
                        let y = geometry.size.height * (1 - normalizedValue)
                        
                        if index == 0 {
                            path.addLine(to: CGPoint(x: x, y: y))
                        } else {
                            path.addLine(to: CGPoint(x: x, y: y))
                        }
                    }
                    
                    path.addLine(to: CGPoint(x: geometry.size.width, y: geometry.size.height))
                    path.closeSubpath()
                }
                .fill(
                    LinearGradient(
                        colors: [
                            color.opacity(0.3),
                            color.opacity(0.05)
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .opacity(animate ? 1 : 0)
                
                // Line
                Path { path in
                    guard !data.isEmpty else { return }
                    
                    let maxValue = data.max() ?? 1
                    let minValue = data.min() ?? 0
                    let range = maxValue - minValue
                    
                    let stepX = geometry.size.width / CGFloat(data.count - 1)
                    
                    for (index, value) in data.enumerated() {
                        let x = CGFloat(index) * stepX
                        let normalizedValue = range > 0 ? (value - minValue) / range : 0.5
                        let y = geometry.size.height * (1 - normalizedValue)
                        
                        if index == 0 {
                            path.move(to: CGPoint(x: x, y: y))
                        } else {
                            path.addLine(to: CGPoint(x: x, y: y))
                        }
                    }
                }
                .trim(from: 0, to: animate ? 1 : 0)
                .stroke(color, style: StrokeStyle(lineWidth: 2, lineCap: .round, lineJoin: .round))
            }
        }
    }
}

// MARK: - Skeleton Asset Row
struct SkeletonAssetRow: View {
    @State private var animate = false
    
    var body: some View {
        HStack(spacing: 16) {
            // Icon skeleton
            Circle()
                .fill(Color.white.opacity(0.1))
                .frame(width: 52, height: 52)
                .shimmer()
            
            VStack(alignment: .leading, spacing: 8) {
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.white.opacity(0.1))
                    .frame(width: 100, height: 16)
                    .shimmer()
                
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.white.opacity(0.1))
                    .frame(width: 60, height: 12)
                    .shimmer()
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 8) {
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.white.opacity(0.1))
                    .frame(width: 80, height: 16)
                    .shimmer()
                
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.white.opacity(0.1))
                    .frame(width: 50, height: 12)
                    .shimmer()
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        colors: [
                            Color.white.opacity(0.05),
                            Color.white.opacity(0.02)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        )
    }
}

// MARK: - Shimmer Effect
extension View {
    func shimmer() -> some View {
        self.modifier(ShimmerModifier())
    }
}

struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = 0
    
    func body(content: Content) -> some View {
        content
            .overlay(
                LinearGradient(
                    colors: [
                        Color.white.opacity(0),
                        Color.white.opacity(0.3),
                        Color.white.opacity(0)
                    ],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .offset(x: phase)
                .mask(content)
            )
            .onAppear {
                withAnimation(
                    .linear(duration: 1.5)
                    .repeatForever(autoreverses: false)
                ) {
                    phase = 300
                }
            }
    }
}

