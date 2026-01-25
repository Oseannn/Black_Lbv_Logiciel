import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import type { User, AuthResponse } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        const response = await api.post<AuthResponse>('/auth/login', {
          email,
          password,
        });

        const { accessToken, refreshToken, user } = response.data;

        Cookies.set('accessToken', accessToken, { expires: 1, path: '/' });
        Cookies.set('refreshToken', refreshToken, { expires: 7, path: '/' });

        set({ user, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        Cookies.remove('accessToken', { path: '/' });
        Cookies.remove('refreshToken', { path: '/' });
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        const token = Cookies.get('accessToken');
        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          const response = await api.get<User>('/auth/me');
          set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch {
          Cookies.remove('accessToken', { path: '/' });
          Cookies.remove('refreshToken', { path: '/' });
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
