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

struct SwapView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var viewModel: WalletViewModel
    
    @State private var fromAsset: Asset
    @State private var toAsset: Asset
    @State private var fromAmount: String = ""
    @State private var toAmount: String = "0.00"
    @State private var slippage: Double = 0.5
    @State private var showSlippageSettings = false
    @State private var isSwapping = false
    @State private var showSuccess = false
    @State private var priceImpact: Double = 0.12
    @State private var exchangeRate: Double = 3.64
    
    init(viewModel: WalletViewModel) {
        self.viewModel = viewModel
        let assets = viewModel.assets
        _fromAsset = State(initialValue: assets.first ?? Asset(
            symbol: "NOR",
            name: "NOR",
            balance: "0",
            usdValue: "$0",
            change: "+0%",
            color: hexColor( "8B5CF6"),
            chartData: []
        ))
        _toAsset = State(initialValue: assets.count > 1 ? assets[1] : Asset(
            symbol: "ETH",
            name: "Ethereum",
            balance: "0",
            usdValue: "$0",
            change: "+0%",
            color: hexColor( "627EEA"),
            chartData: []
        ))
    }
    
    var body: some View {
        ZStack {
            // Animated background
            AnimatedGradientBackground()
            
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    header
                    
                    // Swap card
                    swapCard
                    
                    // Swap details
                    swapDetails
                    
                    // Swap button
                    swapButton
                }
                .padding(.horizontal, 20)
                .padding(.top, 60)
                .padding(.bottom, 100)
            }
        }
        .navigationBarHidden(true)
        .sheet(isPresented: $showSlippageSettings) {
            slippageSettingsSheet
        }
        .overlay {
            if showSuccess {
                successOverlay
            }
        }
    }
    
    var header: some View {
        HStack {
            Button(action: { dismiss() }) {
                ZStack {
                    Circle()
                        .fill(.ultraThinMaterial)
                        .frame(width: 40, height: 40)
                    
                    Image(systemName: "chevron.left")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                }
            }
            
            Spacer()
            
            Text("Swap")
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.white)
            
            Spacer()
            
            Button(action: { showSlippageSettings = true }) {
                ZStack {
                    Circle()
                        .fill(.ultraThinMaterial)
                        .frame(width: 40, height: 40)
                    
                    Image(systemName: "slider.horizontal.3")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                }
            }
        }
    }
    
    var swapCard: some View {
        VStack(spacing: 0) {
            // From section
            VStack(spacing: 12) {
                HStack {
                    Text("From")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.6))
                    
                    Spacer()
                    
                    Text("Balance: \(fromAsset.balance)")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.5))
                }
                
                HStack(spacing: 12) {
                    // Asset selector
                    Button(action: {}) {
                        HStack(spacing: 8) {
                            Circle()
                                .fill(fromAsset.color)
                                .frame(width: 32, height: 32)
                                .overlay {
                                    Text(String(fromAsset.symbol.prefix(1)))
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(.white)
                                }
                            
                            Text(fromAsset.symbol)
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.white)
                            
                            Image(systemName: "chevron.down")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(.white.opacity(0.6))
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(.ultraThinMaterial)
                        .cornerRadius(20)
                    }
                    
                    Spacer()
                    
                    // Amount input
                    VStack(alignment: .trailing, spacing: 4) {
                        TextField("0.00", text: $fromAmount)
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white)
                            .multilineTextAlignment(.trailing)
                            .keyboardType(.decimalPad)
                            .onChange(of: fromAmount) { newValue in
                                withAnimation(AnimationPresets.quickEase) {
                                    calculateToAmount()
                                }
                            }
                        
                        if let amount = Double(fromAmount), amount > 0 {
                            Text("≈ $\(String(format: "%.2f", amount * 3.64))")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.white.opacity(0.5))
                        }
                    }
                }
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(Color.white.opacity(0.1), lineWidth: 1)
                    )
            )
            
            // Swap direction button
            Button(action: swapAssets) {
                ZStack {
                    Circle()
                        .fill(hexColor( "8B5CF6"))
                        .frame(width: 48, height: 48)
                        .shadow(color: hexColor( "8B5CF6").opacity(0.5), radius: 10, x: 0, y: 5)
                    
                    Image(systemName: "arrow.up.arrow.down")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                }
            }
            .offset(y: -24)
            .zIndex(1)
            
            // To section
            VStack(spacing: 12) {
                HStack {
                    Text("To")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.6))
                    
                    Spacer()
                    
                    Text("Balance: \(toAsset.balance)")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.5))
                }
                
                HStack(spacing: 12) {
                    // Asset selector
                    Button(action: {}) {
                        HStack(spacing: 8) {
                            Circle()
                                .fill(toAsset.color)
                                .frame(width: 32, height: 32)
                                .overlay {
                                    Text(String(toAsset.symbol.prefix(1)))
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(.white)
                                }
                            
                            Text(toAsset.symbol)
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.white)
                            
                            Image(systemName: "chevron.down")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(.white.opacity(0.6))
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(.ultraThinMaterial)
                        .cornerRadius(20)
                    }
                    
                    Spacer()
                    
                    // Amount display
                    VStack(alignment: .trailing, spacing: 4) {
                        Text(toAmount)
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white)
                        
                        if let amount = Double(toAmount), amount > 0 {
                            Text("≈ $\(String(format: "%.2f", amount * 2285.50))")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.white.opacity(0.5))
                        }
                    }
                }
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(Color.white.opacity(0.1), lineWidth: 1)
                    )
            )
            .offset(y: -48)
        }
    }
    
    var swapDetails: some View {
        VStack(spacing: 16) {
            HStack {
                Text("Rate")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.6))
                
                Spacer()
                
                Text("1 \(fromAsset.symbol) = \(String(format: "%.4f", exchangeRate)) \(toAsset.symbol)")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)
            }
            
            HStack {
                Text("Price Impact")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.6))
                
                Spacer()
                
                Text("\(String(format: "%.2f", priceImpact))%")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(priceImpact > 3 ? hexColor( "EF4444") : hexColor( "10B981"))
            }
            
            HStack {
                Text("Slippage Tolerance")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.6))
                
                Spacer()
                
                Text("\(String(format: "%.1f", slippage))%")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)
            }
            
            HStack {
                Text("Network Fee")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.6))
                
                Spacer()
                
                Text("~$0.52")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                )
        )
        .offset(y: -48)
    }
    
    var swapButton: some View {
        Button(action: executeSwap) {
            HStack {
                if isSwapping {
                    ProgressView()
                        .tint(.white)
                } else {
                    Text("Swap")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .background(
                LinearGradient(
                    colors: [hexColor( "8B5CF6"), hexColor( "7C3AED")],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .cornerRadius(16)
            .shadow(color: hexColor( "8B5CF6").opacity(0.5), radius: 20, x: 0, y: 10)
        }
        .disabled(fromAmount.isEmpty || Double(fromAmount) ?? 0 <= 0 || isSwapping)
        .opacity((fromAmount.isEmpty || Double(fromAmount) ?? 0 <= 0 || isSwapping) ? 0.5 : 1)
        .offset(y: -48)
    }
    
    var slippageSettingsSheet: some View {
        ZStack {
            Color.black.opacity(0.95)
                .ignoresSafeArea()
            
            VStack(spacing: 24) {
                // Header
                HStack {
                    Text("Slippage Settings")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Button(action: { showSlippageSettings = false }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 28))
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
                
                VStack(spacing: 16) {
                    Text("Slippage Tolerance: \(String(format: "%.1f", slippage))%")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                    
                    Slider(value: $slippage, in: 0.1...5.0, step: 0.1)
                        .tint(hexColor( "8B5CF6"))
                        .padding(.horizontal, 20)
                    
                    HStack(spacing: 12) {
                        ForEach([0.5, 1.0, 2.0, 5.0], id: \.self) { value in
                            Button(action: {
                                HapticFeedbackManager.shared.selection()
                                withAnimation(AnimationPresets.quickSpring) {
                                    slippage = value
                                }
                            }) {
                                Text("\(String(format: "%.1f", value))%")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(slippage == value ? .white : .white.opacity(0.6))
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 10)
                                    .background(
                                        slippage == value ?
                                        hexColor( "8B5CF6") :
                                        Color.white.opacity(0.1)
                                    )
                                    .cornerRadius(12)
                            }
                        }
                    }
                    
                    Text("Higher slippage tolerance = lower chance of transaction failure")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.5))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                }
                .padding(20)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(.ultraThinMaterial)
                )
                .padding(.horizontal, 20)
                
                Spacer()
            }
        }
    }
    
    var successOverlay: some View {
        ZStack {
            Color.black.opacity(0.8)
                .ignoresSafeArea()
            
            VStack(spacing: 24) {
                ZStack {
                    Circle()
                        .fill(hexColor( "10B981").opacity(0.2))
                        .frame(width: 100, height: 100)
                    
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 60))
                        .foregroundColor(hexColor( "10B981"))
                }
                
                VStack(spacing: 8) {
                    Text("Swap Successful!")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("Swapped \(fromAmount) \(fromAsset.symbol) to \(toAmount) \(toAsset.symbol)")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                        .multilineTextAlignment(.center)
                }
                
                Button(action: {
                    showSuccess = false
                    dismiss()
                }) {
                    Text("Done")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(width: 120, height: 44)
                        .background(hexColor( "8B5CF6"))
                        .cornerRadius(12)
                }
            }
            .padding(40)
            .background(
                RoundedRectangle(cornerRadius: 24)
                    .fill(.ultraThinMaterial)
            )
            .padding(.horizontal, 40)
        }
    }
    
    func calculateToAmount() {
        guard let from = Double(fromAmount), from > 0 else {
            toAmount = "0.00"
            return
        }
        
        let to = from * exchangeRate
        toAmount = String(format: "%.6f", to)
    }
    
    func swapAssets() {
        HapticFeedbackManager.shared.mediumImpact()
        
        withAnimation(AnimationPresets.bouncySpring) {
            let temp = fromAsset
            fromAsset = toAsset
            toAsset = temp
            
            exchangeRate = 1.0 / exchangeRate
            calculateToAmount()
        }
    }
    
    func executeSwap() {
        HapticFeedbackManager.shared.heavyImpact()
        isSwapping = true
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            isSwapping = false
            HapticFeedbackManager.shared.success()
            ToastManager.shared.showSuccess("Swap completed successfully!")
            
            withAnimation(AnimationPresets.smoothSpring) {
                showSuccess = true
            }
        }
    }
}
