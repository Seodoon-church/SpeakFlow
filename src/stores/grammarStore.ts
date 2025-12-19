import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 문법 레벨
export type GrammarLevel = 'beginner' | 'intermediate' | 'advanced';

// 문법 카테고리
export type GrammarCategory = 'tense' | 'article' | 'preposition' | 'modal' | 'conditional' | 'relative' | 'passive' | 'gerund' | 'comparison';

// 퀴즈 타입
export type QuizType = 'fill-blank' | 'error-correction' | 'multiple-choice' | 'reorder';

// 문법 주제
export interface GrammarTopic {
  id: string;
  title: string;
  titleKo: string;
  description: string;
  level: GrammarLevel;
  category: GrammarCategory;
  icon: string;
  lessons: GrammarLesson[];
}

// 문법 레슨
export interface GrammarLesson {
  id: string;
  title: string;
  explanation: string;
  explanationKo: string;
  formula?: string; // 공식 (예: S + V + O)
  examples: {
    english: string;
    korean: string;
    highlight?: string; // 강조할 부분
  }[];
  tips?: string[]; // 한국인 팁
  commonMistakes?: {
    wrong: string;
    correct: string;
    explanation: string;
  }[];
}

// 문법 퀴즈 문제
export interface GrammarQuestion {
  id: string;
  topicId: string;
  type: QuizType;
  question: string;
  questionKo?: string;
  options?: string[]; // multiple-choice용
  correctAnswer: string;
  explanation: string;
  explanationKo: string;
  difficulty: 1 | 2 | 3;
}

// 학습 진행도
export interface GrammarProgress {
  topicId: string;
  lessonsCompleted: string[];
  quizScore: number;
  quizAttempts: number;
  lastStudied: string;
  mastered: boolean;
}

// 퀴즈 세션
export interface GrammarQuizSession {
  id: string;
  topicId?: string;
  level?: GrammarLevel;
  questions: GrammarQuestion[];
  currentIndex: number;
  score: number;
  answers: { questionId: string; answer: string; correct: boolean }[];
  startedAt: string;
  completedAt?: string;
}

interface GrammarState {
  progress: Record<string, GrammarProgress>;
  currentSession: GrammarQuizSession | null;
  weakPoints: string[]; // 약점 문법 ID 목록
  _hasHydrated: boolean;

  // 진행도
  markLessonComplete: (topicId: string, lessonId: string) => void;
  getTopicProgress: (topicId: string) => GrammarProgress | null;
  getCompletedTopicsCount: () => number;
  getMasteredTopicsCount: () => number;

  // 퀴즈
  startQuiz: (options?: { topicId?: string; level?: GrammarLevel; count?: number }) => void;
  answerQuestion: (answer: string) => boolean;
  nextQuestion: () => void;
  endQuiz: () => void;

  // 약점 분석
  addWeakPoint: (topicId: string) => void;
  getWeakPoints: () => string[];

  setHasHydrated: (state: boolean) => void;
}

// 레벨 정보
export const GRAMMAR_LEVELS: Record<GrammarLevel, { name: string; description: string; color: string }> = {
  beginner: { name: '초급', description: 'A1-A2 기본 문법', color: 'bg-green-500' },
  intermediate: { name: '중급', description: 'B1-B2 실용 문법', color: 'bg-blue-500' },
  advanced: { name: '고급', description: 'C1-C2 고급 문법', color: 'bg-purple-500' },
};

// 카테고리 정보
export const GRAMMAR_CATEGORIES: Record<GrammarCategory, { name: string; icon: string }> = {
  tense: { name: '시제', icon: '⏰' },
  article: { name: '관사', icon: '📝' },
  preposition: { name: '전치사', icon: '📍' },
  modal: { name: '조동사', icon: '💪' },
  conditional: { name: '가정법', icon: '🤔' },
  relative: { name: '관계사', icon: '🔗' },
  passive: { name: '수동태', icon: '🔄' },
  gerund: { name: '동명사/to부정사', icon: '🎯' },
  comparison: { name: '비교급/최상급', icon: '📊' },
};

// 문법 콘텐츠
export const GRAMMAR_TOPICS: GrammarTopic[] = [
  // 초급 - 관사
  {
    id: 'article-basic',
    title: 'Articles: A, An, The',
    titleKo: '관사: A, An, The',
    description: '영어에서 가장 기본이 되는 관사 사용법을 배워봅니다.',
    level: 'beginner',
    category: 'article',
    icon: '📝',
    lessons: [
      {
        id: 'article-a-an',
        title: 'A vs An',
        explanation: 'Use "a" before consonant sounds, "an" before vowel sounds.',
        explanationKo: '자음 소리 앞에는 "a", 모음 소리 앞에는 "an"을 사용합니다.',
        formula: 'a + 자음 소리 / an + 모음 소리',
        examples: [
          { english: 'I have a book.', korean: '나는 책이 있어요.', highlight: 'a book' },
          { english: 'She is an artist.', korean: '그녀는 예술가예요.', highlight: 'an artist' },
          { english: 'It\'s an hour away.', korean: '1시간 거리예요.', highlight: 'an hour' },
          { english: 'He is a university student.', korean: '그는 대학생이에요.', highlight: 'a university' },
        ],
        tips: [
          '"hour"는 h가 묵음이라 모음 소리로 시작 → an hour',
          '"university"는 /ju/ 자음 소리로 시작 → a university',
          '소리로 판단하세요, 철자가 아닙니다!',
        ],
        commonMistakes: [
          { wrong: 'I bought a apple.', correct: 'I bought an apple.', explanation: 'apple은 모음 소리 /æ/로 시작' },
          { wrong: 'She is an European.', correct: 'She is a European.', explanation: 'European은 /j/ 자음 소리로 시작' },
        ],
      },
      {
        id: 'article-the',
        title: 'The (정관사)',
        explanation: 'Use "the" when referring to something specific or already mentioned.',
        explanationKo: '특정한 것이나 이미 언급된 것을 가리킬 때 "the"를 사용합니다.',
        examples: [
          { english: 'I saw a dog. The dog was cute.', korean: '개를 봤어요. 그 개는 귀여웠어요.', highlight: 'The dog' },
          { english: 'The sun rises in the east.', korean: '태양은 동쪽에서 뜹니다.', highlight: 'The sun' },
          { english: 'Can you pass me the salt?', korean: '소금 좀 건네줄래요?', highlight: 'the salt' },
        ],
        tips: [
          '처음 언급할 때는 a/an, 다시 언급할 때는 the',
          '세상에 하나뿐인 것: the sun, the moon, the earth',
          '상황에서 유일한 것: the door (방에 문이 하나일 때)',
        ],
      },
    ],
  },

  // 초급 - 현재시제
  {
    id: 'present-simple',
    title: 'Present Simple Tense',
    titleKo: '현재 시제',
    description: '일상적인 습관, 사실, 반복되는 행동을 표현하는 현재 시제',
    level: 'beginner',
    category: 'tense',
    icon: '⏰',
    lessons: [
      {
        id: 'present-simple-form',
        title: '현재 시제 형태',
        explanation: 'Subject + base verb (add -s/-es for he/she/it)',
        explanationKo: '주어 + 동사원형 (3인칭 단수는 -s/-es 추가)',
        formula: 'I/You/We/They + 동사원형 | He/She/It + 동사-s',
        examples: [
          { english: 'I work every day.', korean: '나는 매일 일해요.', highlight: 'work' },
          { english: 'She works at a hospital.', korean: '그녀는 병원에서 일해요.', highlight: 'works' },
          { english: 'They play soccer on weekends.', korean: '그들은 주말에 축구해요.', highlight: 'play' },
          { english: 'He goes to school by bus.', korean: '그는 버스로 학교에 가요.', highlight: 'goes' },
        ],
        tips: [
          '3인칭 단수(he/she/it)에는 반드시 -s/-es!',
          'go → goes, do → does, have → has',
          '부정문: don\'t/doesn\'t + 동사원형',
        ],
        commonMistakes: [
          { wrong: 'She work hard.', correct: 'She works hard.', explanation: '3인칭 단수에는 -s 필수' },
          { wrong: 'He don\'t like coffee.', correct: 'He doesn\'t like coffee.', explanation: '3인칭 단수 부정은 doesn\'t' },
        ],
      },
    ],
  },

  // 초급 - 전치사
  {
    id: 'preposition-time',
    title: 'Prepositions of Time',
    titleKo: '시간 전치사 (in/on/at)',
    description: '시간을 나타낼 때 사용하는 전치사 in, on, at의 올바른 사용법',
    level: 'beginner',
    category: 'preposition',
    icon: '📍',
    lessons: [
      {
        id: 'prep-in-on-at',
        title: 'In, On, At 사용법',
        explanation: 'IN for longer periods, ON for days/dates, AT for specific times',
        explanationKo: 'IN은 긴 기간, ON은 날짜/요일, AT은 특정 시간에 사용',
        formula: 'IN + 년/월/계절 | ON + 날짜/요일 | AT + 시간',
        examples: [
          { english: 'I was born in 1990.', korean: '나는 1990년에 태어났어요.', highlight: 'in 1990' },
          { english: 'We have a meeting on Monday.', korean: '월요일에 회의가 있어요.', highlight: 'on Monday' },
          { english: 'The class starts at 9 AM.', korean: '수업은 9시에 시작해요.', highlight: 'at 9 AM' },
          { english: 'I go jogging in the morning.', korean: '아침에 조깅해요.', highlight: 'in the morning' },
        ],
        tips: [
          'in + 년도, 월, 계절, 세기, 아침/오후/저녁',
          'on + 요일, 날짜, 특정 날 (on my birthday)',
          'at + 정확한 시간, 밤, 정오, 자정 (at night, at noon)',
        ],
        commonMistakes: [
          { wrong: 'I\'ll call you on 3 PM.', correct: 'I\'ll call you at 3 PM.', explanation: '특정 시간은 at' },
          { wrong: 'We met in Monday.', correct: 'We met on Monday.', explanation: '요일은 on' },
        ],
      },
    ],
  },

  // 중급 - 현재완료
  {
    id: 'present-perfect',
    title: 'Present Perfect Tense',
    titleKo: '현재완료 시제',
    description: '과거에 시작해서 현재까지 영향을 미치는 행동이나 경험',
    level: 'intermediate',
    category: 'tense',
    icon: '⏰',
    lessons: [
      {
        id: 'present-perfect-form',
        title: '현재완료 형태와 용법',
        explanation: 'Subject + have/has + past participle',
        explanationKo: '주어 + have/has + 과거분사',
        formula: 'I/You/We/They + have + p.p. | He/She/It + has + p.p.',
        examples: [
          { english: 'I have lived in Seoul for 5 years.', korean: '서울에 5년간 살았어요. (지금도 살고 있음)', highlight: 'have lived' },
          { english: 'She has already finished her work.', korean: '그녀는 이미 일을 끝냈어요.', highlight: 'has finished' },
          { english: 'Have you ever been to Japan?', korean: '일본에 가본 적 있어요?', highlight: 'Have you ever been' },
          { english: 'I have just eaten lunch.', korean: '방금 점심을 먹었어요.', highlight: 'have just eaten' },
        ],
        tips: [
          '과거 시제 vs 현재완료: 과거는 끝난 일, 현재완료는 현재와 연결',
          'for + 기간 (for 3 years), since + 시점 (since 2020)',
          'ever, never, already, yet, just와 함께 자주 사용',
        ],
        commonMistakes: [
          { wrong: 'I have seen him yesterday.', correct: 'I saw him yesterday.', explanation: 'yesterday 같은 구체적 과거 시점에는 과거시제' },
          { wrong: 'She has went home.', correct: 'She has gone home.', explanation: 'go의 과거분사는 gone' },
        ],
      },
    ],
  },

  // 중급 - 조동사
  {
    id: 'modal-verbs',
    title: 'Modal Verbs',
    titleKo: '조동사 (can, could, should, must)',
    description: '능력, 가능성, 의무, 추측을 표현하는 조동사',
    level: 'intermediate',
    category: 'modal',
    icon: '💪',
    lessons: [
      {
        id: 'modal-can-could',
        title: 'Can vs Could',
        explanation: 'Can for present ability/possibility, Could for past ability or polite requests',
        explanationKo: 'Can은 현재 능력/가능성, Could는 과거 능력이나 정중한 요청',
        examples: [
          { english: 'I can speak English.', korean: '영어를 할 수 있어요.', highlight: 'can speak' },
          { english: 'Could you help me?', korean: '도와주실 수 있을까요? (정중)', highlight: 'Could you' },
          { english: 'When I was young, I could run fast.', korean: '어렸을 때 빨리 뛸 수 있었어요.', highlight: 'could run' },
        ],
        tips: [
          'Could you...? 는 Can you...?보다 더 정중한 표현',
          '조동사 뒤에는 항상 동사원형!',
        ],
      },
      {
        id: 'modal-should-must',
        title: 'Should vs Must',
        explanation: 'Should for advice/recommendation, Must for obligation/strong necessity',
        explanationKo: 'Should는 충고/권고, Must는 의무/강한 필요',
        examples: [
          { english: 'You should see a doctor.', korean: '의사를 만나는 게 좋겠어요. (권고)', highlight: 'should see' },
          { english: 'You must wear a seatbelt.', korean: '안전벨트를 매야 해요. (의무)', highlight: 'must wear' },
          { english: 'You shouldn\'t eat too much.', korean: '너무 많이 먹지 않는 게 좋아요.', highlight: 'shouldn\'t eat' },
        ],
        commonMistakes: [
          { wrong: 'You must to go now.', correct: 'You must go now.', explanation: '조동사 뒤에는 to 없이 동사원형' },
        ],
      },
    ],
  },

  // 중급 - 가정법
  {
    id: 'conditional',
    title: 'Conditional Sentences',
    titleKo: '가정법 (If 문장)',
    description: '조건과 결과를 표현하는 가정법 문장 구조',
    level: 'intermediate',
    category: 'conditional',
    icon: '🤔',
    lessons: [
      {
        id: 'conditional-first',
        title: '가정법 현재 (1st Conditional)',
        explanation: 'For real/possible situations in the future',
        explanationKo: '미래에 실현 가능한 상황을 표현',
        formula: 'If + 현재시제, will + 동사원형',
        examples: [
          { english: 'If it rains, I will stay home.', korean: '비가 오면, 집에 있을 거예요.', highlight: 'If it rains' },
          { english: 'If you study hard, you will pass the exam.', korean: '열심히 공부하면, 시험에 붙을 거예요.', highlight: 'If you study' },
        ],
        tips: [
          'If절에는 현재시제, 주절에는 will + 동사원형',
          'If절과 주절 순서는 바꿀 수 있음',
        ],
        commonMistakes: [
          { wrong: 'If it will rain, I will stay.', correct: 'If it rains, I will stay.', explanation: 'If절에는 will 사용 안 함' },
        ],
      },
      {
        id: 'conditional-second',
        title: '가정법 과거 (2nd Conditional)',
        explanation: 'For unreal/hypothetical situations in the present',
        explanationKo: '현재 사실과 반대되는 상상의 상황',
        formula: 'If + 과거시제, would + 동사원형',
        examples: [
          { english: 'If I had money, I would buy a car.', korean: '돈이 있다면, 차를 살 텐데. (지금 돈이 없음)', highlight: 'If I had' },
          { english: 'If I were you, I would apologize.', korean: '내가 너라면, 사과할 텐데.', highlight: 'If I were' },
        ],
        tips: [
          'be동사는 모든 인칭에서 were 사용 (If I were...)',
          '현실과 반대되는 상상! 실제로 그렇지 않다는 뉘앙스',
        ],
      },
    ],
  },

  // 고급 - 관계대명사
  {
    id: 'relative-clauses',
    title: 'Relative Clauses',
    titleKo: '관계절 (who, which, that)',
    description: '명사를 수식하는 관계절의 사용법',
    level: 'advanced',
    category: 'relative',
    icon: '🔗',
    lessons: [
      {
        id: 'relative-who-which',
        title: 'Who, Which, That',
        explanation: 'Who for people, Which for things, That for both',
        explanationKo: 'Who는 사람, Which는 사물, That은 둘 다 가능',
        examples: [
          { english: 'The woman who called you is my sister.', korean: '너한테 전화한 여자는 내 여동생이야.', highlight: 'who called' },
          { english: 'The book which I bought is interesting.', korean: '내가 산 책은 재미있어.', highlight: 'which I bought' },
          { english: 'The movie that we watched was great.', korean: '우리가 본 영화는 좋았어.', highlight: 'that we watched' },
        ],
        tips: [
          '제한적 관계절: 필수 정보 (쉼표 없음)',
          '비제한적 관계절: 부가 정보 (쉼표 있음)',
        ],
      },
    ],
  },
];

// 문법 퀴즈 문제
export const GRAMMAR_QUESTIONS: GrammarQuestion[] = [
  // 관사 문제
  {
    id: 'q-article-1',
    topicId: 'article-basic',
    type: 'fill-blank',
    question: 'I saw ___ elephant at the zoo.',
    questionKo: '나는 동물원에서 코끼리를 봤어요.',
    correctAnswer: 'an',
    explanation: 'Elephant starts with a vowel sound, so we use "an".',
    explanationKo: 'Elephant은 모음 소리로 시작하므로 "an"을 사용합니다.',
    difficulty: 1,
  },
  {
    id: 'q-article-2',
    topicId: 'article-basic',
    type: 'error-correction',
    question: 'She is a honest person.',
    questionKo: '그녀는 정직한 사람이에요.',
    correctAnswer: 'She is an honest person.',
    explanation: 'Honest starts with a silent "h", so it has a vowel sound.',
    explanationKo: 'Honest의 h는 묵음이라 모음 소리로 시작합니다.',
    difficulty: 2,
  },
  {
    id: 'q-article-3',
    topicId: 'article-basic',
    type: 'multiple-choice',
    question: 'Which is correct?',
    questionKo: '올바른 것은?',
    options: ['I go to a school.', 'I go to school.', 'I go to the school.'],
    correctAnswer: 'I go to school.',
    explanation: '"Go to school" is a fixed expression meaning attending as a student.',
    explanationKo: '"Go to school"은 학생으로서 등교한다는 관용 표현입니다.',
    difficulty: 2,
  },

  // 현재시제 문제
  {
    id: 'q-present-1',
    topicId: 'present-simple',
    type: 'fill-blank',
    question: 'She ___ (go) to work by subway.',
    questionKo: '그녀는 지하철로 출근해요.',
    correctAnswer: 'goes',
    explanation: 'Third person singular (she) requires -es for "go".',
    explanationKo: '3인칭 단수(she)는 go에 -es를 붙여 goes가 됩니다.',
    difficulty: 1,
  },
  {
    id: 'q-present-2',
    topicId: 'present-simple',
    type: 'error-correction',
    question: 'He don\'t like spicy food.',
    questionKo: '그는 매운 음식을 좋아하지 않아요.',
    correctAnswer: 'He doesn\'t like spicy food.',
    explanation: 'Third person singular uses "doesn\'t" for negation.',
    explanationKo: '3인칭 단수의 부정문은 doesn\'t를 사용합니다.',
    difficulty: 1,
  },

  // 전치사 문제
  {
    id: 'q-prep-1',
    topicId: 'preposition-time',
    type: 'fill-blank',
    question: 'I was born ___ March.',
    questionKo: '나는 3월에 태어났어요.',
    correctAnswer: 'in',
    explanation: 'We use "in" with months.',
    explanationKo: '월(month)에는 "in"을 사용합니다.',
    difficulty: 1,
  },
  {
    id: 'q-prep-2',
    topicId: 'preposition-time',
    type: 'multiple-choice',
    question: 'The meeting is ___ 3 PM ___ Friday.',
    questionKo: '회의는 금요일 오후 3시에 있어요.',
    options: ['at / on', 'on / at', 'in / on', 'at / in'],
    correctAnswer: 'at / on',
    explanation: '"At" for specific time, "On" for days.',
    explanationKo: '특정 시간에는 at, 요일에는 on을 사용합니다.',
    difficulty: 2,
  },

  // 현재완료 문제
  {
    id: 'q-perfect-1',
    topicId: 'present-perfect',
    type: 'fill-blank',
    question: 'I ___ never ___ (be) to Paris.',
    questionKo: '나는 파리에 가본 적이 없어요.',
    correctAnswer: 'have never been',
    explanation: 'Present perfect: have/has + past participle. "Be" becomes "been".',
    explanationKo: '현재완료: have/has + 과거분사. be의 과거분사는 been입니다.',
    difficulty: 2,
  },
  {
    id: 'q-perfect-2',
    topicId: 'present-perfect',
    type: 'error-correction',
    question: 'I have seen that movie last week.',
    questionKo: '나는 지난주에 그 영화를 봤어요.',
    correctAnswer: 'I saw that movie last week.',
    explanation: 'Use past simple with specific past time expressions like "last week".',
    explanationKo: '"last week" 같은 구체적 과거 시점에는 과거시제를 사용합니다.',
    difficulty: 2,
  },

  // 조동사 문제
  {
    id: 'q-modal-1',
    topicId: 'modal-verbs',
    type: 'error-correction',
    question: 'You must to finish this by tomorrow.',
    questionKo: '내일까지 이것을 끝내야 해요.',
    correctAnswer: 'You must finish this by tomorrow.',
    explanation: 'Modal verbs are followed by base form without "to".',
    explanationKo: '조동사 뒤에는 to 없이 동사원형이 옵니다.',
    difficulty: 1,
  },
  {
    id: 'q-modal-2',
    topicId: 'modal-verbs',
    type: 'multiple-choice',
    question: 'Which is more polite?',
    questionKo: '더 정중한 표현은?',
    options: ['Can you help me?', 'Could you help me?', 'You help me?'],
    correctAnswer: 'Could you help me?',
    explanation: '"Could" is more polite than "can" for requests.',
    explanationKo: '요청할 때 "could"가 "can"보다 더 정중합니다.',
    difficulty: 1,
  },

  // 가정법 문제
  {
    id: 'q-cond-1',
    topicId: 'conditional',
    type: 'fill-blank',
    question: 'If it ___ (rain), I will take an umbrella.',
    questionKo: '비가 오면, 우산을 가져갈 거예요.',
    correctAnswer: 'rains',
    explanation: 'First conditional: If + present simple, will + base form.',
    explanationKo: '가정법 현재: If + 현재시제, will + 동사원형',
    difficulty: 2,
  },
  {
    id: 'q-cond-2',
    topicId: 'conditional',
    type: 'error-correction',
    question: 'If I was you, I would study harder.',
    questionKo: '내가 너라면, 더 열심히 공부할 텐데.',
    correctAnswer: 'If I were you, I would study harder.',
    explanation: 'In second conditional, we use "were" for all subjects.',
    explanationKo: '가정법 과거에서는 모든 주어에 "were"를 사용합니다.',
    difficulty: 3,
  },

  // 관계대명사 문제
  {
    id: 'q-relative-1',
    topicId: 'relative-clauses',
    type: 'fill-blank',
    question: 'The man ___ is standing there is my teacher.',
    questionKo: '저기 서 있는 남자는 내 선생님이에요.',
    correctAnswer: 'who',
    explanation: 'Use "who" for people as the subject of the relative clause.',
    explanationKo: '사람이 관계절의 주어일 때 "who"를 사용합니다.',
    difficulty: 2,
  },
  {
    id: 'q-relative-2',
    topicId: 'relative-clauses',
    type: 'multiple-choice',
    question: 'The car ___ I bought is very fast.',
    questionKo: '내가 산 차는 아주 빨라요.',
    options: ['who', 'which', 'where'],
    correctAnswer: 'which',
    explanation: 'Use "which" for things.',
    explanationKo: '사물에는 "which"를 사용합니다.',
    difficulty: 2,
  },
];

export const useGrammarStore = create<GrammarState>()(
  persist(
    (set, get) => ({
      progress: {},
      currentSession: null,
      weakPoints: [],
      _hasHydrated: false,

      markLessonComplete: (topicId, lessonId) => set((state) => {
        const existing = state.progress[topicId] || {
          topicId,
          lessonsCompleted: [],
          quizScore: 0,
          quizAttempts: 0,
          lastStudied: '',
          mastered: false,
        };

        const lessonsCompleted = existing.lessonsCompleted.includes(lessonId)
          ? existing.lessonsCompleted
          : [...existing.lessonsCompleted, lessonId];

        return {
          progress: {
            ...state.progress,
            [topicId]: {
              ...existing,
              lessonsCompleted,
              lastStudied: new Date().toISOString().split('T')[0],
            },
          },
        };
      }),

      getTopicProgress: (topicId) => get().progress[topicId] || null,

      getCompletedTopicsCount: () => {
        const { progress } = get();
        return Object.values(progress).filter(p => p.lessonsCompleted.length > 0).length;
      },

      getMasteredTopicsCount: () => {
        const { progress } = get();
        return Object.values(progress).filter(p => p.mastered).length;
      },

      startQuiz: (options) => set((state) => {
        let questions = [...GRAMMAR_QUESTIONS];

        if (options?.topicId) {
          questions = questions.filter(q => q.topicId === options.topicId);
        }
        if (options?.level) {
          const topicIds = GRAMMAR_TOPICS
            .filter(t => t.level === options.level)
            .map(t => t.id);
          questions = questions.filter(q => topicIds.includes(q.topicId));
        }

        if (questions.length < 3) {
          return state;
        }

        const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, options?.count || 10);

        return {
          currentSession: {
            id: `grammar-quiz-${Date.now()}`,
            topicId: options?.topicId,
            level: options?.level,
            questions: shuffled,
            currentIndex: 0,
            score: 0,
            answers: [],
            startedAt: new Date().toISOString(),
          },
        };
      }),

      answerQuestion: (answer) => {
        const { currentSession, addWeakPoint } = get();
        if (!currentSession) return false;

        const question = currentSession.questions[currentSession.currentIndex];
        const isCorrect = answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();

        if (!isCorrect) {
          addWeakPoint(question.topicId);
        }

        set((state) => ({
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                score: isCorrect ? state.currentSession.score + 1 : state.currentSession.score,
                answers: [
                  ...state.currentSession.answers,
                  { questionId: question.id, answer, correct: isCorrect },
                ],
              }
            : null,
        }));

        // Update progress
        set((state) => {
          const existing = state.progress[question.topicId] || {
            topicId: question.topicId,
            lessonsCompleted: [],
            quizScore: 0,
            quizAttempts: 0,
            lastStudied: '',
            mastered: false,
          };

          return {
            progress: {
              ...state.progress,
              [question.topicId]: {
                ...existing,
                quizAttempts: existing.quizAttempts + 1,
                quizScore: isCorrect ? existing.quizScore + 1 : existing.quizScore,
                lastStudied: new Date().toISOString().split('T')[0],
              },
            },
          };
        });

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

      addWeakPoint: (topicId) => set((state) => {
        if (state.weakPoints.includes(topicId)) return state;
        return { weakPoints: [...state.weakPoints, topicId] };
      }),

      getWeakPoints: () => get().weakPoints,

      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: 'speakflow-grammar',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        progress: state.progress,
        weakPoints: state.weakPoints,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
