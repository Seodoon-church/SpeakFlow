import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type: 'text' | 'encouragement' | 'achievement';
}

interface ChatState {
  messages: ChatMessage[];
  unreadCount: number;
  lastReadTimestamp: string | null;

  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  markAsRead: () => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [
        // 기본 환영 메시지
        {
          id: 'welcome-1',
          senderId: 'system',
          senderName: 'SpeakFlow',
          senderAvatar: '🎉',
          content: '가족 채팅방에 오신 것을 환영합니다! 서로 응원하며 함께 영어를 배워요!',
          timestamp: new Date().toISOString(),
          type: 'text' as const,
        },
      ],
      unreadCount: 1,
      lastReadTimestamp: null,

      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
          unreadCount: state.unreadCount + 1,
        }));

        // 푸시 알림 전송 시도
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`${message.senderName}`, {
            body: message.content,
            icon: '/pwa-192x192.png',
            tag: 'family-chat',
          });
        }
      },

      markAsRead: () => {
        set({
          unreadCount: 0,
          lastReadTimestamp: new Date().toISOString(),
        });
      },

      clearMessages: () => {
        set({
          messages: [],
          unreadCount: 0,
        });
      },
    }),
    {
      name: 'speakflow-chat',
    }
  )
);

// 격려 메시지 템플릿
export const ENCOURAGEMENT_MESSAGES = [
  '오늘도 화이팅! 💪',
  '잘하고 있어요! 👏',
  '멋져요! 계속 가보자! 🔥',
  '영어 실력이 느는 게 보여요! ⭐',
  '꾸준함이 최고예요! 🏆',
  '오늘 학습 완료! 대단해요! 🎉',
  '함께 하니까 더 재밌어요! 😊',
  '내일도 같이 해요! 🤝',
];

// 성취 메시지 생성 함수
export const createAchievementMessage = (
  memberName: string,
  memberAvatar: string,
  achievement: string
): Omit<ChatMessage, 'id' | 'timestamp'> => ({
  senderId: 'system',
  senderName: 'SpeakFlow',
  senderAvatar: '🏆',
  content: `${memberAvatar} ${memberName}님이 ${achievement}`,
  type: 'achievement',
});
