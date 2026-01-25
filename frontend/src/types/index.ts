// Enums
export type Role = 'ADMIN' | 'VENDEUSE';
export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_MONEY';
export type CaisseStatus = 'OPEN' | 'CLOSED';

// User
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

// Auth
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Product
export interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  size: string | null;
  color: string | null;
  price: number;
  stock: number;
  photo: string | null;
  isActive: boolean;
}

// Client Type
export type ClientType = 'VIP' | 'REGULAR' | 'OCCASIONAL';

// Client
export interface Client {
  id: string;
  name: string;
  phone: string | null;
  email?: string | null;
  notes?: string | null;
  type?: ClientType;
  totalSpent?: number;
  isActive: boolean;
  createdAt?: string;
}

// Caisse
export interface CaisseSummary {
  id: string;
  status: CaisseStatus;
  openingAmount: number;
  openedAt: string;
  totalSales: number;
  totalCashOut: number;
  currentBalance: number;
}

export interface CashMovement {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface Caisse {
  id: string;
  userId: string;
  userName: string;
  status: CaisseStatus;
  openingAmount: number;
  closingAmount: number | null;
  expectedAmount: number | null;
  difference: number | null;
  openedAt: string;
  closedAt: string | null;
  cashMovements: CashMovement[];
  totalSales: number;
}

// Sale
export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  userId: string;
  userName: string;
  caisseId: string;
  clientId: string | null;
  clientName: string | null;
  paymentMethod: PaymentMethod;
  items: SaleItem[];
  total: number;
  createdAt: string;
}

export interface SaleReceipt {
  id: string;
  receiptNumber: string;
  companyName: string;
  companyAddress: string | null;
  companyPhone: string | null;
  companyLogo: string | null;
  vendeurName: string;
  clientName: string | null;
  items: SaleItem[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  date: string;
  footer: string | null;
}

// Cart
export interface CartItem {
  product: Product;
  quantity: number;
}

// Settings
export interface Settings {
  id: string;
  companyName: string;
  logo: string | null;
  currency: string;
  slogan: string | null;
  invoiceFooter: string | null;
  address: string | null;
  phone: string | null;
}

// Dashboard
export interface DashboardSummary {
  todaySales: number;
  todayAmount: number;
  monthSales: number;
  monthAmount: number;
  openCaisses: number;
  lowStockProducts: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    totalAmount: number;
  }>;
}
