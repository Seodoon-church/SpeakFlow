import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Volume2,
  Mic,
  Check,
  RotateCcw,
  ChevronRight,
  Play,
  Pause
} from 'lucide-react';
import { useLearningStore } from '@/stores';

// 임시 청크 데이터
const SAMPLE_CHUNKS = [
  {
    id: '1',
    expression: "I was wondering if we could schedule a meeting.",
    meaning: "회의 일정을 잡을 수 있을지 여쭤봐도 될까요?",
    pronunciation: "/aɪ wəz ˈwʌndərɪŋ ɪf wi kʊd ˈʃedjuːl ə ˈmiːtɪŋ/",
    example_sentence: "I was wondering if we could schedule a meeting next week to discuss the project.",
    example_translation: "다음 주에 프로젝트를 논의하기 위한 회의를 잡을 수 있을지 여쭤봐도 될까요?",
    tips: "공손하게 요청할 때 사용하는 표현입니다. 직접적인 'Can we...?' 보다 더 정중합니다.",
  },
  {
    id: '2',
    expression: "Could you please clarify that point?",
    meaning: "그 부분을 명확히 해주시겠어요?",
    pronunciation: "/kʊd ju pliːz ˈklærɪfaɪ ðæt pɔɪnt/",
    example_sentence: "Could you please clarify that point? I want to make sure I understand correctly.",
    example_translation: "그 부분을 명확히 해주시겠어요? 제가 정확히 이해했는지 확인하고 싶어요.",
    tips: "상대방의 말을 더 잘 이해하기 위해 질문할 때 사용합니다.",
  },
  {
    id: '3',
    expression: "Let me get back to you on that.",
    meaning: "그 건에 대해서는 확인 후 다시 연락드릴게요.",
    pronunciation: "/let mi ɡet bæk tu ju ɒn ðæt/",
    example_sentence: "Let me get back to you on that after I check with my team.",
    example_translation: "팀과 확인 후 그 건에 대해 다시 연락드릴게요.",
    tips: "즉답이 어려울 때 시간을 벌기 위해 사용하는 유용한 표현입니다.",
  },
];

type LearningStep = 'intro' | 'chunk' | 'shadowing' | 'complete';

export default function LearnPage() {
  const navigate = useNavigate();
  const { currentTrack } = useLearningStore();
  const [step, setStep] = useState<LearningStep>('intro');
  const [chunkIndex, setChunkIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const currentChunk = SAMPLE_CHUNKS[chunkIndex];
  const progress = ((chunkIndex + 1) / SAMPLE_CHUNKS.length) * 100;

  const handlePlayAudio = () => {
    // TTS 재생 (Web Speech API)
    const utterance = new SpeechSynthesisUtterance(currentChunk.expression);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    if (step === 'intro') {
      setStep('chunk');
    } else if (step === 'chunk') {
      setStep('shadowing');
    } else if (step === 'shadowing') {
      if (chunkIndex < SAMPLE_CHUNKS.length - 1) {
        setChunkIndex(chunkIndex + 1);
        setStep('chunk');
        setShowMeaning(false);
      } else {
        setStep('complete');
      }
    }
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    // 실제 녹음 구현 필요
  };

  // 시작 화면
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
          <div className="text-6xl mb-6">📚</div>
          <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
            오늘의 학습
          </h1>
          <p className="text-gray-500 mb-8 text-center">
            {currentTrack?.name || 'Business'} 트랙<br />
            오늘 배울 표현 {SAMPLE_CHUNKS.length}개
          </p>

          <div className="w-full space-y-3 mb-8">
            {[
              { step: 1, name: '청크 학습', time: '3분' },
              { step: 2, name: '섀도잉', time: '3분' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3 p-4 bg-white rounded-xl">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <span className="flex-1 font-medium text-foreground">{item.name}</span>
                <span className="text-sm text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>

          <button onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2">
            <Play className="w-5 h-5" />
            학습 시작
          </button>
        </main>
      </div>
    );
  }

  // 완료 화면
  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">학습 완료!</h1>
        <p className="text-gray-500 mb-8 text-center">
          오늘 {SAMPLE_CHUNKS.length}개의 표현을 학습했어요
        </p>

        <div className="w-full space-y-3">
          <button onClick={() => navigate('/roleplay')} className="btn-primary w-full">
            AI 롤플레이 하기
          </button>
          <button onClick={() => navigate('/')} className="btn-outline w-full">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 청크 학습 / 섀도잉
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <span className="text-sm text-gray-500">
          {chunkIndex + 1} / {SAMPLE_CHUNKS.length}
        </span>
        <div className="w-10" />
      </header>

      {/* 프로그레스 */}
      <div className="h-1 bg-gray-100 mx-4 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 단계 표시 */}
      <div className="px-4 py-3">
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
          step === 'chunk'
            ? 'bg-primary-100 text-primary-600'
            : 'bg-secondary-100 text-secondary-600'
        }`}>
          {step === 'chunk' ? '📚 청크 학습' : '🎤 섀도잉'}
        </span>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 px-4 pb-32">
        {/* 표현 카드 */}
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">영어 표현</span>
            <button
              onClick={handlePlayAudio}
              className={`p-2 rounded-full ${
                isPlaying ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xl font-bold text-foreground mb-2">
            {currentChunk.expression}
          </p>
          <p className="text-sm text-gray-400 mb-4">{currentChunk.pronunciation}</p>

          {/* 의미 토글 */}
          <button
            onClick={() => setShowMeaning(!showMeaning)}
            className="w-full text-left"
          >
            <div className={`p-3 rounded-xl transition-all ${
              showMeaning ? 'bg-primary-50' : 'bg-gray-50'
            }`}>
              {showMeaning ? (
                <p className="text-primary-700">{currentChunk.meaning}</p>
              ) : (
                <p className="text-gray-400">탭하여 의미 보기</p>
              )}
            </div>
          </button>
        </div>

        {/* 예문 */}
        <div className="card mb-4">
          <p className="text-sm text-gray-400 mb-2">예문</p>
          <p className="text-foreground mb-2">{currentChunk.example_sentence}</p>
          <p className="text-sm text-gray-500">{currentChunk.example_translation}</p>
        </div>

        {/* 팁 */}
        {currentChunk.tips && (
          <div className="bg-accent-50 p-4 rounded-xl">
            <p className="text-sm text-accent-700">💡 {currentChunk.tips}</p>
          </div>
        )}

        {/* 섀도잉 모드 - 녹음 */}
        {step === 'shadowing' && (
          <div className="mt-6">
            <p className="text-center text-gray-500 mb-4">
              음성을 듣고 따라 말해보세요
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePlayAudio}
                className="p-4 bg-gray-100 rounded-full"
              >
                <Volume2 className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={handleRecord}
                className={`p-6 rounded-full transition-all ${
                  isRecording
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-primary-500'
                }`}
              >
                <Mic className="w-8 h-8 text-white" />
              </button>
              <button className="p-4 bg-gray-100 rounded-full">
                <RotateCcw className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        {step === 'chunk' && (
          <div className="flex gap-3">
            <button
              onClick={() => setStep('shadowing')}
              className="flex-1 btn-outline flex items-center justify-center gap-2"
            >
              <Mic className="w-5 h-5" />
              섀도잉
            </button>
            <button
              onClick={handleNext}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              다음
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
        {step === 'shadowing' && (
          <button
            onClick={handleNext}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            완료
          </button>
        )}
      </div>
    </div>
  );
}
