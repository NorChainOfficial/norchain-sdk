import { Resolver, Query, Args } from '@nestjs/graphql';
import { TransactionService } from '../../transaction/transaction.service';
import { AccountService } from '../../account/account.service';
import { Transaction } from '../types/transaction.type';

@Resolver(() => Transaction)
export class TransactionResolver {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly accountService: AccountService,
  ) {}

  @Query(() => Transaction, { nullable: true })
  async transaction(@Args('hash') hash: string) {
    const result = await this.transactionService.getTransaction(hash);
    if (!result || !result.result) return null;

    const tx = result.result;
    return {
      hash: tx.hash || hash,
      from: tx.from || '',
      to: tx.to || '',
      value: tx.value || '0',
      gas: tx.gas,
      gasPrice: tx.gasPrice,
      blockNumber: tx.blockNumber,
      blockHash: tx.blockHash,
      status:
        tx.txreceipt_status || (tx.isError === '0' ? 'success' : 'failed'),
    };
  }

  @Query(() => [Transaction])
  async transactions(
    @Args('address', { nullable: true }) address?: string,
    @Args('page', { defaultValue: 1 }) page?: number,
    @Args('limit', { defaultValue: 10 }) limit?: number,
  ) {
    if (!address) {
      return []; // Can't list all transactions without address
    }

    const result = await this.accountService.getTransactions({
      address,
      page: page || 1,
      limit: limit || 10,
    });

    if (!result || !result.result) return [];

    const transactions = result.result.data || result.result;
    const txArray = Array.isArray(transactions) ? transactions : [];

    return txArray.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value || '0',
      gas: tx.gas,
      gasPrice: tx.gasPrice,
      blockNumber: tx.blockNumber,
      blockHash: tx.blockHash,
      status:
        tx.txreceipt_status || (tx.isError === '0' ? 'success' : 'failed'),
    }));
  }
}
