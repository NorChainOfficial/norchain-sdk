export interface Block {
  id: number;
  height: number;
  hash: string;
  previous_hash: string | null;
  timestamp: string;
  proposer_address: string;
  validator_name?: string | null;
  transaction_count: number;
  block_time_seconds?: number | null;
  size_bytes?: number | null;
  gas_used: number;
  gas_wanted: number;
  created_at: string;
  updated_at: string;
  transactions?: Transaction[];
}

export interface Transaction {
  id: number;
  hash: string;
  block_height: number;
  block_hash: string;
  timestamp: string;
  type: string;
  sender: string;
  receiver: string | null;
  amount: string | null;
  fee: string | null;
  gas_used: number;
  gas_wanted: number;
  memo?: string | null;
  status: string;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionListItem extends Transaction {
  block?: Block;
}

export interface Account {
  id: number;
  address: string;
  balance: string;
  staked_balance: string;
  delegated_balance: string;
  tx_count: number;
  type: string;
  created_at: string;
  updated_at: string;
  first_seen_at?: string | null;
  last_active_at?: string | null;
}

export interface Validator {
  id: number;
  operator_address: string;
  consensus_address: string;
  consensus_pubkey: string;
  moniker: string;
  identity?: string | null;
  website?: string | null;
  security_contact?: string | null;
  details?: string | null;
  commission_rate: string;
  commission_max_rate: string;
  commission_max_change_rate: string;
  min_self_delegation: string;
  tokens: string;
  delegator_shares: string;
  voting_power: number;
  status: string;
  jailed: boolean;
  jailed_until?: string | null;
  unbonding_height?: number | null;
  unbonding_time?: string | null;
  missed_blocks: number;
  uptime_percentage: string;
  created_at: string;
  updated_at: string;
}

export interface NetworkStats {
  blocks: number;
  transactions: number;
  accounts: number;
  validators: number;
  latest_block: Block | null;
}

// Contract Types
export interface VerifiedContract {
  id: number;
  contract_address: string;
  contract_name: string | null;
  compiler_type: string;
  compiler_version: string;
  source_code: string;
  source_files: any | null;
  optimization_enabled: boolean;
  optimization_runs: number | null;
  evm_version: string | null;
  libraries: any | null;
  constructor_arguments: string | null;
  abi: string;
  parsed_abi: any[];
  bytecode: string;
  verified_at: string;
  verifier_address: string | null;
  verification_status: string;
  license_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractMetadata {
  creator_address: string | null;
  creation_transaction_hash: string | null;
  creation_block_height: number | null;
  is_token: boolean;
  token_type: string | null;
  token_name: string | null;
  token_symbol: string | null;
  token_decimals: number | null;
  total_transactions: number;
  balance: string;
  first_seen: string | null;
  last_active: string | null;
}

export interface Contract {
  contract_address: string;
  is_verified: boolean;
  verification?: {
    contract_name: string;
    compiler_type: string;
    compiler_version: string;
    optimization_enabled: boolean;
    optimization_runs: number | null;
    verified_at: string;
    verification_status: string;
    license_type: string | null;
    evm_version?: string | null;
    source_files?: Record<string, any> | null;
  };
  source_code?: string;
  abi?: any[];
  metadata?: ContractMetadata;
}

export interface ContractAbi {
  id: number;
  contract_address: string;
  abi: any[];
  functions: AbiFunction[];
  events: AbiEvent[];
  created_at: string;
  updated_at: string;
}

export interface AbiFunction {
  name: string;
  signature: string;
  stateMutability: 'view' | 'pure' | 'nonpayable' | 'payable';
  inputs: AbiParameter[];
  outputs: AbiParameter[];
}

export interface AbiEvent {
  name: string;
  signature: string;
  inputs: AbiParameter[];
}

export interface AbiParameter {
  name: string;
  type: string;
  indexed?: boolean;
}

export interface ContractEvent {
  id: number;
  contract_address: string;
  transaction_hash: string;
  block_height: number;
  log_index: number;
  event_name: string | null;
  event_signature: string | null;
  topics: string[];
  data: string | null;
  decoded_params: DecodedParameter[] | null;
  timestamp: string;
}

export interface InternalTransaction {
  id: number;
  transaction_hash: string;
  block_height: number;
  parent_call_id: number | null;
  call_type: string;
  from_address: string;
  to_address: string | null;
  value: string;
  gas_limit: number | null;
  gas_used: number | null;
  input_data: string | null;
  output_data: string | null;
  error: string | null;
  depth: number;
  success: boolean;
  timestamp: string;
}

export interface DecodedParameter {
  name: string;
  type: string;
  value: any;
  indexed?: boolean;
}
