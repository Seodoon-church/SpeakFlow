# SpeakFlow 개발 진행 기록

> 마지막 업데이트: 2025-12-19

---

## 현재 상태: 핵심 기능 구현 완료

### 완료된 기능

#### 1. AI 아바타 대화 (`/avatar-chat`)
- [x] 프리토킹 모드 - AI와 자유 대화
- [x] 시나리오 모드 - 트랙별 롤플레이
- [x] 상황 시뮬레이션 - 사용자 입력 → AI 시나리오 자동 생성
- [x] 음성 인식 (Web Speech API STT)
- [x] 음성 합성 (Web Speech API TTS)
- [x] 실시간 피드백 패널 (문법, 자연스러운 표현, 팁)
- [x] 시뮬레이션 완료 리포트 (점수, 잘한점/개선점)

#### 2. 레벨 테스트 (`/level-test`)
- [x] 어휘 테스트 (적응형 난이도)
- [x] 문법 테스트 (적응형 난이도)
- [x] 듣기 테스트 (TTS 재생)
- [x] 말하기 테스트 (STT + AI 분석)
- [x] CEFR 레벨 계산 (A1~C2)
- [x] 결과 저장 (chatHistoryStore)
- [x] 지원 언어: 영어, 일본어, 중국어

#### 3. 소셜 로그인 (`/login`)
- [x] Google OAuth 로그인
- [x] Kakao OAuth 로그인
- [x] 이메일/비밀번호 로그인
- [x] 이메일 회원가입
- [x] OAuth 콜백 처리 (`/auth/callback`)
- [x] Supabase Auth 연동

#### 4. 발음 평가 기능
- [x] `analyzePronunciation()` - AI 발음 분석
- [x] 정확도, 유창성, 강세 점수
- [x] 잘못 발음한 단어 식별 및 교정 팁
- [x] 연습 추천사항 제공
- [x] `generatePronunciationSentences()` - 난이도별 연습 문장

#### 5. 게이미피케이션 (`chatHistoryStore`)
- [x] XP 시스템 (대화 완료 시 +30 XP, 레벨 테스트 +50 XP)
- [x] 레벨 시스템 (XP 기반 자동 계산)
- [x] 스트릭 추적 (연속 학습일)
- [x] 배지 시스템 (첫 대화, 7일 연속, XP 달성 등)
- [x] 일일 목표 (dailyXp / dailyGoalXp)
- [x] 주간 통계

#### 6. 대화 기록 저장
- [x] 세션별 대화 저장 (localStorage)
- [x] 모드별 조회 (freetalk, scenario, simulation)
- [x] 최근 세션 조회
- [x] 레벨 테스트 결과 저장

#### 7. 홈페이지 리디자인 (`/home`)
- [x] AI 기능 중심 레이아웃
- [x] 상태 카드 (스트릭, XP/레벨, 언어 레벨)
- [x] AI 아바타 대화 히어로 섹션
- [x] AI 학습 도구 그리드
- [x] 오늘의 목표 프로그레스
- [x] 최근 대화 기록
- [x] 배지 & 리더보드 링크

---

### 기존 기능 (이전에 구현됨)

- 트랙별 학습 콘텐츠 (청크, 시나리오)
- 가족 프로필 관리
- 일본어: 히라가나/가타카나, J-Content, 일본 여행
- 영어: English Journey (미국/영국)
- 롤플레이 시나리오
- 단어장 (SRS)

---

### 미구현 / 추후 개발 예정

#### 우선순위 높음
- [ ] Supabase OAuth 설정 (Google, Kakao 콘솔에서 클라이언트 ID 등록 필요)
- [ ] 프로필 설정 페이지 개선 (사용자 정보 수정)
- [ ] 통계 페이지 개선 (대화 기록, 학습 분석)

#### 우선순위 중간
- [ ] ElevenLabs TTS 연동 (더 자연스러운 음성)
- [ ] 시나리오 라이브러리 (커뮤니티 시나리오)
- [ ] 구독/결제 시스템

#### 우선순위 낮음
- [ ] 오프라인 모드 (PWA 캐싱 개선)
- [ ] 푸시 알림
- [ ] 다국어 UI

---

## 주요 파일 구조

```
src/
├── pages/
│   ├── HomePage.tsx          # 메인 홈 (AI 기능 중심)
│   ├── AvatarChatPage.tsx    # AI 아바타 대화
│   ├── LevelTestPage.tsx     # 레벨 테스트
│   ├── LoginPage.tsx         # 로그인/회원가입
│   ├── AuthCallbackPage.tsx  # OAuth 콜백
│   └── ...
├── stores/
│   ├── authStore.ts          # 인증 상태 (Supabase)
│   ├── chatHistoryStore.ts   # 대화 기록, XP, 배지
│   └── ...
├── lib/
│   ├── claude.ts             # Claude API 함수들
│   │   ├── sendFreetalkMessage()
│   │   ├── generateSimulationScenario()
│   │   ├── sendSimulationMessage()
│   │   ├── analyzePronunciation()
│   │   ├── analyzeSpeaking()
│   │   └── ...
│   └── supabase.ts           # Supabase 클라이언트
├── data/
│   ├── levelTestQuestions.ts # 레벨 테스트 문제 데이터
│   └── ...
└── types/
    └── index.ts              # 타입 정의
```

---

## 환경 설정

### 필요한 환경 변수 (.env)
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ANTHROPIC_API_KEY=your-claude-api-key (개발용)
```

### Supabase OAuth 설정 필요
1. Google Cloud Console에서 OAuth 클라이언트 생성
2. Kakao Developers에서 앱 등록
3. Supabase Dashboard > Authentication > Providers에서 활성화

---

## 다음 개발 시 참고

### 빌드 명령어
```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 미리보기
```

### 배포
- Firebase Hosting 또는 Vercel 사용 중
- `/api/chat` - Vercel Serverless Function (Claude API)

### 최근 커밋
```
63a77fa docs: SpeakFlow v2 기획서 추가
cb9d705 feat: 소셜 로그인, 발음 평가, 게이미피케이션 및 홈페이지 리디자인
```

---

## 알려진 이슈

1. **청크 크기 경고**: 빌드 시 1MB 이상 경고 → 코드 스플리팅 권장
2. **OAuth 미설정**: Google/Kakao 콘솔에서 클라이언트 설정 필요
3. **CRLF 경고**: Windows 환경 줄바꿈 관련 (기능에 영향 없음)

---

*이 문서는 개발 재개 시 참고용으로 작성되었습니다.*
