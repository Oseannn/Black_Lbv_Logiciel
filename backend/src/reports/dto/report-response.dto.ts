export class DailySalesDto {
  date: string;
  totalSales: number;
  totalAmount: number;
  averageTicket: number;
}

export class TopVendeuseDto {
  userId: string;
  userName: string;
  totalSales: number;
  totalAmount: number;
}

export class PaymentMethodStatsDto {
  method: string;
  count: number;
  total: number;
  percentage: number;
}

export class DashboardSummaryDto {
  todaySales: number;
  todayAmount: number;
  monthSales: number;
  monthAmount: number;
  openCaisses: number;
  lowStockProducts: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    totalAmount: number;
  }>;
  topClients: Array<{
    clientId: string;
    clientName: string;
    totalOrders: number;
    totalAmount: number;
  }>;
}

export class CaisseReportDto {
  caisseId: string;
  userName: string;
  openedAt: Date;
  closedAt: Date | null;
  status: string;
  openingAmount: number;
  closingAmount: number | null;
  expectedAmount: number | null;
  difference: number | null;
  totalSales: number;
  totalCashOut: number;
}

export class TopClientDto {
  clientId: string;
  clientName: string;
  totalOrders: number;
  totalAmount: number;
}
