import { IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString({ message: 'URL du logo invalide' })
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  slogan?: string;

  @IsString()
  @IsOptional()
  invoiceFooter?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
