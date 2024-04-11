import { Module } from '@nestjs/common';
import { ProviderController } from './provider.controller';
import { ProviderService } from './provider.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ProviderController],
  providers: [ProviderService, PrismaService],
})
export class ProviderModule {}
