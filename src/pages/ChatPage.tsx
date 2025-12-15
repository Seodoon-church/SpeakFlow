import { useState, useRef, useEffect } from 'react';
import { Send, Smile, Bell, BellOff } from 'lucide-react';
import { useChatStore, ENCOURAGEMENT_MESSAGES } from '@/stores/chatStore';
import { useFamilyStore } from '@/stores';

export default function ChatPage() {
  const { messages, addMessage, markAsRead } = useChatStore();
  const { members, currentMemberId } = useFamilyStore();
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(
    'Notification' in window && Notification.permission === 'granted'
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentMember = members.find((m) => m.id === currentMemberId);

  // 읽음 처리 및 스크롤
  useEffect(() => {
    markAsRead();
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, markAsRead]);

  // 알림 권한 요청
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

  // 메시지 전송
  const handleSend = () => {
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

  // 빠른 격려 메시지
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

  // 시간 포맷
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 날짜 포맷
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

  // 날짜 구분선이 필요한지 확인
  const shouldShowDateDivider = (index: number) => {
    if (index === 0) return true;
    const currentDate = new Date(messages[index].timestamp).toDateString();
    const prevDate = new Date(messages[index - 1].timestamp).toDateString();
    return currentDate !== prevDate;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-background pb-safe">
      {/* 헤더 */}
      <header className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">가족 채팅</h1>
          <p className="text-xs text-gray-500">{members.length}명의 가족</p>
        </div>
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
      </header>

      {/* 메시지 목록 */}
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

      {/* 입력창 */}
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
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="p-2 bg-primary-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
