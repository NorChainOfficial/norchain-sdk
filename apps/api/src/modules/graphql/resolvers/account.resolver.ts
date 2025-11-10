import { Resolver, Query, Args } from '@nestjs/graphql';
import { AccountService } from '../../account/account.service';
import { Account } from '../types/account.type';

@Resolver(() => Account)
export class AccountResolver {
  constructor(private readonly accountService: AccountService) {}

  @Query(() => String)
  async accountBalance(@Args('address') address: string) {
    const result = await this.accountService.getBalance({ address });
    return result.result || '0';
  }

  @Query(() => Account, { nullable: true })
  async account(@Args('address') address: string) {
    const summaryResult = await this.accountService.getAccountSummary(address);
    if (!summaryResult || !summaryResult.result) return null;
    
    const summary = summaryResult.result;
    return {
      address,
      balance: summary.balance || '0',
      nonce: summary.nonce,
      codeHash: summary.codeHash,
    };
  }
}

