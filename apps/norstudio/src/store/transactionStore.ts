import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { blockchainService, type WalletInfo, type DeploymentResult } from '@/lib/blockchainService'
import type { CompiledContract } from '@/lib/compilerService'

export interface Transaction {
  readonly id: string
  readonly type: 'deployment' | 'call' | 'send'
  readonly status: 'pending' | 'success' | 'failed'
  readonly hash?: string
  readonly contractAddress?: string
  readonly contractName?: string
  readonly from: string
  readonly to?: string
  readonly gasUsed?: string
  readonly blockNumber?: number
  readonly timestamp: Date
  readonly error?: string
}

export interface DeployedContract {
  readonly id: string
  readonly name: string
  readonly address: string
  readonly abi: unknown[]
  readonly deploymentTx: string
  readonly deployedAt: Date
}

export interface TransactionState {
  readonly transactions: Transaction[]
  readonly deployedContracts: DeployedContract[]
  readonly walletInfo: WalletInfo | null
  readonly isConnecting: boolean
  readonly isDeploying: boolean

  // Wallet actions
  readonly connectWallet: () => Promise<void>
  readonly disconnectWallet: () => void
  readonly refreshWallet: () => Promise<void>

  // Deployment actions
  readonly deployContract: (contract: CompiledContract, args: any[]) => Promise<DeploymentResult>

  // Transaction management
  readonly addTransaction: (tx: Transaction) => void
  readonly updateTransaction: (id: string, updates: Partial<Transaction>) => void
  readonly clearTransactions: () => void
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      deployedContracts: [],
      walletInfo: null,
      isConnecting: false,
      isDeploying: false,

      connectWallet: async () => {
        set({ isConnecting: true })
        try {
          const walletInfo = await blockchainService.connectWallet()
          set({ walletInfo, isConnecting: false })
        } catch (error) {
          console.error('Failed to connect wallet:', error)
          set({ isConnecting: false })
          throw error
        }
      },

      disconnectWallet: () => {
        blockchainService.disconnect()
        set({ walletInfo: null })
      },

      refreshWallet: async () => {
        try {
          await blockchainService.refreshWalletInfo()
          const walletInfo = blockchainService.getWalletInfo()
          set({ walletInfo })
        } catch (error) {
          console.error('Failed to refresh wallet:', error)
        }
      },

      deployContract: async (contract: CompiledContract, args: any[]) => {
        const { walletInfo, transactions } = get()

        if (!walletInfo) {
          return {
            success: false,
            error: 'Wallet not connected',
          }
        }

        set({ isDeploying: true })

        // Create pending transaction
        const txId = crypto.randomUUID()
        const pendingTx: Transaction = {
          id: txId,
          type: 'deployment',
          status: 'pending',
          contractName: contract.name,
          from: walletInfo.address,
          timestamp: new Date(),
        }

        set({ transactions: [...transactions, pendingTx] })

        try {
          const result = await blockchainService.deployContract(contract, args)

          if (result.success && result.contractAddress && result.transactionHash) {
            // Update transaction
            const successTx: Transaction = {
              ...pendingTx,
              status: 'success',
              hash: result.transactionHash,
              contractAddress: result.contractAddress,
            }

            // Get transaction receipt for gas info
            const receipt = await blockchainService.getTransactionReceipt(
              result.transactionHash
            )

            if (receipt) {
              successTx.gasUsed = receipt.gasUsed
              successTx.blockNumber = receipt.blockNumber
            }

            // Add to deployed contracts
            const deployedContract: DeployedContract = {
              id: crypto.randomUUID(),
              name: contract.name,
              address: result.contractAddress,
              abi: contract.abi,
              deploymentTx: result.transactionHash,
              deployedAt: new Date(),
            }

            set({
              transactions: get().transactions.map((tx) =>
                tx.id === txId ? successTx : tx
              ),
              deployedContracts: [...get().deployedContracts, deployedContract],
              isDeploying: false,
            })

            return result
          } else {
            // Update transaction as failed
            const failedTx: Transaction = {
              ...pendingTx,
              status: 'failed',
              error: result.error,
            }

            set({
              transactions: get().transactions.map((tx) =>
                tx.id === txId ? failedTx : tx
              ),
              isDeploying: false,
            })

            return result
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown deployment error'

          // Update transaction as failed
          const failedTx: Transaction = {
            ...pendingTx,
            status: 'failed',
            error: errorMessage,
          }

          set({
            transactions: get().transactions.map((tx) =>
              tx.id === txId ? failedTx : tx
            ),
            isDeploying: false,
          })

          return {
            success: false,
            error: errorMessage,
          }
        }
      },

      addTransaction: (tx: Transaction) => {
        set({ transactions: [...get().transactions, tx] })
      },

      updateTransaction: (id: string, updates: Partial<Transaction>) => {
        set({
          transactions: get().transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
        })
      },

      clearTransactions: () => {
        set({ transactions: [] })
      },
    }),
    {
      name: 'norstudio-transaction-storage',
      partialize: (state) => ({
        transactions: state.transactions,
        deployedContracts: state.deployedContracts,
      }),
    }
  )
)
