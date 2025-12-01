# 183_PRD_SUMMARY.md - 모두콘 컨퍼런스 북 프로젝트 요구사항 요약본

**작성일**: 2025-12-01
**작성자**: Technical Lead
**버전**: v2.0
**문서 유형**: PRD 통합 요약

---

## 📋 프로젝트 개요

**프로젝트명**: 모두콘 2025 디지털 컨퍼런스 북 제작
**목표**: 참가자가 QR 스캔을 통해 세션/부스/포스터를 체크인하고, 참여 기록을 관리하며, 성취를 공유할 수 있는 디지털 경험 제공
**런칭일**: 2025년 12월 13일 (토)
**예상 사용자**: 500~1,500명

---

## 🎯 핵심 가치

### 1. 탐색의 편의성
77개 컨텐츠(세션 32, 부스 12, 포스터 33)를 쉽게 탐색

### 2. 참여의 재미
QR 스캔 게임화 요소로 참여 동기 부여

### 3. 성취의 공유
마이페이지에서 체크인 통계를 자랑하기

---

## ✅ 현재 구현 상태 (Phase 1-2 완료, 40%)

### 완료된 기능 (4개)

#### 1. 세션 탐색 시스템 (100%)
- **데이터**: sessions.json (32개 세션)
- **필터링**: 트랙별 (AI/ML, 데이터 엔지니어링 등)
- **정렬**: 시간별 (다가오는 세션 우선)
- **캐싱**: localStorage 5분 만료
- **홈페이지**: 다가오는 세션 3개 자동 표시

**핵심 파일**:
- `moducon-frontend/src/data/sessions.json`
- `moducon-frontend/src/app/home/page.tsx`
- `moducon-frontend/src/lib/sessionCache.ts`

#### 2. QR 스캔 UI (100%)
- **전체 화면 카메라**: 몰입감 극대화
- **정사각형 스캔 가이드**: 280x280px, 흰색 테두리
- **모서리 강조선**: 4개 모서리 네온 효과
- **외부 어둡게 처리**: `shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]` (창의적 기법)
- **햅틱 피드백**: 진동 100ms

**핵심 파일**:
- `moducon-frontend/src/components/QRScanner.tsx`

#### 3. 하단 네비게이션 (100%)
- **5개 탭**: 세션/부스/포스터/지도/QR
- **중앙 원형 QR 버튼**:
  - 그라데이션 (`from-primary to-primary/80`)
  - 쉐도우 (`shadow-[0_4px_12px_rgba(79,70,229,0.4)]`)
  - Pulse 애니메이션 (`animate-pulse`)
  - `-top-2` 오프셋 (떠있는 효과)
- **QR 아이콘**: `<QrCode>` 아이콘 적용 완료 ✅
- **접근성**: aria-label, 키보드 네비게이션

**핵심 파일**:
- `moducon-frontend/src/components/layout/BottomNavigation.tsx`

#### 4. QR 파싱 로직 (100%)
**지원 QR 형식** (6가지):
1. `checkin-session-{id}`: 세션 체크인
2. `checkin-booth-{id}`: 부스 방문
3. `checkin-paper-{id}`: 포스터 열람
4. `quiz-{id}`: 퀴즈 팝업
5. `hidden-{id}`: 히든 배지
6. `direct-{url}`: 외부 링크

**핵심 파일**:
- `moducon-frontend/src/lib/qrParser.ts`

---

## ⏳ 예정된 기능 (Phase 3-5, 60%)

### Phase 3: Database 마이그레이션 (15분)

**신규 테이블** (3개):

#### 1. user_checkins
체크인 기록 저장
```prisma
model UserCheckin {
  id           Int      @id @default(autoincrement())
  userId       Int      @map("user_id")
  targetType   String   @map("target_type") // 'session', 'booth', 'paper'
  targetId     String   @map("target_id")
  checkedInAt  DateTime @default(now()) @map("checked_in_at")

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, targetType, targetId]) // 중복 방지
  @@index([userId])
  @@map("user_checkins")
}
```

#### 2. quizzes
퀴즈 문제 관리
```prisma
model Quiz {
  id         Int      @id @default(autoincrement())
  targetType String   @map("target_type")
  targetId   String   @map("target_id")
  question   String   @db.Text
  answer     String
  options    Json     // {"A": "AI/ML", "B": "데이터", ...}
  createdAt  DateTime @default(now()) @map("created_at")

  attempts UserQuizAttempt[]

  @@map("quizzes")
}
```

#### 3. user_quiz_attempts
퀴즈 응답 기록
```prisma
model UserQuizAttempt {
  id            Int      @id @default(autoincrement())
  userId        Int      @map("user_id")
  quizId        Int      @map("quiz_id")
  selectedAnswer String   @map("selected_answer")
  isCorrect     Boolean  @map("is_correct")
  attemptedAt   DateTime @default(now()) @map("attempted_at")

  user User @relation(fields: [userId], references: [id])
  quiz Quiz @relation(fields: [quizId], references: [id])

  @@index([userId])
  @@map("user_quiz_attempts")
}
```

**작업**:
1. `schema.prisma` 수정
2. `npx prisma migrate dev --name add_checkin_quiz_tables` 실행
3. Prisma Studio 검증

---

### Phase 4: 체크인 + 퀴즈 API (2시간)

**신규 API 엔드포인트** (5개):

#### 1. POST /api/checkin
체크인 생성
```typescript
// 요청
{
  "targetType": "session" | "booth" | "paper",
  "targetId": "session-1"
}

// 응답
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

#### 2. GET /api/checkins/user/:userId
사용자별 체크인 목록
```typescript
// 응답
{
  "checkins": [
    {
      "id": 123,
      "targetType": "session",
      "targetId": "session-1",
      "checkedInAt": "2025-12-01T09:00:00Z"
    }
  ]
}
```

#### 3. GET /api/checkins/stats/:userId
사용자 통계
```typescript
// 응답
{
  "stats": {
    "totalCheckins": 25,
    "sessionCheckins": 8,
    "boothCheckins": 5,
    "paperCheckins": 12,
    "quizAttempts": 10,
    "quizCorrect": 7
  }
}
```

#### 4. GET /api/quiz/:targetType/:targetId
퀴즈 조회 (정답 숨김)
```typescript
// 응답
{
  "quiz": {
    "id": 1,
    "question": "이 세션의 주요 주제는?",
    "options": {
      "A": "AI/ML",
      "B": "데이터 엔지니어링",
      "C": "클라우드",
      "D": "보안"
    }
    // 정답은 클라이언트에 노출 안 됨
  }
}
```

#### 5. POST /api/quiz/submit
퀴즈 제출 및 정답 확인
```typescript
// 요청
{
  "quizId": 1,
  "selectedAnswer": "A"
}

// 응답
{
  "isCorrect": true,
  "correctAnswer": "A" // 정답 시에만 노출
}
```

---

### Phase 5: 마이페이지 UI (1시간)

**신규 컴포넌트** (4개):

#### 1. MyPage.tsx (메인 페이지)
3개 섹션 통합

#### 2. Statistics.tsx (통계 카드)
6개 통계 지표 시각화:
- 🎓 세션 참여: 8/32
- 🏢 부스 방문: 5/12
- 📄 포스터 열람: 12/33
- ❓ 퀴즈 시도: 10
- ✅ 퀴즈 정답: 7
- 🎯 총 체크인: 25

#### 3. VisitHistory.tsx (방문 기록)
방문 기록 목록 (시간순)

#### 4. ShareCard.tsx (자랑하기)
- QR 코드 생성
- 통계 이미지 다운로드
- SNS 공유 기능

---

## 🗄️ Database 구조

### 기존 테이블 (완료)
1. **users**: 사용자 정보
2. **auth_sessions**: JWT 토큰 세션
3. **signatures**: 세션 서명 기록
4. **admins**: 관리자 계정

### 신규 테이블 (예정)
5. **user_checkins**: 체크인 기록
6. **quizzes**: 퀴즈 문제
7. **user_quiz_attempts**: 퀴즈 응답

---

## 🔌 API 엔드포인트

### 기존 API (완료)
- `POST /api/auth/register`: 회원가입
- `POST /api/auth/login`: 로그인
- `POST /api/auth/logout`: 로그아웃
- `GET /api/auth/me`: 현재 사용자 정보

### 신규 API (예정)
- `POST /api/checkin`: 체크인 생성
- `GET /api/checkins/user/:userId`: 사용자별 체크인 목록
- `GET /api/checkins/stats/:userId`: 통계
- `GET /api/quiz/:targetType/:targetId`: 퀴즈 조회
- `POST /api/quiz/submit`: 퀴즈 제출

---

## 🎨 주요 특이사항

### 1. Database 특이사항
- **PostgreSQL 14+**: Supabase 사용
- **Prisma ORM**: 타입 안전성 보장
- **중복 방지**: `@@unique([userId, targetType, targetId])`
  - 같은 사용자가 같은 세션을 2번 체크인 불가
- **인덱스 최적화**: userId, targetType, targetId

### 2. API 특이사항
- **RESTful 설계**: 명확한 엔드포인트 네이밍
- **정답 숨김**: 퀴즈 조회 시 정답을 클라이언트에 노출 안 함 (보안)
- **에러 핸들링**: 일관된 에러 응답 구조
  ```typescript
  {
    "error": "DUPLICATE_CHECKIN",
    "message": "이미 체크인하셨습니다."
  }
  ```

### 3. 페이지 특이사항
- **57개 정적 페이지**: Next.js App Router
  - 세션: 32개 동적 라우트 (`/sessions/[id]`)
  - 부스: 12개 동적 라우트 (`/booths/[id]`)
  - 포스터: 33개 동적 라우트 (`/papers/[id]`)

### 4. UI 특이사항
- **하단 네비게이션**: 중앙 원형 QR 버튼 (`-top-2`)
- **QR 스캔**: 전체 화면 카메라 + 정사각형 가이드
- **외부 어둡게**: `shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]` (창의적)
- **모서리 강조**: 4개 모서리 네온 효과

---

## 🔄 QR 스캔 플로우 (전체)

### 현재 완료 (Phase 1-2)
1. ✅ 사용자 QR 버튼 클릭 (하단 네비게이션)
2. ✅ 카메라 활성화 (전체 화면)
3. ✅ QR 코드 인식
4. ✅ QR 값 파싱 (6가지 형식)
5. ✅ UI 표시 (정사각형 박스, 카메라 영상)
6. ✅ 햅틱 피드백 (진동 100ms)

### 추가 필요 (Phase 4-5)
7. ⏳ 퀴즈 여부 확인 (`GET /api/quiz/:targetType/:targetId`)
8. ⏳ 퀴즈가 있으면 → 퀴즈 모달 표시
9. ⏳ 정답 시 → 체크인 API 호출 (`POST /api/checkin`)
10. ⏳ 완료 메시지 표시

---

## ⚙️ 기술 스택

### Frontend
- **Framework**: Next.js 14.2.24 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **QR Scanner**: html5-qrcode 2.3.8
- **Icons**: lucide-react

### Backend
- **Framework**: Express.js 5.0.1
- **Language**: TypeScript 5
- **Database**: PostgreSQL 14+ (Supabase)
- **ORM**: Prisma 6.1.0
- **Auth**: JWT

### DevOps
- **Frontend Deploy**: Vercel
- **Backend Deploy**: Render
- **Database**: Supabase PostgreSQL
- **CI/CD**: GitHub Actions (빌드 검증)

---

## 📊 프로젝트 진행 현황

### 전체 진행률: 40% (Phase 1-2 완료)

```
Phase 1:     QR 스캔 UI            ████████████████████ 100% ✅
Phase 2-1:   QR 카메라 영상         ████████████████████ 100% ✅
Phase 2-2:   하단 네비게이션         ████████████████████ 100% ✅
Phase 3:     Database             ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 4:     체크인 API            ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 5:     마이페이지             ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

### 예상 작업 시간
- **Phase 3**: 15분 (Database 마이그레이션)
- **Phase 4**: 2시간 (체크인 + 퀴즈 API)
- **Phase 5**: 1시간 (마이페이지 UI)
- **총계**: 3.25시간

---

## 🚀 사용자 신규 요구사항 (추가)

### 1. ✅ 홈 화면 더미 블록 제거 (완료)
**대상 블록**:
- 참가자 카드 (디지털 배지 중복)
- 빠른 이동 카드 (하단 네비게이션으로 대체)

**상태**: Phase 2-2에서 하단 네비게이션으로 대체 완료

### 2. ✅ QR 버튼에 QR 아이콘 추가 (완료)
**요구사항**: `<QrCode>` lucide-react 아이콘 추가

**상태**: BottomNavigation.tsx에 이미 적용 완료 ✅

---

## 📝 참고 문서

### 핵심 문서 (claudedocs/)
1. **01_PRD.md**: 전체 PRD 원본 (상세 버전)
2. **177_PROJECT_SUMMARY.md**: 프로젝트 전체 요약
3. **178_DEV_PLAN_SUMMARY.md**: Phase 3-5 개발 계획
4. **182_FINAL_PROJECT_EVALUATION.md**: 프로젝트 최종 평가 (7.88/10, B+)

---

## 🎯 다음 작업 (우선순위)

### 🔴 P0: 즉시 착수
1. **Phase 3 착수** (15분)
   - schema.prisma 수정 (3개 모델)
   - npx prisma migrate dev 실행
   - Git 커밋

### 🟡 P1: 1일 내
2. **Phase 4 착수** (2시간)
   - src/routes/checkin.ts 생성
   - src/routes/quiz.ts 생성
   - API 테스트

3. **Phase 5 착수** (1시간)
   - app/my/page.tsx 생성
   - 4개 컴포넌트 구현

---

**작성 완료 시각**: 2025-12-01 16:00 KST
**문서 버전**: v2.0
**다음 담당자**: hands-on worker (Phase 3 Database 작업)
