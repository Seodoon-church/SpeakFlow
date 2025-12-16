import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { JourneyLocation, JourneyScenario } from '@/data/journey';
import { JOURNEY_CHAPTERS as chapters } from '@/data/journey';

// =====================
// Types
// =====================
interface ScenarioProgress {
  scenarioId: string;
  completedAt: string;
  score: number; // 0-100
  phrasesMastered: number;
  totalPhrases: number;
}

interface LocationProgress {
  locationId: string;
  unlockedAt: string;
  mastery: number; // 0-100
  completedScenarios: string[];
}

interface JourneyState {
  // 현재 상태
  currentChapterId: string;
  currentLocationId: string | null;
  currentScenarioId: string | null;

  // 진행 상황
  completedScenarios: Record<string, ScenarioProgress>;
  locationProgress: Record<string, LocationProgress>;
  unlockedLocations: string[];
  totalJourneyXp: number;

  // Actions
  setCurrentChapter: (chapterId: string) => void;
  setCurrentLocation: (locationId: string | null) => void;
  setCurrentScenario: (scenarioId: string | null) => void;

  completeScenario: (scenarioId: string, score: number, phrasesMastered: number, totalPhrases: number) => number;
  unlockLocation: (locationId: string) => void;

  getLocationMastery: (locationId: string) => number;
  isLocationUnlocked: (locationId: string) => boolean;
  isScenarioCompleted: (scenarioId: string) => boolean;
  getScenarioProgress: (scenarioId: string) => ScenarioProgress | null;

  getChapterProgress: (chapterId: string) => { completed: number; total: number; percentage: number };
  getTotalProgress: () => { completed: number; total: number; percentage: number };

  // Helpers
  getLocation: (locationId: string) => JourneyLocation | null;
  getScenario: (scenarioId: string) => JourneyScenario | null;
  getAvailableLocations: (chapterId: string) => JourneyLocation[];

  resetProgress: () => void;
}

// =====================
// Helper Functions
// =====================
const getFirstChapterId = (): string => {
  return chapters[0]?.id || 'chapter-1';
};

const getFirstLocationId = (): string | null => {
  const firstChapter = chapters[0];
  return firstChapter?.locations[0]?.id || null;
};

const findLocation = (locationId: string): JourneyLocation | null => {
  for (const chapter of chapters) {
    const location = chapter.locations.find(loc => loc.id === locationId);
    if (location) return location;
  }
  return null;
};

const findScenario = (scenarioId: string): JourneyScenario | null => {
  for (const chapter of chapters) {
    for (const location of chapter.locations) {
      const scenario = location.scenarios.find(s => s.id === scenarioId);
      if (scenario) return scenario;
    }
  }
  return null;
};

const findLocationByScenario = (scenarioId: string): JourneyLocation | null => {
  for (const chapter of chapters) {
    for (const location of chapter.locations) {
      if (location.scenarios.some(s => s.id === scenarioId)) {
        return location;
      }
    }
  }
  return null;
};

// =====================
// Journey Store
// =====================
export const useJourneyStore = create<JourneyState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentChapterId: getFirstChapterId(),
      currentLocationId: null,
      currentScenarioId: null,
      completedScenarios: {},
      locationProgress: {},
      unlockedLocations: [getFirstLocationId() || ''],
      totalJourneyXp: 0,

      // Actions
      setCurrentChapter: (chapterId) => {
        set({ currentChapterId: chapterId });
      },

      setCurrentLocation: (locationId) => {
        set({ currentLocationId: locationId });
      },

      setCurrentScenario: (scenarioId) => {
        set({ currentScenarioId: scenarioId });
      },

      completeScenario: (scenarioId, score, phrasesMastered, totalPhrases) => {
        const { completedScenarios, locationProgress, unlockedLocations, totalJourneyXp } = get();

        // 시나리오 찾기
        const scenario = findScenario(scenarioId);
        const location = findLocationByScenario(scenarioId);

        if (!scenario || !location) return 0;

        // XP 계산 (점수에 따른 보너스)
        const baseXp = scenario.xpReward;
        const scoreBonus = Math.floor(baseXp * (score / 100) * 0.5);
        const xpEarned = baseXp + scoreBonus;

        // 시나리오 진행 상황 저장
        const newCompletedScenarios = {
          ...completedScenarios,
          [scenarioId]: {
            scenarioId,
            completedAt: new Date().toISOString(),
            score,
            phrasesMastered,
            totalPhrases,
          },
        };

        // 위치 진행 상황 업데이트
        const currentLocProgress = locationProgress[location.id] || {
          locationId: location.id,
          unlockedAt: new Date().toISOString(),
          mastery: 0,
          completedScenarios: [],
        };

        const completedScenariosForLocation = [
          ...new Set([...currentLocProgress.completedScenarios, scenarioId])
        ];

        // 마스터리 계산 (완료된 시나리오 비율)
        const mastery = Math.round(
          (completedScenariosForLocation.length / location.scenarios.length) * 100
        );

        const newLocationProgress = {
          ...locationProgress,
          [location.id]: {
            ...currentLocProgress,
            mastery,
            completedScenarios: completedScenariosForLocation,
          },
        };

        // 다음 위치 잠금 해제 체크
        let newUnlockedLocations = [...unlockedLocations];

        if (mastery >= location.requiredMastery) {
          // 현재 챕터에서 다음 위치 찾기
          for (const chapter of chapters) {
            const locationIndex = chapter.locations.findIndex(l => l.id === location.id);
            if (locationIndex !== -1 && locationIndex < chapter.locations.length - 1) {
              const nextLocation = chapter.locations[locationIndex + 1];
              if (!newUnlockedLocations.includes(nextLocation.id)) {
                newUnlockedLocations.push(nextLocation.id);
              }
            }
          }
        }

        set({
          completedScenarios: newCompletedScenarios,
          locationProgress: newLocationProgress,
          unlockedLocations: newUnlockedLocations,
          totalJourneyXp: totalJourneyXp + xpEarned,
        });

        return xpEarned;
      },

      unlockLocation: (locationId) => {
        const { unlockedLocations } = get();
        if (!unlockedLocations.includes(locationId)) {
          set({ unlockedLocations: [...unlockedLocations, locationId] });
        }
      },

      getLocationMastery: (locationId) => {
        const { locationProgress } = get();
        return locationProgress[locationId]?.mastery || 0;
      },

      isLocationUnlocked: (locationId) => {
        const { unlockedLocations } = get();
        return unlockedLocations.includes(locationId);
      },

      isScenarioCompleted: (scenarioId) => {
        const { completedScenarios } = get();
        return !!completedScenarios[scenarioId];
      },

      getScenarioProgress: (scenarioId) => {
        const { completedScenarios } = get();
        return completedScenarios[scenarioId] || null;
      },

      getChapterProgress: (chapterId) => {
        const { completedScenarios } = get();
        const chapter = chapters.find(c => c.id === chapterId);

        if (!chapter) {
          return { completed: 0, total: 0, percentage: 0 };
        }

        let completed = 0;
        let total = 0;

        for (const location of chapter.locations) {
          for (const scenario of location.scenarios) {
            total++;
            if (completedScenarios[scenario.id]) {
              completed++;
            }
          }
        }

        return {
          completed,
          total,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      },

      getTotalProgress: () => {
        const { completedScenarios } = get();

        let completed = 0;
        let total = 0;

        for (const chapter of chapters) {
          for (const location of chapter.locations) {
            for (const scenario of location.scenarios) {
              total++;
              if (completedScenarios[scenario.id]) {
                completed++;
              }
            }
          }
        }

        return {
          completed,
          total,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      },

      getLocation: (locationId) => findLocation(locationId),

      getScenario: (scenarioId) => findScenario(scenarioId),

      getAvailableLocations: (chapterId) => {
        const { unlockedLocations } = get();
        const chapter = chapters.find(c => c.id === chapterId);

        if (!chapter) return [];

        return chapter.locations.filter(loc => unlockedLocations.includes(loc.id));
      },

      resetProgress: () => {
        set({
          currentChapterId: getFirstChapterId(),
          currentLocationId: null,
          currentScenarioId: null,
          completedScenarios: {},
          locationProgress: {},
          unlockedLocations: [getFirstLocationId() || ''],
          totalJourneyXp: 0,
        });
      },
    }),
    {
      name: 'speakflow-journey',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentChapterId: state.currentChapterId,
        currentLocationId: state.currentLocationId,
        completedScenarios: state.completedScenarios,
        locationProgress: state.locationProgress,
        unlockedLocations: state.unlockedLocations,
        totalJourneyXp: state.totalJourneyXp,
      }),
    }
  )
);
