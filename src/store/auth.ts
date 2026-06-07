import { create } from 'zustand';
import { getToken, setToken, removeToken } from '@/lib/auth';
import type { User } from '@/lib/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  login: (token, user) => {
    setToken(token);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    removeToken();
    set({ token: null, user: null, isAuthenticated: false });
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  hydrate: () => {
    const token = getToken();
    if (token) {
      set({ token, isAuthenticated: true });
    }
  },
}));
