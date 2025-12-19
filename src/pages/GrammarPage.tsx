import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  BookOpen,
  Zap,
  Trophy,
  Check,
  X,
  Lightbulb,
  AlertCircle,
  ChevronRight,
  Target,
  Brain,
} from 'lucide-react';
import {
  useGrammarStore,
  GRAMMAR_LEVELS,
  GRAMMAR_TOPICS,
  type GrammarTopic,
  type GrammarLesson,
  type GrammarLevel,
} from '@/stores';
import { useChatHistoryStore } from '@/stores/chatHistoryStore';

type ViewMode = 'home' | 'topic' | 'lesson' | 'quiz' | 'result';

export default function GrammarPage() {
  const navigate = useNavigate();
  const {
    progress,
    currentSession,
    startQuiz,
    answerQuestion,
    nextQuestion,
    endQuiz,
    markLessonComplete,
    getCompletedTopicsCount,
    getMasteredTopicsCount,
  } = useGrammarStore();
  const { addXp, updateQuestProgress } = useChatHistoryStore();

  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<GrammarLesson | null>(null);
  const [filterLevel, setFilterLevel] = useState<GrammarLevel | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // 레슨 완료 처리
  const handleLessonComplete = () => {
    if (selectedTopic && selectedLesson) {
      markLessonComplete(selectedTopic.id, selectedLesson.id);
      addXp(10, '문법 레슨 완료');
      updateQuestProgress('grammar', 1);
    }
    setViewMode('topic');
  };

  // 퀴즈 시작
  const handleStartQuiz = (topicId?: string) => {
    startQuiz({ topicId, level: filterLevel || undefined, count: 10 });
    setViewMode('quiz');
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(null);
  };

  // 퀴즈 답변 제출
  const handleSubmitAnswer = () => {
    if (!currentSession || !userAnswer.trim()) return;

    const correct = answerQuestion(userAnswer);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      addXp(5, '문법 퀴즈 정답');
      updateQuestProgress('grammar', 1);
    }
  };

  // 다음 문제
  const handleNext = () => {
    nextQuestion();
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(null);

    if (currentSession && currentSession.currentIndex >= currentSession.questions.length - 1) {
      setViewMode('result');
    }
  };

  // 레슨 뷰
  if (viewMode === 'lesson' && selectedLesson && selectedTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-20">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setViewMode('topic')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="font-bold text-foreground text-sm">{selectedLesson.title}</h1>
              <p className="text-xs text-gray-500">{selectedTopic.titleKo}</p>
            </div>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            {/* 설명 */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-foreground">핵심 개념</h2>
              </div>
              <p className="text-gray-700 mb-2">{selectedLesson.explanation}</p>
              <p className="text-gray-600 text-sm">{selectedLesson.explanationKo}</p>
              {selectedLesson.formula && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
                  <p className="font-mono text-emerald-700 font-medium">{selectedLesson.formula}</p>
                </div>
              )}
            </div>

            {/* 예문 */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-foreground">예문</h2>
              </div>
              <div className="space-y-3">
                {selectedLesson.examples.map((example, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-foreground font-medium">
                      {example.highlight ? (
                        <>
                          {example.english.split(example.highlight)[0]}
                          <span className="text-emerald-600 underline decoration-2">{example.highlight}</span>
                          {example.english.split(example.highlight)[1]}
                        </>
                      ) : (
                        example.english
                      )}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">{example.korean}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 팁 */}
            {selectedLesson.tips && selectedLesson.tips.length > 0 && (
              <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h2 className="font-bold text-blue-800">한국인 팁</h2>
                </div>
                <ul className="space-y-2">
                  {selectedLesson.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-blue-700 text-sm">
                      <span className="text-blue-400">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 자주 하는 실수 */}
            {selectedLesson.commonMistakes && selectedLesson.commonMistakes.length > 0 && (
              <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h2 className="font-bold text-red-800">자주 하는 실수</h2>
                </div>
                <div className="space-y-3">
                  {selectedLesson.commonMistakes.map((mistake, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <X className="w-4 h-4 text-red-500" />
                        <span className="text-red-600 line-through">{mistake.wrong}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-600">{mistake.correct}</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{mistake.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 완료 버튼 */}
            <button
              onClick={handleLessonComplete}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              레슨 완료
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 토픽 뷰
  if (viewMode === 'topic' && selectedTopic) {
    const topicProgress = progress[selectedTopic.id];

    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-20">
        <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => { setViewMode('home'); setSelectedTopic(null); }}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold">{selectedTopic.titleKo}</h1>
                <p className="text-emerald-100 text-sm">{selectedTopic.title}</p>
              </div>
            </div>
            <p className="text-sm opacity-80">{selectedTopic.description}</p>
          </div>
        </header>

        <main className="px-4 py-6">
          {/* 레슨 목록 */}
          <div className="space-y-3 mb-6">
            {selectedTopic.lessons.map((lesson, index) => {
              const isCompleted = topicProgress?.lessonsCompleted.includes(lesson.id);

              return (
                <motion.button
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => { setSelectedLesson(lesson); setViewMode('lesson'); }}
                  className={`w-full p-4 rounded-xl text-left flex items-center gap-4 ${
                    isCompleted ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-white shadow-sm'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{lesson.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{lesson.explanationKo}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </motion.button>
              );
            })}
          </div>

          {/* 퀴즈 시작 */}
          <button
            onClick={() => handleStartQuiz(selectedTopic.id)}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            이 주제 퀴즈 풀기
          </button>
        </main>
      </div>
    );
  }

  // 퀴즈 뷰
  if (viewMode === 'quiz' && currentSession) {
    const question = currentSession.questions[currentSession.currentIndex];
    const progress = ((currentSession.currentIndex + 1) / currentSession.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
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
                  {currentSession.score}/{currentSession.answers.length}
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
                {question.type === 'fill-blank' && '빈칸 채우기'}
                {question.type === 'error-correction' && '오류 찾아 고치기'}
                {question.type === 'multiple-choice' && '객관식'}
              </p>

              {/* 문제 */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <p className="text-xl font-bold text-foreground mb-2">{question.question}</p>
                {question.questionKo && (
                  <p className="text-gray-500 text-sm">{question.questionKo}</p>
                )}
              </div>

              {/* 답변 입력 */}
              {!showResult && (
                <>
                  {question.type === 'multiple-choice' && question.options ? (
                    <div className="space-y-3 mb-6">
                      {question.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => setUserAnswer(option)}
                          className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                            userAnswer === option
                              ? 'bg-indigo-100 border-2 border-indigo-500'
                              : 'bg-white border-2 border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="정답을 입력하세요..."
                      className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none mb-6"
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                    />
                  )}

                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer.trim()}
                    className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold disabled:opacity-50"
                  >
                    확인
                  </button>
                </>
              )}

              {/* 결과 */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className={`p-4 rounded-xl mb-4 ${
                    isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <p className="font-bold mb-1 flex items-center gap-2">
                      {isCorrect ? (
                        <><Check className="w-5 h-5" /> 정답입니다!</>
                      ) : (
                        <><X className="w-5 h-5" /> 틀렸습니다</>
                      )}
                    </p>
                    {!isCorrect && (
                      <p className="text-sm mb-2">
                        정답: <span className="font-bold">{question.correctAnswer}</span>
                      </p>
                    )}
                    <p className="text-sm opacity-80">{question.explanationKo}</p>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold"
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

  // 결과 뷰
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
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
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
                onClick={() => { endQuiz(); handleStartQuiz(); }}
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

  // 홈 뷰
  const completedCount = getCompletedTopicsCount();
  const masteredCount = getMasteredTopicsCount();
  const filteredTopics = filterLevel
    ? GRAMMAR_TOPICS.filter(t => t.level === filterLevel)
    : GRAMMAR_TOPICS;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-20">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Brain className="w-5 h-5" />
                문법 학습
              </h1>
              <p className="text-emerald-100 text-xs">한국인 맞춤 영어 문법</p>
            </div>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
              <p className="text-lg font-bold">{GRAMMAR_TOPICS.length}</p>
              <p className="text-[10px] text-white/80">전체 주제</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
              <p className="text-lg font-bold">{completedCount}</p>
              <p className="text-[10px] text-white/80">학습 중</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 text-center">
              <p className="text-lg font-bold">{masteredCount}</p>
              <p className="text-[10px] text-white/80">마스터</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-2">
        {/* 전체 퀴즈 시작 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-4 text-white mb-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold">랜덤 문법 퀴즈</h2>
              <p className="text-sm opacity-80">모든 주제에서 랜덤 출제</p>
            </div>
          </div>
          <button
            onClick={() => handleStartQuiz()}
            className="w-full py-3 bg-white text-indigo-600 rounded-lg font-bold"
          >
            퀴즈 시작하기
          </button>
        </motion.div>

        {/* 레벨 필터 */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterLevel(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              !filterLevel ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600'
            }`}
          >
            전체
          </button>
          {Object.entries(GRAMMAR_LEVELS).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setFilterLevel(key as GrammarLevel)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filterLevel === key ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600'
              }`}
            >
              {info.name}
            </button>
          ))}
        </div>

        {/* 토픽 목록 */}
        <div className="space-y-3">
          {filteredTopics.map((topic, index) => {
            const topicProgress = progress[topic.id];
            const completedLessons = topicProgress?.lessonsCompleted.length || 0;
            const totalLessons = topic.lessons.length;
            const progressPercent = (completedLessons / totalLessons) * 100;

            return (
              <motion.button
                key={topic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => { setSelectedTopic(topic); setViewMode('topic'); }}
                className="w-full bg-white rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${GRAMMAR_LEVELS[topic.level].color}`}>
                    {topic.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-foreground">{topic.titleKo}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${GRAMMAR_LEVELS[topic.level].color} text-white`}>
                        {GRAMMAR_LEVELS[topic.level].name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{topic.description}</p>
                    {/* 진행 바 */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{completedLessons}/{totalLessons}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
