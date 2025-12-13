import { useState } from 'react';
import { Flame, Clock, BookOpen, Target, TrendingUp, Award } from 'lucide-react';
import { useAuthStore } from '@/stores';

type Period = 'week' | 'month' | 'all';

// 샘플 통계 데이터
const SAMPLE_STATS = {
  streak: 7,
  totalMinutes: 145,
  chunksLearned: 35,
  scenariosCompleted: 8,
  weeklyData: [
    { day: '월', minutes: 15 },
    { day: '화', minutes: 12 },
    { day: '수', minutes: 18 },
    { day: '목', minutes: 0 },
    { day: '금', minutes: 20 },
    { day: '토', minutes: 25 },
    { day: '일', minutes: 15 },
  ],
  badges: [
    { id: '1', name: '첫 학습', icon: '🎉', earnedAt: '2024-12-01' },
    { id: '2', name: '3일 연속', icon: '🔥', earnedAt: '2024-12-03' },
    { id: '3', name: '7일 연속', icon: '⚡', earnedAt: '2024-12-07' },
    { id: '4', name: '표현 마스터', icon: '📚', earnedAt: '2024-12-10' },
  ],
};

export default function StatsPage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<Period>('week');

  const maxMinutes = Math.max(...SAMPLE_STATS.weeklyData.map((d) => d.minutes));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 */}
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">학습 통계</h1>
        <p className="text-gray-500">{user?.name || '학습자'}님의 학습 현황</p>
      </header>

      {/* 요약 카드 */}
      <section className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="card bg-gradient-to-br from-accent-500 to-accent-600 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5" />
              <span className="text-sm opacity-90">연속 학습</span>
            </div>
            <p className="text-3xl font-bold">{SAMPLE_STATS.streak}일</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-primary-500" />
              <span className="text-sm text-gray-500">총 학습 시간</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {Math.floor(SAMPLE_STATS.totalMinutes / 60)}시간
              <span className="text-lg text-gray-400"> {SAMPLE_STATS.totalMinutes % 60}분</span>
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-secondary-500" />
              <span className="text-sm text-gray-500">학습한 표현</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{SAMPLE_STATS.chunksLearned}개</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-accent-500" />
              <span className="text-sm text-gray-500">롤플레이</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{SAMPLE_STATS.scenariosCompleted}회</p>
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
            {SAMPLE_STATS.weeklyData.map((data, idx) => (
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
                {Math.round(SAMPLE_STATS.weeklyData.reduce((a, b) => a + b.minutes, 0) / 7)}분/일
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
          <span className="text-sm text-gray-400">{SAMPLE_STATS.badges.length}개</span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {SAMPLE_STATS.badges.map((badge) => (
            <div key={badge.id} className="card text-center p-3">
              <span className="text-3xl">{badge.icon}</span>
              <p className="text-xs font-medium text-foreground mt-2">{badge.name}</p>
            </div>
          ))}

          {/* 미획득 배지 예시 */}
          {[
            { name: '30일 연속', icon: '👑' },
            { name: '100표현', icon: '🎯' },
            { name: 'AI 마스터', icon: '🤖' },
            { name: '완주자', icon: '🏆' },
          ].map((badge, idx) => (
            <div key={idx} className="card text-center p-3 opacity-30">
              <span className="text-3xl grayscale">{badge.icon}</span>
              <p className="text-xs font-medium text-gray-400 mt-2">{badge.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
