import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  HelpCircle,
  PlayCircle,
  MicOff
} from 'lucide-react';
import { useLearningStore, useFamilyStore, TRACKS, useUIStore, useLanguageStore } from '@/stores';
import { getTodayChunks, generateQuizFromChunks } from '@/data/chunks';
import type { TrackId } from '@/types';

type LearningStep = 'intro' | 'warmup' | 'chunk' | 'shadowing' | 'complete';

interface QuizAnswer {
  questionId: string;
  isCorrect: boolean;
}

// 학습 진행 상태 저장 키
const LEARNING_PROGRESS_KEY = 'speakflow-learning-progress';

interface LearningProgress {
  trackId: string;
  date: string;
  step: LearningStep;
  chunkIndex: number;
  quizIndex: number;
  quizAnswers: QuizAnswer[];
  showQuizResult: boolean;
}

export default function LearnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentTrack } = useLearningStore();
  const { currentMemberId, recordActivity } = useFamilyStore();
  const { showToast } = useUIStore();
  const { currentLanguage } = useLanguageStore();
  const [step, setStep] = useState<LearningStep>('intro');
  const [chunkIndex, setChunkIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  // 워밍업 퀴즈 상태
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [showQuizResult, setShowQuizResult] = useState(false);

  // 발음 평가 상태
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [isPassed, setIsPassed] = useState<boolean>(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 학습 시작 시간 추적
  const startTimeRef = useRef<number>(Date.now());
  const activityRecordedRef = useRef<boolean>(false);

  // URL 파라미터에서 트랙 ID 가져오기 (없으면 currentTrack 사용)
  const trackIdFromUrl = searchParams.get('track') as TrackId | null;
  const activeTrackId = trackIdFromUrl || currentTrack?.id || 'daily-life';
  const activeTrack = TRACKS.find(t => t.id === activeTrackId);

  // 현재 트랙에 맞는 청크 가져오기 (선택한 언어로)
  const chunks = useMemo(() => {
    return getTodayChunks(activeTrackId, 3, currentLanguage);
  }, [activeTrackId, currentLanguage]);

  // 오늘 날짜
  const today = new Date().toISOString().split('T')[0];

  // 학습 진행 상태 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LEARNING_PROGRESS_KEY);
      if (saved) {
        const progress: LearningProgress = JSON.parse(saved);
        // 같은 날, 같은 트랙의 학습만 복원
        if (progress.date === today && progress.trackId === activeTrackId) {
          // 완료된 학습은 복원하지 않음
          if (progress.step !== 'complete') {
            setStep(progress.step);
            setChunkIndex(progress.chunkIndex);
            setQuizIndex(progress.quizIndex);
            setQuizAnswers(progress.quizAnswers);
            setShowQuizResult(progress.showQuizResult);
          }
        } else {
          // 다른 날이거나 다른 트랙이면 저장된 상태 삭제
          localStorage.removeItem(LEARNING_PROGRESS_KEY);
        }
      }
    } catch (e) {
      console.error('Failed to restore learning progress:', e);
    }
    setIsRestored(true);
  }, [activeTrackId, today]);

  // 학습 진행 상태 저장
  useEffect(() => {
    // 복원 완료 전에는 저장하지 않음
    if (!isRestored) return;
    // 완료 상태면 저장 삭제
    if (step === 'complete') {
      localStorage.removeItem(LEARNING_PROGRESS_KEY);
      return;
    }
    // intro 상태는 저장하지 않음
    if (step === 'intro') return;

    const progress: LearningProgress = {
      trackId: activeTrackId,
      date: today,
      step,
      chunkIndex,
      quizIndex,
      quizAnswers,
      showQuizResult,
    };
    localStorage.setItem(LEARNING_PROGRESS_KEY, JSON.stringify(progress));
  }, [isRestored, step, chunkIndex, quizIndex, quizAnswers, showQuizResult, activeTrackId, today]);

  // 학습 완료 시 진도 기록
  useEffect(() => {
    if (step === 'complete' && !activityRecordedRef.current && currentMemberId) {
      const elapsedMinutes = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000));
      recordActivity(currentMemberId, elapsedMinutes, chunks.length);
      activityRecordedRef.current = true;
    }
  }, [step, currentMemberId, recordActivity, chunks.length]);

  // 음성 합성 초기화 (일부 브라우저에서 필요)
  useEffect(() => {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }, []);

  // 퀴즈 생성
  const quizzes = useMemo(() => {
    return generateQuizFromChunks(chunks);
  }, [chunks]);

  const currentChunk = chunks[chunkIndex];
  const currentQuiz = quizzes[quizIndex];
  const progress = ((chunkIndex + 1) / chunks.length) * 100;

  // 언어별 TTS 설정
  const LANGUAGE_TTS_CONFIG: Record<string, { code: string; rate: number }> = {
    'en': { code: 'en-US', rate: 0.8 },
    'ja': { code: 'ja-JP', rate: 0.85 },
    'zh': { code: 'zh-CN', rate: 0.85 },
  };

  const handlePlayAudio = (text?: string) => {
    const targetText = text || currentChunk?.expression;
    if (!targetText) return;

    // 이전 재생 중지
    speechSynthesis.cancel();

    const ttsConfig = LANGUAGE_TTS_CONFIG[currentLanguage] || LANGUAGE_TTS_CONFIG['en'];
    const utterance = new SpeechSynthesisUtterance(targetText);
    utterance.lang = ttsConfig.code;
    utterance.rate = ttsConfig.rate;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    // 음성 목록 로드 대기 (일부 브라우저에서 필요)
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      const langPrefix = ttsConfig.code.split('-')[0];
      const voice = voices.find(v => v.lang.startsWith(langPrefix));
      if (voice) utterance.voice = voice;
    }

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

  // 발음 정확도 계산 함수
  const calculatePronunciationScore = (original: string, recognized: string): number => {
    const originalWords = original.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
    const recognizedWords = recognized.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);

    let matchCount = 0;
    for (const word of originalWords) {
      if (recognizedWords.includes(word)) {
        matchCount++;
      }
    }

    const score = Math.round((matchCount / originalWords.length) * 100);
    return Math.min(100, Math.max(0, score));
  };

  // 녹음 시작/중지
  const handleRecord = async () => {
    if (isRecording) {
      // 녹음 중지
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // 이전 녹음 초기화
      setRecordedAudioUrl(null);
      setRecognizedText('');
      setPronunciationScore(null);
      setIsPassed(false);
      audioChunksRef.current = [];

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          // 녹음된 오디오 URL 생성
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setRecordedAudioUrl(audioUrl);

          // 스트림 정리
          stream.getTracks().forEach(track => track.stop());
        };

        // 음성 인식 시작 (선택한 언어로)
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
          const recognition = new SpeechRecognition();
          const ttsConfig = LANGUAGE_TTS_CONFIG[currentLanguage] || LANGUAGE_TTS_CONFIG['en'];
          recognition.lang = ttsConfig.code;
          recognition.continuous = false;
          recognition.interimResults = false;

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setRecognizedText(transcript);

            // 발음 점수 계산
            const score = calculatePronunciationScore(currentChunk?.expression || '', transcript);
            setPronunciationScore(score);
            setIsPassed(score >= 80);
          };

          recognition.onerror = () => {
            showToast({
              type: 'warning',
              message: '음성 인식에 실패했습니다. 다시 시도해주세요.',
            });
          };

          recognition.start();
        }

        mediaRecorder.start();
        setIsRecording(true);

        // 5초 후 자동 중지
        setTimeout(() => {
          if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
          }
        }, 5000);

      } catch (error) {
        showToast({
          type: 'error',
          message: '마이크 접근 권한이 필요합니다.',
        });
      }
    }
  };

  // 녹음 재생
  const handlePlayRecording = () => {
    if (!recordedAudioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(recordedAudioUrl);
    audioRef.current.onplay = () => setIsPlayingRecording(true);
    audioRef.current.onended = () => setIsPlayingRecording(false);
    audioRef.current.onerror = () => setIsPlayingRecording(false);
    audioRef.current.play();
  };

  // 섀도잉 리셋
  const handleResetShadowing = () => {
    setRecordedAudioUrl(null);
    setRecognizedText('');
    setPronunciationScore(null);
    setIsPassed(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const correctCount = quizAnswers.filter(a => a.isCorrect).length;

  // 복원 중 로딩 화면
  if (!isRestored) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">학습 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
            {activeTrack?.name || 'Business'} 트랙<br />
            오늘 배울 표현 {chunks.length}개
          </p>

          <div className="w-full space-y-3 mb-8">
            {[
              { step: 1, name: '워밍업', time: '2분', desc: '전일 학습 복습 퀴즈', target: 'warmup' as LearningStep },
              { step: 2, name: '청크 학습', time: '3분', desc: '오늘의 핵심 표현', target: 'chunk' as LearningStep },
              { step: 3, name: '섀도잉', time: '3분', desc: '따라 말하기 연습', target: 'shadowing' as LearningStep },
            ].map((item) => (
              <button
                key={item.step}
                onClick={() => setStep(item.target)}
                className="w-full flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>

          <button onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2">
            <Play className="w-5 h-5" />
            처음부터 시작
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
          <button onClick={() => navigate('/home')} className="btn-outline w-full">
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
            <span className="text-sm text-gray-400">
              {currentLanguage === 'en' ? '영어 표현' : currentLanguage === 'ja' ? '일본어 표현' : '중국어 표현'}
            </span>
            <button
              onClick={() => handlePlayAudio()}
              className={`p-2 rounded-full ${
                isPlaying ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* 영어: 기존 레이아웃 */}
          {currentLanguage === 'en' ? (
            <>
              <p className="text-xl font-bold text-foreground mb-2">
                {currentChunk.expression}
              </p>
              <p className="text-sm text-gray-400 mb-4">{currentChunk.pronunciation}</p>
            </>
          ) : (
            /* 일본어/중국어: 한글 발음 강조 레이아웃 */
            <>
              {/* 한글 발음 - 가장 크게 */}
              <p className="text-2xl font-bold text-primary-600 mb-3">
                {currentChunk.pronunciation}
              </p>
              {/* 원어 표현 */}
              <p className="text-lg text-foreground mb-1">
                {currentChunk.expression}
              </p>
              {/* 로마자/핀인 표기가 있으면 표시 */}
              <p className="text-xs text-gray-400 mb-4">
                {currentLanguage === 'ja' ? '(따라 읽어보세요)' : '(성조에 주의하세요)'}
              </p>
            </>
          )}

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

        {/* 섀도잉 모드 - 녹음 및 평가 */}
        {step === 'shadowing' && (
          <div className="mt-6 space-y-4">
            <p className="text-center text-gray-500">
              {isRecording ? '말하세요... (5초)' : '음성을 듣고 따라 말해보세요'}
            </p>

            {/* 컨트롤 버튼 */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handlePlayAudio()}
                className={`p-4 rounded-full transition-colors ${
                  isPlaying ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                }`}
                title="원어민 발음 듣기"
              >
                <Volume2 className="w-6 h-6" />
              </button>
              <button
                onClick={handleRecord}
                className={`p-6 rounded-full transition-all ${
                  isRecording
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-primary-500 hover:bg-primary-600'
                }`}
                title={isRecording ? '녹음 중지' : '녹음 시작'}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </button>
              <button
                onClick={handleResetShadowing}
                className="p-4 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                title="다시 시도"
              >
                <RotateCcw className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* 녹음 재생 버튼 */}
            {recordedAudioUrl && (
              <div className="flex justify-center">
                <button
                  onClick={handlePlayRecording}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                    isPlayingRecording
                      ? 'bg-secondary-100 text-secondary-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <PlayCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">내 발음 듣기</span>
                </button>
              </div>
            )}

            {/* 인식된 텍스트 표시 */}
            {recognizedText && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">인식된 발음</p>
                <p className="text-foreground">{recognizedText}</p>
              </div>
            )}

            {/* 발음 점수 표시 */}
            {pronunciationScore !== null && (
              <div className={`p-4 rounded-xl text-center ${
                isPassed ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <p className="text-sm text-gray-500 mb-2">발음 정확도</p>
                <p className={`text-4xl font-bold ${
                  isPassed ? 'text-green-600' : 'text-red-500'
                }`}>
                  {pronunciationScore}점
                </p>
                <p className={`text-sm mt-2 font-medium ${
                  isPassed ? 'text-green-600' : 'text-red-500'
                }`}>
                  {isPassed ? '통과! 잘 하셨어요!' : '80점 이상이 필요해요. 다시 도전해보세요!'}
                </p>
              </div>
            )}
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
