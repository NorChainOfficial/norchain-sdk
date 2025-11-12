'use client';

import React, { useState } from 'react';
import { ethers } from 'ethers';

interface SourceFile {
  name: string;
  content: string;
}

interface LibraryLink {
  name: string;
  address: string;
}

interface ContractVerificationFormProps {
  contractAddress: string;
  onVerificationComplete?: () => void;
}

export function ContractVerificationForm({ contractAddress, onVerificationComplete }: ContractVerificationFormProps): JSX.Element {
  const [verificationType, setVerificationType] = useState<'single' | 'multi' | 'json'>('single');
  const [compilerVersion, setCompilerVersion] = useState('v0.8.20+commit.a1b79de6');
  const [optimizationEnabled, setOptimizationEnabled] = useState(false);
  const [optimizationRuns, setOptimizationRuns] = useState(200);
  const [license, setLicense] = useState('MIT');
  
  // Single file mode
  const [sourceCode, setSourceCode] = useState('');
  const [contractName, setContractName] = useState('');
  
  // Multi-file mode
  const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([{ name: '', content: '' }]);
  
  // JSON mode (Etherscan format)
  const [jsonInput, setJsonInput] = useState('');
  
  // Constructor arguments
  const [constructorArguments, setConstructorArguments] = useState('');
  const [constructorArgsType, setConstructorArgsType] = useState<'encoded' | 'raw'>('raw');
  const [constructorArgsRaw, setConstructorArgsRaw] = useState('');
  
  // Library linking
  const [libraries, setLibraries] = useState<LibraryLink[]>([]);
  const [showLibraryForm, setShowLibraryForm] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const compilerVersions = [
    'v0.8.20+commit.a1b79de6',
    'v0.8.19+commit.7dd6d404',
    'v0.8.18+commit.87f61d96',
    'v0.8.17+commit.8df45f5f',
    'v0.8.16+commit.07a7930e',
    'v0.8.15+commit.e14f2714',
    'v0.8.14+commit.80d49f37',
    'v0.8.13+commit.abaa5c0e',
    'v0.8.12+commit.f00d8308',
    'v0.8.11+commit.d7f03943',
    'v0.8.10+commit.fc410830',
    'v0.8.9+commit.e5eed63a',
    'v0.8.8+commit.dddeac2f',
    'v0.8.7+commit.e28d00a7',
    'v0.8.6+commit.11564f7e',
    'v0.8.5+commit.a4f2e591',
    'v0.8.4+commit.c7e474f2',
    'v0.8.3+commit.8d00f00d',
    'v0.8.2+commit.661d1103',
    'v0.8.1+commit.df193b15',
    'v0.8.0+commit.c7dfd78e',
    'v0.7.6+commit.7338295f',
    'v0.7.5+commit.eb77ed08',
    'v0.7.4+commit.3f05d770',
    'v0.7.3+commit.9bfce1f6',
    'v0.7.2+commit.51b20bc0',
    'v0.7.1+commit.f4a555be',
    'v0.7.0+commit.9e61f92b',
    'v0.6.12+commit.27d51765',
    'v0.6.11+commit.5ef660b1',
    'v0.6.10+commit.00c0fcaf',
    'v0.6.9+commit.3e3065ac',
    'v0.6.8+commit.0bbfe453',
    'v0.6.7+commit.b8d736ae',
    'v0.6.6+commit.6c089d02',
    'v0.6.5+commit.f956cc89',
    'v0.6.4+commit.1dca32f3',
    'v0.6.3+commit.8dda9521',
    'v0.6.2+commit.bacdbe57',
    'v0.6.1+commit.e6f7d5a4',
    'v0.6.0+commit.26b70090',
    'v0.5.17+commit.d19bba13',
    'v0.5.16+commit.9c3226ce',
    'v0.5.15+commit.6a76bb6d',
    'v0.5.14+commit.01f1aaa4',
    'v0.5.13+commit.5b0b510c',
    'v0.5.12+commit.7709ece9',
    'v0.5.11+commit.22bebe2d',
    'v0.5.10+commit.5a6ea5b1',
    'v0.5.9+commit.c68bc34e',
    'v0.5.8+commit.23d335f2',
    'v0.5.7+commit.6da8b019',
    'v0.5.6+commit.b259423e',
    'v0.5.5+commit.47a71e8f',
    'v0.5.4+commit.9549d8ff',
    'v0.5.3+commit.10d17f24',
    'v0.5.2+commit.1df8f40c',
    'v0.5.1+commit.c8a2cb62',
    'v0.5.0+commit.1d4f565a',
    'v0.4.26+commit.4563c3fc',
    'v0.4.25+commit.59dbf8f1',
    'v0.4.24+commit.e67f0147',
    'v0.4.23+commit.124ca40d',
    'v0.4.22+commit.4c9664ac',
    'v0.4.21+commit.dfe3193c',
    'v0.4.20+commit.3155dd80',
    'v0.4.19+commit.c4cbbb05',
    'v0.4.18+commit.9cf9e2d0',
    'v0.4.17+commit.bdeb9e52',
    'v0.4.16+commit.d7661dd9',
    'v0.4.15+commit.8b45bddb',
    'v0.4.14+commit.c2215d46',
    'v0.4.13+commit.0fb4cb1a',
    'v0.4.12+commit.194ff033',
    'v0.4.11+commit.68ef5810',
    'v0.4.10+commit.f0d539ae',
    'v0.4.9+commit.364da425',
    'v0.4.8+commit.60cc1668',
    'v0.4.7+commit.b4eebcc3',
    'v0.4.6+commit.2dabbdf0',
    'v0.4.5+commit.b318366e',
    'v0.4.4+commit.4633f3de',
    'v0.4.3+commit.2353da71',
    'v0.4.2+commit.af6afb04',
    'v0.4.1+commit.4fc6fc2c',
    'v0.4.0+commit.acd334c9',
  ];

  const addSourceFile = () => {
    setSourceFiles([...sourceFiles, { name: '', content: '' }]);
  };

  const removeSourceFile = (index: number) => {
    setSourceFiles(sourceFiles.filter((_, i) => i !== index));
  };

  const updateSourceFile = (index: number, field: 'name' | 'content', value: string) => {
    const updated = [...sourceFiles];
    updated[index][field] = value;
    setSourceFiles(updated);
  };

  const addLibrary = () => {
    setLibraries([...libraries, { name: '', address: '' }]);
    setShowLibraryForm(true);
  };

  const removeLibrary = (index: number) => {
    setLibraries(libraries.filter((_, i) => i !== index));
  };

  const updateLibrary = (index: number, field: 'name' | 'address', value: string) => {
    const updated = [...libraries];
    updated[index][field] = value;
    setLibraries(updated);
  };

  const encodeConstructorArgs = async () => {
    try {
      if (!constructorArgsRaw.trim()) {
        setError('Please enter constructor arguments');
        return;
      }

      // Try to parse as JSON array
      let args: any[];
      try {
        args = JSON.parse(constructorArgsRaw);
      } catch {
        // If not JSON, try to parse as comma-separated values
        args = constructorArgsRaw.split(',').map(arg => {
          const trimmed = arg.trim();
          // Try to parse as number
          if (/^\d+$/.test(trimmed)) {
            return parseInt(trimmed, 10);
          }
          // Try to parse as hex
          if (trimmed.startsWith('0x')) {
            return trimmed;
          }
          // Return as string
          return trimmed;
        });
      }

      // For now, we'll just encode as a simple format
      // In production, this would use ethers.js ABI encoding
      const encoded = ethers.AbiCoder.defaultAbiCoder().encode(['string[]'], [args.map(String)]);
      setConstructorArguments(encoded);
      setError(null);
    } catch (err: any) {
      setError(`Failed to encode constructor arguments: ${err.message}`);
    }
  };

  const formatSourceCode = (): string => {
    if (verificationType === 'single') {
      return sourceCode;
    } else if (verificationType === 'multi') {
      // Format as Etherscan multi-file format
      const files: Record<string, { content: string }> = {};
      sourceFiles.forEach(file => {
        if (file.name && file.content) {
          files[file.name] = { content: file.content };
        }
      });
      return JSON.stringify({ language: 'Solidity', sources: files });
    } else {
      // JSON mode - use as-is
      return jsonInput;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const formattedSource = formatSourceCode();
      
      if (!formattedSource.trim()) {
        throw new Error('Source code is required');
      }

      if (verificationType === 'single' && !contractName.trim()) {
        throw new Error('Contract name is required');
      }

      // Format libraries
      const libraryLinks: Record<string, string> = {};
      libraries.forEach(lib => {
        if (lib.name && lib.address) {
          libraryLinks[lib.name] = lib.address;
        }
      });

      const verificationData = {
        address: contractAddress,
        sourceCode: formattedSource,
        contractName: verificationType === 'single' ? contractName : '',
        compilerVersion,
        optimizationUsed: optimizationEnabled,
        runs: optimizationEnabled ? optimizationRuns : undefined,
        license,
        constructorArguments: constructorArguments || undefined,
        libraries: Object.keys(libraryLinks).length > 0 ? libraryLinks : undefined,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/contract/verifycontract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Verification failed' }));
        throw new Error(errorData.message || 'Verification failed');
      }

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
            setSourceFiles([{ name: '', content: '' }]);
            setJsonInput('');
            setConstructorArguments('');
            setLibraries([]);
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
        <h3 className="text-lg font-semibold text-white mb-4">Enhanced Contract Verification</h3>
        <p className="text-sm text-gray-400 mb-6">
          Verify and publish your contract source code. Supports single-file, multi-file, and JSON format verification.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Verification Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Verification Type <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setVerificationType('single')}
              className={`px-4 py-3 rounded-lg border transition-colors ${
                verificationType === 'single'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-900 border-slate-700 text-gray-400 hover:border-slate-600'
              }`}
            >
              Single File
            </button>
            <button
              type="button"
              onClick={() => setVerificationType('multi')}
              className={`px-4 py-3 rounded-lg border transition-colors ${
                verificationType === 'multi'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-900 border-slate-700 text-gray-400 hover:border-slate-600'
              }`}
            >
              Multi-File
            </button>
            <button
              type="button"
              onClick={() => setVerificationType('json')}
              className={`px-4 py-3 rounded-lg border transition-colors ${
                verificationType === 'json'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-900 border-slate-700 text-gray-400 hover:border-slate-600'
              }`}
            >
              JSON (Standard)
            </button>
          </div>
        </div>

        {/* Single File Mode */}
        {verificationType === 'single' && (
          <>
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
            </div>
          </>
        )}

        {/* Multi-File Mode */}
        {verificationType === 'multi' && (
          <div className="mb-4 space-y-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-400">
                Source Files <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={addSourceFile}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                + Add File
              </button>
            </div>
            {sourceFiles.map((file, index) => (
              <div key={index} className="bg-slate-900 rounded-lg border border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={file.name}
                    onChange={(e) => updateSourceFile(index, 'name', e.target.value)}
                    placeholder="ContractName.sol"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                  />
                  {sourceFiles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSourceFile(index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <textarea
                  value={file.content}
                  onChange={(e) => updateSourceFile(index, 'content', e.target.value)}
                  placeholder="pragma solidity ^0.8.0;&#10;&#10;contract ContractName {&#10;    // Contract code&#10;}"
                  rows={10}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono text-sm"
                />
              </div>
            ))}
          </div>
        )}

        {/* JSON Mode */}
        {verificationType === 'json' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              JSON Input (Standard JSON Format) <span className="text-red-400">*</span>
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"language": "Solidity", "sources": {...}, "settings": {...}}'
              rows={15}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono text-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste the standard JSON input from your Solidity compiler
            </p>
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
            {compilerVersions.map((version) => (
              <option key={version} value={version}>
                {version}
              </option>
            ))}
          </select>
        </div>

        {/* Constructor Arguments */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Constructor Arguments
          </label>
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setConstructorArgsType('raw')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  constructorArgsType === 'raw'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                }`}
              >
                Raw Input
              </button>
              <button
                type="button"
                onClick={() => setConstructorArgsType('encoded')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  constructorArgsType === 'encoded'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                }`}
              >
                ABI-Encoded
              </button>
            </div>
            {constructorArgsType === 'raw' ? (
              <div className="space-y-2">
                <textarea
                  value={constructorArgsRaw}
                  onChange={(e) => setConstructorArgsRaw(e.target.value)}
                  placeholder='["arg1", "arg2"] or arg1, arg2'
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={encodeConstructorArgs}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  Encode Arguments
                </button>
              </div>
            ) : (
              <input
                type="text"
                value={constructorArguments}
                onChange={(e) => setConstructorArguments(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono text-sm"
              />
            )}
          </div>
          <p className="text-xs text-gray-500">
            ABI-encoded constructor parameters. Leave empty if no constructor arguments.
          </p>
        </div>

        {/* Library Linking */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-400">
              Library Linking (Optional)
            </label>
            <button
              type="button"
              onClick={addLibrary}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              + Add Library
            </button>
          </div>
          {libraries.length > 0 && (
            <div className="space-y-2">
              {libraries.map((library, index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-900 rounded-lg border border-slate-700 p-3">
                  <input
                    type="text"
                    value={library.name}
                    onChange={(e) => updateLibrary(index, 'name', e.target.value)}
                    placeholder="LibraryName"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                  />
                  <input
                    type="text"
                    value={library.address}
                    onChange={(e) => updateLibrary(index, 'address', e.target.value)}
                    placeholder="0x..."
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeLibrary(index)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Link library addresses to their names in your contract
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

