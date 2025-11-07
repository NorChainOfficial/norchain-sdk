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

struct ContentView: View {
    @StateObject private var viewModel = WalletViewModel()
    @State private var selectedTab = 0
    @Namespace private var animation
    
    var body: some View {
        ZStack {
            // Dynamic gradient background inspired by Dribbble designs
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
            
            // Animated orbs for depth
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
            
            if let wallet = viewModel.currentWallet {
                VStack(spacing: 0) {
                    // Main content
                    TabView(selection: $selectedTab) {
                        WalletHomeView(wallet: wallet, viewModel: viewModel)
                            .tag(0)
                        
                        SwapView(viewModel: viewModel)
                            .tag(1)
                        
                        TransactionsView(viewModel: viewModel)
                            .tag(2)
                        
                        DAppsView(viewModel: viewModel)
                            .tag(3)
                        
                        SettingsView(viewModel: viewModel)
                            .tag(4)
                    }
                    .tabViewStyle(.page(indexDisplayMode: .never))
                    
                    // Enhanced floating tab bar
                    CustomTabBar(selectedTab: $selectedTab, namespace: animation)
                        .padding(.bottom, 8)
                }
            } else {
                OnboardingView(viewModel: viewModel)
            }
        }
        .preferredColorScheme(.dark)
        .overlay(alignment: .top) {
            GlobalToastOverlay()
        }
    }
}

#Preview {
    ContentView()
}
