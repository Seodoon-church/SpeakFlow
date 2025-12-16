// J-Content Learning Data
// Learn Japanese through Anime and J-Pop

export interface JContentPhrase {
  japanese: string;
  reading: string; // hiragana/katakana reading
  meaning: string; // Korean meaning
  usage?: string;
}

export interface AnimeClip {
  id: string;
  anime: string;
  animeJapanese: string;
  episode?: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  phrases: JContentPhrase[];
  dialogue: Array<{
    speaker: string;
    japanese: string;
    reading: string;
    meaning: string;
  }>;
  culturalNote?: string;
  xpReward: number;
}

export interface JPopSong {
  id: string;
  artist: string;
  artistJapanese: string;
  song: string;
  songJapanese: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lyrics: Array<{
    japanese: string;
    reading: string;
    meaning: string;
  }>;
  vocabulary: JContentPhrase[];
  culturalNote?: string;
  xpReward: number;
}

// Anime Clips Data
export const ANIME_CLIPS: AnimeClip[] = [
  {
    id: 'spirited-away-1',
    anime: '센과 치히로의 행방불명',
    animeJapanese: '千と千尋の神隠し',
    title: '첫 만남',
    description: '하쿠와 치히로의 만남 장면에서 배우는 표현',
    difficulty: 'beginner',
    xpReward: 40,
    phrases: [
      {
        japanese: 'ここに来てはいけない',
        reading: 'ここにきてはいけない',
        meaning: '여기 오면 안 돼',
        usage: '상대방에게 경고할 때 사용하는 표현',
      },
      {
        japanese: '早く戻れ',
        reading: 'はやくもどれ',
        meaning: '빨리 돌아가',
        usage: '명령형으로 급하게 지시할 때',
      },
      {
        japanese: '怖くない',
        reading: 'こわくない',
        meaning: '무섭지 않아',
        usage: '누군가를 안심시킬 때',
      },
      {
        japanese: '大丈夫',
        reading: 'だいじょうぶ',
        meaning: '괜찮아',
        usage: '일상에서 가장 많이 쓰는 표현 중 하나',
      },
    ],
    dialogue: [
      { speaker: '하쿠', japanese: 'ここに来てはいけない！', reading: 'ここにきてはいけない', meaning: '여기 오면 안 돼!' },
      { speaker: '치히로', japanese: 'え？誰？', reading: 'え？だれ？', meaning: '어? 누구야?' },
      { speaker: '하쿠', japanese: '早く戻れ！日が暮れる！', reading: 'はやくもどれ！ひがくれる！', meaning: '빨리 돌아가! 해가 진다!' },
    ],
    culturalNote: '지브리 애니메이션은 일본 전통 문화와 신화적 요소를 많이 담고 있어요. "神隠し(가미카쿠시)"는 신에게 숨겨진다는 의미로, 사람이 갑자기 사라지는 현상을 말해요.',
  },
  {
    id: 'your-name-1',
    anime: '너의 이름은',
    animeJapanese: '君の名は',
    title: '운명의 만남',
    description: '타키와 미츠하의 감동적인 대화',
    difficulty: 'intermediate',
    xpReward: 45,
    phrases: [
      {
        japanese: '君の名前は？',
        reading: 'きみのなまえは？',
        meaning: '네 이름은?',
        usage: '이름을 물어볼 때 친근한 표현',
      },
      {
        japanese: '会いたかった',
        reading: 'あいたかった',
        meaning: '보고 싶었어',
        usage: '그리운 사람을 만났을 때',
      },
      {
        japanese: '忘れないで',
        reading: 'わすれないで',
        meaning: '잊지 마',
        usage: '부탁이나 당부할 때',
      },
      {
        japanese: 'どこかで会った？',
        reading: 'どこかであった？',
        meaning: '어디선가 만난 적 있어?',
        usage: '데자뷰를 느낄 때',
      },
    ],
    dialogue: [
      { speaker: '타키', japanese: '君の名前は？', reading: 'きみのなまえは？', meaning: '네 이름은?' },
      { speaker: '미츠하', japanese: '私も聞きたい', reading: 'わたしもききたい', meaning: '나도 묻고 싶어' },
      { speaker: '타키', japanese: '忘れないように、名前を書こう', reading: 'わすれないように、なまえをかこう', meaning: '잊지 않도록 이름을 쓰자' },
    ],
    culturalNote: '"君の名は"는 일본에서 역대 2위 흥행 기록을 세운 작품이에요. 일본어에서 "君(きみ)"는 친근한 "너"를 의미하며, 연인이나 가까운 사이에서 많이 사용해요.',
  },
  {
    id: 'demon-slayer-1',
    anime: '귀멸의 칼날',
    animeJapanese: '鬼滅の刃',
    title: '가족을 지키다',
    description: '탄지로의 결의를 담은 명대사',
    difficulty: 'intermediate',
    xpReward: 50,
    phrases: [
      {
        japanese: '俺が守る',
        reading: 'おれがまもる',
        meaning: '내가 지킬게',
        usage: '결의를 다질 때 (남성적 표현)',
      },
      {
        japanese: '諦めない',
        reading: 'あきらめない',
        meaning: '포기 안 해',
        usage: '의지를 표현할 때',
      },
      {
        japanese: '頑張れ',
        reading: 'がんばれ',
        meaning: '힘내',
        usage: '응원할 때 가장 많이 쓰는 표현',
      },
      {
        japanese: '絶対に',
        reading: 'ぜったいに',
        meaning: '절대로',
        usage: '강조할 때',
      },
    ],
    dialogue: [
      { speaker: '탄지로', japanese: '俺は絶対に諦めない！', reading: 'おれはぜったいにあきらめない！', meaning: '나는 절대로 포기 안 해!' },
      { speaker: '네즈코', japanese: '...', reading: '...', meaning: '...' },
      { speaker: '탄지로', japanese: '禰豆子、俺が守る', reading: 'ねずこ、おれがまもる', meaning: '네즈코, 내가 지킬게' },
    ],
    culturalNote: '"俺(おれ)"는 남성이 사용하는 1인칭이에요. 친구나 가족 사이에서 사용하며, 공식적인 자리에서는 "私(わたし)"를 사용해요.',
  },
  {
    id: 'one-piece-1',
    anime: '원피스',
    animeJapanese: 'ワンピース',
    title: '꿈을 향해',
    description: '루피의 꿈과 동료에 대한 표현',
    difficulty: 'beginner',
    xpReward: 40,
    phrases: [
      {
        japanese: '海賊王になる',
        reading: 'かいぞくおうになる',
        meaning: '해적왕이 될 거야',
        usage: '미래의 목표를 말할 때',
      },
      {
        japanese: '仲間だ',
        reading: 'なかまだ',
        meaning: '동료야',
        usage: '친밀한 관계를 표현할 때',
      },
      {
        japanese: '行くぞ',
        reading: 'いくぞ',
        meaning: '가자',
        usage: '출발할 때 (남성적, 친근한 표현)',
      },
      {
        japanese: '任せろ',
        reading: 'まかせろ',
        meaning: '맡겨',
        usage: '자신감을 표현할 때',
      },
    ],
    dialogue: [
      { speaker: '루피', japanese: '俺は海賊王になる！', reading: 'おれはかいぞくおうになる！', meaning: '나는 해적왕이 될 거야!' },
      { speaker: '조로', japanese: '面白い。俺も乗った', reading: 'おもしろい。おれものった', meaning: '재밌네. 나도 함께할게' },
      { speaker: '루피', japanese: 'よし、行くぞ仲間！', reading: 'よし、いくぞなかま！', meaning: '좋아, 가자 동료들!' },
    ],
    culturalNote: '일본어에서 "仲間(なかま)"는 단순한 친구 이상의 의미로, 함께 목표를 향해 나아가는 동지를 뜻해요. 원피스에서 루피가 가장 중요하게 여기는 가치이기도 해요.',
  },
  {
    id: 'spy-family-1',
    anime: '스파이 패밀리',
    animeJapanese: 'SPY×FAMILY',
    title: '가족의 의미',
    description: '포저 가족의 일상 대화',
    difficulty: 'beginner',
    xpReward: 35,
    phrases: [
      {
        japanese: 'おはよう',
        reading: 'おはよう',
        meaning: '좋은 아침',
        usage: '아침 인사 (친근한 표현)',
      },
      {
        japanese: '行ってきます',
        reading: 'いってきます',
        meaning: '다녀오겠습니다',
        usage: '외출할 때 하는 인사',
      },
      {
        japanese: 'お帰りなさい',
        reading: 'おかえりなさい',
        meaning: '다녀오셨어요',
        usage: '귀가한 사람에게 하는 인사',
      },
      {
        japanese: 'ただいま',
        reading: 'ただいま',
        meaning: '다녀왔어요',
        usage: '집에 돌아왔을 때',
      },
    ],
    dialogue: [
      { speaker: '아냐', japanese: 'おはよう、ちち！', reading: 'おはよう、ちち！', meaning: '좋은 아침, 아빠!' },
      { speaker: '로이드', japanese: 'おはよう、アーニャ', reading: 'おはよう、アーニャ', meaning: '좋은 아침, 아냐' },
      { speaker: '아냐', japanese: '行ってきます！', reading: 'いってきます！', meaning: '다녀오겠습니다!' },
      { speaker: '요르', japanese: '行ってらっしゃい', reading: 'いってらっしゃい', meaning: '다녀와' },
    ],
    culturalNote: '일본에서는 외출/귀가 인사가 매우 중요해요. "行ってきます/行ってらっしゃい", "ただいま/お帰りなさい"는 가족 간의 유대를 나타내는 일상적인 인사입니다.',
  },
];

// J-Pop Songs Data
export const JPOP_SONGS: JPopSong[] = [
  {
    id: 'yoasobi-idol',
    artist: 'YOASOBI',
    artistJapanese: 'ヨアソビ',
    song: '아이돌',
    songJapanese: 'アイドル',
    title: 'YOASOBI - Idol',
    description: '오시노코 OST의 중독성 있는 가사',
    difficulty: 'intermediate',
    xpReward: 50,
    lyrics: [
      {
        japanese: '完璧で究極のアイドル',
        reading: 'かんぺきできゅうきょくのアイドル',
        meaning: '완벽하고 궁극의 아이돌',
      },
      {
        japanese: '誰もが夢中になる',
        reading: 'だれもがむちゅうになる',
        meaning: '누구나 빠져들어',
      },
      {
        japanese: '本当の私を見せたくない',
        reading: 'ほんとうのわたしをみせたくない',
        meaning: '진짜 나를 보여주고 싶지 않아',
      },
      {
        japanese: '嘘で塗り固めた',
        reading: 'うそでぬりかためた',
        meaning: '거짓으로 칠해진',
      },
    ],
    vocabulary: [
      {
        japanese: '完璧',
        reading: 'かんぺき',
        meaning: '완벽',
        usage: '빈틈없이 훌륭한 상태를 표현',
      },
      {
        japanese: '夢中',
        reading: 'むちゅう',
        meaning: '열중, 빠져듦',
        usage: '무언가에 푹 빠진 상태',
      },
      {
        japanese: '嘘',
        reading: 'うそ',
        meaning: '거짓말',
        usage: '일상에서 자주 쓰는 단어',
      },
    ],
    culturalNote: 'YOASOBI는 소설을 음악으로 만드는 독특한 컨셉의 듀오예요. "アイドル"은 애니메이션 "오시노코"의 오프닝으로, 아이돌 산업의 이면을 다루고 있어요.',
  },
  {
    id: 'kenshi-yonezu-lemon',
    artist: '요네즈 켄시',
    artistJapanese: '米津玄師',
    song: '레몬',
    songJapanese: 'Lemon',
    title: '요네즈 켄시 - Lemon',
    description: '그리움을 담은 서정적인 가사',
    difficulty: 'intermediate',
    xpReward: 45,
    lyrics: [
      {
        japanese: '夢ならばどれほど良かったでしょう',
        reading: 'ゆめならばどれほどよかったでしょう',
        meaning: '꿈이라면 얼마나 좋았을까요',
      },
      {
        japanese: '今でもあなたはわたしの光',
        reading: 'いまでもあなたはわたしのひかり',
        meaning: '지금도 당신은 나의 빛',
      },
      {
        japanese: '忘れられない',
        reading: 'わすれられない',
        meaning: '잊을 수 없어',
      },
      {
        japanese: '胸に残り離れない',
        reading: 'むねにのこりはなれない',
        meaning: '가슴에 남아 떠나지 않아',
      },
    ],
    vocabulary: [
      {
        japanese: '夢',
        reading: 'ゆめ',
        meaning: '꿈',
        usage: '희망이나 잠잘 때 꾸는 꿈 모두',
      },
      {
        japanese: '光',
        reading: 'ひかり',
        meaning: '빛',
        usage: '물리적 빛 또는 희망의 의미',
      },
      {
        japanese: '忘れる',
        reading: 'わすれる',
        meaning: '잊다',
        usage: '기억에서 사라지다',
      },
    ],
    culturalNote: 'Lemon은 드라마 "언내추럴"의 주제곡으로, 일본에서 가장 많이 스트리밍된 곡 중 하나예요. 요네즈 켄시는 원래 보컬로이드 프로듀서 "하치"로 활동했어요.',
  },
  {
    id: 'ado-odo',
    artist: 'Ado',
    artistJapanese: 'Ado',
    song: '춤',
    songJapanese: '踊',
    title: 'Ado - 踊',
    description: '강렬한 에너지의 가사',
    difficulty: 'advanced',
    xpReward: 55,
    lyrics: [
      {
        japanese: '踊れ踊れ踊れ',
        reading: 'おどれおどれおどれ',
        meaning: '춤춰 춤춰 춤춰',
      },
      {
        japanese: '世界の終わりまで',
        reading: 'せかいのおわりまで',
        meaning: '세계의 끝까지',
      },
      {
        japanese: '何も怖くない',
        reading: 'なにもこわくない',
        meaning: '아무것도 두렵지 않아',
      },
      {
        japanese: '自分らしく生きる',
        reading: 'じぶんらしくいきる',
        meaning: '나답게 살아가다',
      },
    ],
    vocabulary: [
      {
        japanese: '踊る',
        reading: 'おどる',
        meaning: '춤추다',
        usage: '춤을 추는 동작',
      },
      {
        japanese: '世界',
        reading: 'せかい',
        meaning: '세계',
        usage: '세상, 월드',
      },
      {
        japanese: '怖い',
        reading: 'こわい',
        meaning: '무서운',
        usage: '두려움을 표현할 때',
      },
    ],
    culturalNote: 'Ado는 얼굴을 공개하지 않는 미스터리한 가수로, 영화 "원피스 필름 레드"에서 우타의 목소리를 담당했어요. 강렬한 보컬이 특징이에요.',
  },
  {
    id: 'lisa-gurenge',
    artist: 'LiSA',
    artistJapanese: 'LiSA',
    song: '홍련화',
    songJapanese: '紅蓮華',
    title: 'LiSA - 紅蓮華',
    description: '귀멸의 칼날 오프닝',
    difficulty: 'intermediate',
    xpReward: 45,
    lyrics: [
      {
        japanese: '強くなれる理由を知った',
        reading: 'つよくなれるりゆうをしった',
        meaning: '강해질 수 있는 이유를 알았어',
      },
      {
        japanese: '僕を連れて進め',
        reading: 'ぼくをつれてすすめ',
        meaning: '나를 데리고 나아가',
      },
      {
        japanese: '泥だらけの走馬灯に',
        reading: 'どろだらけのそうまとうに',
        meaning: '진흙투성이 주마등에',
      },
      {
        japanese: '何度でも立ち上がれ',
        reading: 'なんどでもたちあがれ',
        meaning: '몇 번이고 일어나',
      },
    ],
    vocabulary: [
      {
        japanese: '強い',
        reading: 'つよい',
        meaning: '강한',
        usage: '힘이나 의지가 강할 때',
      },
      {
        japanese: '理由',
        reading: 'りゆう',
        meaning: '이유',
        usage: '원인이나 까닭',
      },
      {
        japanese: '進む',
        reading: 'すすむ',
        meaning: '나아가다',
        usage: '앞으로 전진할 때',
      },
    ],
    culturalNote: '紅蓮華는 귀멸의 칼날과 함께 대히트하며 LiSA를 국민 가수 반열에 올렸어요. "紅蓮(ぐれん)"은 붉은 연꽃을 의미해요.',
  },
  {
    id: 'official-hige-subtitle',
    artist: 'Official히게단디즘',
    artistJapanese: 'Official髭男dism',
    song: '자막',
    songJapanese: 'Subtitle',
    title: 'Official髭男dism - Subtitle',
    description: '사랑의 감정을 표현하는 가사',
    difficulty: 'beginner',
    xpReward: 40,
    lyrics: [
      {
        japanese: '君に会えてよかった',
        reading: 'きみにあえてよかった',
        meaning: '너를 만나서 다행이야',
      },
      {
        japanese: '言葉にできない',
        reading: 'ことばにできない',
        meaning: '말로 할 수 없어',
      },
      {
        japanese: 'この気持ちを',
        reading: 'このきもちを',
        meaning: '이 마음을',
      },
      {
        japanese: 'そばにいたい',
        reading: 'そばにいたい',
        meaning: '곁에 있고 싶어',
      },
    ],
    vocabulary: [
      {
        japanese: '会う',
        reading: 'あう',
        meaning: '만나다',
        usage: '사람을 만날 때',
      },
      {
        japanese: '言葉',
        reading: 'ことば',
        meaning: '말, 단어',
        usage: '언어나 표현',
      },
      {
        japanese: '気持ち',
        reading: 'きもち',
        meaning: '마음, 기분',
        usage: '감정을 표현할 때',
      },
    ],
    culturalNote: 'Official髭男dism(오피셜히게단디즘)은 "髭(ひげ, 수염)"이 이름에 들어간 재미있는 밴드명이에요. 드라마 OST로 유명해진 밴드입니다.',
  },
];

// Helper functions
export const getAllAnimeClips = () => ANIME_CLIPS;
export const getAllJPopSongs = () => JPOP_SONGS;

export const getAnimeClipById = (id: string) => ANIME_CLIPS.find(c => c.id === id);
export const getJPopSongById = (id: string) => JPOP_SONGS.find(s => s.id === id);

export const getJContentByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced') => ({
  anime: ANIME_CLIPS.filter(c => c.difficulty === difficulty),
  songs: JPOP_SONGS.filter(s => s.difficulty === difficulty),
});
