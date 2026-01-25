import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, AuthResponseDto, TokenResponseDto, UserResponseDto } from './dto';
import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Ce compte a été désactivé');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: this.formatUserResponse(user),
    };
  }

  async refresh(refreshToken: string): Promise<TokenResponseDto> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );

      // Verify user still exists and is active
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Token invalide');
      }

      return this.generateTokens(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('Token de rafraîchissement invalide ou expiré');
    }
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    return this.formatUserResponse(user);
  }

  async validateUser(userId: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return this.formatUserResponse(user);
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: Role,
  ): Promise<TokenResponseDto> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: 900, // 15 minutes in seconds
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: 604800, // 7 days in seconds
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private formatUserResponse(user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    isActive: boolean;
    createdAt: Date;
  }): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
