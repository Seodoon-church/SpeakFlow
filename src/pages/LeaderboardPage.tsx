import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Crown,
  Flame,
  ChevronLeft,
  Zap,
  TrendingUp,
  TrendingDown,
  Shield,
  Users,
  Gem,
  Clock,
  Star,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useFamilyStore, useGamificationStore, TRACKS, useLeagueStore, LEAGUE_TIERS } from '@/stores';
import type { LeaderboardUser } from '@/stores';
import { Avatar } from '@/components/common';

type LeaderboardTab = 'league' | 'family';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { members, currentMemberId } = useFamilyStore();
  const { memberData, initMemberData } = useGamificationStore();
  const {
    currentLeague,
    weeklyXP,
    gems,
    weeklyLeague,
    initializeWeeklyLeague,
    getLeaderboard,
    getMyRank,
    getTierInfo,
    getPromotionStatus,
    getDaysUntilWeekEnd,
  } = useLeagueStore();

  const [activeTab, setActiveTab] = useState<LeaderboardTab>('league');
  const [showTierInfo, setShowTierInfo] = useState(false);

  // 초기화
  useEffect(() => {
    members.forEach((member) => {
      initMemberData(member.id);
    });
    if (!weeklyLeague) {
      initializeWeeklyLeague();
    }
  }, [members, initMemberData, weeklyLeague, initializeWeeklyLeague]);

  const leaderboard = getLeaderboard();
  const myRank = getMyRank();
  const tierInfo = getTierInfo(currentLeague);
  const promotionStatus = getPromotionStatus();
  const daysLeft = getDaysUntilWeekEnd();

  // 승급/강등 존 계산
  const promotionZone = weeklyLeague?.promotionZone || 3;
  const demotionZone = weeklyLeague?.demotionZone || leaderboard.length - 2;

  // 가족 랭킹 데이터
  const getFamilyRankingData = () => {
    return members
      .map((member) => {
        const gData = memberData[member.id] || {
          xp: 0,
          level: 1,
          streak: { current: 0, longest: 0, lastStudyDate: null },
          badges: [],
          weeklyProgress: { weekStart: '', xpEarned: 0, daysActive: 0, lessonsCompleted: 0, minutesLearned: 0 },
          todayXp: 0,
          dailyGoalXp: 50,
        };
        return {
          ...member,
          xp: gData.xp,
          level: gData.level,
          weeklyXp: gData.weeklyProgress.xpEarned,
          streak: gData.streak.current,
          badges: gData.badges.length,
        };
      })
      .sort((a, b) => b.weeklyXp - a.weeklyXp);
  };

  const familyRankingData = getFamilyRankingData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 헤더 */}
      <header
        className="text-white"
        style={{
          background: `linear-gradient(135deg, ${tierInfo.color} 0%, ${tierInfo.color}dd 100%)`,
        }}
      >
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                리더보드
              </h1>
              <p className="text-white/80 text-xs">
                {activeTab === 'league' ? `${tierInfo.nameKo} 리그` : '가족 랭킹'}
              </p>
            </div>

            {/* 젬 */}
            <div className="flex items-center gap-1 bg-white/20 px-2.5 py-1.5 rounded-full">
              <Gem className="w-4 h-4 text-cyan-300" />
              <span className="text-sm font-bold">{gems}</span>
            </div>
          </div>

          {/* 리그 정보 카드 */}
          {activeTab === 'league' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowTierInfo(true)}
                  className="text-5xl hover:scale-110 transition-transform"
                >
                  {tierInfo.icon}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">{tierInfo.nameKo} 리그</span>
                    {promotionStatus === 'promotion' && (
                      <span className="text-xs bg-green-400/30 text-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> 승급권
                      </span>
                    )}
                    {promotionStatus === 'demotion' && (
                      <span className="text-xs bg-red-400/30 text-red-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> 강등권
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-white/80">
                    <span className="text-sm">현재 {myRank}위</span>
                    <span className="text-sm">·</span>
                    <span className="text-sm flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {weeklyXP} XP
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-white/80">
                    <Clock className="w-4 h-4" />
                    <span className="text-2xl font-bold">{daysLeft}</span>
                  </div>
                  <p className="text-xs text-white/60">일 남음</p>
                </div>
              </div>

              {/* 승급/강등 안내 */}
              <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-green-200">
                  <ArrowUp className="w-3 h-3" />
                  <span>상위 10% (1~{promotionZone}위) 승급</span>
                </div>
                <div className="flex items-center gap-2 text-red-200">
                  <ArrowDown className="w-3 h-3" />
                  <span>하위 10% ({demotionZone}위~) 강등</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 탭 */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('league')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'league'
                  ? 'bg-white text-gray-800'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Shield className="w-4 h-4" />
              리그 랭킹
            </button>
            <button
              onClick={() => setActiveTab('family')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'family'
                  ? 'bg-white text-gray-800'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Users className="w-4 h-4" />
              가족 랭킹
            </button>
          </div>
        </div>
      </header>

      {/* 리그 리더보드 */}
      {activeTab === 'league' && (
        <div className="px-4 py-4 pb-24">
          {/* 승급 존 */}
          <div className="mb-3">
            <div className="flex items-center gap-2 text-green-600 text-xs font-medium mb-2 px-2">
              <TrendingUp className="w-3 h-3" />
              승급 존 (상위 10%)
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 overflow-hidden">
              {leaderboard.slice(0, promotionZone).map((user, index) => (
                <LeagueUserRow
                  key={user.id}
                  user={user}
                  rank={index + 1}
                  zone="promotion"
                />
              ))}
            </div>
          </div>

          {/* 안전 존 */}
          <div className="mb-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-2 px-2">
              <Shield className="w-3 h-3" />
              안전 존
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {leaderboard.slice(promotionZone, demotionZone - 1).map((user, index) => (
                <LeagueUserRow
                  key={user.id}
                  user={user}
                  rank={index + promotionZone + 1}
                  zone="safe"
                />
              ))}
            </div>
          </div>

          {/* 강등 존 */}
          {demotionZone <= leaderboard.length && (
            <div>
              <div className="flex items-center gap-2 text-red-600 text-xs font-medium mb-2 px-2">
                <TrendingDown className="w-3 h-3" />
                강등 위험 존 (하위 10%)
              </div>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 overflow-hidden">
                {leaderboard.slice(demotionZone - 1).map((user, index) => (
                  <LeagueUserRow
                    key={user.id}
                    user={user}
                    rank={index + demotionZone}
                    zone="relegation"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 가족 리더보드 */}
      {activeTab === 'family' && (
        <div className="px-4 py-4 pb-24">
          {/* 포디움 */}
          {familyRankingData.length >= 3 && (
            <div className="flex items-end justify-center gap-3 mb-6">
              {/* 2등 */}
              <FamilyPodiumItem member={familyRankingData[1]} rank={2} />
              {/* 1등 */}
              <FamilyPodiumItem member={familyRankingData[0]} rank={1} />
              {/* 3등 */}
              <FamilyPodiumItem member={familyRankingData[2]} rank={3} />
            </div>
          )}

          {/* 나머지 */}
          <div className="space-y-2">
            {familyRankingData.slice(familyRankingData.length >= 3 ? 3 : 0).map((member, index) => {
              const rank = familyRankingData.length >= 3 ? index + 4 : index + 1;
              const isCurrentUser = member.id === currentMemberId;
              const track = TRACKS.find((t) => t.id === member.trackId);

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl p-4 shadow-sm ${
                    isCurrentUser ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="font-bold text-gray-500 text-sm">{rank}</span>
                    </div>
                    <Avatar
                      avatar={member.avatar}
                      avatarUrl={member.avatarUrl}
                      size="md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground">{member.name}</p>
                        {isCurrentUser && (
                          <span className="text-xs bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded">
                            나
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Lv.{member.level}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Flame className="w-3 h-3 text-orange-500" />
                          {member.streak}일
                        </span>
                        {track && (
                          <>
                            <span>·</span>
                            <span>{track.icon} {track.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-primary-600">
                        <Zap className="w-4 h-4" />
                        <span className="font-bold">{member.weeklyXp}</span>
                      </div>
                      <p className="text-xs text-gray-400">이번 주</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {familyRankingData.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">가족 구성원이 없어요</p>
              <button
                onClick={() => navigate('/family')}
                className="text-primary-600 font-medium flex items-center gap-1 mx-auto"
              >
                가족 추가하기 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 티어 정보 모달 */}
      <AnimatePresence>
        {showTierInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowTierInfo(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-foreground mb-4 text-center">리그 시스템</h3>
              <div className="space-y-3">
                {LEAGUE_TIERS.map((tier) => (
                  <div
                    key={tier.id}
                    className={`p-4 rounded-xl border-2 ${
                      currentLeague === tier.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-100'
                    }`}
                    style={{ backgroundColor: currentLeague === tier.id ? tier.bgColor : undefined }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{tier.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-foreground">{tier.nameKo}</h4>
                          {currentLeague === tier.id && (
                            <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">
                              현재
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {tier.minXP}+ XP 필요
                        </p>
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        {tier.promotionTop > 0 && <p>상위 {tier.promotionTop}% 승급</p>}
                        {tier.demotionBottom > 0 && <p>하위 {tier.demotionBottom}% 강등</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 보상 안내 */}
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  승급 보상
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 브론즈 → 실버: 50젬 + 100 XP</li>
                  <li>• 실버 → 골드: 100젬 + 200 XP</li>
                  <li>• 골드 → 플래티넘: 150젬 + 300 XP</li>
                  <li>• 플래티넘 → 다이아: 200젬 + 400 XP</li>
                </ul>
              </div>

              <button
                onClick={() => setShowTierInfo(false)}
                className="w-full mt-4 py-3 text-gray-500 font-medium"
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 리그 유저 행 컴포넌트
function LeagueUserRow({
  user,
  rank,
  zone,
}: {
  user: LeaderboardUser;
  rank: number;
  zone: 'promotion' | 'safe' | 'relegation';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(rank * 0.02, 0.5) }}
      className={`flex items-center gap-3 p-3 border-b last:border-b-0 ${
        user.isCurrentUser
          ? zone === 'promotion'
            ? 'bg-green-100'
            : zone === 'relegation'
            ? 'bg-red-100'
            : 'bg-primary-50'
          : ''
      } ${
        zone === 'promotion'
          ? 'border-green-100'
          : zone === 'relegation'
          ? 'border-red-100'
          : 'border-gray-100'
      }`}
    >
      {/* 순위 */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          rank === 1
            ? 'bg-yellow-400 text-white'
            : rank === 2
            ? 'bg-gray-400 text-white'
            : rank === 3
            ? 'bg-orange-400 text-white'
            : zone === 'promotion'
            ? 'bg-green-200 text-green-700'
            : zone === 'relegation'
            ? 'bg-red-200 text-red-700'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
      </div>

      {/* 아바타 */}
      <div className="text-2xl">{user.avatar}</div>

      {/* 정보 */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className={`font-bold ${user.isCurrentUser ? 'text-primary-600' : 'text-foreground'}`}>
            {user.name}
          </p>
          {user.isCurrentUser && (
            <span className="text-xs bg-primary-500 text-white px-1.5 py-0.5 rounded">나</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="flex items-center gap-0.5">
            <Flame className="w-3 h-3 text-orange-400" />
            {user.streak}일
          </span>
        </div>
      </div>

      {/* XP */}
      <div className="flex items-center gap-1 text-primary-600">
        <Zap className="w-4 h-4" />
        <span className="font-bold">{user.weeklyXP}</span>
        <span className="text-xs text-gray-400">XP</span>
      </div>
    </motion.div>
  );
}

// 가족 포디움 아이템
function FamilyPodiumItem({ member, rank }: { member: any; rank: number }) {
  const getMedalColor = (r: number) => {
    switch (r) {
      case 1:
        return 'from-yellow-400 to-amber-500';
      case 2:
        return 'from-gray-300 to-gray-400';
      case 3:
        return 'from-orange-400 to-orange-500';
      default:
        return 'from-gray-200 to-gray-300';
    }
  };

  const getPodiumHeight = (r: number) => {
    switch (r) {
      case 1:
        return 'h-24';
      case 2:
        return 'h-16';
      case 3:
        return 'h-12';
      default:
        return 'h-10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank === 1 ? 0.1 : rank === 2 ? 0 : 0.2 }}
      className="flex flex-col items-center"
    >
      {/* 아바타 */}
      <div className="relative mb-2">
        {rank === 1 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="absolute -top-4 left-1/2 -translate-x-1/2"
          >
            <Crown className="w-6 h-6 text-yellow-500" />
          </motion.div>
        )}
        <div className={`rounded-full p-0.5 bg-gradient-to-br ${getMedalColor(rank)}`}>
          <Avatar
            avatar={member.avatar}
            avatarUrl={member.avatarUrl}
            size={rank === 1 ? 'lg' : 'md'}
            className="ring-2 ring-white"
          />
        </div>
        <div
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${getMedalColor(
            rank
          )}`}
        >
          {rank}
        </div>
      </div>

      {/* 이름 */}
      <p className={`font-bold text-foreground ${rank === 1 ? 'text-sm' : 'text-xs'}`}>
        {member.name}
      </p>

      {/* XP */}
      <div className="flex items-center gap-0.5 text-primary-600 text-xs">
        <Zap className="w-3 h-3" />
        <span className="font-semibold">{member.weeklyXp}</span>
      </div>

      {/* 포디움 */}
      <div
        className={`${getPodiumHeight(
          rank
        )} w-16 mt-2 rounded-t-lg bg-gradient-to-br ${getMedalColor(
          rank
        )} flex items-center justify-center`}
      >
        <span className="text-white font-bold">{rank}</span>
      </div>
    </motion.div>
  );
}
