import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto, SettingsResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Tous les utilisateurs authentifiés peuvent lire les paramètres
  @Get()
  async get(): Promise<SettingsResponseDto> {
    return this.settingsService.get();
  }

  // Seul l'admin peut modifier les paramètres
  @Patch()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @Body() updateSettingsDto: UpdateSettingsDto,
  ): Promise<SettingsResponseDto> {
    return this.settingsService.update(updateSettingsDto);
  }
}
