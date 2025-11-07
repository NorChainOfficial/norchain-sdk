import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  Delete,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";

@Controller("api/orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Limit Orders
  @Post("limit")
  async createLimitOrder(@Body() body: any) {
    return this.ordersService.createLimitOrder(body);
  }

  @Get("limit")
  async getLimitOrders(@Query("user") userAddress: string) {
    return this.ordersService.getLimitOrders(userAddress);
  }

  @Delete("limit/:id")
  async cancelLimitOrder(@Param("id") id: string) {
    return this.ordersService.cancelLimitOrder(id);
  }

  // Stop-Loss Orders
  @Post("stop-loss")
  async createStopLossOrder(@Body() body: any) {
    return this.ordersService.createStopLossOrder(body);
  }

  @Get("stop-loss")
  async getStopLossOrders(@Query("user") userAddress: string) {
    return this.ordersService.getStopLossOrders(userAddress);
  }

  // DCA Schedules
  @Post("dca")
  async createDCASchedule(@Body() body: any) {
    return this.ordersService.createDCASchedule(body);
  }

  @Get("dca")
  async getDCASchedules(@Query("user") userAddress: string) {
    return this.ordersService.getDCASchedules(userAddress);
  }
}

