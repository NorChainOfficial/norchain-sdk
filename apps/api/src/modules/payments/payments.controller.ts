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
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePOSSessionDto } from './dto/create-pos-session.dto';
import { InvoiceStatus } from './entities/payment-invoice.entity';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('invoices')
  @ApiOperation({ summary: 'Create a payment invoice' })
  @ApiResponse({
    status: 201,
    description: 'Invoice created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: ErrorResponseDto,
  })
  async createInvoice(@Request() req: any, @Body() dto: CreateInvoiceDto) {
    return this.paymentsService.createInvoice(req.user.id, dto);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get all invoices for the authenticated user' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: InvoiceStatus })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully',
  })
  async getInvoices(
    @Request() req: any,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('status') status?: InvoiceStatus,
  ) {
    return this.paymentsService.getInvoices(req.user.id, limit, offset, status);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice details' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Invoice details retrieved successfully',
  })
  async getInvoice(@Request() req: any, @Param('id') invoiceId: string) {
    return this.paymentsService.getInvoice(req.user.id, invoiceId);
  }

  @Post('pos/sessions')
  @ApiOperation({ summary: 'Create a POS payment session' })
  @ApiResponse({
    status: 201,
    description: 'POS session created successfully',
  })
  async createPOSSession(@Request() req: any, @Body() dto: CreatePOSSessionDto) {
    return this.paymentsService.createPOSSession(req.user.id, dto);
  }

  @Get('pos/sessions/:id')
  @ApiOperation({ summary: 'Get POS session status' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({
    status: 200,
    description: 'Session status retrieved successfully',
  })
  async getPOSSession(@Request() req: any, @Param('id') sessionId: string) {
    return this.paymentsService.getPOSSession(req.user.id, sessionId);
  }

  @Get('merchants/:id/settlements')
  @ApiOperation({ summary: 'Get merchant settlements' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Settlements retrieved successfully',
  })
  async getSettlements(
    @Request() req: any,
    @Param('id') merchantId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    // Verify merchant ownership
    if (req.user.id !== merchantId) {
      throw new Error('Access denied');
    }
    return this.paymentsService.getSettlements(merchantId, limit, offset);
  }

  @Get('merchants/:id/settlements/:settlementId')
  @ApiOperation({ summary: 'Get settlement details' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiParam({ name: 'settlementId', description: 'Settlement ID' })
  @ApiResponse({
    status: 200,
    description: 'Settlement details retrieved successfully',
  })
  async getSettlement(
    @Request() req: any,
    @Param('id') merchantId: string,
    @Param('settlementId') settlementId: string,
  ) {
    if (req.user.id !== merchantId) {
      throw new Error('Access denied');
    }
    return this.paymentsService.getSettlement(merchantId, settlementId);
  }
}

