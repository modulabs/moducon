# 13_HANDSON_NEXT_STEPS.md - hands-on worker 다음 단계 가이드

## 📋 문서 정보
- **작성일**: 2025-01-14
- **작성자**: hands-on worker
- **목적**: 다음 작업자를 위한 상세 가이드
- **현재 진행률**: 20% (Step 1-3 완료, Step 4-7 남음)

---

## ✅ 완료된 작업 요약

### Step 1-3 완료 항목
1. ✅ Next.js 16 프로젝트 생성 및 초기화
2. ✅ 필수 패키지 설치 (11개 패키지)
3. ✅ 프로젝트 설정 파일 작성 (next.config.ts, 환경변수, PWA)
4. ✅ 핵심 코드 구현 (타입, API 클라이언트, 인증 스토어)

---

## 🚀 즉시 진행해야 할 작업

### Step 4: UI 컴포넌트 구현 (예상 2-3시간)

#### 4.1 shadcn/ui 초기화
```bash
cd moducon-frontend
npx shadcn-ui@latest init
```

**선택 옵션**:
- Style: Default
- Base color: Slate
- CSS variables: Yes

#### 4.2 shadcn/ui 컴포넌트 설치
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add dialog
```

#### 4.3 Header 컴포넌트 작성
**파일**: `src/components/layout/Header.tsx`

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

#### 4.4 QRScanner 컴포넌트 작성
**파일**: `src/components/qr/QRScanner.tsx`

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

### Step 5: 주요 페이지 구현 (예상 6-8시간)

#### 5.1 로그인 페이지
**파일**: `src/app/login/page.tsx`
**참고**: 08_IMPLEMENTATION_GUIDE.md의 5.1절 전체 코드 복사

**주요 기능**:
- 이름 + 전화번호 뒷 4자리 입력
- React Hook Form + Zod 유효성 검증
- 로그인 성공 시 홈으로 리다이렉트

#### 5.2 홈 대시보드
**파일**: `src/app/home/page.tsx`
**참고**: 08_IMPLEMENTATION_GUIDE.md의 5.2절 전체 코드 복사

**주요 기능**:
- 사용자 출입증 표시
- 다가오는 세션 목록 (최근 3개)
- 추천 부스 목록 (최근 3개)
- 세션/부스 전체 목록 링크

#### 5.3 세션 목록 페이지 (필수 아님 - 시간 있을 때)
**파일**: `src/app/sessions/page.tsx`

**구현 우선순위**: 낮음 (로그인, 홈이 더 중요)

#### 5.4 부스 목록 페이지 (필수 아님 - 시간 있을 때)
**파일**: `src/app/booths/page.tsx`

**구현 우선순위**: 낮음

---

### Step 6: GitHub Actions 워크플로우 (예상 1시간)

#### 6.1 워크플로우 파일 생성
**파일**: `.github/workflows/deploy.yml`

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
          cache-dependency-path: 'moducon-frontend/package-lock.json'

      - name: Install dependencies
        working-directory: moducon-frontend
        run: npm ci

      - name: Build
        working-directory: moducon-frontend
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
          NEXT_PUBLIC_WS_URL: ${{ secrets.WS_URL }}

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./moducon-frontend/out
          cname: moducon.vibemakers.kr
```

#### 6.2 GitHub Secrets 설정
1. GitHub Repository → Settings → Secrets and variables → Actions
2. 새 Secret 추가:
   - `API_URL`: `https://api.moducon.vibemakers.kr` (아직 미정이면 임시값)
   - `WS_URL`: `wss://ws.moducon.vibemakers.kr`

---

### Step 7: 테스트 및 검증 (예상 2시간)

#### 7.1 로컬 빌드 테스트
```bash
cd moducon-frontend

# 개발 서버 실행
npm run dev
# 브라우저에서 http://localhost:3000 확인

# 프로덕션 빌드
npm run build

# out/ 디렉토리 확인
ls -la out/

# 로컬에서 정적 파일 서빙 테스트
npx serve out
```

#### 7.2 테스트 체크리스트
- [ ] 로그인 페이지 접속
- [ ] 로그인 폼 동작 (유효성 검증)
- [ ] 홈 대시보드 렌더링
- [ ] Header 컴포넌트 표시
- [ ] 반응형 디자인 확인 (모바일/데스크톱)
- [ ] 빌드 에러 없음

#### 7.3 배포 테스트
```bash
# 수동 배포 (첫 테스트)
npm run deploy
```

**GitHub Pages 설정 확인**:
1. Repository → Settings → Pages
2. Source: `gh-pages` / `root`
3. Custom domain: `moducon.vibemakers.kr`
4. Enforce HTTPS: ✅

---

## 🔧 발생 가능한 문제 및 해결

### 문제 1: TypeScript 에러 (next-pwa)
**증상**: `next.config.ts`에서 `withPWA` 타입 에러

**해결**:
```typescript
// @ts-ignore 추가
// @ts-ignore
import withPWA from 'next-pwa';
```

### 문제 2: html5-qrcode 동작 안함
**증상**: QR 스캐너 카메라 권한 오류

**해결**:
- 브라우저 설정에서 카메라 권한 허용
- HTTPS 환경에서만 동작 (로컬은 localhost 예외)

### 문제 3: API 호출 실패 (CORS)
**증상**: 백엔드 API 호출 시 CORS 에러

**해결**:
- 백엔드 서버에서 CORS 설정 필요
- 임시로 Mock 데이터 사용 (src/lib/mockData.ts 생성)

---

## 📚 참고 문서

### 필독 문서 (우선순위순)
1. `08_IMPLEMENTATION_GUIDE.md` ⭐⭐⭐ (가장 중요!)
2. `11_HANDSON_WORKER_LOG.md` (현재 작업 로그)
3. `07_PROGRESS.md` (전체 진행 상황)
4. `01_PRD.md` (요구사항 이해)
5. `02_dev_plan.md` (아키텍처 이해)

### 외부 참고 자료
- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)
- [html5-qrcode GitHub](https://github.com/mebjas/html5-qrcode)

---

## 🎯 성공 기준

### MVP 완성 조건
- [x] 프로젝트 초기화
- [ ] shadcn/ui 설치 및 Header 컴포넌트
- [ ] 로그인 페이지 완성 (동작 확인)
- [ ] 홈 대시보드 완성 (데이터 표시)
- [ ] GitHub Actions 배포 자동화
- [ ] 로컬 빌드 성공 (`npm run build`)
- [ ] GitHub Pages 배포 테스트 성공

### 최소 구현 항목
**반드시 구현**:
1. 로그인 페이지
2. 홈 대시보드
3. Header 컴포넌트
4. GitHub Actions 워크플로우

**선택 구현** (시간 있으면):
1. QRScanner 컴포넌트
2. 세션 목록 페이지
3. 부스 목록 페이지

---

## 💡 작업 팁

### 효율적인 작업 순서
1. shadcn/ui 먼저 설치 (모든 페이지에서 사용)
2. Header 컴포넌트 작성 (재사용)
3. 로그인 페이지 (진입점)
4. 홈 대시보드 (핵심 화면)
5. GitHub Actions (자동화)
6. 테스트 및 배포

### Git Commit 전략
- **기능 단위 커밋**: 컴포넌트 하나 완성 → 커밋
- **커밋 메시지 형식**: `feat: [기능명] 구현`
- **예시**: `feat: Header 컴포넌트 및 로그인 페이지 구현`

### 시간 관리
- **Step 4**: 2시간
- **Step 5 (로그인+홈)**: 4시간
- **Step 6**: 1시간
- **Step 7**: 2시간
- **총 예상 시간**: 9시간

---

## 🚨 주의사항

### Static Export 제약
- `getServerSideProps` 사용 불가
- API Routes (`app/api/*`) 사용 불가
- 모든 데이터 페칭은 클라이언트 사이드에서

### 이미지 최적화
- `next/image`의 `unoptimized: true` 설정 필수
- 이미지는 `public/` 디렉토리에 저장

### 환경 변수
- `NEXT_PUBLIC_*` prefix 필수 (클라이언트 노출)
- GitHub Actions Secrets 설정 필수

---

## 📞 막혔을 때

### 체크리스트
1. [ ] 오류 메시지를 정확히 읽었는가?
2. [ ] `08_IMPLEMENTATION_GUIDE.md`를 다시 확인했는가?
3. [ ] TypeScript 에러는 타입 정의를 확인했는가?
4. [ ] 패키지가 제대로 설치되었는가? (`npm install` 재실행)

### 도움 요청 시 포함할 정보
- 어떤 작업을 하고 있었는지
- 정확한 오류 메시지
- 시도한 해결 방법
- 관련 파일 경로 및 코드

---

**작업 상태**: ✅ Step 1-3 완료, Step 4-7 대기
**다음 담당자**: hands-on worker (계속) 또는 editor (코드 리뷰)
**예상 완료 시간**: 9-12시간
