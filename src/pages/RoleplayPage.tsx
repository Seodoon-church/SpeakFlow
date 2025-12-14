import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mic, MicOff, Send, Volume2, MessageSquare, Star } from 'lucide-react';
import { sendMessageToClaude, getInitialGreeting, generateFeedback, type ChatMessage } from '@/lib/claude';
import { useUIStore, useLearningStore } from '@/stores';
import { getScenariosForTrack, type Scenario } from '@/data/scenarios';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

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

export default function RoleplayPage() {
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const { currentTrack } = useLearningStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [showScenarioList, setShowScenarioList] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 현재 트랙에 맞는 시나리오 가져오기
  const scenarios = getScenariosForTrack(currentTrack?.id || 'daily-life');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
  };

  const handleStartConversation = () => {
    if (!selectedScenario) return;

    setShowScenarioList(false);

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
    const aiGreeting: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    };
    setMessages([aiGreeting]);
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
      chatMessages.push({ role: 'user', content: inputText });

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

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      showToast({
        type: 'error',
        message: 'AI 응답을 받는데 실패했습니다.',
      });
    } finally {
      setIsLoading(false);
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
      recognition.lang = 'en-US';
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
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
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
            <button onClick={() => navigate('/')} className="btn-outline w-full">
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
              {currentTrack?.name || 'Business'} 트랙 시나리오
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
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white rounded-br-md'
                    : 'bg-white text-foreground rounded-bl-md shadow-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
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

      {/* 입력 영역 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
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
            placeholder="영어로 대화해보세요..."
            className="flex-1 input py-3"
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
    </div>
  );
}
