'use client'

import React, { useState, useEffect } from 'react'
import { X, Rocket, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CompiledContract } from '@/lib/compilerService'

export interface DeploymentDialogProps {
  readonly contract: CompiledContract | null
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onDeploy: (args: any[]) => Promise<void>
  readonly isDeploying: boolean
}

export const DeploymentDialog = ({
  contract,
  isOpen,
  onClose,
  onDeploy,
  isDeploying,
}: DeploymentDialogProps): JSX.Element | null => {
  const [constructorArgs, setConstructorArgs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Get constructor inputs from ABI
  const constructorABI = contract?.abi.find((item: any) => item.type === 'constructor')
  const constructorInputs = constructorABI?.inputs || []

  useEffect(() => {
    if (isOpen && contract) {
      // Reset args when dialog opens
      setConstructorArgs(new Array(constructorInputs.length).fill(''))
      setError(null)
    }
  }, [isOpen, contract, constructorInputs.length])

  if (!isOpen || !contract) return null

  const handleArgChange = (index: number, value: string) => {
    const newArgs = [...constructorArgs]
    newArgs[index] = value
    setConstructorArgs(newArgs)
    setError(null)
  }

  const handleDeploy = async () => {
    setError(null)

    // Validate inputs
    for (let i = 0; i < constructorInputs.length; i++) {
      if (!constructorArgs[i] || constructorArgs[i].trim() === '') {
        setError(`Please provide a value for ${constructorInputs[i].name || `parameter ${i + 1}`}`)
        return
      }
    }

    // Convert arguments to proper types
    const convertedArgs = constructorInputs.map((input: any, index: number) => {
      const value = constructorArgs[index]

      try {
        if (input.type.startsWith('uint') || input.type.startsWith('int')) {
          return value
        } else if (input.type === 'bool') {
          return value.toLowerCase() === 'true'
        } else if (input.type === 'address') {
          if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
            throw new Error(`Invalid address format for ${input.name}`)
          }
          return value
        } else if (input.type.startsWith('bytes')) {
          return value
        } else if (input.type === 'string') {
          return value
        } else if (input.type.includes('[')) {
          // Array type
          return JSON.parse(value)
        } else {
          return value
        }
      } catch (error) {
        throw new Error(
          `Invalid value for ${input.name}: ${error instanceof Error ? error.message : 'Invalid format'}`
        )
      }
    })

    try {
      await onDeploy(convertedArgs)
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Deployment failed')
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Rocket className="h-5 w-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-white">Deploy Contract</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <div className="mb-4">
              <div className="text-sm text-gray-300 mb-1">Contract Name</div>
              <div className="text-lg font-semibold text-white">{contract.name}</div>
            </div>

            {constructorInputs.length > 0 ? (
              <>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">
                    Constructor Arguments
                  </h3>
                  <div className="space-y-3">
                    {constructorInputs.map((input: any, index: number) => (
                      <div key={index}>
                        <label className="block text-xs text-gray-400 mb-1">
                          {input.name || `Argument ${index + 1}`}
                          <span className="text-gray-500 ml-1">({input.type})</span>
                        </label>
                        <input
                          type="text"
                          value={constructorArgs[index] || ''}
                          onChange={(e) => handleArgChange(index, e.target.value)}
                          placeholder={getPlaceholder(input.type)}
                          disabled={isDeploying}
                          className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        {input.type === 'address' && (
                          <p className="text-xs text-gray-500 mt-1">
                            Must be a valid Ethereum address (0x...)
                          </p>
                        )}
                        {input.type.includes('[') && (
                          <p className="text-xs text-gray-500 mt-1">
                            Enter as JSON array: ["value1", "value2"]
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded">
                <p className="text-sm text-blue-300">
                  This contract has no constructor arguments
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="bg-gray-900/50 rounded p-3 mb-4">
              <div className="text-xs text-gray-500 mb-2">Deployment Info</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated Gas:</span>
                  <span className="text-gray-300">
                    {contract.gasEstimates?.creation?.totalCost || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bytecode Size:</span>
                  <span className="text-gray-300">
                    {contract.bytecode ? `${Math.ceil(contract.bytecode.length / 2)} bytes` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-700">
            <button
              onClick={onClose}
              disabled={isDeploying}
              className="h-10 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="h-10 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isDeploying ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deploying...</span>
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  <span>Deploy Contract</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function getPlaceholder(type: string): string {
  if (type.startsWith('uint') || type.startsWith('int')) {
    return 'Enter number'
  } else if (type === 'bool') {
    return 'true or false'
  } else if (type === 'address') {
    return '0x...'
  } else if (type === 'string') {
    return 'Enter text'
  } else if (type.includes('[')) {
    return '["value1", "value2"]'
  } else {
    return `Enter ${type}`
  }
}
