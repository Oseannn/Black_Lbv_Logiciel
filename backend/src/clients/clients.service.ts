import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto, ClientResponseDto } from './dto';
import { Prisma } from '@prisma/client';

// Type for ClientType from Prisma enum
type PrismaClientType = 'VIP' | 'REGULAR' | 'OCCASIONAL';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto): Promise<ClientResponseDto> {
    const { name, phone, email, notes, type } = createClientDto;

    const client = await this.prisma.client.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        notes: notes || null,
        type: (type as PrismaClientType) || 'OCCASIONAL',
      },
    });

    return this.formatClientResponse(client);
  }

  async findAll(includeInactive = false): Promise<ClientResponseDto[]> {
    const where = includeInactive ? {} : { isActive: true };

    const clients = await this.prisma.client.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        sales: {
          select: {
            total: true,
          },
        },
      },
    });

    return clients.map((client) => {
      const totalSpent = client.sales.reduce(
        (sum, sale) => sum + Number(sale.total),
        0,
      );
      return this.formatClientResponse(client, totalSpent);
    });
  }

  async findOne(id: string): Promise<ClientResponseDto> {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        sales: {
          select: {
            total: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client non trouvé');
    }

    const totalSpent = client.sales.reduce(
      (sum, sale) => sum + Number(sale.total),
      0,
    );

    return this.formatClientResponse(client, totalSpent);
  }

  async update(
    id: string,
    updateClientDto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    const existingClient = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      throw new NotFoundException('Client non trouvé');
    }

    const updateData: Prisma.ClientUpdateInput = {};

    if (updateClientDto.name !== undefined) {
      updateData.name = updateClientDto.name;
    }

    if (updateClientDto.phone !== undefined) {
      updateData.phone = updateClientDto.phone || null;
    }

    if (updateClientDto.email !== undefined) {
      updateData.email = updateClientDto.email || null;
    }

    if (updateClientDto.notes !== undefined) {
      updateData.notes = updateClientDto.notes || null;
    }

    if (updateClientDto.type !== undefined) {
      updateData.type = updateClientDto.type as PrismaClientType;
    }

    if (updateClientDto.isActive !== undefined) {
      updateData.isActive = updateClientDto.isActive;
    }

    const client = await this.prisma.client.update({
      where: { id },
      data: updateData,
      include: {
        sales: {
          select: {
            total: true,
          },
        },
      },
    });

    const totalSpent = client.sales.reduce(
      (sum, sale) => sum + Number(sale.total),
      0,
    );

    return this.formatClientResponse(client, totalSpent);
  }

  async deactivate(id: string): Promise<ClientResponseDto> {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        sales: {
          select: {
            total: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client non trouvé');
    }

    const updatedClient = await this.prisma.client.update({
      where: { id },
      data: { isActive: false },
      include: {
        sales: {
          select: {
            total: true,
          },
        },
      },
    });

    const totalSpent = updatedClient.sales.reduce(
      (sum, sale) => sum + Number(sale.total),
      0,
    );

    return this.formatClientResponse(updatedClient, totalSpent);
  }

  private formatClientResponse(
    client: {
      id: string;
      name: string;
      phone: string | null;
      email: string | null;
      notes: string | null;
      type: PrismaClientType;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    },
    totalSpent?: number,
  ): ClientResponseDto {
    return {
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      notes: client.notes,
      type: client.type,
      isActive: client.isActive,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      totalSpent,
    };
  }
}
