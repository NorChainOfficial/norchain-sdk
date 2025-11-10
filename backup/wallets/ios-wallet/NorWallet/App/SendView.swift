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
import NorCore

struct SendView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var viewModel: WalletViewModel
    
    @State private var recipientAddress = ""
    @State private var amount = ""
    @State private var selectedAsset: Asset
    @State private var showScanner = false
    @State private var showAssetPicker = false
    @State private var gasPrice = "Standard"
    @State private var estimatedFee = "$0.42"
    @State private var showSuccessAlert = false
    @State private var showErrorAlert = false
    @State private var transactionHash: String?
    
    init(viewModel: WalletViewModel, selectedAsset: Asset? = nil) {
        self.viewModel = viewModel
        _selectedAsset = State(initialValue: selectedAsset ?? viewModel.assets.first ?? Asset(
            symbol: "NOR",
            name: "NOR",
            balance: "0",
            usdValue: "$0",
            change: "+0%",
            color: hexColor( "8B5CF6"),
            chartData: []
        ))
    }
    
    var body: some View {
        ZStack {
            // Background
            LinearGradient(
                gradient: Gradient(colors: [
                    hexColor( "5B47ED"),
                    hexColor( "2D1B69"),
                    hexColor( "1A0F3D")
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
                    
                    Text("Send")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Button(action: { showScanner = true }) {
                        Image(systemName: "qrcode.viewfinder")
                            .font(.system(size: 20, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(width: 44, height: 44)
                            .background(
                                Circle()
                                    .fill(Color.white.opacity(0.1))
                            )
                    }
                }
                .padding(.horizontal, 24)
                .padding(.top, 20)
                .padding(.bottom, 24)
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 24) {
                        // Asset Selector
                        Button(action: { showAssetPicker = true }) {
                            HStack(spacing: 16) {
                                ZStack {
                                    Circle()
                                        .fill(
                                            LinearGradient(
                                                colors: [selectedAsset.color.opacity(0.3), selectedAsset.color.opacity(0.1)],
                                                startPoint: .topLeading,
                                                endPoint: .bottomTrailing
                                            )
                                        )
                                        .frame(width: 48, height: 48)
                                    
                                    Text(selectedAsset.symbol.prefix(1))
                                        .font(.system(size: 20, weight: .bold))
                                        .foregroundColor(.white)
                                }
                                
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(selectedAsset.name)
                                        .font(.system(size: 16, weight: .semibold))
                                        .foregroundColor(.white)
                                    
                                    Text("Balance: \(selectedAsset.balance) \(selectedAsset.symbol)")
                                        .font(.system(size: 13))
                                        .foregroundColor(.white.opacity(0.6))
                                }
                                
                                Spacer()
                                
                                Image(systemName: "chevron.down")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.white.opacity(0.6))
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
                        
                        // Recipient Address
                        VStack(alignment: .leading, spacing: 12) {
                            Text("To")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.white.opacity(0.7))
                            
                            HStack(spacing: 12) {
                                TextField("Enter address or ENS", text: $recipientAddress)
                                    .foregroundColor(.white)
                                    .font(.system(size: 15))
                                    .autocapitalization(.none)
                                    .disableAutocorrection(true)
                                
                                Button(action: {
                                    HapticFeedbackManager.shared.lightImpact()
                                    if let clipboard = UIPasteboard.general.string {
                                        recipientAddress = clipboard
                                        ToastManager.shared.showSuccess("Address pasted")
                                    }
                                }) {
                                    Image(systemName: "doc.on.clipboard")
                                        .font(.system(size: 18))
                                        .foregroundColor(hexColor( "8B5CF6"))
                                }
                            }
                            .padding(16)
                            .background(
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(Color.white.opacity(0.08))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 16)
                                            .stroke(Color.white.opacity(0.15), lineWidth: 1)
                                    )
                            )
                        }
                        .padding(.horizontal, 24)
                        
                        // Amount Input
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text("Amount")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.white.opacity(0.7))
                                
                                Spacer()
                                
                                Button(action: {
                                    HapticFeedbackManager.shared.lightImpact()
                                    withAnimation(AnimationPresets.quickSpring) {
                                        amount = selectedAsset.balance.replacingOccurrences(of: ",", with: "")
                                    }
                                }) {
                                    Text("MAX")
                                        .font(.system(size: 12, weight: .bold))
                                        .foregroundColor(hexColor( "8B5CF6"))
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 6)
                                        .background(
                                            Capsule()
                                                .fill(hexColor( "8B5CF6").opacity(0.2))
                                        )
                                }
                            }
                            
                            VStack(spacing: 8) {
                                HStack(spacing: 12) {
                                    TextField("0.0", text: $amount)
                                        .foregroundColor(.white)
                                        .font(.system(size: 32, weight: .bold, design: .rounded))
                                        .keyboardType(.decimalPad)
                                    
                                    Text(selectedAsset.symbol)
                                        .font(.system(size: 20, weight: .semibold))
                                        .foregroundColor(.white.opacity(0.6))
                                }
                                
                                if !amount.isEmpty, let amountValue = Double(amount) {
                                    Text("≈ $\(String(format: "%.2f", amountValue * 3.64))")
                                        .font(.system(size: 14))
                                        .foregroundColor(.white.opacity(0.5))
                                }
                            }
                            .padding(20)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(
                                RoundedRectangle(cornerRadius: 20)
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
                                        RoundedRectangle(cornerRadius: 20)
                                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                                    )
                            )
                        }
                        .padding(.horizontal, 24)
                        
                        // Gas Fee
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Network Fee")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.white.opacity(0.7))
                            
                            HStack(spacing: 12) {
                                ForEach(["Slow", "Standard", "Fast"], id: \.self) { speed in
                                    GasFeeOption(
                                        title: speed,
                                        time: speed == "Slow" ? "~30s" : speed == "Standard" ? "~15s" : "~5s",
                                        fee: speed == "Slow" ? "$0.21" : speed == "Standard" ? "$0.42" : "$0.85",
                                        isSelected: gasPrice == speed
                                    )
                                    .onTapGesture {
                                        HapticFeedbackManager.shared.selection()
                                        withAnimation(AnimationPresets.quickSpring) {
                                            gasPrice = speed
                                            estimatedFee = speed == "Slow" ? "$0.21" : speed == "Standard" ? "$0.42" : "$0.85"
                                        }
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, 24)
                        
                        // Transaction Summary
                        VStack(spacing: 16) {
                            HStack {
                                Text("Total Amount")
                                    .font(.system(size: 14))
                                    .foregroundColor(.white.opacity(0.7))
                                Spacer()
                                VStack(alignment: .trailing, spacing: 2) {
                                    Text("\(amount.isEmpty ? "0.0" : amount) \(selectedAsset.symbol)")
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundColor(.white)
                                    Text(estimatedFee)
                                        .font(.system(size: 12))
                                        .foregroundColor(.white.opacity(0.5))
                                }
                            }
                            
                            Divider()
                                .background(Color.white.opacity(0.1))
                            
                            HStack {
                                Text("You'll Send")
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundColor(.white)
                                Spacer()
                                Text("\(amount.isEmpty ? "0.0" : amount) \(selectedAsset.symbol)")
                                    .font(.system(size: 16, weight: .bold, design: .rounded))
                                    .foregroundColor(.white)
                            }
                        }
                        .padding(20)
                        .background(
                            RoundedRectangle(cornerRadius: 16)
                                .fill(Color.white.opacity(0.08))
                        )
                        .padding(.horizontal, 24)
                    }
                    .padding(.bottom, 120)
                }
                
                Spacer()
            }
            
            // Send Button
            VStack {
                Spacer()
                
                Button(action: {
                    sendTransaction()
                }) {
                    HStack(spacing: 12) {
                        if viewModel.isSending {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(0.8)
                        } else {
                            Image(systemName: "paperplane.fill")
                        }
                        Text(viewModel.isSending ? "Sending..." : "Send \(selectedAsset.symbol)")
                            .font(.system(size: 17, weight: .semibold))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 18)
                    .background(
                        LinearGradient(
                            colors: [hexColor( "8B5CF6"), hexColor( "7C3AED")],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .foregroundColor(.white)
                    .cornerRadius(16)
                    .shadow(color: hexColor( "7C3AED").opacity(0.5), radius: 20, y: 10)
                }
                .disabled(recipientAddress.isEmpty || amount.isEmpty || viewModel.isSending)
                .opacity(recipientAddress.isEmpty || amount.isEmpty || viewModel.isSending ? 0.5 : 1.0)
                .padding(.horizontal, 24)
                .padding(.bottom, 32)
            }
        }
        .sheet(isPresented: $showAssetPicker) {
            AssetPickerView(selectedAsset: $selectedAsset, assets: viewModel.assets)
        }
        .alert("Transaction Sent", isPresented: $showSuccessAlert) {
            Button("OK") {
                dismiss()
            }
        } message: {
            if let hash = transactionHash {
                Text("Transaction hash: \(hash.prefix(10))...")
            } else {
                Text("Transaction sent successfully!")
            }
        }
        .alert("Error", isPresented: $showErrorAlert) {
            Button("OK") { }
        } message: {
            Text(viewModel.errorMessage.isEmpty ? "Failed to send transaction" : viewModel.errorMessage)
        }
    }
    
    private func sendTransaction() {
        // Validate inputs
        guard !recipientAddress.isEmpty,
              !amount.isEmpty,
              recipientAddress.hasPrefix("0x") || recipientAddress.hasPrefix("0X"),
              recipientAddress.count == 42 else {
            viewModel.errorMessage = "Invalid recipient address"
            showErrorAlert = true
            return
        }
        
        guard let amountValue = Double(amount), amountValue > 0 else {
            viewModel.errorMessage = "Invalid amount"
            showErrorAlert = true
            return
        }
        
        HapticFeedbackManager.shared.mediumImpact()
        
        viewModel.sendTransaction(
            to: recipientAddress,
            amount: amount,
            assetSymbol: selectedAsset.symbol,
            gasPrice: gasPrice
        ) { result in
            switch result {
            case .success(let hash):
                transactionHash = hash
                HapticFeedbackManager.shared.success()
                ToastManager.shared.showSuccess("Transaction sent successfully!")
                showSuccessAlert = true
            case .failure(let error):
                viewModel.errorMessage = error.localizedDescription
                HapticFeedbackManager.shared.error()
                ToastManager.shared.showError(error.localizedDescription)
                showErrorAlert = true
            }
        }
    }
}

struct GasFeeOption: View {
    let title: String
    let time: String
    let fee: String
    let isSelected: Bool
    
    var body: some View {
        VStack(spacing: 8) {
            Text(title)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(isSelected ? .white : .white.opacity(0.6))
            
            Text(time)
                .font(.system(size: 10))
                .foregroundColor(isSelected ? .white.opacity(0.7) : .white.opacity(0.4))
            
            Text(fee)
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(isSelected ? hexColor( "10B981") : .white.opacity(0.5))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(
                    LinearGradient(
                        colors: isSelected ? [
                            hexColor( "8B5CF6").opacity(0.3),
                            hexColor( "7C3AED").opacity(0.2)
                        ] : [
                            Color.white.opacity(0.08),
                            Color.white.opacity(0.04)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(
                            isSelected ? hexColor( "8B5CF6").opacity(0.5) : Color.white.opacity(0.15),
                            lineWidth: isSelected ? 2 : 1
                        )
                )
        )
    }
}

struct AssetPickerView: View {
    @Environment(\.dismiss) var dismiss
    @Binding var selectedAsset: Asset
    let assets: [Asset]
    
    var body: some View {
        ZStack {
            LinearGradient(
                gradient: Gradient(colors: [
                    hexColor( "5B47ED"),
                    hexColor( "2D1B69"),
                    hexColor( "1A0F3D")
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("Select Asset")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 20)
                
                ScrollView {
                    VStack(spacing: 12) {
                        ForEach(assets) { asset in
                            Button(action: {
                                selectedAsset = asset
                                dismiss()
                            }) {
                                HStack(spacing: 16) {
                                    ZStack {
                                        Circle()
                                            .fill(
                                                LinearGradient(
                                                    colors: [asset.color.opacity(0.3), asset.color.opacity(0.1)],
                                                    startPoint: .topLeading,
                                                    endPoint: .bottomTrailing
                                                )
                                            )
                                            .frame(width: 48, height: 48)
                                        
                                        Text(asset.symbol.prefix(1))
                                            .font(.system(size: 20, weight: .bold))
                                            .foregroundColor(.white)
                                    }
                                    
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(asset.name)
                                            .font(.system(size: 16, weight: .semibold))
                                            .foregroundColor(.white)
                                        
                                        Text("\(asset.balance) \(asset.symbol)")
                                            .font(.system(size: 13))
                                            .foregroundColor(.white.opacity(0.6))
                                    }
                                    
                                    Spacer()
                                    
                                    if selectedAsset.id == asset.id {
                                        Image(systemName: "checkmark.circle.fill")
                                            .font(.system(size: 24))
                                            .foregroundColor(hexColor( "10B981"))
                                    }
                                }
                                .padding(16)
                                .background(
                                    RoundedRectangle(cornerRadius: 16)
                                        .fill(
                                            LinearGradient(
                                                colors: [
                                                    Color.white.opacity(selectedAsset.id == asset.id ? 0.15 : 0.08),
                                                    Color.white.opacity(selectedAsset.id == asset.id ? 0.08 : 0.04)
                                                ],
                                                startPoint: .topLeading,
                                                endPoint: .bottomTrailing
                                            )
                                        )
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 16)
                                                .stroke(Color.white.opacity(selectedAsset.id == asset.id ? 0.3 : 0.15), lineWidth: 1)
                                        )
                                )
                            }
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.bottom, 32)
                }
            }
        }
    }
}

#if DEBUG
#Preview {
    SendView(viewModel: WalletViewModel())
}
#endif
