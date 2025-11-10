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

struct CustomTabBar: View {
    @Binding var selectedTab: Int
    let namespace: Namespace.ID
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(TabItem.allCases, id: \.self) { item in
                Button(action: {
                    HapticFeedbackManager.shared.lightImpact()
                    
                    withAnimation(AnimationPresets.bouncySpring) {
                        selectedTab = item.rawValue
                    }
                }) {
                    ZStack {
                        // Background pill for selected item
                        if selectedTab == item.rawValue {
                            Circle()
                                .fill(
                                    LinearGradient(
                                        colors: [
                                            hexColor( "8B5CF6"),
                                            hexColor( "7C3AED")
                                        ],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 52, height: 52)
                                .matchedGeometryEffect(id: "tab", in: namespace)
                                .shadow(color: hexColor( "7C3AED").opacity(0.6), radius: 15, y: 8)
                        }
                        
                        // Icon with enhanced animations
                        Image(systemName: item.icon)
                            .font(.system(size: selectedTab == item.rawValue ? 24 : 22, weight: .semibold))
                            .foregroundColor(selectedTab == item.rawValue ? .white : .white.opacity(0.4))
                            .scaleEffect(selectedTab == item.rawValue ? 1.1 : 0.9)
                            .rotationEffect(.degrees(selectedTab == item.rawValue ? 360 : 0))
                            .animation(AnimationPresets.bouncySpring, value: selectedTab)
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 60)
                }
            }
        }
        .padding(.horizontal, 8)
        .background(
            ZStack {
                // Blur background
                RoundedRectangle(cornerRadius: 32)
                    .fill(
                        LinearGradient(
                            colors: [
                                Color.white.opacity(0.12),
                                Color.white.opacity(0.06)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .background(.ultraThinMaterial)
                    .cornerRadius(32)
                
                RoundedRectangle(cornerRadius: 32)
                    .stroke(
                        LinearGradient(
                            colors: [
                                Color.white.opacity(0.3),
                                Color.white.opacity(0.1)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            }
        )
        .shadow(color: Color.black.opacity(0.3), radius: 30, y: 10)
        .padding(.horizontal, 16)
    }
}

enum TabItem: Int, CaseIterable {
    case home = 0
    case swap = 1
    case activity = 2
    case dapps = 3
    case settings = 4
    
    var icon: String {
        switch self {
        case .home: return "house.fill"
        case .swap: return "arrow.2.squarepath"
        case .activity: return "clock.arrow.circlepath"
        case .dapps: return "cube.transparent.fill"
        case .settings: return "gearshape.fill"
        }
    }
    
    var title: String {
        switch self {
        case .home: return "Home"
        case .swap: return "Swap"
        case .activity: return "Activity"
        case .dapps: return "DApps"
        case .settings: return "Settings"
        }
    }
}

