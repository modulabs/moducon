# 187_PRD_SUMMARY.md - 모두콘 컨퍼런스 북 프로젝트 요구사항 요약

**작성일**: 2025-12-01
**작성자**: Planner Agent
**버전**: v2.0 (Phase 3-5 반영)
**문서 유형**: PRD 핵심 요약본

---

## 📋 프로젝트 개요

**프로젝트명**: 모두콘 2025 디지털 컨퍼런스 북 제작
**목표**: 참가자들이 QR 스캔을 통해 세션/부스/포스터를 체크인하고, 참여 기록을 관리하며, 성취를 공유할 수 있는 디지털 경험 제공

### 핵심 가치
1. **탐색의 편의성**: 77개 컨텐츠(세션 32, 부스 12, 포스터 33)를 쉽게 탐색
2. **참여의 재미**: QR 스캔 게임화 요소로 참여 동기 부여
3. **성취의 공유**: 마이페이지에서 체크인 통계를 자랑하기

---

## 🎯 현재 구현 상태 (Phase 1-2 완료, 40%)

### ✅ 완료된 기능 (Phase 1-2)

#### 1. 세션 탐색 시스템 (100%)
- **sessions.json**: 32개 세션 데이터 (하드코딩)
- **트랙별 필터링**: AI/ML, 데이터 엔지니어링 등
- **시간별 정렬**: 다가오는 세션 우선 표시
- **캐싱 전략**: localStorage 5분 만료
- **홈페이지**: 다가오는 세션 3개 자동 표시

**파일**:
- `moducon-frontend/src/data/sessions.json`
- `moducon-frontend/src/app/home/page.tsx`
- `moducon-frontend/src/lib/sessionCache.ts`

#### 2. QR 스캔 UI (100%)
- **전체 화면 카메라**: 몰입감 극대화
- **정사각형 스캔 가이드**: 280x280px, 흰색 테두리
- **모서리 강조선**: 4개 모서리 네온 효과
- **외부 어둡게 처리**: `shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]`
- **햅틱 피드백**: 진동 100ms

**파일**:
- `moducon-frontend/src/components/qr/QRScanner.tsx`
- `moducon-frontend/src/components/qr/QRScannerModal.tsx`

#### 3. 하단 네비게이션 (100%)
- **5개 탭**: 세션/부스/포스터/지도 + 중앙 QR
- **중앙 원형 QR 버튼**:
  - 그라데이션 배경 (`bg-gradient-to-r from-primary to-primary/80`)
  - 쉐도우 효과 (`shadow-[0_4px_12px_rgba(79,70,229,0.4)]`)
  - Pulse 애니메이션 (`animate-pulse`)
  - **QrCode 아이콘 적용** (w-7 h-7)
- **활성 탭 강조**: 파란색 + bold 텍스트

**파일**:
- `moducon-frontend/src/components/layout/BottomNavigation.tsx`

---

## 🚀 예정된 기능 (Phase 3-5, 60%)

### Phase 3: Database 설계 (0%)
**마이그레이션 필요**:
- `CheckIn` 모델: userId, contentType, contentId, checkedAt
- `Quiz` 모델: contentType, contentId, question, options, correctAnswer
- `QuizAttempt` 모델: userId, quizId, selectedAnswer, isCorrect

**인덱스**:
- `@@index([userId, contentType, contentId])` (CheckIn)
- `@@index([contentType, contentId])` (Quiz)

**파일**: `prisma/schema.prisma`

### Phase 4: 체크인 + 퀴즈 API (0%)
**엔드포인트**:
1. `POST /api/checkin`: QR 스캔 시 체크인 기록
2. `GET /api/checkin`: 사용자별 체크인 목록 조회
3. `GET /api/quiz`: 컨텐츠별 퀴즈 조회
4. `POST /api/quiz/submit`: 퀴즈 제출 및 정답 검증

**파일**:
- `moducon-backend/src/routes/checkin.ts`
- `moducon-backend/src/routes/quiz.ts`

### Phase 5: 마이페이지 UI (0%)
**컴포넌트**:
1. **통계 카드**: 체크인 개수, 퀴즈 정답률
2. **퀘스트 진행**: 진행 바 + 달성 배지
3. **최근 활동**: 시간순 체크인 목록
4. **공유하기 버튼**: SNS 공유 기능

**파일**:
- `moducon-frontend/src/app/mypage/page.tsx`
- `moducon-frontend/src/components/mypage/StatsCard.tsx`
- `moducon-frontend/src/components/mypage/QuestProgress.tsx`
- `moducon-frontend/src/components/mypage/ActivityList.tsx`

---

## 🔑 중점사항 (누락 없이 확인 필요)

### 1. Database 특이사항
- **Prisma ORM 사용**: PostgreSQL 연결
- **복합 인덱스**: 체크인 조회 성능 최적화
- **중복 체크인 방지**: `@@unique([userId, contentType, contentId])`
- **퀴즈 정답 비공개**: `GET /api/quiz`에서 `correctAnswer` 제외

### 2. API 특이사항
- **인증 필수**: 모든 엔드포인트에 JWT 토큰 필요
- **에러 응답 표준화**:
  ```json
  { "success": false, "error": "에러 메시지" }
  ```
- **성공 응답 표준화**:
  ```json
  { "success": true, "data": {...} }
  ```
- **체크인 중복 방지**: 이미 체크인한 경우 409 Conflict

### 3. 페이지 특이사항
- **홈페이지**:
  - ~~기존 더미 블록 제거 완료~~ ✅
  - 다가오는 세션 3개 자동 표시
  - DigitalBadge + QuestProgress 컴포넌트
- **하단 네비게이션**:
  - ~~QR 버튼 아이콘 추가 완료~~ ✅ (QrCode 아이콘 적용)
- **마이페이지**: Phase 5 구현 예정

### 4. UI 특이사항
- **QR 스캔 가이드**: 정사각형 280x280px, 모서리 강조선
- **햅틱 피드백**: navigator.vibrate(100)
- **중앙 QR 버튼**: Pulse 애니메이션 + 그라데이션
- **반응형 디자인**: Tailwind CSS 모바일 우선

---

## 📊 진행률 (40% 완료)

```
Phase 1:     QR 스캔 UI            ████████████████████ 100% ✅
Phase 2-1:   QR 카메라 영상         ████████████████████ 100% ✅
Phase 2-2:   하단 네비게이션         ████████████████████ 100% ✅
Phase 3:     Database             ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 4:     체크인 API            ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 5:     마이페이지             ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

---

## 🎯 다음 작업 우선순위

**🔴 P0: 즉시 착수** (15분)
- Phase 3: Database 마이그레이션
  - schema.prisma 수정 (3개 모델)
  - npx prisma migrate dev 실행

**🟡 P1: 1일 내** (3시간)
- Phase 4: 체크인 + 퀴즈 API (2시간)
- Phase 5: 마이페이지 UI (1시간)

---

## 📚 관련 문서

- **PRD 전체**: `claudedocs/01_PRD.md`
- **개발 계획**: `188_DEV_PLAN_NEXT.md`
- **API 명세**: `claudedocs/05_API_SPEC.md`
- **DB 설계**: `claudedocs/06_DB_DESIGN.md`
- **진행 상태**: `claudedocs/07_PROGRESS.md`

---

**다음 담당자**: hands-on worker (Phase 3 Database 마이그레이션 착수)
