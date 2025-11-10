import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NorChain Infrastructure - Wallet Applications',
  description: 'Wallet applications have been moved to separate repositories for multi-network support.',
};

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse [animation-delay:2s]"></div>
        <div className="absolute bottom-40 right-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse [animation-delay:4s]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Icon */}
          <div className="mb-8 inline-flex">
            <div className="h-32 w-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-500 animate-bounce">
              <svg className="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 3l-1-1m-7-1h.01m-6.01 0H6m6-3a3 3 0 100 6 3 3 0 000-6z"/>
              </svg>
            </div>
          </div>

          {/* Title with stunning animation */}
          <div className="mb-8 overflow-hidden">
            <h1 className="text-6xl md:text-8xl font-black mb-4 leading-tight animate-fade-in">
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Wallet Applications
              </span>
            </h1>
          </div>

          {/* Notification Badge */}
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md border-2 border-orange-400/50 px-8 py-4 rounded-2xl mb-8 animate-fade-in [animation-delay:300ms]">
            <div className="h-8 w-8 bg-orange-400 rounded-lg flex items-center justify-center animate-pulse">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="text-orange-300 font-bold text-lg">Infrastructure Evolution</div>
              <div className="text-orange-100 text-sm">Applications now available as independent services</div>
            </div>
          </div>

          {/* Main Message */}
          <div className="mb-12 animate-fade-in [animation-delay:600ms]">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-3xl mx-auto border border-white/20 shadow-2xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-blue-100">
                Multi-Network Wallet Ecosystem
              </h2>
              <p className="text-lg md:text-xl text-blue-200 leading-relaxed mb-6">
                We've restructured our wallet applications into independent repositories to enable 
                specialized development for different blockchain networks. This architectural change 
                allows for better security, faster iterations, and network-specific optimizations.
              </p>
              
              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 bg-blue-400 rounded-lg flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9"/>
                      </svg>
                    </div>
                    <span className="text-white font-semibold">Cross-Chain Support</span>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 bg-purple-400 rounded-lg flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12l4-4m-4 4l4 4"/>
                      </svg>
                    </div>
                    <span className="text-white font-semibold">Modular Architecture</span>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 bg-green-400 rounded-lg flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                    </div>
                    <span className="text-white font-semibold">Rapid Deployment</span>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 bg-pink-400 rounded-lg flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                      </svg>
                    </div>
                    <span className="text-white font-semibold">Enhanced Security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 animate-fade-in [animation-delay:900ms]">
            <a
              href="/"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-2xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <svg className="h-6 w-6 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0h3.586a1 1 0 00.707-.293l8.293-8.293M13 21h3a1 1 0 001-1v-10"/>
              </svg>
              Back to Infrastructure
            </a>
            
            <a
              href="https://docs.norchain.org/wallets"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <svg className="h-6 w-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
              View Documentation
            </a>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-fade-in [animation-delay:1200ms]">
            <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-md border border-blue-400/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 group">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-200 mb-3">Mobile Applications</h3>
              <p className="text-blue-100/80">Native iOS and Android applications with biometric authentication and secure key management.</p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-md border border-purple-400/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 group">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-purple-200 mb-3">Browser Extensions</h3>
              <p className="text-purple-100/80">Seamlessly connect with decentralized applications through Chrome, Firefox, and Edge browsers.</p>
            </div>

            <div className="bg-gradient-to-br from-pink-900/50 to-red-900/50 backdrop-blur-md border border-pink-400/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 group">
              <div className="h-16 w-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-pink-200 mb-3">Desktop Solutions</h3>
              <p className="text-pink-100/80">Professional desktop applications for Windows, macOS, and Linux with hardware wallet integration.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}