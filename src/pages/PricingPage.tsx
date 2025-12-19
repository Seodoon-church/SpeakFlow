import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Check,
  X,
  Crown,
  Users,
  Zap,
  Gift,
  Shield,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import {
  useSubscriptionStore,
  PLANS,
  formatPrice,
  getDiscountedPrice,
  type PlanType,
  type BillingCycle,
} from '@/stores/subscriptionStore';

export default function PricingPage() {
  const navigate = useNavigate();
  const {
    subscription,
    getCurrentPlan,
    subscribe,
    startTrial,
    applyPromoCode,
    appliedPromoCode,
    getDaysRemaining,
  } = useSubscriptionStore();

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ success: boolean; message: string } | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  const currentPlan = getCurrentPlan();
  const daysRemaining = getDaysRemaining();

  // 프로모션 코드 적용
  const handleApplyPromo = () => {
    const result = applyPromoCode(promoCode);
    setPromoMessage(result);
    if (result.success && result.discount) {
      setDiscountPercent(result.discount);
    }
  };

  // 구독 시작
  const handleSubscribe = (planId: PlanType) => {
    if (planId === 'free') {
      navigate('/home');
      return;
    }

    // 실제 결제는 Stripe/토스페이먼츠 연동 필요
    // 여기서는 데모용으로 바로 구독 처리
    subscribe(planId, billingCycle);
    navigate('/home');
  };

  // 무료 체험 시작
  const handleStartTrial = () => {
    startTrial();
    navigate('/home');
  };

  // 가격 계산
  const getPrice = (plan: typeof PLANS[0]) => {
    const basePrice = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    if (discountPercent > 0 && plan.id !== 'free') {
      return getDiscountedPrice(basePrice, discountPercent);
    }
    return basePrice;
  };

  // 월 환산 가격
  const getMonthlyEquivalent = (plan: typeof PLANS[0]) => {
    if (billingCycle === 'yearly') {
      const price = getPrice(plan);
      return Math.round(price / 12);
    }
    return getPrice(plan);
  };

  // 절약 금액 (연간 결제 시)
  const getSavings = (plan: typeof PLANS[0]) => {
    if (billingCycle !== 'yearly' || plan.monthlyPrice === 0) return 0;
    const yearlyTotal = plan.monthlyPrice * 12;
    let discountedYearlyPrice = plan.yearlyPrice;
    if (discountPercent > 0) {
      discountedYearlyPrice = getDiscountedPrice(plan.yearlyPrice, discountPercent);
    }
    return yearlyTotal - discountedYearlyPrice;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">요금제</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-4 py-6 pb-24">
        {/* 현재 구독 상태 */}
        {subscription.status !== 'active' || subscription.planId !== 'free' ? (
          <div className={`rounded-2xl p-4 mb-6 ${
            subscription.status === 'trial'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5" />
                  <span className="font-bold">{currentPlan.nameKo} 플랜</span>
                  {subscription.status === 'trial' && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">체험 중</span>
                  )}
                </div>
                <p className="text-sm opacity-80">
                  {subscription.status === 'trial'
                    ? `무료 체험 ${daysRemaining}일 남음`
                    : subscription.status === 'canceled'
                    ? `${daysRemaining}일 후 만료`
                    : `다음 결제일: ${new Date(subscription.endDate).toLocaleDateString('ko-KR')}`
                  }
                </p>
              </div>
              {subscription.status === 'trial' && (
                <button
                  onClick={() => handleSubscribe('premium')}
                  className="bg-white text-purple-600 px-4 py-2 rounded-xl font-medium text-sm"
                >
                  업그레이드
                </button>
              )}
            </div>
          </div>
        ) : null}

        {/* 헤드라인 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            영어 실력, 진짜로 키우고 싶다면
          </h2>
          <p className="text-gray-500">
            SpeakFlow 프리미엄으로 무제한 학습하세요
          </p>
        </div>

        {/* 무료 체험 배너 */}
        {subscription.planId === 'free' && subscription.status !== 'trial' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartTrial}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-5 text-white text-center mb-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="w-6 h-6" />
                <span className="text-xl font-bold">7일 무료 체험</span>
              </div>
              <p className="text-sm opacity-90">프리미엄 기능을 무료로 체험해보세요</p>
              <p className="text-xs opacity-70 mt-1">신용카드 필요 없음 · 언제든 취소 가능</p>
            </div>
          </motion.button>
        )}

        {/* 결제 주기 선택 */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-full p-1 flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              월간
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                billingCycle === 'yearly'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              연간
              <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                -30%
              </span>
            </button>
          </div>
        </div>

        {/* 프로모션 코드 */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="프로모션 코드 입력"
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
            />
            <button
              onClick={handleApplyPromo}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              적용
            </button>
          </div>
          {promoMessage && (
            <p className={`text-sm mt-2 ${promoMessage.success ? 'text-green-600' : 'text-red-600'}`}>
              {promoMessage.message}
            </p>
          )}
          {appliedPromoCode && (
            <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
              <Check className="w-4 h-4" />
              <span>프로모션 코드 적용됨: {appliedPromoCode}</span>
            </div>
          )}
        </div>

        {/* 요금제 카드 */}
        <div className="space-y-4">
          {PLANS.map((plan) => {
            const price = getPrice(plan);
            const monthlyEquivalent = getMonthlyEquivalent(plan);
            const savings = getSavings(plan);
            const isCurrentPlan = subscription.planId === plan.id;

            return (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.01 }}
                className={`relative bg-white rounded-2xl border-2 overflow-hidden ${
                  plan.popular
                    ? 'border-primary-500 shadow-lg shadow-primary-100'
                    : isCurrentPlan
                    ? 'border-green-500'
                    : 'border-gray-100'
                }`}
              >
                {/* 인기 배지 */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                    BEST
                  </div>
                )}

                {/* 현재 플랜 표시 */}
                {isCurrentPlan && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-xl">
                    현재 플랜
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        {plan.id === 'family' && <Users className="w-5 h-5 text-primary-500" />}
                        {plan.id === 'premium' && <Crown className="w-5 h-5 text-yellow-500" />}
                        {plan.id === 'free' && <Zap className="w-5 h-5 text-gray-400" />}
                        <h3 className="text-xl font-bold text-foreground">{plan.nameKo}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                    </div>
                  </div>

                  {/* 가격 */}
                  <div className="mb-4">
                    {plan.id === 'free' ? (
                      <div className="text-3xl font-bold text-foreground">무료</div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          {discountPercent > 0 && (
                            <span className="text-gray-400 line-through text-lg">
                              ₩{formatPrice(billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice)}
                            </span>
                          )}
                          <span className="text-3xl font-bold text-foreground">
                            ₩{formatPrice(price)}
                          </span>
                          <span className="text-gray-500 text-sm">
                            /{billingCycle === 'yearly' ? '년' : '월'}
                          </span>
                        </div>
                        {billingCycle === 'yearly' && (
                          <p className="text-sm text-gray-500 mt-1">
                            월 ₩{formatPrice(monthlyEquivalent)} (매월 결제 대비 ₩{formatPrice(savings)} 절약)
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* 기능 목록 */}
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* 구독 버튼 */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrentPlan}
                    className={`w-full py-3 rounded-xl font-bold transition-colors ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                        : plan.id === 'free'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isCurrentPlan
                      ? '현재 이용 중'
                      : plan.id === 'free'
                      ? '무료로 시작하기'
                      : `${plan.nameKo} 시작하기`
                    }
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 보장 */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="font-medium text-foreground">7일 환불 보장</span>
          </div>
          <p className="text-sm text-gray-500">
            마음에 들지 않으면 7일 이내 전액 환불해 드립니다
          </p>
        </div>

        {/* FAQ 링크 */}
        <button
          onClick={() => {/* FAQ 페이지로 이동 */}}
          className="w-full mt-6 py-4 bg-white rounded-xl border border-gray-100 flex items-center justify-between px-4"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <span className="font-medium">자주 묻는 질문</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        {/* 비교표 */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-foreground mb-4 text-center">
            플랜 비교
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-3 font-medium text-gray-500">기능</th>
                  <th className="p-3 font-medium text-gray-500">무료</th>
                  <th className="p-3 font-medium text-primary-600">프리미엄</th>
                  <th className="p-3 font-medium text-gray-500">가족</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="p-3 text-gray-700">AI 대화</td>
                  <td className="p-3 text-center">3회/일</td>
                  <td className="p-3 text-center text-primary-600 font-medium">무제한</td>
                  <td className="p-3 text-center">무제한</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="p-3 text-gray-700">단어 학습</td>
                  <td className="p-3 text-center">20개/일</td>
                  <td className="p-3 text-center text-primary-600 font-medium">무제한</td>
                  <td className="p-3 text-center">무제한</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="p-3 text-gray-700">AI 튜터</td>
                  <td className="p-3 text-center">1명</td>
                  <td className="p-3 text-center text-primary-600 font-medium">5명</td>
                  <td className="p-3 text-center">5명</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="p-3 text-gray-700">가족 프로필</td>
                  <td className="p-3 text-center">1개</td>
                  <td className="p-3 text-center">1개</td>
                  <td className="p-3 text-center text-primary-600 font-medium">4개</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="p-3 text-gray-700">오프라인 모드</td>
                  <td className="p-3 text-center"><X className="w-4 h-4 text-gray-300 mx-auto" /></td>
                  <td className="p-3 text-center"><Check className="w-4 h-4 text-primary-500 mx-auto" /></td>
                  <td className="p-3 text-center"><Check className="w-4 h-4 text-primary-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-3 text-gray-700">광고 제거</td>
                  <td className="p-3 text-center"><X className="w-4 h-4 text-gray-300 mx-auto" /></td>
                  <td className="p-3 text-center"><Check className="w-4 h-4 text-primary-500 mx-auto" /></td>
                  <td className="p-3 text-center"><Check className="w-4 h-4 text-primary-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
