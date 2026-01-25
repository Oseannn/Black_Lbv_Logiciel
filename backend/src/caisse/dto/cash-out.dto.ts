import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CashOutDto {
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Montant invalide' })
  @Min(0.01, { message: 'Le montant doit être supérieur à 0' })
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsNotEmpty({ message: 'Motif de la sortie requis' })
  reason: string;
}
