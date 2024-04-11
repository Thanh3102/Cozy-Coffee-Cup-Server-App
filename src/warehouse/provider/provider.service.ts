import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomRequest } from 'src/utils/interface';
import { CreateProviderDto, UpdateProviderDto } from 'src/utils/types';

@Injectable()
export class ProviderService {
  constructor(private prisma: PrismaService) {}
  async getAll(res: Response) {
    const providers = await this.prisma.provider.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return res.status(200).json({ providers: providers });
  }

  async getAllActive(res: Response) {
    const providers = await this.prisma.provider.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        active: true,
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
    return res.status(200).json({ providers: providers });
  }

  async create(dto: CreateProviderDto, req: CustomRequest, res: Response) {
    const { id } = req.user;
    const createdProvider = await this.prisma.provider.create({
      data: {
        name: dto.name,
        address: dto.address,
        phone: dto.phone ? dto.phone : null,
        email: dto.email ? dto.email : null,
        last_updated_by: id,
        created_by: id,
      },
    });

    if (createdProvider) {
      return res.status(200).json({ data: createdProvider });
    }
  }

  async update(dto: UpdateProviderDto, req: CustomRequest, res: Response) {
    const { id } = req.user;

    const updatedProvider = await this.prisma.provider.update({
      data: {
        name: dto.name,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        active: dto.active,
        last_updated_by: id,
      },
      where: {
        id: dto.id,
      },
    });

    if (updatedProvider) {
      return res.status(200).json({
        message: 'Cập nhật thành công',
        updatedProvider: updatedProvider,
      });
    }
  }
}
