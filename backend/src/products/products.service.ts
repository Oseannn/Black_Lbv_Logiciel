import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductResponseDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const { name, brand, category, size, color, price, stock, photo } = createProductDto;

    const product = await this.prisma.product.create({
      data: {
        name,
        brand,
        category,
        size,
        color,
        price: new Prisma.Decimal(price),
        stock: stock ?? 0,
        photo,
      },
    });

    return this.formatProductResponse(product);
  }

  async findAll(includeInactive = false): Promise<ProductResponseDto[]> {
    const where = includeInactive ? {} : { isActive: true };

    const products = await this.prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return products.map((product) => this.formatProductResponse(product));
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    return this.formatProductResponse(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Produit non trouvé');
    }

    const updateData: Prisma.ProductUpdateInput = {};

    if (updateProductDto.name !== undefined) {
      updateData.name = updateProductDto.name;
    }

    if (updateProductDto.brand !== undefined) {
      updateData.brand = updateProductDto.brand;
    }

    if (updateProductDto.category !== undefined) {
      updateData.category = updateProductDto.category;
    }

    if (updateProductDto.size !== undefined) {
      updateData.size = updateProductDto.size;
    }

    if (updateProductDto.color !== undefined) {
      updateData.color = updateProductDto.color;
    }

    if (updateProductDto.price !== undefined) {
      updateData.price = new Prisma.Decimal(updateProductDto.price);
    }

    if (updateProductDto.stock !== undefined) {
      updateData.stock = updateProductDto.stock;
    }

    if (updateProductDto.photo !== undefined) {
      updateData.photo = updateProductDto.photo;
    }

    if (updateProductDto.isActive !== undefined) {
      updateData.isActive = updateProductDto.isActive;
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
    });

    return this.formatProductResponse(product);
  }

  async deactivate(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return this.formatProductResponse(updatedProduct);
  }

  // Méthode interne pour la gestion du stock (utilisée par SalesModule)
  async checkStock(productId: string, quantity: number): Promise<boolean> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      throw new BadRequestException('Produit non disponible');
    }

    return product.stock >= quantity;
  }

  private formatProductResponse(product: {
    id: string;
    name: string;
    brand: string | null;
    category: string | null;
    size: string | null;
    color: string | null;
    price: Prisma.Decimal;
    stock: number;
    photo: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      size: product.size,
      color: product.color,
      price: product.price.toNumber(),
      stock: product.stock,
      photo: product.photo,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
