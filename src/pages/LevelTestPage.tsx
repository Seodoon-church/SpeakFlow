import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  Sparkles,
  Loader2,
  MicOff,
  RotateCcw
} from 'lucide-react';
import {
  getVocabularyQuestions,
  getGrammarQuestions,
  getListeningQuestions,
  getSpeakingPrompts,
  calculateCEFRLevel,
  type LanguageCode,
  type VocabularyQuestion,
  type GrammarQuestion,
  type ListeningQuestion,
  type SpeakingPrompt
} from '../data/levelTestQuestions';
import { analyzeSpeaking } from '../lib/claude';
import { useChatHistoryStore } from '../stores/chatHistoryStore';

// 테스트 단계 타입
type TestStep = 'language' | 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'analyzing' | 'result';

// 언어 옵션
const languages = [
  { code: 'en' as LanguageCode, name: '영어', flag: '🇺🇸', native: 'English', speechCode: 'en-US' },
  { code: 'ja' as LanguageCode, name: '일본어', flag: '🇯🇵', native: '日本語', speechCode: 'ja-JP' },
  { code: 'zh' as LanguageCode, name: '중국어', flag: '🇨🇳', native: '中文', speechCode: 'zh-CN' },
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

// 테스트 설정
const TEST_CONFIG = {
  vocabularyCount: 5, // 어휘 문제 수
  grammarCount: 4,    // 문법 문제 수
  listeningCount: 3,  // 듣기 문제 수
  speakingCount: 1,   // 말하기 문제 수
};

export default function LevelTestPage() {
  const navigate = useNavigate();
  const { saveLevelTestResult, checkAndUpdateStreak } = useChatHistoryStore();

  // 기본 상태
  const [step, setStep] = useState<TestStep>('language');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // 문제 데이터
  const [vocabQuestions, setVocabQuestions] = useState<VocabularyQuestion[]>([]);
  const [grammarQuestions, setGrammarQuestions] = useState<GrammarQuestion[]>([]);
  const [listeningQuestions, setListeningQuestions] = useState<ListeningQuestion[]>([]);
  const [speakingPrompts, setSpeakingPrompts] = useState<SpeakingPrompt[]>([]);

  // 답변 및 점수
  const [vocabAnswers, setVocabAnswers] = useState<{ questionId: string; correct: boolean; level: string }[]>([]);
  const [grammarAnswers, setGrammarAnswers] = useState<{ questionId: string; correct: boolean; level: string }[]>([]);
  const [listeningAnswers, setListeningAnswers] = useState<{ questionId: string; correct: boolean; level: string }[]>([]);
  const [speakingResult, setSpeakingResult] = useState<{ score: number; feedback: string } | null>(null);

  // 듣기 테스트 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  // 말하기 테스트 상태
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 최종 결과
  const [finalScores, setFinalScores] = useState<{
    vocabulary: number;
    grammar: number;
    listening: number;
    speaking: number;
  } | null>(null);
  const [resultLevel, setResultLevel] = useState<{ level: string; description: string } | null>(null);

  // 언어 선택 시 문제 로드
  useEffect(() => {
    if (selectedLanguage) {
      const allVocab = getVocabularyQuestions(selectedLanguage);
      const allGrammar = getGrammarQuestions(selectedLanguage);
      const allListening = getListeningQuestions(selectedLanguage);
      const allSpeaking = getSpeakingPrompts(selectedLanguage);

      // 레벨별로 골고루 섞어서 선택
      const shuffledVocab = shuffleAndSelect(allVocab, TEST_CONFIG.vocabularyCount);
      const shuffledGrammar = shuffleAndSelect(allGrammar, TEST_CONFIG.grammarCount);
      const shuffledListening = shuffleAndSelect(allListening, TEST_CONFIG.listeningCount);
      const shuffledSpeaking = shuffleAndSelect(allSpeaking, TEST_CONFIG.speakingCount);

      setVocabQuestions(shuffledVocab);
      setGrammarQuestions(shuffledGrammar);
      setListeningQuestions(shuffledListening);
      setSpeakingPrompts(shuffledSpeaking);
    }
  }, [selectedLanguage]);

  // 문제 섞기 함수
  function shuffleAndSelect<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, arr.length));
  }

  // 진행률 계산
  const getProgress = () => {
    const steps: TestStep[] = ['language', 'vocabulary', 'grammar', 'listening', 'speaking', 'analyzing', 'result'];
    const currentIndex = steps.indexOf(step);
    return ((currentIndex) / (steps.length - 1)) * 100;
  };

  // TTS 재생
  const playAudio = useCallback((text: string) => {
    if (!selectedLanguage) return;

    const langConfig = languages.find(l => l.code === selectedLanguage);
    if (!langConfig) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langConfig.speechCode;
    utterance.rate = 0.9;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setHasPlayed(true);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setHasPlayed(true);
    };

    window.speechSynthesis.speak(utterance);
  }, [selectedLanguage]);

  // 음성인식 시작
  const startRecording = useCallback(() => {
    if (!selectedLanguage) return;

    const langConfig = languages.find(l => l.code === selectedLanguage);
    if (!langConfig) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('이 브라우저는 음성인식을 지원하지 않습니다. Chrome을 사용해주세요.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = langConfig.speechCode;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      stopRecording();
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    setRecordingTime(0);

    // 녹음 시간 카운터
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(t => {
        if (t >= 60) {
          stopRecording();
          return t;
        }
        return t + 1;
      });
    }, 1000);
  }, [selectedLanguage]);

  // 음성인식 중지
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setIsRecording(false);
  }, []);

  // 다음 단계로
  const nextStep = () => {
    const steps: TestStep[] = ['language', 'vocabulary', 'grammar', 'listening', 'speaking', 'analyzing', 'result'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setHasPlayed(false);
    }
  };

  // 이전 단계로
  const prevStep = () => {
    const steps: TestStep[] = ['language', 'vocabulary', 'grammar', 'listening', 'speaking', 'analyzing', 'result'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  // 어휘 답변 제출
  const submitVocabAnswer = () => {
    if (selectedAnswer === null) return;

    const question = vocabQuestions[currentQuestion];
    const isCorrect = selectedAnswer === question.correct;

    setVocabAnswers([...vocabAnswers, {
      questionId: question.id,
      correct: isCorrect,
      level: question.level,
    }]);

    if (currentQuestion < vocabQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      nextStep();
    }
  };

  // 문법 답변 제출
  const submitGrammarAnswer = () => {
    if (selectedAnswer === null) return;

    const question = grammarQuestions[currentQuestion];
    const isCorrect = selectedAnswer === question.correct;

    setGrammarAnswers([...grammarAnswers, {
      questionId: question.id,
      correct: isCorrect,
      level: question.level,
    }]);

    if (currentQuestion < grammarQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      nextStep();
    }
  };

  // 듣기 답변 제출
  const submitListeningAnswer = () => {
    if (selectedAnswer === null) return;

    const question = listeningQuestions[currentQuestion];
    const isCorrect = selectedAnswer === question.correct;

    setListeningAnswers([...listeningAnswers, {
      questionId: question.id,
      correct: isCorrect,
      level: question.level,
    }]);

    if (currentQuestion < listeningQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setHasPlayed(false);
    } else {
      nextStep();
    }
  };

  // 말하기 분석 및 결과 계산
  const analyzeSpeakingAndFinish = async () => {
    if (!transcript.trim()) {
      setSpeakingResult({ score: 20, feedback: '음성이 인식되지 않았습니다.' });
    } else {
      setStep('analyzing');

      try {
        const prompt = speakingPrompts[0];
        const result = await analyzeSpeaking(
          transcript,
          prompt.prompt,
          prompt.expectedKeywords || [],
          selectedLanguage || 'en'
        );
        setSpeakingResult(result);
      } catch (error) {
        console.error('Speaking analysis error:', error);
        // 오류 시 기본 점수 부여
        const wordCount = transcript.split(/\s+/).length;
        const score = Math.min(70, 30 + wordCount * 2);
        setSpeakingResult({
          score,
          feedback: '분석 중 오류가 발생했습니다. 기본 점수가 부여되었습니다.',
        });
      }
    }

    // 최종 점수 계산
    calculateFinalScores();
    setStep('result');
  };

  // 최종 점수 계산
  const calculateFinalScores = () => {
    // 어휘 점수
    const vocabCorrect = vocabAnswers.filter(a => a.correct).length;
    const vocabScore = vocabQuestions.length > 0
      ? Math.round((vocabCorrect / vocabQuestions.length) * 100)
      : 0;

    // 문법 점수
    const grammarCorrect = grammarAnswers.filter(a => a.correct).length;
    const grammarScore = grammarQuestions.length > 0
      ? Math.round((grammarCorrect / grammarQuestions.length) * 100)
      : 0;

    // 듣기 점수
    const listeningCorrect = listeningAnswers.filter(a => a.correct).length;
    const listeningScore = listeningQuestions.length > 0
      ? Math.round((listeningCorrect / listeningQuestions.length) * 100)
      : 0;

    // 말하기 점수
    const speakingScore = speakingResult?.score || 50;

    const scores = {
      vocabulary: vocabScore,
      grammar: grammarScore,
      listening: listeningScore,
      speaking: speakingScore,
    };

    setFinalScores(scores);
    const level = calculateCEFRLevel(scores);
    setResultLevel(level);

    // 결과 저장
    if (selectedLanguage) {
      saveLevelTestResult({
        language: selectedLanguage,
        level: level.level,
        scores,
        feedback: speakingResult?.feedback,
      });
      checkAndUpdateStreak();
    }
  };

  // 다시 테스트
  const restartTest = () => {
    setStep('language');
    setSelectedLanguage(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setVocabAnswers([]);
    setGrammarAnswers([]);
    setListeningAnswers([]);
    setSpeakingResult(null);
    setTranscript('');
    setFinalScores(null);
    setResultLevel(null);
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
            {step !== 'language' && step !== 'result' && step !== 'analyzing' && (
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          {step === 'vocabulary' && vocabQuestions.length > 0 && (
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
                  {currentQuestion + 1} / {vocabQuestions.length}
                </p>
              </div>

              {/* 문제 카드 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                <p className="text-white/70 text-sm mb-2">
                  {vocabQuestions[currentQuestion].question}
                </p>
                {vocabQuestions[currentQuestion].word && (
                  <p className="text-2xl font-bold text-white mb-6">
                    {vocabQuestions[currentQuestion].word}
                  </p>
                )}
                {vocabQuestions[currentQuestion].sentence && (
                  <p className="text-xl font-medium text-white mb-6 p-4 bg-white/5 rounded-xl">
                    "{vocabQuestions[currentQuestion].sentence}"
                  </p>
                )}

                {/* 선택지 */}
                <div className="space-y-3">
                  {vocabQuestions[currentQuestion].options.map((option, index) => (
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
                onClick={submitVocabAnswer}
                disabled={selectedAnswer === null}
                className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedAnswer !== null
                    ? 'bg-gradient-to-r from-cyan-400 to-purple-400 text-white'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                {currentQuestion < vocabQuestions.length - 1 ? '다음 문제' : '다음 단계로'}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 3: 문법 테스트 */}
          {step === 'grammar' && grammarQuestions.length > 0 && (
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
                onClick={submitGrammarAnswer}
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
          {step === 'listening' && listeningQuestions.length > 0 && (
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
                <p className="text-white/60">
                  {currentQuestion + 1} / {listeningQuestions.length}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                {/* 오디오 플레이어 */}
                <div className="flex flex-col items-center mb-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => playAudio(listeningQuestions[currentQuestion].audioText)}
                    disabled={isPlaying}
                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg transition-all ${
                      isPlaying
                        ? 'bg-green-500 shadow-green-500/50 animate-pulse'
                        : 'bg-gradient-to-r from-green-400 to-emerald-400 shadow-green-500/30'
                    }`}
                  >
                    <Volume2 className={`w-10 h-10 text-white ${isPlaying ? 'animate-pulse' : ''}`} />
                  </motion.button>
                  <p className="text-white/60 text-sm">
                    {isPlaying ? '재생 중...' : hasPlayed ? '다시 듣기' : '클릭하여 음성 재생'}
                  </p>
                </div>

                <p className="text-white/70 text-sm mb-4 text-center">
                  {listeningQuestions[currentQuestion].question}
                </p>

                <div className="space-y-3">
                  {listeningQuestions[currentQuestion].options.map((option, index) => (
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
                onClick={submitListeningAnswer}
                disabled={selectedAnswer === null}
                className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedAnswer !== null
                    ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                {currentQuestion < listeningQuestions.length - 1 ? '다음 문제' : '다음 단계로'}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 5: 말하기 테스트 */}
          {step === 'speaking' && speakingPrompts.length > 0 && (
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
                <p className="text-white/60">
                  {speakingPrompts[0].type === 'read-aloud' ? '아래 문장을 소리내어 읽어주세요' : '아래 주제에 대해 말해주세요'}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                {/* 읽을 문장/주제 */}
                <div className="bg-white/5 rounded-xl p-6 mb-8">
                  <p className="text-white/50 text-sm mb-2">
                    {speakingPrompts[0].type === 'read-aloud' ? '다음 문장을 읽어주세요:' : '다음 주제에 대해 말해주세요:'}
                  </p>
                  <p className="text-xl text-white font-medium leading-relaxed">
                    "{speakingPrompts[0].prompt}"
                  </p>
                </div>

                {/* 녹음 버튼 */}
                <div className="flex flex-col items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all ${
                      isRecording
                        ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse'
                        : 'bg-gradient-to-r from-orange-400 to-red-400 shadow-lg shadow-orange-500/30'
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="w-12 h-12 text-white" />
                    ) : (
                      <Mic className="w-12 h-12 text-white" />
                    )}
                  </motion.button>

                  {isRecording ? (
                    <div className="text-center">
                      <p className="text-red-400 font-medium mb-1">녹음 중... (클릭하여 중지)</p>
                      <p className="text-white/60 text-sm">{recordingTime}초 / 60초</p>
                      <div className="w-48 h-1 bg-white/10 rounded-full mt-2">
                        <div
                          className="h-full bg-red-400 rounded-full transition-all"
                          style={{ width: `${(recordingTime / 60) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/60 text-sm">버튼을 눌러 녹음 시작</p>
                  )}
                </div>

                {/* 인식된 텍스트 */}
                {transcript && (
                  <div className="mt-6 p-4 bg-white/5 rounded-xl">
                    <p className="text-white/50 text-sm mb-2">인식된 텍스트:</p>
                    <p className="text-white">{transcript}</p>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={analyzeSpeakingAndFinish}
                disabled={isRecording}
                className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  !isRecording
                    ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                테스트 완료
                <CheckCircle className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* 분석 중 화면 */}
          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto text-center py-20"
            >
              <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">결과 분석 중...</h2>
              <p className="text-white/60">AI가 당신의 실력을 분석하고 있어요</p>
            </motion.div>
          )}

          {/* Step 6: 결과 화면 */}
          {step === 'result' && resultLevel && finalScores && (
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
                <div className={`inline-block px-8 py-4 rounded-2xl bg-gradient-to-r ${levelDescriptions[resultLevel.level].color} mb-4`}>
                  <h1 className="text-5xl font-bold text-white">{resultLevel.level}</h1>
                  <p className="text-white/90 font-medium">{levelDescriptions[resultLevel.level].title}</p>
                </div>
                <p className="text-white/70 text-lg mb-8">
                  {resultLevel.description}
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
                    { label: '어휘력', score: finalScores.vocabulary, color: 'bg-blue-400' },
                    { label: '문법', score: finalScores.grammar, color: 'bg-purple-400' },
                    { label: '듣기', score: finalScores.listening, color: 'bg-green-400' },
                    { label: '말하기', score: finalScores.speaking, color: 'bg-orange-400' },
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

              {/* 말하기 피드백 */}
              {speakingResult && speakingResult.feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 text-left"
                >
                  <h3 className="text-white font-semibold mb-2">말하기 피드백</h3>
                  <p className="text-white/70 text-sm">{speakingResult.feedback}</p>
                </motion.div>
              )}

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
                  onClick={() => navigate('/home')}
                  className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 text-white flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  맞춤 학습 시작하기
                </motion.button>
                <button
                  onClick={restartTest}
                  className="w-full py-4 rounded-xl font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  다시 테스트하기
                </button>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
