import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Brain,
  RotateCcw,
  Check,
  X,
  Sparkles,
  BookOpen,
  Trophy,
  Clock,
  Volume2,
  Plus,
} from 'lucide-react';
import {
  useVocabularyStore,
  getMasteryLevel,
  REVIEW_BUTTONS,
  SAMPLE_VOCABULARY,
} from '@/stores';
import type { VocabWord, ReviewQuality } from '@/stores';

type ViewMode = 'overview' | 'review' | 'add';

export default function VocabularyPage() {
  const navigate = useNavigate();
  const {
    words,
    addWord,
    addWordsFromContent,
    reviewWord,
    getDueWords,
    getAllWords,
    getLearnedCount,
    getMasteredCount,
    getNewCount,
  } = useVocabularyStore();

  const [mode, setMode] = useState<ViewMode>('overview');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionResults, setSessionResults] = useState({ correct: 0, incorrect: 0 });
  const [reviewQueue, setReviewQueue] = useState<VocabWord[]>([]);

  // Add word form state
  const [newWord, setNewWord] = useState({ word: '', reading: '', meaning: '', example: '' });

  // Stats
  const totalWords = getLearnedCount();
  const masteredWords = getMasteredCount();
  const newWords = getNewCount();
  const dueWords = useMemo(() => getDueWords(), [words]);
  const dueCount = dueWords.length;
  const allWordsList = useMemo(() => getAllWords(), [words]);

  const currentCard = reviewQueue[currentIndex];

  // Text-to-speech for Japanese
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Add sample vocabulary on first visit
  useEffect(() => {
    if (totalWords === 0) {
      addWordsFromContent('sample', 'sample', SAMPLE_VOCABULARY);
    }
  }, []);

  const handleReview = (quality: ReviewQuality) => {
    if (!currentCard) return;

    reviewWord(currentCard.id, quality);

    if (quality >= 3) {
      setSessionResults(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setSessionResults(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    if (currentIndex < reviewQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Session complete
      setMode('overview');
      setCurrentIndex(0);
      setShowAnswer(false);
    }
  };

  const startReview = () => {
    const due = getDueWords();
    if (due.length === 0) return;

    // Shuffle and limit to 20 words per session
    const shuffled = [...due].sort(() => Math.random() - 0.5).slice(0, 20);
    setReviewQueue(shuffled);
    setMode('review');
    setCurrentIndex(0);
    setShowAnswer(false);
    setSessionResults({ correct: 0, incorrect: 0 });
  };

  const handleAddWord = () => {
    if (!newWord.word || !newWord.reading || !newWord.meaning) return;

    addWord({
      id: `manual-${Date.now()}`,
      word: newWord.word,
      reading: newWord.reading,
      meaning: newWord.meaning,
      example: newWord.example || undefined,
      source: 'manual',
    });

    setNewWord({ word: '', reading: '', meaning: '', example: '' });
    setMode('overview');
  };

  // Review Mode
  if (mode === 'review' && currentCard) {
    const mastery = getMasteryLevel(currentCard);

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMode('overview')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {currentIndex + 1} / {reviewQueue.length}
                </span>
              </div>
              <div className="w-10" />
            </div>
            {/* Progress */}
            <div className="h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / reviewQueue.length) * 100}%` }}
                className="h-full bg-amber-500 rounded-full"
              />
            </div>
          </div>
        </header>

        {/* Flashcard */}
        <main className="px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-md mx-auto"
            >
              <div
                className="bg-white rounded-2xl shadow-lg p-6 min-h-[300px] flex flex-col items-center justify-center cursor-pointer"
                onClick={() => !showAnswer && setShowAnswer(true)}
              >
                {/* Mastery badge */}
                <span className={`text-xs px-2 py-0.5 rounded-full mb-4 ${mastery.bgColor} ${mastery.color}`}>
                  {mastery.level}
                </span>

                {/* Word */}
                <p className="text-4xl font-bold text-foreground mb-3">
                  {currentCard.word}
                </p>

                {/* Reading with TTS */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(currentCard.word);
                  }}
                  className="inline-flex items-center gap-1 text-primary-600 text-sm hover:text-primary-700 mb-2"
                >
                  <Volume2 className="w-4 h-4" />
                  {currentCard.reading}
                </button>

                {showAnswer ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-center"
                  >
                    <div className="w-16 h-0.5 bg-gray-200 rounded mx-auto mb-4" />
                    <p className="text-xl font-bold text-primary-600 mb-2">
                      {currentCard.meaning}
                    </p>
                    {currentCard.example && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{currentCard.example}</p>
                        {currentCard.exampleMeaning && (
                          <p className="text-xs text-gray-500 mt-1">{currentCard.exampleMeaning}</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <p className="text-xs text-gray-400 mt-4">
                    탭하여 정답 확인
                  </p>
                )}
              </div>

              {/* Review Buttons */}
              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-4 gap-2 mt-5"
                >
                  {REVIEW_BUTTONS.map(({ quality, label, color }) => (
                    <button
                      key={quality}
                      onClick={() => handleReview(quality)}
                      className={`py-3 rounded-lg font-bold text-xs flex flex-col items-center gap-1 transition-colors ${color}`}
                    >
                      {quality === 1 && <X className="w-4 h-4" />}
                      {quality === 2 && <RotateCcw className="w-4 h-4" />}
                      {quality === 3 && <Check className="w-4 h-4" />}
                      {quality === 4 && <Sparkles className="w-4 h-4" />}
                      <span>{label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  // Add Word Mode
  if (mode === 'add') {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setMode('overview')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-foreground">단어 추가</h1>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="space-y-4 max-w-md mx-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                일본어 단어 *
              </label>
              <input
                type="text"
                value={newWord.word}
                onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                placeholder="例: 美味しい"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                읽기 (히라가나) *
              </label>
              <input
                type="text"
                value={newWord.reading}
                onChange={(e) => setNewWord({ ...newWord, reading: e.target.value })}
                placeholder="例: おいしい"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                의미 (한국어) *
              </label>
              <input
                type="text"
                value={newWord.meaning}
                onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                placeholder="例: 맛있다"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                예문 (선택)
              </label>
              <input
                type="text"
                value={newWord.example}
                onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                placeholder="例: このラーメンは美味しい！"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>

            <button
              onClick={handleAddWord}
              disabled={!newWord.word || !newWord.reading || !newWord.meaning}
              className="w-full py-3 bg-primary-500 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              단어 추가
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Overview Mode
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
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
                단어장
              </h1>
              <p className="text-amber-100 text-xs">SRS 간격 반복 학습</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1">
                <BookOpen className="w-3 h-3" />
                <p className="text-lg font-bold">{totalWords}</p>
              </div>
              <p className="text-[10px] text-white/80">전체</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                <p className="text-lg font-bold">{newWords}</p>
              </div>
              <p className="text-[10px] text-white/80">새 단어</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1">
                <Trophy className="w-3 h-3" />
                <p className="text-lg font-bold">{masteredWords}</p>
              </div>
              <p className="text-[10px] text-white/80">마스터</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                <p className="text-lg font-bold">{dueCount}</p>
              </div>
              <p className="text-[10px] text-white/80">오늘 복습</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-2">
        {/* Review Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-4 mb-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-foreground text-sm">복습 세션</h2>
              <p className="text-xs text-gray-500">
                {dueCount}개 단어 복습 필요
              </p>
            </div>
          </div>

          {totalWords === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600 font-medium text-sm mb-1">
                단어장이 비어있어요
              </p>
              <p className="text-xs text-gray-500 mb-3">
                단어를 추가하거나 학습을 시작하세요
              </p>
            </div>
          ) : dueCount > 0 ? (
            <button
              onClick={startReview}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              복습 시작 ({Math.min(dueCount, 20)}개)
            </button>
          ) : (
            <div className="text-center py-3">
              <p className="text-green-600 font-medium text-sm">
                오늘 복습 완료! 🎉
              </p>
              <p className="text-xs text-gray-500">
                모든 단어를 복습했어요
              </p>
            </div>
          )}
        </motion.div>

        {/* Session Results */}
        {sessionResults.correct + sessionResults.incorrect > 0 && mode === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4"
          >
            <h3 className="font-bold text-green-800 mb-1 text-sm">세션 완료!</h3>
            <p className="text-xs text-green-700">
              ✓ {sessionResults.correct} 정답 • ✗ {sessionResults.incorrect} 다시 학습
            </p>
          </motion.div>
        )}

        {/* Add Word Button */}
        <button
          onClick={() => setMode('add')}
          className="w-full mb-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium text-sm flex items-center justify-center gap-2 hover:border-primary-500 hover:text-primary-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          단어 추가
        </button>

        {/* Word List */}
        {totalWords > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-sm font-bold text-foreground mb-2">
              전체 단어 ({totalWords})
            </h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {allWordsList.map((word) => {
                const mastery = getMasteryLevel(word);
                return (
                  <div
                    key={word.id}
                    className="flex items-center gap-3 p-3 border-b border-gray-50 last:border-b-0"
                  >
                    <button
                      onClick={() => speak(word.word)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Volume2 className="w-4 h-4 text-gray-400 hover:text-primary-600" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">
                          {word.word}
                        </span>
                        <span className="text-gray-400 text-xs">({word.reading})</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{word.meaning}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${mastery.bgColor} ${mastery.color}`}>
                        {mastery.level}
                      </span>
                      {word.interval > 0 && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {word.interval}일 후
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
