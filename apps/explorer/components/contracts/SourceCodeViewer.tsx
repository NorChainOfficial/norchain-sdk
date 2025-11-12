'use client';

import React, { useState } from 'react';

interface SourceCodeViewerProps {
  sourceCode: string;
  contractName?: string;
  compilerVersion?: string;
  license?: string;
}

export function SourceCodeViewer({ sourceCode, contractName, compilerVersion, license }: SourceCodeViewerProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sourceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!sourceCode) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="text-center text-gray-400 py-8">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <p className="text-lg font-medium">Source Code Not Available</p>
          <p className="text-sm mt-1">This contract has not been verified yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Contract Source Code</h3>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={wrapLines}
              onChange={(e) => setWrapLines(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 rounded focus:ring-blue-500"
            />
            Wrap lines
          </label>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Contract Info */}
      {(contractName || compilerVersion || license) && (
        <div className="mb-4 p-3 bg-slate-900 rounded-lg border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            {contractName && (
              <div>
                <span className="text-gray-400">Contract Name:</span>
                <span className="ml-2 text-white font-semibold">{contractName}</span>
              </div>
            )}
            {compilerVersion && (
              <div>
                <span className="text-gray-400">Compiler:</span>
                <span className="ml-2 text-white font-mono text-xs">{compilerVersion}</span>
              </div>
            )}
            {license && (
              <div>
                <span className="text-gray-400">License:</span>
                <span className="ml-2 text-white">{license}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Source Code */}
      <div className="relative">
        <pre
          className={`bg-slate-950 rounded-lg border border-slate-700 p-4 overflow-x-auto text-sm ${
            wrapLines ? 'whitespace-pre-wrap' : 'whitespace-pre'
          }`}
        >
          <code className="text-green-400 font-mono">{sourceCode}</code>
        </pre>
      </div>

      {/* Line Count */}
      <div className="mt-2 text-xs text-gray-500 text-right">
        {sourceCode.split('\n').length} line{sourceCode.split('\n').length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

