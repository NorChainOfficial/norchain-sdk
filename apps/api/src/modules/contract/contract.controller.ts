import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContractService } from './contract.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Contract')
@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Public()
  @Get('getabi')
  @ApiOperation({ summary: 'Get contract ABI' })
  @ApiResponse({
    status: 200,
    description: 'Contract ABI retrieved successfully',
  })
  async getAbi(@Query('address') address: string) {
    return this.contractService.getAbi(address);
  }

  @Public()
  @Get('getsourcecode')
  @ApiOperation({ summary: 'Get contract source code' })
  @ApiResponse({
    status: 200,
    description: 'Contract source code retrieved successfully',
  })
  async getSourceCode(@Query('address') address: string) {
    return this.contractService.getSourceCode(address);
  }

  @Public()
  @Post('verifycontract')
  @ApiOperation({ summary: 'Verify contract source code' })
  @ApiResponse({ status: 200, description: 'Contract verified successfully' })
  async verifyContract(@Body() verificationData: any) {
    return this.contractService.verifyContract(verificationData);
  }
}
