import { create } from 'zustand';
import api from '../lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    set({ token, user, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isLoading: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, token: null, isLoading: false });
      return;
    }

    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.data.user, token, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isLoading: false });
    }
  },

  isAuthenticated: () => !!get().token,
}));

// Listen for global 401 events
window.addEventListener('unauthorized', () => {
  useAuthStore.getState().logout();
});
