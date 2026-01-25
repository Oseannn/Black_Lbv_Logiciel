import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { CaisseModule } from '../caisse/caisse.module';
import { StockModule } from '../stock/stock.module';

@Module({
  imports: [CaisseModule, StockModule],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
