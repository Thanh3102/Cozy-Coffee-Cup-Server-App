import { IsBoolean, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateProviderDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  address: string;
  phone: string;
  email: string;
}

export class UpdateProviderDto {
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  address: string;
  phone: string;
  email: string;
  @IsBoolean()
  active: boolean;
}
