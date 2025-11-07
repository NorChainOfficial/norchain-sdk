import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Noor Wallet - Download',
  description: 'Download the official Noor Wallet Chrome extension. Manage NOR, tokens, and connect to dApps without MetaMask.',
};

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6">
              <span className="text-4xl">🔐</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Noor Wallet
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Your gateway to NorChain. Manage NOR, tokens, and connect to dApps with our native Chrome extension.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/downloads/norchain-wallet-latest.zip"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-purple-500/50 transition-all hover:scale-105"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download for Chrome
              </a>

              <a
                href="https://github.com/norchain/norchain-sdk/tree/main/apps/wallet-extension"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                View on GitHub
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-20">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">100%</div>
              <div className="text-gray-400">Secure</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">Free</div>
              <div className="text-gray-400">Open Source</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">25+</div>
              <div className="text-gray-400">RPC Methods</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">5.6k+</div>
              <div className="text-gray-400">Lines of Code</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Why Choose Noor Wallet?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-bold text-white mb-3">Bank-Grade Security</h3>
              <p className="text-gray-400">
                Your keys are encrypted with AES-GCM and PBKDF2 (100,000 iterations). Only you can access your funds.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-3">Native to Noor</h3>
              <p className="text-gray-400">
                Optimized specifically for Noor Chain. No need for MetaMask or other wallets.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-bold text-white mb-3">Full dApp Support</h3>
              <p className="text-gray-400">
                Connect to any Noor dApp with our EIP-1193 compliant provider API.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-bold text-white mb-3">Multi-Account</h3>
              <p className="text-gray-400">
                Create unlimited accounts from a single seed phrase. Perfect for managing multiple identities.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-white mb-3">Beautiful UI</h3>
              <p className="text-gray-400">
                Modern, intuitive interface designed specifically for the Noor ecosystem.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8">
              <div className="text-4xl mb-4">🔓</div>
              <h3 className="text-xl font-bold text-white mb-3">Open Source</h3>
              <p className="text-gray-400">
                Fully transparent and auditable. View the code on GitHub and verify security yourself.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Steps */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Easy Installation
          </h2>

          <div className="space-y-6">
            <div className="flex gap-6 items-start bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Download the Extension</h3>
                <p className="text-gray-400">
                  Click the download button above to get the latest version of Noor Wallet.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Install in Chrome</h3>
                <p className="text-gray-400 mb-3">
                  Go to <code className="px-2 py-1 bg-slate-700 rounded text-purple-300">chrome://extensions/</code>, enable Developer Mode, click "Load unpacked", and select the extracted folder.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Create Your Wallet</h3>
                <p className="text-gray-400">
                  Click the extension icon, create a new wallet, and securely backup your 12-word seed phrase.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Start Using!</h3>
                <p className="text-gray-400">
                  Connect to dApps, send NOR, and explore the Noor ecosystem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Notice */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-2 border-yellow-500/50 rounded-2xl p-8">
            <div className="flex gap-4 items-start">
              <div className="text-4xl">⚠️</div>
              <div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-3">Important Security Notice</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span><strong>ALWAYS</strong> back up your 12-word seed phrase on paper</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span><strong>NEVER</strong> share your seed phrase with anyone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span><strong>STORE</strong> your seed phrase in a safe place (fireproof safe recommended)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span><strong>DON&apos;T</strong> screenshot or store digitally</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span><strong>DON&apos;T</strong> share with support (we&apos;ll never ask)</span>
                  </li>
                </ul>
                <p className="mt-4 text-yellow-300 font-semibold">
                  Lost seed phrase = Lost funds forever. There is NO recovery without it!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Download Noor Wallet today and take control of your digital assets.
          </p>
          <a
            href="/downloads/xaheen-wallet-latest.zip"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Noor Wallet
          </a>
        </div>
      </section>
    </div>
  );
}
