# 프로젝트 중점사항 및 특이사항

## 📅 최종 업데이트
**날짜**: 2025-12-01
**작성자**: Technical Lead

---

## 🎯 데이터베이스 중점사항

### 현재 DB 구조 (06_DB_DESIGN.md 참조)

#### User 모델
```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  phone     String   @unique
  signature String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Session 모델 (Google Sheets 연동)
- **데이터 소스**: Google Sheets API
- **캐싱**: sessionCache.ts (5분 TTL)
- **필드**: id, name, speaker, track, startTime, endTime, location

#### Booth 모델 (Google Sheets 연동)
- **데이터 소스**: Google Sheets API
- **필드**: id, name, description, location, category

---

## 🔌 API 중점사항

### 인증 API
- **POST /api/auth/verify**: QR 코드 검증 및 사용자 인증
- **POST /api/auth/signature**: 디지털 서명 저장
- **보안**: JWT 토큰, HTTP-only cookies

### 데이터 API
- **GET /api/sessions**: Google Sheets → Sessions 목록
- **GET /api/booths**: Google Sheets → Booths 목록
- **GET /api/papers**: Google Sheets → Papers 목록

---

## 📱 페이지별 특이사항

### 1. 홈 페이지 (`/home`)
**핵심 기능**:
- DigitalBadge: 사용자 이름 + 🎫 이모지
- QuestProgress: 퀘스트 진행도 (Mock 데이터)
- 다가오는 세션: 실제 API 연동 (`fetchSessionsWithCache`)

**주의사항**:
- "참가자" 텍스트 블럭은 **존재하지 않음** (DigitalBadge만 표시)
- QR 아이콘 홈 화면 블럭 **제거됨**

### 2. 하단 네비게이션
**중앙 QR 버튼 특별 디자인**:
```tsx
<svg
  width="32" height="32"
  stroke="#666666"  // 회색 (보라색 배경과 최적 대비)
  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
>
  {/* QR 코드 SVG 경로 */}
</svg>
```

**스타일링**:
- 배경: `bg-gradient-to-r from-primary to-primary/80`
- 크기: `w-16 h-16` (64px)
- 그림자: `shadow-[0_4px_12px_rgba(79,70,229,0.4)]`
- 링 테두리: `ring-4 ring-white`

### 3. QR 스캐너
**라이브러리**: html5-qrcode
**기능**:
- 카메라 접근 허용
- QR 코드 파싱
- 햅틱 피드백

### 4. 세션 페이지 (`/sessions`)
**특징**:
- 트랙별 필터링 (Track A/B/C/D)
- 시간순 정렬
- Google Sheets 실시간 연동

---

## 🛠️ 기술 스택 특이사항

### Frontend
- **Next.js 16.0.3** (Turbopack)
- **React 19** (Server Components + Client Components)
- **TypeScript 5**
- **Tailwind CSS + shadcn/ui**

### 주요 라이브러리
```json
{
  "html5-qrcode": "QR 스캐너",
  "zustand": "전역 상태 관리",
  "lucide-react": "아이콘",
  "next-pwa": "PWA 지원"
}
```

### 빌드 설정
- **Static Site Generation (SSG)**: 57개 페이지
- **Dynamic Routes**: `/booths/[id]`, `/papers/[id]`
- **빌드 시간**: ~7초

---

## ⚠️ 알려진 이슈 및 해결 방법

### 1. ESLint 경고 (Low Priority)
**상태**: 7개 경고 (모두 Low 등급, 기능 무관)

**경고 목록**:
- 미사용 import: `QrCode`, `PlusCircle`, `formatTime`, `QRIcon`
- `<img>` → `<Image />` 권장 (3개 파일)

**조치**: Optional (프로덕션 배포 전 정리 권장)

### 2. Google Sheets API 캐싱
**현재**: 5분 TTL
**이유**: API Rate Limit 회피 + 성능 최적화

**주의사항**:
- 데이터 업데이트 시 최대 5분 지연 가능
- 긴급 업데이트 시 캐시 수동 삭제 필요

### 3. JWT 토큰 만료
**설정**: 24시간
**저장소**: HTTP-only cookies

**주의사항**:
- 토큰 만료 시 재인증 필요
- 로그아웃 시 쿠키 삭제 확인

---

## 🚀 배포 환경 설정

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://api.moducon.io
NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=...
```

### Backend (Railway)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=24h
```

---

## 📊 성능 메트릭

### 빌드 성능
- 정적 페이지 생성: 3.1초 (57개 페이지)
- 평균 페이지당: 54ms
- 성능 등급: **Excellent**

### 런타임 성능
- LCP (Largest Contentful Paint): < 2.5초 (목표)
- FID (First Input Delay): < 100ms (목표)
- CLS (Cumulative Layout Shift): < 0.1 (목표)

---

## 🔐 보안 체크리스트

### 완료
- ✅ `.env` 파일 Git 추적 제외
- ✅ SQL Injection 방어 (Prisma ORM)
- ✅ XSS 방어 (React 기본 이스케이핑)
- ✅ CSRF 토큰 준비 (JWT 구조)

### 진행 예정 (Phase 4)
- 🚧 Rate limiting 설정
- 🚧 CORS 정책 설정
- 🚧 API 요청 검증 (Zod)

---

## 📝 코드 컨벤션

### 파일 네이밍
- 컴포넌트: PascalCase (예: `DigitalBadge.tsx`)
- 유틸리티: camelCase (예: `sessionCache.ts`)
- 페이지: kebab-case (예: `qr-generator`)

### 디렉토리 구조
```
src/
├── app/                 # Next.js App Router
├── components/          # 재사용 가능한 컴포넌트
│   ├── layout/         # 레이아웃 컴포넌트
│   ├── home/           # 홈 페이지 전용
│   └── ui/             # shadcn/ui 컴포넌트
├── lib/                # 유틸리티 함수
├── store/              # Zustand 스토어
└── types/              # TypeScript 타입 정의
```

---

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: 보라색 (`#4F46E5`)
- **Background**: 흰색 (`#FFFFFF`)
- **Text**: 검은색 (`#000000`)
- **Muted**: 회색 (`#6B7280`)

### 타이포그래피
- **제목**: 2xl, bold
- **본문**: sm, regular
- **레이블**: xs, medium

---

**다음 단계**: Phase 3-5 구현 시 본 문서 참조
