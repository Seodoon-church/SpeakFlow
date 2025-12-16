import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Crown,
  Flame,
  ChevronLeft,
  Zap,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useFamilyStore, useGamificationStore, TRACKS } from '@/stores';
import { Avatar } from '@/components/common';

type RankingTab = 'total' | 'weekly';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { members, currentMemberId } = useFamilyStore();
  const { memberData, initMemberData } = useGamificationStore();
  const [activeTab, setActiveTab] = useState<RankingTab>('total');

  // 모든 멤버의 게이미피케이션 데이터 초기화
  useEffect(() => {
    members.forEach((member) => {
      initMemberData(member.id);
    });
  }, [members, initMemberData]);

  // 랭킹 데이터 생성
  const getRankingData = () => {
    return members
      .map((member) => {
        const gamification = memberData[member.id] || {
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
          xp: gamification.xp,
          level: gamification.level,
          weeklyXp: gamification.weeklyProgress.xpEarned,
          streak: gamification.streak.current,
          badges: gamification.badges.length,
        };
      })
      .sort((a, b) => {
        if (activeTab === 'weekly') {
          return b.weeklyXp - a.weeklyXp;
        }
        return b.xp - a.xp;
      });
  };

  const rankingData = getRankingData();
  const top3 = rankingData.slice(0, 3);
  const rest = rankingData.slice(3);

  // 현재 사용자 랭킹 찾기
  const currentUserRank = rankingData.findIndex((m) => m.id === currentMemberId) + 1;
  const currentUserData = rankingData.find((m) => m.id === currentMemberId);

  // 포디움 순서: 2등, 1등, 3등
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  // 메달 색상
  const getMedalColor = (rank: number) => {
    switch (rank) {
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

  // 포디움 높이
  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1:
        return 'h-28';
      case 2:
        return 'h-20';
      case 3:
        return 'h-14';
      default:
        return 'h-10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-accent-50">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
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
                <Trophy className="w-5 h-5" />
                가족 리더보드
              </h1>
              <p className="text-primary-100 text-xs">
                함께 성장하는 우리 가족
              </p>
            </div>
          </div>

          {/* 내 순위 카드 */}
          {currentUserData && (
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar
                    avatar={currentUserData.avatar}
                    avatarUrl={currentUserData.avatarUrl}
                    size="lg"
                    className="ring-2 ring-white/50"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white text-primary-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow">
                    {currentUserRank}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-bold">{currentUserData.name}</p>
                  <p className="text-primary-100 text-sm">
                    Lv.{currentUserData.level} · {activeTab === 'weekly' ? currentUserData.weeklyXp : currentUserData.xp} XP
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-300">
                    <Flame className="w-4 h-4" />
                    <span className="font-bold">{currentUserData.streak}</span>
                  </div>
                  <p className="text-primary-200 text-xs">연속 학습</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 탭 */}
        <div className="flex px-4 gap-2 pb-4">
          <button
            onClick={() => setActiveTab('total')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'total'
                ? 'bg-white text-primary-600'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            전체 랭킹
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'weekly'
                ? 'bg-white text-primary-600'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            이번 주
          </button>
        </div>
      </header>

      {/* 포디움 (Top 3) */}
      {top3.length > 0 && (
        <div className="px-4 py-6">
          <div className="flex items-end justify-center gap-3">
            {podiumOrder.map((member, index) => {
              if (!member) return null;
              const actualRank = top3.indexOf(member) + 1;
              const xpToShow = activeTab === 'weekly' ? member.weeklyXp : member.xp;

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex flex-col items-center ${actualRank === 1 ? 'order-2' : actualRank === 2 ? 'order-1' : 'order-3'}`}
                >
                  {/* 아바타 */}
                  <div className="relative mb-2">
                    {actualRank === 1 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                        className="absolute -top-4 left-1/2 -translate-x-1/2"
                      >
                        <Crown className="w-8 h-8 text-yellow-500 drop-shadow-lg" />
                      </motion.div>
                    )}
                    <div
                      className={`rounded-full p-1 ${
                        actualRank === 1
                          ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                          : actualRank === 2
                          ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                          : 'bg-gradient-to-br from-orange-400 to-orange-500'
                      }`}
                    >
                      <Avatar
                        avatar={member.avatar}
                        avatarUrl={member.avatarUrl}
                        size={actualRank === 1 ? 'xl' : 'lg'}
                        className="ring-2 ring-white"
                      />
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg bg-gradient-to-br ${getMedalColor(actualRank)}`}
                    >
                      {actualRank}
                    </div>
                  </div>

                  {/* 이름 */}
                  <p className={`font-bold text-foreground ${actualRank === 1 ? 'text-base' : 'text-sm'}`}>
                    {member.name}
                  </p>

                  {/* XP */}
                  <div className="flex items-center gap-1 text-primary-600 text-sm">
                    <Zap className="w-3 h-3" />
                    <span className="font-semibold">{xpToShow}</span>
                  </div>

                  {/* 포디움 */}
                  <div
                    className={`${getPodiumHeight(actualRank)} w-20 mt-2 rounded-t-lg bg-gradient-to-br ${getMedalColor(actualRank)} flex items-center justify-center`}
                  >
                    <span className="text-white font-bold text-lg">{actualRank}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 나머지 랭킹 */}
      <div className="px-4 pb-24">
        <AnimatePresence>
          {rest.map((member, index) => {
            const rank = index + 4;
            const xpToShow = activeTab === 'weekly' ? member.weeklyXp : member.xp;
            const isCurrentUser = member.id === currentMemberId;
            const track = TRACKS.find((t) => t.id === member.trackId);

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl p-4 mb-2 shadow-sm ${
                  isCurrentUser ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* 순위 */}
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="font-bold text-gray-500 text-sm">{rank}</span>
                  </div>

                  {/* 아바타 */}
                  <Avatar
                    avatar={member.avatar}
                    avatarUrl={member.avatarUrl}
                    size="md"
                  />

                  {/* 정보 */}
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

                  {/* XP */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-primary-600">
                      <Zap className="w-4 h-4" />
                      <span className="font-bold">{xpToShow}</span>
                    </div>
                    <p className="text-xs text-gray-400">XP</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* 빈 상태 */}
        {rankingData.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">아직 랭킹 데이터가 없어요</p>
            <p className="text-gray-400 text-sm">학습을 시작하면 랭킹이 표시됩니다</p>
          </div>
        )}

        {/* 동기부여 메시지 */}
        {currentUserRank > 1 && currentUserData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl p-4 border border-accent-100"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {rankingData[currentUserRank - 2]?.name}님까지{' '}
                  <span className="text-primary-600">
                    {(activeTab === 'weekly'
                      ? rankingData[currentUserRank - 2]?.weeklyXp
                      : rankingData[currentUserRank - 2]?.xp) -
                      (activeTab === 'weekly' ? currentUserData.weeklyXp : currentUserData.xp)}
                    XP
                  </span>{' '}
                  차이!
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  오늘 학습으로 순위를 올려보세요!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 1등 축하 메시지 */}
        {currentUserRank === 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  축하합니다! 현재 1등이에요!
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  꾸준한 학습으로 1등 자리를 지켜보세요
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
