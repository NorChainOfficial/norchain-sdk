import SwiftUI
import NorCore

// Helper function for hex colors
private func hexColor(_ hex: String) -> Color {
    let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
    var int: UInt64 = 0
    Scanner(string: hex).scanHexInt64(&int)
    let r, g, b: UInt64
    switch hex.count {
    case 3: // RGB (12-bit)
        (r, g, b) = ((int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
    case 6: // RGB (24-bit)
        (r, g, b) = (int >> 16, int >> 8 & 0xFF, int & 0xFF)
    default:
        (r, g, b) = (0, 0, 0)
    }
    return Color(red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255)
}

struct ImportWalletSheet: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var viewModel: WalletViewModel
    
    @State private var mnemonic: String = ""
    @State private var isImporting = false
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
            
            ScrollView {
                VStack(spacing: 32) {
                    // Header
                    HStack {
                        Button(action: { dismiss() }) {
                            ZStack {
                                Circle()
                                    .fill(.ultraThinMaterial)
                                    .frame(width: 40, height: 40)
                                
                                Image(systemName: "xmark")
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundColor(.white)
                            }
                        }
                        
                        Spacer()
                        
                        Text("Import Wallet")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(.white)
                        
                        Spacer()
                        
                        Circle()
                            .fill(Color.clear)
                            .frame(width: 40, height: 40)
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 60)
                    
                    // Info card
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 12) {
                            Image(systemName: "info.circle.fill")
                                .font(.system(size: 24))
                                .foregroundColor(hexColor( "60A5FA"))
                            
                            Text("Recovery Phrase")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(.white)
                        }
                        
                        Text("Enter your 12 or 24-word recovery phrase to restore your wallet.")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.white.opacity(0.7))
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(20)
                    .background(
                        RoundedRectangle(cornerRadius: 20)
                            .fill(.ultraThinMaterial)
                            .overlay(
                                RoundedRectangle(cornerRadius: 20)
                                    .stroke(hexColor( "60A5FA").opacity(0.3), lineWidth: 1)
                            )
                    )
                    .padding(.horizontal, 24)
                    
                    // Mnemonic input
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Recovery Phrase")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white.opacity(0.7))
                            .padding(.horizontal, 24)
                        
                        ZStack(alignment: .topLeading) {
                            if mnemonic.isEmpty {
                                Text("Enter your recovery phrase\nSeparate each word with a space")
                                    .font(.system(size: 15, weight: .medium))
                                    .foregroundColor(.white.opacity(0.4))
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 16)
                            }
                            
                            TextEditor(text: $mnemonic)
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(.white)
                                .background(Color.clear)
                                .frame(height: 150)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 12)
                                .autocapitalization(.none)
                                .autocorrectionDisabled()
                        }
                        .background(
                            RoundedRectangle(cornerRadius: 16)
                                .fill(.ultraThinMaterial)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 16)
                                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                                )
                        )
                        .padding(.horizontal, 24)
                        
                        // Word count
                        if !mnemonic.isEmpty {
                            let words = mnemonic.split(separator: " ").count
                            let isValid = words == 12 || words == 24
                            HStack {
                                Image(systemName: isValid ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                                    .foregroundColor(isValid ? hexColor( "10B981") : hexColor( "F59E0B"))
                                
                                Text("\(words) words")
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(isValid ? hexColor( "10B981") : hexColor( "F59E0B"))
                            }
                            .padding(.horizontal, 24)
                        }
                    }
                    
                    // Warning
                    HStack(spacing: 12) {
                        Image(systemName: "exclamationmark.shield.fill")
                            .font(.system(size: 20))
                            .foregroundColor(hexColor( "F59E0B"))
                        
                        Text("Never share your recovery phrase with anyone.")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.white.opacity(0.7))
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(16)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(hexColor( "F59E0B").opacity(0.1))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(hexColor( "F59E0B").opacity(0.3), lineWidth: 1)
                            )
                    )
                    .padding(.horizontal, 24)
                    
                    // Import button
                    Button(action: importWallet) {
                        HStack {
                            if isImporting {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Text("Import Wallet")
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
                    .disabled(isImporting || !isValidMnemonic())
                    .opacity((isImporting || !isValidMnemonic()) ? 0.5 : 1)
                    .padding(.horizontal, 24)
                    .padding(.bottom, 40)
                }
            }
        }
        .alert("Import Failed", isPresented: $showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage)
        }
    }
    
    func isValidMnemonic() -> Bool {
        let words = mnemonic.trimmingCharacters(in: .whitespacesAndNewlines)
            .split(separator: " ")
        let count = words.count
        return (count == 12 || count == 24) && words.allSatisfy { !$0.isEmpty }
    }
    
    func importWallet() {
        isImporting = true
        
        let cleanedMnemonic = mnemonic.trimmingCharacters(in: .whitespacesAndNewlines)
            .split(separator: " ")
            .joined(separator: " ")
        
        HapticFeedbackManager.shared.heavyImpact()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            print("Attempting to import wallet with mnemonic...")
            let wallet = NorCore.importWallet(mnemonic: cleanedMnemonic)
            print("Wallet import result: \(wallet != nil)")
            
            if let wallet = wallet {
                print("Wallet ID: \(wallet.id)")
                print("Wallet accounts count: \(wallet.accounts.count)")
                self.viewModel.currentWallet = wallet
                self.viewModel.loadDummyAssets()
                
                HapticFeedbackManager.shared.success()
                ToastManager.shared.showSuccess("Wallet imported successfully!")
                
                self.dismiss()
            } else {
                print("Failed to import wallet")
                self.errorMessage = "Invalid recovery phrase. Please check your words and try again."
                self.showError = true
                
                HapticFeedbackManager.shared.error()
                ToastManager.shared.showError(self.errorMessage)
            }
            
            self.isImporting = false
        }
    }
}

#if DEBUG
#Preview {
    ImportWalletSheet(viewModel: WalletViewModel())
}
#endif
