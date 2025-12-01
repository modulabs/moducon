# 81_MOBILE_PWA_PLAN.md - 모바일 PWA 개발 계획서

## 📋 문서 정보
**작성일**: 2025-11-28
**작성자**: Technical Lead
**브랜치**: mobile-pwa-dev
**상태**: 📋 기획 완료, 구현 준비

---

## 🎯 프로젝트 개요

### 배경
서명 기능이 완료된 백엔드(96/100 A+ 등급)를 기반으로, 이제 **모바일 우선 PWA**를 개발합니다.
Google Sheets의 실제 데이터(부스 12개, 포스터 33개)를 연동하여 프로덕션 수준의 컨퍼런스 앱을 완성합니다.

### 목표
1. **모바일 우선 UI**: 모두콘 2025 참가자가 현장에서 사용하기 최적화된 인터페이스
2. **실제 데이터 연동**: Google Sheets MCP를 활용한 부스/포스터 데이터 표시
3. **QR 스캔 기능**: 후방카메라로 부스/세션/포스터 QR 코드 스캔
4. **PWA 기능**: 오프라인 모드, 홈 화면 추가, 푸시 알림

---

## 📊 현재 상태 분석

### ✅ 완료된 작업
1. **백엔드 API** (96/100 A+ 등급)
   - POST `/api/auth/login` - 로그인
   - POST `/api/auth/signature` - 디지털 서명
   - GET `/api/auth/me` - 사용자 정보
   - POST `/api/auth/reset-login` - 로그인 리셋
   - JWT 시크릿 강화 (32자)
   - Prisma 싱글톤 패턴
   - Connection Pooling (limit=20)

2. **프론트엔드 기본 구조** (mobile-pwa-dev 브랜치)
   - Next.js 16 프로젝트
   - 로그인 페이지 (`/login`)
   - 서명 페이지 (`/signature`)
   - 홈 페이지 (`/home`)
   - 세션 페이지 (`/sessions`)
   - shadcn/ui 컴포넌트 (Button, Card, Input, Badge 등)

3. **Google Sheets 데이터**
   - **부스**: 12개 (클라비, K-HP, 아이펠, 비즈팀, NVIDIA, DAO LAB 등)
   - **포스터**: 33개 (CVPR, ICCV, ACL, EMNLP, NeurIPS 등 국제학회 논문)
   - 스프레드시트 ID: `1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g`

### 📋 필요한 작업
1. **Google Sheets 연동**
   - `/api/booths` - 부스 목록 (Sheets '부스' 탭 → API)
   - `/api/papers` - 포스터 목록 (Sheets '포스터목록' 탭 → API)
   - 백엔드에서 Google Sheets MCP 사용 또는 프론트엔드에서 직접 호출

2. **모바일 UI 개선**
   - 부스 목록 페이지 (`/booths`)
   - 부스 상세 페이지 (`/booths/[id]`)
   - 포스터 목록 페이지 (`/papers`)
   - 포스터 상세 페이지 (`/papers/[id]`)
   - 인터랙티브 맵 (행사장 지도)

3. **QR 스캔 기능**
   - 후방 카메라 사용 (html5-qrcode)
   - 부스 QR → `/booths/[id]` 이동
   - 세션 QR → `/sessions/[id]` 이동
   - 포스터 QR → `/papers/[id]` 이동
   - QR 값 = 단순 부스/세션/포스터 이름

4. **PWA 기능**
   - Service Worker (오프라인 모드)
   - Web App Manifest (홈 화면 추가)
   - 푸시 알림 (선택적)

---

## 🗂️ 데이터 구조

### 부스 데이터 (12개)
```typescript
interface Booth {
  id: string;                // 고유 ID (예: "klabi")
  name: string;              // 단체명 (예: "클라비")
  organization: string;      // 단체 소개
  description: string;       // 부스 소개
  imageUrl?: string;         // 단체 소개 이미지 (Google Drive)
  type: 'enterprise' | 'lab' | 'education'; // 단체 구분
  tags: string[];            // 해시태그 (예: ["#AX SaaS", "#Agentic AI"])
  solutions?: string;        // 제공 솔루션
  technologies?: string;     // 핵심 기술
  demo?: string;             // 부스 내용(데모)
}
```

**실제 데이터 예시**:
- 클라비 (기업): AX SaaS, Agentic AI, 클라우드 네이티브
- K-HP (교육사업팀): AI재직자교육, AX전환, 무료세미나
- 아이펠 리서치팀 (교육): AI교육, AI엔지니어, AI리서처
- NVIDIA Data Engineering LAB: DataScience, NVIDIA, Tabular
- DAO LAB/다바코단: 바이브코딩교육, 챌린지툴킷, 브랜드컬러매치 게임
- GenAI in Finance LAB: AI Agent, RAG, Finance
- Hell Maker LAB: 파이썬, 인공지능, 로봇
- AI에이전트랩: AX, LLM, RAG
- VLM Safety LAB: VLM safety alignment

### 포스터 데이터 (33개)
```typescript
interface Paper {
  id: string;                // 고유 ID (예: "cvpr-2025-ano-face")
  title: string;             // 논문명
  authors: string[];         // 저자 (쉼표로 구분)
  organization?: string;     // 소속
  conference: string;        // 학회명 (예: "CVPR 2025")
  abstract?: string;         // 초록
  pdfUrl?: string;           // 원본파일 (Google Drive)
  paperUrl?: string;         // 논문 링크
  category?: string;         // 구분 (예: "아이펠")
  presentationTime?: string; // 발표 시간 (예: "12:40-13:20")
}
```

**실제 데이터 예시**:
- CVPR 2025 (7개): Ano-Face-Fair, Ano-Skin, Question-Aware Gaussian Experts 등
- ICCV 2025 (3개): IM-LUT, Text Embedding Quantization 등
- ACL 2025 (3개): QGuard, Typed-RAG, MSQAD 등
- EMNLP 2025 (3개): Keep Security!, How Do LVLMs See Text 등
- NeurIPS 2025 (2개): Efficient Multi-bit Quantization 등
- AAAI 2025 (2개): SAMPD, Real-Time Calibration Model 등
- 기타 학회: NAACL, ICLR, Interspeech, ICASSP, Cognitive Systems Research 등

---

## 🎨 UI/UX 설계

### 1. 홈 대시보드 (`/home`)
**현재 상태**: DigitalBadge, QuestProgress 컴포넌트 있음

**개선 사항**:
```tsx
// 추가 섹션
- 실시간 "Now Playing" 세션 카드
- 빠른 액션 버튼: QR 스캔, 지도, 부스, 포스터
- 카운트다운 타이머 (행사 시작까지)
- 주요 공지사항
```

### 2. 부스 목록 (`/booths`)
**새로 구현**:
```tsx
// 필터
- 전체 / 기업 / LAB / 교육사업팀
- 해시태그 필터 (#AI, #교육, #Agent 등)

// 카드 디자인
- 부스 이름
- 단체 구분 (배지)
- 해시태그 (최대 3개)
- 썸네일 이미지 (있는 경우)
- "자세히 보기" 버튼

// 정렬
- 이름순, 구분순
```

### 3. 부스 상세 (`/booths/[id]`)
**새로 구현**:
```tsx
// 상단
- 부스 이름 (H1)
- 단체 구분 배지
- 이미지 (Google Drive 링크)

// 본문
- 단체 소개
- 부스 소개
- 제공 솔루션
- 핵심 기술
- 데모 내용

// 하단
- 해시태그 목록
- "QR 방문 인증" 버튼
```

### 4. 포스터 목록 (`/papers`)
**새로 구현**:
```tsx
// 필터
- 학회별 (CVPR, ICCV, ACL, EMNLP 등)
- 발표 시간별 (1부, 2부, 발표X)

// 카드 디자인
- 논문 제목
- 저자 (첫 저자만)
- 학회명 배지 (색상 구분)
- 발표 시간 (있는 경우)
- "자세히 보기" 버튼

// 검색
- 제목/저자 검색
```

### 5. 포스터 상세 (`/papers/[id]`)
**새로 구현**:
```tsx
// 상단
- 논문 제목 (H1)
- 학회명 배지
- 발표 시간 배지

// 본문
- 저자 목록
- 소속 (있는 경우)
- 초록 (있는 경우)

// 하단
- PDF 다운로드 (있는 경우)
- 논문 링크 (있는 경우)
- "QR 방문 인증" 버튼
```

### 6. QR 스캔 (`/scan`)
**현재 상태**: QRScanner 컴포넌트 있음 (html5-qrcode)

**개선 사항**:
```tsx
// 후방 카메라 사용
- facingMode: "environment"

// QR 값 처리
- 부스: "클라비" → /booths/klabi
- 세션: "Track 1 Session A" → /sessions/track1-session-a
- 포스터: "CVPR 2025 Ano-Face" → /papers/cvpr-2025-ano-face

// UI
- 스캔 가이드 (중앙 사각형)
- 스캔 성공 애니메이션
- 에러 처리 (잘못된 QR)
```

---

## 🔧 기술 구현 계획

### Phase 1: Google Sheets 연동 (2시간)

#### 1.1 백엔드 API 추가 (1시간)
**파일**: `moducon-backend/src/routes/booths.ts` (신규)
```typescript
import express from 'express';

const router = express.Router();

// Google Sheets 데이터를 캐싱하여 제공
// (실제 구현은 Google Sheets MCP 또는 googleapis 사용)

// GET /api/booths - 부스 목록
router.get('/', async (req, res) => {
  // Google Sheets '부스' 탭 데이터 조회
  // 필터: type, tags
  // 예: /api/booths?type=lab&tags=AI,교육
});

// GET /api/booths/:id - 부스 상세
router.get('/:id', async (req, res) => {
  // id로 부스 조회 (예: "klabi")
});

export default router;
```

**파일**: `moducon-backend/src/routes/papers.ts` (신규)
```typescript
import express from 'express';

const router = express.Router();

// GET /api/papers - 포스터 목록
router.get('/', async (req, res) => {
  // Google Sheets '포스터목록' 탭 데이터 조회
  // 필터: conference, presentationTime
});

// GET /api/papers/:id - 포스터 상세
router.get('/:id', async (req, res) => {
  // id로 포스터 조회
});

export default router;
```

**통합**: `moducon-backend/src/index.ts`
```typescript
import boothsRouter from './routes/booths';
import papersRouter from './routes/papers';

app.use('/api/booths', boothsRouter);
app.use('/api/papers', papersRouter);
```

#### 1.2 프론트엔드 API 클라이언트 (30분)
**파일**: `moducon-frontend/src/lib/api.ts` (기존 파일 확장)
```typescript
// 부스 API
export const boothsApi = {
  list: (params?: { type?: string; tags?: string[] }) =>
    api.get('/booths', { params }),

  getById: (id: string) =>
    api.get(`/booths/${id}`),
};

// 포스터 API
export const papersApi = {
  list: (params?: { conference?: string; presentationTime?: string }) =>
    api.get('/papers', { params }),

  getById: (id: string) =>
    api.get(`/papers/${id}`),
};
```

#### 1.3 테스트 (30분)
- curl 테스트
- Postman 테스트
- 프론트엔드 연동 테스트

---

### Phase 2: 부스/포스터 UI 구현 (4시간)

#### 2.1 부스 목록 페이지 (1시간)
**파일**: `moducon-frontend/src/app/booths/page.tsx` (신규)
```tsx
'use client';

import { useState, useEffect } from 'react';
import { boothsApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function BoothsPage() {
  const [booths, setBooths] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // 부스 목록 조회
    boothsApi.list({ type: filter !== 'all' ? filter : undefined })
      .then(res => setBooths(res.data));
  }, [filter]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">부스 목록</h1>

      {/* 필터 */}
      <div className="flex gap-2 mb-4">
        <Badge onClick={() => setFilter('all')}>전체</Badge>
        <Badge onClick={() => setFilter('enterprise')}>기업</Badge>
        <Badge onClick={() => setFilter('lab')}>LAB</Badge>
        <Badge onClick={() => setFilter('education')}>교육</Badge>
      </div>

      {/* 부스 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {booths.map(booth => (
          <Card key={booth.id} className="p-4">
            <h3 className="font-bold">{booth.name}</h3>
            <Badge>{booth.type}</Badge>
            <p className="text-sm text-gray-600 mt-2">{booth.description}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {booth.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
            <a href={`/booths/${booth.id}`} className="text-blue-600 mt-2 block">
              자세히 보기 →
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

#### 2.2 부스 상세 페이지 (1시간)
**파일**: `moducon-frontend/src/app/booths/[id]/page.tsx` (신규)

#### 2.3 포스터 목록 페이지 (1시간)
**파일**: `moducon-frontend/src/app/papers/page.tsx` (신규)

#### 2.4 포스터 상세 페이지 (1시간)
**파일**: `moducon-frontend/src/app/papers/[id]/page.tsx` (신규)

---

### Phase 3: QR 스캔 개선 (2시간)

#### 3.1 후방 카메라 사용 (30분)
**파일**: `moducon-frontend/src/components/qr/QRScanner.tsx` (기존 파일 수정)
```tsx
import { Html5Qrcode } from 'html5-qrcode';

// 후방 카메라 사용
const html5QrCode = new Html5Qrcode("reader");
html5QrCode.start(
  { facingMode: "environment" }, // 후방 카메라
  { fps: 10, qrbox: 250 },
  onScanSuccess,
  onScanError
);
```

#### 3.2 QR 값 파싱 및 라우팅 (1시간)
**파일**: `moducon-frontend/src/lib/qr.ts` (신규)
```typescript
export function parseQRValue(value: string) {
  // 부스: "클라비" → { type: 'booth', id: 'klabi' }
  // 세션: "Track 1 Session A" → { type: 'session', id: 'track1-session-a' }
  // 포스터: "CVPR 2025 Ano-Face" → { type: 'paper', id: 'cvpr-2025-ano-face' }

  // ID 생성: 소문자 변환 + 공백을 하이픈으로
  const generateId = (str: string) =>
    str.toLowerCase().replace(/\s+/g, '-');

  if (value.includes('Track')) {
    return { type: 'session', id: generateId(value) };
  } else if (value.includes('CVPR') || value.includes('ICCV') || ...) {
    return { type: 'paper', id: generateId(value) };
  } else {
    return { type: 'booth', id: generateId(value) };
  }
}

export function navigateFromQR(value: string, router: any) {
  const { type, id } = parseQRValue(value);

  switch (type) {
    case 'booth':
      router.push(`/booths/${id}`);
      break;
    case 'session':
      router.push(`/sessions/${id}`);
      break;
    case 'paper':
      router.push(`/papers/${id}`);
      break;
  }
}
```

#### 3.3 UI 개선 (30분)
- 스캔 가이드 (중앙 사각형)
- 성공 애니메이션
- 에러 처리

---

### Phase 4: PWA 기능 (2시간)

#### 4.1 Service Worker (1시간)
**파일**: `moducon-frontend/public/sw.js` (신규)
```javascript
const CACHE_NAME = 'moducon-v1';
const urlsToCache = [
  '/',
  '/login',
  '/home',
  '/booths',
  '/papers',
  '/offline.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

#### 4.2 Web App Manifest (30분)
**파일**: `moducon-frontend/public/manifest.json` (기존 파일 수정)
```json
{
  "name": "모두콘 2025",
  "short_name": "Moducon",
  "description": "모두의연구소 컨퍼런스 2025 디지털 가이드",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### 4.3 홈 화면 추가 안내 (30분)
**파일**: `moducon-frontend/src/components/pwa/InstallPrompt.tsx` (신규)

---

## 📅 개발 일정

### Week 1: 데이터 연동 (2025-11-28 ~ 12-04)
- [x] Google Sheets 데이터 확인 (완료)
- [ ] 백엔드 API 추가 (`/api/booths`, `/api/papers`)
- [ ] 프론트엔드 API 클라이언트 확장
- [ ] 통합 테스트

### Week 2: UI 구현 (12-05 ~ 12-11)
- [ ] 부스 목록/상세 페이지
- [ ] 포스터 목록/상세 페이지
- [ ] QR 스캔 개선 (후방 카메라, 라우팅)
- [ ] 모바일 반응형 디자인

### Week 3: PWA & 테스트 (12-12 ~ 12-13)
- [ ] Service Worker 구현
- [ ] 오프라인 모드 테스트
- [ ] 최종 통합 테스트
- [ ] 행사 당일 배포 (12-13)

---

## 🎯 성공 지표

### 기능 완성도
- [ ] 부스 12개 모두 표시
- [ ] 포스터 33개 모두 표시
- [ ] QR 스캔 성공률 95% 이상
- [ ] 오프라인 모드 동작 확인

### 성능
- [ ] LCP < 2.5초
- [ ] FID < 100ms
- [ ] 모바일 Lighthouse 점수 > 90

### 사용자 경험
- [ ] 모바일 터치 최적화
- [ ] 홈 화면 추가 안내
- [ ] 오프라인 접근 가능

---

## 🚨 리스크 및 대응

### 리스크 1: Google Sheets API 제한
**완화**:
- 백엔드에서 캐싱 (Redis 또는 메모리)
- 1시간마다 자동 갱신

### 리스크 2: QR 스캔 오류
**완화**:
- 수동 검색 기능 제공
- QR 값을 단순화 (부스/세션/포스터 이름만)

### 리스크 3: 오프라인 모드 제한
**완화**:
- 핵심 페이지만 캐싱
- 오프라인 안내 페이지 제공

---

**작성자**: Technical Lead
**작성일**: 2025-11-28
**다음 담당자**: **hands-on worker** (백엔드 API 구현 → 프론트엔드 UI 구현)
