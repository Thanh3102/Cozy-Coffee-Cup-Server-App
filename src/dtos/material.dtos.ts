import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
export class AddMaterialDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  @IsNumber()
  stock_quantity: number;
  @IsNumber()
  min_stock: number;
  expiration_date: Date | undefined;
  @IsNotEmpty()
  @IsNumber()
  unit_id: number;
}

export class UpdateMaterialDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  @IsNumber()
  stock_quantity: number;
  @IsNumber()
  min_stock: number;
  expiration_date: Date;
  @IsNotEmpty()
  @IsNumber()
  unit_id: number;
  @IsBoolean()
  active: boolean;
}

export class CreateUnitDto {
  @IsNotEmpty()
  name: string;
  short: string;
}

export class UpdateUnitDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  name: string;
  short: string;
}
