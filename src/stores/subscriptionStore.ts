import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 구독 플랜 타입
export type PlanType = 'free' | 'premium' | 'family';
export type BillingCycle = 'monthly' | 'yearly';

// 플랜 정보
export interface Plan {
  id: PlanType;
  name: string;
  nameKo: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyMonthlyPrice: number; // 연간 결제 시 월 환산 가격
  features: string[];
  limits: {
    dailyChats: number; // -1 = 무제한
    dailyWords: number;
    dailyGrammar: number;
    dailyWriting: number;
    aiTutors: number;
    familyMembers: number;
  };
  popular?: boolean;
}

// 구독 상태
export interface Subscription {
  planId: PlanType;
  billingCycle: BillingCycle;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  trialEndsAt?: string;
}

// 사용량 추적
export interface UsageTracker {
  date: string;
  chats: number;
  words: number;
  grammar: number;
  writing: number;
}

// 플랜 목록
export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    nameKo: '무료',
    description: '기본 기능으로 영어 학습 시작',
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyMonthlyPrice: 0,
    features: [
      '일일 AI 대화 3회',
      '일일 단어 학습 20개',
      '일일 문법 퀴즈 5개',
      '일일 영작 연습 2개',
      '기본 AI 튜터 1명 (Emma)',
      '가족 프로필 1개',
      '기본 통계',
    ],
    limits: {
      dailyChats: 3,
      dailyWords: 20,
      dailyGrammar: 5,
      dailyWriting: 2,
      aiTutors: 1,
      familyMembers: 1,
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    nameKo: '프리미엄',
    description: '무제한 학습으로 빠른 실력 향상',
    monthlyPrice: 5900,
    yearlyPrice: 49000,
    yearlyMonthlyPrice: 4083,
    popular: true,
    features: [
      '무제한 AI 대화',
      '무제한 단어 학습',
      '무제한 문법 퀴즈',
      '무제한 영작 연습',
      '모든 AI 튜터 (5명)',
      '가족 프로필 1개',
      '상세 학습 리포트',
      '오프라인 학습 모드',
      '광고 제거',
      '우선 고객 지원',
    ],
    limits: {
      dailyChats: -1,
      dailyWords: -1,
      dailyGrammar: -1,
      dailyWriting: -1,
      aiTutors: 5,
      familyMembers: 1,
    },
  },
  {
    id: 'family',
    name: 'Family',
    nameKo: '가족',
    description: '온 가족이 함께하는 영어 학습',
    monthlyPrice: 9900,
    yearlyPrice: 79000,
    yearlyMonthlyPrice: 6583,
    features: [
      '프리미엄의 모든 기능',
      '가족 프로필 4개',
      '가족 리더보드',
      '가족 챌린지',
      '자녀 학습 관리',
      '가족 합산 스트릭',
      '가족 전용 보상',
    ],
    limits: {
      dailyChats: -1,
      dailyWords: -1,
      dailyGrammar: -1,
      dailyWriting: -1,
      aiTutors: 5,
      familyMembers: 4,
    },
  },
];

// 프로모션 코드
export interface PromoCode {
  code: string;
  discountPercent: number;
  validUntil: string;
  appliesTo: PlanType[];
}

const PROMO_CODES: PromoCode[] = [
  { code: 'WELCOME50', discountPercent: 50, validUntil: '2025-12-31', appliesTo: ['premium', 'family'] },
  { code: 'FAMILY30', discountPercent: 30, validUntil: '2025-12-31', appliesTo: ['family'] },
  { code: 'NEWYEAR2025', discountPercent: 40, validUntil: '2025-01-31', appliesTo: ['premium', 'family'] },
];

interface SubscriptionState {
  subscription: Subscription;
  usage: UsageTracker;
  appliedPromoCode: string | null;

  // Getters
  getCurrentPlan: () => Plan;
  isPremium: () => boolean;
  isFamily: () => boolean;
  canUseFeature: (feature: 'chat' | 'words' | 'grammar' | 'writing') => boolean;
  getRemainingUsage: (feature: 'chat' | 'words' | 'grammar' | 'writing') => number;
  getDaysRemaining: () => number;

  // Actions
  subscribe: (planId: PlanType, billingCycle: BillingCycle) => void;
  cancelSubscription: () => void;
  applyPromoCode: (code: string) => { success: boolean; message: string; discount?: number };
  incrementUsage: (feature: 'chat' | 'words' | 'grammar' | 'writing') => boolean;
  resetDailyUsage: () => void;
  startTrial: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscription: {
        planId: 'free',
        billingCycle: 'monthly',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: '',
        autoRenew: false,
      },
      usage: {
        date: new Date().toISOString().split('T')[0],
        chats: 0,
        words: 0,
        grammar: 0,
        writing: 0,
      },
      appliedPromoCode: null,

      getCurrentPlan: () => {
        const { subscription } = get();
        return PLANS.find(p => p.id === subscription.planId) || PLANS[0];
      },

      isPremium: () => {
        const { subscription } = get();
        return subscription.planId === 'premium' || subscription.planId === 'family';
      },

      isFamily: () => {
        const { subscription } = get();
        return subscription.planId === 'family';
      },

      canUseFeature: (feature) => {
        const plan = get().getCurrentPlan();
        const { usage } = get();
        const today = new Date().toISOString().split('T')[0];

        // 날짜가 바뀌면 사용량 리셋
        if (usage.date !== today) {
          get().resetDailyUsage();
          return true;
        }

        const limits = {
          chat: plan.limits.dailyChats,
          words: plan.limits.dailyWords,
          grammar: plan.limits.dailyGrammar,
          writing: plan.limits.dailyWriting,
        };

        const usageMap = {
          chat: usage.chats,
          words: usage.words,
          grammar: usage.grammar,
          writing: usage.writing,
        };

        const limit = limits[feature];
        return limit === -1 || usageMap[feature] < limit;
      },

      getRemainingUsage: (feature) => {
        const plan = get().getCurrentPlan();
        const { usage } = get();

        const limits = {
          chat: plan.limits.dailyChats,
          words: plan.limits.dailyWords,
          grammar: plan.limits.dailyGrammar,
          writing: plan.limits.dailyWriting,
        };

        const usageMap = {
          chat: usage.chats,
          words: usage.words,
          grammar: usage.grammar,
          writing: usage.writing,
        };

        const limit = limits[feature];
        if (limit === -1) return -1; // 무제한
        return Math.max(0, limit - usageMap[feature]);
      },

      getDaysRemaining: () => {
        const { subscription } = get();
        if (!subscription.endDate) return -1;
        const end = new Date(subscription.endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      },

      subscribe: (planId, billingCycle) => {
        const now = new Date();
        const endDate = new Date(now);

        if (billingCycle === 'monthly') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }

        set({
          subscription: {
            planId,
            billingCycle,
            status: 'active',
            startDate: now.toISOString(),
            endDate: endDate.toISOString(),
            autoRenew: true,
          },
        });
      },

      cancelSubscription: () => {
        set((state) => ({
          subscription: {
            ...state.subscription,
            autoRenew: false,
            status: 'canceled',
          },
        }));
      },

      applyPromoCode: (code) => {
        const promo = PROMO_CODES.find(
          p => p.code.toUpperCase() === code.toUpperCase()
        );

        if (!promo) {
          return { success: false, message: '유효하지 않은 프로모션 코드입니다.' };
        }

        const now = new Date();
        const validUntil = new Date(promo.validUntil);

        if (now > validUntil) {
          return { success: false, message: '만료된 프로모션 코드입니다.' };
        }

        set({ appliedPromoCode: code.toUpperCase() });
        return {
          success: true,
          message: `${promo.discountPercent}% 할인이 적용되었습니다!`,
          discount: promo.discountPercent,
        };
      },

      incrementUsage: (feature) => {
        const canUse = get().canUseFeature(feature);
        if (!canUse) return false;

        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const usage = state.usage.date === today ? state.usage : {
            date: today,
            chats: 0,
            words: 0,
            grammar: 0,
            writing: 0,
          };

          return {
            usage: {
              ...usage,
              chats: feature === 'chat' ? usage.chats + 1 : usage.chats,
              words: feature === 'words' ? usage.words + 1 : usage.words,
              grammar: feature === 'grammar' ? usage.grammar + 1 : usage.grammar,
              writing: feature === 'writing' ? usage.writing + 1 : usage.writing,
            },
          };
        });

        return true;
      },

      resetDailyUsage: () => {
        set({
          usage: {
            date: new Date().toISOString().split('T')[0],
            chats: 0,
            words: 0,
            grammar: 0,
            writing: 0,
          },
        });
      },

      startTrial: () => {
        const now = new Date();
        const trialEnd = new Date(now);
        trialEnd.setDate(trialEnd.getDate() + 7); // 7일 무료 체험

        set({
          subscription: {
            planId: 'premium',
            billingCycle: 'monthly',
            status: 'trial',
            startDate: now.toISOString(),
            endDate: trialEnd.toISOString(),
            autoRenew: false,
            trialEndsAt: trialEnd.toISOString(),
          },
        });
      },
    }),
    {
      name: 'subscription-storage',
    }
  )
);

// 가격 포맷 함수
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price);
}

// 할인된 가격 계산
export function getDiscountedPrice(price: number, discountPercent: number): number {
  return Math.round(price * (1 - discountPercent / 100));
}
