export class SettingsResponseDto {
  id: string;
  companyName: string;
  logo: string | null;
  currency: string;
  slogan: string | null;
  invoiceFooter: string | null;
  address: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}
