import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import {
  CreateAccountDto,
  CreateRoleDto,
  UpdateAccountDto,
  UpdateRoleDto,
} from 'src/dtos/user.dto';
import { CustomRequest } from 'src/utils/interface';
import { PermissionsGuard } from 'src/guards/permissions/permissions.guard';
import { Permission } from 'src/utils/enum';
import { Permissions } from 'src/decorator/permissions.decorator';

@UseGuards(AuthGuard)
@Controller('api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Account_View)
  @Get('/getAll')
  getAll(@Res() res: Response) {
    return this.userService.getAll(res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Account_View)
  @Get('/getAccountDetail')
  getAccountDetail(@Query('id') id: string, @Res() res: Response) {
    return this.userService.getAccountDetail(id, res);
  }

  @Get('/getAllPermissions')
  getAllPermissions(@Res() res: Response) {
    return this.userService.getAllPermission(res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Account_View)
  @Get('/getAllRoles')
  getAllRoles(@Res() res: Response) {
    return this.userService.getAllRoles(res);
  }

  @Get('/getRolePermission')
  getRolePermission(@Query('id') id, @Res() res: Response) {
    return this.userService.getRolePermission(id, res);
  }

  @Get('/getAccountPermissions')
  getAccountPermissions(@Query('id') id: string, @Res() res: Response) {
    return this.userService.getAccountPermissions(id, res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Account_Role_Create)
  @Post('/createRole')
  createRole(
    @Body() dto: CreateRoleDto,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    return this.userService.createRole(dto, req, res);
  }

  @UseGuards(PermissionsGuard)
  @Post('/updateRole')
  updateRole(
    @Body() dto: UpdateRoleDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.userService.updateRole(dto, req, res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Account_Role_Edit)
  @Delete('/deleteRole')
  deleteRole(@Query('id') id: string, @Res() res: Response) {
    return this.userService.deleteRole(id, res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Account_Create)
  @Post('/createAccount')
  createAccount(@Body() dto: CreateAccountDto, @Res() res: Response) {
    return this.userService.createAccount(dto, res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Account_Edit)
  @Post('/updateAccount')
  updateAccount(@Body() dto: UpdateAccountDto, @Res() res: Response) {
    return this.userService.updateAccount(dto, res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Account_Edit)
  @Delete('/deleteAccount')
  deleteAccount(@Query('id') id: string, @Res() res: Response) {
    return this.userService.deleteAccount(id, res);
  }
  
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Account_Edit)
  @Post('/resetPassword')
  resetPassword(@Query('id') id: string, @Res() res: Response) {
    return this.userService.resetPassword(id, res);
  }
}
