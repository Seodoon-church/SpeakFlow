import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  BookOpen,
  Headphones,
  Mic,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Volume2,
  Trophy,
  Target,
  Clock,
  Sparkles
} from 'lucide-react';

// 테스트 단계 타입
type TestStep = 'language' | 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'result';

// 언어 옵션
const languages = [
  { code: 'en', name: '영어', flag: '🇺🇸', native: 'English' },
  { code: 'ja', name: '일본어', flag: '🇯🇵', native: '日本語' },
  { code: 'zh', name: '중국어', flag: '🇨🇳', native: '中文' },
  { code: 'es', name: '스페인어', flag: '🇪🇸', native: 'Español' },
  { code: 'fr', name: '프랑스어', flag: '🇫🇷', native: 'Français' },
  { code: 'de', name: '독일어', flag: '🇩🇪', native: 'Deutsch' },
];

// 어휘 테스트 문제 예시
const vocabularyQuestions = [
  {
    question: '다음 단어의 뜻은?',
    word: 'Accomplish',
    options: ['성취하다', '포기하다', '시작하다', '반복하다'],
    correct: 0,
  },
  {
    question: '빈칸에 들어갈 단어는?',
    word: 'She is very _____ at playing piano.',
    options: ['skilled', 'angry', 'tired', 'hungry'],
    correct: 0,
  },
  {
    question: '다음 단어의 반대말은?',
    word: 'Ancient',
    options: ['Modern', 'Beautiful', 'Large', 'Quiet'],
    correct: 0,
  },
];

// 문법 테스트 문제 예시
const grammarQuestions = [
  {
    question: '빈칸에 알맞은 것은?',
    sentence: 'If I _____ rich, I would travel the world.',
    options: ['am', 'was', 'were', 'be'],
    correct: 2,
  },
  {
    question: '올바른 문장은?',
    options: [
      'She don\'t like coffee.',
      'She doesn\'t likes coffee.',
      'She doesn\'t like coffee.',
      'She not like coffee.',
    ],
    correct: 2,
  },
];

// CEFR 레벨 설명
const levelDescriptions: Record<string, { title: string; description: string; color: string }> = {
  A1: { title: '입문', description: '기초적인 표현과 인사를 할 수 있어요', color: 'from-green-400 to-green-600' },
  A2: { title: '초급', description: '일상적인 대화를 이해하고 참여할 수 있어요', color: 'from-emerald-400 to-emerald-600' },
  B1: { title: '중급', description: '여행, 업무 등 다양한 상황에서 소통할 수 있어요', color: 'from-blue-400 to-blue-600' },
  B2: { title: '중상급', description: '복잡한 주제에 대해 자신의 의견을 표현할 수 있어요', color: 'from-purple-400 to-purple-600' },
  C1: { title: '고급', description: '전문적인 내용도 유창하게 다룰 수 있어요', color: 'from-orange-400 to-orange-600' },
  C2: { title: '최상급', description: '원어민 수준의 언어 능력을 갖추고 있어요', color: 'from-red-400 to-red-600' },
};

export default function LevelTestPage() {
  const [step, setStep] = useState<TestStep>('language');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [resultLevel, _setResultLevel] = useState('B1');

  // 진행률 계산
  const getProgress = () => {
    const steps: TestStep[] = ['language', 'vocabulary', 'grammar', 'listening', 'speaking', 'result'];
    const currentIndex = steps.indexOf(step);
    return ((currentIndex) / (steps.length - 1)) * 100;
  };

  // 다음 단계로
  const nextStep = () => {
    const steps: TestStep[] = ['language', 'vocabulary', 'grammar', 'listening', 'speaking', 'result'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
    }
  };

  // 이전 단계로
  const prevStep = () => {
    const steps: TestStep[] = ['language', 'vocabulary', 'grammar', 'listening', 'speaking', 'result'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  // 답변 제출
  const submitAnswer = () => {
    if (selectedAnswer !== null) {
      setAnswers([...answers, selectedAnswer]);
      if (step === 'vocabulary' && currentQuestion < vocabularyQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else if (step === 'grammar' && currentQuestion < grammarQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        nextStep();
      }
    }
  };

  // 녹음 토글
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordingTime(0);
    } else {
      setIsRecording(true);
      // 녹음 시간 시뮬레이션
      const interval = setInterval(() => {
        setRecordingTime(t => {
          if (t >= 30) {
            clearInterval(interval);
            setIsRecording(false);
            return 0;
          }
          return t + 1;
        });
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* 상단 프로그레스 바 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
        <div className="h-1 bg-gray-700">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
            initial={{ width: 0 }}
            animate={{ width: `${getProgress()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/80">
            <Target className="w-5 h-5" />
            <span className="text-sm font-medium">레벨 테스트</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-white/60 text-sm">
              <Clock className="w-4 h-4" />
              <span>약 10분 소요</span>
            </div>
            {step !== 'language' && step !== 'result' && (
              <button
                onClick={prevStep}
                className="text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 pt-24 pb-12">
        <AnimatePresence mode="wait">

          {/* Step 1: 언어 선택 */}
          {step === 'language' && (
            <motion.div
              key="language"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">어떤 언어를 배우고 싶으세요?</h1>
                <p className="text-white/60">학습하고 싶은 언어를 선택해주세요</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {languages.map((lang) => (
                  <motion.button
                    key={lang.code}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      selectedLanguage === lang.code
                        ? 'border-cyan-400 bg-cyan-400/20'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    <div className="text-4xl mb-2">{lang.flag}</div>
                    <div className="text-white font-semibold">{lang.name}</div>
                    <div className="text-white/50 text-sm">{lang.native}</div>
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextStep}
                disabled={!selectedLanguage}
                className={`mt-8 w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedLanguage
                    ? 'bg-gradient-to-r from-cyan-400 to-purple-400 text-white'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                테스트 시작하기
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: 어휘력 테스트 */}
          {step === 'vocabulary' && (
            <motion.div
              key="vocabulary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-3">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">어휘력 테스트</h2>
                <p className="text-white/60">
                  {currentQuestion + 1} / {vocabularyQuestions.length}
                </p>
              </div>

              {/* 문제 카드 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                <p className="text-white/70 text-sm mb-2">
                  {vocabularyQuestions[currentQuestion].question}
                </p>
                <p className="text-2xl font-bold text-white mb-6">
                  {vocabularyQuestions[currentQuestion].word}
                </p>

                {/* 선택지 */}
                <div className="space-y-3">
                  {vocabularyQuestions[currentQuestion].options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedAnswer(index)}
                      className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                        selectedAnswer === index
                          ? 'bg-cyan-400/30 border-2 border-cyan-400'
                          : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        selectedAnswer === index
                          ? 'bg-cyan-400 text-white'
                          : 'bg-white/10 text-white/60'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-white">{option}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={submitAnswer}
                disabled={selectedAnswer === null}
                className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedAnswer !== null
                    ? 'bg-gradient-to-r from-cyan-400 to-purple-400 text-white'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                {currentQuestion < vocabularyQuestions.length - 1 ? '다음 문제' : '다음 단계로'}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 3: 문법 테스트 */}
          {step === 'grammar' && (
            <motion.div
              key="grammar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 mb-3">
                  <CheckCircle className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">문법 테스트</h2>
                <p className="text-white/60">
                  {currentQuestion + 1} / {grammarQuestions.length}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                <p className="text-white/70 text-sm mb-2">
                  {grammarQuestions[currentQuestion].question}
                </p>
                {grammarQuestions[currentQuestion].sentence && (
                  <p className="text-xl font-medium text-white mb-6 p-4 bg-white/5 rounded-xl">
                    "{grammarQuestions[currentQuestion].sentence}"
                  </p>
                )}

                <div className="space-y-3">
                  {grammarQuestions[currentQuestion].options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedAnswer(index)}
                      className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                        selectedAnswer === index
                          ? 'bg-purple-400/30 border-2 border-purple-400'
                          : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        selectedAnswer === index
                          ? 'bg-purple-400 text-white'
                          : 'bg-white/10 text-white/60'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-white">{option}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={submitAnswer}
                disabled={selectedAnswer === null}
                className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedAnswer !== null
                    ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                {currentQuestion < grammarQuestions.length - 1 ? '다음 문제' : '다음 단계로'}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 4: 듣기 테스트 */}
          {step === 'listening' && (
            <motion.div
              key="listening"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-3">
                  <Headphones className="w-6 h-6 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">듣기 테스트</h2>
                <p className="text-white/60">음성을 듣고 알맞은 답을 선택하세요</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                {/* 오디오 플레이어 */}
                <div className="flex flex-col items-center mb-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-green-500/30"
                  >
                    <Volume2 className="w-10 h-10 text-white" />
                  </motion.button>
                  <p className="text-white/60 text-sm">클릭하여 음성 재생</p>
                </div>

                <p className="text-white/70 text-sm mb-4 text-center">
                  대화를 듣고 질문에 답하세요: "화자가 어디로 가려고 하나요?"
                </p>

                <div className="space-y-3">
                  {['공항', '호텔', '레스토랑', '병원'].map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedAnswer(index)}
                      className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                        selectedAnswer === index
                          ? 'bg-green-400/30 border-2 border-green-400'
                          : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        selectedAnswer === index
                          ? 'bg-green-400 text-white'
                          : 'bg-white/10 text-white/60'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-white">{option}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextStep}
                disabled={selectedAnswer === null}
                className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedAnswer !== null
                    ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                다음 단계로
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 5: 말하기 테스트 */}
          {step === 'speaking' && (
            <motion.div
              key="speaking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/20 mb-3">
                  <Mic className="w-6 h-6 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">말하기 테스트</h2>
                <p className="text-white/60">아래 문장을 소리내어 읽어주세요</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                {/* 읽을 문장 */}
                <div className="bg-white/5 rounded-xl p-6 mb-8">
                  <p className="text-white/50 text-sm mb-2">다음 문장을 읽어주세요:</p>
                  <p className="text-xl text-white font-medium leading-relaxed">
                    "The weather is really nice today. I think we should go for a walk in the park."
                  </p>
                </div>

                {/* 녹음 버튼 */}
                <div className="flex flex-col items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all ${
                      isRecording
                        ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse'
                        : 'bg-gradient-to-r from-orange-400 to-red-400 shadow-lg shadow-orange-500/30'
                    }`}
                  >
                    <Mic className={`w-12 h-12 text-white ${isRecording ? 'animate-pulse' : ''}`} />
                  </motion.button>

                  {isRecording ? (
                    <div className="text-center">
                      <p className="text-red-400 font-medium mb-1">녹음 중...</p>
                      <p className="text-white/60 text-sm">{recordingTime}초 / 30초</p>
                      <div className="w-48 h-1 bg-white/10 rounded-full mt-2">
                        <div
                          className="h-full bg-red-400 rounded-full transition-all"
                          style={{ width: `${(recordingTime / 30) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/60 text-sm">버튼을 눌러 녹음 시작</p>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextStep}
                className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-orange-400 to-red-400 text-white"
              >
                테스트 완료
                <CheckCircle className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 6: 결과 화면 */}
          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto text-center"
            >
              {/* 축하 애니메이션 */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="mb-6"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 mb-4">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-white/60 mb-2">당신의 레벨은</p>
                <div className={`inline-block px-8 py-4 rounded-2xl bg-gradient-to-r ${levelDescriptions[resultLevel].color} mb-4`}>
                  <h1 className="text-5xl font-bold text-white">{resultLevel}</h1>
                  <p className="text-white/90 font-medium">{levelDescriptions[resultLevel].title}</p>
                </div>
                <p className="text-white/70 text-lg mb-8">
                  {levelDescriptions[resultLevel].description}
                </p>
              </motion.div>

              {/* 세부 점수 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6"
              >
                <h3 className="text-white font-semibold mb-4">세부 평가</h3>
                <div className="space-y-4">
                  {[
                    { label: '어휘력', score: 75, color: 'bg-blue-400' },
                    { label: '문법', score: 68, color: 'bg-purple-400' },
                    { label: '듣기', score: 82, color: 'bg-green-400' },
                    { label: '말하기', score: 70, color: 'bg-orange-400' },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70">{item.label}</span>
                        <span className="text-white font-medium">{item.score}점</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                          className={`h-full ${item.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* CTA 버튼 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="space-y-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 text-white flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  맞춤 학습 시작하기
                </motion.button>
                <button className="w-full py-4 rounded-xl font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors">
                  관심사 설정하기
                </button>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
