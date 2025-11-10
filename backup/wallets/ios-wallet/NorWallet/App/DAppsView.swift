import SwiftUI
import WebKit

// Helper function for hex colors - uses direct Color initializer
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

struct DAppsView: View {
    @ObservedObject var viewModel: WalletViewModel
    @State private var featuredDApps: [DApp] = []
    @State private var categories: [DAppCategory] = []
    @State private var searchText = ""
    @State private var isLoading = false
    @State private var selectedDAppURL: URL?
    @State private var showDApp = false
    @State private var selectedCategory: String? = nil
    
    init(viewModel: WalletViewModel) {
        self.viewModel = viewModel
    }
    
    var filteredDApps: [DApp] {
        var filtered = featuredDApps
        
        // Filter by category
        if let category = selectedCategory {
            filtered = filtered.filter { $0.category == category }
        }
        
        // Filter by search text
        if !searchText.isEmpty {
            filtered = filtered.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
        }
        
        return filtered
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
                            Text("DApps")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("Explore decentralized applications")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.6))
                        }
                        
                        Spacer()
                    }
                }
                .padding(.horizontal, 24)
                .padding(.top, 20)
                .padding(.bottom, 8)
                
                // Search bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 16))
                        .foregroundColor(.white.opacity(0.5))
                    
                    TextField("Search DApps", text: $searchText)
                        .font(.system(size: 16))
                        .foregroundColor(.white)
                        .accentColor(.white)
                    
                    if !searchText.isEmpty {
                        Button(action: {
                            searchText = ""
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 16))
                                .foregroundColor(.white.opacity(0.5))
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.white.opacity(0.1))
                )
                .padding(.horizontal, 24)
                .padding(.top, 12)
                .padding(.bottom, 20)
                
                // Content
                if isLoading {
                    VStack {
                        Spacer()
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(1.5)
                        Spacer()
                    }
                } else {
                    ScrollView(showsIndicators: false) {
                        VStack(spacing: 24) {
                            // Featured DApps
                            VStack(alignment: .leading, spacing: 16) {
                                Text("Featured")
                                    .font(.system(size: 20, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 24)
                                
                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: 16) {
                                        ForEach(featuredDApps) { dapp in
                                            FeaturedDAppCard(dapp: dapp) {
                                                openDApp(dapp: dapp)
                                            }
                                        }
                                    }
                                    .padding(.horizontal, 24)
                                }
                            }
                            
                            // Categories
                            VStack(alignment: .leading, spacing: 16) {
                                Text("Categories")
                                    .font(.system(size: 20, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 24)
                                
                                LazyVGrid(columns: [
                                    GridItem(.flexible(), spacing: 16),
                                    GridItem(.flexible(), spacing: 16)
                                ], spacing: 16) {
                                    ForEach(categories) { category in
                                        CategoryCard(category: category, selectedCategory: $selectedCategory)
                                    }
                                }
                                .padding(.horizontal, 24)
                            }
                            
                            // All DApps
                            VStack(alignment: .leading, spacing: 16) {
                                Text("All DApps")
                                    .font(.system(size: 20, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 24)
                                
                                VStack(spacing: 16) {
                                    ForEach(filteredDApps) { dapp in
                                        DAppRow(dapp: dapp) {
                                            openDApp(dapp: dapp)
                                        }
                                    }
                                }
                                .padding(.horizontal, 24)
                            }
                        }
                        .padding(.bottom, 40)
                    }
                }
            }
        }
        .onAppear {
            loadDApps()
        }
        .sheet(isPresented: $showDApp) {
            if let url = selectedDAppURL {
                // DAppWebView is in Components folder - needs to be accessible
                // For now, use a simple WebView
                NavigationView {
                    WebView(url: url)
                        .navigationTitle(url.host ?? "DApp")
                        .navigationBarTitleDisplayMode(.inline)
                        .toolbar {
                            ToolbarItem(placement: .navigationBarTrailing) {
                                Button("Done") {
                                    showDApp = false
                                }
                            }
                        }
                }
            }
        }
    }
    
    func loadDApps() {
        isLoading = true
        
        // Simulate loading DApps
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            featuredDApps = [
                DApp(id: "1", name: "Uniswap", category: "DeFi", description: "Decentralized exchange", icon: "u", color: hexColor("FF007A"), url: "https://app.uniswap.org"),
                DApp(id: "2", name: "Aave", category: "DeFi", description: "Lending protocol", icon: "a", color: hexColor("B6509E"), url: "https://app.aave.com"),
                DApp(id: "3", name: "OpenSea", category: "NFT", description: "NFT marketplace", icon: "o", color: hexColor("2081E2"), url: "https://opensea.io"),
                DApp(id: "4", name: "Compound", category: "DeFi", description: "Lending & borrowing", icon: "c", color: hexColor("00D395"), url: "https://app.compound.finance")
            ]
            
            categories = [
                DAppCategory(id: "1", name: "DeFi", icon: "banknote.fill", color: hexColor("10B981")),
                DAppCategory(id: "2", name: "NFT", icon: "photo.fill", color: hexColor("8B5CF6")),
                DAppCategory(id: "3", name: "Gaming", icon: "gamecontroller.fill", color: hexColor("F59E0B")),
                DAppCategory(id: "4", name: "Social", icon: "person.2.fill", color: hexColor("3B82F6")),
                DAppCategory(id: "5", name: "Tools", icon: "wrench.fill", color: hexColor("EF4444")),
                DAppCategory(id: "6", name: "Bridge", icon: "link", color: hexColor("A78BFA"))
            ]
            
            isLoading = false
        }
    }
    
    func openDApp(dapp: DApp) {
        guard let urlString = dapp.url,
              let url = URL(string: urlString) else {
            // If no URL, show error or placeholder
            return
        }
        selectedDAppURL = url
        showDApp = true
    }
}

struct DApp: Identifiable {
    let id: String
    let name: String
    let category: String
    let description: String
    let icon: String
    let color: Color
    let url: String?
    
    init(id: String, name: String, category: String, description: String, icon: String, color: Color, url: String? = nil) {
        self.id = id
        self.name = name
        self.category = category
        self.description = description
        self.icon = icon
        self.color = color
        self.url = url
    }
}

struct DAppCategory: Identifiable {
    let id: String
    let name: String
    let icon: String
    let color: Color
}

struct FeaturedDAppCard: View {
    let dapp: DApp
    let onTap: () -> Void
    @State private var isPressed = false
    
    var body: some View {
        Button(action: {
            HapticFeedbackManager.shared.lightImpact()
            withAnimation(AnimationPresets.quickSpring) {
                onTap()
            }
        }) {
            VStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(dapp.color.opacity(0.2))
                        .frame(width: 60, height: 60)
                    
                    Text(dapp.icon)
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.white)
                }
                
                VStack(spacing: 4) {
                    Text(dapp.name)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                        .lineLimit(1)
                    
                    Text(dapp.description)
                        .font(.system(size: 13))
                        .foregroundColor(.white.opacity(0.6))
                        .lineLimit(1)
                }
            }
            .frame(width: 140)
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color.white.opacity(isPressed ? 0.15 : 0.1))
            )
            .scaleEffect(isPressed ? 0.95 : 1.0)
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
}

struct CategoryCard: View {
    let category: DAppCategory
    @Binding var selectedCategory: String?
    @State private var isPressed = false
    
    var body: some View {
        Button(action: {
            HapticFeedbackManager.shared.selection()
            withAnimation(AnimationPresets.bouncySpring) {
                selectedCategory = selectedCategory == category.name ? nil : category.name
            }
        }) {
            VStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(category.color.opacity(0.2))
                        .frame(width: 44, height: 44)
                    
                    Image(systemName: category.icon)
                        .font(.system(size: 20))
                        .foregroundColor(.white)
                }
                
                Text(category.name)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white)
            }
            .frame(maxWidth: .infinity)
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(
                        selectedCategory == category.name ?
                        LinearGradient(
                            colors: [category.color.opacity(0.3), category.color.opacity(0.2)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ) :
                        LinearGradient(
                            colors: [Color.white.opacity(isPressed ? 0.15 : 0.1), Color.white.opacity(isPressed ? 0.1 : 0.05)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(
                                selectedCategory == category.name ? category.color.opacity(0.5) : Color.white.opacity(0.2),
                                lineWidth: selectedCategory == category.name ? 1.5 : 1
                            )
                    )
            )
            .shadow(color: selectedCategory == category.name ? category.color.opacity(0.3) : Color.clear, radius: 12, y: 6)
            .scaleEffect(isPressed ? 0.95 : (selectedCategory == category.name ? 1.05 : 1.0))
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
}

struct DAppRow: View {
    let dapp: DApp
    let onTap: () -> Void
    @State private var isPressed = false
    
    var body: some View {
        Button(action: {
            HapticFeedbackManager.shared.lightImpact()
            withAnimation(AnimationPresets.quickSpring) {
                onTap()
            }
        }) {
            HStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(dapp.color.opacity(0.2))
                        .frame(width: 44, height: 44)
                    
                    Text(dapp.icon.uppercased())
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(dapp.name)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.white)
                    
                    Text(dapp.description)
                        .font(.system(size: 13))
                        .foregroundColor(.white.opacity(0.6))
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white.opacity(0.3))
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
}

// Simple WebView wrapper for DApps
struct WebView: UIViewRepresentable {
    let url: URL
    
    func makeUIView(context: Context) -> WKWebView {
        return WKWebView()
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        let request = URLRequest(url: url)
        uiView.load(request)
    }
}

#if DEBUG
#Preview {
    DAppsView(viewModel: WalletViewModel())
}
#endif
