# 126_HANDOFF_TO_WORKER - Hands-on Worker 작업 지시서

**작성일**: 2025-11-30
**작성자**: Technical Lead
**문서 버전**: 1.0
**담당자**: hands-on worker
**브랜치**: `feature/sessions-data`
**예상 작업 시간**: 2시간 30분

---

## 📋 작업 개요

### 핵심 목표
**홈페이지(`/home/`)에서 더미 데이터(김철수, 이영희) 제거하고 실제 세션 데이터 표시**

### 현재 상황
- ✅ QR UI 개선 완료
- ✅ 백엔드 API `/api/sessions` 동작 중 (36개 세션)
- ❌ **홈페이지에 더미 데이터 하드코딩** ← 이 부분만 수정하면 끝!

### 작업 파일
```
moducon-frontend/src/app/home/page.tsx  ← 메인 작업 파일
moducon-frontend/src/lib/sessionCache.ts  ← 확인 및 활용
moducon-frontend/src/types/index.ts  ← 타입 확인
```

---

## 🎯 Step-by-Step 작업 가이드

### Step 1: 현재 코드 확인 (10분)

**1.1 home/page.tsx 읽기**
```bash
# 파일 경로
moducon-frontend/src/app/home/page.tsx
```

**확인 포인트**:
- Line 60-73: 더미 데이터(김철수, 이영희) 위치
- Line 25-36: 주석 처리된 API 호출 코드
- Line 17-19: 주석 처리된 state 변수

**1.2 sessionCache.ts 확인**
```bash
# 파일 경로
moducon-frontend/src/lib/sessionCache.ts
```

**확인 포인트**:
- `getSessions(track?: string)` 함수 존재 여부
- API 엔드포인트 URL
- 응답 데이터 형식

**1.3 타입 정의 확인**
```bash
# 파일 경로
moducon-frontend/src/types/index.ts
```

**확인 포인트**:
- `Session` interface 정의
- 필드: `id`, `name`, `track`, `startTime`, `endTime`, `location`, `speaker` 등

---

### Step 2: API 연동 코드 작성 (1시간)

#### 2.1 Import 추가

**위치**: `moducon-frontend/src/app/home/page.tsx` 상단
**코드**:
```typescript
import { getSessions } from '@/lib/sessionCache';
import type { Session } from '@/types';
```

#### 2.2 State 변수 추가

**위치**: `home/page.tsx` 내부 (Line 16-20 근처)
**수정**:
```typescript
// Before (주석 처리된 코드):
// const [sessions, setSessions] = useState<Session[]>([]);

// After (주석 제거 및 변수명 변경):
const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
const [error, setError] = useState<string | null>(null);
```

#### 2.3 useEffect 수정

**위치**: Line 22-40 근처
**수정 전**:
```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      // API calls will fail without the backend, so we'll use mock data for now
      // const [sessionsData, boothsData] = await Promise.all([
      //   sessionAPI.getAll(),
      //   boothAPI.getAll(),
      // ]);
      // setSessions(sessionsData.slice(0, 3));
      // setBooths(boothsData.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

**수정 후**:
```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 실제 API 호출
      const allSessions = await getSessions();

      // 다가오는 세션 3개 선택 (시작 시간 기준 정렬)
      const upcoming = allSessions
        .sort((a, b) => {
          // 시작 시간 기준 오름차순 정렬
          return a.startTime.localeCompare(b.startTime);
        })
        .slice(0, 3); // 최대 3개

      setUpcomingSessions(upcoming);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setError('세션 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

#### 2.4 UI 렌더링 수정

**위치**: Line 55-81 (CardContent 내부)
**수정 전**:
```typescript
<CardContent>
  {/* Mock Data */}
  <div className="space-y-4">
    <div className="border-b pb-4 last:border-0">
      <h3 className="font-semibold">AI 시대의 프론트엔드 개발</h3>
      <p className="text-sm text-muted-foreground">
        김철수 • Track 1
      </p>
    </div>
    <div className="border-b pb-4 last:border-0">
      <h3 className="font-semibold">LLM을 활용한 챗봇 구축</h3>
      <p className="text-sm text-muted-foreground">
        이영희 • Track 2
      </p>
    </div>
  </div>
  <Link href="/sessions">
    <Button variant="outline" className="w-full mt-4">
      전체 세션 보기 <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </Link>
</CardContent>
```

**수정 후**:
```typescript
<CardContent>
  {error ? (
    <div className="py-4">
      <p className="text-sm text-destructive">{error}</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => window.location.reload()}
      >
        다시 시도
      </Button>
    </div>
  ) : upcomingSessions.length === 0 ? (
    <p className="text-sm text-muted-foreground py-4">
      다가오는 세션이 없습니다.
    </p>
  ) : (
    <div className="space-y-4">
      {upcomingSessions.map((session) => (
        <div key={session.id} className="border-b pb-4 last:border-0">
          <h3 className="font-semibold">{session.name}</h3>
          <p className="text-sm text-muted-foreground">
            {session.speaker} • {session.track}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {session.startTime} - {session.endTime} | {session.location}
          </p>
        </div>
      ))}
    </div>
  )}
  <Link href="/sessions">
    <Button variant="outline" className="w-full mt-4">
      전체 세션 보기 <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </Link>
</CardContent>
```

---

### Step 3: 테스트 및 검증 (30분)

#### 3.1 백엔드 실행

```bash
# 터미널 1: 백엔드 실행
cd moducon-backend
npm run dev

# 확인: http://localhost:3001/api/sessions 접속
# → 36개 세션 데이터 JSON 반환 확인
```

#### 3.2 프론트엔드 실행

```bash
# 터미널 2: 프론트엔드 실행
cd moducon-frontend
npm run dev

# 확인: http://localhost:3000/home 접속
```

#### 3.3 동작 확인 체크리스트

**필수 확인 사항**:
- [ ] "다가오는 세션" 섹션에 3개 세션 표시
- [ ] 세션 이름이 실제 데이터 (김철수, 이영희 아님)
- [ ] 세션 연사, 트랙, 시간, 장소 정보 표시
- [ ] "전체 세션 보기" 버튼 클릭 → `/sessions` 이동

**에러 케이스 확인**:
- [ ] 백엔드 중단 후 새로고침 → 에러 메시지 표시
- [ ] 네트워크 오류 시뮬레이션 (DevTools Offline) → 캐시 데이터 사용 확인

#### 3.4 빌드 테스트

```bash
cd moducon-frontend
npm run build

# 확인:
# - 0 errors
# - 빌드 성공 메시지
```

---

### Step 4: 코드 품질 검증 (30분)

#### 4.1 TypeScript 컴파일

```bash
cd moducon-frontend
npm run type-check  # 또는 npx tsc --noEmit

# 확인: 0 errors
```

#### 4.2 Lint 검사

```bash
npm run lint

# 확인: 0 errors, 0 warnings
```

#### 4.3 코드 포맷팅

```bash
npm run format  # 또는 npx prettier --write src/

# 확인: 포맷팅 적용 완료
```

---

### Step 5: Git 커밋 (30분)

#### 5.1 변경 사항 확인

```bash
git status
git diff moducon-frontend/src/app/home/page.tsx

# 확인:
# - 더미 데이터 제거
# - API 연동 코드 추가
# - 에러 핸들링 추가
```

#### 5.2 Git 커밋

```bash
# 파일 추가
git add moducon-frontend/src/app/home/page.tsx

# 커밋
git commit -m "fix(home): 홈페이지 세션 데이터 더미 제거 및 실제 API 연동

- 더미 데이터(김철수, 이영희) 완전 제거
- getSessions() API 호출로 실제 세션 데이터 로딩
- 다가오는 세션 3개 동적 표시 (시작 시간 기준 정렬)
- 에러 핸들링 추가 (네트워크 오류, 빈 데이터)

테스트:
- 백엔드 API 연동 동작 확인
- 36개 세션 중 다가오는 3개 정확히 표시
- 에러 케이스 핸들링 검증
- 프론트엔드 빌드 성공 (0 errors)

관련 문서:
- claudedocs/MODUCON_2025_FINAL_ANALYSIS.md (요구사항 #2)
- 125_TECH_LEAD_FINAL_FIX_PLAN.md"
```

---

## 📊 완료 기준 (DoD)

### 기능 요구사항
- [ ] 홈페이지 "다가오는 세션" 섹션에 실제 데이터 표시
- [ ] 더미 데이터(김철수, 이영희) 완전 제거
- [ ] 다가오는 세션 3개 표시
- [ ] 세션 정보 완전 표시 (이름, 연사, 트랙, 시간, 장소)

### 기술 요구사항
- [ ] TypeScript 컴파일 0 errors
- [ ] ESLint 0 errors
- [ ] 프론트엔드 빌드 성공 (`npm run build`)
- [ ] API 연동 동작 확인

### 에러 핸들링
- [ ] 네트워크 오류 시 에러 메시지 표시
- [ ] 빈 데이터 케이스 처리

### Git 및 문서
- [ ] Git 커밋 완료 (컨벤션 준수)
- [ ] 127_WORKER_COMPLETION_REPORT.md 작성

---

## 🚨 문제 발생 시 대응

### 문제 1: sessionCache.ts 파일을 찾을 수 없음
**증상**: `import { getSessions } from '@/lib/sessionCache'` 에러
**원인**: 파일 경로 불일치
**해결**:
```bash
# 파일 찾기
find moducon-frontend/src -name "*session*" -type f

# 올바른 경로로 import 수정
```

### 문제 2: Session 타입 정의를 찾을 수 없음
**증상**: `import type { Session } from '@/types'` 에러
**원인**: 타입 파일 위치 불일치
**해결**:
```bash
# 타입 파일 찾기
find moducon-frontend/src -name "index.ts" -o -name "types.ts"

# 올바른 경로로 import 수정
# 예: '@/types' → '@/types/index' 또는 '@/lib/types'
```

### 문제 3: API 호출 시 CORS 에러
**증상**: 브라우저 콘솔에 CORS policy 에러
**원인**: 백엔드 CORS 설정 미비
**해결**:
```typescript
// moducon-backend/src/app.ts 확인
// CORS 미들웨어가 설정되어 있는지 확인

import cors from 'cors';
app.use(cors());
```

### 문제 4: 백엔드 API 응답이 빈 배열
**증상**: `upcomingSessions.length === 0`
**원인**: Google Sheets 데이터 미연동 또는 백엔드 로직 오류
**해결**:
```bash
# 백엔드 API 직접 테스트
curl http://localhost:3001/api/sessions | jq

# 응답 확인:
# - 36개 세션 데이터 반환되는지 확인
# - 데이터 형식이 올바른지 확인
```

---

## 📚 참고 자료

### 작업 계획서
- **125_TECH_LEAD_FINAL_FIX_PLAN.md**: 전체 작업 계획 및 기술 상세
- **102_TECH_LEAD_IMPLEMENTATION_PLAN.md**: 초기 구현 계획

### 분석 문서
- **claudedocs/MODUCON_2025_FINAL_ANALYSIS.md**: 요구사항 및 현황 분석

### 코드 참고
- **moducon-frontend/src/app/sessions/page.tsx**: 세션 목록 페이지 (API 연동 예시)
- **moducon-frontend/src/lib/sessionCache.ts**: 세션 데이터 캐싱 로직

---

## ✅ 완료 후 작업

**작업 완료 후 다음 문서 작성**:
- `127_WORKER_COMPLETION_REPORT.md` (작업 완료 보고서)

**포함 내용**:
1. 완료한 작업 목록 (체크리스트)
2. 테스트 결과 스크린샷 (선택)
3. 발생한 문제 및 해결 방법
4. 코드 품질 검증 결과 (빌드, lint, type-check)
5. Git 커밋 해시 및 메시지
6. 다음 담당자: **editor** (코드 리뷰) 또는 **reviewer** (최종 검토)

---

**작성 완료**: 2025-11-30
**담당자**: hands-on worker
**예상 완료 시간**: 2시간 30분
**다음 문서**: 127_WORKER_COMPLETION_REPORT.md
