import { Injectable } from '@nestjs/common';
import { CaisseStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DailySalesDto,
  TopVendeuseDto,
  PaymentMethodStatsDto,
  DashboardSummaryDto,
  CaisseReportDto,
  TopClientDto,
} from './dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) { }

  async getDashboard(): Promise<DashboardSummaryDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Ventes du jour
    const todaySalesData = await this.prisma.sale.aggregate({
      where: {
        createdAt: { gte: today, lt: tomorrow },
      },
      _count: true,
      _sum: { total: true },
    });

    // Ventes du mois
    const monthSalesData = await this.prisma.sale.aggregate({
      where: {
        createdAt: { gte: firstDayOfMonth },
      },
      _count: true,
      _sum: { total: true },
    });

    // Caisses ouvertes
    const openCaisses = await this.prisma.caisse.count({
      where: { status: CaisseStatus.OPEN },
    });

    // Produits en stock bas
    const lowStockProducts = await this.prisma.product.count({
      where: {
        isActive: true,
        stock: { lte: 5 },
      },
    });

    // Top 5 produits vendus
    const topProductsData = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const productIds = topProductsData.map((p) => p.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p.name]));

    const topProducts = topProductsData.map((p) => ({
      productId: p.productId,
      productName: productMap.get(p.productId) || 'Inconnu',
      quantitySold: p._sum.quantity || 0,
      totalAmount: p._sum.totalPrice?.toNumber() || 0,
    }));

    // Top 5 clients (par montant total dépensé)
    const topClientsData = await this.prisma.sale.groupBy({
      by: ['clientId'],
      where: { clientId: { not: null } },
      _count: { id: true },
      _sum: { total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    });

    const clientIds = topClientsData.map((c) => c.clientId as string);
    const clients = await this.prisma.client.findMany({
      where: { id: { in: clientIds } },
    });
    const clientMap = new Map(clients.map((c) => [c.id, c.name]));

    const topClients = topClientsData.map((c) => ({
      clientId: c.clientId as string,
      clientName: clientMap.get(c.clientId as string) || 'Client Anonyme',
      totalOrders: c._count.id,
      totalAmount: c._sum.total?.toNumber() || 0,
    }));

    return {
      todaySales: todaySalesData._count,
      todayAmount: todaySalesData._sum.total?.toNumber() || 0,
      monthSales: monthSalesData._count,
      monthAmount: monthSalesData._sum.total?.toNumber() || 0,
      openCaisses,
      lowStockProducts,
      topProducts,
      topClients,
    };
  }

  async getDailySales(
    startDate?: Date,
    endDate?: Date,
  ): Promise<DailySalesDto[]> {
    const where: { createdAt?: { gte?: Date; lte?: Date } } = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const sales = await this.prisma.sale.findMany({
      where,
      select: { createdAt: true, total: true },
    });

    // Grouper par jour
    const dailyMap = new Map<
      string,
      { count: number; total: number }
    >();

    for (const sale of sales) {
      const dateKey = sale.createdAt.toISOString().split('T')[0];
      const existing = dailyMap.get(dateKey) || { count: 0, total: 0 };
      existing.count += 1;
      existing.total += sale.total.toNumber();
      dailyMap.set(dateKey, existing);
    }

    const result: DailySalesDto[] = [];
    for (const [date, data] of dailyMap) {
      result.push({
        date,
        totalSales: data.count,
        totalAmount: data.total,
        averageTicket: data.count > 0 ? data.total / data.count : 0,
      });
    }

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }

  async getTopVendeuses(
    startDate?: Date,
    endDate?: Date,
    limit = 10,
  ): Promise<TopVendeuseDto[]> {
    const where: { createdAt?: { gte?: Date; lte?: Date } } = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const salesByUser = await this.prisma.sale.groupBy({
      by: ['userId'],
      where,
      _count: true,
      _sum: { total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: limit,
    });

    const userIds = salesByUser.map((s) => s.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
    });
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    return salesByUser.map((s) => ({
      userId: s.userId,
      userName: userMap.get(s.userId) || 'Inconnu',
      totalSales: s._count,
      totalAmount: s._sum.total?.toNumber() || 0,
    }));
  }

  async getPaymentMethodStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<PaymentMethodStatsDto[]> {
    const where: { createdAt?: { gte?: Date; lte?: Date } } = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const stats = await this.prisma.sale.groupBy({
      by: ['paymentMethod'],
      where,
      _count: true,
      _sum: { total: true },
    });

    const totalAmount = stats.reduce(
      (sum, s) => sum + (s._sum.total?.toNumber() || 0),
      0,
    );

    return stats.map((s) => {
      const amount = s._sum.total?.toNumber() || 0;
      return {
        method: s.paymentMethod,
        count: s._count,
        total: amount,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      };
    });
  }

  async getCaisseReport(
    startDate?: Date,
    endDate?: Date,
    userId?: string,
  ): Promise<CaisseReportDto[]> {
    const where: {
      openedAt?: { gte?: Date; lte?: Date };
      userId?: string;
    } = {};

    if (startDate || endDate) {
      where.openedAt = {};
      if (startDate) where.openedAt.gte = startDate;
      if (endDate) where.openedAt.lte = endDate;
    }
    if (userId) where.userId = userId;

    const caisses = await this.prisma.caisse.findMany({
      where,
      include: {
        user: true,
        sales: true,
        cashMovements: true,
      },
      orderBy: { openedAt: 'desc' },
    });

    return caisses.map((c) => {
      const totalSales = c.sales.reduce(
        (sum, s) => sum + s.total.toNumber(),
        0,
      );
      const totalCashOut = c.cashMovements.reduce(
        (sum, m) => sum + m.amount.toNumber(),
        0,
      );

      return {
        caisseId: c.id,
        userName: c.user.name,
        openedAt: c.openedAt,
        closedAt: c.closedAt,
        status: c.status,
        openingAmount: c.openingAmount.toNumber(),
        closingAmount: c.closingAmount?.toNumber() ?? null,
        expectedAmount: c.expectedAmount?.toNumber() ?? null,
        difference: c.difference?.toNumber() ?? null,
        totalSales,
        totalCashOut,
      };
    });
  }

  async getTopClients(
    startDate?: Date,
    endDate?: Date,
    limit = 10,
  ): Promise<TopClientDto[]> {
    const where: { createdAt?: { gte?: Date; lte?: Date }; clientId?: { not: null } } = {
      clientId: { not: null },
    };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const salesByClient = await this.prisma.sale.groupBy({
      by: ['clientId'],
      where,
      _count: { id: true },
      _sum: { total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: limit,
    });

    const clientIds = salesByClient.map((c) => c.clientId as string);
    const clients = await this.prisma.client.findMany({
      where: { id: { in: clientIds } },
    });
    const clientMap = new Map(clients.map((c) => [c.id, c.name]));

    return salesByClient.map((c) => ({
      clientId: c.clientId as string,
      clientName: clientMap.get(c.clientId as string) || 'Inconnu',
      totalOrders: c._count.id,
      totalAmount: c._sum.total?.toNumber() || 0,
    }));
  }
}
