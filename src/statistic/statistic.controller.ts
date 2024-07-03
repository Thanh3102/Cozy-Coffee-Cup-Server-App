import { StatisticService } from './statistic.service';
import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Controller('/api/statistic')
@UseGuards(AuthGuard)
export class StatisticController {
  constructor(private StatisticService: StatisticService) {}
  @Get('/getRevenueChartData')
  getRevenueChartData(@Query('type') type: string, @Res() res: Response) {
    return this.StatisticService.getRevenueChartData(type, res);
  }

  @Get('/getRevenueOverview')
  getRevenueOverview(@Res() res: Response) {
    return this.StatisticService.getRevenueOverview(res);
  }

  @Get('/getOrderTypePercentChartData')
  getOrderTypePercentChartData(@Res() res) {
    return this.StatisticService.getOrderTypePercentChartData(res);
  }

  @Get('/getProductSaleByCategoryChartData')
  getProductSaleByCategoryChartData(@Res() res: Response) {
    return this.StatisticService.getProductSaleByCategoryChartData(res);
  }

  @Get('/getOrderPaymentTypeChartData')
  getOrderPaymentTypeChartData(@Res() res: Response) {
    return this.StatisticService.getOrderPaymentTypeChartData(res);
  }

  @Get('/getTopSaleProduct')
  getTopSaleProduct(@Res() res: Response) {
    return this.StatisticService.getTopSaleProduct(res);
  }
}
