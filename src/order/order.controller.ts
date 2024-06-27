import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Response } from 'express';
import {
  CreateOrderDto,
  PayOrderDto,
  UpdateOrderDto,
} from '../dtos/order.dtos';
import { CustomRequest } from 'src/utils/interface';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { PermissionsGuard } from 'src/guards/permissions/permissions.guard';
import { Permissions } from 'src/decorator/permissions.decorator';
import { Permission } from 'src/utils/enum';

@Controller('/api/order')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Permissions(Permission.Order_View)
  @UseGuards(PermissionsGuard)
  @Get('/getOrderByFilter')
  getOrderByFilter(@Query() queries, @Res() res: Response) {
    return this.orderService.getOrderByFilter(queries, res);
  }

  @Permissions(Permission.Order_Create)
  @UseGuards(PermissionsGuard)
  @Post('/createOrder')
  createOrder(
    @Body() dto: CreateOrderDto,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    return this.orderService.createOrder(dto, req, res);
  }

  @Permissions(Permission.Order_Edit)
  @UseGuards(PermissionsGuard)
  @Post('/updateOrder')
  updateOrder(@Body() dto: UpdateOrderDto, @Res() res: Response) {
    return this.orderService.updateOrder(dto, res);
  }

  @Permissions(Permission.Order_Edit)
  @UseGuards(PermissionsGuard)
  @Delete('/deleteOrder')
  deleteOrder(@Query('id') id: string, @Res() res: Response) {
    return this.orderService.deleteOrder(parseInt(id), res);
  }

  @Permissions(Permission.Order_View)
  @UseGuards(PermissionsGuard)
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

  @Permissions(Permission.Order_Pay)
  @UseGuards(PermissionsGuard)
  @Post('/payOrder')
  payOrder(
    @Body() dto: PayOrderDto,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    return this.orderService.payOrder(dto, req, res);
  }
}
