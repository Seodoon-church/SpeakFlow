import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/common';
import {
  HomePage,
  LoginPage,
  OnboardingPage,
  LearnPage,
  RoleplayPage,
  StatsPage,
  SettingsPage,
} from '@/pages';
import { useAuthStore } from '@/stores';
import { supabase } from '@/lib/supabase';

// 인증이 필요한 라우트를 위한 래퍼
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuthStore();
  // 실제 배포 시 사용: const { isAuthenticated, isOnboarded, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 개발 모드에서는 인증 없이 접근 가능하도록 임시 처리
  // 실제 배포 시에는 아래 주석을 해제하세요
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  // if (!isOnboarded) {
  //   return <Navigate to="/onboarding" replace />;
  // }

  return <>{children}</>;
}

function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // 초기 세션 체크
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '사용자',
            track_id: '',
            daily_goal_minutes: 15,
            streak_days: 0,
            created_at: session.user.created_at,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setUser(null);
      }
    };

    checkSession();

    // 인증 상태 변화 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '사용자',
            track_id: '',
            daily_goal_minutes: 15,
            streak_days: 0,
            created_at: session.user.created_at,
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* 인증 필요 라우트 (레이아웃 포함) */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* 인증 필요 라우트 (레이아웃 없음) */}
        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <LearnPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roleplay"
          element={
            <ProtectedRoute>
              <RoleplayPage />
            </ProtectedRoute>
          }
        />

        {/* 404 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
