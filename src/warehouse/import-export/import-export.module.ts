import { Module } from '@nestjs/common';
import { ImportExportController } from './import-export.controller';
import { ImportExportService } from './import-export.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ImportExportController],
  providers: [ImportExportService, PrismaService],
})
export class ImportExportModule {}
