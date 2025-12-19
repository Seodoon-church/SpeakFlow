import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  PenTool,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  BookOpen,
  Target,
  Award,
  ChevronRight,
  RotateCcw,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import {
  useWritingStore,
  WRITING_CATEGORIES,
  WRITING_LEVELS,
  WRITING_PROMPTS,
  generateCorrectionPrompt,
  type WritingPrompt,
  type WritingCategory,
  type WritingLevel,
  type WritingFeedback,
  type Correction,
} from '@/stores/writingStore';
import { useChatHistoryStore } from '@/stores/chatHistoryStore';

type ViewMode = 'home' | 'prompts' | 'write' | 'feedback' | 'history';

// 교정 타입별 색상
const CORRECTION_COLORS: Record<Correction['type'], string> = {
  grammar: 'bg-red-100 text-red-700 border-red-200',
  vocabulary: 'bg-blue-100 text-blue-700 border-blue-200',
  spelling: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  style: 'bg-purple-100 text-purple-700 border-purple-200',
  punctuation: 'bg-gray-100 text-gray-700 border-gray-200',
};

const CORRECTION_LABELS: Record<Correction['type'], string> = {
  grammar: '문법',
  vocabulary: '어휘',
  spelling: '철자',
  style: '스타일',
  punctuation: '구두점',
};

export default function WritingPage() {
  const navigate = useNavigate();
  const { addSubmission, updateFeedback, getRecentSubmissions, stats } = useWritingStore();
  const { addXp } = useChatHistoryStore();

  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedCategory, setSelectedCategory] = useState<WritingCategory | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<WritingLevel>('beginner');
  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(null);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [copied, setCopied] = useState(false);

  // 필터된 프롬프트
  const filteredPrompts = WRITING_PROMPTS.filter(p =>
    (!selectedCategory || p.category === selectedCategory) &&
    p.level === selectedLevel
  );

  // 최근 제출
  const recentSubmissions = getRecentSubmissions(5);

  // 단어 수 계산
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

  // AI 첨삭 요청
  const handleSubmit = async () => {
    if (!selectedPrompt || text.trim().length < 10) return;

    setIsSubmitting(true);

    // 제출 저장
    const submissionId = addSubmission({
      promptId: selectedPrompt.id,
      text: text.trim(),
      xpEarned: 0,
    });

    try {
      // Claude API 호출 (Firebase Function 사용)
      const response = await fetch(
        'https://us-central1-speakflow-app.cloudfunctions.net/claudeChat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: generateCorrectionPrompt(text.trim(), selectedPrompt),
            systemPrompt: 'You are an expert English writing tutor. Always respond with valid JSON only.',
          }),
        }
      );

      if (!response.ok) throw new Error('API error');

      const data = await response.json();

      // JSON 파싱 시도
      let feedbackData: WritingFeedback;
      try {
        // Claude 응답에서 JSON 추출
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          feedbackData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        // 파싱 실패 시 기본 피드백
        feedbackData = {
          overallScore: 70,
          grammarScore: 70,
          vocabularyScore: 70,
          fluencyScore: 70,
          corrections: [],
          suggestions: ['Keep practicing! Your writing is improving.'],
          improvedVersion: text,
          encouragement: '잘 하고 있어요! 계속 연습하세요.',
        };
      }

      // XP 계산 (점수 기반)
      const xpEarned = Math.floor(feedbackData.overallScore / 10) * 5 + 10;
      addXp(xpEarned, 'writing');

      // 피드백 업데이트
      updateFeedback(submissionId, feedbackData);
      setFeedback(feedbackData);
      setViewMode('feedback');

    } catch (error) {
      console.error('AI correction error:', error);
      // 오프라인 또는 에러 시 기본 피드백
      const defaultFeedback: WritingFeedback = {
        overallScore: 75,
        grammarScore: 75,
        vocabularyScore: 75,
        fluencyScore: 75,
        corrections: [],
        suggestions: ['Great effort! Keep practicing regularly.'],
        improvedVersion: text,
        encouragement: '수고했어요! 연습을 계속하면 더 좋아질 거예요.',
      };
      updateFeedback(submissionId, defaultFeedback);
      setFeedback(defaultFeedback);
      setViewMode('feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 개선된 버전 복사
  const handleCopy = () => {
    if (feedback?.improvedVersion) {
      navigator.clipboard.writeText(feedback.improvedVersion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 다시 시작
  const handleReset = () => {
    setText('');
    setFeedback(null);
    setViewMode('write');
  };

  // 점수 색상
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 점수 배경색
  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => {
              if (viewMode === 'home') navigate(-1);
              else if (viewMode === 'prompts') setViewMode('home');
              else if (viewMode === 'write') setViewMode('prompts');
              else if (viewMode === 'feedback') setViewMode('home');
              else setViewMode('home');
            }}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">
            {viewMode === 'home' && '영작 연습'}
            {viewMode === 'prompts' && '주제 선택'}
            {viewMode === 'write' && selectedPrompt?.titleKo}
            {viewMode === 'feedback' && 'AI 첨삭 결과'}
            {viewMode === 'history' && '작문 기록'}
          </h1>
          <div className="w-10" />
        </div>
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
              {/* 통계 카드 */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-5 text-white mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <PenTool className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm opacity-80">총 작문</p>
                    <p className="text-2xl font-bold">{stats.totalSubmissions}개</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/10 rounded-xl p-2">
                    <p className="text-xl font-bold">{stats.averageScore}</p>
                    <p className="text-xs opacity-80">평균 점수</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2">
                    <p className="text-xl font-bold">{stats.weeklyProgress}</p>
                    <p className="text-xs opacity-80">이번 주</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2">
                    <p className="text-xl font-bold">{stats.weeklyGoal}</p>
                    <p className="text-xs opacity-80">주간 목표</p>
                  </div>
                </div>
              </div>

              {/* 카테고리 선택 */}
              <h2 className="text-lg font-bold mb-3">카테고리 선택</h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {Object.entries(WRITING_CATEGORIES).map(([key, cat]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedCategory(key as WritingCategory);
                      setViewMode('prompts');
                    }}
                    className={`bg-gradient-to-br ${cat.color} rounded-2xl p-4 text-white text-left`}
                  >
                    <span className="text-2xl mb-2 block">{cat.icon}</span>
                    <p className="font-bold">{cat.name}</p>
                  </motion.button>
                ))}
              </div>

              {/* 전체 주제 보기 */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setSelectedCategory(null);
                  setViewMode('prompts');
                }}
                className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between mb-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="font-medium">전체 주제 보기</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </motion.button>

              {/* 최근 작문 */}
              {recentSubmissions.length > 0 && (
                <>
                  <h2 className="text-lg font-bold mb-3">최근 작문</h2>
                  <div className="space-y-2">
                    {recentSubmissions.slice(0, 3).map((sub) => {
                      const prompt = WRITING_PROMPTS.find(p => p.id === sub.promptId);
                      return (
                        <div
                          key={sub.id}
                          className="bg-white rounded-xl p-3 shadow-sm border border-gray-100"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{prompt?.titleKo}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(sub.createdAt).toLocaleDateString('ko-KR')}
                              </p>
                            </div>
                            {sub.feedback && (
                              <div className={`text-lg font-bold ${getScoreColor(sub.feedback.overallScore)}`}>
                                {sub.feedback.overallScore}점
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* 프롬프트 선택 */}
          {viewMode === 'prompts' && (
            <motion.div
              key="prompts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* 레벨 선택 */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {Object.entries(WRITING_LEVELS).map(([key, level]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedLevel(key as WritingLevel)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedLevel === key
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {level.name}
                  </button>
                ))}
              </div>

              {/* 프롬프트 목록 */}
              <div className="space-y-3">
                {filteredPrompts.map((prompt) => {
                  const cat = WRITING_CATEGORIES[prompt.category];
                  return (
                    <motion.button
                      key={prompt.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        setSelectedPrompt(prompt);
                        setViewMode('write');
                      }}
                      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white text-lg`}>
                          {cat.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-foreground">{prompt.titleKo}</p>
                          <p className="text-xs text-gray-500 mt-1">{prompt.title}</p>
                          <p className="text-sm text-gray-600 mt-2">{prompt.descriptionKo}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {prompt.wordCount.min}-{prompt.wordCount.max} 단어
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 mt-2" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 작문 화면 */}
          {viewMode === 'write' && selectedPrompt && (
            <motion.div
              key="write"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* 프롬프트 정보 */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-4 text-white mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5" />
                  <span className="font-bold">{selectedPrompt.title}</span>
                </div>
                <p className="text-sm opacity-90">{selectedPrompt.descriptionKo}</p>
                <p className="text-xs opacity-70 mt-2">
                  권장 단어 수: {selectedPrompt.wordCount.min}-{selectedPrompt.wordCount.max}
                </p>
              </div>

              {/* 힌트 */}
              {selectedPrompt.hints && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 mb-4">
                  <p className="text-xs font-medium text-yellow-700 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> 표현 힌트
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.hints.map((hint, i) => (
                      <span
                        key={i}
                        className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full cursor-pointer hover:bg-yellow-200"
                        onClick={() => setText(prev => prev + (prev ? ' ' : '') + hint)}
                      >
                        {hint}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 텍스트 입력 */}
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="영어로 작성해 보세요..."
                  className="w-full h-64 p-4 bg-white rounded-2xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none resize-none text-foreground"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {wordCount} / {selectedPrompt.wordCount.min}-{selectedPrompt.wordCount.max} 단어
                </div>
              </div>

              {/* 단어 수 경고 */}
              {wordCount > 0 && wordCount < selectedPrompt.wordCount.min && (
                <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  최소 {selectedPrompt.wordCount.min}단어를 작성해 주세요.
                </p>
              )}

              {/* 제출 버튼 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isSubmitting || wordCount < 5}
                className={`w-full mt-4 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 ${
                  isSubmitting || wordCount < 5
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-600'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI가 첨삭 중...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    AI 첨삭 받기
                  </>
                )}
              </motion.button>
            </motion.div>
          )}

          {/* 피드백 화면 */}
          {viewMode === 'feedback' && feedback && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* 종합 점수 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4 text-center">
                <p className="text-sm text-gray-500 mb-2">종합 점수</p>
                <div className={`text-5xl font-bold ${getScoreColor(feedback.overallScore)}`}>
                  {feedback.overallScore}
                </div>
                <p className="text-sm text-gray-500 mt-1">/ 100</p>

                {/* XP 획득 */}
                <div className="flex items-center justify-center gap-1 mt-3 text-primary-600">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    +{Math.floor(feedback.overallScore / 10) * 5 + 10} XP 획득!
                  </span>
                </div>
              </div>

              {/* 세부 점수 */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">문법</p>
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreBg(feedback.grammarScore)}`}
                      style={{ width: `${feedback.grammarScore}%` }}
                    />
                  </div>
                  <p className={`text-lg font-bold mt-1 ${getScoreColor(feedback.grammarScore)}`}>
                    {feedback.grammarScore}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">어휘</p>
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreBg(feedback.vocabularyScore)}`}
                      style={{ width: `${feedback.vocabularyScore}%` }}
                    />
                  </div>
                  <p className={`text-lg font-bold mt-1 ${getScoreColor(feedback.vocabularyScore)}`}>
                    {feedback.vocabularyScore}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">유창성</p>
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreBg(feedback.fluencyScore)}`}
                      style={{ width: `${feedback.fluencyScore}%` }}
                    />
                  </div>
                  <p className={`text-lg font-bold mt-1 ${getScoreColor(feedback.fluencyScore)}`}>
                    {feedback.fluencyScore}
                  </p>
                </div>
              </div>

              {/* 격려 메시지 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  <span className="font-medium text-purple-700">AI 튜터의 한마디</span>
                </div>
                <p className="text-sm text-purple-800">{feedback.encouragement}</p>
              </div>

              {/* 교정 내용 */}
              {feedback.corrections.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    교정 사항 ({feedback.corrections.length}개)
                  </h3>
                  <div className="space-y-2">
                    {feedback.corrections.map((correction, i) => (
                      <div
                        key={i}
                        className={`rounded-xl p-3 border ${CORRECTION_COLORS[correction.type]}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium px-2 py-0.5 bg-white/50 rounded-full">
                            {CORRECTION_LABELS[correction.type]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <span className="line-through opacity-60">{correction.original}</span>
                          <span>→</span>
                          <span className="font-medium">{correction.corrected}</span>
                        </div>
                        <p className="text-xs opacity-80">{correction.explanationKo}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 개선된 버전 */}
              <div className="bg-green-50 rounded-xl p-4 mb-4 border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    개선된 버전
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-green-600 flex items-center gap-1 hover:text-green-800"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? '복사됨' : '복사'}
                  </button>
                </div>
                <p className="text-sm text-green-800 leading-relaxed">
                  {feedback.improvedVersion}
                </p>
              </div>

              {/* 제안 사항 */}
              {feedback.suggestions.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                  <p className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    향상을 위한 팁
                  </p>
                  <ul className="space-y-1">
                    {feedback.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  다시 쓰기
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setViewMode('home')}
                  className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <ChevronRight className="w-5 h-5" />
                  다른 주제
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
