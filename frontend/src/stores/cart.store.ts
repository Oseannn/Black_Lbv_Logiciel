import { create } from 'zustand';
import type { Product, CartItem, PaymentMethod, Client } from '@/types';

interface CartState {
  items: CartItem[];
  client: Client | null;
  paymentMethod: PaymentMethod;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setClient: (client: Client | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  client: null,
  paymentMethod: 'CASH',

  addItem: (product: Product) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.product.id === product.id);

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return { items: [...state.items, { product, quantity: 1 }] };
    });
  },

  removeItem: (productId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    }));
  },

  setClient: (client: Client | null) => set({ client }),

  setPaymentMethod: (method: PaymentMethod) => set({ paymentMethod: method }),

  clearCart: () => set({ items: [], client: null, paymentMethod: 'CASH' }),

  getTotal: () => {
    return get().items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
