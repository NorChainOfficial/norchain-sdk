import SwiftUI

/// Enhanced animation presets for consistent UX
struct AnimationPresets {
    /// Quick spring for button presses
    static let quickSpring = Animation.spring(response: 0.25, dampingFraction: 0.7)
    
    /// Standard spring for most interactions
    static let standardSpring = Animation.spring(response: 0.3, dampingFraction: 0.7)
    
    /// Smooth spring for transitions
    static let smoothSpring = Animation.spring(response: 0.4, dampingFraction: 0.8)
    
    /// Bouncy spring for playful interactions
    static let bouncySpring = Animation.spring(response: 0.35, dampingFraction: 0.6)
    
    /// Gentle spring for subtle animations
    static let gentleSpring = Animation.spring(response: 0.5, dampingFraction: 0.85)
    
    /// Ease in out for fade transitions
    static let easeInOut = Animation.easeInOut(duration: 0.3)
    
    /// Quick ease for fast transitions
    static let quickEase = Animation.easeInOut(duration: 0.2)
    
    /// Slow ease for deliberate transitions
    static let slowEase = Animation.easeInOut(duration: 0.5)
}

/// View modifier for press animations
struct PressAnimationModifier: ViewModifier {
    @Binding var isPressed: Bool
    let scale: CGFloat
    
    init(isPressed: Binding<Bool>, scale: CGFloat = 0.95) {
        self._isPressed = isPressed
        self.scale = scale
    }
    
    func body(content: Content) -> some View {
        content
            .scaleEffect(isPressed ? scale : 1.0)
            .opacity(isPressed ? 0.8 : 1.0)
            .animation(AnimationPresets.quickSpring, value: isPressed)
    }
}

/// View modifier for pulse animations
struct PulseAnimationModifier: ViewModifier {
    @State private var isPulsing = false
    let duration: Double
    
    init(duration: Double = 1.5) {
        self.duration = duration
    }
    
    func body(content: Content) -> some View {
        content
            .scaleEffect(isPulsing ? 1.05 : 1.0)
            .opacity(isPulsing ? 0.8 : 1.0)
            .onAppear {
                withAnimation(.easeInOut(duration: duration).repeatForever(autoreverses: true)) {
                    isPulsing = true
                }
            }
    }
}

/// View modifier for shake animation
struct ShakeAnimationModifier: ViewModifier {
    @State private var shakeOffset: CGFloat = 0
    let amount: CGFloat
    
    init(amount: CGFloat = 10) {
        self.amount = amount
    }
    
    func body(content: Content) -> some View {
        content
            .offset(x: shakeOffset)
            .onAppear {
                withAnimation(.default.repeatCount(3, autoreverses: true)) {
                    shakeOffset = amount
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    shakeOffset = 0
                }
            }
    }
}

/// View modifier for glow animation
struct GlowAnimationModifier: ViewModifier {
    @State private var glowIntensity: Double = 0.5
    let color: Color
    
    init(color: Color = .white) {
        self.color = color
    }
    
    func body(content: Content) -> some View {
        content
            .shadow(color: color.opacity(glowIntensity), radius: 10)
            .onAppear {
                withAnimation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true)) {
                    glowIntensity = 1.0
                }
            }
    }
}

/// View modifier for fade in animation
struct FadeInModifier: ViewModifier {
    @State private var opacity: Double = 0
    
    func body(content: Content) -> some View {
        content
            .opacity(opacity)
            .onAppear {
                withAnimation(AnimationPresets.smoothSpring) {
                    opacity = 1.0
                }
            }
    }
}

/// View modifier for slide in from bottom
struct SlideInFromBottomModifier: ViewModifier {
    @State private var offset: CGFloat = 100
    let delay: Double
    
    init(delay: Double = 0) {
        self.delay = delay
    }
    
    func body(content: Content) -> some View {
        content
            .offset(y: offset)
            .onAppear {
                DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
                    withAnimation(AnimationPresets.smoothSpring) {
                        offset = 0
                    }
                }
            }
    }
}

/// View extensions for easy animation application
extension View {
    func pressAnimation(isPressed: Binding<Bool>, scale: CGFloat = 0.95) -> some View {
        modifier(PressAnimationModifier(isPressed: isPressed, scale: scale))
    }
    
    func pulseAnimation(duration: Double = 1.5) -> some View {
        modifier(PulseAnimationModifier(duration: duration))
    }
    
    func shakeAnimation(amount: CGFloat = 10) -> some View {
        modifier(ShakeAnimationModifier(amount: amount))
    }
    
    func glowAnimation(color: Color = .white) -> some View {
        modifier(GlowAnimationModifier(color: color))
    }
    
    func fadeIn() -> some View {
        modifier(FadeInModifier())
    }
    
    func slideInFromBottom(delay: Double = 0) -> some View {
        modifier(SlideInFromBottomModifier(delay: delay))
    }
}

