'use client'

import React, { useState } from 'react'
import { Code2, Sparkles, Activity, Settings, AlertCircle, CheckCircle2, Loader2, ExternalLink, Clock, CheckCircle, XCircle, Zap, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIChat } from '@/components/ai/AIChat'
import { ContractInteraction } from '@/components/contract/ContractInteraction'
import { useCompilationStore } from '@/store/compilationStore'
import { useProjectStore } from '@/store/projectStore'
import { useTransactionStore } from '@/store/transactionStore'
import { useSettingsStore } from '@/store/settingsStore'

interface ContextPanelProps {
  readonly defaultTab?: 'compiler' | 'ai' | 'interact' | 'transactions' | 'settings'
}

export const ContextPanel = ({ defaultTab = 'compiler' }: ContextPanelProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const tabs = [
    { id: 'compiler', label: 'Compiler', icon: Code2 },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles },
    { id: 'interact', label: 'Interact', icon: Zap },
    { id: 'transactions', label: 'Transactions', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const

  return (
    <div className="h-full flex flex-col bg-editor-bg-light dark:bg-editor-bg-light text-gray-300">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center space-x-2 h-10 text-sm font-medium transition-colors',
              'border-b-2',
              activeTab === tab.id
                ? 'border-primary-500 text-white bg-editor-bg'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'compiler' && <CompilerTab />}
        {activeTab === 'ai' && <AITab />}
        {activeTab === 'interact' && <InteractTab />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}

function CompilerTab(): JSX.Element {
  const {
    isCompiling,
    compilationResult,
    selectedContract,
    compilerVersion,
    optimization,
    optimizationRuns,
    evmVersion,
    compile,
    setSelectedContract,
    setCompilerVersion,
    setOptimization,
    setEvmVersion,
  } = useCompilationStore()

  const { openFiles, activeFileId } = useProjectStore()
  const activeFile = openFiles.find((f) => f.id === activeFileId)

  const handleCompile = async () => {
    if (!activeFile) return
    await compile(activeFile.content, activeFile.name)
  }

  const errors = compilationResult?.errors.filter((e) => e.severity === 'error') || []
  const warnings = compilationResult?.errors.filter((e) => e.severity === 'warning') || []

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-200 mb-3">Compiler Settings</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
            <span className="text-sm text-gray-300">Version</span>
            <select
              value={compilerVersion}
              onChange={(e) => setCompilerVersion(e.target.value)}
              className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="0.8.20">0.8.20</option>
              <option value="0.8.19">0.8.19</option>
              <option value="0.8.18">0.8.18</option>
              <option value="0.8.17">0.8.17</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
            <span className="text-sm text-gray-300">Optimization</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={optimization}
                onChange={(e) => setOptimization(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
            <span className="text-sm text-gray-300">EVM Version</span>
            <select
              value={evmVersion}
              onChange={(e) => setEvmVersion(e.target.value)}
              className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="paris">paris</option>
              <option value="london">london</option>
              <option value="berlin">berlin</option>
              <option value="istanbul">istanbul</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <button
          onClick={handleCompile}
          disabled={isCompiling || !activeFile}
          className="w-full h-10 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isCompiling ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Compiling...</span>
            </>
          ) : (
            <span>Compile Contract</span>
          )}
        </button>
      </div>

      {compilationResult && (
        <>
          <div>
            <h4 className="text-sm font-semibold text-gray-200 mb-2">Compilation Status</h4>
            <div
              className={cn(
                'p-3 rounded flex items-start space-x-2',
                compilationResult.success
                  ? 'bg-green-900/20 border border-green-700/50'
                  : 'bg-red-900/20 border border-red-700/50'
              )}
            >
              {compilationResult.success ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-green-300 font-medium">Compilation successful</p>
                    <p className="text-green-400 text-xs mt-1">
                      {compilationResult.contracts.length} contract(s) compiled
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-red-300 font-medium">Compilation failed</p>
                    <p className="text-red-400 text-xs mt-1">
                      {errors.length} error(s), {warnings.length} warning(s)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {errors.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-300 mb-2">Errors</h4>
              <div className="bg-gray-900/50 rounded p-3 max-h-[200px] overflow-y-auto space-y-2">
                {errors.map((error, index) => (
                  <div key={index} className="text-xs text-red-300 font-mono">
                    {error.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-yellow-300 mb-2">Warnings</h4>
              <div className="bg-gray-900/50 rounded p-3 max-h-[150px] overflow-y-auto space-y-2">
                {warnings.map((warning, index) => (
                  <div key={index} className="text-xs text-yellow-300 font-mono">
                    {warning.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {compilationResult.success && compilationResult.contracts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-200 mb-2">Compiled Contracts</h4>
              <div className="space-y-2">
                {compilationResult.contracts.map((contract, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedContract(contract)}
                    className={cn(
                      'w-full p-3 rounded text-left transition-colors',
                      selectedContract?.name === contract.name
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                    )}
                  >
                    <div className="text-sm font-medium">{contract.name}</div>
                    <div className="text-xs opacity-70 mt-1">
                      Gas: {contract.gasEstimates.creation.totalCost}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!compilationResult && (
        <div>
          <h4 className="text-sm font-semibold text-gray-200 mb-2">Compilation Output</h4>
          <div className="bg-gray-900/50 rounded p-3 min-h-[100px] text-xs text-gray-400 font-mono">
            <p className="text-green-400">✓ Ready to compile</p>
          </div>
        </div>
      )}
    </div>
  )
}

function AITab(): JSX.Element {
  return <AIChat />
}

function InteractTab(): JSX.Element {
  return <ContractInteraction />
}

function TransactionsTab(): JSX.Element {
  const { transactions, deployedContracts, clearTransactions } = useTransactionStore()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400'
      case 'failed':
        return 'text-red-400'
      case 'pending':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return 'N/A'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimestamp = (date: Date) => {
    const dateObj = new Date(date)
    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">Recent Transactions</h3>
          <p className="text-xs text-gray-500 mt-0.5">{transactions.length} transactions</p>
        </div>
        {transactions.length > 0 && (
          <button
            onClick={clearTransactions}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {deployedContracts.length > 0 && (
        <div className="p-4 border-b border-gray-700">
          <h4 className="text-xs font-semibold text-gray-300 mb-2">Deployed Contracts</h4>
          <div className="space-y-2">
            {deployedContracts.map((contract) => (
              <div
                key={contract.id}
                className="p-2 bg-gray-800/50 rounded text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-200">{contract.name}</span>
                  <a
                    href={`https://etherscan.io/address/${contract.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="text-gray-400">{formatAddress(contract.address)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-xs mt-1">
              Deploy or interact with contracts to see transactions
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions
              .slice()
              .reverse()
              .map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-gray-800/50 rounded border border-gray-700/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(tx.status)}
                      <div>
                        <div className="text-sm font-medium text-gray-200">
                          {tx.type === 'deployment'
                            ? `Deploy ${tx.contractName}`
                            : tx.type === 'call'
                            ? 'Contract Call'
                            : 'Transaction'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTimestamp(tx.timestamp)}
                        </div>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium capitalize',
                        getStatusColor(tx.status)
                      )}
                    >
                      {tx.status}
                    </span>
                  </div>

                  {tx.contractAddress && (
                    <div className="text-xs text-gray-400 mb-1">
                      <span className="text-gray-500">Contract:</span>{' '}
                      {formatAddress(tx.contractAddress)}
                    </div>
                  )}

                  {tx.hash && (
                    <div className="text-xs text-gray-400 mb-1">
                      <span className="text-gray-500">Tx Hash:</span>{' '}
                      {formatAddress(tx.hash)}
                    </div>
                  )}

                  {tx.gasUsed && (
                    <div className="text-xs text-gray-400">
                      <span className="text-gray-500">Gas Used:</span> {tx.gasUsed}
                    </div>
                  )}

                  {tx.error && (
                    <div className="mt-2 p-2 bg-red-900/20 border border-red-700/50 rounded">
                      <div className="text-xs text-red-300">{tx.error}</div>
                    </div>
                  )}

                  {tx.hash && (
                    <div className="mt-2">
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-400 hover:text-primary-300 flex items-center space-x-1"
                      >
                        <span>View on Etherscan</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SettingsTab(): JSX.Element {
  const { editor, network, general, updateEditorSettings, updateNetworkSettings, updateGeneralSettings, resetToDefaults } = useSettingsStore()

  return (
    <div className="h-full overflow-y-auto">
      {/* Editor Settings */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">Editor Settings</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
            <span className="text-sm text-gray-300">Font Size</span>
            <select
              value={editor.fontSize}
              onChange={(e) => updateEditorSettings({ fontSize: Number(e.target.value) })}
              className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={12}>12px</option>
              <option value={14}>14px</option>
              <option value={16}>16px</option>
              <option value={18}>18px</option>
              <option value={20}>20px</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
            <span className="text-sm text-gray-300">Tab Size</span>
            <select
              value={editor.tabSize}
              onChange={(e) => updateEditorSettings({ tabSize: Number(e.target.value) })}
              className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
            <span className="text-sm text-gray-300">Word Wrap</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={editor.wordWrap}
                onChange={(e) => updateEditorSettings({ wordWrap: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
            <span className="text-sm text-gray-300">Minimap</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={editor.minimap}
                onChange={(e) => updateEditorSettings({ minimap: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
            <span className="text-sm text-gray-300">Line Numbers</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={editor.lineNumbers}
                onChange={(e) => updateEditorSettings({ lineNumbers: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
            <span className="text-sm text-gray-300">Auto Save</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={editor.autoSave}
                onChange={(e) => updateEditorSettings({ autoSave: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Network Settings */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">Network Settings</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
            <span className="text-sm text-gray-300">Default Network</span>
            <select
              value={network.defaultNetwork}
              onChange={(e) => updateNetworkSettings({ defaultNetwork: e.target.value })}
              className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="mainnet">Ethereum Mainnet</option>
              <option value="sepolia">Sepolia Testnet</option>
              <option value="goerli">Goerli Testnet</option>
              <option value="polygon">Polygon Mainnet</option>
              <option value="mumbai">Mumbai Testnet</option>
            </select>
          </div>

          <div className="p-3 bg-gray-800/50 rounded">
            <label className="block text-sm text-gray-300 mb-2">Custom RPC URL</label>
            <input
              type="text"
              value={network.customRpcUrl}
              onChange={(e) => updateNetworkSettings({ customRpcUrl: e.target.value })}
              placeholder="https://..."
              className="w-full h-9 px-3 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="p-3 bg-gray-800/50 rounded">
            <label className="block text-sm text-gray-300 mb-2">Block Explorer URL</label>
            <input
              type="text"
              value={network.blockExplorerUrl}
              onChange={(e) => updateNetworkSettings({ blockExplorerUrl: e.target.value })}
              placeholder="https://etherscan.io"
              className="w-full h-9 px-3 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">General Settings</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
            <span className="text-sm text-gray-300">Auto Compile</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={general.autoCompile}
                onChange={(e) => updateGeneralSettings({ autoCompile: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
            <span className="text-sm text-gray-300">Show Gas Estimates</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={general.showGasEstimates}
                onChange={(e) => updateGeneralSettings({ showGasEstimates: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
            <span className="text-sm text-gray-300">Confirm Transactions</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={general.confirmTransactions}
                onChange={(e) => updateGeneralSettings({ confirmTransactions: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
            <span className="text-sm text-gray-300">Show Welcome Screen</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={general.showWelcomeScreen}
                onChange={(e) => updateGeneralSettings({ showWelcomeScreen: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="p-4">
        <button
          onClick={resetToDefaults}
          className="w-full h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors flex items-center justify-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset to Defaults</span>
        </button>
      </div>
    </div>
  )
}
