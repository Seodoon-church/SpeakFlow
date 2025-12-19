import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// CEFR 레벨
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// 카테고리
export type WordCategory = 'daily' | 'business' | 'travel' | 'academic' | 'tech' | 'beauty' | 'food' | 'entertainment';

// 품사
export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'phrase';

// 단어 인터페이스
export interface Word {
  id: string;
  word: string;
  pronunciation?: string;  // IPA 발음 기호
  meaning: string;         // 한국어 의미
  meanings?: string[];     // 다중 의미
  example?: string;        // 예문
  exampleMeaning?: string; // 예문 번역
  category: WordCategory;
  level: CEFRLevel;
  partOfSpeech: PartOfSpeech;
  synonyms?: string[];
  antonyms?: string[];
  // SRS 필드
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  lastReview: string | null;
  createdAt: string;
  // 퀴즈 통계
  correctCount: number;
  incorrectCount: number;
}

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

// 퀴즈 모드
export type QuizMode = 'choice' | 'flashcard' | 'listening' | 'typing' | 'timeattack';

// 퀴즈 문제
export interface QuizQuestion {
  word: Word;
  type: 'eng-to-kor' | 'kor-to-eng' | 'listening' | 'fill-blank';
  options?: string[];
  correctAnswer: string;
}

// 퀴즈 세션
export interface QuizSession {
  id: string;
  mode: QuizMode;
  category?: WordCategory;
  level?: CEFRLevel;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  startedAt: string;
  completedAt?: string;
}

interface WordState {
  words: Record<string, Word>;
  currentSession: QuizSession | null;
  _hasHydrated: boolean;

  // 단어 관리
  addWord: (word: Omit<Word, 'easeFactor' | 'interval' | 'repetitions' | 'nextReview' | 'lastReview' | 'createdAt' | 'correctCount' | 'incorrectCount'>) => void;
  addWords: (words: Array<Omit<Word, 'easeFactor' | 'interval' | 'repetitions' | 'nextReview' | 'lastReview' | 'createdAt' | 'correctCount' | 'incorrectCount'>>) => void;
  removeWord: (wordId: string) => void;

  // SRS 복습
  reviewWord: (wordId: string, quality: ReviewQuality) => void;
  getDueWords: () => Word[];

  // 단어 조회
  getAllWords: () => Word[];
  getWordsByLevel: (level: CEFRLevel) => Word[];
  getWordsByCategory: (category: WordCategory) => Word[];

  // 통계
  getTotalCount: () => number;
  getMasteredCount: () => number;
  getLearningCount: () => number;
  getNewCount: () => number;
  getDueCount: () => number;

  // 퀴즈
  startQuiz: (mode: QuizMode, options?: { category?: WordCategory; level?: CEFRLevel; count?: number }) => void;
  answerQuestion: (answer: string) => boolean;
  nextQuestion: () => void;
  endQuiz: () => void;

  setHasHydrated: (state: boolean) => void;
}

// SM-2 알고리즘
const calculateNextReview = (word: Word, quality: ReviewQuality): Partial<Word> => {
  let { easeFactor, interval, repetitions } = word;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

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

// 숙련도 레벨
export const getWordMastery = (word: Word): {
  level: string;
  color: string;
  bgColor: string;
  percent: number;
} => {
  if (word.repetitions === 0) {
    return { level: '새 단어', color: 'text-gray-600', bgColor: 'bg-gray-100', percent: 0 };
  }
  if (word.interval < 7) {
    return { level: '학습 중', color: 'text-amber-600', bgColor: 'bg-amber-100', percent: 33 };
  }
  if (word.interval < 21) {
    return { level: '익숙함', color: 'text-blue-600', bgColor: 'bg-blue-100', percent: 66 };
  }
  return { level: '마스터', color: 'text-green-600', bgColor: 'bg-green-100', percent: 100 };
};

// 카테고리 정보
export const WORD_CATEGORIES: Record<WordCategory, { name: string; icon: string; color: string }> = {
  daily: { name: '일상 생활', icon: '🏠', color: 'bg-blue-500' },
  business: { name: '비즈니스', icon: '💼', color: 'bg-indigo-500' },
  travel: { name: '여행', icon: '✈️', color: 'bg-cyan-500' },
  academic: { name: '학술/시험', icon: '🎓', color: 'bg-purple-500' },
  tech: { name: '테크', icon: '💻', color: 'bg-gray-700' },
  beauty: { name: '뷰티', icon: '💄', color: 'bg-pink-500' },
  food: { name: '음식', icon: '🍕', color: 'bg-orange-500' },
  entertainment: { name: '엔터테인먼트', icon: '🎬', color: 'bg-red-500' },
};

// CEFR 레벨 정보
export const CEFR_LEVELS: Record<CEFRLevel, { name: string; description: string; color: string }> = {
  A1: { name: 'A1 입문', description: '기초 표현, 일상 인사', color: 'bg-green-500' },
  A2: { name: 'A2 초급', description: '기본 대화, 간단한 설명', color: 'bg-lime-500' },
  B1: { name: 'B1 중급', description: '일상적 주제 대화', color: 'bg-yellow-500' },
  B2: { name: 'B2 중상급', description: '복잡한 주제 토론', color: 'bg-orange-500' },
  C1: { name: 'C1 고급', description: '전문적/학술적 언어', color: 'bg-red-500' },
  C2: { name: 'C2 원어민급', description: '완벽한 숙달', color: 'bg-purple-500' },
};

// 퀴즈 생성
const generateQuizQuestions = (
  words: Word[],
  allWords: Word[],
  count: number = 10
): QuizQuestion[] => {
  const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, count);

  return shuffled.map((word) => {
    const type = Math.random() > 0.5 ? 'eng-to-kor' : 'kor-to-eng';

    // 오답 생성 (같은 레벨에서 우선 선택)
    const otherWords = allWords
      .filter(w => w.id !== word.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = type === 'eng-to-kor'
      ? [word.meaning, ...otherWords.map(w => w.meaning)].sort(() => Math.random() - 0.5)
      : [word.word, ...otherWords.map(w => w.word)].sort(() => Math.random() - 0.5);

    return {
      word,
      type,
      options,
      correctAnswer: type === 'eng-to-kor' ? word.meaning : word.word,
    };
  });
};

export const useWordStore = create<WordState>()(
  persist(
    (set, get) => ({
      words: {},
      currentSession: null,
      _hasHydrated: false,

      addWord: (wordData) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const id = wordData.id || `word-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
              correctCount: 0,
              incorrectCount: 0,
            },
          },
        };
      }),

      addWords: (wordsData) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const newWords = { ...state.words };

        wordsData.forEach((wordData, index) => {
          const id = wordData.id || `word-${Date.now()}-${index}`;
          if (!newWords[id]) {
            newWords[id] = {
              ...wordData,
              id,
              easeFactor: 2.5,
              interval: 0,
              repetitions: 0,
              nextReview: today,
              lastReview: null,
              createdAt: today,
              correctCount: 0,
              incorrectCount: 0,
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
        const isCorrect = quality >= 3;

        return {
          words: {
            ...state.words,
            [wordId]: {
              ...word,
              ...updates,
              correctCount: isCorrect ? word.correctCount + 1 : word.correctCount,
              incorrectCount: isCorrect ? word.incorrectCount : word.incorrectCount + 1,
            },
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

      getAllWords: () => Object.values(get().words).sort((a, b) => a.word.localeCompare(b.word)),

      getWordsByLevel: (level) => {
        const { words } = get();
        return Object.values(words).filter(w => w.level === level);
      },

      getWordsByCategory: (category) => {
        const { words } = get();
        return Object.values(words).filter(w => w.category === category);
      },

      getTotalCount: () => Object.keys(get().words).length,

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

      getDueCount: () => get().getDueWords().length,

      startQuiz: (mode, options) => set((state) => {
        let wordsToQuiz = Object.values(state.words);

        if (options?.category) {
          wordsToQuiz = wordsToQuiz.filter(w => w.category === options.category);
        }
        if (options?.level) {
          wordsToQuiz = wordsToQuiz.filter(w => w.level === options.level);
        }

        if (wordsToQuiz.length < 4) {
          return state; // 최소 4개 단어 필요
        }

        const questions = generateQuizQuestions(
          wordsToQuiz,
          Object.values(state.words),
          options?.count || 10
        );

        return {
          currentSession: {
            id: `quiz-${Date.now()}`,
            mode,
            category: options?.category,
            level: options?.level,
            questions,
            currentIndex: 0,
            score: 0,
            startedAt: new Date().toISOString(),
          },
        };
      }),

      answerQuestion: (answer) => {
        const { currentSession, reviewWord } = get();
        if (!currentSession) return false;

        const question = currentSession.questions[currentSession.currentIndex];
        const isCorrect = answer === question.correctAnswer;

        // SRS 업데이트
        reviewWord(question.word.id, isCorrect ? 4 : 1);

        set((state) => ({
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                score: isCorrect ? state.currentSession.score + 1 : state.currentSession.score,
              }
            : null,
        }));

        return isCorrect;
      },

      nextQuestion: () => set((state) => {
        if (!state.currentSession) return state;

        const nextIndex = state.currentSession.currentIndex + 1;
        if (nextIndex >= state.currentSession.questions.length) {
          return {
            currentSession: {
              ...state.currentSession,
              completedAt: new Date().toISOString(),
            },
          };
        }

        return {
          currentSession: {
            ...state.currentSession,
            currentIndex: nextIndex,
          },
        };
      }),

      endQuiz: () => set({ currentSession: null }),

      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: 'speakflow-words',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ words: state.words }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// 영어 기본 단어 데이터
export const ENGLISH_WORDS: Array<Omit<Word, 'easeFactor' | 'interval' | 'repetitions' | 'nextReview' | 'lastReview' | 'createdAt' | 'correctCount' | 'incorrectCount'>> = [
  // A1 - 일상
  { id: 'a1-daily-1', word: 'hello', pronunciation: '/həˈloʊ/', meaning: '안녕하세요', example: 'Hello, how are you?', exampleMeaning: '안녕, 잘 지내?', category: 'daily', level: 'A1', partOfSpeech: 'phrase' },
  { id: 'a1-daily-2', word: 'goodbye', pronunciation: '/ɡʊdˈbaɪ/', meaning: '안녕히 가세요', example: 'Goodbye, see you tomorrow!', exampleMeaning: '안녕, 내일 봐!', category: 'daily', level: 'A1', partOfSpeech: 'phrase' },
  { id: 'a1-daily-3', word: 'thank you', pronunciation: '/θæŋk juː/', meaning: '감사합니다', example: 'Thank you for your help.', exampleMeaning: '도와주셔서 감사합니다.', category: 'daily', level: 'A1', partOfSpeech: 'phrase' },
  { id: 'a1-daily-4', word: 'sorry', pronunciation: '/ˈsɒri/', meaning: '미안해요', example: "I'm sorry for being late.", exampleMeaning: '늦어서 미안해요.', category: 'daily', level: 'A1', partOfSpeech: 'adjective' },
  { id: 'a1-daily-5', word: 'please', pronunciation: '/pliːz/', meaning: '제발, 부탁해요', example: 'Please help me.', exampleMeaning: '제발 도와주세요.', category: 'daily', level: 'A1', partOfSpeech: 'adverb' },
  { id: 'a1-daily-6', word: 'yes', pronunciation: '/jes/', meaning: '네, 예', example: 'Yes, I understand.', exampleMeaning: '네, 이해해요.', category: 'daily', level: 'A1', partOfSpeech: 'adverb' },
  { id: 'a1-daily-7', word: 'no', pronunciation: '/noʊ/', meaning: '아니요', example: 'No, thank you.', exampleMeaning: '아니요, 괜찮아요.', category: 'daily', level: 'A1', partOfSpeech: 'adverb' },
  { id: 'a1-daily-8', word: 'water', pronunciation: '/ˈwɔːtər/', meaning: '물', example: 'Can I have some water?', exampleMeaning: '물 좀 주시겠어요?', category: 'daily', level: 'A1', partOfSpeech: 'noun' },
  { id: 'a1-daily-9', word: 'food', pronunciation: '/fuːd/', meaning: '음식', example: 'The food is delicious.', exampleMeaning: '음식이 맛있어요.', category: 'daily', level: 'A1', partOfSpeech: 'noun' },
  { id: 'a1-daily-10', word: 'family', pronunciation: '/ˈfæmɪli/', meaning: '가족', example: 'I love my family.', exampleMeaning: '가족을 사랑해요.', category: 'daily', level: 'A1', partOfSpeech: 'noun' },

  // A2 - 일상
  { id: 'a2-daily-1', word: 'schedule', pronunciation: '/ˈskedʒuːl/', meaning: '일정, 스케줄', example: "What's your schedule today?", exampleMeaning: '오늘 일정이 어떻게 돼?', category: 'daily', level: 'A2', partOfSpeech: 'noun' },
  { id: 'a2-daily-2', word: 'appointment', pronunciation: '/əˈpɔɪntmənt/', meaning: '약속, 예약', example: 'I have a doctor\'s appointment.', exampleMeaning: '병원 예약이 있어요.', category: 'daily', level: 'A2', partOfSpeech: 'noun' },
  { id: 'a2-daily-3', word: 'comfortable', pronunciation: '/ˈkʌmftəbl/', meaning: '편안한', example: 'This chair is very comfortable.', exampleMeaning: '이 의자가 아주 편해요.', category: 'daily', level: 'A2', partOfSpeech: 'adjective' },
  { id: 'a2-daily-4', word: 'expensive', pronunciation: '/ɪkˈspensɪv/', meaning: '비싼', example: 'This bag is too expensive.', exampleMeaning: '이 가방은 너무 비싸요.', category: 'daily', level: 'A2', partOfSpeech: 'adjective' },
  { id: 'a2-daily-5', word: 'delicious', pronunciation: '/dɪˈlɪʃəs/', meaning: '맛있는', example: 'The pizza was delicious!', exampleMeaning: '피자가 맛있었어요!', category: 'daily', level: 'A2', partOfSpeech: 'adjective' },

  // B1 - 비즈니스
  { id: 'b1-biz-1', word: 'meeting', pronunciation: '/ˈmiːtɪŋ/', meaning: '회의', example: 'We have a meeting at 3 PM.', exampleMeaning: '오후 3시에 회의가 있어요.', category: 'business', level: 'B1', partOfSpeech: 'noun' },
  { id: 'b1-biz-2', word: 'deadline', pronunciation: '/ˈdedlaɪn/', meaning: '마감일', example: 'The deadline is next Friday.', exampleMeaning: '마감일은 다음 주 금요일이에요.', category: 'business', level: 'B1', partOfSpeech: 'noun' },
  { id: 'b1-biz-3', word: 'project', pronunciation: '/ˈprɒdʒekt/', meaning: '프로젝트', example: "I'm working on a new project.", exampleMeaning: '새 프로젝트를 진행하고 있어요.', category: 'business', level: 'B1', partOfSpeech: 'noun' },
  { id: 'b1-biz-4', word: 'presentation', pronunciation: '/ˌpreznˈteɪʃn/', meaning: '발표, 프레젠테이션', example: 'I have to give a presentation tomorrow.', exampleMeaning: '내일 발표를 해야 해요.', category: 'business', level: 'B1', partOfSpeech: 'noun' },
  { id: 'b1-biz-5', word: 'colleague', pronunciation: '/ˈkɒliːɡ/', meaning: '동료', example: 'She is my colleague.', exampleMeaning: '그녀는 제 동료예요.', category: 'business', level: 'B1', partOfSpeech: 'noun' },

  // B2 - 비즈니스
  { id: 'b2-biz-1', word: 'negotiate', pronunciation: '/nɪˈɡoʊʃieɪt/', meaning: '협상하다', example: 'We need to negotiate the contract terms.', exampleMeaning: '계약 조건을 협상해야 해요.', category: 'business', level: 'B2', partOfSpeech: 'verb' },
  { id: 'b2-biz-2', word: 'strategy', pronunciation: '/ˈstrætədʒi/', meaning: '전략', example: 'Our marketing strategy is working well.', exampleMeaning: '우리 마케팅 전략이 잘 되고 있어요.', category: 'business', level: 'B2', partOfSpeech: 'noun' },
  { id: 'b2-biz-3', word: 'implement', pronunciation: '/ˈɪmplɪment/', meaning: '실행하다, 구현하다', example: 'We will implement the new system next month.', exampleMeaning: '다음 달에 새 시스템을 구현할 거예요.', category: 'business', level: 'B2', partOfSpeech: 'verb' },
  { id: 'b2-biz-4', word: 'revenue', pronunciation: '/ˈrevənuː/', meaning: '수익, 매출', example: 'Our revenue increased by 20%.', exampleMeaning: '매출이 20% 증가했어요.', category: 'business', level: 'B2', partOfSpeech: 'noun' },
  { id: 'b2-biz-5', word: 'stakeholder', pronunciation: '/ˈsteɪkhoʊldər/', meaning: '이해관계자', example: 'We need to consider all stakeholders.', exampleMeaning: '모든 이해관계자를 고려해야 해요.', category: 'business', level: 'B2', partOfSpeech: 'noun' },

  // 여행
  { id: 'a1-travel-1', word: 'airport', pronunciation: '/ˈeərpɔːrt/', meaning: '공항', example: "I'm going to the airport.", exampleMeaning: '공항에 가고 있어요.', category: 'travel', level: 'A1', partOfSpeech: 'noun' },
  { id: 'a1-travel-2', word: 'hotel', pronunciation: '/hoʊˈtel/', meaning: '호텔', example: 'I booked a hotel room.', exampleMeaning: '호텔 방을 예약했어요.', category: 'travel', level: 'A1', partOfSpeech: 'noun' },
  { id: 'a2-travel-1', word: 'reservation', pronunciation: '/ˌrezərˈveɪʃn/', meaning: '예약', example: 'I have a reservation for two.', exampleMeaning: '2인 예약이 있어요.', category: 'travel', level: 'A2', partOfSpeech: 'noun' },
  { id: 'a2-travel-2', word: 'luggage', pronunciation: '/ˈlʌɡɪdʒ/', meaning: '짐, 수하물', example: 'Where can I pick up my luggage?', exampleMeaning: '짐은 어디서 찾나요?', category: 'travel', level: 'A2', partOfSpeech: 'noun' },
  { id: 'b1-travel-1', word: 'itinerary', pronunciation: '/aɪˈtɪnəreri/', meaning: '여행 일정', example: "Here's our travel itinerary.", exampleMeaning: '여기 여행 일정이에요.', category: 'travel', level: 'B1', partOfSpeech: 'noun' },

  // 학술/시험
  { id: 'b2-academic-1', word: 'hypothesis', pronunciation: '/haɪˈpɒθəsɪs/', meaning: '가설', example: 'We need to test our hypothesis.', exampleMeaning: '가설을 검증해야 해요.', category: 'academic', level: 'B2', partOfSpeech: 'noun' },
  { id: 'b2-academic-2', word: 'methodology', pronunciation: '/ˌmeθəˈdɒlədʒi/', meaning: '방법론', example: 'The research methodology is important.', exampleMeaning: '연구 방법론이 중요해요.', category: 'academic', level: 'B2', partOfSpeech: 'noun' },
  { id: 'c1-academic-1', word: 'dissertation', pronunciation: '/ˌdɪsərˈteɪʃn/', meaning: '학위논문', example: "I'm writing my dissertation.", exampleMeaning: '학위논문을 쓰고 있어요.', category: 'academic', level: 'C1', partOfSpeech: 'noun' },
  { id: 'c1-academic-2', word: 'peer-reviewed', pronunciation: '/pɪr rɪˈvjuːd/', meaning: '동료 심사된', example: 'This is a peer-reviewed journal.', exampleMeaning: '이것은 동료 심사 저널이에요.', category: 'academic', level: 'C1', partOfSpeech: 'adjective' },
  { id: 'c1-academic-3', word: 'empirical', pronunciation: '/ɪmˈpɪrɪkl/', meaning: '경험적인, 실증적인', example: 'We need empirical evidence.', exampleMeaning: '실증적 증거가 필요해요.', category: 'academic', level: 'C1', partOfSpeech: 'adjective' },

  // 뷰티
  { id: 'a2-beauty-1', word: 'skincare', pronunciation: '/ˈskɪnkeər/', meaning: '스킨케어', example: "What's your skincare routine?", exampleMeaning: '스킨케어 루틴이 뭐예요?', category: 'beauty', level: 'A2', partOfSpeech: 'noun' },
  { id: 'b1-beauty-1', word: 'moisturizer', pronunciation: '/ˈmɔɪstʃəraɪzər/', meaning: '보습제', example: 'Apply moisturizer after cleansing.', exampleMeaning: '세안 후 보습제를 바르세요.', category: 'beauty', level: 'B1', partOfSpeech: 'noun' },
  { id: 'b1-beauty-2', word: 'ingredients', pronunciation: '/ɪnˈɡriːdiənts/', meaning: '성분', example: 'Check the ingredients before buying.', exampleMeaning: '구매 전에 성분을 확인하세요.', category: 'beauty', level: 'B1', partOfSpeech: 'noun' },
  { id: 'b2-beauty-1', word: 'formulation', pronunciation: '/ˌfɔːrmjʊˈleɪʃn/', meaning: '제형, 포뮬레이션', example: 'This new formulation is more effective.', exampleMeaning: '이 새 제형이 더 효과적이에요.', category: 'beauty', level: 'B2', partOfSpeech: 'noun' },
  { id: 'b2-beauty-2', word: 'anti-aging', pronunciation: '/ˌænti ˈeɪdʒɪŋ/', meaning: '안티에이징, 노화 방지', example: 'This cream has anti-aging properties.', exampleMeaning: '이 크림은 안티에이징 효과가 있어요.', category: 'beauty', level: 'B2', partOfSpeech: 'adjective' },
];
