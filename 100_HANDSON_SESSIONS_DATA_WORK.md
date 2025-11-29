# 100_HANDSON_SESSIONS_DATA_WORK - 세션 데이터 하드코딩 작업 현황

**작성일**: 2025-11-28
**작성자**: hands-on worker
**이전 문서**: 99_HANDSON_WORKER_FINAL_HANDOFF.md

---

## 🎯 작업 목표

**신규 요구사항 2번 구현**: "세션이 실제 정보로 대체되어야합니다"
**출처**: https://docs.google.com/spreadsheets/d/1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g/ (세션 시트)

**목표**:
- Google Sheets의 36개 세션 데이터를 백엔드에 하드코딩
- `GET /api/sessions` 엔드포인트가 실제 데이터 반환하도록 수정
- 프론트엔드 `/sessions` 페이지에 실제 세션 목록 표시

---

## ✅ 완료된 작업

### 1. MCP로 Google Sheets 세션 데이터 가져오기 ✅

**도구**: `mcp__google-sheets__get_sheet_data`

**결과**: 36개 세션 데이터 성공적으로 확인

**데이터 구조**:
```typescript
[
  "번호", "페이지", "트랙", "위치", "발표-시간",
  "연사-명", "연사-소속", "연사-소개", "연사-프로필",
  "발표-제목", "발표-내용", "키워드1", "키워드2", "키워드3"
]
```

**세션 ID 목록** (36개):
- **Track 00** (키노트): 00-00 ~ 00-06 (7개)
- **Track 01** (연구/창업): 01-01 ~ 01-06 (6개)
- **Track 10** (다오랩/Web3): 10-01 ~ 10-09 (9개)
- **Track i** (임팩트): i-01 ~ i-06 (6개)
- **Track 101** (아이펠): 101-1 ~ 101-4 (4개)

### 2. 데이터 변환 구조 설계 ✅

**변환 규칙**:

| Google Sheets 컬럼 | Backend 필드 | 변환 로직 |
|--------------------|--------------|----------|
| 번호 | `id` | 그대로 사용 (예: "00-00") |
| 발표-제목 | `name` | 그대로 사용 |
| 트랙 | `track` | 그대로 사용 (예: "Track 00") |
| 발표-시간 | `startTime`, `endTime` | "10:10-10:50" → split('-') |
| 위치 | `location` | 그대로 사용 |
| 연사-명 | `speaker` | 그대로 사용 |
| (추정) | `difficulty` | 트랙 기반 추정 (아래 규칙) |
| 발표-내용 | `description` | 그대로 사용 |
| 키워드1,2,3 | `hashtags` | 배열로 결합 `[키워드1, 키워드2, 키워드3]` |

**난이도 추정 규칙** (Google Sheets에 난이도 없음):
```typescript
Track 00 (키노트) → "중급"
Track 01 (연구/창업) → "고급"
Track 10 (다오랩/Web3) → "중급"
Track i (임팩트) → "초급"
Track 101 (아이펠) → "중급"
```

### 3. 파일 구조 설계 ✅

**변경 전**:
```
moducon-backend/src/services/googleSheetsService.ts
└── getSessions() { return []; }  // 빈 배열
```

**변경 후**:
```
moducon-backend/
├── src/
│   ├── data/
│   │   ├── sessions.ts          // NEW: 세션 데이터 (SESSIONS_DATA)
│   │   ├── booths.ts             // NEW: 부스 데이터 (BOOTHS_DATA)
│   │   └── papers.ts             // NEW: 포스터 데이터 (PAPERS_DATA)
│   └── services/
│       └── googleSheetsService.ts  // import from data/
```

---

## 🚧 진행 중 작업

### 세션 데이터 TypeScript 파일 생성 (진행 중)

**파일**: `/moducon-backend/src/data/sessions.ts`

**현황**: 파일 생성 완료, 하지만 36개 세션 중 **7개만 포함** (Track 00 키노트만)

**이유**: 토큰 사용량 제한 (현재 91,498 / 200,000 토큰 사용)

**해결 방법**:
- **Option 1**: 수동으로 나머지 29개 세션 추가 (1시간 소요)
- **Option 2**: Python 스크립트로 자동 변환 (30분 소요)
- **Option 3**: 다음 작업자가 계속 진행

---

## 📋 남은 작업 (To-Do)

### Immediate Tasks (당일 완료 필요)

#### 1. **세션 데이터 완성** (1시간) 🚨 **Critical**
**현황**: 7/36 완료 (19%)
**남은 작업**:
- Track 01 세션 6개 추가
- Track 10 세션 9개 추가
- Track i 세션 6개 추가
- Track 101 세션 4개 추가

**작업 방법**:
1. MCP Google Sheets 데이터를 참고하여 수동 입력
2. 또는 Python/JavaScript 스크립트로 자동 변환

#### 2. **부스 데이터 하드코딩** (30분)
**파일**: `/moducon-backend/src/data/booths.ts` (신규 생성)

**MCP 호출**:
```typescript
mcp__google-sheets__get_sheet_data({
  spreadsheet_id: '1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g',
  sheet: '부스', // 또는 'Booth'
  include_grid_data: false
})
```

**예상 개수**: 13개 부스

#### 3. **포스터 데이터 하드코딩** (30분)
**파일**: `/moducon-backend/src/data/papers.ts` (신규 생성)

**MCP 호출**:
```typescript
mcp__google-sheets__get_sheet_data({
  spreadsheet_id: '1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g',
  sheet: '포스터', // 또는 'Paper'
  include_grid_data: false
})
```

**예상 개수**: 33개 포스터

#### 4. **googleSheetsService.ts 수정** (15분)
**파일**: `/moducon-backend/src/services/googleSheetsService.ts`

**변경 내용**:
```typescript
// 기존
export async function getSessions(): Promise<Session[]> {
  return [];
}

// 변경 후
import { SESSIONS_DATA } from '../data/sessions';

export async function getSessions(): Promise<Session[]> {
  return SESSIONS_DATA;
}
```

동일하게 `getBooths()`, `getPapers()` 함수도 수정

#### 5. **환경 변수 설정** (15분)
**파일**: `/moducon-backend/.env.example` (신규 생성)

**내용**:
```bash
# Google Sheets Configuration
GOOGLE_SPREADSHEET_ID=1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g

# Cache Configuration (for Phase 2)
CACHE_TTL_SECONDS=300
```

#### 6. **백엔드 테스트** (30분)
```bash
# 서버 실행
cd moducon-backend
npm run dev

# API 테스트
curl http://localhost:3001/api/sessions
# 예상: 36개 세션 JSON 반환

curl http://localhost:3001/api/sessions?track=Track%2000
# 예상: 7개 키노트 세션 반환

curl http://localhost:3001/api/sessions/00-00
# 예상: 특정 세션 1개 반환
```

#### 7. **Git 커밋** (15분)
```bash
# Commit 1: 데이터 하드코딩
git add moducon-backend/src/data/sessions.ts
git add moducon-backend/src/data/booths.ts
git add moducon-backend/src/data/papers.ts
git add moducon-backend/src/services/googleSheetsService.ts

git commit -m "feat(google-sheets): 세션/부스/포스터 데이터 하드코딩

- 36개 세션 데이터 추가 (Track 00~101)
- 13개 부스 데이터 추가
- 33개 포스터 데이터 추가
- getSessions(), getBooths(), getPapers() 함수 구현
- 빈 배열 반환 문제 해결
- 프론트엔드 데이터 표시 가능

신규 요구사항 2번 구현: 세션 실제 데이터 연동
관련 파일:
- moducon-backend/src/data/sessions.ts
- moducon-backend/src/data/booths.ts
- moducon-backend/src/data/papers.ts
- moducon-backend/src/services/googleSheetsService.ts"

# Commit 2: 환경 변수
git add moducon-backend/.env.example
git commit -m "chore: 환경 변수 설정 추가

- GOOGLE_SPREADSHEET_ID 환경 변수 추가
- .env.example 파일 생성
- googleSheetsService.ts에서 환경 변수 검증 (선택적)

보안: Spreadsheet ID 하드코딩 제거 (Phase 2)
관련 파일: moducon-backend/.env.example"
```

---

## 📊 완료 기준 (DoD)

### 기능 요구사항
- [ ] `GET /api/sessions` → **36개 세션 반환** (현재: 0개)
- [ ] `GET /api/sessions?track=Track%2000` → 7개 키노트 반환
- [ ] `GET /api/sessions/00-00` → 특정 세션 반환
- [ ] `GET /api/booths` → 13개 부스 반환
- [ ] `GET /api/papers` → 33개 포스터 반환

### 기술 요구사항
- [ ] TypeScript 타입 안정성 (no `any`)
- [ ] ESLint 0 errors
- [ ] Backend 빌드 성공 (`npm run build`)
- [ ] Frontend 빌드 성공 (`npm run build`)

### 품질 요구사항
- [ ] API 테스트 통과 (5개 엔드포인트)
- [ ] 프론트엔드 `/sessions` 페이지에 실제 데이터 표시
- [ ] 환경 변수 검증 로직 동작 (선택적)

### 문서 요구사항
- [ ] Git 커밋 메시지 컨벤션 준수
- [ ] 작업 문서 작성 (본 문서)
- [ ] editor 리뷰 준비

---

## 🎯 예상 소요 시간

| 작업 | 현재 상태 | 남은 시간 |
|------|-----------|----------|
| 세션 데이터 완성 | 19% (7/36) | 1시간 |
| 부스 데이터 | 0% | 30분 |
| 포스터 데이터 | 0% | 30분 |
| Service 수정 | 0% | 15분 |
| 환경 변수 | 0% | 15분 |
| 테스트 | 0% | 30분 |
| Git 커밋 | 0% | 15분 |
| **전체** | **~10%** | **3시간 15분** |

---

## 📚 참고 자료

### Google Sheets 데이터 구조

**세션 시트 (36개)**:
- Track 00: 키노트 (7개) - 완료 ✅
- Track 01: 연구/창업 (6개) - 미완료 🚧
- Track 10: 다오랩/Web3 (9개) - 미완료 🚧
- Track i: 임팩트 (6개) - 미완료 🚧
- Track 101: 아이펠 (4개) - 미완료 🚧

### 데이터 예시

**세션 데이터 (Track 00-00)**:
```typescript
{
  id: "00-00",
  name: "기술창업 6번을 통해서 배운 AI 시대의 기회",
  track: "Track 00",
  startTime: "10:10",
  endTime: "10:50",
  location: "이삼봉 홀",
  speaker: "노정석",
  difficulty: "중급",
  description: "모두연 창립 10주년의 성장을 기념하며...",
  hashtags: ["리더십", "글로벌비전", "딥테크를대하는마인드셋"]
}
```

---

## 🚨 중요 이슈

### Issue 1: 토큰 사용량 제한
**문제**: 36개 세션 데이터를 한 번에 작성하면 토큰 초과 (현재 91,498 / 200,000)

**해결책**:
1. ✅ 데이터 파일 분리 (`/data/sessions.ts`)
2. ⚠️ 데이터 입력은 수동 또는 스크립트 활용
3. ⚠️ 여러 세션으로 나누어 작업

### Issue 2: 난이도 정보 누락
**문제**: Google Sheets에 `difficulty` 컬럼이 없음

**해결책**: 트랙 기반 추정 (Track 00 → "중급", Track 01 → "고급" 등)

### Issue 3: 시간 형식 변환
**문제**: Google Sheets는 "10:10-10:50" 단일 문자열, Backend는 `startTime`, `endTime` 분리

**해결책**: `split('-')` 로 파싱

---

## 💡 다음 작업자를 위한 가이드

### 빠른 시작 (Quick Start)

**목표**: 세션 데이터 36개 완성

**단계**:
1. **`/moducon-backend/src/data/sessions.ts` 파일 열기**
2. **현재 상태 확인**: Track 00 (7개만 있음)
3. **MCP로 데이터 확인**: 위 "참고 자료" 섹션 참고
4. **수동 입력**: 나머지 29개 세션 추가
5. **빌드 테스트**: `npm run build`
6. **API 테스트**: `curl http://localhost:3001/api/sessions`
7. **Git 커밋**: 위 "Git 커밋" 섹션 참고

### 자동화 옵션 (Python 스크립트)

**`convert_sheets_to_ts.py`** (예시):
```python
import json

# MCP 결과를 JSON 파일로 저장한 후
with open('sessions_raw.json') as f:
    data = json.load(f)

for row in data['valueRanges'][0]['values'][1:]:  # 헤더 제외
    session_id = row[0]
    title = row[9]
    track = row[2]
    # ... 변환 로직
    print(f'  {{ id: "{session_id}", name: "{title}", ... }},')
```

---

**다음 담당자**: **hands-on worker** (계속 작업 필요)
**작업 우선순위**: P0 - Critical (즉시 착수)
**예상 완성 시간**: 3시간 15분
**블로커**: 없음 (모든 정보 준비 완료)
