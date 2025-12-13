import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { TRACKS, useLearningStore, useAuthStore } from '@/stores';
import type { TrackId } from '@/types';

const DAILY_GOALS = [
  { minutes: 10, label: '10분', desc: '가볍게 시작하기' },
  { minutes: 15, label: '15분', desc: '추천' },
  { minutes: 20, label: '20분', desc: '집중 학습' },
  { minutes: 30, label: '30분', desc: '마스터 모드' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setCurrentTrack } = useLearningStore();
  const { setOnboarded } = useAuthStore();
  const [step, setStep] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState<TrackId | null>(null);
  const [dailyGoal, setDailyGoal] = useState(15);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // 온보딩 완료
      const track = TRACKS.find((t) => t.id === selectedTrack);
      if (track) {
        setCurrentTrack(track);
      }
      setOnboarded(true);
      navigate('/');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) return selectedTrack !== null;
    return true;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 프로그레스 바 */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-primary-500 transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-4">
        {step > 1 ? (
          <button onClick={handleBack} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <span className="text-sm text-gray-500">{step} / 3</span>
        <div className="w-10" />
      </header>

      {/* 컨텐츠 */}
      <main className="flex-1 px-6 pb-32">
        {/* Step 1: 환영 */}
        {step === 1 && (
          <div className="text-center pt-8">
            <div className="text-6xl mb-6">🎯</div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              SpeakFlow에 오신 것을<br />환영합니다!
            </h1>
            <p className="text-gray-500 leading-relaxed">
              매일 10~15분의 학습으로<br />
              영어 스피킹 실력을 향상시켜 보세요.
            </p>

            <div className="mt-12 space-y-4 text-left">
              {[
                { icon: '📚', text: '과학적 학습 알고리즘' },
                { icon: '🎯', text: '맞춤형 학습 트랙' },
                { icon: '🤖', text: 'AI 롤플레이 대화' },
                { icon: '📊', text: '학습 진도 분석' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-xl">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium text-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: 트랙 선택 */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              학습 트랙 선택
            </h1>
            <p className="text-gray-500 mb-6">
              직업이나 목적에 맞는 트랙을 선택하세요
            </p>

            <div className="space-y-3">
              {TRACKS.map((track) => (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrack(track.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedTrack === track.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${track.color}20` }}
                    >
                      {track.icon}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">{track.name}</h3>
                      <p className="text-sm text-gray-500">{track.description}</p>
                    </div>
                    {selectedTrack === track.id && (
                      <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: 일일 목표 */}
        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              일일 학습 목표
            </h1>
            <p className="text-gray-500 mb-6">
              하루에 얼마나 학습하시겠어요?
            </p>

            <div className="space-y-3">
              {DAILY_GOALS.map((goal) => (
                <button
                  key={goal.minutes}
                  onClick={() => setDailyGoal(goal.minutes)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    dailyGoal === goal.minutes
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-foreground text-lg">
                        {goal.label}
                      </h3>
                      <p className="text-sm text-gray-500">{goal.desc}</p>
                    </div>
                    {dailyGoal === goal.minutes && (
                      <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 p-4 bg-accent-50 rounded-xl">
              <p className="text-sm text-accent-700">
                💡 처음이라면 10~15분부터 시작하는 것을 추천해요.<br />
                나중에 설정에서 언제든 변경할 수 있어요.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {step === 3 ? '시작하기' : '다음'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
