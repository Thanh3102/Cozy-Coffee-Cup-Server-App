import { Injectable } from '@nestjs/common';
import { Import_Note_Detail, Prisma } from '@prisma/client';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomRequest } from 'src/utils/interface';
import { CreateExportNoteDto, CreateImportNoteDto } from 'src/utils/types';

@Injectable()
export class ImportExportService {
  constructor(private prisma: PrismaService) {}
  async createImportNote(
    dto: CreateImportNoteDto,
    req: CustomRequest,
    res: Response,
  ) {
    const userId = req.user.id;
    const noteItem: {
      material_id: number;
      price: number;
      quantity: number;
    }[] = [];
    dto.import_note_detail.forEach((item) =>
      noteItem.push({
        material_id: item.material_id,
        price: item.price,
        quantity: item.quantity,
      }),
    );
    try {
      await this.prisma.$transaction(
        async (tx) => {
          const addedNote = await tx.import_Note.create({
            data: {
              provider_id: dto.provider_id,
              receiver_name: dto.receiver_name,
              create_by: userId,
              note: dto.note,
              import_note_detail: {
                create: noteItem,
              },
            },
          });

          for (const item of noteItem) {
            const material = await tx.material.update({
              where: {
                id: item.material_id,
              },
              data: {
                stock_quantity: {
                  increment: item.quantity,
                },
                latest_import_date: new Date(),
              },
            });
          }
          return res.status(200).json({ message: 'Add successfully' });
        },
        {
          maxWait: 5000, // default: 2000
          timeout: 10000, // default: 5000
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
        },
      );
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  async createExportNote(
    dto: CreateExportNoteDto,
    req: CustomRequest,
    res: Response,
  ) {
    const userId = req.user.id;
    const noteItem: {
      material_id: number;
      quantity: number;
    }[] = [];

    dto.export_note_detail.forEach((item) =>
      noteItem.push({
        material_id: item.material_id,
        quantity: item.quantity,
      }),
    );
    
    try {
      await this.prisma.$transaction(
        async (tx) => {
          const addedNote = await tx.export_Note.create({
            data: {
              picker_name: dto.picker_name,
              create_by: userId,
              note: dto.note,
              export_note_detail: {
                create: noteItem,
              },
            },
          });

          for (const item of noteItem) {
            const material = await tx.material.update({
              where: {
                id: item.material_id,
              },
              data: {
                stock_quantity: {
                  decrement: item.quantity,
                },
                latest_export_date: new Date(),
              },
            });
            if (material.stock_quantity < 0) {
              throw new Error(
                `${material.name} không còn đủ số lượng (Số lượng còn lại: ${material.stock_quantity + item.quantity})`,
              );
            }
          }
          return res.status(200).json({ message: 'Add successfully' });
        },
        {
          maxWait: 5000, // default: 2000
          timeout: 10000, // default: 5000
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
        },
      );
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
}
