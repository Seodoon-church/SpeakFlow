// 레벨 테스트 문제 데이터
// CEFR 기준: A1(입문) ~ C2(최상급)

export interface VocabularyQuestion {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  type: 'meaning' | 'fill-blank' | 'synonym' | 'antonym';
  question: string;
  word?: string;
  sentence?: string;
  options: string[];
  correct: number;
}

export interface GrammarQuestion {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  type: 'fill-blank' | 'correct-sentence' | 'error-correction';
  question: string;
  sentence?: string;
  options: string[];
  correct: number;
}

export interface ListeningQuestion {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  audioText: string; // TTS로 읽을 텍스트
  question: string;
  options: string[];
  correct: number;
}

export interface SpeakingPrompt {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  type: 'read-aloud' | 'describe' | 'opinion';
  prompt: string;
  expectedKeywords?: string[]; // AI 분석용 키워드
  minWords?: number;
}

// ========== 영어 문제 ==========

export const ENGLISH_VOCABULARY: VocabularyQuestion[] = [
  // A1 Level
  {
    id: 'en-v-a1-1',
    level: 'A1',
    type: 'meaning',
    question: '다음 단어의 뜻은?',
    word: 'Hello',
    options: ['안녕하세요', '감사합니다', '미안합니다', '잘 가세요'],
    correct: 0,
  },
  {
    id: 'en-v-a1-2',
    level: 'A1',
    type: 'meaning',
    question: '다음 단어의 뜻은?',
    word: 'Thank you',
    options: ['미안합니다', '감사합니다', '안녕하세요', '잘 가세요'],
    correct: 1,
  },
  {
    id: 'en-v-a1-3',
    level: 'A1',
    type: 'fill-blank',
    question: '빈칸에 들어갈 단어는?',
    sentence: 'I am _____ years old.',
    options: ['twenty', 'nice', 'happy', 'good'],
    correct: 0,
  },
  // A2 Level
  {
    id: 'en-v-a2-1',
    level: 'A2',
    type: 'meaning',
    question: '다음 단어의 뜻은?',
    word: 'Expensive',
    options: ['싸다', '비싸다', '크다', '작다'],
    correct: 1,
  },
  {
    id: 'en-v-a2-2',
    level: 'A2',
    type: 'fill-blank',
    question: '빈칸에 들어갈 단어는?',
    sentence: 'The restaurant is _____ the bank.',
    options: ['next to', 'beautiful', 'delicious', 'happy'],
    correct: 0,
  },
  {
    id: 'en-v-a2-3',
    level: 'A2',
    type: 'antonym',
    question: '다음 단어의 반대말은?',
    word: 'Hot',
    options: ['Cold', 'Warm', 'Big', 'Small'],
    correct: 0,
  },
  // B1 Level
  {
    id: 'en-v-b1-1',
    level: 'B1',
    type: 'meaning',
    question: '다음 단어의 뜻은?',
    word: 'Accomplish',
    options: ['성취하다', '포기하다', '시작하다', '반복하다'],
    correct: 0,
  },
  {
    id: 'en-v-b1-2',
    level: 'B1',
    type: 'fill-blank',
    question: '빈칸에 들어갈 단어는?',
    sentence: 'She is very _____ at playing piano.',
    options: ['skilled', 'angry', 'tired', 'hungry'],
    correct: 0,
  },
  {
    id: 'en-v-b1-3',
    level: 'B1',
    type: 'synonym',
    question: '다음 단어와 비슷한 뜻은?',
    word: 'Begin',
    options: ['Start', 'End', 'Stop', 'Wait'],
    correct: 0,
  },
  // B2 Level
  {
    id: 'en-v-b2-1',
    level: 'B2',
    type: 'meaning',
    question: '다음 단어의 뜻은?',
    word: 'Contemplate',
    options: ['숙고하다', '무시하다', '거절하다', '수용하다'],
    correct: 0,
  },
  {
    id: 'en-v-b2-2',
    level: 'B2',
    type: 'fill-blank',
    question: '빈칸에 들어갈 단어는?',
    sentence: 'The new policy has _____ implications for the economy.',
    options: ['significant', 'obvious', 'simple', 'basic'],
    correct: 0,
  },
  {
    id: 'en-v-b2-3',
    level: 'B2',
    type: 'antonym',
    question: '다음 단어의 반대말은?',
    word: 'Ancient',
    options: ['Modern', 'Beautiful', 'Large', 'Quiet'],
    correct: 0,
  },
  // C1 Level
  {
    id: 'en-v-c1-1',
    level: 'C1',
    type: 'meaning',
    question: '다음 단어의 뜻은?',
    word: 'Ubiquitous',
    options: ['어디에나 있는', '희귀한', '독특한', '고대의'],
    correct: 0,
  },
  {
    id: 'en-v-c1-2',
    level: 'C1',
    type: 'fill-blank',
    question: '빈칸에 들어갈 단어는?',
    sentence: 'The researcher\'s findings were _____ by subsequent studies.',
    options: ['corroborated', 'ignored', 'simplified', 'questioned'],
    correct: 0,
  },
  {
    id: 'en-v-c1-3',
    level: 'C1',
    type: 'synonym',
    question: '다음 단어와 비슷한 뜻은?',
    word: 'Ephemeral',
    options: ['Transient', 'Permanent', 'Solid', 'Heavy'],
    correct: 0,
  },
  // C2 Level
  {
    id: 'en-v-c2-1',
    level: 'C2',
    type: 'meaning',
    question: '다음 단어의 뜻은?',
    word: 'Obfuscate',
    options: ['흐리게 하다/혼란시키다', '명확히 하다', '강조하다', '제거하다'],
    correct: 0,
  },
  {
    id: 'en-v-c2-2',
    level: 'C2',
    type: 'fill-blank',
    question: '빈칸에 들어갈 단어는?',
    sentence: 'His _____ remarks during the meeting alienated his colleagues.',
    options: ['acerbic', 'pleasant', 'neutral', 'supportive'],
    correct: 0,
  },
  {
    id: 'en-v-c2-3',
    level: 'C2',
    type: 'synonym',
    question: '다음 단어와 비슷한 뜻은?',
    word: 'Perspicacious',
    options: ['Astute', 'Naive', 'Foolish', 'Careless'],
    correct: 0,
  },
];

export const ENGLISH_GRAMMAR: GrammarQuestion[] = [
  // A1 Level
  {
    id: 'en-g-a1-1',
    level: 'A1',
    type: 'fill-blank',
    question: '빈칸에 알맞은 것은?',
    sentence: 'I _____ a student.',
    options: ['am', 'is', 'are', 'be'],
    correct: 0,
  },
  {
    id: 'en-g-a1-2',
    level: 'A1',
    type: 'fill-blank',
    question: '빈칸에 알맞은 것은?',
    sentence: 'She _____ coffee every morning.',
    options: ['drink', 'drinks', 'drinking', 'drank'],
    correct: 1,
  },
  {
    id: 'en-g-a1-3',
    level: 'A1',
    type: 'correct-sentence',
    question: '올바른 문장은?',
    options: [
      'He have a book.',
      'He has a book.',
      'He having a book.',
      'He had have a book.',
    ],
    correct: 1,
  },
  // A2 Level
  {
    id: 'en-g-a2-1',
    level: 'A2',
    type: 'fill-blank',
    question: '빈칸에 알맞은 것은?',
    sentence: 'I _____ to the movies yesterday.',
    options: ['go', 'goes', 'went', 'going'],
    correct: 2,
  },
  {
    id: 'en-g-a2-2',
    level: 'A2',
    type: 'fill-blank',
    question: '빈칸에 알맞은 것은?',
    sentence: 'There _____ many people at the party.',
    options: ['was', 'were', 'is', 'be'],
    correct: 1,
  },
  {
    id: 'en-g-a2-3',
    level: 'A2',
    type: 'correct-sentence',
    question: '올바른 문장은?',
    options: [
      'She don\'t like coffee.',
      'She doesn\'t likes coffee.',
      'She doesn\'t like coffee.',
      'She not like coffee.',
    ],
    correct: 2,
  },
  // B1 Level
  {
    id: 'en-g-b1-1',
    level: 'B1',
    type: 'fill-blank',
    question: '빈칸에 알맞은 것은?',
    sentence: 'If I _____ rich, I would travel the world.',
    options: ['am', 'was', 'were', 'be'],
    correct: 2,
  },
  {
    id: 'en-g-b1-2',
    level: 'B1',
    type: 'fill-blank',
    question: '빈칸에 알맞은 것은?',
    sentence: 'She has been working here _____ 2015.',
    options: ['for', 'since', 'from', 'at'],
    correct: 1,
  },
  {
    id: 'en-g-b1-3',
    level: 'B1',
    type: 'fill-blank',
    question: '빈칸에 알맞은 것은?',
    sentence: 'The book _____ I read yesterday was interesting.',
    options: ['who', 'which', 'what', 'whom'],
    correct: 1,
  },
  // B2 Level
  {
    id: 'en-g-b2-1',
    level: 'B2',
    type: 'fill-blank',
    question: '빈칸에 알맞은 것은?',
    sentence: 'Had I known about the meeting, I _____ attended.',
    options: ['would', 'would have', 'will', 'will have'],
    correct: 1,
  },
  {
    id: 'en-g-b2-2',
    level: 'B2',
    type: 'fill-blank',
    question: '빈칸에 알맞은 것은?',
    sentence: 'Not only _____ the exam, but she also got the highest score.',
    options: ['she passed', 'did she pass', 'she did pass', 'passed she'],
    correct: 1,
  },
  {
    id: 'en-g-b2-3',
    level: 'B2',
    type: 'error-correction',
    question: '문법적으로 틀린 문장은?',
    options: [
      'The report must be submitted by Friday.',
      'She suggested that he goes to the doctor.',
      'Having finished the work, he went home.',
      'It is essential that she be present.',
    ],
    correct: 1,
  },
  // C1 Level
  {
    id: 'en-g-c1-1',
    level: 'C1',
    type: 'fill-blank',
    question: '빈칸에 알맞은 것은?',
    sentence: 'Rarely _____ such a magnificent performance.',
    options: ['I have seen', 'have I seen', 'I saw', 'did I saw'],
    correct: 1,
  },
  {
    id: 'en-g-c1-2',
    level: 'C1',
    type: 'fill-blank',
    question: '빈칸에 알맞은 것은?',
    sentence: 'The project, _____ completion is expected next month, will transform the industry.',
    options: ['which', 'whose', 'that', 'what'],
    correct: 1,
  },
  {
    id: 'en-g-c1-3',
    level: 'C1',
    type: 'correct-sentence',
    question: '가장 자연스러운 문장은?',
    options: [
      'It\'s high time we left.',
      'It\'s high time we leave.',
      'It\'s high time we are leaving.',
      'It\'s high time we have left.',
    ],
    correct: 0,
  },
  // C2 Level
  {
    id: 'en-g-c2-1',
    level: 'C2',
    type: 'fill-blank',
    question: '빈칸에 알맞은 것은?',
    sentence: '_____ the evidence, the jury reached a unanimous verdict.',
    options: ['Having weighed', 'Weighing', 'To weigh', 'Weighed'],
    correct: 0,
  },
  {
    id: 'en-g-c2-2',
    level: 'C2',
    type: 'error-correction',
    question: '문법적으로 가장 정확한 문장은?',
    options: [
      'The data suggests that further research is needed.',
      'The data suggest that further research is needed.',
      'The data suggesting that further research is needed.',
      'The data has suggested that further research is needed.',
    ],
    correct: 1,
  },
  {
    id: 'en-g-c2-3',
    level: 'C2',
    type: 'fill-blank',
    question: '빈칸에 알맞은 것은?',
    sentence: 'Little _____ that his decision would have such far-reaching consequences.',
    options: ['he knew', 'did he know', 'he did know', 'knew he'],
    correct: 1,
  },
];

export const ENGLISH_LISTENING: ListeningQuestion[] = [
  // A1 Level
  {
    id: 'en-l-a1-1',
    level: 'A1',
    audioText: 'Hello, my name is John. Nice to meet you.',
    question: '화자의 이름은 무엇인가요?',
    options: ['Tom', 'John', 'Mike', 'David'],
    correct: 1,
  },
  {
    id: 'en-l-a1-2',
    level: 'A1',
    audioText: 'I have two apples and three oranges.',
    question: '화자가 가지고 있는 과일의 총 개수는?',
    options: ['3개', '4개', '5개', '6개'],
    correct: 2,
  },
  // A2 Level
  {
    id: 'en-l-a2-1',
    level: 'A2',
    audioText: 'Excuse me, where is the train station? Go straight and turn left at the corner.',
    question: '기차역에 가려면 어떻게 해야 하나요?',
    options: ['직진 후 우회전', '직진 후 좌회전', '좌회전 후 직진', '우회전 후 직진'],
    correct: 1,
  },
  {
    id: 'en-l-a2-2',
    level: 'A2',
    audioText: 'The meeting starts at 3 o\'clock in the afternoon.',
    question: '회의는 몇 시에 시작하나요?',
    options: ['오전 3시', '오후 3시', '오전 12시', '오후 12시'],
    correct: 1,
  },
  // B1 Level
  {
    id: 'en-l-b1-1',
    level: 'B1',
    audioText: 'I\'d like to book a table for four people at 7 PM this Saturday. Do you have anything available?',
    question: '화자는 무엇을 하려고 하나요?',
    options: ['호텔 예약', '레스토랑 예약', '항공권 예약', '콘서트 예약'],
    correct: 1,
  },
  {
    id: 'en-l-b1-2',
    level: 'B1',
    audioText: 'The weather forecast says it will rain tomorrow, so don\'t forget to bring your umbrella.',
    question: '화자가 우산을 가져오라고 한 이유는?',
    options: ['눈이 올 예정', '비가 올 예정', '바람이 강할 예정', '추울 예정'],
    correct: 1,
  },
  // B2 Level
  {
    id: 'en-l-b2-1',
    level: 'B2',
    audioText: 'The company announced that they will be implementing a new remote work policy starting next month. Employees can now work from home up to three days a week.',
    question: '새 정책에 따르면 직원들은 일주일에 며칠 재택근무가 가능한가요?',
    options: ['1일', '2일', '3일', '5일'],
    correct: 2,
  },
  {
    id: 'en-l-b2-2',
    level: 'B2',
    audioText: 'Despite initial skepticism, the research findings have been validated by multiple independent studies, leading experts to reconsider their previous assumptions.',
    question: '연구 결과에 대한 전문가들의 반응은?',
    options: ['연구를 무시했다', '이전 가정을 재고하고 있다', '연구를 비판했다', '추가 연구를 거부했다'],
    correct: 1,
  },
  // C1 Level
  {
    id: 'en-l-c1-1',
    level: 'C1',
    audioText: 'The implications of artificial intelligence on the job market are multifaceted. While some argue that automation will lead to widespread unemployment, others contend that it will create new opportunities in emerging fields.',
    question: 'AI가 고용 시장에 미치는 영향에 대한 논쟁의 핵심은?',
    options: ['AI는 긍정적 효과만 있다', '실업과 새로운 기회 둘 다 가능성이 있다', 'AI는 부정적 효과만 있다', 'AI는 영향이 없다'],
    correct: 1,
  },
  // C2 Level
  {
    id: 'en-l-c2-1',
    level: 'C2',
    audioText: 'The paradigm shift in contemporary epistemology challenges the notion of objective truth, positing instead that knowledge is inherently contextual and socially constructed. This has profound implications for how we approach scientific inquiry.',
    question: '현대 인식론의 패러다임 변화가 주장하는 것은?',
    options: ['객관적 진리가 존재한다', '지식은 맥락적이고 사회적으로 구성된다', '과학적 탐구는 불필요하다', '지식은 변하지 않는다'],
    correct: 1,
  },
];

export const ENGLISH_SPEAKING: SpeakingPrompt[] = [
  // A1 Level
  {
    id: 'en-s-a1-1',
    level: 'A1',
    type: 'read-aloud',
    prompt: 'Hello, my name is Jane. I am from Korea. Nice to meet you.',
    expectedKeywords: ['hello', 'name', 'korea', 'nice', 'meet'],
  },
  // A2 Level
  {
    id: 'en-s-a2-1',
    level: 'A2',
    type: 'read-aloud',
    prompt: 'I like to go shopping on weekends. My favorite store is near my house.',
    expectedKeywords: ['shopping', 'weekends', 'favorite', 'store', 'house'],
  },
  // B1 Level
  {
    id: 'en-s-b1-1',
    level: 'B1',
    type: 'describe',
    prompt: 'Describe your daily routine in English. (30 seconds)',
    expectedKeywords: ['morning', 'work', 'breakfast', 'evening', 'sleep'],
    minWords: 20,
  },
  // B2 Level
  {
    id: 'en-s-b2-1',
    level: 'B2',
    type: 'opinion',
    prompt: 'What do you think about social media? Is it good or bad for society? (45 seconds)',
    expectedKeywords: ['social media', 'communication', 'information', 'negative', 'positive'],
    minWords: 40,
  },
  // C1 Level
  {
    id: 'en-s-c1-1',
    level: 'C1',
    type: 'opinion',
    prompt: 'Discuss the impact of artificial intelligence on the future of work. (60 seconds)',
    expectedKeywords: ['artificial intelligence', 'automation', 'jobs', 'skills', 'future'],
    minWords: 60,
  },
  // C2 Level
  {
    id: 'en-s-c2-1',
    level: 'C2',
    type: 'opinion',
    prompt: 'Analyze the ethical implications of genetic engineering in human reproduction. Consider both potential benefits and risks. (90 seconds)',
    expectedKeywords: ['genetic', 'ethics', 'reproduction', 'benefits', 'risks', 'implications'],
    minWords: 80,
  },
];

// ========== 일본어 문제 ==========

export const JAPANESE_VOCABULARY: VocabularyQuestion[] = [
  // A1 Level
  {
    id: 'ja-v-a1-1',
    level: 'A1',
    type: 'meaning',
    question: '다음 단어의 뜻은?',
    word: 'おはよう',
    options: ['안녕하세요(아침)', '감사합니다', '미안합니다', '안녕히 가세요'],
    correct: 0,
  },
  {
    id: 'ja-v-a1-2',
    level: 'A1',
    type: 'meaning',
    question: '다음 단어의 뜻은?',
    word: 'ありがとう',
    options: ['안녕하세요', '감사합니다', '미안합니다', '실례합니다'],
    correct: 1,
  },
  // A2 Level
  {
    id: 'ja-v-a2-1',
    level: 'A2',
    type: 'meaning',
    question: '다음 단어의 뜻은?',
    word: '便利(べんり)',
    options: ['불편하다', '편리하다', '어렵다', '쉽다'],
    correct: 1,
  },
  // B1 Level
  {
    id: 'ja-v-b1-1',
    level: 'B1',
    type: 'meaning',
    question: '다음 단어의 뜻은?',
    word: '経験(けいけん)',
    options: ['경험', '경제', '경쟁', '경계'],
    correct: 0,
  },
  // B2 Level
  {
    id: 'ja-v-b2-1',
    level: 'B2',
    type: 'meaning',
    question: '다음 단어의 뜻은?',
    word: '曖昧(あいまい)',
    options: ['명확하다', '애매하다', '정확하다', '솔직하다'],
    correct: 1,
  },
];

export const JAPANESE_GRAMMAR: GrammarQuestion[] = [
  // A1 Level
  {
    id: 'ja-g-a1-1',
    level: 'A1',
    type: 'fill-blank',
    question: '빈칸에 알맞은 것은?',
    sentence: '私___学生です。',
    options: ['は', 'が', 'を', 'に'],
    correct: 0,
  },
  // A2 Level
  {
    id: 'ja-g-a2-1',
    level: 'A2',
    type: 'fill-blank',
    question: '빈칸에 알맞은 것은?',
    sentence: '昨日、映画___見ました。',
    options: ['は', 'が', 'を', 'に'],
    correct: 2,
  },
  // B1 Level
  {
    id: 'ja-g-b1-1',
    level: 'B1',
    type: 'fill-blank',
    question: '빈칸에 알맞은 것은?',
    sentence: '雨が降って___、出かけました。',
    options: ['いるので', 'いても', 'いるから', 'いるのに'],
    correct: 1,
  },
];

export const JAPANESE_LISTENING: ListeningQuestion[] = [
  {
    id: 'ja-l-a1-1',
    level: 'A1',
    audioText: 'こんにちは。私は田中です。日本から来ました。',
    question: '화자의 이름은 무엇인가요?',
    options: ['사토', '다나카', '야마다', '스즈키'],
    correct: 1,
  },
  {
    id: 'ja-l-a2-1',
    level: 'A2',
    audioText: 'すみません、駅はどこですか？まっすぐ行って、二つ目の角を右に曲がってください。',
    question: '역에 가려면 어떻게 해야 하나요?',
    options: ['직진 후 첫 번째 모퉁이에서 좌회전', '직진 후 두 번째 모퉁이에서 우회전', '직진 후 두 번째 모퉁이에서 좌회전', '직진 후 첫 번째 모퉁이에서 우회전'],
    correct: 1,
  },
];

export const JAPANESE_SPEAKING: SpeakingPrompt[] = [
  {
    id: 'ja-s-a1-1',
    level: 'A1',
    type: 'read-aloud',
    prompt: 'こんにちは。私の名前は___です。韓国から来ました。よろしくお願いします。',
    expectedKeywords: ['こんにちは', '名前', '韓国', 'よろしく'],
  },
  {
    id: 'ja-s-b1-1',
    level: 'B1',
    type: 'describe',
    prompt: '자기소개를 일본어로 해주세요. (30초)',
    expectedKeywords: ['名前', '趣味', '仕事', '出身'],
    minWords: 15,
  },
];

// ========== 중국어 문제 ==========

export const CHINESE_VOCABULARY: VocabularyQuestion[] = [
  // A1 Level
  {
    id: 'zh-v-a1-1',
    level: 'A1',
    type: 'meaning',
    question: '다음 단어의 뜻은?',
    word: '你好 (nǐ hǎo)',
    options: ['안녕하세요', '감사합니다', '미안합니다', '안녕히 가세요'],
    correct: 0,
  },
  {
    id: 'zh-v-a1-2',
    level: 'A1',
    type: 'meaning',
    question: '다음 단어의 뜻은?',
    word: '谢谢 (xiè xie)',
    options: ['안녕하세요', '감사합니다', '미안합니다', '죄송합니다'],
    correct: 1,
  },
  // A2 Level
  {
    id: 'zh-v-a2-1',
    level: 'A2',
    type: 'meaning',
    question: '다음 단어의 뜻은?',
    word: '漂亮 (piào liang)',
    options: ['못생기다', '예쁘다', '크다', '작다'],
    correct: 1,
  },
];

export const CHINESE_GRAMMAR: GrammarQuestion[] = [
  {
    id: 'zh-g-a1-1',
    level: 'A1',
    type: 'fill-blank',
    question: '빈칸에 알맞은 것은?',
    sentence: '我___学生。',
    options: ['是', '有', '在', '去'],
    correct: 0,
  },
  {
    id: 'zh-g-a2-1',
    level: 'A2',
    type: 'fill-blank',
    question: '빈칸에 알맞은 것은?',
    sentence: '他昨天___北京了。',
    options: ['来', '去', '在', '有'],
    correct: 1,
  },
];

export const CHINESE_LISTENING: ListeningQuestion[] = [
  {
    id: 'zh-l-a1-1',
    level: 'A1',
    audioText: '你好，我叫王明。我是中国人。',
    question: '화자의 이름은 무엇인가요?',
    options: ['리밍', '왕밍', '장밍', '류밍'],
    correct: 1,
  },
];

export const CHINESE_SPEAKING: SpeakingPrompt[] = [
  {
    id: 'zh-s-a1-1',
    level: 'A1',
    type: 'read-aloud',
    prompt: '你好，我叫___。我是韩国人。很高兴认识你。',
    expectedKeywords: ['你好', '韩国人', '高兴', '认识'],
  },
];

// ========== 헬퍼 함수 ==========

export type LanguageCode = 'en' | 'ja' | 'zh';

export function getVocabularyQuestions(lang: LanguageCode): VocabularyQuestion[] {
  switch (lang) {
    case 'en': return ENGLISH_VOCABULARY;
    case 'ja': return JAPANESE_VOCABULARY;
    case 'zh': return CHINESE_VOCABULARY;
    default: return ENGLISH_VOCABULARY;
  }
}

export function getGrammarQuestions(lang: LanguageCode): GrammarQuestion[] {
  switch (lang) {
    case 'en': return ENGLISH_GRAMMAR;
    case 'ja': return JAPANESE_GRAMMAR;
    case 'zh': return CHINESE_GRAMMAR;
    default: return ENGLISH_GRAMMAR;
  }
}

export function getListeningQuestions(lang: LanguageCode): ListeningQuestion[] {
  switch (lang) {
    case 'en': return ENGLISH_LISTENING;
    case 'ja': return JAPANESE_LISTENING;
    case 'zh': return CHINESE_LISTENING;
    default: return ENGLISH_LISTENING;
  }
}

export function getSpeakingPrompts(lang: LanguageCode): SpeakingPrompt[] {
  switch (lang) {
    case 'en': return ENGLISH_SPEAKING;
    case 'ja': return JAPANESE_SPEAKING;
    case 'zh': return CHINESE_SPEAKING;
    default: return ENGLISH_SPEAKING;
  }
}

// 적응형 테스트를 위한 문제 선택 함수
export function selectAdaptiveVocabularyQuestions(
  lang: LanguageCode,
  previousAnswers: { level: string; correct: boolean }[]
): VocabularyQuestion[] {
  const allQuestions = getVocabularyQuestions(lang);

  // 현재 추정 레벨 계산
  let estimatedLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' = 'B1';

  if (previousAnswers.length > 0) {
    const recentCorrect = previousAnswers.slice(-3).filter(a => a.correct).length;
    const levels: ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIdx = levels.indexOf(previousAnswers[previousAnswers.length - 1].level as typeof estimatedLevel);

    if (recentCorrect >= 2 && currentIdx < 5) {
      estimatedLevel = levels[currentIdx + 1];
    } else if (recentCorrect === 0 && currentIdx > 0) {
      estimatedLevel = levels[currentIdx - 1];
    } else {
      estimatedLevel = previousAnswers[previousAnswers.length - 1].level as typeof estimatedLevel;
    }
  }

  // 해당 레벨과 인접 레벨의 문제 선택
  const levels: ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const idx = levels.indexOf(estimatedLevel);
  const targetLevels = [
    levels[Math.max(0, idx - 1)],
    estimatedLevel,
    levels[Math.min(5, idx + 1)],
  ];

  return allQuestions.filter(q => targetLevels.includes(q.level));
}

export function selectAdaptiveGrammarQuestions(
  lang: LanguageCode,
  previousAnswers: { level: string; correct: boolean }[]
): GrammarQuestion[] {
  const allQuestions = getGrammarQuestions(lang);

  let estimatedLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' = 'B1';

  if (previousAnswers.length > 0) {
    const recentCorrect = previousAnswers.slice(-3).filter(a => a.correct).length;
    const levels: ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIdx = levels.indexOf(previousAnswers[previousAnswers.length - 1].level as typeof estimatedLevel);

    if (recentCorrect >= 2 && currentIdx < 5) {
      estimatedLevel = levels[currentIdx + 1];
    } else if (recentCorrect === 0 && currentIdx > 0) {
      estimatedLevel = levels[currentIdx - 1];
    } else {
      estimatedLevel = previousAnswers[previousAnswers.length - 1].level as typeof estimatedLevel;
    }
  }

  const levels: ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const idx = levels.indexOf(estimatedLevel);
  const targetLevels = [
    levels[Math.max(0, idx - 1)],
    estimatedLevel,
    levels[Math.min(5, idx + 1)],
  ];

  return allQuestions.filter(q => targetLevels.includes(q.level));
}

// CEFR 레벨 계산 함수
export function calculateCEFRLevel(scores: {
  vocabulary: number;
  grammar: number;
  listening: number;
  speaking: number;
}): { level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'; description: string } {
  const avg = (scores.vocabulary + scores.grammar + scores.listening + scores.speaking) / 4;

  if (avg >= 90) return { level: 'C2', description: '원어민 수준의 언어 능력을 갖추고 있어요' };
  if (avg >= 80) return { level: 'C1', description: '전문적인 내용도 유창하게 다룰 수 있어요' };
  if (avg >= 70) return { level: 'B2', description: '복잡한 주제에 대해 자신의 의견을 표현할 수 있어요' };
  if (avg >= 55) return { level: 'B1', description: '여행, 업무 등 다양한 상황에서 소통할 수 있어요' };
  if (avg >= 40) return { level: 'A2', description: '일상적인 대화를 이해하고 참여할 수 있어요' };
  return { level: 'A1', description: '기초적인 표현과 인사를 할 수 있어요' };
}
