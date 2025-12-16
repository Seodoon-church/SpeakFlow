import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Vocabulary word with SRS fields
export interface VocabWord {
  id: string;
  word: string;           // Japanese word (kanji/kana)
  reading: string;        // Hiragana reading
  meaning: string;        // Korean meaning
  example?: string;       // Example sentence
  exampleMeaning?: string; // Example meaning
  source: string;         // Where it came from (lesson, jcontent, manual)
  sourceId?: string;      // Source content ID
  // SRS fields
  easeFactor: number;     // Default 2.5, affects interval calculation
  interval: number;       // Days until next review
  repetitions: number;    // Number of successful reviews
  nextReview: string;     // ISO date string (YYYY-MM-DD)
  lastReview: string | null;
  createdAt: string;
}

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;
// 0-2: Failed (reset)
// 3: Good (correct with difficulty)
// 4: Good (correct with some hesitation)
// 5: Easy (perfect recall)

export interface VocabularyState {
  words: Record<string, VocabWord>;
  _hasHydrated: boolean;

  // Actions
  addWord: (word: Omit<VocabWord, 'easeFactor' | 'interval' | 'repetitions' | 'nextReview' | 'lastReview' | 'createdAt'>) => void;
  addWordsFromContent: (sourceId: string, source: string, vocabList: Array<{
    word: string;
    reading: string;
    meaning: string;
    example?: string;
    exampleMeaning?: string;
  }>) => void;
  removeWord: (wordId: string) => void;
  reviewWord: (wordId: string, quality: ReviewQuality) => void;
  getDueWords: () => VocabWord[];
  getAllWords: () => VocabWord[];
  getLearnedCount: () => number;
  getMasteredCount: () => number;
  getLearningCount: () => number;
  getNewCount: () => number;
  setHasHydrated: (state: boolean) => void;
}

// SM-2 Algorithm for Spaced Repetition
const calculateNextReview = (word: VocabWord, quality: ReviewQuality): Partial<VocabWord> => {
  let { easeFactor, interval, repetitions } = word;

  if (quality < 3) {
    // Failed review - reset progress
    repetitions = 0;
    interval = 1;
  } else {
    // Successful review
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor based on quality
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReview: nextDate.toISOString().split('T')[0],
    lastReview: new Date().toISOString().split('T')[0],
  };
};

// Get mastery level based on SRS progress
export const getMasteryLevel = (word: VocabWord): {
  level: string;
  levelEn: string;
  color: string;
  bgColor: string;
  percent: number;
} => {
  if (word.repetitions === 0) {
    return { level: '새 단어', levelEn: 'New', color: 'text-gray-600', bgColor: 'bg-gray-100', percent: 0 };
  }
  if (word.interval < 7) {
    return { level: '학습 중', levelEn: 'Learning', color: 'text-amber-600', bgColor: 'bg-amber-100', percent: 33 };
  }
  if (word.interval < 21) {
    return { level: '익숙함', levelEn: 'Familiar', color: 'text-blue-600', bgColor: 'bg-blue-100', percent: 66 };
  }
  return { level: '마스터', levelEn: 'Mastered', color: 'text-green-600', bgColor: 'bg-green-100', percent: 100 };
};

// Get review button config
export const REVIEW_BUTTONS = [
  { quality: 1 as ReviewQuality, label: '다시', labelEn: 'Again', color: 'bg-red-100 text-red-600 hover:bg-red-200' },
  { quality: 2 as ReviewQuality, label: '어려움', labelEn: 'Hard', color: 'bg-orange-100 text-orange-600 hover:bg-orange-200' },
  { quality: 3 as ReviewQuality, label: '좋음', labelEn: 'Good', color: 'bg-blue-100 text-blue-600 hover:bg-blue-200' },
  { quality: 4 as ReviewQuality, label: '쉬움', labelEn: 'Easy', color: 'bg-green-100 text-green-600 hover:bg-green-200' },
];

export const useVocabularyStore = create<VocabularyState>()(
  persist(
    (set, get) => ({
      words: {},
      _hasHydrated: false,

      addWord: (wordData) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const id = wordData.id || `vocab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        if (state.words[id]) return state;

        return {
          words: {
            ...state.words,
            [id]: {
              ...wordData,
              id,
              easeFactor: 2.5,
              interval: 0,
              repetitions: 0,
              nextReview: today,
              lastReview: null,
              createdAt: today,
            },
          },
        };
      }),

      addWordsFromContent: (sourceId, source, vocabList) => set((state) => {
        const newWords = { ...state.words };
        const today = new Date().toISOString().split('T')[0];

        vocabList.forEach((vocab, index) => {
          const id = `${sourceId}-${index}`;
          if (!newWords[id]) {
            newWords[id] = {
              id,
              word: vocab.word,
              reading: vocab.reading,
              meaning: vocab.meaning,
              example: vocab.example,
              exampleMeaning: vocab.exampleMeaning,
              source,
              sourceId,
              easeFactor: 2.5,
              interval: 0,
              repetitions: 0,
              nextReview: today,
              lastReview: null,
              createdAt: today,
            };
          }
        });

        return { words: newWords };
      }),

      removeWord: (wordId) => set((state) => {
        const newWords = { ...state.words };
        delete newWords[wordId];
        return { words: newWords };
      }),

      reviewWord: (wordId, quality) => set((state) => {
        const word = state.words[wordId];
        if (!word) return state;

        const updates = calculateNextReview(word, quality);

        return {
          words: {
            ...state.words,
            [wordId]: { ...word, ...updates },
          },
        };
      }),

      getDueWords: () => {
        const { words } = get();
        const today = new Date().toISOString().split('T')[0];
        return Object.values(words)
          .filter(w => w.nextReview <= today)
          .sort((a, b) => a.nextReview.localeCompare(b.nextReview));
      },

      getAllWords: () => {
        const { words } = get();
        return Object.values(words).sort((a, b) => {
          // Sort by next review date, then alphabetically
          if (a.nextReview !== b.nextReview) {
            return a.nextReview.localeCompare(b.nextReview);
          }
          return a.word.localeCompare(b.word);
        });
      },

      getLearnedCount: () => Object.keys(get().words).length,

      getMasteredCount: () => {
        const { words } = get();
        return Object.values(words).filter(w => w.repetitions >= 3 && w.interval >= 21).length;
      },

      getLearningCount: () => {
        const { words } = get();
        return Object.values(words).filter(w => w.repetitions > 0 && w.interval < 21).length;
      },

      getNewCount: () => {
        const { words } = get();
        return Object.values(words).filter(w => w.repetitions === 0).length;
      },

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'speakflow-vocabulary',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ words: state.words }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Sample vocabulary for initial data
export const SAMPLE_VOCABULARY = [
  { word: 'ありがとう', reading: 'ありがとう', meaning: '고마워요', example: 'ありがとうございます。', exampleMeaning: '감사합니다.' },
  { word: 'おはよう', reading: 'おはよう', meaning: '좋은 아침', example: 'おはようございます。', exampleMeaning: '좋은 아침이에요.' },
  { word: 'すみません', reading: 'すみません', meaning: '실례합니다 / 죄송합니다', example: 'すみません、駅はどこですか？', exampleMeaning: '실례합니다, 역은 어디인가요?' },
  { word: '大丈夫', reading: 'だいじょうぶ', meaning: '괜찮아', example: '大丈夫ですか？', exampleMeaning: '괜찮으세요?' },
  { word: '美味しい', reading: 'おいしい', meaning: '맛있다', example: 'このラーメンは美味しい！', exampleMeaning: '이 라멘 맛있어!' },
  { word: '可愛い', reading: 'かわいい', meaning: '귀엽다', example: 'この猫は可愛いです。', exampleMeaning: '이 고양이는 귀여워요.' },
  { word: '難しい', reading: 'むずかしい', meaning: '어렵다', example: '日本語は難しいです。', exampleMeaning: '일본어는 어려워요.' },
  { word: '楽しい', reading: 'たのしい', meaning: '즐겁다', example: '旅行は楽しかった。', exampleMeaning: '여행은 즐거웠어.' },
  { word: '好き', reading: 'すき', meaning: '좋아하다', example: 'アニメが好きです。', exampleMeaning: '애니메이션을 좋아해요.' },
  { word: '分かる', reading: 'わかる', meaning: '알다 / 이해하다', example: '分かりました！', exampleMeaning: '알겠습니다!' },
];
