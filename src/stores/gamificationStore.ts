import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// =====================
// XP & Level Calculation
// =====================
export const calculateLevel = (xp: number): number => {
  // 레벨업에 필요한 XP: level * 100
  // 레벨 1: 0-99, 레벨 2: 100-299, 레벨 3: 300-599, ...
  let level = 1;
  let totalXpNeeded = 0;
  while (totalXpNeeded + level * 100 <= xp) {
    totalXpNeeded += level * 100;
    level++;
  }
  return level;
};

export const getXpForNextLevel = (level: number): number => level * 100;

export const getCurrentLevelXp = (xp: number): number => {
  let level = 1;
  let totalXpNeeded = 0;
  while (totalXpNeeded + level * 100 <= xp) {
    totalXpNeeded += level * 100;
    level++;
  }
  return xp - totalXpNeeded;
};

export const getXpProgress = (xp: number): { current: number; required: number; percentage: number } => {
  const level = calculateLevel(xp);
  const currentLevelXp = getCurrentLevelXp(xp);
  const requiredXp = getXpForNextLevel(level);
  return {
    current: currentLevelXp,
    required: requiredXp,
    percentage: Math.round((currentLevelXp / requiredXp) * 100),
  };
};

// =====================
// Badge Definitions
// =====================
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: 'first_lesson',
    name: '첫 발걸음',
    description: '첫 학습을 완료했습니다!',
    icon: '🎯',
    condition: 'complete_first_lesson'
  },
  {
    id: 'streak_3',
    name: '3일 연속',
    description: '3일 연속 학습 달성!',
    icon: '🔥',
    condition: 'streak_3'
  },
  {
    id: 'streak_7',
    name: '일주일 전사',
    description: '7일 연속 학습 달성!',
    icon: '⚔️',
    condition: 'streak_7'
  },
  {
    id: 'streak_30',
    name: '한 달 마스터',
    description: '30일 연속 학습 달성!',
    icon: '👑',
    condition: 'streak_30'
  },
  {
    id: 'xp_500',
    name: 'XP 헌터',
    description: '500 XP 달성!',
    icon: '⚡',
    condition: 'xp_500'
  },
  {
    id: 'xp_1000',
    name: 'XP 수집가',
    description: '1000 XP 달성!',
    icon: '💎',
    condition: 'xp_1000'
  },
  {
    id: 'xp_5000',
    name: 'XP 마스터',
    description: '5000 XP 달성!',
    icon: '🏆',
    condition: 'xp_5000'
  },
  {
    id: 'level_5',
    name: '떠오르는 별',
    description: '레벨 5 달성!',
    icon: '⭐',
    condition: 'level_5'
  },
  {
    id: 'level_10',
    name: '영어 탐험가',
    description: '레벨 10 달성!',
    icon: '🌟',
    condition: 'level_10'
  },
  {
    id: 'chunks_50',
    name: '표현 수집가',
    description: '50개 표현 학습 완료!',
    icon: '📚',
    condition: 'chunks_50'
  },
  {
    id: 'chunks_100',
    name: '표현 마스터',
    description: '100개 표현 학습 완료!',
    icon: '📖',
    condition: 'chunks_100'
  },
  {
    id: 'early_bird',
    name: '얼리버드',
    description: '오전 7시 이전에 학습 완료!',
    icon: '🐦',
    condition: 'early_bird'
  },
  {
    id: 'night_owl',
    name: '올빼미',
    description: '밤 10시 이후에 학습 완료!',
    icon: '🦉',
    condition: 'night_owl'
  },
  {
    id: 'perfect_week',
    name: '완벽한 한 주',
    description: '주간 목표 100% 달성!',
    icon: '🎖️',
    condition: 'perfect_week'
  },
  {
    id: 'family_leader',
    name: '가족 리더',
    description: '이번 주 가족 중 1등!',
    icon: '👪',
    condition: 'family_leader'
  },
];

// =====================
// Encouragement Messages
// =====================
export const ENCOURAGEMENTS = {
  correct: [
    "정확해요! 🎉",
    "완벽해요! ⭐",
    "멋져요! 계속 가세요! 💪",
    "대단해요! 🔥",
    "훌륭한 발전이에요! 🌟",
    "점점 나아지고 있어요! 📈",
    "환상적이에요! 👏",
    "잘했어요! 🎯",
  ],
  incorrect: [
    "거의 다 왔어요! 다시 도전해보세요 💪",
    "좋은 시도예요! 힌트를 드릴게요... 💡",
    "괜찮아요, 배움에는 시간이 필요해요! 🌱",
    "여전히 발전하고 있어요! 📈",
    "함께 살펴볼까요? 🤝",
    "실수는 성장의 발판이에요! 🚀",
    "천천히 해도 괜찮아요! ⏰",
    "다음에는 맞출 수 있어요! 🎯",
  ],
  streak: [
    "3일 연속! 대단해요! 🔥",
    "5일 연속! 최고예요! ⚡",
    "7일 연속! 일주일 완성! 🎖️",
    "10일 연속! 멈출 수 없어요! 🏆",
  ],
  levelUp: [
    "레벨 업! 🎊",
    "새로운 레벨 달성! 🌟",
    "성장하고 있어요! 🚀",
  ],
};

// =====================
// Store Types
// =====================
interface EarnedBadge {
  id: string;
  earnedAt: string;
}

interface StreakData {
  current: number;
  longest: number;
  lastStudyDate: string | null;
}

interface WeeklyProgress {
  weekStart: string;
  xpEarned: number;
  daysActive: number;
  lessonsCompleted: number;
  minutesLearned: number;
}

interface MemberGamificationData {
  xp: number;
  level: number;
  streak: StreakData;
  badges: EarnedBadge[];
  weeklyProgress: WeeklyProgress;
  todayXp: number;
  dailyGoalXp: number;
}

interface GamificationState {
  // 멤버별 게이미피케이션 데이터
  memberData: Record<string, MemberGamificationData>;

  // 주간 목표
  weeklyGoalXp: number;

  // 마지막으로 표시한 격려 메시지
  lastEncouragement: string;

  // Actions
  initMemberData: (memberId: string) => void;
  addXp: (memberId: string, amount: number) => void;
  updateStreak: (memberId: string) => void;
  earnBadge: (memberId: string, badgeId: string) => void;
  hasBadge: (memberId: string, badgeId: string) => boolean;
  checkAndAwardBadges: (memberId: string) => string[];
  getMemberData: (memberId: string) => MemberGamificationData;
  setDailyGoalXp: (memberId: string, xp: number) => void;
  setWeeklyGoalXp: (xp: number) => void;
  getEncouragement: (correct: boolean) => string;
  getStreakMessage: (streak: number) => string;
  resetWeeklyProgress: (memberId: string) => void;
  recordLearningSession: (memberId: string, xp: number, minutes: number) => void;

  // 가족 랭킹 관련
  getFamilyRanking: () => { memberId: string; xp: number; level: number }[];
  getWeeklyFamilyRanking: () => { memberId: string; weeklyXp: number }[];
}

// =====================
// Helper Functions
// =====================
const getTodayString = () => new Date().toISOString().split('T')[0];

const getWeekStart = (date: Date = new Date()): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 월요일 기준
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
};

const createDefaultMemberData = (): MemberGamificationData => ({
  xp: 0,
  level: 1,
  streak: { current: 0, longest: 0, lastStudyDate: null },
  badges: [],
  weeklyProgress: {
    weekStart: getWeekStart(),
    xpEarned: 0,
    daysActive: 0,
    lessonsCompleted: 0,
    minutesLearned: 0,
  },
  todayXp: 0,
  dailyGoalXp: 50,
});

// =====================
// Gamification Store
// =====================
export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      memberData: {},
      weeklyGoalXp: 300,
      lastEncouragement: '',

      initMemberData: (memberId) => {
        const { memberData } = get();
        if (!memberData[memberId]) {
          set({
            memberData: {
              ...memberData,
              [memberId]: createDefaultMemberData(),
            },
          });
        }
      },

      addXp: (memberId, amount) => {
        const { memberData, checkAndAwardBadges } = get();
        const data = memberData[memberId] || createDefaultMemberData();
        const today = getTodayString();
        const currentWeekStart = getWeekStart();

        // 주간 진행 상황 업데이트 (새 주인지 확인)
        let weeklyProgress = data.weeklyProgress;
        if (weeklyProgress.weekStart !== currentWeekStart) {
          weeklyProgress = {
            weekStart: currentWeekStart,
            xpEarned: 0,
            daysActive: 0,
            lessonsCompleted: 0,
            minutesLearned: 0,
          };
        }

        const newXp = data.xp + amount;
        const newLevel = calculateLevel(newXp);
        const newTodayXp = data.streak.lastStudyDate === today
          ? data.todayXp + amount
          : amount;

        set({
          memberData: {
            ...memberData,
            [memberId]: {
              ...data,
              xp: newXp,
              level: newLevel,
              todayXp: newTodayXp,
              weeklyProgress: {
                ...weeklyProgress,
                xpEarned: weeklyProgress.xpEarned + amount,
              },
            },
          },
        });

        // 배지 체크
        checkAndAwardBadges(memberId);
      },

      updateStreak: (memberId) => {
        const { memberData, checkAndAwardBadges } = get();
        const data = memberData[memberId] || createDefaultMemberData();
        const today = getTodayString();
        const lastDate = data.streak.lastStudyDate;

        if (lastDate === today) {
          return; // 오늘 이미 학습함
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        let newCurrent = 1;
        if (lastDate === yesterdayString) {
          newCurrent = data.streak.current + 1;
        }

        const newLongest = Math.max(data.streak.longest, newCurrent);

        // 주간 활동일 업데이트
        const currentWeekStart = getWeekStart();
        let weeklyProgress = data.weeklyProgress;
        if (weeklyProgress.weekStart !== currentWeekStart) {
          weeklyProgress = {
            weekStart: currentWeekStart,
            xpEarned: 0,
            daysActive: 0,
            lessonsCompleted: 0,
            minutesLearned: 0,
          };
        }

        set({
          memberData: {
            ...memberData,
            [memberId]: {
              ...data,
              streak: {
                current: newCurrent,
                longest: newLongest,
                lastStudyDate: today,
              },
              todayXp: 0,
              weeklyProgress: {
                ...weeklyProgress,
                daysActive: weeklyProgress.daysActive + 1,
              },
            },
          },
        });

        // 배지 체크
        checkAndAwardBadges(memberId);
      },

      earnBadge: (memberId, badgeId) => {
        const { memberData } = get();
        const data = memberData[memberId] || createDefaultMemberData();

        if (data.badges.some(b => b.id === badgeId)) {
          return; // 이미 획득한 배지
        }

        set({
          memberData: {
            ...memberData,
            [memberId]: {
              ...data,
              badges: [
                ...data.badges,
                { id: badgeId, earnedAt: new Date().toISOString() },
              ],
            },
          },
        });
      },

      hasBadge: (memberId, badgeId) => {
        const { memberData } = get();
        const data = memberData[memberId];
        return data?.badges.some(b => b.id === badgeId) || false;
      },

      checkAndAwardBadges: (memberId) => {
        const { memberData, earnBadge, hasBadge } = get();
        const data = memberData[memberId];
        if (!data) return [];

        const newBadges: string[] = [];
        const hour = new Date().getHours();

        // XP 배지
        if (data.xp >= 500 && !hasBadge(memberId, 'xp_500')) {
          earnBadge(memberId, 'xp_500');
          newBadges.push('xp_500');
        }
        if (data.xp >= 1000 && !hasBadge(memberId, 'xp_1000')) {
          earnBadge(memberId, 'xp_1000');
          newBadges.push('xp_1000');
        }
        if (data.xp >= 5000 && !hasBadge(memberId, 'xp_5000')) {
          earnBadge(memberId, 'xp_5000');
          newBadges.push('xp_5000');
        }

        // 레벨 배지
        if (data.level >= 5 && !hasBadge(memberId, 'level_5')) {
          earnBadge(memberId, 'level_5');
          newBadges.push('level_5');
        }
        if (data.level >= 10 && !hasBadge(memberId, 'level_10')) {
          earnBadge(memberId, 'level_10');
          newBadges.push('level_10');
        }

        // 스트릭 배지
        if (data.streak.current >= 3 && !hasBadge(memberId, 'streak_3')) {
          earnBadge(memberId, 'streak_3');
          newBadges.push('streak_3');
        }
        if (data.streak.current >= 7 && !hasBadge(memberId, 'streak_7')) {
          earnBadge(memberId, 'streak_7');
          newBadges.push('streak_7');
        }
        if (data.streak.current >= 30 && !hasBadge(memberId, 'streak_30')) {
          earnBadge(memberId, 'streak_30');
          newBadges.push('streak_30');
        }

        // 시간 기반 배지
        if (hour < 7 && !hasBadge(memberId, 'early_bird')) {
          earnBadge(memberId, 'early_bird');
          newBadges.push('early_bird');
        }
        if (hour >= 22 && !hasBadge(memberId, 'night_owl')) {
          earnBadge(memberId, 'night_owl');
          newBadges.push('night_owl');
        }

        return newBadges;
      },

      getMemberData: (memberId) => {
        const { memberData, initMemberData } = get();
        if (!memberData[memberId]) {
          initMemberData(memberId);
          return createDefaultMemberData();
        }
        return memberData[memberId];
      },

      setDailyGoalXp: (memberId, xp) => {
        const { memberData } = get();
        const data = memberData[memberId] || createDefaultMemberData();
        set({
          memberData: {
            ...memberData,
            [memberId]: { ...data, dailyGoalXp: xp },
          },
        });
      },

      setWeeklyGoalXp: (xp) => set({ weeklyGoalXp: xp }),

      getEncouragement: (correct) => {
        const messages = correct
          ? ENCOURAGEMENTS.correct
          : ENCOURAGEMENTS.incorrect;
        const message = messages[Math.floor(Math.random() * messages.length)];
        set({ lastEncouragement: message });
        return message;
      },

      getStreakMessage: (streak) => {
        if (streak >= 10) return ENCOURAGEMENTS.streak[3];
        if (streak >= 7) return ENCOURAGEMENTS.streak[2];
        if (streak >= 5) return ENCOURAGEMENTS.streak[1];
        if (streak >= 3) return ENCOURAGEMENTS.streak[0];
        return '';
      },

      resetWeeklyProgress: (memberId) => {
        const { memberData } = get();
        const data = memberData[memberId];
        if (!data) return;

        set({
          memberData: {
            ...memberData,
            [memberId]: {
              ...data,
              weeklyProgress: {
                weekStart: getWeekStart(),
                xpEarned: 0,
                daysActive: 0,
                lessonsCompleted: 0,
                minutesLearned: 0,
              },
            },
          },
        });
      },

      recordLearningSession: (memberId, xp, minutes) => {
        const { memberData, updateStreak, addXp } = get();
        const data = memberData[memberId] || createDefaultMemberData();
        const currentWeekStart = getWeekStart();

        // 스트릭 업데이트
        updateStreak(memberId);

        // XP 추가
        addXp(memberId, xp);

        // 주간 진행 상황 업데이트
        let weeklyProgress = data.weeklyProgress;
        if (weeklyProgress.weekStart !== currentWeekStart) {
          weeklyProgress = {
            weekStart: currentWeekStart,
            xpEarned: 0,
            daysActive: 0,
            lessonsCompleted: 0,
            minutesLearned: 0,
          };
        }

        set({
          memberData: {
            ...get().memberData,
            [memberId]: {
              ...get().memberData[memberId],
              weeklyProgress: {
                ...weeklyProgress,
                lessonsCompleted: weeklyProgress.lessonsCompleted + 1,
                minutesLearned: weeklyProgress.minutesLearned + minutes,
              },
            },
          },
        });
      },

      getFamilyRanking: () => {
        const { memberData } = get();
        return Object.entries(memberData)
          .map(([memberId, data]) => ({
            memberId,
            xp: data.xp,
            level: data.level,
          }))
          .sort((a, b) => b.xp - a.xp);
      },

      getWeeklyFamilyRanking: () => {
        const { memberData } = get();
        return Object.entries(memberData)
          .map(([memberId, data]) => ({
            memberId,
            weeklyXp: data.weeklyProgress.xpEarned,
          }))
          .sort((a, b) => b.weeklyXp - a.weeklyXp);
      },
    }),
    {
      name: 'speakflow-gamification',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        memberData: state.memberData,
        weeklyGoalXp: state.weeklyGoalXp,
      }),
    }
  )
);

// =====================
// XP 보상 기준
// =====================
export const XP_REWARDS = {
  chunkLearned: 10,        // 청크 학습 완료
  chunkReviewed: 5,        // 청크 복습 완료
  shadowingComplete: 15,   // 섀도잉 완료
  roleplayComplete: 25,    // 롤플레이 완료
  dailyMissionComplete: 50,// 일일 미션 완료
  perfectScore: 20,        // 만점 보너스
  streakBonus: 10,         // 연속 학습 보너스 (일별)
};
