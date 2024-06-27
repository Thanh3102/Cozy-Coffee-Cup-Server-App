import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProviderService } from './provider.service';
import { Request, Response } from 'express';
import { CreateProviderDto, UpdateProviderDto } from '../../dtos/provider.dtos';
import { CustomRequest } from 'src/utils/interface';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { PermissionsGuard } from 'src/guards/permissions/permissions.guard';
import { Permissions } from 'src/decorator/permissions.decorator';
import { Permission } from 'src/utils/enum';

@Controller('/api/provider')
@UseGuards(AuthGuard)
export class ProviderController {
  constructor(private providerService: ProviderService) {}

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Warehouse_View)
  @Get('/getAll')
  getAll(@Res() res: Response) {
    return this.providerService.getAll(res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Warehouse_View)
  @Get('/getAllActive')
  getAllActive(@Res() res: Response) {
    return this.providerService.getAllActive(res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Warehouse_Provider_Create)
  @Post('/create')
  createProvider(
    @Body() dto: CreateProviderDto,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    return this.providerService.create(dto, req, res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Warehouse_Provider_Edit)
  @Post('update')
  updateProvider(
    @Body() dto: UpdateProviderDto,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    return this.providerService.update(dto, req, res);
  }
}
