import { CaisseStatus } from '@prisma/client';

export class CashMovementResponseDto {
  id: string;
  amount: number;
  reason: string;
  createdAt: Date;
}

export class CaisseResponseDto {
  id: string;
  userId: string;
  userName: string;
  status: CaisseStatus;
  openingAmount: number;
  closingAmount: number | null;
  expectedAmount: number | null;
  difference: number | null;
  openedAt: Date;
  closedAt: Date | null;
  cashMovements: CashMovementResponseDto[];
  totalSales: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CaisseSummaryDto {
  id: string;
  status: CaisseStatus;
  openingAmount: number;
  openedAt: Date;
  totalSales: number;
  totalCashOut: number;
  currentBalance: number;
}
