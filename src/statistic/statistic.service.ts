import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { DefaultMessage } from 'src/utils/constant';
import { getCurrentDate, getMonday, toDateString } from 'src/utils/dateHelper';
import { OrderStatus } from 'src/utils/enum';
import { RevenueOverviewDto } from 'src/utils/types';

@Injectable()
export class StatisticService {
  constructor(private prisma: PrismaService) {}
  async getRevenueChartData(type: string = 'day', res: Response) {
    try {
      const data: {
        label: string;
        value: { revenue: number; numberOfOrder: number };
      }[] = [];
      const today = getCurrentDate();

      if (type === 'day') {
        today.setDate(today.getDate() - 7);
        for (let i = 0; i < 7; i++) {
          const date = today.toISOString().split('T')[0];
          const stat = await this.prisma.statisticsByDay.aggregate({
            _sum: {
              revenue: true,
              number_of_order: true,
            },
            where: {
              statistics_date: new Date(date),
            },
          });
          data.push({
            label: date,
            value: {
              revenue: Number(stat._sum.revenue ? stat._sum.revenue : 0),
              numberOfOrder: stat._sum.number_of_order
                ? stat._sum.number_of_order
                : 0,
            },
          });

          today.setDate(today.getDate() + 1);
        }
      }

      if (type === 'week') {
        const labels = [
          'Thứ 2',
          'Thứ 3',
          'Thứ 4',
          'Thứ 5',
          'Thứ 6',
          'Thứ 7',
          'Chủ nhật',
        ];
        const monday = getMonday(today);
        for (let i = 0; i < 7; i++) {
          const date = toDateString(monday);
          const stats = await this.prisma.statisticsByDay.aggregate({
            _sum: {
              revenue: true,
              number_of_order: true,
            },
            where: {
              statistics_date: new Date(date),
            },
          });

          data.push({
            label: labels[i],
            value: {
              revenue: Number(stats._sum.revenue ? stats._sum.revenue : 0),
              numberOfOrder: stats._sum.number_of_order
                ? stats._sum.number_of_order
                : 0,
            },
          });

          monday.setDate(monday.getDate() + 1);
        }
      }

      if (type === 'month') {
        const labels = [
          'Tháng 1',
          'Tháng 2',
          'Tháng 3',
          'Tháng 4',
          'Tháng 5',
          'Tháng 6',
          'Tháng 7',
          'Tháng 8',
          'Tháng 9',
          'Tháng 10',
          'Tháng 11',
          'Tháng 12',
        ];
        const year = getCurrentDate().getFullYear();
        for (let i = 0; i < 12; i++) {
          var firstDay = new Date(Date.UTC(year, i, 1));
          var lastDay = new Date(Date.UTC(year, i + 1, 0));
          const stat = await this.prisma.statisticsByDay.aggregate({
            _sum: {
              revenue: true,
              number_of_order: true,
            },
            where: {
              statistics_date: {
                gte: firstDay,
                lte: lastDay,
              },
            },
          });
          data.push({
            label: labels[i],
            value: {
              revenue: Number(stat._sum.revenue ? stat._sum.revenue : 0),
              numberOfOrder: stat._sum.number_of_order
                ? stat._sum.number_of_order
                : 0,
            },
          });
        }
      }

      return res.status(200).json({ data: data });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async getRevenueOverview(res: Response) {
    const currentDate = toDateString(getCurrentDate());
    try {
      const stat = await this.prisma.statisticsByDay.aggregate({
        _sum: {
          revenue: true,
          number_of_order: true,
        },
        where: {
          statistics_date: new Date(currentDate),
        },
      });
      const data: RevenueOverviewDto = {
        revenue: Number(stat._sum.revenue),
        numberOfOrder: stat._sum.number_of_order ?? 0,
      };
      return res.status(200).json({ data: data });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: DefaultMessage });
    }
  }

  async getOrderTypePercentChartData(res: Response) {
    type ChartData = {
      labels: string[];
      values: number[];
      total: number;
    };
    try {
      const data: ChartData = { labels: [], values: [], total: 0 };
      const today = getCurrentDate();
      const month = today.getMonth();
      const year = today.getFullYear();
      var firstDay = new Date(Date.UTC(year, month, 1));
      var lastDay = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

      const stats = await this.prisma.order.groupBy({
        by: ['type'],
        _count: {
          type: true,
        },
        where: {
          created_at: {
            gte: firstDay,
            lte: lastDay,
          },
          status: OrderStatus.PAID,
        },
      });

      for (let item of stats) {
        data.labels.push(item.type);
        data.values.push(item._count.type);
        data.total += item._count.type;
      }

      return res.status(200).json({ data: data });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async getOrderPaymentTypeChartData(res: Response) {
    type ChartData = {
      labels: string[];
      values: number[];
      total: number;
    };
    try {
      const data: ChartData = { labels: [], values: [], total: 0 };
      const today = getCurrentDate();
      const month = today.getMonth();
      const year = today.getFullYear();
      var firstDay = new Date(Date.UTC(year, month, 1));
      var lastDay = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

      const stats = await this.prisma.order.groupBy({
        by: ['payment_id'],
        _count: {
          type: true,
        },
        where: {
          created_at: {
            gte: firstDay,
            lte: lastDay,
          },
          status: OrderStatus.PAID,
        },
      });

      for (let item of stats) {
        const { type } = await this.prisma.payment.findFirst({
          select: {
            type: true,
          },
          where: {
            id: item.payment_id,
          },
        });
        data.labels.push(type);
        data.values.push(item._count.type);
        data.total += item._count.type;
      }

      return res.status(200).json({ data: data });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async getProductSaleByCategoryChartData(res: Response) {
    type ChartData = {
      labels: string[];
      values: number[];
      total: number;
    };
    let data: ChartData = {
      labels: [],
      values: [],
      total: 0,
    };
    try {
      const categories = await this.prisma.category.findMany({
        select: {
          name: true,
        },
      });

      for (let category of categories) {
        data.labels.push(category.name);
        data.values.push(0);
      }

      const stats = await this.prisma.productStatistics.groupBy({
        by: 'product_id',
        _sum: {
          sold: true,
        },
      });

      for (let stat of stats) {
        const product = await this.prisma.product.findUnique({
          select: {
            category: {
              select: {
                name: true,
              },
            },
          },
          where: { id: stat.product_id },
        });

        const categoryIndex = data.labels.findIndex(
          (label) => label === product.category.name,
        );

        data.values[categoryIndex] =
          data.values[categoryIndex] + stat._sum.sold;
        data.total += stat._sum.sold;
      }

      return res.status(200).json({ data: data });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async getTopSaleProduct(res: Response) {
    type ReturnProduct = {
      id: number;
      name: string;
      sales: number;
      revenue: number;
    };
    try {
      const today = getCurrentDate();
      const month = today.getMonth();
      const year = today.getFullYear();
      var firstDay = new Date(Date.UTC(year, month, 1));
      var lastDay = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
      const responseData: ReturnProduct[] = [];
      const productSumGroup = await this.prisma.productStatistics.groupBy({
        by: ['product_id'],
        _sum: {
          sold: true,
          revenue: true,
        },
        where: {
          sale_date: {
            gte: firstDay,
            lte: lastDay,
          },
        },
      });

      const limit = productSumGroup.length < 10 ? productSumGroup.length : 10;
      for (let i = 0; i < limit; i++) {
        const { name } = await this.prisma.product.findFirst({
          where: {
            id: productSumGroup[i].product_id,
          },
          select: {
            name: true,
          },
        });

        responseData.push({
          id: productSumGroup[i].product_id,
          name: name,
          revenue: Number(productSumGroup[i]._sum.revenue),
          sales: productSumGroup[i]._sum.sold,
        });
      }
      const sortData = responseData.sort((a, b) => {
        if (a.revenue == b.revenue) return 0;
        return a.revenue > b.revenue ? -1 : 1;
      });

      return res.status(200).json({ products: sortData });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

}
