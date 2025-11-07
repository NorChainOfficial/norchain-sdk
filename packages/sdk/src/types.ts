/**
 * Type Definitions
 */

export interface Block {
  height: number
  hash: string
  timestamp: number
  transactions: number
  validator: string
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
}

export interface Account {
  address: string
  balance: string
  transactionCount: number
}

export interface SwapQuote {
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  rate: string
  slippage: string
  gasEstimate: string
}

