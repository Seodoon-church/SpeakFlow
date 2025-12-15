import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Mic, MicOff, Send, Volume2, MessageSquare, Star, Eye, EyeOff, RotateCcw, Check } from 'lucide-react';
import { sendMessageToClaude, getInitialGreeting, generateFeedback, generateSuggestedResponses, getGreetingTranslation, getFallbackTranslation, type ChatMessage } from '@/lib/claude';
import { useUIStore, useLearningStore, TRACKS, useLanguageStore } from '@/stores';
import { getScenariosForTrack, type Scenario } from '@/data/scenarios';
import type { TrackId } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  translation?: string; // 한글 번역
  timestamp: Date;
}

// 답변 학습 단계
type ResponseLearningStep = 'select' | 'listen' | 'shadow' | 'speak' | 'done';

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

const difficultyLabels = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
};

// 언어별 TTS 설정
const LANGUAGE_TTS_CONFIG: Record<string, { code: string; rate: number }> = {
  'en': { code: 'en-US', rate: 0.85 },
  'ja': { code: 'ja-JP', rate: 0.9 },
  'zh': { code: 'zh-CN', rate: 0.9 },
};

export default function RoleplayPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useUIStore();
  const { currentTrack } = useLearningStore();
  const { currentLanguage } = useLanguageStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [showScenarioList, setShowScenarioList] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 추천 답변 및 학습 상태
  const [suggestedResponses, setSuggestedResponses] = useState<string[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [learningStep, setLearningStep] = useState<ResponseLearningStep>('select');
  const [isTextHidden, setIsTextHidden] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // URL 파라미터에서 트랙 ID 가져오기
  const trackIdFromUrl = searchParams.get('track') as TrackId | null;
  const activeTrackId = trackIdFromUrl || currentTrack?.id || 'daily-life';
  const activeTrack = TRACKS.find(t => t.id === activeTrackId);

  // 현재 트랙에 맞는 시나리오 가져오기
  const scenarios = getScenariosForTrack(activeTrackId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 음성 합성 초기화 (일부 브라우저에서 필요)
  useEffect(() => {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }, []);

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
  };

  const handleStartConversation = async () => {
    if (!selectedScenario) return;

    setShowScenarioList(false);
    setIsLoadingSuggestions(true);

    // AI 첫 메시지
    const context = {
      scenario: {
        title: selectedScenario.title,
        situation: selectedScenario.situation,
        userRole: selectedScenario.userRole,
        aiRole: selectedScenario.aiRole,
      },
      targetExpressions: selectedScenario.targetExpressions,
    };

    const greeting = getInitialGreeting(context);
    const greetingTranslation = getGreetingTranslation(selectedScenario.title);
    const aiGreeting: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: greeting,
      translation: greetingTranslation,
      timestamp: new Date(),
    };
    setMessages([aiGreeting]);

    // 추천 답변 생성
    try {
      const suggestions = await generateSuggestedResponses(
        [{ role: 'assistant', content: greeting }],
        context
      );
      setSuggestedResponses(suggestions);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // 추천 답변 선택 시
  const handleSelectResponse = (response: string) => {
    setSelectedResponse(response);
    setLearningStep('listen');
    // 자동으로 TTS 재생
    handlePlayMessage(response);
  };

  // 발음 점수 계산
  const calculatePronunciationScore = (original: string, recognized: string): number => {
    const originalWords = original.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
    const recognizedWords = recognized.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
    let matchCount = 0;
    for (const word of originalWords) {
      if (recognizedWords.includes(word)) matchCount++;
    }
    return Math.min(100, Math.max(0, Math.round((matchCount / originalWords.length) * 100)));
  };

  // 3단계 학습 진행
  const handleNextLearningStep = () => {
    if (learningStep === 'listen') {
      setLearningStep('shadow');
    } else if (learningStep === 'shadow') {
      setLearningStep('speak');
      setIsTextHidden(true);
    } else if (learningStep === 'speak') {
      // 발음 평가 완료 후 메시지 전송
      handleSendSelectedResponse();
    }
  };

  // 선택한 답변 전송 (학습 완료 후)
  const handleSendSelectedResponse = async () => {
    if (!selectedResponse || !selectedScenario) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: selectedResponse,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // 학습 상태 초기화
    resetLearningState();
    setIsLoading(true);

    try {
      const chatMessages: ChatMessage[] = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));
      chatMessages.push({ role: 'user', content: selectedResponse });

      const context = {
        scenario: {
          title: selectedScenario.title,
          situation: selectedScenario.situation,
          userRole: selectedScenario.userRole,
          aiRole: selectedScenario.aiRole,
        },
        targetExpressions: selectedScenario.targetExpressions,
      };

      const response = await sendMessageToClaude(chatMessages, context);
      const translation = getFallbackTranslation(response, activeTrackId);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        translation: translation || undefined,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // 다음 추천 답변 생성
      setIsLoadingSuggestions(true);
      const newChatMessages = [...chatMessages, { role: 'assistant' as const, content: response }];
      const suggestions = await generateSuggestedResponses(newChatMessages, context);
      setSuggestedResponses(suggestions);
    } catch (error) {
      console.error('Error:', error);
      showToast({ type: 'error', message: 'AI 응답을 받는데 실패했습니다.' });
    } finally {
      setIsLoading(false);
      setIsLoadingSuggestions(false);
    }
  };

  // 섀도잉 모드에서 녹음
  const handleRecordForEvaluation = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      showToast({ type: 'warning', message: '음성 인식이 지원되지 않는 브라우저입니다.' });
      return;
    }

    setIsRecording(!isRecording);

    if (!isRecording) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      const ttsConfig = LANGUAGE_TTS_CONFIG[currentLanguage] || LANGUAGE_TTS_CONFIG['en'];
      recognition.lang = ttsConfig.code;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setRecognizedText(transcript);
        setIsRecording(false);

        // 발음 점수 계산
        if (selectedResponse) {
          const score = calculatePronunciationScore(selectedResponse, transcript);
          setPronunciationScore(score);
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
        showToast({ type: 'error', message: '음성 인식에 실패했습니다.' });
      };

      recognition.onend = () => setIsRecording(false);
      recognition.start();
    }
  };

  // 학습 상태 초기화
  const resetLearningState = () => {
    setSelectedResponse(null);
    setLearningStep('select');
    setIsTextHidden(false);
    setRecognizedText('');
    setPronunciationScore(null);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || !selectedScenario) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const sentText = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      // Claude API 호출
      const chatMessages: ChatMessage[] = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));
      chatMessages.push({ role: 'user', content: sentText });

      const context = {
        scenario: {
          title: selectedScenario.title,
          situation: selectedScenario.situation,
          userRole: selectedScenario.userRole,
          aiRole: selectedScenario.aiRole,
        },
        targetExpressions: selectedScenario.targetExpressions,
      };

      const response = await sendMessageToClaude(chatMessages, context);
      const translation = getFallbackTranslation(response, activeTrackId);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        translation: translation || undefined,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // AI 응답 후 추천 답변 생성
      setIsLoadingSuggestions(true);
      const newChatMessages = [...chatMessages, { role: 'assistant' as const, content: response }];
      const suggestions = await generateSuggestedResponses(newChatMessages, context);
      setSuggestedResponses(suggestions);
    } catch (error) {
      console.error('Error sending message:', error);
      showToast({
        type: 'error',
        message: 'AI 응답을 받는데 실패했습니다.',
      });
    } finally {
      setIsLoading(false);
      setIsLoadingSuggestions(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      showToast({
        type: 'warning',
        message: '음성 인식이 지원되지 않는 브라우저입니다.',
      });
      return;
    }

    setIsRecording(!isRecording);

    if (!isRecording) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      const ttsConfig = LANGUAGE_TTS_CONFIG[currentLanguage] || LANGUAGE_TTS_CONFIG['en'];
      recognition.lang = ttsConfig.code;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        showToast({
          type: 'error',
          message: '음성 인식에 실패했습니다. 다시 시도해주세요.',
        });
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    }
  };

  const handlePlayMessage = (text: string) => {
    speechSynthesis.cancel();
    const ttsConfig = LANGUAGE_TTS_CONFIG[currentLanguage] || LANGUAGE_TTS_CONFIG['en'];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = ttsConfig.code;
    utterance.rate = ttsConfig.rate;

    // 선택한 언어에 맞는 음성 찾기
    const voices = speechSynthesis.getVoices();
    const langPrefix = ttsConfig.code.split('-')[0];
    const targetVoice = voices.find(v => v.lang.startsWith(langPrefix + '-'));
    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    speechSynthesis.speak(utterance);
  };

  const handleEndConversation = async () => {
    if (!selectedScenario || messages.length < 2) {
      handleReset();
      return;
    }

    setIsLoading(true);

    try {
      const chatMessages: ChatMessage[] = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      const context = {
        scenario: {
          title: selectedScenario.title,
          situation: selectedScenario.situation,
          userRole: selectedScenario.userRole,
          aiRole: selectedScenario.aiRole,
        },
      };

      const feedbackText = await generateFeedback(chatMessages, context);
      setFeedback(feedbackText);
      setShowFeedback(true);
    } catch (error) {
      console.error('Error generating feedback:', error);
      setFeedback('오늘 대화 연습 수고하셨습니다! 다음에도 꾸준히 연습해보세요.');
      setShowFeedback(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setSelectedScenario(null);
    setShowScenarioList(true);
    setShowFeedback(false);
    setFeedback('');
    setSuggestedResponses([]);
    resetLearningState();
  };

  // 피드백 화면
  if (showFeedback) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center px-4 py-4">
          <button onClick={handleReset} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="flex-1 text-center font-bold text-lg">대화 완료</h1>
          <div className="w-10" />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-foreground mb-4">잘 하셨어요!</h2>

          <div className="w-full bg-white rounded-2xl p-5 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-accent-500" />
              <span className="font-semibold text-foreground">AI 피드백</span>
            </div>
            <p className="text-gray-600 leading-relaxed">{feedback}</p>
          </div>

          <div className="w-full bg-primary-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-primary-700">
              <strong>학습 팁:</strong> 오늘 배운 표현들을 일상에서 사용해보세요!
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedScenario?.targetExpressions?.map((expr, idx) => (
                <span key={idx} className="text-xs bg-white px-2 py-1 rounded-full text-primary-600">
                  {expr}
                </span>
              ))}
            </div>
          </div>

          <div className="w-full space-y-3">
            <button onClick={handleReset} className="btn-primary w-full">
              다른 시나리오 연습하기
            </button>
            <button onClick={() => navigate('/home')} className="btn-outline w-full">
              홈으로 돌아가기
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 시나리오 선택 화면
  if (showScenarioList) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="flex-1 text-center font-bold text-lg">AI 롤플레이</h1>
          <div className="w-10" />
        </header>

        <main className="flex-1 px-4 pb-32">
          <div className="text-center py-6">
            <div className="text-5xl mb-3">🎭</div>
            <h2 className="text-xl font-bold text-foreground mb-1">시나리오 선택</h2>
            <p className="text-gray-500 text-sm">
              {activeTrack?.name || 'Business'} 트랙 시나리오
            </p>
          </div>

          <div className="space-y-3">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  selectedScenario?.id === scenario.id
                    ? 'bg-primary-50 border-2 border-primary-500'
                    : 'bg-white border-2 border-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-foreground">{scenario.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[scenario.difficulty]}`}>
                    {difficultyLabels[scenario.difficulty]}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{scenario.description}</p>
                <div className="flex gap-2 text-xs">
                  <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">
                    You: {scenario.userRole}
                  </span>
                  <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">
                    AI: {scenario.aiRole}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {selectedScenario && (
            <div className="mt-6 bg-accent-50 p-4 rounded-xl">
              <p className="text-sm text-accent-700 mb-2">
                <strong>상황:</strong> {selectedScenario.situation}
              </p>
              <p className="text-sm text-accent-700">
                <strong>목표 표현:</strong>
              </p>
              <ul className="mt-1 space-y-1">
                {selectedScenario.targetExpressions?.map((expr, idx) => (
                  <li key={idx} className="text-sm text-accent-600">• {expr}</li>
                ))}
              </ul>
            </div>
          )}
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <button
            onClick={handleStartConversation}
            disabled={!selectedScenario}
            className="btn-primary w-full disabled:opacity-50"
          >
            대화 시작하기
          </button>
        </div>
      </div>
    );
  }

  // 대화 화면
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-4 bg-white border-b">
        <button onClick={() => setShowScenarioList(true)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="text-center flex-1">
          <h1 className="font-bold text-sm">{selectedScenario?.title}</h1>
          <p className="text-xs text-gray-500">{selectedScenario?.aiRole}</p>
        </div>
        <button onClick={handleEndConversation} className="p-2 -mr-2 text-primary-500 text-sm font-medium">
          종료
        </button>
      </header>

      {/* 타겟 표현 힌트 */}
      <div className="px-4 py-2 bg-primary-50 border-b border-primary-100">
        <div className="flex items-center gap-2 overflow-x-auto">
          <MessageSquare className="w-4 h-4 text-primary-500 flex-shrink-0" />
          {selectedScenario?.targetExpressions?.map((expr, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(expr)}
              className="text-xs bg-white px-2 py-1 rounded-full text-primary-600 whitespace-nowrap hover:bg-primary-100 transition-colors"
            >
              {expr}
            </button>
          ))}
        </div>
      </div>

      {/* 메시지 목록 */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-80">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white rounded-br-md'
                    : 'bg-white text-foreground rounded-bl-md shadow-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                {message.role === 'assistant' && message.translation && (
                  <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                    {message.translation}
                  </p>
                )}
                {message.role === 'assistant' && (
                  <button
                    onClick={() => handlePlayMessage(message.content)}
                    className="mt-2 text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600"
                  >
                    <Volume2 className="w-3 h-3" /> 듣기
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </main>

      {/* 입력 영역 - 추천 답변 및 학습 모드 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        {/* 학습 모드가 아닐 때: 추천 답변 표시 */}
        {learningStep === 'select' && (
          <div className="p-4">
            {/* 추천 답변 로딩 중 */}
            {isLoadingSuggestions ? (
              <div className="text-center py-4">
                <div className="flex justify-center gap-1 mb-2">
                  <div className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <p className="text-xs text-gray-500">추천 답변 생성 중...</p>
              </div>
            ) : suggestedResponses.length > 0 ? (
              <>
                <p className="text-xs text-gray-500 mb-2 text-center">👇 답변을 선택하면 학습이 시작됩니다</p>
                <div className="space-y-2 mb-3">
                  {suggestedResponses.map((response, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectResponse(response)}
                      disabled={isLoading}
                      className="w-full p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl text-left hover:from-primary-100 hover:to-secondary-100 transition-all border border-primary-200 disabled:opacity-50"
                    >
                      <span className="text-sm text-foreground">{response}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {/* 직접 입력 옵션 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleVoiceInput}
                className={`p-3 rounded-full transition-colors ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="직접 입력하기..."
                className="flex-1 input py-3 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="p-3 bg-primary-500 text-white rounded-full disabled:opacity-50 hover:bg-primary-600 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* 학습 모드: 듣기 → 따라읽기 → 안보고말하기 */}
        {learningStep !== 'select' && selectedResponse && (
          <div className="p-4">
            {/* 학습 단계 표시 */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                learningStep === 'listen' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>1</div>
              <div className="w-6 h-0.5 bg-gray-200" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                learningStep === 'shadow' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>2</div>
              <div className="w-6 h-0.5 bg-gray-200" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                learningStep === 'speak' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>3</div>
            </div>

            {/* Step 1: 듣기 */}
            {learningStep === 'listen' && (
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">🔊 원어민 발음을 들어보세요</p>
                <div className="bg-primary-50 p-4 rounded-xl mb-3">
                  <p className="text-foreground font-medium">{selectedResponse}</p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handlePlayMessage(selectedResponse)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Volume2 className="w-5 h-5" />
                    다시 듣기
                  </button>
                  <button
                    onClick={handleNextLearningStep}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
                  >
                    따라읽기
                    <ChevronLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: 따라읽기 (텍스트 보면서) */}
            {learningStep === 'shadow' && (
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">🎤 보면서 따라 읽어보세요</p>
                <div className="bg-secondary-50 p-4 rounded-xl mb-3">
                  <p className="text-foreground font-medium">{selectedResponse}</p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handlePlayMessage(selectedResponse)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Volume2 className="w-5 h-5" />
                    듣기
                  </button>
                  <button
                    onClick={handleRecordForEvaluation}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    {isRecording ? '녹음 중...' : '녹음'}
                  </button>
                  <button
                    onClick={handleNextLearningStep}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
                  >
                    안보고 말하기
                    <ChevronLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: 안보고 말하기 */}
            {learningStep === 'speak' && (
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">💪 이제 안 보고 말해보세요!</p>
                <div className="bg-gray-100 p-4 rounded-xl mb-3 relative">
                  {isTextHidden ? (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <EyeOff className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-400">텍스트가 숨겨졌습니다</span>
                    </div>
                  ) : (
                    <p className="text-foreground font-medium">{selectedResponse}</p>
                  )}
                  <button
                    onClick={() => setIsTextHidden(!isTextHidden)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {isTextHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>

                {/* 발음 평가 결과 */}
                {pronunciationScore !== null && (
                  <div className={`mb-3 p-3 rounded-xl ${pronunciationScore >= 80 ? 'bg-green-50' : 'bg-orange-50'}`}>
                    <p className="text-sm text-gray-600 mb-1">인식: {recognizedText}</p>
                    <p className={`text-2xl font-bold ${pronunciationScore >= 80 ? 'text-green-600' : 'text-orange-500'}`}>
                      {pronunciationScore}점 {pronunciationScore >= 80 ? '✅' : ''}
                    </p>
                  </div>
                )}

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handlePlayMessage(selectedResponse)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Volume2 className="w-5 h-5" />
                    힌트
                  </button>
                  <button
                    onClick={handleRecordForEvaluation}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-secondary-500 text-white hover:bg-secondary-600'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    {isRecording ? '녹음 중...' : '말하기'}
                  </button>
                  <button
                    onClick={handleNextLearningStep}
                    disabled={pronunciationScore === null}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-5 h-5" />
                    완료
                  </button>
                </div>
              </div>
            )}

            {/* 취소 버튼 */}
            <button
              onClick={resetLearningState}
              className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="w-4 h-4 inline mr-1" />
              다른 답변 선택하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
