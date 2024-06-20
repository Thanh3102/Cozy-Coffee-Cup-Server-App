import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateCategoryDto,
  CreateOptionDto,
  CreateProductDto,
  CreateProductTypeDto,
  UpdateCategoryDto,
  UpdateOptionDto,
  UpdateProductDto,
  UpdateProductOptionDto,
  UpdateProductTypeDto,
} from 'src/utils/types';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { CustomRequest } from 'src/utils/interface';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}
  async getAll(res: Response) {
    try {
      const products = await this.prisma.product.findMany({
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
          description: true,
          type: true,
          note: true,
          discount: true,
          status: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { status: 'desc' },
      });
      return res.status(200).json({ products: products });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async getAllByCategory(res: Response) {
    try {
      const productByCategory = [];
      const categories = await this.prisma.category.findMany();
      for (let category of categories) {
        const products = await this.prisma.product.findMany({
          where: {
            category_id: category.id,
            status: true,
          },
          select: {
            id: true,
            image: true,
            name: true,
            price: true,
            discount: true,
            status: true,
            type: {
              select: {
                name: true,
              },
            },
          },
        });
        productByCategory.push({
          category: category.name,
          products: products,
        });
      }

      return res.status(200).json({ productByCategory: productByCategory });
    } catch (error) {
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async findById(id: number, res: Response) {
    try {
      const product = await this.prisma.product.findFirst({
        include: {
          category: true,
          type: true,
        },
        where: {
          id: id,
        },
      });
      if (product) {
        return res.status(200).json({ product: product });
      } else {
        return res.status(500).json({ message: 'Không tìm thấy sản phẩm' });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
    return null;
  }

  async getProductOverview(res: Response) {
    type ReponseDataType = {
      categoryCount: number;
      numberOfSellProduct: number;
      numberOfProduct: number;
      revenueLast7Day: number;
      bestSellingProduct: string;
    };
    try {
      const categoryCount = await this.prisma.category.count();
      const numberOfSellProduct = await this.prisma.product.count({
        where: {
          status: true,
        },
      });

      const numberOfProduct = await this.prisma.product.count();

      // Get first and last date of last 7 day
      const today = new Date();
      today.setHours(today.getHours() + 7);
      const currentDate = today.toISOString().split('T')[0];
      today.setDate(today.getDate() - 6);
      const Previos7Date = today.toISOString().split('T')[0];

      const orderAggregation = await this.prisma.statisticsByDay.aggregate({
        _sum: {
          revenue: true,
        },
        where: {
          statistics_date: {
            gte: new Date(Previos7Date),
            lte: new Date(currentDate),
          },
        },
      });

      // Convert BigInt to Number
      const revenueLast7Day = Number(orderAggregation._sum.revenue);

      const productGroupBy = await this.prisma.productStatistics.groupBy({
        by: 'product_id',
        where: {
          sale_date: {
            gte: new Date(Previos7Date),
            lte: new Date(currentDate),
          },
        },
        _sum: {
          sold: true,
          revenue: true,
        },
      });

      const productAggregation = productGroupBy.map((item) => {
        return {
          productId: item.product_id,
          revenue: item._sum.revenue,
          sold: item._sum.sold,
        };
      });

      const productAggregationSort = productAggregation.sort((a, b) => {
        if (a.revenue > b.revenue) return -1;
        if (a.revenue < b.revenue) return 1;
        if (a.sold > b.sold) return -1;
        if (a.sold < b.sold) return 1;
        return 0;
      });

      let bestSellingProduct = '';

      if (productAggregationSort && productAggregationSort.length !== 0) {
        const product = await this.prisma.product.findUnique({
          where: {
            id: productAggregationSort[0].productId,
          },
          select: {
            name: true,
          },
        });
        bestSellingProduct = product.name;
      }

      const responseData: ReponseDataType = {
        categoryCount: categoryCount,
        numberOfSellProduct: numberOfSellProduct,
        numberOfProduct: numberOfProduct,
        revenueLast7Day: revenueLast7Day,
        bestSellingProduct: bestSellingProduct,
      };

      return res.status(200).json({ data: responseData });
    } catch (error) {
      console.log(error);
      return { message: 'error' };
    }
  }

  async create(
    dto: CreateProductDto,
    image: Express.Multer.File,
    req: CustomRequest,
    res: Response,
  ) {
    let uploadFromBuffer = (buffer, id) => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        let cld_upload_stream = cloudinary.uploader.upload_stream(
          {
            folder: 'CozyCoffeeCup/Products',
            public_id: `CozyCoffeeCup/Products/${id}`,
          },
          (error: any, result: any) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          },
        );

        streamifier.createReadStream(buffer).pipe(cld_upload_stream);
      });
    };

    try {
      await this.prisma.$transaction(
        async (tx) => {
          const { id } = req.user;
          if (
            await tx.product.findFirst({
              where: {
                name: dto.name,
              },
            })
          ) {
            return res.status(500).json({ message: 'Tên sản phẩm đã tồn tại' });
          }
          const product = await tx.product.create({
            data: {
              name: dto.name,
              price: parseInt(dto.price),
              category_id: parseInt(dto.category_id),
              type_id: parseInt(dto.type_id),
              description: dto.description,
              note: dto.note,
              image: null,
            },
          });
          if (image && image.buffer !== null) {
            let result = await uploadFromBuffer(image.buffer, product.id);
            const finalProduct = await tx.product.update({
              where: {
                id: product.id,
              },
              data: {
                image: result.url,
              },
            });
            return res.status(200).json({
              messsage: 'Thêm thành công',
              imageURL: finalProduct.image,
            });
          }
          return res.status(200).json({ messsage: 'Thêm thành công' });
        },
        { timeout: 30 * 1000, maxWait: 10 * 1000 },
      );
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại' });
    }
  }

  async update(
    dto: UpdateProductDto,
    image: Express.Multer.File,
    req: CustomRequest,
    res: Response,
  ) {
    let uploadFromBuffer = (buffer, id) => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        let cld_upload_stream = cloudinary.uploader.upload_stream(
          {
            folder: 'CozyCoffeeCup/Products',
            public_id: `CozyCoffeeCup/Products/${id}`,
          },
          (error: any, result: any) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          },
        );

        streamifier.createReadStream(buffer).pipe(cld_upload_stream);
      });
    };

    try {
      await this.prisma.$transaction(
        async (tx) => {
          // const { id } = req.user;
          const product = await tx.product.findFirst({
            where: {
              id: parseInt(dto.id),
            },
          });

          if (dto.name && product.name !== dto.name) {
            const existsProduct = await this.prisma.product.findFirst({
              where: {
                name: dto.name,
              },
            });
            if (existsProduct)
              return res
                .status(500)
                .json({ message: 'Tên sản phẩm đã tồn tại' });
          }
          await tx.product.update({
            data: {
              name: dto.name,
              price: parseInt(dto.price),
              category_id: parseInt(dto.category_id),
              type_id: parseInt(dto.type_id),
              description: dto.description,
              note: dto.note,
              status: dto.status === 'true',
              discount: parseInt(dto.discount),
            },
            where: {
              id: parseInt(dto.id),
            },
          });
          if (image !== undefined && image.buffer !== null) {
            await cloudinary.uploader.destroy(
              `CozyCoffeeCup/Products/CozyCoffeeCup/Products/${dto.id}`,
            );
            let result = await uploadFromBuffer(image.buffer, product.id);
            const finalProduct = await tx.product.update({
              where: {
                id: product.id,
              },
              data: {
                image: result.url,
              },
            });
            return res.status(200).json({
              message: 'Cập nhật thành công',
              imageURL: finalProduct.image,
            });
          }
          return res.status(200).json({ message: 'Cập nhật thành công' });
        },
        { timeout: 30 * 1000, maxWait: 10 * 1000 },
      );
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại' });
    }
  }

  async getOption(query: string, res: Response) {
    try {
      let whereCondition = {};
      if (query) {
        whereCondition = {
          title: {
            contains: query,
          },
          ...whereCondition,
        };
      }
      const options = await this.prisma.productOptionDefination.findMany({
        select: {
          id: true,
          title: true,
          values: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
        where: { ...whereCondition },
      });
      return res.status(200).json({ options: options });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async getOptionById(id: number, res: Response) {
    try {
      const option = await this.prisma.productOptionDefination.findFirst({
        where: { id: id },
        select: {
          id: true,
          title: true,
          required: true,
          allows_multiple: true,
          values: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });
      return res.status(200).json({ option: option });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async createOption(dto: CreateOptionDto, res: Response) {
    try {
      await this.prisma.productOptionDefination.create({
        data: {
          title: dto.title,
          required: dto.required,
          allows_multiple: dto.allows_multiple,
          values: {
            create: dto.values,
          },
        },
      });
      return res.status(200).json({ message: 'Thêm thành công' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async updateOption(dto: UpdateOptionDto, res: Response) {
    try {
      await this.prisma.productOptionDefination.update({
        where: {
          id: dto.id,
        },
        data: {
          required: dto.required,
          allows_multiple: dto.allows_multiple,
          title: dto.title,
        },
      });
      return res.status(200).json({ message: 'Cập nhật thành công' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async updateProductOption(dto: UpdateProductOptionDto, res: Response) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.productOption.deleteMany({
          where: {
            product_id: dto.product_id,
            product_option_value: {},
          },
        });

        for (let option of dto.options) {
          const productOption = await tx.productOption.create({
            data: {
              option_id: option.option_id,
              product_id: dto.product_id,
            },
          });

          const valueData = option.values.map((value) => {
            return {
              option_value_id: value,
              product_option_id: productOption.id,
            };
          });
          await tx.productOptionValue.createMany({
            data: valueData,
          });
        }
      });

      return res.status(200).json({ message: 'Cập nhật thành công' });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại' });
    }
  }

  async getProductOption(product_id: number, res: Response) {
    try {
      const product = await this.prisma.product.findFirst({
        where: { id: product_id },
      });

      if (product) {
        const options = await this.prisma.productOption.findMany({
          where: {
            product_id: product_id,
          },
          select: {
            defination_option: {
              select: {
                id: true,
                title: true,
                required: true,
                allows_multiple: true,
              },
            },
            product_option_value: {
              select: {
                defination_option_value: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
        });
        const responseData = options.map((x) => {
          const valueArray = x.product_option_value.map((y) => {
            return {
              id: y.defination_option_value.id,
              name: y.defination_option_value.name,
              price: y.defination_option_value.price,
            };
          });
          return {
            id: x.defination_option.id,
            title: x.defination_option.title,
            required: x.defination_option.required,
            allows_multiple: x.defination_option.allows_multiple,
            values: valueArray.sort((a, b) => {
              if (a.price === b.price) return 0;
              if (a.price > b.price) return 1;
              return -1;
            }),
          };
        });

        const sortData = responseData.sort((a, b) => {
          return a.required === b.required ? 0 : a.required ? -1 : 1;
        });
        return res.status(200).json({ options: sortData });
      }
      return res.status(400).json({ message: 'Không có id sản phẩm' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async getCategory(query: string, res: Response) {
    try {
      let whereCondition = {};
      if (query) {
        whereCondition = {
          name: {
            contains: query,
          },
          ...whereCondition,
        };
      }
      const categories = await this.prisma.category.findMany({
        where: { ...whereCondition },
        orderBy: {
          id: 'asc',
        },
      });
      return res.status(200).json({ categories: categories });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async createCategory(dto: CreateCategoryDto, res: Response) {
    try {
      if (
        await this.prisma.category.findFirst({
          where: {
            name: dto.name,
          },
        })
      ) {
        return res
          .status(500)
          .json({ message: `Tên danh mục ${dto.name} đã tồn tại` });
      }

      const category = await this.prisma.category.create({
        data: {
          name: dto.name,
        },
      });

      if (category) {
        return res.status(200).json({ message: 'Thêm danh mục thành công' });
      }

      return res
        .status(500)
        .json({ message: 'Thêm danh mục không thành công' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã xảy ra lỗi' });
    }
  }

  async updateCategory(dto: UpdateCategoryDto, res: Response) {
    try {
      if (
        await this.prisma.category.findFirst({
          where: {
            name: dto.name,
          },
        })
      ) {
        return res
          .status(500)
          .json({ message: `Tên danh mục ${dto.name} đã tồn tại` });
      }

      const category = await this.prisma.category.update({
        data: {
          name: dto.name,
        },
        where: {
          id: dto.id,
        },
      });

      if (category) {
        return res.status(200).json({ message: 'Cập nhật thành công' });
      }

      return res.status(500).json({ message: 'Cập nhật không thành công' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã xảy ra lỗi' });
    }
  }

  async deleteCategory(id: number, res: Response) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.product.updateMany({
          data: {
            category_id: null,
          },
          where: {
            category_id: id,
          },
        });

        await tx.category.delete({
          where: { id: id },
        });

        return res.status(200).json('Xóa danh mục thành công');
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async getType(query: string, res: Response) {
    try {
      let whereCondition = {};
      if (query) {
        whereCondition = {
          name: {
            contains: query,
          },
          ...whereCondition,
        };
      }

      const types = await this.prisma.productType.findMany({
        where: { ...whereCondition },
        orderBy: {
          id: 'asc',
        },
      });

      return res.status(200).json({ types: types });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async createType(dto: CreateProductTypeDto, res: Response) {
    try {
      if (
        await this.prisma.productType.findFirst({
          where: {
            name: dto.name,
          },
        })
      ) {
        return res.status(500).json({ message: 'Tên đã tồn tại' });
      }

      await this.prisma.productType.create({
        data: {
          name: dto.name,
        },
      });

      return res.status(200).json({ message: 'Thêm thành công' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async updateType(dto: UpdateProductTypeDto, res: Response) {
    try {
      if (
        await this.prisma.productType.findFirst({
          where: {
            name: dto.name,
          },
        })
      ) {
        return res.status(500).json({ message: `Tên ${dto.name} đã tồn tại` });
      }

      const type = await this.prisma.productType.update({
        data: {
          name: dto.name,
        },
        where: {
          id: dto.id,
        },
      });

      if (type) {
        return res.status(200).json({ message: 'Cập nhật thành công' });
      }

      return res.status(500).json({ message: 'Cập nhật không thành công' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã xảy ra lỗi' });
    }
  }

  async deleteType(id: number, res: Response) {
    try {
      if (
        await this.prisma.product.findFirst({
          where: {
            type_id: id,
          },
        })
      ) {
        return res
          .status(500)
          .json({ message: 'Không thể xóa do có sản phẩm thuộc loại này' });
      }

      await this.prisma.productType.delete({
        where: {
          id: id,
        },
      });

      return res.status(200).json({ message: 'Đã xóa thành công' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã xảy ra lỗi' });
    }
  }
}
