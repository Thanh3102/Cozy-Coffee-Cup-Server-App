import { Module } from '@nestjs/common';
import { MaterialModule } from './material/material.module';
import { ProviderModule } from './provider/provider.module';
import { ImportExportModule } from './import-export/import-export.module';

@Module({
  imports: [MaterialModule, ProviderModule, ImportExportModule]
})
export class WarehouseModule {}
