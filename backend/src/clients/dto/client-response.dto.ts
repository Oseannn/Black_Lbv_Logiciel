export class ClientResponseDto {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  type: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  totalSpent?: number;
}
