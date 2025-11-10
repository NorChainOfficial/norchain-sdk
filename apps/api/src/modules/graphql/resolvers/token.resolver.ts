import { Resolver, Query, Args } from '@nestjs/graphql';
import { TokenService } from '../../token/token.service';
import { Token } from '../types/token.type';

@Resolver(() => Token)
export class TokenResolver {
  constructor(private readonly tokenService: TokenService) {}

  @Query(() => Token, { nullable: true })
  async token(@Args('address') address: string) {
    const result = await this.tokenService.getTokenInfo(address);
    if (!result || !result.result) return null;

    const info = result.result;
    return {
      address,
      name: info.name || '',
      symbol: info.symbol || '',
      decimals: info.decimals || 18,
      totalSupply: info.totalSupply || '0',
    };
  }

  @Query(() => String)
  async tokenBalance(
    @Args('tokenAddress') tokenAddress: string,
    @Args('accountAddress') accountAddress: string,
  ) {
    const result = await this.tokenService.getTokenAccountBalance(
      tokenAddress,
      accountAddress,
    );
    return result?.result || '0';
  }

  @Query(() => String)
  async tokenSupply(@Args('address') address: string) {
    const result = await this.tokenService.getTokenSupply(address);
    return result?.result || '0';
  }
}
