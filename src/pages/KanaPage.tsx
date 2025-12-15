import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Volume2, RotateCcw, Check, X, Pencil } from 'lucide-react';
import { KANA_ROWS, DAKUON_ROWS, generateKanaQuiz } from '@/data/kana';
import { useLanguageStore } from '@/stores';
import WritingCanvas from '@/components/WritingCanvas';

type ViewMode = 'table' | 'quiz' | 'write';
type KanaType = 'hiragana' | 'katakana';
type QuizState = 'question' | 'correct' | 'wrong';

export default function KanaPage() {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguageStore();
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [kanaType, setKanaType] = useState<KanaType>('hiragana');
  const [showDakuon, setShowDakuon] = useState(false);

  // 퀴즈 상태
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<QuizState>('question');
  const [score, setScore] = useState(0);

  // 쓰기 연습 상태
  const [writeIndex, setWriteIndex] = useState(0);
  const [practiceCount, setPracticeCount] = useState(0);

  // 퀴즈 생성
  const allKana = useMemo(() => {
    const basic = KANA_ROWS.flatMap(row => row.kana);
    return showDakuon ? [...basic, ...DAKUON_ROWS.flatMap(row => row.kana)] : basic;
  }, [showDakuon]);

  const quizzes = useMemo(() => {
    return generateKanaQuiz(allKana, 10, kanaType);
  }, [allKana, kanaType]);

  const currentQuiz = quizzes[quizIndex];
  const currentWriteKana = allKana[writeIndex];

  // TTS 재생
  const playSound = (text: string) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8;

    const voices = speechSynthesis.getVoices();
    const japaneseVoice = voices.find(v => v.lang.startsWith('ja'));
    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
    }

    speechSynthesis.speak(utterance);
  };

  // 답변 선택
  const handleAnswerSelect = (answer: string) => {
    if (quizState !== 'question') return;

    setSelectedAnswer(answer);

    if (answer === currentQuiz.correctAnswer) {
      setQuizState('correct');
      setScore(score + 1);
    } else {
      setQuizState('wrong');
    }
  };

  // 다음 문제
  const handleNextQuestion = () => {
    if (quizIndex < quizzes.length - 1) {
      setQuizIndex(quizIndex + 1);
      setSelectedAnswer(null);
      setQuizState('question');
    }
  };

  // 퀴즈 리셋
  const handleResetQuiz = () => {
    setQuizIndex(0);
    setSelectedAnswer(null);
    setQuizState('question');
    setScore(0);
  };

  // 일본어가 아니면 안내 메시지
  if (currentLanguage !== 'ja') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-6xl mb-4">🇯🇵</p>
          <h1 className="text-xl font-bold text-foreground mb-2">일본어 문자 학습</h1>
          <p className="text-gray-500 mb-6">
            히라가나/가타카나 학습은 일본어 학습 모드에서 이용할 수 있습니다.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="btn-primary"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="font-bold text-foreground">일본어 문자 학습</h1>
            <p className="text-xs text-gray-500">히라가나 / 가타카나</p>
          </div>
        </div>
      </header>

      {/* 모드 선택 탭 */}
      <div className="px-4 py-3">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setViewMode('table')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-gray-500'
            }`}
          >
            문자표
          </button>
          <button
            onClick={() => setViewMode('write')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
              viewMode === 'write'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            쓰기
          </button>
          <button
            onClick={() => setViewMode('quiz')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'quiz'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-gray-500'
            }`}
          >
            퀴즈
          </button>
        </div>
      </div>

      {/* 히라가나/가타카나 선택 */}
      <div className="px-4 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setKanaType('hiragana')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium border-2 transition-colors ${
              kanaType === 'hiragana'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 text-gray-500'
            }`}
          >
            히라가나
          </button>
          <button
            onClick={() => setKanaType('katakana')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium border-2 transition-colors ${
              kanaType === 'katakana'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 text-gray-500'
            }`}
          >
            가타카나
          </button>
        </div>
      </div>

      {/* 문자표 모드 */}
      {viewMode === 'table' && (
        <div className="px-4">
          {/* 탁음 토글 */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">탁음/반탁음 포함</span>
            <button
              onClick={() => setShowDakuon(!showDakuon)}
              className={`w-12 h-6 rounded-full transition-colors ${
                showDakuon ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                showDakuon ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* 기본 가나 행별 표시 */}
          {KANA_ROWS.map((row) => (
            <div key={row.name} className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{row.name}</h3>
              <div className="grid grid-cols-5 gap-2">
                {row.kana.map((kana) => (
                  <button
                    key={kana.romaji}
                    onClick={() => playSound(kanaType === 'hiragana' ? kana.hiragana : kana.katakana)}
                    className={`${row.color} p-3 rounded-xl text-center hover:scale-105 transition-transform active:scale-95`}
                  >
                    <p className="text-2xl font-bold text-foreground">
                      {kanaType === 'hiragana' ? kana.hiragana : kana.katakana}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{kana.korean}</p>
                    <p className="text-xs text-gray-400">{kana.romaji}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* 탁음/반탁음 */}
          {showDakuon && DAKUON_ROWS.map((row) => (
            <div key={row.name} className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{row.name}</h3>
              <div className="grid grid-cols-5 gap-2">
                {row.kana.map((kana) => (
                  <button
                    key={kana.romaji}
                    onClick={() => playSound(kanaType === 'hiragana' ? kana.hiragana : kana.katakana)}
                    className={`${row.color} p-3 rounded-xl text-center hover:scale-105 transition-transform active:scale-95`}
                  >
                    <p className="text-2xl font-bold text-foreground">
                      {kanaType === 'hiragana' ? kana.hiragana : kana.katakana}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{kana.korean}</p>
                    <p className="text-xs text-gray-400">{kana.romaji}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 퀴즈 모드 */}
      {viewMode === 'quiz' && (
        <div className="px-4">
          {/* 진행 상황 */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">
              {quizIndex + 1} / {quizzes.length}
            </span>
            <span className="text-sm font-medium text-primary-600">
              점수: {score}점
            </span>
          </div>

          {/* 진행 바 */}
          <div className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${((quizIndex + 1) / quizzes.length) * 100}%` }}
            />
          </div>

          {/* 퀴즈 완료 */}
          {quizIndex >= quizzes.length - 1 && quizState !== 'question' ? (
            <div className="card text-center py-8">
              <p className="text-5xl mb-4">
                {score >= 8 ? '🎉' : score >= 5 ? '👍' : '💪'}
              </p>
              <h2 className="text-xl font-bold text-foreground mb-2">
                퀴즈 완료!
              </h2>
              <p className="text-gray-500 mb-6">
                {quizzes.length}문제 중 {score}문제 정답
              </p>
              <button
                onClick={handleResetQuiz}
                className="btn-primary inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                다시 풀기
              </button>
            </div>
          ) : (
            <>
              {/* 문제 카드 */}
              <div className="card mb-6">
                <p className="text-center text-gray-500 text-sm mb-4">
                  이 문자의 발음은?
                </p>
                <button
                  onClick={() => playSound(currentQuiz.character)}
                  className="w-full flex flex-col items-center py-6"
                >
                  <p className="text-7xl font-bold text-foreground mb-4">
                    {currentQuiz.character}
                  </p>
                  <div className="flex items-center gap-2 text-primary-500">
                    <Volume2 className="w-5 h-5" />
                    <span className="text-sm">탭하여 발음 듣기</span>
                  </div>
                </button>
              </div>

              {/* 선택지 */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {currentQuiz.options.map((option) => {
                  let buttonClass = 'border-gray-200 bg-white';

                  if (quizState !== 'question') {
                    if (option === currentQuiz.correctAnswer) {
                      buttonClass = 'border-green-500 bg-green-50';
                    } else if (option === selectedAnswer && quizState === 'wrong') {
                      buttonClass = 'border-red-500 bg-red-50';
                    }
                  } else if (option === selectedAnswer) {
                    buttonClass = 'border-primary-500 bg-primary-50';
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={quizState !== 'question'}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${buttonClass}`}
                    >
                      <p className="text-lg font-bold text-foreground">{option}</p>
                    </button>
                  );
                })}
              </div>

              {/* 결과 표시 */}
              {quizState !== 'question' && (
                <div className={`p-4 rounded-xl mb-4 ${
                  quizState === 'correct' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <div className="flex items-center gap-3">
                    {quizState === 'correct' ? (
                      <Check className="w-6 h-6 text-green-600" />
                    ) : (
                      <X className="w-6 h-6 text-red-600" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        quizState === 'correct' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {quizState === 'correct' ? '정답!' : '오답'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {currentQuiz.character} = {currentQuiz.correctAnswer} ({currentQuiz.korean})
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 다음 버튼 */}
              {quizState !== 'question' && quizIndex < quizzes.length - 1 && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full btn-primary"
                >
                  다음 문제
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* 쓰기 연습 모드 */}
      {viewMode === 'write' && currentWriteKana && (
        <div className="px-4">
          {/* 진행 상황 */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">
              {writeIndex + 1} / {allKana.length}
            </span>
            <button
              onClick={() => playSound(kanaType === 'hiragana' ? currentWriteKana.hiragana : currentWriteKana.katakana)}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-600 rounded-full text-sm"
            >
              <Volume2 className="w-4 h-4" />
              발음 듣기
            </button>
          </div>

          {/* 진행 바 */}
          <div className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${((writeIndex + 1) / allKana.length) * 100}%` }}
            />
          </div>

          {/* 쓰기 캔버스 */}
          <WritingCanvas
            character={kanaType === 'hiragana' ? currentWriteKana.hiragana : currentWriteKana.katakana}
            subText={`${currentWriteKana.korean} (${currentWriteKana.romaji})`}
            onPrev={writeIndex > 0 ? () => setWriteIndex(writeIndex - 1) : undefined}
            onNext={writeIndex < allKana.length - 1 ? () => {
              setWriteIndex(writeIndex + 1);
              setPracticeCount(practiceCount + 1);
            } : undefined}
            onComplete={() => {
              setPracticeCount(practiceCount + 1);
            }}
          />

          {/* 연습 횟수 */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              오늘 연습한 문자: <span className="font-bold text-primary-600">{practiceCount}개</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
