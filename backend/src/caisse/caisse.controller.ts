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
import { CaisseService } from './caisse.service';
import {
  OpenCaisseDto,
  CloseCaisseDto,
  CashOutDto,
  CaisseResponseDto,
  CaisseSummaryDto,
  CashMovementResponseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('caisse')
@UseGuards(JwtAuthGuard)
export class CaisseController {
  constructor(private readonly caisseService: CaisseService) {}

  // Ouvrir une caisse (vendeuse uniquement)
  @Post('open')
  @UseGuards(RolesGuard)
  @Roles(Role.VENDEUSE)
  async open(
    @CurrentUser('id') userId: string,
    @Body() openCaisseDto: OpenCaisseDto,
  ): Promise<CaisseResponseDto> {
    return this.caisseService.open(userId, openCaisseDto);
  }

  // Fermer la caisse (vendeuse uniquement)
  @Post('close')
  @UseGuards(RolesGuard)
  @Roles(Role.VENDEUSE)
  async close(
    @CurrentUser('id') userId: string,
    @Body() closeCaisseDto: CloseCaisseDto,
  ): Promise<CaisseResponseDto> {
    return this.caisseService.close(userId, closeCaisseDto);
  }

  // Sortie de caisse (vendeuse uniquement)
  @Post('out')
  @UseGuards(RolesGuard)
  @Roles(Role.VENDEUSE)
  async cashOut(
    @CurrentUser('id') userId: string,
    @Body() cashOutDto: CashOutDto,
  ): Promise<CashMovementResponseDto> {
    return this.caisseService.cashOut(userId, cashOutDto);
  }

  // Récupérer la caisse ouverte courante (vendeuse)
  @Get('current')
  @UseGuards(RolesGuard)
  @Roles(Role.VENDEUSE)
  async getCurrent(
    @CurrentUser('id') userId: string,
  ): Promise<CaisseSummaryDto | null> {
    return this.caisseService.getCurrent(userId);
  }

  // Historique de mes caisses (vendeuse)
  @Get('my-history')
  @UseGuards(RolesGuard)
  @Roles(Role.VENDEUSE)
  async getMyHistory(
    @CurrentUser('id') userId: string,
  ): Promise<CaisseResponseDto[]> {
    return this.caisseService.getMyHistory(userId);
  }

  // Historique de toutes les caisses (admin)
  @Get('history')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async findAll(
    @Query('userId') userId?: string,
  ): Promise<CaisseResponseDto[]> {
    return this.caisseService.findAll(userId);
  }

  // Détails d'une caisse (admin)
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CaisseResponseDto> {
    return this.caisseService.findOne(id);
  }
}
