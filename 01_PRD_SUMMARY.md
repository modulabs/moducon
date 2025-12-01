# 모두콘 2025 디지털 컨퍼런스 북 - 프로젝트 요구사항 요약

## 📋 프로젝트 개요

**프로젝트명**: 모두콘 2025 디지털 컨퍼런스 북
**목표 일자**: 2025년 12월 13일 (토)
**예상 사용자**: 500~1,500명
**기술 스택**: Next.js + TypeScript + Tailwind CSS (PWA)

## 🎯 핵심 가치

**UVP (Unique Value Proposition)**
참가자의 관심 분야에 맞춰 **개인화된 단계형 퀘스트**를 제공하고, 게임처럼 LAB 부스와 페이퍼샵을 방문하며 'AI 데모'와 '최신 연구'를 경험하게 합니다.

**USP (Unique Selling Proposition)**
"상업적 굿즈 대신, 현업 개발자(LAB)의 '순수 AI 데모'를 '게임 퀘스트'로 경험하고, 그 '앱 소스코드'를 보상으로 받아 가는 유일한 컨퍼런스"

## ✨ 핵심 기능 (구현 완료)

### 1. 사용자 인증 ✅
- QR 코드 스캔 → 이름/전화번호 인증
- 디지털 서명 (Canvas 기반)
- JWT 토큰 기반 세션 관리

### 2. 디지털 배지 ✅
- 참가자 이름, 고유 QR 코드
- 모두콘 2025 로고
- PWA 캐싱으로 오프라인 접근 가능

### 3. 세션 정보 ✅
- 실시간 세션 스케줄 조회
- 트랙별 필터링 (Track A/B/C/D)
- 세션 상세 정보 (연사, 시간, 장소)

### 4. 부스 & 포스터 ✅
- LAB 부스 목록 및 상세 정보
- 페이퍼샵 포스터 목록
- Google Sheets 연동 (실시간 업데이트)

### 5. 모바일 최적화 ✅
- 반응형 디자인 (모바일 우선)
- PWA (Progressive Web App)
- 햅틱 피드백

## 🗄️ 데이터베이스 (Prisma)

### 주요 테이블

```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  phone        String   @unique
  role         String   @default("PARTICIPANT")
  signatureUrl String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model CheckIn {
  id        String   @id @default(uuid())
  userId    String
  type      String   // SESSION, BOOTH, POSTER
  targetId  String   // 세션/부스/포스터 ID
  timestamp DateTime @default(now())

  @@unique([userId, type, targetId])
  @@index([userId])
  @@index([type, targetId])
}

model Quiz {
  id            String   @id @default(uuid())
  userId        String
  sessionId     String
  answers       Json     // { q1: "A", q2: "C" }
  score         Int      // 0-100
  submittedAt   DateTime @default(now())

  @@unique([userId, sessionId])
  @@index([userId])
}
```

## 🔌 API 엔드포인트

### 인증 API
- `POST /api/auth/login` - 이름/전화번호 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### 체크인 API (Phase 3-5 구현 예정)
- `POST /api/checkin` - 체크인 기록
- `GET /api/checkin/:userId` - 사용자 체크인 내역
- `GET /api/checkin/stats/:userId` - 체크인 통계

### 퀴즈 API (Phase 3-5 구현 예정)
- `POST /api/quiz` - 퀴즈 제출
- `GET /api/quiz/:userId/:sessionId` - 퀴즈 결과 조회

### 세션 API
- `GET /api/sessions` - 세션 목록
- `GET /api/sessions/:id` - 세션 상세 정보

## 📱 주요 페이지 (구현 완료)

### 1. 홈 페이지 (`/home`) ✅
- 인사말 (사용자 이름)
- 퀘스트 진행도 (더미 데이터)
- 다가오는 세션 (실제 API 데이터)
- 디지털 배지
- 추천 부스

### 2. 세션 페이지 (`/sessions`) ✅
- 세션 목록 (시간순 정렬)
- 트랙별 필터링
- 세션 상세 정보

### 3. 부스 페이지 (`/booths`) ✅
- LAB 부스 목록
- 부스 상세 정보
- Google Sheets 연동

### 4. 포스터 페이지 (`/papers`) ✅
- 페이퍼샵 포스터 목록
- 포스터 상세 정보

### 5. 마이페이지 (`/mypage`) 🚧 **Phase 3-5 구현 예정**
- 프로필 정보
- 배지 컬렉션
- 체크인 통계
- 체크포인트 목록

## 🎨 UI/UX 특징

### 하단 네비게이션 ✅
- 세션, 부스, 포스터, 지도 탭
- **중앙 QR 버튼** (특별 디자인)
  - 그라디언트 배경
  - QR 아이콘 (lucide-react)
  - 애니메이션 효과
  - 링 테두리

### QR 스캐너 ✅
- html5-qrcode 라이브러리
- 카메라 접근 허용
- QR 코드 파싱
- 햅틱 피드백

### 디자인 시스템 ✅
- Tailwind CSS + shadcn/ui
- 반응형 그리드 레이아웃
- 다크 모드 지원 (선택적)
- 접근성 (ARIA 레이블)

## 📈 현재 진행 상황

### ✅ 완료 (Phase 1-2)
- 프론트엔드 기본 구조
- 사용자 인증 & 세션 관리
- 홈/세션/부스/포스터 페이지
- 모바일 PWA 최적화
- Google Sheets 연동

### 🚧 진행 예정 (Phase 3-5)
**예상 소요 시간**: 3-4시간

1. **Phase 3: Database 마이그레이션** (15분)
   - CheckIn, Quiz 모델 추가
   - Prisma migrate

2. **Phase 4: 체크인 + 퀴즈 API** (2시간)
   - 체크인 API 3개 엔드포인트
   - 퀴즈 API 2개 엔드포인트
   - JWT 인증 미들웨어

3. **Phase 5: 마이페이지 UI** (1-1.5시간)
   - Profile 섹션
   - Badges 섹션
   - Stats 섹션
   - Checkpoints 섹션

## 📚 주요 문서 위치

### 현재 디렉토리 (필수 문서)
- `01_PRD_SUMMARY.md` (본 문서) - 프로젝트 요구사항 요약
- `02_DEV_PLAN.md` - 개발 계획 및 다음 단계
- `07_PROGRESS.md` - 실시간 진행 상태

### claudedocs/ (상세 문서 & 대화 내역)
- `01_PRD.md` - 전체 PRD (61KB, 상세 버전)
- `02_dev_plan.md` - 기술 스택 및 아키텍처 상세
- `05_API_SPEC.md` - API 명세 전체
- `06_DB_DESIGN.md` - 데이터베이스 스키마 상세
- `188_DEV_PLAN_NEXT.md` - Phase 3-5 구현 가이드
- `191_USER_REQUEST_VERIFICATION.md` - 사용자 요구사항 검증
- `192_FINAL_VERIFICATION.md` - 최종 검증 보고서
- 대화 내역 191개 문서

## 🎯 성공 지표

- 참가자 앱 사용률 **80% 이상**
- 퀘스트 완료율 **60% 이상**
- 부스 방문 증가율 **전년 대비 40% 이상**
- 참가자 만족도 **4.5/5.0 이상**
- GitHub 스타 **100개 이상** (행사 후 1개월)

---

**최종 업데이트**: 2025-12-01
**다음 담당자**: hands-on worker (Phase 3-5 구현)
