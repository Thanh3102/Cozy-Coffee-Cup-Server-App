import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomRequest } from 'src/utils/interface';
import { AddMaterialDto, UpdateMaterialDto } from 'src/utils/types';

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

  async getUnits(res: Response) {
    const units = await this.prisma.unit.findMany();
    return res.status(200).json({ data: units });
  }

  async addMaterial(dto: AddMaterialDto, user_id: string, res: Response) {
    const addedMaterial = await this.prisma.material.create({
      data: {
        name: dto.name,
        expiration_date: dto.expiration_date ? dto.expiration_date : null,
        stock_quantity: dto.stock_quantity,
        unit_id: dto.unit_id,
        created_by: user_id,
        last_updated_by: user_id,
      },
    });
    if (addedMaterial) {
      console.log('Add success');
      return res.status(200).json({ data: { addedMaterial } });
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
          last_updated_by: user_id,
          active: dto.active,
        },
        where: {
          id: dto.id,
        },
      });
      if (material) {
        return res.status(200).json({ data: { material } });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async search(keyword: string, res: Response) {
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
  }
}
