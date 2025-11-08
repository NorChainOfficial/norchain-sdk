import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateLimitOrderDto } from './dto/create-limit-order.dto';
import { CreateStopLossOrderDto } from './dto/create-stop-loss-order.dto';
import { CreateDCAScheduleDto } from './dto/create-dca-schedule.dto';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Limit Orders
  @Public()
  @Post('limit')
  @ApiOperation({ summary: 'Create limit order' })
  @ApiResponse({ status: 201, description: 'Limit order created successfully' })
  async createLimitOrder(@Body() dto: CreateLimitOrderDto) {
    return this.ordersService.createLimitOrder(dto);
  }

  @Public()
  @Get('limit')
  @ApiOperation({ summary: 'Get limit orders for user' })
  @ApiQuery({
    name: 'user',
    description: 'User wallet address',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Limit orders retrieved successfully',
  })
  async getLimitOrders(@Query('user') userAddress: string) {
    return this.ordersService.getLimitOrders(userAddress);
  }

  @Public()
  @Delete('limit/:id')
  @ApiOperation({ summary: 'Cancel limit order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  async cancelLimitOrder(@Param('id') id: string) {
    return this.ordersService.cancelLimitOrder(id);
  }

  // Stop-Loss Orders
  @Public()
  @Post('stop-loss')
  @ApiOperation({ summary: 'Create stop-loss order' })
  @ApiResponse({
    status: 201,
    description: 'Stop-loss order created successfully',
  })
  async createStopLossOrder(@Body() dto: CreateStopLossOrderDto) {
    return this.ordersService.createStopLossOrder(dto);
  }

  @Public()
  @Get('stop-loss')
  @ApiOperation({ summary: 'Get stop-loss orders for user' })
  @ApiQuery({
    name: 'user',
    description: 'User wallet address',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Stop-loss orders retrieved successfully',
  })
  async getStopLossOrders(@Query('user') userAddress: string) {
    return this.ordersService.getStopLossOrders(userAddress);
  }

  // DCA Schedules
  @Public()
  @Post('dca')
  @ApiOperation({ summary: 'Create DCA schedule' })
  @ApiResponse({
    status: 201,
    description: 'DCA schedule created successfully',
  })
  async createDCASchedule(@Body() dto: CreateDCAScheduleDto) {
    return this.ordersService.createDCASchedule(dto);
  }

  @Public()
  @Get('dca')
  @ApiOperation({ summary: 'Get DCA schedules for user' })
  @ApiQuery({
    name: 'user',
    description: 'User wallet address',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'DCA schedules retrieved successfully',
  })
  async getDCASchedules(@Query('user') userAddress: string) {
    return this.ordersService.getDCASchedules(userAddress);
  }
}
