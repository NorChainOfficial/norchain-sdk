import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
  ParseUUIDPipe,
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
import { Idempotent } from '@/common/decorators/idempotency.decorator';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePOSSessionDto } from './dto/create-pos-session.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreatePriceDto } from './dto/create-price.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { CreateCheckoutSessionWithLineItemsDto } from './dto/create-checkout-session-with-line-items.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { OnboardMerchantDto } from './dto/onboard-merchant.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { InvoiceStatus } from './entities/payment-invoice.entity';
import { CouponStatus } from './entities/coupon.entity';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';
import { ApiHeader } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('invoices')
  @Idempotent()
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
  @Idempotent()
  @ApiOperation({ summary: 'Create a POS payment session' })
  @ApiResponse({
    status: 201,
    description: 'POS session created successfully',
  })
  async createPOSSession(
    @Request() req: any,
    @Body() dto: CreatePOSSessionDto,
  ) {
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

  // ========== Merchant & Checkout Endpoints ==========

  @Post('merchants')
  @Idempotent()
  @ApiOperation({ summary: 'Onboard a merchant' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Merchant onboarded successfully' })
  @ApiResponse({ status: 400, description: 'Merchant already onboarded' })
  async onboardMerchant(@Request() req: any, @Body() dto: OnboardMerchantDto) {
    return this.paymentsService.onboardMerchant(
      req.user.orgId || req.user.id,
      req.user.id,
      dto,
    );
  }

  @Post('checkout-sessions')
  @Idempotent()
  @ApiOperation({
    summary: 'Create a checkout session',
    description: 'Creates a hosted checkout session for crypto payments',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Checkout session created successfully',
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  async createCheckoutSession(
    @Request() req: any,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    return this.paymentsService.createCheckoutSession(dto, req.user.id);
  }

  @Post('checkout-sessions/with-line-items')
  @Idempotent()
  @ApiOperation({
    summary: 'Create a checkout session with line items',
    description: 'Creates a hosted checkout session for products/prices',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Checkout session created successfully',
  })
  async createCheckoutSessionWithLineItems(
    @Request() req: any,
    @Body() dto: CreateCheckoutSessionWithLineItemsDto,
  ) {
    return this.paymentsService.createCheckoutSessionWithLineItems(
      dto,
      req.user.id,
    );
  }

  @Get('checkout-sessions/:sessionId')
  @ApiOperation({ summary: 'Get checkout session status' })
  @ApiResponse({
    status: 200,
    description: 'Checkout session retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Checkout session not found' })
  async getCheckoutSession(@Param('sessionId') sessionId: string) {
    return this.paymentsService.getCheckoutSession(sessionId);
  }

  @Post('refunds')
  @Idempotent()
  @ApiOperation({
    summary: 'Create a refund',
    description: 'Creates a refund for a payment (sends on-chain transaction)',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Refund created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid refund amount' })
  @ApiResponse({ status: 403, description: 'Refund blocked by policy' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async createRefund(@Request() req: any, @Body() dto: CreateRefundDto) {
    return this.paymentsService.createRefund(dto, req.user.id);
  }

  // ========== Products & Prices Endpoints ==========

  @Post('products')
  @Idempotent()
  @ApiOperation({ summary: 'Create a product' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async createProduct(@Request() req: any, @Body() dto: CreateProductDto) {
    return this.paymentsService.createProduct(dto, req.user.id);
  }

  @Post('prices')
  @Idempotent()
  @ApiOperation({ summary: 'Create a price for a product' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Price created successfully' })
  async createPrice(@Request() req: any, @Body() dto: CreatePriceDto) {
    return this.paymentsService.createPrice(dto, req.user.id);
  }

  @Get('catalog')
  @ApiOperation({ summary: 'Get product catalog with prices' })
  @ApiResponse({ status: 200, description: 'Catalog retrieved successfully' })
  async getCatalog(@Request() req: any, @Query('orgId') orgId?: string) {
    const targetOrgId = orgId || req.user.orgId || req.user.id;
    return this.paymentsService.getCatalog(targetOrgId);
  }

  // ========== Customers Endpoints ==========

  @Post('customers')
  @Idempotent()
  @ApiOperation({ summary: 'Create a customer' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  async createCustomer(@Request() req: any, @Body() dto: CreateCustomerDto) {
    return this.paymentsService.createCustomer(dto, req.user.id);
  }

  // ========== Subscriptions Endpoints ==========

  @Post('subscriptions')
  @Idempotent()
  @ApiOperation({ summary: 'Create a subscription' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
  })
  async createSubscription(
    @Request() req: any,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.paymentsService.createSubscription(dto, req.user.id);
  }

  @Post('subscriptions/:id/cancel')
  @Idempotent()
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription canceled successfully',
  })
  async cancelSubscription(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.cancelSubscription(id, req.user.id);
  }

  // ========== Disputes Endpoints ==========

  @Post('disputes')
  @Idempotent()
  @ApiOperation({ summary: 'Create a dispute for a payment' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Dispute created successfully' })
  async createDispute(@Request() req: any, @Body() dto: CreateDisputeDto) {
    return this.paymentsService.createDispute(dto, req.user.id);
  }

  // ========== Webhooks Endpoints ==========

  @Post('webhooks')
  @Idempotent()
  @ApiOperation({ summary: 'Register a webhook endpoint' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Webhook endpoint registered successfully',
  })
  async registerWebhook(
    @Request() req: any,
    @Body() dto: { orgId: string; url: string; events: string[] },
  ) {
    return this.paymentsService.registerWebhook(
      dto.orgId,
      dto.url,
      dto.events,
      req.user.id,
    );
  }

  // ========== Coupons Endpoints ==========

  @Post('coupons')
  @Idempotent()
  @ApiOperation({ summary: 'Create a coupon' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Coupon created successfully' })
  @ApiResponse({ status: 409, description: 'Coupon code already exists' })
  async createCoupon(@Request() req: any, @Body() dto: CreateCouponDto) {
    return this.paymentsService.createCoupon(dto, req.user.id);
  }

  @Get('coupons')
  @ApiOperation({ summary: 'Get coupons for organization' })
  @ApiQuery({ name: 'status', required: false, enum: CouponStatus })
  @ApiResponse({ status: 200, description: 'Coupons retrieved successfully' })
  async getCoupons(
    @Request() req: any,
    @Query('orgId') orgId?: string,
    @Query('status') status?: CouponStatus,
  ) {
    const targetOrgId = orgId || req.user.orgId || req.user.id;
    return this.paymentsService.getCoupons(targetOrgId, status);
  }

  @Get('coupons/:code')
  @ApiOperation({ summary: 'Get coupon by code' })
  @ApiParam({ name: 'code', description: 'Coupon code' })
  @ApiResponse({ status: 200, description: 'Coupon retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async getCouponByCode(
    @Request() req: any,
    @Param('code') code: string,
    @Query('orgId') orgId?: string,
  ) {
    const targetOrgId = orgId || req.user.orgId || req.user.id;
    return this.paymentsService.getCouponByCode(code, targetOrgId);
  }

  @Post('coupons/apply')
  @ApiOperation({ summary: 'Apply coupon and calculate discount' })
  @ApiResponse({
    status: 200,
    description: 'Coupon applied successfully',
  })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async applyCoupon(
    @Request() req: any,
    @Body() dto: ApplyCouponDto,
    @Query('orgId') orgId?: string,
  ) {
    const targetOrgId = orgId || req.user.orgId || req.user.id;
    return this.paymentsService.applyCoupon(dto, targetOrgId);
  }

  @Patch('coupons/:id/status')
  @ApiOperation({ summary: 'Update coupon status' })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  @ApiResponse({
    status: 200,
    description: 'Coupon status updated successfully',
  })
  async updateCouponStatus(
    @Request() req: any,
    @Param('id') couponId: string,
    @Body('status') status: CouponStatus,
    @Query('orgId') orgId?: string,
  ) {
    const targetOrgId = orgId || req.user.orgId || req.user.id;
    return this.paymentsService.updateCouponStatus(
      couponId,
      status,
      targetOrgId,
    );
  }
}
