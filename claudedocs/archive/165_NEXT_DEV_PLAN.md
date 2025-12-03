# 165_NEXT_DEV_PLAN.md - 다음 개발 계획 (Phase 2-5)

**작성일**: 2025-12-01
**작성자**: Technical Lead
**버전**: v3.0
**기반**: 153_DEV_PLAN_NEXT.md, 164_PRD_UPDATE.md

---

## 📋 전체 Phase 요약

| Phase | 설명 | 우선순위 | 예상 시간 | 상태 |
|-------|------|----------|----------|------|
| **Phase 1** | QR 스캔 UI 개선 | P0 | 1시간 | ✅ 완료 |
| **Phase 2-1** | QR 카메라 UI 긴급 수정 | P0 | 30분 | 🔴 긴급 |
| **Phase 2-2** | 하단 네비게이션 | P0 | 2시간 | ⏳ 진행 예정 |
| **Phase 3** | Database 스키마 | P1 | 1시간 | ⏳ 대기 |
| **Phase 4** | 체크인 API | P1 | 2시간 | ⏳ 대기 |
| **Phase 5** | 마이페이지 | P2 | 1시간 | ⏳ 대기 |
| **총 예상** | - | - | **7.5시간** | **13% 완료** |

---

## 🔴 Phase 2-1: QR 스캔 카메라 UI 긴급 수정 (최우선)

### 목표
정사각형 박스에 카메라 영상이 제대로 표시되도록 수정

### 우선순위
**P0 (Critical)** - 현재 QR 스캔이 제대로 동작하지 않음

### 예상 시간
**30분**

---

### 작업 2-1.1: QRScannerModal 수정 (20분)

#### 문제 분석
```
❌ 현재 문제:
- 카메라 영상이 배경에 2번 나옴
- 정사각형 박스에 카메라 영상이 안 나옴
- 박스는 있지만 내부가 비어있음

✅ 요구사항:
- 카메라 영상이 전체 화면에 표시
- 정사각형 박스 (280x280px) 가이드라인
- 박스 외부는 어둡게 처리 (shadow overlay)
```

#### 파일 수정
```
moducon-frontend/src/components/qr/QRScannerModal.tsx
```

#### 수정 내용
```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { handleQRScan } from '@/lib/qrParser';

interface Props {
  onClose: () => void;
}

export function QRScannerModal({ onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationId: number;

    async function startCamera() {
      try {
        // 카메라 스트림 가져오기
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // QR 코드 스캔 루프
        const scanQRCode = () => {
          if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const ctx = canvas.getContext('2d');

            if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
              // 캔버스 크기를 비디오 크기에 맞춤
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;

              // 비디오 프레임을 캔버스에 그리기
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

              // 이미지 데이터 추출
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

              // QR 코드 디코딩 (jsQR 라이브러리 사용)
              const code = jsQR(imageData.data, canvas.width, canvas.height);

              if (code) {
                // QR 코드 발견
                handleQRScan(code.data);
                onClose();
                return;
              }
            }
          }

          animationId = requestAnimationFrame(scanQRCode);
        };

        scanQRCode();
      } catch (err) {
        console.error('카메라 접근 실패:', err);
        setError('카메라에 접근할 수 없습니다. 권한을 허용해주세요.');
      }
    }

    startCamera();

    // 클린업
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* 카메라 영상 (전체 화면) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />

      {/* 숨겨진 캔버스 (QR 디코딩용) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 오버레이: 정사각형 박스 가이드 */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* 정사각형 박스 (280x280px) */}
        <div
          className="relative w-[280px] h-[280px] border-4 border-white rounded-2xl
                     shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
          aria-label="QR 코드 스캔 영역"
        >
          {/* 모서리 강조선 (선택 사항) */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl" />
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="absolute bottom-20 left-0 right-0 text-center px-4">
        <p className="text-white text-lg font-medium mb-2">
          QR 코드를 네모 박스 안에 맞춰주세요
        </p>
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </div>

      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30"
        aria-label="QR 스캔 닫기"
      >
        <X className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
```

#### 체크리스트
- [ ] QRScannerModal.tsx 수정
- [ ] jsQR 라이브러리 추가 (`npm install jsqr @types/jsqr`)
- [ ] 카메라 스트림 연결
- [ ] QR 코드 디코딩 루프 구현
- [ ] 빌드 검증

---

### 작업 2-1.2: jsQR 라이브러리 설치 (5분)

#### 명령어
```bash
cd moducon-frontend
npm install jsqr @types/jsqr
```

#### 체크리스트
- [ ] jsQR 라이브러리 설치
- [ ] TypeScript 타입 정의 설치
- [ ] package.json 확인

---

### 작업 2-1.3: 빌드 검증 (5분)

#### 명령어
```bash
npm run build
```

#### 체크리스트
- [ ] TypeScript 컴파일 성공 (0 errors)
- [ ] Next.js 빌드 성공
- [ ] 정적 페이지 생성 확인

---

### Phase 2-1 완료 기준
- [x] QRScannerModal 카메라 영상 표시 수정
- [x] jsQR 라이브러리 설치
- [x] 빌드 성공

### Git Commit 메시지
```
fix(qr): QR 스캔 카메라 영상 표시 수정 (Phase 2-1)

- 정사각형 박스에 카메라 영상 제대로 표시
- 외부 어둡게 처리 (shadow overlay)
- jsQR 라이브러리 통합

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 🔴 Phase 2-2: 하단 네비게이션 구현 (진행 예정)

### 목표
하단 네비게이션에 중앙 원형 QR 버튼 추가 및 5개 탭 구현

### 우선순위
**P0 (Critical)** - QR 기능의 핵심 UI

### 예상 시간
**2시간**

---

### 작업 2-2.1: BottomNavigation 컴포넌트 생성 (1시간)

#### 파일 생성
```
moducon-frontend/src/components/layout/
├── BottomNavigation.tsx        # 🆕 신규
└── Header.tsx                   # ✅ 기존
```

#### 컴포넌트 구조
```tsx
'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, Store, FileText, Map, QrCode } from 'lucide-react';
import { QRScannerModal } from '@/components/qr/QRScannerModal';

const TABS = [
  { id: 'sessions', label: '세션', icon: Calendar, href: '/sessions' },
  { id: 'booths', label: '부스', icon: Store, href: '/booths' },
  { id: 'papers', label: '포스터', icon: FileText, href: '/papers' },
  { id: 'map', label: '지도', icon: Map, href: '/map' },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [qrModalOpen, setQRModalOpen] = useState(false);

  const handleTabClick = (href: string) => {
    router.push(href);
  };

  return (
    <>
      {/* 하단 네비게이션 바 */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-lg border-t z-50">
        <div className="flex items-center justify-around h-full max-w-screen-lg mx-auto px-2">
          {/* 세션, 부스 */}
          {TABS.slice(0, 2).map((tab) => (
            <TabButton
              key={tab.id}
              {...tab}
              isActive={pathname.startsWith(tab.href)}
              onClick={() => handleTabClick(tab.href)}
            />
          ))}

          {/* 중앙 QR 버튼 */}
          <button
            className="relative -top-2 w-16 h-16 rounded-full
                       bg-gradient-to-r from-primary to-primary-dark
                       shadow-[0_2px_8px_rgba(0,0,0,0.15)]
                       ring-4 ring-white animate-pulse
                       hover:scale-105 active:scale-95 transition-transform"
            onClick={() => setQRModalOpen(true)}
            aria-label="QR 코드 스캔"
          >
            <QrCode className="w-6 h-6 text-white mx-auto" />
            <span className="text-xs text-white mt-1 block">스캔</span>
          </button>

          {/* 포스터, 지도 */}
          {TABS.slice(2).map((tab) => (
            <TabButton
              key={tab.id}
              {...tab}
              isActive={pathname.startsWith(tab.href)}
              onClick={() => handleTabClick(tab.href)}
            />
          ))}
        </div>
      </div>

      {/* QR 스캔 모달 */}
      {qrModalOpen && (
        <QRScannerModal onClose={() => setQRModalOpen(false)} />
      )}
    </>
  );
}

interface TabButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ icon: Icon, label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 min-w-[64px]
                  transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs">{label}</span>
    </button>
  );
}
```

#### 체크리스트
- [ ] `src/components/layout/BottomNavigation.tsx` 생성
- [ ] TabButton 컴포넌트 구현
- [ ] QR 버튼 쉐도우 추가 (`shadow-[0_2px_8px_rgba(0,0,0,0.15)]`)
- [ ] QR 버튼 아이콘 추가 (`<QrCode />`)
- [ ] TypeScript 타입 안정성 확보

---

### 작업 2-2.2: Layout 통합 (30분)

#### 파일 수정
```
moducon-frontend/src/app/layout.tsx
```

#### 수정 내용
```tsx
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="pb-16"> {/* 하단 패딩 추가 */}
        <Header />
        <main>{children}</main>
        <BottomNavigation /> {/* 하단 네비게이션 추가 */}
      </body>
    </html>
  );
}
```

#### 체크리스트
- [ ] `layout.tsx` 수정
- [ ] 하단 패딩 추가 (`pb-16`)
- [ ] BottomNavigation import

---

### 작업 2-2.3: 지도 페이지 빈 페이지 생성 (30분)

#### 파일 생성
```
moducon-frontend/src/app/map/
└── page.tsx        # 🆕 신규
```

#### 페이지 구조
```tsx
export default function MapPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">컨퍼런스 지도</h1>
      <div className="bg-gray-100 rounded-lg h-[600px] flex items-center justify-center">
        <p className="text-gray-500">지도 준비 중입니다.</p>
      </div>
    </div>
  );
}
```

#### 체크리스트
- [ ] `src/app/map/page.tsx` 생성
- [ ] 빈 페이지 UI 구현
- [ ] 메타데이터 추가

---

### Phase 2-2 완료 기준
- [x] BottomNavigation 컴포넌트 완성
- [x] Layout 통합 완료
- [x] 지도 페이지 생성
- [x] 빌드 성공

### Git Commit 메시지
```
feat: 하단 네비게이션 구현 (Phase 2-2 완료)

- 5개 탭 구현 (세션/부스/포스터/지도/QR)
- 중앙 원형 QR 버튼 (그라데이션, 그림자, QR 아이콘)
- 지도 페이지 빈 페이지 생성
- Layout 통합 (하단 패딩)

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 🟡 Phase 3-5: 순차 진행 (대기)

### Phase 3: Database 스키마 (1시간)
- 작업 내용: 153_DEV_PLAN_NEXT.md 참조
- 우선순위: P1 (High)

### Phase 4: 체크인 API (2시간)
- 작업 내용: 153_DEV_PLAN_NEXT.md 참조
- 우선순위: P1 (High)

### Phase 5: 마이페이지 (1시간)
- 작업 내용: 153_DEV_PLAN_NEXT.md 참조
- 우선순위: P2 (Medium)

---

## 📊 진행률 추적

### 현재 상태
- **완료**: Phase 1 (13%)
- **긴급 진행 중**: Phase 2-1 (0%)
- **대기**: Phase 2-2, Phase 3-5

### 남은 작업
- **총 작업량**: 7.5시간
- **완료 작업량**: 1시간
- **진행률**: 13%

---

## ⚠️ 리스크 및 대응 방안

### Risk 1: jsQR 라이브러리 성능 이슈 🟡
**영향**: QR 스캔 응답 시간 지연
**확률**: 낮음 (20%)
**완화 방안**:
- requestAnimationFrame으로 최적화
- 스캔 빈도 조절 (예: 100ms마다)

### Risk 2: 카메라 권한 거부 (iOS) 🟡
**영향**: QR 스캔 기능 동작 불가
**확률**: 낮음 (15%)
**완화 방안**:
- 권한 요청 안내 메시지 명확화
- 권한 거부 시 대체 플로우 제공 (수동 입력)

---

**최종 상태**: ✅ **Phase 2-1 긴급 작업 계획 완료**

**다음 담당자**: hands-on worker (Phase 2-1 긴급 수정 즉시 착수)

---

**작성 완료 시각**: 2025-12-01 11:00 KST
