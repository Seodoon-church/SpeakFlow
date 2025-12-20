import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 리그 티어 정의
export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface LeagueTierInfo {
  id: LeagueTier;
  name: string;
  nameKo: string;
  icon: string;
  color: string;
  bgColor: string;
  minXP: number;
  promotionTop: number; // 상위 N% 승급
  demotionBottom: number; // 하위 N% 강등
}

export const LEAGUE_TIERS: LeagueTierInfo[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    nameKo: '브론즈',
    icon: '🥉',
    color: '#CD7F32',
    bgColor: '#FDF4E7',
    minXP: 0,
    promotionTop: 10,
    demotionBottom: 0, // 브론즈는 강등 없음
  },
  {
    id: 'silver',
    name: 'Silver',
    nameKo: '실버',
    icon: '🥈',
    color: '#C0C0C0',
    bgColor: '#F5F5F5',
    minXP: 500,
    promotionTop: 10,
    demotionBottom: 10,
  },
  {
    id: 'gold',
    name: 'Gold',
    nameKo: '골드',
    icon: '🥇',
    color: '#FFD700',
    bgColor: '#FFFBEB',
    minXP: 1500,
    promotionTop: 10,
    demotionBottom: 10,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    nameKo: '플래티넘',
    icon: '💎',
    color: '#00CED1',
    bgColor: '#E0FFFF',
    minXP: 3000,
    promotionTop: 10,
    demotionBottom: 10,
  },
  {
    id: 'diamond',
    name: 'Diamond',
    nameKo: '다이아몬드',
    icon: '👑',
    color: '#B9F2FF',
    bgColor: '#F0FCFF',
    minXP: 5000,
    promotionTop: 0, // 다이아몬드는 승급 없음
    demotionBottom: 10,
  },
];

// 리더보드 유저
export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  weeklyXP: number;
  totalXP: number;
  league: LeagueTier;
  rank: number;
  streak: number;
  isCurrentUser?: boolean;
}

// 주간 리그 정보
export interface WeeklyLeague {
  weekStart: string; // ISO date
  weekEnd: string;
  league: LeagueTier;
  participants: LeaderboardUser[];
  myRank: number;
  promotionZone: number; // 승급권 순위
  demotionZone: number; // 강등권 순위
}

// 리그 보상
export interface LeagueReward {
  tier: LeagueTier;
  position: 'promotion' | 'stay' | 'demotion';
  gems: number;
  xpBonus: number;
  badge?: string;
}

const LEAGUE_REWARDS: LeagueReward[] = [
  // 승급 보상
  { tier: 'bronze', position: 'promotion', gems: 50, xpBonus: 100, badge: '🌟' },
  { tier: 'silver', position: 'promotion', gems: 100, xpBonus: 200, badge: '⭐' },
  { tier: 'gold', position: 'promotion', gems: 150, xpBonus: 300, badge: '🌠' },
  { tier: 'platinum', position: 'promotion', gems: 200, xpBonus: 400, badge: '💫' },
  // 유지 보상
  { tier: 'bronze', position: 'stay', gems: 10, xpBonus: 0 },
  { tier: 'silver', position: 'stay', gems: 20, xpBonus: 0 },
  { tier: 'gold', position: 'stay', gems: 30, xpBonus: 0 },
  { tier: 'platinum', position: 'stay', gems: 40, xpBonus: 0 },
  { tier: 'diamond', position: 'stay', gems: 50, xpBonus: 0 },
  // 강등 (보상 없음)
  { tier: 'silver', position: 'demotion', gems: 0, xpBonus: 0 },
  { tier: 'gold', position: 'demotion', gems: 0, xpBonus: 0 },
  { tier: 'platinum', position: 'demotion', gems: 0, xpBonus: 0 },
  { tier: 'diamond', position: 'demotion', gems: 0, xpBonus: 0 },
];

// Mock 유저 데이터 생성
const generateMockUsers = (league: LeagueTier, count: number): LeaderboardUser[] => {
  const names = [
    '민준', '서연', '하준', '지우', '서준', '하윤', '도윤', '지민',
    '주원', '예준', '지아', '수아', '유진', '소율', '지호', '시우',
    '유찬', '현우', '준서', '은서', '지원', '수빈', '예은', '윤서',
  ];
  const avatars = ['👨‍💼', '👩‍💼', '🧑‍🎓', '👨‍🏫', '👩‍🏫', '🧑‍💻', '👨‍🎨', '👩‍🔬'];

  return Array.from({ length: count }, (_, i) => ({
    id: `user-${league}-${i}`,
    name: names[i % names.length] + (i > names.length ? `${Math.floor(i / names.length)}` : ''),
    avatar: avatars[i % avatars.length],
    weeklyXP: Math.floor(Math.random() * 800) + 100,
    totalXP: Math.floor(Math.random() * 5000) + 500,
    league,
    rank: i + 1,
    streak: Math.floor(Math.random() * 30) + 1,
  })).sort((a, b) => b.weeklyXP - a.weeklyXP).map((u, i) => ({ ...u, rank: i + 1 }));
};

interface LeagueState {
  // 현재 유저 정보
  currentLeague: LeagueTier;
  weeklyXP: number;
  totalXP: number;
  gems: number;

  // 주간 리그
  weeklyLeague: WeeklyLeague | null;

  // 리그 히스토리
  leagueHistory: {
    week: string;
    league: LeagueTier;
    rank: number;
    result: 'promotion' | 'stay' | 'demotion';
  }[];

  // Actions
  addXP: (amount: number) => void;
  addGems: (amount: number) => void;
  initializeWeeklyLeague: () => void;
  processWeekEnd: () => void;
  getLeaderboard: () => LeaderboardUser[];
  getMyRank: () => number;
  getTierInfo: (tier: LeagueTier) => LeagueTierInfo;
  getPromotionStatus: () => 'promotion' | 'stay' | 'demotion' | 'safe';
  getDaysUntilWeekEnd: () => number;
}

export const useLeagueStore = create<LeagueState>()(
  persist(
    (set, get) => ({
      currentLeague: 'bronze',
      weeklyXP: 0,
      totalXP: 0,
      gems: 100,
      weeklyLeague: null,
      leagueHistory: [],

      addXP: (amount) => {
        set((state) => ({
          weeklyXP: state.weeklyXP + amount,
          totalXP: state.totalXP + amount,
        }));

        // 리더보드 업데이트
        const state = get();
        if (state.weeklyLeague) {
          const updatedParticipants = state.weeklyLeague.participants.map((p) =>
            p.isCurrentUser ? { ...p, weeklyXP: state.weeklyXP + amount } : p
          );

          // 재정렬
          updatedParticipants.sort((a, b) => b.weeklyXP - a.weeklyXP);
          updatedParticipants.forEach((p, i) => (p.rank = i + 1));

          set({
            weeklyLeague: {
              ...state.weeklyLeague,
              participants: updatedParticipants,
              myRank: updatedParticipants.find((p) => p.isCurrentUser)?.rank || 1,
            },
          });
        }
      },

      addGems: (amount) => {
        set((state) => ({
          gems: state.gems + amount,
        }));
      },

      initializeWeeklyLeague: () => {
        const state = get();
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // 이번 주 일요일
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // 토요일
        weekEnd.setHours(23, 59, 59, 999);

        // Mock 유저 생성 (30명)
        const mockUsers = generateMockUsers(state.currentLeague, 29);

        // 현재 유저 추가
        const currentUser: LeaderboardUser = {
          id: 'current-user',
          name: '나',
          avatar: '😊',
          weeklyXP: state.weeklyXP,
          totalXP: state.totalXP,
          league: state.currentLeague,
          rank: 1,
          streak: 7,
          isCurrentUser: true,
        };

        const allParticipants = [...mockUsers, currentUser]
          .sort((a, b) => b.weeklyXP - a.weeklyXP)
          .map((p, i) => ({ ...p, rank: i + 1 }));

        const tierInfo = LEAGUE_TIERS.find((t) => t.id === state.currentLeague)!;
        const promotionZone = Math.ceil(allParticipants.length * (tierInfo.promotionTop / 100));
        const demotionZone = allParticipants.length - Math.ceil(allParticipants.length * (tierInfo.demotionBottom / 100));

        set({
          weeklyLeague: {
            weekStart: weekStart.toISOString(),
            weekEnd: weekEnd.toISOString(),
            league: state.currentLeague,
            participants: allParticipants,
            myRank: allParticipants.find((p) => p.isCurrentUser)?.rank || 1,
            promotionZone: tierInfo.promotionTop > 0 ? promotionZone : 0,
            demotionZone: tierInfo.demotionBottom > 0 ? demotionZone : allParticipants.length + 1,
          },
        });
      },

      processWeekEnd: () => {
        const state = get();
        if (!state.weeklyLeague) return;

        const { myRank, promotionZone, demotionZone } = state.weeklyLeague;
        let result: 'promotion' | 'stay' | 'demotion' = 'stay';
        let newLeague = state.currentLeague;

        const tierIndex = LEAGUE_TIERS.findIndex((t) => t.id === state.currentLeague);

        if (myRank <= promotionZone && tierIndex < LEAGUE_TIERS.length - 1) {
          result = 'promotion';
          newLeague = LEAGUE_TIERS[tierIndex + 1].id;
        } else if (myRank >= demotionZone && tierIndex > 0) {
          result = 'demotion';
          newLeague = LEAGUE_TIERS[tierIndex - 1].id;
        }

        // 보상 지급
        const reward = LEAGUE_REWARDS.find(
          (r) => r.tier === state.currentLeague && r.position === result
        );

        if (reward) {
          set((state) => ({
            gems: state.gems + reward.gems,
            totalXP: state.totalXP + reward.xpBonus,
          }));
        }

        // 히스토리 추가
        set((state) => ({
          currentLeague: newLeague,
          weeklyXP: 0,
          leagueHistory: [
            {
              week: state.weeklyLeague!.weekStart,
              league: state.currentLeague,
              rank: myRank,
              result,
            },
            ...state.leagueHistory,
          ].slice(0, 10), // 최근 10주만 저장
        }));

        // 새 주간 리그 시작
        get().initializeWeeklyLeague();
      },

      getLeaderboard: () => {
        const state = get();
        return state.weeklyLeague?.participants || [];
      },

      getMyRank: () => {
        const state = get();
        return state.weeklyLeague?.myRank || 1;
      },

      getTierInfo: (tier) => {
        return LEAGUE_TIERS.find((t) => t.id === tier) || LEAGUE_TIERS[0];
      },

      getPromotionStatus: () => {
        const state = get();
        if (!state.weeklyLeague) return 'safe';

        const { myRank, promotionZone, demotionZone } = state.weeklyLeague;

        if (myRank <= promotionZone) return 'promotion';
        if (myRank >= demotionZone) return 'demotion';
        if (myRank <= promotionZone + 3) return 'safe'; // 승급권 근처
        return 'stay';
      },

      getDaysUntilWeekEnd: () => {
        const state = get();
        if (!state.weeklyLeague) return 7;

        const now = new Date();
        const weekEnd = new Date(state.weeklyLeague.weekEnd);
        const diff = weekEnd.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      },
    }),
    {
      name: 'speakflow-league',
    }
  )
);
