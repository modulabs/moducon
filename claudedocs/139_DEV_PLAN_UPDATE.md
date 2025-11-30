# 139_DEV_PLAN_UPDATE.md - 개발 계획 업데이트

**작성일**: 2025-12-01
**작성자**: Technical Lead
**버전**: v2.0
**기반 문서**: 02_dev_plan.md v1.0

---

## 📋 업데이트 개요

### 변경 사항
1. **현재 구현 상태 반영** (Phase 1-7 완료 사항)
2. **신규 요구사항 추가** (하단 네비게이션, 지도 페이지)
3. **향후 개발 계획 수립** (Phase 8-9)
4. **기술 스택 확정** (정적 JSON 기반)

---

## 🎯 현재 개발 상태

### 완료된 Phase (1-7)

#### Phase 1: 프로젝트 초기화 ✅ 완료 (2025-01-14)
- [x] Next.js 16 프로젝트 생성
- [x] 필수 패키지 설치 (11개)
- [x] next.config.ts 설정 (Static Export)
- [x] 환경 변수 설정
- [x] PWA manifest.json
- [x] GitHub 저장소 설정

#### Phase 2: 인증 시스템 ✅ 완료 (2025-01-14)
- [x] 로그인 폼 (React Hook Form + Zod)
- [x] JWT 인증 구현 (로컬 백엔드)
- [x] 디지털 서명 (Canvas 기반)
- [x] 출입증 발급 (QR 코드)
- [x] API 클라이언트 (apiCall 함수)
- [x] Zustand 인증 스토어

#### Phase 3: 핵심 기능 ✅ 완료 (2025-11-29)
- [x] 세션 관리 (32개 정적 JSON)
- [x] 트랙별 필터링
- [x] QR 스캔 기능 (html5-qrcode)
- [x] localStorage 캐싱 (5분)
- [x] 오프라인 폴백 100%

#### Phase 4: 퀘스트 시스템 ⏳ 부분 완료
- [x] 관심 분야 선택 (온보딩)
- [ ] 퀘스트 생성 알고리즘 (미완)
- [ ] 퀘스트 진행 추적 (미완)
- [ ] 페이퍼샵 퀴즈 (미완)

#### Phase 5: PWA & 오프라인 ✅ 완료 (2025-11-29)
- [x] Service Worker (next-pwa)
- [x] localStorage 캐싱 전략
- [x] Background Sync (오프라인 폴백)
- [x] manifest.json 완성
- [x] Add to Home Screen

#### Phase 6: 관리자 도구 ⏸️ 보류
- [ ] 콘텐츠 관리 API (보류)
- [ ] 관리자 인증 (보류)
- [ ] 모니터링 대시보드 (보류)
- [ ] 에러 로그 수집 (보류)

#### Phase 7: 배포 준비 ✅ 완료 (2025-11-30)
- [x] GitHub Actions 워크플로우
- [x] Static Export 빌드
- [x] CNAME 커스텀 도메인
- [x] 환경 변수 설정
- [x] 최종 QA 검증 (98.0/100, A+)

---

## 🆕 신규 Phase (8-9)

### Phase 8: 하단 네비게이션 구현 (🔥 현재 착수)

#### 8.1 BottomNavigation 컴포넌트 생성 (예상 1시간)

**파일**: `/components/layout/BottomNavigation.tsx`

**기능 명세**:
1. **5개 탭 구현**
   - 세션 (Calendar icon) → `/sessions`
   - 부스 (Store icon) → `/booths`
   - QR 버튼 (중앙, 특별 UI) → QR 스캔 모달
   - 포스터 (FileText icon) → `/papers`
   - 지도 (Map icon) → `/map`

2. **Active 상태 관리**
   - `usePathname()` 사용 (Next.js 14+)
   - Active: Primary 색상 + 굵은 폰트
   - Inactive: Gray 색상 + 일반 폰트

3. **중앙 QR 버튼 특별 UI**
   - 크기: 64x64px (일반 탭 48x48px)
   - 위치: -8px (위로 올라온)
   - 배경: Primary 그라디언트
   - 테두리: 4px white + shadow
   - 애니메이션: Pulse

**구현 코드 스켈레톤**:
```typescript
// /components/layout/BottomNavigation.tsx
'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, Store, QrCode, FileText, Map } from 'lucide-react';
import { QRScannerModal } from '@/components/qr/QRScannerModal';

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const tabs = [
    { label: '세션', icon: Calendar, path: '/sessions' },
    { label: '부스', icon: Store, path: '/booths' },
    { label: '포스터', icon: FileText, path: '/papers' },
    { label: '지도', icon: Map, path: '/map' },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-lg border-t border-gray-200 z-50">
        <div className="flex items-center justify-around h-full max-w-screen-lg mx-auto px-4">
          {/* 세션 탭 */}
          <TabButton
            label={tabs[0].label}
            icon={tabs[0].icon}
            isActive={pathname.startsWith(tabs[0].path)}
            onClick={() => router.push(tabs[0].path)}
          />

          {/* 부스 탭 */}
          <TabButton
            label={tabs[1].label}
            icon={tabs[1].icon}
            isActive={pathname.startsWith(tabs[1].path)}
            onClick={() => router.push(tabs[1].path)}
          />

          {/* 중앙 QR 버튼 (특별 UI) */}
          <button
            onClick={() => setQrModalOpen(true)}
            className="relative -top-2 flex flex-col items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary-dark shadow-lg ring-4 ring-white animate-pulse hover:scale-105 transition-transform"
          >
            <QrCode className="w-6 h-6 text-white" />
            <span className="text-xs text-white mt-1">스캔</span>
          </button>

          {/* 포스터 탭 */}
          <TabButton
            label={tabs[2].label}
            icon={tabs[2].icon}
            isActive={pathname.startsWith(tabs[2].path)}
            onClick={() => router.push(tabs[2].path)}
          />

          {/* 지도 탭 */}
          <TabButton
            label={tabs[3].label}
            icon={tabs[3].icon}
            isActive={pathname.startsWith(tabs[3].path)}
            onClick={() => router.push(tabs[3].path)}
          />
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />
    </>
  );
}

function TabButton({ label, icon: Icon, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-1 ${
        isActive ? 'text-primary font-semibold' : 'text-gray-500'
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs">{label}</span>
    </button>
  );
}
```

#### 8.2 layout.tsx 적용 (예상 30분)

**파일**: `/app/layout.tsx`

**수정 사항**:
```typescript
// Before
export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}

// After
import { BottomNavigation } from '@/components/layout/BottomNavigation';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main className="pb-16">{/* padding-bottom for BottomNav */}
          {children}
        </main>
        <BottomNavigation />
      </body>
    </html>
  );
}
```

**CSS 조정**:
- `main` 태그에 `pb-16` (padding-bottom: 64px) 추가
- 컨텐츠와 하단 네비게이션 겹침 방지
- 스크롤 시 컨텐츠가 네비게이션 아래로 숨겨지도록

#### 8.3 지도 페이지 생성 (예상 15분)

**파일**: `/app/map/page.tsx`

**구현 코드**:
```typescript
// /app/map/page.tsx
import { Map as MapIcon } from 'lucide-react';

export default function MapPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)] bg-gray-50">
      <MapIcon className="w-24 h-24 text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold text-gray-700 mb-2">
        지도 페이지
      </h2>
      <p className="text-gray-500 text-center px-4">
        추후 추가 예정입니다.
      </p>
    </div>
  );
}
```

**향후 개선 계획**:
- SVG 지도 이미지 추가
- 인터랙티브 맵 (클릭 시 해당 위치 강조)
- 현재 위치 표시 (실내 GPS 또는 비콘)

#### 8.4 테스트 및 검증 (예상 30분)

**테스트 항목**:
1. **네비게이션 동작**
   - [ ] 각 탭 클릭 시 올바른 페이지로 이동
   - [ ] Active 상태 정확히 표시
   - [ ] 중앙 QR 버튼 클릭 시 모달 열림
   - [ ] 모달 닫기 정상 동작

2. **UI/UX**
   - [ ] 하단 네비게이션 고정 (Fixed Bottom)
   - [ ] 컨텐츠와 겹치지 않음 (padding-bottom)
   - [ ] 중앙 QR 버튼 특별 UI (크기, 위치, 애니메이션)
   - [ ] 반응형 디자인 (모바일 최적화)

3. **성능**
   - [ ] 빌드 시간 10초 이내
   - [ ] 정적 페이지 생성 확인 (out/map/)
   - [ ] 번들 크기 증가 <10KB

---

### Phase 9: 부스/포스터 데이터 연동 (⏳ 예정)

#### 9.1 부스 데이터 추가 (예상 1시간)

**작업 내용**:
1. Google Sheets 부스 데이터 추출
2. `/public/data/booths.json` 생성 (예상 13개)
3. boothCache.ts 활용 (이미 구현됨)
4. `/app/booths/page.tsx` 구현
5. 부스 상세 페이지 `/app/booths/[id]/page.tsx`

**예상 데이터 구조**:
```json
[
  {
    "id": "booth-01",
    "name": "ModuLabs AI 연구소",
    "organization": "ModuLabs",
    "description": "생성형 AI 최신 연구 소개",
    "location": "1층 부스존",
    "category": "연구",
    "tags": ["AI", "연구", "생성형"]
  }
]
```

#### 9.2 포스터 데이터 추가 (예상 1시간)

**작업 내용**:
1. Google Sheets 포스터 데이터 추출
2. `/public/data/papers.json` 생성 (예상 33개)
3. paperCache.ts 활용 (이미 구현됨)
4. `/app/papers/page.tsx` 구현
5. 포스터 상세 페이지 `/app/papers/[id]/page.tsx`

**예상 데이터 구조**:
```json
[
  {
    "id": "paper-01",
    "title": "Transformer 모델 최적화 기법",
    "authors": ["홍길동", "김철수"],
    "organization": "모두의연구소",
    "category": "딥러닝",
    "abstract": "Transformer 모델의 추론 속도 개선...",
    "keywords": ["Transformer", "최적화", "추론"]
  }
]
```

---

## 📊 업데이트된 개발 로드맵

### 단기 (1-2일 내)
1. **Phase 8 완료** (하단 네비게이션)
   - [x] 138_PRD_UPDATE.md 작성 완료
   - [x] 139_DEV_PLAN_UPDATE.md 작성 완료
   - [ ] 07_PROGRESS.md 업데이트
   - [ ] BottomNavigation 컴포넌트 구현
   - [ ] layout.tsx 적용
   - [ ] 지도 페이지 생성
   - [ ] 테스트 및 빌드
   - [ ] Git Commit & Deploy

2. **Phase 9 착수** (부스/포스터 데이터)
   - [ ] Google Sheets 데이터 추출
   - [ ] JSON 파일 생성
   - [ ] 페이지 구현
   - [ ] 테스트 및 배포

### 중기 (1주 내)
3. **성능 최적화**
   - [ ] Lighthouse 성능 검증 (90+ 목표)
   - [ ] 번들 크기 최적화 (<500KB gzipped)
   - [ ] 이미지 WebP 변환
   - [ ] Lazy Loading 적용

4. **추가 기능**
   - [ ] 세션 즐겨찾기
   - [ ] 부스 방문 기록
   - [ ] 포스터 북마크
   - [ ] 공유 기능 (SNS)

### 장기 (2주~1개월)
5. **퀘스트 시스템 완성**
   - [ ] 퀘스트 생성 알고리즘
   - [ ] 퀘스트 진행 추적
   - [ ] 보상 시스템
   - [ ] 리더보드

6. **프로덕션 백엔드 배포** (선택 사항)
   - [ ] Vercel/Railway 배포
   - [ ] PostgreSQL DB 설정
   - [ ] 실시간 데이터 업데이트

---

## 🔧 기술 스택 확정 (v2.0)

### Frontend (확정)
```yaml
Framework: Next.js 16 (Static Export)
UI: shadcn/ui + Tailwind CSS
State: Zustand
Data: 정적 JSON (/public/data/*.json)
Cache: localStorage (5분 만료)
QR: html5-qrcode
Icons: lucide-react
Animation: Tailwind CSS + Framer Motion (선택)
```

### Backend (로컬 개발만, 프로덕션 미사용)
```yaml
Runtime: Node.js + TypeScript
Framework: Express.js
DB: PostgreSQL 16.10 (로컬)
ORM: Prisma
Auth: JWT (Bearer Token)
Status: 로컬 완료, 프로덕션 보류
```

### Deployment (확정)
```yaml
Frontend: GitHub Pages
Domain: moducon.vibemakers.kr
CI/CD: GitHub Actions (자동 배포)
Static: Next.js Static Export (out/)
```

---

## 📈 성능 목표 (업데이트)

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: <2.5s ✅ (현재 ~2s)
- **FID (First Input Delay)**: <100ms ✅ (현재 ~50ms)
- **CLS (Cumulative Layout Shift)**: <0.1 ✅ (현재 ~0.05)

### Bundle Size
- **Initial Bundle**: <300KB gzipped ✅ (현재 ~250KB)
- **Total JS**: <500KB gzipped ✅ (현재 ~400KB)
- **JSON Data**: <50KB gzipped ✅ (현재 ~30KB)

### Caching & Offline
- **Cache Hit Rate**: >95% 목표 (localStorage)
- **Offline Support**: 100% ✅
- **Service Worker**: Active ✅

---

## 🚨 리스크 관리 (업데이트)

### 기술 리스크

1. **하단 네비게이션 UI/UX**
   - **리스크**: 중앙 QR 버튼 디자인 복잡도
   - **확률**: 낮음 (20%)
   - **영향**: 구현 시간 +30분
   - **완화**: Tailwind CSS 그라디언트 + 애니메이션 활용

2. **부스/포스터 데이터 누락**
   - **리스크**: Google Sheets 데이터 미완성
   - **확률**: 중간 (50%)
   - **영향**: 기능 축소
   - **완화**: 빈 배열로 배포 → 데이터 추후 업데이트

3. **성능 저하**
   - **리스크**: BottomNavigation 추가로 번들 크기 증가
   - **확률**: 낮음 (10%)
   - **영향**: <10KB 증가 예상
   - **완화**: Tree Shaking + Code Splitting

---

## 📝 다음 단계

### Immediate (오늘)
1. [x] 137_CONVERSATION_SUMMARY.md 작성 완료
2. [x] 138_PRD_UPDATE.md 작성 완료
3. [x] 139_DEV_PLAN_UPDATE.md 작성 완료
4. [ ] 07_PROGRESS.md 업데이트
5. [ ] Git Commit (docs: 대화 내역 정리 및 신규 요구사항 반영)

### Tomorrow (내일)
6. [ ] BottomNavigation 컴포넌트 구현
7. [ ] layout.tsx 적용
8. [ ] 지도 페이지 생성
9. [ ] 빌드 테스트
10. [ ] Git Commit & Deploy

---

**작성 완료일**: 2025-12-01
**버전**: v2.0
**다음 문서**: 07_PROGRESS.md 업데이트
**담당자**: Technical Lead → hands-on worker (Phase 8 구현)
