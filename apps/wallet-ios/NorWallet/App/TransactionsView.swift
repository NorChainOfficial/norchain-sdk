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

enum TransactionFilter: String, CaseIterable {
    case all = "All"
    case sent = "Sent"
    case received = "Received"
    case swapped = "Swapped"
}

struct TransactionsView: View {
    @ObservedObject var viewModel: WalletViewModel
    @State private var transactions: [Transaction] = []
    @State private var isLoading = false
    @State private var showingFilters = false
    @State private var selectedFilter: TransactionFilter = .all
    @State private var selectedTransaction: Transaction?
    @State private var showTransactionDetails = false
    
    init(viewModel: WalletViewModel) {
        self.viewModel = viewModel
    }
    
    var filteredTransactions: [Transaction] {
        if selectedFilter == .all {
            return transactions
        } else {
            return transactions.filter { transaction in
                let typeString: String
                switch transaction.type {
                case .sent: typeString = "Sent"
                case .received: typeString = "Received"
                case .swapped: typeString = "Swapped"
                }
                return typeString.localizedCaseInsensitiveContains(selectedFilter.rawValue)
            }
        }
    }
    
    var body: some View {
        ZStack {
            // Background gradient
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
            
            VStack(spacing: 0) {
                // Enhanced Header
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Activity")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("Transaction history")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.6))
                        }
                        
                        Spacer()
                        
                        Button(action: {
                            HapticFeedbackManager.shared.lightImpact()
                            withAnimation(AnimationPresets.smoothSpring) {
                                showingFilters = true
                            }
                        }) {
                            ZStack {
                                Circle()
                                    .fill(Color.white.opacity(0.1))
                                    .frame(width: 44, height: 44)
                                    .overlay(
                                        Circle()
                                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                                    )
                                
                                Image(systemName: "line.3.horizontal.decrease.circle.fill")
                                    .font(.system(size: 20, weight: .semibold))
                                    .foregroundColor(.white)
                            }
                        }
                    }
                }
                .padding(.horizontal, 24)
                .padding(.top, 20)
                .padding(.bottom, 8)
                
                // Enhanced Filter Pills with better spacing
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(TransactionFilter.allCases, id: \.self) { filter in
                            Button(action: {
                                HapticFeedbackManager.shared.selection()
                                
                                withAnimation(AnimationPresets.bouncySpring) {
                                    selectedFilter = filter
                                }
                            }) {
                                Text(filter.rawValue)
                                    .font(.system(size: 15, weight: .semibold))
                                    .foregroundColor(selectedFilter == filter ? .white : .white.opacity(0.6))
                                    .padding(.horizontal, 24)
                                    .padding(.vertical, 12)
                                    .background(
                                        ZStack {
                                            Capsule()
                                                .fill(
                                                    selectedFilter == filter ?
                                                    LinearGradient(
                                                        colors: [hexColor("8B5CF6"), hexColor("7C3AED")],
                                                        startPoint: .leading,
                                                        endPoint: .trailing
                                                    ) :
                                                    LinearGradient(
                                                        colors: [Color.white.opacity(0.15), Color.white.opacity(0.08)],
                                                        startPoint: .leading,
                                                        endPoint: .trailing
                                                    )
                                                )
                                            
                                            if selectedFilter == filter {
                                                Capsule()
                                                    .stroke(
                                                        LinearGradient(
                                                            colors: [Color.white.opacity(0.3), Color.white.opacity(0.1)],
                                                            startPoint: .topLeading,
                                                            endPoint: .bottomTrailing
                                                        ),
                                                        lineWidth: 1
                                                    )
                                            }
                                        }
                                    )
                                    .shadow(color: selectedFilter == filter ? hexColor("7C3AED").opacity(0.5) : Color.clear, radius: 12, y: 6)
                                    .scaleEffect(selectedFilter == filter ? 1.05 : 1.0)
                            }
                        }
                    }
                    .padding(.horizontal, 24)
                }
                .padding(.bottom, 20)
                
                // Transactions list
                if isLoading {
                    VStack {
                        Spacer()
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(1.5)
                        Spacer()
                    }
                } else if filteredTransactions.isEmpty {
                    VStack(spacing: 16) {
                        Spacer()
                        
                        Image(systemName: "clock.arrow.circlepath")
                            .font(.system(size: 48))
                            .foregroundColor(.white.opacity(0.3))
                        
                        Text("No transactions yet")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(.white.opacity(0.6))
                        
                        Text("Your transaction history will appear here")
                            .font(.system(size: 14))
                            .foregroundColor(.white.opacity(0.4))
                            .multilineTextAlignment(.center)
                        
                        Spacer()
                    }
                    .padding(.horizontal, 40)
                } else {
                    ScrollView(showsIndicators: false) {
                        VStack(spacing: 16) {
                            ForEach(filteredTransactions) { transaction in
                                TransactionRow(transaction: transaction) {
                                    selectedTransaction = transaction
                                    showTransactionDetails = true
                                }
                            }
                        }
                        .padding(.horizontal, 24)
                        .padding(.bottom, 40)
                    }
                }
            }
        }
        .sheet(isPresented: $showingFilters) {
            TransactionFiltersView(selectedFilter: $selectedFilter)
        }
        .sheet(isPresented: $showTransactionDetails) {
            if let transaction = selectedTransaction {
                TransactionDetailsView(transaction: transaction)
            }
        }
        .onAppear {
            loadTransactions()
        }
    }
    
    func loadTransactions() {
        isLoading = true
        
        // Simulate loading transactions
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            transactions = [
                Transaction(
                    id: "1",
                    type: .sent,
                    token: "NOR",
                    amount: "125.50",
                    value: "$456.20",
                    date: "Today, 14:30",
                    status: .completed,
                    address: "0x742d35Cc2D547F8E3fA7c732C141c5C5a6f8a9A9"
                ),
                Transaction(
                    id: "2",
                    type: .received,
                    token: "ETH",
                    amount: "0.25",
                    value: "$420.75",
                    date: "Yesterday, 09:15",
                    status: .completed,
                    address: "0xa1b2c3d4e5f6789012345678901234567890abcd"
                ),
                Transaction(
                    id: "3",
                    type: .swapped,
                    token: "USDT",
                    amount: "500.00",
                    value: "$500.00",
                    date: "Nov 1, 16:42",
                    status: .pending,
                    address: "0x3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2"
                ),
                Transaction(
                    id: "4",
                    type: .received,
                    token: "BTC",
                    amount: "0.0012",
                    value: "$72.36",
                    date: "Oct 28, 11:20",
                    status: .completed,
                    address: "0x9i8u7y6t5r4e3w2q1p0o9n8m7l6k5j4h3g2f1e0"
                ),
                Transaction(
                    id: "5",
                    type: .sent,
                    token: "NOR",
                    amount: "50.00",
                    value: "$181.50",
                    date: "Oct 25, 14:30",
                    status: .completed,
                    address: "0x742d35Cc2D547F8E3fA7c732C141c5C5a6f8a9A9"
                ),
                Transaction(
                    id: "6",
                    type: .swapped,
                    token: "ETH",
                    amount: "0.1",
                    value: "$168.30",
                    date: "Oct 20, 09:15",
                    status: .failed,
                    address: "0xa1b2c3d4e5f6789012345678901234567890abcd"
                )
            ]
            isLoading = false
        }
    }
}

struct Transaction: Identifiable {
    let id: String
    let type: TransactionType
    let token: String
    let amount: String
    let value: String
    let date: String
    let status: TransactionStatus
    let address: String
}

enum TransactionType {
    case sent
    case received
    case swapped
}

enum TransactionStatus {
    case pending
    case completed
    case failed
}

struct TransactionRow: View {
    let transaction: Transaction
    let onTap: () -> Void
    @State private var isPressed = false
    
    init(transaction: Transaction, onTap: @escaping () -> Void) {
        self.transaction = transaction
        self.onTap = onTap
    }
    
    var body: some View {
        Button(action: {
            HapticFeedbackManager.shared.lightImpact()
            withAnimation(AnimationPresets.quickSpring) {
                onTap()
            }
        }) {
            HStack(spacing: 16) {
                // Token icon
                ZStack {
                    Circle()
                        .fill(getTokenColor(transaction.token).opacity(0.2))
                        .frame(width: 44, height: 44)
                    
                    Text(transaction.token.prefix(1))
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)
                }
                
                // Transaction details
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Image(systemName: transaction.type == .sent ? "arrow.up.right" : "arrow.down.left")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(transaction.type == .sent ? hexColor("EF4444") : hexColor("10B981"))
                        
                        Text("\(transaction.type == .sent ? "Sent" : "Received") \(transaction.token)")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.white)
                    }
                    
                    Text("\(transaction.amount) \(transaction.token)")
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.6))
                    
                    HStack(spacing: 8) {
                        Text(transaction.date)
                            .font(.system(size: 12))
                            .foregroundColor(.white.opacity(0.4))
                        
                        Circle()
                            .fill(.white.opacity(0.2))
                            .frame(width: 3, height: 3)
                        
                        getStatusView()
                    }
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 2) {
                    Text(transaction.type == .sent ? "-\(transaction.amount)" : "+\(transaction.amount)")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(transaction.type == .sent ? hexColor("EF4444") : hexColor("10B981"))
                    
                    Text(transaction.value)
                        .font(.system(size: 13))
                        .foregroundColor(.white.opacity(0.6))
                }
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.white.opacity(isPressed ? 0.15 : 0.1))
            )
            .scaleEffect(isPressed ? 0.98 : 1.0)
        }
        .buttonStyle(PlainButtonStyle())
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    withAnimation(.spring(response: 0.3)) {
                        isPressed = true
                    }
                }
                .onEnded { _ in
                    withAnimation(.spring(response: 0.3)) {
                        isPressed = false
                    }
                }
        )
    }
    
    @ViewBuilder
    func getStatusView() -> some View {
        switch transaction.status {
        case .pending:
            HStack(spacing: 4) {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: hexColor("F59E0B")))
                    .scaleEffect(0.5)
                Text("Pending")
                    .font(.system(size: 12))
                    .foregroundColor(hexColor("F59E0B"))
            }
        case .completed:
            HStack(spacing: 4) {
                Circle()
                    .fill(hexColor("10B981"))
                    .frame(width: 6, height: 6)
                Text("Completed")
                    .font(.system(size: 12))
                    .foregroundColor(hexColor("10B981"))
            }
        case .failed:
            HStack(spacing: 4) {
                Circle()
                    .fill(hexColor("EF4444"))
                    .frame(width: 6, height: 6)
                Text("Failed")
                    .font(.system(size: 12))
                    .foregroundColor(hexColor("EF4444"))
            }
        }
    }
    
    func getTokenColor(_ token: String) -> Color {
        switch token {
        case "NOR":
            return hexColor("8B5CF6")
        case "ETH":
            return hexColor("627EEA")
        case "BTC":
            return hexColor("F7931A")
        case "USDT":
            return hexColor("26A17B")
        default:
            return hexColor("7C3AED")
        }
    }
}

struct TransactionFiltersView: View {
    @Binding var selectedFilter: TransactionFilter
    @Environment(\.dismiss) var dismiss
    
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
                    
                    Text("Filters")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Color.clear.frame(width: 44)
                }
                .padding(.horizontal, 24)
                .padding(.top, 20)
                .padding(.bottom, 24)
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 16) {
                        ForEach(TransactionFilter.allCases, id: \.self) { filter in
                            Button(action: {
                                selectedFilter = filter
                                dismiss()
                            }) {
                                HStack {
                                    Text(filter.rawValue)
                                        .font(.system(size: 16, weight: .medium))
                                        .foregroundColor(.white)
                                    
                                    Spacer()
                                    
                                    if selectedFilter == filter {
                                        Image(systemName: "checkmark")
                                            .font(.system(size: 16, weight: .semibold))
                                            .foregroundColor(hexColor("8B5CF6"))
                                    }
                                }
                                .padding(16)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(Color.white.opacity(selectedFilter == filter ? 0.15 : 0.1))
                                )
                            }
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.bottom, 40)
                }
            }
        }
    }
}

#if DEBUG
#Preview {
    TransactionsView(viewModel: WalletViewModel())
}
#endif