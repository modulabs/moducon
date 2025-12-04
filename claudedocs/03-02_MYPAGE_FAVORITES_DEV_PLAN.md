# 마이페이지 및 관심 등록 시스템 개발 계획

## 📅 최종 업데이트
**날짜**: 2025-12-04
**작성자**: Technical Lead
**문서 번호**: 03-02

---

## 🚀 현재 진행 상황

### 완료된 작업 (2025-12-04)

#### 1. 관심 세션 백엔드 API 구현 완료
- `moducon-backend/src/routes/favorites.ts` 생성
- API 엔드포인트:
  - `GET /api/favorites` - 사용자 관심 목록 조회
  - `GET /api/favorites/sessions` - 관심 세션 목록 (세션 정보 포함)
  - `POST /api/favorites/:targetType/:targetId` - 관심 등록/해제 토글
  - `GET /api/favorites/check/:targetType/:targetId` - 관심 등록 여부 확인
  - `DELETE /api/favorites/:targetType/:targetId` - 관심 해제

#### 2. 세션 상세 페이지 관심 기능 구현 완료
- `SessionDetailClient.tsx`에 하트 버튼 추가
- 로그인 시에만 관심 버튼 활성화
- 관심 등록/해제 토글 기능

#### 3. 세션 목록 페이지 관심 기능 구현 (진행 중)
- 필터 통합: All, Track 00~101, 관심 세션을 한 줄에 배치
- 각 세션 카드에 하트 버튼 추가
- 관심 세션 필터 클릭 시 관심 등록한 세션만 표시

### 알려진 이슈 (수정 필요)
1. **UI 레이아웃 문제**: 세션 1개 이하일 때와 2개 이상일 때 마진/정렬이 다르게 표시됨
   - 원인: CSS `space-y-6` 또는 flex 레이아웃 관련 이슈로 추정
   - 상태: 조사 중

---

## 🎯 Phase 5: 마이페이지 시스템

### 예상 소요: 2-3시간

---

## 📊 기능 요구사항

### 5.1 마이페이지 구성

```
/mypage
├── 프로필 섹션
│   ├── 사용자 이름
│   ├── 디지털 서명 미리보기
│   └── 등록 타입 (사전등록/현장등록)
│
├── 방문 기록 섹션
│   ├── 총 방문 수
│   ├── 세션 방문 목록
│   ├── 부스 방문 목록
│   └── 포스터 방문 목록
│
├── 관심 등록 섹션
│   ├── 관심 세션 목록
│   ├── 관심 부스 목록
│   └── 관심 포스터 목록
│
├── 배지 컬렉션
│   ├── 획득한 배지
│   └── 미획득 배지 (잠금 상태)
│
└── 활동 통계
    ├── 퀴즈 정답률
    ├── 방문 완료율
    └── 질문 수
```

---

## 🗄️ DB 스키마 추가

### 관심 등록 테이블 (신규)

```prisma
model UserFavorite {
  id          String   @id @default(dbgenerated("uuid_v7()")) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  targetType  String   @map("target_type") @db.VarChar(20)  // 'session' | 'booth' | 'paper'
  targetId    String   @map("target_id") @db.VarChar(50)
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, targetType, targetId], name: "unique_favorite")
  @@index([userId], map: "idx_favorites_user")
  @@index([targetType, targetId], map: "idx_favorites_target")
  @@map("user_favorites")
}
```

### User 모델 관계 추가

```prisma
model User {
  // ... 기존 필드
  favorites     UserFavorite[]  // 추가
}
```

---

## 📡 API 명세

### 관심 등록 API

#### POST /api/favorites
관심 등록 추가

**Headers**: `Authorization: Bearer {token}`

**Request**
```json
{
  "targetType": "session",
  "targetId": "00-01"
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "targetType": "session",
    "targetId": "00-01",
    "createdAt": "2025-12-13T10:00:00Z"
  }
}
```

#### DELETE /api/favorites/:targetType/:targetId
관심 등록 해제

**Response (200)**
```json
{
  "success": true,
  "message": "Favorite removed"
}
```

#### GET /api/favorites/user/:userId
사용자 관심 목록 조회

**Query Parameters**
- `targetType` (선택): 필터링

**Response (200)**
```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": "uuid",
        "targetType": "session",
        "targetId": "00-01",
        "createdAt": "2025-12-13T10:00:00Z",
        "target": {
          "title": "AI 기술 트렌드",
          "speakerName": "홍길동"
        }
      }
    ],
    "total": 5
  }
}
```

---

### 마이페이지 통합 API

#### GET /api/mypage/:userId
마이페이지 전체 데이터 조회

**Response (200)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "홍길동",
      "signatureUrl": "/signatures/uuid.png",
      "registrationType": "pre_registered"
    },
    "checkins": {
      "total": 10,
      "sessions": [
        { "targetId": "00-01", "checkedInAt": "...", "title": "AI 트렌드" }
      ],
      "booths": [...],
      "papers": [...]
    },
    "favorites": {
      "total": 5,
      "sessions": [...],
      "booths": [...],
      "papers": [...]
    },
    "badges": [
      { "id": "first_step", "name": "첫 발자국", "earnedAt": "..." },
      { "id": "explorer", "name": "탐험가", "earnedAt": null }
    ],
    "stats": {
      "quizTotal": 5,
      "quizCorrect": 3,
      "questionsAsked": 2
    }
  }
}
```

---

## 🎨 UI 컴포넌트

### 파일 구조

```
src/app/mypage/
├── page.tsx                 # 메인 페이지
└── components/
    ├── ProfileCard.tsx      # 프로필 카드
    ├── VisitHistory.tsx     # 방문 기록
    ├── FavoritesList.tsx    # 관심 목록
    ├── BadgeCollection.tsx  # 배지 컬렉션
    └── ActivityStats.tsx    # 활동 통계
```

### ProfileCard

```tsx
// 사용자 기본 정보 + 서명 미리보기
- 이름, 등록 타입
- 서명 이미지 썸네일
- 로그아웃 버튼
```

### VisitHistory

```tsx
// 탭 기반 방문 기록
- 전체 | 세션 | 부스 | 포스터
- 각 항목: 제목, 방문 시간, 상세보기 링크
- 빈 상태: "아직 방문 기록이 없습니다"
```

### FavoritesList

```tsx
// 관심 등록 목록
- 하트 아이콘으로 즐겨찾기 해제
- 상세페이지 바로가기
- 관심 세션 알림 설정 (추후)
```

### BadgeCollection

```tsx
// 배지 그리드
- 획득: 컬러 + 획득 날짜
- 미획득: 흑백 + 잠금 아이콘
- 배지 클릭 시 조건 설명 모달
```

---

## 🏆 배지 시스템

### 배지 종류

| ID | 이름 | 조건 | 아이콘 |
|----|------|------|--------|
| `first_step` | 첫 발자국 | 첫 체크인 완료 | 👣 |
| `session_lover` | 세션 마스터 | 5개 세션 참석 | 🎤 |
| `booth_explorer` | 부스 탐험가 | 3개 부스 방문 | 🏢 |
| `paper_reader` | 논문 연구원 | 3개 포스터 방문 | 📄 |
| `quiz_challenger` | 퀴즈 도전자 | 5개 퀴즈 시도 | ❓ |
| `quiz_master` | 퀴즈 마스터 | 5개 퀴즈 정답 | 🏆 |
| `all_rounder` | 올라운더 | 모든 타입 체크인 | 🌟 |
| `completionist` | 컨퍼런스 마스터 | 10개 총 체크인 | 👑 |
| `curious_mind` | 호기심 왕 | 3개 질문 작성 | 💡 |

---

## ✅ 체크리스트

### Phase 5.1: DB 스키마
- [x] `UserFavorite` 모델 추가
- [x] Prisma 마이그레이션 실행
- [x] User 모델 관계 업데이트

### Phase 5.2: 관심 등록 API
- [x] POST /api/favorites/:targetType/:targetId (토글 방식)
- [x] DELETE /api/favorites/:type/:id
- [x] GET /api/favorites (사용자 관심 목록)
- [x] GET /api/favorites/sessions (관심 세션 목록 with 세션 정보)
- [x] GET /api/favorites/check/:targetType/:targetId (관심 여부 확인)

### Phase 5.3: 마이페이지 API
- [ ] GET /api/mypage/:userId
- [ ] 체크인 + 관심 + 배지 + 통계 통합

### Phase 5.4: 마이페이지 UI
- [ ] ProfileCard 컴포넌트
- [ ] VisitHistory 컴포넌트
- [ ] FavoritesList 컴포넌트
- [ ] BadgeCollection 컴포넌트
- [ ] ActivityStats 컴포넌트

### Phase 5.5: 관심 등록 UI
- [x] 상세페이지에 하트 버튼 추가
- [x] 관심 등록/해제 토글
- [x] 관심 상태 실시간 반영
- [x] 세션 목록 페이지에 관심 필터 추가
- [x] 세션 카드에 관심 버튼 추가
- [ ] UI 레이아웃 버그 수정 (세션 1개일 때 정렬 이슈)

---

## 📅 다음 문서

- **03-03**: 세션 Q&A 시스템

---

**문서 버전**: v1.1
**최종 수정일**: 2025-12-04
