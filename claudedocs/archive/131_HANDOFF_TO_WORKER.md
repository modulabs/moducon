# 131_HANDOFF_TO_WORKER.md - hands-on worker 작업 지시서

**작성일**: 2025-11-30
**작성자**: Technical Lead
**수신자**: hands-on worker
**우선순위**: P0 (Critical)
**예상 작업 시간**: 3시간 30분

---

## 📋 작업 개요

### 🎯 목표
모바일에서 세션 데이터를 로딩할 수 없는 문제를 **정적 JSON 파일**로 해결하여, GitHub Pages 배포 환경에서 완벽하게 동작하도록 개선

### 📊 현재 상황
- ✅ **로컬 환경**: 백엔드 API 정상 동작 (36개 세션)
- ❌ **모바일 환경**: 프로덕션 백엔드 미배포로 데이터 로딩 실패
- ⚠️ **에러 메시지**: "세션 정보를 불러올 수 없습니다"

### 💡 해결 방법
백엔드 API 대신 **정적 JSON 파일**을 사용하여:
1. 백엔드 의존성 제거
2. GitHub Pages 완전 호환
3. 오프라인 지원 100%
4. 성능 최적화 (CDN 캐싱)

---

## 📝 작업 상세 지침

### Phase 1: 정적 데이터 생성 (1시간)

#### Step 1.1: 디렉토리 생성
```bash
cd moducon-frontend
mkdir -p public/data
```

#### Step 1.2: 세션 데이터 JSON 생성

**파일**: `moducon-frontend/public/data/sessions.json`

**데이터 소스**: `moducon-backend/src/data/sessions.ts`

**작업**:
1. 백엔드 `sessions.ts` 파일 열기
2. 36개 세션 데이터를 JSON 배열로 변환
3. 필수 필드 확인:
   - `id`: 고유 ID (string)
   - `name`: 세션명 (string)
   - `speaker`: 발표자 (string)
   - `track`: 트랙명 (string)
   - `startTime`: 시작 시간 (string, "HH:MM" 형식)
   - `endTime`: 종료 시간 (string, "HH:MM" 형식)
   - `location`: 장소 (string)
   - `level`: 난이도 (string, "beginner" | "intermediate" | "advanced")
   - `description`: 설명 (string, optional)

**예시**:
```json
[
  {
    "id": "session-001",
    "name": "AI 기반 코드 생성의 미래",
    "speaker": "홍길동",
    "track": "AI/ML",
    "startTime": "10:00",
    "endTime": "11:00",
    "location": "세미나실 A",
    "level": "intermediate",
    "description": "AI 코드 생성 도구의 발전과 미래 전망"
  },
  ...
]
```

#### Step 1.3: 부스 데이터 JSON 복사

**파일**: `moducon-frontend/public/data/booths.json`

**데이터 소스**: `moducon-backend/src/data/booths.json`

**작업**:
```bash
cp moducon-backend/src/data/booths.json moducon-frontend/public/data/booths.json
```

**검증**: 13개 부스 데이터 포함 확인

#### Step 1.4: 포스터 데이터 JSON 복사

**파일**: `moducon-frontend/public/data/papers.json`

**데이터 소스**: `moducon-backend/src/data/papers.json`

**작업**:
```bash
cp moducon-backend/src/data/papers.json moducon-frontend/public/data/papers.json
```

**검증**: 33개 포스터 데이터 포함 확인

#### Step 1.5: JSON 형식 검증

```bash
# JSON 형식 검증 (jq 사용)
jq empty public/data/sessions.json
jq empty public/data/booths.json
jq empty public/data/papers.json

# 데이터 개수 확인
echo "세션: $(jq 'length' public/data/sessions.json)개 (예상: 36개)"
echo "부스: $(jq 'length' public/data/booths.json)개 (예상: 13개)"
echo "포스터: $(jq 'length' public/data/papers.json)개 (예상: 33개)"
```

**예상 결과**:
```
세션: 36개 (예상: 36개)
부스: 13개 (예상: 13개)
포스터: 33개 (예상: 33개)
```

---

### Phase 2: API 클라이언트 수정 (1시간 30분)

#### Step 2.1: sessionCache.ts 수정

**파일**: `moducon-frontend/src/lib/sessionCache.ts`

**수정 내용**:

```typescript
// Before (Line 44-56)
// API 호출
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const url = track
  ? `${API_URL}/api/sessions?track=${encodeURIComponent(track)}`
  : `${API_URL}/api/sessions`;

const response = await fetch(url);
if (!response.ok) {
  throw new Error(`API 호출 실패: ${response.status}`);
}

const result = await response.json();
const sessions = result.data || [];

// After (정적 JSON 파일 사용)
// 정적 JSON 파일 로딩
const response = await fetch('/data/sessions.json');
if (!response.ok) {
  throw new Error(`데이터 로딩 실패: ${response.status}`);
}

const sessions = await response.json();

// 트랙 필터링 (클라이언트 사이드)
const filteredSessions = track
  ? sessions.filter((s: Session) => s.track === track)
  : sessions;
```

**주의 사항**:
- ✅ localStorage 캐싱 로직 유지
- ✅ 오프라인 폴백 로직 유지
- ✅ 에러 핸들링 유지
- ⚠️ `result.data` → `sessions` (직접 배열 반환)

#### Step 2.2: boothCache.ts 생성

**파일**: `moducon-frontend/src/lib/boothCache.ts`

**전체 코드**:

```typescript
import type { Booth } from '@/types/booth';

const CACHE_KEY = 'moducon_booths';
const CACHE_TIMESTAMP_KEY = 'moducon_booths_timestamp';
const CACHE_VERSION_KEY = 'moducon_booths_version';
const CACHE_DURATION = 5 * 60 * 1000; // 5분
const CACHE_VERSION = '1.0';

/**
 * localStorage를 사용한 부스 데이터 캐싱
 */
export async function fetchBoothsWithCache(): Promise<Booth[]> {
  try {
    // localStorage 사용
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const version = localStorage.getItem(CACHE_VERSION_KEY);

    // 버전 체크
    if (version !== CACHE_VERSION) {
      console.log('캐시 버전 불일치, 무효화');
      invalidateBoothsCache();
    }

    // 캐시 유효성 체크
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CACHE_DURATION) {
        console.log(`부스 캐시 히트 (${Math.floor(age / 1000)}초 전)`);
        return JSON.parse(cached);
      } else {
        console.log('부스 캐시 만료');
      }
    }

    // 정적 JSON 파일 로딩
    const response = await fetch('/data/booths.json');
    if (!response.ok) {
      throw new Error(`부스 데이터 로딩 실패: ${response.status}`);
    }

    const booths = await response.json();

    // localStorage에 캐시 저장
    localStorage.setItem(CACHE_KEY, JSON.stringify(booths));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    console.log(`부스 캐시 저장 (${booths.length}개)`);

    return booths;
  } catch (error) {
    console.error('부스 로딩 실패:', error);

    // 오프라인 시 캐시 데이터 반환
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      console.warn('오프라인 모드: 부스 캐시 데이터 사용');
      return JSON.parse(cached);
    }

    throw error;
  }
}

/**
 * 캐시 무효화
 */
export function invalidateBoothsCache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  localStorage.removeItem(CACHE_VERSION_KEY);
  console.log('부스 캐시 무효화 완료');
}
```

#### Step 2.3: paperCache.ts 생성

**파일**: `moducon-frontend/src/lib/paperCache.ts`

**전체 코드**:

```typescript
import type { Paper } from '@/types/paper';

const CACHE_KEY = 'moducon_papers';
const CACHE_TIMESTAMP_KEY = 'moducon_papers_timestamp';
const CACHE_VERSION_KEY = 'moducon_papers_version';
const CACHE_DURATION = 5 * 60 * 1000; // 5분
const CACHE_VERSION = '1.0';

/**
 * localStorage를 사용한 포스터 데이터 캐싱
 */
export async function fetchPapersWithCache(): Promise<Paper[]> {
  try {
    // localStorage 사용
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const version = localStorage.getItem(CACHE_VERSION_KEY);

    // 버전 체크
    if (version !== CACHE_VERSION) {
      console.log('캐시 버전 불일치, 무효화');
      invalidatePapersCache();
    }

    // 캐시 유효성 체크
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CACHE_DURATION) {
        console.log(`포스터 캐시 히트 (${Math.floor(age / 1000)}초 전)`);
        return JSON.parse(cached);
      } else {
        console.log('포스터 캐시 만료');
      }
    }

    // 정적 JSON 파일 로딩
    const response = await fetch('/data/papers.json');
    if (!response.ok) {
      throw new Error(`포스터 데이터 로딩 실패: ${response.status}`);
    }

    const papers = await response.json();

    // localStorage에 캐시 저장
    localStorage.setItem(CACHE_KEY, JSON.stringify(papers));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    console.log(`포스터 캐시 저장 (${papers.length}개)`);

    return papers;
  } catch (error) {
    console.error('포스터 로딩 실패:', error);

    // 오프라인 시 캐시 데이터 반환
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      console.warn('오프라인 모드: 포스터 캐시 데이터 사용');
      return JSON.parse(cached);
    }

    throw error;
  }
}

/**
 * 캐시 무효화
 */
export function invalidatePapersCache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  localStorage.removeItem(CACHE_VERSION_KEY);
  console.log('포스터 캐시 무효화 완료');
}
```

#### Step 2.4: 타입 정의 확인

**파일 확인**:
- `src/types/session.ts` (Session 타입)
- `src/types/booth.ts` (Booth 타입)
- `src/types/paper.ts` (Paper 타입)

**작업**: 기존 타입 정의가 JSON 데이터와 일치하는지 확인

---

### Phase 3: 빌드 및 테스트 (30분)

#### Step 3.1: 로컬 빌드

```bash
cd moducon-frontend
npm run build
```

**예상 결과**:
```
✓ Compiled successfully
✓ Generating static pages (60/60)
✓ Finalizing page optimization

Route (app)                Size
┌ ○ /                      142 B          85.7 kB
├ ○ /sessions              8.45 kB        85.7 kB
├ ○ /booths                7.23 kB        85.7 kB
├ ○ /papers                6.89 kB        85.7 kB
└ ● /sessions/[id]         (Dynamic)      (Dynamic)

○  (Static)  prerendered as static content
●  (Dynamic)  server-rendered on demand

Build time: ~10초
```

#### Step 3.2: Static Export 검증

```bash
# out/ 디렉토리 확인
ls -lh out/data/

# 예상 출력:
# sessions.json  (약 20-30KB)
# booths.json    (약 5-10KB)
# papers.json    (약 10-15KB)
```

#### Step 3.3: 로컬 서버 테스트

```bash
npx serve out
```

**테스트**:
1. http://localhost:3000 접속
2. `/sessions` 페이지 접속 → 36개 세션 표시 확인
3. `/booths` 페이지 접속 → 13개 부스 표시 확인
4. `/papers` 페이지 접속 → 33개 포스터 표시 확인
5. 브라우저 콘솔 확인:
   ```
   캐시 저장 (36개 세션)
   캐시 저장 (13개 부스)
   캐시 저장 (33개 포스터)
   ```

#### Step 3.4: 모바일 에뮬레이션 테스트

**Chrome DevTools**:
1. F12 → Device Toolbar 활성화
2. iPhone 13 Pro 선택
3. Network 탭 열기
4. 페이지 새로고침
5. 확인 사항:
   - `sessions.json` 로딩 성공 (200 OK)
   - `booths.json` 로딩 성공 (200 OK)
   - `papers.json` 로딩 성공 (200 OK)
   - API 호출 없음 (localhost:3001 요청 없음)

#### Step 3.5: 오프라인 모드 테스트

**Chrome DevTools**:
1. Network 탭 → Offline 체크
2. 페이지 새로고침
3. 확인 사항:
   - localStorage 캐시 사용
   - 콘솔 메시지: "오프라인 모드: 캐시 데이터 사용"
   - 세션/부스/포스터 정상 표시

---

### Phase 4: 배포 및 검증 (30분)

#### Step 4.1: Git Commit

```bash
# 변경 사항 확인
git status

# 예상 출력:
# modified:   src/lib/sessionCache.ts
# new file:   src/lib/boothCache.ts
# new file:   src/lib/paperCache.ts
# new file:   public/data/sessions.json
# new file:   public/data/booths.json
# new file:   public/data/papers.json

# 모든 변경 사항 스테이징
git add .

# 커밋
git commit -m "feat: 정적 세션 데이터 적용 (모바일 데이터 로딩 문제 해결)

- Google Sheets 데이터를 정적 JSON으로 변환
- sessionCache.ts: API 호출 → JSON 파일 fetch
- boothCache.ts, paperCache.ts 생성
- 백엔드 의존성 제거, GitHub Pages 완전 호환
- 오프라인 지원 100%, 성능 최적화

Resolves: 모바일 뷰 데이터 로딩 실패 이슈

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### Step 4.2: Git Push

```bash
git push origin feature/sessions-data
```

#### Step 4.3: GitHub Actions 확인

**URL**: https://github.com/YOUR_USERNAME/moducon/actions

**확인 사항**:
- ✅ Workflow 실행 시작
- ✅ Build 성공 (약 1-2분)
- ✅ Deploy 성공 (약 1-2분)
- ✅ 총 소요 시간: 3-5분

#### Step 4.4: 프로덕션 검증

**데스크톱 테스트**:
1. https://moducon.vibemakers.kr/sessions 접속
2. 36개 세션 정상 표시 확인
3. 트랙 필터 동작 확인
4. 세션 상세 페이지 접속 확인

**모바일 테스트**:
1. 실제 모바일 기기로 접속
2. https://moducon.vibemakers.kr/sessions 접속
3. 36개 세션 정상 표시 확인
4. "세션 정보를 불러올 수 없습니다" 에러 **없음** 확인
5. 부스/포스터 페이지도 동일 확인

#### Step 4.5: 성능 검증

**Lighthouse 테스트** (Chrome DevTools):
1. Lighthouse 탭 열기
2. Mobile, Navigation 선택
3. Analyze page load 클릭
4. 목표:
   - Performance: 90+ (Green)
   - Accessibility: 90+ (Green)
   - Best Practices: 90+ (Green)
   - SEO: 80+ (Green)

---

## ✅ 완료 체크리스트

### Phase 1: 정적 데이터 생성
- [ ] `public/data/` 디렉토리 생성
- [ ] `sessions.json` 생성 (36개)
- [ ] `booths.json` 복사 (13개)
- [ ] `papers.json` 복사 (33개)
- [ ] JSON 형식 검증 완료

### Phase 2: API 클라이언트 수정
- [ ] `sessionCache.ts` 수정 완료
- [ ] `boothCache.ts` 생성 완료
- [ ] `paperCache.ts` 생성 완료
- [ ] 타입 정의 확인 완료

### Phase 3: 빌드 및 테스트
- [ ] 로컬 빌드 성공
- [ ] Static Export 확인
- [ ] 로컬 서버 테스트 통과
- [ ] 모바일 에뮬레이션 테스트 통과
- [ ] 오프라인 모드 테스트 통과

### Phase 4: 배포 및 검증
- [ ] Git Commit 완료
- [ ] Git Push 완료
- [ ] GitHub Actions 성공
- [ ] 프로덕션 데스크톱 테스트 통과
- [ ] 프로덕션 모바일 테스트 통과
- [ ] Lighthouse 성능 검증 통과

---

## 🚨 주의 사항

### 1. JSON 데이터 정확성
- ⚠️ 모든 필수 필드 포함 확인
- ⚠️ 36개 세션 전체 포함 확인
- ⚠️ JSON 문법 오류 없음 확인

### 2. 캐싱 로직 유지
- ✅ localStorage 캐싱 유지
- ✅ 5분 캐싱 기간 유지
- ✅ 오프라인 폴백 유지

### 3. 에러 핸들링
- ✅ JSON 로딩 실패 시 에러 메시지 표시
- ✅ 재시도 버튼 제공
- ✅ 콘솔 로그 유지 (디버깅용)

### 4. Git 커밋
- ✅ 커밋 메시지 형식 준수
- ✅ Co-Authored-By 포함
- ✅ 관련 파일만 포함 (불필요한 파일 제외)

---

## 📊 예상 결과

### 성능 지표
- **빌드 시간**: ~10초 (목표: <15초)
- **배포 시간**: ~5분 (GitHub Actions)
- **초기 로딩**: 1-2초 (목표: <3초)
- **오프라인 지원**: 100%

### 성공 지표
- ✅ 모바일에서 세션 36개 정상 표시
- ✅ 부스 13개 정상 표시
- ✅ 포스터 33개 정상 표시
- ✅ "자료가 없다고 뜹니다" 에러 해결
- ✅ Lighthouse Performance 90+

---

## 📝 작업 완료 보고

**작업 완료 후 작성**:
1. `132_WORKER_COMPLETION_REPORT.md` 작성
2. 완료 체크리스트 모두 체크 확인
3. 스크린샷 첨부:
   - 프로덕션 세션 목록 (모바일)
   - Lighthouse 성능 점수
   - GitHub Actions 성공
4. Technical Lead에게 검증 요청

---

## 🔗 참고 문서

- **기술 계획**: [130_TECH_LEAD_MOBILE_DATA_FIX.md](./130_TECH_LEAD_MOBILE_DATA_FIX.md)
- **PRD**: [01_PRD.md](../01_PRD.md)
- **진행 현황**: [07_PROGRESS.md](../07_PROGRESS.md)

---

**작성 완료일**: 2025-11-30
**예상 작업 시간**: 3시간 30분
**우선순위**: P0 (Critical)
**다음 담당자**: hands-on worker (즉시 착수)

---

**다음 단계**: 작업 완료 후 `132_WORKER_COMPLETION_REPORT.md` 작성
