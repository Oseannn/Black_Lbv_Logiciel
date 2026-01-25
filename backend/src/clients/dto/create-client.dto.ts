import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  Matches,
} from 'class-validator';

export enum ClientType {
  VIP = 'VIP',
  REGULAR = 'REGULAR',
  OCCASIONAL = 'OCCASIONAL',
}

export class CreateClientDto {
  @IsString()
  @IsNotEmpty({ message: 'Nom du client requis' })
  name: string;

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
}
