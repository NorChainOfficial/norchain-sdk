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

struct TransactionDetailsView: View {
    let transaction: Transaction
    @Environment(\.dismiss) var dismiss
    @State private var showCopiedToast = false
    
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
                            dismiss()
                        }) {
                            Image(systemName: "xmark")
                                .font(.system(size: 20, weight: .semibold))
                                .foregroundColor(.white)
                                .frame(width: 44, height: 44)
                                .background(Circle().fill(Color.white.opacity(0.1)))
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .trailing, spacing: 4) {
                            Text("Transaction Details")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("View transaction information")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.6))
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 20)
                    
                    // Status Card
                    VStack(spacing: 10) {
                        ZStack {
                            Circle()
                                .fill(getStatusColor().opacity(0.2))
                                .frame(width: 70, height: 70)
                            
                            Image(systemName: getStatusIcon())
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(getStatusColor())
                        }
                        
                        Text(getStatusText())
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.white)
                    }
                    .padding(20)
                    .frame(maxWidth: .infinity)
                    .background(
                        RoundedRectangle(cornerRadius: 20)
                            .fill(
                                LinearGradient(
                                    colors: [
                                        Color.white.opacity(0.15),
                                        Color.white.opacity(0.08)
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 20)
                                    .stroke(getStatusColor().opacity(0.3), lineWidth: 1)
                            )
                    )
                    .padding(.horizontal, 24)
                    
                    // Gas & Fees Section - using SettingsSection style
                    SettingsSection(title: "Gas & Fees") {
                        SecurityCard(
                            icon: "bolt.fill",
                            title: "Gas Used",
                            subtitle: "\(Int.random(in: 21000...150000)) • \(String(format: "%.1f", Double.random(in: 12...45))) gwei",
                            color: hexColor("F59E0B"),
                            showChevron: false
                        )
                        
                        SecurityCard(
                            icon: "dollarsign.circle.fill",
                            title: "Total Fee",
                            subtitle: "$\(String(format: "%.2f", Double.random(in: 0.50...15.00))) • \(String(format: "%.4f", Double.random(in: 0.001...0.05))) ETH",
                            color: hexColor("10B981"),
                            showChevron: false
                        )
                    }
                    
                    // Transaction Info Section - using SettingsSection style
                    SettingsSection(title: "Transaction Info") {
                        SecurityCard(
                            icon: "info.circle.fill",
                            title: "Type",
                            subtitle: transaction.type == .sent ? "Sent" : (transaction.type == .received ? "Received" : "Swapped"),
                            color: hexColor("8B5CF6"),
                            showChevron: false
                        )
                        
                        SecurityCard(
                            icon: "bitcoinsign.circle.fill",
                            title: "Amount",
                            subtitle: "\(transaction.amount) \(transaction.token)",
                            color: hexColor("F7931A"),
                            showChevron: false
                        )
                        
                        SecurityCard(
                            icon: "calendar",
                            title: "Date",
                            subtitle: transaction.date,
                            color: hexColor("6366F1"),
                            showChevron: false
                        )
                        
                        Button(action: {
                            UIPasteboard.general.string = transaction.address
                            HapticFeedbackManager.shared.success()
                            ToastManager.shared.showSuccess("Address copied!")
                            withAnimation {
                                showCopiedToast = true
                            }
                            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                withAnimation {
                                    showCopiedToast = false
                                }
                            }
                        }) {
                            SecurityCard(
                                icon: "doc.on.doc.fill",
                                title: "Address",
                                subtitle: formatAddress(transaction.address),
                                color: hexColor("8B5CF6"),
                                showChevron: false
                            )
                        }
                    }
                    
                    // Actions Section - using SettingsSection style
                    SettingsSection(title: "Actions") {
                        GlassActionButton(
                            icon: "safari.fill",
                            title: "View on Explorer",
                            gradient: [hexColor("8B5CF6"), hexColor("7C3AED")]
                        ) {
                            openExplorer(for: transaction.id)
                        }
                    }
                }
                .padding(.bottom, 40)
            }
        }
        .overlay(alignment: .top) {
            if showCopiedToast {
                SuccessToast(message: "Address copied!")
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .zIndex(1000)
            }
        }
    }
    
    func getStatusColor() -> Color {
        switch transaction.status {
        case .completed: return hexColor("10B981")
        case .pending: return hexColor("F59E0B")
        case .failed: return hexColor("EF4444")
        }
    }
    
    func getStatusIcon() -> String {
        switch transaction.status {
        case .completed: return "checkmark.circle.fill"
        case .pending: return "clock.fill"
        case .failed: return "xmark.circle.fill"
        }
    }
    
    func getStatusText() -> String {
        switch transaction.status {
        case .completed: return "Completed"
        case .pending: return "Pending"
        case .failed: return "Failed"
        }
    }
    
    func formatAddress(_ address: String) -> String {
        guard address.count > 10 else { return address }
        return "\(address.prefix(6))...\(address.suffix(4))"
    }
    
    func openExplorer(for hash: String) {
        HapticFeedbackManager.shared.mediumImpact()
        // Placeholder for actual explorer URL
        if let url = URL(string: "https://etherscan.io/tx/\(hash)") {
            UIApplication.shared.open(url)
        }
    }
}

struct DetailRow: View {
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(title)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white.opacity(0.6))
            
            Spacer()
            
            Text(value)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.white)
        }
    }
}

