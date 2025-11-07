/**
 * Validator Type Resolvers
 * Resolve nested fields for Validator type
 */

import type { DataLoaderContext } from '../dataloaders';
import type { Account, Validator } from '../../types';

interface Context {
  dataloaders: DataLoaderContext;
}

export const validatorResolvers = {
  // Resolve validator account
  async account(
    validator: Validator,
    _args: unknown,
    context: Context
  ): Promise<Account | null> {
    return context.dataloaders.accountLoader.load(validator.operator_address);
  },

  // Get blocks proposed by validator
  async proposedBlocks(
    validator: Validator,
    args: { first?: number; after?: string },
    context: Context
  ): Promise<any> {
    // This would query blocks where proposer_address = validator.consensus_address
    return {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: 0,
    };
  },
};
