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

struct HelpSupportView: View {
    @Environment(\.dismiss) var dismiss
    @State private var showTerms = false
    @State private var showPrivacy = false
    
    let faqs = [
        FAQItem(
            question: "How do I create a wallet?",
            answer: "Tap 'Create Wallet' on the home screen and follow the prompts. You'll receive a 12-word recovery phrase that you must store securely."
        ),
        FAQItem(
            question: "How do I send tokens?",
            answer: "Tap the 'Send' button on your wallet home screen, enter the recipient's address, amount, and confirm the transaction."
        ),
        FAQItem(
            question: "What is a recovery phrase?",
            answer: "A recovery phrase is a 12-word backup that allows you to restore your wallet if you lose access to your device. Store it securely and never share it."
        ),
        FAQItem(
            question: "Is Nor Wallet secure?",
            answer: "Yes, Nor Wallet uses industry-standard encryption and security practices. Your private keys are stored securely on your device and never leave it."
        ),
        FAQItem(
            question: "How do I contact support?",
            answer: "You can reach our support team through the 'Contact Us' option in this section or email support@norwallet.com."
        )
    ]
    
    var body: some View {
        ZStack {
            // Background gradient
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
            
            ScrollView(showsIndicators: false) {
                VStack(spacing: 24) {
                    // Header with enhanced styling - matching SettingsView
                    HStack {
                        Button(action: {
                            HapticFeedbackManager.shared.lightImpact()
                            withAnimation(AnimationPresets.smoothSpring) {
                                dismiss()
                            }
                        }) {
                            Image(systemName: "xmark")
                                .font(.system(size: 20, weight: .semibold))
                                .foregroundColor(.white)
                                .frame(width: 44, height: 44)
                                .background(Circle().fill(Color.white.opacity(0.1)))
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .trailing, spacing: 4) {
                            Text("Help & Support")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("Get help and find answers")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.6))
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 20)
                    
                    // Support Section - using SettingsSection style
                    SettingsSection(title: "Support") {
                        Button(action: {
                            // FAQ is shown below in the view
                        }) {
                            SecurityCard(
                                icon: "questionmark.circle.fill",
                                title: "FAQ",
                                subtitle: "Frequently asked questions",
                                color: hexColor("6366F1"),
                                showChevron: false
                            )
                        }
                        
                        Button(action: {
                            HapticFeedbackManager.shared.mediumImpact()
                            openEmail()
                        }) {
                            SecurityCard(
                                icon: "envelope.fill",
                                title: "Contact Us",
                                subtitle: "Email support@norwallet.com",
                                color: hexColor("3B82F6"),
                                showChevron: true
                            )
                        }
                        
                        Button(action: {
                            HapticFeedbackManager.shared.mediumImpact()
                            openUserGuide()
                        }) {
                            SecurityCard(
                                icon: "doc.plaintext.fill",
                                title: "User Guide",
                                subtitle: "Step-by-step instructions",
                                color: hexColor("10B981"),
                                showChevron: true
                            )
                        }
                    }
                    
                    // Community Section - using SettingsSection style
                    SettingsSection(title: "Community & Social") {
                        Button(action: {
                            HapticFeedbackManager.shared.mediumImpact()
                            openTelegram()
                        }) {
                            SecurityCard(
                                icon: "network",
                                title: "Telegram",
                                subtitle: "Join our community",
                                color: hexColor("0088CC"),
                                showChevron: true
                            )
                        }
                        
                        Button(action: {
                            HapticFeedbackManager.shared.mediumImpact()
                            openTwitter()
                        }) {
                            SecurityCard(
                                icon: "bird.fill",
                                title: "Twitter",
                                subtitle: "Follow for updates",
                                color: hexColor("1DA1F2"),
                                showChevron: true
                            )
                        }
                        
                        Button(action: {
                            HapticFeedbackManager.shared.mediumImpact()
                            openWebsite()
                        }) {
                            SecurityCard(
                                icon: "link",
                                title: "Website",
                                subtitle: "norwallet.com",
                                color: hexColor("8B5CF6"),
                                showChevron: true
                            )
                        }
                    }
                    
                    // Legal Section - using SettingsSection style
                    SettingsSection(title: "Legal") {
                        Button(action: {
                            HapticFeedbackManager.shared.mediumImpact()
                            showTerms = true
                        }) {
                            SecurityCard(
                                icon: "doc.plaintext.fill",
                                title: "Terms of Service",
                                subtitle: "User agreement",
                                color: hexColor("8B5CF6"),
                                showChevron: true
                            )
                        }
                        
                        Button(action: {
                            HapticFeedbackManager.shared.mediumImpact()
                            showPrivacy = true
                        }) {
                            SecurityCard(
                                icon: "hand.raised.fill",
                                title: "Privacy Policy",
                                subtitle: "Data protection",
                                color: hexColor("06B6D4"),
                                showChevron: true
                            )
                        }
                    }
                    
                    // FAQ Section - using SettingsSection style
                    SettingsSection(title: "Frequently Asked Questions") {
                        ForEach(faqs.indices, id: \.self) { index in
                            FAQRow(faq: faqs[index])
                        }
                    }
                }
                .padding(.bottom, 40)
            }
        }
        .sheet(isPresented: $showTerms) {
            TermsOfServiceView()
        }
        .sheet(isPresented: $showPrivacy) {
            PrivacyPolicyView()
        }
    }
    
    func openEmail() {
        if let url = URL(string: "mailto:support@norwallet.com?subject=Support%20Request") {
            UIApplication.shared.open(url)
        }
    }
    
    func openTelegram() {
        if let url = URL(string: "https://t.me/norwallet") {
            UIApplication.shared.open(url)
        } else if let tgUrl = URL(string: "tg://resolve?domain=norwallet") {
            if UIApplication.shared.canOpenURL(tgUrl) {
                UIApplication.shared.open(tgUrl)
            }
        }
    }
    
    func openTwitter() {
        if let url = URL(string: "https://twitter.com/norwallet") {
            UIApplication.shared.open(url)
        } else if let twUrl = URL(string: "twitter://user?screen_name=norwallet") {
            if UIApplication.shared.canOpenURL(twUrl) {
                UIApplication.shared.open(twUrl)
            }
        }
    }
    
    func openWebsite() {
        if let url = URL(string: "https://norwallet.com") {
            UIApplication.shared.open(url)
        }
    }
    
    func openUserGuide() {
        if let url = URL(string: "https://norwallet.com/guide") {
            UIApplication.shared.open(url)
        }
    }
}

struct FAQItem: Identifiable {
    let id = UUID()
    let question: String
    let answer: String
}

struct FAQRow: View {
    let faq: FAQItem
    @State private var isExpanded = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button(action: {
                withAnimation(.spring(response: 0.3)) {
                    isExpanded.toggle()
                }
            }) {
                HStack {
                    Text(faq.question)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.white)
                        .fixedSize(horizontal: false, vertical: true)
                    
                    Spacer()
                    
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white.opacity(0.4))
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 16)
            }
            
            if isExpanded {
                Divider()
                    .background(Color.white.opacity(0.1))
                
                Text(faq.answer)
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.7))
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 16)
                    .background(Color.white.opacity(0.05))
            }
        }
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.white.opacity(0.1))
        )
    }
}

#if DEBUG
#Preview {
    HelpSupportView()
}
#endif