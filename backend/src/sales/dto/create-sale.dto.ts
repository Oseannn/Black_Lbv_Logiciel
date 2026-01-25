import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class SaleItemDto {
  @IsUUID('4', { message: 'ID produit invalide' })
  @IsNotEmpty({ message: 'ID produit requis' })
  productId: string;

  @IsNumber({}, { message: 'Quantité invalide' })
  @Min(1, { message: 'La quantité doit être au moins 1' })
  @Type(() => Number)
  quantity: number;
}

export class CreateSaleDto {
  @IsUUID('4', { message: 'ID client invalide' })
  @IsOptional()
  clientId?: string;

  @IsEnum(PaymentMethod, { message: 'Moyen de paiement invalide (CASH, CARD, MOBILE_MONEY)' })
  @IsNotEmpty({ message: 'Moyen de paiement requis' })
  paymentMethod: PaymentMethod;

  @IsArray({ message: 'Articles requis' })
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  @IsNotEmpty({ message: 'Au moins un article requis' })
  items: SaleItemDto[];
}
