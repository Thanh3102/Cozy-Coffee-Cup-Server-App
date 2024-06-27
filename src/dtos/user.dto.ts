import { IsHexColor, IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsHexColor()
  color: string;
  perms: string[];
}

export class UpdateRoleDto {
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsHexColor()
  color: string;
  perms: string[];
}

export class CreateAccountDto {
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  name: string;
  roles: string[];
}

export class UpdateAccountDto {
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  name: string;
  roles: string[];
}
