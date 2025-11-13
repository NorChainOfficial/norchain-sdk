'use client'

import React, { useState } from 'react'
import { Wallet, ChevronDown, LogOut, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTransactionStore } from '@/store/transactionStore'

export const WalletConnect = (): JSX.Element => {
  const {
    walletInfo,
    isConnecting,
    connectWallet,
    disconnectWallet,
    refreshWallet,
  } = useTransactionStore()

  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setError(null)
    try {
      await connectWallet()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect wallet')
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    setShowDropdown(false)
  }

  const handleRefresh = async () => {
    try {
      await refreshWallet()
    } catch (error) {
      console.error('Failed to refresh wallet:', error)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance)
    if (num === 0) return '0'
    if (num < 0.0001) return '< 0.0001'
    return num.toFixed(4)
  }

  const getChainName = (chainId: number): string => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet'
      case 5:
        return 'Goerli Testnet'
      case 11155111:
        return 'Sepolia Testnet'
      case 137:
        return 'Polygon Mainnet'
      case 80001:
        return 'Mumbai Testnet'
      default:
        return `Chain ${chainId}`
    }
  }

  if (!walletInfo) {
    return (
      <div className="relative">
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="h-10 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Wallet className="h-4 w-4" />
          <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
        </button>

        {error && (
          <div className="absolute top-full mt-2 right-0 w-64 p-3 bg-red-900/90 border border-red-700 rounded-lg text-xs text-red-200 z-50">
            {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="h-10 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
      >
        <div className="h-2 w-2 rounded-full bg-green-400"></div>
        <span className="text-sm">{formatAddress(walletInfo.address)}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            showDropdown && 'transform rotate-180'
          )}
        />
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute top-full mt-2 right-0 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Wallet Address</span>
                <button
                  onClick={handleRefresh}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  aria-label="Refresh wallet"
                >
                  <RefreshCw className="h-3 w-3 text-gray-400" />
                </button>
              </div>
              <div className="text-sm text-white font-mono break-all">
                {walletInfo.address}
              </div>
            </div>

            <div className="p-4 border-b border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Network</div>
              <div className="text-sm text-white">
                {getChainName(walletInfo.chainId)}
              </div>
            </div>

            <div className="p-4 border-b border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Balance</div>
              <div className="text-sm text-white">
                {formatBalance(walletInfo.balance)} ETH
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={handleDisconnect}
                className="w-full h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
