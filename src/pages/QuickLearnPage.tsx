import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Clock,
  Zap,
  BookOpen,
  MessageCircle,
  Volume2,
  ChevronRight,
  Check,
  X,
  Pause,
  Play,
  RotateCcw,
  Award,
  Train,
  Mic,
  Trophy,
  Target,
} from 'lucide-react';
import {
  useQuickLearnStore,
  QUICK_WORDS,
  QUICK_SENTENCES,
  CONVERSATION_STARTERS,
  getTutorLevelProgress,
} from '@/stores/quickLearnStore';
import { useChatHistoryStore } from '@/stores/chatHistoryStore';

type ViewMode = 'home' | 'tutor-select' | 'mode-select' | 'learning' | 'result';
type LearningPhase = 'words' | 'sentences' | 'conversation' | 'complete';
type LearningMode = 'standard' | 'subway' | 'speaking';

export default function QuickLearnPage() {
  const navigate = useNavigate();
  const {
    currentTutor,
    setCurrentTutor,
    tutors,
    addSession,
    updateTutorXp,
    stats,
    getTodaysSessions,
  } = useQuickLearnStore();
  const { addXp } = useChatHistoryStore();

  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [learningMode, setLearningMode] = useState<LearningMode>('standard');
  const [phase, setPhase] = useState<LearningPhase>('words');
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5분 = 300초
  const [startTime, setStartTime] = useState<number | null>(null);

  // 학습 진행 상태
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [sentencesCompleted, setSentencesCompleted] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // 오늘의 세션
  const todaysSessions = getTodaysSessions();

  // 랜덤 단어/문장 선택
  const [sessionWords] = useState(() =>
    [...QUICK_WORDS].sort(() => Math.random() - 0.5).slice(0, 5)
  );
  const [sessionSentences] = useState(() =>
    [...QUICK_SENTENCES].sort(() => Math.random() - 0.5).slice(0, 3)
  );
  const [conversationTopic] = useState(() =>
    CONVERSATION_STARTERS[Math.floor(Math.random() * CONVERSATION_STARTERS.length)]
  );

  // 타이머
  useEffect(() => {
    if (viewMode !== 'learning' || isPaused || phase === 'complete') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPhase('complete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [viewMode, isPaused, phase]);

  // TTS
  const speak = useCallback((text: string) => {
    if (learningMode === 'subway') return; // 지하철 모드에서는 음성 없음
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }, [learningMode]);

  // 학습 시작
  const startLearning = () => {
    setViewMode('learning');
    setPhase('words');
    setTimeLeft(300);
    setStartTime(Date.now());
    setCurrentWordIndex(0);
    setCurrentSentenceIndex(0);
    setWordsCompleted(0);
    setSentencesCompleted(0);
    setShowAnswer(false);
    setIsPaused(false);
  };

  // 다음 단어
  const nextWord = (correct: boolean) => {
    if (correct) setWordsCompleted((prev) => prev + 1);
    setShowAnswer(false);

    if (currentWordIndex < sessionWords.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
    } else {
      setPhase('sentences');
    }
  };

  // 다음 문장
  const nextSentence = () => {
    setSentencesCompleted((prev) => prev + 1);
    setShowAnswer(false);

    if (currentSentenceIndex < sessionSentences.length - 1) {
      setCurrentSentenceIndex((prev) => prev + 1);
    } else {
      setPhase('conversation');
    }
  };

  // 대화 완료
  const completeConversation = () => {
    setPhase('complete');
  };

  // 세션 완료
  const completeSession = () => {
    const duration = startTime ? Math.floor((Date.now() - startTime) / 1000) : 300;
    const xpEarned = wordsCompleted * 5 + sentencesCompleted * 10 + 20; // 기본 20XP + 보너스

    addSession({
      tutorId: currentTutor?.id || 'emma',
      mode: learningMode,
      wordsLearned: wordsCompleted,
      sentencesPracticed: sentencesCompleted,
      conversationTurns: 1,
      duration,
      xpEarned,
    });

    if (currentTutor) {
      updateTutorXp(currentTutor.id, xpEarned);
    }

    addXp(xpEarned, 'quick-learn');
    setViewMode('result');
  };

  // 시간 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 진행률
  const getProgress = () => {
    if (phase === 'words') return (currentWordIndex / 5) * 33;
    if (phase === 'sentences') return 33 + (currentSentenceIndex / 3) * 33;
    if (phase === 'conversation') return 66 + 17;
    return 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => {
              if (viewMode === 'learning') {
                if (confirm('학습을 중단하시겠어요?')) {
                  setViewMode('home');
                }
              } else if (viewMode === 'home') {
                navigate(-1);
              } else {
                setViewMode('home');
              }
            }}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">
            {viewMode === 'home' && '오늘의 5분'}
            {viewMode === 'tutor-select' && 'AI 튜터 선택'}
            {viewMode === 'mode-select' && '학습 모드'}
            {viewMode === 'learning' && formatTime(timeLeft)}
            {viewMode === 'result' && '학습 완료!'}
          </h1>
          <div className="w-10">
            {viewMode === 'learning' && (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* 학습 중 진행 바 */}
        {viewMode === 'learning' && (
          <div className="px-4 pb-2">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                initial={{ width: 0 }}
                animate={{ width: `${getProgress()}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>단어</span>
              <span>문장</span>
              <span>대화</span>
            </div>
          </div>
        )}
      </header>

      <div className="px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          {/* 홈 화면 */}
          {viewMode === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* 현재 튜터 */}
              <div
                onClick={() => setViewMode('tutor-select')}
                className={`bg-gradient-to-r ${currentTutor?.color || 'from-primary-500 to-secondary-500'} rounded-2xl p-5 text-white mb-6 cursor-pointer`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{currentTutor?.avatar}</div>
                  <div className="flex-1">
                    <p className="text-sm opacity-80">현재 AI 튜터</p>
                    <p className="text-xl font-bold">{currentTutor?.nameKo}</p>
                    <p className="text-sm opacity-80 mt-1">{currentTutor?.descriptionKo}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        Lv.{currentTutor?.level}
                      </span>
                      <div className="flex-1 h-1.5 bg-white/20 rounded-full">
                        <div
                          className="h-full bg-white rounded-full"
                          style={{ width: `${currentTutor ? getTutorLevelProgress(currentTutor) : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 opacity-60" />
                </div>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
                  <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{stats.totalMinutes}</p>
                  <p className="text-xs text-gray-500">총 학습(분)</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
                  <BookOpen className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{stats.wordsLearned}</p>
                  <p className="text-xs text-gray-500">학습 단어</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
                  <Target className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{todaysSessions.length}</p>
                  <p className="text-xs text-gray-500">오늘 세션</p>
                </div>
              </div>

              {/* 학습 시작 버튼 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewMode('mode-select')}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-6 text-white text-center mb-6"
              >
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-90" />
                <p className="text-2xl font-bold mb-1">5분 학습 시작</p>
                <p className="text-sm opacity-80">단어 5개 + 문장 3개 + 대화 1턴</p>
              </motion.button>

              {/* 학습 내용 미리보기 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  5분 학습 구성
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium text-blue-700">단어 5개</p>
                      <p className="text-xs text-blue-600">플래시카드로 빠르게 암기</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium text-green-700">문장 3개</p>
                      <p className="text-xs text-green-600">핵심 패턴 따라 말하기</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium text-purple-700">AI 대화 1턴</p>
                      <p className="text-xs text-purple-600">{currentTutor?.nameKo}와 간단한 대화</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 튜터 선택 */}
          {viewMode === 'tutor-select' && (
            <motion.div
              key="tutor-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <p className="text-gray-600 mb-4">나에게 맞는 AI 튜터를 선택하세요</p>
              <div className="space-y-3">
                {tutors.map((tutor) => (
                  <motion.button
                    key={tutor.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setCurrentTutor(tutor.id);
                      setViewMode('home');
                    }}
                    className={`w-full bg-gradient-to-r ${tutor.color} rounded-2xl p-4 text-white text-left ${
                      currentTutor?.id === tutor.id ? 'ring-4 ring-white/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{tutor.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-lg">{tutor.nameKo}</p>
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                            Lv.{tutor.level}
                          </span>
                        </div>
                        <p className="text-sm opacity-90">{tutor.name}</p>
                        <p className="text-xs opacity-80 mt-1">{tutor.descriptionKo}</p>
                      </div>
                      {currentTutor?.id === tutor.id && (
                        <Check className="w-6 h-6" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* 모드 선택 */}
          {viewMode === 'mode-select' && (
            <motion.div
              key="mode-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <p className="text-gray-600 mb-4">학습 환경에 맞는 모드를 선택하세요</p>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setLearningMode('standard');
                    startLearning();
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-5 text-white text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <Volume2 className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">표준 모드</p>
                      <p className="text-sm opacity-80">음성 + 텍스트 학습</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setLearningMode('subway');
                    startLearning();
                  }}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-800 rounded-2xl p-5 text-white text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <Train className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">지하철 모드</p>
                      <p className="text-sm opacity-80">무음 학습 (텍스트만)</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setLearningMode('speaking');
                    startLearning();
                  }}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-5 text-white text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <Mic className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">스피킹 모드</p>
                      <p className="text-sm opacity-80">큰 소리로 말하기 연습</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* 학습 화면 */}
          {viewMode === 'learning' && (
            <motion.div
              key="learning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* 일시정지 오버레이 */}
              {isPaused && (
                <div className="fixed inset-0 bg-black/50 z-20 flex items-center justify-center">
                  <div className="bg-white rounded-2xl p-6 text-center">
                    <Pause className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="font-bold text-lg mb-2">일시정지</p>
                    <button
                      onClick={() => setIsPaused(false)}
                      className="bg-primary-500 text-white px-6 py-2 rounded-full font-medium"
                    >
                      계속하기
                    </button>
                  </div>
                </div>
              )}

              {/* 단어 학습 */}
              {phase === 'words' && (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    단어 {currentWordIndex + 1} / {sessionWords.length}
                  </p>

                  <motion.div
                    key={currentWordIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-6"
                  >
                    <p className="text-3xl font-bold text-foreground mb-4">
                      {sessionWords[currentWordIndex].word}
                    </p>

                    {learningMode !== 'subway' && (
                      <button
                        onClick={() => speak(sessionWords[currentWordIndex].word)}
                        className="p-3 bg-primary-100 text-primary-600 rounded-full mb-4"
                      >
                        <Volume2 className="w-6 h-6" />
                      </button>
                    )}

                    {showAnswer ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <p className="text-xl text-gray-700 mb-2">
                          {sessionWords[currentWordIndex].meaning}
                        </p>
                        <p className="text-sm text-gray-500 italic">
                          "{sessionWords[currentWordIndex].example}"
                        </p>
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="text-primary-600 font-medium"
                      >
                        뜻 보기
                      </button>
                    )}
                  </motion.div>

                  {showAnswer && (
                    <div className="flex gap-3">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => nextWord(false)}
                        className="flex-1 py-4 bg-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        모르겠어요
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => nextWord(true)}
                        className="flex-1 py-4 bg-green-100 text-green-600 rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        알아요!
                      </motion.button>
                    </div>
                  )}
                </div>
              )}

              {/* 문장 학습 */}
              {phase === 'sentences' && (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    문장 패턴 {currentSentenceIndex + 1} / {sessionSentences.length}
                  </p>

                  <motion.div
                    key={currentSentenceIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6"
                  >
                    <p className="text-sm text-primary-600 font-medium mb-2">
                      패턴: {sessionSentences[currentSentenceIndex].pattern}
                    </p>
                    <p className="text-xl font-bold text-foreground mb-3">
                      {sessionSentences[currentSentenceIndex].example}
                    </p>
                    <p className="text-gray-500">
                      {sessionSentences[currentSentenceIndex].meaning}
                    </p>

                    {learningMode !== 'subway' && (
                      <button
                        onClick={() => speak(sessionSentences[currentSentenceIndex].example)}
                        className="mt-4 p-3 bg-primary-100 text-primary-600 rounded-full"
                      >
                        <Volume2 className="w-6 h-6" />
                      </button>
                    )}
                  </motion.div>

                  {learningMode === 'speaking' && (
                    <p className="text-sm text-gray-500 mb-4">
                      큰 소리로 따라 말해보세요!
                    </p>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={nextSentence}
                    className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold"
                  >
                    {currentSentenceIndex < sessionSentences.length - 1 ? '다음 문장' : '대화로 이동'}
                  </motion.button>
                </div>
              )}

              {/* 대화 */}
              {phase === 'conversation' && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="text-4xl">{currentTutor?.avatar}</div>
                    <div>
                      <p className="font-bold">{currentTutor?.nameKo}</p>
                      <p className="text-xs text-gray-500">AI 튜터</p>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-6 text-white mb-6"
                  >
                    <p className="text-sm opacity-80 mb-2">주제: {conversationTopic.topic}</p>
                    <p className="text-xl font-bold">{conversationTopic.prompt}</p>
                  </motion.div>

                  <p className="text-sm text-gray-500 mb-4">
                    {learningMode === 'speaking'
                      ? '영어로 대답해 보세요!'
                      : '마음속으로 답변을 생각해 보세요'}
                  </p>

                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                    <p className="text-sm text-gray-500 mb-2">답변 예시:</p>
                    <p className="text-gray-700">
                      {conversationTopic.topic === '오늘 하루' && "My day was pretty good. I worked on some projects and had lunch with a colleague."}
                      {conversationTopic.topic === '주말 계획' && "Yes, I'm planning to go hiking with my friends on Saturday."}
                      {conversationTopic.topic === '취미' && "I enjoy reading books and playing video games in my free time."}
                      {conversationTopic.topic === '음식' && "I love Korean BBQ. The grilled meat with side dishes is amazing."}
                      {conversationTopic.topic === '여행' && "I went to Japan last month. It was an amazing experience."}
                      {conversationTopic.topic === '일/공부' && "It's been busy lately, but I'm making good progress."}
                      {conversationTopic.topic === '날씨' && "Yes, it is! Perfect weather for a walk outside."}
                      {conversationTopic.topic === '영화/드라마' && "I just finished watching a great Netflix series!"}
                    </p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={completeConversation}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold"
                  >
                    대화 완료!
                  </motion.button>
                </div>
              )}

              {/* 완료 */}
              {phase === 'complete' && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-6xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <p className="text-2xl font-bold mb-2">잘했어요!</p>
                  <p className="text-gray-500 mb-6">5분 학습을 완료했습니다</p>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={completeSession}
                    className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold"
                  >
                    결과 확인
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* 결과 화면 */}
          {viewMode === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center"
              >
                <Trophy className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold mb-2">학습 완료!</h2>
              <p className="text-gray-500 mb-6">{currentTutor?.nameKo}와 함께한 5분</p>

              {/* 결과 통계 */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{wordsCompleted}</p>
                  <p className="text-xs text-gray-500">단어</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <MessageCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{sentencesCompleted}</p>
                  <p className="text-xs text-gray-500">문장</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    {wordsCompleted * 5 + sentencesCompleted * 10 + 20}
                  </p>
                  <p className="text-xs text-gray-500">XP</p>
                </div>
              </div>

              {/* 튜터 레벨업 */}
              {currentTutor && (
                <div className={`bg-gradient-to-r ${currentTutor.color} rounded-xl p-4 text-white mb-6`}>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{currentTutor.avatar}</div>
                    <div className="flex-1 text-left">
                      <p className="font-bold">{currentTutor.nameKo}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                          Lv.{currentTutor.level}
                        </span>
                        <div className="flex-1 h-1.5 bg-white/20 rounded-full">
                          <div
                            className="h-full bg-white rounded-full transition-all"
                            style={{ width: `${getTutorLevelProgress(currentTutor)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setViewMode('home')}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  다시 하기
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/home')}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <Award className="w-5 h-5" />
                  홈으로
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
