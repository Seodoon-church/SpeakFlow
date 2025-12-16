import { useCallback } from 'react';
import { useFamilyStore, useGamificationStore, XP_REWARDS, BADGES, getXpProgress } from '@/stores';

/**
 * 게이미피케이션 기능을 쉽게 사용하기 위한 커스텀 훅
 * familyStore와 gamificationStore를 연동합니다.
 */
export function useGamification() {
  const { currentMemberId, getCurrentMember, recordActivity } = useFamilyStore();
  const {
    initMemberData,
    addXp,
    updateStreak,
    getMemberData,
    hasBadge,
    checkAndAwardBadges,
    getEncouragement,
    getStreakMessage,
    getFamilyRanking,
    getWeeklyFamilyRanking,
  } = useGamificationStore();

  // 현재 멤버의 게이미피케이션 데이터 초기화
  const initCurrentMember = useCallback(() => {
    if (currentMemberId) {
      initMemberData(currentMemberId);
    }
  }, [currentMemberId, initMemberData]);

  // 현재 멤버의 게이미피케이션 데이터 가져오기
  const getCurrentMemberData = useCallback(() => {
    if (!currentMemberId) return null;
    return getMemberData(currentMemberId);
  }, [currentMemberId, getMemberData]);

  // 청크 학습 완료 시 호출
  const onChunkLearned = useCallback(() => {
    if (!currentMemberId) return;
    addXp(currentMemberId, XP_REWARDS.chunkLearned);
    return XP_REWARDS.chunkLearned;
  }, [currentMemberId, addXp]);

  // 청크 복습 완료 시 호출
  const onChunkReviewed = useCallback(() => {
    if (!currentMemberId) return;
    addXp(currentMemberId, XP_REWARDS.chunkReviewed);
    return XP_REWARDS.chunkReviewed;
  }, [currentMemberId, addXp]);

  // 섀도잉 완료 시 호출
  const onShadowingComplete = useCallback(() => {
    if (!currentMemberId) return;
    addXp(currentMemberId, XP_REWARDS.shadowingComplete);
    return XP_REWARDS.shadowingComplete;
  }, [currentMemberId, addXp]);

  // 롤플레이 완료 시 호출
  const onRoleplayComplete = useCallback(() => {
    if (!currentMemberId) return;
    addXp(currentMemberId, XP_REWARDS.roleplayComplete);
    return XP_REWARDS.roleplayComplete;
  }, [currentMemberId, addXp]);

  // 일일 미션 완료 시 호출
  const onDailyMissionComplete = useCallback(() => {
    if (!currentMemberId) return;
    addXp(currentMemberId, XP_REWARDS.dailyMissionComplete);
    return XP_REWARDS.dailyMissionComplete;
  }, [currentMemberId, addXp]);

  // 학습 세션 완료 시 호출 (familyStore와 gamificationStore 동시 업데이트)
  const onSessionComplete = useCallback((minutes: number, chunksLearned: number) => {
    if (!currentMemberId) return;

    // familyStore 업데이트
    recordActivity(currentMemberId, minutes, chunksLearned);

    // gamificationStore 업데이트 (스트릭, 주간 진행)
    updateStreak(currentMemberId);

    // 새로 획득한 배지 확인
    const newBadges = checkAndAwardBadges(currentMemberId);

    return newBadges;
  }, [currentMemberId, recordActivity, updateStreak, checkAndAwardBadges]);

  // XP 진행 상황 가져오기
  const getProgress = useCallback(() => {
    const data = getCurrentMemberData();
    if (!data) return { current: 0, required: 100, percentage: 0 };
    return getXpProgress(data.xp);
  }, [getCurrentMemberData]);

  // 일일 목표 달성률 가져오기
  const getDailyProgress = useCallback(() => {
    const data = getCurrentMemberData();
    if (!data) return { current: 0, goal: 50, percentage: 0 };
    return {
      current: data.todayXp,
      goal: data.dailyGoalXp,
      percentage: Math.min(100, Math.round((data.todayXp / data.dailyGoalXp) * 100)),
    };
  }, [getCurrentMemberData]);

  // 주간 목표 달성률 가져오기
  const getWeeklyProgress = useCallback(() => {
    const data = getCurrentMemberData();
    const { weeklyGoalXp } = useGamificationStore.getState();
    if (!data) return { current: 0, goal: weeklyGoalXp, percentage: 0 };
    return {
      current: data.weeklyProgress.xpEarned,
      goal: weeklyGoalXp,
      percentage: Math.min(100, Math.round((data.weeklyProgress.xpEarned / weeklyGoalXp) * 100)),
    };
  }, [getCurrentMemberData]);

  // 배지 정보 가져오기 (획득 여부 포함)
  const getBadgesWithStatus = useCallback(() => {
    if (!currentMemberId) return [];
    return BADGES.map(badge => ({
      ...badge,
      earned: hasBadge(currentMemberId, badge.id),
    }));
  }, [currentMemberId, hasBadge]);

  // 획득한 배지만 가져오기
  const getEarnedBadges = useCallback(() => {
    const data = getCurrentMemberData();
    if (!data) return [];
    return data.badges.map(earned => {
      const badgeInfo = BADGES.find(b => b.id === earned.id);
      return {
        ...earned,
        ...badgeInfo,
      };
    });
  }, [getCurrentMemberData]);

  return {
    // 현재 멤버 정보
    currentMemberId,
    getCurrentMember,
    getCurrentMemberData,
    initCurrentMember,

    // XP/레벨 관련
    getProgress,
    getDailyProgress,
    getWeeklyProgress,

    // 학습 이벤트
    onChunkLearned,
    onChunkReviewed,
    onShadowingComplete,
    onRoleplayComplete,
    onDailyMissionComplete,
    onSessionComplete,

    // 배지 관련
    getBadgesWithStatus,
    getEarnedBadges,
    hasBadge: (badgeId: string) => currentMemberId ? hasBadge(currentMemberId, badgeId) : false,

    // 메시지
    getEncouragement,
    getStreakMessage,

    // 랭킹
    getFamilyRanking,
    getWeeklyFamilyRanking,
  };
}

export default useGamification;
