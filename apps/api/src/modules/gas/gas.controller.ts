import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GasService } from './gas.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Gas')
@Controller('gas')
export class GasController {
  constructor(private readonly gasService: GasService) {}

  @Public()
  @Get('gasoracle')
  @ApiOperation({ summary: 'Get gas oracle with recommended gas prices' })
  @ApiResponse({
    status: 200,
    description: 'Gas oracle retrieved successfully',
  })
  async getGasOracle() {
    return this.gasService.getGasOracle();
  }

  @Public()
  @Post('gasestimate')
  @ApiOperation({ summary: 'Estimate gas for a transaction' })
  @ApiResponse({
    status: 200,
    description: 'Gas estimate retrieved successfully',
  })
  async estimateGas(@Body() transaction: any) {
    return this.gasService.estimateGas(transaction);
  }
}
