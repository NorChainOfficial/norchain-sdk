'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api-client';
import { AbiFunction, AbiParameter } from '@/lib/types';

interface ReadContractProps {
  readonly contractAddress: string;
  readonly abi: any[];
}

interface FunctionResult {
  success: boolean;
  result?: any;
  error?: string;
}

export const ReadContract = ({ contractAddress, abi }: ReadContractProps): JSX.Element => {
  const [expandedFunctions, setExpandedFunctions] = useState<Set<string>>(new Set());
  const [functionInputs, setFunctionInputs] = useState<Record<string, Record<number, string>>>({});
  const [functionResults, setFunctionResults] = useState<Record<string, FunctionResult>>({});
  const [loadingFunctions, setLoadingFunctions] = useState<Set<string>>(new Set());

  // Filter read-only functions (view and pure)
  const readFunctions: AbiFunction[] = abi
    .filter(
      (item) =>
        item.type === 'function' &&
        (item.stateMutability === 'view' || item.stateMutability === 'pure')
    )
    .map((item) => ({
      name: item.name,
      signature: generateFunctionSignature(item),
      stateMutability: item.stateMutability,
      inputs: item.inputs || [],
      outputs: item.outputs || [],
    }));

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

  const executeFunction = async (func: AbiFunction) => {
    const signature = func.signature;
    setLoadingFunctions((prev) => new Set(prev).add(signature));
    setFunctionResults((prev) => ({ ...prev, [signature]: { success: false } }));

    try {
      // Collect parameters
      const params = func.inputs.map((input, index) => {
        const value = functionInputs[signature]?.[index] || '';
        return parseInputValue(value, input.type);
      });

      // Call the API
      const response = await apiClient.readContract(contractAddress, func.name, params);

      if (response.success) {
        setFunctionResults((prev) => ({
          ...prev,
          [signature]: {
            success: true,
            result: response.data,
          },
        }));
      } else {
        setFunctionResults((prev) => ({
          ...prev,
          [signature]: {
            success: false,
            error: response.message || 'Function call failed',
          },
        }));
      }
    } catch (error) {
      setFunctionResults((prev) => ({
        ...prev,
        [signature]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
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
      // Handle arrays
      if (type.includes('[]')) {
        return JSON.parse(value);
      }

      // Handle numbers
      if (type.startsWith('uint') || type.startsWith('int')) {
        return value;
      }

      // Handle booleans
      if (type === 'bool') {
        return value.toLowerCase() === 'true';
      }

      // Handle addresses, bytes, strings
      return value;
    } catch (error) {
      return value;
    }
  };

  const formatResult = (result: any, outputs: AbiParameter[]): string => {
    if (result === null || result === undefined) {
      return 'null';
    }

    if (typeof result === 'object') {
      // Handle arrays
      if (Array.isArray(result)) {
        if (outputs.length === 1) {
          // Single array return
          return JSON.stringify(result, null, 2);
        } else {
          // Multiple returns
          return outputs.map((output, index) => {
            const value = result[index];
            return `${output.name || `[${index}]`} (${output.type}): ${formatSingleValue(value, output.type)}`;
          }).join('\n');
        }
      }
      return JSON.stringify(result, null, 2);
    }

    return formatSingleValue(result, outputs[0]?.type || 'unknown');
  };

  const formatSingleValue = (value: any, type: string): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
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

  if (readFunctions.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Read Contract</h2>
        <p className="text-gray-400">This contract has no read-only functions available.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Read Contract</h2>
        <p className="text-gray-400">
          Query data from the contract without making a transaction. These are view and pure functions.
        </p>
      </Card>

      {readFunctions.map((func) => {
        const signature = func.signature;
        const isExpanded = expandedFunctions.has(signature);
        const isLoading = loadingFunctions.has(signature);
        const result = functionResults[signature];

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
                <span className="px-3 py-1 text-xs font-medium bg-blue-600/20 text-blue-400 rounded-full">
                  {func.stateMutability}
                </span>
              </div>
            </button>

            {/* Function Body (Expanded) */}
            {isExpanded && (
              <div className="px-6 py-4 border-t border-gray-700 space-y-4">
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
                            className="mt-1 w-full h-12 px-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {/* Query Button */}
                <div>
                  <Button
                    onClick={() => executeFunction(func)}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? 'Querying...' : 'Query'}
                  </Button>
                </div>

                {/* Results */}
                {result && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Result</h4>
                    {result.success ? (
                      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                        <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
                          {formatResult(result.result, func.outputs)}
                        </pre>
                      </div>
                    ) : (
                      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                        <p className="text-sm text-red-400">{result.error || 'Function call failed'}</p>
                      </div>
                    )}
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
