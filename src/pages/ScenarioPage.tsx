import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Volume2,
  ChevronRight,
  MessageCircle,
  BookOpen,
  CheckCircle2,
  Star,
  Info,
  Sparkles,
} from 'lucide-react';
import { getLocationById, getScenarioById } from '@/data/journey';
import { useJourneyStore } from '@/stores/journeyStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useFamilyStore } from '@/stores/familyStore';

type LearningPhase = 'intro' | 'phrases' | 'dialogue' | 'complete';

export default function ScenarioPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get('location');
  const scenarioId = searchParams.get('scenario');

  const { completeScenario } = useJourneyStore();
  const { addXp, updateStreak } = useGamificationStore();
  const { members, currentMemberId } = useFamilyStore();
  const currentMember = members.find(m => m.id === currentMemberId);

  const [phase, setPhase] = useState<LearningPhase>('intro');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [masteredPhrases, setMasteredPhrases] = useState<Set<number>>(new Set());
  const [showReading, setShowReading] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  const location = locationId ? getLocationById(locationId) : undefined;
  const scenario = locationId && scenarioId ? getScenarioById(locationId, scenarioId) : undefined;

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!location || !scenario) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60">시나리오를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/journey')}
            className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-white"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const currentPhrase = scenario.phrases[currentPhraseIndex];

  const handleNextPhrase = () => {
    const newMastered = new Set(masteredPhrases);
    newMastered.add(currentPhraseIndex);
    setMasteredPhrases(newMastered);

    if (currentPhraseIndex < scenario.phrases.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1);
      setShowReading(false);
    } else {
      setPhase('dialogue');
      setCurrentDialogueIndex(0);
    }
  };

  const handleNextDialogue = () => {
    if (currentDialogueIndex < scenario.dialogues.length - 1) {
      setCurrentDialogueIndex(currentDialogueIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const score = Math.round((masteredPhrases.size / scenario.phrases.length) * 100);
    const xp = completeScenario(scenarioId!, score, masteredPhrases.size, scenario.phrases.length);
    setEarnedXp(xp);

    if (currentMember) {
      addXp(currentMember.id, xp);
      updateStreak(currentMember.id);
    }

    setPhase('complete');
  };

  const renderIntro = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-6 flex flex-col"
    >
      <div className={`p-6 rounded-2xl bg-gradient-to-br ${location.color} mb-6`}>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{scenario.icon}</span>
          <div>
            <h2 className="text-2xl font-bold text-white">{scenario.title}</h2>
            <p className="text-white/80">{scenario.description}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-4 mb-6">
        <h3 className="text-white/60 text-sm font-medium mb-2">상황</h3>
        <p className="text-white leading-relaxed">{scenario.situation}</p>
      </div>

      <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <span className="text-white">{scenario.phrases.length}개 표현</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-400" />
          <span className="text-white">{scenario.dialogues.length}개 대화</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Star className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 font-bold">+{scenario.xpReward} XP</span>
        </div>
      </div>

      <div className="flex-1" />

      <button
        onClick={() => setPhase('phrases')}
        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2"
      >
        학습 시작하기
        <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  );

  const renderPhrases = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col p-6"
    >
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-white/60 mb-2">
          <span>표현 학습</span>
          <span>{currentPhraseIndex + 1} / {scenario.phrases.length}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
            animate={{ width: `${((currentPhraseIndex + 1) / scenario.phrases.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Phrase Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhraseIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="flex-1 flex flex-col"
        >
          <div className="bg-white/5 rounded-2xl p-6 mb-4 flex-1">
            <button
              onClick={() => speak(currentPhrase.japanese)}
              className="w-full flex items-center justify-center gap-3 mb-6"
            >
              <div className="p-3 bg-indigo-500/20 rounded-full">
                <Volume2 className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="text-3xl font-bold text-white">{currentPhrase.japanese}</span>
            </button>

            {/* Reading toggle */}
            <button
              onClick={() => setShowReading(!showReading)}
              className="w-full p-3 bg-white/5 rounded-xl mb-4 text-center"
            >
              <AnimatePresence mode="wait">
                {showReading ? (
                  <motion.span
                    key="reading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-lg text-indigo-300"
                  >
                    {currentPhrase.reading}
                  </motion.span>
                ) : (
                  <motion.span
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-white/40"
                  >
                    탭하여 읽기 보기
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <div className="text-center p-4 bg-slate-800 rounded-xl">
              <p className="text-white/60 text-sm mb-1">의미</p>
              <p className="text-xl text-white font-medium">{currentPhrase.meaning}</p>
            </div>

            {currentPhrase.context && (
              <div className="mt-4 p-3 bg-amber-500/10 rounded-xl flex items-start gap-2">
                <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-amber-200 text-sm">{currentPhrase.context}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleNextPhrase}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2"
          >
            {currentPhraseIndex < scenario.phrases.length - 1 ? (
              <>
                다음 표현
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                대화 연습하기
                <MessageCircle className="w-5 h-5" />
              </>
            )}
          </button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );

  const renderDialogue = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col p-6"
    >
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-white/60 mb-2">
          <span>대화 연습</span>
          <span>{currentDialogueIndex + 1} / {scenario.dialogues.length}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
            animate={{ width: `${((currentDialogueIndex + 1) / scenario.dialogues.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Dialogue Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto mb-4">
        {scenario.dialogues.slice(0, currentDialogueIndex + 1).map((dialogue, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${dialogue.speaker === 'you' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[85%] rounded-2xl p-4
                ${dialogue.speaker === 'you'
                  ? 'bg-indigo-500 rounded-br-md'
                  : 'bg-white/10 rounded-bl-md'
                }
              `}
            >
              {dialogue.speakerName && (
                <p className="text-white/60 text-xs mb-1">{dialogue.speakerName}</p>
              )}
              <button
                onClick={() => speak(dialogue.japanese)}
                className="flex items-center gap-2 mb-2"
              >
                <Volume2 className="w-4 h-4 text-white/60" />
                <p className="text-white font-medium">{dialogue.japanese}</p>
              </button>
              <p className="text-white/60 text-sm">{dialogue.reading}</p>
              <p className="text-white/80 text-sm mt-2 pt-2 border-t border-white/10">
                {dialogue.meaning}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={handleNextDialogue}
        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2"
      >
        {currentDialogueIndex < scenario.dialogues.length - 1 ? (
          <>
            다음 대화
            <ChevronRight className="w-5 h-5" />
          </>
        ) : (
          <>
            완료하기
            <CheckCircle2 className="w-5 h-5" />
          </>
        )}
      </button>
    </motion.div>
  );

  const renderComplete = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center justify-center p-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6"
      >
        <CheckCircle2 className="w-12 h-12 text-white" />
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-2">시나리오 완료!</h2>
      <p className="text-white/60 mb-6">{scenario.title}를 완료했어요!</p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-yellow-500/20 rounded-xl p-6 mb-6 w-full"
      >
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-yellow-400" />
          <span className="text-3xl font-bold text-yellow-400">+{earnedXp} XP</span>
        </div>
        <p className="text-yellow-200/60 text-sm mt-2">
          {masteredPhrases.size}/{scenario.phrases.length} 표현 학습 완료
        </p>
      </motion.div>

      {scenario.culturalNote && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-amber-500/10 rounded-xl p-4 mb-6 w-full"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-amber-300 font-medium text-sm mb-1">문화 노트</p>
              <p className="text-amber-200/80 text-sm">{scenario.culturalNote}</p>
            </div>
          </div>
        </motion.div>
      )}

      <button
        onClick={() => navigate('/journey')}
        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-bold text-lg"
      >
        여행 계속하기
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => navigate('/journey')}
            className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="ml-3 flex items-center gap-3">
            <span className="text-2xl">{location.icon}</span>
            <div>
              <h1 className="text-white font-bold">{location.name}</h1>
              <p className="text-white/60 text-xs">{location.japaneseName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {phase === 'intro' && renderIntro()}
      {phase === 'phrases' && renderPhrases()}
      {phase === 'dialogue' && renderDialogue()}
      {phase === 'complete' && renderComplete()}
    </div>
  );
}
