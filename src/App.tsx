import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Toast } from '@/components/common';
import {
  LandingPage,
  HomePage,
  OnboardingPage,
  LearnPage,
  RoleplayPage,
  StatsPage,
  SettingsPage,
  FamilyPage,
  ChatPage,
  KanaPage,
  LeaderboardPage,
  BadgePage,
  JContentPage,
  VocabularyPage,
  JourneyPage,
  ScenarioPage,
  JourneyEnPage,
  ScenarioEnPage,
  LevelTestPage,
  AvatarChatPage,
  LoginPage,
  AuthCallbackPage,
  WordQuizPage,
  GrammarPage,
  WritingPage,
  QuickLearnPage,
  MistakesPage,
  PricingPage,
} from '@/pages';
import { useAuthStore } from '@/stores';

function App() {
  const { initialize } = useAuthStore();

  // 앱 시작 시 인증 상태 초기화
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        {/* 시작/랜딩 페이지 */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/welcome" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/level-test" element={<LevelTestPage />} />
        <Route path="/avatar-chat" element={<AvatarChatPage />} />

        {/* 메인 라우트 (레이아웃 포함) */}
        <Route element={<Layout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/family" element={<FamilyPage />} />
        </Route>

        {/* 전체 화면 라우트 */}
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/roleplay" element={<RoleplayPage />} />
        <Route path="/kana" element={<KanaPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/badges" element={<BadgePage />} />
        <Route path="/jcontent" element={<JContentPage />} />
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/journey" element={<JourneyPage />} />
        <Route path="/scenario" element={<ScenarioPage />} />
        <Route path="/journey-en" element={<JourneyEnPage />} />
        <Route path="/scenario-en" element={<ScenarioEnPage />} />
        <Route path="/word-quiz" element={<WordQuizPage />} />
        <Route path="/grammar" element={<GrammarPage />} />
        <Route path="/writing" element={<WritingPage />} />
        <Route path="/quick-learn" element={<QuickLearnPage />} />
        <Route path="/mistakes" element={<MistakesPage />} />
        <Route path="/pricing" element={<PricingPage />} />

        {/* 404 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
