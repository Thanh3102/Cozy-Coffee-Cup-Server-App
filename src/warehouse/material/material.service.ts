import { Injectable } from '@nestjs/common';
import { contains } from 'class-validator';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomRequest } from 'src/utils/interface';
import {
  AddMaterialDto,
  CreateUnitDto,
  UpdateMaterialDto,
  UpdateUnitDto,
} from 'src/utils/types';

@Injectable()
export class MaterialService {
  constructor(private prisma: PrismaService) {}
  async getAll(res: Response, page: number, itemPerPage: number) {
    try {
      if (page && itemPerPage) {
        const count = await this.prisma.material.count();
        var skip = page === 1 ? 0 : page * itemPerPage;

        if (skip >= count) {
          skip = (page - 1) * itemPerPage;
        }

        const materials = await this.prisma.material.findMany({
          select: {
            id: true,
            name: true,
            stock_quantity: true,
            expiration_date: true,
            min_stock: true,
            latest_export_date: true,
            latest_import_date: true,
            unit: true,
            active: true,
          },
          orderBy: {
            name: 'asc',
          },
          skip: skip,
          take: itemPerPage,
        });
        return res.status(200).json({ data: materials, count: count });
      }
      const materials = await this.prisma.material.findMany({
        select: {
          id: true,
          name: true,
          stock_quantity: true,
          expiration_date: true,
          latest_export_date: true,
          latest_import_date: true,
          unit: true,
          active: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
      return res.status(200).json({ data: materials });
    } catch (error) {
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async getAllActive(res: Response) {
    const materials = await this.prisma.material.findMany({
      select: {
        id: true,
        name: true,
        stock_quantity: true,
        expiration_date: true,
        latest_export_date: true,
        latest_import_date: true,
        unit: true,
      },
      orderBy: {
        name: 'asc',
      },
      where: {
        active: {
          equals: true,
        },
      },
    });
    return res.status(200).json({ data: materials });
  }

  async getUnits(query: string, res: Response) {
    let whereCondition = {};
    if (query) {
      whereCondition = {
        OR: [
          {
            name: {
              contains: query ?? undefined,
            },
          },
          {
            short: {
              contains: query ?? undefined,
            },
          },
        ],
        ...whereCondition,
      };
    }
    const units = await this.prisma.unit.findMany({
      where: {
        ...whereCondition,
      },
    });
    return res.status(200).json({ data: units });
  }

  async updateUnit(dto: UpdateUnitDto, res: Response) {
    try {
      await this.prisma.unit.update({
        where: {
          id: dto.id,
        },
        data: {
          name: dto.name,
          short: dto.short ?? null,
        },
      });
      return res.status(200).json({ message: 'Cập nhật thành công' });
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async deleteUnit(id: number, res: Response) {
    try {
      const material = await this.prisma.material.findFirst({
        where: {
          unit_id: id,
        },
      });

      if (material) {
        return res
          .status(500)
          .json({ message: 'Không thể xóa do đơn vị đang được sử dụng' });
      }

      await this.prisma.unit.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Xóa thành công' });
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async createUnit(dto: CreateUnitDto, res: Response) {
    try {
      const unit = await this.prisma.unit.create({
        data: {
          name: dto.name,
          short: dto.short,
        },
      });
      if (unit) {
        return res.status(200).json({ message: 'Thêm thành công' });
      }
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async addMaterial(dto: AddMaterialDto, user_id: string, res: Response) {
    try {
      const addedMaterial = await this.prisma.material.create({
        data: {
          name: dto.name,
          expiration_date: dto.expiration_date ? dto.expiration_date : null,
          stock_quantity: dto.stock_quantity,
          min_stock: dto.min_stock,
          unit_id: dto.unit_id,
          created_by: user_id,
          last_updated_by: user_id,
        },
      });
      return res.status(200).json({ message: 'Thêm thành công' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async updateMaterial(
    dto: UpdateMaterialDto,
    req: CustomRequest,
    res: Response,
  ) {
    const user_id = req.user.id;
    try {
      const material = await this.prisma.material.update({
        data: {
          name: dto.name,
          expiration_date: dto.expiration_date,
          stock_quantity: dto.stock_quantity,
          unit_id: dto.unit_id,
          min_stock: dto.min_stock,
          last_updated_by: user_id,
          active: dto.active,
        },
        where: {
          id: dto.id,
        },
      });
      if (material) {
        return res.status(200).json({ message: 'Lưu thành công' });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async search(keyword: string, res: Response) {
    try {
      const materials = await this.prisma.material.findMany({
        select: {
          id: true,
          name: true,
          stock_quantity: true,
          expiration_date: true,
          latest_export_date: true,
          latest_import_date: true,
          unit: true,
          active: true,
        },
        orderBy: {
          name: 'asc',
        },
        where: {
          name: {
            contains: keyword,
          },
        },
      });
      return res.status(200).json({ materials: materials });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async getRunOutMaterial(res: Response) {
    try {
      type RunOutMaterial = {
        id: number;
        name: string;
        stock_quantity: number;
        unit: string;
      };
      const runOutMaterials: RunOutMaterial[] = [];
      const materials = await this.prisma.material.findMany({
        select: {
          id: true,
          name: true,
          stock_quantity: true,
          min_stock: true,
          unit: {
            select: {
              name: true,
            },
          },
        },
      });

      materials.forEach((material) => {
        if (material.stock_quantity <= material.min_stock) {
          runOutMaterials.push({
            id: material.id,
            name: material.name,
            stock_quantity: material.stock_quantity,
            unit: material.unit.name,
          });
        }
      });

      return res.status(200).json({ materials: runOutMaterials });
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Không thể lấy dữ liệu nguyên liệu sắp hết' });
    }
  }
}
