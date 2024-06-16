import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Response } from 'express';
import { CreateOrderDto, PayOrderDto, UpdateOrderDto } from './dtos';
import { CustomRequest } from 'src/utils/interface';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Controller('/api/order')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get('/getOrderByFilter')
  getOrderByFilter(@Query() queries, @Res() res: Response) {
    return this.orderService.getOrderByFilter(queries, res);
  }

  @Post('/createOrder')
  createorder(
    @Body() dto: CreateOrderDto,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    return this.orderService.createOrder(dto, req, res);
  }

  @Post('/updateOrder')
  updateorder(@Body() dto: UpdateOrderDto, @Res() res: Response) {
    return this.orderService.updateOrder(dto, res);
  }

  @Get('/getOrderDetail')
  getOrderDetail(@Query('id') id: string, @Res() res: Response) {
    try {
      return this.orderService.getOrderDetailById(parseInt(id), res);
    } catch (error) {
      return res.status(400).json({ message: 'Bad request' });
    }
  }

  @Get('/getPaymentMethod')
  getPaymentMethod(@Res() res: Response) {
    return this.orderService.getPaymentMethod(res);
  }

  @Post('/payOrder')
  payOrder(@Body() dto: PayOrderDto, @Res() res: Response) {
    return this.orderService.payOrder(dto, res);
  }
}
