import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface EditorSettings {
  readonly fontSize: number
  readonly tabSize: number
  readonly wordWrap: boolean
  readonly minimap: boolean
  readonly lineNumbers: boolean
  readonly autoSave: boolean
  readonly autoSaveDelay: number
}

export interface NetworkSettings {
  readonly defaultNetwork: string
  readonly customRpcUrl: string
  readonly blockExplorerUrl: string
  readonly chainId: number
}

export interface GeneralSettings {
  readonly autoCompile: boolean
  readonly showGasEstimates: boolean
  readonly confirmTransactions: boolean
  readonly showWelcomeScreen: boolean
}

export interface SettingsState {
  readonly editor: EditorSettings
  readonly network: NetworkSettings
  readonly general: GeneralSettings

  // Actions
  readonly updateEditorSettings: (settings: Partial<EditorSettings>) => void
  readonly updateNetworkSettings: (settings: Partial<NetworkSettings>) => void
  readonly updateGeneralSettings: (settings: Partial<GeneralSettings>) => void
  readonly resetToDefaults: () => void
}

const defaultEditorSettings: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: true,
  lineNumbers: true,
  autoSave: true,
  autoSaveDelay: 1000,
}

const defaultNetworkSettings: NetworkSettings = {
  defaultNetwork: 'sepolia',
  customRpcUrl: '',
  blockExplorerUrl: 'https://etherscan.io',
  chainId: 11155111,
}

const defaultGeneralSettings: GeneralSettings = {
  autoCompile: false,
  showGasEstimates: true,
  confirmTransactions: true,
  showWelcomeScreen: true,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      editor: defaultEditorSettings,
      network: defaultNetworkSettings,
      general: defaultGeneralSettings,

      updateEditorSettings: (settings) => {
        set((state) => ({
          editor: { ...state.editor, ...settings },
        }))
      },

      updateNetworkSettings: (settings) => {
        set((state) => ({
          network: { ...state.network, ...settings },
        }))
      },

      updateGeneralSettings: (settings) => {
        set((state) => ({
          general: { ...state.general, ...settings },
        }))
      },

      resetToDefaults: () => {
        set({
          editor: defaultEditorSettings,
          network: defaultNetworkSettings,
          general: defaultGeneralSettings,
        })
      },
    }),
    {
      name: 'norstudio-settings-storage',
    }
  )
)
