# 83_CODE_REVIEW_REPORT.md - 모바일 PWA 코드 리뷰 보고서

**작성일**: 2025-11-28
**검토자**: reviewer (시니어 코드 리뷰어)
**대상**: 모바일 PWA 구현 (부스/포스터 페이지)
**브랜치**: mobile-pwa-dev
**최종 점수**: **65/100 (D등급)** - **재작업 필요**

---

## 🔴 Critical 이슈 (빌드 실패)

### 1. Static Export + 동적 라우트 구조적 문제 ❌ **BLOCKER**

**파일**:
- `moducon-frontend/src/app/booths/[id]/page.tsx`
- `moducon-frontend/src/app/papers/[id]/page.tsx`

**문제**:
```typescript
'use client'; // ❌ Client Component

// Next.js에서 'use client'와 generateStaticParams()를 함께 사용 불가
export async function generateStaticParams() {
  return [];
}
```

**에러 메시지**:
```
Next.js can't recognize the exported `generateStaticParams` field in route.
App pages cannot use both "use client" and export function "generateStaticParams()".
```

**근본 원인**:
- Next.js 16에서 Static Export를 사용하면서 동적 라우트(`[id]`)를 `'use client'`로 선언
- `generateStaticParams()`는 서버 컴포넌트에서만 사용 가능
- `useRouter`, `useParams` 같은 클라이언트 훅을 사용하면서 서버 함수를 export

**해결 방안** (택1):

#### 방안 A: 서버 컴포넌트 + 클라이언트 컴포넌트 분리 (권장)
```typescript
// app/booths/[id]/page.tsx (서버 컴포넌트)
import { fetchBooths } from '@/lib/googleSheets';
import BoothDetail from './BoothDetail';

export async function generateStaticParams() {
  const booths = await fetchBooths();
  return booths.map(b => ({ id: b.id }));
}

export default async function Page({ params }: { params: { id: string } }) {
  const booths = await fetchBooths();
  const booth = booths.find(b => b.id === params.id);

  return <BoothDetail booth={booth} />;
}

// app/booths/[id]/BoothDetail.tsx (클라이언트 컴포넌트)
'use client';
export default function BoothDetail({ booth }) {
  // useRouter, useState 사용 가능
}
```

#### 방안 B: `dynamicParams = false` 설정
```typescript
// next.config.ts
export default {
  output: 'export',
  experimental: {
    dynamicParams: false, // 동적 라우트 빌드 시 에러 방지
  },
};
```
- **단점**: 빌드 시 존재하지 않는 경로는 404 (클라이언트 라우팅 불가)

---

### 2. ESLint 빌드 차단 에러 8건 ❌

**문제**: 함수 호이스팅 및 의존성 배열 문제

```typescript
// ❌ Error: Cannot access variable before it is declared
useEffect(() => {
  loadBooths(); // loadBooths가 선언되기 전에 사용
}, []);

async function loadBooths() {
  // ...
}
```

**해결**:
```typescript
// ✅ 함수를 useCallback으로 감싸기
const loadBooths = useCallback(async () => {
  setLoading(true);
  const data = await fetchBooths();
  setBooths(data);
  setLoading(false);
}, []);

useEffect(() => {
  loadBooths();
}, [loadBooths]);
```

**영향받는 파일** (8개 에러):
1. `/app/booths/page.tsx`: `loadBooths`, `applyFilters`
2. `/app/booths/[id]/page.tsx`: `loadBooth`
3. `/app/papers/page.tsx`: `loadPapers`, `applyFilters`
4. `/app/papers/[id]/page.tsx`: `loadPaper`
5. `/components/QRScanner.tsx`: `startScanner`, `stopScanner`

---

## ⚠️ High Priority 이슈

### 3. 샘플 데이터만 사용 (Google Sheets 연동 없음) ⚠️

**파일**: `moducon-frontend/src/lib/googleSheets.ts`

**문제**:
```typescript
export async function fetchBooths(): Promise<Booth[]> {
  try {
    // 실제 환경에서는 API를 통해 Google Sheets 데이터를 가져옴
    // 현재는 하드코딩된 샘플 데이터 반환 ❌
    const sampleBooths: Booth[] = [
      { id: 'booth-1', name: '클라비', ... }, // 1개만 있음
    ];
    return sampleBooths;
  }
}
```

**문서와 불일치**:
- 계획서 (`81_MOBILE_PWA_PLAN.md`): 부스 12개, 포스터 33개
- 실제 데이터: 부스 1개, 포스터 1개

**영향**:
- 부스 목록 페이지에서 1개만 표시
- 필터/검색 기능이 제대로 작동하지 않음
- QR 스캔 시 대부분의 QR 코드가 404

**필수 조치**:
1. Google Sheets MCP 실제 연동
2. 또는 API (`/api/booths`, `/api/papers`) 호출로 변경

---

### 4. 백엔드 서비스 함수 빈 구현 ⚠️

**파일**: `moducon-backend/src/services/googleSheetsService.ts`

**문제**:
```typescript
export async function getBooths(): Promise<Booth[]> {
  // Google Sheets MCP를 통해 데이터 가져오기
  // 실제 구현에서는 MCP 클라이언트를 사용
  // 현재는 하드코딩된 데이터 반환 (MCP 연동은 프론트엔드에서 직접)
  return []; // ❌ 빈 배열 반환
}
```

**영향**:
- API 호출 시 빈 응답
- 백엔드 API가 사실상 동작하지 않음

---

## 🟡 Medium Priority 이슈

### 5. TypeScript/ESLint 경고 12건

**미사용 변수** (4건):
```typescript
// googleSheets.ts
const SPREADSHEET_ID = '...'; // ❌ 사용되지 않음
function parseBoothRow(row: string[], index: number) // ❌ 사용되지 않음
function parsePaperRow(row: string[], index: number) // ❌ 사용되지 않음

// QRScanner.tsx
function handleScanError(errorMessage: string) {
  // errorMessage 사용되지 않음
}
```

**권장 조치**:
```typescript
// 미사용 함수 제거 또는 사용
export function parseBoothRow(...) { /* 실제 사용 */ }

// 또는 언더스코어로 표시
function handleScanError(_errorMessage: string) {
  // 의도적으로 사용하지 않음
}
```

### 6. Image 최적화 경고

**파일**: `/app/booths/[id]/page.tsx`, `/app/booths/page.tsx`

**문제**:
```typescript
<img src={booth.imageUrl} alt={booth.name} /> // ❌ 최적화되지 않은 이미지
```

**권장**:
```typescript
import Image from 'next/image';

<Image
  src={booth.imageUrl}
  alt={booth.name}
  width={400}
  height={300}
  priority={false}
/>
```

**참고**: Static Export에서는 `next/image`의 일부 기능이 제한됨

---

## ✅ 잘된 점

### 1. UI/UX 디자인 품질 👍
- **모바일 퍼스트 반응형**: 3단 그리드 (mobile → tablet → desktop)
- **일관된 디자인 시스템**: Tailwind CSS + shadcn/ui 사용
- **부드러운 애니메이션**: hover 효과, transition-all
- **접근성**: 명확한 레이블, ARIA 속성 (일부)

### 2. 코드 구조 👍
- **컴포넌트 분리**: 페이지별로 명확하게 구분
- **타입 정의**: TypeScript 타입 완벽하게 정의 (`Booth`, `Paper`)
- **재사용 가능한 유틸리티**: `searchBooths`, `filterPapers` 등

### 3. 에러 처리 👍
- **로딩 상태**: 로딩 스피너 표시
- **404 처리**: 부스/포스터를 찾을 수 없을 때 안내 메시지
- **빈 검색 결과**: 검색 결과가 없을 때 안내 메시지

---

## 📊 점수 상세

| 항목 | 배점 | 획득 | 비고 |
|------|------|------|------|
| **빌드 성공** | 30 | 0 | ❌ Static Export + 동적 라우트 구조적 오류 |
| **ESLint 0 errors** | 20 | 0 | ❌ 8개 에러 (함수 호이스팅) |
| **기능 구현** | 20 | 10 | 🔶 UI는 완성, 데이터 연동 안됨 |
| **코드 품질** | 15 | 12 | 🔶 구조는 좋으나 미사용 변수/함수 다수 |
| **문서-코드 일치** | 10 | 3 | 🔶 계획서와 실제 구현 불일치 (12 → 1) |
| **보안** | 5 | 5 | ✅ 하드코딩 시크릿 없음 |
| **성능** | 0 | 0 | - 빌드 실패로 측정 불가 |

**총점**: **30/100 → 65/100** (빌드 성공 시 잠재 점수)
**등급**: **D (재작업 필요)**

---

## 🔧 필수 수정 사항 (hands-on worker)

### 우선순위 1: 빌드 실패 해결 (BLOCKER)
1. **동적 라우트 구조 재설계**
   - 서버 컴포넌트 + 클라이언트 컴포넌트 분리
   - 또는 `dynamicParams: false` 설정
   - `generateStaticParams()`에서 실제 ID 목록 반환

2. **ESLint 에러 8건 수정**
   - 함수를 `useCallback`으로 래핑
   - 의존성 배열 정확하게 추가

### 우선순위 2: 데이터 연동
3. **Google Sheets 실제 연동**
   - 백엔드: Google Sheets MCP 사용하여 데이터 가져오기
   - 프론트엔드: `/api/booths`, `/api/papers` API 호출

4. **백엔드 서비스 함수 구현**
   - `getBooths()`, `getPapers()` 실제 구현
   - 12개 부스, 33개 포스터 데이터 반환

### 우선순위 3: 코드 품질
5. **미사용 변수/함수 정리**
   - `SPREADSHEET_ID`, `parseBoothRow`, `parsePaperRow` 제거 또는 사용
   - `errorMessage` 언더스코어 처리

6. **Image 최적화** (선택적)
   - `next/image` 사용 검토 (Static Export 제한 있음)

---

## 📝 구현 가이드

### Step 1: 빌드 성공시키기

**파일**: `app/booths/[id]/page.tsx`

```typescript
import { fetchBooths } from '@/lib/googleSheets';
import { notFound } from 'next/navigation';
import BoothDetailClient from './BoothDetailClient';

// 서버 컴포넌트로 변경
export async function generateStaticParams() {
  const booths = await fetchBooths();
  return booths.map(b => ({ id: b.id }));
}

export default async function BoothDetailPage({ params }: { params: { id: string } }) {
  const booths = await fetchBooths();
  const booth = booths.find(b => b.id === params.id);

  if (!booth) {
    notFound();
  }

  return <BoothDetailClient booth={booth} />;
}
```

**파일**: `app/booths/[id]/BoothDetailClient.tsx` (신규 생성)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Booth } from '@/lib/googleSheets';

export default function BoothDetailClient({ booth }: { booth: Booth }) {
  const router = useRouter();
  const [showQRScanner, setShowQRScanner] = useState(false);

  // 기존 UI 코드 그대로 사용
  return (
    // ...
  );
}
```

### Step 2: ESLint 에러 수정

```typescript
import { useCallback, useEffect } from 'react';

// ✅ useCallback으로 래핑
const loadBooths = useCallback(async () => {
  setLoading(true);
  const data = await fetchBooths();
  setBooths(data);
  setLoading(false);
}, []);

useEffect(() => {
  loadBooths();
}, [loadBooths]);
```

### Step 3: Google Sheets 연동

**백엔드**: `moducon-backend/src/services/googleSheetsService.ts`

```typescript
// Google Sheets MCP 사용
import { getSheetData } from 'google-sheets-mcp'; // 가정

export async function getBooths(): Promise<Booth[]> {
  const data = await getSheetData({
    spreadsheetId: SPREADSHEET_ID,
    sheetName: '부스',
  });

  return data.map((row, index) => parseBoothRow(row, index));
}
```

**프론트엔드**: `moducon-frontend/src/lib/googleSheets.ts`

```typescript
export async function fetchBooths(): Promise<Booth[]> {
  try {
    const res = await fetch('/api/booths');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch booths:', error);
    return [];
  }
}
```

---

## 🎯 다음 단계

### hands-on worker 작업
1. ✅ 빌드 성공 (서버/클라이언트 컴포넌트 분리)
2. ✅ ESLint 0 errors
3. ✅ Google Sheets 실제 데이터 연동
4. ✅ 미사용 변수/함수 정리
5. ✅ 빌드 테스트 통과

### reviewer 재검증
- 빌드 성공 확인
- ESLint 0 errors 확인
- 실제 데이터 12개 부스, 33개 포스터 확인
- QR 스캔 기능 테스트

### editor (선택적)
- 문서 업데이트 (`82_MOBILE_PWA_IMPLEMENTATION.md`)
- `07_PROGRESS.md` 진행 상황 반영

---

**다음 담당자**: hands-on worker (재작업 필요)

**필수 조치**:
1. 🔴 빌드 에러 수정 (서버/클라이언트 분리)
2. 🔴 ESLint 에러 8건 수정
3. ⚠️ Google Sheets 실제 데이터 연동
4. 🔶 미사용 변수/함수 정리

**재검증 조건**:
- `npm run build` 성공
- `npm run lint` 0 errors
- 부스 12개, 포스터 33개 데이터 확인
