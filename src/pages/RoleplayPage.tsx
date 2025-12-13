import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mic, MicOff, Send, Volume2, RotateCcw } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// 샘플 시나리오
const SAMPLE_SCENARIO = {
  title: '비즈니스 미팅 시작',
  description: '새로운 프로젝트에 대해 팀원과 미팅을 시작합니다.',
  situation: '당신은 프로젝트 매니저입니다. 팀원들과 새로운 마케팅 캠페인에 대해 논의하기 위한 미팅을 시작해야 합니다.',
  aiRole: '팀원 (마케팅 전문가)',
  userRole: '프로젝트 매니저',
};

export default function RoleplayPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showScenario, setShowScenario] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStartConversation = () => {
    setShowScenario(false);
    // AI 첫 메시지
    const aiGreeting: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Good morning! Thank you for organizing this meeting. I'm looking forward to discussing the new marketing campaign. Where would you like to start?",
      timestamp: new Date(),
    };
    setMessages([aiGreeting]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // 시뮬레이션: AI 응답 (실제로는 Claude API 호출)
    setTimeout(() => {
      const aiResponses = [
        "That sounds like a great approach. Could you tell me more about the target audience for this campaign?",
        "I agree with your point. Based on our previous campaigns, I think we should focus on digital channels. What's your budget allocation looking like?",
        "Excellent idea! I've been researching similar campaigns in the industry. Should I share some insights from my analysis?",
        "That's a good timeline. Let me check with the design team about the creative assets. Is there anything specific you'd like me to prepare for our next meeting?",
      ];
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('음성 인식이 지원되지 않는 브라우저입니다.');
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
      };

      recognition.start();
    }
  };

  const handlePlayMessage = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  };

  const handleReset = () => {
    setMessages([]);
    setShowScenario(true);
  };

  // 시나리오 선택 화면
  if (showScenario) {
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
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎭</div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {SAMPLE_SCENARIO.title}
            </h2>
            <p className="text-gray-500 mb-6">{SAMPLE_SCENARIO.description}</p>
          </div>

          <div className="card mb-4">
            <h3 className="font-semibold text-foreground mb-2">상황</h3>
            <p className="text-gray-600 text-sm">{SAMPLE_SCENARIO.situation}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="card bg-primary-50">
              <p className="text-xs text-primary-600 mb-1">당신의 역할</p>
              <p className="font-semibold text-primary-700">{SAMPLE_SCENARIO.userRole}</p>
            </div>
            <div className="card bg-secondary-50">
              <p className="text-xs text-secondary-600 mb-1">AI 역할</p>
              <p className="font-semibold text-secondary-700">{SAMPLE_SCENARIO.aiRole}</p>
            </div>
          </div>

          <div className="bg-accent-50 p-4 rounded-xl mb-6">
            <p className="text-sm text-accent-700">
              💡 <strong>학습 팁:</strong> 오늘 배운 표현들을 활용해보세요!<br />
              예: "I was wondering if...", "Could you please clarify..."
            </p>
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <button onClick={handleStartConversation} className="btn-primary w-full">
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
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-sm">{SAMPLE_SCENARIO.title}</h1>
          <p className="text-xs text-gray-500">{SAMPLE_SCENARIO.aiRole}</p>
        </div>
        <button onClick={handleReset} className="p-2 -mr-2">
          <RotateCcw className="w-5 h-5 text-gray-600" />
        </button>
      </header>

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
                <p className="text-sm">{message.content}</p>
                {message.role === 'assistant' && (
                  <button
                    onClick={() => handlePlayMessage(message.content)}
                    className="mt-2 text-xs text-gray-400 flex items-center gap-1"
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
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200" />
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
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="영어로 대화해보세요..."
            className="flex-1 input py-3"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="p-3 bg-primary-500 text-white rounded-full disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
