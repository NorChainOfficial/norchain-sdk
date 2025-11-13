import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { blockchainService } from '@/lib/blockchainService'

export interface ContractFunction {
  readonly name: string
  readonly type: 'function' | 'constructor' | 'receive' | 'fallback'
  readonly stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable'
  readonly inputs: readonly FunctionInput[]
  readonly outputs: readonly FunctionOutput[]
}

export interface FunctionInput {
  readonly name: string
  readonly type: string
  readonly internalType?: string
}

export interface FunctionOutput {
  readonly name: string
  readonly type: string
  readonly internalType?: string
}

export interface ContractEvent {
  readonly name: string
  readonly inputs: readonly EventInput[]
  readonly anonymous: boolean
}

export interface EventInput {
  readonly name: string
  readonly type: string
  readonly indexed: boolean
  readonly internalType?: string
}

export interface SelectedContract {
  readonly address: string
  readonly name: string
  readonly abi: any[]
  readonly functions: ContractFunction[]
  readonly events: ContractEvent[]
}

export interface FunctionCall {
  readonly id: string
  readonly functionName: string
  readonly args: any[]
  readonly result: any
  readonly timestamp: Date
  readonly type: 'read' | 'write'
  readonly txHash?: string
  readonly gasUsed?: string
  readonly error?: string
}

export interface EventLog {
  readonly id: string
  readonly eventName: string
  readonly args: Record<string, any>
  readonly transactionHash: string
  readonly blockNumber: number
  readonly timestamp: Date
}

export interface ContractState {
  readonly selectedContract: SelectedContract | null
  readonly functionCalls: FunctionCall[]
  readonly eventLogs: EventLog[]
  readonly isLoadingCall: boolean
  readonly isLoadingTransaction: boolean

  // Actions
  readonly selectContract: (address: string, name: string, abi: any[]) => void
  readonly clearSelectedContract: () => void
  readonly callReadFunction: (functionName: string, args: any[]) => Promise<any>
  readonly callWriteFunction: (functionName: string, args: any[]) => Promise<void>
  readonly addFunctionCall: (call: Omit<FunctionCall, 'id' | 'timestamp'>) => void
  readonly clearFunctionCalls: () => void
  readonly addEventLog: (log: Omit<EventLog, 'id'>) => void
  readonly clearEventLogs: () => void
}

function parseABI(abi: any[]): { functions: ContractFunction[]; events: ContractEvent[] } {
  const functions: ContractFunction[] = []
  const events: ContractEvent[] = []

  for (const item of abi) {
    if (item.type === 'function') {
      functions.push({
        name: item.name,
        type: item.type,
        stateMutability: item.stateMutability || 'nonpayable',
        inputs: item.inputs || [],
        outputs: item.outputs || [],
      })
    } else if (item.type === 'event') {
      events.push({
        name: item.name,
        inputs: item.inputs || [],
        anonymous: item.anonymous || false,
      })
    }
  }

  return { functions, events }
}

export const useContractStore = create<ContractState>()(
  persist(
    (set, get) => ({
      selectedContract: null,
      functionCalls: [],
      eventLogs: [],
      isLoadingCall: false,
      isLoadingTransaction: false,

      selectContract: (address: string, name: string, abi: any[]) => {
        const { functions, events } = parseABI(abi)
        set({
          selectedContract: {
            address,
            name,
            abi,
            functions,
            events,
          },
          functionCalls: [],
          eventLogs: [],
        })
      },

      clearSelectedContract: () => {
        set({
          selectedContract: null,
          functionCalls: [],
          eventLogs: [],
        })
      },

      callReadFunction: async (functionName: string, args: any[]) => {
        const { selectedContract } = get()
        if (!selectedContract) {
          throw new Error('No contract selected')
        }

        set({ isLoadingCall: true })

        try {
          const result = await blockchainService.callContractMethod(
            selectedContract.address,
            selectedContract.abi,
            functionName,
            args
          )

          // Add to function calls history
          get().addFunctionCall({
            functionName,
            args,
            result,
            type: 'read',
          })

          set({ isLoadingCall: false })
          return result
        } catch (error) {
          get().addFunctionCall({
            functionName,
            args,
            result: null,
            type: 'read',
            error: error instanceof Error ? error.message : 'Unknown error',
          })

          set({ isLoadingCall: false })
          throw error
        }
      },

      callWriteFunction: async (functionName: string, args: any[]) => {
        const { selectedContract } = get()
        if (!selectedContract) {
          throw new Error('No contract selected')
        }

        set({ isLoadingTransaction: true })

        try {
          const receipt = await blockchainService.sendTransaction(
            selectedContract.address,
            selectedContract.abi,
            functionName,
            args
          )

          if (receipt) {
            get().addFunctionCall({
              functionName,
              args,
              result: 'Transaction successful',
              type: 'write',
              txHash: receipt.hash,
              gasUsed: receipt.gasUsed,
            })
          }

          set({ isLoadingTransaction: false })
        } catch (error) {
          get().addFunctionCall({
            functionName,
            args,
            result: null,
            type: 'write',
            error: error instanceof Error ? error.message : 'Unknown error',
          })

          set({ isLoadingTransaction: false })
          throw error
        }
      },

      addFunctionCall: (call: Omit<FunctionCall, 'id' | 'timestamp'>) => {
        set({
          functionCalls: [
            ...get().functionCalls,
            {
              ...call,
              id: crypto.randomUUID(),
              timestamp: new Date(),
            },
          ],
        })
      },

      clearFunctionCalls: () => {
        set({ functionCalls: [] })
      },

      addEventLog: (log: Omit<EventLog, 'id'>) => {
        set({
          eventLogs: [
            ...get().eventLogs,
            {
              ...log,
              id: crypto.randomUUID(),
            },
          ],
        })
      },

      clearEventLogs: () => {
        set({ eventLogs: [] })
      },
    }),
    {
      name: 'norstudio-contract-storage',
      partialize: (state) => ({
        functionCalls: state.functionCalls,
        eventLogs: state.eventLogs,
      }),
    }
  )
)
