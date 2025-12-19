import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Brain,
  Zap,
  Trophy,
  Clock,
  Volume2,
  RotateCcw,
  Check,
  X,
  Sparkles,
  BookOpen,
  Target,
  Play,
  Filter,
} from 'lucide-react';
import {
  useWordStore,
  getWordMastery,
  WORD_CATEGORIES,
  CEFR_LEVELS,
  ENGLISH_WORDS,
  type CEFRLevel,
  type WordCategory,
  type QuizMode,
} from '@/stores';
import { useChatHistoryStore } from '@/stores/chatHistoryStore';

type ViewMode = 'home' | 'quiz' | 'review' | 'result';

export default function WordQuizPage() {
  const navigate = useNavigate();
  const {
    words,
    addWords,
    currentSession,
    startQuiz,
    answerQuestion,
    nextQuestion,
    endQuiz,
    getTotalCount,
    getMasteredCount,
    getLearningCount,
    getDueCount,
    getDueWords,
    reviewWord,
  } = useWordStore();
  const { addXp, updateQuestProgress } = useChatHistoryStore();

  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterLevel, setFilterLevel] = useState<CEFRLevel | null>(null);
  const [filterCategory, setFilterCategory] = useState<WordCategory | null>(null);

  // 플래시카드 상태
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardWords, setFlashcardWords] = useState<typeof words[string][]>([]);

  // 초기 단어 로드
  useEffect(() => {
    if (getTotalCount() === 0) {
      addWords(ENGLISH_WORDS);
    }
  }, [getTotalCount, addWords]);

  // TTS
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 퀴즈 시작
  const handleStartQuiz = (mode: QuizMode) => {
    startQuiz(mode, {
      level: filterLevel || undefined,
      category: filterCategory || undefined,
      count: 10,
    });
    setViewMode('quiz');
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  // 플래시카드 복습 시작
  const startFlashcardReview = () => {
    const dueWords = getDueWords();
    if (dueWords.length === 0) return;

    const shuffled = [...dueWords].sort(() => Math.random() - 0.5).slice(0, 20);
    setFlashcardWords(shuffled);
    setFlashcardIndex(0);
    setShowFlashcardAnswer(false);
    setViewMode('review');
  };

  // 퀴즈 답변
  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const correct = answerQuestion(answer);
    setIsCorrect(correct);

    if (correct) {
      addXp(5, '단어 퀴즈 정답');
      updateQuestProgress('words', 1);
    }
  };

  // 다음 문제
  const handleNext = () => {
    nextQuestion();
    setSelectedAnswer(null);
    setIsCorrect(null);

    if (currentSession && currentSession.currentIndex >= currentSession.questions.length - 1) {
      setViewMode('result');
    }
  };

  // 플래시카드 복습 처리
  const handleFlashcardReview = (quality: 1 | 2 | 3 | 4) => {
    const word = flashcardWords[flashcardIndex];
    if (word) {
      reviewWord(word.id, quality);
      if (quality >= 3) {
        addXp(3, '단어 복습');
        updateQuestProgress('words', 1);
      }
    }

    if (flashcardIndex < flashcardWords.length - 1) {
      setFlashcardIndex(prev => prev + 1);
      setShowFlashcardAnswer(false);
    } else {
      setViewMode('home');
    }
  };

  // 퀴즈 모드
  if (viewMode === 'quiz' && currentSession) {
    const question = currentSession.questions[currentSession.currentIndex];
    const progress = ((currentSession.currentIndex + 1) / currentSession.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        {/* 헤더 */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => { endQuiz(); setViewMode('home'); }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-foreground">
                  {currentSession.score}/{currentSession.currentIndex + (selectedAnswer ? 1 : 0)}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {currentSession.currentIndex + 1}/{currentSession.questions.length}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              />
            </div>
          </div>
        </header>

        {/* 문제 */}
        <main className="px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSession.currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-md mx-auto"
            >
              {/* 문제 유형 */}
              <p className="text-center text-sm text-gray-500 mb-4">
                {question.type === 'eng-to-kor' ? '영어 → 한국어' : '한국어 → 영어'}
              </p>

              {/* 문제 카드 */}
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center mb-6">
                <p className="text-3xl font-bold text-foreground mb-2">
                  {question.type === 'eng-to-kor' ? question.word.word : question.word.meaning}
                </p>
                {question.type === 'eng-to-kor' && question.word.pronunciation && (
                  <button
                    onClick={() => speak(question.word.word)}
                    className="inline-flex items-center gap-1 text-primary-600 text-sm hover:text-primary-700"
                  >
                    <Volume2 className="w-4 h-4" />
                    {question.word.pronunciation}
                  </button>
                )}
              </div>

              {/* 선택지 */}
              <div className="space-y-3">
                {question.options?.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectOption = option === question.correctAnswer;

                  let buttonClass = 'bg-white border-2 border-gray-200 hover:border-primary-500';
                  if (selectedAnswer) {
                    if (isCorrectOption) {
                      buttonClass = 'bg-green-50 border-2 border-green-500';
                    } else if (isSelected && !isCorrect) {
                      buttonClass = 'bg-red-50 border-2 border-red-500';
                    } else {
                      buttonClass = 'bg-gray-50 border-2 border-gray-200 opacity-50';
                    }
                  }

                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleAnswer(option)}
                      disabled={!!selectedAnswer}
                      className={`w-full p-4 rounded-xl text-left font-medium transition-all ${buttonClass}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {selectedAnswer && isCorrectOption && (
                          <Check className="w-5 h-5 text-green-600" />
                        )}
                        {selectedAnswer && isSelected && !isCorrect && (
                          <X className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* 결과 및 다음 버튼 */}
              {selectedAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className={`p-4 rounded-xl mb-4 ${
                    isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <p className="font-bold mb-1">
                      {isCorrect ? '정답입니다! 🎉' : '틀렸습니다 😢'}
                    </p>
                    {!isCorrect && (
                      <p className="text-sm">
                        정답: {question.correctAnswer}
                      </p>
                    )}
                    {question.word.example && (
                      <p className="text-sm mt-2 opacity-80">
                        예문: {question.word.example}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold"
                  >
                    {currentSession.currentIndex < currentSession.questions.length - 1
                      ? '다음 문제'
                      : '결과 보기'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  // 플래시카드 복습 모드
  if (viewMode === 'review' && flashcardWords.length > 0) {
    const word = flashcardWords[flashcardIndex];
    const mastery = getWordMastery(word);

    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setViewMode('home')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-sm text-gray-500">
                {flashcardIndex + 1}/{flashcardWords.length}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                style={{ width: `${((flashcardIndex + 1) / flashcardWords.length) * 100}%` }}
              />
            </div>
          </div>
        </header>

        <main className="px-4 py-6">
          <motion.div
            key={word.id}
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            className="max-w-md mx-auto"
          >
            <div
              className="bg-white rounded-2xl shadow-lg p-8 min-h-[300px] flex flex-col items-center justify-center cursor-pointer"
              onClick={() => !showFlashcardAnswer && setShowFlashcardAnswer(true)}
            >
              <span className={`text-xs px-2 py-0.5 rounded-full mb-4 ${mastery.bgColor} ${mastery.color}`}>
                {mastery.level}
              </span>

              <p className="text-4xl font-bold text-foreground mb-3">{word.word}</p>

              {word.pronunciation && (
                <button
                  onClick={(e) => { e.stopPropagation(); speak(word.word); }}
                  className="inline-flex items-center gap-1 text-primary-600 text-sm hover:text-primary-700 mb-2"
                >
                  <Volume2 className="w-4 h-4" />
                  {word.pronunciation}
                </button>
              )}

              {showFlashcardAnswer ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center"
                >
                  <div className="w-16 h-0.5 bg-gray-200 rounded mx-auto mb-4" />
                  <p className="text-xl font-bold text-primary-600 mb-2">{word.meaning}</p>
                  {word.example && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{word.example}</p>
                      {word.exampleMeaning && (
                        <p className="text-xs text-gray-500 mt-1">{word.exampleMeaning}</p>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <p className="text-xs text-gray-400 mt-4">탭하여 정답 확인</p>
              )}
            </div>

            {showFlashcardAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-4 gap-2 mt-5"
              >
                <button
                  onClick={() => handleFlashcardReview(1)}
                  className="py-3 rounded-lg font-bold text-xs flex flex-col items-center gap-1 bg-red-100 text-red-600 hover:bg-red-200"
                >
                  <X className="w-4 h-4" />
                  다시
                </button>
                <button
                  onClick={() => handleFlashcardReview(2)}
                  className="py-3 rounded-lg font-bold text-xs flex flex-col items-center gap-1 bg-orange-100 text-orange-600 hover:bg-orange-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  어려움
                </button>
                <button
                  onClick={() => handleFlashcardReview(3)}
                  className="py-3 rounded-lg font-bold text-xs flex flex-col items-center gap-1 bg-blue-100 text-blue-600 hover:bg-blue-200"
                >
                  <Check className="w-4 h-4" />
                  좋음
                </button>
                <button
                  onClick={() => handleFlashcardReview(4)}
                  className="py-3 rounded-lg font-bold text-xs flex flex-col items-center gap-1 bg-green-100 text-green-600 hover:bg-green-200"
                >
                  <Sparkles className="w-4 h-4" />
                  쉬움
                </button>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    );
  }

  // 결과 화면
  if (viewMode === 'result' && currentSession) {
    const percentage = Math.round((currentSession.score / currentSession.questions.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => { endQuiz(); setViewMode('home'); }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-foreground">퀴즈 결과</h1>
          </div>
        </header>

        <main className="px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Trophy className="w-16 h-16 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">퀴즈 완료!</h2>
            <p className="text-4xl font-bold text-primary-600 mb-4">{percentage}%</p>

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{currentSession.score}</p>
                  <p className="text-sm text-gray-500">정답</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">
                    {currentSession.questions.length - currentSession.score}
                  </p>
                  <p className="text-sm text-gray-500">오답</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => { endQuiz(); handleStartQuiz('choice'); }}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold"
              >
                다시 도전하기
              </button>
              <button
                onClick={() => { endQuiz(); setViewMode('home'); }}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold"
              >
                홈으로 돌아가기
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // 홈 화면
  const totalCount = getTotalCount();
  const masteredCount = getMasteredCount();
  const learningCount = getLearningCount();
  const dueCount = getDueCount();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pb-20">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Brain className="w-5 h-5" />
                단어 퀴즈
              </h1>
              <p className="text-indigo-200 text-xs">게임처럼 재미있게 단어 학습</p>
            </div>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
              <p className="text-lg font-bold">{totalCount}</p>
              <p className="text-[10px] text-white/80">전체</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
              <p className="text-lg font-bold">{learningCount}</p>
              <p className="text-[10px] text-white/80">학습중</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
              <p className="text-lg font-bold">{masteredCount}</p>
              <p className="text-[10px] text-white/80">마스터</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
              <p className="text-lg font-bold">{dueCount}</p>
              <p className="text-[10px] text-white/80">복습</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-2">
        {/* 필터 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <Filter className="w-4 h-4" />
            필터 설정
            {(filterLevel || filterCategory) && (
              <span className="bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full text-xs">
                적용됨
              </span>
            )}
          </button>

          {showFilter && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 space-y-4"
            >
              {/* 레벨 필터 */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">레벨</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterLevel(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      !filterLevel ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    전체
                  </button>
                  {Object.entries(CEFR_LEVELS).map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => setFilterLevel(key as CEFRLevel)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        filterLevel === key ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {info.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 카테고리 필터 */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">카테고리</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterCategory(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      !filterCategory ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    전체
                  </button>
                  {Object.entries(WORD_CATEGORIES).map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => setFilterCategory(key as WordCategory)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        filterCategory === key ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {info.icon} {info.name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* 복습 카드 */}
        {dueCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white mb-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold">복습할 단어가 있어요!</h2>
                <p className="text-sm opacity-80">{dueCount}개 단어가 복습을 기다려요</p>
              </div>
            </div>
            <button
              onClick={startFlashcardReview}
              className="w-full py-3 bg-white text-amber-600 rounded-lg font-bold flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              플래시카드로 복습하기
            </button>
          </motion.div>
        )}

        {/* 퀴즈 모드 선택 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-4 mb-4"
        >
          <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            퀴즈 모드
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleStartQuiz('choice')}
              className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white text-left"
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                <Brain className="w-5 h-5" />
              </div>
              <p className="font-bold mb-0.5">4지선다</p>
              <p className="text-xs opacity-80">클래식 퀴즈</p>
            </button>

            <button
              onClick={startFlashcardReview}
              disabled={totalCount < 4}
              className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                <BookOpen className="w-5 h-5" />
              </div>
              <p className="font-bold mb-0.5">플래시카드</p>
              <p className="text-xs opacity-80">SRS 복습</p>
            </button>
          </div>
        </motion.div>

        {/* 레벨별 학습 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-4"
        >
          <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            레벨별 학습
          </h2>

          <div className="space-y-2">
            {Object.entries(CEFR_LEVELS).map(([level, info]) => {
              const levelWords = Object.values(words).filter(w => w.level === level);
              const masteredInLevel = levelWords.filter(w => w.repetitions >= 3 && w.interval >= 21).length;

              return (
                <button
                  key={level}
                  onClick={() => {
                    setFilterLevel(level as CEFRLevel);
                    handleStartQuiz('choice');
                  }}
                  disabled={levelWords.length < 4}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <div className={`w-10 h-10 ${info.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                    {level}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground text-sm">{info.name}</p>
                    <p className="text-xs text-gray-500">{info.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{levelWords.length}</p>
                    <p className="text-xs text-gray-400">{masteredInLevel} 마스터</p>
                  </div>
                  <Play className="w-4 h-4 text-gray-400" />
                </button>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
