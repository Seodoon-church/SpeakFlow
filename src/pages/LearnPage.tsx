import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Volume2,
  Mic,
  Check,
  RotateCcw,
  ChevronRight,
  Play,
  Pause,
  X,
  HelpCircle
} from 'lucide-react';
import { useLearningStore } from '@/stores';
import { getTodayChunks, generateQuizFromChunks } from '@/data/chunks';

type LearningStep = 'intro' | 'warmup' | 'chunk' | 'shadowing' | 'complete';

interface QuizAnswer {
  questionId: string;
  isCorrect: boolean;
}

export default function LearnPage() {
  const navigate = useNavigate();
  const { currentTrack } = useLearningStore();
  const [step, setStep] = useState<LearningStep>('intro');
  const [chunkIndex, setChunkIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // 워밍업 퀴즈 상태
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [showQuizResult, setShowQuizResult] = useState(false);

  // 현재 트랙에 맞는 청크 가져오기
  const chunks = useMemo(() => {
    return getTodayChunks(currentTrack?.id || 'daily-life', 3);
  }, [currentTrack?.id]);

  // 퀴즈 생성
  const quizzes = useMemo(() => {
    return generateQuizFromChunks(chunks);
  }, [chunks]);

  const currentChunk = chunks[chunkIndex];
  const currentQuiz = quizzes[quizIndex];
  const progress = ((chunkIndex + 1) / chunks.length) * 100;

  const handlePlayAudio = (text?: string) => {
    const targetText = text || currentChunk.expression;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(targetText);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    if (step === 'intro') {
      setStep('warmup');
    } else if (step === 'warmup') {
      if (showQuizResult) {
        setStep('chunk');
        setQuizIndex(0);
        setQuizAnswers([]);
        setShowQuizResult(false);
      }
    } else if (step === 'chunk') {
      setStep('shadowing');
    } else if (step === 'shadowing') {
      if (chunkIndex < chunks.length - 1) {
        setChunkIndex(chunkIndex + 1);
        setStep('chunk');
        setShowMeaning(false);
      } else {
        setStep('complete');
      }
    }
  };

  const handleQuizAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuiz.correctAnswer;

    setTimeout(() => {
      setQuizAnswers([...quizAnswers, { questionId: currentQuiz.id, isCorrect }]);

      if (quizIndex < quizzes.length - 1) {
        setQuizIndex(quizIndex + 1);
        setSelectedAnswer(null);
      } else {
        setShowQuizResult(true);
      }
    }, 1000);
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
  };

  const correctCount = quizAnswers.filter(a => a.isCorrect).length;

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
            오늘 배울 표현 {chunks.length}개
          </p>

          <div className="w-full space-y-3 mb-8">
            {[
              { step: 1, name: '워밍업', time: '2분', desc: '전일 학습 복습 퀴즈' },
              { step: 2, name: '청크 학습', time: '3분', desc: '오늘의 핵심 표현' },
              { step: 3, name: '섀도잉', time: '3분', desc: '따라 말하기 연습' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3 p-4 bg-white rounded-xl">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
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

  // 워밍업 (퀴즈) 화면
  if (step === 'warmup') {
    const quizProgress = ((quizIndex + 1) / quizzes.length) * 100;

    // 퀴즈 결과 화면
    if (showQuizResult) {
      return (
        <div className="min-h-screen bg-background flex flex-col">
          <header className="flex items-center px-4 py-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <span className="flex-1 text-center font-semibold text-foreground">워밍업 완료</span>
            <div className="w-10" />
          </header>

          <main className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
            <div className="text-6xl mb-6">
              {correctCount === quizzes.length ? '🎯' : correctCount >= quizzes.length / 2 ? '👍' : '💪'}
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {correctCount}/{quizzes.length} 정답!
            </h1>
            <p className="text-gray-500 mb-8 text-center">
              {correctCount === quizzes.length
                ? '완벽해요! 복습이 잘 되었어요.'
                : correctCount >= quizzes.length / 2
                  ? '잘했어요! 조금 더 연습하면 완벽해질 거예요.'
                  : '복습이 필요해요. 오늘 학습으로 더 익혀봐요!'}
            </p>

            <div className="w-full bg-white rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">정답률</span>
                <span className="font-bold text-primary-500">
                  {Math.round((correctCount / quizzes.length) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-500"
                  style={{ width: `${(correctCount / quizzes.length) * 100}%` }}
                />
              </div>
            </div>

            <button onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2">
              오늘의 학습 시작
              <ChevronRight className="w-5 h-5" />
            </button>
          </main>
        </div>
      );
    }

    // 퀴즈 진행 화면
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center justify-between px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <span className="text-sm text-gray-500">
            {quizIndex + 1} / {quizzes.length}
          </span>
          <div className="w-10" />
        </header>

        {/* 프로그레스 */}
        <div className="h-1 bg-gray-100 mx-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-500 transition-all duration-300"
            style={{ width: `${quizProgress}%` }}
          />
        </div>

        {/* 단계 표시 */}
        <div className="px-4 py-3">
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-accent-100 text-accent-600">
            <HelpCircle className="w-4 h-4 inline mr-1" />
            워밍업 퀴즈
          </span>
        </div>

        <main className="flex-1 px-4 pb-8">
          <div className="card mb-6">
            <p className="text-sm text-gray-500 mb-3">{currentQuiz.question}</p>

            {currentQuiz.type === 'meaning' && (
              <div className="flex items-center gap-3">
                <p className="text-xl font-bold text-foreground flex-1">
                  {currentQuiz.expression}
                </p>
                <button
                  onClick={() => handlePlayAudio(currentQuiz.expression)}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <Volume2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}

            {currentQuiz.type === 'expression' && (
              <p className="text-xl font-bold text-foreground">
                {currentQuiz.meaning}
              </p>
            )}
          </div>

          <div className="space-y-3">
            {currentQuiz.options.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuiz.correctAnswer;
              const showResult = selectedAnswer !== null;

              let buttonStyle = 'bg-white border-2 border-gray-100';
              if (showResult) {
                if (isCorrect) {
                  buttonStyle = 'bg-green-50 border-2 border-green-500';
                } else if (isSelected && !isCorrect) {
                  buttonStyle = 'bg-red-50 border-2 border-red-500';
                }
              } else if (isSelected) {
                buttonStyle = 'bg-primary-50 border-2 border-primary-500';
              }

              return (
                <button
                  key={idx}
                  onClick={() => !selectedAnswer && handleQuizAnswer(option)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-4 rounded-xl text-left transition-all ${buttonStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      showResult && isCorrect
                        ? 'bg-green-500 text-white'
                        : showResult && isSelected && !isCorrect
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      {showResult && isCorrect ? (
                        <Check className="w-4 h-4" />
                      ) : showResult && isSelected && !isCorrect ? (
                        <X className="w-4 h-4" />
                      ) : (
                        String.fromCharCode(65 + idx)
                      )}
                    </div>
                    <span className={`flex-1 ${showResult && isCorrect ? 'text-green-700 font-semibold' : 'text-foreground'}`}>
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
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
          오늘 {chunks.length}개의 표현을 학습했어요
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
          {chunkIndex + 1} / {chunks.length}
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
              onClick={() => handlePlayAudio()}
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
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">예문</p>
            <button
              onClick={() => handlePlayAudio(currentChunk.example_sentence)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
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
                onClick={() => handlePlayAudio()}
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
