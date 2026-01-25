export class ProductResponseDto {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  size: string | null;
  color: string | null;
  price: number | string;
  stock: number;
  photo: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
