# 171_SESSION_DATA_PLAN.md - 세션 데이터 관리 계획

**작성일**: 2025-12-01
**작성자**: hands-on worker
**목적**: 세션 데이터 관리 및 QR 기능 완성을 위한 개발 계획

---

## 📋 현재 상태 요약

### ✅ 완료된 작업 (Phase 1-2)
- **Phase 1**: QR 스캔 UI 기본 구현
- **Phase 2-1**: QR 카메라 영상 표시 개선
- **Phase 2-2**: 하단 네비게이션 + UI 보완

### ⏳ 남은 작업 (Phase 3-5)
- **Phase 3**: Database 마이그레이션 (15분)
- **Phase 4**: 체크인 API 구현 (2시간)
- **Phase 5**: 마이페이지 구현 (1시간)

---

## 🎯 작업 우선순위

### 🔴 P0: 즉시 착수 필요
1. **Database 마이그레이션** (15분)
   - 3개 신규 테이블 생성
   - Prisma 스키마 마이그레이션 실행

### 🟡 P1: Database 완료 후
2. **체크인 API 구현** (2시간)
   - 5개 API 엔드포인트
   - QR 스캔 → 체크인 로직

3. **마이페이지 구현** (1시간)
   - 방문 기록 UI
   - 통계 대시보드

---

## 📊 Phase 3: Database 마이그레이션

### 목표
- 3개 신규 테이블 생성 완료
- 기존 데이터 영향 없음 보장

### 신규 테이블
```prisma
model UserCheckin {
  id          String   @id @default(cuid())
  userId      String
  targetType  String   // "session" | "booth" | "poster"
  targetId    String
  checkedAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, targetType, targetId])
  @@index([userId])
  @@index([targetType, targetId])
}

model Quiz {
  id          String   @id @default(cuid())
  targetType  String   // "session" | "booth" | "poster"
  targetId    String
  question    String
  options     Json     // ["A", "B", "C", "D"]
  correctAnswer String

  attempts UserQuizAttempt[]

  @@unique([targetType, targetId])
}

model UserQuizAttempt {
  id          String   @id @default(cuid())
  userId      String
  quizId      String
  selectedAnswer String
  isCorrect   Boolean
  attemptedAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  quiz Quiz @relation(fields: [quizId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([quizId])
}
```

### 마이그레이션 명령어
```bash
cd moducon-backend
npx prisma migrate dev --name add_checkin_quiz_tables
```

### 검증 방법
```bash
# 마이그레이션 성공 확인
npx prisma studio

# 테이블 확인
# - user_checkins
# - quizzes
# - user_quiz_attempts
```

---

## 📊 Phase 4: 체크인 API 구현

### 목표
- 5개 API 엔드포인트 완성
- QR 스캔 → 체크인 → DB 저장 플로우 완성

### API 명세

#### 1. POST /api/checkin
**요청**:
```typescript
{
  "userId": "user123",
  "targetType": "session" | "booth" | "poster",
  "targetId": "target456"
}
```

**응답**:
```typescript
{
  "success": true,
  "checkin": {
    "id": "checkin789",
    "userId": "user123",
    "targetType": "session",
    "targetId": "target456",
    "checkedAt": "2025-12-01T10:00:00Z"
  }
}
```

#### 2. GET /api/checkins/user/:userId
**응답**:
```typescript
{
  "checkins": [
    {
      "id": "checkin789",
      "targetType": "session",
      "targetId": "target456",
      "checkedAt": "2025-12-01T10:00:00Z"
    }
  ]
}
```

#### 3. POST /api/quiz/submit
**요청**:
```typescript
{
  "userId": "user123",
  "quizId": "quiz456",
  "selectedAnswer": "B"
}
```

**응답**:
```typescript
{
  "success": true,
  "isCorrect": true,
  "attempt": {
    "id": "attempt789",
    "userId": "user123",
    "quizId": "quiz456",
    "selectedAnswer": "B",
    "isCorrect": true,
    "attemptedAt": "2025-12-01T10:00:00Z"
  }
}
```

#### 4. GET /api/quiz/:targetType/:targetId
**응답**:
```typescript
{
  "quiz": {
    "id": "quiz456",
    "targetType": "session",
    "targetId": "target123",
    "question": "이 세션의 주제는?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "B"
  }
}
```

#### 5. GET /api/checkins/stats/:userId
**응답**:
```typescript
{
  "stats": {
    "totalCheckins": 15,
    "sessions": 8,
    "booths": 4,
    "posters": 3,
    "quizzesAttempted": 5,
    "quizzesCorrect": 4
  }
}
```

---

## 📊 Phase 5: 마이페이지 구현

### 목표
- 마이페이지 UI 완성
- 방문 기록, 통계, 자랑하기 기능 구현

### 컴포넌트 구조
```
app/my/
├── page.tsx              (메인 페이지)
└── components/
    ├── VisitHistory.tsx  (방문 기록)
    ├── ShareCard.tsx     (자랑하기 카드)
    └── Statistics.tsx    (통계 대시보드)
```

### UI 섹션

#### 1. 통계 대시보드 (Statistics.tsx)
```tsx
<div className="grid grid-cols-2 gap-4">
  <StatCard title="총 방문" value={15} icon="📍" />
  <StatCard title="세션" value={8} icon="🎤" />
  <StatCard title="부스" value={4} icon="🏢" />
  <StatCard title="포스터" value={3} icon="📄" />
  <StatCard title="퀴즈 정답률" value="80%" icon="✅" />
</div>
```

#### 2. 방문 기록 (VisitHistory.tsx)
```tsx
<div className="space-y-3">
  {checkins.map(checkin => (
    <CheckinCard
      key={checkin.id}
      type={checkin.targetType}
      title={getTargetTitle(checkin)}
      timestamp={checkin.checkedAt}
    />
  ))}
</div>
```

#### 3. 자랑하기 카드 (ShareCard.tsx)
```tsx
<div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white">
  <h2 className="text-2xl font-bold mb-2">모두콘 2025 참여!</h2>
  <p className="text-sm mb-4">총 {totalCheckins}곳 방문</p>
  <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg">
    SNS 공유하기 📤
  </button>
</div>
```

---

## 🔄 QR 스캔 플로우

### 현재 구현 (Phase 1-2)
```
1. 사용자 QR 버튼 클릭
2. 카메라 활성화
3. QR 코드 인식
4. ✅ UI 표시 완료
```

### 추가 필요 (Phase 4-5)
```
5. QR 값 파싱
   ├─ "session:123" → 세션 체크인
   ├─ "booth:456" → 부스 체크인
   └─ "poster:789" → 포스터 체크인

6. 퀴즈 여부 확인
   ├─ 퀴즈 있음 → GET /api/quiz/:type/:id
   └─ 퀴즈 없음 → POST /api/checkin

7. 퀴즈 있을 경우
   ├─ 퀴즈 모달 표시
   ├─ 사용자 답변 선택
   ├─ POST /api/quiz/submit
   └─ 정답일 경우만 POST /api/checkin

8. 완료 메시지 표시
```

---

## 📁 예상 파일 변경 사항

### Backend (Phase 3-4)
```
moducon-backend/
├── prisma/
│   └── schema.prisma                    (수정)
└── src/
    ├── routes/
    │   ├── checkin.ts                   (신규)
    │   └── quiz.ts                      (신규)
    └── middleware/
        └── validateCheckin.ts           (신규)
```

### Frontend (Phase 5)
```
moducon-frontend/src/
├── app/
│   └── my/
│       ├── page.tsx                     (신규)
│       └── components/
│           ├── VisitHistory.tsx         (신규)
│           ├── ShareCard.tsx            (신규)
│           └── Statistics.tsx           (신규)
├── components/
│   ├── QRScanner.tsx                    (수정 - API 호출 추가)
│   └── QuizModal.tsx                    (신규)
└── lib/
    └── api/
        ├── checkin.ts                   (신규)
        └── quiz.ts                      (신규)
```

---

## ⏱️ 작업 시간 추정

| Phase | 작업 내용 | 예상 시간 |
|-------|-----------|-----------|
| Phase 3 | Database 마이그레이션 | 15분 |
| Phase 4-1 | 체크인 API (3개) | 1시간 |
| Phase 4-2 | 퀴즈 API (2개) | 1시간 |
| Phase 5-1 | 마이페이지 UI | 40분 |
| Phase 5-2 | QR 스캔 플로우 통합 | 20분 |
| **총계** | **전체 작업** | **3.25시간** |

---

## ✅ 작업 체크리스트

### Phase 3: Database
- [ ] schema.prisma 수정 (3개 모델 추가)
- [ ] `npx prisma migrate dev` 실행
- [ ] Prisma Studio로 테이블 확인
- [ ] Git 커밋

### Phase 4: API
- [ ] src/routes/checkin.ts 생성
- [ ] src/routes/quiz.ts 생성
- [ ] POST /api/checkin 구현
- [ ] GET /api/checkins/user/:userId 구현
- [ ] POST /api/quiz/submit 구현
- [ ] GET /api/quiz/:type/:id 구현
- [ ] GET /api/checkins/stats/:userId 구현
- [ ] 빌드 검증
- [ ] Git 커밋

### Phase 5: Frontend
- [ ] app/my/page.tsx 생성
- [ ] Statistics.tsx 구현
- [ ] VisitHistory.tsx 구현
- [ ] ShareCard.tsx 구현
- [ ] QuizModal.tsx 생성
- [ ] QRScanner.tsx 수정 (API 호출 추가)
- [ ] lib/api/checkin.ts 생성
- [ ] lib/api/quiz.ts 생성
- [ ] 빌드 검증
- [ ] Git 커밋

---

## 🎯 완료 기준

### Phase 3 완료 조건
- ✅ 3개 테이블 생성 완료
- ✅ Prisma Studio에서 테이블 확인

### Phase 4 완료 조건
- ✅ 5개 API 엔드포인트 동작
- ✅ Postman/Thunder Client 테스트 통과
- ✅ TypeScript 빌드 성공

### Phase 5 완료 조건
- ✅ 마이페이지 접근 가능
- ✅ QR 스캔 → 체크인 → DB 저장 성공
- ✅ 퀴즈 정답 시 체크인 기록
- ✅ 통계 정확히 표시

---

**다음 담당자**: hands-on worker (Phase 3 착수)
