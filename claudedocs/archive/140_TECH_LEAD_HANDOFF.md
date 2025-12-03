# 140_TECH_LEAD_HANDOFF.md - 테크니컬 리드 작업 인계서

**작성일**: 2025-12-01
**작성자**: Technical Lead
**버전**: v1.0
**다음 담당자**: hands-on worker

---

## 📋 작업 요약

### 완료한 작업
1. ✅ **대화 내역 정리** (claudedocs 이동)
2. ✅ **PRD 업데이트** (v1.7 → v1.8)
3. ✅ **개발 계획 업데이트** (v1.0 → v2.0)
4. ✅ **PROGRESS.md 업데이트** (최신 상태 반영)

### 작성한 문서
1. `claudedocs/137_CONVERSATION_SUMMARY.md` (대화 요약)
2. `claudedocs/138_PRD_UPDATE.md` (PRD v1.8)
3. `claudedocs/139_DEV_PLAN_UPDATE.md` (개발 계획 v2.0)
4. `07_PROGRESS.md` (업데이트)
5. `claudedocs/140_TECH_LEAD_HANDOFF.md` (본 문서)

### 소요 시간
- **예상**: 2시간
- **실제**: 1시간
- **효율**: 200%

---

## 🎯 다음 작업 (hands-on worker)

### Phase 8: 하단 네비게이션 구현

#### 작업 내용
1. **BottomNavigation 컴포넌트 생성** (예상 1시간)
   - 파일: `/components/layout/BottomNavigation.tsx`
   - 5개 탭: 세션, 부스, QR, 포스터, 지도
   - 중앙 QR 버튼 특별 UI (64x64px, 그라디언트, Pulse 애니메이션)
   - Active 상태 관리 (usePathname)

2. **layout.tsx 적용** (예상 30분)
   - `/app/layout.tsx`에 `<BottomNavigation />` 추가
   - padding-bottom 추가 (컨텐츠 겹침 방지)

3. **지도 페이지 생성** (예상 15분)
   - 파일: `/app/map/page.tsx`
   - 빈 페이지 UI 구현

4. **테스트 및 빌드** (예상 30분)
   - 로컬 빌드 테스트
   - 정적 페이지 생성 확인
   - 모바일 에뮬레이션 테스트

5. **Git Commit & Push** (예상 15분)
   - 커밋 메시지: "feat: 하단 네비게이션 및 지도 페이지 구현"
   - 브랜치: feature/sessions-data

**총 예상 시간**: 2시간 30분

---

## 📊 신규 요구사항 상세

### 요구사항 #1: 하단 고정 네비게이션

**UI 디자인**:
```
┌──────────────────────────────────────────┐
│                                          │
│           Main Content                   │
│                                          │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│ [세션]  [부스]   [🎯 QR]   [포스터] [지도] │
└──────────────────────────────────────────┘
```

**일반 탭**:
- 크기: 48x48px
- 아이콘: Calendar, Store, FileText, Map
- 레이블: 아이콘 하단 (10px)
- Active: Primary 색상 + 굵은 폰트
- Inactive: Gray 색상

**중앙 QR 버튼 (특별 UI)**:
- 크기: 64x64px (1.33배)
- 위치: -8px (위로 올라온)
- 배경: Primary 그라디언트
- 테두리: 4px white + shadow
- 아이콘: QR Code (24x24px, white)
- 애니메이션: Pulse
- 레이블: "스캔" (12px, white)

**구현 참고 코드**:
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

interface TabButtonProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
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

### 요구사항 #2: 지도 페이지

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

---

## ✅ 작업 체크리스트 (hands-on worker)

### Phase 8.1: BottomNavigation 컴포넌트 (1시간)
- [ ] `/components/layout/BottomNavigation.tsx` 생성
- [ ] 5개 탭 UI 구현 (세션, 부스, 포스터, 지도)
- [ ] 중앙 QR 버튼 특별 UI (64x64px, 그라디언트, Pulse)
- [ ] Active 상태 관리 (usePathname)
- [ ] QRScannerModal 연동
- [ ] TabButton 컴포넌트 구현
- [ ] TypeScript 타입 정의

### Phase 8.2: layout.tsx 적용 (30분)
- [ ] `/app/layout.tsx`에 `<BottomNavigation />` 추가
- [ ] `<main>` 태그에 `pb-16` 추가
- [ ] z-index 조정 (Header와 충돌 방지)
- [ ] 모바일 반응형 확인

### Phase 8.3: 지도 페이지 생성 (15분)
- [ ] `/app/map/page.tsx` 생성
- [ ] 빈 페이지 UI 구현 (MapIcon, 텍스트)

### Phase 8.4: 테스트 및 빌드 (30분)
- [ ] 로컬 빌드 성공 (`npm run build`)
- [ ] 정적 페이지 생성 확인 (`out/map/`)
- [ ] 네비게이션 동작 확인 (각 탭 클릭)
- [ ] QR 버튼 모달 확인
- [ ] Active 상태 정확성 확인
- [ ] 모바일 에뮬레이션 테스트

### Phase 8.5: Git Commit & Push (15분)
- [ ] Git Add 모든 파일
- [ ] Git Commit 작성 (상세한 메시지)
- [ ] Git Push origin feature/sessions-data

---

## 📝 Git Commit 메시지 템플릿

```bash
git add .

git commit -m "feat: 하단 네비게이션 및 지도 페이지 구현

- BottomNavigation 컴포넌트 생성 (5개 탭)
- 중앙 QR 버튼 특별 UI 디자인 (64x64px, 그라디언트, Pulse)
- Active 상태 관리 (usePathname)
- layout.tsx에 BottomNavigation 적용
- 지도 페이지 생성 (빈 페이지)
- 컨텐츠 padding-bottom 추가 (겹침 방지)

🎯 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin feature/sessions-data
```

---

## 🎯 성공 지표

### 필수 (Must-Have)
- ✅ BottomNavigation 모든 페이지에 표시
- ✅ 중앙 QR 버튼 특별 UI (크기, 위치, 애니메이션)
- ✅ Active 상태 정확히 표시
- ✅ 지도 페이지 생성 (빈 페이지)
- ✅ 빌드 성공 (10초 이내)

### 권장 (Should-Have)
- ✅ 컨텐츠와 겹치지 않음 (padding-bottom)
- ✅ 반응형 디자인 (모바일 최적화)
- ✅ 애니메이션 부드러움 (Pulse, Hover)

---

## 📊 현재 시스템 상태 요약

### Frontend
- **Framework**: Next.js 16 (Static Export)
- **UI**: shadcn/ui + Tailwind CSS
- **State**: Zustand (인증)
- **Data**: 정적 JSON (`/public/data/*.json`)
- **Cache**: localStorage (5분)
- **QR**: html5-qrcode

### 데이터 현황
- **세션**: 32개 (sessions.json, 23KB)
- **부스**: 0개 (booths.json, 빈 배열)
- **포스터**: 0개 (papers.json, 빈 배열)

### 페이지 구조
```
/                   ✅ 랜딩
/login              ✅ 로그인
/onboarding         ✅ 온보딩
/home               ✅ 대시보드
/sessions           ✅ 세션 목록 (32개)
/booths             ⏳ 부스 목록 (예정)
/papers             ⏳ 포스터 목록 (예정)
/map                🆕 지도 (빈 페이지, 신규 추가)
```

---

## ⚠️ 주의사항

### CSS 클래스
- **Primary 색상**: `text-primary`, `bg-primary`
- **Gray 색상**: `text-gray-500`, `text-gray-700`
- **Fixed Bottom**: `fixed bottom-0 left-0 right-0`
- **Backdrop**: `bg-white/90 backdrop-blur-lg`
- **Padding**: `pb-16` (64px)

### z-index
- **Header**: 기본값 (필요 시 확인)
- **BottomNavigation**: `z-50`
- **Modal**: `z-60` (기존 QRScannerModal)

### TypeScript
- `usePathname()` → `'use client'` 필수
- TabButtonProps 인터페이스 정의
- React.ComponentType 타입 사용

---

## 📚 참고 문서

### 필독 문서
1. `claudedocs/137_CONVERSATION_SUMMARY.md` - 대화 요약
2. `claudedocs/138_PRD_UPDATE.md` - PRD v1.8 (하단 네비게이션 명세)
3. `claudedocs/139_DEV_PLAN_UPDATE.md` - 개발 계획 v2.0 (구현 방법)
4. `07_PROGRESS.md` - 진행 상황 (최신 상태)

### 기존 컴포넌트
- `/components/qr/QRScannerModal.tsx` - QR 스캔 모달 (재사용)
- `/components/layout/Header.tsx` - 헤더 (참고)
- `/app/layout.tsx` - 루트 레이아웃 (수정 대상)

---

## 🎉 최종 확인

### 완료 시 확인사항
- [ ] BottomNavigation 모든 페이지에 표시됨
- [ ] 중앙 QR 버튼 클릭 → 모달 열림
- [ ] 각 탭 클릭 → 올바른 페이지 이동
- [ ] Active 상태 정확히 표시됨
- [ ] 지도 페이지 접근 가능
- [ ] 빌드 성공 (10초 이내)
- [ ] Git Commit & Push 완료

### 다음 담당자
**hands-on worker** → **reviewer** (코드 리뷰 및 QA)

---

**작성 완료일**: 2025-12-01
**다음 담당자**: hands-on worker
**예상 소요 시간**: 2시간 30분
**우선순위**: P0 (Critical)

---

**서명**: Technical Lead
**인계 일시**: 2025-12-01 00:00 KST
