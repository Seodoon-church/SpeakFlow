import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  Users,
  ChevronRight,
  Volume2,
  Info,
  Mail,
  Globe,
  Crown,
  Sparkles,
} from 'lucide-react';
import { useLearningStore, TRACKS, useFamilyStore, useLanguageStore, useSubscriptionStore } from '@/stores';
import { LANGUAGES, type LearningLanguage } from '@/types';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { members, currentMemberId } = useFamilyStore();
  const currentMember = members.find((m) => m.id === currentMemberId);
  const { currentTrack, setCurrentTrack } = useLearningStore();
  const { currentLanguage, setLanguage } = useLanguageStore();
  const { subscription, getCurrentPlan, isPremium, getDaysRemaining } = useSubscriptionStore();
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentLangInfo = LANGUAGES.find((l) => l.id === currentLanguage);
  const currentPlan = getCurrentPlan();
  const daysRemaining = getDaysRemaining();

  const handleLanguageChange = (langId: LearningLanguage) => {
    setLanguage(langId);
    setShowLanguageModal(false);
  };

  const handleTrackChange = (trackId: string) => {
    const track = TRACKS.find((t) => t.id === trackId);
    if (track) {
      setCurrentTrack(track);
      setShowTrackModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 */}
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">설정</h1>
      </header>

      {/* 프로필 섹션 */}
      <section className="px-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">{currentMember?.avatar || '👤'}</span>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg text-foreground">
                {currentMember?.name || '프로필 선택'}
              </h2>
              <p className="text-sm text-gray-500">
                {currentMember ? `${currentMember.trackId} 트랙` : '가족 구성원을 선택하세요'}
              </p>
            </div>
            <button
              onClick={() => navigate('/family')}
              className="text-primary-500 text-sm font-medium"
            >
              변경
            </button>
          </div>
        </div>
      </section>

      {/* 구독 섹션 */}
      <section className="px-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-2 px-1">구독</h3>
        <div className="card">
          <button
            onClick={() => navigate('/pricing')}
            className={`w-full p-4 rounded-xl ${
              isPremium()
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                : 'bg-gradient-to-r from-gray-100 to-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isPremium() ? (
                  <Crown className="w-6 h-6" />
                ) : (
                  <Sparkles className="w-6 h-6 text-gray-400" />
                )}
                <div className="text-left">
                  <p className="font-bold">{currentPlan.nameKo} 플랜</p>
                  <p className={`text-sm ${isPremium() ? 'opacity-80' : 'text-gray-500'}`}>
                    {subscription.status === 'trial'
                      ? `무료 체험 ${daysRemaining}일 남음`
                      : isPremium()
                      ? '무제한 학습 이용 중'
                      : '프리미엄으로 업그레이드'}
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 ${isPremium() ? 'text-white/60' : 'text-gray-300'}`} />
            </div>
          </button>
        </div>
      </section>

      {/* 학습 설정 */}
      <section className="px-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-2 px-1">학습 설정</h3>
        <div className="card divide-y divide-gray-100">
          {/* 학습 언어 */}
          <button
            onClick={() => setShowLanguageModal(true)}
            className="w-full flex items-center justify-between py-3"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <span className="text-foreground">학습 언어</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {currentLangInfo?.flag} {currentLangInfo?.name || '영어'}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          </button>

          {/* 학습 트랙 */}
          <button
            onClick={() => setShowTrackModal(true)}
            className="w-full flex items-center justify-between py-3"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <span className="text-foreground">학습 트랙</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {currentTrack?.name || '선택 안함'}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          </button>

          {/* 일일 목표 */}
          <button className="w-full flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-gray-400">🎯</span>
              <span className="text-foreground">일일 목표</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {currentMember?.dailyGoalMinutes || 15}분
              </span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          </button>

          {/* 음성 속도 */}
          <button className="w-full flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <span className="text-foreground">음성 속도</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">보통</span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          </button>
        </div>
      </section>

      {/* 알림 설정 */}
      <section className="px-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-2 px-1">알림</h3>
        <div className="card divide-y divide-gray-100">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="text-foreground">학습 알림</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-gray-400">🔊</span>
              <span className="text-foreground">효과음</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </section>

      {/* 가족 관리 */}
      <section className="px-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-2 px-1">가족</h3>
        <div className="card">
          <button
            onClick={() => navigate('/family')}
            className="w-full flex items-center justify-between py-3"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-foreground">가족 구성원 관리</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-primary-500">각자 학습하기</span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          </button>
        </div>
      </section>

      {/* 기타 */}
      <section className="px-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-2 px-1">기타</h3>
        <div className="card divide-y divide-gray-100">
          <button className="w-full flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-gray-400" />
              <span className="text-foreground">앱 정보</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">v1.0.0</span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          </button>

          <button className="w-full flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-foreground">문의하기</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </section>

      {/* 트랙 선택 모달 */}
      {showTrackModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-foreground mb-4">학습 트랙 선택</h3>
            <div className="space-y-3">
              {TRACKS.map((track) => (
                <button
                  key={track.id}
                  onClick={() => handleTrackChange(track.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    currentTrack?.id === track.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{track.icon}</span>
                    <div>
                      <h4 className="font-semibold text-foreground">{track.name}</h4>
                      <p className="text-sm text-gray-500">{track.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTrackModal(false)}
              className="w-full mt-4 py-3 text-gray-500"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 언어 선택 모달 */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">학습 언어 선택</h3>
            <div className="space-y-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    currentLanguage === lang.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{lang.flag}</span>
                    <div>
                      <h4 className="font-semibold text-foreground">{lang.name}</h4>
                      <p className="text-sm text-gray-500">{lang.nativeName}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLanguageModal(false)}
              className="w-full mt-4 py-3 text-gray-500"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
