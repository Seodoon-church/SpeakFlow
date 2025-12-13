-- =============================================
-- SpeakFlow Database Schema
-- Supabase SQL Script
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. TRACKS (학습 트랙)
-- =============================================
CREATE TABLE tracks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    total_weeks INTEGER DEFAULT 12,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 트랙 데이터 삽입
INSERT INTO tracks (id, name, description, icon, color, total_weeks) VALUES
    ('business', 'Business', '비즈니스 미팅, 협상, 출장 영어', '💼', '#3B82F6', 12),
    ('beauty-tech', 'Beauty Tech Biz', '뷰티 디바이스, 바이어 미팅, 전시회', '✨', '#EC4899', 12),
    ('academic', 'Academic', '학술 발표, Q&A, 학회 네트워킹', '🎓', '#8B5CF6', 12),
    ('design', 'Design Biz', '디자인 PT, 클라이언트 소통', '🎨', '#F59E0B', 12),
    ('beauty', 'Beauty Biz', '브랜드 PT, 마케팅, 트렌드 리포트', '💄', '#EF4444', 12);

-- =============================================
-- 2. FAMILIES (가족 그룹)
-- =============================================
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    invite_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초대 코드 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
BEGIN
    RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 3. USERS (사용자) - Supabase Auth와 연동
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    track_id TEXT REFERENCES tracks(id),
    family_id UUID REFERENCES families(id) ON DELETE SET NULL,
    daily_goal_minutes INTEGER DEFAULT 15,
    streak_days INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_learning_date DATE,
    total_learning_minutes INTEGER DEFAULT 0,
    notification_enabled BOOLEAN DEFAULT TRUE,
    notification_time TIME DEFAULT '09:00:00',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. CHUNKS (청크/표현)
-- =============================================
CREATE TABLE chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    week INTEGER NOT NULL CHECK (week >= 1 AND week <= 12),
    day INTEGER NOT NULL CHECK (day >= 1 AND day <= 7),
    order_index INTEGER DEFAULT 0,
    expression TEXT NOT NULL,
    meaning TEXT NOT NULL,
    pronunciation TEXT,
    audio_url TEXT,
    example_sentence TEXT,
    example_translation TEXT,
    tips TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'intermediate',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 청크 인덱스
CREATE INDEX idx_chunks_track_week ON chunks(track_id, week);
CREATE INDEX idx_chunks_track_week_day ON chunks(track_id, week, day);

-- =============================================
-- 5. SCENARIOS (시나리오)
-- =============================================
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    week INTEGER NOT NULL CHECK (week >= 1 AND week <= 12),
    title TEXT NOT NULL,
    description TEXT,
    situation TEXT NOT NULL,
    user_role TEXT NOT NULL,
    ai_role TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'intermediate',
    estimated_minutes INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 시나리오 인덱스
CREATE INDEX idx_scenarios_track_week ON scenarios(track_id, week);

-- =============================================
-- 6. USER_PROGRESS (학습 진도) - SRS 알고리즘
-- =============================================
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chunk_id UUID NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
    proficiency INTEGER DEFAULT 1 CHECK (proficiency >= 1 AND proficiency <= 5),
    review_count INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    next_review_at TIMESTAMPTZ DEFAULT NOW(),
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, chunk_id)
);

-- SRS 복습 주기 계산 함수 (일 단위)
-- proficiency 1: 1일, 2: 3일, 3: 7일, 4: 14일, 5: 30일
CREATE OR REPLACE FUNCTION calculate_next_review(p_proficiency INTEGER)
RETURNS INTERVAL AS $$
BEGIN
    CASE p_proficiency
        WHEN 1 THEN RETURN INTERVAL '1 day';
        WHEN 2 THEN RETURN INTERVAL '3 days';
        WHEN 3 THEN RETURN INTERVAL '7 days';
        WHEN 4 THEN RETURN INTERVAL '14 days';
        WHEN 5 THEN RETURN INTERVAL '30 days';
        ELSE RETURN INTERVAL '1 day';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 진도 인덱스
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_next_review ON user_progress(user_id, next_review_at);

-- =============================================
-- 7. LEARNING_SESSIONS (학습 세션)
-- =============================================
CREATE TABLE learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    chunks_learned INTEGER DEFAULT 0,
    chunks_reviewed INTEGER DEFAULT 0,
    scenarios_completed INTEGER DEFAULT 0,
    completed_steps TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 세션 인덱스
CREATE INDEX idx_learning_sessions_user_date ON learning_sessions(user_id, date);

-- =============================================
-- 8. BADGES (배지)
-- =============================================
CREATE TABLE badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    condition_type TEXT NOT NULL, -- 'streak', 'chunks', 'sessions', 'scenarios'
    condition_value INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 배지 데이터 삽입
INSERT INTO badges (id, name, description, icon, condition_type, condition_value) VALUES
    ('first-learning', '첫 학습', '첫 번째 학습을 완료했습니다', '🎉', 'sessions', 1),
    ('streak-3', '3일 연속', '3일 연속 학습을 달성했습니다', '🔥', 'streak', 3),
    ('streak-7', '7일 연속', '7일 연속 학습을 달성했습니다', '⚡', 'streak', 7),
    ('streak-14', '2주 연속', '14일 연속 학습을 달성했습니다', '💪', 'streak', 14),
    ('streak-30', '30일 연속', '30일 연속 학습을 달성했습니다', '👑', 'streak', 30),
    ('chunks-50', '표현 50개', '50개의 표현을 학습했습니다', '📚', 'chunks', 50),
    ('chunks-100', '표현 100개', '100개의 표현을 학습했습니다', '🎯', 'chunks', 100),
    ('chunks-500', '표현 마스터', '500개의 표현을 학습했습니다', '🏆', 'chunks', 500),
    ('scenarios-10', 'AI 대화 10회', '10회의 AI 롤플레이를 완료했습니다', '🤖', 'scenarios', 10),
    ('scenarios-50', 'AI 마스터', '50회의 AI 롤플레이를 완료했습니다', '🌟', 'scenarios', 50);

-- =============================================
-- 9. USER_BADGES (사용자 배지)
-- =============================================
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- =============================================
-- 10. CHAT_HISTORY (AI 대화 기록)
-- =============================================
CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES scenarios(id) ON DELETE SET NULL,
    messages JSONB NOT NULL DEFAULT '[]',
    duration_seconds INTEGER,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TRIGGERS & FUNCTIONS
-- =============================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users 테이블 updated_at 트리거
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- user_progress 테이블 updated_at 트리거
CREATE TRIGGER trigger_user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 새 사용자 생성 시 users 테이블에 자동 삽입
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auth 사용자 생성 트리거
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 연속 학습일 업데이트 함수
CREATE OR REPLACE FUNCTION update_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_last_date DATE;
    v_today DATE := CURRENT_DATE;
    v_streak INTEGER;
    v_longest INTEGER;
BEGIN
    SELECT last_learning_date, streak_days, longest_streak
    INTO v_last_date, v_streak, v_longest
    FROM users WHERE id = p_user_id;

    IF v_last_date IS NULL OR v_last_date < v_today - INTERVAL '1 day' THEN
        -- 연속 학습 끊김 - 리셋
        v_streak := 1;
    ELSIF v_last_date = v_today - INTERVAL '1 day' THEN
        -- 연속 학습 유지
        v_streak := v_streak + 1;
    ELSIF v_last_date = v_today THEN
        -- 오늘 이미 학습함 - 변경 없음
        RETURN;
    END IF;

    -- 최장 연속 기록 업데이트
    IF v_streak > v_longest THEN
        v_longest := v_streak;
    END IF;

    UPDATE users
    SET streak_days = v_streak,
        longest_streak = v_longest,
        last_learning_date = v_today
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Users 정책
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Families 정책
CREATE POLICY "Users can view own family"
    ON families FOR SELECT
    USING (id IN (SELECT family_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can create family"
    ON families FOR INSERT
    WITH CHECK (TRUE);

-- User Progress 정책
CREATE POLICY "Users can manage own progress"
    ON user_progress FOR ALL
    USING (auth.uid() = user_id);

-- Learning Sessions 정책
CREATE POLICY "Users can manage own sessions"
    ON learning_sessions FOR ALL
    USING (auth.uid() = user_id);

-- User Badges 정책
CREATE POLICY "Users can view own badges"
    ON user_badges FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges"
    ON user_badges FOR INSERT
    WITH CHECK (TRUE);

-- Chat History 정책
CREATE POLICY "Users can manage own chat history"
    ON chat_history FOR ALL
    USING (auth.uid() = user_id);

-- Public 테이블 (읽기 전용)
CREATE POLICY "Tracks are viewable by everyone"
    ON tracks FOR SELECT
    USING (TRUE);

CREATE POLICY "Chunks are viewable by everyone"
    ON chunks FOR SELECT
    USING (TRUE);

CREATE POLICY "Scenarios are viewable by everyone"
    ON scenarios FOR SELECT
    USING (TRUE);

CREATE POLICY "Badges are viewable by everyone"
    ON badges FOR SELECT
    USING (TRUE);

-- =============================================
-- VIEWS (편의용 뷰)
-- =============================================

-- 오늘 복습할 청크 뷰
CREATE OR REPLACE VIEW due_reviews AS
SELECT
    up.user_id,
    up.chunk_id,
    c.expression,
    c.meaning,
    c.track_id,
    up.proficiency,
    up.next_review_at
FROM user_progress up
JOIN chunks c ON c.id = up.chunk_id
WHERE up.next_review_at <= NOW();

-- 사용자 통계 뷰
CREATE OR REPLACE VIEW user_stats AS
SELECT
    u.id as user_id,
    u.streak_days,
    u.longest_streak,
    u.total_learning_minutes,
    COUNT(DISTINCT up.chunk_id) FILTER (WHERE up.proficiency >= 3) as mastered_chunks,
    COUNT(DISTINCT ls.id) as total_sessions,
    COALESCE(SUM(ls.scenarios_completed), 0) as total_scenarios
FROM users u
LEFT JOIN user_progress up ON up.user_id = u.id
LEFT JOIN learning_sessions ls ON ls.user_id = u.id
GROUP BY u.id;
