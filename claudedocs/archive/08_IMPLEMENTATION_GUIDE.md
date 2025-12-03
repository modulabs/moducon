# 08_IMPLEMENTATION_GUIDE.md - 구현 가이드

## 📋 문서 정보

**프로젝트명**: 모두콘 2025 디지털 컨퍼런스 북
**문서 버전**: 1.0
**작성일**: 2025-01-14
**대상**: Hands-on Worker (구현 담당자)
**목적**: GitHub Pages 배포 가능한 MVP 초안 구현

---

## 🎯 구현 목표

### MVP 범위 (최소 기능)
1. **인증 시스템**: QR 접속 → 로그인 → 출입증 발급
2. **세션 관리**: 세션 목록 조회 및 체크인
3. **부스 관리**: 부스 목록 조회 및 방문 인증
4. **기본 UI**: 반응형 디자인 + PWA 준비
5. **GitHub Pages 배포**: 정적 사이트 생성 및 배포

### 구현하지 않는 기능 (차후 단계)
- 퀘스트 시스템
- 페이퍼샵
- 네트워킹 기능
- 실시간 혼잡도
- 관리자 도구

---

## 🚀 Step 1: 프로젝트 초기화

### 1.1 Next.js 프로젝트 생성

```bash
# 프로젝트 루트에서 실행
npx create-next-app@latest moducon-frontend --typescript --tailwind --app --src-dir --import-alias "@/*"

# 생성 옵션 선택
# ✅ TypeScript: Yes
# ✅ ESLint: Yes
# ✅ Tailwind CSS: Yes
# ✅ src/ directory: Yes
# ✅ App Router: Yes
# ✅ Import alias: @/*
```

### 1.2 프로젝트 구조 생성

```bash
cd moducon-frontend

# 주요 디렉토리 생성
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/qr
mkdir -p src/lib
mkdir -p src/store
mkdir -p src/types
mkdir -p public
```

### 1.3 필수 패키지 설치

```bash
# UI 및 상태 관리
npm install zustand react-hook-form zod @hookform/resolvers

# QR 코드
npm install html5-qrcode qrcode @types/qrcode

# UI 컴포넌트 (shadcn/ui)
npx shadcn-ui@latest init

# shadcn/ui 컴포넌트 추가
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add dialog

# 유틸리티
npm install date-fns lucide-react clsx

# PWA
npm install next-pwa

# 개발 도구
npm install -D gh-pages
```

---

## 🔧 Step 2: 프로젝트 설정

### 2.1 next.config.js 작성

```javascript
/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig = withPWA({
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  },
  basePath: '',
  assetPrefix: '',
});

module.exports = nextConfig;
```

### 2.2 환경 변수 설정

**.env.local** (개발용):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

**.env.production** (프로덕션용):
```bash
NEXT_PUBLIC_API_URL=https://api.moducon.vibemakers.kr
NEXT_PUBLIC_WS_URL=wss://ws.moducon.vibemakers.kr
```

### 2.3 public/CNAME 생성

```bash
echo "moducon.vibemakers.kr" > public/CNAME
```

### 2.4 public/manifest.json 작성

```json
{
  "name": "모두콘 2025 디지털 컨퍼런스 북",
  "short_name": "Moducon 2025",
  "description": "모두의연구소 컨퍼런스 2025",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 2.5 package.json 스크립트 추가

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "deploy": "next build && gh-pages -d out"
  }
}
```

---

## 📝 Step 3: 핵심 코드 구현

### 3.1 타입 정의 (src/types/index.ts)

```typescript
// User
export interface User {
  id: string;
  name: string;
  phone_last4: string;
  email?: string;
  organization?: string;
  role?: string;
  interests?: string[];
  registration_type: 'pre_registered' | 'onsite';
  has_signature: boolean;
}

// Session
export interface Session {
  id: string;
  track_number: number;
  title: string;
  speaker: string;
  description?: string;
  start_time: string;
  end_time: string;
  location: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  qr_code: string;
}

// Booth
export interface Booth {
  id: string;
  name: string;
  organization: string;
  description: string;
  tech_tags: string[];
  location_x?: number;
  location_y?: number;
  estimated_duration_minutes: number;
  qr_code: string;
  image_url?: string;
  booth_type: 'lab' | 'sponsor' | 'community';
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### 3.2 API 클라이언트 (src/lib/api.ts)

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token')
    : null;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'API Error');
  }

  return data.data;
}

// Auth APIs
export const authAPI = {
  login: (name: string, phone_last4: string) =>
    apiCall<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ name, phone_last4 }),
    }),

  saveSignature: (signatureData: string) =>
    apiCall<{ badgeUrl: string }>('/api/auth/signature', {
      method: 'POST',
      body: JSON.stringify({ signatureData }),
    }),

  getMe: () => apiCall<User>('/api/auth/me'),
};

// Session APIs
export const sessionAPI = {
  getAll: () => apiCall<Session[]>('/api/sessions'),

  getById: (id: string) => apiCall<Session>(`/api/sessions/${id}`),

  checkin: (sessionId: string) =>
    apiCall<{ success: boolean }>(`/api/sessions/${sessionId}/checkin`, {
      method: 'POST',
    }),
};

// Booth APIs
export const boothAPI = {
  getAll: () => apiCall<Booth[]>('/api/booths'),

  getById: (id: string) => apiCall<Booth>(`/api/booths/${id}`),

  visit: (boothId: string) =>
    apiCall<{ success: boolean }>(`/api/booths/${boothId}/visit`, {
      method: 'POST',
    }),
};
```

### 3.3 인증 스토어 (src/store/authStore.ts)

```typescript
import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  login: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),
}));
```

---

## 🎨 Step 4: UI 컴포넌트 구현

### 4.1 레이아웃 (src/components/layout/Header.tsx)

```typescript
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

export function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          모두콘 2025
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              로그아웃
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
```

### 4.2 QR 스캐너 (src/components/qr/QRScanner.tsx)

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      (decodedText) => {
        onScan(decodedText);
        scanner.stop();
      },
      (errorMessage) => {
        onError?.(errorMessage);
      }
    );

    return () => {
      if (scanner.isScanning) {
        scanner.stop();
      }
    };
  }, [onScan, onError]);

  return (
    <div className="flex flex-col items-center">
      <div id="qr-reader" className="w-full max-w-md" />
      <p className="mt-4 text-sm text-muted-foreground">
        QR 코드를 카메라에 비춰주세요
      </p>
    </div>
  );
}
```

---

## 📱 Step 5: 주요 페이지 구현

### 5.1 로그인 페이지 (src/app/login/page.tsx)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  name: z.string().min(2, '이름을 입력해주세요'),
  phone_last4: z.string().length(4, '전화번호 뒷 4자리를 입력해주세요'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      const result = await authAPI.login(data.name, data.phone_last4);
      login(result.token, result.user);
      router.push('/home');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>모두콘 2025 로그인</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                placeholder="홍길동"
                {...register('name')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone_last4">전화번호 뒷 4자리</Label>
              <Input
                id="phone_last4"
                placeholder="1234"
                maxLength={4}
                {...register('phone_last4')}
              />
              {errors.phone_last4 && (
                <p className="mt-1 text-sm text-red-500">{errors.phone_last4.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 5.2 홈 대시보드 (src/app/home/page.tsx)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { sessionAPI, boothAPI } from '@/lib/api';
import type { Session, Booth } from '@/types';
import Link from 'next/link';

export default function HomePage() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsData, boothsData] = await Promise.all([
          sessionAPI.getAll(),
          boothAPI.getAll(),
        ]);
        setSessions(sessionsData.slice(0, 3)); // 최근 3개만
        setBooths(boothsData.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">안녕하세요, {user?.name}님!</h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/sessions">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="p-6 text-center">
              <p className="text-lg font-semibold">세션 목록</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/booths">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="p-6 text-center">
              <p className="text-lg font-semibold">부스 목록</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Sessions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>다가오는 세션</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="border-b pb-4 last:border-0">
                <h3 className="font-semibold">{session.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {session.speaker} • {session.location}
                </p>
              </div>
            ))}
          </div>
          <Link href="/sessions">
            <Button variant="outline" className="w-full mt-4">
              전체 세션 보기
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Featured Booths */}
      <Card>
        <CardHeader>
          <CardTitle>추천 부스</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {booths.map((booth) => (
              <div key={booth.id} className="border-b pb-4 last:border-0">
                <h3 className="font-semibold">{booth.name}</h3>
                <p className="text-sm text-muted-foreground">{booth.organization}</p>
              </div>
            ))}
          </div>
          <Link href="/booths">
            <Button variant="outline" className="w-full mt-4">
              전체 부스 보기
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🚀 Step 6: 배포 준비

### 6.1 GitHub Repository 생성

```bash
# Git 초기화 (아직 안했다면)
git init

# .gitignore 확인
echo "node_modules/
.next/
out/
.env*.local
.DS_Store" > .gitignore

# 커밋
git add .
git commit -m "feat: 프론트엔드 초기 구현 완료"

# Remote 추가 및 Push
git remote add origin https://github.com/modulabs/moducon-frontend.git
git branch -M main
git push -u origin main
```

### 6.2 GitHub Actions 워크플로우 생성

**.github/workflows/deploy.yml**:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
          NEXT_PUBLIC_WS_URL: ${{ secrets.WS_URL }}

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
          cname: moducon.vibemakers.kr
```

### 6.3 GitHub Repository Settings

1. **Settings → Pages**:
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Custom domain: `moducon.vibemakers.kr`
   - Enforce HTTPS: ✅

2. **Settings → Secrets and variables → Actions**:
   - `API_URL`: `https://api.moducon.vibemakers.kr`
   - `WS_URL`: `wss://ws.moducon.vibemakers.kr`

### 6.4 DNS 설정 (vibemakers.kr)

```
Type: A
Host: moducon
Values:
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153

Type: AAAA (IPv6, 선택)
Host: moducon
Values:
  2606:50c0:8000::153
  2606:50c0:8001::153
  2606:50c0:8002::153
  2606:50c0:8003::153
```

---

## ✅ Step 7: 테스트 및 검증

### 7.1 로컬 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 확인
# http://localhost:3000
```

**테스트 체크리스트**:
- [ ] 로그인 페이지 접속
- [ ] 로그인 폼 동작
- [ ] 홈 대시보드 렌더링
- [ ] 세션 목록 API 연동
- [ ] 부스 목록 API 연동
- [ ] 반응형 디자인 확인 (모바일/데스크톱)

### 7.2 빌드 테스트

```bash
# 프로덕션 빌드
npm run build

# out/ 디렉토리 확인
ls -la out/

# 로컬에서 정적 파일 서빙 테스트
npx serve out
```

### 7.3 배포 테스트

```bash
# 수동 배포 (첫 테스트)
npm run deploy

# GitHub Actions 자동 배포 확인
# Repository → Actions 탭에서 워크플로우 실행 확인
```

---

## 🔧 Step 8: 백엔드 연동 준비

### 8.1 백엔드 CORS 설정 확인

백엔드 서버에서 다음 도메인 허용 필요:
```javascript
const allowedOrigins = [
  'https://moducon.vibemakers.kr',
  'https://modulabs.github.io',
  'http://localhost:3000',
];
```

### 8.2 Mock 데이터 (백엔드 준비 전)

백엔드가 준비되기 전까지 Mock 데이터 사용:

**src/lib/mockData.ts**:
```typescript
export const mockSessions = [
  {
    id: '1',
    track_number: 1,
    title: 'AI 기초 워크샵',
    speaker: '홍길동',
    description: '인공지능 기초 개념 학습',
    start_time: '2025-12-13T10:00:00',
    end_time: '2025-12-13T11:00:00',
    location: 'Track 1',
    difficulty: 'beginner' as const,
    tags: ['AI', 'Workshop'],
    qr_code: 'session-1-qr',
  },
  // ... 더 추가
];

export const mockBooths = [
  {
    id: '1',
    name: 'AI Lab',
    organization: '모두의연구소',
    description: 'AI 데모 체험',
    tech_tags: ['AI', 'ML'],
    estimated_duration_minutes: 15,
    qr_code: 'booth-1-qr',
    booth_type: 'lab' as const,
  },
  // ... 더 추가
];
```

---

## 📋 구현 완료 체크리스트

### 프로젝트 초기화
- [ ] Next.js 프로젝트 생성
- [ ] 필수 패키지 설치
- [ ] next.config.js 설정
- [ ] 환경 변수 설정
- [ ] PWA manifest.json 생성

### 핵심 코드
- [ ] 타입 정의 작성
- [ ] API 클라이언트 구현
- [ ] 인증 스토어 구현
- [ ] 공통 컴포넌트 (Header, QR 스캐너)

### 페이지 구현
- [ ] 로그인 페이지
- [ ] 홈 대시보드
- [ ] 세션 목록 페이지
- [ ] 부스 목록 페이지

### 배포
- [ ] GitHub Repository 생성
- [ ] GitHub Actions 워크플로우 설정
- [ ] GitHub Pages 설정
- [ ] DNS 설정 (moducon.vibemakers.kr)
- [ ] HTTPS 활성화 확인

### 테스트
- [ ] 로컬 개발 서버 테스트
- [ ] 프로덕션 빌드 테스트
- [ ] 배포 테스트
- [ ] 모바일 반응형 확인

---

## 🚨 주의사항

### 1. Static Export 제약
- `getServerSideProps` 사용 불가
- API Routes (`app/api/*`) 사용 불가
- Dynamic Routes는 `generateStaticParams` 필요
- 모든 데이터 페칭은 클라이언트 사이드에서 수행

### 2. 이미지 최적화
- `next/image`의 `unoptimized: true` 설정 필요
- 가능하면 WebP 포맷 사용
- 적절한 크기로 리사이징

### 3. 환경 변수
- `NEXT_PUBLIC_*` prefix 필수 (클라이언트 노출)
- GitHub Actions Secrets 설정 필요

### 4. CORS
- 백엔드에서 프론트엔드 도메인 허용 필수
- Preflight request 처리 필요

---

## 📚 참고 문서

- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)
- [React Hook Form](https://react-hook-form.com/)

---

## 🎯 다음 단계

구현 완료 후:
1. **editor**에게 넘겨 코드 리뷰 요청
2. 피드백 반영 후 **reviewer**에게 최종 검수 요청
3. 승인 후 백엔드 팀과 통합 테스트

---

**문서 상태**: ✅ 구현 가이드 작성 완료
**다음 담당자**: hands-on worker (구현 시작)
