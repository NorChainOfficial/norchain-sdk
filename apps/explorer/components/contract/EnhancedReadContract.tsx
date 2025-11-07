'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AbiFunction, AbiParameter } from '@/lib/types';
import { AbiManager } from '@/lib/contracts/abi-manager';
import { ContractInteractionService } from '@/lib/contracts/interaction-service';

interface EnhancedReadContractProps {
  readonly contractAddress: string;
  readonly abi: readonly any[];
}

interface FunctionState {
  readonly isExpanded: boolean;
  readonly isLoading: boolean;
  readonly inputs: Record<number, string>;
  readonly validationErrors: Record<number, string>;
  readonly result?: {
    readonly success: boolean;
    readonly data?: unknown;
    readonly error?: string;
    readonly timestamp: number;
  };
  readonly history: ReadonlyArray<{
    readonly timestamp: number;
    readonly result: unknown;
    readonly inputs: Record<number, string>;
  }>;
}

export const EnhancedReadContract = ({
  contractAddress,
  abi,
}: EnhancedReadContractProps): JSX.Element => {
  const [functionStates, setFunctionStates] = useState<Record<string, FunctionState>>({});
  const [batchMode, setBatchMode] = useState(false);
  const [selectedFunctions, setSelectedFunctions] = useState<Set<string>>(new Set());

  // Initialize ABI manager and interaction service
  const abiManager = useMemo(() => new AbiManager(abi), [abi]);
  const interactionService = useMemo(() => new ContractInteractionService(), []);

  // Parse ABI
  const { readFunctions } = useMemo(() => abiManager.parseAbi(), [abiManager]);

  /**
   * Toggle function expansion
   */
  const toggleFunction = useCallback((signature: string) => {
    setFunctionStates((prev) => {
      const current = prev[signature] || {
        isExpanded: false,
        isLoading: false,
        inputs: {},
        validationErrors: {},
        history: [],
      };

      return {
        ...prev,
        [signature]: {
          ...current,
          isExpanded: !current.isExpanded,
        },
      };
    });
  }, []);

  /**
   * Handle input change with validation
   */
  const handleInputChange = useCallback(
    (signature: string, index: number, value: string, type: string) => {
      setFunctionStates((prev) => {
        const current = prev[signature] || {
          isExpanded: true,
          isLoading: false,
          inputs: {},
          validationErrors: {},
          history: [],
        };

        // Validate input
        const validation = abiManager.validateAndParseInput(value, type);

        return {
          ...prev,
          [signature]: {
            ...current,
            inputs: {
              ...current.inputs,
              [index]: value,
            },
            validationErrors: {
              ...current.validationErrors,
              [index]: validation.isValid ? '' : validation.error || '',
            },
          },
        };
      });
    },
    [abiManager]
  );

  /**
   * Execute single function
   */
  const executeFunction = useCallback(
    async (func: AbiFunction) => {
      const signature = func.signature;
      const state = functionStates[signature];

      // Check for validation errors
      const hasErrors = Object.values(state?.validationErrors || {}).some(
        (error) => error !== ''
      );
      if (hasErrors) {
        return;
      }

      // Set loading state
      setFunctionStates((prev) => ({
        ...prev,
        [signature]: {
          ...(prev[signature] || {
            isExpanded: true,
            inputs: {},
            validationErrors: {},
            history: [],
          }),
          isLoading: true,
        },
      }));

      try {
        // Parse parameters
        const params = func.inputs.map((input, index) => {
          const value = state?.inputs[index] || '';
          const validation = abiManager.validateAndParseInput(value, input.type);
          return validation.parsedValue;
        });

        // Execute read call
        const result = await interactionService.readContract(
          contractAddress,
          abi,
          func.name,
          params,
          false // Don't use cache for explicit queries
        );

        // Update state with result
        setFunctionStates((prev) => {
          const current = prev[signature] || {
            isExpanded: true,
            isLoading: false,
            inputs: {},
            validationErrors: {},
            history: [],
          };

          const newHistory = [
            {
              timestamp: Date.now(),
              result: result.data,
              inputs: { ...current.inputs },
            },
            ...current.history,
          ].slice(0, 5); // Keep last 5 results

          return {
            ...prev,
            [signature]: {
              ...current,
              isLoading: false,
              result: {
                success: result.success,
                data: result.data,
                error: result.error,
                timestamp: Date.now(),
              },
              history: newHistory,
            },
          };
        });
      } catch (error) {
        setFunctionStates((prev) => ({
          ...prev,
          [signature]: {
            ...(prev[signature] || {
              isExpanded: true,
              inputs: {},
              validationErrors: {},
              history: [],
            }),
            isLoading: false,
            result: {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: Date.now(),
            },
          },
        }));
      }
    },
    [functionStates, abiManager, interactionService, contractAddress, abi]
  );

  /**
   * Execute batch read
   */
  const executeBatchRead = useCallback(async () => {
    const functionsToExecute = readFunctions.filter((func) =>
      selectedFunctions.has(func.signature)
    );

    if (functionsToExecute.length === 0) {
      return;
    }

    // Set loading for all selected functions
    setFunctionStates((prev) => {
      const updated = { ...prev };
      for (const func of functionsToExecute) {
        updated[func.signature] = {
          ...(updated[func.signature] || {
            isExpanded: false,
            inputs: {},
            validationErrors: {},
            history: [],
          }),
          isLoading: true,
        };
      }
      return updated;
    });

    // Prepare batch calls
    const calls = functionsToExecute.map((func) => {
      const state = functionStates[func.signature];
      const params = func.inputs.map((input, index) => {
        const value = state?.inputs[index] || '';
        const validation = abiManager.validateAndParseInput(value, input.type);
        return validation.parsedValue;
      });

      return {
        functionName: func.name,
        params,
      };
    });

    // Execute batch
    const results = await interactionService.batchRead(contractAddress, abi, calls);

    // Update states
    setFunctionStates((prev) => {
      const updated = { ...prev };
      functionsToExecute.forEach((func, index) => {
        const result = results[index];
        updated[func.signature] = {
          ...(updated[func.signature] || {
            isExpanded: false,
            inputs: {},
            validationErrors: {},
            history: [],
          }),
          isLoading: false,
          result: {
            success: result.success,
            data: result.data,
            error: result.error,
            timestamp: Date.now(),
          },
        };
      });
      return updated;
    });
  }, [
    readFunctions,
    selectedFunctions,
    functionStates,
    abiManager,
    interactionService,
    contractAddress,
    abi,
  ]);

  /**
   * Toggle function selection for batch mode
   */
  const toggleFunctionSelection = useCallback((signature: string) => {
    setSelectedFunctions((prev) => {
      const updated = new Set(prev);
      if (updated.has(signature)) {
        updated.delete(signature);
      } else {
        updated.add(signature);
      }
      return updated;
    });
  }, []);

  /**
   * Format result for display
   */
  const formatResult = useCallback(
    (data: unknown, outputs: readonly AbiParameter[]): string => {
      if (data === null || data === undefined) {
        return 'null';
      }

      // Multiple outputs
      if (Array.isArray(data) && outputs.length > 1) {
        return outputs
          .map((output, index) => {
            const value = data[index];
            const formatted = abiManager.formatOutput(value, output.type);
            return `${output.name || `[${index}]`} (${output.type}):\n${formatted}`;
          })
          .join('\n\n');
      }

      // Single output
      return abiManager.formatOutput(data, outputs[0]?.type || 'unknown');
    },
    [abiManager]
  );

  if (readFunctions.length === 0) {
    return (
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Read Contract</h2>
        <p className="text-gray-400">
          This contract has no read-only functions available.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Read Contract</h2>
            <p className="text-gray-400">
              Query data from the contract without making a transaction. These are
              view and pure functions.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={batchMode}
                onChange={(e) => setBatchMode(e.target.checked)}
                className="h-5 w-5 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Batch Mode</span>
            </label>
            {batchMode && selectedFunctions.size > 0 && (
              <Button onClick={executeBatchRead} className="h-12">
                Execute {selectedFunctions.size} Queries
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Functions */}
      {readFunctions.map((func) => {
        const signature = func.signature;
        const state = functionStates[signature];
        const isExpanded = state?.isExpanded || false;
        const isLoading = state?.isLoading || false;
        const result = state?.result;
        const history = state?.history || [];

        return (
          <Card key={signature} className="overflow-hidden">
            {/* Function Header */}
            <div className="flex items-center">
              {batchMode && (
                <div className="px-4">
                  <input
                    type="checkbox"
                    checked={selectedFunctions.has(signature)}
                    onChange={() => toggleFunctionSelection(signature)}
                    className="h-5 w-5 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    aria-label={`Select ${func.name} for batch execution`}
                  />
                </div>
              )}
              <button
                onClick={() => toggleFunction(signature)}
                className="flex-1 px-6 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                aria-expanded={isExpanded}
                aria-label={`Toggle ${func.name} function`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{isExpanded ? '▼' : '▶'}</span>
                  <div className="text-left">
                    <p className="text-lg font-semibold text-white font-mono">
                      {func.name}
                    </p>
                    <p className="text-sm text-gray-400 font-mono">{signature}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-xs font-medium bg-blue-600/20 text-blue-400 rounded-full">
                    {func.stateMutability}
                  </span>
                  {history.length > 0 && (
                    <span className="px-3 py-1 text-xs font-medium bg-green-600/20 text-green-400 rounded-full">
                      {history.length} calls
                    </span>
                  )}
                </div>
              </button>
            </div>

            {/* Function Body */}
            {isExpanded && (
              <div className="px-6 py-4 border-t border-gray-700 space-y-4">
                {/* Inputs */}
                {func.inputs.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white">Parameters</h4>
                    {func.inputs.map((input, index) => {
                      const value = state?.inputs[index] || '';
                      const error = state?.validationErrors[index] || '';

                      return (
                        <div key={index} className="space-y-2">
                          <label className="block">
                            <span className="text-sm text-gray-400">
                              {input.name || `param${index}`} ({input.type})
                            </span>
                            <input
                              type={abiManager.getInputType(input.type)}
                              value={value}
                              onChange={(e) =>
                                handleInputChange(
                                  signature,
                                  index,
                                  e.target.value,
                                  input.type
                                )
                              }
                              placeholder={abiManager.getInputPlaceholder(input.type)}
                              className={`mt-1 w-full h-12 px-4 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 font-mono text-sm transition-colors ${
                                error
                                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                  : 'border-gray-600 focus:ring-blue-500 focus:border-transparent'
                              }`}
                            />
                            {error && (
                              <p className="text-sm text-red-400 mt-1">{error}</p>
                            )}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Query Button */}
                <div>
                  <Button
                    onClick={() => executeFunction(func)}
                    disabled={isLoading}
                    className="w-full sm:w-auto h-12"
                    aria-label={`Query ${func.name}`}
                  >
                    {isLoading ? 'Querying...' : 'Query'}
                  </Button>
                </div>

                {/* Current Result */}
                {result && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-white mb-2">
                      Latest Result
                    </h4>
                    {result.success ? (
                      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                        <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
                          {formatResult(result.data, func.outputs)}
                        </pre>
                        <p className="text-xs text-gray-500 mt-2">
                          Queried at {new Date(result.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                        <p className="text-sm text-red-400">
                          {result.error || 'Query failed'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* History */}
                {history.length > 1 && (
                  <div className="pt-4 border-t border-gray-700">
                    <h4 className="text-sm font-semibold text-white mb-2">
                      Previous Results
                    </h4>
                    <div className="space-y-2">
                      {history.slice(1).map((item, index) => (
                        <div
                          key={index}
                          className="bg-gray-800/50 border border-gray-700 rounded-lg p-3"
                        >
                          <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-all">
                            {formatResult(item.result, func.outputs)}
                          </pre>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
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
