import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ReportsService } from './reports.service';
import {
  DailySalesDto,
  TopVendeuseDto,
  PaymentMethodStatsDto,
  DashboardSummaryDto,
  CaisseReportDto,
  TopClientDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('dashboard')
  async getDashboard(): Promise<DashboardSummaryDto> {
    return this.reportsService.getDashboard();
  }

  @Get('daily-sales')
  async getDailySales(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<DailySalesDto[]> {
    return this.reportsService.getDailySales(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('top-vendeuses')
  async getTopVendeuses(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ): Promise<TopVendeuseDto[]> {
    return this.reportsService.getTopVendeuses(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('payment-methods')
  async getPaymentMethodStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<PaymentMethodStatsDto[]> {
    return this.reportsService.getPaymentMethodStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('caisses')
  async getCaisseReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
  ): Promise<CaisseReportDto[]> {
    return this.reportsService.getCaisseReport(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      userId,
    );
  }

  @Get('top-clients')
  async getTopClients(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ): Promise<TopClientDto[]> {
    return this.reportsService.getTopClients(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      limit ? parseInt(limit, 10) : 10,
    );
  }
}
