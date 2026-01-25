import { create } from 'zustand';
import api from '@/lib/api';
import type { CaisseSummary, Caisse } from '@/types';

interface CaisseState {
  currentCaisse: CaisseSummary | null;
  isLoading: boolean;
  fetchCurrentCaisse: () => Promise<void>;
  openCaisse: (openingAmount: number) => Promise<Caisse>;
  closeCaisse: (closingAmount: number) => Promise<Caisse>;
  cashOut: (amount: number, reason: string) => Promise<void>;
}

export const useCaisseStore = create<CaisseState>((set) => ({
  currentCaisse: null,
  isLoading: false,

  fetchCurrentCaisse: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get<CaisseSummary | null>('/caisse/current');
      set({ currentCaisse: response.data, isLoading: false });
    } catch {
      set({ currentCaisse: null, isLoading: false });
    }
  },

  openCaisse: async (openingAmount: number) => {
    const response = await api.post<Caisse>('/caisse/open', { openingAmount });
    set({
      currentCaisse: {
        id: response.data.id,
        status: response.data.status,
        openingAmount: response.data.openingAmount,
        openedAt: response.data.openedAt,
        totalSales: 0,
        totalCashOut: 0,
        currentBalance: response.data.openingAmount,
      },
    });
    return response.data;
  },

  closeCaisse: async (closingAmount: number) => {
    const response = await api.post<Caisse>('/caisse/close', { closingAmount });
    set({ currentCaisse: null });
    return response.data;
  },

  cashOut: async (amount: number, reason: string) => {
    await api.post('/caisse/out', { amount, reason });
    // Refresh caisse
    const response = await api.get<CaisseSummary | null>('/caisse/current');
    set({ currentCaisse: response.data });
  },
}));
