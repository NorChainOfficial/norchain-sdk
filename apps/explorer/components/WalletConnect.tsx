'use client';

import { useState, useEffect } from 'react';

interface NorProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
  isNor?: boolean;
}

declare global {
  interface Window {
    xaheen?: NorProvider;
  }
}

interface WalletConnectProps {
  readonly onConnect?: (address: string) => void;
  readonly onDisconnect?: () => void;
}

export default function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps): JSX.Element {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if Nor Wallet is installed
    const checkWallet = () => {
      if (typeof window !== 'undefined' && window.xaheen) {
        setIsInstalled(true);
      }
    };

    // Initial check
    checkWallet();

    // Check again after a delay (in case extension loads late)
    const timer = setTimeout(checkWallet, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!window.xaheen) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountArray = accounts as string[];
      if (accountArray.length > 0) {
        setAddress(accountArray[0]);
        setIsConnected(true);
        onConnect?.(accountArray[0]);
      } else {
        setAddress('');
        setIsConnected(false);
        onDisconnect?.();
      }
    };

    window.xaheen.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.xaheen?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [onConnect, onDisconnect]);

  const connectWallet = async (): Promise<void> => {
    if (!window.xaheen) {
      setShowInstallPrompt(true);
      return;
    }

    try {
      const accounts = await window.xaheen.request({
        method: 'eth_requestAccounts'
      }) as string[];

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        onConnect?.(accounts[0]);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnectWallet = (): void => {
    setAddress('');
    setIsConnected(false);
    onDisconnect?.();
  };

  const formatAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isInstalled) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowInstallPrompt(true)}
          className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Install Wallet
        </button>

        {showInstallPrompt && (
          <div className="absolute top-full mt-2 right-0 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 z-50">
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-3">
                <span className="text-3xl">🔐</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Install Nor Wallet</h3>
              <p className="text-gray-400 text-sm">
                Get our native Chrome extension to connect to dApps and manage your NOR.
              </p>
            </div>

            <a
              href="/wallet"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-12 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all text-center flex items-center justify-center gap-2 mb-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Wallet
            </a>

            <div className="text-xs text-gray-500 text-center">
              Or continue with MetaMask if you prefer
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-12 px-4 bg-slate-800 border border-slate-700 rounded-lg flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span className="text-white font-mono">{formatAddress(address)}</span>
        </div>
        <button
          onClick={disconnectWallet}
          className="h-12 px-4 bg-slate-800 border border-slate-700 text-gray-400 hover:text-white hover:border-slate-600 rounded-lg transition-all"
          title="Disconnect"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all flex items-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      Connect Wallet
    </button>
  );
}
