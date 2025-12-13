import { useNavigate } from 'react-router-dom';
import { Play, Flame, Target, ChevronRight, Trophy } from 'lucide-react';
import { useAuthStore, useLearningStore } from '@/stores';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentTrack } = useLearningStore();

  // 임시 데이터
  const streakDays = user?.streak_days || 0;
  const dailyGoal = user?.daily_goal_minutes || 15;
  const todayMinutes = 0;
  const progressPercent = Math.min((todayMinutes / dailyGoal) * 100, 100);

  return (
    <div className="px-4 pt-6 pb-4">
      {/* 헤더 */}
      <header className="mb-6">
        <p className="text-gray-500 text-sm">안녕하세요</p>
        <h1 className="text-2xl font-bold text-foreground">
          {user?.name || '학습자'}님 👋
        </h1>
      </header>

      {/* 연속 학습일 & 오늘의 목표 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
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

      {/* 오늘의 미션 시작 */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold mb-1">오늘의 학습</h2>
            <p className="text-sm opacity-90">
              {currentTrack?.name || '학습 트랙을 선택해주세요'}
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
      {currentTrack && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-foreground">나의 트랙</h3>
            <button
              onClick={() => navigate('/settings')}
              className="text-sm text-primary-500 flex items-center gap-1"
            >
              변경 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div
            className="card border-2"
            style={{ borderColor: currentTrack.color }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentTrack.icon}</span>
              <div>
                <h4 className="font-bold text-foreground">{currentTrack.name}</h4>
                <p className="text-sm text-gray-500">{currentTrack.description}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 트랙 미선택 시 */}
      {!currentTrack && (
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
    </div>
  );
}
