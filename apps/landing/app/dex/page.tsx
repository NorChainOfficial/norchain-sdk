import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'NorSwap DEX | Decentralized Exchange on NorChain',
  description: 'Trade with confidence on NorSwap. $800K locked liquidity for 36 months, 16.5x overcollateralized Dirhamat stablecoin, and zero rug-pull risk.',
  keywords: ['NorSwap', 'DEX', 'NorChain', 'DeFi', 'Dirhamat', 'Liquidity', 'Trading'],
};

export default function DEXPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-900">Live on NorChain</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              NorSwap DEX
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Trade with confidence on the most secure decentralized exchange.
              $800K locked liquidity for 36 months with industry-leading overcollateralization.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://swap.norchain.org"
                className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2"
              >
                Launch App
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href="#liquidity"
                className="h-14 px-8 bg-white border-2 border-gray-300 text-gray-900 font-semibold rounded-xl hover:border-blue-500 transition-colors flex items-center"
              >
                View Liquidity
              </a>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-sm text-gray-600 mb-2">Total Value Locked</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">$2.58M</div>
              <div className="text-sm text-green-600">$800K Liquidity + $1.78M Reserves</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-sm text-gray-600 mb-2">LP Lock Period</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">36 Months</div>
              <div className="text-sm text-blue-600">Industry-leading security</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-sm text-gray-600 mb-2">Active Trading Pairs</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">4 Pairs</div>
              <div className="text-sm text-gray-600">NOR, Dirhamat, WETH, WUSDT</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-sm text-gray-600 mb-2">Dirhamat Backing</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">16.5x</div>
              <div className="text-sm text-purple-600">Multi-asset reserves</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trading Pairs */}
      <section id="liquidity" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Trading Pairs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NOR/WUSDT Pair */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    N
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">NOR/WUSDT</h3>
                    <p className="text-sm text-gray-600">Most Popular</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">$0.01</div>
                  <div className="text-sm text-green-600">1 NOR</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Liquidity</div>
                  <div className="text-lg font-semibold text-gray-900">$250,000</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">24h Volume</div>
                  <div className="text-lg font-semibold text-gray-900">$12,450</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>LP Tokens Locked for 36 Months</span>
              </div>

              <a
                href="https://swap.norchain.org/swap?from=NOR&to=WUSDT"
                className="w-full h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-md flex items-center justify-center"
              >
                Trade Now
              </a>
            </div>

            {/* NOR/WETH Pair */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    N
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">NOR/WETH</h3>
                    <p className="text-sm text-gray-600">High Volume</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">0.0000063</div>
                  <div className="text-sm text-green-600">1 NOR</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Liquidity</div>
                  <div className="text-lg font-semibold text-gray-900">$150,000</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">24h Volume</div>
                  <div className="text-lg font-semibold text-gray-900">$8,920</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>LP Tokens Locked for 36 Months</span>
              </div>

              <a
                href="https://swap.norchain.org/swap?from=NOR&to=WETH"
                className="w-full h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-md flex items-center justify-center"
              >
                Trade Now
              </a>
            </div>

            {/* NOR/Dirhamat Pair */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    D
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">NOR/Dirhamat</h3>
                    <p className="text-sm text-gray-600">Stable Pair</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">27.0</div>
                  <div className="text-sm text-green-600">1 DIRHAMAT</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Liquidity</div>
                  <div className="text-lg font-semibold text-gray-900">$150,000</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">24h Volume</div>
                  <div className="text-lg font-semibold text-gray-900">$6,780</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>LP Tokens Locked for 36 Months</span>
              </div>

              <a
                href="https://swap.norchain.org/swap?from=NOR&to=DIRHAMAT"
                className="w-full h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-md flex items-center justify-center"
              >
                Trade Now
              </a>
            </div>

            {/* Dirhamat/WUSDT Pair */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                    D
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Dirhamat/WUSDT</h3>
                    <p className="text-sm text-gray-600">AED Stablecoin</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">$0.27</div>
                  <div className="text-sm text-green-600">1 DIRHAMAT</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Liquidity</div>
                  <div className="text-lg font-semibold text-gray-900">$50,000</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">24h Volume</div>
                  <div className="text-lg font-semibold text-gray-900">$4,230</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>LP Tokens Locked for 36 Months</span>
              </div>

              <a
                href="https://swap.norchain.org/swap?from=DIRHAMAT&to=WUSDT"
                className="w-full h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-md flex items-center justify-center"
              >
                Trade Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Industry-Leading Security
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
              <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">36-Month LP Lock</h3>
              <p className="text-gray-600 leading-relaxed">
                100% of liquidity provider tokens locked until November 2028.
                Mathematically impossible rug pull - longest lock period in DeFi.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
              <div className="h-16 w-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">16.5x Overcollateralization</h3>
              <p className="text-gray-600 leading-relaxed">
                $1.78M multi-asset reserves backing $108K Dirhamat supply.
                Includes crypto, physical gold, and mining operations.
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8">
              <div className="h-16 w-16 bg-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Full Transparency</h3>
              <p className="text-gray-600 leading-relaxed">
                All reserves verifiable on-chain with IPFS proofs.
                Complete audit trail for physical assets and mining operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Asset Reserve Breakdown */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Dirhamat Reserve Breakdown
          </h2>

          <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <div className="text-sm text-blue-900 font-medium mb-2">WUSDT</div>
                <div className="text-2xl font-bold text-blue-900 mb-1">$108,000</div>
                <div className="text-sm text-blue-700">6.1% of reserves</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                <div className="text-sm text-purple-900 font-medium mb-2">WBNB</div>
                <div className="text-2xl font-bold text-purple-900 mb-1">$300,000</div>
                <div className="text-sm text-purple-700">16.9% of reserves</div>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6">
                <div className="text-sm text-pink-900 font-medium mb-2">WETH</div>
                <div className="text-2xl font-bold text-pink-900 mb-1">$224,000</div>
                <div className="text-sm text-pink-700">12.6% of reserves</div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6">
                <div className="text-sm text-amber-900 font-medium mb-2">Gold</div>
                <div className="text-2xl font-bold text-amber-900 mb-1">$650,000</div>
                <div className="text-sm text-amber-700">36.5% of reserves</div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6">
                <div className="text-sm text-teal-900 font-medium mb-2">Mining</div>
                <div className="text-2xl font-bold text-teal-900 mb-1">$500,000</div>
                <div className="text-sm text-teal-700">28.1% of reserves</div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Reserve Value</div>
                  <div className="text-4xl font-bold text-gray-900">$1,782,000</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Dirhamat Supply</div>
                  <div className="text-4xl font-bold text-gray-900">400,000</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Backing Ratio</div>
                  <div className="text-4xl font-bold text-green-600">16.5x</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Crypto Assets</h3>
              <p className="text-gray-600 text-sm">
                WUSDT, WBNB, and WETH holdings verified on-chain. Real-time pricing from oracles.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Physical Gold</h3>
              <p className="text-gray-600 text-sm">
                10,000g of physical gold stored in secure vaults with IPFS-documented proof of ownership.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mining Operations</h3>
              <p className="text-gray-600 text-sm">
                Active BTC/ETH mining operations generating ongoing revenue to strengthen reserves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Start Trading on NorSwap
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Experience DeFi done right. Maximum security, full transparency, and institutional-grade backing.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://swap.norchain.org"
              className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2"
            >
              Launch App
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="/docs/NOR_CHAIN_DEX_COMPLETE_DEPLOYMENT.md"
              className="h-14 px-8 bg-white border-2 border-gray-300 text-gray-900 font-semibold rounded-xl hover:border-blue-500 transition-colors flex items-center"
            >
              Read Documentation
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
