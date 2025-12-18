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
} from '@/pages';

function App() {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        {/* 시작/랜딩 페이지 */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/welcome" element={<LandingPage />} />
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

        {/* 404 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
