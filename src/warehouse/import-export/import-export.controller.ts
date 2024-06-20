import { CustomRequest } from 'src/utils/interface';
import { CreateExportNoteDto, CreateImportNoteDto } from '../../dtos/import_export.dtos';
import { ImportExportService } from './import-export.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
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

  @Get('/getByFilter')
  getByFilter(
    @Res() res: Response,
    @Query('type') type,
    @Query('start') start,
    @Query('end') end,
    @Query('name') name,
  ) {
    return this.importExportService.getByFilter(res, {
      type: type,
      start: start,
      end: end,
      creater_name: name,
    });
  }

  @Get('/getImportNoteDetail')
  getImportNoteDetail(@Res() res: Response, @Query('id') id) {
    return this.importExportService.getImportNoteDetail(id, res);
  }

  @Get('/getExportNoteDetail')
  getExportNoteDetail(@Res() res: Response, @Query('id') id) {
    return this.importExportService.getExportNoteDetail(id, res);
  }

  @Post('/deleteImportNote')
  deleteImportNote(@Res() res: Response, @Query('id') id) {
    return this.importExportService.deleteImportNote(id, res);
  }

  @Post('/deleteExportNote')
  deleteExportNote(@Res() res: Response, @Query('id') id) {
    return this.importExportService.deleteExportNote(id, res);
  }

  @Get('/exportImportNoteExcel')
  exportImportNoteExcel(@Res() res: Response, @Query('id') id) {
    return this.importExportService.exportImportNoteExcel(res, parseInt(id));
  }

  @Get('/exportExportNoteExcel')
  exportExportNoteExcel(@Res() res: Response, @Query('id') id) {
    return this.importExportService.exportExportNoteExcel(res, parseInt(id));
  }
}
