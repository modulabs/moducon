# 06_DB_DESIGN.md - 데이터베이스 설계서

## 📋 문서 정보

**프로젝트명**: 모두콘 2025 디지털 컨퍼런스 북
**문서 버전**: 1.0
**작성일**: 2025-01-14
**작성자**: Technical Lead
**Database**: PostgreSQL 14+

---

## 🎯 설계 개요

### 설계 원칙
1. **정규화**: 3NF(Third Normal Form)까지 정규화
2. **인덱싱**: 자주 쿼리되는 컬럼에 인덱스 생성
3. **확장성**: UUID 기반 Primary Key로 분산 확장 대비
4. **성능**: 적절한 인덱스 및 파티셔닝 고려
5. **데이터 무결성**: Foreign Key 제약 조건 활용

### 기술 스택
- **RDBMS**: PostgreSQL 14+
- **ORM**: Prisma (Node.js) 또는 SQLAlchemy (Python)
- **Migration**: Prisma Migrate 또는 Alembic

---

## 📊 ERD (Entity Relationship Diagram)

### 주요 엔티티 관계

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    Users    │◄────────│   Checkins   │────────►│  Sessions   │
└─────────────┘         └──────────────┘         └─────────────┘
       │
       │
       │                ┌──────────────┐
       └───────────────►│BoothVisits   │◄───────┐
       │                └──────────────┘        │
       │                       │                │
       │                       ▼                │
       │                ┌──────────────┐        │
       │                │    Booths    │────────┘
       │                └──────────────┘
       │
       │                ┌──────────────┐
       ├───────────────►│    Quests    │
       │                └──────────────┘
       │                       │
       │                       ▼
       │                ┌──────────────┐
       │                │   Papers     │
       │                └──────────────┘
       │                       │
       │                       ▼
       │                ┌──────────────┐
       ├───────────────►│QuizAttempts  │
       │                └──────────────┘
       │
       │                ┌──────────────┐
       ├───────────────►│ Activities   │
       │                └──────────────┘
       │
       │                ┌──────────────┐
       ├───────────────►│  UserBadges  │◄───────┐
       │                └──────────────┘        │
       │                                        │
       │                ┌──────────────┐        │
       │                │    Badges    │────────┘
       │                └──────────────┘
       │
       │                ┌──────────────┐
       └───────────────►│ProfileExch.  │
                        └──────────────┘
```

---

## 📋 테이블 스키마

### 1. users (사용자)

**설명**: 참가자 정보

```sql
CREATE TABLE users (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 필수 정보 (인증용)
  name VARCHAR(100) NOT NULL,
  phone_last4 VARCHAR(4) NOT NULL,

  -- 선택 정보
  email VARCHAR(255),
  organization VARCHAR(255),
  role VARCHAR(100),
  bio TEXT,

  -- 관심사 (배열)
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- 서명
  signature_url TEXT,

  -- 프로필 설정
  privacy_settings JSONB DEFAULT '{"emailVisible": false, "socialLinksVisible": true}'::JSONB,
  social_links JSONB DEFAULT '{}'::JSONB,

  -- 메타 정보
  registration_type VARCHAR(20) NOT NULL DEFAULT 'pre_registered',
    -- 'pre_registered' | 'onsite'

  -- 타임스탬프
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,

  -- 상태
  is_active BOOLEAN DEFAULT TRUE,

  -- 제약 조건
  CONSTRAINT unique_user UNIQUE(name, phone_last4),
  CONSTRAINT check_registration_type CHECK (
    registration_type IN ('pre_registered', 'onsite')
  )
);

-- 인덱스
CREATE INDEX idx_users_name_phone ON users(name, phone_last4);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_registered_at ON users(registered_at);
```

---

### 2. sessions_tracks (세션)

**설명**: 6개 트랙의 세션 정보

```sql
CREATE TABLE sessions_tracks (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 트랙 정보
  track_number INT NOT NULL CHECK (track_number BETWEEN 1 AND 6),

  -- 세션 정보
  title VARCHAR(255) NOT NULL,
  speaker VARCHAR(100),
  speaker_bio TEXT,
  description TEXT,

  -- 시간 & 장소
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(100),

  -- 난이도 & 태그
  difficulty VARCHAR(20) DEFAULT 'intermediate',
    -- 'beginner' | 'intermediate' | 'advanced'
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- 자료
  materials JSONB DEFAULT '[]'::JSONB,
    -- [{"type": "pdf", "url": "...", "title": "..."}]

  -- 수용 인원
  max_capacity INT DEFAULT 100,

  -- QR 코드
  qr_code TEXT UNIQUE,

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 제약 조건
  CONSTRAINT check_difficulty CHECK (
    difficulty IN ('beginner', 'intermediate', 'advanced')
  ),
  CONSTRAINT check_time_order CHECK (start_time < end_time)
);

-- 인덱스
CREATE INDEX idx_sessions_track ON sessions_tracks(track_number);
CREATE INDEX idx_sessions_time ON sessions_tracks(start_time, end_time);
CREATE INDEX idx_sessions_tags ON sessions_tracks USING GIN(tags);
CREATE INDEX idx_sessions_qr ON sessions_tracks(qr_code);
```

---

### 3. checkins (세션 체크인)

**설명**: 세션 참석 기록

```sql
CREATE TABLE checkins (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions_tracks(id) ON DELETE CASCADE,

  -- 체크인/아웃 시간
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checked_out_at TIMESTAMP WITH TIME ZONE,

  -- 체류 시간 (자동 계산)
  duration_minutes INT GENERATED ALWAYS AS (
    CASE
      WHEN checked_out_at IS NOT NULL THEN
        EXTRACT(EPOCH FROM (checked_out_at - checked_in_at))::INT / 60
      ELSE NULL
    END
  ) STORED,

  -- 제약 조건
  CONSTRAINT unique_checkin UNIQUE(user_id, session_id),
  CONSTRAINT check_checkout_after_checkin CHECK (
    checked_out_at IS NULL OR checked_out_at > checked_in_at
  )
);

-- 인덱스
CREATE INDEX idx_checkins_user ON checkins(user_id);
CREATE INDEX idx_checkins_session ON checkins(session_id);
CREATE INDEX idx_checkins_time ON checkins(checked_in_at);
```

---

### 4. booths (부스)

**설명**: LAB 부스 정보

```sql
CREATE TABLE booths (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 부스 정보
  name VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  description TEXT,
  demo_description TEXT,

  -- 기술 태그
  tech_tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- 위치 (지도 좌표)
  location_x FLOAT,
  location_y FLOAT,
  location_zone VARCHAR(10), -- 'A', 'B', 'C' 등

  -- 예상 소요 시간
  estimated_duration_minutes INT DEFAULT 15,

  -- 미디어
  image_url TEXT,
  video_url TEXT,

  -- 부스 타입
  booth_type VARCHAR(20) DEFAULT 'lab',
    -- 'lab' | 'sponsor' | 'community'

  -- 수용 인원
  max_capacity INT DEFAULT 20,

  -- QR 코드
  qr_code TEXT UNIQUE,

  -- 연락처
  contact_info JSONB DEFAULT '{}'::JSONB,

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 제약 조건
  CONSTRAINT check_booth_type CHECK (
    booth_type IN ('lab', 'sponsor', 'community')
  )
);

-- 인덱스
CREATE INDEX idx_booths_tags ON booths USING GIN(tech_tags);
CREATE INDEX idx_booths_location ON booths(location_x, location_y);
CREATE INDEX idx_booths_type ON booths(booth_type);
CREATE INDEX idx_booths_qr ON booths(qr_code);
```

---

### 5. booth_visits (부스 방문)

**설명**: 부스 방문 기록

```sql
CREATE TABLE booth_visits (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booth_id UUID NOT NULL REFERENCES booths(id) ON DELETE CASCADE,

  -- 방문 시간
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 제약 조건
  CONSTRAINT unique_visit UNIQUE(user_id, booth_id)
);

-- 인덱스
CREATE INDEX idx_booth_visits_user ON booth_visits(user_id);
CREATE INDEX idx_booth_visits_booth ON booth_visits(booth_id);
CREATE INDEX idx_booth_visits_time ON booth_visits(visited_at);
```

---

### 6. papers (논문)

**설명**: 페이퍼샵 논문 정보

```sql
CREATE TABLE papers (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 논문 정보
  title VARCHAR(255) NOT NULL,
  authors TEXT[] NOT NULL,
  organization VARCHAR(255),
  abstract TEXT,
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- 파일 & 이미지
  pdf_url TEXT,
  poster_image_url TEXT,

  -- QR 코드
  qr_code TEXT UNIQUE,

  -- Q&A 시간
  qa_available_time VARCHAR(50), -- "14:00 - 16:00"

  -- 저자 연락처
  author_contacts JSONB DEFAULT '[]'::JSONB,
    -- [{"name": "...", "email": "..."}]

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_papers_keywords ON papers USING GIN(keywords);
CREATE INDEX idx_papers_title ON papers USING GIN(to_tsvector('korean', title));
CREATE INDEX idx_papers_qr ON papers(qr_code);
```

---

### 7. paper_quizzes (논문 퀴즈)

**설명**: 논문별 퀴즈 문제

```sql
CREATE TABLE paper_quizzes (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,

  -- 문제 정보
  question TEXT NOT NULL,
  options JSONB NOT NULL,
    -- [{"id": "a", "text": "...", "isCorrect": true}]
  explanation TEXT,

  -- 순서
  order_index INT NOT NULL,

  -- 제약 조건
  CONSTRAINT unique_paper_quiz_order UNIQUE(paper_id, order_index)
);

-- 인덱스
CREATE INDEX idx_paper_quizzes_paper ON paper_quizzes(paper_id);
```

---

### 8. quiz_attempts (퀴즈 시도)

**설명**: 사용자 퀴즈 시도 기록

```sql
CREATE TABLE quiz_attempts (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,

  -- 점수
  score INT NOT NULL,
  total_questions INT NOT NULL,
  passed BOOLEAN DEFAULT FALSE,

  -- 답안 상세
  answers JSONB DEFAULT '[]'::JSONB,
    -- [{"questionId": "q1", "selectedOption": "a", "correct": true}]

  -- 완료 시간
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 제약 조건
  CONSTRAINT unique_quiz_attempt UNIQUE(user_id, paper_id),
  CONSTRAINT check_score_range CHECK (score >= 0 AND score <= total_questions)
);

-- 인덱스
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_paper ON quiz_attempts(paper_id);
CREATE INDEX idx_quiz_attempts_passed ON quiz_attempts(passed);
```

---

### 9. quests (퀘스트)

**설명**: 개인화 퀘스트

```sql
CREATE TABLE quests (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 퀘스트 타입
  quest_type VARCHAR(20) NOT NULL DEFAULT 'main',
    -- 'main' | 'hidden'

  -- 목표 (부스 또는 논문)
  target_type VARCHAR(20) NOT NULL,
    -- 'booth' | 'paper' | 'location'
  target_id UUID,
    -- booths.id 또는 papers.id

  -- 순서
  order_index INT NOT NULL,

  -- 완료 여부
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 제약 조건
  CONSTRAINT check_quest_type CHECK (
    quest_type IN ('main', 'hidden')
  ),
  CONSTRAINT check_target_type CHECK (
    target_type IN ('booth', 'paper', 'location')
  ),
  CONSTRAINT unique_user_quest_order UNIQUE(user_id, order_index)
);

-- 인덱스
CREATE INDEX idx_quests_user ON quests(user_id);
CREATE INDEX idx_quests_completed ON quests(user_id, is_completed);
CREATE INDEX idx_quests_target ON quests(target_type, target_id);
```

---

### 10. activities (활동 기록)

**설명**: 사용자 활동 로그

```sql
CREATE TABLE activities (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 활동 타입
  activity_type VARCHAR(50) NOT NULL,
    -- 'session_checkin' | 'booth_visit' | 'quest_complete' | 'profile_exchange' | 'quiz_complete'

  -- 활동 상세 데이터 (JSON)
  activity_data JSONB DEFAULT '{}'::JSONB,
    -- {"sessionId": "...", "sessionTitle": "..."}
    -- {"boothId": "...", "boothName": "..."}

  -- 포인트
  points_earned INT DEFAULT 0,

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 제약 조건
  CONSTRAINT check_points_non_negative CHECK (points_earned >= 0)
);

-- 인덱스
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_time ON activities(created_at DESC);
```

---

### 11. badges (배지 정의)

**설명**: 배지 종류 정의

```sql
CREATE TABLE badges (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 배지 정보
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,

  -- 획득 조건 (JSON)
  criteria JSONB NOT NULL,
    -- {"type": "quest_completion", "required": "all"}
    -- {"type": "paper_visits", "required": 5}

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_badges_name ON badges(name);
```

---

### 12. user_badges (사용자 배지)

**설명**: 사용자가 획득한 배지

```sql
CREATE TABLE user_badges (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,

  -- 획득 시간
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 제약 조건
  CONSTRAINT unique_user_badge UNIQUE(user_id, badge_id)
);

-- 인덱스
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);
```

---

### 13. profile_exchanges (프로필 교환)

**설명**: 참가자 간 프로필 교환 기록

```sql
CREATE TABLE profile_exchanges (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exchanged_with_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 교환 시간 & 장소
  exchanged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location VARCHAR(100),

  -- 제약 조건
  CONSTRAINT unique_exchange UNIQUE(user_id, exchanged_with_user_id),
  CONSTRAINT check_different_users CHECK (user_id != exchanged_with_user_id)
);

-- 인덱스
CREATE INDEX idx_profile_exchanges_user ON profile_exchanges(user_id);
CREATE INDEX idx_profile_exchanges_time ON profile_exchanges(exchanged_at);
```

---

### 14. congestion_logs (혼잡도 로그)

**설명**: 실시간 혼잡도 기록

```sql
CREATE TABLE congestion_logs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 공간 정보
  space_type VARCHAR(20) NOT NULL,
    -- 'session' | 'booth' | 'papershop' | 'foodzone'
  space_id UUID NOT NULL,
    -- sessions_tracks.id 또는 booths.id 등

  -- 혼잡도 정보
  current_count INT NOT NULL DEFAULT 0,
  max_capacity INT NOT NULL,
  congestion_level VARCHAR(20) NOT NULL,
    -- 'low' | 'medium' | 'high' | 'full'
  percentage INT GENERATED ALWAYS AS (
    CASE
      WHEN max_capacity > 0 THEN (current_count * 100 / max_capacity)
      ELSE 0
    END
  ) STORED,

  -- 타임스탬프
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 제약 조건
  CONSTRAINT check_space_type CHECK (
    space_type IN ('session', 'booth', 'papershop', 'foodzone')
  ),
  CONSTRAINT check_congestion_level CHECK (
    congestion_level IN ('low', 'medium', 'high', 'full')
  ),
  CONSTRAINT check_counts CHECK (
    current_count >= 0 AND max_capacity > 0 AND current_count <= max_capacity
  )
);

-- 인덱스
CREATE INDEX idx_congestion_space ON congestion_logs(space_type, space_id);
CREATE INDEX idx_congestion_time ON congestion_logs(logged_at DESC);

-- 파티셔닝 (옵션: 시간별 파티셔닝으로 성능 개선)
-- CREATE TABLE congestion_logs_2025_12_13 PARTITION OF congestion_logs
-- FOR VALUES FROM ('2025-12-13') TO ('2025-12-14');
```

---

### 15. rewards (보상)

**설명**: 퀘스트 완료 보상

```sql
CREATE TABLE rewards (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 보상 타입
  reward_type VARCHAR(50) NOT NULL,
    -- 'badge_physical' | 'certificate' | 'sourcecode'

  -- 수령 여부
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP WITH TIME ZONE,

  -- QR 서명 (검증용)
  qr_signature TEXT,

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 제약 조건
  CONSTRAINT check_reward_type CHECK (
    reward_type IN ('badge_physical', 'certificate', 'sourcecode')
  )
);

-- 인덱스
CREATE INDEX idx_rewards_user ON rewards(user_id);
CREATE INDEX idx_rewards_claimed ON rewards(is_claimed);
```

---

### 16. notifications (알림)

**설명**: 사용자 알림

```sql
CREATE TABLE notifications (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 알림 타입
  type VARCHAR(50) NOT NULL,
    -- 'session' | 'quest' | 'congestion' | 'event'

  -- 알림 내용
  title VARCHAR(255) NOT NULL,
  message TEXT,

  -- 관련 데이터 (JSON)
  data JSONB DEFAULT '{}'::JSONB,

  -- 읽음 여부
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 제약 조건
  CONSTRAINT check_notification_type CHECK (
    type IN ('session', 'quest', 'congestion', 'event')
  )
);

-- 인덱스
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_time ON notifications(created_at DESC);
```

---

## 🔧 뷰 (Views)

### 1. user_stats (사용자 통계)

**설명**: 사용자별 활동 통계 집계

```sql
CREATE VIEW user_stats AS
SELECT
  u.id AS user_id,
  u.name,

  -- 세션 참석
  (SELECT COUNT(*) FROM checkins WHERE user_id = u.id) AS sessions_attended,

  -- 부스 방문
  (SELECT COUNT(*) FROM booth_visits WHERE user_id = u.id) AS booths_visited,

  -- 퀴즈 완료
  (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = u.id AND passed = TRUE) AS quizzes_completed,

  -- 퀘스트 완료
  (SELECT COUNT(*) FROM quests WHERE user_id = u.id AND is_completed = TRUE) AS quests_completed,

  -- 총 퀘스트
  (SELECT COUNT(*) FROM quests WHERE user_id = u.id) AS total_quests,

  -- 프로필 교환
  (SELECT COUNT(*) FROM profile_exchanges WHERE user_id = u.id) AS profiles_exchanged,

  -- 총 포인트
  (SELECT COALESCE(SUM(points_earned), 0) FROM activities WHERE user_id = u.id) AS total_points,

  -- 배지 획득
  (SELECT COUNT(*) FROM user_badges WHERE user_id = u.id) AS badges_earned

FROM users u
WHERE u.is_active = TRUE;
```

---

### 2. booth_popularity (부스 인기도)

**설명**: 부스별 방문 통계

```sql
CREATE VIEW booth_popularity AS
SELECT
  b.id AS booth_id,
  b.name,
  b.organization,
  COUNT(bv.id) AS visit_count,

  -- 시간대별 방문 분포 (JSON)
  jsonb_object_agg(
    EXTRACT(HOUR FROM bv.visited_at)::TEXT,
    COUNT(bv.id)
  ) AS visits_by_hour

FROM booths b
LEFT JOIN booth_visits bv ON b.id = bv.booth_id
GROUP BY b.id, b.name, b.organization
ORDER BY visit_count DESC;
```

---

### 3. realtime_congestion (실시간 혼잡도)

**설명**: 최신 혼잡도 데이터

```sql
CREATE VIEW realtime_congestion AS
SELECT DISTINCT ON (space_type, space_id)
  id,
  space_type,
  space_id,
  current_count,
  max_capacity,
  congestion_level,
  percentage,
  logged_at
FROM congestion_logs
ORDER BY space_type, space_id, logged_at DESC;
```

---

## 🔒 보안 & 권한

### Row Level Security (RLS)

PostgreSQL RLS를 활용한 사용자별 데이터 격리 (선택 사항):

```sql
-- 사용자는 자신의 데이터만 조회 가능
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY activities_user_policy ON activities
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::UUID);
```

---

## 📈 성능 최적화

### 1. 파티셔닝

**congestion_logs 테이블 시간별 파티셔닝**:

```sql
CREATE TABLE congestion_logs (
  -- (기존 스키마)
) PARTITION BY RANGE (logged_at);

CREATE TABLE congestion_logs_2025_12_13 PARTITION OF congestion_logs
FOR VALUES FROM ('2025-12-13 00:00:00') TO ('2025-12-14 00:00:00');

-- 행사 전에 파티션 미리 생성
```

---

### 2. 인덱스 전략

#### 복합 인덱스
```sql
-- 자주 함께 쿼리되는 컬럼
CREATE INDEX idx_quests_user_completed ON quests(user_id, is_completed);
CREATE INDEX idx_checkins_user_session ON checkins(user_id, session_id);
```

#### 부분 인덱스
```sql
-- 특정 조건의 행만 인덱싱
CREATE INDEX idx_notifications_unread ON notifications(user_id)
WHERE is_read = FALSE;
```

#### GIN 인덱스
```sql
-- 배열 및 JSONB 검색 최적화
CREATE INDEX idx_users_interests ON users USING GIN(interests);
CREATE INDEX idx_booths_tags ON booths USING GIN(tech_tags);
CREATE INDEX idx_activities_data ON activities USING GIN(activity_data);
```

---

### 3. 쿼리 최적화

#### 자주 사용하는 쿼리

**사용자 통계 조회**:
```sql
-- user_stats 뷰 활용
SELECT * FROM user_stats WHERE user_id = $1;
```

**실시간 혼잡도 조회**:
```sql
-- realtime_congestion 뷰 활용
SELECT * FROM realtime_congestion
WHERE space_type = 'booth' AND space_id = $1;
```

**퀘스트 진행 상황**:
```sql
SELECT
  COUNT(*) FILTER (WHERE is_completed = TRUE) AS completed,
  COUNT(*) AS total,
  (COUNT(*) FILTER (WHERE is_completed = TRUE)::FLOAT / COUNT(*)::FLOAT * 100) AS percentage
FROM quests
WHERE user_id = $1;
```

---

## 🛠️ 마이그레이션

### Prisma Schema 예시

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name               String   @db.VarChar(100)
  phoneLast4         String   @map("phone_last4") @db.VarChar(4)
  email              String?  @db.VarChar(255)
  organization       String?  @db.VarChar(255)
  role               String?  @db.VarChar(100)
  bio                String?  @db.Text
  interests          String[] @db.Text
  signatureUrl       String?  @map("signature_url") @db.Text
  privacySettings    Json     @default("{\"emailVisible\": false}") @map("privacy_settings") @db.JsonB
  socialLinks        Json     @default("{}") @map("social_links") @db.JsonB
  registrationType   String   @default("pre_registered") @map("registration_type") @db.VarChar(20)
  registeredAt       DateTime @default(now()) @map("registered_at") @db.Timestamptz(6)
  lastLogin          DateTime? @map("last_login") @db.Timestamptz(6)
  isActive           Boolean  @default(true) @map("is_active")

  // Relations
  checkins           Checkin[]
  boothVisits        BoothVisit[]
  quests             Quest[]
  quizAttempts       QuizAttempt[]
  activities         Activity[]
  userBadges         UserBadge[]
  profileExchanges   ProfileExchange[] @relation("UserExchanges")
  receivedExchanges  ProfileExchange[] @relation("ReceivedExchanges")
  rewards            Reward[]
  notifications      Notification[]

  @@unique([name, phoneLast4], name: "unique_user")
  @@index([name, phoneLast4], name: "idx_users_name_phone")
  @@map("users")
}

// ... (나머지 모델 정의)
```

---

## 📝 초기 데이터 (Seed Data)

### badges 테이블 초기 데이터

```sql
INSERT INTO badges (name, description, icon_url, criteria) VALUES
('퀘스트 마스터', '모든 퀘스트를 완료했습니다.', '/badges/quest-master.png', '{"type": "quest_completion", "required": "all"}'::JSONB),
('페이퍼 러버', '페이퍼샵 5개 이상 방문했습니다.', '/badges/paper-lover.png', '{"type": "paper_visits", "required": 5}'::JSONB),
('네트워커', '프로필 10개 이상 교환했습니다.', '/badges/networker.png', '{"type": "profile_exchanges", "required": 10}'::JSONB),
('히든 헌터', '히든 퀘스트 3개 이상 완료했습니다.', '/badges/hidden-hunter.png', '{"type": "hidden_quests", "required": 3}'::JSONB),
('얼리버드', '첫 세션에 체크인했습니다.', '/badges/early-bird.png', '{"type": "first_session"}'::JSONB);
```

---

## 🧹 데이터 정리

### 행사 후 데이터 보존 정책

```sql
-- 개인정보 삭제 (행사 후 3개월)
UPDATE users
SET
  email = NULL,
  phone_last4 = '****',
  signature_url = NULL,
  privacy_settings = '{}',
  social_links = '{}'
WHERE registered_at < NOW() - INTERVAL '3 months';

-- 혼잡도 로그 삭제 (행사 후 1주일)
DELETE FROM congestion_logs
WHERE logged_at < NOW() - INTERVAL '1 week';
```

---

## 📊 백업 전략

### 백업 스케줄
- **풀 백업**: 행사 전일, 행사 당일 (아침)
- **증분 백업**: 행사 중 매 1시간
- **로그 아카이빙**: 실시간 WAL 아카이빙

### 백업 명령어 (예시)
```bash
# PostgreSQL 풀 백업
pg_dump -h localhost -U postgres -F c -b -v -f moducon_backup_$(date +%Y%m%d_%H%M%S).dump moducon_db

# 복원
pg_restore -h localhost -U postgres -d moducon_db -v moducon_backup.dump
```

---

## 📝 다음 단계

### 완료
- ✅ 06_DB_DESIGN.md 작성 완료

### 진행 중
- 📝 07_PROGRESS.md 업데이트
- 📝 Git commit 수행

---

**문서 상태**: ✅ 데이터베이스 설계 완료
**다음 담당자**: hands-on worker (구현 시작)
