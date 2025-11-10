// Bridge types
export interface CreateBridgeQuoteDto {
  srcChain: 'NOR' | 'BSC' | 'ETHEREUM' | 'TRON';
  dstChain: 'NOR' | 'BSC' | 'ETHEREUM' | 'TRON';
  asset: string;
  amount: string;
  toAddress?: string;
}

export interface CreateBridgeTransferDto {
  srcChain: 'NOR' | 'BSC' | 'ETHEREUM' | 'TRON';
  dstChain: 'NOR' | 'BSC' | 'ETHEREUM' | 'TRON';
  asset: string;
  amount: string;
  toAddress: string;
  idempotencyKey?: string;
}

// Compliance types
export interface CreateScreeningDto {
  type: 'sanctions' | 'aml' | 'kyc' | 'watchlist';
  subject: string;
  notes?: string;
}

export interface CreateCaseDto {
  subject: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  relatedScreenings?: string[];
}

export interface TravelRuleDto {
  senderAddress: string;
  recipientAddress: string;
  amount: string;
  asset: string;
  senderName?: string;
  senderEmail?: string;
  recipientName?: string;
  recipientEmail?: string;
}

// Governance types
export interface CreateProposalDto {
  title: string;
  description: string;
  type: 'parameter_change' | 'upgrade' | 'treasury' | 'validator' | 'general';
  parameters: Record<string, any>;
  startTime?: string;
  endTime?: string;
}

export interface CreateVoteDto {
  choice: 'for' | 'against' | 'abstain';
  reason?: string;
}

// Wallet types
export interface CreateWalletDto {
  name?: string;
  password: string;
}

export interface ImportWalletDto {
  privateKey?: string;
  mnemonic?: string;
  name?: string;
  password: string;
}

export interface SendTransactionDto {
  to: string;
  amount: string;
  data?: string;
  gasLimit?: string;
  password: string;
}

// Swap types
export interface GetQuoteDto {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  chainId: string;
}

export interface ExecuteSwapDto {
  quoteId: string;
  signedTx: string;
  userAddress: string;
}
