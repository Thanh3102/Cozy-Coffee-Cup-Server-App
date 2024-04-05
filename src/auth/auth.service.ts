import { PrismaService } from './../prisma/prisma.service';
import { BadRequestException, Injectable, Response } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response as ResponseType } from 'express';
import { SignInDto } from './types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}
  async signIn(signInDto: SignInDto, res: ResponseType) {
    const { username, password } = signInDto;
    const user = await this.prisma.user.findFirst({
      where: {
        username: username,
      },
    });
    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        const payload: {
          id: string;
          username: string;
          name: string;
          role: string;
        } = {
          id: user.id,
          username: user.name,
          name: user.name,
          role: user.role,
        };

        const accessToken = await this.jwtService.sign(
          { type: 'accessToken', ...payload },
          {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME,
          },
        );

        const refreshToken = await this.jwtService.sign(
          { type: 'refreshToken', ...payload },
          {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME,
          },
        );
        res.cookie('refreshToken', refreshToken, {
          maxAge: parseInt(process.env.REFRESH_TOKEN_MAX_AGE),
          httpOnly: true,
        });
        return res.status(200).json({
          accessToken: accessToken,
          user: {
            id: user.id,
            username: user.name,
            name: user.name,
            role: user.role,
          },
        });
      }
      return res.status(400).json({ message: 'Mật khẩu không chính xác' });
    } else {
      return res.status(400).json({ message: 'Tên đăng nhập không tồn tại' });
    }
  }
  async logout(res: ResponseType) {
    console.log('logout is running');

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(200).json({
      message: 'Logout sucessfully',
    });
  }
  async refresh(accessToken: string, refreshToken: string, res: ResponseType) {
    console.log('>>> Refresh token: ', refreshToken);
    console.log('>>> Access token: ', accessToken);

    if (refreshToken) {
      console.log('have refresh');

      // if have access token => refresh new access token
      if (accessToken) {
        try {
          const { iat, exp, type } = await this.jwtService.verify(refreshToken);
          console.log('>>> Type: ', type);

          if (type === 'refreshToken') {
            const { iat, exp, type, ...payload } = await this.jwtService.verify(
              accessToken,
              {
                ignoreExpiration: true,
              },
            );

            const newAccessToken = await this.jwtService.sign(payload);
            console.log('456');
            return res.status(200).json({
              accessToken: newAccessToken,
              user: payload,
            });
          }
        } catch (error) {
          console.log(error);
          console.log('123');

          // if refresh token invalid => 401 Unauthorized
          return res.status(401).json({ message: 'Unauthorized' });
        }
      }
      // if dont have access token => create new access token
      else {
        const { iat, exp, type, ...payload } = await this.jwtService.verify(
          refreshToken,
          {
            ignoreExpiration: true,
          },
        );
        const newAccessToken = await this.jwtService.sign({
          type: 'accessToken',
          ...payload,
        });
        return res.status(200).json({
          accessToken: newAccessToken,
          user: payload,
        });
      }
    }

    // if no refresh token => 401 Unauthorized
    console.log('789');
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
