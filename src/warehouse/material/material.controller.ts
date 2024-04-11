import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MaterialService } from './material.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { CustomRequest } from 'src/utils/interface';
import { AddMaterialDto, UpdateMaterialDto } from './dtos';

@Controller('/api/material')
@UseGuards(AuthGuard)
export class MaterialController {
  constructor(private materialService: MaterialService) {}

  @Get('/getAll')
  getAll(
    @Req() req: CustomRequest,
    @Res() res: Response,
    @Query('page') page,
    @Query('item') itemPerPage,
  ) {
    return this.materialService.getAll(
      res,
      parseInt(page),
      parseInt(itemPerPage),
    );
  }

  @Get('/getAllActive')
  getAllActive(@Req() req: CustomRequest, @Res() res: Response) {
    return this.materialService.getAllActive(res);
  }

  @Get('/getUnits')
  getUnits(@Res() res: Response) {
    return this.materialService.getUnits(res);
  }

  @Post('/addMaterial')
  addMaterial(
    @Body() dto: AddMaterialDto,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    return this.materialService.addMaterial(dto, req.user.id, res);
  }

  @Post('/updateMaterial')
  updateMaterial(
    @Body() dto: UpdateMaterialDto,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    return this.materialService.updateMaterial(dto, req, res);
  }

  @Get('/search')
  search(@Query('q') keyword: string, @Res() res: Response) {
    return this.materialService.search(keyword, res);
  }
}
