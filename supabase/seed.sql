-- =============================================
-- SpeakFlow Sample Data
-- 각 트랙별 1주차 샘플 청크 데이터
-- =============================================

-- =============================================
-- BUSINESS TRACK - Week 1 (비즈니스 미팅)
-- =============================================
INSERT INTO chunks (track_id, week, day, order_index, expression, meaning, pronunciation, example_sentence, example_translation, tips, difficulty) VALUES

-- Day 1: 미팅 시작
('business', 1, 1, 1,
 'I was wondering if we could schedule a meeting.',
 '회의 일정을 잡을 수 있을지 여쭤봐도 될까요?',
 '/aɪ wəz ˈwʌndərɪŋ ɪf wi kʊd ˈʃedjuːl ə ˈmiːtɪŋ/',
 'I was wondering if we could schedule a meeting next week to discuss the project.',
 '다음 주에 프로젝트를 논의하기 위한 회의를 잡을 수 있을지 여쭤봐도 될까요?',
 '공손하게 요청할 때 사용합니다. "Can we...?"보다 더 정중한 표현입니다.',
 'beginner'),

('business', 1, 1, 2,
 'Thank you for taking the time to meet with me.',
 '시간 내주셔서 감사합니다.',
 '/θæŋk ju fɔːr ˈteɪkɪŋ ðə taɪm tuː miːt wɪð miː/',
 'Thank you for taking the time to meet with me today despite your busy schedule.',
 '바쁘신 일정에도 오늘 시간 내주셔서 감사합니다.',
 '미팅 시작 시 상대방에 대한 감사를 표현하는 기본적인 비즈니스 예절입니다.',
 'beginner'),

('business', 1, 1, 3,
 'Let me briefly go over the agenda.',
 '안건을 간략히 살펴보겠습니다.',
 '/let miː ˈbriːfli ɡoʊ ˈoʊvər ði əˈdʒendə/',
 'Let me briefly go over the agenda before we start.',
 '시작하기 전에 안건을 간략히 살펴보겠습니다.',
 '미팅의 구조를 잡아주는 표현으로, 전문적인 인상을 줍니다.',
 'intermediate'),

-- Day 2: 의견 표현
('business', 1, 2, 1,
 'In my opinion, we should focus on...',
 '제 생각에는 ~에 집중해야 할 것 같습니다.',
 '/ɪn maɪ əˈpɪnjən wi ʃʊd ˈfoʊkəs ɒn/',
 'In my opinion, we should focus on customer retention rather than acquisition.',
 '제 생각에는 고객 확보보다 고객 유지에 집중해야 할 것 같습니다.',
 '자신의 의견을 말할 때 사용하는 기본 표현입니다.',
 'beginner'),

('business', 1, 2, 2,
 'Could you please clarify that point?',
 '그 부분을 명확히 해주시겠어요?',
 '/kʊd ju pliːz ˈklærɪfaɪ ðæt pɔɪnt/',
 'Could you please clarify that point? I want to make sure I understand correctly.',
 '그 부분을 명확히 해주시겠어요? 제가 정확히 이해했는지 확인하고 싶어서요.',
 '이해가 안 될 때 정중하게 다시 설명을 요청하는 표현입니다.',
 'beginner'),

('business', 1, 2, 3,
 'That''s an interesting perspective.',
 '흥미로운 관점이네요.',
 '/ðæts ən ˈɪntrəstɪŋ pərˈspektɪv/',
 'That''s an interesting perspective. I hadn''t considered that angle before.',
 '흥미로운 관점이네요. 그런 각도로는 생각해보지 않았어요.',
 '상대방 의견에 대해 긍정적으로 반응하면서 토론을 이어가는 표현입니다.',
 'intermediate'),

-- Day 3: 제안하기
('business', 1, 3, 1,
 'How about we try a different approach?',
 '다른 접근 방식을 시도해보는 건 어떨까요?',
 '/haʊ əˈbaʊt wi traɪ ə ˈdɪfərənt əˈproʊtʃ/',
 'How about we try a different approach? I think there might be a more efficient way.',
 '다른 접근 방식을 시도해보는 건 어떨까요? 더 효율적인 방법이 있을 것 같아요.',
 '새로운 아이디어를 부드럽게 제안할 때 사용합니다.',
 'beginner'),

('business', 1, 3, 2,
 'Let me get back to you on that.',
 '그 건에 대해서는 확인 후 다시 연락드릴게요.',
 '/let miː ɡet bæk tuː juː ɒn ðæt/',
 'Let me get back to you on that after I check with my team.',
 '팀과 확인 후 그 건에 대해 다시 연락드릴게요.',
 '즉답이 어려울 때 시간을 벌면서 전문적으로 대응하는 표현입니다.',
 'beginner'),

('business', 1, 3, 3,
 'I''d like to propose that we...',
 '제안드리고 싶은 것은 ~입니다.',
 '/aɪd laɪk tuː prəˈpoʊz ðæt wi/',
 'I''d like to propose that we extend the deadline by two weeks.',
 '마감일을 2주 연장하는 것을 제안드리고 싶습니다.',
 '공식적인 제안을 할 때 사용하는 정중한 표현입니다.',
 'intermediate');

-- =============================================
-- BUSINESS TRACK - Week 1 Scenario
-- =============================================
INSERT INTO scenarios (track_id, week, title, description, situation, user_role, ai_role, system_prompt, difficulty, estimated_minutes) VALUES
('business', 1,
 '프로젝트 킥오프 미팅',
 '새로운 마케팅 캠페인에 대한 첫 미팅을 진행합니다.',
 '당신은 프로젝트 매니저로서 새로운 Q1 마케팅 캠페인에 대한 킥오프 미팅을 진행해야 합니다. 팀원들과 목표, 일정, 역할 분담에 대해 논의하세요.',
 '프로젝트 매니저',
 '마케팅 팀원',
 'You are a marketing team member in a business meeting. Respond professionally and ask relevant questions about the project goals, timeline, and your responsibilities. Use formal business English. Keep responses concise (2-3 sentences). If the user makes grammar mistakes, gently model the correct usage in your response without explicitly correcting them.',
 'beginner',
 5);

-- =============================================
-- ACADEMIC TRACK - Week 1 (학술 발표 기초)
-- =============================================
INSERT INTO chunks (track_id, week, day, order_index, expression, meaning, pronunciation, example_sentence, example_translation, tips, difficulty) VALUES

-- Day 1: 발표 시작
('academic', 1, 1, 1,
 'Today, I''ll be presenting our research on...',
 '오늘 ~에 대한 저희 연구를 발표하겠습니다.',
 '/təˈdeɪ aɪl biː prɪˈzentɪŋ ˈaʊər rɪˈsɜːrtʃ ɒn/',
 'Today, I''ll be presenting our research on the effects of immunotherapy on cancer cells.',
 '오늘 암세포에 대한 면역요법의 효과에 대한 저희 연구를 발표하겠습니다.',
 '학술 발표의 시작을 알리는 표준적인 문구입니다.',
 'beginner'),

('academic', 1, 1, 2,
 'Our hypothesis was that...',
 '저희의 가설은 ~였습니다.',
 '/ˈaʊər haɪˈpɒθəsɪs wɒz ðæt/',
 'Our hypothesis was that increased cytokine levels would correlate with improved immune response.',
 '저희의 가설은 증가된 사이토카인 수치가 향상된 면역 반응과 상관관계가 있을 것이라는 것이었습니다.',
 '연구의 출발점인 가설을 명확하게 설명할 때 사용합니다.',
 'intermediate'),

('academic', 1, 1, 3,
 'We employed a methodology involving...',
 '저희는 ~를 포함하는 방법론을 사용했습니다.',
 '/wiː ɪmˈplɔɪd ə ˌmeθəˈdɒlədʒi ɪnˈvɒlvɪŋ/',
 'We employed a methodology involving both in vitro and in vivo experiments.',
 '저희는 체외 및 체내 실험을 모두 포함하는 방법론을 사용했습니다.',
 '연구 방법을 설명할 때 사용하는 학술적 표현입니다.',
 'intermediate'),

-- Day 2: 결과 설명
('academic', 1, 2, 1,
 'As you can see from this graph...',
 '이 그래프에서 보시다시피...',
 '/æz juː kæn siː frɒm ðɪs ɡræf/',
 'As you can see from this graph, there was a significant increase in T-cell activity.',
 '이 그래프에서 보시다시피, T세포 활성이 유의미하게 증가했습니다.',
 '시각 자료를 설명할 때 청중의 주의를 끄는 표현입니다.',
 'beginner'),

('academic', 1, 2, 2,
 'Our findings suggest that...',
 '저희의 발견은 ~을 시사합니다.',
 '/ˈaʊər ˈfaɪndɪŋz səˈdʒest ðæt/',
 'Our findings suggest that the treatment is effective in early-stage patients.',
 '저희의 발견은 이 치료법이 초기 단계 환자들에게 효과적임을 시사합니다.',
 '결론을 조심스럽게 제시할 때 사용하는 학술적 표현입니다.',
 'intermediate'),

('academic', 1, 2, 3,
 'In conclusion, our findings suggest...',
 '결론적으로, 저희의 발견은 ~을 시사합니다.',
 '/ɪn kənˈkluːʒən ˈaʊər ˈfaɪndɪŋz səˈdʒest/',
 'In conclusion, our findings suggest a promising new avenue for cancer treatment.',
 '결론적으로, 저희의 발견은 암 치료를 위한 유망한 새로운 방향을 시사합니다.',
 '발표의 마무리 부분에서 핵심 메시지를 전달할 때 사용합니다.',
 'intermediate');

-- =============================================
-- ACADEMIC TRACK - Week 1 Scenario
-- =============================================
INSERT INTO scenarios (track_id, week, title, description, situation, user_role, ai_role, system_prompt, difficulty, estimated_minutes) VALUES
('academic', 1,
 '연구 발표 Q&A 세션',
 '학회에서 연구 발표 후 Q&A 세션을 진행합니다.',
 '당신은 면역학 연구 결과를 국제 학회에서 발표했습니다. 이제 청중의 질문에 답변해야 합니다.',
 '발표자 (연구원)',
 '학회 참석자',
 'You are an academic conference attendee asking questions about the presenter''s immunology research. Ask thoughtful, specific questions about methodology, results interpretation, and future directions. Use formal academic English. Keep questions focused and professional.',
 'intermediate',
 5);

-- =============================================
-- BEAUTY TECH BIZ TRACK - Week 1 (제품 소개)
-- =============================================
INSERT INTO chunks (track_id, week, day, order_index, expression, meaning, pronunciation, example_sentence, example_translation, tips, difficulty) VALUES

('beauty-tech', 1, 1, 1,
 'Allow me to introduce our latest innovation.',
 '저희의 최신 혁신 제품을 소개해 드리겠습니다.',
 '/əˈlaʊ miː tuː ˌɪntrəˈdjuːs ˈaʊər ˈleɪtɪst ˌɪnəˈveɪʃən/',
 'Allow me to introduce our latest innovation in LED skin therapy devices.',
 'LED 피부 치료 기기 분야의 저희 최신 혁신 제품을 소개해 드리겠습니다.',
 '공식적인 제품 발표에서 주목을 끄는 시작 표현입니다.',
 'intermediate'),

('beauty-tech', 1, 1, 2,
 'This device features cutting-edge technology.',
 '이 기기는 최첨단 기술을 탑재하고 있습니다.',
 '/ðɪs dɪˈvaɪs ˈfiːtʃərz ˈkʌtɪŋ edʒ tekˈnɒlədʒi/',
 'This device features cutting-edge LED technology with multiple wavelength options.',
 '이 기기는 다양한 파장 옵션을 갖춘 최첨단 LED 기술을 탑재하고 있습니다.',
 '기술적 우수성을 강조할 때 사용하는 표현입니다.',
 'intermediate'),

('beauty-tech', 1, 1, 3,
 'Clinical trials have demonstrated...',
 '임상 시험에서 ~이 입증되었습니다.',
 '/ˈklɪnɪkəl ˈtraɪəlz hæv ˈdemənstreɪtɪd/',
 'Clinical trials have demonstrated a 40% improvement in skin elasticity.',
 '임상 시험에서 피부 탄력이 40% 향상된 것이 입증되었습니다.',
 '과학적 근거를 제시하여 제품의 신뢰성을 높이는 표현입니다.',
 'intermediate');

-- =============================================
-- DESIGN BIZ TRACK - Week 1 (컨셉 프레젠테이션)
-- =============================================
INSERT INTO chunks (track_id, week, day, order_index, expression, meaning, pronunciation, example_sentence, example_translation, tips, difficulty) VALUES

('design', 1, 1, 1,
 'The concept behind this design is...',
 '이 디자인의 컨셉은 ~입니다.',
 '/ðə ˈkɒnsept bɪˈhaɪnd ðɪs dɪˈzaɪn ɪz/',
 'The concept behind this design is creating harmony between modern and traditional elements.',
 '이 디자인의 컨셉은 현대적 요소와 전통적 요소 사이의 조화를 만드는 것입니다.',
 '디자인 프레젠테이션에서 핵심 아이디어를 설명할 때 사용합니다.',
 'beginner'),

('design', 1, 1, 2,
 'We incorporated elements that reflect...',
 '~을 반영하는 요소들을 통합했습니다.',
 '/wiː ɪnˈkɔːrpəreɪtɪd ˈelɪmənts ðæt rɪˈflekt/',
 'We incorporated elements that reflect the brand''s core values.',
 '브랜드의 핵심 가치를 반영하는 요소들을 통합했습니다.',
 '디자인 결정의 근거를 설명할 때 사용하는 표현입니다.',
 'intermediate'),

('design', 1, 1, 3,
 'Based on your feedback, we''ve adjusted...',
 '피드백을 바탕으로 ~를 조정했습니다.',
 '/beɪst ɒn jɔːr ˈfiːdbæk wiːv əˈdʒʌstɪd/',
 'Based on your feedback, we''ve adjusted the color palette to be more vibrant.',
 '피드백을 바탕으로 색상 팔레트를 더 생동감 있게 조정했습니다.',
 '클라이언트 피드백 반영을 보여주는 표현입니다.',
 'beginner');

-- =============================================
-- BEAUTY BIZ TRACK - Week 1 (브랜드 마케팅)
-- =============================================
INSERT INTO chunks (track_id, week, day, order_index, expression, meaning, pronunciation, example_sentence, example_translation, tips, difficulty) VALUES

('beauty', 1, 1, 1,
 'Our brand story revolves around...',
 '저희 브랜드 스토리는 ~를 중심으로 합니다.',
 '/ˈaʊər brænd ˈstɔːri rɪˈvɒlvz əˈraʊnd/',
 'Our brand story revolves around sustainable beauty and self-care.',
 '저희 브랜드 스토리는 지속 가능한 뷰티와 셀프 케어를 중심으로 합니다.',
 '브랜드의 핵심 가치를 설명할 때 사용합니다.',
 'beginner'),

('beauty', 1, 1, 2,
 'This product contains key ingredients such as...',
 '이 제품은 ~와 같은 핵심 성분을 함유하고 있습니다.',
 '/ðɪs ˈprɒdʌkt kənˈteɪnz kiː ɪnˈɡriːdiənts sʌtʃ æz/',
 'This product contains key ingredients such as hyaluronic acid and niacinamide.',
 '이 제품은 히알루론산과 나이아신아마이드와 같은 핵심 성분을 함유하고 있습니다.',
 '제품 성분을 설명할 때 사용하는 표현입니다.',
 'intermediate'),

('beauty', 1, 1, 3,
 'According to the latest beauty trends...',
 '최신 뷰티 트렌드에 따르면...',
 '/əˈkɔːrdɪŋ tuː ðə ˈleɪtɪst ˈbjuːti trendz/',
 'According to the latest beauty trends, consumers are prioritizing clean beauty.',
 '최신 뷰티 트렌드에 따르면, 소비자들은 클린 뷰티를 우선시하고 있습니다.',
 '시장 트렌드를 언급할 때 사용하는 표현입니다.',
 'intermediate');
