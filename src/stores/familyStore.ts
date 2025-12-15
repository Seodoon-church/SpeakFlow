import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TrackId } from '@/types';

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string; // emoji
  trackId: TrackId; // 메인 트랙
  secondaryTracks?: TrackId[]; // 추가 학습 트랙
  dailyGoalMinutes: number;
  streakDays: number;
  totalMinutesLearned: number;
  chunksLearned: number;
  lastActiveDate: string | null;
  createdAt: string;
}

interface FamilyState {
  members: FamilyMember[];
  currentMemberId: string | null;

  // Actions
  addMember: (member: Omit<FamilyMember, 'id' | 'createdAt' | 'streakDays' | 'totalMinutesLearned' | 'chunksLearned' | 'lastActiveDate'>) => void;
  updateMember: (id: string, updates: Partial<FamilyMember>) => void;
  removeMember: (id: string) => void;
  setCurrentMember: (id: string) => void;
  getCurrentMember: () => FamilyMember | null;
  recordActivity: (memberId: string, minutes: number, chunks: number) => void;
}

// 기본 가족 구성원
const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'member-david',
    name: 'David',
    avatar: '👨',
    trackId: 'business',
    secondaryTracks: ['travel'], // 비즈니스 + 여행
    dailyGoalMinutes: 15,
    streakDays: 7,
    totalMinutesLearned: 120,
    chunksLearned: 24,
    lastActiveDate: new Date().toISOString().split('T')[0],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'member-tina',
    name: 'Tina',
    avatar: '👩',
    trackId: 'beauty-tech',
    secondaryTracks: [],
    dailyGoalMinutes: 20,
    streakDays: 5,
    totalMinutesLearned: 90,
    chunksLearned: 18,
    lastActiveDate: new Date().toISOString().split('T')[0],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'member-dani',
    name: 'Dani',
    avatar: '👦',
    trackId: 'academic',
    secondaryTracks: [],
    dailyGoalMinutes: 20,
    streakDays: 3,
    totalMinutesLearned: 45,
    chunksLearned: 12,
    lastActiveDate: new Date().toISOString().split('T')[0],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'member-mune',
    name: 'Mune',
    avatar: '👧',
    trackId: 'travel',
    secondaryTracks: [],
    dailyGoalMinutes: 15,
    streakDays: 4,
    totalMinutesLearned: 60,
    chunksLearned: 15,
    lastActiveDate: new Date().toISOString().split('T')[0],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'member-jolie',
    name: 'Jolie',
    avatar: '👩‍🦰',
    trackId: 'cosmetics',
    secondaryTracks: [],
    dailyGoalMinutes: 15,
    streakDays: 0,
    totalMinutesLearned: 0,
    chunksLearned: 0,
    lastActiveDate: null,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      members: DEFAULT_FAMILY_MEMBERS,
      currentMemberId: 'member-david',

      addMember: (member) => {
        const newMember: FamilyMember = {
          ...member,
          id: `member-${Date.now()}`,
          streakDays: 0,
          totalMinutesLearned: 0,
          chunksLearned: 0,
          lastActiveDate: null,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          members: [...state.members, newMember],
          currentMemberId: state.currentMemberId || newMember.id,
        }));
      },

      updateMember: (id, updates) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
      },

      removeMember: (id) => {
        set((state) => {
          const newMembers = state.members.filter((m) => m.id !== id);
          return {
            members: newMembers,
            currentMemberId:
              state.currentMemberId === id
                ? newMembers[0]?.id || null
                : state.currentMemberId,
          };
        });
      },

      setCurrentMember: (id) => {
        set({ currentMemberId: id });
      },

      getCurrentMember: () => {
        const { members, currentMemberId } = get();
        return members.find((m) => m.id === currentMemberId) || null;
      },

      recordActivity: (memberId, minutes, chunks) => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => ({
          members: state.members.map((m) => {
            if (m.id !== memberId) return m;

            // 연속 학습일 계산
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            let newStreak = m.streakDays;
            if (m.lastActiveDate === yesterdayStr) {
              newStreak = m.streakDays + 1;
            } else if (m.lastActiveDate !== today) {
              newStreak = 1;
            }

            return {
              ...m,
              totalMinutesLearned: m.totalMinutesLearned + minutes,
              chunksLearned: m.chunksLearned + chunks,
              streakDays: newStreak,
              lastActiveDate: today,
            };
          }),
        }));
      },
    }),
    {
      name: 'speakflow-family',
      version: 4,
      migrate: (persistedState: unknown, version: number) => {
        if (version < 4) {
          // 버전 4: secondaryTracks 추가, David에 travel 추가
          return {
            members: DEFAULT_FAMILY_MEMBERS,
            currentMemberId: 'member-david',
          };
        }
        return persistedState as FamilyState;
      },
    }
  )
);

// 기본 아바타 이모지 목록
export const AVATAR_EMOJIS = ['👨', '👩', '👦', '👧', '👴', '👵', '🧑', '👶'];
