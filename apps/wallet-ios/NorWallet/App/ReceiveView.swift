import SwiftUI
import CoreImage.CIFilterBuiltins
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

struct ReceiveView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var viewModel: WalletViewModel
    let wallet: WalletInfo
    
    @State private var selectedAsset: Asset
    @State private var showCopied = false
    
    init(viewModel: WalletViewModel, wallet: WalletInfo, selectedAsset: Asset? = nil) {
        self.viewModel = viewModel
        self.wallet = wallet
        _selectedAsset = State(initialValue: selectedAsset ?? viewModel.assets.first ?? Asset(
            symbol: "NOR",
            name: "Nor Coin",
            balance: "0",
            usdValue: "$0",
            change: "+0%",
            color: hexColor("8B5CF6"),
            chartData: []
        ))
    }
    
    var walletAddress: String {
        wallet.accounts.first?.address ?? "0x0000000000000000000000000000000000000000"
    }
    
    var body: some View {
        ZStack {
            // Background
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
                                .background(
                                    Circle()
                                        .fill(Color.white.opacity(0.1))
                                )
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .trailing, spacing: 4) {
                            Text("Receive")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("Receive crypto to your wallet")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.6))
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 20)
                    
                    VStack(spacing: 16) {
                        // QR Code
                        VStack(spacing: 16) {
                            ZStack {
                                // Glow effect
                                RoundedRectangle(cornerRadius: 32)
                                    .fill(
                                        RadialGradient(
                                            colors: [
                                                hexColor("A78BFA").opacity(0.4),
                                                Color.clear
                                            ],
                                            center: .center,
                                            startRadius: 50,
                                            endRadius: 150
                                        )
                                    )
                                    .frame(width: 300, height: 300)
                                    .blur(radius: 40)
                                
                                // QR Code Container
                                VStack(spacing: 0) {
                                    if let qrImage = generateQRCode(from: walletAddress) {
                                        Image(uiImage: qrImage)
                                            .interpolation(.none)
                                            .resizable()
                                            .scaledToFit()
                                            .frame(width: 240, height: 240)
                                            .padding(24)
                                    }
                                }
                                .background(
                                    RoundedRectangle(cornerRadius: 28)
                                        .fill(Color.white)
                                )
                                .overlay(
                                    RoundedRectangle(cornerRadius: 28)
                                        .stroke(
                                            LinearGradient(
                                                colors: [
                                                    Color.white.opacity(0.5),
                                                    Color.white.opacity(0.2)
                                                ],
                                                startPoint: .topLeading,
                                                endPoint: .bottomTrailing
                                            ),
                                            lineWidth: 2
                                        )
                                )
                                .shadow(color: Color.black.opacity(0.2), radius: 30, y: 15)
                            }
                            
                            VStack(spacing: 8) {
                                Text("Scan to Send \(selectedAsset.symbol)")
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundColor(.white)
                                
                                Text("Only send \(selectedAsset.symbol) to this address")
                                    .font(.system(size: 13))
                                    .foregroundColor(.white.opacity(0.6))
                                    .multilineTextAlignment(.center)
                            }
                        }
                        
                        // Address Display
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Your Address")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.white.opacity(0.7))
                            
                            HStack(spacing: 12) {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(walletAddress.prefix(20) + "...")
                                        .font(.system(size: 14, design: .monospaced))
                                        .foregroundColor(.white)
                                    
                                    Text(String(walletAddress.suffix(22)))
                                        .font(.system(size: 14, design: .monospaced))
                                        .foregroundColor(.white.opacity(0.7))
                                }
                                
                                Spacer()
                                
                                Button(action: {
                                    UIPasteboard.general.string = walletAddress
                                    
                                    HapticFeedbackManager.shared.mediumImpact()
                                    
                                    withAnimation {
                                        showCopied = true
                                    }
                                    
                                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                        withAnimation {
                                            showCopied = false
                                        }
                                    }
                                }) {
                                    HStack(spacing: 6) {
                                        Image(systemName: showCopied ? "checkmark" : "doc.on.doc")
                                            .font(.system(size: 14, weight: .semibold))
                                        Text(showCopied ? "Copied" : "Copy")
                                            .font(.system(size: 13, weight: .semibold))
                                    }
                                    .foregroundColor(showCopied ? hexColor("10B981") : hexColor("8B5CF6"))
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 10)
                                    .background(
                                        Capsule()
                                            .fill(
                                                showCopied ?
                                                hexColor("10B981").opacity(0.2) :
                                                hexColor("8B5CF6").opacity(0.2)
                                            )
                                    )
                                }
                            }
                            .padding(16)
                            .background(
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(
                                        LinearGradient(
                                            colors: [
                                                Color.white.opacity(0.12),
                                                Color.white.opacity(0.06)
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
                        }
                        .padding(.horizontal, 24)
                        
                        // Warning Banner
                        HStack(spacing: 12) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .font(.system(size: 18))
                                .foregroundColor(hexColor("F59E0B"))
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Important")
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(.white)
                                
                                Text("Only receive \(selectedAsset.symbol) or ERC-20 tokens on Ethereum network")
                                    .font(.system(size: 12))
                                    .foregroundColor(.white.opacity(0.7))
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                            
                            Spacer(minLength: 0)
                        }
                        .padding(16)
                        .background(
                            RoundedRectangle(cornerRadius: 16)
                                .fill(hexColor("F59E0B").opacity(0.15))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 16)
                                        .stroke(hexColor("F59E0B").opacity(0.3), lineWidth: 1)
                                )
                        )
                        .padding(.horizontal, 24)
                        
                        // Share Options
                        HStack(spacing: 12) {
                            ShareButton(icon: "square.and.arrow.up", title: "Share")
                            ShareButton(icon: "doc.on.doc", title: "Copy Link")
                        }
                        .padding(.horizontal, 24)
                    }
                    .padding(.bottom, 40)
                }
            }
        }
    }
    
    func generateQRCode(from string: String) -> UIImage? {
        let context = CIContext()
        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(string.utf8)
        filter.correctionLevel = "M"
        
        if let outputImage = filter.outputImage {
            let transform = CGAffineTransform(scaleX: 10, y: 10)
            let scaledImage = outputImage.transformed(by: transform)
            
            if let cgImage = context.createCGImage(scaledImage, from: scaledImage.extent) {
                return UIImage(cgImage: cgImage)
            }
        }
        return nil
    }
}

struct ShareButton: View {
    let icon: String
    let title: String
    
    var body: some View {
        Button(action: {
            HapticFeedbackManager.shared.lightImpact()
        }) {
            VStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 24))
                    .foregroundColor(.white)
                    .frame(width: 56, height: 56)
                    .background(
                        Circle()
                            .fill(
                                LinearGradient(
                                    colors: [
                                        hexColor("8B5CF6").opacity(0.3),
                                        hexColor("7C3AED").opacity(0.2)
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                    )
                
                Text(title)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.white)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(
                        LinearGradient(
                            colors: [
                                Color.white.opacity(0.08),
                                Color.white.opacity(0.04)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Color.white.opacity(0.15), lineWidth: 1)
                    )
            )
        }
    }
}

#if DEBUG
struct ReceiveView_Previews: PreviewProvider {
    static var previews: some View {
        let viewModel = WalletViewModel()
        // Create preview wallet using JSON decoding since Account and WalletInfo don't have public initializers
        let jsonString = """
        {
            "id": "preview",
            "accounts": [{
                "index": 0,
                "address": "0x0000000000000000000000000000000000000000",
                "public_key": "0x00",
                "chain_type": "EVM"
            }],
            "created_at": \(Date().timeIntervalSince1970)
        }
        """
        guard let jsonData = jsonString.data(using: .utf8),
              let wallet = try? JSONDecoder().decode(WalletInfo.self, from: jsonData) else {
            return Text("Preview Error")
        }
        return ReceiveView(viewModel: viewModel, wallet: wallet)
    }
}
#endif
