# 세션 Q&A 시스템 개발 계획

## 📅 최종 업데이트
**날짜**: 2025-12-03
**작성자**: Technical Lead
**문서 번호**: 03-03

---

## 🎯 Phase 6: 세션 Q&A 시스템

### 예상 소요: 3-4시간

---

## 📊 기능 요구사항

### 6.1 Q&A 기능 개요

```
세션 상세 페이지
├── 세션 정보 (기존)
├── Q&A 섹션 (신규)
│   ├── 질문 작성 폼
│   ├── 질문 목록 (인기순/최신순)
│   │   ├── 질문 내용
│   │   ├── 작성자 (익명 옵션)
│   │   ├── 좋아요 수 + 버튼
│   │   ├── 답변 (있는 경우)
│   │   └── 작성 시간
│   └── 더보기 / 페이지네이션
└── 실시간 업데이트 (WebSocket 또는 Polling)
```

---

## 🗄️ DB 스키마

### 질문 테이블

```prisma
model SessionQuestion {
  id          String   @id @default(dbgenerated("uuid_v7()")) @db.Uuid
  sessionId   String   @map("session_id") @db.VarChar(50)
  userId      String   @map("user_id") @db.Uuid
  content     String   @db.Text
  isAnonymous Boolean  @default(false) @map("is_anonymous")
  isAnswered  Boolean  @default(false) @map("is_answered")
  isPinned    Boolean  @default(false) @map("is_pinned")
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  likes       QuestionLike[]
  answer      QuestionAnswer?

  @@index([sessionId], map: "idx_questions_session")
  @@index([userId], map: "idx_questions_user")
  @@index([createdAt], map: "idx_questions_created")
  @@map("session_questions")
}
```

### 좋아요 테이블

```prisma
model QuestionLike {
  id         String   @id @default(dbgenerated("uuid_v7()")) @db.Uuid
  questionId String   @map("question_id") @db.Uuid
  userId     String   @map("user_id") @db.Uuid
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  question   SessionQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  user       User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([questionId, userId], name: "unique_question_like")
  @@index([questionId], map: "idx_likes_question")
  @@index([userId], map: "idx_likes_user")
  @@map("question_likes")
}
```

### 답변 테이블

```prisma
model QuestionAnswer {
  id         String   @id @default(dbgenerated("uuid_v7()")) @db.Uuid
  questionId String   @unique @map("question_id") @db.Uuid
  content    String   @db.Text
  answeredBy String?  @map("answered_by") @db.VarChar(100)  // 연사 이름 또는 운영진
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt  DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)

  question   SessionQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@map("question_answers")
}
```

### 알림 테이블 (푸시 알림용)

```prisma
model UserNotification {
  id          String   @id @default(dbgenerated("uuid_v7()")) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  type        String   @db.VarChar(50)  // 'answer_posted', 'question_liked', etc.
  title       String   @db.VarChar(200)
  message     String   @db.Text
  data        Json?    // { questionId, sessionId, etc. }
  isRead      Boolean  @default(false) @map("is_read")
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead], map: "idx_notifications_user_read")
  @@index([createdAt], map: "idx_notifications_created")
  @@map("user_notifications")
}
```

### User 모델 관계 추가

```prisma
model User {
  // ... 기존 필드
  questions      SessionQuestion[]
  questionLikes  QuestionLike[]
  notifications  UserNotification[]
}
```

---

## 📡 API 명세

### 질문 API

#### POST /api/sessions/:sessionId/questions
질문 작성

**Headers**: `Authorization: Bearer {token}`

**Request**
```json
{
  "content": "발표 내용 중 X 부분에 대해 더 자세히 설명해주실 수 있나요?",
  "isAnonymous": false
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "...",
    "isAnonymous": false,
    "author": {
      "id": "uuid",
      "name": "홍길동"
    },
    "likeCount": 0,
    "isLiked": false,
    "createdAt": "2025-12-13T10:00:00Z"
  }
}
```

#### GET /api/sessions/:sessionId/questions
질문 목록 조회

**Query Parameters**
- `sort`: `popular` (기본) | `recent`
- `page`: 페이지 번호 (기본: 1)
- `limit`: 페이지당 개수 (기본: 20)

**Response (200)**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "uuid",
        "content": "질문 내용...",
        "isAnonymous": false,
        "author": { "id": "uuid", "name": "홍길동" },
        "likeCount": 15,
        "isLiked": true,
        "isAnswered": true,
        "isPinned": false,
        "answer": {
          "content": "답변 내용...",
          "answeredBy": "연사 김철수",
          "createdAt": "..."
        },
        "createdAt": "2025-12-13T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

#### DELETE /api/questions/:questionId
본인 질문 삭제

**Response (200)**
```json
{
  "success": true,
  "message": "Question deleted"
}
```

---

### 좋아요 API

#### POST /api/questions/:questionId/like
좋아요 토글

**Response (200)**
```json
{
  "success": true,
  "data": {
    "isLiked": true,
    "likeCount": 16
  }
}
```

---

### 답변 API (관리자용)

#### POST /api/questions/:questionId/answer
답변 작성 (관리자/연사)

**Request**
```json
{
  "content": "답변 내용입니다...",
  "answeredBy": "연사 홍길동"
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "...",
    "answeredBy": "연사 홍길동",
    "createdAt": "..."
  }
}
```

**부가 동작**:
- 질문 작성자에게 알림 생성
- 해당 질문 좋아요 누른 사용자들에게 알림 생성

---

### 알림 API

#### GET /api/notifications
사용자 알림 목록

**Query Parameters**
- `unreadOnly`: `true` | `false` (기본: false)

**Response (200)**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "answer_posted",
        "title": "질문에 답변이 달렸습니다",
        "message": "\"AI 기술 트렌드\" 세션에서 작성하신 질문에 답변이 등록되었습니다.",
        "data": {
          "questionId": "uuid",
          "sessionId": "00-01"
        },
        "isRead": false,
        "createdAt": "2025-12-13T11:00:00Z"
      }
    ],
    "unreadCount": 3
  }
}
```

#### PATCH /api/notifications/:notificationId/read
알림 읽음 처리

#### PATCH /api/notifications/read-all
모든 알림 읽음 처리

---

## 🎨 UI 컴포넌트

### 파일 구조

```
src/components/qa/
├── QuestionForm.tsx       # 질문 작성 폼
├── QuestionList.tsx       # 질문 목록
├── QuestionCard.tsx       # 개별 질문 카드
├── AnswerSection.tsx      # 답변 표시
├── LikeButton.tsx         # 좋아요 버튼
└── SortTabs.tsx           # 정렬 탭 (인기순/최신순)

src/components/notifications/
├── NotificationBell.tsx   # 헤더 알림 아이콘
├── NotificationList.tsx   # 알림 목록
└── NotificationItem.tsx   # 개별 알림 항목
```

### QuestionForm

```tsx
// 질문 작성 폼
- 텍스트 영역 (300자 제한)
- 익명 체크박스
- 제출 버튼
- 로그인 필요 시 로그인 유도
```

### QuestionCard

```tsx
// 개별 질문 카드
- 작성자 (익명 시 "익명" 표시)
- 질문 내용
- 좋아요 버튼 + 카운트
- 답변 있으면 접이식 표시
- 본인 질문 시 삭제 버튼
- 고정된 질문 시 📌 표시
```

### NotificationBell

```tsx
// 헤더 알림 아이콘
- 읽지 않은 알림 개수 배지
- 클릭 시 드롭다운 목록
- 알림 클릭 시 해당 페이지로 이동
```

---

## 🔔 알림 시스템

### 알림 트리거

| 이벤트 | 수신자 | 알림 내용 |
|--------|--------|----------|
| 답변 등록 | 질문 작성자 | "질문에 답변이 달렸습니다" |
| 답변 등록 | 좋아요 누른 사용자들 | "관심 질문에 답변이 달렸습니다" |
| 질문 좋아요 10개 | 질문 작성자 | "질문이 인기를 얻고 있습니다" |

### 알림 전달 방식

1. **In-App 알림**: DB 저장 + 헤더 벨 아이콘
2. **실시간 업데이트**:
   - 옵션 A: WebSocket (Socket.io)
   - 옵션 B: Polling (30초 간격)
3. **푸시 알림** (추후): Web Push API

---

## 🔐 권한 관리

### 일반 사용자
- 질문 작성 (로그인 필수)
- 본인 질문 삭제
- 좋아요 토글
- 질문 목록 조회

### 관리자/연사
- 답변 작성
- 질문 고정/해제
- 부적절한 질문 삭제

---

## ✅ 체크리스트

### Phase 6.1: DB 스키마
- [ ] `SessionQuestion` 모델
- [ ] `QuestionLike` 모델
- [ ] `QuestionAnswer` 모델
- [ ] `UserNotification` 모델
- [ ] Prisma 마이그레이션

### Phase 6.2: 질문 API
- [ ] POST /api/sessions/:id/questions
- [ ] GET /api/sessions/:id/questions
- [ ] DELETE /api/questions/:id

### Phase 6.3: 좋아요 API
- [ ] POST /api/questions/:id/like

### Phase 6.4: 답변 API
- [ ] POST /api/questions/:id/answer (관리자)
- [ ] 답변 시 알림 생성 로직

### Phase 6.5: 알림 API
- [ ] GET /api/notifications
- [ ] PATCH /api/notifications/:id/read
- [ ] PATCH /api/notifications/read-all

### Phase 6.6: Q&A UI
- [ ] QuestionForm 컴포넌트
- [ ] QuestionList 컴포넌트
- [ ] QuestionCard 컴포넌트
- [ ] LikeButton 컴포넌트
- [ ] 세션 상세페이지에 Q&A 섹션 추가

### Phase 6.7: 알림 UI
- [ ] NotificationBell 컴포넌트
- [ ] NotificationList 컴포넌트
- [ ] 헤더에 알림 아이콘 추가

---

## 📅 우선순위

### 필수 (MVP)
1. 질문 작성/조회
2. 좋아요 기능
3. 인기순/최신순 정렬

### 권장 (Phase 6.5+)
4. 답변 기능
5. In-App 알림

### 추후 (Phase 7+)
6. 실시간 업데이트 (WebSocket)
7. 푸시 알림

---

**문서 버전**: v1.0
**최종 수정일**: 2025-12-03
