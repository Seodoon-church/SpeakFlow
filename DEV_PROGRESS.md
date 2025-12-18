# SpeakFlow 개발 진행 기록

## 📅 2024-12-18 작업 내용

### ✅ 완료된 작업

#### 1. AI 아바타 채팅 페이지 (`/avatar-chat`)
- **AvatarChatPage.tsx** 신규 생성
- AI 튜터 선택 기능 (Emma, Sophia, James, Michael)
- 내 사진으로 아바타 만들기 기능
- 프리토킹 / 시나리오 / 상황 시뮬레이션 모드
- 배경 선택 기능 (사무실, 카페, 공항 등)

#### 2. 음성인식 (STT) 연동
- **Web Speech API** 사용
- 마이크 버튼 클릭 → 음성 인식 → 텍스트 변환
- 실시간 인식 텍스트 표시 (interim results)
- `src/types/speech.d.ts` 타입 정의 추가

#### 3. 음성합성 (TTS) 연동
- **Web Speech API SpeechSynthesis** 사용
- 아바타가 AI 응답을 음성으로 출력
- 말할 때 입 애니메이션 (150ms 간격)
- 음성 파형 애니메이션

#### 4. Claude API 연동
- **개발 모드**: Vite 프록시 → Anthropic API 직접 호출
- **프로덕션 모드**: Vercel Serverless Function 사용
- `api/chat.ts` - Vercel Serverless Function 생성
- `src/lib/claude.ts` - API 호출 로직 업데이트

#### 5. D-ID 코드 제거
- 비용 문제로 D-ID 서비스 제거 (~$15,000/월 예상)
- `src/lib/did.ts` 삭제
- 브라우저 TTS로 대체

#### 6. 홈페이지 개선
- AI 학습 도구 카드 4개 추가:
  - AI 아바타 → `/avatar-chat`
  - 레벨 테스트 → `/level-test`
  - 프리토킹 → `/chat`
  - 롤플레이 → `/roleplay`

#### 7. 레벨 테스트 페이지 (`/level-test`)
- **LevelTestPage.tsx** 신규 생성
- CEFR 기반 레벨 테스트 UI

---

### 🔄 진행 중 / 다음 작업

#### 1. Vercel 환경변수 설정 (필수!)
Vercel Dashboard에서 설정 필요:
- **Key**: `ANTHROPIC_API_KEY`
- **Value**: (Anthropic Console에서 발급받은 API 키)

설정 후 Redeploy 필요!

#### 2. 배포 상태 확인
- Vercel Dashboard에서 최신 빌드 성공 여부 확인
- 프로덕션 URL에서 아바타 채팅 테스트

#### 3. 추후 개선 가능 사항
- [ ] 레벨 테스트 결과 계산 로직 구현
- [ ] 시나리오 모드에서 실제 시나리오별 대화 연동
- [ ] 대화 기록 저장 기능
- [ ] 피드백 기능 연동

---

### 📁 주요 변경 파일

```
src/
├── pages/
│   ├── AvatarChatPage.tsx  ⭐ 신규
│   ├── LevelTestPage.tsx   ⭐ 신규
│   ├── HomePage.tsx        수정 (카드 추가)
│   └── index.ts            수정 (export 추가)
├── lib/
│   └── claude.ts           수정 (Vercel API 연동)
├── types/
│   └── speech.d.ts         ⭐ 신규
├── App.tsx                 수정 (라우트 추가)
api/
└── chat.ts                 ⭐ 신규 (Vercel Serverless)
vercel.json                 수정 (API rewrite)
vite.config.ts              수정 (Anthropic 프록시)
.env                        수정 (API 키 추가)
```

---

### 🚀 로컬 개발 서버 실행

```bash
cd C:\Users\HANSUYEON.HANSUYEON\website\SpeakFlow
npm run dev
```

서버: http://localhost:5175

---

### 📝 Git 커밋 로그

```
e41f1f3 fix: TypeScript 빌드 오류 수정
acadcdf feat: Vercel Serverless Function으로 Claude API 연동
17aff46 feat: AI 아바타 채팅 페이지 및 음성인식 기능 추가
```

---

### ⚠️ 주의사항

1. **API 키 보안**: `.env` 파일은 git에 커밋하지 않음
2. **Chrome 권장**: 음성인식은 Chrome에서 가장 잘 작동
3. **HTTPS 필요**: 프로덕션에서 마이크 권한은 HTTPS에서만 작동

---

*마지막 업데이트: 2024-12-18 23:30*
