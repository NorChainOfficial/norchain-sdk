import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from './settingsStore'

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetToDefaults()
  })

  describe('initial state', () => {
    it('should have correct default editor settings', () => {
      const { editor } = useSettingsStore.getState()
      expect(editor.fontSize).toBe(14)
      expect(editor.tabSize).toBe(2)
      expect(editor.wordWrap).toBe(true)
      expect(editor.minimap).toBe(true)
      expect(editor.lineNumbers).toBe(true)
      expect(editor.autoSave).toBe(true)
    })

    it('should have correct default network settings', () => {
      const { network } = useSettingsStore.getState()
      expect(network.defaultNetwork).toBe('sepolia')
      expect(network.chainId).toBe(11155111)
      expect(network.blockExplorerUrl).toBe('https://etherscan.io')
    })

    it('should have correct default general settings', () => {
      const { general } = useSettingsStore.getState()
      expect(general.autoCompile).toBe(false)
      expect(general.showGasEstimates).toBe(true)
      expect(general.confirmTransactions).toBe(true)
    })
  })

  describe('updateEditorSettings', () => {
    it('should update editor settings', () => {
      useSettingsStore.getState().updateEditorSettings({
        fontSize: 16,
        wordWrap: false,
      })
      
      const { editor } = useSettingsStore.getState()
      expect(editor.fontSize).toBe(16)
      expect(editor.wordWrap).toBe(false)
      expect(editor.tabSize).toBe(2) // unchanged
    })

    it('should preserve other settings', () => {
      useSettingsStore.getState().updateEditorSettings({ fontSize: 18 })
      
      const { editor } = useSettingsStore.getState()
      expect(editor.minimap).toBe(true)
      expect(editor.lineNumbers).toBe(true)
    })
  })

  describe('updateNetworkSettings', () => {
    it('should update network settings', () => {
      useSettingsStore.getState().updateNetworkSettings({
        defaultNetwork: 'mainnet',
        chainId: 1,
      })
      
      const { network } = useSettingsStore.getState()
      expect(network.defaultNetwork).toBe('mainnet')
      expect(network.chainId).toBe(1)
    })
  })

  describe('updateGeneralSettings', () => {
    it('should update general settings', () => {
      useSettingsStore.getState().updateGeneralSettings({
        autoCompile: true,
        showGasEstimates: false,
      })
      
      const { general } = useSettingsStore.getState()
      expect(general.autoCompile).toBe(true)
      expect(general.showGasEstimates).toBe(false)
    })
  })

  describe('resetToDefaults', () => {
    it('should reset all settings to defaults', () => {
      // Change some settings
      useSettingsStore.getState().updateEditorSettings({ fontSize: 20 })
      useSettingsStore.getState().updateNetworkSettings({ defaultNetwork: 'mainnet' })
      useSettingsStore.getState().updateGeneralSettings({ autoCompile: true })
      
      // Reset
      useSettingsStore.getState().resetToDefaults()
      
      const state = useSettingsStore.getState()
      expect(state.editor.fontSize).toBe(14)
      expect(state.network.defaultNetwork).toBe('sepolia')
      expect(state.general.autoCompile).toBe(false)
    })
  })
})
