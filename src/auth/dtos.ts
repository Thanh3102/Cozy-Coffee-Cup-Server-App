import { IsEmail, IsNotEmpty } from 'class-validator';

class SignInDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}

export { SignInDto };
