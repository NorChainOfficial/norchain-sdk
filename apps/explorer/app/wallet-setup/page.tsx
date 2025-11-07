"use client";

import { WalletConnector } from "@/components/wallet/WalletConnector";

export default function WalletSetupPage(): JSX.Element {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Wallet Setup
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Automatically configure your wallet for Noor Chain and BitcoinBR
          tokens
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wallet Connector */}
        <div className="lg:col-span-2">
          <WalletConnector />
        </div>

        {/* Instructions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gradient-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm dark:shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Automatic Setup
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Use the wallet connector to automatically add the Noor Chain
              network and BitcoinBR token to your wallet.
            </p>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>One-click network addition</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Automatic token detection</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>No manual configuration needed</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gradient-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm dark:shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Supported Wallets
            </h2>
            <ul className="space-y-3">
              <li className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-6 h-6 text-orange-600 dark:text-orange-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.4 22.915l-1.515-4.725-3.666 1.244 2.25-7.149-2.31-6.96 7.125 5.19L16.5 0l2.25 6.93 7.125-5.19-2.31 6.96 2.25 7.149-3.666-1.244L18.6 22.915l-3.6-2.28-3.6 2.28zm-.15-4.59l2.445-7.65-5.985-4.365 2.1-6.33 1.44 4.455 1.44-4.455 2.1 6.33-5.985 4.365 2.445 7.65z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    MetaMask
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Fully supported
                  </p>
                </div>
              </li>
              <li className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.75 8.25c.414 0 .75.336.75.75v6.75c0 .414-.336.75-.75.75H6.75a.75.75 0 01-.75-.75V9c0-.414.336-.75.75-.75h11.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Trust Wallet
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Supported via browser
                  </p>
                </div>
              </li>
              <li className="flex items-center">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-6 h-6 text-gray-600 dark:text-gray-300"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.5C6.201 22.5 1.5 17.799 1.5 12S6.201 1.5 12 1.5 22.5 6.201 22.5 12 17.799 22.5 12 22.5zm-1.5-15h3c.414 0 .75.336.75.75v9c0 .414-.336.75-.75.75h-3a.75.75 0 01-.75-.75v-9c0-.414.336-.75.75-.75z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Ledger
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Via MetaMask bridge
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gradient-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm dark:shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Manual Setup
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              If automatic setup doesn't work, you can manually configure your
              wallet:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Network Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Network Name:
                  </span>
                  <span className="font-mono">Noor Chain</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    RPC URL:
                  </span>
                  <span className="font-mono">https://rpc.bitcoinbr.tech</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Chain ID:
                  </span>
                  <span className="font-mono">885824</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Currency:
                  </span>
                  <span className="font-mono">BTCBR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
