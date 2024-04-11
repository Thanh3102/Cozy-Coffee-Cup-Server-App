import { JwtService } from '@nestjs/jwt';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(
    context: ExecutionContext,
  ) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    if (token) {
      const user = await this.checkValidToken(token);
      if (user) {
        request.user = user;
        return true;
      }
    }
  }

  async checkValidToken(token) {
    try {
      const { iat, exp, type, ...user } = await this.jwtService.verify(token);
      return user;
    } catch (err) {
      console.log('Error:', err);
      throw new UnauthorizedException();
    }
  }
}
