// Journey System - Virtual Trip Through USA & UK
// 미국/영국 여행을 통한 영어 학습

export interface EnglishPhrase {
  english: string;
  pronunciation?: string;
  meaning: string;
  context?: string;
}

export interface EnglishDialogue {
  speaker: 'you' | 'other';
  speakerName?: string;
  english: string;
  meaning: string;
}

export interface EnglishScenario {
  id: string;
  title: string;
  description: string;
  situation: string;
  icon: string;
  xpReward: number;
  estimatedMinutes: number;
  phrases: EnglishPhrase[];
  dialogues: EnglishDialogue[];
  culturalNote?: string;
}

export interface EnglishLocation {
  id: string;
  name: string;
  localName: string;
  description: string;
  story: string;
  icon: string;
  color: string;
  coordinates: { x: number; y: number };
  requiredMastery: number;
  scenarios: EnglishScenario[];
}

export interface EnglishChapter {
  id: string;
  title: string;
  description: string;
  country: 'usa' | 'uk';
  locations: EnglishLocation[];
}

// ============================
// USA - CHAPTER 1: 뉴욕 도착
// ============================

const USA_CHAPTER_1_NYC: EnglishChapter = {
  id: 'usa-chapter-1-nyc',
  title: '제1장: 뉴욕 도착',
  description: '빅 애플에 오신 것을 환영합니다! JFK 공항에서 맨해튼으로!',
  country: 'usa',
  locations: [
    {
      id: 'jfk-airport',
      name: 'JFK 공항',
      localName: 'JFK International Airport',
      description: '뉴욕의 관문, JFK 국제공항에 도착했습니다!',
      story: 'JFK 국제공항에 도착했습니다. 입국심사를 통과하고 맨해튼으로 가는 방법을 찾아야 해요.',
      icon: '✈️',
      color: 'from-blue-500 to-indigo-600',
      coordinates: { x: 80, y: 30 },
      requiredMastery: 0,
      scenarios: [
        {
          id: 'usa-immigration',
          title: '입국심사',
          description: '미국 입국심사 통과하기',
          situation: '입국심사대에서 심사관과 대화합니다.',
          icon: '🛂',
          xpReward: 30,
          estimatedMinutes: 5,
          phrases: [
            { english: 'May I see your passport, please?', meaning: '여권 좀 보여주시겠어요?' },
            { english: "What's the purpose of your visit?", meaning: '방문 목적이 뭐예요?' },
            { english: "I'm here for sightseeing.", meaning: '관광하러 왔어요.' },
            { english: 'How long will you be staying?', meaning: '얼마나 체류하실 건가요?' },
            { english: "I'll be here for two weeks.", meaning: '2주간 있을 거예요.' },
            { english: 'Where will you be staying?', meaning: '어디서 묵으실 건가요?' },
          ],
          dialogues: [
            { speaker: 'other', speakerName: 'Officer', english: 'Next, please. May I see your passport?', meaning: '다음 분요. 여권 좀 보여주세요.' },
            { speaker: 'you', english: 'Here you go.', meaning: '여기요.' },
            { speaker: 'other', speakerName: 'Officer', english: "What's the purpose of your visit?", meaning: '방문 목적이 뭐예요?' },
            { speaker: 'you', english: "I'm here for sightseeing.", meaning: '관광하러 왔어요.' },
            { speaker: 'other', speakerName: 'Officer', english: 'How long will you be staying?', meaning: '얼마나 체류하실 건가요?' },
            { speaker: 'you', english: "Two weeks. I'll be staying at a hotel in Manhattan.", meaning: '2주요. 맨해튼 호텔에서 묵을 거예요.' },
            { speaker: 'other', speakerName: 'Officer', english: 'Welcome to the United States. Enjoy your stay!', meaning: '미국에 오신 것을 환영합니다. 즐거운 여행 되세요!' },
          ],
          culturalNote: '미국 입국심사는 꼼꼼한 편이에요. 질문에 간단하고 명확하게 답하는 것이 좋아요.',
        },
        {
          id: 'usa-taxi',
          title: '택시 타기',
          description: '공항에서 맨해튼으로 이동',
          situation: '택시를 타고 맨해튼 호텔로 갑니다.',
          icon: '🚕',
          xpReward: 25,
          estimatedMinutes: 5,
          phrases: [
            { english: 'Where can I get a taxi?', meaning: '택시 어디서 탈 수 있어요?' },
            { english: 'To Manhattan, please.', meaning: '맨해튼으로 가주세요.' },
            { english: 'How much will it cost?', meaning: '얼마나 나올까요?' },
            { english: 'How long does it take?', meaning: '얼마나 걸려요?' },
            { english: 'Can I pay by card?', meaning: '카드로 결제할 수 있어요?' },
            { english: 'Keep the change.', meaning: '거스름돈은 됐어요.' },
          ],
          dialogues: [
            { speaker: 'you', english: 'Hi! To the Hilton Hotel in Midtown Manhattan, please.', meaning: '안녕하세요! 미드타운 맨해튼 힐튼 호텔로 가주세요.' },
            { speaker: 'other', speakerName: 'Driver', english: 'Sure thing. It\'ll take about 45 minutes with traffic.', meaning: '네. 교통 상황 보면 45분 정도 걸릴 거예요.' },
            { speaker: 'you', english: 'That\'s fine. How much will it be?', meaning: '괜찮아요. 얼마 정도 나올까요?' },
            { speaker: 'other', speakerName: 'Driver', english: 'Around 70 dollars plus tolls and tip.', meaning: '통행료랑 팁 포함해서 70달러 정도요.' },
            { speaker: 'you', english: 'Sounds good. Can I pay by card?', meaning: '좋아요. 카드로 결제할 수 있어요?' },
            { speaker: 'other', speakerName: 'Driver', english: 'Absolutely!', meaning: '물론이죠!' },
          ],
          culturalNote: '미국에서는 택시 기사에게 요금의 15-20% 정도 팁을 주는 것이 일반적이에요.',
        },
      ],
    },
    {
      id: 'times-square',
      name: '타임스퀘어',
      localName: 'Times Square',
      description: '세계의 교차로, 타임스퀘어!',
      story: '화려한 광고판과 브로드웨이 극장이 가득한 타임스퀘어에 왔습니다!',
      icon: '🌃',
      color: 'from-yellow-500 to-orange-600',
      coordinates: { x: 50, y: 45 },
      requiredMastery: 60,
      scenarios: [
        {
          id: 'usa-street-food',
          title: '길거리 음식',
          description: '푸드트럭에서 주문하기',
          situation: '타임스퀘어의 핫도그 푸드트럭에서 주문합니다.',
          icon: '🌭',
          xpReward: 25,
          estimatedMinutes: 5,
          phrases: [
            { english: 'What do you recommend?', meaning: '뭘 추천하세요?' },
            { english: "I'll have a hot dog, please.", meaning: '핫도그 하나 주세요.' },
            { english: 'With mustard and ketchup.', meaning: '머스타드랑 케첩 넣어주세요.' },
            { english: 'Can I get a soda too?', meaning: '탄산음료도 하나 주세요.' },
            { english: 'How much is that?', meaning: '얼마예요?' },
          ],
          dialogues: [
            { speaker: 'other', speakerName: 'Vendor', english: 'Hey there! What can I get ya?', meaning: '안녕하세요! 뭘 드릴까요?' },
            { speaker: 'you', english: "I'll have a hot dog with everything.", meaning: '핫도그 토핑 다 넣어서 주세요.' },
            { speaker: 'other', speakerName: 'Vendor', english: 'You got it! Anything to drink?', meaning: '알겠어요! 음료는요?' },
            { speaker: 'you', english: 'A Coke, please.', meaning: '콜라 주세요.' },
            { speaker: 'other', speakerName: 'Vendor', english: "That'll be eight dollars.", meaning: '8달러입니다.' },
            { speaker: 'you', english: 'Here you go. Keep the change!', meaning: '여기요. 잔돈은 됐어요!' },
          ],
          culturalNote: '뉴욕의 푸드트럭과 길거리 음식은 현지인들도 즐겨 먹어요. 특히 핫도그와 프레첼이 유명해요!',
        },
        {
          id: 'usa-broadway',
          title: '브로드웨이 티켓',
          description: '뮤지컬 티켓 구매하기',
          situation: 'TKTS 부스에서 브로드웨이 티켓을 구매합니다.',
          icon: '🎭',
          xpReward: 35,
          estimatedMinutes: 6,
          phrases: [
            { english: 'What shows are available tonight?', meaning: '오늘 밤 어떤 공연이 있어요?' },
            { english: 'How much are the tickets?', meaning: '티켓이 얼마예요?' },
            { english: 'Are there any discounts?', meaning: '할인이 있나요?' },
            { english: "I'd like two tickets, please.", meaning: '티켓 두 장 주세요.' },
            { english: 'What time does the show start?', meaning: '공연이 몇 시에 시작해요?' },
          ],
          dialogues: [
            { speaker: 'you', english: 'Hi, what shows are available for tonight?', meaning: '안녕하세요, 오늘 밤 어떤 공연이 있나요?' },
            { speaker: 'other', speakerName: 'Agent', english: 'We have Hamilton, Wicked, and The Lion King with same-day tickets.', meaning: '해밀턴, 위키드, 라이온 킹 당일권이 있어요.' },
            { speaker: 'you', english: 'How much is The Lion King?', meaning: '라이온 킹은 얼마예요?' },
            { speaker: 'other', speakerName: 'Agent', english: "Orchestra seats are $189, mezzanine is $129.", meaning: '오케스트라석은 189달러, 메자닌석은 129달러예요.' },
            { speaker: 'you', english: "I'll take two mezzanine tickets, please.", meaning: '메자닌 좌석 두 장 주세요.' },
            { speaker: 'other', speakerName: 'Agent', english: 'Great choice! The show starts at 7 PM.', meaning: '좋은 선택이에요! 공연은 저녁 7시에 시작해요.' },
          ],
          culturalNote: 'TKTS 부스에서는 당일 브로드웨이 티켓을 20-50% 할인된 가격에 살 수 있어요!',
        },
      ],
    },
    {
      id: 'central-park',
      name: '센트럴 파크',
      localName: 'Central Park',
      description: '맨해튼의 푸른 오아시스!',
      story: '뉴욕 한복판의 거대한 공원, 센트럴 파크에서 여유를 즐깁니다.',
      icon: '🌳',
      color: 'from-green-500 to-emerald-600',
      coordinates: { x: 35, y: 35 },
      requiredMastery: 50,
      scenarios: [
        {
          id: 'usa-directions',
          title: '길 찾기',
          description: '공원에서 길 물어보기',
          situation: '센트럴 파크에서 베데스다 분수를 찾습니다.',
          icon: '🗺️',
          xpReward: 25,
          estimatedMinutes: 5,
          phrases: [
            { english: 'Excuse me, could you help me?', meaning: '실례합니다, 도와주실 수 있나요?' },
            { english: "I'm looking for Bethesda Fountain.", meaning: '베데스다 분수를 찾고 있어요.' },
            { english: 'Which way should I go?', meaning: '어느 쪽으로 가야 해요?' },
            { english: 'Is it far from here?', meaning: '여기서 멀어요?' },
            { english: 'Thank you so much!', meaning: '정말 감사합니다!' },
          ],
          dialogues: [
            { speaker: 'you', english: 'Excuse me, could you help me? I\'m looking for Bethesda Fountain.', meaning: '실례합니다, 도와주실 수 있나요? 베데스다 분수를 찾고 있어요.' },
            { speaker: 'other', speakerName: 'Jogger', english: 'Sure! Keep walking straight and take a left at the next path.', meaning: '물론이죠! 직진하다가 다음 길에서 왼쪽으로 가세요.' },
            { speaker: 'you', english: 'Is it far from here?', meaning: '여기서 멀어요?' },
            { speaker: 'other', speakerName: 'Jogger', english: "It's about a 5-minute walk. You can't miss it!", meaning: '걸어서 5분 정도요. 금방 찾으실 거예요!' },
            { speaker: 'you', english: 'Thanks a lot!', meaning: '정말 감사합니다!' },
          ],
          culturalNote: '미국인들은 대체로 친절하게 길을 알려줘요. "Excuse me"로 시작하면 좋아요!',
        },
      ],
    },
  ],
};

// ============================
// USA - CHAPTER 2: 뉴욕 탐험
// ============================

const USA_CHAPTER_2_EXPLORE: EnglishChapter = {
  id: 'usa-chapter-2-explore',
  title: '제2장: 뉴욕 탐험',
  description: '뉴욕의 다양한 명소를 탐험해요!',
  country: 'usa',
  locations: [
    {
      id: 'statue-of-liberty',
      name: '자유의 여신상',
      localName: 'Statue of Liberty',
      description: '미국의 상징, 자유의 여신상!',
      story: '리버티 섬으로 페리를 타고 자유의 여신상을 보러 갑니다.',
      icon: '🗽',
      color: 'from-teal-500 to-cyan-600',
      coordinates: { x: 20, y: 60 },
      requiredMastery: 0,
      scenarios: [
        {
          id: 'usa-ferry-ticket',
          title: '페리 티켓',
          description: '리버티 섬 페리 티켓 구매하기',
          situation: '배터리 파크에서 페리 티켓을 삽니다.',
          icon: '⛴️',
          xpReward: 30,
          estimatedMinutes: 5,
          phrases: [
            { english: "I'd like a ticket to Liberty Island.", meaning: '리버티 섬 티켓 주세요.' },
            { english: 'Does it include Ellis Island?', meaning: '엘리스 섬도 포함인가요?' },
            { english: 'When does the next ferry leave?', meaning: '다음 페리는 언제 출발해요?' },
            { english: 'How long is the boat ride?', meaning: '배 타고 얼마나 걸려요?' },
            { english: 'Can I go up to the crown?', meaning: '왕관까지 올라갈 수 있어요?' },
          ],
          dialogues: [
            { speaker: 'you', english: 'Hi, I\'d like a ticket to Liberty Island, please.', meaning: '안녕하세요, 리버티 섬 티켓 주세요.' },
            { speaker: 'other', speakerName: 'Agent', english: 'Would you like the basic ticket or the pedestal access?', meaning: '기본 티켓으로 할까요, 아니면 받침대 입장권으로 할까요?' },
            { speaker: 'you', english: 'What\'s the difference?', meaning: '뭐가 다른가요?' },
            { speaker: 'other', speakerName: 'Agent', english: 'Pedestal access lets you go inside the statue base. It\'s $24 versus $19.', meaning: '받침대 입장권은 동상 기단 안으로 들어갈 수 있어요. 24달러고 기본은 19달러예요.' },
            { speaker: 'you', english: "I'll take the pedestal access.", meaning: '받침대 입장권으로 할게요.' },
          ],
          culturalNote: '자유의 여신상 왕관 방문은 몇 달 전에 예약해야 해요. 계획이 있다면 미리 예약하세요!',
        },
      ],
    },
    {
      id: 'brooklyn-bridge',
      name: '브루클린 브릿지',
      localName: 'Brooklyn Bridge',
      description: '맨해튼과 브루클린을 잇는 아이코닉한 다리!',
      story: '브루클린 브릿지를 걸으며 맨해튼 스카이라인을 감상합니다.',
      icon: '🌉',
      color: 'from-amber-500 to-orange-600',
      coordinates: { x: 65, y: 55 },
      requiredMastery: 50,
      scenarios: [
        {
          id: 'usa-photo-request',
          title: '사진 부탁',
          description: '다른 사람에게 사진 부탁하기',
          situation: '브루클린 브릿지에서 사진을 찍어달라고 부탁합니다.',
          icon: '📸',
          xpReward: 20,
          estimatedMinutes: 4,
          phrases: [
            { english: 'Could you take a picture of us?', meaning: '저희 사진 좀 찍어주실 수 있나요?' },
            { english: 'Just press this button.', meaning: '이 버튼만 누르시면 돼요.' },
            { english: 'One more, please?', meaning: '한 장 더 부탁해도 될까요?' },
            { english: 'That\'s a great shot!', meaning: '사진 잘 나왔네요!' },
            { english: 'Would you like me to take yours?', meaning: '제가 사진 찍어드릴까요?' },
          ],
          dialogues: [
            { speaker: 'you', english: 'Excuse me, would you mind taking a picture of us?', meaning: '실례합니다, 저희 사진 좀 찍어주실 수 있나요?' },
            { speaker: 'other', speakerName: 'Tourist', english: 'Sure, no problem!', meaning: '네, 물론이죠!' },
            { speaker: 'you', english: 'Just tap the screen. Make sure to get the bridge in the background!', meaning: '화면을 탭하시면 돼요. 배경에 다리가 나오게 해주세요!' },
            { speaker: 'other', speakerName: 'Tourist', english: 'Got it! Ready? One, two, three!', meaning: '알겠어요! 준비됐어요? 하나, 둘, 셋!' },
            { speaker: 'you', english: "Thank you so much! Would you like me to take one for you?", meaning: '정말 감사합니다! 제가 하나 찍어드릴까요?' },
          ],
          culturalNote: '서로 사진을 찍어주는 것은 관광지에서 흔한 일이에요. 친절하게 부탁하면 대부분 기꺼이 도와줘요!',
        },
      ],
    },
  ],
};

// ============================
// UK - CHAPTER 1: 런던 도착
// ============================

const UK_CHAPTER_1_LONDON: EnglishChapter = {
  id: 'uk-chapter-1-london',
  title: '제1장: 런던 도착',
  description: '대영제국의 수도 런던에 오신 것을 환영합니다!',
  country: 'uk',
  locations: [
    {
      id: 'heathrow-airport',
      name: '히드로 공항',
      localName: 'Heathrow Airport',
      description: '유럽 최대의 공항, 히드로에 도착!',
      story: '히드로 공항에 도착했습니다. 런던 중심부로 이동해야 해요.',
      icon: '✈️',
      color: 'from-red-500 to-rose-600',
      coordinates: { x: 20, y: 30 },
      requiredMastery: 0,
      scenarios: [
        {
          id: 'uk-immigration',
          title: '영국 입국심사',
          description: '영국 입국심사 통과하기',
          situation: '히드로 공항 입국심사대에서 심사관과 대화합니다.',
          icon: '🛂',
          xpReward: 30,
          estimatedMinutes: 5,
          phrases: [
            { english: 'May I see your passport, please?', meaning: '여권 좀 보여주시겠어요?' },
            { english: "What's the purpose of your visit?", meaning: '방문 목적이 뭐예요?' },
            { english: "I'm here on holiday.", meaning: '휴가로 왔어요.' },
            { english: 'How long will you be staying?', meaning: '얼마나 체류하실 건가요?' },
            { english: "I'll be staying for ten days.", meaning: '10일간 있을 거예요.' },
          ],
          dialogues: [
            { speaker: 'other', speakerName: 'Officer', english: 'Good afternoon. Passport, please.', meaning: '안녕하세요. 여권 주세요.' },
            { speaker: 'you', english: 'Here you are.', meaning: '여기요.' },
            { speaker: 'other', speakerName: 'Officer', english: "What brings you to the UK?", meaning: '영국엔 무슨 일로 오셨어요?' },
            { speaker: 'you', english: "I'm here on holiday. I want to see the sights.", meaning: '휴가로 왔어요. 관광하러요.' },
            { speaker: 'other', speakerName: 'Officer', english: 'Lovely. How long will you be staying?', meaning: '좋네요. 얼마나 계실 건가요?' },
            { speaker: 'you', english: "Ten days. I'll be staying at a hotel in Central London.", meaning: '10일이요. 런던 중심부 호텔에서 묵을 거예요.' },
            { speaker: 'other', speakerName: 'Officer', english: 'Enjoy your stay. Welcome to the United Kingdom.', meaning: '즐거운 여행 되세요. 영국에 오신 것을 환영합니다.' },
          ],
          culturalNote: '영국 영어는 미국 영어와 약간 다른 표현을 써요. "holiday"는 미국의 "vacation"과 같아요.',
        },
        {
          id: 'uk-underground',
          title: '지하철 타기',
          description: '런던 언더그라운드 이용하기',
          situation: '히드로에서 피카딜리 라인을 타고 런던 중심부로 갑니다.',
          icon: '🚇',
          xpReward: 35,
          estimatedMinutes: 6,
          phrases: [
            { english: 'Where can I buy an Oyster card?', meaning: '오이스터 카드 어디서 살 수 있어요?' },
            { english: 'Which line goes to Piccadilly Circus?', meaning: '피카딜리 서커스는 어떤 라인이에요?' },
            { english: 'Mind the gap!', meaning: '틈 조심하세요!' },
            { english: 'Is this the right platform?', meaning: '이 승강장이 맞나요?' },
            { english: 'How many stops to King\'s Cross?', meaning: '킹스 크로스까지 몇 정거장이에요?' },
          ],
          dialogues: [
            { speaker: 'you', english: 'Excuse me, where can I get an Oyster card?', meaning: '실례합니다, 오이스터 카드 어디서 살 수 있어요?' },
            { speaker: 'other', speakerName: 'Staff', english: 'You can get one from the ticket machines over there, or I can help you here.', meaning: '저기 발매기에서 사거나, 여기서 제가 도와드릴 수 있어요.' },
            { speaker: 'you', english: "I'll get it here, please. I need to go to King's Cross.", meaning: '여기서 살게요. 킹스 크로스로 가야 해요.' },
            { speaker: 'other', speakerName: 'Staff', english: "Right, that's the Piccadilly Line. It's direct from here.", meaning: '네, 피카딜리 라인이요. 여기서 바로 가요.' },
            { speaker: 'you', english: 'Brilliant, thank you!', meaning: '훌륭해요, 감사합니다!' },
          ],
          culturalNote: '"Mind the gap"은 런던 지하철의 유명한 안내방송이에요. 열차와 승강장 사이 틈을 조심하라는 뜻이에요!',
        },
      ],
    },
    {
      id: 'big-ben',
      name: '빅 벤',
      localName: 'Big Ben & Westminster',
      description: '런던의 상징, 빅 벤과 국회의사당!',
      story: '웨스트민스터에 있는 빅 벤과 국회의사당을 구경합니다.',
      icon: '🕰️',
      color: 'from-amber-500 to-yellow-600',
      coordinates: { x: 45, y: 45 },
      requiredMastery: 60,
      scenarios: [
        {
          id: 'uk-sightseeing-tour',
          title: '시티 투어',
          description: '관광 투어 예약하기',
          situation: '빅 벤 근처에서 시티 투어 버스를 예약합니다.',
          icon: '🚌',
          xpReward: 30,
          estimatedMinutes: 5,
          phrases: [
            { english: 'How much is the bus tour?', meaning: '버스 투어 얼마예요?' },
            { english: 'How long is the tour?', meaning: '투어는 얼마나 걸려요?' },
            { english: 'Does it stop at Buckingham Palace?', meaning: '버킹엄 궁전에 서나요?' },
            { english: 'Can I hop on and off?', meaning: '자유롭게 타고 내릴 수 있나요?' },
            { english: 'Is there a guide?', meaning: '가이드가 있나요?' },
          ],
          dialogues: [
            { speaker: 'other', speakerName: 'Agent', english: 'Would you like a hop-on hop-off bus tour?', meaning: '홉온홉오프 버스 투어 하실래요?' },
            { speaker: 'you', english: 'Yes, please. How much is it?', meaning: '네. 얼마예요?' },
            { speaker: 'other', speakerName: 'Agent', english: "It's £36 for a 24-hour ticket. You can get on and off at any stop.", meaning: '24시간권이 36파운드예요. 어느 정류장에서든 타고 내리실 수 있어요.' },
            { speaker: 'you', english: 'Does it go to all the main attractions?', meaning: '주요 명소 다 가나요?' },
            { speaker: 'other', speakerName: 'Agent', english: "Absolutely! Big Ben, Tower Bridge, Buckingham Palace - you name it.", meaning: '물론이죠! 빅벤, 타워 브릿지, 버킹엄 궁전 - 다 있어요.' },
            { speaker: 'you', english: "Lovely, I'll take one.", meaning: '좋아요, 하나 살게요.' },
          ],
          culturalNote: '"Lovely"는 영국에서 매우 자주 쓰는 표현이에요. 좋다, 괜찮다는 의미로 다양하게 써요.',
        },
      ],
    },
  ],
};

// ============================
// UK - CHAPTER 2: 런던 탐험
// ============================

const UK_CHAPTER_2_EXPLORE: EnglishChapter = {
  id: 'uk-chapter-2-explore',
  title: '제2장: 런던 탐험',
  description: '런던의 다양한 명소와 문화를 탐험해요!',
  country: 'uk',
  locations: [
    {
      id: 'british-museum',
      name: '대영박물관',
      localName: 'British Museum',
      description: '세계적인 문화유산을 만나보세요!',
      story: '대영박물관에서 세계 각국의 유물을 감상합니다.',
      icon: '🏛️',
      color: 'from-slate-500 to-slate-700',
      coordinates: { x: 55, y: 35 },
      requiredMastery: 0,
      scenarios: [
        {
          id: 'uk-museum-visit',
          title: '박물관 방문',
          description: '박물관에서 정보 얻기',
          situation: '대영박물관 입구에서 정보를 문의합니다.',
          icon: '🎫',
          xpReward: 25,
          estimatedMinutes: 5,
          phrases: [
            { english: 'Is there an entrance fee?', meaning: '입장료가 있나요?' },
            { english: 'Where is the Egyptian section?', meaning: '이집트관은 어디예요?' },
            { english: 'Is there an audio guide?', meaning: '오디오 가이드가 있나요?' },
            { english: 'What time does the museum close?', meaning: '박물관 몇 시에 닫아요?' },
            { english: 'Where is the gift shop?', meaning: '기념품 가게는 어디예요?' },
          ],
          dialogues: [
            { speaker: 'you', english: 'Hello, is there an entrance fee?', meaning: '안녕하세요, 입장료가 있나요?' },
            { speaker: 'other', speakerName: 'Staff', english: "No, entry is free! But donations are welcome.", meaning: '아니요, 무료예요! 하지만 기부는 환영합니다.' },
            { speaker: 'you', english: 'That\'s wonderful. Where can I find the Rosetta Stone?', meaning: '훌륭하네요. 로제타스톤은 어디서 볼 수 있어요?' },
            { speaker: 'other', speakerName: 'Staff', english: "It's in Room 4, the Egyptian Sculpture gallery. Just go straight ahead.", meaning: '4번 방, 이집트 조각관에 있어요. 직진하시면 돼요.' },
            { speaker: 'you', english: 'Cheers!', meaning: '고마워요!' },
          ],
          culturalNote: '대영박물관은 무료예요! "Cheers"는 영국에서 "고마워"라는 의미로 자주 써요.',
        },
      ],
    },
    {
      id: 'covent-garden',
      name: '코벤트 가든',
      localName: 'Covent Garden',
      description: '쇼핑과 거리 공연의 천국!',
      story: '코벤트 가든에서 쇼핑을 하고 거리 공연을 즐깁니다.',
      icon: '🎪',
      color: 'from-purple-500 to-violet-600',
      coordinates: { x: 65, y: 50 },
      requiredMastery: 50,
      scenarios: [
        {
          id: 'uk-afternoon-tea',
          title: '애프터눈 티',
          description: '전통 영국식 티타임 즐기기',
          situation: '코벤트 가든의 티룸에서 애프터눈 티를 주문합니다.',
          icon: '🫖',
          xpReward: 35,
          estimatedMinutes: 6,
          phrases: [
            { english: 'Do you have afternoon tea?', meaning: '애프터눈 티 있나요?' },
            { english: "I'd like a pot of Earl Grey, please.", meaning: '얼그레이 한 포트 주세요.' },
            { english: 'Could I have some more milk?', meaning: '우유 좀 더 주시겠어요?' },
            { english: 'What scones do you have?', meaning: '어떤 스콘이 있어요?' },
            { english: 'The scones are delicious!', meaning: '스콘 맛있어요!' },
          ],
          dialogues: [
            { speaker: 'other', speakerName: 'Server', english: 'Good afternoon! Would you like our afternoon tea set?', meaning: '안녕하세요! 애프터눈 티 세트 드릴까요?' },
            { speaker: 'you', english: 'Yes, please. What teas do you have?', meaning: '네. 어떤 차가 있어요?' },
            { speaker: 'other', speakerName: 'Server', english: 'We have Earl Grey, English Breakfast, and Darjeeling.', meaning: '얼그레이, 잉글리시 브렉퍼스트, 다즐링이 있어요.' },
            { speaker: 'you', english: "I'll have the Earl Grey, please.", meaning: '얼그레이로 할게요.' },
            { speaker: 'other', speakerName: 'Server', english: 'Lovely. Your scones will come with clotted cream and jam.', meaning: '좋아요. 스콘은 클로티드 크림과 잼이랑 나와요.' },
            { speaker: 'you', english: 'How delightful!', meaning: '정말 좋네요!' },
          ],
          culturalNote: '애프터눈 티는 영국의 전통이에요. 스콘에 클로티드 크림을 먼저 바르는지, 잼을 먼저 바르는지는 지역마다 논쟁이 있어요!',
        },
        {
          id: 'uk-shopping',
          title: '쇼핑',
          description: '영국 브랜드 쇼핑하기',
          situation: '코벤트 가든에서 쇼핑을 합니다.',
          icon: '🛍️',
          xpReward: 25,
          estimatedMinutes: 5,
          phrases: [
            { english: "I'm just looking, thanks.", meaning: '그냥 구경 중이에요, 감사해요.' },
            { english: 'Do you have this in a smaller size?', meaning: '이거 더 작은 사이즈 있어요?' },
            { english: 'Can I try this on?', meaning: '이거 입어봐도 될까요?' },
            { english: 'How much is this?', meaning: '이거 얼마예요?' },
            { english: 'Can I get a VAT refund?', meaning: 'VAT 환급 받을 수 있나요?' },
          ],
          dialogues: [
            { speaker: 'other', speakerName: 'Staff', english: 'Hello! Can I help you with anything?', meaning: '안녕하세요! 도와드릴까요?' },
            { speaker: 'you', english: "I'm looking for a gift. Something typically British.", meaning: '선물을 찾고 있어요. 영국스러운 것으로요.' },
            { speaker: 'other', speakerName: 'Staff', english: 'How about some fine tea or biscuits? They make lovely gifts.', meaning: '좋은 차나 비스킷은 어떠세요? 선물로 좋아요.' },
            { speaker: 'you', english: "That's a great idea. How much is this tea set?", meaning: '좋은 생각이네요. 이 티 세트 얼마예요?' },
            { speaker: 'other', speakerName: 'Staff', english: "That's £25. Would you like it gift-wrapped?", meaning: '25파운드예요. 선물 포장해 드릴까요?' },
            { speaker: 'you', english: 'Yes, please!', meaning: '네, 부탁해요!' },
          ],
          culturalNote: '영국 밖에서 온 관광객은 일정 금액 이상 구매 시 VAT(부가세) 환급을 받을 수 있어요.',
        },
      ],
    },
  ],
};

// All English chapters
export const ENGLISH_JOURNEY_CHAPTERS: EnglishChapter[] = [
  USA_CHAPTER_1_NYC,
  USA_CHAPTER_2_EXPLORE,
  UK_CHAPTER_1_LONDON,
  UK_CHAPTER_2_EXPLORE,
];

// USA only chapters
export const USA_JOURNEY_CHAPTERS: EnglishChapter[] = [
  USA_CHAPTER_1_NYC,
  USA_CHAPTER_2_EXPLORE,
];

// UK only chapters
export const UK_JOURNEY_CHAPTERS: EnglishChapter[] = [
  UK_CHAPTER_1_LONDON,
  UK_CHAPTER_2_EXPLORE,
];

// Helper functions
export const getEnglishLocationById = (locationId: string): EnglishLocation | undefined => {
  for (const chapter of ENGLISH_JOURNEY_CHAPTERS) {
    const location = chapter.locations.find(l => l.id === locationId);
    if (location) return location;
  }
  return undefined;
};

export const getEnglishScenarioById = (locationId: string, scenarioId: string): EnglishScenario | undefined => {
  const location = getEnglishLocationById(locationId);
  if (!location) return undefined;
  return location.scenarios.find(s => s.id === scenarioId);
};

export const getEnglishChapterByLocationId = (locationId: string): EnglishChapter | undefined => {
  return ENGLISH_JOURNEY_CHAPTERS.find(chapter =>
    chapter.locations.some(location => location.id === locationId)
  );
};
