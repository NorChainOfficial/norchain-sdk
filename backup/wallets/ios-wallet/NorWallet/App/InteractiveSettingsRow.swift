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

/// Enhanced interactive settings row with badges, copy functionality, and status indicators
struct InteractiveSettingsRow: View {
    let icon: String
    let title: String
    let subtitle: String
    var badge: String? = nil
    var badgeColor: Color? = nil
    let hasArrow: Bool
    var showCopy: Bool = false
    var address: String? = nil
    var showStatus: Bool = false
    let iconColor: Color?
    let action: () -> Void
    
    @State private var isPressed = false
    @State private var showCopied = false
    @State private var pulseAnimation = false
    
    init(icon: String, title: String, subtitle: String, badge: String? = nil, badgeColor: Color? = nil, hasArrow: Bool = true, showCopy: Bool = false, address: String? = nil, showStatus: Bool = false, iconColor: Color? = nil, action: @escaping () -> Void) {
        self.icon = icon
        self.title = title
        self.subtitle = subtitle
        self.badge = badge
        self.badgeColor = badgeColor
        self.hasArrow = hasArrow
        self.showCopy = showCopy
        self.address = address
        self.showStatus = showStatus
        self.iconColor = iconColor
        self.action = action
    }
    
    var body: some View {
        Button(action: {
            HapticFeedbackManager.shared.lightImpact()
            
            if showCopy, let address = address {
                copyAddress(address)
            } else {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                    isPressed = false
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    action()
                }
            }
        }) {
            HStack(spacing: 16) {
                // Enhanced Icon with pulse animation
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(
                            LinearGradient(
                                colors: [
                                    (iconColor ?? hexColor("8B5CF6")).opacity(pulseAnimation ? 0.3 : 0.2),
                                    (iconColor ?? hexColor("8B5CF6")).opacity(pulseAnimation ? 0.15 : 0.1)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 44, height: 44)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke((iconColor ?? hexColor("8B5CF6")).opacity(0.3), lineWidth: 1)
                        )
                        .scaleEffect(pulseAnimation ? 1.05 : 1.0)
                    
                    Image(systemName: icon)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(iconColor ?? .white)
                }
                .onAppear {
                    if showStatus {
                        withAnimation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true)) {
                            pulseAnimation = true
                        }
                    }
                }
                
                // Text content with badges
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 8) {
                        Text(title)
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                        
                        if let badge = badge, let badgeColor = badgeColor {
                            Text(badge)
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(.white)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(
                                    Capsule()
                                        .fill(badgeColor)
                                )
                        }
                    }
                    
                    Text(subtitle)
                        .font(.system(size: 13, weight: .regular))
                        .foregroundColor(.white.opacity(0.6))
                        .lineLimit(2)
                }
                
                Spacer()
                
                // Copy button or arrow
                if showCopy {
                    Button(action: {
                        if let address = address {
                            copyAddress(address)
                        }
                    }) {
                        Image(systemName: showCopied ? "checkmark.circle.fill" : "doc.on.doc")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(showCopied ? hexColor("10B981") : .white.opacity(0.6))
                            .scaleEffect(showCopied ? 1.2 : 1.0)
                    }
                    .buttonStyle(PlainButtonStyle())
                } else if hasArrow {
                    Image(systemName: "chevron.right")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white.opacity(0.4))
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .background(
                ZStack {
                    // Glass morphism effect
                    RoundedRectangle(cornerRadius: 16)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color.white.opacity(isPressed ? 0.2 : 0.15),
                                    Color.white.opacity(isPressed ? 0.12 : 0.08)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                    
                    // Subtle border
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(
                            LinearGradient(
                                colors: [
                                    Color.white.opacity(0.2),
                                    Color.white.opacity(0.05)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1
                        )
                }
            )
            .shadow(color: Color.black.opacity(isPressed ? 0.1 : 0.2), radius: isPressed ? 8 : 12, y: isPressed ? 2 : 4)
            .scaleEffect(isPressed ? 0.97 : 1.0)
        }
        .buttonStyle(PlainButtonStyle())
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    withAnimation(.spring(response: 0.25, dampingFraction: 0.7)) {
                        isPressed = true
                    }
                }
                .onEnded { _ in
                    withAnimation(.spring(response: 0.25, dampingFraction: 0.7)) {
                        isPressed = false
                    }
                }
        )
    }
    
    private func copyAddress(_ address: String) {
        UIPasteboard.general.string = address
        HapticFeedbackManager.shared.success()
        
        withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
            showCopied = true
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                showCopied = false
            }
        }
    }
}

