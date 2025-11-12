import SwiftUI
import CoreImage.CIFilterBuiltins
import NorCore

struct ReceiveView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var viewModel: WalletViewModel
    let wallet: NorCore.WalletInfo
    
    @State private var selectedAsset: Asset
    @State private var showCopied = false
    
    init(viewModel: WalletViewModel, wallet: NorCore.WalletInfo, selectedAsset: Asset? = nil) {
        self.viewModel = viewModel
        self.wallet = wallet
        _selectedAsset = State(initialValue: selectedAsset ?? viewModel.assets.first ?? Asset(
            symbol: "NOR",
            name: "Nor Coin",
            balance: "0",
            usdValue: "$0",
            change: "+0%",
            color: Color(hex: "8B5CF6"),
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
                    Color(hex: "5B47ED"),
                    Color(hex: "2D1B69"),
                    Color(hex: "1A0F3D")
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                HStack {
                    Button(action: { dismiss() }) {
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
                    
                    Text("Receive")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    // Placeholder for symmetry
                    Color.clear
                        .frame(width: 44, height: 44)
                }
                .padding(.horizontal, 24)
                .padding(.top, 20)
                .padding(.bottom, 24)
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 32) {
                        // QR Code
                        VStack(spacing: 20) {
                            ZStack {
                                // Glow effect
                                RoundedRectangle(cornerRadius: 32)
                                    .fill(
                                        RadialGradient(
                                            colors: [
                                                Color(hex: "A78BFA").opacity(0.4),
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
                                    Text(walletAddress.prefix(20) + + "..."
                                        .font(.system(size: 14, design: .monospaced))
                                        .foregroundColor(.white)
                                    
                                    Text(String(walletAddress.suffix(22)))
                                        .font(.system(size: 14, design: .monospaced))
                                        .foregroundColor(.white.opacity(0.7))
                                }
                                
                                Spacer()
                                
                                Button(action: {
                                    UIPasteboard.general.string = walletAddress
                                    
                                    let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                                    impactFeedback.impactOccurred()
                                    
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
                                    .foregroundColor(showCopied ? Color(hex: "10B981") : Color(hex: "8B5CF6"))
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 10)
                                    .background(
                                        Capsule()
                                            .fill(
                                                showCopied ?
                                                Color(hex: "10B981").opacity(0.2) :
                                                Color(hex: "8B5CF6").opacity(0.2)
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
                                .foregroundColor(Color(hex: "F59E0B"))
                            
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
                                .fill(Color(hex: "F59E0B").opacity(0.15))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 16)
                                        .stroke(Color(hex: "F59E0B").opacity(0.3), lineWidth: 1)
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
            let impactFeedback = UIImpactFeedbackGenerator(style: .light)
            impactFeedback.impactOccurred()
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
                                        Color(hex: "8B5CF6").opacity(0.3),
                                        Color(hex: "7C3AED").opacity(0.2)
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
#Preview {
    ReceiveView(viewModel: WalletViewModel())
}
#endif
