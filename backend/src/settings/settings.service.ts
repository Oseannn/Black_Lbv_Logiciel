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

  async resetAllData(): Promise<{ message: string }> {
    // Supprimer toutes les données dans l'ordre pour respecter les contraintes
    await this.prisma.$transaction(async (tx) => {
      // 1. Supprimer les items de vente
      await tx.saleItem.deleteMany({});
      
      // 2. Supprimer les ventes
      await tx.sale.deleteMany({});
      
      // 3. Supprimer les mouvements de caisse
      await tx.cashMovement.deleteMany({});
      
      // 4. Supprimer les caisses
      await tx.caisse.deleteMany({});
      
      // 5. Supprimer les produits
      await tx.product.deleteMany({});
      
      // 6. Supprimer les clients
      await tx.client.deleteMany({});
      
      // 7. Supprimer les utilisateurs sauf l'admin principal
      await tx.user.deleteMany({
        where: {
          email: {
            not: 'admin@osean.local',
          },
        },
      });
      
      // 8. Réinitialiser les paramètres
      await tx.settings.update({
        where: { id: DEFAULT_SETTINGS_ID },
        data: {
          companyName: 'Ma Boutique',
          logo: null,
          currency: 'FCFA',
          slogan: null,
          invoiceFooter: null,
          address: null,
          phone: null,
        },
      });
    });

    return { message: 'Toutes les données ont été réinitialisées avec succès' };
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
