import { useState, useRef, useEffect } from 'react';
import { Send, Smile, Bell, BellOff, Mic, MicOff, Volume2, Bot, Users, RefreshCw } from 'lucide-react';
import { useChatStore, ENCOURAGEMENT_MESSAGES } from '@/stores/chatStore';
import { useFamilyStore, useUIStore } from '@/stores';
import { sendFreetalkMessage, getFreetalkGreeting, type ChatMessage as ClaudeChatMessage } from '@/lib/claude';

type TabType = 'ai' | 'family';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  // 탭 상태
  const [activeTab, setActiveTab] = useState<TabType>('ai');

  // 가족 채팅 상태
  const { messages, addMessage, markAsRead } = useChatStore();
  const { members, currentMemberId } = useFamilyStore();
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(
    'Notification' in window && Notification.permission === 'granted'
  );

  // AI 프리톡 상태
  const { showToast } = useUIStore();
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiMessagesEndRef = useRef<HTMLDivElement>(null);

  const currentMember = members.find((m) => m.id === currentMemberId);

  // 스크롤 처리
  useEffect(() => {
    if (activeTab === 'family') {
      markAsRead();
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, aiMessages, activeTab, markAsRead]);

  // AI 대화 시작 시 첫 인사말
  useEffect(() => {
    if (activeTab === 'ai' && aiMessages.length === 0) {
      const greeting: AIMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: getFreetalkGreeting(),
        timestamp: new Date(),
      };
      setAiMessages([greeting]);
    }
  }, [activeTab, aiMessages.length]);

  // Voice 초기화
  useEffect(() => {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }, []);

  // ========== 가족 채팅 핸들러 ==========
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationEnabled(permission === 'granted');
      if (permission === 'granted') {
        new Notification('알림이 활성화되었습니다!', {
          body: '가족들의 메시지를 받을 수 있어요.',
          icon: '/pwa-192x192.png',
        });
      }
    }
  };

  const handleSendFamilyMessage = () => {
    if (!newMessage.trim() || !currentMember) return;

    addMessage({
      senderId: currentMember.id,
      senderName: currentMember.name,
      senderAvatar: currentMember.avatar,
      content: newMessage.trim(),
      type: 'text',
    });

    setNewMessage('');
    setShowEmoji(false);
  };

  const sendEncouragement = (msg: string) => {
    if (!currentMember) return;

    addMessage({
      senderId: currentMember.id,
      senderName: currentMember.name,
      senderAvatar: currentMember.avatar,
      content: msg,
      type: 'encouragement',
    });

    setShowEmoji(false);
  };

  // ========== AI 프리톡 핸들러 ==========
  const handleSendAIMessage = async () => {
    if (!aiInput.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: aiInput,
      timestamp: new Date(),
    };
    setAiMessages((prev) => [...prev, userMessage]);
    setAiInput('');
    setIsLoading(true);

    try {
      const chatMessages: ClaudeChatMessage[] = aiMessages
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));
      chatMessages.push({ role: 'user', content: aiInput });

      const response = await sendFreetalkMessage(chatMessages);

      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setAiMessages((prev) => [...prev, aiMessage]);
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
        setAiInput(transcript);
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

    const voices = speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en-'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    speechSynthesis.speak(utterance);
  };

  const handleResetAIChat = () => {
    setAiMessages([]);
    const greeting: AIMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: getFreetalkGreeting(),
      timestamp: new Date(),
    };
    setAiMessages([greeting]);
  };

  // ========== 유틸리티 ==========
  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    }
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    });
  };

  const shouldShowDateDivider = (index: number) => {
    if (index === 0) return true;
    const currentDate = new Date(messages[index].timestamp).toDateString();
    const prevDate = new Date(messages[index - 1].timestamp).toDateString();
    return currentDate !== prevDate;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-background pb-safe">
      {/* 헤더 + 탭 */}
      <header className="bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">대화</h1>
            <p className="text-xs text-gray-500">
              {activeTab === 'ai' ? 'AI와 영어로 프리톡' : `${members.length}명의 가족`}
            </p>
          </div>
          {activeTab === 'ai' ? (
            <button
              onClick={handleResetAIChat}
              className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              title="새 대화 시작"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={requestNotificationPermission}
              className={`p-2 rounded-lg transition-colors ${
                notificationEnabled
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {notificationEnabled ? (
                <Bell className="w-5 h-5" />
              ) : (
                <BellOff className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* 탭 */}
        <div className="flex px-4 pb-2 gap-2">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'ai'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            AI 프리톡
          </button>
          <button
            onClick={() => setActiveTab('family')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'family'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            가족 채팅
          </button>
        </div>
      </header>

      {/* AI 프리톡 탭 */}
      {activeTab === 'ai' && (
        <>
          {/* AI 메시지 목록 */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-4">
            {aiMessages.map((message) => (
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
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
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
            <div ref={aiMessagesEndRef} />
          </div>

          {/* AI 입력창 */}
          <div className="px-4 py-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={handleVoiceInput}
                className={`p-2 rounded-full transition-colors ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendAIMessage()}
                placeholder="영어로 말해보세요..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendAIMessage}
                disabled={!aiInput.trim() || isLoading}
                className="p-2 bg-primary-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* 가족 채팅 탭 */}
      {activeTab === 'family' && (
        <>
          {/* 가족 메시지 목록 */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-4">
            {messages.map((message, index) => {
              const isOwn = message.senderId === currentMemberId;
              const isSystem = message.senderId === 'system';

              return (
                <div key={message.id}>
                  {/* 날짜 구분선 */}
                  {shouldShowDateDivider(index) && (
                    <div className="flex items-center justify-center my-4">
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                  )}

                  {/* 시스템 메시지 */}
                  {isSystem ? (
                    <div className="flex justify-center">
                      <div
                        className={`px-4 py-2 rounded-xl max-w-[85%] text-center ${
                          message.type === 'achievement'
                            ? 'bg-accent-100 text-accent-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span className="text-lg mr-1">{message.senderAvatar}</span>
                        <span className="text-sm">{message.content}</span>
                      </div>
                    </div>
                  ) : (
                    /* 일반 메시지 */
                    <div
                      className={`flex items-end gap-2 ${
                        isOwn ? 'flex-row-reverse' : ''
                      }`}
                    >
                      {/* 아바타 (다른 사람 메시지만) */}
                      {!isOwn && (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                          {message.senderAvatar}
                        </div>
                      )}

                      <div className={`max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
                        {/* 이름 (다른 사람 메시지만) */}
                        {!isOwn && (
                          <p className="text-xs text-gray-500 mb-1 ml-1">
                            {message.senderName}
                          </p>
                        )}

                        {/* 메시지 버블 */}
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-primary-500 text-white rounded-br-md'
                              : 'bg-white text-foreground rounded-bl-md shadow-sm'
                          } ${
                            message.type === 'encouragement'
                              ? 'text-lg'
                              : ''
                          }`}
                        >
                          {message.content}
                        </div>

                        {/* 시간 */}
                        <p
                          className={`text-xs text-gray-400 mt-1 ${
                            isOwn ? 'text-right mr-1' : 'ml-1'
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* 빠른 격려 메시지 */}
          {showEmoji && (
            <div className="px-4 py-3 bg-white border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">빠른 응원 메시지</p>
              <div className="flex flex-wrap gap-2">
                {ENCOURAGEMENT_MESSAGES.map((msg, index) => (
                  <button
                    key={index}
                    onClick={() => sendEncouragement(msg)}
                    className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-full text-sm hover:bg-primary-100 transition-colors"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 가족 입력창 */}
          <div className="px-4 py-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className={`p-2 rounded-lg transition-colors ${
                  showEmoji
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <Smile className="w-6 h-6" />
              </button>

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendFamilyMessage()}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              <button
                onClick={handleSendFamilyMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-primary-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
