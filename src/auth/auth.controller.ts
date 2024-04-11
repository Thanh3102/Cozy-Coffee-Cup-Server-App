import { Body, Controller, Post, Response, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response as ResponseType, Request as RequestType } from 'express';
import { SignInDto } from './dtos';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/signin')
  async signin(@Body() signInDto: SignInDto, @Response() res: ResponseType) {
    return this.authService.signIn(signInDto, res);
  }

  @Post('/logout')
  async logout(@Response() res: ResponseType) {
    return this.authService.logout(res);
  }
  @Post('/refresh')
  async refresh(@Request() req: RequestType, @Response() res: ResponseType) {
    const accessToken = req.headers.authorization;
    const { refreshToken } = req.cookies;
    return this.authService.refresh(accessToken, refreshToken, res);
  }
}
