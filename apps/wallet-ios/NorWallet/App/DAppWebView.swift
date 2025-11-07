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
import WebKit

struct DAppWebView: View {
    let url: URL
    @Environment(\.dismiss) var dismiss
    @StateObject private var webViewStore = WebViewStore()
    
    var body: some View {
        ZStack {
            // Background
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
            
            VStack(spacing: 0) {
                // Header
                HStack {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .font(.system(size: 20, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(width: 44, height: 44)
                            .background(
                                Circle()
                                    .fill(Color.white.opacity(0.1))
                            )
                    }
                    
                    Spacer()
                    
                    VStack(spacing: 4) {
                        Text(webViewStore.title ?? "DApp")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                            .lineLimit(1)
                        
                        if let urlString = webViewStore.url?.absoluteString {
                            Text(urlString)
                                .font(.system(size: 12))
                                .foregroundColor(.white.opacity(0.6))
                                .lineLimit(1)
                        }
                    }
                    
                    Spacer()
                    
                    // Refresh button
                    Button(action: {
                        webViewStore.webView?.reload()
                    }) {
                        Image(systemName: "arrow.clockwise")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(width: 44, height: 44)
                            .background(
                                Circle()
                                    .fill(Color.white.opacity(0.1))
                            )
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color.black.opacity(0.2))
                
                // WebView
                WebView(store: webViewStore)
                    .onAppear {
                        webViewStore.load(url: url)
                    }
            }
        }
    }
}

class WebViewStore: ObservableObject {
    @Published var title: String?
    @Published var url: URL?
    @Published var isLoading = false
    @Published var canGoBack = false
    @Published var canGoForward = false
    
    var webView: WKWebView?
    
    func load(url: URL) {
        webView?.load(URLRequest(url: url))
    }
}

struct WebView: UIViewRepresentable {
    @ObservedObject var store: WebViewStore
    
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.preferences.javaScriptEnabled = true
        
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        
        store.webView = webView
        
        return webView
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {
        // Update if needed
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(store: store)
    }
    
    class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        let store: WebViewStore
        
        init(store: WebViewStore) {
            self.store = store
        }
        
        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            store.isLoading = true
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            store.isLoading = false
            store.title = webView.title
            store.url = webView.url
            store.canGoBack = webView.canGoBack
            store.canGoForward = webView.canGoForward
        }
        
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            store.isLoading = false
        }
        
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            // Allow navigation
            decisionHandler(.allow)
        }
    }
}

