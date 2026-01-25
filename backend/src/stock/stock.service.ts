import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  // Vérifier si le stock est suffisant
  async checkStock(productId: string, quantity: number): Promise<boolean> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return false;
    }

    return product.stock >= quantity;
  }

  // Décrémenter le stock (utilisé dans une transaction)
  async decreaseStock(
    tx: Prisma.TransactionClient,
    productId: string,
    quantity: number,
  ): Promise<void> {
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new BadRequestException(`Produit ${productId} non trouvé`);
    }

    if (!product.isActive) {
      throw new BadRequestException(`Produit "${product.name}" n'est plus disponible`);
    }

    if (product.stock < quantity) {
      throw new BadRequestException(
        `Stock insuffisant pour "${product.name}". Disponible: ${product.stock}, Demandé: ${quantity}`,
      );
    }

    await tx.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
  }

  // Vérifier le stock de plusieurs produits
  async checkMultipleStock(
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        errors.push(`Produit non trouvé: ${item.productId}`);
        continue;
      }

      if (!product.isActive) {
        errors.push(`Produit "${product.name}" n'est plus disponible`);
        continue;
      }

      if (product.stock < item.quantity) {
        errors.push(
          `Stock insuffisant pour "${product.name}". Disponible: ${product.stock}, Demandé: ${item.quantity}`,
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Récupérer le stock d'un produit
  async getStock(productId: string): Promise<number> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true },
    });

    return product?.stock ?? 0;
  }

  // Produits en rupture ou stock bas
  async getLowStockProducts(threshold = 5): Promise<
    Array<{
      id: string;
      name: string;
      stock: number;
      isOutOfStock: boolean;
    }>
  > {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lte: threshold },
      },
      orderBy: { stock: 'asc' },
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      isOutOfStock: p.stock === 0,
    }));
  }
}
