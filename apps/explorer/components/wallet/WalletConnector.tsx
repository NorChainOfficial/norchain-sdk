'use client';

import { useState, useEffect } from 'react';
import { Button, type ButtonProps } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CopyButton } from '@/components/ui/CopyButton';
import { useToast } from '@/components/ui/Toast';

export function WalletConnector() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const { showToast } = useToast();

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          const chain = await window.ethereum.request({ method: 'eth_chainId' });
          
          if (accounts.length > 0) {
            setIsConnected(true);
            setAccount(accounts[0]);
            setChainId(chain);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const connectMetaMask = async () => {
    if (typeof window.ethereum === 'undefined' || !(window.ethereum as any).isMetaMask) {
      showToast('Please install MetaMask wallet', 'error');
      // Open MetaMask website in new tab
      window.open('https://metamask.io/', '_blank');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chain = await window.ethereum.request({ method: 'eth_chainId' });
      
      setIsConnected(true);
      setAccount(accounts[0]);
      setChainId(chain);
      showToast('MetaMask connected successfully!', 'success');
    } catch (error) {
      console.error('Error connecting MetaMask:', error);
      showToast('Failed to connect MetaMask', 'error');
    }
  };

  const connectTrustWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      showToast('Please install Trust Wallet browser extension', 'error');
      // Open Trust Wallet website in new tab
      window.open('https://trustwallet.com/', '_blank');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chain = await window.ethereum.request({ method: 'eth_chainId' });
      
      setIsConnected(true);
      setAccount(accounts[0]);
      setChainId(chain);
      showToast('Trust Wallet connected successfully!', 'success');
    } catch (error) {
      console.error('Error connecting Trust Wallet:', error);
      showToast('Failed to connect Trust Wallet', 'error');
    }
  };

  const connectLedger = async () => {
    showToast('Please connect your Ledger device and use MetaMask with Ledger', 'info');
    // Open Ledger website in new tab
    window.open('https://www.ledger.com/', '_blank');
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    setChainId(null);
    showToast('Wallet disconnected', 'info');
  };

  const addNoorNetwork = async () => {
    if (!window.ethereum) {
      showToast('Please install a wallet first', 'error');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xFDE9', // 65001 in hex
          chainName: 'NorChain',
          rpcUrls: ['https://rpc.norchain.org'],
          nativeCurrency: {
            name: 'Noor',
            symbol: 'NOR',
            decimals: 18,
          },
          blockExplorerUrls: ['https://explorer.norchain.org'],
        }],
      });

      showToast('NorChain added successfully!', 'success');
    } catch (error) {
      console.error('Error adding NorChain:', error);
      showToast('Failed to add NorChain', 'error');
    }
  };

  const addBtcbrToken = async () => {
    if (!window.ethereum) {
      showToast('Please install a wallet first', 'error');
      return;
    }

    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: '0x0cF8e180350253271f4b917CcFb0aCCc4862F262',
            symbol: 'BTCBR',
            decimals: 0,
            image: 'https://explorer.norchain.org/btcbr-logo.png',
          },
        } as any,
      }) as boolean;

      if (wasAdded) {
        showToast('BTCBR token added successfully!', 'success');
      }
    } catch (error) {
      console.error('Error adding BTCBR token:', error);
      showToast('Failed to add BTCBR token', 'error');
    }
  };

  const getChainName = (chainId: string | null) => {
    switch (chainId) {
      case '0xFDE9': // 65001 (correct)
      case '0xfde9': // lowercase version
        return 'NorChain';
      case '0x38': // 56
        return 'BSC';
      default:
        return 'Unknown';
    }
  };

  const getWalletName = () => {
    if (typeof window.ethereum !== 'undefined') {
      if ((window.ethereum as any).isMetaMask) {
        return 'MetaMask';
      }
      // Check for Trust Wallet properties if they exist
      if ((window.ethereum as any).isTrust || (window.ethereum as any).isTrustWallet) {
        return 'Trust Wallet';
      }
      return 'Ethereum Wallet';
    }
    return 'Not Connected';
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-8 shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-orange-500 rounded-full mb-4">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
          Connect Your Wallet
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Choose your preferred wallet to get started with NorChain
        </p>
      </div>

      {!isConnected ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={connectMetaMask}
              className="group relative flex flex-col items-center justify-center gap-4 h-auto p-8 bg-white dark:bg-slate-800 rounded-2xl border-3 border-orange-500 hover:border-orange-600 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full group-hover:scale-110 transition-transform">
                <svg className="w-16 h-16 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 22.915l-1.515-4.725-3.666 1.244 2.25-7.149-2.31-6.96 7.125 5.19L16.5 0l2.25 6.93 7.125-5.19-2.31 6.96 2.25 7.149-3.666-1.244L18.6 22.915l-3.6-2.28-3.6 2.28zm-.15-4.59l2.445-7.65-5.985-4.365 2.1-6.33 1.44 4.455 1.44-4.455 2.1 6.33-5.985 4.365 2.445 7.65z"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">MetaMask</span>
              <span className="text-base text-slate-600 dark:text-slate-400 text-center px-2">
                Most popular crypto wallet
              </span>
            </button>

            <button
              onClick={connectTrustWallet}
              className="group relative flex flex-col items-center justify-center gap-4 h-auto p-8 bg-white dark:bg-slate-800 rounded-2xl border-3 border-blue-500 hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:scale-110 transition-transform">
                <svg className="w-16 h-16 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.75 8.25c.414 0 .75.336.75.75v6.75c0 .414-.336.75-.75.75H6.75a.75.75 0 01-.75-.75V9c0-.414.336-.75.75-.75h11.5z"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">Trust Wallet</span>
              <span className="text-base text-slate-600 dark:text-slate-400 text-center px-2">
                Secure mobile wallet
              </span>
            </button>

            <button
              onClick={connectLedger}
              className="group relative flex flex-col items-center justify-center gap-4 h-auto p-8 bg-white dark:bg-slate-800 rounded-2xl border-3 border-slate-500 hover:border-slate-600 hover:shadow-2xl hover:shadow-slate-500/30 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full group-hover:scale-110 transition-transform">
                <svg className="w-16 h-16 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.5C6.201 22.5 1.5 17.799 1.5 12S6.201 1.5 12 1.5 22.5 6.201 22.5 12 17.799 22.5 12 22.5zm-1.5-15h3c.414 0 .75.336.75.75v9c0 .414-.336.75-.75.75h-3a.75.75 0 01-.75-.75v-9c0-.414.336-.75.75-.75z"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">Ledger</span>
              <span className="text-base text-slate-600 dark:text-slate-400 text-center px-2">
                Hardware wallet security
              </span>
            </button>
          </div>

          <div className="text-center pt-4 border-t-2 border-slate-200 dark:border-slate-700">
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Don't have a wallet?{' '}
              <button
                onClick={() => window.open('https://norchain.org/wallets', '_blank')}
                className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold underline decoration-2 underline-offset-4 hover:decoration-4 transition-all"
              >
                Learn more about wallets
              </button>
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-green-500 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">Connected Account</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <code className="text-lg bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg font-mono text-slate-900 dark:text-white">
                    {account?.substring(0, 6)}...{account?.substring(38)}
                  </code>
                  <CopyButton value={account || ''} />
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {getWalletName()} • {getChainName(chainId)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={addNoorNetwork}
              className="h-16 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Noor Network
              </div>
            </button>
            <button
              onClick={addBtcbrToken}
              className="h-16 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add BTCBR Token
              </div>
            </button>
            <button
              onClick={disconnectWallet}
              className="h-16 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}