import SwiftUI
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
                    Color(hex: "5B47ED"),
                    Color(hex: "2D1B69"),
                    Color(hex: "1A0F3D")
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // Animated orbs for depth
            GeometryReader { geometry in
                Circle()
                    .fill(Color(hex: "7C3AED").opacity(0.3))
                    .frame(width: 300, height: 300)
                    .blur(radius: 100)
                    .offset(x: -100, y: -100)
                
                Circle()
                    .fill(Color(hex: "EC4899").opacity(0.2))
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
    }
}

#Preview {
    ContentView()
}
