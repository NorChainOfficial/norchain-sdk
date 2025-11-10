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

struct CreateWalletSheet: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var viewModel: WalletViewModel
    
    @State private var isCreating = false
    @State private var showError = false
    @State private var errorMessage = ""
    
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
            
            VStack(spacing: 40) {
                Spacer()
                
                // Icon
                ZStack {
                    Circle()
                        .fill(hexColor( "8B5CF6").opacity(0.2))
                        .frame(width: 120, height: 120)
                        .blur(radius: 20)
                    
                    Circle()
                        .fill(.ultraThinMaterial)
                        .frame(width: 100, height: 100)
                    
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 44))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [hexColor( "8B5CF6"), hexColor( "7C3AED")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                }
                
                VStack(spacing: 16) {
                    Text("Create New Wallet")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("A new wallet will be created for you.\nMake sure to backup your recovery phrase.")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                }
                
                Spacer()
                
                // Buttons
                VStack(spacing: 16) {
                    Button(action: createWallet) {
                        HStack {
                            if isCreating {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Text("Create Wallet")
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
                    .disabled(isCreating)
                    
                    Button(action: { dismiss() }) {
                        Text("Cancel")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white.opacity(0.7))
                            .frame(height: 44)
                    }
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 40)
            }
        }
        .alert("Error", isPresented: $showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage)
        }
    }
    
    func createWallet() {
        isCreating = true
        
        HapticFeedbackManager.shared.heavyImpact()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            print("Attempting to create wallet...")
            let wallet = NorCore.createWallet()
            print("Wallet creation result: \(wallet != nil)")
            
            if let wallet = wallet {
                print("Wallet ID: \(wallet.id)")
                print("Wallet accounts count: \(wallet.accounts.count)")
                self.viewModel.currentWallet = wallet
                self.viewModel.loadDummyAssets()
                
                HapticFeedbackManager.shared.success()
                ToastManager.shared.showSuccess("Wallet created successfully!")
                
                self.dismiss()
            } else {
                print("Failed to create wallet")
                self.errorMessage = "Failed to create wallet. Please try again."
                self.showError = true
                
                HapticFeedbackManager.shared.error()
                ToastManager.shared.showError(errorMessage)
            }
            
            self.isCreating = false
        }
    }
}

#if DEBUG
#Preview {
    CreateWalletSheet(viewModel: WalletViewModel())
}
#endif
