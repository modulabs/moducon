# 98_HANDSON_NEXT_STEPS - hands-on worker 다음 작업 가이드

**작성일**: 2025-11-28
**작성자**: hands-on worker
**이전 문서**: 97_HANDSON_WORKER_STATUS.md

---

## 📋 현재 상황 요약

### 문제 인식
editor가 요구한 "Google Sheets MCP 실제 연동"은 **MCP 클라이언트를 백엔드에서 호출하라는 것이 아님**을 확인했습니다.

**핵심 문제**:
- 백엔드 `googleSheetsService.ts`가 빈 배열 반환 (`return []`)
- 프론트엔드에 세션/부스/포스터 데이터 미표시
- PRD 요구사항 2 (세션 데이터 연동) 미충족

### 선택한 솔루션
**Phase 1: 하드코딩** (현재)
- MCP로 얻은 데이터를 TypeScript 배열로 변환
- 즉시 구현 가능, 빠른 배포
- 데이터 정적이므로 실용적

**Phase 2: Google Sheets API** (향후)
- `googleapis` 패키지 사용
- 실시간 데이터 업데이트
- 캐싱 시스템 추가

---

## 🎯 Immediate Tasks (당일 완료 목표)

### 1. 세션 데이터 하드코딩 (1시간)

**파일**: `moducon-backend/src/services/googleSheetsService.ts`

**작업**:
1. MCP로 얻은 36개 세션 데이터를 TypeScript 배열로 변환
2. `getSessions()` 함수에서 빈 배열 대신 실제 데이터 반환

**구현 예시** (일부):
```typescript
const SESSIONS_DATA: Session[] = [
  {
    id: "00-00",
    name: "기술창업 6번을 통해서 배운 AI 시대의 기회",
    track: "Track 00",
    startTime: "10:10",
    endTime: "10:50",
    location: "이삼봉 홀",
    speaker: "노정석",
    difficulty: "중급", // 키노트는 중급으로 추정
    description: "모두연 창립 10주년의 성장을 기념하며, 노정석 대표를 모시고...",
    hashtags: ["리더십", "글로벌비전", "딥테크를대하는마인드셋"]
  },
  {
    id: "00-01",
    name: "결핍이 만든 OpenAI 첫 한국인 엔지니어",
    track: "Track 00",
    startTime: "11:10",
    endTime: "11:50",
    location: "이삼봉 홀",
    speaker: "김태훈",
    difficulty: "중급",
    description: "네이버, 카카오톡, 학교를 해킹하고 OpenAI에 첫 한국인 엔지니어로...",
    hashtags: ["AI 엔지니어", "OpenAI", "carpedm20"]
  },
  // ... 34개 더
];

export async function getSessions(): Promise<Session[]> {
  return SESSIONS_DATA;
}
```

**난이도 매핑 규칙** (Google Sheets에 난이도 없음):
- Track 00 (키노트): "중급"
- Track 01 (연구/창업): "고급"
- Track 10 (다오랩/Web3): "중급"
- Track i (임팩트): "초급"
- Track 101 (아이펠): "중급"

**시간 파싱**:
- Google Sheets: "10:10-10:50" (단일 문자열)
- Backend: `startTime: "10:10"`, `endTime: "10:50"` (분리)

---

### 2. 부스 데이터 하드코딩 (30분)

**작업**:
- 부스 시트 데이터 확인 (MCP 호출)
- 13개 부스 데이터 변환
- `getBooths()` 함수 수정

**MCP 호출**:
```typescript
mcp__google-sheets__get_sheet_data({
  spreadsheet_id: '1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g',
  sheet: '부스', // 또는 'Booth'
  include_grid_data: false
})
```

---

### 3. 포스터 데이터 하드코딩 (30분)

**작업**:
- 포스터 시트 데이터 확인 (MCP 호출)
- 33개 포스터 데이터 변환
- `getPapers()` 함수 수정

**MCP 호출**:
```typescript
mcp__google-sheets__get_sheet_data({
  spreadsheet_id: '1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g',
  sheet: '포스터', // 또는 'Paper'
  include_grid_data: false
})
```

---

### 4. 환경 변수 설정 (15분)

**파일**: `moducon-backend/.env`

**작업**:
```bash
# Google Sheets Configuration
GOOGLE_SPREADSHEET_ID=1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g

# Cache Configuration (for Phase 2)
CACHE_TTL_SECONDS=300
```

**googleSheetsService.ts 수정**:
```typescript
// 파일 상단
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

if (!SPREADSHEET_ID) {
  throw new Error('GOOGLE_SPREADSHEET_ID is required in .env file');
}
```

---

### 5. 백엔드 테스트 (30분)

**테스트 시나리오**:
```bash
# 1. 백엔드 서버 실행
cd moducon-backend
npm run dev

# 2. API 테스트
curl http://localhost:3001/api/sessions
# 예상 응답: { success: true, data: [36개 세션] }

curl http://localhost:3001/api/sessions?track=Track%2000
# 예상 응답: { success: true, data: [9개 키노트 세션] }

curl http://localhost:3001/api/sessions/00-00
# 예상 응답: { success: true, data: { id: "00-00", ... } }

curl http://localhost:3001/api/booths
curl http://localhost:3001/api/papers
```

---

### 6. 프론트엔드 빌드 검증 (15분)

**빌드 테스트**:
```bash
cd moducon-frontend
npm run build
# 예상 결과: Static Export 성공 (out/ 디렉토리 생성)

# 파일 확인
ls out/
# 예상: _next/, sessions.html, booths.html, papers.html
```

**로컬 서버 실행**:
```bash
npx serve out
# http://localhost:3000/sessions 접속
# 실제 세션 목록 표시 확인
```

---

### 7. Git Commit (15분)

**Commit 1: 데이터 하드코딩**:
```bash
git add moducon-backend/src/services/googleSheetsService.ts
git commit -m "feat(google-sheets): 세션/부스/포스터 데이터 하드코딩

- 36개 세션 데이터 추가 (Track 00~101)
- 13개 부스 데이터 추가
- 33개 포스터 데이터 추가
- getSessions(), getBooths(), getPapers() 함수 구현
- 빈 배열 반환 문제 해결
- 프론트엔드 데이터 표시 가능

관련 파일: moducon-backend/src/services/googleSheetsService.ts"
```

**Commit 2: 환경 변수**:
```bash
git add moducon-backend/.env.example
git add moducon-backend/src/services/googleSheetsService.ts
git commit -m "chore: 환경 변수 설정 추가

- GOOGLE_SPREADSHEET_ID 환경 변수 추가
- .env.example 파일 생성
- googleSheetsService.ts에서 환경 변수 검증

보안: Spreadsheet ID 하드코딩 제거
관련 파일: moducon-backend/.env.example, googleSheetsService.ts"
```

---

## 📊 완료 기준

### ✅ Definition of Done (DoD)

#### 기능 요구사항
- [ ] `GET /api/sessions` → 36개 세션 반환
- [ ] `GET /api/sessions?track=Track%2000` → 9개 키노트 반환
- [ ] `GET /api/sessions/00-00` → 특정 세션 반환
- [ ] `GET /api/booths` → 13개 부스 반환
- [ ] `GET /api/papers` → 33개 포스터 반환

#### 기술 요구사항
- [ ] TypeScript 타입 안정성 (no `any`)
- [ ] ESLint 0 errors
- [ ] Backend 빌드 성공 (`npm run build`)
- [ ] Frontend 빌드 성공 (`npm run build`)

#### 품질 요구사항
- [ ] API 테스트 통과 (5개 엔드포인트)
- [ ] 프론트엔드 데이터 표시 확인
- [ ] 환경 변수 검증 로직 동작

#### 문서 요구사항
- [ ] Git 커밋 메시지 컨벤션 준수
- [ ] 작업 문서 작성 (본 문서)
- [ ] editor 리뷰 준비

---

## 🚀 Phase 2: Google Sheets API (향후)

### 언제 전환할 것인가?
- 세션 데이터 변경이 잦을 때
- 실시간 업데이트가 필요할 때
- 관리자 페이지에서 세션 수정 기능 추가 시

### 구현 계획

#### 1. googleapis 패키지 설치 (10분)
```bash
cd moducon-backend
npm install googleapis
npm install -D @types/google.auth
```

#### 2. Google Cloud 설정 (30분)
1. Google Cloud Console 접속
2. 프로젝트 생성 "Moducon 2025"
3. Google Sheets API 활성화
4. Service Account 생성
5. JSON 키 다운로드
6. `.gitignore`에 `service-account-key.json` 추가

#### 3. 인증 설정 (30분)
```typescript
// src/config/googleSheets.ts
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: './service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

export const sheets = google.sheets({ version: 'v4', auth });
```

#### 4. getSessions() 함수 수정 (1시간)
```typescript
export async function getSessions(): Promise<Session[]> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: '세션!A2:N100', // 헤더 제외
    });

    const rows = response.data.values || [];
    return rows.map((row, index) => ({
      id: row[0] || `session-${index + 1}`,
      name: row[9] || '', // 발표-제목
      track: row[2] || '',
      startTime: parseTime(row[4])[0], // "10:10-10:50" → "10:10"
      endTime: parseTime(row[4])[1],
      location: row[3] || '',
      speaker: row[5] || '',
      difficulty: inferDifficulty(row[2]), // 트랙 기반 추정
      description: row[10] || '', // 발표-내용
      hashtags: [row[11], row[12], row[13]].filter(Boolean)
    }));
  } catch (error) {
    console.error('Google Sheets API 호출 실패:', error);
    return []; // Fallback
  }
}

function parseTime(timeRange: string): [string, string] {
  const [start, end] = timeRange.split('-');
  return [start.trim(), end.trim()];
}

function inferDifficulty(track: string): '초급' | '중급' | '고급' {
  if (track === 'Track 00') return '중급';
  if (track === 'Track 01') return '고급';
  return '초급';
}
```

#### 5. 캐싱 시스템 추가 (2시간)
```typescript
// src/services/cache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttl: number;

  constructor(ttlSeconds: number = 300) {
    this.ttl = ttlSeconds * 1000;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

// googleSheetsService.ts
const sessionsCache = new SimpleCache<Session[]>(300); // 5분 TTL

export async function getSessions(): Promise<Session[]> {
  const cached = sessionsCache.get('sessions');
  if (cached) return cached;

  const sessions = await fetchFromGoogleSheets(); // API 호출
  sessionsCache.set('sessions', sessions);
  return sessions;
}
```

**예상 성능 향상**:
- API 응답 시간: 500ms → 5ms (100배)
- Google Sheets API 호출: 요청당 1회 → 5분당 1회
- 동시 요청 처리 능력: 10배 향상

---

## 📚 참고 자료

### Google Sheets API 문서
- [Node.js Quickstart](https://developers.google.com/sheets/api/quickstart/nodejs)
- [Authentication](https://developers.google.com/sheets/api/guides/authorizing)
- [Reading Data](https://developers.google.com/sheets/api/guides/values#reading_a_single_range)

### TypeScript 타입 정의
- [@types/google.auth](https://www.npmjs.com/package/@types/google.auth)
- [googleapis](https://www.npmjs.com/package/googleapis)

---

## 🎯 최종 체크리스트

### 완료 후 확인 사항
- [ ] 세션 데이터 36개 모두 표시
- [ ] 부스 데이터 13개 모두 표시
- [ ] 포스터 데이터 33개 모두 표시
- [ ] 환경 변수 설정 완료
- [ ] Git 커밋 2개 완료
- [ ] 백엔드 빌드 성공
- [ ] 프론트엔드 빌드 성공
- [ ] 작업 문서 작성

### editor 리뷰 준비
- [ ] 96_CODE_REVIEW_REPORT.md 재검토
- [ ] 모든 Critical/High 이슈 해결 여부 확인
- [ ] 코드 품질 개선 사항 적용
- [ ] 테스트 결과 정리

---

**다음 담당자**: hands-on worker (본인 계속) 또는 editor (리뷰)
**작업 우선순위**: P0 - Critical (즉시 착수)
**예상 소요 시간**: 3시간 30분
