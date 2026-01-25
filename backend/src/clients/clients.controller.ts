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
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto, ClientResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  // Admin et Vendeuse peuvent créer un client
  @Post()
  async create(@Body() createClientDto: CreateClientDto): Promise<ClientResponseDto> {
    return this.clientsService.create(createClientDto);
  }

  // Admin et Vendeuse peuvent lister les clients
  @Get()
  async findAll(
    @Query('includeInactive') includeInactive?: string,
  ): Promise<ClientResponseDto[]> {
    return this.clientsService.findAll(includeInactive === 'true');
  }

  // Admin et Vendeuse peuvent voir un client
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ClientResponseDto> {
    return this.clientsService.findOne(id);
  }

  // Admin et Vendeuse peuvent modifier un client
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    return this.clientsService.update(id, updateClientDto);
  }

  // Seul Admin peut désactiver un client
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<ClientResponseDto> {
    return this.clientsService.deactivate(id);
  }
}
