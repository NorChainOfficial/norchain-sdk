'use client'

import React, { useState } from 'react'
import { Play, Book, Edit, ChevronDown, ChevronRight, Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useContractStore } from '@/store/contractStore'
import { useTransactionStore } from '@/store/transactionStore'

export const ContractInteraction = (): JSX.Element => {
  const { selectedContract, functionCalls, callReadFunction, callWriteFunction, isLoadingCall, isLoadingTransaction, selectContract, clearSelectedContract } = useContractStore()
  const { deployedContracts } = useTransactionStore()

  const [expandedFunctions, setExpandedFunctions] = useState<Set<string>>(new Set())
  const [functionInputs, setFunctionInputs] = useState<Record<string, string[]>>({})

  const toggleFunction = (functionName: string) => {
    const newExpanded = new Set(expandedFunctions)
    if (newExpanded.has(functionName)) {
      newExpanded.delete(functionName)
    } else {
      newExpanded.add(functionName)
    }
    setExpandedFunctions(newExpanded)
  }

  const handleInputChange = (functionName: string, inputIndex: number, value: string) => {
    setFunctionInputs((prev) => ({
      ...prev,
      [functionName]: {
        ...(prev[functionName] || []),
        [inputIndex]: value,
      },
    }))
  }

  const handleCallFunction = async (functionName: string, isReadOnly: boolean) => {
    if (!selectedContract) return

    const func = selectedContract.functions.find((f) => f.name === functionName)
    if (!func) return

    const inputs = functionInputs[functionName] || []
    const args = func.inputs.map((input, index) => {
      const value = inputs[index] || ''

      // Basic type conversion
      if (input.type.startsWith('uint') || input.type.startsWith('int')) {
        return value === '' ? '0' : value
      } else if (input.type === 'bool') {
        return value.toLowerCase() === 'true'
      } else if (input.type.startsWith('bytes')) {
        return value
      } else {
        return value
      }
    })

    try {
      if (isReadOnly) {
        await callReadFunction(functionName, args)
      } else {
        await callWriteFunction(functionName, args)
      }
    } catch (error) {
      console.error('Function call error:', error)
    }
  }

  const handleSelectContract = (contractId: string) => {
    const contract = deployedContracts.find((c) => c.id === contractId)
    if (contract) {
      selectContract(contract.address, contract.name, contract.abi)
    }
  }

  const formatResult = (result: any): string => {
    if (result === null || result === undefined) return 'N/A'
    if (typeof result === 'object') return JSON.stringify(result, null, 2)
    return String(result)
  }

  const formatTimestamp = (date: Date) => {
    const dateObj = new Date(date)
    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  if (deployedContracts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center">
        <div>
          <Book className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-sm">No deployed contracts</p>
          <p className="text-gray-500 text-xs mt-2">Deploy a contract to interact with it</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Contract Selector */}
      <div className="p-4 border-b border-gray-700">
        <label className="block text-xs font-medium text-gray-300 mb-2">
          Select Contract
        </label>
        <select
          value={selectedContract?.address || ''}
          onChange={(e) => handleSelectContract(e.target.value)}
          className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Choose a contract...</option>
          {deployedContracts.map((contract) => (
            <option key={contract.id} value={contract.id}>
              {contract.name} ({contract.address.slice(0, 6)}...{contract.address.slice(-4)})
            </option>
          ))}
        </select>
      </div>

      {selectedContract ? (
        <div className="flex-1 overflow-y-auto">
          {/* Read Functions */}
          {selectedContract.functions.filter((f) => f.stateMutability === 'view' || f.stateMutability === 'pure').length > 0 && (
            <div className="border-b border-gray-700">
              <div className="p-4 bg-gray-800/30">
                <div className="flex items-center space-x-2">
                  <Book className="h-4 w-4 text-blue-400" />
                  <h4 className="text-sm font-semibold text-gray-200">Read Functions</h4>
                </div>
              </div>
              <div className="divide-y divide-gray-700">
                {selectedContract.functions
                  .filter((f) => f.stateMutability === 'view' || f.stateMutability === 'pure')
                  .map((func) => (
                    <FunctionCard
                      key={func.name}
                      func={func}
                      isExpanded={expandedFunctions.has(func.name)}
                      onToggle={() => toggleFunction(func.name)}
                      inputs={functionInputs[func.name] || []}
                      onInputChange={(index, value) => handleInputChange(func.name, index, value)}
                      onCall={() => handleCallFunction(func.name, true)}
                      isLoading={isLoadingCall}
                      isReadOnly={true}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Write Functions */}
          {selectedContract.functions.filter((f) => f.stateMutability === 'nonpayable' || f.stateMutability === 'payable').length > 0 && (
            <div className="border-b border-gray-700">
              <div className="p-4 bg-gray-800/30">
                <div className="flex items-center space-x-2">
                  <Edit className="h-4 w-4 text-orange-400" />
                  <h4 className="text-sm font-semibold text-gray-200">Write Functions</h4>
                </div>
              </div>
              <div className="divide-y divide-gray-700">
                {selectedContract.functions
                  .filter((f) => f.stateMutability === 'nonpayable' || f.stateMutability === 'payable')
                  .map((func) => (
                    <FunctionCard
                      key={func.name}
                      func={func}
                      isExpanded={expandedFunctions.has(func.name)}
                      onToggle={() => toggleFunction(func.name)}
                      inputs={functionInputs[func.name] || []}
                      onInputChange={(index, value) => handleInputChange(func.name, index, value)}
                      onCall={() => handleCallFunction(func.name, false)}
                      isLoading={isLoadingTransaction}
                      isReadOnly={false}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Function Call History */}
          {functionCalls.length > 0 && (
            <div>
              <div className="p-4 bg-gray-800/30 border-b border-gray-700">
                <h4 className="text-sm font-semibold text-gray-200">Call History</h4>
              </div>
              <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                {functionCalls
                  .slice()
                  .reverse()
                  .map((call) => (
                    <div
                      key={call.id}
                      className="p-3 bg-gray-800/50 rounded border border-gray-700/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {call.error ? (
                            <XCircle className="h-4 w-4 text-red-400" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          )}
                          <span className="text-sm font-medium text-gray-200">
                            {call.functionName}()
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(call.timestamp)}
                        </span>
                      </div>

                      {call.args.length > 0 && (
                        <div className="text-xs text-gray-400 mb-2">
                          <span className="text-gray-500">Args:</span>{' '}
                          {call.args.map((arg) => String(arg)).join(', ')}
                        </div>
                      )}

                      {call.error ? (
                        <div className="text-xs text-red-300 bg-red-900/20 p-2 rounded">
                          {call.error}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-300 bg-gray-900/50 p-2 rounded font-mono">
                          {formatResult(call.result)}
                        </div>
                      )}

                      {call.txHash && (
                        <div className="mt-2">
                          <a
                            href={`https://etherscan.io/tx/${call.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-400 hover:text-primary-300 flex items-center space-x-1"
                          >
                            <span>View Transaction</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <p className="text-gray-400 text-sm">Select a contract to interact with it</p>
          </div>
        </div>
      )}
    </div>
  )
}

interface FunctionCardProps {
  readonly func: any
  readonly isExpanded: boolean
  readonly onToggle: () => void
  readonly inputs: string[]
  readonly onInputChange: (index: number, value: string) => void
  readonly onCall: () => void
  readonly isLoading: boolean
  readonly isReadOnly: boolean
}

function FunctionCard({
  func,
  isExpanded,
  onToggle,
  inputs,
  onInputChange,
  onCall,
  isLoading,
  isReadOnly,
}: FunctionCardProps): JSX.Element {
  return (
    <div className="bg-gray-800/20">
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
          <span className="text-sm font-medium text-gray-200">{func.name}</span>
          {func.stateMutability === 'payable' && (
            <span className="text-xs px-2 py-0.5 bg-yellow-900/30 text-yellow-400 rounded">
              payable
            </span>
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 pt-0">
          {func.inputs.length > 0 && (
            <div className="space-y-2 mb-3">
              {func.inputs.map((input: any, index: number) => (
                <div key={index}>
                  <label className="block text-xs text-gray-400 mb-1">
                    {input.name || `param${index}`} ({input.type})
                  </label>
                  <input
                    type="text"
                    value={inputs[index] || ''}
                    onChange={(e) => onInputChange(index, e.target.value)}
                    placeholder={`Enter ${input.type}`}
                    className="w-full h-9 px-3 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={onCall}
            disabled={isLoading}
            className={cn(
              'w-full h-9 px-4 rounded font-medium text-sm transition-colors flex items-center justify-center space-x-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isReadOnly
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            )}
          >
            {isLoading ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                <span>{isReadOnly ? 'Calling...' : 'Sending...'}</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>{isReadOnly ? 'Call' : 'Write'}</span>
              </>
            )}
          </button>

          {func.outputs.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Returns:</div>
              <div className="text-xs text-gray-400">
                {func.outputs.map((output: any, index: number) => (
                  <div key={index}>
                    {output.name || `output${index}`}: {output.type}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
