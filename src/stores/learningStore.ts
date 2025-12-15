import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Chunk, Scenario, LearningStep, DailyMission, Track, TrackId } from '@/types';

interface LearningState {
  // 트랙 데이터
  tracks: Track[];
  currentTrack: Track | null;

  // 오늘의 미션
  dailyMission: DailyMission | null;
  currentStep: LearningStep;

  // 학습 중인 청크
  currentChunks: Chunk[];
  currentChunkIndex: number;

  // 복습할 청크
  reviewChunks: Chunk[];

  // 현재 시나리오
  currentScenario: Scenario | null;

  // 학습 세션 상태
  sessionStartTime: number | null;
  chunksLearnedToday: number;
  chunksReviewedToday: number;

  // Actions
  setTracks: (tracks: Track[]) => void;
  setCurrentTrack: (track: Track | null) => void;
  setDailyMission: (mission: DailyMission | null) => void;
  setCurrentStep: (step: LearningStep) => void;
  setCurrentChunks: (chunks: Chunk[]) => void;
  nextChunk: () => void;
  previousChunk: () => void;
  setReviewChunks: (chunks: Chunk[]) => void;
  setCurrentScenario: (scenario: Scenario | null) => void;
  startSession: () => void;
  endSession: () => { duration: number; chunksLearned: number; chunksReviewed: number };
  incrementChunksLearned: () => void;
  incrementChunksReviewed: () => void;
  completeStep: (step: LearningStep) => void;
  resetDailyProgress: () => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      tracks: [],
      currentTrack: null,
      dailyMission: null,
      currentStep: 'warmup',
      currentChunks: [],
      currentChunkIndex: 0,
      reviewChunks: [],
      currentScenario: null,
      sessionStartTime: null,
      chunksLearnedToday: 0,
      chunksReviewedToday: 0,

      setTracks: (tracks) => set({ tracks }),

      setCurrentTrack: (track) => set({ currentTrack: track }),

      setDailyMission: (mission) => set({ dailyMission: mission }),

      setCurrentStep: (step) => set({ currentStep: step }),

      setCurrentChunks: (chunks) => set({ currentChunks: chunks, currentChunkIndex: 0 }),

      nextChunk: () => {
        const { currentChunkIndex, currentChunks } = get();
        if (currentChunkIndex < currentChunks.length - 1) {
          set({ currentChunkIndex: currentChunkIndex + 1 });
        }
      },

      previousChunk: () => {
        const { currentChunkIndex } = get();
        if (currentChunkIndex > 0) {
          set({ currentChunkIndex: currentChunkIndex - 1 });
        }
      },

      setReviewChunks: (chunks) => set({ reviewChunks: chunks }),

      setCurrentScenario: (scenario) => set({ currentScenario: scenario }),

      startSession: () => set({ sessionStartTime: Date.now() }),

      endSession: () => {
        const { sessionStartTime, chunksLearnedToday, chunksReviewedToday } = get();
        const duration = sessionStartTime
          ? Math.round((Date.now() - sessionStartTime) / 60000)
          : 0;

        set({ sessionStartTime: null });

        return {
          duration,
          chunksLearned: chunksLearnedToday,
          chunksReviewed: chunksReviewedToday,
        };
      },

      incrementChunksLearned: () =>
        set((state) => ({ chunksLearnedToday: state.chunksLearnedToday + 1 })),

      incrementChunksReviewed: () =>
        set((state) => ({ chunksReviewedToday: state.chunksReviewedToday + 1 })),

      completeStep: (step) => {
        const { dailyMission } = get();
        if (dailyMission) {
          set({
            dailyMission: {
              ...dailyMission,
              progress: {
                ...dailyMission.progress,
                [step]: true,
              },
            },
          });
        }
      },

      resetDailyProgress: () =>
        set({
          chunksLearnedToday: 0,
          chunksReviewedToday: 0,
          currentStep: 'warmup',
        }),
    }),
    {
      name: 'speakflow-learning',
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        chunksLearnedToday: state.chunksLearnedToday,
        chunksReviewedToday: state.chunksReviewedToday,
      }),
    }
  )
);

// 트랙 데이터 (초기 데이터)
export const TRACKS: Track[] = [
  // 가족 공용 - 기본 생활 영어
  {
    id: 'daily-life' as TrackId,
    name: '생활 영어',
    description: '일상에서 바로 쓰는 기본 회화',
    icon: '🏠',
    total_weeks: 12,
    color: '#10B981',
  },
  // 뷰티 디바이스 비즈니스 (아내용)
  {
    id: 'beauty-tech' as TrackId,
    name: 'Beauty Tech Biz',
    description: '뷰티 디바이스 소개, 바이어 미팅, 전시회 영업',
    icon: '✨',
    total_weeks: 12,
    color: '#EC4899',
  },
  // 일반 비즈니스
  {
    id: 'business' as TrackId,
    name: 'Business',
    description: '비즈니스 미팅, 협상, 출장 영어',
    icon: '💼',
    total_weeks: 12,
    color: '#3B82F6',
  },
  // 학생/학술용 (공인영어 + 대학원 준비)
  {
    id: 'academic' as TrackId,
    name: 'Academic English',
    description: 'TOEFL/IELTS 스피킹, 박사 인터뷰, 학술 발표',
    icon: '🎓',
    total_weeks: 16,
    color: '#8B5CF6',
  },
  // 여행 영어
  {
    id: 'travel' as TrackId,
    name: 'Travel',
    description: '여행, 공항, 호텔, 관광지 회화',
    icon: '✈️',
    total_weeks: 8,
    color: '#F59E0B',
  },
  // 키즈 영어
  {
    id: 'kids' as TrackId,
    name: 'Kids English',
    description: '아이들을 위한 기초 영어 표현',
    icon: '🧒',
    total_weeks: 12,
    color: '#06B6D4',
  },
  // 화장품 기획/마케팅
  {
    id: 'cosmetics' as TrackId,
    name: 'Cosmetics Marketing',
    description: '화장품 기획, 마케팅, 브랜드 전략',
    icon: '💄',
    total_weeks: 12,
    color: '#F472B6',
  },
  // 베이커리 카페 영어
  {
    id: 'bakery-cafe' as TrackId,
    name: 'Bakery & Cafe',
    description: '베이커리 카페에서 외국인 응대 회화',
    icon: '🥐',
    total_weeks: 10,
    color: '#D97706',
  },
];
