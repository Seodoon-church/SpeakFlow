import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarded: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isOnboarded: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setLoading: (loading) =>
        set({ isLoading: loading }),

      setOnboarded: (onboarded) =>
        set({ isOnboarded: onboarded }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isOnboarded: false,
        }),
    }),
    {
      name: 'speakflow-auth',
      partialize: (state) => ({
        isOnboarded: state.isOnboarded,
      }),
    }
  )
);
