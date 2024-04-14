import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WarehouseModule } from './warehouse/warehouse.module';

@Module({
  imports: [AuthModule, WarehouseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
