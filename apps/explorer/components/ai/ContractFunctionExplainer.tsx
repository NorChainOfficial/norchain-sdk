'use client';

import { useState } from 'react';
import { useContractAI } from '@/hooks/useAI';
import { Code, ChevronDown, ChevronUp, Loader2, MessageSquare } from 'lucide-react';

interface Function {
  name: string;
  type: 'function' | 'event' | 'constructor';
  inputs: Array<{ name: string; type: string; internalType?: string }>;
  outputs?: Array<{ name: string; type: string; internalType?: string }>;
  stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable';
}

interface ContractFunctionExplainerProps {
  contractAddress: string;
  abi: Function[];
}

export function ContractFunctionExplainer({ contractAddress, abi }: ContractFunctionExplainerProps) {
  const [expandedFunctions, setExpandedFunctions] = useState<Set<string>>(new Set());
  const [explainedFunctions, setExplainedFunctions] = useState<Map<string, string>>(new Map());
  const [loadingFunctions, setLoadingFunctions] = useState<Set<string>>(new Set());
  
  const { explainFunction } = useContractAI(contractAddress, abi);

  const functions = abi.filter(item => item.type === 'function');

  const handleExplainFunction = async (func: Function) => {
    if (explainedFunctions.has(func.name)) {
      setExpandedFunctions(prev => {
        const newSet = new Set(prev);
        if (newSet.has(func.name)) {
          newSet.delete(func.name);
        } else {
          newSet.add(func.name);
        }
        return newSet;
      });
      return;
    }

    setLoadingFunctions(prev => new Set(prev).add(func.name));
    try {
      const explanation = await explainFunction(func.name, func);
      setExplainedFunctions(prev => new Map(prev).set(func.name, explanation.answer || explanation.toString()));
      setExpandedFunctions(prev => new Set(prev).add(func.name));
    } catch (error) {
      console.error('Failed to explain function:', error);
    } finally {
      setLoadingFunctions(prev => {
        const newSet = new Set(prev);
        newSet.delete(func.name);
        return newSet;
      });
    }
  };

  const getMutabilityColor = (mutability?: string) => {
    switch (mutability) {
      case 'view':
      case 'pure':
        return 'text-blue-400 bg-blue-400/10';
      case 'payable':
        return 'text-orange-400 bg-orange-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Code className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Function Explainer
        </h3>
      </div>

      <div className="space-y-2">
        {functions.map((func, index) => {
          const isExpanded = expandedFunctions.has(func.name);
          const explanation = explainedFunctions.get(func.name);
          const isLoading = loadingFunctions.has(func.name);

          return (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => handleExplainFunction(func)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <Code className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                        {func.name}
                      </span>
                      {func.stateMutability && (
                        <span className={`text-xs px-2 py-0.5 rounded ${getMutabilityColor(func.stateMutability)}`}>
                          {func.stateMutability}
                        </span>
                      )}
                    </div>
                    {func.inputs.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        ({func.inputs.map(i => `${i.name}: ${i.type}`).join(', ')})
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {!isLoading && !explanation && (
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && explanation && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {functions.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Code className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No functions available. Verify the contract to view its ABI.</p>
        </div>
      )}
    </div>
  );
}

