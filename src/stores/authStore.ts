import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, auth } from '@/lib/supabase';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarded: boolean;

  // Actions
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithKakao: () => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      supabaseUser: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
      isOnboarded: false,

      // 앱 시작 시 세션 초기화
      initialize: async () => {
        set({ isLoading: true });

        try {
          const { data } = await auth.getSession();

          if (data.session) {
            const supabaseUser = data.session.user;
            // 기본 User 객체 생성
            const user: User = {
              id: supabaseUser.id,
              email: supabaseUser.email || '',
              name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
              track_id: 'daily-life',
              daily_goal_minutes: 15,
              streak_days: 0,
              created_at: supabaseUser.created_at || new Date().toISOString(),
            };

            set({
              supabaseUser,
              session: data.session,
              user,
              isAuthenticated: true,
            });
          }

          // Auth 상태 변경 리스너
          supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              const supabaseUser = session.user;
              const user: User = {
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
                track_id: 'daily-life',
                daily_goal_minutes: 15,
                streak_days: 0,
                created_at: supabaseUser.created_at || new Date().toISOString(),
              };

              set({
                supabaseUser,
                session,
                user,
                isAuthenticated: true,
              });
            } else {
              set({
                supabaseUser: null,
                session: null,
                user: null,
                isAuthenticated: false,
              });
            }
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Google 로그인
      signInWithGoogle: async () => {
        set({ isLoading: true });
        try {
          const { error } = await auth.signInWithGoogle();
          if (error) throw error;
          return { error: null };
        } catch (error) {
          console.error('Google sign in error:', error);
          return { error: error as Error };
        } finally {
          set({ isLoading: false });
        }
      },

      // Kakao 로그인
      signInWithKakao: async () => {
        set({ isLoading: true });
        try {
          const { error } = await auth.signInWithKakao();
          if (error) throw error;
          return { error: null };
        } catch (error) {
          console.error('Kakao sign in error:', error);
          return { error: error as Error };
        } finally {
          set({ isLoading: false });
        }
      },

      // 이메일 로그인
      signInWithEmail: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await auth.signIn(email, password);
          if (error) throw error;

          if (data.user) {
            const user: User = {
              id: data.user.id,
              email: data.user.email || '',
              name: data.user.user_metadata?.name || email.split('@')[0],
              track_id: 'daily-life',
              daily_goal_minutes: 15,
              streak_days: 0,
              created_at: data.user.created_at || new Date().toISOString(),
            };

            set({
              supabaseUser: data.user,
              session: data.session,
              user,
              isAuthenticated: true,
            });
          }

          return { error: null };
        } catch (error) {
          console.error('Email sign in error:', error);
          return { error: error as Error };
        } finally {
          set({ isLoading: false });
        }
      },

      // 이메일 회원가입
      signUpWithEmail: async (email: string, password: string, name: string) => {
        set({ isLoading: true });
        try {
          const { error } = await auth.signUp(email, password, name);
          if (error) throw error;
          return { error: null };
        } catch (error) {
          console.error('Email sign up error:', error);
          return { error: error as Error };
        } finally {
          set({ isLoading: false });
        }
      },

      // 로그아웃
      signOut: async () => {
        set({ isLoading: true });
        try {
          await auth.signOut();
          set({
            supabaseUser: null,
            session: null,
            user: null,
            isAuthenticated: false,
            isOnboarded: false,
          });
        } catch (error) {
          console.error('Sign out error:', error);
        } finally {
          set({ isLoading: false });
        }
      },

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

      logout: () => {
        get().signOut();
      },
    }),
    {
      name: 'speakflow-auth',
      partialize: (state) => ({
        isOnboarded: state.isOnboarded,
      }),
    }
  )
);
