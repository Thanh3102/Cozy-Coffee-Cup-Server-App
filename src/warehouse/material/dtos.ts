import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
export class AddMaterialDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  @IsNumber()
  stock_quantity: number;
  expiration_date: Date;
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
  expiration_date: Date;
  @IsNotEmpty()
  @IsNumber()
  unit_id: number;
  @IsBoolean()
  active: boolean;
}
