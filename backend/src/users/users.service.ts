import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, name, role } = createUserDto;

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role,
      },
    });

    return this.formatUserResponse(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.formatUserResponse(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return this.formatUserResponse(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Prepare update data
    const updateData: {
      name?: string;
      password?: string;
      role?: typeof updateUserDto.role;
      isActive?: boolean;
    } = {};

    if (updateUserDto.name !== undefined) {
      updateData.name = updateUserDto.name;
    }

    if (updateUserDto.password !== undefined) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.role !== undefined) {
      updateData.role = updateUserDto.role;
    }

    if (updateUserDto.isActive !== undefined) {
      updateData.isActive = updateUserDto.isActive;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return this.formatUserResponse(user);
  }

  async deactivate(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return this.formatUserResponse(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { sales: true, caisses: true }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user._count.sales > 0 || user._count.caisses > 0) {
      throw new BadRequestException(
        'Impossible de supprimer cet utilisateur car il possède un historique (ventes ou sessions de caisse). Veuillez le désactiver à la place pour préserver les données.'
      );
    }

    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (err) {
      console.error('Prisma delete error:', err);
      throw new BadRequestException('Une erreur est survenue lors de la suppression. Il se peut que l\'utilisateur soit lié à d\'autres données.');
    }
  }

  private formatUserResponse(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserResponseDto['role'],
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
