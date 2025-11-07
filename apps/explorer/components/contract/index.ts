/**
 * Enhanced Contract Interaction Components
 * Export all contract-related components, services, and utilities
 */

// Components
export { EnhancedReadContract } from './EnhancedReadContract';
export { EnhancedWriteContract } from './EnhancedWriteContract';

// Services
export { AbiManager } from '@/lib/contracts/abi-manager';
export {
  ContractInteractionService,
  TransactionQueue,
} from '@/lib/contracts/interaction-service';

// Types
export type { ParsedAbi, ValidationResult } from '@/lib/contracts/abi-manager';
export type {
  ReadCallResult,
  WriteCallResult,
  GasEstimate,
  SimulationResult,
} from '@/lib/contracts/interaction-service';

// Examples
export { ERC20_ABI, ERC20_EXAMPLES } from './examples/erc20-example';
export { ERC721_ABI, ERC721_EXAMPLES } from './examples/nft-example';
export {
  COMPLEX_TYPES_ABI,
  COMPLEX_TYPES_EXAMPLES,
} from './examples/complex-types-example';
