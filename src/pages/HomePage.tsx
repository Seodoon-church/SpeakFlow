import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame,
  ChevronRight,
  Trophy,
  Users,
  ChevronDown,
  MessageCircle,
  Sparkles,
  Video,
  Mic,
  Target,
  Zap,
  Clock,
  BookOpen,
  Award,
  TrendingUp,
  Shield,
  Gift,
  Gem,
  Snowflake,
  PenTool,
  Timer,
  AlertCircle,
} from 'lucide-react';
import { useLearningStore, useFamilyStore, TRACKS, useLanguageStore, useAuthStore, useLeagueStore } from '@/stores';
import { useChatHistoryStore } from '@/stores/chatHistoryStore';
import { Avatar } from '@/components/common';
import { LANGUAGES, type LearningLanguage } from '@/types';

// 리그 티어 색상 매핑
const LEAGUE_COLORS: Record<string, string> = {
  bronze: 'from-orange-500 to-orange-700',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-500 to-amber-600',
  platinum: 'from-cyan-400 to-teal-600',
  diamond: 'from-purple-500 to-indigo-700',
};

export default function HomePage() {
  const navigate = useNavigate();
  const { currentTrack, setCurrentTrack } = useLearningStore();
  const { members, currentMemberId, setCurrentMember } = useFamilyStore();
  const { currentLanguage, setLanguage } = useLanguageStore();
  const { user } = useAuthStore();
  const { gamification, getRecentSessions, currentLevel, initDailyQuests, claimQuestReward } = useChatHistoryStore();
  const {
    currentLeague,
    weeklyXP,
    weeklyLeague,
    initializeWeeklyLeague,
    getMyRank,
    getTierInfo,
  } = useLeagueStore();
  const [showFamilySelector, setShowFamilySelector] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // 현재 학습 언어 정보
  const currentLangInfo = LANGUAGES.find(l => l.id === currentLanguage);

  // 현재 가족 구성원
  const currentMember = members.find(m => m.id === currentMemberId);

  // 최근 대화 세션
  const recentSessions = getRecentSessions(3);

  // 현재 언어 레벨
  const currentLangLevel = currentLevel[currentLanguage] || null;

  // 가족 구성원의 트랙으로 currentTrack 동기화
  useEffect(() => {
    if (currentMember) {
      const track = TRACKS.find(t => t.id === currentMember.trackId);
      if (track && track.id !== currentTrack?.id) {
        setCurrentTrack(track);
      }
    }
  }, [currentMember, currentTrack?.id, setCurrentTrack]);

  // 일일 퀘스트 초기화 & 리그 초기화
  useEffect(() => {
    initDailyQuests();
    if (!weeklyLeague) {
      initializeWeeklyLeague();
    }
  }, [initDailyQuests, weeklyLeague, initializeWeeklyLeague]);

  // 리그 정보
  const tierInfo = getTierInfo(currentLeague);
  const myRank = getMyRank();

  // 현재 가족 구성원 데이터 사용
  const displayName = user?.name || currentMember?.name || '학습자';
  const streakDays = gamification.streak.current || currentMember?.streakDays || 0;

  // 가족 구성원 전환
  const handleMemberChange = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setCurrentMember(memberId);
      const track = TRACKS.find(t => t.id === member.trackId);
      if (track) {
        setCurrentTrack(track);
      }
    }
    setShowFamilySelector(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="px-4 pt-6 pb-24">
        {/* 헤더 */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentMember && (
                <Avatar
                  avatar={currentMember.avatar}
                  avatarUrl={currentMember.avatarUrl}
                  size="lg"
                  className="bg-primary-100"
                />
              )}
              <div>
                <p className="text-gray-500 text-sm">
                  {new Date().getHours() < 12 ? '좋은 아침이에요' :
                   new Date().getHours() < 18 ? '안녕하세요' : '좋은 저녁이에요'}
                </p>
                <h1 className="text-xl font-bold text-foreground">
                  {displayName}님
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 언어 선택 */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowLanguageSelector(!showLanguageSelector);
                    setShowFamilySelector(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white shadow-sm border border-gray-100 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
                >
                  <span className="text-lg">{currentLangInfo?.flag}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showLanguageSelector ? 'rotate-180' : ''}`} />
                </button>

                {showLanguageSelector && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 min-w-[140px] animate-slide-down">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => {
                          setLanguage(lang.id as LearningLanguage);
                          setShowLanguageSelector(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                          currentLanguage === lang.id ? 'bg-primary-50' : ''
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="text-sm font-medium text-gray-700">{lang.name}</span>
                        {currentLanguage === lang.id && (
                          <span className="ml-auto text-primary-500">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 프로필 전환 */}
              {members.length > 0 && (
                <button
                  onClick={() => {
                    setShowFamilySelector(!showFamilySelector);
                    setShowLanguageSelector(false);
                  }}
                  className="p-2 bg-white shadow-sm border border-gray-100 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <Users className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* 가족 구성원 선택 드롭다운 */}
          {showFamilySelector && members.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              {members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleMemberChange(member.id)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                    currentMemberId === member.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <Avatar avatar={member.avatar} avatarUrl={member.avatarUrl} size="md" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-gray-500">
                      {TRACKS.find(t => t.id === member.trackId)?.name}
                    </p>
                  </div>
                  {currentMemberId === member.id && (
                    <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">현재</span>
                  )}
                </button>
              ))}
              <button
                onClick={() => {
                  setShowFamilySelector(false);
                  navigate('/family');
                }}
                className="w-full p-3 text-center text-sm text-primary-600 border-t border-gray-100 hover:bg-gray-50 font-medium"
              >
                + 프로필 관리
              </button>
            </motion.div>
          )}
        </header>

        {/* 상태 카드 */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {/* 스트릭 */}
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-3 text-white">
            <Flame className="w-4 h-4 mb-1 opacity-80" />
            <p className="text-xl font-bold">{streakDays}</p>
            <p className="text-[10px] opacity-80">연속</p>
          </div>

          {/* XP & 레벨 */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-3 text-white">
            <Zap className="w-4 h-4 mb-1 opacity-80" />
            <p className="text-xl font-bold">Lv.{gamification.level}</p>
            <p className="text-[10px] opacity-80">{gamification.xp} XP</p>
          </div>

          {/* 젬 */}
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-3 text-white">
            <Gem className="w-4 h-4 mb-1 opacity-80" />
            <p className="text-xl font-bold">{gamification.gems}</p>
            <p className="text-[10px] opacity-80">젬</p>
          </div>

          {/* 프리즈 */}
          <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl p-3 text-white">
            <Snowflake className="w-4 h-4 mb-1 opacity-80" />
            <p className="text-xl font-bold">{gamification.streak.freezeCount}</p>
            <p className="text-[10px] opacity-80">프리즈</p>
          </div>
        </div>

        {/* 리그 카드 */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => navigate('/leaderboard')}
          className={`w-full bg-gradient-to-r ${LEAGUE_COLORS[currentLeague]} rounded-2xl p-4 text-white mb-6 text-left relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{tierInfo.icon}</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{tierInfo.nameKo} 리그</span>
                  <Shield className="w-4 h-4 opacity-60" />
                </div>
                <p className="text-sm opacity-80">
                  {myRank}위 · 이번 주 {weeklyXP} XP
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-60" />
          </div>
        </motion.button>

        {/* 메인 AI 기능 - 아바타 채팅 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/avatar-chat')}
          className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-6 text-white mb-6 text-left shadow-xl shadow-purple-200 relative overflow-hidden"
        >
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl" />

          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                  AI 대화
                </span>
                <span className="px-2 py-1 bg-green-400/30 rounded-full text-xs font-medium text-green-100">
                  추천
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-1">AI 아바타와 대화하기</h2>
              <p className="text-sm opacity-80">음성으로 자연스럽게 회화 연습</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Video className="w-8 h-8" />
            </div>
          </div>

          <div className="relative flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center gap-1.5 text-sm">
              <MessageCircle className="w-4 h-4 opacity-60" />
              <span className="opacity-80">프리토킹</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 opacity-60" />
              <span className="opacity-80">시뮬레이션</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Mic className="w-4 h-4 opacity-60" />
              <span className="opacity-80">발음 연습</span>
            </div>
          </div>
        </motion.button>

        {/* AI 기능 그리드 */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">AI 학습 도구</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 상황 시뮬레이션 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/avatar-chat?mode=simulation')}
              className="bg-white rounded-2xl p-4 text-left shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-3">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-foreground mb-1">상황 시뮬레이션</h4>
              <p className="text-xs text-gray-500">원하는 상황을 말하면 AI가 시나리오 생성</p>
              <div className="mt-2">
                <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">NEW</span>
              </div>
            </motion.button>

            {/* 발음 평가 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/avatar-chat?mode=pronunciation')}
              className="bg-white rounded-2xl p-4 text-left shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center mb-3">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-foreground mb-1">발음 평가</h4>
              <p className="text-xs text-gray-500">AI가 발음을 분석하고 교정 피드백</p>
              <div className="mt-2">
                <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">AI 분석</span>
              </div>
            </motion.button>

            {/* 레벨 테스트 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/level-test')}
              className="bg-white rounded-2xl p-4 text-left shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-foreground mb-1">레벨 테스트</h4>
              <p className="text-xs text-gray-500">나의 실력을 CEFR 기준으로 측정</p>
              <div className="mt-2">
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  {currentLangLevel ? `현재 ${currentLangLevel}` : '테스트 하기'}
                </span>
              </div>
            </motion.button>

            {/* 트랙 학습 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/learn')}
              className="bg-white rounded-2xl p-4 text-left shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-foreground mb-1">오늘의 학습</h4>
              <p className="text-xs text-gray-500">15분 체계적 학습 플로우</p>
              <div className="mt-2">
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {currentTrack?.name || '시작하기'}
                </span>
              </div>
            </motion.button>
          </div>
        </section>

        {/* 단어 & 문법 & 작문 학습 카드 */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {/* 단어 퀴즈 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/word-quiz')}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-3 text-white text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm">단어</span>
              <p className="text-[10px] opacity-80 mt-0.5">4지선다 퀴즈</p>
            </div>
          </motion.button>

          {/* 문법 학습 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/grammar')}
            className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-3 text-white text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2">
                <Award className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm">문법</span>
              <p className="text-[10px] opacity-80 mt-0.5">핵심 문법</p>
            </div>
          </motion.button>

          {/* 영작 연습 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/writing')}
            className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-2xl p-3 text-white text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2">
                <PenTool className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm">영작</span>
              <p className="text-[10px] opacity-80 mt-0.5">AI 첨삭</p>
            </div>
          </motion.button>
        </div>

        {/* 5분 학습 & 실수 복습 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* 오늘의 5분 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/quick-learn')}
            className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl p-4 text-white text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-6 h-6" />
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">5분</span>
              </div>
              <span className="font-bold text-lg">오늘의 5분</span>
              <p className="text-xs opacity-80 mt-1">단어 5개 + 문장 3개 + 대화</p>
            </div>
          </motion.button>

          {/* 실수에서 배우기 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/mistakes')}
            className="bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl p-4 text-white text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-6 h-6" />
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">복습</span>
              </div>
              <span className="font-bold text-lg">실수 노트</span>
              <p className="text-xs opacity-80 mt-1">틀린 표현 모아서 복습</p>
            </div>
          </motion.button>
        </div>

        {/* 일일 퀘스트 */}
        {gamification.dailyQuests.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-bold text-foreground">오늘의 퀘스트</h3>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {gamification.dailyQuests.filter(q => q.completed).length}/{gamification.dailyQuests.length} 완료
              </span>
            </div>

            <div className="space-y-2">
              {gamification.dailyQuests.map((quest) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-xl p-3 shadow-sm border ${
                    quest.completed ? 'border-green-200 bg-green-50' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      quest.type === 'chat' ? 'bg-purple-100' :
                      quest.type === 'words' ? 'bg-blue-100' :
                      quest.type === 'grammar' ? 'bg-amber-100' :
                      'bg-green-100'
                    }`}>
                      {quest.type === 'chat' ? (
                        <MessageCircle className={`w-5 h-5 ${quest.completed ? 'text-green-500' : 'text-purple-600'}`} />
                      ) : quest.type === 'words' ? (
                        <BookOpen className={`w-5 h-5 ${quest.completed ? 'text-green-500' : 'text-blue-600'}`} />
                      ) : quest.type === 'grammar' ? (
                        <Award className={`w-5 h-5 ${quest.completed ? 'text-green-500' : 'text-amber-600'}`} />
                      ) : (
                        <Flame className={`w-5 h-5 ${quest.completed ? 'text-green-500' : 'text-green-600'}`} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${quest.completed ? 'text-green-700' : 'text-foreground'}`}>
                        {quest.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {/* 프로그레스 바 */}
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              quest.completed ? 'bg-green-500' : 'bg-primary-500'
                            }`}
                            style={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {quest.progress}/{quest.target}
                        </span>
                      </div>
                    </div>

                    {/* 보상 또는 완료 버튼 */}
                    {quest.completed ? (
                      <button
                        onClick={() => claimQuestReward(quest.id)}
                        className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
                      >
                        <Gift className="w-3 h-3" />
                        받기
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-primary-600 text-xs font-medium">
                        <Zap className="w-3 h-3" />
                        +{quest.xpReward}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* 오늘의 목표 */}
        <section className="mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-500" />
                <h4 className="font-bold text-foreground">일일 XP 목표</h4>
              </div>
              <span className="text-sm text-gray-500">{gamification.dailyXp}/{gamification.dailyGoalXp} XP</span>
            </div>

            {/* 프로그레스 바 */}
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((gamification.dailyXp / gamification.dailyGoalXp) * 100, 100)}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
              />
            </div>

            {gamification.dailyXp >= gamification.dailyGoalXp ? (
              <p className="mt-2 text-sm text-green-600 font-medium flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                오늘 목표 달성!
              </p>
            ) : (
              <p className="mt-2 text-xs text-gray-500">
                {gamification.dailyGoalXp - gamification.dailyXp} XP 더 모으면 오늘 목표 달성!
              </p>
            )}
          </div>
        </section>

        {/* 최근 대화 기록 */}
        {recentSessions.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">최근 대화</h3>
              <button
                onClick={() => navigate('/stats')}
                className="text-sm text-primary-600 font-medium flex items-center gap-1"
              >
                전체 보기 <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    session.mode === 'freetalk' ? 'bg-orange-100' :
                    session.mode === 'simulation' ? 'bg-cyan-100' : 'bg-purple-100'
                  }`}>
                    {session.mode === 'freetalk' ? (
                      <MessageCircle className="w-5 h-5 text-orange-600" />
                    ) : session.mode === 'simulation' ? (
                      <Target className="w-5 h-5 text-cyan-600" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{session.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {session.duration ? `${Math.floor(session.duration / 60)}분` : '방금'}
                      <span className="text-gray-300">•</span>
                      {new Date(session.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 배지 & 리더보드 */}
        <section className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/badges')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-foreground">내 배지</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{gamification.badges.length}개</p>
            <p className="text-xs text-gray-500">획득한 배지</p>
          </button>

          <button
            onClick={() => navigate('/leaderboard')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-foreground">리더보드</span>
            </div>
            <div className="flex -space-x-2">
              {members.slice(0, 4).map((member, i) => (
                <div
                  key={member.id}
                  className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-sm"
                  style={{ zIndex: 4 - i }}
                >
                  {member.avatar}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">가족 랭킹 확인</p>
          </button>
        </section>

        {/* 언어별 추가 기능 */}
        {currentLanguage === 'ja' && (
          <section className="mt-6">
            <h3 className="text-lg font-bold text-foreground mb-3">일본어 학습</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/kana')}
                className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-4 text-white text-left"
              >
                <span className="text-2xl mb-2 block">あア</span>
                <p className="font-bold">가나 학습</p>
                <p className="text-xs opacity-80">히라가나 / 가타카나</p>
              </button>
              <button
                onClick={() => navigate('/journey')}
                className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl p-4 text-white text-left"
              >
                <span className="text-2xl mb-2 block">🗾</span>
                <p className="font-bold">일본 여행</p>
                <p className="text-xs opacity-80">가상 여행 체험</p>
              </button>
            </div>
          </section>
        )}

        {currentLanguage === 'en' && (
          <section className="mt-6">
            <h3 className="text-lg font-bold text-foreground mb-3">영어 학습</h3>
            <button
              onClick={() => navigate('/journey-en')}
              className="w-full bg-gradient-to-r from-blue-500 to-red-500 rounded-2xl p-4 text-white text-left flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🇺🇸</span>
                  <span className="text-xl">🇬🇧</span>
                </div>
                <p className="font-bold">English Journey</p>
                <p className="text-sm opacity-80">미국 & 영국 가상 여행</p>
              </div>
              <ChevronRight className="w-6 h-6 opacity-60" />
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
