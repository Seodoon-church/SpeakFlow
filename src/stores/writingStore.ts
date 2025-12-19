import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 작문 주제 타입
export type WritingCategory = 'daily' | 'business' | 'academic' | 'creative' | 'email';
export type WritingLevel = 'beginner' | 'intermediate' | 'advanced';

// 작문 프롬프트
export interface WritingPrompt {
  id: string;
  category: WritingCategory;
  level: WritingLevel;
  title: string;
  titleKo: string;
  description: string;
  descriptionKo: string;
  hints?: string[];
  wordCount: { min: number; max: number };
}

// AI 피드백
export interface WritingFeedback {
  overallScore: number; // 0-100
  grammarScore: number;
  vocabularyScore: number;
  fluencyScore: number;
  corrections: Correction[];
  suggestions: string[];
  improvedVersion: string;
  encouragement: string;
}

export interface Correction {
  original: string;
  corrected: string;
  type: 'grammar' | 'vocabulary' | 'spelling' | 'style' | 'punctuation';
  explanation: string;
  explanationKo: string;
}

// 사용자 제출
export interface WritingSubmission {
  id: string;
  promptId: string;
  text: string;
  feedback?: WritingFeedback;
  createdAt: string;
  xpEarned: number;
}

// 카테고리 정보
export const WRITING_CATEGORIES: Record<WritingCategory, { name: string; icon: string; color: string }> = {
  daily: { name: '일상 영작', icon: '💬', color: 'from-blue-500 to-cyan-500' },
  business: { name: '비즈니스', icon: '💼', color: 'from-gray-600 to-gray-800' },
  academic: { name: '학술/에세이', icon: '📚', color: 'from-purple-500 to-indigo-600' },
  creative: { name: '창작 글쓰기', icon: '✨', color: 'from-pink-500 to-rose-500' },
  email: { name: '이메일 작성', icon: '📧', color: 'from-green-500 to-emerald-600' },
};

// 레벨 정보
export const WRITING_LEVELS: Record<WritingLevel, { name: string; description: string }> = {
  beginner: { name: '초급', description: '간단한 문장 작성' },
  intermediate: { name: '중급', description: '단락 수준 작문' },
  advanced: { name: '고급', description: '복잡한 에세이 작성' },
};

// 작문 프롬프트 데이터
export const WRITING_PROMPTS: WritingPrompt[] = [
  // Daily - Beginner
  {
    id: 'daily-1',
    category: 'daily',
    level: 'beginner',
    title: 'Introduce Yourself',
    titleKo: '자기소개하기',
    description: 'Write 3-5 sentences introducing yourself. Include your name, age, job, and hobby.',
    descriptionKo: '3-5문장으로 자기소개를 해보세요. 이름, 나이, 직업, 취미를 포함하세요.',
    hints: ['My name is...', 'I am ... years old.', 'I work as...', 'I like to...'],
    wordCount: { min: 30, max: 80 },
  },
  {
    id: 'daily-2',
    category: 'daily',
    level: 'beginner',
    title: 'My Morning Routine',
    titleKo: '나의 아침 일과',
    description: 'Describe what you do every morning from waking up to leaving home.',
    descriptionKo: '일어나서 집을 나서기까지 매일 아침 하는 일을 설명하세요.',
    hints: ['I wake up at...', 'First, I...', 'Then, I...', 'Before leaving, I...'],
    wordCount: { min: 40, max: 100 },
  },
  {
    id: 'daily-3',
    category: 'daily',
    level: 'beginner',
    title: 'My Favorite Food',
    titleKo: '내가 좋아하는 음식',
    description: 'Write about your favorite food. Why do you like it?',
    descriptionKo: '좋아하는 음식에 대해 써보세요. 왜 좋아하나요?',
    hints: ['My favorite food is...', 'It tastes...', 'I usually eat it when...'],
    wordCount: { min: 30, max: 80 },
  },
  // Daily - Intermediate
  {
    id: 'daily-4',
    category: 'daily',
    level: 'intermediate',
    title: 'A Memorable Trip',
    titleKo: '기억에 남는 여행',
    description: 'Describe a trip you took. Where did you go? What did you do? How did you feel?',
    descriptionKo: '다녀온 여행에 대해 설명하세요. 어디로 갔나요? 무엇을 했나요? 어떤 기분이었나요?',
    hints: ['Last year, I went to...', 'The highlight was...', 'I felt...'],
    wordCount: { min: 80, max: 150 },
  },
  {
    id: 'daily-5',
    category: 'daily',
    level: 'intermediate',
    title: 'My Dream Job',
    titleKo: '나의 꿈의 직업',
    description: 'What is your dream job? Why? What skills do you need?',
    descriptionKo: '꿈의 직업은 무엇인가요? 왜인가요? 어떤 기술이 필요한가요?',
    wordCount: { min: 80, max: 150 },
  },
  // Business
  {
    id: 'biz-1',
    category: 'business',
    level: 'intermediate',
    title: 'Meeting Request',
    titleKo: '미팅 요청하기',
    description: 'Write a short message to request a meeting with a client.',
    descriptionKo: '고객에게 미팅을 요청하는 짧은 메시지를 작성하세요.',
    hints: ['I would like to schedule...', 'Would you be available...', 'Please let me know...'],
    wordCount: { min: 50, max: 120 },
  },
  {
    id: 'biz-2',
    category: 'business',
    level: 'intermediate',
    title: 'Project Update',
    titleKo: '프로젝트 진행 상황 보고',
    description: 'Write a brief update on a project\'s progress to your team.',
    descriptionKo: '팀에게 프로젝트 진행 상황을 간략히 보고하세요.',
    wordCount: { min: 60, max: 150 },
  },
  {
    id: 'biz-3',
    category: 'business',
    level: 'advanced',
    title: 'Proposal Summary',
    titleKo: '제안서 요약',
    description: 'Write an executive summary for a business proposal.',
    descriptionKo: '비즈니스 제안서의 요약문을 작성하세요.',
    wordCount: { min: 100, max: 200 },
  },
  // Email
  {
    id: 'email-1',
    category: 'email',
    level: 'beginner',
    title: 'Thank You Email',
    titleKo: '감사 이메일',
    description: 'Write a thank you email to someone who helped you.',
    descriptionKo: '도움을 준 사람에게 감사 이메일을 작성하세요.',
    hints: ['Thank you for...', 'I really appreciate...', 'Best regards,'],
    wordCount: { min: 40, max: 100 },
  },
  {
    id: 'email-2',
    category: 'email',
    level: 'intermediate',
    title: 'Job Application',
    titleKo: '입사 지원 이메일',
    description: 'Write an email applying for a job position.',
    descriptionKo: '채용 지원 이메일을 작성하세요.',
    wordCount: { min: 80, max: 180 },
  },
  {
    id: 'email-3',
    category: 'email',
    level: 'intermediate',
    title: 'Complaint Email',
    titleKo: '불만 이메일',
    description: 'Write a polite complaint email about a product or service issue.',
    descriptionKo: '제품이나 서비스 문제에 대해 정중하게 불만을 표현하는 이메일을 작성하세요.',
    wordCount: { min: 80, max: 180 },
  },
  // Academic
  {
    id: 'academic-1',
    category: 'academic',
    level: 'intermediate',
    title: 'Opinion Paragraph',
    titleKo: '의견 단락 쓰기',
    description: 'Write a paragraph expressing your opinion on "Should students have homework?"',
    descriptionKo: '"학생들에게 숙제가 필요한가?"에 대한 의견을 한 단락으로 쓰세요.',
    wordCount: { min: 80, max: 150 },
  },
  {
    id: 'academic-2',
    category: 'academic',
    level: 'advanced',
    title: 'Argumentative Essay Introduction',
    titleKo: '논증 에세이 서론',
    description: 'Write an introduction for an essay about the impact of social media.',
    descriptionKo: '소셜 미디어의 영향에 대한 에세이의 서론을 작성하세요.',
    wordCount: { min: 100, max: 200 },
  },
  // Creative
  {
    id: 'creative-1',
    category: 'creative',
    level: 'beginner',
    title: 'Describe a Picture',
    titleKo: '그림 묘사하기',
    description: 'Describe your favorite place in detail. What does it look like? How does it make you feel?',
    descriptionKo: '좋아하는 장소를 자세히 묘사하세요. 어떻게 생겼나요? 어떤 기분이 드나요?',
    wordCount: { min: 50, max: 120 },
  },
  {
    id: 'creative-2',
    category: 'creative',
    level: 'intermediate',
    title: 'Short Story Beginning',
    titleKo: '단편 소설 시작',
    description: 'Write the opening paragraph of a story that begins with "It was a dark and stormy night..."',
    descriptionKo: '"그것은 어둡고 폭풍우가 몰아치는 밤이었다..."로 시작하는 이야기의 첫 단락을 쓰세요.',
    wordCount: { min: 80, max: 180 },
  },
];

interface WritingState {
  submissions: WritingSubmission[];
  stats: {
    totalSubmissions: number;
    averageScore: number;
    bestCategory: WritingCategory | null;
    weeklyGoal: number;
    weeklyProgress: number;
  };

  // Actions
  addSubmission: (submission: Omit<WritingSubmission, 'id' | 'createdAt'>) => string;
  updateFeedback: (submissionId: string, feedback: WritingFeedback) => void;
  getSubmissionsByPrompt: (promptId: string) => WritingSubmission[];
  getRecentSubmissions: (limit: number) => WritingSubmission[];
  getCategoryStats: () => Record<WritingCategory, { count: number; avgScore: number }>;
}

export const useWritingStore = create<WritingState>()(
  persist(
    (set, get) => ({
      submissions: [],
      stats: {
        totalSubmissions: 0,
        averageScore: 0,
        bestCategory: null,
        weeklyGoal: 5,
        weeklyProgress: 0,
      },

      addSubmission: (submission) => {
        const id = `sub_${Date.now()}`;
        const newSubmission: WritingSubmission = {
          ...submission,
          id,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const newSubmissions = [...state.submissions, newSubmission];
          const withFeedback = newSubmissions.filter(s => s.feedback);
          const avgScore = withFeedback.length > 0
            ? withFeedback.reduce((sum, s) => sum + (s.feedback?.overallScore || 0), 0) / withFeedback.length
            : 0;

          return {
            submissions: newSubmissions,
            stats: {
              ...state.stats,
              totalSubmissions: newSubmissions.length,
              averageScore: Math.round(avgScore),
              weeklyProgress: state.stats.weeklyProgress + 1,
            },
          };
        });

        return id;
      },

      updateFeedback: (submissionId, feedback) => {
        set((state) => {
          const newSubmissions = state.submissions.map(s =>
            s.id === submissionId ? { ...s, feedback } : s
          );
          const withFeedback = newSubmissions.filter(s => s.feedback);
          const avgScore = withFeedback.length > 0
            ? withFeedback.reduce((sum, s) => sum + (s.feedback?.overallScore || 0), 0) / withFeedback.length
            : 0;

          return {
            submissions: newSubmissions,
            stats: {
              ...state.stats,
              averageScore: Math.round(avgScore),
            },
          };
        });
      },

      getSubmissionsByPrompt: (promptId) => {
        return get().submissions.filter(s => s.promptId === promptId);
      },

      getRecentSubmissions: (limit) => {
        return [...get().submissions]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
      },

      getCategoryStats: () => {
        const submissions = get().submissions;
        const stats: Record<WritingCategory, { count: number; avgScore: number }> = {
          daily: { count: 0, avgScore: 0 },
          business: { count: 0, avgScore: 0 },
          academic: { count: 0, avgScore: 0 },
          creative: { count: 0, avgScore: 0 },
          email: { count: 0, avgScore: 0 },
        };

        submissions.forEach(sub => {
          const prompt = WRITING_PROMPTS.find(p => p.id === sub.promptId);
          if (prompt && sub.feedback) {
            stats[prompt.category].count++;
            stats[prompt.category].avgScore += sub.feedback.overallScore;
          }
        });

        Object.keys(stats).forEach(cat => {
          const category = cat as WritingCategory;
          if (stats[category].count > 0) {
            stats[category].avgScore = Math.round(stats[category].avgScore / stats[category].count);
          }
        });

        return stats;
      },
    }),
    {
      name: 'writing-storage',
    }
  )
);

// AI 첨삭 프롬프트 생성 함수
export function generateCorrectionPrompt(text: string, promptInfo: WritingPrompt): string {
  return `You are an expert English writing tutor for Korean learners. Analyze and correct the following English writing.

**Writing Prompt**: ${promptInfo.title}
**Level**: ${promptInfo.level}
**Category**: ${promptInfo.category}

**Student's Writing**:
${text}

Please provide detailed feedback in the following JSON format:
{
  "overallScore": <0-100>,
  "grammarScore": <0-100>,
  "vocabularyScore": <0-100>,
  "fluencyScore": <0-100>,
  "corrections": [
    {
      "original": "<incorrect phrase>",
      "corrected": "<corrected phrase>",
      "type": "<grammar|vocabulary|spelling|style|punctuation>",
      "explanation": "<brief explanation in English>",
      "explanationKo": "<한국어로 간단한 설명>"
    }
  ],
  "suggestions": [
    "<suggestion for improvement in English>"
  ],
  "improvedVersion": "<rewritten version of the entire text>",
  "encouragement": "<encouraging message in Korean for the student>"
}

Be encouraging but accurate. Focus on the most important corrections first. Provide practical suggestions for improvement.`;
}
