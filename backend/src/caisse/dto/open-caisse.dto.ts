import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OpenCaisseDto {
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Montant invalide' })
  @Min(0, { message: 'Le montant doit être positif ou nul' })
  @Type(() => Number)
  openingAmount: number;
}
