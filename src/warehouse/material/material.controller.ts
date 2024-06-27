import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { MaterialService } from './material.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { CustomRequest } from 'src/utils/interface';
import {
  AddMaterialDto,
  CreateUnitDto,
  UpdateMaterialDto,
  UpdateUnitDto,
} from '../../dtos/material.dtos';
import { Permissions } from 'src/decorator/permissions.decorator';
import { Permission } from 'src/utils/enum';
import { PermissionsGuard } from 'src/guards/permissions/permissions.guard';

@Controller('/api/material')
@UseGuards(AuthGuard)
export class MaterialController {
  constructor(private materialService: MaterialService) {}

  @Permissions(Permission.Warehouse_View)
  @UseGuards(PermissionsGuard)
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

  @Permissions(Permission.Warehouse_View)
  @UseGuards(PermissionsGuard)
  @Get('/getAllActive')
  getAllActive(@Req() req: CustomRequest, @Res() res: Response) {
    return this.materialService.getAllActive(res);
  }

  @Get('/getUnits')
  getUnits(@Res() res: Response, @Query('q') query: string) {
    return this.materialService.getUnits(query, res);
  }

  @Permissions(Permission.Definition_Create)
  @UseGuards(PermissionsGuard)
  @Post('/createUnit')
  createUnit(@Body() dto: CreateUnitDto, @Res() res: Response) {
    return this.materialService.createUnit(dto, res);
  }

  @Permissions(Permission.Definition_Edit)
  @UseGuards(PermissionsGuard)
  @Post('updateUnit')
  updateUnit(@Body() dto: UpdateUnitDto, @Res() res: Response) {
    return this.materialService.updateUnit(dto, res);
  }

  @Permissions(Permission.Definition_Edit)
  @UseGuards(PermissionsGuard)
  @Delete('/deleteUnit')
  deleteUnit(@Query('id') id: string, @Res() res: Response) {
    return this.materialService.deleteUnit(parseInt(id), res);
  }

  @Permissions(Permission.Warehouse_Material_Create)
  @UseGuards(PermissionsGuard)
  @Post('/addMaterial')
  addMaterial(
    @Body() dto: AddMaterialDto,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    return this.materialService.addMaterial(dto, req.user.id, res);
  }

  @Permissions(Permission.Warehouse_Material_Edit)
  @UseGuards(PermissionsGuard)
  @Post('/updateMaterial')
  updateMaterial(
    @Body() dto: UpdateMaterialDto,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    return this.materialService.updateMaterial(dto, req, res);
  }

  @Permissions(Permission.Warehouse_View)
  @UseGuards(PermissionsGuard)
  @Get('/search')
  search(@Query('q') keyword: string, @Res() res: Response) {
    return this.materialService.search(keyword, res);
  }
}
