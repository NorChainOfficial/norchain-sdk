'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';

interface SourceFile {
  readonly name: string;
  readonly content: string;
}

interface SourceCodeViewerProps {
  readonly sourceCode: string;
  readonly sourceFiles?: Record<string, any> | null;
  readonly contractName?: string;
  readonly compilerVersion?: string;
  readonly optimizationEnabled?: boolean;
  readonly optimizationRuns?: number | null;
  readonly evmVersion?: string | null;
  readonly licenseType?: string | null;
}

export const SourceCodeViewer = ({
  sourceCode,
  sourceFiles,
  contractName,
  compilerVersion,
  optimizationEnabled,
  optimizationRuns,
  evmVersion,
  licenseType,
}: SourceCodeViewerProps): JSX.Element => {
  const [selectedFile, setSelectedFile] = useState<string>('main');

  // Parse source files if available
  const files: SourceFile[] = sourceFiles
    ? Object.entries(sourceFiles).map(([name, content]) => ({
        name,
        content: typeof content === 'string' ? content : JSON.stringify(content, null, 2),
      }))
    : [{ name: contractName || 'Contract.sol', content: sourceCode }];

  const currentFile = files.find(f => f.name === selectedFile) || files[0];

  return (
    <div className="space-y-6">
      {/* Compilation Settings */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">Contract Source Code</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {contractName && (
            <div>
              <p className="text-gray-400 mb-1">Contract Name</p>
              <p className="text-white font-medium">{contractName}</p>
            </div>
          )}
          {compilerVersion && (
            <div>
              <p className="text-gray-400 mb-1">Compiler Version</p>
              <p className="text-white font-mono text-sm">{compilerVersion}</p>
            </div>
          )}
          <div>
            <p className="text-gray-400 mb-1">Optimization</p>
            <p className="text-white">
              {optimizationEnabled
                ? `Enabled (${optimizationRuns || 200} runs)`
                : 'Disabled'}
            </p>
          </div>
          {evmVersion && (
            <div>
              <p className="text-gray-400 mb-1">EVM Version</p>
              <p className="text-white">{evmVersion}</p>
            </div>
          )}
          {licenseType && (
            <div>
              <p className="text-gray-400 mb-1">License</p>
              <p className="text-white">{licenseType}</p>
            </div>
          )}
        </div>
      </Card>

      {/* File Selector (if multiple files) */}
      {files.length > 1 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-gray-400 text-sm whitespace-nowrap">Files:</span>
            {files.map((file) => (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file.name)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedFile === file.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {file.name}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Source Code Display */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h4 className="text-lg font-semibold text-white font-mono">
            {currentFile?.name || 'Contract.sol'}
          </h4>
          <CopyButton value={currentFile?.content || sourceCode} />
        </div>

        <div className="relative overflow-x-auto">
          <SyntaxHighlighter
            language="solidity"
            style={vscDarkPlus}
            showLineNumbers={true}
            lineNumberStyle={{
              minWidth: '3em',
              paddingRight: '1em',
              color: '#6B7280',
              textAlign: 'right',
              userSelect: 'none',
            }}
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              background: '#1F2937',
            }}
            wrapLines={false}
            wrapLongLines={false}
          >
            {currentFile?.content || sourceCode}
          </SyntaxHighlighter>
        </div>
      </Card>

      {/* Additional Info */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-white mb-4">About This Contract</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-gray-400">•</span>
            <p className="text-gray-300">
              The source code has been verified and matched with the deployed bytecode on the blockchain.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-400">•</span>
            <p className="text-gray-300">
              You can interact with this contract using the "Read Contract" and "Write Contract" tabs.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-400">•</span>
            <p className="text-gray-300">
              Contract source code is compiled with Solidity compiler version {compilerVersion || 'unknown'}.
            </p>
          </div>
          {licenseType && (
            <div className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <p className="text-gray-300">
                This contract is released under the {licenseType} license.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
