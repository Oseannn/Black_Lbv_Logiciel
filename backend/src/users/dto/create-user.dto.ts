import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'Email requis' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Mot de passe requis' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Nom requis' })
  name: string;

  @IsEnum(Role, { message: 'Rôle invalide (ADMIN ou VENDEUSE)' })
  @IsOptional()
  role?: Role = Role.VENDEUSE;
}
