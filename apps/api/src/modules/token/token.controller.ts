import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TokenService } from './token.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Token')
@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Public()
  @Get('tokensupply')
  @ApiOperation({ summary: 'Get token total supply' })
  @ApiResponse({ status: 200, description: 'Token supply retrieved successfully' })
  async getTokenSupply(@Query('contractaddress') contractaddress: string) {
    return this.tokenService.getTokenSupply(contractaddress);
  }

  @Public()
  @Get('tokenaccountbalance')
  @ApiOperation({ summary: 'Get token balance for an address' })
  @ApiResponse({ status: 200, description: 'Token balance retrieved successfully' })
  async getTokenAccountBalance(
    @Query('contractaddress') contractaddress: string,
    @Query('address') address: string,
  ) {
    return this.tokenService.getTokenAccountBalance(contractaddress, address);
  }

  @Public()
  @Get('tokeninfo')
  @ApiOperation({ summary: 'Get token information and metadata' })
  @ApiResponse({ status: 200, description: 'Token information retrieved successfully' })
  async getTokenInfo(@Query('contractaddress') contractaddress: string) {
    return this.tokenService.getTokenInfo(contractaddress);
  }

  @Public()
  @Get('tokentx')
  @ApiOperation({ summary: 'Get token transfers for a token contract' })
  @ApiResponse({ status: 200, description: 'Token transfers retrieved successfully' })
  async getTokenTransfers(
    @Query('contractaddress') contractaddress: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return this.tokenService.getTokenTransfers(
      contractaddress,
      page,
      limit,
    );
  }
}

