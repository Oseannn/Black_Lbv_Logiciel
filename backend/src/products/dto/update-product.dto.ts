import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Prix invalide' })
  @Min(0, { message: 'Le prix doit être positif' })
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsNumber({}, { message: 'Stock invalide' })
  @Min(0, { message: 'Le stock doit être positif ou nul' })
  @IsOptional()
  @Type(() => Number)
  stock?: number;

  @IsString({ message: 'URL de photo invalide' })
  @IsOptional()
  photo?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
