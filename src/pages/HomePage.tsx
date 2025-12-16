import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Flame, Target, ChevronRight, Trophy, Users, ChevronDown, Tv, Music, Brain } from 'lucide-react';
import { useLearningStore, useFamilyStore, TRACKS, useLanguageStore } from '@/stores';
import { Avatar } from '@/components/common';
import { LANGUAGES, type LearningLanguage } from '@/types';

export default function HomePage() {
  const navigate = useNavigate();
  const { currentTrack, setCurrentTrack } = useLearningStore();
  const { members, currentMemberId, setCurrentMember } = useFamilyStore();
  const { currentLanguage, setLanguage } = useLanguageStore();
  const [showFamilySelector, setShowFamilySelector] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // 현재 학습 언어 정보
  const currentLangInfo = LANGUAGES.find(l => l.id === currentLanguage);

  // 현재 가족 구성원
  const currentMember = members.find(m => m.id === currentMemberId);

  // 가족 구성원의 트랙으로 currentTrack 동기화
  useEffect(() => {
    if (currentMember) {
      const track = TRACKS.find(t => t.id === currentMember.trackId);
      if (track && track.id !== currentTrack?.id) {
        setCurrentTrack(track);
      }
    }
  }, [currentMember, currentTrack?.id, setCurrentTrack]);

  // 현재 가족 구성원 데이터 사용
  const displayName = currentMember?.name || '학습자';
  const streakDays = currentMember?.streakDays || 0;
  const dailyGoal = currentMember?.dailyGoalMinutes || 15;
  const todayMinutes = 0;
  const progressPercent = Math.min((todayMinutes / dailyGoal) * 100, 100);

  // 가족 구성원의 트랙 정보
  const memberTrack = currentMember
    ? TRACKS.find(t => t.id === currentMember.trackId)
    : currentTrack;

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
    <div className="px-4 pt-6 pb-4">
      {/* 헤더 */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 아바타 (가족 모드일 때) */}
            {currentMember && (
              <Avatar
                avatar={currentMember.avatar}
                avatarUrl={currentMember.avatarUrl}
                size="lg"
                className="bg-primary-100"
              />
            )}
            <div>
              <p className="text-gray-500 text-sm">안녕하세요</p>
              <h1 className="text-2xl font-bold text-foreground">
                {displayName}님 👋
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            {/* 현재 학습 언어 드롭다운 */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLanguageSelector(!showLanguageSelector);
                  setShowFamilySelector(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-medium transition-colors"
              >
                <span className="text-base">{currentLangInfo?.flag}</span>
                <span>{currentLangInfo?.name}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showLanguageSelector ? 'rotate-180' : ''}`} />
              </button>

              {/* 언어 선택 드롭다운 */}
              {showLanguageSelector && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 min-w-[120px] animate-slide-down">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setLanguage(lang.id as LearningLanguage);
                        setShowLanguageSelector(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left ${
                        currentLanguage === lang.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm font-medium text-gray-700">{lang.name}</span>
                      {currentLanguage === lang.id && (
                        <span className="ml-auto text-primary-500 text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 가족 전환 버튼 */}
            {members.length > 0 && (
              <button
                onClick={() => {
                  setShowFamilySelector(!showFamilySelector);
                  setShowLanguageSelector(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-xl text-sm font-semibold transition-colors border-2 border-primary-200"
              >
                <Users className="w-5 h-5" />
                <span>프로필 전환</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFamilySelector ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* 가족 구성원 선택 드롭다운 */}
        {showFamilySelector && members.length > 0 && (
          <div className="mt-3 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-slide-down">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => handleMemberChange(member.id)}
                className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                  currentMemberId === member.id ? 'bg-primary-50' : ''
                }`}
              >
                <Avatar
                  avatar={member.avatar}
                  avatarUrl={member.avatarUrl}
                  size="md"
                />
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-gray-500">
                    {TRACKS.find(t => t.id === member.trackId)?.name} · {member.streakDays}일 연속
                  </p>
                </div>
                {currentMemberId === member.id && (
                  <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">
                    현재
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={() => {
                setShowFamilySelector(false);
                navigate('/family');
              }}
              className="w-full p-3 text-center text-sm text-primary-500 border-t border-gray-100 hover:bg-gray-50"
            >
              가족 관리하기
            </button>
          </div>
        )}
      </header>

      {/* 연속 학습일 & 오늘의 목표 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* 연속 학습일 */}
        <div className="card bg-gradient-to-br from-accent-500 to-accent-600 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">연속 학습</span>
          </div>
          <p className="text-3xl font-bold">{streakDays}일</p>
        </div>

        {/* 오늘의 목표 */}
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-medium text-gray-600">오늘 목표</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {todayMinutes}<span className="text-lg text-gray-400">/{dailyGoal}분</span>
          </p>
          {/* 프로그레스 바 */}
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 가족 리더보드 링크 */}
      <button
        onClick={() => navigate('/leaderboard')}
        className="w-full card bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 mb-6 text-left hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-foreground">가족 리더보드</h4>
            <p className="text-xs text-gray-500">이번 주 가족 랭킹을 확인해보세요</p>
          </div>
          <div className="flex -space-x-2">
            {members.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className="w-8 h-8 rounded-full bg-white border-2 border-yellow-100 flex items-center justify-center text-sm overflow-hidden"
              >
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  member.avatar
                )}
              </div>
            ))}
          </div>
          <ChevronRight className="w-5 h-5 text-yellow-500" />
        </div>
      </button>

      {/* 오늘의 미션 시작 */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold mb-1">오늘의 학습</h2>
            <p className="text-sm opacity-90">
              {memberTrack?.name || '학습 트랙을 선택해주세요'}
            </p>
          </div>
          <button
            onClick={() => navigate('/learn')}
            className="bg-white/20 hover:bg-white/30 rounded-full p-4 transition-colors"
          >
            <Play className="w-6 h-6" fill="white" />
          </button>
        </div>
      </div>

      {/* 문자 학습 (일본어 선택 시) */}
      {currentLanguage === 'ja' && (
        <button
          onClick={() => navigate('/kana')}
          className="w-full card bg-gradient-to-r from-pink-500 to-rose-500 text-white mb-3 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">あ</span>
                <span className="text-2xl">ア</span>
              </div>
              <h2 className="text-lg font-bold">히라가나 / 가타카나</h2>
              <p className="text-sm opacity-90">일본어 문자 학습</p>
            </div>
            <ChevronRight className="w-6 h-6 opacity-80" />
          </div>
        </button>
      )}

      {/* J-Content (일본어 선택 시) */}
      {currentLanguage === 'ja' && (
        <button
          onClick={() => navigate('/jcontent')}
          className="w-full card bg-gradient-to-r from-violet-500 to-purple-500 text-white mb-3 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Tv className="w-5 h-5" />
                <Music className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">J-Content</h2>
              <p className="text-sm opacity-90">애니메이션 & J-Pop으로 배우기</p>
            </div>
            <ChevronRight className="w-6 h-6 opacity-80" />
          </div>
        </button>
      )}

      {/* 단어장 (일본어 선택 시) */}
      {currentLanguage === 'ja' && (
        <button
          onClick={() => navigate('/vocabulary')}
          className="w-full card bg-gradient-to-r from-amber-500 to-orange-500 text-white mb-6 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">단어장</h2>
              <p className="text-sm opacity-90">SRS 간격 반복 학습</p>
            </div>
            <ChevronRight className="w-6 h-6 opacity-80" />
          </div>
        </button>
      )}

      {/* 학습 단계 미리보기 */}
      <section className="mb-6">
        <h3 className="text-lg font-bold text-foreground mb-3">학습 플로우</h3>
        <div className="space-y-2">
          {[
            { step: 1, name: '워밍업', time: '2분', desc: '전일 학습 복습 퀴즈' },
            { step: 2, name: '청크 학습', time: '3분', desc: '오늘의 핵심 표현' },
            { step: 3, name: '섀도잉', time: '4분', desc: '원어민 따라 말하기' },
            { step: 4, name: 'AI 롤플레이', time: '5분', desc: '실전 대화 연습' },
            { step: 5, name: '마무리', time: '1분', desc: '학습 요약' },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-center gap-3 p-3 bg-white rounded-xl"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                {item.step}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{item.name}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <span className="text-sm text-gray-400">{item.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 나의 트랙 */}
      {memberTrack && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-foreground">나의 트랙</h3>
            <button
              onClick={() => currentMember ? navigate('/family') : navigate('/settings')}
              className="text-sm text-primary-500 flex items-center gap-1"
            >
              변경 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 메인 트랙 */}
          <button
            onClick={() => navigate(`/learn?track=${memberTrack.id}`)}
            className="card border-2 mb-2 w-full text-left hover:shadow-md transition-shadow"
            style={{ borderColor: memberTrack.color }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{memberTrack.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-foreground">{memberTrack.name}</h4>
                  <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">메인</span>
                </div>
                <p className="text-sm text-gray-500">{memberTrack.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          {/* 추가 트랙들 */}
          {currentMember?.secondaryTracks && currentMember.secondaryTracks.length > 0 && (
            <div className="space-y-2">
              {currentMember.secondaryTracks.map((trackId) => {
                const track = TRACKS.find(t => t.id === trackId);
                if (!track) return null;
                return (
                  <button
                    key={trackId}
                    onClick={() => navigate(`/learn?track=${trackId}`)}
                    className="card border border-gray-200 bg-gray-50 w-full text-left hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{track.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground">{track.name}</h4>
                          <span className="text-xs bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded-full">추가</span>
                        </div>
                        <p className="text-xs text-gray-500">{track.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 트랙 미선택 시 */}
      {!memberTrack && (
        <section>
          <div className="card border-2 border-dashed border-gray-200">
            <div className="text-center py-4">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 mb-3">학습 트랙을 선택해주세요</p>
              <button
                onClick={() => navigate('/onboarding')}
                className="btn-primary"
              >
                트랙 선택하기
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 공통 트랙 - 일상생활영어회화 */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-foreground">공통 트랙</h3>
          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
            모든 가족 공용
          </span>
        </div>

        <button
          onClick={() => navigate('/learn?track=daily-life')}
          className="card border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 w-full text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl">🏠</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-foreground">일상생활 영어회화</h4>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                쇼핑, 식당, 인사, 날씨 등 일상에서 바로 쓰는 표현
              </p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-white px-2 py-0.5 rounded-full text-gray-600">
                  🛒 쇼핑
                </span>
                <span className="text-xs bg-white px-2 py-0.5 rounded-full text-gray-600">
                  🍽️ 식당
                </span>
                <span className="text-xs bg-white px-2 py-0.5 rounded-full text-gray-600">
                  👋 인사
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-green-500" />
          </div>
        </button>
      </section>
    </div>
  );
}
