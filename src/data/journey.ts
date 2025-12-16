// Journey System - Virtual Trip Through Japan
// 일본 여행을 통한 일본어 학습

export interface JourneyPhrase {
  japanese: string;
  reading: string;
  meaning: string;
  context?: string;
}

export interface JourneyDialogue {
  speaker: 'you' | 'other';
  speakerName?: string;
  japanese: string;
  reading: string;
  meaning: string;
}

export interface JourneyScenario {
  id: string;
  title: string;
  description: string;
  situation: string;
  icon: string;
  xpReward: number;
  estimatedMinutes: number;
  phrases: JourneyPhrase[];
  dialogues: JourneyDialogue[];
  culturalNote?: string;
}

export interface JourneyLocation {
  id: string;
  name: string;
  japaneseName: string;
  description: string;
  story: string;
  icon: string;
  color: string;
  coordinates: { x: number; y: number };
  requiredMastery: number;
  scenarios: JourneyScenario[];
}

export interface JourneyChapter {
  id: string;
  title: string;
  description: string;
  locations: JourneyLocation[];
}

// ============================
// CHAPTER 1: 도쿄 도착
// ============================

const CHAPTER_1_ARRIVAL: JourneyChapter = {
  id: 'chapter-1-arrival',
  title: '제1장: 도쿄 도착',
  description: '일본 여행이 시작됩니다! 나리타 공항에서 첫 발을 내딛어요.',
  locations: [
    {
      id: 'narita-airport',
      name: '나리타 공항',
      japaneseName: '成田空港',
      description: '일본에 오신 것을 환영합니다! 공항을 통과하세요.',
      story: '나리타 국제공항에 도착했습니다. 안내 방송이 일본어로 나오고, 입국심사와 수하물 찾기, 도쿄로 가는 전철을 찾아야 해요.',
      icon: '✈️',
      color: 'from-sky-500 to-blue-600',
      coordinates: { x: 75, y: 25 },
      requiredMastery: 0,
      scenarios: [
        {
          id: 'immigration',
          title: '입국심사',
          description: '여권 심사대에서 기본적인 질문에 답하기',
          situation: '입국심사대에 있습니다. 심사관이 몇 가지 질문을 합니다.',
          icon: '🛂',
          xpReward: 30,
          estimatedMinutes: 5,
          phrases: [
            { japanese: 'パスポートをお願いします', reading: 'パスポートをおねがいします', meaning: '여권 부탁드립니다' },
            { japanese: '旅行の目的は何ですか？', reading: 'りょこうのもくてきはなんですか？', meaning: '여행 목적이 뭐예요?' },
            { japanese: '観光です', reading: 'かんこうです', meaning: '관광입니다' },
            { japanese: '何日間滞在しますか？', reading: 'なんにちかんたいざいしますか？', meaning: '며칠간 체류하시나요?' },
            { japanese: '一週間です', reading: 'いっしゅうかんです', meaning: '일주일입니다' },
          ],
          dialogues: [
            { speaker: 'other', speakerName: '심사관', japanese: 'パスポートをお願いします。', reading: 'パスポートをおねがいします。', meaning: '여권 부탁드립니다.' },
            { speaker: 'you', japanese: 'はい、どうぞ。', reading: 'はい、どうぞ。', meaning: '네, 여기요.' },
            { speaker: 'other', speakerName: '심사관', japanese: '旅行の目的は何ですか？', reading: 'りょこうのもくてきはなんですか？', meaning: '여행 목적이 뭐예요?' },
            { speaker: 'you', japanese: '観光です。', reading: 'かんこうです。', meaning: '관광입니다.' },
            { speaker: 'other', speakerName: '심사관', japanese: '何日間滞在しますか？', reading: 'なんにちかんたいざいしますか？', meaning: '며칠간 체류하시나요?' },
            { speaker: 'you', japanese: '一週間です。', reading: 'いっしゅうかんです。', meaning: '일주일입니다.' },
            { speaker: 'other', speakerName: '심사관', japanese: 'いい旅を！', reading: 'いいたびを！', meaning: '좋은 여행 되세요!' },
          ],
          culturalNote: '일본 입국심사관은 친절하지만 정중해요. 간단한 인사와 예의 바른 대응이 좋은 인상을 줍니다.',
        },
        {
          id: 'finding-train',
          title: '전철 찾기',
          description: '공항에서 길 찾기',
          situation: '도쿄역으로 가는 나리타 익스프레스를 찾아야 해요.',
          icon: '🚶',
          xpReward: 25,
          estimatedMinutes: 5,
          phrases: [
            { japanese: 'すみません', reading: 'すみません', meaning: '실례합니다' },
            { japanese: '〜はどこですか？', reading: '〜はどこですか？', meaning: '~은/는 어디예요?' },
            { japanese: '成田エクスプレス', reading: 'なりたエクスプレス', meaning: '나리타 익스프레스' },
            { japanese: 'まっすぐ行ってください', reading: 'まっすぐいってください', meaning: '직진해 주세요' },
            { japanese: '右', reading: 'みぎ', meaning: '오른쪽' },
            { japanese: '左', reading: 'ひだり', meaning: '왼쪽' },
          ],
          dialogues: [
            { speaker: 'you', japanese: 'すみません。成田エクスプレスはどこですか？', reading: 'すみません。なりたエクスプレスはどこですか？', meaning: '실례합니다. 나리타 익스프레스는 어디예요?' },
            { speaker: 'other', speakerName: '직원', japanese: 'あちらです。まっすぐ行って、右に曲がってください。', reading: 'あちらです。まっすぐいって、みぎにまがってください。', meaning: '저쪽이에요. 직진해서 오른쪽으로 꺾어주세요.' },
            { speaker: 'you', japanese: 'ありがとうございます！', reading: 'ありがとうございます！', meaning: '감사합니다!' },
          ],
          culturalNote: '일본에서 길을 물을 때는 "すみません(실례합니다)"으로 시작하면 정중하게 들려요.',
        },
        {
          id: 'buying-ticket',
          title: '표 구매',
          description: '전철표 구매하기',
          situation: '자동발매기에서 표를 구매합니다.',
          icon: '🎫',
          xpReward: 30,
          estimatedMinutes: 5,
          phrases: [
            { japanese: '切符', reading: 'きっぷ', meaning: '표' },
            { japanese: '東京駅', reading: 'とうきょうえき', meaning: '도쿄역' },
            { japanese: '片道', reading: 'かたみち', meaning: '편도' },
            { japanese: '往復', reading: 'おうふく', meaning: '왕복' },
            { japanese: 'いくらですか？', reading: 'いくらですか？', meaning: '얼마예요?' },
            { japanese: 'カードで払います', reading: 'カードではらいます', meaning: '카드로 결제할게요' },
          ],
          dialogues: [
            { speaker: 'you', japanese: '東京駅までお願いします。', reading: 'とうきょうえきまでおねがいします。', meaning: '도쿄역까지 부탁합니다.' },
            { speaker: 'other', speakerName: '직원', japanese: '片道ですか、往復ですか？', reading: 'かたみちですか、おうふくですか？', meaning: '편도예요, 왕복이에요?' },
            { speaker: 'you', japanese: '片道でお願いします。いくらですか？', reading: 'かたみちでおねがいします。いくらですか？', meaning: '편도로 부탁해요. 얼마예요?' },
            { speaker: 'other', speakerName: '직원', japanese: '3,250円です。', reading: '3,250えんです。', meaning: '3,250엔입니다.' },
            { speaker: 'you', japanese: 'カードで払います。', reading: 'カードではらいます。', meaning: '카드로 결제할게요.' },
          ],
          culturalNote: '일본은 카드 결제가 매우 편리해요! 대부분의 장소에서 신용카드를 사용할 수 있어요.',
        },
      ],
    },
    {
      id: 'tokyo-station',
      name: '도쿄역',
      japaneseName: '東京駅',
      description: '도쿄의 중심! 숙소를 찾아가세요.',
      story: '도쿄역에 도착했습니다. 여기서 신주쿠에 있는 호텔로 이동해야 해요.',
      icon: '🚉',
      color: 'from-red-500 to-rose-600',
      coordinates: { x: 50, y: 45 },
      requiredMastery: 60,
      scenarios: [
        {
          id: 'subway-transfer',
          title: '지하철 환승',
          description: '지하철 노선도 이해하기',
          situation: '야마노테선을 타고 신주쿠로 가야 해요.',
          icon: '🚇',
          xpReward: 35,
          estimatedMinutes: 6,
          phrases: [
            { japanese: '山手線', reading: 'やまのてせん', meaning: '야마노테선' },
            { japanese: '新宿駅', reading: 'しんじゅくえき', meaning: '신주쿠역' },
            { japanese: '何番線ですか？', reading: 'なんばんせんですか？', meaning: '몇 번 승강장이에요?' },
            { japanese: '乗り換え', reading: 'のりかえ', meaning: '환승' },
            { japanese: '次の駅', reading: 'つぎのえき', meaning: '다음 역' },
          ],
          dialogues: [
            { speaker: 'you', japanese: 'すみません、新宿駅に行きたいんですが。', reading: 'すみません、しんじゅくえきにいきたいんですが。', meaning: '실례합니다, 신주쿠역에 가고 싶은데요.' },
            { speaker: 'other', speakerName: '역무원', japanese: '山手線に乗ってください。14番線です。', reading: 'やまのてせんにのってください。14ばんせんです。', meaning: '야마노테선을 타세요. 14번 승강장이에요.' },
            { speaker: 'you', japanese: '何駅目ですか？', reading: 'なんえきめですか？', meaning: '몇 정거장이에요?' },
            { speaker: 'other', speakerName: '역무원', japanese: '10駅目です。約20分かかります。', reading: '10えきめです。やく20ぷんかかります。', meaning: '10번째 역이에요. 약 20분 걸려요.' },
          ],
          culturalNote: '도쿄 지하철은 매우 정확해요! 시간표대로 운행하니 계획을 세우기 좋아요.',
        },
        {
          id: 'asking-hotel',
          title: '호텔 찾기',
          description: '신주쿠에서 호텔 찾아가기',
          situation: '신주쿠역에서 호텔까지 길을 물어봅니다.',
          icon: '🏨',
          xpReward: 30,
          estimatedMinutes: 5,
          phrases: [
            { japanese: 'ホテル', reading: 'ホテル', meaning: '호텔' },
            { japanese: 'この住所', reading: 'このじゅうしょ', meaning: '이 주소' },
            { japanese: '歩いて何分ですか？', reading: 'あるいてなんぷんですか？', meaning: '걸어서 몇 분이에요?' },
            { japanese: '近い', reading: 'ちかい', meaning: '가깝다' },
            { japanese: '遠い', reading: 'とおい', meaning: '멀다' },
          ],
          dialogues: [
            { speaker: 'you', japanese: 'すみません、このホテルはどこですか？', reading: 'すみません、このホテルはどこですか？', meaning: '실례합니다, 이 호텔은 어디예요?' },
            { speaker: 'other', speakerName: '행인', japanese: 'ああ、ここから近いですよ。まっすぐ行って、二つ目の信号を左に曲がってください。', reading: 'ああ、ここからちかいですよ。まっすぐいって、ふたつめのしんごうをひだりにまがってください。', meaning: '아, 여기서 가까워요. 직진해서 두 번째 신호등에서 왼쪽으로 꺾으세요.' },
            { speaker: 'you', japanese: '歩いて何分くらいですか？', reading: 'あるいてなんぷんくらいですか？', meaning: '걸어서 몇 분쯤이에요?' },
            { speaker: 'other', speakerName: '행인', japanese: '5分くらいです。', reading: '5ふんくらいです。', meaning: '5분 정도예요.' },
          ],
          culturalNote: '일본 사람들은 길을 물으면 친절하게 알려줘요. 가끔 목적지까지 데려다 주기도 해요!',
        },
      ],
    },
    {
      id: 'shinjuku',
      name: '신주쿠',
      japaneseName: '新宿',
      description: '번화가에서 쇼핑과 식사를 즐기세요!',
      story: '호텔에 짐을 풀고 신주쿠 번화가로 나왔습니다. 맛있는 음식과 쇼핑이 기다리고 있어요!',
      icon: '🌃',
      color: 'from-purple-500 to-violet-600',
      coordinates: { x: 35, y: 40 },
      requiredMastery: 60,
      scenarios: [
        {
          id: 'restaurant-order',
          title: '식당에서 주문',
          description: '라멘 가게에서 주문하기',
          situation: '유명한 라멘 가게에 들어갔어요.',
          icon: '🍜',
          xpReward: 40,
          estimatedMinutes: 7,
          phrases: [
            { japanese: 'いらっしゃいませ', reading: 'いらっしゃいませ', meaning: '어서 오세요' },
            { japanese: '何名様ですか？', reading: 'なんめいさまですか？', meaning: '몇 분이세요?' },
            { japanese: '一人です', reading: 'ひとりです', meaning: '한 명이에요' },
            { japanese: 'ご注文は？', reading: 'ごちゅうもんは？', meaning: '주문하시겠어요?' },
            { japanese: '味噌ラーメンをお願いします', reading: 'みそラーメンをおねがいします', meaning: '미소라멘 부탁해요' },
            { japanese: '大盛り', reading: 'おおもり', meaning: '곱빼기' },
          ],
          dialogues: [
            { speaker: 'other', speakerName: '점원', japanese: 'いらっしゃいませ！何名様ですか？', reading: 'いらっしゃいませ！なんめいさまですか？', meaning: '어서 오세요! 몇 분이세요?' },
            { speaker: 'you', japanese: '一人です。', reading: 'ひとりです。', meaning: '한 명이에요.' },
            { speaker: 'other', speakerName: '점원', japanese: 'こちらへどうぞ。ご注文は？', reading: 'こちらへどうぞ。ごちゅうもんは？', meaning: '이쪽으로 오세요. 주문하시겠어요?' },
            { speaker: 'you', japanese: '味噌ラーメンをお願いします。大盛りで。', reading: 'みそラーメンをおねがいします。おおもりで。', meaning: '미소라멘 부탁해요. 곱빼기로요.' },
            { speaker: 'other', speakerName: '점원', japanese: 'かしこまりました。少々お待ちください。', reading: 'かしこまりました。しょうしょうおまちください。', meaning: '알겠습니다. 잠시만 기다려 주세요.' },
          ],
          culturalNote: '일본 식당에 들어가면 "いらっしゃいませ!"라는 환영 인사를 들을 수 있어요. 답할 필요는 없어요!',
        },
        {
          id: 'convenience-store',
          title: '편의점 이용',
          description: '편의점에서 물건 사기',
          situation: '호텔 근처 편의점에서 간식을 삽니다.',
          icon: '🏪',
          xpReward: 25,
          estimatedMinutes: 5,
          phrases: [
            { japanese: 'コンビニ', reading: 'コンビニ', meaning: '편의점' },
            { japanese: 'お弁当', reading: 'おべんとう', meaning: '도시락' },
            { japanese: '温めますか？', reading: 'あたためますか？', meaning: '데워 드릴까요?' },
            { japanese: 'はい、お願いします', reading: 'はい、おねがいします', meaning: '네, 부탁해요' },
            { japanese: 'お箸', reading: 'おはし', meaning: '젓가락' },
            { japanese: 'レジ袋', reading: 'レジぶくろ', meaning: '비닐봉투' },
          ],
          dialogues: [
            { speaker: 'other', speakerName: '점원', japanese: 'お弁当、温めますか？', reading: 'おべんとう、あたためますか？', meaning: '도시락 데워 드릴까요?' },
            { speaker: 'you', japanese: 'はい、お願いします。', reading: 'はい、おねがいします。', meaning: '네, 부탁해요.' },
            { speaker: 'other', speakerName: '점원', japanese: 'お箸はご入用ですか？', reading: 'おはしはごにゅうようですか？', meaning: '젓가락 필요하세요?' },
            { speaker: 'you', japanese: 'はい、一膳お願いします。', reading: 'はい、いちぜんおねがいします。', meaning: '네, 한 벌 부탁해요.' },
            { speaker: 'other', speakerName: '점원', japanese: '500円です。', reading: '500えんです。', meaning: '500엔입니다.' },
          ],
          culturalNote: '일본 편의점(コンビニ)은 24시간 운영하고 품질이 매우 좋아요. 도시락과 간식이 특히 맛있어요!',
        },
      ],
    },
  ],
};

// ============================
// CHAPTER 2: 도쿄 탐험
// ============================

const CHAPTER_2_EXPLORE: JourneyChapter = {
  id: 'chapter-2-explore',
  title: '제2장: 도쿄 탐험',
  description: '도쿄의 다양한 명소를 탐험해요!',
  locations: [
    {
      id: 'asakusa',
      name: '아사쿠사',
      japaneseName: '浅草',
      description: '전통적인 도쿄를 경험하세요!',
      story: '아사쿠사의 센소지 절과 나카미세 거리를 방문합니다. 전통 일본 문화를 체험해요!',
      icon: '⛩️',
      color: 'from-orange-500 to-amber-600',
      coordinates: { x: 65, y: 35 },
      requiredMastery: 0,
      scenarios: [
        {
          id: 'temple-visit',
          title: '센소지 방문',
          description: '절에서의 예절 배우기',
          situation: '센소지 절에 도착했어요.',
          icon: '🛕',
          xpReward: 35,
          estimatedMinutes: 6,
          phrases: [
            { japanese: 'お寺', reading: 'おてら', meaning: '절' },
            { japanese: '神社', reading: 'じんじゃ', meaning: '신사' },
            { japanese: 'おみくじ', reading: 'おみくじ', meaning: '운세 제비' },
            { japanese: '写真を撮ってもいいですか？', reading: 'しゃしんをとってもいいですか？', meaning: '사진 찍어도 될까요?' },
            { japanese: 'きれい', reading: 'きれい', meaning: '아름답다' },
          ],
          dialogues: [
            { speaker: 'you', japanese: 'すみません、写真を撮ってもいいですか？', reading: 'すみません、しゃしんをとってもいいですか？', meaning: '실례합니다, 사진 찍어도 될까요?' },
            { speaker: 'other', speakerName: '관광객', japanese: 'はい、どうぞ。とてもきれいな写真が撮れますよ。', reading: 'はい、どうぞ。とてもきれいなしゃしんがとれますよ。', meaning: '네, 그러세요. 아주 예쁜 사진을 찍을 수 있어요.' },
            { speaker: 'you', japanese: 'おみくじを引いてみたいです。', reading: 'おみくじをひいてみたいです。', meaning: '오미쿠지를 뽑아보고 싶어요.' },
            { speaker: 'other', speakerName: '관광객', japanese: 'あそこで100円で引けますよ。', reading: 'あそこで100えんでひけますよ。', meaning: '저기서 100엔에 뽑을 수 있어요.' },
          ],
          culturalNote: '오미쿠지는 운세를 점치는 제비예요. 나쁜 운세가 나오면 절에 묶어두고 가면 된대요!',
        },
        {
          id: 'souvenir-shopping',
          title: '기념품 쇼핑',
          description: '나카미세 거리에서 쇼핑하기',
          situation: '나카미세 거리에서 기념품을 삽니다.',
          icon: '🎁',
          xpReward: 30,
          estimatedMinutes: 5,
          phrases: [
            { japanese: 'お土産', reading: 'おみやげ', meaning: '기념품/선물' },
            { japanese: '試食', reading: 'ししょく', meaning: '시식' },
            { japanese: '人気', reading: 'にんき', meaning: '인기' },
            { japanese: 'おすすめは何ですか？', reading: 'おすすめはなんですか？', meaning: '추천은 뭐예요?' },
            { japanese: '包んでください', reading: 'つつんでください', meaning: '포장해 주세요' },
          ],
          dialogues: [
            { speaker: 'you', japanese: 'すみません、おすすめのお土産は何ですか？', reading: 'すみません、おすすめのおみやげはなんですか？', meaning: '실례합니다, 추천하는 기념품은 뭐예요?' },
            { speaker: 'other', speakerName: '가게 주인', japanese: '人形焼きが人気ですよ。試食どうぞ。', reading: 'にんぎょうやきがにんきですよ。ししょくどうぞ。', meaning: '닌교야키가 인기예요. 시식해 보세요.' },
            { speaker: 'you', japanese: 'おいしい！これを三つください。', reading: 'おいしい！これをみっつください。', meaning: '맛있어요! 이거 세 개 주세요.' },
            { speaker: 'other', speakerName: '가게 주인', japanese: 'はい、1,200円です。包みますか？', reading: 'はい、1,200えんです。つつみますか？', meaning: '네, 1,200엔이에요. 포장할까요?' },
          ],
          culturalNote: '닌교야키(人形焼き)는 아사쿠사의 명물 과자예요. 다양한 모양의 붕어빵 같은 거예요!',
        },
      ],
    },
    {
      id: 'akihabara',
      name: '아키하바라',
      japaneseName: '秋葉原',
      description: '애니메이션과 전자제품의 천국!',
      story: '오타쿠 문화의 성지 아키하바라에 왔어요. 애니메이션 굿즈와 전자제품을 구경합니다!',
      icon: '🎮',
      color: 'from-pink-500 to-rose-600',
      coordinates: { x: 55, y: 50 },
      requiredMastery: 50,
      scenarios: [
        {
          id: 'anime-shop',
          title: '애니메이션 샵',
          description: '애니메이션 굿즈 구매하기',
          situation: '좋아하는 애니메이션 굿즈를 찾고 있어요.',
          icon: '🎌',
          xpReward: 35,
          estimatedMinutes: 6,
          phrases: [
            { japanese: 'アニメ', reading: 'アニメ', meaning: '애니메이션' },
            { japanese: 'フィギュア', reading: 'フィギュア', meaning: '피규어' },
            { japanese: '限定版', reading: 'げんていばん', meaning: '한정판' },
            { japanese: '在庫ありますか？', reading: 'ざいこありますか？', meaning: '재고 있어요?' },
            { japanese: '探しています', reading: 'さがしています', meaning: '찾고 있어요' },
          ],
          dialogues: [
            { speaker: 'you', japanese: 'すみません、呪術廻戦のフィギュアを探しています。', reading: 'すみません、じゅじゅつかいせんのフィギュアをさがしています。', meaning: '실례합니다, 주술회전 피규어를 찾고 있어요.' },
            { speaker: 'other', speakerName: '점원', japanese: '3階にありますよ。限定版もありますか？', reading: '3かいにありますよ。げんていばんもありますか？', meaning: '3층에 있어요. 한정판도 필요하세요?' },
            { speaker: 'you', japanese: 'はい、限定版があれば見たいです。', reading: 'はい、げんていばんがあればみたいです。', meaning: '네, 한정판이 있으면 보고 싶어요.' },
            { speaker: 'other', speakerName: '점원', japanese: 'ご案内します。こちらへどうぞ。', reading: 'ごあんないします。こちらへどうぞ。', meaning: '안내해 드릴게요. 이쪽으로 오세요.' },
          ],
          culturalNote: '아키하바라는 애니메이션, 만화, 게임 팬들의 성지예요. "오타쿠(オタク)" 문화의 중심지죠!',
        },
      ],
    },
    {
      id: 'shibuya',
      name: '시부야',
      japaneseName: '渋谷',
      description: '젊음의 거리, 유명한 스크램블 교차로!',
      story: '시부야 스크램블 교차로와 하치코 동상을 구경하고, 트렌디한 카페에 들릅니다.',
      icon: '🏙️',
      color: 'from-cyan-500 to-teal-600',
      coordinates: { x: 30, y: 55 },
      requiredMastery: 50,
      scenarios: [
        {
          id: 'hachiko',
          title: '하치코 동상',
          description: '만남의 장소에서 친구 만나기',
          situation: '하치코 동상 앞에서 친구를 만나기로 했어요.',
          icon: '🐕',
          xpReward: 30,
          estimatedMinutes: 5,
          phrases: [
            { japanese: '待ち合わせ', reading: 'まちあわせ', meaning: '만남/약속' },
            { japanese: '遅れてすみません', reading: 'おくれてすみません', meaning: '늦어서 미안해요' },
            { japanese: '久しぶり', reading: 'ひさしぶり', meaning: '오랜만이야' },
            { japanese: '元気だった？', reading: 'げんきだった？', meaning: '잘 지냈어?' },
            { japanese: 'すごい人だね', reading: 'すごいひとだね', meaning: '사람 엄청 많다' },
          ],
          dialogues: [
            { speaker: 'other', speakerName: '친구', japanese: 'あ、来た来た！こっちこっち！', reading: 'あ、きたきた！こっちこっち！', meaning: '아, 왔다 왔다! 이쪽이쪽!' },
            { speaker: 'you', japanese: '久しぶり！遅れてすみません。', reading: 'ひさしぶり！おくれてすみません。', meaning: '오랜만이야! 늦어서 미안해.' },
            { speaker: 'other', speakerName: '친구', japanese: '大丈夫大丈夫。すごい人だね！', reading: 'だいじょうぶだいじょうぶ。すごいひとだね！', meaning: '괜찮아 괜찮아. 사람 엄청 많다!' },
            { speaker: 'you', japanese: 'うん、有名なスクランブル交差点だもんね。', reading: 'うん、ゆうめいなスクランブルこうさてんだもんね。', meaning: '응, 유명한 스크램블 교차로니까.' },
          ],
          culturalNote: '하치코는 주인을 9년간 기다린 충견이에요. 시부야역의 하치코 동상은 만남의 명소가 되었어요.',
        },
        {
          id: 'cafe-order',
          title: '카페에서',
          description: '트렌디한 카페에서 음료 주문하기',
          situation: '시부야의 유명한 카페에서 음료를 주문해요.',
          icon: '☕',
          xpReward: 25,
          estimatedMinutes: 5,
          phrases: [
            { japanese: 'メニュー', reading: 'メニュー', meaning: '메뉴' },
            { japanese: 'アイスコーヒー', reading: 'アイスコーヒー', meaning: '아이스 커피' },
            { japanese: 'サイズ', reading: 'サイズ', meaning: '사이즈' },
            { japanese: '店内で', reading: 'てんないで', meaning: '매장에서' },
            { japanese: 'テイクアウト', reading: 'テイクアウト', meaning: '테이크아웃' },
          ],
          dialogues: [
            { speaker: 'other', speakerName: '점원', japanese: 'いらっしゃいませ。ご注文は？', reading: 'いらっしゃいませ。ごちゅうもんは？', meaning: '어서 오세요. 주문하시겠어요?' },
            { speaker: 'you', japanese: 'アイスコーヒーをお願いします。', reading: 'アイスコーヒーをおねがいします。', meaning: '아이스 커피 부탁해요.' },
            { speaker: 'other', speakerName: '점원', japanese: 'サイズはいかがですか？', reading: 'サイズはいかがですか？', meaning: '사이즈는 어떻게 하시겠어요?' },
            { speaker: 'you', japanese: 'Mサイズで。店内で飲みます。', reading: 'Mサイズで。てんないでのみます。', meaning: 'M사이즈로요. 매장에서 마실게요.' },
          ],
          culturalNote: '일본 카페에서는 "店内で(매장)" 또는 "テイクアウト(포장)"를 꼭 물어봐요. 세금이 다르기 때문이에요!',
        },
      ],
    },
  ],
};

// All chapters
export const JOURNEY_CHAPTERS: JourneyChapter[] = [
  CHAPTER_1_ARRIVAL,
  CHAPTER_2_EXPLORE,
];

// Helper functions
export const getLocationById = (locationId: string): JourneyLocation | undefined => {
  for (const chapter of JOURNEY_CHAPTERS) {
    const location = chapter.locations.find(l => l.id === locationId);
    if (location) return location;
  }
  return undefined;
};

export const getScenarioById = (locationId: string, scenarioId: string): JourneyScenario | undefined => {
  const location = getLocationById(locationId);
  if (!location) return undefined;
  return location.scenarios.find(s => s.id === scenarioId);
};

export const getChapterByLocationId = (locationId: string): JourneyChapter | undefined => {
  return JOURNEY_CHAPTERS.find(chapter =>
    chapter.locations.some(location => location.id === locationId)
  );
};

export const getTotalScenarioCount = (): number => {
  return JOURNEY_CHAPTERS.reduce((total, chapter) =>
    total + chapter.locations.reduce((locTotal, location) =>
      locTotal + location.scenarios.length, 0), 0);
};

export const getTotalLocationCount = (): number => {
  return JOURNEY_CHAPTERS.reduce((total, chapter) =>
    total + chapter.locations.length, 0);
};
