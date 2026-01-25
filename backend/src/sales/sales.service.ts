import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CaisseService } from '../caisse/caisse.service';
import { StockService } from '../stock/stock.service';
import {
  CreateSaleDto,
  SaleResponseDto,
  SaleReceiptDto,
  SaleItemResponseDto,
} from './dto';

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly caisseService: CaisseService,
    private readonly stockService: StockService,
  ) { }

  async create(userId: string, createSaleDto: CreateSaleDto): Promise<SaleResponseDto> {
    const { clientId, paymentMethod, items } = createSaleDto;

    // 1. Vérifier que la vendeuse a une caisse ouverte
    const caisseId = await this.caisseService.getOpenCaisseId(userId);
    if (!caisseId) {
      throw new BadRequestException(
        'Vous devez ouvrir une caisse avant de faire une vente',
      );
    }

    // 2. Vérifier le stock de tous les produits
    const stockCheck = await this.stockService.checkMultipleStock(items);
    if (!stockCheck.valid) {
      throw new BadRequestException({
        message: 'Stock insuffisant',
        errors: stockCheck.errors,
      });
    }

    // 3. Vérifier que le client existe (si fourni)
    if (clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: clientId },
      });
      if (!client || !client.isActive) {
        throw new BadRequestException('Client non trouvé ou inactif');
      }
    }

    // 4. Récupérer les prix des produits
    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // 5. Calculer le total et préparer les items
    let total = 0;
    const saleItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      totalPrice: Prisma.Decimal;
    }> = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestException(`Produit non trouvé: ${item.productId}`);
      }

      const unitPrice = product.price;
      const itemTotal = unitPrice.toNumber() * item.quantity;
      total += itemTotal;

      saleItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        totalPrice: new Prisma.Decimal(itemTotal),
      });
    }

    // 6. Transaction: créer la vente + décrémenter les stocks
    const sale = await this.prisma.$transaction(async (tx) => {
      // Créer la vente
      const newSale = await tx.sale.create({
        data: {
          userId,
          caisseId,
          clientId: clientId || null,
          paymentMethod,
          total: new Prisma.Decimal(total),
          items: {
            create: saleItems,
          },
        },
        include: {
          user: true,
          client: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Décrémenter le stock de chaque produit
      for (const item of items) {
        await this.stockService.decreaseStock(tx, item.productId, item.quantity);
      }

      return newSale;
    });

    return this.formatSaleResponse(sale);
  }

  async findAll(filters?: {
    userId?: string;
    caisseId?: string;
    clientId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<SaleResponseDto[]> {
    const where: Prisma.SaleWhereInput = {};

    if (filters?.userId) where.userId = filters.userId;
    if (filters?.caisseId) where.caisseId = filters.caisseId;
    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        user: true,
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sales.map((sale) => this.formatSaleResponse(sale));
  }

  async findOne(id: string): Promise<SaleResponseDto> {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        user: true,
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Vente non trouvée');
    }

    return this.formatSaleResponse(sale);
  }

  async getReceipt(id: string): Promise<SaleReceiptDto> {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        user: true,
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Vente non trouvée');
    }

    // Récupérer les paramètres de l'entreprise
    const settings = await this.prisma.settings.findFirst();

    const items: SaleItemResponseDto[] = sale.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toNumber(),
      totalPrice: item.totalPrice.toNumber(),
    }));

    // Générer un numéro de ticket
    const receiptNumber = `TK-${sale.createdAt.getFullYear()}${String(sale.createdAt.getMonth() + 1).padStart(2, '0')}${String(sale.createdAt.getDate()).padStart(2, '0')}-${sale.id.slice(-6).toUpperCase()}`;

    return {
      id: sale.id,
      receiptNumber,
      companyName: settings?.companyName ?? 'Ma Boutique',
      companyAddress: settings?.address ?? null,
      companyPhone: settings?.phone ?? null,
      companyLogo: settings?.logo ?? null,
      vendeurName: sale.user.name,
      clientName: sale.client?.name ?? null,
      items,
      subtotal: sale.total.toNumber(),
      total: sale.total.toNumber(),
      paymentMethod: sale.paymentMethod,
      date: sale.createdAt,
      footer: settings?.invoiceFooter ?? 'Merci pour votre achat !',
    };
  }

  async getMyHistory(userId: string): Promise<SaleResponseDto[]> {
    return this.findAll({ userId });
  }

  private formatSaleResponse(sale: {
    id: string;
    userId: string;
    user: { name: string };
    caisseId: string;
    clientId: string | null;
    client: { name: string } | null;
    paymentMethod: string;
    total: Prisma.Decimal;
    items: Array<{
      id: string;
      productId: string;
      product: { name: string };
      quantity: number;
      unitPrice: Prisma.Decimal;
      totalPrice: Prisma.Decimal;
    }>;
    createdAt: Date;
  }): SaleResponseDto {
    return {
      id: sale.id,
      userId: sale.userId,
      userName: sale.user.name,
      caisseId: sale.caisseId,
      clientId: sale.clientId,
      clientName: sale.client?.name ?? null,
      paymentMethod: sale.paymentMethod as SaleResponseDto['paymentMethod'],
      items: sale.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toNumber(),
        totalPrice: item.totalPrice.toNumber(),
      })),
      total: sale.total.toNumber(),
      createdAt: sale.createdAt,
    };
  }
}
