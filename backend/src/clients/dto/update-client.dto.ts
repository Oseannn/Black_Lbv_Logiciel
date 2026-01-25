import {
  IsBoolean,
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  Matches,
} from 'class-validator';
import { ClientType } from './create-client.dto';

export class UpdateClientDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[+]?[0-9\s-]{8,20}$/, {
    message: 'Numéro de téléphone invalide',
  })
  phone?: string;

  @IsEmail({}, { message: 'Email invalide' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(ClientType, { message: 'Type de client invalide' })
  @IsOptional()
  type?: ClientType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
