# 59_ADMIN_LOGIN_IMPLEMENTATION_PLAN.md - 관리자 로그인 구현 계획

## 📋 문서 정보
- **작성자**: Technical Lead (Planner)
- **작성일**: 2025-11-21
- **대상**: hands-on worker
- **목적**: 관리자 로그인 및 UI 개선 구현 가이드

---

## 🎯 요구사항 분석

### 현재 상황
1. ✅ **이미 구현된 것들**:
   - 백엔드 관리자 API 3개 (`/api/admin/participants`, `/search`, `/:id`)
   - JWT 기반 관리자 인증 미들웨어 (`adminAuth.ts`)
   - 관리자 페이지 (`/admin`) - 참가자 목록, 서명 이미지 표시
   - 서명 이미지는 실제로 표시되고 있음 (Base64)

2. 🔴 **문제점**:
   - 관리자 로그인 페이지가 없음 (현재 누구나 `/admin` 접근 가능)
   - 관리자 계정이 DB에 없음
   - 프론트엔드에서 JWT 토큰을 발급받는 로직 없음
   - 대시보드 UI가 다양한 색상으로 산만함

3. 🎯 **구현 목표**:
   - 관리자 로그인 페이지 생성 (`/admin/login`)
   - 관리자 계정 DB 저장 (id: modulabs, pw: moduaiffel1!)
   - 관리자 로그인 API 구현
   - 관리자 페이지 접근 시 인증 체크
   - UI를 공공문서 스타일로 개선

---

## 📐 시스템 설계

### 1. 데이터베이스 스키마 추가

**새 테이블: `admins`**
```prisma
model Admin {
  id           String   @id @default(uuid()) @db.Uuid
  username     String   @unique @db.VarChar(50)
  passwordHash String   @map("password_hash") @db.VarChar(255)
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz

  @@map("admins")
}
```

### 2. 백엔드 API 구조

#### 2.1 관리자 로그인 API
```typescript
POST /api/admin/login
Content-Type: application/json

Request Body:
{
  "username": "modulabs",
  "password": "moduaiffel1!"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  },
  "message": "Admin login successful"
}

Response (401 Unauthorized):
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "아이디 또는 비밀번호가 올바르지 않습니다."
  }
}
```

#### 2.2 라우터 구조 변경
```
현재:
- GET /api/admin/participants (JWT 인증 필요)
- GET /api/admin/participants/search (JWT 인증 필요)
- GET /api/admin/participants/:id (JWT 인증 필요)

추가:
- POST /api/admin/login (인증 불필요, 토큰 발급)
```

### 3. 프론트엔드 구조

#### 3.1 페이지 구조
```
/admin              → 관리자 대시보드 (인증 필요)
/admin/login        → 관리자 로그인 페이지 (신규)
```

#### 3.2 인증 플로우
```
1. 사용자 /admin 접근
   ↓
2. 토큰 확인 (localStorage)
   ├─ 토큰 없음 → /admin/login 리다이렉트
   └─ 토큰 있음 → 토큰 유효성 검증
      ├─ 유효 → 대시보드 표시
      └─ 만료/무효 → /admin/login 리다이렉트

3. /admin/login에서 로그인
   ↓
4. 백엔드 API 호출 → JWT 토큰 발급
   ↓
5. localStorage에 토큰 저장
   ↓
6. /admin으로 리다이렉트
```

---

## 🛠️ 구현 단계

### Step 1: 데이터베이스 준비 (15분)

#### 1.1 Prisma 스키마 수정
**파일**: `moducon-backend/prisma/schema.prisma`
```prisma
model Admin {
  id           String   @id @default(uuid()) @db.Uuid
  username     String   @unique @db.VarChar(50)
  passwordHash String   @map("password_hash") @db.VarChar(255)
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz

  @@map("admins")
}
```

#### 1.2 마이그레이션 실행
```bash
cd moducon-backend
npx prisma migrate dev --name add_admin_table
```

#### 1.3 관리자 계정 시드 스크립트
**파일**: `moducon-backend/prisma/seed-admin.ts` (신규)
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  const username = 'modulabs';
  const password = 'moduaiffel1!';

  // 비밀번호 해시 생성
  const passwordHash = await bcrypt.hash(password, 10);

  // 관리자 계정 생성 (이미 있으면 무시)
  await prisma.admin.upsert({
    where: { username },
    update: {},
    create: {
      username,
      passwordHash,
    },
  });

  console.log('✅ Admin account created: modulabs');
}

seedAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### 1.4 시드 실행
```bash
npx tsx prisma/seed-admin.ts
```

---

### Step 2: 백엔드 API 구현 (30분)

#### 2.1 관리자 로그인 컨트롤러
**파일**: `moducon-backend/src/controllers/adminController.ts` (기존 파일에 추가)
```typescript
/**
 * POST /api/admin/login
 * 관리자 로그인
 */
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 입력 검증
    if (!username || !password) {
      return res.status(400).json(
        errorResponse('MISSING_FIELDS', '아이디와 비밀번호를 입력해주세요.')
      );
    }

    // 관리자 계정 조회
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return res.status(401).json(
        errorResponse('INVALID_CREDENTIALS', '아이디 또는 비밀번호가 올바르지 않습니다.')
      );
    }

    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json(
        errorResponse('INVALID_CREDENTIALS', '아이디 또는 비밀번호가 올바르지 않습니다.')
      );
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { adminId: admin.id, username: admin.username },
      process.env.ADMIN_SECRET || 'admin-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    logger.info(`Admin login successful: ${username}`);

    res.json(
      successResponse(
        {
          token,
          expiresIn: '7d',
        },
        'Admin login successful'
      )
    );
  } catch (error) {
    logger.error('Admin login error:', error);
    res.status(500).json(
      errorResponse('LOGIN_FAILED', 'Login failed. Please try again.')
    );
  }
};
```

#### 2.2 라우터 수정
**파일**: `moducon-backend/src/routes/admin.ts` (수정)
```typescript
import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// 로그인 API (인증 불필요)
router.post('/login', adminController.adminLogin);

// 이하 모든 라우트에 인증 미들웨어 적용
router.use(adminAuth);

router.get('/participants', adminController.getParticipants);
router.get('/participants/search', adminController.searchParticipants);
router.get('/participants/:id', adminController.getParticipantById);

export default router;
```

---

### Step 3: 프론트엔드 로그인 페이지 구현 (45분)

#### 3.1 관리자 로그인 페이지
**파일**: `moducon-frontend/src/app/admin/login/page.tsx` (신규)
```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
        // JWT 토큰 저장
        localStorage.setItem('admin_token', result.data.token);
        router.push('/admin');
      } else {
        setError(result.error?.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">관리자 로그인</h1>
          <p className="text-gray-600 mt-2">모두콘 2025 관리자 페이지</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              아이디
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="관리자 아이디를 입력하세요"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

#### 3.2 관리자 페이지 인증 체크 추가
**파일**: `moducon-frontend/src/app/admin/page.tsx` (수정)
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';

// ... (기존 Participant 인터페이스)

export default function AdminPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // 인증 체크
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchParticipants();
  }, [router]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('admin_token');

      const response = await fetch(`${API_URL}/api/admin/participants`, {
        headers: {
          'x-admin-token': token || '',
        },
      });

      const result = await response.json();

      if (response.status === 401) {
        // 토큰 만료 또는 무효
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
        return;
      }

      if (result.success) {
        setParticipants(result.data.participants);
        setError(null);
      } else {
        setError('참가자 목록을 불러오지 못했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  // ... (기존 코드 유지)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              관리자 대시보드
            </h1>
            <p className="text-gray-600">참가자 목록 및 서명 관리</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            로그아웃
          </button>
        </div>

        {/* 나머지 코드 동일 */}
      </div>
    </div>
  );
}
```

---

### Step 4: UI 개선 - 공공문서 스타일 (30분)

#### 4.1 대시보드 통계 색상 개선
**현재 문제**: 다양한 색상 (blue-600, green-600, purple-600) → 일관성 부족

**개선 방안**: 단색 또는 그레이스케일 기반
```tsx
{/* 통계 - 공공문서 스타일 */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
  <div className="bg-white p-6 rounded border border-gray-300">
    <div className="text-sm text-gray-600 mb-1">전체 참가자</div>
    <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
  </div>
  <div className="bg-white p-6 rounded border border-gray-300">
    <div className="text-sm text-gray-600 mb-1">서명 완료</div>
    <div className="text-3xl font-bold text-gray-900">{stats.withSignature}</div>
  </div>
  <div className="bg-white p-6 rounded border border-gray-300">
    <div className="text-sm text-gray-600 mb-1">로그인 기록</div>
    <div className="text-3xl font-bold text-gray-900">{stats.withLogin}</div>
  </div>
</div>
```

#### 4.2 서명 여부 표시 개선
**현재 문제**: 이모지 + 색상 배지 (✅ 완료, ❌ 미완료) → 산만함

**개선 방안**: 심플한 텍스트 기반
```tsx
<td className="px-6 py-4 whitespace-nowrap text-center">
  {participant.has_signature ? (
    <span className="text-sm text-gray-700">완료</span>
  ) : (
    <span className="text-sm text-gray-400">미완료</span>
  )}
</td>
```

#### 4.3 로그인 기록 표시 개선
**현재 문제**: 이모지 (🔐 있음, 🔓 없음)

**개선 방안**: 텍스트 기반
```tsx
<td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
  {participant.last_login
    ? new Date(participant.last_login).toLocaleString('ko-KR')
    : '-'}
</td>
```

#### 4.4 전체 테이블 스타일
```tsx
<div className="bg-white rounded border border-gray-300 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="min-w-full">
      <thead className="bg-gray-50 border-b border-gray-300">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
            이름
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
            전화번호 뒷자리
          </th>
          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
            서명
          </th>
          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
            최근 로그인
          </th>
          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
            등록일시
          </th>
          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
            상세
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {/* ... */}
      </tbody>
    </table>
  </div>
</div>
```

---

### Step 5: Playwright 테스트 (45분)

#### 5.1 테스트 시나리오
1. 관리자 로그인 페이지 접근
2. 잘못된 자격증명 로그인 시도 → 에러 메시지 확인
3. 올바른 자격증명 로그인 → 토큰 저장 확인
4. 관리자 대시보드 접근 → 참가자 목록 표시 확인
5. 참가자 상세보기 → 서명 이미지 표시 확인
6. 로그아웃 → 로그인 페이지로 리다이렉트 확인
7. 토큰 없이 /admin 접근 → 로그인 페이지로 리다이렉트 확인

#### 5.2 테스트 파일
**파일**: `moducon-frontend/e2e/admin.spec.ts` (신규)
```typescript
import { test, expect } from '@playwright/test';

const ADMIN_LOGIN_URL = 'http://localhost:3000/admin/login';
const ADMIN_DASHBOARD_URL = 'http://localhost:3000/admin';
const ADMIN_USERNAME = 'modulabs';
const ADMIN_PASSWORD = 'moduaiffel1!';

test.describe('관리자 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로컬스토리지 클리어
    await page.goto(ADMIN_DASHBOARD_URL);
    await page.evaluate(() => localStorage.clear());
  });

  test('토큰 없이 /admin 접근 시 로그인 페이지로 리다이렉트', async ({ page }) => {
    await page.goto(ADMIN_DASHBOARD_URL);
    await expect(page).toHaveURL(ADMIN_LOGIN_URL);
  });

  test('잘못된 자격증명으로 로그인 시도', async ({ page }) => {
    await page.goto(ADMIN_LOGIN_URL);

    await page.fill('input[id="username"]', 'wrong_user');
    await page.fill('input[id="password"]', 'wrong_password');
    await page.click('button[type="submit"]');

    await expect(page.locator('.bg-red-50')).toBeVisible();
    await expect(page.locator('.bg-red-50')).toContainText('올바르지 않습니다');
  });

  test('올바른 자격증명으로 로그인 성공', async ({ page }) => {
    await page.goto(ADMIN_LOGIN_URL);

    await page.fill('input[id="username"]', ADMIN_USERNAME);
    await page.fill('input[id="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // 대시보드로 리다이렉트 확인
    await expect(page).toHaveURL(ADMIN_DASHBOARD_URL);

    // 로컬스토리지에 토큰 저장 확인
    const token = await page.evaluate(() => localStorage.getItem('admin_token'));
    expect(token).toBeTruthy();
  });

  test('관리자 대시보드에서 참가자 목록 표시', async ({ page }) => {
    // 먼저 로그인
    await page.goto(ADMIN_LOGIN_URL);
    await page.fill('input[id="username"]', ADMIN_USERNAME);
    await page.fill('input[id="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(ADMIN_DASHBOARD_URL);

    // 통계 확인
    await expect(page.locator('text=전체 참가자')).toBeVisible();
    await expect(page.locator('text=서명 완료')).toBeVisible();

    // 테이블 확인
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('thead >> text=이름')).toBeVisible();
    await expect(page.locator('thead >> text=전화번호 뒷자리')).toBeVisible();

    // 조해창 확인
    await expect(page.locator('text=조해창')).toBeVisible();
  });

  test('참가자 상세보기 클릭 시 서명 이미지 표시', async ({ page }) => {
    // 로그인
    await page.goto(ADMIN_LOGIN_URL);
    await page.fill('input[id="username"]', ADMIN_USERNAME);
    await page.fill('input[id="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(ADMIN_DASHBOARD_URL);

    // 서명이 있는 참가자 찾기 (조해창이 서명했다고 가정)
    const detailButtons = page.locator('button:has-text("상세보기")');
    const firstButton = detailButtons.first();
    await firstButton.click();

    // 모달 확인
    await expect(page.locator('text=참가자 상세 정보')).toBeVisible();
    await expect(page.locator('text=서명')).toBeVisible();

    // 서명 이미지가 있으면 img 태그 확인
    const signatureImg = page.locator('img[alt="서명"]');
    if (await signatureImg.isVisible()) {
      expect(await signatureImg.getAttribute('src')).toContain('data:image');
    }
  });

  test('로그아웃 기능', async ({ page }) => {
    // 로그인
    await page.goto(ADMIN_LOGIN_URL);
    await page.fill('input[id="username"]', ADMIN_USERNAME);
    await page.fill('input[id="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(ADMIN_DASHBOARD_URL);

    // 로그아웃 버튼 클릭
    await page.click('button:has-text("로그아웃")');

    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL(ADMIN_LOGIN_URL);

    // 토큰 삭제 확인
    const token = await page.evaluate(() => localStorage.getItem('admin_token'));
    expect(token).toBeNull();
  });

  test('검색 기능 테스트', async ({ page }) => {
    // 로그인
    await page.goto(ADMIN_LOGIN_URL);
    await page.fill('input[id="username"]', ADMIN_USERNAME);
    await page.fill('input[id="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(ADMIN_DASHBOARD_URL);

    // 검색 입력
    await page.fill('input[placeholder*="검색"]', '조해창');

    // 검색 결과 확인 (클라이언트 사이드 필터링)
    await expect(page.locator('text=조해창')).toBeVisible();
  });
});
```

#### 5.3 테스트 실행
```bash
cd moducon-frontend
npx playwright test e2e/admin.spec.ts --headed
```

---

## 📊 구현 체크리스트

### 데이터베이스
- [ ] Admin 모델 추가 (schema.prisma)
- [ ] 마이그레이션 실행
- [ ] 관리자 계정 시드 스크립트 작성
- [ ] 시드 실행 확인 (modulabs 계정 생성)

### 백엔드
- [ ] bcryptjs 패키지 설치
- [ ] adminLogin 컨트롤러 구현
- [ ] admin.ts 라우터 수정 (login 라우트 추가)
- [ ] 로그인 API 테스트 (Postman/curl)

### 프론트엔드
- [ ] /admin/login 페이지 생성
- [ ] 로그인 폼 구현
- [ ] 로그인 API 호출 및 토큰 저장
- [ ] /admin 페이지 인증 체크 추가
- [ ] 토큰을 헤더에 포함하여 API 호출
- [ ] 로그아웃 버튼 및 기능 구현
- [ ] UI 개선 (공공문서 스타일)

### 테스트
- [ ] Playwright 테스트 파일 작성
- [ ] 모든 테스트 시나리오 통과 확인

---

## 🎯 예상 소요 시간

| 단계 | 예상 시간 | 비고 |
|------|----------|------|
| Step 1: 데이터베이스 준비 | 15분 | 마이그레이션 + 시드 |
| Step 2: 백엔드 API | 30분 | 로그인 컨트롤러 + 라우터 |
| Step 3: 프론트엔드 로그인 | 45분 | 로그인 페이지 + 인증 체크 |
| Step 4: UI 개선 | 30분 | 공공문서 스타일 적용 |
| Step 5: Playwright 테스트 | 45분 | E2E 테스트 작성 및 실행 |
| **총합** | **2시간 45분** | |

---

## 🔒 보안 고려사항

### 1. 비밀번호 저장
- ✅ bcrypt 해시 사용 (salt rounds: 10)
- ✅ 평문 비밀번호 저장 금지

### 2. JWT 토큰
- ✅ 만료 시간 설정 (7일)
- ✅ ADMIN_SECRET 환경변수 사용
- ⚠️ 프로덕션에서는 HTTPS 필수

### 3. 프론트엔드
- ✅ localStorage에 토큰 저장
- ⚠️ XSS 공격 대비: 입력값 sanitization
- ⚠️ CSRF 공격 대비: 향후 CSRF 토큰 추가 검토

---

## 📝 환경변수

### 백엔드 (.env)
```bash
ADMIN_SECRET=your-admin-secret-key-at-least-32-characters-long
DATABASE_URL=postgresql://user:password@localhost:5432/moducon_dev
```

### 프론트엔드 (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🚀 배포 시 주의사항

1. **ADMIN_SECRET 변경 필수**
   - 현재 fallback 값 사용 중
   - 프로덕션에서는 강력한 랜덤 문자열 사용
   ```bash
   openssl rand -hex 32
   ```

2. **HTTPS 사용**
   - JWT 토큰 탈취 방지
   - 프론트엔드-백엔드 간 모든 통신 HTTPS

3. **Rate Limiting**
   - 로그인 API에 rate limit 적용 (향후 개선)
   - 예: 5분에 5회 시도 제한

---

**다음 담당자**: hands-on worker
