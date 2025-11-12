"use client";

import { WalletConnector } from "@/components/wallet/WalletConnector";

export default function FlashCoinsPage(): JSX.Element {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Flash Coins
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test tokens for development and experimentation on the Nor Chain
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wallet Setup Section */}
        <div className="lg:col-span-2">
          <WalletConnector />
        </div>

        {/* Flash Coins Information */}
        <div className="bg-white dark:bg-gradient-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm dark:shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            About Flash Coins
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Flash Coins are test tokens designed for development and testing
            purposes on the Nor Chain. They can be generated on-demand and
            are perfect for experimenting with smart contracts and DeFi
            protocols.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">
              Important Notice
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Flash Coins have no real-world value and are intended for testing
              purposes only. They should not be used for any financial
              transactions or investments.
            </p>
          </div>
        </div>

        {/* Token Details */}
        <div className="bg-white dark:bg-gradient-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm dark:shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Token Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Name</span>
              <span className="font-medium text-gray-900 dark:text-white">
                Flash BitcoinBR
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Symbol</span>
              <span className="font-medium text-gray-900 dark:text-white">
                FBTCBR
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Decimals</span>
              <span className="font-medium text-gray-900 dark:text-white">
                18
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Contract Address
              </span>
              <span className="font-mono text-sm text-gray-900 dark:text-white">
                0x... (deployed contract)
              </span>
            </div>
          </div>
        </div>

        {/* How to Use */}
        <div className="lg:col-span-2 bg-white dark:bg-gradient-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm dark:shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Use Flash Coins
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  1
                </span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Connect Wallet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Use the wallet connector above to connect your MetaMask, Trust
                Wallet, or Ledger device.
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  2
                </span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Add Network & Token
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Add the Nor Chain network and Flash Coins token to your
                wallet with one click.
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  3
                </span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Start Experimenting
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Generate Flash Coins and start testing your smart contracts and
                DeFi protocols.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
