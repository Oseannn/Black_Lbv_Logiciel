import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Nom du produit requis' })
  name: string;

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
  @Type(() => Number)
  price: number;

  @IsNumber({}, { message: 'Stock invalide' })
  @Min(0, { message: 'Le stock doit être positif ou nul' })
  @IsOptional()
  @Type(() => Number)
  stock?: number = 0;

  @IsString({ message: 'URL de photo invalide' })
  @IsOptional()
  photo?: string;
}
