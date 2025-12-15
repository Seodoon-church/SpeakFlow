// 학습 언어 타입
export type LearningLanguage = 'en' | 'ja' | 'zh';

export interface LanguageInfo {
  id: LearningLanguage;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string; // Web Speech API 언어 코드
  ttsVoice?: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { id: 'en', name: '영어', nativeName: 'English', flag: '🇺🇸', speechCode: 'en-US' },
  { id: 'ja', name: '일본어', nativeName: '日本語', flag: '🇯🇵', speechCode: 'ja-JP' },
  { id: 'zh', name: '중국어', nativeName: '中文', flag: '🇨🇳', speechCode: 'zh-CN' },
];

// 사용자 관련 타입
export interface User {
  id: string;
  email: string;
  name: string;
  track_id: string;
  daily_goal_minutes: number;
  streak_days: number;
  family_id?: string;
  created_at: string;
  updated_at?: string;
}

// 학습 트랙 타입
export type TrackId = 'daily-life' | 'beauty-tech' | 'business' | 'academic' | 'travel' | 'kids' | 'cosmetics' | 'bakery-cafe';

export interface Track {
  id: TrackId;
  name: string;
  description: string;
  icon: string;
  total_weeks: number;
  color: string;
}

// 가족 그룹
export interface Family {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

// 청크/표현
export interface Chunk {
  id: string;
  track_id: TrackId;
  week: number;
  day: number;
  expression: string;
  meaning: string;
  pronunciation?: string;
  audio_url?: string;
  example_sentence: string;
  example_translation: string;
  tips?: string;
}

// 학습 진도
export interface UserProgress {
  id: string;
  user_id: string;
  chunk_id: string;
  proficiency: 1 | 2 | 3 | 4 | 5;
  next_review_at: string;
  review_count: number;
  last_reviewed_at?: string;
  created_at: string;
}

// 시나리오
export interface Scenario {
  id: string;
  track_id: TrackId;
  week: number;
  title: string;
  description: string;
  situation: string;
  system_prompt: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_minutes: number;
}

// 학습 세션
export interface LearningSession {
  id: string;
  user_id: string;
  date: string;
  duration_minutes: number;
  chunks_learned: number;
  chunks_reviewed: number;
  scenarios_completed: number;
  completed_steps: LearningStep[];
  created_at: string;
}

// 학습 단계
export type LearningStep = 'warmup' | 'chunk' | 'shadowing' | 'roleplay' | 'review';

// 일일 미션
export interface DailyMission {
  date: string;
  user_id: string;
  chunks_to_learn: Chunk[];
  chunks_to_review: Chunk[];
  scenario?: Scenario;
  completed: boolean;
  progress: {
    warmup: boolean;
    chunk: boolean;
    shadowing: boolean;
    roleplay: boolean;
    review: boolean;
  };
}

// SRS 복습 주기 (일 단위)
export const SRS_INTERVALS: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 1,   // 1일
  2: 3,   // 3일
  3: 7,   // 7일
  4: 14,  // 14일
  5: 30,  // 30일
};

// 배지
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  earned_at?: string;
}

// 학습 통계
export interface LearningStats {
  total_learning_time: number;
  total_chunks_learned: number;
  total_scenarios_completed: number;
  current_streak: number;
  longest_streak: number;
  weekly_stats: WeeklyStats[];
}

export interface WeeklyStats {
  week_start: string;
  total_minutes: number;
  chunks_learned: number;
  days_active: number;
}

// AI 대화 메시지
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  audio_url?: string;
}

// 음성 인식 결과
export interface SpeechResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

// 온보딩 상태
export interface OnboardingState {
  step: number;
  name: string;
  selectedTrack: TrackId | null;
  dailyGoal: number;
  completed: boolean;
}
