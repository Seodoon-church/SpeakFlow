import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { EnglishLocation, EnglishScenario, EnglishChapter } from '@/data/journey-en';
import { ENGLISH_JOURNEY_CHAPTERS, USA_JOURNEY_CHAPTERS, UK_JOURNEY_CHAPTERS } from '@/data/journey-en';

// =====================
// Types
// =====================
interface ScenarioProgress {
  scenarioId: string;
  completedAt: string;
  score: number;
  phrasesMastered: number;
  totalPhrases: number;
}

interface LocationProgress {
  locationId: string;
  unlockedAt: string;
  mastery: number;
  completedScenarios: string[];
}

type JourneyCountry = 'usa' | 'uk' | 'all';

interface JourneyEnState {
  // 현재 상태
  currentCountry: JourneyCountry;
  currentChapterId: string;
  currentLocationId: string | null;
  currentScenarioId: string | null;

  // 진행 상황
  completedScenarios: Record<string, ScenarioProgress>;
  locationProgress: Record<string, LocationProgress>;
  unlockedLocations: string[];
  totalJourneyXp: number;

  // Actions
  setCurrentCountry: (country: JourneyCountry) => void;
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
  getCountryProgress: (country: 'usa' | 'uk') => { completed: number; total: number; percentage: number };

  // Helpers
  getChapters: () => EnglishChapter[];
  getLocation: (locationId: string) => EnglishLocation | null;
  getScenario: (scenarioId: string) => EnglishScenario | null;

  resetProgress: () => void;
}

// =====================
// Helper Functions
// =====================
const getChaptersByCountry = (country: JourneyCountry): EnglishChapter[] => {
  switch (country) {
    case 'usa':
      return USA_JOURNEY_CHAPTERS;
    case 'uk':
      return UK_JOURNEY_CHAPTERS;
    default:
      return ENGLISH_JOURNEY_CHAPTERS;
  }
};

const getFirstChapterId = (country: JourneyCountry): string => {
  const chapters = getChaptersByCountry(country);
  return chapters[0]?.id || 'usa-chapter-1-nyc';
};

const getFirstLocationId = (country: JourneyCountry): string | null => {
  const chapters = getChaptersByCountry(country);
  return chapters[0]?.locations[0]?.id || null;
};

const findLocation = (locationId: string): EnglishLocation | null => {
  for (const chapter of ENGLISH_JOURNEY_CHAPTERS) {
    const location = chapter.locations.find(loc => loc.id === locationId);
    if (location) return location;
  }
  return null;
};

const findScenario = (scenarioId: string): EnglishScenario | null => {
  for (const chapter of ENGLISH_JOURNEY_CHAPTERS) {
    for (const location of chapter.locations) {
      const scenario = location.scenarios.find(s => s.id === scenarioId);
      if (scenario) return scenario;
    }
  }
  return null;
};

const findLocationByScenario = (scenarioId: string): EnglishLocation | null => {
  for (const chapter of ENGLISH_JOURNEY_CHAPTERS) {
    for (const location of chapter.locations) {
      if (location.scenarios.some(s => s.id === scenarioId)) {
        return location;
      }
    }
  }
  return null;
};

// =====================
// Journey English Store
// =====================
export const useJourneyEnStore = create<JourneyEnState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentCountry: 'usa',
      currentChapterId: getFirstChapterId('usa'),
      currentLocationId: null,
      currentScenarioId: null,
      completedScenarios: {},
      locationProgress: {},
      unlockedLocations: [getFirstLocationId('usa') || '', getFirstLocationId('uk') || ''],
      totalJourneyXp: 0,

      // Actions
      setCurrentCountry: (country) => {
        const chapters = getChaptersByCountry(country);
        set({
          currentCountry: country,
          currentChapterId: chapters[0]?.id || '',
          currentLocationId: null,
          currentScenarioId: null,
        });
      },

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

        const scenario = findScenario(scenarioId);
        const location = findLocationByScenario(scenarioId);

        if (!scenario || !location) return 0;

        const baseXp = scenario.xpReward;
        const scoreBonus = Math.floor(baseXp * (score / 100) * 0.5);
        const xpEarned = baseXp + scoreBonus;

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

        const currentLocProgress = locationProgress[location.id] || {
          locationId: location.id,
          unlockedAt: new Date().toISOString(),
          mastery: 0,
          completedScenarios: [],
        };

        const completedScenariosForLocation = [
          ...new Set([...currentLocProgress.completedScenarios, scenarioId])
        ];

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

        let newUnlockedLocations = [...unlockedLocations];

        if (mastery >= location.requiredMastery) {
          for (const chapter of ENGLISH_JOURNEY_CHAPTERS) {
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
        const chapter = ENGLISH_JOURNEY_CHAPTERS.find(c => c.id === chapterId);

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

        for (const chapter of ENGLISH_JOURNEY_CHAPTERS) {
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

      getCountryProgress: (country) => {
        const { completedScenarios } = get();
        const chapters = country === 'usa' ? USA_JOURNEY_CHAPTERS : UK_JOURNEY_CHAPTERS;

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

      getChapters: () => {
        const { currentCountry } = get();
        return getChaptersByCountry(currentCountry);
      },

      getLocation: (locationId) => findLocation(locationId),

      getScenario: (scenarioId) => findScenario(scenarioId),

      resetProgress: () => {
        set({
          currentCountry: 'usa',
          currentChapterId: getFirstChapterId('usa'),
          currentLocationId: null,
          currentScenarioId: null,
          completedScenarios: {},
          locationProgress: {},
          unlockedLocations: [getFirstLocationId('usa') || '', getFirstLocationId('uk') || ''],
          totalJourneyXp: 0,
        });
      },
    }),
    {
      name: 'speakflow-journey-en',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentCountry: state.currentCountry,
        currentChapterId: state.currentChapterId,
        completedScenarios: state.completedScenarios,
        locationProgress: state.locationProgress,
        unlockedLocations: state.unlockedLocations,
        totalJourneyXp: state.totalJourneyXp,
      }),
    }
  )
);
