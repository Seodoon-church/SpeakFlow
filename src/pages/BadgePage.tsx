import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Award,
  Lock,
  Sparkles,
  Trophy,
  Star,
} from 'lucide-react';
import { useFamilyStore, useGamificationStore, BADGES } from '@/stores';
import { Avatar } from '@/components/common';

export default function BadgePage() {
  const navigate = useNavigate();
  const { members, currentMemberId } = useFamilyStore();
  const { memberData, initMemberData, checkAndAwardBadges } = useGamificationStore();

  const currentMember = members.find((m) => m.id === currentMemberId);

  // 현재 멤버의 게이미피케이션 데이터 초기화
  useEffect(() => {
    if (currentMemberId) {
      initMemberData(currentMemberId);
      checkAndAwardBadges(currentMemberId);
    }
  }, [currentMemberId, initMemberData, checkAndAwardBadges]);

  const gamificationData = currentMemberId ? memberData[currentMemberId] : null;
  const earnedBadgeIds = gamificationData?.badges.map((b) => b.id) || [];
  const earnedCount = earnedBadgeIds.length;
  const totalCount = BADGES.length;
  const progressPercent = Math.round((earnedCount / totalCount) * 100);

  // 배지를 획득 여부로 분류
  const sortedBadges = [...BADGES].sort((a, b) => {
    const aEarned = earnedBadgeIds.includes(a.id);
    const bEarned = earnedBadgeIds.includes(b.id);
    if (aEarned && !bEarned) return -1;
    if (!aEarned && bEarned) return 1;
    return 0;
  });

  // 배지 획득 날짜 가져오기
  const getBadgeEarnedDate = (badgeId: string) => {
    const badge = gamificationData?.badges.find((b) => b.id === badgeId);
    if (badge) {
      return new Date(badge.earnedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    return null;
  };

  // 배지 카테고리별 분류
  const badgeCategories = [
    {
      id: 'streak',
      name: '연속 학습',
      icon: '🔥',
      badges: BADGES.filter((b) => b.id.includes('streak')),
    },
    {
      id: 'xp',
      name: 'XP 달성',
      icon: '⚡',
      badges: BADGES.filter((b) => b.id.includes('xp')),
    },
    {
      id: 'level',
      name: '레벨 달성',
      icon: '⭐',
      badges: BADGES.filter((b) => b.id.includes('level')),
    },
    {
      id: 'learning',
      name: '학습 활동',
      icon: '📚',
      badges: BADGES.filter((b) => b.id.includes('chunk') || b.id.includes('first')),
    },
    {
      id: 'special',
      name: '특별 배지',
      icon: '🎖️',
      badges: BADGES.filter(
        (b) =>
          b.id.includes('early') ||
          b.id.includes('night') ||
          b.id.includes('perfect') ||
          b.id.includes('family')
      ),
    },
  ].filter((cat) => cat.badges.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-yellow-50">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Award className="w-5 h-5" />
                나의 배지
              </h1>
              <p className="text-amber-100 text-xs">학습 성과를 기록하세요</p>
            </div>
          </div>

          {/* 프로필 및 진행률 */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-4">
              {currentMember && (
                <Avatar
                  avatar={currentMember.avatar}
                  avatarUrl={currentMember.avatarUrl}
                  size="lg"
                  className="ring-2 ring-white/50"
                />
              )}
              <div className="flex-1">
                <p className="font-bold">{currentMember?.name || '학습자'}</p>
                <p className="text-amber-100 text-sm">
                  {earnedCount}/{totalCount} 배지 획득
                </p>
                {/* 프로그레스 바 */}
                <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{progressPercent}%</p>
                <p className="text-amber-100 text-xs">완성도</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 최근 획득 배지 하이라이트 */}
      {earnedCount > 0 && (
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="font-bold text-foreground text-sm">최근 획득</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {gamificationData?.badges
              .slice()
              .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
              .slice(0, 5)
              .map((earned) => {
                const badgeInfo = BADGES.find((b) => b.id === earned.id);
                if (!badgeInfo) return null;
                return (
                  <motion.div
                    key={earned.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-shrink-0 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl p-4 text-center min-w-[100px] border border-amber-200"
                  >
                    <span className="text-3xl block mb-2">{badgeInfo.icon}</span>
                    <p className="text-xs font-semibold text-foreground">{badgeInfo.name}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {new Date(earned.earnedAt).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </motion.div>
                );
              })}
          </div>
        </div>
      )}

      {/* 카테고리별 배지 */}
      <div className="px-4 pb-24">
        {badgeCategories.map((category) => (
          <section key={category.id} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{category.icon}</span>
              <h2 className="font-bold text-foreground">{category.name}</h2>
              <span className="text-xs text-gray-400">
                {category.badges.filter((b) => earnedBadgeIds.includes(b.id)).length}/
                {category.badges.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {category.badges.map((badge, index) => {
                const isEarned = earnedBadgeIds.includes(badge.id);
                const earnedDate = getBadgeEarnedDate(badge.id);

                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative rounded-xl p-4 ${
                      isEarned
                        ? 'bg-white shadow-md border border-amber-100'
                        : 'bg-gray-50 border border-gray-100'
                    }`}
                  >
                    {/* 획득 표시 */}
                    {isEarned && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                        <Star className="w-3 h-3" fill="white" />
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                          isEarned
                            ? 'bg-gradient-to-br from-amber-100 to-yellow-100'
                            : 'bg-gray-100 grayscale opacity-50'
                        }`}
                      >
                        {isEarned ? badge.icon : <Lock className="w-5 h-5 text-gray-400" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-semibold text-sm ${
                            isEarned ? 'text-foreground' : 'text-gray-400'
                          }`}
                        >
                          {badge.name}
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${
                            isEarned ? 'text-gray-500' : 'text-gray-400'
                          }`}
                        >
                          {badge.description}
                        </p>
                        {earnedDate && (
                          <p className="text-[10px] text-amber-600 mt-1">{earnedDate} 획득</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))}

        {/* 모든 배지 획득 시 */}
        {earnedCount === totalCount && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-amber-400 to-yellow-400 rounded-xl p-6 text-center text-white mt-6"
          >
            <Trophy className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-lg">축하합니다!</h3>
            <p className="text-amber-100 text-sm">모든 배지를 획득했습니다!</p>
          </motion.div>
        )}

        {/* 다음 목표 */}
        {earnedCount < totalCount && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-foreground text-sm">다음 목표</h3>
            </div>
            <div className="space-y-2">
              {sortedBadges
                .filter((b) => !earnedBadgeIds.includes(b.id))
                .slice(0, 3)
                .map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-xl grayscale opacity-50">{badge.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{badge.name}</p>
                      <p className="text-xs text-gray-500">{badge.description}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
