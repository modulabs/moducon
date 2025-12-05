-- =============================================
-- 필수 확장 설치
-- =============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- 동기화 인프라: uuid_v7 및 CDC 함수들
-- (myapp DB에서 가져온 동일한 구현)
-- =============================================

-- uuid_v7 함수 생성
CREATE OR REPLACE FUNCTION public.uuid_v7()
RETURNS uuid
LANGUAGE plpgsql
AS $function$
  DECLARE
    v_time BIGINT;
    v_bytes BYTEA;
  BEGIN
    v_time := EXTRACT(EPOCH FROM clock_timestamp()) * 1000;
    v_bytes := decode(lpad(to_hex(v_time), 12, '0'), 'hex') || gen_random_bytes(10);
    -- version 7 설정
    v_bytes := set_byte(v_bytes, 6, (get_byte(v_bytes, 6) & 15) | 112);
    -- variant 설정
    v_bytes := set_byte(v_bytes, 8, (get_byte(v_bytes, 8) & 63) | 128);
    RETURN encode(v_bytes, 'hex')::uuid;
  END;
$function$;

-- 동기화 상태 테이블
CREATE TABLE IF NOT EXISTS sync_status (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- 동기화 큐 테이블
CREATE TABLE IF NOT EXISTS sync_queue (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    row_id UUID NOT NULL,
    operation TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE(table_name, row_id)
);
CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue(created_at);

-- updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
  END;
$function$;

-- 동기화 큐 트리거 함수
CREATE OR REPLACE FUNCTION public.sync_queue_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    IF EXISTS (SELECT 1 FROM sync_status WHERE key = 'is_syncing' AND value = 'true') THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    IF TG_OP = 'DELETE' THEN
        INSERT INTO sync_queue (table_name, row_id, operation)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP)
        ON CONFLICT (table_name, row_id) DO UPDATE SET
            operation = EXCLUDED.operation,
            created_at = NOW();
        RETURN OLD;
    ELSE
        INSERT INTO sync_queue (table_name, row_id, operation)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP)
        ON CONFLICT (table_name, row_id) DO UPDATE SET
            operation = EXCLUDED.operation,
            created_at = NOW();
        RETURN NEW;
    END IF;
END;
$function$;

-- add_sync_trigger 헬퍼 함수
CREATE OR REPLACE FUNCTION public.add_sync_trigger(target_table text)
RETURNS void
LANGUAGE plpgsql
AS $function$
  BEGIN
      -- sync_queue 트리거
      EXECUTE format('
          DROP TRIGGER IF EXISTS sync_trigger ON %I;
          CREATE TRIGGER sync_trigger
          AFTER INSERT OR UPDATE OR DELETE ON %I
          FOR EACH ROW EXECUTE FUNCTION sync_queue_trigger();
      ', target_table, target_table);

      -- updated_at 자동 갱신 트리거
      EXECUTE format('
          DROP TRIGGER IF EXISTS update_timestamp ON %I;
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE ON %I
          FOR EACH ROW EXECUTE FUNCTION update_timestamp();
      ', target_table, target_table);
  END;
$function$;

-- =============================================
-- 테이블 기본값 설정 및 updated_at 컬럼 추가
-- =============================================

-- AlterTable: admins
ALTER TABLE "admins" ALTER COLUMN "id" SET DEFAULT uuid_v7();
ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: auth_sessions
ALTER TABLE "auth_sessions" ALTER COLUMN "id" SET DEFAULT uuid_v7();
ALTER TABLE "auth_sessions" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: signatures
ALTER TABLE "signatures" ALTER COLUMN "id" SET DEFAULT uuid_v7();
ALTER TABLE "signatures" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: users
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT uuid_v7();
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "user_checkins" (
    "id" UUID NOT NULL DEFAULT uuid_v7(),
    "user_id" UUID NOT NULL,
    "target_type" VARCHAR(20) NOT NULL,
    "target_id" VARCHAR(50) NOT NULL,
    "checked_in_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" UUID NOT NULL DEFAULT uuid_v7(),
    "target_type" VARCHAR(20) NOT NULL,
    "target_id" VARCHAR(50) NOT NULL,
    "question" TEXT NOT NULL,
    "options" VARCHAR(255)[],
    "correct_answer" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_quiz_attempts" (
    "id" UUID NOT NULL DEFAULT uuid_v7(),
    "user_id" UUID NOT NULL,
    "quiz_id" UUID NOT NULL,
    "answer" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "attempted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT uuid_v7(),
    "code" VARCHAR(20) NOT NULL,
    "track" VARCHAR(50) NOT NULL,
    "location" VARCHAR(100) NOT NULL,
    "time_slot" VARCHAR(50) NOT NULL,
    "speaker_name" VARCHAR(200) NOT NULL,
    "speaker_org" VARCHAR(500),
    "speaker_bio" TEXT,
    "speaker_profile_url" TEXT,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "keywords" VARCHAR(100)[],
    "page_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booths" (
    "id" UUID NOT NULL DEFAULT uuid_v7(),
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "organization" VARCHAR(200),
    "org_type" VARCHAR(50),
    "description" TEXT,
    "booth_description" TEXT,
    "hashtags" VARCHAR(100)[],
    "solutions" TEXT,
    "core_tech" TEXT,
    "research_goals" TEXT,
    "main_products" TEXT,
    "demo_content" TEXT,
    "image_url" TEXT,
    "manager_name" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posters" (
    "id" UUID NOT NULL DEFAULT uuid_v7(),
    "code" VARCHAR(20) NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT,
    "researcher" VARCHAR(200),
    "affiliation" VARCHAR(300),
    "hashtags" VARCHAR(100)[],
    "presentation_time" VARCHAR(100),
    "location" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL DEFAULT uuid_v7(),
    "user_id" UUID NOT NULL,
    "target_type" VARCHAR(20) NOT NULL,
    "target_id" VARCHAR(50) NOT NULL,
    "content" TEXT NOT NULL,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "is_answered" BOOLEAN NOT NULL DEFAULT false,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_likes" (
    "id" UUID NOT NULL DEFAULT uuid_v7(),
    "question_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_answers" (
    "id" UUID NOT NULL DEFAULT uuid_v7(),
    "question_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "answered_by" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorites" (
    "id" UUID NOT NULL DEFAULT uuid_v7(),
    "user_id" UUID NOT NULL,
    "target_type" VARCHAR(20) NOT NULL,
    "target_id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_checkins_user" ON "user_checkins"("user_id");

-- CreateIndex
CREATE INDEX "idx_checkins_target" ON "user_checkins"("target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_checkins_user_id_target_type_target_id_key" ON "user_checkins"("user_id", "target_type", "target_id");

-- CreateIndex
CREATE INDEX "idx_quiz_target" ON "quizzes"("target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_target_type_target_id_key" ON "quizzes"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "idx_attempts_user" ON "user_quiz_attempts"("user_id");

-- CreateIndex
CREATE INDEX "idx_attempts_quiz" ON "user_quiz_attempts"("quiz_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_code_key" ON "sessions"("code");

-- CreateIndex
CREATE INDEX "idx_sessions_track" ON "sessions"("track");

-- CreateIndex
CREATE INDEX "idx_sessions_code" ON "sessions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "booths_code_key" ON "booths"("code");

-- CreateIndex
CREATE INDEX "idx_booths_code" ON "booths"("code");

-- CreateIndex
CREATE UNIQUE INDEX "posters_code_key" ON "posters"("code");

-- CreateIndex
CREATE INDEX "idx_posters_code" ON "posters"("code");

-- CreateIndex
CREATE INDEX "idx_questions_target" ON "questions"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "idx_questions_user" ON "questions"("user_id");

-- CreateIndex
CREATE INDEX "idx_questions_created" ON "questions"("created_at");

-- CreateIndex
CREATE INDEX "idx_likes_question" ON "question_likes"("question_id");

-- CreateIndex
CREATE INDEX "idx_likes_user" ON "question_likes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "question_likes_question_id_user_id_key" ON "question_likes"("question_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "question_answers_question_id_key" ON "question_answers"("question_id");

-- CreateIndex
CREATE INDEX "idx_favorites_user" ON "user_favorites"("user_id");

-- CreateIndex
CREATE INDEX "idx_favorites_target" ON "user_favorites"("target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorites_user_id_target_type_target_id_key" ON "user_favorites"("user_id", "target_type", "target_id");

-- AddForeignKey
ALTER TABLE "user_checkins" ADD CONSTRAINT "user_checkins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quiz_attempts" ADD CONSTRAINT "user_quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quiz_attempts" ADD CONSTRAINT "user_quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_likes" ADD CONSTRAINT "question_likes_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_likes" ADD CONSTRAINT "question_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =============================================
-- 동기화 트리거 적용 (양방향 CDC)
-- =============================================
SELECT add_sync_trigger('users');
SELECT add_sync_trigger('auth_sessions');
SELECT add_sync_trigger('signatures');
SELECT add_sync_trigger('admins');
SELECT add_sync_trigger('user_checkins');
SELECT add_sync_trigger('quizzes');
SELECT add_sync_trigger('user_quiz_attempts');
SELECT add_sync_trigger('sessions');
SELECT add_sync_trigger('booths');
SELECT add_sync_trigger('posters');
SELECT add_sync_trigger('questions');
SELECT add_sync_trigger('question_likes');
SELECT add_sync_trigger('question_answers');
SELECT add_sync_trigger('user_favorites');
