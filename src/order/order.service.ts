import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dtos';
import { CustomRequest } from 'src/utils/interface';
import { OrderStatus } from 'src/utils/enum';
import { PayOrderDto, UpdateOrderDto } from 'src/utils/types';
import dayjs from 'dayjs';
@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async getOrderByFilter(queries, res: Response) {
    try {
      const start = new Date(queries.startDate);
      const end = new Date(queries.endDate);
      end.setHours(23);
      end.setMinutes(59);
      end.setSeconds(59);

      let whereCondition: any = {
        void: false,
        created_at: {
          lte: end,
          gte: start,
        },
      };

      if (queries.id != 'NaN' && queries.id) {
        whereCondition = { ...whereCondition, id: parseInt(queries.id) };
      }

      if (queries.type)
        whereCondition = { ...whereCondition, type: queries.type };

      if (queries.status)
        whereCondition = { ...whereCondition, status: queries.status };
      const orders = await this.prisma.order.findMany({
        where: whereCondition,
        select: {
          id: true,
          note: true,
          created_at: true,
          status: true,
        },
      });
      return res.status(200).json({ orders: orders });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã xảy ra lỗi' });
    }
  }

  async getOrderDetailById(id: number, res: Response) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        type: true,
        status: true,
        note: true,
        created_at: true,
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            order_item_options: {
              select: {
                id: true,
                title: true,
                order_item_option_values: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return res.status(200).json({ order: order });
  }

  async createOrder(dto: CreateOrderDto, req: CustomRequest, res: Response) {
    try {
      const userId = req.user.id;
      await this.prisma.$transaction(async (client) => {
        const order = await client.order.create({
          data: {
            type: dto.type,
            note: dto.note,
            total: dto.total,
            status: OrderStatus.UNPAID,
            created_by: userId,
          },
        });

        for (let item of dto.items) {
          const orderItem = await client.orderItem.create({
            data: {
              quantity: item.quantity,
              price: item.price,
              discount: item.discount,
              is_gift: item.is_gift,
              product_id: item.product_id,
              order_id: order.id,
            },
          });

          for (let option of item.options) {
            await client.orderItemOption.create({
              data: {
                title: option.title,
                order_item_id: orderItem.id,
                order_item_option_values: {
                  create: option.values.map((v) => {
                    return {
                      name: v.name,
                      price: v.price,
                    };
                  }),
                },
              },
            });
          }
        }
      });
      return res.status(200).json({ message: 'Tạo hóa đơn thành công' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async updateOrder(dto: UpdateOrderDto, res: Response) {
    try {
      await this.prisma.$transaction(async (p) => {
        // Update order info
        await p.order.update({
          where: {
            id: dto.id,
          },
          data: {
            total: dto.total,
            note: dto.note,
            type: dto.type,
          },
        });

        // Update order items
        for (let item of dto.items) {
          // If item exists update
          if (item.id) {
            await p.orderItem.update({
              where: {
                id: item.id,
              },
              data: {
                quantity: item.quantity,
              },
            });
            // Create new if not exists
          } else {
            const orderItem = await p.orderItem.create({
              data: {
                quantity: item.quantity,
                price: item.price,
                discount: item.discount,
                is_gift: item.is_gift,
                product_id: item.product_id,
                order_id: dto.id,
              },
            });

            for (let option of item.options) {
              await p.orderItemOption.create({
                data: {
                  title: option.title,
                  order_item_id: orderItem.id,
                  order_item_option_values: {
                    create: option.values.map((v) => {
                      return {
                        name: v.name,
                        price: v.price,
                      };
                    }),
                  },
                },
              });
            }
          }
        }

        // Delete order item
        await p.orderItem.deleteMany({
          where: {
            id: {
              in: dto.deleteItems,
            },
          },
        });
      });

      return res.status(200).json({ message: 'Cập nhật thành công' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async payOrder(dto: PayOrderDto, res: Response) {
    try {
      await this.prisma.$transaction(async (p) => {
        // Update order payment
        const order = await p.order.update({
          where: {
            id: dto.id,
          },
          data: {
            payment_id: dto.paymentMethod,
            payment_at: dto.paymentAt,
            status: OrderStatus.PAID,
          },
          include: {
            orderItems: true,
          },
        });

        // Get current time
        const today = new Date();
        today.setHours(today.getHours() + 7);
        const currentDate = today.toISOString().split('T')[0];

        // Update product statistic
        for (let item of order.orderItems) {
          if (!item.is_gift) {
            const x = await p.productStatistics.updateMany({
              data: {
                sold: {
                  increment: item.quantity,
                },
                revenue: {
                  increment: item.price * item.quantity,
                },
              },
              where: {
                product_id: item.product_id,
                sale_date: {
                  equals: new Date(currentDate),
                },
              },
            });
            console.log('>>> X: ', x);
          }
        }

        // Update Statistics By Day
        await p.statisticsByDay.updateMany({
          data: {
            revenue: {
              increment: order.total,
            },
            number_of_order: {
              increment: 1,
            },
          },
          where: {
            statistics_date: new Date(currentDate),
          },
        });
      });

      return res.status(200).json({ message: 'Đã thanh toán hóa đơn' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async getPaymentMethod(res: Response) {
    try {
      const methods = await this.prisma.payment.findMany({
        select: {
          id: true,
          type: true,
        },
      });
      return res.status(200).json({ paymentMethods: methods });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }
}
