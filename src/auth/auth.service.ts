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
      select: {
        id: true,
        name: true,
        username: true,
        password: true,
        user_role: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
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
        } = {
          id: user.id,
          username: user.name,
          name: user.name,
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
          user: payload,
        });
      }
      return res.status(401).json({ message: 'Mật khẩu không chính xác' });
    } else {
      return res.status(401).json({ message: 'Tên đăng nhập không tồn tại' });
    }
  }
  async logout(res: ResponseType) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(200).json({
      message: 'Logout sucessfully',
    });
  }
  async refresh(accessToken: string, refreshToken: string, res: ResponseType) {
    if (refreshToken) {
      // if have access token => refresh new access token
      if (accessToken) {
        try {
          const { iat, exp, type } = await this.jwtService.verify(refreshToken);

          if (type === 'refreshToken') {
            const { iat, exp, type, ...payload } = await this.jwtService.verify(
              accessToken,
              {
                ignoreExpiration: true,
              },
            );

            const newAccessToken = await this.jwtService.sign(payload);
            return res.status(200).json({
              accessToken: newAccessToken,
              user: payload,
            });
          }
        } catch (error) {
          console.log(error);
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
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
