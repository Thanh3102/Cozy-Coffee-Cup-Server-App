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

@Controller('/api/provider')
@UseGuards(AuthGuard)
export class ProviderController {
  constructor(private providerService: ProviderService) {}
  @Get('/getAll')
  getAll(@Res() res: Response) {
    return this.providerService.getAll(res);
  }

  @Get('/getAllActive')
  getAllActive(@Res() res: Response) {
    return this.providerService.getAllActive(res);
  }

  @Post('/create')
  createProvider(
    @Body() dto: CreateProviderDto,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    return this.providerService.create(dto, req, res);
  }

  @Post('update')
  updateProvider(
    @Body() dto: UpdateProviderDto,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    return this.providerService.update(dto, req, res);
  }
}
