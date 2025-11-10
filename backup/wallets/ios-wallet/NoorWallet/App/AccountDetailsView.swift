import SwiftUI

struct AccountDetailsView: View {
    @ObservedObject var viewModel: WalletViewModel
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ZStack {
            // Background gradient
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
                            .background(Circle().fill(Color.white.opacity(0.1)))
                    }
                    
                    Spacer()
                    
                    Text("Account")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Color.clear.frame(width: 44)
                }
                .padding(.horizontal, 24)
                .padding(.top, 20)
                .padding(.bottom, 24)
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 24) {
                        // Account Card
                        if let wallet = viewModel.currentWallet, let account = wallet.accounts.first {
                            AccountCard(account: account)
                                .padding(.horizontal, 24)
                        }
                        
                        // Account Actions
                        VStack(spacing: 16) {
                            SettingsRow(
                                icon: "square.and.arrow.up",
                                title: "Export Private Key",
                                subtitle: "View private key for this account",
                                hasArrow: true
                            ) {
                                // TODO: Show private key after authentication
                            }
                            
                            SettingsRow(
                                icon: "pencil",
                                title: "Rename Account",
                                subtitle: "Change account display name",
                                hasArrow: true
                            ) {
                                // TODO: Show rename account sheet
                            }
                            
                            SettingsRow(
                                icon: "plus.circle",
                                title: "Add Account",
                                subtitle: "Create a new account",
                                hasArrow: true
                            ) {
                                // TODO: Add new account
                            }
                        }
                        .padding(.horizontal, 24)
                        
                        // Danger Zone
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Danger Zone")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.white.opacity(0.6))
                                .padding(.horizontal, 24)
                            
                            SettingsRow(
                                icon: "trash",
                                title: "Delete Account",
                                subtitle: "Remove this account from wallet",
                                hasArrow: true
                            ) {
                                // TODO: Show delete confirmation
                            }
                            .padding(.horizontal, 24)
                        }
                    }
                    .padding(.bottom, 40)
                }
            }
        }
    }
}

struct AccountCard: View {
    let account: NorCore.AccountInfo
    
    var body: some View {
        VStack(spacing: 20) {
            // Account Icon
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [
                                Color(hex: "8B5CF6").opacity(0.3),
                                Color(hex: "7C3AED").opacity(0.1)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 80, height: 80)
                
                Text("N")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.white)
            }
            
            // Account Name
            VStack(spacing: 4) {
                Text("Main Account")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.white)
                
                Text("Account #\(account.id)")
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.6))
            }
            
            // Address
            VStack(spacing: 8) {
                Text("ADDRESS")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.white.opacity(0.5))
                    .tracking(1)
                
                HStack {
                    Text(formatAddress(account.address))
                        .font(.system(size: 14, weight: .medium, design: .monospaced))
                        .foregroundColor(.white)
                        .lineLimit(1)
                    
                    Button(action: {
                        UIPasteboard.general.string = account.address
                        // TODO: Show copied feedback
                    }) {
                        Image(systemName: "doc.on.doc")
                            .font(.system(size: 16))
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.white.opacity(0.1))
                )
            }
            
            // Balance
            VStack(spacing: 8) {
                Text("BALANCE")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.white.opacity(0.5))
                    .tracking(1)
                
                Text("0.00 NOR")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(.white)
                
                Text("$0.00 USD")
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.6))
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 24)
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
                    RoundedRectangle(cornerRadius: 24)
                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                )
        )
    }
    
    func formatAddress(_ address: String) -> String {
        guard address.count > 10 else { return address }
        let prefix = address.prefix(6)
        let suffix = address.suffix(4)
        return "\(prefix)...\(suffix)"
    }
}

#Preview {
    AccountDetailsView(viewModel: WalletViewModel())
}