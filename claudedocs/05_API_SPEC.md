# 05_API_SPEC.md - API 명세서

## 📋 문서 정보
- **프로젝트명**: 모두콘 2025 디지털 컨퍼런스 북
- **문서 버전**: 1.0
- **작성일**: 2025-01-14
- **작성자**: Technical Lead
- **Backend URL**: https://api.moducon.vibemakers.kr

---

## 🎯 API 개요

### Base URL
- **Development**: `http://localhost:3001`
- **Production**: `https://api.moducon.vibemakers.kr`

### 인증 방식
- **Type**: JWT (JSON Web Token)
- **Header**: `Authorization: Bearer <token>`
- **Token 만료**: 24시간
- **Refresh**: Refresh Token 고려 (선택)

### 공통 응답 형식

#### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

#### 오류 응답
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

### HTTP 상태 코드
- `200 OK`: 성공
- `201 Created`: 리소스 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `500 Internal Server Error`: 서버 오류

---

## 🔐 인증 (Authentication)

### 1. 사용자 로그인

**현장 QR 스캔 후 사용자 인증**

#### POST /api/auth/login

**Request**:
```json
{
  "name": "홍길동",
  "phone_last4": "1234"
}
```

**Response** (성공):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-123",
      "name": "홍길동",
      "phone_last4": "1234",
      "registration_type": "pre_registered",
      "has_signature": false
    }
  },
  "message": "Login successful"
}
```

**Response** (실패 - 매칭 안됨):
```json
{
  "success": false,
  "error": {
    "code": "AUTH_USER_NOT_FOUND",
    "message": "사전 신청 정보를 찾을 수 없습니다. 현장 등록 데스크로 문의해주세요."
  }
}
```

**Validation**:
- `name`: 필수, 1-100자
- `phone_last4`: 필수, 정확히 4자리 숫자

---

### 2. 디지털 서명 저장

**서명 완료 후 출입증 발급**

#### POST /api/auth/signature

**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Response** (성공):
```json
{
  "success": true,
  "data": {
    "signature_url": "https://api.moducon.vibemakers.kr/signatures/uuid-123.png",
    "badge": {
      "qr_code": "moducon://user/uuid-123",
      "user_id": "uuid-123",
      "name": "홍길동",
      "participant_type": "general"
    }
  },
  "message": "Signature saved and badge issued"
}
```

**Validation**:
- `signature_data`: Base64 인코딩된 이미지 (PNG/JPEG)
- 최대 크기: 5MB

---

### 3. 현재 사용자 정보 조회

#### GET /api/auth/me

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "name": "홍길동",
    "email": "hong@example.com",
    "organization": "모두의연구소",
    "role": "participant",
    "interests": ["AI/ML", "NLP", "MLOps"],
    "signature_url": "https://...",
    "registered_at": "2025-01-10T00:00:00Z",
    "last_login": "2025-01-14T10:30:00Z"
  }
}
```

---

### 4. 로그아웃

#### POST /api/auth/logout

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 👤 사용자 프로필 (User Profile)

### 1. 프로필 조회

#### GET /api/user/profile

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "name": "홍길동",
    "organization": "모두의연구소",
    "position": "AI 연구원",
    "interests": ["AI/ML", "NLP"],
    "bio": "...",
    "social_links": [
      { "type": "LinkedIn", "url": "https://..." },
      { "type": "GitHub", "url": "https://..." }
    ],
    "privacy": {
      "email_visible": false,
      "social_links_visible": true
    }
  }
}
```

---

### 2. 프로필 수정

#### PATCH /api/user/profile

**Request**:
```json
{
  "organization": "모두의연구소",
  "position": "AI 연구원",
  "bio": "AI와 ML에 관심이 많습니다.",
  "social_links": [
    { "type": "LinkedIn", "url": "https://..." }
  ],
  "privacy": {
    "email_visible": false
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": { "profile": { ... } },
  "message": "Profile updated"
}
```

---

### 3. 내 프로필 QR 코드 생성

#### GET /api/user/qr

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "qr_code_url": "moducon://profile/uuid-123",
    "qr_image_svg": "<svg>...</svg>",
    "qr_image_png": "data:image/png;base64,..."
  }
}
```

---

### 4. 관심 분야 설정

**온보딩 시 또는 설정에서 수정**

#### POST /api/user/interests

**Request**:
```json
{
  "interests": ["AI/ML", "NLP", "MLOps"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "interests": ["AI/ML", "NLP", "MLOps"]
  },
  "message": "Interests updated"
}
```

**Validation**:
- `interests`: 배열, 최대 3개
- 허용 값: `"생성 AI"`, `"컴퓨터 비전"`, `"NLP/LLM"`, `"로보틱스"`, `"MLOps"`, `"데이터 엔지니어링"`, `"AI 윤리/정책"`, `"기타"`

---

## 📅 세션 (Sessions)

### 1. 전체 세션 목록

#### GET /api/sessions

**Query Parameters**:
- `track`: 트랙 필터 (1-6)
- `date`: 날짜 필터 (YYYY-MM-DD)
- `start_time`: 시작 시간 이후 (HH:MM)
- `tags`: 태그 필터 (쉼표 구분, 예: `AI,ML`)

**Example**:
```
GET /api/sessions?track=1&tags=AI,ML
```

**Response**:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-001",
        "title": "생성 AI의 최신 동향",
        "speaker_id": "speaker-001",
        "speaker_name": "김철수",
        "track": 1,
        "date": "2025-12-13",
        "start_time": "10:00",
        "end_time": "11:00",
        "location": "Track 1",
        "difficulty": "intermediate",
        "tags": ["AI", "생성 AI"],
        "description": "...",
        "is_keynote": false,
        "congestion": {
          "level": "medium",
          "current_count": 45,
          "max_capacity": 80,
          "percentage": 56
        }
      },
      ...
    ],
    "total": 42
  }
}
```

---

### 2. 세션 상세 조회

#### GET /api/sessions/:id

**Response**:
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session-001",
      "title": "생성 AI의 최신 동향",
      "description": "...",
      "speaker": {
        "id": "speaker-001",
        "name": "김철수",
        "organization": "모두의연구소",
        "bio": "...",
        "profile_image": "https://..."
      },
      "track": 1,
      "date": "2025-12-13",
      "start_time": "10:00",
      "end_time": "11:00",
      "location": "Track 1",
      "difficulty": "intermediate",
      "tags": ["AI", "생성 AI"],
      "materials": [
        {
          "type": "slide",
          "title": "발표 자료",
          "url": "https://..."
        }
      ],
      "qr_code": "moducon://session/session-001/checkin",
      "congestion": { ... }
    }
  }
}
```

---

### 3. 세션 체크인

**세션장 입구 QR 스캔**

#### POST /api/sessions/:id/checkin

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "checkin_id": "checkin-001",
    "session_id": "session-001",
    "checked_in_at": "2025-12-13T10:05:00Z",
    "points_earned": 10
  },
  "message": "Checked in successfully"
}
```

**Error Cases**:
- 이미 체크인한 경우: `CHECKIN_ALREADY_EXISTS`
- 세션 시간 아님: `CHECKIN_INVALID_TIME`
- 만석: `CHECKIN_SESSION_FULL`

---

### 4. 세션 체크아웃 (선택)

#### POST /api/sessions/:id/checkout

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "checked_out_at": "2025-12-13T10:55:00Z",
    "duration_minutes": 50
  },
  "message": "Checked out successfully"
}
```

---

### 5. 내 참석 세션 목록

#### GET /api/sessions/my-schedule

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "session": { ... },
        "checked_in_at": "2025-12-13T10:05:00Z",
        "checked_out_at": "2025-12-13T10:55:00Z",
        "duration_minutes": 50
      },
      ...
    ]
  }
}
```

---

## 🏢 부스 (Booths)

### 1. 전체 부스 목록

#### GET /api/booths

**Query Parameters**:
- `interest`: 관심 분야 필터
- `sort`: 정렬 (`distance`, `congestion`, `name`)
- `location_x`: 현재 위치 X 좌표 (거리순 정렬 시 필요)
- `location_y`: 현재 위치 Y 좌표

**Example**:
```
GET /api/booths?interest=AI/ML&sort=congestion
```

**Response**:
```json
{
  "success": true,
  "data": {
    "booths": [
      {
        "id": "booth-001",
        "name": "AI 챗봇 데모",
        "organization": "모두의연구소 LAB",
        "description": "...",
        "demo_description": "...",
        "tech_tags": ["AI", "NLP", "Chatbot"],
        "location": {
          "x": 10.5,
          "y": 20.3
        },
        "estimated_duration_minutes": 15,
        "booth_type": "lab",
        "image_url": "https://...",
        "video_url": "https://...",
        "qr_code": "moducon://booth/booth-001",
        "congestion": {
          "level": "low",
          "estimated_wait_time": 0
        }
      },
      ...
    ],
    "total": 25
  }
}
```

---

### 2. 부스 상세 조회

#### GET /api/booths/:id

**Response**:
```json
{
  "success": true,
  "data": {
    "booth": {
      "id": "booth-001",
      "name": "AI 챗봇 데모",
      "organization": "모두의연구소 LAB",
      "description": "...",
      "demo_description": "...",
      "tech_tags": ["AI", "NLP", "Chatbot"],
      "location": { "x": 10.5, "y": 20.3 },
      "estimated_duration_minutes": 15,
      "booth_type": "lab",
      "image_url": "https://...",
      "video_url": "https://...",
      "qr_code": "moducon://booth/booth-001",
      "congestion": { ... },
      "contact": {
        "email": "contact@example.com",
        "website": "https://..."
      }
    }
  }
}
```

---

### 3. 부스 방문 인증

**부스 QR 스캔**

#### POST /api/booths/:id/visit

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "visit_id": "visit-001",
    "booth_id": "booth-001",
    "visited_at": "2025-12-13T11:30:00Z",
    "points_earned": 15,
    "quest_completed": true
  },
  "message": "Visit recorded"
}
```

---

### 4. 내가 방문한 부스

#### GET /api/booths/visited

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "visits": [
      {
        "booth": { ... },
        "visited_at": "2025-12-13T11:30:00Z"
      },
      ...
    ],
    "total": 8
  }
}
```

---

## 📄 페이퍼샵 (Papers)

### 1. 전체 논문 목록

#### GET /api/papers

**Query Parameters**:
- `keyword`: 키워드 검색
- `field`: 연구 분야 필터
- `tags`: 태그 필터 (쉼표 구분)

**Example**:
```
GET /api/papers?keyword=transformer&tags=NLP
```

**Response**:
```json
{
  "success": true,
  "data": {
    "papers": [
      {
        "id": "paper-001",
        "title": "Transformer를 활용한 한국어 NLP",
        "authors": ["김철수", "이영희"],
        "organization": "모두의연구소",
        "abstract": "...",
        "keywords": ["NLP", "Transformer", "한국어"],
        "pdf_url": "https://...",
        "poster_image_url": "https://...",
        "qr_code": "moducon://paper/paper-001/quiz",
        "qa_available_time": "14:00 - 15:00"
      },
      ...
    ],
    "total": 32
  }
}
```

---

### 2. 논문 상세 조회

#### GET /api/papers/:id

**Response**:
```json
{
  "success": true,
  "data": {
    "paper": {
      "id": "paper-001",
      "title": "...",
      "authors": ["김철수", "이영희"],
      "organization": "모두의연구소",
      "abstract": "...",
      "keywords": ["NLP", "Transformer"],
      "pdf_url": "https://...",
      "poster_image_url": "https://...",
      "qr_code": "moducon://paper/paper-001/quiz",
      "qa_available_time": "14:00 - 15:00",
      "author_contacts": [
        {
          "name": "김철수",
          "email": "kim@example.com"
        }
      ]
    }
  }
}
```

---

### 3. 논문 퀴즈 조회

#### GET /api/papers/:id/quiz

**Response**:
```json
{
  "success": true,
  "data": {
    "quiz": {
      "paper_id": "paper-001",
      "questions": [
        {
          "id": "q1",
          "question": "이 논문의 핵심 기법은?",
          "options": [
            { "id": "a", "text": "Transformer" },
            { "id": "b", "text": "RNN" },
            { "id": "c", "text": "CNN" }
          ]
        },
        ...
      ],
      "total_questions": 5
    }
  }
}
```

---

### 4. 퀴즈 제출

#### POST /api/papers/:id/quiz/submit

**Request**:
```json
{
  "answers": [
    { "question_id": "q1", "selected_option": "a" },
    { "question_id": "q2", "selected_option": "b" },
    ...
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "score": 4,
    "total_questions": 5,
    "passed": true,
    "points_earned": 20,
    "details": [
      {
        "question_id": "q1",
        "correct": true,
        "selected_option": "a",
        "correct_option": "a"
      },
      ...
    ]
  },
  "message": "Quiz completed"
}
```

**Validation**:
- 최소 3문제 이상 정답 시 통과

---

**Note**: API 명세가 너무 길어 05_API_SPEC_part2.md로 계속됩니다.

---

**다음 파일**: [05_API_SPEC_part2.md](./05_API_SPEC_part2.md) - 퀘스트, 활동, 네트워킹, 혼잡도, 알림, 관리자 API
