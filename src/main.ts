import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
    }),
  );
  app.enableCors({
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: 'http://localhost:3000',
    credentials: true,
  });
  app.use(cookieParser());
  dotenv.config();
  await app.listen(3001);
}
bootstrap();
