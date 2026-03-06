import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { SalesService } from './sales.service';
import { CreateSaleDto, SaleResponseDto, SaleReceiptDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Ventes')
@ApiBearerAuth()
@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) { }

  // Créer une vente (vendeuse uniquement)
  @ApiOperation({ summary: 'Créer une nouvelle vente' })
  @ApiResponse({ status: 201, description: 'Vente créée avec succès' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.VENDEUSE)
  async create(
    @CurrentUser('id') userId: string,
    @Body() createSaleDto: CreateSaleDto,
  ): Promise<{ sale: SaleResponseDto; receipt: SaleReceiptDto }> {
    const sale = await this.salesService.create(userId, createSaleDto);
    const receipt = await this.salesService.getReceipt(sale.id);
    return { sale, receipt };
  }

  // Historique de mes ventes (vendeuse)
  @ApiOperation({ summary: 'Obtenir l\'historique de mes ventes' })
  @Get('my-history')
  @UseGuards(RolesGuard)
  @Roles(Role.VENDEUSE)
  async getMyHistory(
    @CurrentUser('id') userId: string,
  ): Promise<SaleResponseDto[]> {
    return this.salesService.getMyHistory(userId);
  }

  // Historique global des ventes (admin)
  @ApiOperation({ summary: 'Obtenir l\'historique global des ventes (Admin)' })
  @Get('history')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async findAll(
    @Query('userId') userId?: string,
    @Query('caisseId') caisseId?: string,
    @Query('clientId') clientId?: string,
  ): Promise<SaleResponseDto[]> {
    return this.salesService.findAll({ userId, caisseId, clientId });
  }

  // Ticket de caisse / Facture
  @ApiOperation({ summary: 'Obtenir le ticket de caisse d\'une vente' })
  @Get(':id/receipt')
  async getReceipt(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SaleReceiptDto> {
    return this.salesService.getReceipt(id);
  }

  // Détails d'une vente
  @ApiOperation({ summary: 'Obtenir les détails d\'une vente par ID' })
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SaleResponseDto> {
    return this.salesService.findOne(id);
  }
}
