import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { StatisticModule } from './statistic/statistic.module';

@Module({
  imports: [AuthModule, WarehouseModule, ProductModule, OrderModule, StatisticModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
