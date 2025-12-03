# 개발 계획 및 다음 단계

## 📅 최종 업데이트
**날짜**: 2025-12-01
**작성자**: Technical Lead

---

## 🎯 Phase 3-5 개발 계획

### 예상 소요 시간: 3-4시간

---

## Phase 3: Database 마이그레이션 (15분)

### 목표
CheckIn, Quiz 모델 추가 및 Prisma 마이그레이션 실행

### 작업 내역
1. **CheckIn 모델 추가**
   ```prisma
   model CheckIn {
     id          String   @id @default(cuid())
     userId      String
     boothId     String
     timestamp   DateTime @default(now())
     user        User     @relation(fields: [userId], references: [id])
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
   }
   ```

2. **Quiz 모델 추가**
   ```prisma
   model Quiz {
     id          String   @id @default(cuid())
     userId      String
     boothId     String
     answer      String
     isCorrect   Boolean
     timestamp   DateTime @default(now())
     user        User     @relation(fields: [userId], references: [id])
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
   }
   ```

3. **마이그레이션 실행**
   ```bash
   cd moducon-backend
   npx prisma migrate dev --name add-checkin-quiz
   npx prisma generate
   ```

---

## Phase 4: 체크인 + 퀴즈 API (2시간)

### API 엔드포인트 (5개)

#### 1. POST /api/checkin
**기능**: 부스 체크인 생성
**Request**:
```json
{
  "userId": "user_id",
  "boothId": "booth_id"
}
```
**Response**:
```json
{
  "success": true,
  "checkIn": {
    "id": "checkin_id",
    "userId": "user_id",
    "boothId": "booth_id",
    "timestamp": "2025-12-13T10:00:00Z"
  }
}
```

#### 2. GET /api/checkin/user/:userId
**기능**: 사용자별 체크인 목록 조회
**Response**:
```json
{
  "checkIns": [
    {
      "id": "checkin_id",
      "boothId": "booth_id",
      "timestamp": "2025-12-13T10:00:00Z"
    }
  ]
}
```

#### 3. POST /api/quiz
**기능**: 퀴즈 답변 제출 및 정답 확인
**Request**:
```json
{
  "userId": "user_id",
  "boothId": "booth_id",
  "answer": "user_answer"
}
```
**Response**:
```json
{
  "success": true,
  "isCorrect": true,
  "quiz": {
    "id": "quiz_id",
    "userId": "user_id",
    "boothId": "booth_id",
    "answer": "user_answer",
    "isCorrect": true
  }
}
```

#### 4. GET /api/quiz/user/:userId
**기능**: 사용자별 퀴즈 답변 목록
**Response**:
```json
{
  "quizzes": [
    {
      "id": "quiz_id",
      "boothId": "booth_id",
      "answer": "user_answer",
      "isCorrect": true,
      "timestamp": "2025-12-13T10:05:00Z"
    }
  ]
}
```

#### 5. GET /api/stats/user/:userId
**기능**: 사용자 통계 (체크인 수, 퀴즈 정답률)
**Response**:
```json
{
  "totalCheckIns": 5,
  "totalQuizzes": 3,
  "correctQuizzes": 2,
  "accuracy": 66.67,
  "badges": ["novice", "explorer"]
}
```

### 보안
- JWT 인증 미들웨어 적용
- 요청 검증 (Zod 스키마)
- Rate limiting

---

## Phase 5: 마이페이지 UI (1-1.5시간)

### 페이지 구조
**경로**: `/mypage`

### 4개 주요 컴포넌트

#### 1. ProfileCard
**기능**: 사용자 프로필 정보 표시
```tsx
<Card>
  <CardHeader>
    <CardTitle>프로필</CardTitle>
  </CardHeader>
  <CardContent>
    <div>이름: {user.name}</div>
    <div>전화번호: {user.phone}</div>
    <div>가입일: {user.createdAt}</div>
  </CardContent>
</Card>
```

#### 2. BadgeCollection
**기능**: 획득한 배지 컬렉션
```tsx
<Card>
  <CardHeader>
    <CardTitle>배지 컬렉션</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-3 gap-4">
      {badges.map(badge => (
        <div key={badge.id}>
          <span>{badge.emoji}</span>
          <p>{badge.name}</p>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

#### 3. CheckInStats
**기능**: 체크인 통계 대시보드
```tsx
<Card>
  <CardHeader>
    <CardTitle>체크인 통계</CardTitle>
  </CardHeader>
  <CardContent>
    <div>총 체크인: {stats.totalCheckIns}</div>
    <div>방문한 부스: {stats.visitedBooths}</div>
    <div>퀴즈 정답률: {stats.accuracy}%</div>
  </CardContent>
</Card>
```

#### 4. CheckpointList
**기능**: 체크포인트 목록 (최근 활동)
```tsx
<Card>
  <CardHeader>
    <CardTitle>최근 활동</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {checkpoints.map(cp => (
        <div key={cp.id}>
          <p>{cp.action}</p>
          <p className="text-sm">{cp.timestamp}</p>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

### API 연동
- `GET /api/stats/user/:userId` → CheckInStats
- `GET /api/checkin/user/:userId` → CheckpointList
- `GET /api/quiz/user/:userId` → BadgeCollection

---

## 🔑 핵심 기술 사항

### 데이터베이스
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Relations**: User ↔ CheckIn, User ↔ Quiz

### 인증
- **방식**: JWT
- **저장소**: HTTP-only cookies
- **만료**: 24시간

### 상태 관리
- **전역 상태**: Zustand
- **서버 상태**: React Query (선택 사항)

### 캐싱
- **Google Sheets**: sessionCache.ts (5분)
- **API 응답**: SWR 또는 React Query

---

## 📊 예상 일정

| Phase | 작업 | 소요 시간 | 담당자 |
|-------|------|----------|--------|
| Phase 3 | DB 마이그레이션 | 15분 | Backend Developer |
| Phase 4 | 체크인/퀴즈 API | 2시간 | Backend Developer |
| Phase 5 | 마이페이지 UI | 1-1.5시간 | Frontend Developer |
| **총합** | | **3-4시간** | |

---

## 🚀 배포 계획

### 단계별 배포
1. **Phase 3 완료 후**: DB 마이그레이션만 Railway 배포
2. **Phase 4 완료 후**: Backend API Vercel/Railway 배포
3. **Phase 5 완료 후**: Frontend Vercel 배포 (전체 완성)

### 환경 변수
```env
# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=...

# Frontend
NEXT_PUBLIC_API_URL=https://api.moducon.io
```

---

## ✅ 체크리스트

### Phase 3
- [ ] CheckIn 모델 추가
- [ ] Quiz 모델 추가
- [ ] Prisma migrate 실행
- [ ] DB 스키마 검증

### Phase 4
- [ ] POST /api/checkin 구현
- [ ] GET /api/checkin/user/:userId 구현
- [ ] POST /api/quiz 구현
- [ ] GET /api/quiz/user/:userId 구현
- [ ] GET /api/stats/user/:userId 구현
- [ ] JWT 미들웨어 적용
- [ ] API 테스트 (Postman/Thunder Client)

### Phase 5
- [ ] ProfileCard 컴포넌트 구현
- [ ] BadgeCollection 컴포넌트 구현
- [ ] CheckInStats 컴포넌트 구현
- [ ] CheckpointList 컴포넌트 구현
- [ ] API 연동 및 테스트
- [ ] 반응형 디자인 검증

---

**다음 담당자**: hands-on worker (Phase 3-5 구현)
