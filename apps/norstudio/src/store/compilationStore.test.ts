import { describe, it, expect, beforeEach } from 'vitest'
import { useCompilationStore } from './compilationStore'

describe('compilationStore', () => {
  beforeEach(() => {
    useCompilationStore.setState({
      compilationResult: null,
      isCompiling: false,
      selectedContract: null,
      compilerVersion: '0.8.20',
      optimization: true,
      optimizationRuns: 200,
      evmVersion: 'paris',
    })
  })

  describe('initial state', () => {
    it('should have correct default settings', () => {
      const state = useCompilationStore.getState()
      expect(state.compilerVersion).toBe('0.8.20')
      expect(state.optimization).toBe(true)
      expect(state.optimizationRuns).toBe(200)
      expect(state.evmVersion).toBe('paris')
    })
  })

  describe('setCompilerVersion', () => {
    it('should update compiler version', () => {
      useCompilationStore.getState().setCompilerVersion('0.8.19')
      expect(useCompilationStore.getState().compilerVersion).toBe('0.8.19')
    })
  })

  describe('setOptimization', () => {
    it('should toggle optimization', () => {
      useCompilationStore.getState().setOptimization(false)
      expect(useCompilationStore.getState().optimization).toBe(false)
    })
  })

  describe('setOptimizationRuns', () => {
    it('should update optimization runs', () => {
      useCompilationStore.getState().setOptimizationRuns(500)
      expect(useCompilationStore.getState().optimizationRuns).toBe(500)
    })
  })

  describe('setEvmVersion', () => {
    it('should update EVM version', () => {
      useCompilationStore.getState().setEvmVersion('london')
      expect(useCompilationStore.getState().evmVersion).toBe('london')
    })
  })

  describe('setSelectedContract', () => {
    it('should set selected contract', () => {
      const contract = {
        name: 'TestContract',
        abi: [],
        bytecode: '0x123',
        gasEstimate: 1000000,
      }
      
      useCompilationStore.getState().setSelectedContract(contract)
      expect(useCompilationStore.getState().selectedContract).toEqual(contract)
    })

    it('should allow clearing selected contract', () => {
      const contract = {
        name: 'TestContract',
        abi: [],
        bytecode: '0x123',
        gasEstimate: 1000000,
      }
      
      useCompilationStore.getState().setSelectedContract(contract)
      useCompilationStore.getState().setSelectedContract(null)
      expect(useCompilationStore.getState().selectedContract).toBeNull()
    })
  })

  describe('clearCompilationResult', () => {
    it('should clear compilation result and selected contract', () => {
      useCompilationStore.setState({
        compilationResult: { success: true, contracts: [], errors: [] },
        selectedContract: { name: 'Test', abi: [], bytecode: '0x', gasEstimate: 100 }
      })
      
      useCompilationStore.getState().clearCompilationResult()
      
      expect(useCompilationStore.getState().compilationResult).toBeNull()
      expect(useCompilationStore.getState().selectedContract).toBeNull()
    })
  })
})
