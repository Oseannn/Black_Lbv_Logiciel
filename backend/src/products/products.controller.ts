import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Admin uniquement : créer un produit
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto);
  }

  // Tous les utilisateurs authentifiés : lister les produits
  @Get()
  async findAll(
    @Query('includeInactive') includeInactive?: string,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.findAll(includeInactive === 'true');
  }

  // Tous les utilisateurs authentifiés : voir un produit
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  // Admin uniquement : modifier un produit
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, updateProductDto);
  }

  // Admin uniquement : désactiver un produit
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
    return this.productsService.deactivate(id);
  }
}
