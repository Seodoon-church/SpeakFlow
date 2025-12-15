// 히라가나/가타카나 학습 데이터

export interface KanaCharacter {
  hiragana: string;
  katakana: string;
  romaji: string;
  korean: string; // 한글 발음
  row: string; // 행 (あ행, か행 등)
  audioHint?: string; // 발음 힌트
}

// 기본 모음 (あ행)
export const VOWELS: KanaCharacter[] = [
  { hiragana: 'あ', katakana: 'ア', romaji: 'a', korean: '아', row: 'あ행' },
  { hiragana: 'い', katakana: 'イ', romaji: 'i', korean: '이', row: 'あ행' },
  { hiragana: 'う', katakana: 'ウ', romaji: 'u', korean: '우', row: 'あ행' },
  { hiragana: 'え', katakana: 'エ', romaji: 'e', korean: '에', row: 'あ행' },
  { hiragana: 'お', katakana: 'オ', romaji: 'o', korean: '오', row: 'あ행' },
];

// か행
export const KA_ROW: KanaCharacter[] = [
  { hiragana: 'か', katakana: 'カ', romaji: 'ka', korean: '카', row: 'か행' },
  { hiragana: 'き', katakana: 'キ', romaji: 'ki', korean: '키', row: 'か행' },
  { hiragana: 'く', katakana: 'ク', romaji: 'ku', korean: '쿠', row: 'か행' },
  { hiragana: 'け', katakana: 'ケ', romaji: 'ke', korean: '케', row: 'か행' },
  { hiragana: 'こ', katakana: 'コ', romaji: 'ko', korean: '코', row: 'か행' },
];

// さ행
export const SA_ROW: KanaCharacter[] = [
  { hiragana: 'さ', katakana: 'サ', romaji: 'sa', korean: '사', row: 'さ행' },
  { hiragana: 'し', katakana: 'シ', romaji: 'shi', korean: '시', row: 'さ행' },
  { hiragana: 'す', katakana: 'ス', romaji: 'su', korean: '스', row: 'さ행' },
  { hiragana: 'せ', katakana: 'セ', romaji: 'se', korean: '세', row: 'さ행' },
  { hiragana: 'そ', katakana: 'ソ', romaji: 'so', korean: '소', row: 'さ행' },
];

// た행
export const TA_ROW: KanaCharacter[] = [
  { hiragana: 'た', katakana: 'タ', romaji: 'ta', korean: '타', row: 'た행' },
  { hiragana: 'ち', katakana: 'チ', romaji: 'chi', korean: '치', row: 'た행' },
  { hiragana: 'つ', katakana: 'ツ', romaji: 'tsu', korean: '츠', row: 'た행' },
  { hiragana: 'て', katakana: 'テ', romaji: 'te', korean: '테', row: 'た행' },
  { hiragana: 'と', katakana: 'ト', romaji: 'to', korean: '토', row: 'た행' },
];

// な행
export const NA_ROW: KanaCharacter[] = [
  { hiragana: 'な', katakana: 'ナ', romaji: 'na', korean: '나', row: 'な행' },
  { hiragana: 'に', katakana: 'ニ', romaji: 'ni', korean: '니', row: 'な행' },
  { hiragana: 'ぬ', katakana: 'ヌ', romaji: 'nu', korean: '누', row: 'な행' },
  { hiragana: 'ね', katakana: 'ネ', romaji: 'ne', korean: '네', row: 'な행' },
  { hiragana: 'の', katakana: 'ノ', romaji: 'no', korean: '노', row: 'な행' },
];

// は행
export const HA_ROW: KanaCharacter[] = [
  { hiragana: 'は', katakana: 'ハ', romaji: 'ha', korean: '하', row: 'は행' },
  { hiragana: 'ひ', katakana: 'ヒ', romaji: 'hi', korean: '히', row: 'は행' },
  { hiragana: 'ふ', katakana: 'フ', romaji: 'fu', korean: '후', row: 'は행' },
  { hiragana: 'へ', katakana: 'ヘ', romaji: 'he', korean: '헤', row: 'は행' },
  { hiragana: 'ほ', katakana: 'ホ', romaji: 'ho', korean: '호', row: 'は행' },
];

// ま행
export const MA_ROW: KanaCharacter[] = [
  { hiragana: 'ま', katakana: 'マ', romaji: 'ma', korean: '마', row: 'ま행' },
  { hiragana: 'み', katakana: 'ミ', romaji: 'mi', korean: '미', row: 'ま행' },
  { hiragana: 'む', katakana: 'ム', romaji: 'mu', korean: '무', row: 'ま행' },
  { hiragana: 'め', katakana: 'メ', romaji: 'me', korean: '메', row: 'ま행' },
  { hiragana: 'も', katakana: 'モ', romaji: 'mo', korean: '모', row: 'ま행' },
];

// や행
export const YA_ROW: KanaCharacter[] = [
  { hiragana: 'や', katakana: 'ヤ', romaji: 'ya', korean: '야', row: 'や행' },
  { hiragana: 'ゆ', katakana: 'ユ', romaji: 'yu', korean: '유', row: 'や행' },
  { hiragana: 'よ', katakana: 'ヨ', romaji: 'yo', korean: '요', row: 'や행' },
];

// ら행
export const RA_ROW: KanaCharacter[] = [
  { hiragana: 'ら', katakana: 'ラ', romaji: 'ra', korean: '라', row: 'ら행' },
  { hiragana: 'り', katakana: 'リ', romaji: 'ri', korean: '리', row: 'ら행' },
  { hiragana: 'る', katakana: 'ル', romaji: 'ru', korean: '루', row: 'ら행' },
  { hiragana: 'れ', katakana: 'レ', romaji: 're', korean: '레', row: 'ら행' },
  { hiragana: 'ろ', katakana: 'ロ', romaji: 'ro', korean: '로', row: 'ら행' },
];

// わ행
export const WA_ROW: KanaCharacter[] = [
  { hiragana: 'わ', katakana: 'ワ', romaji: 'wa', korean: '와', row: 'わ행' },
  { hiragana: 'を', katakana: 'ヲ', romaji: 'wo', korean: '오', row: 'わ행' },
  { hiragana: 'ん', katakana: 'ン', romaji: 'n', korean: '응', row: 'わ행' },
];

// 탁음 (が행)
export const GA_ROW: KanaCharacter[] = [
  { hiragana: 'が', katakana: 'ガ', romaji: 'ga', korean: '가', row: 'が행' },
  { hiragana: 'ぎ', katakana: 'ギ', romaji: 'gi', korean: '기', row: 'が행' },
  { hiragana: 'ぐ', katakana: 'グ', romaji: 'gu', korean: '구', row: 'が행' },
  { hiragana: 'げ', katakana: 'ゲ', romaji: 'ge', korean: '게', row: 'が행' },
  { hiragana: 'ご', katakana: 'ゴ', romaji: 'go', korean: '고', row: 'が행' },
];

// 탁음 (ざ행)
export const ZA_ROW: KanaCharacter[] = [
  { hiragana: 'ざ', katakana: 'ザ', romaji: 'za', korean: '자', row: 'ざ행' },
  { hiragana: 'じ', katakana: 'ジ', romaji: 'ji', korean: '지', row: 'ざ행' },
  { hiragana: 'ず', katakana: 'ズ', romaji: 'zu', korean: '즈', row: 'ざ행' },
  { hiragana: 'ぜ', katakana: 'ゼ', romaji: 'ze', korean: '제', row: 'ざ행' },
  { hiragana: 'ぞ', katakana: 'ゾ', romaji: 'zo', korean: '조', row: 'ざ행' },
];

// 탁음 (だ행)
export const DA_ROW: KanaCharacter[] = [
  { hiragana: 'だ', katakana: 'ダ', romaji: 'da', korean: '다', row: 'だ행' },
  { hiragana: 'ぢ', katakana: 'ヂ', romaji: 'ji', korean: '지', row: 'だ행' },
  { hiragana: 'づ', katakana: 'ヅ', romaji: 'zu', korean: '즈', row: 'だ행' },
  { hiragana: 'で', katakana: 'デ', romaji: 'de', korean: '데', row: 'だ행' },
  { hiragana: 'ど', katakana: 'ド', romaji: 'do', korean: '도', row: 'だ행' },
];

// 탁음 (ば행)
export const BA_ROW: KanaCharacter[] = [
  { hiragana: 'ば', katakana: 'バ', romaji: 'ba', korean: '바', row: 'ば행' },
  { hiragana: 'び', katakana: 'ビ', romaji: 'bi', korean: '비', row: 'ば행' },
  { hiragana: 'ぶ', katakana: 'ブ', romaji: 'bu', korean: '부', row: 'ば행' },
  { hiragana: 'べ', katakana: 'ベ', romaji: 'be', korean: '베', row: 'ば행' },
  { hiragana: 'ぼ', katakana: 'ボ', romaji: 'bo', korean: '보', row: 'ば행' },
];

// 반탁음 (ぱ행)
export const PA_ROW: KanaCharacter[] = [
  { hiragana: 'ぱ', katakana: 'パ', romaji: 'pa', korean: '파', row: 'ぱ행' },
  { hiragana: 'ぴ', katakana: 'ピ', romaji: 'pi', korean: '피', row: 'ぱ행' },
  { hiragana: 'ぷ', katakana: 'プ', romaji: 'pu', korean: '푸', row: 'ぱ행' },
  { hiragana: 'ぺ', katakana: 'ペ', romaji: 'pe', korean: '페', row: 'ぱ행' },
  { hiragana: 'ぽ', katakana: 'ポ', romaji: 'po', korean: '포', row: 'ぱ행' },
];

// 기본 가나 (청음)
export const BASIC_KANA: KanaCharacter[] = [
  ...VOWELS,
  ...KA_ROW,
  ...SA_ROW,
  ...TA_ROW,
  ...NA_ROW,
  ...HA_ROW,
  ...MA_ROW,
  ...YA_ROW,
  ...RA_ROW,
  ...WA_ROW,
];

// 탁음/반탁음
export const DAKUON_KANA: KanaCharacter[] = [
  ...GA_ROW,
  ...ZA_ROW,
  ...DA_ROW,
  ...BA_ROW,
  ...PA_ROW,
];

// 모든 가나
export const ALL_KANA: KanaCharacter[] = [
  ...BASIC_KANA,
  ...DAKUON_KANA,
];

// 행별 그룹
export const KANA_ROWS = [
  { name: 'あ행 (모음)', kana: VOWELS, color: 'bg-red-100' },
  { name: 'か행', kana: KA_ROW, color: 'bg-orange-100' },
  { name: 'さ행', kana: SA_ROW, color: 'bg-yellow-100' },
  { name: 'た행', kana: TA_ROW, color: 'bg-green-100' },
  { name: 'な행', kana: NA_ROW, color: 'bg-teal-100' },
  { name: 'は행', kana: HA_ROW, color: 'bg-cyan-100' },
  { name: 'ま행', kana: MA_ROW, color: 'bg-blue-100' },
  { name: 'や행', kana: YA_ROW, color: 'bg-indigo-100' },
  { name: 'ら행', kana: RA_ROW, color: 'bg-violet-100' },
  { name: 'わ행', kana: WA_ROW, color: 'bg-purple-100' },
];

export const DAKUON_ROWS = [
  { name: 'が행 (탁음)', kana: GA_ROW, color: 'bg-orange-100' },
  { name: 'ざ행 (탁음)', kana: ZA_ROW, color: 'bg-yellow-100' },
  { name: 'だ행 (탁음)', kana: DA_ROW, color: 'bg-green-100' },
  { name: 'ば행 (탁음)', kana: BA_ROW, color: 'bg-cyan-100' },
  { name: 'ぱ행 (반탁음)', kana: PA_ROW, color: 'bg-pink-100' },
];

// 퀴즈 유틸리티 함수
export function generateKanaQuiz(kanaList: KanaCharacter[], count: number = 5, type: 'hiragana' | 'katakana' = 'hiragana') {
  const shuffled = [...kanaList].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  return selected.map((kana, index) => {
    // 오답 선택지 생성
    const otherKana = kanaList.filter(k => k !== kana);
    const wrongAnswers = otherKana
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(k => k.romaji);

    const options = [...wrongAnswers, kana.romaji].sort(() => Math.random() - 0.5);

    return {
      id: `kana-quiz-${index}`,
      character: type === 'hiragana' ? kana.hiragana : kana.katakana,
      correctAnswer: kana.romaji,
      korean: kana.korean,
      options,
      type,
    };
  });
}

// 쓰기 연습용 획순 데이터 (주요 문자만)
export const STROKE_ORDER_HINTS: Record<string, string[]> = {
  'あ': ['가로획', '세로획', '동그라미'],
  'い': ['왼쪽 획', '오른쪽 획'],
  'う': ['위 점', '아래 획'],
  'え': ['가로획', '아래 꺾임'],
  'お': ['왼쪽 획', '가로획', '오른쪽 획'],
  // 더 많은 획순 정보 추가 가능
};

// 단어 예시
export interface KanaWord {
  word: string;
  reading: string;
  meaning: string;
  kanaType: 'hiragana' | 'katakana' | 'mixed';
}

export const HIRAGANA_WORDS: KanaWord[] = [
  { word: 'あい', reading: 'ai', meaning: '사랑', kanaType: 'hiragana' },
  { word: 'いえ', reading: 'ie', meaning: '집', kanaType: 'hiragana' },
  { word: 'うえ', reading: 'ue', meaning: '위', kanaType: 'hiragana' },
  { word: 'あおい', reading: 'aoi', meaning: '파란', kanaType: 'hiragana' },
  { word: 'かお', reading: 'kao', meaning: '얼굴', kanaType: 'hiragana' },
  { word: 'さくら', reading: 'sakura', meaning: '벚꽃', kanaType: 'hiragana' },
  { word: 'たべる', reading: 'taberu', meaning: '먹다', kanaType: 'hiragana' },
  { word: 'なつ', reading: 'natsu', meaning: '여름', kanaType: 'hiragana' },
  { word: 'はな', reading: 'hana', meaning: '꽃', kanaType: 'hiragana' },
  { word: 'まち', reading: 'machi', meaning: '도시', kanaType: 'hiragana' },
  { word: 'やま', reading: 'yama', meaning: '산', kanaType: 'hiragana' },
  { word: 'よる', reading: 'yoru', meaning: '밤', kanaType: 'hiragana' },
  { word: 'わたし', reading: 'watashi', meaning: '나', kanaType: 'hiragana' },
];

export const KATAKANA_WORDS: KanaWord[] = [
  { word: 'アメリカ', reading: 'amerika', meaning: '미국', kanaType: 'katakana' },
  { word: 'コーヒー', reading: 'koohii', meaning: '커피', kanaType: 'katakana' },
  { word: 'パン', reading: 'pan', meaning: '빵', kanaType: 'katakana' },
  { word: 'テレビ', reading: 'terebi', meaning: 'TV', kanaType: 'katakana' },
  { word: 'ラーメン', reading: 'raamen', meaning: '라면', kanaType: 'katakana' },
  { word: 'ホテル', reading: 'hoteru', meaning: '호텔', kanaType: 'katakana' },
  { word: 'スマホ', reading: 'sumaho', meaning: '스마트폰', kanaType: 'katakana' },
  { word: 'コンビニ', reading: 'konbini', meaning: '편의점', kanaType: 'katakana' },
  { word: 'カラオケ', reading: 'karaoke', meaning: '노래방', kanaType: 'katakana' },
  { word: 'アニメ', reading: 'anime', meaning: '애니메이션', kanaType: 'katakana' },
];
