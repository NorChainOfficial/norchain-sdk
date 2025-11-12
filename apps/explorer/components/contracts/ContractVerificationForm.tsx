'use client';

import React, { useState } from 'react';

interface ContractVerificationFormProps {
  contractAddress: string;
  onVerificationComplete?: () => void;
}

export function ContractVerificationForm({ contractAddress, onVerificationComplete }: ContractVerificationFormProps): JSX.Element {
  const [compilerVersion, setCompilerVersion] = useState('v0.8.20+commit.a1b79de6');
  const [optimizationEnabled, setOptimizationEnabled] = useState(false);
  const [optimizationRuns, setOptimizationRuns] = useState(200);
  const [license, setLicense] = useState('MIT');
  const [sourceCode, setSourceCode] = useState('');
  const [contractName, setContractName] = useState('');
  const [constructorArguments, setConstructorArguments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // TODO: Integrate with actual verification API endpoint
      // const response = await fetch(`/api/v1/contract/verifycontract`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     address: contractAddress,
      //     compilerVersion,
      //     optimizationEnabled,
      //     optimizationRuns,
      //     license,
      //     sourceCode,
      //     contractName,
      //     constructorArguments,
      //   }),
      // });

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess(true);
      if (onVerificationComplete) {
        onVerificationComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-green-400">Contract Verified Successfully!</h3>
        </div>
        <p className="text-green-300 mb-4">
          Your contract has been verified and the source code is now publicly visible.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setSourceCode('');
            setContractName('');
            setConstructorArguments('');
          }}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          Verify Another Contract
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Contract Verification</h3>
        <p className="text-sm text-gray-400 mb-6">
          Verify and publish your contract source code. This allows users to view and interact with your contract's source code.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Compiler Version */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Compiler Version <span className="text-red-400">*</span>
          </label>
          <select
            value={compilerVersion}
            onChange={(e) => setCompilerVersion(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            required
          >
            <option value="v0.8.20+commit.a1b79de6">v0.8.20+commit.a1b79de6</option>
            <option value="v0.8.19+commit.7dd6d404">v0.8.19+commit.7dd6d404</option>
            <option value="v0.8.18+commit.87f61d96">v0.8.18+commit.87f61d96</option>
            <option value="v0.8.17+commit.8df45f5f">v0.8.17+commit.8df45f5f</option>
          </select>
        </div>

        {/* Contract Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Contract Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={contractName}
            onChange={(e) => setContractName(e.target.value)}
            placeholder="MyContract"
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            required
          />
        </div>

        {/* Source Code */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Source Code <span className="text-red-400">*</span>
          </label>
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            placeholder="pragma solidity ^0.8.0;&#10;&#10;contract MyContract {&#10;    // Your contract code here&#10;}"
            rows={15}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono text-sm"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Paste your contract source code here. For multi-file contracts, use the format: ContractName.sol:ContractCode
          </p>
        </div>

        {/* Constructor Arguments */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Constructor Arguments (ABI-encoded)
          </label>
          <input
            type="text"
            value={constructorArguments}
            onChange={(e) => setConstructorArguments(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            ABI-encoded constructor parameters. Leave empty if no constructor arguments.
          </p>
        </div>

        {/* Optimization Settings */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
              <input
                type="checkbox"
                checked={optimizationEnabled}
                onChange={(e) => setOptimizationEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 rounded focus:ring-blue-500"
              />
              Optimization Enabled
            </label>
          </div>
          {optimizationEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Optimization Runs</label>
              <input
                type="number"
                value={optimizationRuns}
                onChange={(e) => setOptimizationRuns(parseInt(e.target.value) || 200)}
                min="0"
                max="10000"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          )}
        </div>

        {/* License */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">License</label>
          <select
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            <option value="MIT">MIT</option>
            <option value="GPL-3.0">GPL-3.0</option>
            <option value="LGPL-3.0">LGPL-3.0</option>
            <option value="AGPL-3.0">AGPL-3.0</option>
            <option value="Unlicense">Unlicense</option>
            <option value="No License">No License</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Verifying...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verify and Publish
            </>
          )}
        </button>
      </div>
    </form>
  );
}

