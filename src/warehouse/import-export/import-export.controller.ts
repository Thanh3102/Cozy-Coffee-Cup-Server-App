import { CustomRequest } from 'src/utils/interface';
import { CreateExportNoteDto, CreateImportNoteDto } from './dtos';
import { ImportExportService } from './import-export.service';
import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Controller('/api/import-export')
@UseGuards(AuthGuard)
export class ImportExportController {
  constructor(private importExportService: ImportExportService) {}
  @Post('/createImportNote')
  createImport(
    @Body() dto: CreateImportNoteDto,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    return this.importExportService.createImportNote(dto, req, res);
  }

  @Post('/createExportNote')
  createExport(
    @Body() dto: CreateExportNoteDto,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    return this.importExportService.createExportNote(dto, req, res);
  }
}
