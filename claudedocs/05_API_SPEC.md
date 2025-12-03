# API 명세서

## 📅 최종 업데이트
**날짜**: 2025-12-03

---

## 기본 정보

| 항목 | 값 |
|------|-----|
| Base URL (Production) | `https://backend.vibemakers.kr` |
| Base URL (Development) | `http://localhost:3001` |
| Content-Type | `application/json` |
| Authentication | Bearer Token (JWT) |

## CORS 설정

### 허용된 Origin
```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'https://moducon.vibemakers.kr',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
];
```

---

## 인증 API

### POST /api/auth/verify
QR 코드 검증 및 사용자 인증

**Request Body**
```json
{
  "name": "홍길동",
  "phone": "1234"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "name": "홍길동",
      "phone": "1234"
    }
  }
}
```

### POST /api/auth/signature
디지털 서명 저장

**Headers**
```
Authorization: Bearer <token>
```

**Request Body**
```json
{
  "signature": "base64-encoded-signature-data"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "signatureUrl": "https://..."
  }
}
```

### POST /api/auth/login
이메일/비밀번호 로그인

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "홍길동",
      "affiliation": "Modulabs",
      "role": "Developer"
    }
  }
}
```

### GET /api/auth/me
현재 로그인된 사용자 정보 조회

**Headers**
```
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "affiliation": "Modulabs",
    "role": "Developer",
    "qrCode": "base64-encoded-qr"
  }
}
```

---

## 데이터 API (PostgreSQL DB 연동) ✅

### GET /api/sessions
세션 목록 조회 (PostgreSQL DB + Prisma ORM)

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| track | string | 선택 | 트랙 필터 (예: "Track 00") |

**Response (200)**
```json
[
  {
    "id": "019ae3c3-bfdf-7812-a9b4-...",
    "code": "S001",
    "track": "Track 00",
    "location": "이삼봉홀",
    "timeSlot": "10:00-10:50",
    "speakerName": "홍길동",
    "speakerOrg": "모두의연구소",
    "speakerBio": "연사 소개...",
    "speakerProfileUrl": "https://...",
    "title": "AI 기술 트렌드",
    "description": "발표 내용...",
    "keywords": ["AI", "딥러닝"],
    "pageUrl": "https://...",
    "isActive": true,
    "createdAt": "2025-12-03T00:00:00Z",
    "updatedAt": "2025-12-03T00:00:00Z"
  }
]
```

### GET /api/booths
부스 목록 조회 (PostgreSQL DB + Prisma ORM)

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| orgType | string | 선택 | 조직 타입 필터 |

**Response (200)**
```json
[
  {
    "id": "019ae3c3-bffc-7adc-849d-...",
    "code": "B001",
    "name": "AI LAB",
    "organization": "모두의연구소",
    "orgType": "모두의연구소 LAB",
    "description": "단체 소개...",
    "boothDescription": "부스 소개...",
    "hashtags": ["AI", "ML"],
    "solutions": "제공 솔루션...",
    "coreTech": "핵심 기술...",
    "researchGoals": "연구 목표...",
    "mainProducts": "주요 제품...",
    "demoContent": "데모 내용...",
    "imageUrl": "https://...",
    "managerName": "담당자명",
    "isActive": true,
    "createdAt": "2025-12-03T00:00:00Z",
    "updatedAt": "2025-12-03T00:00:00Z"
  }
]
```

### GET /api/papers
포스터 목록 조회 (PostgreSQL DB + Prisma ORM)

**Response (200)**
```json
[
  {
    "id": "019ae3c3-c000-7646-a3c4-...",
    "code": "P001",
    "title": "딥러닝 연구",
    "abstract": "연구 요약...",
    "researcher": "연구자명",
    "affiliation": "소속",
    "hashtags": ["딥러닝", "NLP"],
    "presentationTime": "14:00-15:00",
    "location": "포스터존 A",
    "isActive": true,
    "createdAt": "2025-12-03T00:00:00Z",
    "updatedAt": "2025-12-03T00:00:00Z"
  }
]
```

---

## 체크인 API

### POST /api/checkin
세션/부스/포스터 체크인 생성

**Headers**
```
Authorization: Bearer <token>
```

**Request Body**
```json
{
  "targetType": "booth",  // "session" | "booth" | "paper"
  "targetId": "booth_1"
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user_uuid",
    "targetType": "booth",
    "targetId": "booth_1",
    "checkedInAt": "2025-12-13T10:00:00Z"
  }
}
```

**Error Response (409 - 이미 체크인됨)**
```json
{
  "success": false,
  "error": "Already checked in",
  "code": "ALREADY_CHECKED_IN"
}
```

### GET /api/checkin/user/:userId
사용자별 체크인 목록 조회

**Headers**
```
Authorization: Bearer <token>
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| targetType | string | 선택 | "session" \| "booth" \| "paper" |

**Response (200)**
```json
{
  "success": true,
  "data": {
    "checkins": [
      {
        "id": "uuid",
        "targetType": "booth",
        "targetId": "booth_1",
        "checkedInAt": "2025-12-13T10:00:00Z"
      },
      {
        "id": "uuid",
        "targetType": "session",
        "targetId": "session_5",
        "checkedInAt": "2025-12-13T11:00:00Z"
      }
    ],
    "total": 2
  }
}

---

## 퀴즈 API

### GET /api/quiz/:targetType/:targetId
특정 대상의 퀴즈 조회

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "targetType": "booth",
    "targetId": "booth_1",
    "question": "이 부스에서 소개하는 AI 기술은?",
    "options": ["GPT", "BERT", "LLaMA", "Claude"],
    "isActive": true
  }
}
```

**Error Response (404 - 퀴즈 없음)**
```json
{
  "success": false,
  "error": "Quiz not found",
  "code": "NOT_FOUND"
}
```

### POST /api/quiz/attempt
퀴즈 답변 제출 및 정답 확인

**Headers**
```
Authorization: Bearer <token>
```

**Request Body**
```json
{
  "quizId": "quiz_uuid",
  "answer": 2  // 0-3 인덱스 (선택한 옵션 번호)
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": "attempt_uuid",
    "quizId": "quiz_uuid",
    "answer": 2,
    "isCorrect": true,
    "correctAnswer": 2,
    "attemptedAt": "2025-12-13T10:05:00Z"
  }
}
```

**Error Response (409 - 이미 답변함)**
```json
{
  "success": false,
  "error": "Already attempted this quiz",
  "code": "ALREADY_ATTEMPTED"
}
```

### GET /api/quiz/user/:userId
사용자별 퀴즈 답변 목록

**Headers**
```
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "attempts": [
      {
        "id": "attempt_uuid",
        "quiz": {
          "id": "quiz_uuid",
          "targetType": "booth",
          "targetId": "booth_1",
          "question": "이 부스에서 소개하는 AI 기술은?"
        },
        "answer": 2,
        "isCorrect": true,
        "attemptedAt": "2025-12-13T10:05:00Z"
      }
    ],
    "total": 1,
    "correctCount": 1
  }
}

---

## 통계 API

### GET /api/stats/user/:userId
사용자 통계 (체크인 수, 퀴즈 정답률, 배지)

**Headers**
```
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "checkins": {
      "total": 5,
      "byType": {
        "session": 2,
        "booth": 2,
        "paper": 1
      }
    },
    "quizzes": {
      "total": 3,
      "correct": 2,
      "accuracy": 66.67
    },
    "badges": [
      {
        "id": "explorer",
        "name": "탐험가",
        "description": "3개 이상 부스 방문",
        "earnedAt": "2025-12-13T11:00:00Z"
      },
      {
        "id": "scholar",
        "name": "학자",
        "description": "퀴즈 정답률 50% 이상",
        "earnedAt": "2025-12-13T11:30:00Z"
      }
    ],
    "points": 150
  }
}
```

### 배지 종류

| ID | 이름 | 조건 |
|----|------|------|
| `first_checkin` | 첫 발자국 | 첫 체크인 완료 |
| `explorer` | 탐험가 | 3개 이상 부스 방문 |
| `session_lover` | 세션 러버 | 3개 이상 세션 참석 |
| `paper_reader` | 논문 독자 | 3개 이상 포스터 방문 |
| `quiz_master` | 퀴즈 마스터 | 퀴즈 5개 이상 정답 |
| `scholar` | 학자 | 퀴즈 정답률 80% 이상 |
| `completionist` | 완주자 | 모든 부스 방문 |

---

## QR 코드 API

### GET /api/qr/:userId
사용자 QR 코드 조회

**Response (200)**
```json
{
  "success": true,
  "data": {
    "qrCode": "base64-encoded-qr-image",
    "userId": "uuid"
  }
}
```

### POST /api/qr/exchange
명함 교환 등록

**Headers**
```
Authorization: Bearer <token>
```

**Request Body**
```json
{
  "targetUserId": "uuid"
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "exchangeId": "uuid",
    "exchangedAt": "2025-12-02T10:00:00Z"
  }
}
```

---

## 에러 응답 형식

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### 에러 코드

| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| UNAUTHORIZED | 401 | 인증 필요 |
| FORBIDDEN | 403 | 권한 없음 |
| NOT_FOUND | 404 | 리소스 없음 |
| VALIDATION_ERROR | 400 | 입력값 오류 |
| INTERNAL_ERROR | 500 | 서버 오류 |

---

## Rate Limiting

| Endpoint | 제한 |
|----------|------|
| /api/auth/* | 10 requests/minute |
| /api/users/* | 60 requests/minute |
| /api/qr/* | 30 requests/minute |
| /api/checkin/* | 60 requests/minute |
| /api/quiz/* | 60 requests/minute |

---

## 보안

### JWT 인증
- **토큰 만료**: 24시간
- **저장소**: HTTP-only cookies
- **알고리즘**: HS256

### 요청 검증
- Zod 스키마 기반 검증
- SQL Injection 방어 (Prisma ORM)
- XSS 방어 (React 기본 이스케이핑)
