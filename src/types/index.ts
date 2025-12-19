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

// 획득한 배지
export interface EarnedBadge {
  id: string;
  earnedAt: string;
}

// 스트릭 데이터
export interface StreakData {
  current: number;
  longest: number;
  lastStudyDate: string | null;
}

// 주간 진행 상황
export interface WeeklyProgress {
  weekStart: string;
  xpEarned: number;
  daysActive: number;
  lessonsCompleted: number;
  minutesLearned: number;
}

// 멤버별 게이미피케이션 데이터
export interface MemberGamificationData {
  xp: number;
  level: number;
  streak: StreakData;
  badges: EarnedBadge[];
  weeklyProgress: WeeklyProgress;
  todayXp: number;
  dailyGoalXp: number;
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

// ========== 상황 시뮬레이션 관련 타입 ==========

// AI가 자동 생성하는 시나리오
export interface GeneratedScenario {
  background: string;           // 배경 설명 (예: "도쿄 지하철 역")
  backgroundId: string;         // UI 배경 매핑용 ID
  npcRole: string;              // NPC 역할 (예: "역무원")
  npcName: string;              // NPC 이름 (예: "田中さん")
  userGoal: string;             // 사용자 목표 (예: "신주쿠역 가는 방법 묻기")
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;             // 대상 언어 코드
  suggestedExpressions: string[]; // 힌트로 제공할 표현들
  openingLine: string;          // NPC의 첫 대사
  openingLineTranslation: string; // 첫 대사 한글 번역
}

// 시뮬레이션 컨텍스트
export interface SimulationContext {
  id: string;
  userInput: string;            // 사용자가 입력한 상황 설명
  generatedScenario: GeneratedScenario;
  startedAt: Date;
  endedAt?: Date;
}

// 시뮬레이션 완료 후 피드백
export interface SimulationFeedback {
  overallScore: number;         // 0-100
  grammarScore: number;
  naturalityScore: number;
  wellDonePoints: string[];     // 잘한 점
  improvementPoints: string[];  // 개선점
  additionalExpressions: string[]; // 추가로 쓸 수 있는 표현
}

// 실시간 피드백 (대화 중)
export interface RealTimeFeedback {
  grammarCorrection?: string;   // 문법 교정
  naturalExpression?: string;   // 더 자연스러운 표현
  tip?: string;                 // 상황별 팁
}
