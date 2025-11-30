# 152_DB_API_SPEC.md - Database 및 API 통합 명세

**작성일**: 2025-12-01
**작성자**: Technical Lead
**버전**: v2.0
**우선순위**: P0 (Critical)

---

## 🗄️ Database 스키마

### 개요
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 6.1.0
- **총 테이블**: 6개 (기존 3 + 신규 3)

---

### 1. 기존 테이블 (완료)

#### 1.1 users
```prisma
model User {
  id         Int       @id @default(autoincrement())
  email      String    @unique
  password   String
  name       String?
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  sessions   AuthSession[]
  signatures Signature[]
  checkins   UserCheckin[]      // 🆕 추가
  quizAttempts UserQuizAttempt[] // 🆕 추가

  @@map("users")
}
```

**설명**: 사용자 기본 정보
**현재 상태**: ✅ 완료

---

#### 1.2 auth_sessions
```prisma
model AuthSession {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@map("auth_sessions")
}
```

**설명**: JWT 토큰 세션 관리
**현재 상태**: ✅ 완료

---

#### 1.3 signatures
```prisma
model Signature {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  sessionId String   @map("session_id")
  signature String   @db.Text
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@map("signatures")
}
```

**설명**: 세션 서명 기록 (기존 기능)
**현재 상태**: ✅ 완료

---

### 2. 신규 테이블 (예정)

#### 2.1 user_checkins
```prisma
model UserCheckin {
  id           Int      @id @default(autoincrement())
  userId       Int      @map("user_id")
  targetType   String   @map("target_type") // 'session', 'booth', 'paper'
  targetId     String   @map("target_id")    // 세션/부스/포스터 ID
  checkedInAt  DateTime @default(now()) @map("checked_in_at")

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, targetType, targetId])
  @@index([userId])
  @@index([targetType, targetId])
  @@map("user_checkins")
}
```

**설명**: 세션/부스/포스터 체크인 기록
**제약조건**: 동일 사용자가 동일 타겟에 중복 체크인 불가
**인덱스**:
- `userId` (사용자별 체크인 조회)
- `targetType, targetId` (타겟별 체크인 수 조회)

**현재 상태**: ⏳ Phase 3 예정 (1시간)

---

#### 2.2 quizzes
```prisma
model Quiz {
  id         Int      @id @default(autoincrement())
  targetType String   @map("target_type") // 'session', 'booth', 'paper'
  targetId   String   @map("target_id")
  question   String   @db.Text
  answer     String   @db.VarChar(200)
  options    Json     // ['A', 'B', 'C', 'D']
  createdAt  DateTime @default(now()) @map("created_at")

  attempts UserQuizAttempt[]

  @@unique([targetType, targetId])
  @@map("quizzes")
}
```

**설명**: 체크인 시 퀴즈 (일부 세션/부스/포스터에만 적용)
**제약조건**: 동일 타겟에 퀴즈 1개만 등록 가능
**options 예시**:
```json
{
  "A": "AI/ML",
  "B": "데이터 엔지니어링",
  "C": "클라우드",
  "D": "보안"
}
```

**현재 상태**: ⏳ Phase 3 예정 (1시간)

---

#### 2.3 user_quiz_attempts
```prisma
model UserQuizAttempt {
  id          Int      @id @default(autoincrement())
  userId      Int      @map("user_id")
  quizId      Int      @map("quiz_id")
  answer      String   @db.VarChar(200)
  isCorrect   Boolean  @map("is_correct")
  attemptedAt DateTime @default(now()) @map("attempted_at")

  user User @relation(fields: [userId], references: [id])
  quiz Quiz @relation(fields: [quizId], references: [id])

  @@index([userId])
  @@index([quizId])
  @@map("user_quiz_attempts")
}
```

**설명**: 사용자의 퀴즈 답변 기록
**제약조건**: 중복 시도 허용 (1회만 정답 체크인 기록)
**인덱스**:
- `userId` (사용자별 퀴즈 기록 조회)
- `quizId` (퀴즈별 정답률 조회)

**현재 상태**: ⏳ Phase 3 예정 (1시간)

---

### 3. ERD (Entity Relationship Diagram)

```
users (1) ─────< (N) auth_sessions
  │
  ├─────< (N) signatures
  │
  ├─────< (N) user_checkins
  │
  └─────< (N) user_quiz_attempts
                     │
                     └────> (1) quizzes
```

---

## 🛤️ API 명세

### 1. 기존 API (완료)

#### 1.1 POST /api/auth/register
**설명**: 회원가입

**요청**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}
```

**응답**:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**현재 상태**: ✅ 완료

---

#### 1.2 POST /api/auth/login
**설명**: 로그인

**요청**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답**:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**현재 상태**: ✅ 완료

---

#### 1.3 POST /api/auth/logout
**설명**: 로그아웃

**요청 헤더**:
```
Authorization: Bearer {token}
```

**응답**:
```json
{
  "message": "로그아웃 성공"
}
```

**현재 상태**: ✅ 완료

---

#### 1.4 GET /api/auth/me
**설명**: 현재 사용자 조회

**요청 헤더**:
```
Authorization: Bearer {token}
```

**응답**:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동"
  }
}
```

**현재 상태**: ✅ 완료

---

### 2. 신규 API (예정)

#### 2.1 POST /api/checkin
**설명**: 체크인 기록 (퀴즈 포함)

**요청 헤더**:
```
Authorization: Bearer {token}
```

**요청 본문 (퀴즈 없는 경우)**:
```json
{
  "targetType": "session",
  "targetId": "session-1"
}
```

**요청 본문 (퀴즈 있는 경우)**:
```json
{
  "targetType": "session",
  "targetId": "session-1",
  "quizId": 1,
  "quizAnswer": "A"
}
```

**응답 (퀴즈 없는 경우)**:
```json
{
  "success": true,
  "checkin": {
    "id": 123,
    "targetType": "session",
    "targetId": "session-1",
    "checkedInAt": "2025-12-01T09:00:00Z"
  }
}
```

**응답 (퀴즈 있는 경우 - 정답)**:
```json
{
  "success": true,
  "checkin": {
    "id": 123,
    "targetType": "session",
    "targetId": "session-1",
    "checkedInAt": "2025-12-01T09:00:00Z"
  },
  "quizResult": {
    "isCorrect": true,
    "message": "정답입니다! 체크인이 완료되었습니다."
  }
}
```

**응답 (퀴즈 있는 경우 - 오답)**:
```json
{
  "success": false,
  "quizResult": {
    "isCorrect": false,
    "correctAnswer": "A",
    "message": "오답입니다. 정답은 'A'입니다."
  }
}
```

**에러**:
- `400 Bad Request`: 잘못된 요청 (targetType, targetId 누락)
- `401 Unauthorized`: 인증 실패
- `409 Conflict`: 이미 체크인 완료

**현재 상태**: ⏳ Phase 3 예정 (2시간)

---

#### 2.2 GET /api/checkin
**설명**: 현재 사용자의 체크인 내역 조회

**요청 헤더**:
```
Authorization: Bearer {token}
```

**쿼리 파라미터** (선택):
- `targetType`: 'session' | 'booth' | 'paper'

**응답**:
```json
{
  "checkins": [
    {
      "id": 123,
      "targetType": "session",
      "targetId": "session-1",
      "checkedInAt": "2025-12-01T09:00:00Z"
    },
    {
      "id": 124,
      "targetType": "booth",
      "targetId": "booth-1",
      "checkedInAt": "2025-12-01T10:00:00Z"
    }
  ],
  "stats": {
    "session": 8,
    "booth": 5,
    "paper": 12,
    "total": 25
  }
}
```

**현재 상태**: ⏳ Phase 3 예정 (1시간)

---

#### 2.3 GET /api/quiz/:quizId
**설명**: 퀴즈 조회 (체크인 전 퀴즈 표시)

**요청 헤더**:
```
Authorization: Bearer {token}
```

**응답**:
```json
{
  "quiz": {
    "id": 1,
    "question": "이 세션의 주요 주제는 무엇인가요?",
    "options": {
      "A": "AI/ML",
      "B": "데이터 엔지니어링",
      "C": "클라우드",
      "D": "보안"
    }
  }
}
```

**에러**:
- `404 Not Found`: 퀴즈가 존재하지 않음

**현재 상태**: ⏳ Phase 3 예정 (1시간)

---

#### 2.4 POST /api/quiz/:quizId/answer
**설명**: 퀴즈 답변 제출 (체크인 없이 답변만)

**요청 헤더**:
```
Authorization: Bearer {token}
```

**요청 본문**:
```json
{
  "answer": "A"
}
```

**응답**:
```json
{
  "isCorrect": true,
  "message": "정답입니다!"
}
```

**에러**:
- `400 Bad Request`: 답변 누락
- `404 Not Found`: 퀴즈가 존재하지 않음

**현재 상태**: ⏳ Phase 3 예정 (1시간)

---

#### 2.5 GET /api/my-page/stats
**설명**: 마이페이지 통계 조회

**요청 헤더**:
```
Authorization: Bearer {token}
```

**응답**:
```json
{
  "user": {
    "id": 1,
    "name": "홍길동",
    "email": "user@example.com"
  },
  "stats": {
    "session": {
      "checked": 8,
      "total": 32,
      "percentage": 25
    },
    "booth": {
      "checked": 5,
      "total": 12,
      "percentage": 42
    },
    "paper": {
      "checked": 12,
      "total": 33,
      "percentage": 36
    }
  },
  "badges": [
    {
      "id": "session-explorer",
      "name": "세션 탐험가",
      "description": "5개 이상 세션 참여",
      "icon": "🎓"
    },
    {
      "id": "quiz-master",
      "name": "퀴즈 마스터",
      "description": "퀴즈 5개 정답",
      "icon": "🏆"
    }
  ],
  "recentCheckins": [
    {
      "targetType": "session",
      "targetId": "session-1",
      "checkedInAt": "2025-12-01T09:00:00Z"
    }
  ]
}
```

**현재 상태**: ⏳ Phase 4 예정 (1시간)

---

## 📊 API 응답 시간 목표

### 성능 지표
- **인증 API**: < 200ms
- **체크인 API**: < 300ms
- **퀴즈 API**: < 200ms
- **마이페이지 API**: < 500ms

### 캐싱 전략
- **프론트엔드**: localStorage (5분 만료)
- **백엔드**: 없음 (실시간 데이터)

---

## 🔒 보안

### 인증
- **방식**: JWT (JSON Web Token)
- **만료 시간**: 1시간
- **갱신**: 재로그인 필요

### 권한
- **일반 사용자**: 본인의 체크인/퀴즈만 조회 가능
- **관리자**: 없음 (현재 버전)

### SQL Injection 방지
- **Prisma ORM**: 자동 파라미터화

### XSS 방지
- **React**: 기본 XSS 보호

---

## 📝 마이그레이션 계획

### 1. Prisma 스키마 업데이트
```bash
# 1. schema.prisma 수정
# 2. 마이그레이션 생성
npx prisma migrate dev --name add_checkin_quiz_tables

# 3. 마이그레이션 적용
npx prisma migrate deploy
```

### 2. 시드 데이터 추가
```typescript
// prisma/seed.ts
const quizzes = [
  {
    targetType: 'session',
    targetId: 'session-1',
    question: '이 세션의 주요 주제는?',
    answer: 'A',
    options: {
      A: 'AI/ML',
      B: '데이터 엔지니어링',
      C: '클라우드',
      D: '보안'
    }
  },
  // ... 5개 정도 추가
];
```

**현재 상태**: ⏳ Phase 3 예정 (30분)

---

**최종 상태**: ✅ **DB/API 명세 작성 완료**

**다음 문서**: 153_DEV_PLAN_NEXT.md (다음 개발 계획)

---

**작성 완료 시각**: 2025-12-01 09:30 KST
