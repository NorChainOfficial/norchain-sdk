'use client'

import { ethers, BrowserProvider, Contract, ContractFactory } from 'ethers'
import type { CompiledContract } from './compilerService'

export interface WalletInfo {
  readonly address: string
  readonly chainId: number
  readonly balance: string
  readonly provider: BrowserProvider
}

export interface DeploymentResult {
  readonly success: boolean
  readonly contractAddress?: string
  readonly transactionHash?: string
  readonly error?: string
}

export interface TransactionReceipt {
  readonly hash: string
  readonly from: string
  readonly to: string | null
  readonly gasUsed: string
  readonly status: number
  readonly blockNumber: number
}

export class BlockchainService {
  private static instance: BlockchainService
  private provider: BrowserProvider | null = null
  private signer: ethers.Signer | null = null
  private walletInfo: WalletInfo | null = null

  private constructor() {}

  static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService()
    }
    return BlockchainService.instance
  }

  async connectWallet(): Promise<WalletInfo> {
    try {
      // Check if MetaMask is installed
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.')
      }

      // Request account access
      const provider = new BrowserProvider((window as any).ethereum)
      await provider.send('eth_requestAccounts', [])

      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      const balance = await provider.getBalance(address)

      this.provider = provider
      this.signer = signer
      this.walletInfo = {
        address,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        provider,
      }

      // Listen for account changes
      ;(window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          this.disconnect()
        } else {
          this.refreshWalletInfo()
        }
      })

      // Listen for chain changes
      ;(window as any).ethereum.on('chainChanged', () => {
        window.location.reload()
      })

      return this.walletInfo
    } catch (error) {
      console.error('Wallet connection error:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to connect wallet'
      )
    }
  }

  async refreshWalletInfo(): Promise<void> {
    if (!this.provider || !this.signer) return

    try {
      const address = await this.signer.getAddress()
      const network = await this.provider.getNetwork()
      const balance = await this.provider.getBalance(address)

      this.walletInfo = {
        address,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        provider: this.provider,
      }
    } catch (error) {
      console.error('Failed to refresh wallet info:', error)
    }
  }

  disconnect(): void {
    this.provider = null
    this.signer = null
    this.walletInfo = null
  }

  isConnected(): boolean {
    return this.walletInfo !== null
  }

  getWalletInfo(): WalletInfo | null {
    return this.walletInfo
  }

  async deployContract(
    contract: CompiledContract,
    constructorArgs: any[] = []
  ): Promise<DeploymentResult> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected. Please connect your wallet first.')
      }

      if (!contract.bytecode || contract.bytecode === '0x') {
        throw new Error('Contract bytecode is empty. Please compile the contract first.')
      }

      // Create contract factory
      const factory = new ContractFactory(contract.abi, contract.bytecode, this.signer)

      // Deploy contract
      const deployedContract = await factory.deploy(...constructorArgs)
      await deployedContract.waitForDeployment()

      const address = await deployedContract.getAddress()
      const deploymentTx = deployedContract.deploymentTransaction()

      return {
        success: true,
        contractAddress: address,
        transactionHash: deploymentTx?.hash,
      }
    } catch (error) {
      console.error('Contract deployment error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown deployment error',
      }
    }
  }

  async getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null> {
    try {
      if (!this.provider) {
        throw new Error('Provider not available')
      }

      const receipt = await this.provider.getTransactionReceipt(txHash)
      if (!receipt) return null

      return {
        hash: receipt.hash,
        from: receipt.from,
        to: receipt.to,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status || 0,
        blockNumber: receipt.blockNumber,
      }
    } catch (error) {
      console.error('Failed to get transaction receipt:', error)
      return null
    }
  }

  async callContractMethod(
    contractAddress: string,
    abi: any[],
    methodName: string,
    args: any[] = []
  ): Promise<any> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected')
      }

      const contract = new Contract(contractAddress, abi, this.signer)
      const result = await contract[methodName](...args)
      return result
    } catch (error) {
      console.error('Contract method call error:', error)
      throw error
    }
  }

  async sendTransaction(
    contractAddress: string,
    abi: any[],
    methodName: string,
    args: any[] = []
  ): Promise<TransactionReceipt | null> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected')
      }

      const contract = new Contract(contractAddress, abi, this.signer)
      const tx = await contract[methodName](...args)
      const receipt = await tx.wait()

      return {
        hash: receipt.hash,
        from: receipt.from,
        to: receipt.to,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status,
        blockNumber: receipt.blockNumber,
      }
    } catch (error) {
      console.error('Transaction error:', error)
      throw error
    }
  }

  async switchNetwork(chainId: number): Promise<void> {
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('MetaMask is not installed')
      }

      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        throw new Error('Network not configured in MetaMask. Please add it manually.')
      }
      throw error
    }
  }

  async addNetwork(config: {
    chainId: number
    chainName: string
    rpcUrls: string[]
    nativeCurrency: {
      name: string
      symbol: string
      decimals: number
    }
    blockExplorerUrls?: string[]
  }): Promise<void> {
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('MetaMask is not installed')
      }

      await (window as any).ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${config.chainId.toString(16)}`,
            chainName: config.chainName,
            rpcUrls: config.rpcUrls,
            nativeCurrency: config.nativeCurrency,
            blockExplorerUrls: config.blockExplorerUrls,
          },
        ],
      })
    } catch (error) {
      console.error('Failed to add network:', error)
      throw error
    }
  }
}

export const blockchainService = BlockchainService.getInstance()
