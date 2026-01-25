import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class ReportFiltersDto {
  @IsDateString({}, { message: 'Date de début invalide' })
  @IsOptional()
  startDate?: string;

  @IsDateString({}, { message: 'Date de fin invalide' })
  @IsOptional()
  endDate?: string;

  @IsUUID('4', { message: 'ID vendeuse invalide' })
  @IsOptional()
  userId?: string;
}
