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

// 로컬 개발용 API (Vite 프록시 사용)
async function sendMessageToLocalAPI(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        systemPrompt,
      }),
    });

    if (!response.ok) {
      throw new Error('Local API error');
    }

    const data = await response.json();
    return data.content;
  } catch (err) {
    console.error('Local API error:', err);
    // 최종 폴백: 미리 정의된 응답
    return getFallbackResponse(messages);
  }
}

// 폴백 응답 (API 연결 실패 시)
function getFallbackResponse(messages: ChatMessage[]): string {
  const fallbackResponses = [
    "That's a great point. Could you tell me more about your thoughts on that?",
    "I see what you mean. Let me share my perspective on this matter.",
    "Thank you for bringing that up. How do you think we should proceed?",
    "That's an interesting approach. What timeline are you considering for this?",
    "I appreciate your input. Could you elaborate on the specific details?",
    "Good question. Based on our discussion, I think we should focus on the key priorities first.",
    "I understand your concern. Let me address that point directly.",
    "That makes sense. What resources do you think we'll need for this project?",
  ];

  const lastMessage = messages[messages.length - 1]?.content || '';

  // 질문에 대한 응답 선택
  if (lastMessage.includes('?')) {
    return fallbackResponses[Math.floor(Math.random() * 4)];
  }

  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

// 대화 시작 인사말 생성
export function getInitialGreeting(context: RoleplayContext): string {
  const greetings: Record<string, string> = {
    '비즈니스 미팅 시작': "Good morning! Thank you for organizing this meeting. I'm looking forward to discussing the new marketing campaign. Where would you like to start?",
    '프로젝트 진행 상황 보고': "Hi there! I've been reviewing the project timeline. Shall we go over the current progress and any blockers we're facing?",
    '클라이언트 협상': "Hello! It's great to meet with you today. I've reviewed your proposal and have some thoughts to share. How would you like to begin our discussion?",
    '팀 브레인스토밍': "Hey everyone! I'm excited about today's brainstorming session. I've done some research on this topic. Who wants to kick things off?",
    '성과 리뷰 미팅': "Good afternoon. Thank you for meeting with me today. I've prepared some notes on your recent work. Shall we start with your accomplishments this quarter?",
  };

  return greetings[context.scenario.title] ||
    `Hello! I'm ready to start our ${context.scenario.title.toLowerCase()}. How would you like to begin?`;
}

// 피드백 생성 (대화 종료 후)
export async function generateFeedback(
  messages: ChatMessage[],
  context: RoleplayContext
): Promise<string> {
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
