import { PaymentMethod } from '@prisma/client';

export class SaleItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export class SaleResponseDto {
  id: string;
  userId: string;
  userName: string;
  caisseId: string;
  clientId: string | null;
  clientName: string | null;
  paymentMethod: PaymentMethod;
  items: SaleItemResponseDto[];
  total: number;
  createdAt: Date;
}

export class SaleReceiptDto {
  id: string;
  receiptNumber: string;
  companyName: string;
  companyAddress: string | null;
  companyPhone: string | null;
  companyLogo: string | null;
  vendeurName: string;
  clientName: string | null;
  items: SaleItemResponseDto[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  date: Date;
  footer: string | null;
}
