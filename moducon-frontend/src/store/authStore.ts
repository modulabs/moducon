import { create } from 'zustand';
import type { User } from '@/types';

const TOKEN_KEY = 'moducon_token';
const USER_KEY = 'moducon_user';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  login: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    set({ token: null, user: null, isAuthenticated: false });
  },

  updateUser: (userData) =>
    set((state) => {
      const newUser = state.user ? { ...state.user, ...userData } : null;
      if (newUser && typeof window !== 'undefined') {
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      }
      return { user: newUser };
    }),

  // 페이지 로드 시 localStorage에서 인증 상태 복원
  hydrate: () => {
    if (typeof window === 'undefined' || get().isHydrated) return;

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch (error) {
      console.error('인증 상태 복원 실패:', error);
      set({ isHydrated: true });
    }
  },
}));
