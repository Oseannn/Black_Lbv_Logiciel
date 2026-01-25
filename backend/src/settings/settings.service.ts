import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto, SettingsResponseDto } from './dto';

const DEFAULT_SETTINGS_ID = 'default';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<SettingsResponseDto> {
    let settings = await this.prisma.settings.findUnique({
      where: { id: DEFAULT_SETTINGS_ID },
    });

    // Créer les paramètres par défaut s'ils n'existent pas
    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          id: DEFAULT_SETTINGS_ID,
          companyName: 'Ma Boutique',
          currency: 'XOF',
        },
      });
    }

    return this.formatSettingsResponse(settings);
  }

  async update(updateSettingsDto: UpdateSettingsDto): Promise<SettingsResponseDto> {
    // S'assurer que les paramètres existent
    await this.get();

    const settings = await this.prisma.settings.update({
      where: { id: DEFAULT_SETTINGS_ID },
      data: {
        ...updateSettingsDto,
      },
    });

    return this.formatSettingsResponse(settings);
  }

  private formatSettingsResponse(settings: {
    id: string;
    companyName: string;
    logo: string | null;
    currency: string;
    slogan: string | null;
    invoiceFooter: string | null;
    address: string | null;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): SettingsResponseDto {
    return {
      id: settings.id,
      companyName: settings.companyName,
      logo: settings.logo,
      currency: settings.currency,
      slogan: settings.slogan,
      invoiceFooter: settings.invoiceFooter,
      address: settings.address,
      phone: settings.phone,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }
}
