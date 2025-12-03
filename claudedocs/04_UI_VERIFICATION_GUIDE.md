# 프로젝트 중점사항 및 UI 검증 가이드

## 📅 최종 업데이트
**날짜**: 2025-12-02
**작성자**: Technical Lead

---

## 🎨 브랜드 디자인 시스템

### 컬러 팔레트

| 색상 | HEX | 용도 |
|------|-----|------|
| Pink | `#FF6B9D` | 그라데이션 시작점 |
| Orange | `#FF8B5A` | 그라데이션 중간점 |
| Yellow | `#FFA94D` | 그라데이션 끝점 |
| White | `#FFFFFF` | 텍스트, 배경 |
| Primary (기존) | `#4F46E5` | 보라색 (QR 버튼 배경) |

### 그라데이션 적용

```css
/* CSS */
background: linear-gradient(to right, #FF6B9D, #FF8B5A, #FFA94D);

/* Tailwind */
className="bg-gradient-to-r from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D]"
```

---

## 🔍 컴포넌트 검증 체크리스트

### Header 컴포넌트 ✅
**파일**: `moducon-frontend/src/components/layout/Header.tsx`

- [x] 그라데이션 배경 적용
- [x] ModulabsLogo 표시 (w-20 h-8)
- [x] "모두콘 2025" 텍스트 표시
- [x] 로그인 사용자 이름 표시
- [x] 로그아웃 버튼 동작
- [x] sticky 포지셔닝 (top-0)
- [x] z-index 적용 (z-50)

**현재 코드**:
```tsx
<header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] shadow-lg">
  <div className="container flex h-14 items-center justify-between px-4">
    <Link href="/home/" className="flex items-center gap-3">
      <div className="w-20 h-8">
        <ModulabsLogo />
      </div>
      <span className="text-lg font-bold text-white">모두콘 2025</span>
    </Link>
    ...
  </div>
</header>
```

### 로고 검증 ✅
- **파일**: `/moducon-frontend/src/imports/Group-53-445.tsx`
- **viewBox**: 2686 x 1193
- **비율**: 약 2.25:1 (width:height)
- **권장 크기**: `w-20 h-8` (80px x 32px)

### 하단 네비게이션 QR 버튼 ✅
**파일**: `moducon-frontend/src/components/layout/BottomNavigation.tsx`

```tsx
<svg
  width="32" height="32"          // 크기: 32px
  stroke="#666666"                 // 색상: 회색
  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"  // 중앙 정렬
>
```

**스타일링**:
- 배경: `bg-gradient-to-r from-primary to-primary/80`
- 크기: `w-16 h-16` (64px)
- 그림자: `shadow-[0_4px_12px_rgba(79,70,229,0.4)]`
- 링 테두리: `ring-4 ring-white`

---

## 📱 페이지별 검증

### 홈 페이지 (`/home`)
**핵심 기능**:
- DigitalBadge: 사용자 이름 + 🎫 이모지
- QuestProgress: 퀘스트 진행도 (Mock 데이터)
- 다가오는 세션: 실제 API 연동 (`fetchSessionsWithCache`)

**주의사항**:
- "참가자" 텍스트 블럭 **존재하지 않음** (DigitalBadge만 표시)
- QR 아이콘 홈 화면 블럭 **제거됨**

### 반응형 검증

| 브레이크포인트 | 너비 | 검증 항목 |
|---------------|------|-----------|
| Mobile | < 640px | 메뉴 접기, 터치 최적화 |
| Tablet | 640-1024px | 중간 레이아웃 |
| Desktop | > 1024px | 전체 레이아웃 |

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

### CORS 설정 ✅
**파일**: `moducon-backend/src/index.ts`

```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'https://moducon.vibemakers.kr',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
];
```

---

## 🛠️ 기술 스택 특이사항

### Frontend
- **Next.js 15.x** (App Router)
- **React 19** (Server Components + Client Components)
- **TypeScript 5**
- **Tailwind CSS 4 + shadcn/ui**

### 주요 라이브러리
```json
{
  "html5-qrcode": "QR 스캐너",
  "zustand": "전역 상태 관리",
  "lucide-react": "아이콘",
  "framer-motion": "애니메이션",
  "next-pwa": "PWA 지원"
}
```

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

---

## 🎨 애니메이션 검증

### Framer Motion 설정
```typescript
// 성능 최적화된 애니메이션
const optimizedAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" }
};
```

### 검증 항목
- [x] 60fps 유지
- [x] 레이아웃 시프트 없음
- [x] 모바일 성능 최적화

---

## ♿ 접근성 검증

| 항목 | 상태 | 설명 |
|------|------|------|
| 색상 대비 | ✅ | WCAG AA 충족 |
| 키보드 네비게이션 | ✅ | Tab 순서 적절 |
| 스크린 리더 | 🔄 | aria-label 추가 필요 |
| 포커스 표시 | ✅ | focus-visible 적용 |

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
├── imports/            # SVG/아이콘 에셋
├── lib/                # 유틸리티 함수
├── store/              # Zustand 스토어
└── types/              # TypeScript 타입 정의
```

---

**다음 단계**: Phase 3-5 구현 시 본 문서 참조
