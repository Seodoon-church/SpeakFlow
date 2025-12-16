import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Clock, BookOpen, Target, TrendingUp, Award, ChevronRight, Zap } from 'lucide-react';
import { useFamilyStore, useGamificationStore, TRACKS, BADGES, getXpProgress } from '@/stores';

type Period = 'week' | 'month' | 'all';

export default function StatsPage() {
  const navigate = useNavigate();
  const { members, currentMemberId } = useFamilyStore();
  const { memberData, initMemberData, checkAndAwardBadges } = useGamificationStore();
  const [period, setPeriod] = useState<Period>('week');

  // 현재 가족 구성원 데이터
  const currentMember = members.find(m => m.id === currentMemberId);
  const memberTrack = currentMember ? TRACKS.find(t => t.id === currentMember.trackId) : null;

  // 게이미피케이션 데이터 초기화
  useEffect(() => {
    if (currentMemberId) {
      initMemberData(currentMemberId);
      checkAndAwardBadges(currentMemberId);
    }
  }, [currentMemberId, initMemberData, checkAndAwardBadges]);

  const gamificationData = currentMemberId ? memberData[currentMemberId] : null;
  const xpProgress = gamificationData ? getXpProgress(gamificationData.xp) : { current: 0, required: 100, percentage: 0 };

  // 실제 데이터 사용
  const stats = {
    streak: gamificationData?.streak.current || currentMember?.streakDays || 0,
    longestStreak: gamificationData?.streak.longest || 0,
    totalMinutes: currentMember?.totalMinutesLearned || 0,
    chunksLearned: currentMember?.chunksLearned || 0,
    scenariosCompleted: Math.floor((currentMember?.chunksLearned || 0) / 3),
    xp: gamificationData?.xp || 0,
    level: gamificationData?.level || 1,
    todayXp: gamificationData?.todayXp || 0,
    dailyGoalXp: gamificationData?.dailyGoalXp || 50,
  };

  // 주간 데이터 (임시 - 실제로는 별도 저장 필요)
  const weeklyData = [
    { day: '월', minutes: Math.round(stats.totalMinutes * 0.12) },
    { day: '화', minutes: Math.round(stats.totalMinutes * 0.15) },
    { day: '수', minutes: Math.round(stats.totalMinutes * 0.18) },
    { day: '목', minutes: Math.round(stats.totalMinutes * 0.10) },
    { day: '금', minutes: Math.round(stats.totalMinutes * 0.20) },
    { day: '토', minutes: Math.round(stats.totalMinutes * 0.15) },
    { day: '일', minutes: Math.round(stats.totalMinutes * 0.10) },
  ];

  const maxMinutes = Math.max(...weeklyData.map((d) => d.minutes), 1);

  // gamificationStore 배지 사용
  const earnedBadgeIds = gamificationData?.badges.map(b => b.id) || [];
  const earnedBadges = BADGES.filter(b => earnedBadgeIds.includes(b.id));
  const lockedBadges = BADGES.filter(b => !earnedBadgeIds.includes(b.id));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 */}
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">학습 통계</h1>
        <p className="text-gray-500">
          {currentMember?.name || '학습자'}님의 학습 현황
          {memberTrack && <span className="text-primary-500"> · {memberTrack.name}</span>}
        </p>
      </header>

      {/* XP & 레벨 카드 */}
      <section className="px-4 mb-4">
        <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold">{stats.level}</span>
              </div>
              <div>
                <p className="text-primary-100 text-xs">현재 레벨</p>
                <p className="font-bold text-lg">Level {stats.level}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span className="font-bold text-xl">{stats.xp}</span>
              </div>
              <p className="text-primary-100 text-xs">총 XP</p>
            </div>
          </div>
          {/* XP 프로그레스 바 */}
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full transition-all"
              style={{ width: `${xpProgress.percentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-primary-100">
            <span>{xpProgress.current} XP</span>
            <span>다음 레벨까지 {xpProgress.required - xpProgress.current} XP</span>
          </div>
        </div>
      </section>

      {/* 요약 카드 */}
      <section className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="card bg-gradient-to-br from-accent-500 to-accent-600 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5" />
              <span className="text-sm opacity-90">연속 학습</span>
            </div>
            <p className="text-3xl font-bold">{stats.streak}일</p>
            {stats.longestStreak > 0 && (
              <p className="text-xs text-white/70 mt-1">최장 {stats.longestStreak}일</p>
            )}
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-primary-500" />
              <span className="text-sm text-gray-500">총 학습 시간</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {Math.floor(stats.totalMinutes / 60)}시간
              <span className="text-lg text-gray-400"> {stats.totalMinutes % 60}분</span>
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-secondary-500" />
              <span className="text-sm text-gray-500">학습한 표현</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.chunksLearned}개</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-accent-500" />
              <span className="text-sm text-gray-500">롤플레이</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.scenariosCompleted}회</p>
          </div>
        </div>
      </section>

      {/* 기간 선택 */}
      <section className="px-4 mb-4">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {[
            { id: 'week', label: '이번 주' },
            { id: 'month', label: '이번 달' },
            { id: 'all', label: '전체' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id as Period)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                period === item.id
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* 주간 차트 */}
      <section className="px-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">학습 시간</h3>
            <TrendingUp className="w-5 h-5 text-secondary-500" />
          </div>

          <div className="flex items-end justify-between h-32 gap-2">
            {weeklyData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    data.minutes > 0 ? 'bg-primary-500' : 'bg-gray-100'
                  }`}
                  style={{
                    height: `${(data.minutes / maxMinutes) * 100}%`,
                    minHeight: data.minutes > 0 ? '8px' : '4px',
                  }}
                />
                <span className="text-xs text-gray-500">{data.day}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">이번 주 평균</span>
              <span className="font-semibold text-foreground">
                {Math.round(weeklyData.reduce((a, b) => a + b.minutes, 0) / 7)}분/일
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 배지 */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Award className="w-5 h-5 text-accent-500" />
            획득한 배지
          </h3>
          <button
            onClick={() => navigate('/badges')}
            className="text-sm text-primary-500 flex items-center gap-1"
          >
            전체 보기 <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {earnedBadges.slice(0, 4).map((badge) => (
            <div key={badge.id} className="card text-center p-3 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100">
              <span className="text-3xl">{badge.icon}</span>
              <p className="text-xs font-medium text-foreground mt-2">{badge.name}</p>
            </div>
          ))}

          {/* 미획득 배지 (획득한 배지가 4개 미만일 때만) */}
          {lockedBadges.slice(0, Math.max(0, 4 - earnedBadges.length)).map((badge) => (
            <div key={badge.id} className="card text-center p-3 opacity-40">
              <span className="text-3xl grayscale">{badge.icon}</span>
              <p className="text-xs font-medium text-gray-400 mt-2">{badge.name}</p>
            </div>
          ))}
        </div>

        {/* 배지 요약 */}
        <button
          onClick={() => navigate('/badges')}
          className="w-full mt-3 card bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 text-left hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">
                {earnedBadges.length}/{BADGES.length} 배지 획득
              </p>
              <div className="w-full h-1.5 bg-amber-100 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"
                  style={{ width: `${(earnedBadges.length / BADGES.length) * 100}%` }}
                />
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-500" />
          </div>
        </button>
      </section>
    </div>
  );
}
