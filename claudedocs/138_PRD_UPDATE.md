# 138_PRD_UPDATE.md - PRD 업데이트 (v1.8)

**작성일**: 2025-12-01
**작성자**: Technical Lead
**버전**: v1.8
**이전 버전**: v1.7 (2025-11-29)

---

## 📋 업데이트 요약

### 주요 변경사항
1. ✅ **현재 구현 상태 반영**
   - 세션 데이터 정적 JSON 전환 완료
   - 모바일 데이터 로딩 문제 해결 완료
   - 최종 QA 검증 통과 (98.0/100, A+)

2. 🆕 **신규 요구사항 추가**
   - 하단 고정 네비게이션 구현
   - 중앙 QR 버튼 특별 UI 디자인
   - 지도 페이지 추가 (빈 페이지)

3. 📊 **현재 중점사항 정리**
   - Database 스키마 및 상태
   - API 엔드포인트 현황
   - 페이지 구조 및 특이사항

---

## 🎯 프로젝트 현재 상태

### 전체 진행률: **85%**

| 영역 | 진행률 | 상태 | 비고 |
|------|--------|------|------|
| **문서화** | 100% | ✅ | 138개 문서 완성 |
| **Frontend (Core)** | 100% | ✅ | 로그인, 세션, QR 완료 |
| **Frontend (부가)** | 60% | 🚧 | 부스/포스터 UI 필요 |
| **Backend (로컬)** | 100% | ✅ | 인증 API 4개 완료 |
| **Backend (프로덕션)** | 0% | ❌ | 배포 안 됨 (정적 JSON 사용 중) |
| **PWA** | 80% | 🚧 | 오프라인 지원 완료, 최적화 필요 |
| **신규 기능** | 0% | 📅 | 하단 네비게이션 예정 |

### 성과 지표 (현재)
- ✅ **빌드 성공률**: 100% (56개 정적 페이지)
- ✅ **TypeScript 타입 안정성**: 100%
- ✅ **오프라인 지원**: 100% (localStorage 캐싱)
- ✅ **코드 품질**: 98.0/100 (A+)
- ⏳ **사용자 테스트**: 미완 (배포 후 예정)

---

## 📊 현재 시스템 아키텍처

### 기술 스택 (확정)

#### Frontend
```yaml
Framework: Next.js 16 (Static Export)
UI Library: shadcn/ui + Tailwind CSS
State: Zustand (인증, 세션)
Data Source: 정적 JSON (/public/data/*.json)
Caching: localStorage (5분 만료)
QR Scanner: html5-qrcode
Icons: lucide-react
```

#### Backend (로컬 개발, 프로덕션 미사용)
```yaml
Runtime: Node.js + TypeScript
Framework: Express.js
Database: PostgreSQL 16.10 (moducon_dev)
ORM: Prisma
Auth: JWT
Status: 로컬 완료, 프로덕션 미배포
```

#### Deployment
```yaml
Frontend: GitHub Pages
Domain: moducon.vibemakers.kr
CI/CD: GitHub Actions
Status: 자동 배포 활성화
```

### 데이터 소스 현황

| 데이터 | 개수 | 소스 | 상태 |
|--------|------|------|------|
| **세션** | 32개 | `/public/data/sessions.json` (23KB) | ✅ 완료 |
| **부스** | 0개 | `/public/data/booths.json` (빈 배열) | ⏳ 데이터 준비 중 |
| **포스터** | 0개 | `/public/data/papers.json` (빈 배열) | ⏳ 데이터 준비 중 |

### Database 스키마 (PostgreSQL - 로컬만)

```sql
-- 1. users 테이블
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone_last4 VARCHAR(4) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 테스트 데이터
INSERT INTO users (name, phone_last4)
VALUES ('조해창', '4511');

-- 2. auth_sessions 테이블
CREATE TABLE auth_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_auth_sessions_token ON auth_sessions(token);
CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);

-- 3. signatures 테이블
CREATE TABLE signatures (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  signature_data TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**DB 상태**:
- ✅ 로컬 개발용 DB 정상 동작
- ✅ 테스트 사용자 1명 (조해창, 4511)
- ❌ 프로덕션 DB 미배포 (정적 JSON 사용으로 불필요)

### API 엔드포인트 현황

**Backend API (로컬 개발, 현재 미사용)**:

| Method | Endpoint | 기능 | 상태 | 비고 |
|--------|----------|------|------|------|
| POST | `/api/auth/login` | 로그인 (이름 + 전화번호 뒷 4자리) | ✅ 완료 | 로컬만 |
| POST | `/api/auth/signature` | 디지털 서명 저장 | ✅ 완료 | 로컬만 |
| GET | `/api/auth/me` | 사용자 정보 조회 | ✅ 완료 | 로컬만 |
| POST | `/api/auth/reset-login` | 로그인 리셋 (테스트용) | ✅ 완료 | 로컬만 |

**Frontend Data Fetching (현재 사용 중)**:

| Data | Source | Caching | 상태 |
|------|--------|---------|------|
| 세션 | `/data/sessions.json` | localStorage (5분) | ✅ |
| 부스 | `/data/booths.json` | localStorage (5분) | ⏳ |
| 포스터 | `/data/papers.json` | localStorage (5분) | ⏳ |

---

## 📱 페이지 구조 및 특이사항

### 현재 페이지 구조

```
moducon-frontend/src/app/
├── page.tsx                    # ✅ 랜딩 페이지
├── layout.tsx                  # ✅ 루트 레이아웃 (Header)
├── login/page.tsx              # ✅ 로그인 (이름 + 전화번호)
├── onboarding/page.tsx         # ✅ 온보딩 (관심사 선택)
├── home/page.tsx               # ✅ 대시보드 (세션 목록 미리보기)
├── sessions/
│   ├── page.tsx                # ✅ 세션 목록 (32개, JSON)
│   └── [id]/page.tsx           # ⏳ 세션 상세 (향후)
├── booths/
│   ├── page.tsx                # ⏳ 부스 목록 (예정)
│   └── [id]/page.tsx           # ⏳ 부스 상세 (예정)
├── papers/
│   ├── page.tsx                # ⏳ 포스터 목록 (예정)
│   └── [id]/page.tsx           # ⏳ 포스터 상세 (예정)
├── map/                        # 🆕 신규 추가 예정
│   └── page.tsx                # 🆕 지도 페이지 (빈 페이지)
├── profile/page.tsx            # ⏳ 프로필 (향후)
└── activity/page.tsx           # ⏳ 활동 기록 (향후)
```

### 특이사항 정리

#### 1. 세션 페이지 (`/sessions/page.tsx`)
**구현 상태**: ✅ 완료
- **데이터**: `/public/data/sessions.json` (32개)
- **필터**: 트랙별 (모두보기, MLOps, 멀티모달, 에이전트, 자율주행, 검색&추천, 오토ML)
- **캐싱**: localStorage (5분)
- **오프라인**: 100% 지원

**특이사항**:
```typescript
// sessionCache.ts:45-56
const API_URL = '/data/sessions.json'; // 정적 JSON 사용
const response = await fetch(API_URL);
const sessions = await response.json();

// localStorage 캐싱 (5분)
localStorage.setItem(CACHE_KEY, JSON.stringify(sessions));
localStorage.setItem(CACHE_TIME_KEY, now.toString());
```

#### 2. QR 스캔 시스템 (`/components/qr/QRFloatingButton.tsx`)
**구현 상태**: ✅ 완료
- **위치**: 화면 정가운데 (Floating)
- **기능**: 세션/부스/포스터 QR 자동 라우팅
- **라이브러리**: html5-qrcode
- **UI**: 원형 버튼 + Pulse 애니메이션

**문제점 및 개선 필요**:
- ⚠️ 현재 Floating 버튼 → 하단 네비게이션 중앙 버튼으로 변경 필요
- ⚠️ 툴팁 개선 필요 ("세션·부스·포스터 체크인" 상세 설명)

**QR 라우팅 로직**:
```typescript
// qrParser.ts
export function parseQRCode(qrData: string): QRAction {
  if (qrData.includes('session')) {
    return {
      type: 'session',
      id: extractId(qrData),
      route: `/sessions?id=${extractId(qrData)}`
    };
  }
  // ... 부스, 포스터 동일
}
```

#### 3. localStorage 캐싱 (`/lib/sessionCache.ts`)
**구현 상태**: ✅ 완료
- **만료 시간**: 5분 (300초)
- **버전 관리**: `CACHE_VERSION = '1.0'`
- **캐시 키**:
  - `moducon_sessions_v1.0` (세션 데이터)
  - `moducon_sessions_v1.0_time` (캐시 시간)
- **폴백**: 오프라인 시 캐시 데이터 사용

**캐싱 전략**:
```typescript
const CACHE_DURATION = 5 * 60 * 1000; // 5분
const now = Date.now();
const cacheTime = localStorage.getItem(CACHE_TIME_KEY);

if (cacheTime && (now - parseInt(cacheTime, 10) < CACHE_DURATION)) {
  // 캐시 사용
  return JSON.parse(localStorage.getItem(CACHE_KEY)!);
}

// 새로 fetch
const response = await fetch('/data/sessions.json');
```

#### 4. TypeScript 타입 정의 (`/types/index.ts`)
**구현 상태**: ✅ 완료

**주요 타입**:
```typescript
export interface Session {
  id: string;
  name: string;
  speaker: string;
  speakerOrg?: string;
  track: string;
  startTime: string;
  endTime: string;
  location: string;
  description?: string;
  level?: string;
  tags?: string[];
}

export interface Booth {
  id: string;
  name: string;
  organization: string;
  description: string;
  location: string;
  category: string;
  tags?: string[];
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  organization: string;
  category: string;
  abstract: string;
  keywords?: string[];
}
```

---

## 🆕 신규 요구사항 (v1.8)

### Requirement #1: 하단 고정 네비게이션

#### 기능 명세
- **위치**: 화면 최하단 고정 (Fixed Bottom)
- **높이**: 64px (모바일 친화적)
- **배경**: 반투명 백드롭 (backdrop-blur)
- **탭 구성** (5개):
  1. 세션 (Sessions) - `/sessions`
  2. 부스 (Booths) - `/booths`
  3. **QR 버튼** (중앙, 특별 UI) - QR 스캔 모달
  4. 포스터 (Papers) - `/papers`
  5. 지도 (Map) - `/map`

#### UI 디자인 요구사항

**레이아웃**:
```
┌──────────────────────────────────────────┐
│                                          │
│           Main Content                   │
│                                          │
│                                          │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│ [세션]  [부스]   [🎯 QR]   [포스터] [지도] │
└──────────────────────────────────────────┘
    ↑       ↑         ↑         ↑       ↑
  일반    일반    특별 UI      일반    일반
```

**일반 탭 디자인**:
- **크기**: 48x48px
- **아이콘**: lucide-react (Calendar, Store, FileText, Map)
- **레이블**: 아이콘 하단 (10px, gray-500)
- **Active 상태**: Primary 색상 + 굵은 폰트
- **Inactive 상태**: Gray 색상 + 일반 폰트

**중앙 QR 버튼 특별 UI**:
- **크기**: 64x64px (1.33배 큰)
- **위치**: 약간 위로 올라온 (-8px)
- **모양**: 원형 (rounded-full)
- **배경**: Primary 그라디언트 (bg-gradient-to-r from-primary to-primary-dark)
- **테두리**: 4px white (shadow 효과)
- **아이콘**: QR Code (24x24px, white)
- **애니메이션**: Pulse (맥박) 효과
- **레이블**: "스캔" (12px, white, 중앙)

**구현 참고**:
```typescript
<div className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-lg border-t border-gray-200">
  <div className="flex items-center justify-around h-full max-w-screen-lg mx-auto">
    {/* 세션 탭 */}
    <button className={isActive ? 'text-primary' : 'text-gray-500'}>
      <Calendar className="w-6 h-6" />
      <span className="text-xs mt-1">세션</span>
    </button>

    {/* 부스 탭 */}
    <button className={isActive ? 'text-primary' : 'text-gray-500'}>
      <Store className="w-6 h-6" />
      <span className="text-xs mt-1">부스</span>
    </button>

    {/* 중앙 QR 버튼 (특별 UI) */}
    <button className="relative -top-2 w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary-dark shadow-lg ring-4 ring-white animate-pulse">
      <QrCode className="w-6 h-6 text-white mx-auto" />
      <span className="text-xs text-white">스캔</span>
    </button>

    {/* 포스터 탭 */}
    <button className={isActive ? 'text-primary' : 'text-gray-500'}>
      <FileText className="w-6 h-6" />
      <span className="text-xs mt-1">포스터</span>
    </button>

    {/* 지도 탭 */}
    <button className={isActive ? 'text-primary' : 'text-gray-500'}>
      <Map className="w-6 h-6" />
      <span className="text-xs mt-1">지도</span>
    </button>
  </div>
</div>
```

#### 기술 구현 방안

**Option 1: Layout 적용** ⭐ **권장**
- `/app/layout.tsx`에 `<BottomNavigation />` 추가
- 모든 페이지에 자동 적용
- 상태 관리 용이 (Zustand 사용)

**Option 2: 개별 페이지 적용**
- 각 페이지마다 `<BottomNavigation />` 추가
- 코드 중복 발생 (비권장)

**구현 위치**:
```
moducon-frontend/src/components/layout/
├── BottomNavigation.tsx        # 🆕 신규 생성
└── Header.tsx                   # ✅ 기존
```

### Requirement #2: 지도 페이지 추가

#### 기능 명세
- **라우트**: `/map`
- **상태**: 빈 페이지 (현재)
- **향후 계획**: SVG 지도 또는 이미지 맵

**빈 페이지 UI**:
```typescript
// /app/map/page.tsx
export default function MapPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Map className="w-24 h-24 text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold text-gray-700 mb-2">
        지도 페이지
      </h2>
      <p className="text-gray-500">
        추후 추가 예정입니다.
      </p>
    </div>
  );
}
```

---

## 📊 구현 우선순위 (신규 기능)

### P0 (Critical): 즉시 착수
1. **BottomNavigation 컴포넌트 생성** (예상 1시간)
   - 5개 탭 UI 구현
   - 중앙 QR 버튼 특별 디자인
   - Active 상태 관리 (Zustand 또는 usePathname)
   - 반응형 디자인 (모바일 최적화)

2. **layout.tsx 적용** (예상 30분)
   - `<BottomNavigation />` 추가
   - z-index 조정 (Header와 충돌 방지)
   - padding-bottom 추가 (컨텐츠와 겹침 방지)

3. **지도 페이지 생성** (예상 15분)
   - `/app/map/page.tsx` 생성
   - 빈 페이지 UI 구현

### P1 (High): 1-2일 내
4. **QR 스캔 모달 연동** (예상 30분)
   - 기존 `QRFloatingButton` → 모달만 재사용
   - 중앙 QR 버튼 클릭 → 모달 열기

5. **부스/포스터 페이지 데이터 연동** (예상 2시간)
   - `/public/data/booths.json` 데이터 추가
   - `/public/data/papers.json` 데이터 추가
   - boothCache.ts, paperCache.ts 활용

---

## 🎯 업데이트된 성공 지표

### 기술 지표
- ✅ **빌드 성공률**: 100%
- ✅ **TypeScript 타입 안정성**: 100%
- ✅ **오프라인 지원**: 100%
- ✅ **코드 품질**: 98.0/100 (A+)
- 🆕 **하단 네비게이션**: 구현 예정
- 🆕 **지도 페이지**: 빈 페이지 구현 예정

### 사용자 경험 지표 (배포 후)
- ⏳ **앱 사용률**: 80% 이상 목표
- ⏳ **네비게이션 사용률**: 90% 이상 목표
- ⏳ **QR 스캔 성공률**: 95% 이상 목표
- ⏳ **사용자 만족도**: 4.5/5.0 이상 목표

---

## 📝 다음 단계

### Immediate (2시간 내)
1. ✅ 138_PRD_UPDATE.md 작성 완료
2. [ ] 139_DEV_PLAN_UPDATE.md 작성
3. [ ] 07_PROGRESS.md 업데이트
4. [ ] Git Commit & Push

### Short-term (1-2일 내)
5. [ ] BottomNavigation 컴포넌트 구현
6. [ ] layout.tsx 적용 및 테스트
7. [ ] 지도 페이지 생성
8. [ ] 빌드 테스트 및 배포

---

**작성 완료일**: 2025-12-01
**버전**: v1.8
**다음 문서**: 139_DEV_PLAN_UPDATE.md
**담당자**: Technical Lead
