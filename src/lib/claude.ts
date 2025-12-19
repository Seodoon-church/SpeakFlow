// Claude API 서비스
// 프론트엔드에서 직접 Anthropic API를 호출할 수 없으므로
// Supabase Edge Function을 통해 호출합니다.

import { supabase } from './supabase';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RoleplayContext {
  scenario: {
    title: string;
    situation: string;
    userRole: string;
    aiRole: string;
  };
  targetExpressions?: string[];
}

const SYSTEM_PROMPT_TEMPLATE = `You are an English conversation practice partner for Korean learners. Your role is to help users practice business English through realistic roleplay scenarios.

SCENARIO:
- Title: {{title}}
- Situation: {{situation}}
- Your Role: {{aiRole}}
- User's Role: {{userRole}}

INSTRUCTIONS:
1. Stay in character as {{aiRole}} throughout the conversation
2. Use natural, professional business English
3. Keep responses concise (2-3 sentences typically)
4. If the user makes grammar mistakes, continue the conversation naturally but model correct usage
5. Occasionally use these target expressions if appropriate: {{expressions}}
6. Be encouraging and supportive while maintaining realism
7. Ask follow-up questions to keep the conversation flowing
8. Respond in English only

Remember: This is practice for the user, so be patient and helpful while staying in character.`;

function buildSystemPrompt(context: RoleplayContext): string {
  return SYSTEM_PROMPT_TEMPLATE
    .replace(/\{\{title\}\}/g, context.scenario.title)
    .replace(/\{\{situation\}\}/g, context.scenario.situation)
    .replace(/\{\{aiRole\}\}/g, context.scenario.aiRole)
    .replace(/\{\{userRole\}\}/g, context.scenario.userRole)
    .replace(/\{\{expressions\}\}/g, context.targetExpressions?.join(', ') || 'none specified');
}

// Supabase Edge Function을 통한 Claude API 호출
export async function sendMessageToClaude(
  messages: ChatMessage[],
  context: RoleplayContext
): Promise<string> {
  // 개발 환경에서는 바로 폴백 응답 사용 (Edge Function 미설정)
  if (import.meta.env.DEV) {
    console.log('DEV mode: Using fallback responses');
    // 시나리오에 맞는 트랙 ID 결정
    const trackId = getTrackIdFromScenario(context.scenario.title);
    return getFallbackResponse(messages, trackId);
  }

  const systemPrompt = buildSystemPrompt(context);

  try {
    // Supabase Edge Function 호출
    const { data, error } = await supabase.functions.invoke('chat-claude', {
      body: {
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        systemPrompt,
      },
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error('Failed to get AI response');
    }

    return data.content;
  } catch (err) {
    console.error('Claude API error:', err);
    // 폴백: 로컬 API 엔드포인트 시도 (개발용)
    return sendMessageToLocalAPI(messages, systemPrompt);
  }
}

// 시나리오 제목에서 트랙 ID 추출
function getTrackIdFromScenario(title: string): string {
  if (title.includes('카페') || title.includes('주문') || title.includes('메뉴')) return 'bakery-cafe';
  if (title.includes('비즈니스') || title.includes('미팅') || title.includes('협상')) return 'business';
  if (title.includes('뷰티') || title.includes('화장품')) return 'beauty-tech';
  if (title.includes('학회') || title.includes('논문') || title.includes('박사')) return 'academic';
  if (title.includes('브랜드') || title.includes('마케팅')) return 'cosmetics';
  return 'daily-life';
}

// Anthropic API 호출 (DEV: Vite 프록시, PROD: Vercel Serverless Function)
async function callAnthropicAPI(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  try {
    // 프로덕션에서는 Vercel Serverless Function 사용
    if (!import.meta.env.DEV) {
      console.log('Production mode: Using Vercel API');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Vercel API error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.content;
    }

    // 개발 모드에서는 Vite 프록시 사용
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'your-claude-api-key') {
      console.log('No Anthropic API key configured, using fallback');
      return getFallbackResponse(messages);
    }

    console.log('DEV mode: Direct Anthropic API call');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (err) {
    console.error('Anthropic API call failed:', err);
    return getFallbackResponse(messages);
  }
}

// 로컬 개발용 API (Vite 프록시 사용) - 레거시
async function sendMessageToLocalAPI(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  return callAnthropicAPI(messages, systemPrompt);
}

// 폴백 응답 (API 연결 실패 시) - 번역 포함
interface FallbackResponse {
  en: string;
  ko: string;
}

const FALLBACK_RESPONSES_BY_CONTEXT: Record<string, FallbackResponse[]> = {
  'bakery-cafe': [
    { en: "Perfect! Coming right up.", ko: "좋아요! 바로 준비해 드릴게요." },
    { en: "Certainly! Would you like anything else with that?", ko: "물론이죠! 다른 것도 추가하시겠어요?" },
    { en: "Great choice! That's one of our most popular items.", ko: "좋은 선택이에요! 저희 인기 메뉴 중 하나예요." },
    { en: "No problem! I can make that for you.", ko: "문제없어요! 만들어 드릴게요." },
    { en: "Here you go! Enjoy!", ko: "여기 있어요! 맛있게 드세요!" },
    { en: "Is there anything else I can help you with?", ko: "다른 도움이 필요하신 게 있으세요?" },
    { en: "Sure! That will be ready in just a moment.", ko: "네! 잠시만 기다려 주시면 바로 준비해 드릴게요." },
    { en: "Would you like it hot or iced?", ko: "뜨거운 걸로 드릴까요, 아이스로 드릴까요?" },
  ],
  'business': [
    { en: "That's a great point. Could you tell me more about your thoughts on that?", ko: "좋은 지적이에요. 그 점에 대해 더 말씀해 주시겠어요?" },
    { en: "I see what you mean. Let me share my perspective on this matter.", ko: "무슨 말씀인지 알겠어요. 이 문제에 대한 제 관점을 말씀드릴게요." },
    { en: "Thank you for bringing that up. How do you think we should proceed?", ko: "말씀해 주셔서 감사해요. 어떻게 진행하면 좋을까요?" },
    { en: "That's an interesting approach. What timeline are you considering for this?", ko: "흥미로운 접근이네요. 이것에 대해 어떤 일정을 생각하고 계세요?" },
    { en: "I appreciate your input. Could you elaborate on the specific details?", ko: "의견 감사해요. 구체적인 내용을 좀 더 말씀해 주시겠어요?" },
    { en: "Good question. Let me address that point directly.", ko: "좋은 질문이에요. 그 부분에 대해 직접 답변드릴게요." },
  ],
  'daily-life': [
    { en: "Sure, no problem! Is there anything else?", ko: "네, 물론이죠! 다른 건 없으세요?" },
    { en: "That sounds great! When would you like to do that?", ko: "좋아요! 언제 하고 싶으세요?" },
    { en: "I understand. Let me help you with that.", ko: "알겠어요. 도와드릴게요." },
    { en: "Really? That's interesting! Tell me more.", ko: "정말요? 흥미롭네요! 더 말씀해 주세요." },
    { en: "Of course! Just follow me.", ko: "물론이죠! 따라오세요." },
    { en: "No worries! Take your time.", ko: "괜찮아요! 천천히 하세요." },
  ],
  'beauty-tech': [
    { en: "Great question! This device uses advanced LED technology for skin rejuvenation.", ko: "좋은 질문이에요! 이 기기는 피부 재생을 위한 첨단 LED 기술을 사용해요." },
    { en: "Absolutely! Let me show you how it works.", ko: "물론이죠! 어떻게 작동하는지 보여드릴게요." },
    { en: "Yes, all our products are clinically tested and FDA-approved.", ko: "네, 저희 모든 제품은 임상 테스트를 거쳤고 FDA 승인을 받았어요." },
    { en: "I'd be happy to arrange a demonstration for your team.", ko: "팀을 위한 데모를 준비해 드릴게요." },
  ],
  'academic': [
    { en: "That's an excellent question. Let me explain the methodology in more detail.", ko: "아주 좋은 질문이에요. 방법론에 대해 더 자세히 설명해 드릴게요." },
    { en: "I appreciate your feedback. Could you suggest any improvements?", ko: "피드백 감사합니다. 개선할 점이 있을까요?" },
    { en: "Based on my research findings, I would say...", ko: "제 연구 결과에 따르면..." },
    { en: "That's a valid concern. Let me address that.", ko: "타당한 우려예요. 그 부분에 대해 답변드릴게요." },
  ],
  'cosmetics': [
    { en: "I love that idea! It aligns perfectly with our brand positioning.", ko: "그 아이디어 좋아요! 저희 브랜드 포지셔닝과 완벽하게 맞아요." },
    { en: "Great point! Our target demographic would really respond to that.", ko: "좋은 지적이에요! 저희 타겟 고객층이 정말 반응할 거예요." },
    { en: "Yes, sustainability is a key pillar of our brand identity.", ko: "네, 지속가능성은 저희 브랜드 정체성의 핵심이에요." },
    { en: "I'd love to explore that collaboration further.", ko: "그 협업에 대해 더 알아보고 싶어요." },
  ],
};

// 현재 사용 중인 폴백 응답 인덱스 추적 (순환용)
let fallbackIndex = 0;

function getFallbackResponse(_messages: ChatMessage[], trackId?: string): string {
  const track = trackId || 'daily-life';
  const responses = FALLBACK_RESPONSES_BY_CONTEXT[track] || FALLBACK_RESPONSES_BY_CONTEXT['daily-life'];

  fallbackIndex = (fallbackIndex + 1) % responses.length;
  return responses[fallbackIndex].en;
}

// 폴백 응답의 번역 가져오기
export function getFallbackTranslation(englishText: string, _trackId?: string): string {
  const allResponses = Object.values(FALLBACK_RESPONSES_BY_CONTEXT).flat();
  const found = allResponses.find(r => r.en === englishText);
  return found?.ko || '';
}

// 인사말과 번역 (시나리오별)
interface GreetingWithTranslation {
  en: string;
  ko: string;
}

const SCENARIO_GREETINGS: Record<string, GreetingWithTranslation> = {
  // Business
  '비즈니스 미팅 시작': {
    en: "Good morning! Thank you for organizing this meeting. I'm looking forward to discussing the new marketing campaign. Where would you like to start?",
    ko: "좋은 아침이에요! 이 미팅을 준비해 주셔서 감사합니다. 새 마케팅 캠페인에 대해 논의하게 되어 기대됩니다. 어디서부터 시작할까요?"
  },
  '프로젝트 진행 상황 보고': {
    en: "Hi there! I've been reviewing the project timeline. Shall we go over the current progress and any blockers we're facing?",
    ko: "안녕하세요! 프로젝트 일정을 검토하고 있었어요. 현재 진행 상황과 문제점들을 살펴볼까요?"
  },
  '클라이언트 협상': {
    en: "Hello! It's great to meet with you today. I've reviewed your proposal and have some thoughts to share. How would you like to begin our discussion?",
    ko: "안녕하세요! 오늘 만나게 되어 반갑습니다. 제안서를 검토했고 의견이 있습니다. 어떻게 논의를 시작할까요?"
  },
  '이메일 후속 전화': {
    en: "Hello, this is Kim from ABC Company. I sent you an email last week about our proposal. Did you have a chance to review it?",
    ko: "안녕하세요, ABC 회사의 김입니다. 지난주에 저희 제안서에 대한 이메일을 보내드렸는데요. 검토해 보셨나요?"
  },
  '팀 프레젠테이션': {
    en: "Good afternoon, everyone. Thank you all for coming. I'm excited to present our new strategy today. Any questions before we begin?",
    ko: "안녕하세요, 여러분. 와주셔서 감사합니다. 오늘 새로운 전략을 발표하게 되어 기쁩니다. 시작하기 전에 질문 있으신가요?"
  },
  '계약 조건 협상': {
    en: "Thank you for meeting with us today. I've looked at your initial terms. Shall we discuss the pricing and delivery schedule?",
    ko: "오늘 만나주셔서 감사합니다. 제안해 주신 초기 조건을 검토했어요. 가격과 납기 일정에 대해 논의할까요?"
  },
  '화상 회의 진행': {
    en: "Hi everyone! Can you hear me okay? I think we're all connected now. Let's wait a moment for the others to join.",
    ko: "안녕하세요! 제 목소리 잘 들리시나요? 다 연결된 것 같네요. 다른 분들 들어오실 때까지 잠깐 기다릴게요."
  },
  '팀원에게 피드백 주기': {
    en: "Thanks for sending over the report. I've had a chance to review it. Do you have a few minutes to discuss it?",
    ko: "보고서 보내줘서 고마워요. 검토해 봤는데, 잠깐 얘기할 시간 있어요?"
  },
  '고객 불만 대응': {
    en: "Hello, I understand you're having an issue with your recent order. I'm really sorry to hear that. Could you tell me what happened?",
    ko: "안녕하세요, 최근 주문에 문제가 있으시다고 들었습니다. 정말 죄송합니다. 무슨 일이 있었는지 말씀해 주시겠어요?"
  },
  '비즈니스 네트워킹': {
    en: "Hi there! Great event, isn't it? I'm Sarah from XYZ Tech. I don't think we've met before. What brings you here today?",
    ko: "안녕하세요! 좋은 행사죠? 저는 XYZ Tech의 사라예요. 처음 뵙는 것 같은데, 오늘 어떻게 오셨어요?"
  },
  '영어 면접': {
    en: "Welcome! Please have a seat. Thank you for coming in today. Before we start, can you tell me a little about yourself?",
    ko: "어서 오세요! 앉으세요. 오늘 와주셔서 감사합니다. 시작하기 전에 자기소개 좀 해주시겠어요?"
  },
  // Bakery Cafe
  '기본 주문 받기': {
    en: "Hi, welcome to our café! What can I get for you today?",
    ko: "안녕하세요, 저희 카페에 오신 걸 환영합니다! 오늘 뭘 드릴까요?"
  },
  '메뉴 추천하기': {
    en: "Good morning! Are you looking for something to eat or drink? I'd be happy to recommend some of our popular items.",
    ko: "좋은 아침이에요! 드실 것을 찾으세요? 인기 메뉴를 추천해 드릴게요."
  },
  '커스터마이징 요청': {
    en: "Hello! Your drink is ready to be customized. How would you like it? We can adjust the sweetness, ice, or milk type.",
    ko: "안녕하세요! 음료를 맞춤 제작해 드릴게요. 어떻게 해 드릴까요? 단맛, 얼음, 우유 종류를 조절할 수 있어요."
  },
  '알레르기 문의': {
    en: "Hi there! I noticed you're checking our baked goods. Do you have any dietary restrictions or allergies I should know about?",
    ko: "안녕하세요! 빵을 보고 계시네요. 혹시 식이 제한이나 알레르기가 있으신가요?"
  },
  '품절 안내': {
    en: "Hello! I'm sorry, but I need to let you know that some items are sold out today. What were you hoping to get?",
    ko: "안녕하세요! 죄송하지만 오늘 품절된 메뉴가 있어요. 어떤 것을 원하셨나요?"
  },
  '결제 진행': {
    en: "Alright, your order is ready! That'll be $12.50. How would you like to pay?",
    ko: "네, 주문이 준비됐어요! 12달러 50센트입니다. 어떻게 결제하시겠어요?"
  },
  // Daily life
  '카페에서 주문하기': {
    en: "Hi there! Welcome to Coffee House. What would you like to order today?",
    ko: "안녕하세요! 커피하우스에 오신 걸 환영해요. 오늘 뭘 주문하시겠어요?"
  },
  '레스토랑에서 식사하기': {
    en: "Good evening! Welcome to Milano Restaurant. Do you have a reservation?",
    ko: "안녕하세요! 밀라노 레스토랑에 오신 걸 환영합니다. 예약하셨나요?"
  },
  '옷 가게에서 쇼핑하기': {
    en: "Hi! Welcome to our store. Let me know if you need any help finding something.",
    ko: "안녕하세요! 저희 매장에 오신 걸 환영해요. 찾으시는 게 있으면 말씀해 주세요."
  },
  '길 물어보기': {
    en: "Hi! You look a bit lost. Are you looking for something around here?",
    ko: "안녕하세요! 길을 잃으신 것 같네요. 이 근처에서 뭔가 찾고 계세요?"
  },
  // Beauty Tech
  '신제품 프레젠테이션': {
    en: "Hello! Welcome to our beauty tech showcase. I see you're interested in our LED therapy device. Would you like me to show you how it works?",
    ko: "안녕하세요! 뷰티 테크 전시회에 오신 걸 환영합니다. LED 테라피 기기에 관심이 있으신 것 같네요. 어떻게 작동하는지 보여드릴까요?"
  },
  '뷰티 전시회 부스 운영': {
    en: "Hello! Welcome to our booth. Is there anything specific you'd like to know about our products?",
    ko: "안녕하세요! 저희 부스에 오신 걸 환영해요. 저희 제품에 대해 궁금하신 점이 있으세요?"
  },
  '가격 및 계약 협상': {
    en: "Thank you for your interest in our products. I understand you'd like to discuss pricing and terms. What volumes are you considering?",
    ko: "저희 제품에 관심 가져주셔서 감사합니다. 가격과 조건에 대해 논의하고 싶으시다고 들었어요. 어느 정도 물량을 생각하고 계세요?"
  },
  '미팅 후 팔로업 콜': {
    en: "Hi! This is Kim from BeautyTech Corp. We met at Cosmoprof last week. I hope you had a safe trip back home. Do you have a moment to talk?",
    ko: "안녕하세요! 뷰티테크 코퍼레이션의 김입니다. 지난주 코스모프로프에서 만났었죠. 귀국은 잘 하셨는지요. 잠깐 통화 가능하세요?"
  },
  '고객 클레임 대응': {
    en: "Hello, I received your message about the issue with your shipment. I'm very sorry to hear about this. Can you describe what happened?",
    ko: "안녕하세요, 배송 문제에 대한 메시지 받았습니다. 정말 죄송합니다. 무슨 일인지 설명해 주시겠어요?"
  },
  // Academic
  '지도교수 면담': {
    en: "Hello! Please come in and have a seat. I understand you wanted to discuss your research direction?",
    ko: "안녕하세요! 들어와서 앉으세요. 연구 방향에 대해 논의하고 싶다고 하셨죠?"
  },
  '학회 Q&A 대응하기': {
    en: "Thank you for that excellent presentation. I have a question about your methodology. Could you explain how you controlled for external variables?",
    ko: "훌륭한 발표 감사합니다. 방법론에 대해 질문이 있는데요. 외부 변수를 어떻게 통제하셨는지 설명해 주시겠어요?"
  },
  'TOEFL 독립형 스피킹': {
    en: "Welcome to the TOEFL Speaking practice. Here's your question: Some people prefer to work in a team, while others prefer to work alone. Which do you prefer and why?",
    ko: "토플 스피킹 연습에 오신 걸 환영합니다. 질문입니다: 어떤 사람들은 팀으로 일하는 것을 선호하고, 다른 사람들은 혼자 일하는 것을 선호합니다. 당신은 어떤 것을 선호하며 그 이유는 무엇인가요?"
  },
  'TOEFL 통합형 스피킹': {
    en: "Listen to the announcement and the conversation. Then summarize what the announcement says and explain the student's opinion about it.",
    ko: "공지사항과 대화를 듣고 공지사항의 내용을 요약하고 그에 대한 학생의 의견을 설명하세요."
  },
  'IELTS 스피킹 Part 2': {
    en: "Here's your cue card. Describe a memorable trip you have taken. You have 1 minute to prepare and then you should speak for 1-2 minutes.",
    ko: "큐 카드입니다. 기억에 남는 여행에 대해 설명하세요. 1분간 준비하고 1-2분간 말해야 합니다."
  },
  '박사 과정 입학 인터뷰': {
    en: "Thank you for applying to our PhD program. I've read your research proposal with great interest. Could you start by telling me what drew you to this research area?",
    ko: "저희 박사 과정에 지원해 주셔서 감사합니다. 연구 제안서를 흥미롭게 읽었습니다. 먼저 이 연구 분야에 관심을 갖게 된 계기를 말씀해 주시겠어요?"
  },
  '연구 동기 설명하기': {
    en: "I see from your CV that you have a strong background. So tell me, why do you want to pursue a PhD?",
    ko: "이력서를 보니 좋은 배경을 갖고 계시네요. 박사 과정을 하고 싶은 이유가 뭔가요?"
  },
  '석사 논문 설명하기': {
    en: "I'd like to hear about your master's thesis. What was the main research question you were trying to answer?",
    ko: "석사 논문에 대해 듣고 싶습니다. 답하려고 했던 주요 연구 질문이 무엇이었나요?"
  },
  '학회 발표하기': {
    en: "Good afternoon, everyone. Welcome to this session. Our next presenter will be discussing their research. Please go ahead.",
    ko: "안녕하세요, 여러분. 이 세션에 오신 걸 환영합니다. 다음 발표자가 연구에 대해 발표하겠습니다. 시작하세요."
  },
  '학회 네트워킹': {
    en: "That was a really interesting presentation! I'm Professor Chen from Stanford. I work on similar topics. What's your current focus?",
    ko: "정말 흥미로운 발표였어요! 저는 스탠포드의 첸 교수입니다. 비슷한 주제를 연구해요. 현재 어떤 것에 집중하고 계세요?"
  },
  '랩미팅 참여하기': {
    en: "Alright everyone, let's get started with our weekly lab meeting. Who wants to share their progress this week?",
    ko: "자, 여러분, 주간 랩미팅을 시작하겠습니다. 이번 주 진행 상황을 공유할 사람?"
  },
  '논문 세미나 토론': {
    en: "Today we're discussing the paper by Smith et al. Who read it? What did you think about their main findings?",
    ko: "오늘은 Smith 등의 논문에 대해 토론합니다. 누가 읽었나요? 주요 발견에 대해 어떻게 생각하세요?"
  },
  // Cosmetics
  '브랜드 전략 발표': {
    en: "Good afternoon, everyone. I've been reviewing the brand positioning document. Let's discuss the target demographic and key differentiators.",
    ko: "안녕하세요, 여러분. 브랜드 포지셔닝 문서를 검토했어요. 타겟 고객층과 핵심 차별점에 대해 논의해 봅시다."
  },
  '인플루언서 협업 제안': {
    en: "Hi! Thank you so much for your interest in our brand. Your content style really aligns with our brand values. How do you usually collaborate with beauty brands?",
    ko: "안녕하세요! 저희 브랜드에 관심 가져주셔서 정말 감사해요. 콘텐츠 스타일이 저희 브랜드 가치와 정말 잘 맞아요. 보통 뷰티 브랜드와 어떻게 협업하세요?"
  },
  '신제품 기획 미팅': {
    en: "Thanks for joining this product planning meeting. We're here to discuss the concept for our new serum line. What ideas do you have?",
    ko: "제품 기획 미팅에 참석해 주셔서 감사합니다. 새로운 세럼 라인 컨셉에 대해 논의하려고 해요. 어떤 아이디어가 있으세요?"
  },
  '마케팅 캠페인 제안': {
    en: "Hello! I'm excited to discuss the campaign brief with you today. Let me start by sharing our brand vision and target audience.",
    ko: "안녕하세요! 오늘 캠페인 브리프에 대해 논의하게 되어 기쁩니다. 먼저 저희 브랜드 비전과 타겟 고객층을 공유할게요."
  },
  '신제품 런칭 이벤트': {
    en: "Welcome to our exclusive launch event! I'm so glad you could join us today. Let me show you our newest collection.",
    ko: "저희 독점 런칭 이벤트에 오신 걸 환영합니다! 오늘 함께해 주셔서 정말 기뻐요. 새로운 컬렉션을 보여드릴게요."
  },
  '뷰티 전시회 바이어 미팅': {
    en: "Hello! Welcome to our booth at Cosmoprof. I noticed you're interested in K-beauty brands. What products are you looking for?",
    ko: "안녕하세요! 코스모프로프 저희 부스에 오신 걸 환영해요. K-뷰티 브랜드에 관심이 있으신 것 같네요. 어떤 제품을 찾고 계세요?"
  },
  '시장 분석 보고': {
    en: "Let's review the market analysis for this quarter. I've identified some interesting trends in consumer behavior.",
    ko: "이번 분기 시장 분석을 검토해 봅시다. 소비자 행동에서 몇 가지 흥미로운 트렌드를 발견했어요."
  },
  '패키지 디자인 리뷰': {
    en: "Thanks for sending the packaging mock-ups. I've reviewed them and have some feedback. Shall we go through them together?",
    ko: "패키지 목업 보내주셔서 감사해요. 검토했고 피드백이 있어요. 함께 살펴볼까요?"
  },
  '매거진 인터뷰': {
    en: "Thank you for taking the time to speak with us. Our readers are really curious about your brand story. How did it all begin?",
    ko: "시간 내주셔서 감사합니다. 저희 독자들이 브랜드 스토리에 정말 궁금해해요. 어떻게 시작하게 됐나요?"
  },
  '리테일 바이어 미팅': {
    en: "Thank you for coming in today. I've reviewed your product portfolio and I'm interested in discussing potential shelf placement.",
    ko: "오늘 와주셔서 감사합니다. 제품 포트폴리오를 검토했고 매대 배치에 대해 논의하고 싶어요."
  },
  // Bakery Cafe (추가)
  '불만 처리하기': {
    en: "I'm so sorry to hear that there was a problem with your order. What seems to be the issue?",
    ko: "주문에 문제가 있으셨다니 정말 죄송합니다. 무슨 문제인지 말씀해 주시겠어요?"
  },
  '가벼운 대화 나누기': {
    en: "Hey! Nice to see you again! The usual today?",
    ko: "안녕하세요! 또 뵈니 반가워요! 오늘도 늘 드시던 걸로요?"
  },
};

// 대화 시작 인사말 생성
export function getInitialGreeting(context: RoleplayContext): string {
  const greeting = SCENARIO_GREETINGS[context.scenario.title];
  return greeting?.en || `Hello! I'm ready to start our ${context.scenario.title.toLowerCase()}. How would you like to begin?`;
}

// 인사말 번역 가져오기
export function getGreetingTranslation(scenarioTitle: string): string {
  const greeting = SCENARIO_GREETINGS[scenarioTitle];
  return greeting?.ko || '안녕하세요! 대화를 시작할 준비가 됐어요. 어떻게 시작할까요?';
}

// 영어 문장 번역 (간단한 폴백용)
export function getSimpleTranslation(text: string): string {
  const translations: Record<string, string> = {
    // Common responses
    "That's a great point. Could you tell me more about your thoughts on that?": "좋은 지적이에요. 그 점에 대해 더 말씀해 주시겠어요?",
    "I see what you mean. Let me share my perspective on this matter.": "무슨 말씀인지 알겠어요. 이 문제에 대한 제 관점을 말씀드릴게요.",
    "Thank you for bringing that up. How do you think we should proceed?": "말씀해 주셔서 감사해요. 어떻게 진행하면 좋을까요?",
    "That's an interesting approach. What timeline are you considering for this?": "흥미로운 접근이네요. 이것에 대해 어떤 일정을 생각하고 계세요?",
    "Perfect! Coming right up.": "좋아요! 바로 준비해 드릴게요.",
    "Certainly! Would you like anything else with that?": "물론이죠! 다른 것도 추가하시겠어요?",
    "Great choice! That's one of our most popular items.": "좋은 선택이에요! 저희 인기 메뉴 중 하나예요.",
    "No problem! I can make that for you.": "문제없어요! 만들어 드릴게요.",
    "Here you go! Enjoy your meal.": "여기 있어요! 맛있게 드세요.",
    "Is there anything else I can help you with?": "다른 도움이 필요하신 게 있으세요?",
  };
  return translations[text] || '';
}

// 프리토킹용 시스템 프롬프트
const FREETALK_SYSTEM_PROMPT = `You are a friendly and supportive English conversation partner for Korean learners. Your name is "Fluffy" and you're here to help users practice everyday English conversation.

INSTRUCTIONS:
1. Be warm, friendly, and encouraging in your responses
2. Use natural, conversational English (not too formal, not too casual)
3. Keep responses concise (2-4 sentences typically)
4. If the user makes grammar mistakes, gently correct them by modeling correct usage
5. Ask follow-up questions to keep the conversation flowing naturally
6. If the user seems stuck, offer suggestions or change topics
7. Respond in English primarily, but you can occasionally use Korean for encouragement
8. Adapt to the user's English level - simpler responses for beginners
9. Be patient and supportive - this is practice, not a test!
10. Topics can be anything: daily life, hobbies, food, travel, work, etc.

Remember: Your goal is to make the user feel comfortable practicing English!`;

// 프리토킹 메시지 전송
export async function sendFreetalkMessage(
  messages: ChatMessage[]
): Promise<string> {
  // DEV 모드에서도 API 키가 있으면 직접 호출
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (apiKey && apiKey !== 'your-claude-api-key') {
    console.log('Using Anthropic API for freetalk');
    return callAnthropicAPI(messages, FREETALK_SYSTEM_PROMPT);
  }

  // API 키 없으면 Supabase Edge Function 시도
  try {
    const { data, error } = await supabase.functions.invoke('chat-claude', {
      body: {
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        systemPrompt: FREETALK_SYSTEM_PROMPT,
      },
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error('Failed to get AI response');
    }

    return data.content;
  } catch (err) {
    console.error('Claude API error:', err);
    return getFreetalkFallbackResponse(messages);
  }
}

// 프리토킹 폴백 응답
function getFreetalkFallbackResponse(_messages: ChatMessage[]): string {
  const responses = [
    "That's really interesting! Tell me more about that.",
    "Oh, I see! What made you think of that?",
    "Great point! How do you usually handle that?",
    "That sounds fun! Have you tried it before?",
    "Interesting! What's your favorite part about it?",
    "I understand. What would you like to do next?",
    "That makes sense! Is there anything else on your mind?",
    "Cool! How long have you been interested in that?",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// 프리토킹 첫 인사말
export function getFreetalkGreeting(): string {
  const greetings = [
    "Hi there! 👋 I'm Fluffy, your English conversation buddy! What would you like to talk about today? We can chat about anything - your day, hobbies, food, or whatever you'd like!",
    "Hello! 🎉 Nice to meet you! I'm Fluffy. I'm here to help you practice English. How's your day going so far?",
    "Hey! 😊 Welcome! I'm Fluffy, and I'm excited to chat with you in English. What's on your mind today?",
    "Hi! 👋 I'm Fluffy, your friendly English practice partner. Let's have a fun conversation! Tell me, what did you do today?",
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

// 피드백 생성 (대화 종료 후)
export async function generateFeedback(
  messages: ChatMessage[],
  context: RoleplayContext
): Promise<string> {
  // 개발 환경에서는 바로 폴백 피드백 사용
  if (import.meta.env.DEV) {
    console.log('DEV mode: Using fallback feedback');
    return '오늘 대화 연습 잘 하셨어요! 자연스럽게 대화를 이어나가셨습니다. 다음에는 "I was wondering if..." 같은 공손한 표현을 더 활용해 보세요.';
  }

  const feedbackPrompt = `Based on the following English conversation practice session, provide brief, encouraging feedback in Korean for the learner.

Scenario: ${context.scenario.title}
User's Role: ${context.scenario.userRole}

Focus on:
1. What they did well
2. One specific area for improvement
3. A useful expression they could use next time

Keep the feedback concise (3-4 sentences).

Conversation:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`;

  try {
    const { data, error } = await supabase.functions.invoke('chat-claude', {
      body: {
        messages: [{ role: 'user', content: feedbackPrompt }],
        systemPrompt: 'You are a helpful English teacher providing feedback to Korean learners. Respond in Korean.',
      },
    });

    if (error) throw error;
    return data.content;
  } catch {
    return '오늘 대화 연습 잘 하셨어요! 자연스럽게 대화를 이어나가셨습니다. 다음에는 "I was wondering if..." 같은 공손한 표현을 더 활용해 보세요.';
  }
}

// 추천 답변 생성
export async function generateSuggestedResponses(
  messages: ChatMessage[],
  context: RoleplayContext
): Promise<string[]> {
  // 개발 환경에서는 바로 폴백 응답 사용
  if (import.meta.env.DEV) {
    console.log('DEV mode: Using fallback suggested responses');
    return getFallbackSuggestedResponses(context);
  }

  const lastAiMessage = messages.filter(m => m.role === 'assistant').pop()?.content || '';

  const prompt = `You are helping a Korean learner practice English in a roleplay scenario.

Scenario: ${context.scenario.title}
Situation: ${context.scenario.situation}
User's Role: ${context.scenario.userRole}
AI's Role: ${context.scenario.aiRole}

The AI (${context.scenario.aiRole}) just said:
"${lastAiMessage}"

Generate exactly 3 natural English responses that the user (${context.scenario.userRole}) could say next.
The responses should be:
1. Simple and beginner-friendly
2. Natural and commonly used in this situation
3. Varying in approach (e.g., one positive, one question, one with more detail)

${context.targetExpressions?.length ? `Try to incorporate these target expressions when appropriate: ${context.targetExpressions.join(', ')}` : ''}

Return ONLY the 3 responses, one per line, without numbering or extra text.`;

  try {
    const { data, error } = await supabase.functions.invoke('chat-claude', {
      body: {
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'You generate natural English conversation responses for language learners. Return exactly 3 responses, one per line.',
      },
    });

    if (error) throw error;

    const responses = data.content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .slice(0, 3);

    return responses.length >= 3 ? responses : getFallbackSuggestedResponses(context);
  } catch {
    return getFallbackSuggestedResponses(context);
  }
}

// 폴백 추천 답변
function getFallbackSuggestedResponses(context: RoleplayContext): string[] {
  const fallbacksByCategory: Record<string, string[][]> = {
    'bakery-cafe': [
      ["I'd like a latte, please.", "What do you recommend?", "Can I see the menu?"],
      ["I'll have an iced Americano.", "Is this gluten-free?", "Could I get this to go?"],
      ["A cappuccino, please.", "What's your most popular item?", "Do you have any specials today?"],
    ],
    'business': [
      ["I agree with your point.", "Could you elaborate on that?", "Let me share my perspective."],
      ["That makes sense.", "What's the timeline for this?", "I'll follow up on that."],
      ["Good question.", "I'll need to review the details.", "Can we schedule a follow-up?"],
    ],
    'daily-life': [
      ["Sure, that sounds good!", "What do you think?", "I'm not sure about that."],
      ["That's a great idea!", "Can you tell me more?", "I'd love to try that."],
      ["Really? That's interesting!", "How about tomorrow?", "Let me think about it."],
    ],
    'beauty-tech': [
      ["This device uses LED therapy.", "It's FDA-approved.", "The results are clinically proven."],
      ["We offer a money-back guarantee.", "Would you like a demonstration?", "This is our best-seller."],
      ["It's suitable for all skin types.", "You'll see results in 4 weeks.", "May I explain the features?"],
    ],
    'academic': [
      ["My research focuses on...", "Could you clarify your question?", "That's an interesting perspective."],
      ["Based on my findings...", "I'd like to add to that point.", "What methodology did you use?"],
      ["The data suggests that...", "I respectfully disagree.", "Could you provide more context?"],
    ],
    'cosmetics': [
      ["This is our hero product.", "It contains natural ingredients.", "Would you like to try a sample?"],
      ["The target demographic is...", "Our USP is...", "This aligns with current trends."],
      ["Let me explain our brand story.", "The packaging is eco-friendly.", "We're launching next quarter."],
    ],
  };

  const trackFallbacks = fallbacksByCategory[context.scenario.title] ||
    fallbacksByCategory['daily-life'];

  return trackFallbacks[Math.floor(Math.random() * trackFallbacks.length)];
}

// ========== 상황 시뮬레이션 관련 함수 ==========

import type { GeneratedScenario, SimulationFeedback, RealTimeFeedback } from '@/types';

// 시나리오 생성용 시스템 프롬프트
const SIMULATION_GENERATOR_PROMPT = `You are a simulation scenario generator for language learning.
When given a user's situation description in Korean, generate a realistic roleplay scenario.

INSTRUCTIONS:
1. Analyze the user's input to understand the desired situation
2. Determine the target language based on context clues (default to English if unclear)
3. Generate a scenario with appropriate NPC, background, and goal
4. Create 3-5 helpful expressions the user might need
5. Write an opening line in the target language

RESPONSE FORMAT (JSON only, no markdown):
{
  "background": "배경 설명 (한국어)",
  "backgroundId": "cafe|restaurant|airport|hotel|hospital|shop|subway|office",
  "npcRole": "NPC 역할 (한국어)",
  "npcName": "NPC 이름 (해당 언어에 맞게)",
  "userGoal": "사용자 목표 (한국어)",
  "difficulty": "easy|medium|hard",
  "language": "en|ja|zh",
  "suggestedExpressions": ["표현1 (번역)", "표현2 (번역)", "표현3 (번역)"],
  "openingLine": "NPC의 첫 대사 (목표 언어로)",
  "openingLineTranslation": "첫 대사 한글 번역"
}`;

// 시뮬레이션 대화용 시스템 프롬프트 빌더
function buildSimulationSystemPrompt(scenario: GeneratedScenario): string {
  const languageNames: Record<string, string> = {
    'en': 'English',
    'ja': 'Japanese',
    'zh': 'Chinese',
  };
  const langName = languageNames[scenario.language] || 'English';

  return `You are roleplaying as "${scenario.npcName}" (${scenario.npcRole}) in a language learning simulation.

SCENARIO:
- Location: ${scenario.background}
- Your Role: ${scenario.npcRole}
- User's Goal: ${scenario.userGoal}
- Difficulty: ${scenario.difficulty}
- Language: ${langName}

INSTRUCTIONS:
1. Stay in character as ${scenario.npcRole}
2. Speak primarily in ${langName}
3. Keep responses natural and appropriate for the setting (1-3 sentences)
4. If the user makes language mistakes, gently guide them by rephrasing correctly
5. Help the user achieve their goal: "${scenario.userGoal}"
6. Be patient and encouraging

RESPONSE FORMAT:
Respond naturally as the NPC. After your response, add feedback on a new line starting with [FEEDBACK]:

Your in-character response here

[FEEDBACK]
grammar: (brief grammar note if needed, or "ok")
natural: (more natural way to say what the user said, or "good")
tip: (helpful tip for this situation, or "none")`;
}

// 피드백 생성용 시스템 프롬프트
const SIMULATION_FEEDBACK_PROMPT = `You are a language learning evaluator. Analyze the completed simulation conversation and provide comprehensive feedback in Korean.

RESPONSE FORMAT (JSON only, no markdown):
{
  "overallScore": 85,
  "grammarScore": 80,
  "naturalityScore": 85,
  "wellDonePoints": ["잘한 점 1", "잘한 점 2"],
  "improvementPoints": ["개선점 1", "개선점 2"],
  "additionalExpressions": ["추가 표현 1 (번역)", "추가 표현 2 (번역)"]
}`;

// 시나리오 자동 생성
export async function generateSimulationScenario(
  userInput: string,
  targetLanguage?: string
): Promise<GeneratedScenario> {
  const prompt = targetLanguage
    ? `${userInput}\n\n(Target language: ${targetLanguage})`
    : userInput;

  try {
    const response = await callAnthropicAPI(
      [{ role: 'user', content: prompt }],
      SIMULATION_GENERATOR_PROMPT
    );

    // JSON 파싱 시도
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as GeneratedScenario;
    }
    throw new Error('Invalid JSON response');
  } catch (error) {
    console.error('Failed to generate scenario:', error);
    return getDefaultScenario(userInput, targetLanguage);
  }
}

// 시뮬레이션 대화 메시지 전송
export async function sendSimulationMessage(
  messages: ChatMessage[],
  scenario: GeneratedScenario
): Promise<{ response: string; feedback: RealTimeFeedback }> {
  const systemPrompt = buildSimulationSystemPrompt(scenario);

  try {
    const response = await callAnthropicAPI(messages, systemPrompt);
    return parseSimulationResponse(response);
  } catch (error) {
    console.error('Simulation message failed:', error);
    return {
      response: getSimulationFallbackResponse(scenario),
      feedback: {}
    };
  }
}

// 시뮬레이션 완료 피드백 생성
export async function generateSimulationFeedback(
  messages: ChatMessage[],
  scenario: GeneratedScenario
): Promise<SimulationFeedback> {
  const conversationSummary = messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  const prompt = `Scenario: ${scenario.userGoal}
Language: ${scenario.language}
Difficulty: ${scenario.difficulty}

Conversation:
${conversationSummary}

Please evaluate this language learning simulation and provide feedback in Korean.`;

  try {
    const response = await callAnthropicAPI(
      [{ role: 'user', content: prompt }],
      SIMULATION_FEEDBACK_PROMPT
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as SimulationFeedback;
    }
    throw new Error('Invalid JSON response');
  } catch (error) {
    console.error('Failed to generate feedback:', error);
    return getDefaultFeedback();
  }
}

// 응답 파싱 함수
function parseSimulationResponse(response: string): {
  response: string;
  feedback: RealTimeFeedback;
} {
  const parts = response.split('[FEEDBACK]');
  const mainResponse = parts[0].trim();

  const feedback: RealTimeFeedback = {};
  if (parts[1]) {
    const feedbackText = parts[1];
    const grammarMatch = feedbackText.match(/grammar:\s*(.+)/i);
    const naturalMatch = feedbackText.match(/natural:\s*(.+)/i);
    const tipMatch = feedbackText.match(/tip:\s*(.+)/i);

    if (grammarMatch && grammarMatch[1].trim().toLowerCase() !== 'ok') {
      feedback.grammarCorrection = grammarMatch[1].trim();
    }
    if (naturalMatch && naturalMatch[1].trim().toLowerCase() !== 'good') {
      feedback.naturalExpression = naturalMatch[1].trim();
    }
    if (tipMatch && tipMatch[1].trim().toLowerCase() !== 'none') {
      feedback.tip = tipMatch[1].trim();
    }
  }

  return { response: mainResponse, feedback };
}

// 기본 시나리오 (폴백)
function getDefaultScenario(userInput: string, targetLanguage?: string): GeneratedScenario {
  const lang = targetLanguage || 'en';
  const openingLines: Record<string, { line: string; translation: string }> = {
    'en': { line: "Hello! How can I help you today?", translation: "안녕하세요! 오늘 어떻게 도와드릴까요?" },
    'ja': { line: "いらっしゃいませ。何かお手伝いしましょうか?", translation: "어서오세요. 무엇을 도와드릴까요?" },
    'zh': { line: "您好！请问有什么可以帮您的?", translation: "안녕하세요! 무엇을 도와드릴까요?" },
  };

  const opening = openingLines[lang] || openingLines['en'];

  return {
    background: "일반 대화 상황",
    backgroundId: "office",
    npcRole: "친절한 직원",
    npcName: lang === 'ja' ? "田中さん" : lang === 'zh' ? "小王" : "Alex",
    userGoal: userInput,
    difficulty: "medium",
    language: lang,
    suggestedExpressions: [
      "Excuse me... (실례합니다)",
      "Could you help me with...? (~를 도와주시겠어요?)",
      "Thank you for your help! (도움 감사합니다!)",
    ],
    openingLine: opening.line,
    openingLineTranslation: opening.translation,
  };
}

// 시뮬레이션 폴백 응답
function getSimulationFallbackResponse(scenario: GeneratedScenario): string {
  const fallbacks: Record<string, string[]> = {
    'en': [
      "I understand. Could you tell me more about what you need?",
      "Sure, I can help with that. What specifically would you like?",
      "No problem! Is there anything else?",
    ],
    'ja': [
      "かしこまりました。もう少し詳しく教えていただけますか?",
      "はい、お手伝いできます。具体的に何をお探しですか?",
      "問題ありません。他に何かありますか?",
    ],
    'zh': [
      "我明白了。您能告诉我更多细节吗?",
      "好的，我可以帮您。您具体需要什么?",
      "没问题！还有其他需要吗?",
    ],
  };

  const responses = fallbacks[scenario.language] || fallbacks['en'];
  return responses[Math.floor(Math.random() * responses.length)];
}

// 기본 피드백 (폴백)
function getDefaultFeedback(): SimulationFeedback {
  return {
    overallScore: 75,
    grammarScore: 70,
    naturalityScore: 80,
    wellDonePoints: [
      "대화를 끝까지 잘 이어나갔어요",
      "기본적인 의사소통을 성공적으로 했어요",
    ],
    improvementPoints: [
      "더 다양한 표현을 사용해 보세요",
      "상황에 맞는 인사말을 추가하면 좋겠어요",
    ],
    additionalExpressions: [
      "Thank you so much! (정말 감사합니다!)",
      "I appreciate your help. (도움에 감사드려요.)",
    ],
  };
}

// ========== 레벨 테스트 말하기 분석 ==========

const SPEAKING_ANALYSIS_PROMPT = `You are a language proficiency evaluator analyzing a learner's speaking performance.

TASK:
1. Compare the user's speech with the expected prompt
2. Check for correct pronunciation (based on transcription accuracy)
3. Evaluate grammar, vocabulary, and fluency
4. Consider keyword usage

RESPONSE FORMAT (JSON only, no markdown):
{
  "score": 75,
  "feedback": "피드백 내용 (한국어로)"
}

Score guidelines:
- 90-100: Excellent - natural, accurate, confident delivery
- 75-89: Good - minor errors, generally clear
- 55-74: Fair - noticeable errors but understandable
- 40-54: Needs work - significant gaps
- Below 40: Beginner - major difficulties`;

// 말하기 분석 함수 (레벨 테스트용)
export async function analyzeSpeaking(
  transcript: string,
  expectedPrompt: string,
  expectedKeywords: string[],
  targetLanguage: string
): Promise<{ score: number; feedback: string }> {
  const prompt = `Target Language: ${targetLanguage}
Expected Prompt: ${expectedPrompt}
Expected Keywords: ${expectedKeywords.join(', ')}
User's Speech (transcription): ${transcript}

Evaluate this speaking performance and provide a score (0-100) with brief feedback in Korean.`;

  try {
    const response = await callAnthropicAPI(
      [{ role: 'user', content: prompt }],
      SPEAKING_ANALYSIS_PROMPT
    );

    // JSON 파싱 시도
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.max(0, Math.min(100, parsed.score || 50)),
        feedback: parsed.feedback || '분석이 완료되었습니다.',
      };
    }
    throw new Error('Invalid JSON response');
  } catch (error) {
    console.error('Speaking analysis failed:', error);
    // 폴백: 간단한 규칙 기반 점수
    return calculateFallbackSpeakingScore(transcript, expectedKeywords);
  }
}

// 폴백 말하기 점수 계산
function calculateFallbackSpeakingScore(
  transcript: string,
  expectedKeywords: string[]
): { score: number; feedback: string } {
  if (!transcript.trim()) {
    return { score: 20, feedback: '음성이 인식되지 않았습니다. 조용한 환경에서 다시 시도해 보세요.' };
  }

  const words = transcript.toLowerCase().split(/\s+/);
  const wordCount = words.length;

  // 키워드 매칭 점수
  let keywordMatches = 0;
  for (const keyword of expectedKeywords) {
    if (transcript.toLowerCase().includes(keyword.toLowerCase())) {
      keywordMatches++;
    }
  }
  const keywordScore = expectedKeywords.length > 0
    ? (keywordMatches / expectedKeywords.length) * 40
    : 20;

  // 단어 수 기반 점수
  const lengthScore = Math.min(30, wordCount * 3);

  // 기본 점수 + 키워드 + 길이
  const totalScore = Math.round(30 + keywordScore + lengthScore);
  const finalScore = Math.max(20, Math.min(100, totalScore));

  // 피드백 생성
  let feedback = '';
  if (finalScore >= 80) {
    feedback = '아주 잘하셨어요! 발음과 표현이 자연스럽습니다.';
  } else if (finalScore >= 60) {
    feedback = '잘하셨어요! 조금 더 다양한 표현을 사용해 보세요.';
  } else if (finalScore >= 40) {
    feedback = '좋은 시도예요! 핵심 표현을 더 연습해 보세요.';
  } else {
    feedback = '기초 표현부터 차근차근 연습해 보세요.';
  }

  return { score: finalScore, feedback };
}

// ========== 발음 평가 기능 ==========

export interface PronunciationResult {
  overallScore: number;           // 전체 점수 (0-100)
  accuracyScore: number;          // 정확도 점수
  fluencyScore: number;           // 유창성 점수
  stressScore: number;            // 강세/억양 점수
  matchedWords: string[];         // 정확하게 발음한 단어들
  mispronounced: {                // 잘못 발음한 단어들
    expected: string;
    heard: string;
    tip: string;
  }[];
  feedback: string;               // 전체 피드백 (한국어)
  practiceRecommendations: string[]; // 연습 추천사항
}

const PRONUNCIATION_ANALYSIS_PROMPT = `You are a pronunciation coach analyzing speech from a language learner.

TASK:
1. Compare the expected text with what was actually spoken
2. Identify correctly pronounced words vs mispronounced words
3. Analyze fluency (natural flow, pauses, speed)
4. Evaluate stress and intonation patterns
5. Provide actionable feedback in Korean

RESPONSE FORMAT (JSON only, no markdown):
{
  "overallScore": 75,
  "accuracyScore": 70,
  "fluencyScore": 80,
  "stressScore": 75,
  "matchedWords": ["word1", "word2"],
  "mispronounced": [
    {
      "expected": "expected word",
      "heard": "what was heard",
      "tip": "발음 교정 팁 (한국어로)"
    }
  ],
  "feedback": "전체 피드백 (한국어로)",
  "practiceRecommendations": ["연습 추천 1", "연습 추천 2"]
}

Score guidelines:
- 90-100: Native-like pronunciation
- 75-89: Clear and easily understood
- 60-74: Understandable with some effort
- 45-59: Noticeable pronunciation issues
- Below 45: Significant pronunciation challenges`;

// 발음 평가 함수
export async function analyzePronunciation(
  transcript: string,
  expectedText: string,
  targetLanguage: string = 'en'
): Promise<PronunciationResult> {
  const prompt = `Target Language: ${targetLanguage}
Expected Text: "${expectedText}"
Actual Speech (STT result): "${transcript}"

Analyze the pronunciation and provide detailed feedback.`;

  try {
    const response = await callAnthropicAPI(
      [{ role: 'user', content: prompt }],
      PRONUNCIATION_ANALYSIS_PROMPT
    );

    // JSON 파싱
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        overallScore: Math.max(0, Math.min(100, parsed.overallScore || 50)),
        accuracyScore: Math.max(0, Math.min(100, parsed.accuracyScore || 50)),
        fluencyScore: Math.max(0, Math.min(100, parsed.fluencyScore || 50)),
        stressScore: Math.max(0, Math.min(100, parsed.stressScore || 50)),
        matchedWords: parsed.matchedWords || [],
        mispronounced: parsed.mispronounced || [],
        feedback: parsed.feedback || '발음 분석이 완료되었습니다.',
        practiceRecommendations: parsed.practiceRecommendations || [],
      };
    }
    throw new Error('Invalid JSON response');
  } catch (error) {
    console.error('Pronunciation analysis failed:', error);
    return calculateFallbackPronunciationScore(transcript, expectedText);
  }
}

// 폴백 발음 점수 계산
function calculateFallbackPronunciationScore(
  transcript: string,
  expectedText: string
): PronunciationResult {
  if (!transcript.trim()) {
    return {
      overallScore: 0,
      accuracyScore: 0,
      fluencyScore: 0,
      stressScore: 0,
      matchedWords: [],
      mispronounced: [],
      feedback: '음성이 인식되지 않았습니다. 조용한 환경에서 다시 시도해 보세요.',
      practiceRecommendations: ['마이크 설정을 확인해 보세요', '조용한 환경에서 다시 시도해 보세요'],
    };
  }

  const expectedWords = expectedText.toLowerCase().replace(/[.,!?;:'"]/g, '').split(/\s+/);
  const spokenWords = transcript.toLowerCase().replace(/[.,!?;:'"]/g, '').split(/\s+/);

  // 일치하는 단어 찾기
  const matchedWords: string[] = [];
  const mispronounced: { expected: string; heard: string; tip: string }[] = [];

  expectedWords.forEach((expected, index) => {
    const spoken = spokenWords[index] || '';
    if (expected === spoken) {
      matchedWords.push(expected);
    } else if (spoken) {
      // 유사성 체크 (레벤슈타인 거리 간이 버전)
      const similarity = calculateSimilarity(expected, spoken);
      if (similarity > 0.7) {
        matchedWords.push(expected);
      } else {
        mispronounced.push({
          expected,
          heard: spoken,
          tip: `"${expected}" 발음을 천천히 연습해 보세요.`,
        });
      }
    }
  });

  // 점수 계산
  const accuracyScore = expectedWords.length > 0
    ? Math.round((matchedWords.length / expectedWords.length) * 100)
    : 0;
  const fluencyScore = Math.min(100, Math.round(spokenWords.length / expectedWords.length * 100));
  const stressScore = Math.round((accuracyScore + fluencyScore) / 2);
  const overallScore = Math.round((accuracyScore * 0.5) + (fluencyScore * 0.3) + (stressScore * 0.2));

  // 피드백 생성
  let feedback = '';
  if (overallScore >= 80) {
    feedback = '훌륭해요! 발음이 정확하고 자연스럽습니다.';
  } else if (overallScore >= 60) {
    feedback = '잘하고 있어요! 몇몇 단어의 발음을 더 연습해 보세요.';
  } else if (overallScore >= 40) {
    feedback = '좋은 시도예요! 원어민 음성을 들으며 따라하면 도움이 됩니다.';
  } else {
    feedback = '천천히 한 단어씩 연습해 보세요. 꾸준히 하면 늘어요!';
  }

  const practiceRecommendations: string[] = [];
  if (mispronounced.length > 0) {
    practiceRecommendations.push(`"${mispronounced[0].expected}" 발음을 집중적으로 연습해 보세요`);
  }
  if (fluencyScore < 70) {
    practiceRecommendations.push('문장을 끊지 않고 자연스럽게 이어서 말해 보세요');
  }
  if (practiceRecommendations.length === 0) {
    practiceRecommendations.push('다른 문장도 연습해 보세요!');
  }

  return {
    overallScore,
    accuracyScore,
    fluencyScore,
    stressScore,
    matchedWords,
    mispronounced,
    feedback,
    practiceRecommendations,
  };
}

// 두 문자열의 유사도 계산 (0-1)
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (!str1 || !str2) return 0;

  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1;

  // 간단한 유사도 계산
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) {
      matches++;
    }
  }

  return matches / longer.length;
}

// 발음 연습용 문장 생성
export async function generatePronunciationSentences(
  targetLanguage: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  focusArea?: string // 예: 'r/l sounds', 'th sounds', etc.
): Promise<{ sentence: string; translation: string; phonetics?: string }[]> {
  const prompt = `Generate 5 practice sentences for pronunciation training.

Target Language: ${targetLanguage}
Difficulty: ${difficulty}
${focusArea ? `Focus Area: ${focusArea}` : ''}

Return JSON array:
[
  {
    "sentence": "The sentence in target language",
    "translation": "한국어 번역",
    "phonetics": "optional IPA or phonetic guide"
  }
]`;

  try {
    const response = await callAnthropicAPI(
      [{ role: 'user', content: prompt }],
      'You generate pronunciation practice sentences. Return only valid JSON array.'
    );

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response');
  } catch (error) {
    console.error('Failed to generate sentences:', error);
    return getFallbackPronunciationSentences(targetLanguage, difficulty);
  }
}

// 폴백 발음 연습 문장
function getFallbackPronunciationSentences(
  targetLanguage: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): { sentence: string; translation: string; phonetics?: string }[] {
  const sentences: Record<string, Record<string, { sentence: string; translation: string }[]>> = {
    en: {
      beginner: [
        { sentence: 'Hello, how are you?', translation: '안녕하세요, 어떻게 지내세요?' },
        { sentence: 'Nice to meet you.', translation: '만나서 반갑습니다.' },
        { sentence: 'Thank you very much.', translation: '정말 감사합니다.' },
        { sentence: 'What is your name?', translation: '이름이 뭐예요?' },
        { sentence: 'I am from Korea.', translation: '저는 한국에서 왔어요.' },
      ],
      intermediate: [
        { sentence: 'Could you please repeat that?', translation: '다시 한번 말씀해 주시겠어요?' },
        { sentence: 'I would like to make a reservation.', translation: '예약을 하고 싶습니다.' },
        { sentence: 'The weather is beautiful today.', translation: '오늘 날씨가 정말 좋네요.' },
        { sentence: 'I am learning English.', translation: '저는 영어를 배우고 있어요.' },
        { sentence: 'Where is the nearest subway station?', translation: '가장 가까운 지하철역이 어디예요?' },
      ],
      advanced: [
        { sentence: 'I thoroughly enjoyed the presentation.', translation: '프레젠테이션을 정말 즐겁게 들었습니다.' },
        { sentence: 'The comprehensive analysis revealed interesting patterns.', translation: '종합적인 분석에서 흥미로운 패턴이 드러났습니다.' },
        { sentence: 'Could you elaborate on that particular aspect?', translation: '그 특정 측면에 대해 자세히 설명해 주시겠어요?' },
        { sentence: 'The unprecedented circumstances require immediate attention.', translation: '전례 없는 상황에 즉각적인 관심이 필요합니다.' },
        { sentence: 'Your contribution has been invaluable.', translation: '귀하의 기여는 매우 소중했습니다.' },
      ],
    },
    ja: {
      beginner: [
        { sentence: 'おはようございます。', translation: '좋은 아침이에요.' },
        { sentence: 'ありがとうございます。', translation: '감사합니다.' },
        { sentence: 'すみません。', translation: '실례합니다.' },
        { sentence: 'これはいくらですか？', translation: '이것은 얼마예요?' },
        { sentence: 'トイレはどこですか？', translation: '화장실은 어디예요?' },
      ],
      intermediate: [
        { sentence: 'お時間よろしいですか？', translation: '시간 괜찮으세요?' },
        { sentence: '予約したいのですが。', translation: '예약하고 싶은데요.' },
        { sentence: '少々お待ちください。', translation: '잠시만 기다려 주세요.' },
        { sentence: 'お先に失礼します。', translation: '먼저 실례하겠습니다.' },
        { sentence: 'とても美味しかったです。', translation: '정말 맛있었어요.' },
      ],
      advanced: [
        { sentence: 'ご検討いただければ幸いです。', translation: '검토해 주시면 감사하겠습니다.' },
        { sentence: '恐れ入りますが、お名前をお伺いしてもよろしいでしょうか。', translation: '죄송하지만, 성함을 여쭤봐도 될까요?' },
        { sentence: 'お忙しいところ申し訳ございません。', translation: '바쁘신 중에 죄송합니다.' },
        { sentence: 'ご無沙汰しております。', translation: '오래간만입니다.' },
        { sentence: 'お手数をおかけして申し訳ありません。', translation: '수고를 끼쳐 드려 죄송합니다.' },
      ],
    },
    zh: {
      beginner: [
        { sentence: '你好！', translation: '안녕하세요!' },
        { sentence: '谢谢你。', translation: '감사합니다.' },
        { sentence: '对不起。', translation: '죄송합니다.' },
        { sentence: '这个多少钱？', translation: '이것은 얼마예요?' },
        { sentence: '请问，厕所在哪里？', translation: '실례합니다, 화장실이 어디예요?' },
      ],
      intermediate: [
        { sentence: '你能帮我一下吗？', translation: '저를 도와주실 수 있나요?' },
        { sentence: '我想预订一个房间。', translation: '방을 예약하고 싶습니다.' },
        { sentence: '请稍等一下。', translation: '잠시만 기다려 주세요.' },
        { sentence: '天气真好！', translation: '날씨가 정말 좋네요!' },
        { sentence: '我正在学习中文。', translation: '저는 중국어를 배우고 있어요.' },
      ],
      advanced: [
        { sentence: '非常感谢您的帮助。', translation: '도움에 정말 감사드립니다.' },
        { sentence: '我对这个项目很感兴趣。', translation: '저는 이 프로젝트에 매우 관심이 있습니다.' },
        { sentence: '请问您方便的时候能联系我吗？', translation: '편하실 때 연락해 주시겠어요?' },
        { sentence: '我们应该仔细考虑这个问题。', translation: '우리는 이 문제를 신중하게 고려해야 합니다.' },
        { sentence: '期待与您进一步合作。', translation: '귀하와의 추가 협력을 기대합니다.' },
      ],
    },
  };

  return sentences[targetLanguage]?.[difficulty] || sentences['en']['beginner'];
}
