'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers, BrowserProvider } from 'ethers';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AbiFunction, AbiParameter } from '@/lib/types';
import { AbiManager } from '@/lib/contracts/abi-manager';
import {
  ContractInteractionService,
  GasEstimate,
  SimulationResult,
} from '@/lib/contracts/interaction-service';

interface EnhancedWriteContractProps {
  readonly contractAddress: string;
  readonly abi: readonly any[];
}

interface FunctionState {
  readonly isExpanded: boolean;
  readonly isLoading: boolean;
  readonly inputs: Record<number, string>;
  readonly validationErrors: Record<number, string>;
  readonly payableValue: string;
  readonly gasEstimate?: GasEstimate;
  readonly simulation?: SimulationResult;
  readonly transaction?: {
    readonly status: 'pending' | 'success' | 'error';
    readonly hash?: string;
    readonly message?: string;
    readonly blockNumber?: number;
  };
}

interface WalletState {
  readonly provider: BrowserProvider | null;
  readonly account: string | null;
  readonly chainId: number | null;
  readonly balance: string | null;
  readonly isConnecting: boolean;
}

export const EnhancedWriteContract = ({
  contractAddress,
  abi,
}: EnhancedWriteContractProps): JSX.Element => {
  const [walletState, setWalletState] = useState<WalletState>({
    provider: null,
    account: null,
    chainId: null,
    balance: null,
    isConnecting: false,
  });

  const [functionStates, setFunctionStates] = useState<Record<string, FunctionState>>(
    {}
  );

  // Initialize ABI manager
  const abiManager = useMemo(() => new AbiManager(abi), [abi]);

  // Initialize interaction service
  const interactionService = useMemo(() => {
    const service = new ContractInteractionService();
    if (walletState.provider) {
      service.setProvider(walletState.provider);
    }
    return service;
  }, [walletState.provider]);

  // Parse ABI
  const { writeFunctions, payableFunctions } = useMemo(
    () => abiManager.parseAbi(),
    [abiManager]
  );

  // Check if MetaMask is installed
  const hasMetaMask =
    typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

  /**
   * Setup wallet event listeners
   */
  useEffect(() => {
    if (!hasMetaMask || !window.ethereum) {
      return;
    }

    // Store ethereum reference to ensure it's defined in cleanup
    const ethereum = window.ethereum;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setWalletState((prev) => ({ ...prev, account: accounts[0] }));
        updateBalance(accounts[0]);
      } else {
        disconnectWallet();
      }
    };

    const handleChainChanged = (chainId: string) => {
      setWalletState((prev) => ({
        ...prev,
        chainId: parseInt(chainId, 16),
      }));
      window.location.reload();
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [hasMetaMask]);

  /**
   * Update wallet balance
   */
  const updateBalance = useCallback(async (account: string) => {
    if (!walletState.provider) {
      return;
    }

    try {
      const balance = await walletState.provider.getBalance(account);
      setWalletState((prev) => ({
        ...prev,
        balance: ethers.formatEther(balance),
      }));
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  }, [walletState.provider]);

  /**
   * Connect wallet
   */
  const connectWallet = useCallback(async () => {
    if (!hasMetaMask) {
      alert('Please install MetaMask to interact with contracts');
      return;
    }

    try {
      setWalletState((prev) => ({ ...prev, isConnecting: true }));

      const provider = new BrowserProvider(window.ethereum!);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();

      setWalletState({
        provider,
        account: accounts[0],
        chainId: Number(network.chainId),
        balance: null,
        isConnecting: false,
      });

      updateBalance(accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWalletState((prev) => ({ ...prev, isConnecting: false }));
    }
  }, [hasMetaMask, updateBalance]);

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    setWalletState({
      provider: null,
      account: null,
      chainId: null,
      balance: null,
      isConnecting: false,
    });
  }, []);

  /**
   * Initialize function state
   */
  const initFunctionState = useCallback((signature: string) => {
    setFunctionStates((prev) => ({
      ...prev,
      [signature]: {
        isExpanded: false,
        isLoading: false,
        inputs: {},
        validationErrors: {},
        payableValue: '0',
      },
    }));
  }, []);

  /**
   * Toggle function expansion
   */
  const toggleFunction = useCallback((signature: string) => {
    setFunctionStates((prev) => {
      if (!prev[signature]) {
        return {
          ...prev,
          [signature]: {
            isExpanded: true,
            isLoading: false,
            inputs: {},
            validationErrors: {},
            payableValue: '0',
          },
        };
      }

      return {
        ...prev,
        [signature]: {
          ...prev[signature],
          isExpanded: !prev[signature].isExpanded,
        },
      };
    });
  }, []);

  /**
   * Update input value
   */
  const updateInput = useCallback(
    (signature: string, inputIndex: number, value: string) => {
      setFunctionStates((prev) => ({
        ...prev,
        [signature]: {
          ...prev[signature],
          inputs: {
            ...prev[signature].inputs,
            [inputIndex]: value,
          },
        },
      }));
    },
    []
  );

  /**
   * Execute contract function
   */
  const executeFunction = useCallback(
    async (func: AbiFunction) => {
      if (!walletState.account || !walletState.provider) {
        alert('Please connect your wallet first');
        return;
      }

      const signature = func.signature;
      const state = functionStates[signature];

      if (!state) {
        return;
      }

      try {
        setFunctionStates((prev) => ({
          ...prev,
          [signature]: {
            ...prev[signature],
            isLoading: true,
            transaction: {
              status: 'pending',
              message: 'Confirming transaction...',
            },
          },
        }));

        // Prepare inputs
        const inputs = func.inputs.map((_, index) => state.inputs[index] || '');

        // Execute transaction
        // TODO: Fix executeContractWrite method signature
        const result = await (interactionService as any).executeContractWrite(
          contractAddress,
          abi,
          func.name,
          inputs,
          state.payableValue !== '0' ? state.payableValue : undefined
        );

        setFunctionStates((prev) => ({
          ...prev,
          [signature]: {
            ...prev[signature],
            isLoading: false,
            transaction: {
              status: 'success',
              hash: result.hash,
              blockNumber: result.blockNumber,
              message: 'Transaction successful!',
            },
          },
        }));
      } catch (error) {
        console.error('Error executing function:', error);
        setFunctionStates((prev) => ({
          ...prev,
          [signature]: {
            ...prev[signature],
            isLoading: false,
            transaction: {
              status: 'error',
              message: (error as Error).message,
            },
          },
        }));
      }
    },
    [
      walletState.account,
      walletState.provider,
      functionStates,
      interactionService,
      contractAddress,
      abi,
    ]
  );

  return (
    <div className="space-y-6">
      {/* Wallet Connection */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Wallet Connection</h3>
            {walletState.account ? (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  Account: {walletState.account.slice(0, 10)}...
                  {walletState.account.slice(-8)}
                </p>
                {walletState.balance && (
                  <p className="text-sm text-gray-600">
                    Balance: {parseFloat(walletState.balance).toFixed(4)} ETH
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-600">
                Connect your wallet to interact with this contract
              </p>
            )}
          </div>

          {walletState.account ? (
            <Button onClick={disconnectWallet} variant="secondary">
              Disconnect
            </Button>
          ) : (
            <Button
              onClick={connectWallet}
              disabled={walletState.isConnecting || !hasMetaMask}
            >
              {walletState.isConnecting
                ? 'Connecting...'
                : hasMetaMask
                ? 'Connect Wallet'
                : 'Install MetaMask'}
            </Button>
          )}
        </div>
      </Card>

      {/* Write Functions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Write Functions</h3>

        {writeFunctions.map((func) => {
          const state = functionStates[func.signature] || {
            isExpanded: false,
            isLoading: false,
            inputs: {},
            validationErrors: {},
            payableValue: '0',
          };

          return (
            <Card key={func.signature}>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleFunction(func.signature)}
              >
                <div>
                  <h4 className="font-medium">{func.name}</h4>
                  <p className="text-sm text-gray-600">{func.signature}</p>
                </div>
                <svg
                  className={`h-6 w-6 transition-transform ${
                    state.isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {state.isExpanded && (
                <div className="mt-6 space-y-4">
                  {/* Inputs */}
                  {func.inputs.map((input, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {input.name || `param${index}`} ({input.type})
                      </label>
                      <input
                        type="text"
                        value={state.inputs[index] || ''}
                        onChange={(e) =>
                          updateInput(func.signature, index, e.target.value)
                        }
                        className="h-14 w-full px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                        placeholder={`Enter ${input.type}`}
                      />
                    </div>
                  ))}

                  {/* Payable Value */}
                  {func.stateMutability === 'payable' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Value (ETH)
                      </label>
                      <input
                        type="text"
                        value={state.payableValue}
                        onChange={(e) =>
                          setFunctionStates((prev) => ({
                            ...prev,
                            [func.signature]: {
                              ...prev[func.signature],
                              payableValue: e.target.value,
                            },
                          }))
                        }
                        className="h-14 w-full px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                        placeholder="0.0"
                      />
                    </div>
                  )}

                  {/* Execute Button */}
                  <Button
                    onClick={() => executeFunction(func)}
                    disabled={!walletState.account || state.isLoading}
                    className="w-full"
                  >
                    {state.isLoading ? 'Executing...' : 'Execute'}
                  </Button>

                  {/* Transaction Status */}
                  {state.transaction && (
                    <div
                      className={`p-4 rounded-lg ${
                        state.transaction.status === 'success'
                          ? 'bg-green-50 text-green-800'
                          : state.transaction.status === 'error'
                          ? 'bg-red-50 text-red-800'
                          : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      <p className="font-medium">{state.transaction.message}</p>
                      {state.transaction.hash && (
                        <p className="text-sm mt-1">
                          Hash: {state.transaction.hash.slice(0, 10)}...
                          {state.transaction.hash.slice(-8)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}

        {writeFunctions.length === 0 && (
          <p className="text-gray-600">No write functions available</p>
        )}
      </div>
    </div>
  );
};
