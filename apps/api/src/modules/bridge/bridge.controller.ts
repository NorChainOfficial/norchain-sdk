import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BridgeService } from './bridge.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateBridgeQuoteDto } from './dto/create-bridge-quote.dto';
import { CreateBridgeTransferDto } from './dto/create-bridge-transfer.dto';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';

@ApiTags('Bridge')
@Controller('bridge')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BridgeController {
  constructor(private readonly bridgeService: BridgeService) {}

  @Post('quotes')
  @ApiOperation({ summary: 'Get a quote for a bridge transfer' })
  @ApiResponse({
    status: 200,
    description: 'Quote retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  async getQuote(@Body() dto: CreateBridgeQuoteDto) {
    return this.bridgeService.getQuote(dto);
  }

  @Post('transfers')
  @ApiOperation({ summary: 'Create a bridge transfer' })
  @ApiResponse({
    status: 201,
    description: 'Bridge transfer created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  async createTransfer(@Request() req: any, @Body() dto: CreateBridgeTransferDto) {
    return this.bridgeService.createTransfer(req.user.id, dto);
  }

  @Get('transfers')
  @ApiOperation({ summary: 'Get all bridge transfers for the authenticated user' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Transfers retrieved successfully',
  })
  async getTransfers(
    @Request() req: any,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.bridgeService.getUserTransfers(req.user.id, limit, offset);
  }

  @Get('transfers/:id')
  @ApiOperation({ summary: 'Get bridge transfer details by ID' })
  @ApiParam({ name: 'id', description: 'Transfer ID' })
  @ApiResponse({
    status: 200,
    description: 'Transfer details retrieved successfully',
  })
  async getTransfer(@Request() req: any, @Param('id') transferId: string) {
    return this.bridgeService.getTransfer(req.user.id, transferId);
  }

  @Get('transfers/:id/proof')
  @ApiOperation({ summary: 'Get inclusion proof for a bridge transfer' })
  @ApiParam({ name: 'id', description: 'Transfer ID' })
  @ApiResponse({
    status: 200,
    description: 'Proof retrieved successfully',
  })
  async getTransferProof(@Request() req: any, @Param('id') transferId: string) {
    return this.bridgeService.getTransferProof(req.user.id, transferId);
  }
}

