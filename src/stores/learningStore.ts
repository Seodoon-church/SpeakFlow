import { create } from 'zustand';
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

export const useLearningStore = create<LearningState>((set, get) => ({
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
}));

// 트랙 데이터 (초기 데이터)
export const TRACKS: Track[] = [
  {
    id: 'business' as TrackId,
    name: 'Business',
    description: '비즈니스 미팅, 협상, 출장 영어',
    icon: '💼',
    total_weeks: 12,
    color: '#3B82F6',
  },
  {
    id: 'beauty-tech' as TrackId,
    name: 'Beauty Tech Biz',
    description: '뷰티 디바이스, 바이어 미팅, 전시회',
    icon: '✨',
    total_weeks: 12,
    color: '#EC4899',
  },
  {
    id: 'academic' as TrackId,
    name: 'Academic',
    description: '학술 발표, Q&A, 학회 네트워킹',
    icon: '🎓',
    total_weeks: 12,
    color: '#8B5CF6',
  },
  {
    id: 'design' as TrackId,
    name: 'Design Biz',
    description: '디자인 PT, 클라이언트 소통',
    icon: '🎨',
    total_weeks: 12,
    color: '#F59E0B',
  },
  {
    id: 'beauty' as TrackId,
    name: 'Beauty Biz',
    description: '브랜드 PT, 마케팅, 트렌드 리포트',
    icon: '💄',
    total_weeks: 12,
    color: '#EF4444',
  },
];
