import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 저장된 대화 세션
export interface SavedChatSession {
  id: string;
  title: string;
  mode: 'freetalk' | 'scenario' | 'simulation';
  language: string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
  duration?: number; // 대화 시간 (초)
  scenario?: {
    title: string;
    description: string;
  };
}

// 레벨 테스트 결과
export interface LevelTestResult {
  id: string;
  language: string;
  level: string;
  scores: {
    vocabulary: number;
    grammar: number;
    listening: number;
    speaking: number;
  };
  feedback?: string;
  testedAt: string;
}

// 게이미피케이션 데이터
export interface GamificationData {
  xp: number;
  level: number;
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string | null;
  };
  badges: {
    id: string;
    name: string;
    earnedAt: string;
  }[];
  dailyXp: number;
  dailyGoalXp: number;
  weeklyStats: {
    weekStart: string;
    xpEarned: number;
    daysActive: number;
    sessionsCompleted: number;
  };
}

interface ChatHistoryState {
  // 대화 기록
  chatSessions: SavedChatSession[];

  // 레벨 테스트 결과
  levelTestResults: LevelTestResult[];
  currentLevel: { [lang: string]: string }; // 언어별 현재 레벨

  // 게이미피케이션
  gamification: GamificationData;

  // 대화 기록 액션
  saveSession: (session: Omit<SavedChatSession, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateSession: (id: string, updates: Partial<SavedChatSession>) => void;
  deleteSession: (id: string) => void;
  getSessionsByMode: (mode: SavedChatSession['mode']) => SavedChatSession[];
  getRecentSessions: (limit?: number) => SavedChatSession[];

  // 레벨 테스트 액션
  saveLevelTestResult: (result: Omit<LevelTestResult, 'id' | 'testedAt'>) => void;
  getLatestLevelForLanguage: (language: string) => LevelTestResult | null;

  // 게이미피케이션 액션
  addXp: (amount: number, reason?: string) => void;
  checkAndUpdateStreak: () => void;
  earnBadge: (badgeId: string, badgeName: string) => void;
  resetDailyXp: () => void;
}

// 배지 정의
const BADGES = {
  'first-chat': '첫 대화',
  'streak-7': '7일 연속 학습',
  'streak-30': '30일 연속 학습',
  'xp-100': 'XP 100 달성',
  'xp-500': 'XP 500 달성',
  'xp-1000': 'XP 1000 달성',
  'level-test': '첫 레벨 테스트',
  'simulation-10': '시뮬레이션 10회',
  'freetalk-master': '프리토킹 달인',
};

// XP로 레벨 계산
function calculateLevel(xp: number): number {
  // 레벨당 필요 XP: 100, 200, 300, ...
  let level = 1;
  let requiredXp = 100;
  let totalRequired = 0;

  while (totalRequired + requiredXp <= xp) {
    totalRequired += requiredXp;
    level++;
    requiredXp = level * 100;
  }

  return level;
}

// 오늘 날짜 문자열
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// 주 시작일 계산
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export const useChatHistoryStore = create<ChatHistoryState>()(
  persist(
    (set, get) => ({
      chatSessions: [],
      levelTestResults: [],
      currentLevel: {},
      gamification: {
        xp: 0,
        level: 1,
        streak: {
          current: 0,
          longest: 0,
          lastActiveDate: null,
        },
        badges: [],
        dailyXp: 0,
        dailyGoalXp: 50,
        weeklyStats: {
          weekStart: getWeekStart(),
          xpEarned: 0,
          daysActive: 0,
          sessionsCompleted: 0,
        },
      },

      // 대화 세션 저장
      saveSession: (session) => {
        const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        const newSession: SavedChatSession = {
          ...session,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          chatSessions: [newSession, ...state.chatSessions],
        }));

        // 첫 대화 배지 확인
        const { chatSessions, earnBadge, addXp } = get();
        if (chatSessions.length === 1) {
          earnBadge('first-chat', BADGES['first-chat']);
        }

        // XP 추가 (대화 완료)
        addXp(30, '대화 완료');

        return id;
      },

      // 세션 업데이트
      updateSession: (id, updates) => {
        set((state) => ({
          chatSessions: state.chatSessions.map((s) =>
            s.id === id
              ? { ...s, ...updates, updatedAt: new Date().toISOString() }
              : s
          ),
        }));
      },

      // 세션 삭제
      deleteSession: (id) => {
        set((state) => ({
          chatSessions: state.chatSessions.filter((s) => s.id !== id),
        }));
      },

      // 모드별 세션 조회
      getSessionsByMode: (mode) => {
        return get().chatSessions.filter((s) => s.mode === mode);
      },

      // 최근 세션 조회
      getRecentSessions: (limit = 10) => {
        return get().chatSessions.slice(0, limit);
      },

      // 레벨 테스트 결과 저장
      saveLevelTestResult: (result) => {
        const id = `level-${Date.now()}`;
        const testedAt = new Date().toISOString();

        const newResult: LevelTestResult = {
          ...result,
          id,
          testedAt,
        };

        set((state) => ({
          levelTestResults: [newResult, ...state.levelTestResults],
          currentLevel: {
            ...state.currentLevel,
            [result.language]: result.level,
          },
        }));

        // 첫 레벨 테스트 배지
        const { levelTestResults, earnBadge, addXp } = get();
        if (levelTestResults.length === 1) {
          earnBadge('level-test', BADGES['level-test']);
        }

        // XP 추가
        addXp(50, '레벨 테스트 완료');
      },

      // 특정 언어의 최신 레벨 조회
      getLatestLevelForLanguage: (language) => {
        const results = get().levelTestResults.filter(
          (r) => r.language === language
        );
        return results.length > 0 ? results[0] : null;
      },

      // XP 추가
      addXp: (amount, _reason) => {
        set((state) => {
          const newXp = state.gamification.xp + amount;
          const newLevel = calculateLevel(newXp);
          const newDailyXp = state.gamification.dailyXp + amount;

          // 주간 통계 업데이트
          const currentWeekStart = getWeekStart();
          let weeklyStats = state.gamification.weeklyStats;

          if (weeklyStats.weekStart !== currentWeekStart) {
            // 새로운 주 시작
            weeklyStats = {
              weekStart: currentWeekStart,
              xpEarned: amount,
              daysActive: 1,
              sessionsCompleted: 1,
            };
          } else {
            weeklyStats = {
              ...weeklyStats,
              xpEarned: weeklyStats.xpEarned + amount,
              sessionsCompleted: weeklyStats.sessionsCompleted + 1,
            };
          }

          return {
            gamification: {
              ...state.gamification,
              xp: newXp,
              level: newLevel,
              dailyXp: newDailyXp,
              weeklyStats,
            },
          };
        });

        // XP 배지 체크
        const { gamification, earnBadge } = get();
        if (gamification.xp >= 100 && !gamification.badges.find(b => b.id === 'xp-100')) {
          earnBadge('xp-100', BADGES['xp-100']);
        }
        if (gamification.xp >= 500 && !gamification.badges.find(b => b.id === 'xp-500')) {
          earnBadge('xp-500', BADGES['xp-500']);
        }
        if (gamification.xp >= 1000 && !gamification.badges.find(b => b.id === 'xp-1000')) {
          earnBadge('xp-1000', BADGES['xp-1000']);
        }
      },

      // 스트릭 체크 및 업데이트
      checkAndUpdateStreak: () => {
        const today = getTodayString();

        set((state) => {
          const { lastActiveDate, current, longest } = state.gamification.streak;

          if (lastActiveDate === today) {
            // 오늘 이미 활동함
            return state;
          }

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toISOString().split('T')[0];

          let newStreak = 1;
          if (lastActiveDate === yesterdayString) {
            // 어제 활동했으면 스트릭 증가
            newStreak = current + 1;
          }

          const newLongest = Math.max(longest, newStreak);

          return {
            gamification: {
              ...state.gamification,
              streak: {
                current: newStreak,
                longest: newLongest,
                lastActiveDate: today,
              },
            },
          };
        });

        // 스트릭 배지 체크
        const { gamification, earnBadge } = get();
        if (gamification.streak.current >= 7 && !gamification.badges.find(b => b.id === 'streak-7')) {
          earnBadge('streak-7', BADGES['streak-7']);
        }
        if (gamification.streak.current >= 30 && !gamification.badges.find(b => b.id === 'streak-30')) {
          earnBadge('streak-30', BADGES['streak-30']);
        }
      },

      // 배지 획득
      earnBadge: (badgeId, badgeName) => {
        set((state) => {
          // 이미 가진 배지면 무시
          if (state.gamification.badges.find((b) => b.id === badgeId)) {
            return state;
          }

          return {
            gamification: {
              ...state.gamification,
              badges: [
                ...state.gamification.badges,
                {
                  id: badgeId,
                  name: badgeName,
                  earnedAt: new Date().toISOString(),
                },
              ],
            },
          };
        });
      },

      // 일일 XP 리셋 (자정에 호출)
      resetDailyXp: () => {
        set((state) => ({
          gamification: {
            ...state.gamification,
            dailyXp: 0,
          },
        }));
      },
    }),
    {
      name: 'speakflow-history',
      version: 1,
    }
  )
);
