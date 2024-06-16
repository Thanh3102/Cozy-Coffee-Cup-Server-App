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
import { Request, Response } from 'express';
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
} from './dtos';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { CustomRequest } from 'src/utils/interface';

@Controller('/api/product')
@UseGuards(AuthGuard)
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get('/getAll')
  getAll(@Res() res: Response) {
    return this.productService.getAll(res);
  }

  @Get('/getAllByCategory')
  getAllByCategory(@Res() res: Response) {
    return this.productService.getAllByCategory(res);
  }

  @Get('findById')
  findById(@Query('id') id: string, @Res() res: Response) {
    return this.productService.findById(parseInt(id), res);
  }

  @Get('/getProductOverview')
  getProductOverview(@Res() res: Response) {
    return this.productService.getProductOverview(res);
  }

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

  @Post('/createCategory')
  createCategory(@Body() dto: CreateCategoryDto, @Res() res: Response) {
    return this.productService.createCategory(dto, res);
  }

  @Post('/updateCategory')
  updateCategory(@Body() dto: UpdateCategoryDto, @Res() res: Response) {
    return this.productService.updateCategory(dto, res);
  }

  @Delete('/deleteCategory')
  deleteCategory(@Query('id') id: string, @Res() res: Response) {
    return this.productService.deleteCategory(parseInt(id), res);
  }

  @Get('/getOption')
  getOption(@Query('q') query: string, @Res() res: Response) {
    return this.productService.getOption(query, res);
  }

  @Get('/getOptionById')
  getOptionById(@Query('id') id: string, @Res() res: Response) {
    return this.productService.getOptionById(parseInt(id), res);
  }

  @Post('/createOption')
  createOption(@Body() dto: CreateOptionDto, @Res() res: Response) {
    return this.productService.createOption(dto, res);
  }

  @Post('/updateOption')
  updateOption(@Body() dto: UpdateOptionDto, @Res() res: Response) {
    return this.productService.updateOption(dto, res);
  }

  @Get('/getProductOption')
  getProductOption(@Query('id') id: string, @Res() res: Response) {
    return this.productService.getProductOption(parseInt(id), res);
  }

  @Post('/updateProductOption')
  updateProductOption(
    @Body() dto: UpdateProductOptionDto,
    @Res() res: Response,
  ) {
    return this.productService.updateProductOption(dto, res);
  }

  @Get('/getType')
  getType(@Query('q') query: string, @Res() res: Response) {
    return this.productService.getType(query, res);
  }

  @Post('/createType')
  createType(@Body() dto: CreateProductTypeDto, @Res() res: Response) {
    return this.productService.createType(dto, res);
  }

  @Post('/updateType')
  updateType(@Body() dto: UpdateProductTypeDto, @Res() res: Response) {
    return this.productService.updateType(dto, res);
  }

  @Delete('/deleteType')
  deleteType(@Query('id') id: string, @Res() res: Response) {
    return this.productService.deleteType(parseInt(id), res);
  }
}
