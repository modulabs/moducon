# 05_API_SPEC_part2.md - API 명세서 (파트 2)

## 🎮 퀘스트 (Quests)

### 1. 개인화 퀘스트 생성

**관심사 기반 퀘스트 자동 생성**

#### POST /api/quests/generate

**Headers**:
```
Authorization: Bearer <token>
```

**Request** (선택):
```json
{
  "preferences": {
    "difficulty": "intermediate",
    "max_quests": 5
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "quests": [
      {
        "id": "quest-001",
        "quest_type": "main",
        "target_type": "booth",
        "target_id": "booth-001",
        "target": {
          "name": "AI 챗봇 데모",
          "location": { "x": 10.5, "y": 20.3 }
        },
        "order_index": 1,
        "is_completed": false,
        "estimated_duration_minutes": 15
      },
      {
        "id": "quest-002",
        "quest_type": "main",
        "target_type": "paper",
        "target_id": "paper-001",
        "target": {
          "title": "Transformer를 활용한 한국어 NLP"
        },
        "order_index": 2,
        "is_completed": false,
        "estimated_duration_minutes": 10
      },
      ...
    ],
    "total_quests": 5,
    "estimated_total_time": 75
  },
  "message": "Quests generated based on your interests"
}
```

---

### 2. 내 퀘스트 목록

#### GET /api/quests/my

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `status`: `pending` | `completed` | `all` (기본값: `all`)

**Response**:
```json
{
  "success": true,
  "data": {
    "quests": [
      {
        "id": "quest-001",
        "quest_type": "main",
        "target_type": "booth",
        "target_id": "booth-001",
        "target": { ... },
        "order_index": 1,
        "is_completed": true,
        "completed_at": "2025-12-13T11:30:00Z"
      },
      ...
    ],
    "progress": {
      "completed": 3,
      "total": 5,
      "percentage": 60
    }
  }
}
```

---

### 3. 퀘스트 완료 인증

**부스/페이퍼 QR 스캔 시 자동 호출**

#### POST /api/quests/:id/complete

**Headers**:
```
Authorization: Bearer <token>
```

**Request** (선택):
```json
{
  "verification_code": "optional-code"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "quest_id": "quest-001",
    "completed_at": "2025-12-13T11:30:00Z",
    "points_earned": 50,
    "next_quest": {
      "id": "quest-002",
      "target": { ... }
    },
    "all_quests_completed": false
  },
  "message": "Quest completed!"
}
```

**Response (전체 완료 시)**:
```json
{
  "success": true,
  "data": {
    "quest_id": "quest-005",
    "completed_at": "2025-12-13T14:00:00Z",
    "points_earned": 50,
    "all_quests_completed": true,
    "reward": {
      "badge_physical": true,
      "certificate_digital": true,
      "sourcecode_access": true
    },
    "reward_qr_code": "moducon://reward/user-123/signature-abc"
  },
  "message": "🎉 All quests completed! Claim your reward!"
}
```

---

### 4. 퀘스트 진행 상황

#### GET /api/quests/progress

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_quests": 5,
    "completed_quests": 3,
    "percentage": 60,
    "main_quests": {
      "total": 5,
      "completed": 3
    },
    "hidden_quests": {
      "total": 3,
      "completed": 1
    },
    "time_spent_minutes": 45,
    "estimated_remaining_minutes": 30
  }
}
```

---

## 📊 활동 기록 (Activities)

### 1. 내 활동 타임라인

#### GET /api/activities/timeline

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `date`: 날짜 필터 (YYYY-MM-DD)
- `type`: 활동 유형 필터 (`session_checkin` | `booth_visit` | `quest_complete` | `profile_exchange`)

**Response**:
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity-001",
        "activity_type": "session_checkin",
        "activity_data": {
          "session_id": "session-001",
          "session_title": "생성 AI의 최신 동향"
        },
        "points_earned": 10,
        "created_at": "2025-12-13T10:05:00Z"
      },
      {
        "id": "activity-002",
        "activity_type": "booth_visit",
        "activity_data": {
          "booth_id": "booth-001",
          "booth_name": "AI 챗봇 데모"
        },
        "points_earned": 15,
        "created_at": "2025-12-13T11:30:00Z"
      },
      {
        "id": "activity-003",
        "activity_type": "quest_complete",
        "activity_data": {
          "quest_id": "quest-001"
        },
        "points_earned": 50,
        "created_at": "2025-12-13T11:30:00Z"
      },
      ...
    ],
    "total": 15
  }
}
```

---

### 2. 활동 통계

#### GET /api/activities/stats

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_points": 350,
    "total_activities": 15,
    "breakdown": {
      "sessions_attended": 4,
      "booths_visited": 8,
      "quests_completed": 3,
      "profiles_exchanged": 5
    },
    "badges_earned": [
      {
        "id": "badge-001",
        "name": "Early Bird",
        "description": "첫 세션 체크인",
        "earned_at": "2025-12-13T10:05:00Z"
      },
      ...
    ],
    "rank": {
      "position": 23,
      "total_participants": 500,
      "percentile": 95
    }
  }
}
```

---

## 🎖️ 배지 & 보상 (Badges & Rewards)

### 1. 전체 배지 목록

#### GET /api/badges

**Response**:
```json
{
  "success": true,
  "data": {
    "badges": [
      {
        "id": "badge-001",
        "name": "Quest Master",
        "description": "전체 퀘스트 완료",
        "icon_url": "https://...",
        "criteria": {
          "type": "quest_completion",
          "target": 100
        }
      },
      {
        "id": "badge-002",
        "name": "Paper Lover",
        "description": "페이퍼샵 5개 이상",
        "icon_url": "https://...",
        "criteria": {
          "type": "paper_quiz",
          "target": 5
        }
      },
      ...
    ],
    "total": 10
  }
}
```

---

### 2. 내 배지

#### GET /api/badges/my

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "badges": [
      {
        "badge": {
          "id": "badge-001",
          "name": "Early Bird",
          "description": "첫 세션 체크인",
          "icon_url": "https://..."
        },
        "earned_at": "2025-12-13T10:05:00Z"
      },
      ...
    ],
    "total": 3
  }
}
```

---

### 3. 보상 수령 (중앙 운영 부스)

**퀘스트 100% 완료 시 QR 코드 제시**

#### POST /api/rewards/claim

**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "reward_qr_code": "moducon://reward/user-123/signature-abc"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "reward_id": "reward-001",
    "user_id": "user-123",
    "reward_type": "badge_physical",
    "is_claimed": true,
    "claimed_at": "2025-12-13T15:00:00Z",
    "certificate_url": "https://api.moducon.vibemakers.kr/certificates/user-123.pdf"
  },
  "message": "Reward claimed! Enjoy your badge!"
}
```

**Validation**:
- 전체 퀘스트 완료 확인
- QR 코드 서명 검증
- 중복 수령 방지

---

## 🤝 네트워킹 (Networking)

### 1. 프로필 교환 (QR 스캔)

#### POST /api/profile/exchange

**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "exchanged_with_user_id": "user-456",
  "location": "Track 1 Lobby"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "exchange_id": "exchange-001",
    "exchanged_at": "2025-12-13T12:00:00Z",
    "points_earned": 5,
    "profile": {
      "id": "user-456",
      "name": "이영희",
      "organization": "모두의연구소",
      "interests": ["AI/ML", "컴퓨터 비전"],
      "social_links": [
        { "type": "LinkedIn", "url": "https://..." }
      ]
    }
  },
  "message": "Profile exchanged!"
}
```

---

### 2. 교환한 프로필 목록

#### GET /api/profile/exchanges

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "exchanges": [
      {
        "profile": {
          "id": "user-456",
          "name": "이영희",
          "organization": "모두의연구소",
          "interests": ["AI/ML"],
          "social_links": [...]
        },
        "exchanged_at": "2025-12-13T12:00:00Z",
        "location": "Track 1 Lobby"
      },
      ...
    ],
    "total": 5
  }
}
```

---

### 3. 타인 프로필 조회 (공개 범위 내)

#### GET /api/profile/:userId

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "user-456",
      "name": "이영희",
      "organization": "모두의연구소",
      "position": "AI 연구원",
      "interests": ["AI/ML", "컴퓨터 비전"],
      "bio": "...",
      "social_links": [
        { "type": "LinkedIn", "url": "https://..." }
      ]
    }
  }
}
```

**Error Cases**:
- 프로필 비공개: `PROFILE_PRIVATE`
- 사용자 없음: `USER_NOT_FOUND`

---

## 📊 혼잡도 (Congestion)

### 1. 실시간 혼잡도 (전체)

#### GET /api/congestion/realtime

**Response**:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "space_id": "session-001",
        "space_name": "Track 1",
        "current_count": 45,
        "max_capacity": 80,
        "congestion_level": "medium",
        "percentage": 56
      },
      ...
    ],
    "booths": [
      {
        "space_id": "booth-001",
        "space_name": "AI 챗봇 데모",
        "current_count": 3,
        "max_capacity": 10,
        "congestion_level": "low",
        "percentage": 30,
        "estimated_wait_time": 0
      },
      ...
    ],
    "papershop": {
      "current_count": 25,
      "max_capacity": 50,
      "congestion_level": "medium",
      "percentage": 50
    },
    "foodzone": {
      "current_count": 60,
      "max_capacity": 100,
      "congestion_level": "high",
      "percentage": 60
    },
    "last_updated": "2025-12-13T12:00:00Z"
  }
}
```

**혼잡도 레벨**:
- `low`: 0-30%
- `medium`: 30-60%
- `high`: 60-90%
- `full`: 90-100%

---

### 2. 특정 공간 혼잡도

#### GET /api/congestion/:spaceType/:spaceId

**Parameters**:
- `spaceType`: `session` | `booth` | `papershop` | `foodzone`
- `spaceId`: 공간 ID

**Example**:
```
GET /api/congestion/booth/booth-001
```

**Response**:
```json
{
  "success": true,
  "data": {
    "space_id": "booth-001",
    "space_name": "AI 챗봇 데모",
    "current_count": 3,
    "max_capacity": 10,
    "congestion_level": "low",
    "percentage": 30,
    "estimated_wait_time": 0,
    "history": [
      {
        "timestamp": "2025-12-13T11:30:00Z",
        "count": 5
      },
      {
        "timestamp": "2025-12-13T12:00:00Z",
        "count": 3
      }
    ]
  }
}
```

---

## 🔔 알림 (Notifications)

### 1. 알림 목록

#### GET /api/notifications

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `type`: 알림 유형 필터 (`session` | `quest` | `congestion` | `event`)
- `read`: 읽음 상태 (`true` | `false`)

**Response**:
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-001",
        "type": "session",
        "title": "세션 시작 10분 전",
        "message": "'생성 AI의 최신 동향' 세션이 곧 시작됩니다.",
        "data": {
          "session_id": "session-001"
        },
        "is_read": false,
        "created_at": "2025-12-13T09:50:00Z"
      },
      {
        "id": "notif-002",
        "type": "congestion",
        "title": "부스 혼잡도 낮아짐",
        "message": "'AI 챗봇 데모' 부스의 혼잡도가 낮아졌습니다.",
        "data": {
          "booth_id": "booth-001"
        },
        "is_read": true,
        "created_at": "2025-12-13T11:00:00Z"
      },
      ...
    ],
    "unread_count": 3,
    "total": 10
  }
}
```

---

### 2. 알림 읽음 처리

#### PATCH /api/notifications/:id/read

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "notification_id": "notif-001",
    "is_read": true
  },
  "message": "Notification marked as read"
}
```

---

### 3. 알림 설정

#### PATCH /api/notifications/settings

**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "enabled": true,
  "session_reminders": true,
  "quest_suggestions": true,
  "congestion_alerts": false,
  "event_announcements": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "settings": { ... }
  },
  "message": "Notification settings updated"
}
```

---

## 🛠️ 관리자 (Admin)

### 1. 대시보드 통계

#### GET /api/admin/dashboard

**Headers**:
```
Authorization: Bearer <admin-token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_users": 500,
      "active_users": 450,
      "total_checkins": 1200,
      "total_booth_visits": 800,
      "quest_completion_rate": 62
    },
    "realtime": {
      "online_users": 320,
      "current_sessions": 6,
      "active_booths": 25
    },
    "sessions": {
      "total": 42,
      "ongoing": 6,
      "completed": 30,
      "upcoming": 6
    },
    "quests": {
      "total_generated": 450,
      "completed": 280,
      "in_progress": 170
    }
  }
}
```

---

### 2. 세션 등록

#### POST /api/admin/sessions

**Request**:
```json
{
  "title": "생성 AI의 최신 동향",
  "speaker_id": "speaker-001",
  "track": 1,
  "date": "2025-12-13",
  "start_time": "10:00",
  "end_time": "11:00",
  "location": "Track 1",
  "difficulty": "intermediate",
  "tags": ["AI", "생성 AI"],
  "description": "...",
  "max_capacity": 80
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session-042",
      "qr_code": "moducon://session/session-042/checkin",
      ...
    }
  },
  "message": "Session created"
}
```

---

### 3. 부스 등록

#### POST /api/admin/booths

**Request**:
```json
{
  "name": "AI 챗봇 데모",
  "organization": "모두의연구소 LAB",
  "description": "...",
  "demo_description": "...",
  "tech_tags": ["AI", "NLP", "Chatbot"],
  "location": { "x": 10.5, "y": 20.3 },
  "estimated_duration_minutes": 15,
  "booth_type": "lab",
  "max_capacity": 10
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "booth": {
      "id": "booth-026",
      "qr_code": "moducon://booth/booth-026",
      ...
    }
  },
  "message": "Booth created"
}
```

---

### 4. 사전 신청자 DB 일괄 등록

#### POST /api/admin/users/import

**Request** (CSV 파일 업로드):
```
Content-Type: multipart/form-data

file: users.csv
```

**CSV 형식**:
```
name,phone_last4,email
홍길동,1234,hong@example.com
이영희,5678,lee@example.com
...
```

**Response**:
```json
{
  "success": true,
  "data": {
    "imported": 450,
    "failed": 5,
    "errors": [
      {
        "row": 23,
        "name": "김철수",
        "error": "Duplicate phone_last4"
      },
      ...
    ]
  },
  "message": "Import completed with 450 successful entries"
}
```

---

## 🌐 WebSocket Events

### 연결
```javascript
const ws = new WebSocket('wss://ws.moducon.vibemakers.kr');

ws.onopen = () => {
  // 인증 메시지 전송
  ws.send(JSON.stringify({
    type: 'auth',
    token: '<jwt-token>'
  }));
};
```

### 이벤트 구독
```javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  channels: ['congestion', 'notifications']
}));
```

### 수신 이벤트

#### 1. 혼잡도 업데이트
```json
{
  "type": "congestion_update",
  "data": {
    "space_type": "booth",
    "space_id": "booth-001",
    "current_count": 5,
    "congestion_level": "low",
    "timestamp": "2025-12-13T12:00:30Z"
  }
}
```

#### 2. 푸시 알림
```json
{
  "type": "notification",
  "data": {
    "id": "notif-003",
    "title": "근처 퀘스트",
    "message": "근처에 퀘스트 위치가 있습니다!",
    "notification_type": "quest"
  }
}
```

#### 3. 퀘스트 업데이트
```json
{
  "type": "quest_update",
  "data": {
    "quest_id": "quest-001",
    "is_completed": true
  }
}
```

---

## 📚 에러 코드 정의

| 코드 | 설명 | HTTP 상태 |
|------|------|-----------|
| `AUTH_INVALID_TOKEN` | 유효하지 않은 토큰 | 401 |
| `AUTH_TOKEN_EXPIRED` | 토큰 만료 | 401 |
| `AUTH_USER_NOT_FOUND` | 사용자 없음 (사전 신청 매칭 실패) | 404 |
| `CHECKIN_ALREADY_EXISTS` | 이미 체크인함 | 409 |
| `CHECKIN_INVALID_TIME` | 체크인 시간 아님 | 400 |
| `CHECKIN_SESSION_FULL` | 세션 만석 | 409 |
| `QUEST_NOT_FOUND` | 퀘스트 없음 | 404 |
| `QUEST_ALREADY_COMPLETED` | 이미 완료한 퀘스트 | 409 |
| `REWARD_ALREADY_CLAIMED` | 이미 수령한 보상 | 409 |
| `PROFILE_PRIVATE` | 비공개 프로필 | 403 |
| `VALIDATION_ERROR` | 입력 검증 오류 | 400 |
| `INTERNAL_SERVER_ERROR` | 서버 오류 | 500 |

---

**작성일**: 2025-01-14
**이전 파일**: [05_API_SPEC.md](./05_API_SPEC.md)
**다음 문서**: 06_DB_DESIGN.md (데이터베이스 설계서)
