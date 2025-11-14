# 02_dev_plan.md - 개발 계획서

## 📋 문서 정보

**프로젝트명**: 모두콘 2025 디지털 컨퍼런스 북
**문서 버전**: 1.0
**작성일**: 2025-01-14
**작성자**: Technical Lead

---

## 🎯 프로젝트 개요

### 목표
GitHub Pages 기반 PWA로 배포 가능한 컨퍼런스 가이드 앱 초안 제작

### 핵심 가치
- **빠른 배포**: GitHub Pages로 즉시 배포 가능
- **오프라인 지원**: PWA로 네트워크 없이도 동작
- **개인화**: 사용자 맞춤 퀘스트 시스템
- **실시간**: WebSocket 기반 혼잡도 업데이트

---

## 🏗️ 시스템 아키텍처

### 아키텍처 개요

```
┌─────────────────────────────────────────────────┐
│              Client (Browser)                   │
│  ┌─────────────────────────────────────────┐   │
│  │   Next.js Static Site (GitHub Pages)    │   │
│  │  - PWA (Service Worker)                 │   │
│  │  - Offline Mode (IndexedDB)             │   │
│  │  - QR Scanner                           │   │
│  └─────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────┘
                  │
                  │ HTTPS / WSS
                  ↓
┌─────────────────────────────────────────────────┐
│          Backend Server (기존 서버)             │
│  ┌─────────────────────────────────────────┐   │
│  │         REST API + WebSocket            │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │         PostgreSQL Database             │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### 주요 설계 결정

#### 1. Frontend: GitHub Pages + Next.js Static Export
**선택 이유**:
- ✅ 무료 호스팅 (트래픽 제한 없음)
- ✅ CDN 자동 제공 (빠른 로딩)
- ✅ HTTPS 자동 지원
- ✅ 배포 간단 (git push로 자동 배포)
- ✅ 정적 파일이므로 서버 부하 없음

**제약사항**:
- ❌ SSR (Server-Side Rendering) 불가
- ❌ API Routes 불가 (별도 백엔드 필요)
- ❌ 이미지 최적화 제한 (unoptimized: true)

**대응 방안**:
- CSR (Client-Side Rendering)로 구현
- 백엔드 API는 기존 서버 활용
- 이미지는 WebP로 수동 최적화

#### 2. Backend: 기존 서버 활용
**구성**:
- REST API: 인증, 데이터 CRUD
- WebSocket: 실시간 혼잡도 업데이트
- PostgreSQL: 관계형 데이터 저장

**CORS 설정 필수**:
```javascript
// Backend CORS Configuration
app.use(cors({
  origin: [
    'https://moducon.vibemakers.kr',  // 프로덕션
    'https://modulabs.github.io',     // 폴백
    'http://localhost:3000',          // 개발
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));
```

#### 3. 커스텀 도메인: moducon.vibemakers.kr
**장점**:
- 짧고 기억하기 쉬운 URL (QR 코드 단순화)
- 전문적인 브랜딩
- 향후 재사용 가능

**DNS 설정**:
```
Type: A
Host: moducon
Values:
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
```

---

## 📦 기술 스택

### Frontend

| 카테고리 | 기술 | 버전 | 선택 근거 |
|---------|-----|------|----------|
| Framework | Next.js | 14+ | React 기반, Static Export 지원 |
| UI Library | React | 18+ | 컴포넌트 기반 개발 |
| Styling | Tailwind CSS | 3.3+ | 유틸리티 클래스, 빠른 개발 |
| UI Components | shadcn/ui | latest | Radix UI 기반, 접근성 우수 |
| State Management | Zustand | 4.4+ | 간단한 상태 관리 |
| Form Handling | React Hook Form + Zod | latest | 타입 안전한 폼 처리 |
| PWA | next-pwa | 5.6+ | Service Worker 자동 생성 |
| QR Scanner | html5-qrcode | 2.3+ | 크로스 브라우저 지원 |
| QR Generator | qrcode | 1.5+ | QR 코드 생성 |
| Date Handling | date-fns | 2.30+ | 가벼운 날짜 라이브러리 |
| Icons | lucide-react | latest | 일관된 아이콘 세트 |
| Deployment | gh-pages | 6.0+ | GitHub Pages 배포 자동화 |

### Backend (기존 서버 활용)

| 카테고리 | 기술 | 용도 |
|---------|-----|------|
| Runtime | Node.js / Python | 서버 실행 환경 |
| Framework | Express / FastAPI | REST API 구현 |
| Database | PostgreSQL | 관계형 데이터 저장 |
| ORM | Prisma / SQLAlchemy | DB 추상화 |
| Auth | JWT | 토큰 기반 인증 |
| Realtime | WebSocket (ws) | 실시간 통신 |
| Storage | File System / S3 | 서명 이미지 저장 |

### DevOps & Monitoring

| 카테고리 | 도구 | 용도 |
|---------|-----|------|
| Version Control | Git + GitHub | 코드 버전 관리 |
| CI/CD | GitHub Actions | 자동 빌드 & 배포 |
| Error Tracking | Sentry | 프론트엔드 에러 추적 |
| Analytics | Google Analytics | 사용자 분석 |
| Testing | Jest + Playwright | 단위/E2E 테스트 |

---

## 📂 디렉토리 구조

### 프론트엔드 (moducon-frontend)

```
moducon-frontend/
├── public/
│   ├── CNAME                    # 커스텀 도메인 설정
│   ├── manifest.json            # PWA 매니페스트
│   ├── icon-192.png             # PWA 아이콘
│   ├── icon-512.png
│   ├── robots.txt
│   └── favicon.ico
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   ├── page.tsx             # 홈 페이지
│   │   ├── login/               # 로그인 페이지
│   │   ├── onboarding/          # 온보딩 (관심사 선택)
│   │   ├── home/                # 대시보드
│   │   ├── map/                 # 지도
│   │   ├── sessions/            # 세션 목록/상세
│   │   ├── booths/              # 부스 목록/상세
│   │   ├── papers/              # 페이퍼샵
│   │   ├── quest/               # 퀘스트
│   │   ├── profile/             # 프로필
│   │   ├── activity/            # 활동 기록
│   │   └── networking/          # 네트워킹
│   │
│   ├── components/              # 재사용 컴포넌트
│   │   ├── ui/                  # shadcn/ui 컴포넌트
│   │   ├── layout/              # Header, Footer, Nav
│   │   ├── qr/                  # QR 스캐너/생성기
│   │   ├── badge/               # 출입증 컴포넌트
│   │   └── quest/               # 퀘스트 관련 컴포넌트
│   │
│   ├── lib/                     # 유틸리티 함수
│   │   ├── api.ts               # API 클라이언트
│   │   ├── websocket.ts         # WebSocket 클라이언트
│   │   ├── storage.ts           # LocalStorage/IndexedDB
│   │   ├── auth.ts              # 인증 헬퍼
│   │   └── utils.ts             # 공통 유틸리티
│   │
│   ├── store/                   # Zustand 스토어
│   │   ├── authStore.ts         # 인증 상태
│   │   ├── questStore.ts        # 퀘스트 상태
│   │   ├── sessionStore.ts      # 세션 상태
│   │   └── congestionStore.ts   # 혼잡도 상태
│   │
│   ├── types/                   # TypeScript 타입 정의
│   │   ├── api.ts               # API 응답 타입
│   │   ├── models.ts            # 데이터 모델
│   │   └── index.ts
│   │
│   └── styles/                  # 전역 스타일
│       └── globals.css          # Tailwind CSS import
│
├── next.config.js               # Next.js 설정 (Static Export)
├── tailwind.config.js           # Tailwind 설정
├── tsconfig.json                # TypeScript 설정
├── package.json
└── .env.local                   # 환경 변수 (로컬)
```

### 백엔드 (기존 서버)

```
moducon-backend/
├── src/
│   ├── routes/                  # API 라우트
│   │   ├── auth.ts              # 인증
│   │   ├── users.ts             # 사용자
│   │   ├── sessions.ts          # 세션
│   │   ├── booths.ts            # 부스
│   │   ├── papers.ts            # 페이퍼샵
│   │   ├── quests.ts            # 퀘스트
│   │   ├── activities.ts        # 활동 기록
│   │   └── congestion.ts        # 혼잡도
│   │
│   ├── controllers/             # 비즈니스 로직
│   ├── models/                  # DB 모델
│   ├── middleware/              # 미들웨어 (auth, cors)
│   ├── services/                # 서비스 레이어
│   ├── websocket/               # WebSocket 서버
│   └── utils/                   # 유틸리티
│
├── prisma/                      # Prisma ORM (Node.js 사용 시)
│   └── schema.prisma
│
├── migrations/                  # DB 마이그레이션
├── .env                         # 환경 변수
└── package.json
```

---

## 🚀 개발 단계별 계획

### Phase 1: 프로젝트 초기화 (1주)

#### 1.1 프론트엔드 세팅
```bash
# Next.js 프로젝트 생성
npx create-next-app@latest moducon-frontend --typescript --tailwind --app

# 필수 패키지 설치
cd moducon-frontend
npm install zustand react-hook-form zod @radix-ui/react-* html5-qrcode qrcode date-fns lucide-react next-pwa

# DevDependencies
npm install -D gh-pages @playwright/test jest
```

#### 1.2 next.config.js 설정
```javascript
/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = withPWA({
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.moducon.vibemakers.kr',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://ws.moducon.vibemakers.kr',
  },
  basePath: '',
  assetPrefix: '',
});

module.exports = nextConfig;
```

#### 1.3 백엔드 세팅 (기존 서버)
- CORS 설정 추가
- JWT 인증 미들웨어 구현
- Database 연결 테스트
- API 엔드포인트 스켈레톤 생성

#### 1.4 GitHub 저장소 설정
```bash
# Repository 생성
gh repo create modulabs/moducon --public

# GitHub Pages 설정
# Settings → Pages → Source: gh-pages branch
```

### Phase 2: 인증 시스템 (1주)

#### 2.1 현장 QR 접속
- QR 코드 생성 (moducon.vibemakers.kr)
- 자동 리다이렉트 로직

#### 2.2 사전 신청자 인증
- 로그인 폼 (이름 + 전화번호 뒷 4자리)
- API: POST /api/auth/login
- JWT 토큰 발급 및 저장

#### 2.3 디지털 서명
- Canvas 기반 서명 패드
- Base64 인코딩 및 업로드
- API: POST /api/auth/signature

#### 2.4 출입증 발급
- QR 코드 생성 (사용자 ID)
- 출입증 UI 컴포넌트
- 오프라인 접근 가능하도록 캐싱

### Phase 3: 핵심 기능 (2주)

#### 3.1 세션 관리
- 세션 목록 API 연동
- 필터링 (트랙별, 시간대별)
- 세션 상세 페이지
- QR 스캔 체크인

#### 3.2 부스 관리
- 부스 목록 API 연동
- 지도 연동 (간단한 SVG 맵)
- 부스 방문 QR 인증

#### 3.3 실시간 혼잡도
- WebSocket 연결
- 30초 간격 업데이트
- 색상 표시 (🟢🟡🟠🔴)

### Phase 4: 퀘스트 시스템 (2주)

#### 4.1 관심 분야 선택
- 온보딩 UI
- API: POST /api/user/interests

#### 4.2 퀘스트 생성
- 개인화 알고리즘
- API: POST /api/quests/generate

#### 4.3 퀘스트 진행
- 체크리스트 UI
- QR 인증
- 진행률 시각화

#### 4.4 페이퍼샵 & 퀴즈
- 논문 목록
- 퀴즈 시스템
- 정답 확인

### Phase 5: PWA & 오프라인 (1주)

#### 5.1 Service Worker
- next-pwa 설정
- 캐싱 전략 (App Shell, Network First)

#### 5.2 Offline Mode
- IndexedDB에 중요 데이터 저장
- Background Sync

#### 5.3 Installability
- manifest.json 완성
- Add to Home Screen 유도

### Phase 6: 관리자 도구 (1주)

#### 6.1 콘텐츠 관리
- 세션/부스/페이퍼 등록 API
- 관리자 인증

#### 6.2 모니터링 대시보드
- 실시간 체크인 현황
- 퀘스트 진행률
- 에러 로그

### Phase 7: 배포 준비 (1주)

#### 7.1 환경 변수 설정
```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.moducon.vibemakers.kr
NEXT_PUBLIC_WS_URL=wss://ws.moducon.vibemakers.kr
```

#### 7.2 빌드 & 배포
```bash
# 빌드
npm run build

# 배포 (gh-pages)
npm run deploy
```

#### 7.3 DNS 설정
- CNAME 파일 생성
- DNS A Record 설정
- HTTPS 활성화 확인

---

## 🔧 핵심 구현 사항

### 1. API 클라이언트

```typescript
// src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

### 2. WebSocket 클라이언트

```typescript
// src/lib/websocket.ts
const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

export class WebSocketClient {
  private ws: WebSocket | null = null;

  connect(onMessage: (data: any) => void) {
    this.ws = new WebSocket(WS_URL);
    this.ws.onmessage = (event) => {
      onMessage(JSON.parse(event.data));
    };
  }

  disconnect() {
    this.ws?.close();
  }
}
```

### 3. QR 스캐너

```typescript
// src/components/qr/QRScanner.tsx
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

export function QRScanner({ onScan }: { onScan: (data: string) => void }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    }, false);

    scanner.render(onScan, (error) => {
      console.error(error);
    });

    return () => scanner.clear();
  }, [onScan]);

  return <div id="reader" />;
}
```

### 4. 인증 상태 관리

```typescript
// src/store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  login: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
}));
```

---

## 📊 성능 목표

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Bundle Size
- Initial Bundle: < 300KB (gzipped)
- Total JS: < 500KB (gzipped)

### 최적화 전략
1. **Code Splitting**: 페이지별 번들 분리
2. **Image Optimization**: WebP 변환, lazy loading
3. **Tree Shaking**: 미사용 코드 제거
4. **CSS Optimization**: Tailwind PurgeCSS

---

## 🧪 테스트 전략

### 단위 테스트 (Jest)
- 컴포넌트 테스트
- 유틸리티 함수 테스트
- 스토어 로직 테스트

### E2E 테스트 (Playwright)
- 로그인 플로우
- 퀘스트 완료 플로우
- QR 스캔 시나리오

### 성능 테스트
- Lighthouse CI
- WebPageTest
- Bundle Analyzer

---

## 📦 배포 프로세스

### 개발 환경
```bash
npm run dev
# http://localhost:3000
```

### 프로덕션 빌드
```bash
npm run build
# 결과물: out/ 디렉토리
```

### GitHub Pages 배포
```bash
# package.json scripts
{
  "deploy": "next build && gh-pages -d out"
}

# 배포 실행
npm run deploy
```

### CI/CD (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

---

## 🚨 리스크 관리

### 기술 리스크
1. **대규모 동시 접속**: 백엔드 서버 스케일링 준비
2. **오프라인 환경**: Service Worker로 대응
3. **QR 스캔 실패**: 수동 입력 옵션 제공

### 완화 전략
- Load Testing 사전 수행 (1,000명 동시 접속)
- Fallback UI 구현
- 모니터링 시스템 구축 (Sentry)

---

## 📝 다음 단계

### 즉시 진행
1. ✅ 02_dev_plan.md 작성 완료
2. 📝 05_API_SPEC.md 작성 (API 엔드포인트 상세 명세)
3. 📝 06_DB_DESIGN.md 작성 (데이터베이스 스키마 및 ERD)

### 구현 준비
4. 프론트엔드 프로젝트 초기화
5. 백엔드 CORS 설정 및 API 구현 시작
6. GitHub Pages 배포 테스트

---

**문서 상태**: ✅ 개발 계획 수립 완료
**다음 담당자**: Technical Lead (API 명세서 작성)
