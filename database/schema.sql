-- =========================================================
-- AI Adaptive Learning Platform - MVP
-- Database: PostgreSQL
-- =========================================================

-- =========================================================
-- 1. USERS
-- =========================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'student'
        CHECK (role IN ('student', 'admin')),

    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'suspended')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- 2. USER PROFILES
-- =========================================================

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id) ON DELETE CASCADE,

    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar TEXT,
    birth_date DATE,
    education_level VARCHAR(100),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- 3. COURSES
-- =========================================================

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(255) NOT NULL,
    description TEXT,

    difficulty VARCHAR(20)
        CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),

    category VARCHAR(100),

    thumbnail TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'archived')),

    created_by UUID
        REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- 4. LESSONS
-- =========================================================

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    course_id UUID NOT NULL
        REFERENCES courses(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    content TEXT,

    video_url TEXT,

    lesson_order INTEGER NOT NULL,

    estimated_time INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(course_id, lesson_order)
);


-- =========================================================
-- 5. ENROLLMENTS
-- =========================================================

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    course_id UUID NOT NULL
        REFERENCES courses(id) ON DELETE CASCADE,

    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'completed', 'dropped')),

    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    completed_at TIMESTAMPTZ,

    UNIQUE(user_id, course_id)
);


-- =========================================================
-- 6. QUIZZES
-- =========================================================

CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    lesson_id UUID NOT NULL
        REFERENCES lessons(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,

    passing_score NUMERIC(5,2) NOT NULL DEFAULT 60
        CHECK (passing_score >= 0 AND passing_score <= 100),

    time_limit INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- 7. QUIZ QUESTIONS
-- =========================================================

CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    quiz_id UUID NOT NULL
        REFERENCES quizzes(id) ON DELETE CASCADE,

    question TEXT NOT NULL,

    question_type VARCHAR(30) NOT NULL DEFAULT 'multiple_choice'
        CHECK (
            question_type IN (
                'multiple_choice',
                'true_false'
            )
        ),

    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,

    correct_answer VARCHAR(10) NOT NULL,

    difficulty VARCHAR(20) NOT NULL DEFAULT 'medium'
        CHECK (
            difficulty IN (
                'easy',
                'medium',
                'hard'
            )
        ),

    question_order INTEGER NOT NULL DEFAULT 1
);


-- =========================================================
-- 8. QUIZ ATTEMPTS
-- =========================================================

CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    quiz_id UUID NOT NULL
        REFERENCES quizzes(id) ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    score NUMERIC(5,2)
        CHECK (score >= 0 AND score <= 100),

    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    finished_at TIMESTAMPTZ,

    attempt_no INTEGER NOT NULL DEFAULT 1
);


-- =========================================================
-- 9. QUIZ ANSWERS
-- =========================================================

CREATE TABLE quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    attempt_id UUID NOT NULL
        REFERENCES quiz_attempts(id) ON DELETE CASCADE,

    question_id UUID NOT NULL
        REFERENCES quiz_questions(id) ON DELETE CASCADE,

    selected_answer VARCHAR(10),

    is_correct BOOLEAN,

    time_used INTEGER,

    UNIQUE(attempt_id, question_id)
);


-- =========================================================
-- 10. LEARNING PROGRESS
-- =========================================================

CREATE TABLE learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    lesson_id UUID NOT NULL
        REFERENCES lessons(id) ON DELETE CASCADE,

    status VARCHAR(20) NOT NULL DEFAULT 'not_started'
        CHECK (
            status IN (
                'not_started',
                'in_progress',
                'completed'
            )
        ),

    progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0
        CHECK (
            progress_percent >= 0
            AND progress_percent <= 100
        ),

    last_accessed TIMESTAMPTZ,

    completed_at TIMESTAMPTZ,

    UNIQUE(user_id, lesson_id)
);


-- =========================================================
-- 11. AI RECOMMENDATIONS
-- =========================================================

CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    recommendation_type VARCHAR(30) NOT NULL
        CHECK (
            recommendation_type IN (
                'lesson',
                'quiz',
                'review'
            )
        ),

    reference_id UUID NOT NULL,

    reason TEXT,

    confidence_score NUMERIC(5,4)
        CHECK (
            confidence_score >= 0
            AND confidence_score <= 1
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- 12. LEARNING ANALYTICS
-- =========================================================

CREATE TABLE learning_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id) ON DELETE CASCADE,

    average_score NUMERIC(5,2) DEFAULT 0,

    completion_rate NUMERIC(5,2) DEFAULT 0,

    study_time INTEGER DEFAULT 0,

    weak_topic TEXT,

    strong_topic TEXT,

    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX idx_courses_created_by
    ON courses(created_by);

CREATE INDEX idx_lessons_course_id
    ON lessons(course_id);

CREATE INDEX idx_enrollments_user_id
    ON enrollments(user_id);

CREATE INDEX idx_enrollments_course_id
    ON enrollments(course_id);

CREATE INDEX idx_quizzes_lesson_id
    ON quizzes(lesson_id);

CREATE INDEX idx_questions_quiz_id
    ON quiz_questions(quiz_id);

CREATE INDEX idx_attempts_user_id
    ON quiz_attempts(user_id);

CREATE INDEX idx_attempts_quiz_id
    ON quiz_attempts(quiz_id);

CREATE INDEX idx_answers_attempt_id
    ON quiz_answers(attempt_id);

CREATE INDEX idx_progress_user_id
    ON learning_progress(user_id);

CREATE INDEX idx_progress_lesson_id
    ON learning_progress(lesson_id);

CREATE INDEX idx_ai_recommendations_user_id
    ON ai_recommendations(user_id);


-- =========================================================
-- UPDATED_AT TRIGGER
-- =========================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER courses_updated_at
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();