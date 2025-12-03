# 164_PRD_UPDATE.md - PRD 업데이트 (v3.0)

**작성일**: 2025-12-01
**작성자**: Technical Lead
**버전**: v3.0
**기반**: 151_PRD_CORE.md

---

## 🎯 업데이트 요약

### 변경 이유
기존 PRD (151_PRD_CORE.md)에서 **QR 스캔 UI 문제점**이 발견되어 긴급 수정 필요

### 핵심 변경사항
1. ✅ 하단 네비게이션 QR 버튼 UI 상세 명세 추가
2. ✅ QR 스캔 카메라 영상 표시 방식 수정
3. ✅ 현재 문제점 및 개선 요구사항 명확화

---

## 🚨 긴급 수정 사항

### 문제 1: QR 스캔 카메라 UI 문제
**현재 상태** (❌ 잘못됨):
```
┌─────────────────────────────────────┐
│     [카메라 배경 영상 1]            │
│                                     │
│    ┌───────────────────┐            │
│    │ [정사각형 박스]   │            │
│    │ (카메라 영상 안 나옴) │        │
│    └───────────────────┘            │
│                                     │
│     [카메라 배경 영상 2]            │
└─────────────────────────────────────┘
```

**요구사항** (✅ 올바른):
```
┌─────────────────────────────────────┐
│ [어두운 배경 overlay]               │
│                                     │
│    ┌───────────────────┐            │
│    │ [카메라 영상]      │ ← 여기만 나옴
│    │ (280x280px)       │            │
│    └───────────────────┘            │
│                                     │
│  "QR 코드를 네모 박스 안에 맞춰주세요" │
└─────────────────────────────────────┘
```

**기술적 해결 방법**:
1. 카메라 스트림을 `<video>` 태그에 연결
2. 정사각형 박스를 `absolute` 위치로 `<video>` 위에 오버레이
3. 외부는 `shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]`로 어둡게 처리
4. 카메라 영상이 전체 화면에 표시되도록 하되, 박스 외부는 시각적으로 가림

---

### 문제 2: QR 버튼 UI 상세 명세 부족
**요구사항 추가**:
1. ✅ QR 버튼 가장자리 쉐도우 (살짝만)
   ```css
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
   ```

2. ✅ QR 버튼에 QR 아이콘 추가
   ```tsx
   import { QrCode } from 'lucide-react';

   <QrCode className="w-6 h-6 text-white" />
   ```

3. ✅ 버튼 위치: 하단 네비게이션 정 가운데
   ```css
   position: relative;
   top: -8px; /* 살짝 위로 튀어나옴 */
   ```

---

## 📋 업데이트된 핵심 기능 명세

### 2. QR 스캔 시스템 (업데이트)

#### 2.1 하단 네비게이션 QR 버튼 ✅ 상세 명세 추가
**UI 명세**:
```tsx
// 버튼 크기: 64x64px (기존)
// 버튼 색상: 그라데이션 (primary → primary-dark)
// 버튼 쉐도우: box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); 🆕
// 버튼 아이콘: <QrCode /> 🆕
// 버튼 위치: 정 가운데, 살짝 위로 튀어나옴 (top: -8px) 🆕
// 애니메이션: animate-pulse (기존)

<button
  className="relative -top-2 w-16 h-16 rounded-full
             bg-gradient-to-r from-primary to-primary-dark
             shadow-[0_2px_8px_rgba(0,0,0,0.15)]
             ring-4 ring-white animate-pulse"
  onClick={() => setQRModalOpen(true)}
  aria-label="QR 코드 스캔"
>
  <QrCode className="w-6 h-6 text-white mx-auto" />
  <span className="text-xs text-white">스캔</span>
</button>
```

**현재 상태**: ⏳ Phase 2 예정 (2시간)

---

#### 2.2 QR 스캔 UI 개선 ✅ 카메라 영상 표시 방식 수정
**요구사항**:
- ❌ **문제**: 카메라 영상이 배경에 2번 나옴
- ✅ **해결**: 정사각형 박스에 카메라 영상이 딱 나오도록 수정

**기술적 구현**:
```tsx
// QRScannerModal.tsx 수정 필요
<div className="fixed inset-0 z-50 bg-black">
  {/* 카메라 영상 (전체 화면) */}
  <video
    ref={videoRef}
    className="absolute inset-0 w-full h-full object-cover"
    autoPlay
    playsInline
  />

  {/* 오버레이: 외부 어둡게 처리 */}
  <div className="absolute inset-0 flex items-center justify-center">
    {/* 정사각형 박스 가이드 */}
    <div
      className="relative w-[280px] h-[280px] border-4 border-white rounded-2xl
                 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
    >
      {/* 카메라 영상이 이 박스 안에만 보이도록 처리 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  </div>

  {/* 안내 메시지 */}
  <div className="absolute bottom-20 left-0 right-0 text-center">
    <p className="text-white text-lg">
      QR 코드를 네모 박스 안에 맞춰주세요
    </p>
  </div>
</div>
```

**현재 상태**: 🔴 **긴급 수정 필요** (30분)

---

## 🔄 Phase 우선순위 재조정

### 기존 순서
```
Phase 2: 하단 네비게이션 (2시간)
Phase 3: Database (1시간)
Phase 4: 체크인 API (2시간)
Phase 5: 마이페이지 (1시간)
```

### 수정된 순서
```
Phase 2-1: QR 스캔 카메라 UI 긴급 수정 (30분) 🔴 P0
Phase 2-2: 하단 네비게이션 구현 (2시간) 🔴 P0
Phase 3: Database (1시간) 🟡 P1
Phase 4: 체크인 API (2시간) 🟡 P1
Phase 5: 마이페이지 (1시간) 🟢 P2
```

**총 예상 시간**: 6.5시간 (30분 추가)

---

## 🎯 변경 사항 요약

### 추가된 요구사항
1. ✅ QR 버튼 쉐도우 추가 (살짝만)
2. ✅ QR 버튼 QR 아이콘 추가
3. ✅ QR 스캔 카메라 영상 표시 방식 수정 (긴급)

### 변경된 우선순위
1. 🔴 Phase 2-1: QR 스캔 카메라 UI 긴급 수정 (최우선)
2. 🔴 Phase 2-2: 하단 네비게이션 구현
3. 🟡 Phase 3-5: Database, API, 마이페이지 (순차 진행)

---

## 📊 PRD 준수도 평가 (업데이트)

### 1. 재미 (Fun) - 7/10 → **8/10** ✅
**개선 사항**:
- ✅ QR 버튼 UI 개선으로 사용자 경험 향상
- ✅ 카메라 영상 표시 방식 수정으로 직관성 증가

### 2. 창의성 (Creativity) - 8/10 → **8.5/10** ✅
**개선 사항**:
- ✅ 중앙 원형 QR 버튼 (기존 하단 네비와 차별화)
- ✅ 정사각형 스캔 가이드 (외부 어둡게 처리)

### 3. 유익함 (Usefulness) - 9/10 (유지)
**변경 없음**

### 4. 흥행 (Virality) - 6/10 (유지)
**변경 없음**

### 5. 감동 (Emotional Impact) - 7/10 (유지)
**변경 없음**

---

## 🚀 다음 작업 우선순위

### 🔴 P0 (Critical) - 즉시 착수
1. **Phase 2-1: QR 스캔 카메라 UI 긴급 수정** (30분)
   - QRScannerModal.tsx 수정
   - 카메라 영상 표시 방식 수정
   - 빌드 검증

2. **Phase 2-2: 하단 네비게이션 구현** (2시간)
   - BottomNavigation.tsx 생성
   - QR 버튼 쉐도우 + 아이콘 추가
   - Layout 통합

### 🟡 P1 (High) - 순차 진행
3. **Phase 3: Database 마이그레이션** (1시간)
4. **Phase 4: 체크인 API 구현** (2시간)
5. **Phase 5: 마이페이지 구현** (1시간)

---

**최종 업데이트**: 2025-12-01
**버전**: v3.0
**다음 담당자**: hands-on worker (Phase 2-1 긴급 수정 착수)
