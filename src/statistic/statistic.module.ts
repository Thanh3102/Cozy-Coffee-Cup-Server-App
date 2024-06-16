import { Module } from '@nestjs/common';
import { StatisticController } from './statistic.controller';
import { StatisticService } from './statistic.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [StatisticController],
  providers: [StatisticService, PrismaService]
})
export class StatisticModule {}
