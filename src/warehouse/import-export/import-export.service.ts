import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Workbook } from 'exceljs';
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
          const addedNote = await tx.importNote.create({
            data: {
              provider_id: dto.provider_id,
              receiver_name: dto.receiver_name,
              created_by: userId,
              note: dto.note,
              total: dto.total,
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
          const addedNote = await tx.exportNote.create({
            data: {
              picker_name: dto.picker_name,
              created_by: userId,
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

  // async getAll(res: Response) {
  //   try {
  //     var responseData = [];

  //     const ImportNotes = await this.prisma.importNote.findMany({
  //       select: {
  //         id: true,
  //         created_at: true,
  //         user: {
  //           select: {
  //             name: true,
  //           },
  //         },
  //       },
  //       where: {
  //         active: true,
  //       },
  //     });

  //     const ExportNotes = await this.prisma.exportNote.findMany({
  //       select: {
  //         id: true,
  //         created_at: true,
  //         user: {
  //           select: {
  //             name: true,
  //           },
  //         },
  //       },
  //       where: {
  //         active: true,
  //       },
  //     });

  //     for (let item of ImportNotes) {
  //       responseData.push({
  //         type: 'Nhập kho',
  //         ...item,
  //       });
  //     }

  //     for (let item of ExportNotes) {
  //       responseData.push({
  //         type: 'Xuất kho',
  //         ...item,
  //       });
  //     }

  //     responseData.sort((a, b) => {
  //       if (a.created_at < b.created_at) {
  //         return 1;
  //       }
  //       if (a.created_at > b.created_at) {
  //         return -1;
  //       }
  //       return 0;
  //     });

  //     return res.status(200).json({ data: responseData });
  //   } catch (error) {
  //     console.log(error);

  //     return res.status(500).json({ message: 'Đã xảy ra lỗi' });
  //   }
  // }

  async getByFilter(res: Response, { type, start, end, creater_name }) {
    let ImportNotes = [];
    let ExportNotes = [];
    let responseData = [];
    switch (type) {
      case 'import':
        ImportNotes = await this.getImportNoteByFilter(
          start,
          end,
          creater_name,
        );
        break;
      case 'export':
        ExportNotes = await this.getExportNoteByFilter(
          start,
          end,
          creater_name,
        );
        break;
      default:
        ImportNotes = await this.getImportNoteByFilter(
          start,
          end,
          creater_name,
        );
        ExportNotes = await this.getExportNoteByFilter(
          start,
          end,
          creater_name,
        );
    }

    try {
      for (let item of ImportNotes) {
        responseData.push({
          type: 'Nhập kho',
          ...item,
        });
      }

      for (let item of ExportNotes) {
        responseData.push({
          type: 'Xuất kho',
          ...item,
        });
      }

      responseData.sort((a, b) => {
        if (a.created_at < b.created_at) {
          return 1;
        }
        if (a.created_at > b.created_at) {
          return -1;
        }
        return 0;
      });

      return res.status(200).json({ data: responseData });
    } catch (error) {
      console.log(error);

      return res.status(500).json({ message: 'Đã xảy ra lỗi' });
    }
  }

  async getImportNoteDetail(id: string, res: Response) {
    try {
      const importNote = await this.prisma.importNote.findUnique({
        where: {
          id: parseInt(id),
        },
        select: {
          id: true,
          receiver_name: true,
          note: true,
          created_at: true,
          user: {
            select: {
              name: true,
            },
          },
          import_note_detail: {
            select: {
              price: true,
              quantity: true,
              material: {
                select: {
                  name: true,
                  unit: true,
                },
              },
            },
          },
          provider: {
            select: {
              name: true,
            },
          },
        },
      });
      if (importNote) {
        return res.status(200).json({ importNote: importNote });
      } else {
        return res.status(500).json({ message: 'Không tìm thấy' });
      }
    } catch (error) {
      console.log(error);

      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }
  async getExportNoteDetail(id: string, res: Response) {
    try {
      const exportNote = await this.prisma.exportNote.findUnique({
        where: {
          id: parseInt(id),
        },
        select: {
          id: true,
          picker_name: true,
          note: true,
          created_at: true,
          user: {
            select: {
              name: true,
            },
          },
          export_note_detail: {
            select: {
              quantity: true,
              material: {
                select: {
                  name: true,
                  unit: true,
                },
              },
            },
          },
        },
      });
      if (exportNote) {
        return res.status(200).json({ exportNote: exportNote });
      } else {
        return res.status(500).json({ message: 'Không tìm thấy' });
      }
    } catch (error) {
      console.log(error);

      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async deleteImportNote(id: string, res: Response) {
    try {
      const importNote = await this.prisma.importNote.update({
        data: {
          active: false,
        },
        where: {
          id: parseInt(id),
        },
      });
      if (importNote) {
        return res.status(200).json({ message: 'Đã xóa phiếu nhập kho' });
      }
    } catch (error) {
      console.log(error);

      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async deleteExportNote(id: string, res: Response) {
    try {
      const exportNote = await this.prisma.exportNote.update({
        data: {
          active: false,
        },
        where: {
          id: parseInt(id),
        },
      });
      if (exportNote) {
        return res.status(200).json({ message: 'Đã xóa phiếu xuất kho' });
      }
    } catch (error) {
      console.log(error);

      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  }

  async exportImportNoteExcel(res: Response, id: number) {
    const importNote = await this.prisma.importNote.findFirst({
      select: {
        id: true,
        created_at: true,
        receiver_name: true,
        user: {
          select: {
            name: true,
          },
        },
        provider: {
          select: {
            name: true,
          },
        },
        import_note_detail: {
          select: {
            material: {
              select: {
                name: true,
                unit: true,
              },
            },
            price: true,
            quantity: true,
          },
        },
      },
      where: {
        id: id,
      },
    });
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Phiếu nhập kho');
    sheet.mergeCells('A1:F1');
    sheet.mergeCells('A2:F2');
    sheet.mergeCells('A3:F3');
    sheet.mergeCells('A4:F4');
    sheet.mergeCells('A5:F5');
    sheet.getCell('A1').value = 'Thông tin phiếu nhập kho';
    sheet.getCell('A2').value = `Ngày tạo: ${importNote.created_at}`;
    sheet.getCell('A3').value = `Người nhập kho: ${importNote.receiver_name}`;
    sheet.getCell('A4').value = `Người tạo phiếu: ${importNote.user.name}`;
    sheet.getCell('A5').value = `Nhà cung cấp: ${importNote.provider.name}`;
    sheet.getCell('A1').alignment = { horizontal: 'center' };
    sheet.getCell('A1').font = {
      size: 14,
      bold: true,
    };
    sheet.addTable({
      name: 'Danh sách nguyên liệu',
      ref: 'A6',
      headerRow: true,
      totalsRow: true,
      style: {
        theme: 'TableStyleLight5',
      },
      columns: [
        { name: 'STT', totalsRowLabel: 'Tổng' },
        { name: 'Tên nguyên liệu', filterButton: true },
        { name: 'Giá tiền' },
        { name: 'Số lượng' },
        { name: 'Đơn vị tính' },
        { name: 'Tổng tiền', totalsRowFunction: 'sum' },
      ],
      rows: importNote.import_note_detail.map((item, index) => {
        return [
          index + 1,
          item.material.name,
          item.price,
          item.quantity,
          item.material.unit.name,
          item.quantity * item.price,
        ];
      }),
    });

    workbook.eachSheet((sheet) => {
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          // default styles
          if (!cell.font?.size) {
            cell.font = Object.assign(cell.font || {}, { size: 10 });
          }
          if (!cell.font?.name) {
            cell.font = Object.assign(cell.font || {}, {
              name: 'Times New Roman',
            });
          }
        });
      });
    });

    const filename = `ImportNote-${importNote.id}.xlsx`;

    res.set({
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'x-filename': filename,
    });
    await workbook.xlsx.write(res);
    return res.status(200);
  }

  async exportExportNoteExcel(res: Response, id: number) {
    const exportNote = await this.prisma.exportNote.findFirst({
      select: {
        id: true,
        created_at: true,
        picker_name: true,
        user: {
          select: {
            name: true,
          },
        },
        export_note_detail: {
          select: {
            material: {
              select: {
                name: true,
                unit: true,
              },
            },
            quantity: true,
          },
        },
      },
      where: {
        id: id,
      },
    });
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Phiếu xuất kho');
    sheet.mergeCells('A1:D1');
    sheet.mergeCells('A2:D2');
    sheet.mergeCells('A3:D3');
    sheet.mergeCells('A4:D4');
    sheet.getCell('A1').value = 'Thông tin phiếu xuất kho';
    sheet.getCell('A2').value = `Ngày tạo: ${exportNote.created_at}`;
    sheet.getCell('A3').value = `Người tạo phiếu: ${exportNote.user.name}`;
    sheet.getCell('A4').value = `Người lấy hàng: ${exportNote.picker_name}`;
    sheet.getCell('A1').alignment = { horizontal: 'center' };
    sheet.getCell('A1').font = {
      size: 14,
      bold: true,
    };
    sheet.addTable({
      name: 'Danh sách nguyên liệu',
      ref: 'A5',
      headerRow: true,
      style: {
        theme: 'TableStyleLight5',
      },
      columns: [
        { name: 'STT' },
        { name: 'Tên nguyên liệu', filterButton: true },
        { name: 'Số lượng' },
        { name: 'Đơn vị tính' },
      ],
      rows: exportNote.export_note_detail.map((item, index) => {
        return [
          index + 1,
          item.material.name,
          item.quantity,
          item.material.unit.name,
        ];
      }),
    });

    workbook.eachSheet((sheet) => {
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          // default styles
          if (!cell.font?.size) {
            cell.font = Object.assign(cell.font || {}, { size: 10 });
          }
          if (!cell.font?.name) {
            cell.font = Object.assign(cell.font || {}, {
              name: 'Times New Roman',
            });
          }
        });
      });
    });

    const filename = `ExportNote-${exportNote.id}.xlsx`;

    res.set({
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'x-filename': filename,
    });
    await workbook.xlsx.write(res);
    return res.status(200);
  }

  private async getImportNoteByFilter(start, end, creater_name) {
    const conditons: any = {
      active: true,
    };
    if (start) {
      conditons.created_at = {
        gte: new Date(start),
        ...conditons.created_at,
      };
    }
    if (end) {
      conditons.created_at = {
        lte: new Date(end),
        ...conditons.created_at,
      };
    }
    if (creater_name) {
      conditons.user = {
        name: {
          equals: creater_name,
        },
      };
    }

    return await this.prisma.importNote.findMany({
      where: conditons,
      select: {
        id: true,
        created_at: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  private async getExportNoteByFilter(start, end, creater_name) {
    const conditons: any = {
      active: true,
    };
    if (start) {
      conditons.created_at = {
        gte: new Date(start),
        ...conditons.created_at,
      };
    }
    if (end) {
      conditons.created_at = {
        lte: new Date(end),
        ...conditons.created_at,
      };
    }
    if (creater_name) {
      conditons.user = {
        name: {
          equals: creater_name,
        },
      };
    }

    return await this.prisma.exportNote.findMany({
      where: conditons,
      select: {
        id: true,
        created_at: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
