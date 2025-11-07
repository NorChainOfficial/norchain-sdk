'use client';

import { useState, useEffect } from 'react';
import { ethers, BrowserProvider, Contract as EthersContract } from 'ethers';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AbiFunction, AbiParameter } from '@/lib/types';

interface WriteContractProps {
  readonly contractAddress: string;
  readonly abi: any[];
}

interface TransactionStatus {
  hash?: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export const WriteContract = ({ contractAddress, abi }: WriteContractProps): JSX.Element => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [expandedFunctions, setExpandedFunctions] = useState<Set<string>>(new Set());
  const [functionInputs, setFunctionInputs] = useState<Record<string, Record<number, string>>>({});
  const [functionValues, setFunctionValues] = useState<Record<string, string>>({});
  const [transactionStatus, setTransactionStatus] = useState<Record<string, TransactionStatus>>({});
  const [loadingFunctions, setLoadingFunctions] = useState<Set<string>>(new Set());

  // Filter writable functions (nonpayable and payable)
  const writeFunctions: AbiFunction[] = abi
    .filter(
      (item) =>
        item.type === 'function' &&
        (item.stateMutability === 'nonpayable' || item.stateMutability === 'payable')
    )
    .map((item) => ({
      name: item.name,
      signature: generateFunctionSignature(item),
      stateMutability: item.stateMutability,
      inputs: item.inputs || [],
      outputs: item.outputs || [],
    }));

  // Check if MetaMask is installed
  const hasMetaMask = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

  useEffect(() => {
    if (hasMetaMask && window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        setChainId(parseInt(chainId, 16));
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, [hasMetaMask]);

  const connectWallet = async () => {
    if (!hasMetaMask || !window.ethereum) {
      alert('Please install MetaMask to interact with this contract');
      return;
    }

    try {
      setIsConnecting(true);

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create provider and signer
      const web3Provider = new BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
  };

  const toggleFunction = (signature: string) => {
    const newExpanded = new Set(expandedFunctions);
    if (newExpanded.has(signature)) {
      newExpanded.delete(signature);
    } else {
      newExpanded.add(signature);
    }
    setExpandedFunctions(newExpanded);
  };

  const handleInputChange = (signature: string, index: number, value: string) => {
    setFunctionInputs((prev) => ({
      ...prev,
      [signature]: {
        ...(prev[signature] || {}),
        [index]: value,
      },
    }));
  };

  const handleValueChange = (signature: string, value: string) => {
    setFunctionValues((prev) => ({
      ...prev,
      [signature]: value,
    }));
  };

  const executeFunction = async (func: AbiFunction) => {
    if (!signer || !account) {
      alert('Please connect your wallet first');
      return;
    }

    const signature = func.signature;
    setLoadingFunctions((prev) => new Set(prev).add(signature));
    setTransactionStatus((prev) => ({
      ...prev,
      [signature]: { status: 'pending', message: 'Preparing transaction...' },
    }));

    try {
      // Create contract instance
      const contract = new EthersContract(contractAddress, abi, signer);

      // Collect parameters
      const params = func.inputs.map((input, index) => {
        const value = functionInputs[signature]?.[index] || '';
        return parseInputValue(value, input.type);
      });

      // Prepare transaction options
      const txOptions: any = {};
      if (func.stateMutability === 'payable') {
        const valueInEther = functionValues[signature] || '0';
        txOptions.value = ethers.parseEther(valueInEther);
      }

      // Send transaction
      setTransactionStatus((prev) => ({
        ...prev,
        [signature]: { status: 'pending', message: 'Waiting for wallet confirmation...' },
      }));

      const tx = await contract[func.name](...params, txOptions);

      setTransactionStatus((prev) => ({
        ...prev,
        [signature]: {
          status: 'pending',
          message: 'Transaction submitted. Waiting for confirmation...',
          hash: tx.hash,
        },
      }));

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      setTransactionStatus((prev) => ({
        ...prev,
        [signature]: {
          status: 'success',
          message: `Transaction confirmed in block ${receipt.blockNumber}`,
          hash: tx.hash,
        },
      }));
    } catch (error: any) {
      console.error('Transaction error:', error);
      let errorMessage = 'Transaction failed';

      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction rejected by user';
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setTransactionStatus((prev) => ({
        ...prev,
        [signature]: {
          status: 'error',
          message: errorMessage,
        },
      }));
    } finally {
      setLoadingFunctions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(signature);
        return newSet;
      });
    }
  };

  const generateFunctionSignature = (func: any): string => {
    const inputs = (func.inputs || []).map((input: any) => input.type).join(',');
    return `${func.name}(${inputs})`;
  };

  const parseInputValue = (value: string, type: string): any => {
    if (!value) return type.includes('[]') ? [] : '';

    try {
      if (type.includes('[]')) {
        return JSON.parse(value);
      }
      if (type.startsWith('uint') || type.startsWith('int')) {
        return value;
      }
      if (type === 'bool') {
        return value.toLowerCase() === 'true';
      }
      return value;
    } catch (error) {
      return value;
    }
  };

  const getInputPlaceholder = (type: string): string => {
    if (type.startsWith('uint') || type.startsWith('int')) {
      return 'e.g., 123456789';
    }
    if (type === 'address') {
      return 'e.g., 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
    }
    if (type === 'bool') {
      return 'true or false';
    }
    if (type === 'string') {
      return 'Enter string value';
    }
    if (type.includes('[]')) {
      return 'e.g., ["value1", "value2"]';
    }
    if (type.startsWith('bytes')) {
      return 'e.g., 0x1234abcd';
    }
    return 'Enter value';
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!hasMetaMask) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Write Contract</h2>
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6">
          <p className="text-yellow-400 mb-4">
            MetaMask or a compatible Web3 wallet is required to write to this contract.
          </p>
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Install MetaMask →
          </a>
        </div>
      </Card>
    );
  }

  if (writeFunctions.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Write Contract</h2>
        <p className="text-gray-400">This contract has no writable functions available.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Write Contract</h2>
            <p className="text-gray-400">
              Connect your wallet to execute transactions on this contract.
            </p>
          </div>
          {!account ? (
            <Button onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          ) : (
            <div className="flex flex-col items-end gap-2">
              <div className="text-sm">
                <p className="text-gray-400">Connected:</p>
                <p className="text-white font-mono">{formatAddress(account)}</p>
                {chainId && <p className="text-gray-400">Chain ID: {chainId}</p>}
              </div>
              <Button onClick={disconnectWallet} variant="secondary" className="text-sm">
                Disconnect
              </Button>
            </div>
          )}
        </div>

        {!account && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mt-4">
            <p className="text-blue-400 text-sm">
              ⓘ You need to connect your wallet before you can write to this contract.
            </p>
          </div>
        )}
      </Card>

      {writeFunctions.map((func) => {
        const signature = func.signature;
        const isExpanded = expandedFunctions.has(signature);
        const isLoading = loadingFunctions.has(signature);
        const txStatus = transactionStatus[signature];

        return (
          <Card key={signature} className="overflow-hidden">
            {/* Function Header */}
            <button
              onClick={() => toggleFunction(signature)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{isExpanded ? '▼' : '▶'}</span>
                <div className="text-left">
                  <p className="text-lg font-semibold text-white font-mono">{func.name}</p>
                  <p className="text-sm text-gray-400 font-mono">{signature}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    func.stateMutability === 'payable'
                      ? 'bg-yellow-600/20 text-yellow-400'
                      : 'bg-orange-600/20 text-orange-400'
                  }`}
                >
                  {func.stateMutability}
                </span>
              </div>
            </button>

            {/* Function Body (Expanded) */}
            {isExpanded && (
              <div className="px-6 py-4 border-t border-gray-700 space-y-4">
                {/* Value Input (for payable functions) */}
                {func.stateMutability === 'payable' && (
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-sm text-yellow-400 font-semibold">
                        Payable Amount (XAHEEN)
                      </span>
                      <input
                        type="text"
                        value={functionValues[signature] || ''}
                        onChange={(e) => handleValueChange(signature, e.target.value)}
                        placeholder="0.0"
                        disabled={!account}
                        className="mt-1 w-full h-12 px-4 bg-gray-800 border border-yellow-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-mono text-sm disabled:opacity-50"
                      />
                    </label>
                  </div>
                )}

                {/* Inputs */}
                {func.inputs.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white">Parameters</h4>
                    {func.inputs.map((input, index) => (
                      <div key={index} className="space-y-2">
                        <label className="block">
                          <span className="text-sm text-gray-400">
                            {input.name || `param${index}`} ({input.type})
                          </span>
                          <input
                            type="text"
                            value={functionInputs[signature]?.[index] || ''}
                            onChange={(e) => handleInputChange(signature, index, e.target.value)}
                            placeholder={getInputPlaceholder(input.type)}
                            disabled={!account}
                            className="mt-1 w-full h-12 px-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm disabled:opacity-50"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {/* Write Button */}
                <div>
                  <Button
                    onClick={() => executeFunction(func)}
                    disabled={!account || isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? 'Processing...' : 'Write'}
                  </Button>
                </div>

                {/* Transaction Status */}
                {txStatus && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Transaction Status</h4>
                    <div
                      className={`border rounded-lg p-4 ${
                        txStatus.status === 'success'
                          ? 'bg-green-900/20 border-green-700'
                          : txStatus.status === 'error'
                          ? 'bg-red-900/20 border-red-700'
                          : 'bg-blue-900/20 border-blue-700'
                      }`}
                    >
                      <p
                        className={`text-sm mb-2 ${
                          txStatus.status === 'success'
                            ? 'text-green-400'
                            : txStatus.status === 'error'
                            ? 'text-red-400'
                            : 'text-blue-400'
                        }`}
                      >
                        {txStatus.message}
                      </p>
                      {txStatus.hash && (
                        <a
                          href={`/transactions/${txStatus.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 underline font-mono break-all"
                        >
                          {txStatus.hash}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Return Types */}
                {func.outputs.length > 0 && (
                  <div className="pt-4 border-t border-gray-700">
                    <h4 className="text-sm font-semibold text-white mb-2">Returns</h4>
                    <div className="space-y-1">
                      {func.outputs.map((output, index) => (
                        <p key={index} className="text-sm text-gray-400 font-mono">
                          {output.name || `[${index}]`} ({output.type})
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
