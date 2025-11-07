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

struct StakingView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var viewModel: WalletViewModel
    
    @State private var selectedAsset = "NOR"
    @State private var stakeAmount: String = ""
    @State private var selectedValidator: Validator?
    @State private var showValidatorList = false
    @State private var isStaking = false
    @State private var showSuccess = false
    
    let validators: [Validator] = [
        Validator(name: "Nor Foundation", commission: 5.0, apy: 12.5, totalStaked: "2.5M NOR", uptime: 99.9),
        Validator(name: "Staking.io", commission: 4.5, apy: 13.2, totalStaked: "1.8M NOR", uptime: 99.8),
        Validator(name: "Chorus One", commission: 6.0, apy: 11.8, totalStaked: "3.2M NOR", uptime: 99.7),
        Validator(name: "Figment", commission: 5.5, apy: 12.0, totalStaked: "2.1M NOR", uptime: 99.9),
    ]
    
    var body: some View {
        ZStack {
            AnimatedGradientBackground()
            
            ScrollView {
                VStack(spacing: 24) {
                    header
                    
                    statsCard
                    
                    stakeCard
                    
                    validatorCard
                    
                    activeStakesSection
                    
                    stakeButton
                }
                .padding(.horizontal, 20)
                .padding(.top, 60)
                .padding(.bottom, 100)
            }
        }
        .navigationBarHidden(true)
        .sheet(isPresented: $showValidatorList) {
            validatorListSheet
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
            
            Text("Staking")
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.white)
            
            Spacer()
            
            Button(action: {}) {
                ZStack {
                    Circle()
                        .fill(.ultraThinMaterial)
                        .frame(width: 40, height: 40)
                    
                    Image(systemName: "info.circle")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                }
            }
        }
    }
    
    var statsCard: some View {
        VStack(spacing: 20) {
            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Total Staked")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.6))
                    
                    Text("1,250.00 NOR")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("≈ $4,550.00")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.5))
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 8) {
                    Text("Est. APY")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.6))
                    
                    Text("12.5%")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(hexColor( "10B981"))
                }
            }
            
            Divider()
                .background(Color.white.opacity(0.1))
            
            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Rewards Earned")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.6))
                    
                    Text("25.43 NOR")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                }
                
                Spacer()
                
                Button(action: {}) {
                    Text("Claim")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(
                            LinearGradient(
                                colors: [hexColor( "8B5CF6"), hexColor( "7C3AED")],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(12)
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
    }
    
    var stakeCard: some View {
        VStack(spacing: 16) {
            HStack {
                Text("Stake Amount")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                
                Spacer()
                
                Text("Available: 2,450.00 NOR")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.white.opacity(0.5))
            }
            
            HStack(spacing: 12) {
                Circle()
                    .fill(hexColor( "8B5CF6"))
                    .frame(width: 40, height: 40)
                    .overlay {
                        Text("N")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.white)
                    }
                
                TextField("0.00", text: $stakeAmount)
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.white)
                    .keyboardType(.decimalPad)
                
                Text("NOR")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white.opacity(0.6))
            }
            
            if let amount = Double(stakeAmount), amount > 0 {
                Text("≈ $\(String(format: "%.2f", amount * 3.64))")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.5))
                    .frame(maxWidth: .infinity, alignment: .trailing)
            }
            
            HStack(spacing: 12) {
                ForEach(["25%", "50%", "75%", "Max"], id: \.self) { percentage in
                    Button(action: {
                        setPercentage(percentage)
                    }) {
                        Text(percentage)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(Color.white.opacity(0.1))
                            .cornerRadius(12)
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
    }
    
    var validatorCard: some View {
        VStack(spacing: 16) {
            HStack {
                Text("Select Validator")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                
                Spacer()
            }
            
            Button(action: { showValidatorList = true }) {
                HStack(spacing: 12) {
                    if let validator = selectedValidator {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(validator.name)
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.white)
                            
                            HStack(spacing: 8) {
                                Text("APY: \(String(format: "%.1f", validator.apy))%")
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(hexColor( "10B981"))
                                
                                Text("•")
                                    .foregroundColor(.white.opacity(0.3))
                                
                                Text("Fee: \(String(format: "%.1f", validator.commission))%")
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(.white.opacity(0.6))
                            }
                        }
                    } else {
                        Text("Choose a validator")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.white.opacity(0.6))
                    }
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white.opacity(0.6))
                }
                .padding(16)
                .background(Color.white.opacity(0.05))
                .cornerRadius(16)
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
    }
    
    var activeStakesSection: some View {
        VStack(spacing: 16) {
            HStack {
                Text("Active Stakes")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                
                Spacer()
            }
            
            VStack(spacing: 12) {
                ForEach(validators.prefix(2)) { validator in
                    HStack(spacing: 12) {
                        Circle()
                            .fill(hexColor( "8B5CF6").opacity(0.3))
                            .frame(width: 44, height: 44)
                            .overlay {
                                Text(String(validator.name.prefix(1)))
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(.white)
                            }
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(validator.name)
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.white)
                            
                            Text("625.00 NOR staked")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.white.opacity(0.5))
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .trailing, spacing: 4) {
                            Text("+12.71 NOR")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(hexColor( "10B981"))
                            
                            Text("Rewards")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.white.opacity(0.5))
                        }
                    }
                    .padding(16)
                    .background(Color.white.opacity(0.05))
                    .cornerRadius(16)
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
    }
    
    var stakeButton: some View {
        Button(action: executeStake) {
            HStack {
                if isStaking {
                    ProgressView()
                        .tint(.white)
                } else {
                    Text("Stake Now")
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
        .disabled(stakeAmount.isEmpty || Double(stakeAmount) ?? 0 <= 0 || selectedValidator == nil || isStaking)
        .opacity((stakeAmount.isEmpty || Double(stakeAmount) ?? 0 <= 0 || selectedValidator == nil || isStaking) ? 0.5 : 1)
    }
    
    var validatorListSheet: some View {
        ZStack {
            Color.black.opacity(0.95)
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("Select Validator")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Button(action: { showValidatorList = false }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 28))
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
                .padding(.bottom, 24)
                
                ScrollView {
                    VStack(spacing: 12) {
                        ForEach(validators) { validator in
                            Button(action: {
                                selectedValidator = validator
                                showValidatorList = false
                            }) {
                                VStack(spacing: 12) {
                                    HStack(spacing: 12) {
                                        Circle()
                                            .fill(hexColor( "8B5CF6").opacity(0.3))
                                            .frame(width: 48, height: 48)
                                            .overlay {
                                                Text(String(validator.name.prefix(1)))
                                                    .font(.system(size: 20, weight: .bold))
                                                    .foregroundColor(.white)
                                            }
                                        
                                        VStack(alignment: .leading, spacing: 4) {
                                            Text(validator.name)
                                                .font(.system(size: 16, weight: .semibold))
                                                .foregroundColor(.white)
                                            
                                            HStack(spacing: 8) {
                                                HStack(spacing: 4) {
                                                    Image(systemName: "chart.line.uptrend.xyaxis")
                                                        .font(.system(size: 10))
                                                    Text("\(String(format: "%.1f", validator.apy))% APY")
                                                        .font(.system(size: 12, weight: .medium))
                                                }
                                                .foregroundColor(hexColor( "10B981"))
                                                
                                                Text("•")
                                                    .foregroundColor(.white.opacity(0.3))
                                                
                                                Text("\(String(format: "%.1f", validator.commission))% fee")
                                                    .font(.system(size: 12, weight: .medium))
                                                    .foregroundColor(.white.opacity(0.6))
                                            }
                                        }
                                        
                                        Spacer()
                                        
                                        if selectedValidator?.id == validator.id {
                                            Image(systemName: "checkmark.circle.fill")
                                                .font(.system(size: 24))
                                                .foregroundColor(hexColor( "8B5CF6"))
                                        }
                                    }
                                    
                                    Divider()
                                        .background(Color.white.opacity(0.1))
                                    
                                    HStack(spacing: 16) {
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text("Total Staked")
                                                .font(.system(size: 10, weight: .medium))
                                                .foregroundColor(.white.opacity(0.5))
                                            Text(validator.totalStaked)
                                                .font(.system(size: 12, weight: .semibold))
                                                .foregroundColor(.white)
                                        }
                                        
                                        Spacer()
                                        
                                        VStack(alignment: .trailing, spacing: 2) {
                                            Text("Uptime")
                                                .font(.system(size: 10, weight: .medium))
                                                .foregroundColor(.white.opacity(0.5))
                                            Text("\(String(format: "%.1f", validator.uptime))%")
                                                .font(.system(size: 12, weight: .semibold))
                                                .foregroundColor(hexColor( "10B981"))
                                        }
                                    }
                                }
                                .padding(16)
                                .background(
                                    RoundedRectangle(cornerRadius: 16)
                                        .fill(.ultraThinMaterial)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 16)
                                                .stroke(
                                                    selectedValidator?.id == validator.id ?
                                                    hexColor( "8B5CF6") : Color.white.opacity(0.1),
                                                    lineWidth: selectedValidator?.id == validator.id ? 2 : 1
                                                )
                                        )
                                )
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 40)
                }
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
                    Text("Staking Successful!")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("Staked \(stakeAmount) NOR with \(selectedValidator?.name ?? "")")
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
    
    func setPercentage(_ percentage: String) {
        let available = 2450.00
        var multiplier = 0.0
        
        switch percentage {
        case "25%": multiplier = 0.25
        case "50%": multiplier = 0.5
        case "75%": multiplier = 0.75
        case "Max": multiplier = 1.0
        default: break
        }
        
        stakeAmount = String(format: "%.2f", available * multiplier)
    }
    
    func executeStake() {
        isStaking = true
        
        HapticFeedbackManager.shared.heavyImpact()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            isStaking = false
            HapticFeedbackManager.shared.success()
            ToastManager.shared.showSuccess("Staking completed successfully!")
            
            withAnimation(AnimationPresets.smoothSpring) {
                showSuccess = true
            }
        }
    }
}

struct Validator: Identifiable {
    let id = UUID()
    let name: String
    let commission: Double
    let apy: Double
    let totalStaked: String
    let uptime: Double
}

struct AnimatedGradientBackground: View {
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
            
            GeometryReader { geometry in
                Circle()
                    .fill(hexColor( "7C3AED").opacity(0.3))
                    .frame(width: 300, height: 300)
                    .blur(radius: 100)
                    .offset(x: -100, y: -100)
                
                Circle()
                    .fill(hexColor( "EC4899").opacity(0.2))
                    .frame(width: 250, height: 250)
                    .blur(radius: 80)
                    .offset(x: geometry.size.width - 150, y: geometry.size.height - 200)
            }
        }
    }
}
