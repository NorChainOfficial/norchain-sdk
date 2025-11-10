import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RPCExtensionsService } from '../../rpc/rpc-extensions.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('V2 - Validators')
@Controller('v2/validators')
@Public()
export class ValidatorsController {
  constructor(private readonly rpcExtensionsService: RPCExtensionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get validator set with uptime and compliance scores' })
  @ApiQuery({ name: 'tag', required: false, enum: ['current', 'next'] })
  @ApiResponse({
    status: 200,
    description: 'Validator set retrieved successfully',
  })
  async getValidators(@Query('tag') tag?: 'current' | 'next') {
    return this.rpcExtensionsService.getValidatorSet(tag);
  }
}

