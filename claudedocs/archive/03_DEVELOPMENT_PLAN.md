# 03_DEVELOPMENT_PLAN.md - 개발 계획서

**프로젝트명**: 모두콘 2025 디지털 컨퍼런스 북 개선
**버전**: v1.0
**작성일**: 2025-11-30
**작성자**: Technical Lead

---

## 📋 개요

PRD v1.8에서 정의한 2개 신규 요구사항에 대한 구체적 개발 계획입니다.

### 작업 범위
1. **QR 스캐너 UI/UX 개선**: 2-4시간
2. **세션 데이터 실시간 연동**: 4-6시간
3. **총 예상 시간**: 6-10시간

---

## 🏗️ 시스템 아키텍처

### 현재 아키텍처
```
┌─────────────────┐
│   Next.js 16    │
│   Frontend      │
│   (Port 3000)   │
└────────┬────────┘
         │
         │ REST API
         ▼
┌─────────────────┐
│   Express.js    │
│   Backend       │
│   (Port 3001)   │
└────────┬────────┘
         │
         │ Google Sheets API
         ▼
┌─────────────────┐
│  Google Sheets  │
│   Spreadsheet   │
└─────────────────┘
```

### 개선 후 아키텍처
```
┌──────────────────────────────────┐
│        Next.js 16 Frontend       │
├──────────────────────────────────┤
│  QRFloatingButton (신규)         │
│    ├─ QRScannerModal             │
│    ├─ html5-qrcode               │
│    └─ Camera API                 │
│                                   │
│  SessionsPage (개선)             │
│    ├─ fetchSessionsWithCache     │
│    ├─ sessionStorage (5분 캐시)  │
│    └─ 트랙 필터링                │
└────────┬─────────────────────────┘
         │
         │ REST API (/api/sessions)
         │ POST /api/verify-qr
         ▼
┌──────────────────────────────────┐
│      Express.js Backend          │
├──────────────────────────────────┤
│  googleSheetsService (개선)     │
│    ├─ getSessions()              │
│    ├─ filterSessions()           │
│    └─ axios + Google API         │
│                                   │
│  QR 검증 로직 (신규)             │
│    ├─ JWT 기반 인증              │
│    └─ 체크인 기록                │
└────────┬─────────────────────────┘
         │
         │ Google Sheets API v4
         ▼
┌──────────────────────────────────┐
│       Google Sheets              │
│  Spreadsheet ID: 1djkPQzg...     │
│    ├─ "세션" (33개 세션)         │
│    ├─ "부스" (13개 부스)         │
│    └─ "포스터" (33개 포스터)     │
└──────────────────────────────────┘
```

---

## 📂 디렉토리 구조

### 신규/수정 파일 목록
```
moducon-frontend/
├── src/
│   ├── components/
│   │   └── qr/
│   │       ├── QRFloatingButton.tsx (신규)
│   │       ├── QRScannerModal.tsx (신규)
│   │       ├── QRScanner.tsx (기존 - 리팩토링)
│   │       └── icons/
│   │           └── QRIcon.tsx (신규)
│   ├── lib/
│   │   └── sessionCache.ts (신규)
│   ├── types/
│   │   └── session.ts (신규)
│   └── app/
│       ├── sessions/
│       │   └── page.tsx (수정)
│       └── home/
│           └── page.tsx (수정 - QR 버튼 추가)

moducon-backend/
└── src/
    ├── services/
    │   └── googleSheetsService.ts (수정)
    ├── routes/
    │   ├── sessions.ts (기존 - 확인)
    │   └── qr.ts (신규)
    ├── types/
    │   └── session.ts (신규)
    └── middleware/
        └── errorHandler.ts (수정)
```

---

## 📅 개발 일정

### Phase 1: 백엔드 개발 (2-3시간)

#### Day 1 - Morning (2시간)
**담당**: Backend Developer
**목표**: Google Sheets API 연동 완료

**Task 1.1: 환경 설정 (30분)**
- [ ] `.env` 파일에 Google Sheets API 키 추가
- [ ] `axios` 패키지 설치 확인
- [ ] Spreadsheet ID 환경 변수 설정

**Task 1.2: 타입 정의 (30분)**
- [ ] `src/types/session.ts` 생성
- [ ] `Session` 인터페이스 정의
- [ ] `SessionRaw` 인터페이스 정의

**Task 1.3: Google Sheets Service 구현 (1시간)**
- [ ] `getSessions()` 함수 구현
  - Google Sheets API 호출
  - 데이터 파싱 (시간, 해시태그)
  - 난이도 추론 로직
- [ ] `getSessionById()` 함수 구현
- [ ] `filterSessions()` 함수 구현
- [ ] 에러 핸들링 추가

**검증**:
```bash
# 로컬 테스트
curl http://localhost:3001/api/sessions
# Expected: 33개 세션 데이터 반환
```

---

### Phase 2: 프론트엔드 개발 (4-6시간)

#### Day 1 - Afternoon (3시간)
**담당**: Frontend Developer
**목표**: QR 스캐너 UI 완성

**Task 2.1: QR 컴포넌트 개발 (2시간)**
- [ ] `QRIcon.tsx` SVG 컴포넌트 생성
- [ ] `QRFloatingButton.tsx` 원형 버튼 구현
  - 버튼 디자인 (120px 원형, 그라데이션)
  - Pulse 애니메이션
  - 툴팁 (3초 자동 사라짐)
- [ ] `QRScannerModal.tsx` 전체 화면 모달 구현
  - 카메라 뷰 통합
  - 스캔 가이드라인 오버레이
  - 사용 안내 메시지
  - 에러 핸들링

**Task 2.2: Tailwind 설정 (30분)**
- [ ] `tailwind.config.js` 커스텀 애니메이션 추가
- [ ] `fade-in-out` 키프레임 정의
- [ ] Pulse 애니메이션 확인

**Task 2.3: 홈 페이지 통합 (30분)**
- [ ] `app/home/page.tsx`에 `QRFloatingButton` 추가
- [ ] QR 스캔 핸들러 구현
- [ ] Toast 알림 연동

**검증**:
- [ ] 모바일 브라우저에서 QR 버튼 표시 확인
- [ ] 카메라 권한 요청 정상 동작
- [ ] QR 스캔 성공 시 체크인 완료 메시지

---

#### Day 2 - Morning (2시간)
**담당**: Frontend Developer
**목표**: 세션 데이터 연동 완료

**Task 2.4: 캐싱 레이어 구현 (1시간)**
- [ ] `lib/sessionCache.ts` 생성
- [ ] `fetchSessionsWithCache()` 함수 구현
  - sessionStorage 캐싱 (5분)
  - 캐시 유효성 검증
- [ ] `invalidateSessionsCache()` 함수 구현

**Task 2.5: 세션 페이지 업데이트 (1시간)**
- [ ] `app/sessions/page.tsx` 수정
  - `fetchSessionsWithCache()` 연동
  - 새로고침 버튼 추가
  - 에러 상태 처리
  - 로딩 스피너 개선
- [ ] 트랙 필터 동작 확인
- [ ] 난이도 배지 색상 확인

**검증**:
```bash
# 프론트엔드 테스트
npm run dev
# /sessions 페이지 접속
# Expected: 33개 세션 카드 표시
```

---

### Phase 3: 통합 테스트 (1시간)

#### Day 2 - Afternoon (1시간)
**담당**: QA Lead
**목표**: End-to-End 테스트 완료

**Task 3.1: 기능 테스트 (30분)**
- [ ] QR 스캐너
  - 원형 버튼 클릭 → 모달 오픈
  - 카메라 활성화 확인
  - QR 코드 스캔 성공
  - 햅틱 피드백 동작 (모바일)
- [ ] 세션 페이지
  - 33개 세션 모두 표시
  - 트랙 필터 동작
  - 캐싱 확인 (네트워크 탭)
  - 새로고침 버튼 동작

**Task 3.2: 성능 테스트 (15분)**
- [ ] 세션 API 응답 시간 < 500ms
- [ ] 캐시 적중 시 응답 시간 < 10ms
- [ ] QR 스캔 응답 시간 < 1초

**Task 3.3: 에러 시나리오 테스트 (15분)**
- [ ] 네트워크 오프라인 시 캐시 동작
- [ ] Google Sheets API 오류 시 에러 메시지
- [ ] 카메라 권한 거부 시 안내 메시지

---

## 🛠️ 기술 스택 및 의존성

### 기존 의존성
```json
{
  "frontend": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "html5-qrcode": "^2.3.8",
    "lucide-react": "^0.263.1"
  },
  "backend": {
    "express": "^4.18.2",
    "typescript": "^5.0.0",
    "dotenv": "^16.0.3"
  }
}
```

### 신규 의존성
```bash
# 백엔드
cd moducon-backend
npm install axios

# 프론트엔드 (추가 설치 없음)
```

---

## 🔐 보안 고려사항

### 환경 변수 관리
```bash
# moducon-backend/.env
GOOGLE_SHEETS_API_KEY=AIzaSy...  # Google Cloud Console에서 발급
SPREADSHEET_ID=1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g
NODE_ENV=development

# moducon-frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### .gitignore 확인
```bash
# 이미 설정되어 있는지 확인
cat .gitignore | grep ".env"
# .env
# .env.local
# .env.production
```

### API 키 제한 설정
1. Google Cloud Console → API 및 서비스 → 사용자 인증 정보
2. API 키 편집 → 애플리케이션 제한사항
   - HTTP 리퍼러 제한: `https://moducon.modulabs.co.kr/*`
3. API 제한사항
   - Google Sheets API만 허용

---

## 📊 모니터링 및 로깅

### 백엔드 로깅
```typescript
// moducon-backend/src/utils/logger.ts

export function logGoogleSheetsRequest(success: boolean, duration: number) {
  console.log({
    timestamp: new Date().toISOString(),
    service: 'GoogleSheets',
    success,
    duration: `${duration}ms`,
    endpoint: '/api/sessions'
  });
}

// 사용
const startTime = Date.now();
try {
  const sessions = await getSessions();
  logGoogleSheetsRequest(true, Date.now() - startTime);
} catch (error) {
  logGoogleSheetsRequest(false, Date.now() - startTime);
}
```

### 프론트엔드 로깅
```typescript
// moducon-frontend/src/lib/analytics.ts

export function trackQRScan(success: boolean, duration: number) {
  console.log({
    event: 'qr_scan',
    success,
    duration,
    timestamp: new Date().toISOString()
  });

  // Google Analytics 연동 (옵션)
  if (window.gtag) {
    window.gtag('event', 'qr_scan', {
      success,
      duration
    });
  }
}
```

---

## ✅ 완료 기준 (Definition of Done)

### QR 스캐너 UI
- [ ] 원형 버튼이 모든 페이지에 표시됨
- [ ] 버튼 클릭 시 전체 화면 모달 오픈
- [ ] 후방 카메라 자동 선택
- [ ] 250px 스캔 가이드라인 표시
- [ ] 스캔 성공 시 햅틱 피드백
- [ ] 에러 시 재시도 안내
- [ ] 모바일 iOS/Android 테스트 완료

### 세션 데이터 연동
- [ ] Google Sheets API 연결 성공
- [ ] 33개 세션 데이터 모두 로드
- [ ] 트랙별 필터링 정상 동작
- [ ] 난이도 추론 로직 동작
- [ ] 5분 캐싱 정상 작동
- [ ] 새로고침 버튼으로 수동 갱신
- [ ] 네트워크 에러 시 친절한 메시지
- [ ] 응답 시간 < 500ms (캐시 제외)

### 코드 품질
- [ ] TypeScript 타입 에러 0개
- [ ] ESLint 경고 0개
- [ ] 코드 리뷰 승인
- [ ] 단위 테스트 작성 (옵션)

### 문서화
- [ ] README.md 업데이트 (신규 기능 설명)
- [ ] API 문서 업데이트 (/api/sessions)
- [ ] CHANGELOG.md 작성

---

## 🚀 배포 계획

### 배포 전 체크리스트
- [ ] 환경 변수 프로덕션 설정 확인
- [ ] Google Sheets API 키 프로덕션 키로 교체
- [ ] CORS 설정 확인 (허용 도메인)
- [ ] 빌드 테스트 (프론트엔드 + 백엔드)

### 배포 단계
```bash
# 1. 백엔드 배포
cd moducon-backend
npm run build
npm start  # PM2 또는 Docker 사용

# 2. 프론트엔드 배포
cd moducon-frontend
npm run build
npm run start  # 또는 Vercel/Netlify 배포

# 3. 배포 검증
curl https://api.moducon.modulabs.co.kr/api/sessions
# Expected: 33개 세션 데이터
```

---

## 📝 다음 단계

### 행사 당일 (D-Day)
- [ ] 실시간 모니터링 (서버 로그, 에러율)
- [ ] 긴급 대응 체계 (핫픽스 준비)
- [ ] 사용자 피드백 수집

### 행사 후 (D+1 ~ D+7)
- [ ] 사용 데이터 분석
  - QR 스캔 성공률
  - 세션 페이지 접속 수
  - 캐시 적중률
- [ ] 개선 사항 도출
- [ ] Phase 2 기능 개발 계획 수립
  - 퀘스트 자동 생성
  - 실시간 혼잡도
  - 배지 시스템

---

**문서 버전**: v1.0
**최종 수정일**: 2025-11-30
**다음 검토 예정일**: 개발 착수 전
