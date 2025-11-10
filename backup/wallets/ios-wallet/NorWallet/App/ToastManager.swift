import SwiftUI
import Combine

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

/// Global Toast Manager for app-wide notifications
class ToastManager: ObservableObject {
    static let shared = ToastManager()
    
    @Published var toasts: [ToastItem] = []
    
    private init() {}
    
    func showSuccess(_ message: String, duration: Double = 3.0) {
        let toast = ToastItem(
            id: UUID(),
            message: message,
            type: .success,
            duration: duration
        )
        
        // Haptic feedback
        let feedback = UINotificationFeedbackGenerator()
        feedback.notificationOccurred(.success)
        
        DispatchQueue.main.async {
            self.toasts.append(toast)
            
            DispatchQueue.main.asyncAfter(deadline: .now() + duration) {
                self.dismiss(toast)
            }
        }
    }
    
    func showError(_ message: String, duration: Double = 3.0) {
        let toast = ToastItem(
            id: UUID(),
            message: message,
            type: .error,
            duration: duration
        )
        
        // Haptic feedback
        let feedback = UINotificationFeedbackGenerator()
        feedback.notificationOccurred(.error)
        
        DispatchQueue.main.async {
            self.toasts.append(toast)
            
            DispatchQueue.main.asyncAfter(deadline: .now() + duration) {
                self.dismiss(toast)
            }
        }
    }
    
    func showWarning(_ message: String, duration: Double = 3.0) {
        let toast = ToastItem(
            id: UUID(),
            message: message,
            type: .warning,
            duration: duration
        )
        
        // Haptic feedback
        let feedback = UINotificationFeedbackGenerator()
        feedback.notificationOccurred(.warning)
        
        DispatchQueue.main.async {
            self.toasts.append(toast)
            
            DispatchQueue.main.asyncAfter(deadline: .now() + duration) {
                self.dismiss(toast)
            }
        }
    }
    
    func showInfo(_ message: String, duration: Double = 3.0) {
        let toast = ToastItem(
            id: UUID(),
            message: message,
            type: .info,
            duration: duration
        )
        
        // Haptic feedback
        let feedback = UIImpactFeedbackGenerator(style: .light)
        feedback.impactOccurred()
        
        DispatchQueue.main.async {
            self.toasts.append(toast)
            
            DispatchQueue.main.asyncAfter(deadline: .now() + duration) {
                self.dismiss(toast)
            }
        }
    }
    
    func dismiss(_ toast: ToastItem) {
        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
            toasts.removeAll { $0.id == toast.id }
        }
    }
    
    func dismissAll() {
        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
            toasts.removeAll()
        }
    }
}

struct ToastItem: Identifiable {
    let id: UUID
    let message: String
    let type: ToastType
    let duration: Double
}

enum ToastType {
    case success
    case error
    case warning
    case info
}

/// Global Toast Overlay View
struct GlobalToastOverlay: View {
    @StateObject private var toastManager = ToastManager.shared
    
    var body: some View {
        VStack(spacing: 12) {
            ForEach(toastManager.toasts) { toast in
                ToastView(toast: toast)
                    .transition(.move(edge: .top).combined(with: .opacity).combined(with: .scale(scale: 0.9)))
            }
        }
        .padding(.top, 8)
        .padding(.horizontal, 24)
        .zIndex(10000)
    }
}

/// Enhanced Toast View with animations
struct ToastView: View {
    let toast: ToastItem
    @State private var animate = false
    @State private var progress: Double = 1.0
    
    var body: some View {
        HStack(spacing: 12) {
            // Icon
            ZStack {
                Circle()
                    .fill(getIconBackgroundColor().opacity(0.2))
                    .frame(width: 36, height: 36)
                
                Image(systemName: getIconName())
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(getIconColor())
                    .scaleEffect(animate ? 1.1 : 1.0)
            }
            
            // Message
            Text(toast.message)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.white)
                .lineLimit(2)
            
            Spacer()
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(
                    LinearGradient(
                        colors: getGradientColors(),
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .shadow(color: getShadowColor(), radius: 20, y: 10)
        )
        .overlay(
            // Progress bar
            GeometryReader { geometry in
                Rectangle()
                    .fill(Color.white.opacity(0.3))
                    .frame(width: geometry.size.width * progress, height: 3)
                    .frame(maxHeight: .infinity, alignment: .bottom)
            }
            .clipShape(RoundedRectangle(cornerRadius: 16))
        )
        .scaleEffect(animate ? 1.0 : 0.9)
        .opacity(animate ? 1.0 : 0.0)
        .onAppear {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                animate = true
            }
            
            // Animate progress bar
            withAnimation(.linear(duration: toast.duration)) {
                progress = 0.0
            }
        }
    }
    
    func getIconName() -> String {
        switch toast.type {
        case .success: return "checkmark.circle.fill"
        case .error: return "xmark.circle.fill"
        case .warning: return "exclamationmark.triangle.fill"
        case .info: return "info.circle.fill"
        }
    }
    
    func getIconColor() -> Color {
        switch toast.type {
        case .success: return hexColor("10B981")
        case .error: return hexColor("EF4444")
        case .warning: return hexColor("F59E0B")
        case .info: return hexColor("3B82F6")
        }
    }
    
    func getIconBackgroundColor() -> Color {
        return getIconColor()
    }
    
    func getGradientColors() -> [Color] {
        switch toast.type {
        case .success:
            return [hexColor("10B981").opacity(0.95), hexColor("059669").opacity(0.95)]
        case .error:
            return [hexColor("EF4444").opacity(0.95), hexColor("DC2626").opacity(0.95)]
        case .warning:
            return [hexColor("F59E0B").opacity(0.95), hexColor("D97706").opacity(0.95)]
        case .info:
            return [hexColor("3B82F6").opacity(0.95), hexColor("2563EB").opacity(0.95)]
        }
    }
    
    func getShadowColor() -> Color {
        return getIconColor().opacity(0.5)
    }
}

