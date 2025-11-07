'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface WalletContextType {
  readonly address: string | null;
  readonly isConnected: boolean;
  readonly chainId: number | null;
  readonly connect: () => Promise<void>;
  readonly disconnect: () => void;
  readonly switchToNorChain: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const NOOR_CHAIN_ID = 65001;
const NOOR_CHAIN_ID_HEX = '0xFDE9';
const NOOR_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.norchain.org';

interface WalletProviderProps {
  readonly children: React.ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps): JSX.Element => {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Check for saved wallet connection on mount
  useEffect(() => {
    const checkSavedConnection = async () => {
      if (typeof window === 'undefined' || !window.ethereum) return;

      try {
        // Check if wallet was previously connected
        const savedAddress = sessionStorage.getItem('wallet_address');
        const savedChainId = sessionStorage.getItem('wallet_chainId');

        if (savedAddress && savedChainId) {
          // Verify the wallet is still connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
            setAddress(accounts[0]);
            setChainId(parseInt(savedChainId));
            setIsConnected(true);
          } else {
            // Clear saved data if wallet is no longer connected
            sessionStorage.removeItem('wallet_address');
            sessionStorage.removeItem('wallet_chainId');
          }
        }
      } catch (error) {
        console.error('Error checking saved wallet connection:', error);
      }
    };

    checkSavedConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
        sessionStorage.setItem('wallet_address', accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      sessionStorage.setItem('wallet_chainId', newChainId.toString());

      // Reload page on chain change as recommended by MetaMask
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask to connect your wallet');
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        setAddress(account);
        setIsConnected(true);

        // Get current chain ID
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        const chainIdNum = parseInt(currentChainId, 16);
        setChainId(chainIdNum);

        // Save to session storage
        sessionStorage.setItem('wallet_address', account);
        sessionStorage.setItem('wallet_chainId', chainIdNum.toString());

        // Check if we're on NorChain
        if (chainIdNum !== NOOR_CHAIN_ID) {
          const shouldSwitch = confirm('You are not on NorChain. Would you like to switch?');
          if (shouldSwitch) {
            await switchToNorChain();
          }
        }
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      alert(`Failed to connect wallet: ${error.message}`);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setIsConnected(false);
    sessionStorage.removeItem('wallet_address');
    sessionStorage.removeItem('wallet_chainId');
  }, []);

  const switchToNorChain = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    try {
      // Try to switch to NorChain
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NOOR_CHAIN_ID_HEX }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: NOOR_CHAIN_ID_HEX,
                chainName: 'NorChain',
                nativeCurrency: {
                  name: 'NOR',
                  symbol: 'NOR',
                  decimals: 18,
                },
                rpcUrls: [NOOR_RPC_URL],
                blockExplorerUrls: ['http://localhost:3002'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding NorChain:', addError);
          alert('Failed to add NorChain to your wallet');
        }
      } else {
        console.error('Error switching to NorChain:', switchError);
        alert('Failed to switch to NorChain');
      }
    }
  }, []);

  const value: WalletContextType = {
    address,
    isConnected,
    chainId,
    connect,
    disconnect,
    switchToNorChain,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
