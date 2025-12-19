import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// AI 튜터 타입
export interface AITutor {
  id: string;
  name: string;
  nameKo: string;
  personality: 'friendly' | 'strict' | 'encouraging' | 'professional' | 'playful';
  avatar: string;
  description: string;
  descriptionKo: string;
  style: string; // AI 대화 스타일 설명
  color: string;
  level: number;
  xp: number;
  sessionsCompleted: number;
}

// 5분 학습 세션
export interface QuickSession {
  id: string;
  tutorId: string;
  mode: 'standard' | 'subway' | 'speaking';
  wordsLearned: number;
  sentencesPracticed: number;
  conversationTurns: number;
  duration: number; // seconds
  xpEarned: number;
  createdAt: string;
}

// 실수 기록
export interface MistakeRecord {
  id: string;
  type: 'grammar' | 'vocabulary' | 'pronunciation' | 'spelling';
  original: string;
  corrected: string;
  explanation: string;
  context: string;
  category: string;
  reviewCount: number;
  mastered: boolean;
  createdAt: string;
  lastReviewedAt: string | null;
}

// AI 튜터 목록
export const AI_TUTORS: AITutor[] = [
  {
    id: 'emma',
    name: 'Emma',
    nameKo: '엠마',
    personality: 'friendly',
    avatar: '👩‍🏫',
    description: 'Warm and patient, perfect for beginners',
    descriptionKo: '따뜻하고 인내심 있는 튜터, 초보자에게 완벽',
    style: 'You are Emma, a warm and friendly English tutor. Be patient, use simple words, give lots of encouragement, and explain things gently. Use emojis occasionally.',
    color: 'from-pink-500 to-rose-500',
    level: 1,
    xp: 0,
    sessionsCompleted: 0,
  },
  {
    id: 'james',
    name: 'James',
    nameKo: '제임스',
    personality: 'strict',
    avatar: '👨‍💼',
    description: 'Professional and thorough, focuses on accuracy',
    descriptionKo: '전문적이고 철저함, 정확성에 집중',
    style: 'You are James, a professional and strict English tutor. Focus on grammatical accuracy, correct mistakes immediately, and maintain high standards. Be direct but respectful.',
    color: 'from-gray-700 to-gray-900',
    level: 1,
    xp: 0,
    sessionsCompleted: 0,
  },
  {
    id: 'sophia',
    name: 'Sophia',
    nameKo: '소피아',
    personality: 'encouraging',
    avatar: '👩‍🎓',
    description: 'Motivating and positive, celebrates every progress',
    descriptionKo: '동기 부여와 긍정, 모든 발전을 축하',
    style: 'You are Sophia, an encouraging and positive English tutor. Celebrate every small win, focus on progress over perfection, and motivate the student to keep trying. Use positive reinforcement.',
    color: 'from-amber-500 to-orange-500',
    level: 1,
    xp: 0,
    sessionsCompleted: 0,
  },
  {
    id: 'david',
    name: 'David',
    nameKo: '데이빗',
    personality: 'professional',
    avatar: '🧑‍💻',
    description: 'Business-focused, great for professional English',
    descriptionKo: '비즈니스 중심, 업무 영어에 탁월',
    style: 'You are David, a business English specialist. Focus on professional vocabulary, email etiquette, meeting language, and formal communication. Give practical business scenarios.',
    color: 'from-blue-600 to-indigo-700',
    level: 1,
    xp: 0,
    sessionsCompleted: 0,
  },
  {
    id: 'luna',
    name: 'Luna',
    nameKo: '루나',
    personality: 'playful',
    avatar: '🧚‍♀️',
    description: 'Fun and creative, uses games and stories',
    descriptionKo: '재미있고 창의적, 게임과 이야기 활용',
    style: 'You are Luna, a playful and creative English tutor. Use games, riddles, fun examples, and storytelling. Make learning feel like an adventure. Be enthusiastic and imaginative.',
    color: 'from-purple-500 to-pink-500',
    level: 1,
    xp: 0,
    sessionsCompleted: 0,
  },
];

// 5분 학습 단어 (빠른 학습용)
export const QUICK_WORDS = [
  { word: 'accomplish', meaning: '성취하다', example: 'I want to accomplish my goals.' },
  { word: 'beneficial', meaning: '유익한', example: 'Exercise is beneficial for health.' },
  { word: 'collaborate', meaning: '협력하다', example: 'Let\'s collaborate on this project.' },
  { word: 'demonstrate', meaning: '보여주다', example: 'Can you demonstrate how it works?' },
  { word: 'efficient', meaning: '효율적인', example: 'This method is more efficient.' },
  { word: 'flexible', meaning: '유연한', example: 'We need a flexible schedule.' },
  { word: 'generate', meaning: '생성하다', example: 'This will generate more revenue.' },
  { word: 'hesitate', meaning: '망설이다', example: 'Don\'t hesitate to ask questions.' },
  { word: 'implement', meaning: '실행하다', example: 'We will implement the new system.' },
  { word: 'justify', meaning: '정당화하다', example: 'Can you justify your decision?' },
  { word: 'maintain', meaning: '유지하다', example: 'Maintain a positive attitude.' },
  { word: 'negotiate', meaning: '협상하다', example: 'Let\'s negotiate the terms.' },
  { word: 'obtain', meaning: '얻다', example: 'How can I obtain a visa?' },
  { word: 'participate', meaning: '참여하다', example: 'Everyone should participate.' },
  { word: 'recommend', meaning: '추천하다', example: 'I recommend this restaurant.' },
  { word: 'significant', meaning: '중요한', example: 'This is a significant change.' },
  { word: 'temporary', meaning: '일시적인', example: 'This is only temporary.' },
  { word: 'ultimate', meaning: '궁극적인', example: 'What is your ultimate goal?' },
  { word: 'valid', meaning: '유효한', example: 'Is this ticket still valid?' },
  { word: 'widespread', meaning: '널리 퍼진', example: 'The problem is widespread.' },
];

// 5분 학습 문장 패턴
export const QUICK_SENTENCES = [
  { pattern: 'I would like to...', example: 'I would like to schedule a meeting.', meaning: '~하고 싶습니다' },
  { pattern: 'Could you please...?', example: 'Could you please send me the report?', meaning: '~해 주시겠어요?' },
  { pattern: 'I\'m looking forward to...', example: 'I\'m looking forward to working with you.', meaning: '~을 기대하고 있습니다' },
  { pattern: 'Would it be possible to...?', example: 'Would it be possible to reschedule?', meaning: '~이 가능할까요?' },
  { pattern: 'I appreciate your...', example: 'I appreciate your help.', meaning: '~에 감사드립니다' },
  { pattern: 'Let me know if...', example: 'Let me know if you have any questions.', meaning: '~하면 알려주세요' },
  { pattern: 'I\'m sorry for...', example: 'I\'m sorry for the inconvenience.', meaning: '~해서 죄송합니다' },
  { pattern: 'As far as I know...', example: 'As far as I know, the meeting is at 3 PM.', meaning: '제가 알기로는...' },
  { pattern: 'In terms of...', example: 'In terms of cost, this option is better.', meaning: '~면에서' },
  { pattern: 'I\'d suggest that...', example: 'I\'d suggest that we wait.', meaning: '~을 제안합니다' },
];

// 대화 시작 프롬프트
export const CONVERSATION_STARTERS = [
  { topic: '오늘 하루', prompt: 'How was your day today?' },
  { topic: '주말 계획', prompt: 'Do you have any plans for the weekend?' },
  { topic: '취미', prompt: 'What do you like to do in your free time?' },
  { topic: '음식', prompt: 'What\'s your favorite food?' },
  { topic: '여행', prompt: 'Have you traveled anywhere interesting recently?' },
  { topic: '일/공부', prompt: 'How is work/school going?' },
  { topic: '날씨', prompt: 'Nice weather today, isn\'t it?' },
  { topic: '영화/드라마', prompt: 'Have you watched any good movies lately?' },
];

interface QuickLearnState {
  currentTutor: AITutor | null;
  tutors: AITutor[];
  sessions: QuickSession[];
  mistakes: MistakeRecord[];

  // 통계
  stats: {
    totalSessions: number;
    totalMinutes: number;
    wordsLearned: number;
    sentencesPracticed: number;
    conversationTurns: number;
    currentStreak: number;
    longestStreak: number;
  };

  // Actions
  setCurrentTutor: (tutorId: string) => void;
  addSession: (session: Omit<QuickSession, 'id' | 'createdAt'>) => void;
  updateTutorXp: (tutorId: string, xp: number) => void;
  addMistake: (mistake: Omit<MistakeRecord, 'id' | 'createdAt' | 'reviewCount' | 'mastered' | 'lastReviewedAt'>) => void;
  reviewMistake: (mistakeId: string, mastered: boolean) => void;
  getMistakesByType: (type: MistakeRecord['type']) => MistakeRecord[];
  getUnmasteredMistakes: () => MistakeRecord[];
  getTodaysSessions: () => QuickSession[];
}

export const useQuickLearnStore = create<QuickLearnState>()(
  persist(
    (set, get) => ({
      currentTutor: AI_TUTORS[0],
      tutors: AI_TUTORS,
      sessions: [],
      mistakes: [],
      stats: {
        totalSessions: 0,
        totalMinutes: 0,
        wordsLearned: 0,
        sentencesPracticed: 0,
        conversationTurns: 0,
        currentStreak: 0,
        longestStreak: 0,
      },

      setCurrentTutor: (tutorId) => {
        const tutor = get().tutors.find(t => t.id === tutorId);
        if (tutor) {
          set({ currentTutor: tutor });
        }
      },

      addSession: (session) => {
        const newSession: QuickSession = {
          ...session,
          id: `qs_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const newSessions = [...state.sessions, newSession];
          return {
            sessions: newSessions,
            stats: {
              ...state.stats,
              totalSessions: newSessions.length,
              totalMinutes: state.stats.totalMinutes + Math.floor(session.duration / 60),
              wordsLearned: state.stats.wordsLearned + session.wordsLearned,
              sentencesPracticed: state.stats.sentencesPracticed + session.sentencesPracticed,
              conversationTurns: state.stats.conversationTurns + session.conversationTurns,
            },
          };
        });
      },

      updateTutorXp: (tutorId, xp) => {
        set((state) => {
          const newTutors = state.tutors.map(t => {
            if (t.id === tutorId) {
              const newXp = t.xp + xp;
              const newLevel = Math.floor(newXp / 100) + 1;
              return {
                ...t,
                xp: newXp,
                level: newLevel,
                sessionsCompleted: t.sessionsCompleted + 1,
              };
            }
            return t;
          });

          const currentTutor = state.currentTutor?.id === tutorId
            ? newTutors.find(t => t.id === tutorId) || state.currentTutor
            : state.currentTutor;

          return { tutors: newTutors, currentTutor };
        });
      },

      addMistake: (mistake) => {
        const newMistake: MistakeRecord = {
          ...mistake,
          id: `mk_${Date.now()}`,
          createdAt: new Date().toISOString(),
          reviewCount: 0,
          mastered: false,
          lastReviewedAt: null,
        };

        set((state) => ({
          mistakes: [...state.mistakes, newMistake],
        }));
      },

      reviewMistake: (mistakeId, mastered) => {
        set((state) => ({
          mistakes: state.mistakes.map(m =>
            m.id === mistakeId
              ? {
                  ...m,
                  reviewCount: m.reviewCount + 1,
                  mastered,
                  lastReviewedAt: new Date().toISOString(),
                }
              : m
          ),
        }));
      },

      getMistakesByType: (type) => {
        return get().mistakes.filter(m => m.type === type);
      },

      getUnmasteredMistakes: () => {
        return get().mistakes.filter(m => !m.mastered);
      },

      getTodaysSessions: () => {
        const today = new Date().toDateString();
        return get().sessions.filter(s =>
          new Date(s.createdAt).toDateString() === today
        );
      },
    }),
    {
      name: 'quick-learn-storage',
    }
  )
);

// 튜터 레벨에 따른 XP 요구량
export function getXpForTutorLevel(level: number): number {
  return level * 100;
}

// 튜터 레벨 진행률
export function getTutorLevelProgress(tutor: AITutor): number {
  const currentLevelXp = (tutor.level - 1) * 100;
  const nextLevelXp = tutor.level * 100;
  return ((tutor.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
}
