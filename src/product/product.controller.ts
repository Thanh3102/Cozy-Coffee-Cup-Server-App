import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { ProductService } from './product.service';
import { Response } from 'express';
import {
  CreateCategoryDto,
  CreateOptionDto,
  CreateProductDto,
  CreateProductTypeDto,
  UpdateCategoryDto,
  UpdateOptionDto,
  UpdateProductDto,
  UpdateProductOptionDto,
  UpdateProductTypeDto,
} from '../dtos/product.dtos';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomRequest } from 'src/utils/interface';
import { PermissionsGuard } from 'src/guards/permissions/permissions.guard';
import { Permissions } from 'src/decorator/permissions.decorator';
import { Permission } from 'src/utils/enum';

@Controller('/api/product')
@UseGuards(AuthGuard)
export class ProductController {
  constructor(private productService: ProductService) {}

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Product_View)
  @Get('/getAll')
  getAll(@Res() res: Response) {
    return this.productService.getAll(res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Product_View)
  @Get('/getAllByCategory')
  getAllByCategory(@Res() res: Response) {
    return this.productService.getAllByCategory(res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Product_View)
  @Get('findById')
  findById(@Query('id') id: string, @Res() res: Response) {
    return this.productService.findById(parseInt(id), res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Product_View)
  @Get('/getProductOverview')
  getProductOverview(@Res() res: Response) {
    return this.productService.getProductOverview(res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Product_Edit)
  @UseInterceptors(FileInterceptor('image'))
  @Post('/create')
  create(
    @Body() dto: CreateProductDto,
    @UploadedFile() image: Express.Multer.File,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    return this.productService.create(dto, image, req, res);
  }

  @Permissions(Permission.Product_Edit)
  @UseGuards(PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Post('/update')
  update(
    @Body() dto: UpdateProductDto,
    @UploadedFile() image: Express.Multer.File,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    return this.productService.update(dto, image, req, res);
  }

  @Get('/getCategory')
  getCategory(@Query('q') query: string, @Res() res: Response) {
    return this.productService.getCategory(query, res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Definition_Create)
  @Post('/createCategory')
  createCategory(@Body() dto: CreateCategoryDto, @Res() res: Response) {
    return this.productService.createCategory(dto, res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Definition_Edit)
  @Post('/updateCategory')
  updateCategory(@Body() dto: UpdateCategoryDto, @Res() res: Response) {
    return this.productService.updateCategory(dto, res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Definition_Edit)
  @Delete('/deleteCategory')
  deleteCategory(@Query('id') id: string, @Res() res: Response) {
    return this.productService.deleteCategory(parseInt(id), res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Definition_View)
  @Get('/getOption')
  getOption(@Query('q') query: string, @Res() res: Response) {
    return this.productService.getOption(query, res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Definition_View)
  @Get('/getOptionById')
  getOptionById(@Query('id') id: string, @Res() res: Response) {
    return this.productService.getOptionById(parseInt(id), res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Definition_Edit)
  @Post('/createOption')
  createOption(@Body() dto: CreateOptionDto, @Res() res: Response) {
    return this.productService.createOption(dto, res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Definition_Edit)
  @Post('/updateOption')
  updateOption(@Body() dto: UpdateOptionDto, @Res() res: Response) {
    return this.productService.updateOption(dto, res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Product_View)
  @Get('/getProductOption')
  getProductOption(@Query('id') id: string, @Res() res: Response) {
    return this.productService.getProductOption(parseInt(id), res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Product_Edit)
  @Post('/updateProductOption')
  updateProductOption(
    @Body() dto: UpdateProductOptionDto,
    @Res() res: Response,
  ) {
    return this.productService.updateProductOption(dto, res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Definition_View)
  @Get('/getType')
  getType(@Query('q') query: string, @Res() res: Response) {
    return this.productService.getType(query, res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Definition_Edit)
  @Post('/createType')
  createType(@Body() dto: CreateProductTypeDto, @Res() res: Response) {
    return this.productService.createType(dto, res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Definition_Edit)
  @Post('/updateType')
  updateType(@Body() dto: UpdateProductTypeDto, @Res() res: Response) {
    return this.productService.updateType(dto, res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions(Permission.Definition_Edit)
  @Delete('/deleteType')
  deleteType(@Query('id') id: string, @Res() res: Response) {
    return this.productService.deleteType(parseInt(id), res);
  }
}
