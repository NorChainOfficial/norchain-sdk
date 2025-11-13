import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  compilerService,
  type CompilationResult,
  type CompilationError,
  type CompiledContract,
  type CompilerOptions,
} from '@/lib/compilerService'

export interface CompilationState {
  readonly isCompiling: boolean
  readonly compilationResult: CompilationResult | null
  readonly selectedContract: CompiledContract | null
  readonly compilerVersion: string
  readonly optimization: boolean
  readonly optimizationRuns: number
  readonly evmVersion: string

  // Actions
  readonly compile: (source: string, fileName: string) => Promise<void>
  readonly setSelectedContract: (contract: CompiledContract | null) => void
  readonly setCompilerVersion: (version: string) => void
  readonly setOptimization: (enabled: boolean) => void
  readonly setOptimizationRuns: (runs: number) => void
  readonly setEvmVersion: (version: string) => void
  readonly clearCompilationResult: () => void
}

export const useCompilationStore = create<CompilationState>()(
  persist(
    (set, get) => ({
      isCompiling: false,
      compilationResult: null,
      selectedContract: null,
      compilerVersion: '0.8.20',
      optimization: true,
      optimizationRuns: 200,
      evmVersion: 'paris',

      compile: async (source: string, fileName: string) => {
        set({ isCompiling: true })

        try {
          const { compilerVersion, optimization, optimizationRuns, evmVersion } = get()

          const options: Partial<CompilerOptions> = {
            version: compilerVersion,
            optimization,
            runs: optimizationRuns,
            evmVersion,
          }

          const result = await compilerService.compile(source, fileName, options)

          set({
            compilationResult: result,
            selectedContract: result.contracts.length > 0 ? result.contracts[0] : null,
            isCompiling: false,
          })
        } catch (error) {
          console.error('Compilation error:', error)
          set({
            compilationResult: {
              success: false,
              errors: [
                {
                  severity: 'error',
                  message:
                    error instanceof Error ? error.message : 'Unknown compilation error',
                  formattedMessage:
                    error instanceof Error ? error.message : 'Unknown compilation error',
                },
              ],
              contracts: [],
              sources: {},
            },
            isCompiling: false,
          })
        }
      },

      setSelectedContract: (contract) => {
        set({ selectedContract: contract })
      },

      setCompilerVersion: (version) => {
        set({ compilerVersion: version })
        compilerService.setCompilerVersion(version)
      },

      setOptimization: (enabled) => {
        set({ optimization: enabled })
      },

      setOptimizationRuns: (runs) => {
        set({ optimizationRuns: runs })
      },

      setEvmVersion: (version) => {
        set({ evmVersion: version })
      },

      clearCompilationResult: () => {
        set({
          compilationResult: null,
          selectedContract: null,
        })
      },
    }),
    {
      name: 'norstudio-compilation-storage',
      partialize: (state) => ({
        compilerVersion: state.compilerVersion,
        optimization: state.optimization,
        optimizationRuns: state.optimizationRuns,
        evmVersion: state.evmVersion,
      }),
    }
  )
)
