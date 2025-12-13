import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// 인증 관련 헬퍼 함수들
export const auth = {
  // 이메일 회원가입
  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    return { data, error };
  },

  // 이메일 로그인
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // 소셜 로그인 (Google)
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  },

  // 소셜 로그인 (Kakao)
  signInWithKakao: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  },

  // 로그아웃
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 현재 세션 가져오기
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  // 현재 사용자 가져오기
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  },

  // 비밀번호 재설정 이메일 전송
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  },

  // 비밀번호 업데이트
  updatePassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  },
};

// 데이터베이스 헬퍼 함수들
export const db = {
  // 사용자 프로필 가져오기
  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // 사용자 프로필 업데이트
  updateUserProfile: async (userId: string, updates: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // 학습 트랙 목록 가져오기
  getTracks: async () => {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .order('id');
    return { data, error };
  },

  // 청크 가져오기 (트랙별, 주차별)
  getChunks: async (trackId: string, week?: number) => {
    let query = supabase
      .from('chunks')
      .select('*')
      .eq('track_id', trackId)
      .order('week')
      .order('day');

    if (week) {
      query = query.eq('week', week);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // 사용자 학습 진도 가져오기
  getUserProgress: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*, chunk:chunks(*)')
      .eq('user_id', userId);
    return { data, error };
  },

  // 학습 진도 업데이트
  updateProgress: async (
    userId: string,
    chunkId: string,
    proficiency: number,
    nextReviewAt: string
  ) => {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        chunk_id: chunkId,
        proficiency,
        next_review_at: nextReviewAt,
        last_reviewed_at: new Date().toISOString(),
      })
      .select()
      .single();
    return { data, error };
  },

  // 학습 세션 기록
  recordSession: async (session: {
    user_id: string;
    duration_minutes: number;
    chunks_learned: number;
    chunks_reviewed: number;
    scenarios_completed: number;
  }) => {
    const { data, error } = await supabase
      .from('learning_sessions')
      .insert({
        ...session,
        date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();
    return { data, error };
  },

  // 시나리오 가져오기
  getScenarios: async (trackId: string, week?: number) => {
    let query = supabase
      .from('scenarios')
      .select('*')
      .eq('track_id', trackId);

    if (week) {
      query = query.eq('week', week);
    }

    const { data, error } = await query;
    return { data, error };
  },
};
