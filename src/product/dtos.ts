import { IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  price: string;
  @IsNotEmpty()
  type_id: string;
  @IsNotEmpty()
  category_id: string;
  description: string;
  note: string;
  image: File;
}

export class UpdateProductDto {
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  price: string;
  @IsNotEmpty()
  type_id: string;
  @IsNotEmpty()
  category_id: string;
  description: string;
  note: string;
  image: File;
  status: string;
  discount: string;
}

export class CreateOptionDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  required: boolean;
  @IsNotEmpty()
  allows_multiple: boolean;
  values: { name: string; price: number }[];
}
export class UpdateOptionDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  required: boolean;
  @IsNotEmpty()
  allows_multiple: boolean;
}

export class UpdateProductOptionDto {
  product_id: number;
  options: Array<{
    option_id: number;
    values: number[];
  }>;
}

export class CreateCategoryDto {
  @IsNotEmpty()
  name: string;
}

export class UpdateCategoryDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  name: string;
}

export class CreateProductTypeDto {
  @IsNotEmpty()
  name: string;
}

export class UpdateProductTypeDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  name: string;
}