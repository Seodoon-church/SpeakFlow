import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  AlertCircle,
  BookOpen,
  MessageCircle,
  Mic,
  Type,
  Check,
  X,
  RotateCcw,
  Target,
  Trophy,
  Zap,
  Filter,
  TrendingUp,
} from 'lucide-react';
import { useQuickLearnStore, type MistakeRecord } from '@/stores/quickLearnStore';
import { useChatHistoryStore } from '@/stores/chatHistoryStore';

type ViewMode = 'dashboard' | 'review' | 'result';
type MistakeFilter = 'all' | 'grammar' | 'vocabulary' | 'pronunciation' | 'spelling';

// 실수 타입별 정보
const MISTAKE_TYPES: Record<MistakeRecord['type'], { name: string; icon: typeof AlertCircle; color: string }> = {
  grammar: { name: '문법', icon: BookOpen, color: 'bg-red-100 text-red-600' },
  vocabulary: { name: '어휘', icon: MessageCircle, color: 'bg-blue-100 text-blue-600' },
  pronunciation: { name: '발음', icon: Mic, color: 'bg-purple-100 text-purple-600' },
  spelling: { name: '철자', icon: Type, color: 'bg-yellow-100 text-yellow-600' },
};

// 샘플 실수 데이터 (실제로는 AI 대화에서 수집됨)
const SAMPLE_MISTAKES: Omit<MistakeRecord, 'id' | 'createdAt' | 'reviewCount' | 'mastered' | 'lastReviewedAt'>[] = [
  {
    type: 'grammar',
    original: 'I goed to the store',
    corrected: 'I went to the store',
    explanation: 'Go의 과거형은 goed가 아니라 went입니다 (불규칙 동사)',
    context: '일상 대화',
    category: '불규칙 동사',
  },
  {
    type: 'grammar',
    original: 'She don\'t like coffee',
    corrected: 'She doesn\'t like coffee',
    explanation: '3인칭 단수에는 does를 사용합니다',
    context: '취미 대화',
    category: '주어-동사 일치',
  },
  {
    type: 'vocabulary',
    original: 'I\'m very interesting in art',
    corrected: 'I\'m very interested in art',
    explanation: 'Interesting은 사물을 설명, interested는 사람의 감정을 설명합니다',
    context: '취미 대화',
    category: '-ed/-ing 형용사',
  },
  {
    type: 'spelling',
    original: 'definately',
    corrected: 'definitely',
    explanation: 'definitely의 올바른 철자입니다',
    context: '이메일 작성',
    category: '자주 틀리는 단어',
  },
  {
    type: 'pronunciation',
    original: '/θɪŋk/ → /sɪŋk/',
    corrected: '/θɪŋk/ (think)',
    explanation: 'th 발음은 혀를 이 사이에 놓고 발음합니다',
    context: '발음 연습',
    category: 'th 발음',
  },
];

export default function MistakesPage() {
  const navigate = useNavigate();
  const { mistakes, addMistake, reviewMistake, getUnmasteredMistakes } = useQuickLearnStore();
  const { addXp } = useChatHistoryStore();

  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [filter, setFilter] = useState<MistakeFilter>('all');
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewResults, setReviewResults] = useState<{ correct: number; incorrect: number }>({ correct: 0, incorrect: 0 });

  // 샘플 데이터 추가 (처음 방문 시)
  const initSampleData = () => {
    if (mistakes.length === 0) {
      SAMPLE_MISTAKES.forEach(m => addMistake(m));
    }
  };

  // 필터링된 실수
  const filteredMistakes = mistakes.filter(m =>
    filter === 'all' || m.type === filter
  );

  // 복습할 실수들
  const unmasteredMistakes = getUnmasteredMistakes();
  const reviewMistakes = unmasteredMistakes.filter(m =>
    filter === 'all' || m.type === filter
  );

  // 통계
  const stats = {
    total: mistakes.length,
    mastered: mistakes.filter(m => m.mastered).length,
    grammar: mistakes.filter(m => m.type === 'grammar').length,
    vocabulary: mistakes.filter(m => m.type === 'vocabulary').length,
    pronunciation: mistakes.filter(m => m.type === 'pronunciation').length,
    spelling: mistakes.filter(m => m.type === 'spelling').length,
  };

  // 복습 시작
  const startReview = () => {
    if (reviewMistakes.length === 0) {
      alert('복습할 실수가 없습니다!');
      return;
    }
    setCurrentReviewIndex(0);
    setShowAnswer(false);
    setReviewResults({ correct: 0, incorrect: 0 });
    setViewMode('review');
  };

  // 다음 복습
  const handleReview = (mastered: boolean) => {
    const currentMistake = reviewMistakes[currentReviewIndex];
    reviewMistake(currentMistake.id, mastered);

    setReviewResults(prev => ({
      correct: prev.correct + (mastered ? 1 : 0),
      incorrect: prev.incorrect + (mastered ? 0 : 1),
    }));

    setShowAnswer(false);

    if (currentReviewIndex < reviewMistakes.length - 1) {
      setCurrentReviewIndex(prev => prev + 1);
    } else {
      // 복습 완료
      const xpEarned = reviewResults.correct * 5 + 10;
      addXp(xpEarned, 'mistakes-review');
      setViewMode('result');
    }
  };

  // 필터 버튼
  const filterButtons: { key: MistakeFilter; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'grammar', label: '문법' },
    { key: 'vocabulary', label: '어휘' },
    { key: 'pronunciation', label: '발음' },
    { key: 'spelling', label: '철자' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => {
              if (viewMode === 'dashboard') navigate(-1);
              else setViewMode('dashboard');
            }}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">
            {viewMode === 'dashboard' && '실수에서 배우기'}
            {viewMode === 'review' && '복습 중'}
            {viewMode === 'result' && '복습 완료!'}
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          {/* 대시보드 */}
          {viewMode === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* 통계 카드 */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 text-white mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-80">총 수집된 실수</p>
                    <p className="text-3xl font-bold">{stats.total}개</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/10 rounded-xl p-2 text-center">
                    <p className="text-xl font-bold">{stats.mastered}</p>
                    <p className="text-xs opacity-80">마스터</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2 text-center">
                    <p className="text-xl font-bold">{unmasteredMistakes.length}</p>
                    <p className="text-xs opacity-80">복습 필요</p>
                  </div>
                </div>
              </div>

              {/* 샘플 데이터 추가 버튼 (개발용) */}
              {mistakes.length === 0 && (
                <button
                  onClick={initSampleData}
                  className="w-full mb-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm"
                >
                  샘플 데이터 추가 (테스트용)
                </button>
              )}

              {/* 복습 시작 버튼 */}
              {unmasteredMistakes.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startReview}
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-5 text-white text-center mb-6"
                >
                  <Target className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-xl font-bold mb-1">실수 복습하기</p>
                  <p className="text-sm opacity-80">{unmasteredMistakes.length}개 복습 가능</p>
                </motion.button>
              )}

              {/* 타입별 통계 */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {Object.entries(MISTAKE_TYPES).map(([key, info]) => {
                  const count = stats[key as keyof typeof stats] as number;
                  const Icon = info.icon;
                  return (
                    <div
                      key={key}
                      className={`rounded-xl p-3 ${info.color}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4" />
                        <span className="font-medium text-sm">{info.name}</span>
                      </div>
                      <p className="text-2xl font-bold">{count}개</p>
                    </div>
                  );
                })}
              </div>

              {/* 필터 */}
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                {filterButtons.map(btn => (
                  <button
                    key={btn.key}
                    onClick={() => setFilter(btn.key)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      filter === btn.key
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* 실수 목록 */}
              <div className="space-y-3">
                {filteredMistakes.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>아직 수집된 실수가 없습니다</p>
                    <p className="text-sm mt-1">AI와 대화하면서 실수가 자동으로 수집됩니다</p>
                  </div>
                ) : (
                  filteredMistakes.map((mistake) => {
                    const typeInfo = MISTAKE_TYPES[mistake.type];
                    const Icon = typeInfo.icon;
                    return (
                      <motion.div
                        key={mistake.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white rounded-xl p-4 shadow-sm border ${
                          mistake.mastered ? 'border-green-200' : 'border-gray-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeInfo.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                {typeInfo.name}
                              </span>
                              {mistake.mastered && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-600">
                                  마스터
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm mb-1">
                              <span className="text-red-500 line-through">{mistake.original}</span>
                              <span className="text-gray-400">→</span>
                              <span className="text-green-600 font-medium">{mistake.corrected}</span>
                            </div>
                            <p className="text-xs text-gray-500">{mistake.explanation}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* 복습 화면 */}
          {viewMode === 'review' && reviewMistakes.length > 0 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* 진행률 */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>{currentReviewIndex + 1} / {reviewMistakes.length}</span>
                  <span>{Math.round(((currentReviewIndex + 1) / reviewMistakes.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentReviewIndex + 1) / reviewMistakes.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* 현재 실수 카드 */}
              <motion.div
                key={currentReviewIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6"
              >
                {(() => {
                  const mistake = reviewMistakes[currentReviewIndex];
                  const typeInfo = MISTAKE_TYPES[mistake.type];
                  const Icon = typeInfo.icon;
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeInfo.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">{typeInfo.name}</span>
                        <span className="text-xs text-gray-400">• {mistake.category}</span>
                      </div>

                      <div className="text-center mb-6">
                        <p className="text-xl font-bold text-red-500 line-through mb-2">
                          {mistake.original}
                        </p>
                        <p className="text-sm text-gray-500">이 표현의 문제점은?</p>
                      </div>

                      {showAnswer ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-green-50 rounded-xl p-4 border border-green-100"
                        >
                          <p className="text-lg font-bold text-green-700 mb-2">
                            ✓ {mistake.corrected}
                          </p>
                          <p className="text-sm text-green-600">{mistake.explanation}</p>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => setShowAnswer(true)}
                          className="w-full py-3 bg-primary-100 text-primary-600 rounded-xl font-medium"
                        >
                          정답 보기
                        </button>
                      )}
                    </>
                  );
                })()}
              </motion.div>

              {/* 평가 버튼 */}
              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReview(false)}
                    className="flex-1 py-4 bg-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    아직 헷갈려요
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReview(true)}
                    className="flex-1 py-4 bg-green-100 text-green-600 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    이제 알겠어요!
                  </motion.button>
                </motion.div>
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
                className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center"
              >
                <Trophy className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold mb-2">복습 완료!</h2>
              <p className="text-gray-500 mb-6">실수를 통해 성장하고 있어요</p>

              {/* 결과 통계 */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-700">{reviewResults.correct}</p>
                  <p className="text-xs text-green-600">마스터</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <RotateCcw className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-700">{reviewResults.incorrect}</p>
                  <p className="text-xs text-orange-600">다시 복습</p>
                </div>
              </div>

              {/* XP 획득 */}
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-4 text-white mb-6">
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">+{reviewResults.correct * 5 + 10} XP 획득!</span>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setViewMode('dashboard')}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
                >
                  대시보드
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/home')}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium"
                >
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
