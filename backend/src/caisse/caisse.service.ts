import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CaisseStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  OpenCaisseDto,
  CloseCaisseDto,
  CashOutDto,
  CaisseResponseDto,
  CaisseSummaryDto,
  CashMovementResponseDto,
} from './dto';

@Injectable()
export class CaisseService {
  constructor(private readonly prisma: PrismaService) {}

  // Ouvrir une caisse
  async open(userId: string, openCaisseDto: OpenCaisseDto): Promise<CaisseResponseDto> {
    // Vérifier qu'il n'y a pas déjà une caisse ouverte pour cet utilisateur
    const existingOpenCaisse = await this.prisma.caisse.findFirst({
      where: {
        userId,
        status: CaisseStatus.OPEN,
      },
    });

    if (existingOpenCaisse) {
      throw new ConflictException('Vous avez déjà une caisse ouverte');
    }

    const caisse = await this.prisma.caisse.create({
      data: {
        userId,
        openingAmount: new Prisma.Decimal(openCaisseDto.openingAmount),
        status: CaisseStatus.OPEN,
      },
      include: {
        user: true,
        cashMovements: true,
        sales: true,
      },
    });

    return this.formatCaisseResponse(caisse);
  }

  // Fermer une caisse
  async close(userId: string, closeCaisseDto: CloseCaisseDto): Promise<CaisseResponseDto> {
    const caisse = await this.prisma.caisse.findFirst({
      where: {
        userId,
        status: CaisseStatus.OPEN,
      },
      include: {
        user: true,
        cashMovements: true,
        sales: true,
      },
    });

    if (!caisse) {
      throw new NotFoundException('Aucune caisse ouverte trouvée');
    }

    // Calculer le montant attendu
    const totalSales = caisse.sales.reduce(
      (sum, sale) => sum + sale.total.toNumber(),
      0,
    );
    const totalCashOut = caisse.cashMovements.reduce(
      (sum, mov) => sum + mov.amount.toNumber(),
      0,
    );
    const expectedAmount =
      caisse.openingAmount.toNumber() + totalSales - totalCashOut;
    const difference = closeCaisseDto.closingAmount - expectedAmount;

    const updatedCaisse = await this.prisma.caisse.update({
      where: { id: caisse.id },
      data: {
        status: CaisseStatus.CLOSED,
        closingAmount: new Prisma.Decimal(closeCaisseDto.closingAmount),
        expectedAmount: new Prisma.Decimal(expectedAmount),
        difference: new Prisma.Decimal(difference),
        closedAt: new Date(),
      },
      include: {
        user: true,
        cashMovements: true,
        sales: true,
      },
    });

    return this.formatCaisseResponse(updatedCaisse);
  }

  // Sortie de caisse
  async cashOut(userId: string, cashOutDto: CashOutDto): Promise<CashMovementResponseDto> {
    const caisse = await this.prisma.caisse.findFirst({
      where: {
        userId,
        status: CaisseStatus.OPEN,
      },
    });

    if (!caisse) {
      throw new BadRequestException('Aucune caisse ouverte. Ouvrez une caisse avant de faire une sortie.');
    }

    const movement = await this.prisma.cashMovement.create({
      data: {
        caisseId: caisse.id,
        amount: new Prisma.Decimal(cashOutDto.amount),
        reason: cashOutDto.reason,
      },
    });

    return {
      id: movement.id,
      amount: movement.amount.toNumber(),
      reason: movement.reason,
      createdAt: movement.createdAt,
    };
  }

  // Récupérer la caisse ouverte de l'utilisateur
  async getCurrent(userId: string): Promise<CaisseSummaryDto | null> {
    const caisse = await this.prisma.caisse.findFirst({
      where: {
        userId,
        status: CaisseStatus.OPEN,
      },
      include: {
        cashMovements: true,
        sales: true,
      },
    });

    if (!caisse) {
      return null;
    }

    const totalSales = caisse.sales.reduce(
      (sum, sale) => sum + sale.total.toNumber(),
      0,
    );
    const totalCashOut = caisse.cashMovements.reduce(
      (sum, mov) => sum + mov.amount.toNumber(),
      0,
    );
    const currentBalance =
      caisse.openingAmount.toNumber() + totalSales - totalCashOut;

    return {
      id: caisse.id,
      status: caisse.status,
      openingAmount: caisse.openingAmount.toNumber(),
      openedAt: caisse.openedAt,
      totalSales,
      totalCashOut,
      currentBalance,
    };
  }

  // Récupérer une caisse par ID (admin)
  async findOne(id: string): Promise<CaisseResponseDto> {
    const caisse = await this.prisma.caisse.findUnique({
      where: { id },
      include: {
        user: true,
        cashMovements: true,
        sales: true,
      },
    });

    if (!caisse) {
      throw new NotFoundException('Caisse non trouvée');
    }

    return this.formatCaisseResponse(caisse);
  }

  // Historique des caisses (admin)
  async findAll(userId?: string): Promise<CaisseResponseDto[]> {
    const where = userId ? { userId } : {};

    const caisses = await this.prisma.caisse.findMany({
      where,
      include: {
        user: true,
        cashMovements: true,
        sales: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return caisses.map((caisse) => this.formatCaisseResponse(caisse));
  }

  // Historique des caisses de l'utilisateur courant
  async getMyHistory(userId: string): Promise<CaisseResponseDto[]> {
    return this.findAll(userId);
  }

  // Vérifier si l'utilisateur a une caisse ouverte (utilisé par SalesModule)
  async hasOpenCaisse(userId: string): Promise<boolean> {
    const caisse = await this.prisma.caisse.findFirst({
      where: {
        userId,
        status: CaisseStatus.OPEN,
      },
    });

    return !!caisse;
  }

  // Récupérer l'ID de la caisse ouverte (utilisé par SalesModule)
  async getOpenCaisseId(userId: string): Promise<string | null> {
    const caisse = await this.prisma.caisse.findFirst({
      where: {
        userId,
        status: CaisseStatus.OPEN,
      },
    });

    return caisse?.id ?? null;
  }

  private formatCaisseResponse(caisse: {
    id: string;
    userId: string;
    user: { name: string };
    status: CaisseStatus;
    openingAmount: Prisma.Decimal;
    closingAmount: Prisma.Decimal | null;
    expectedAmount: Prisma.Decimal | null;
    difference: Prisma.Decimal | null;
    openedAt: Date;
    closedAt: Date | null;
    cashMovements: Array<{
      id: string;
      amount: Prisma.Decimal;
      reason: string;
      createdAt: Date;
    }>;
    sales: Array<{ total: Prisma.Decimal }>;
    createdAt: Date;
    updatedAt: Date;
  }): CaisseResponseDto {
    const totalSales = caisse.sales.reduce(
      (sum, sale) => sum + sale.total.toNumber(),
      0,
    );

    return {
      id: caisse.id,
      userId: caisse.userId,
      userName: caisse.user.name,
      status: caisse.status,
      openingAmount: caisse.openingAmount.toNumber(),
      closingAmount: caisse.closingAmount?.toNumber() ?? null,
      expectedAmount: caisse.expectedAmount?.toNumber() ?? null,
      difference: caisse.difference?.toNumber() ?? null,
      openedAt: caisse.openedAt,
      closedAt: caisse.closedAt,
      cashMovements: caisse.cashMovements.map((mov) => ({
        id: mov.id,
        amount: mov.amount.toNumber(),
        reason: mov.reason,
        createdAt: mov.createdAt,
      })),
      totalSales,
      createdAt: caisse.createdAt,
      updatedAt: caisse.updatedAt,
    };
  }
}
