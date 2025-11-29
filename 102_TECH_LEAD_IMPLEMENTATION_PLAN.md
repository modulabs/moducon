# 102_TECH_LEAD_IMPLEMENTATION_PLAN - 기술 리드 구현 계획서

**작성일**: 2025-11-29
**작성자**: Technical Lead
**문서 버전**: 1.0
**기준 PRD**: v1.7 (2025-11-29 업데이트)
**브랜치 전략**: feature/* → main

---

## 📋 Executive Summary

### 현황
- **프로젝트 상태**: 프론트엔드 100%, 백엔드 MVP 완료 (A 93/100)
- **PRD 달성률**: 51% → 65% 목표 (신규 요구사항 4개 완료 시)
- **긴급도**: P0 - Critical (행사일: 2025년 12월 13일)

### 신규 요구사항 (2025-11-29)
1. ✅ **QR 코드 기능 정비**: 세션/부스/포스터 QR 스캔 → 자동 라우팅
2. ✅ **세션 실제 데이터**: Google Sheets '세션' 시트 연동 (36개 세션)
3. ✅ **메인 로고 링크**: `/` → `/home/` 수정
4. ✅ **Git 관리 체계화**: 브랜치 전략 및 커밋 컨벤션

### 예상 완료 시간
**총 6시간 30분** (당일 완료 가능)

---

## 🎯 우선순위 및 작업 순서

### Phase 1: Critical Fixes (Immediate, 6.5시간)
| 순위 | 작업 | 예상 시간 | 담당자 | 브랜치 |
|------|------|----------|--------|--------|
| 1 | 메인 로고 링크 수정 | 15분 | hands-on worker | `feature/logo-link-fix` |
| 2 | QR 기능 검증 및 개선 | 2시간 | hands-on worker | `feature/qr-improvements` |
| 3 | 세션 데이터 Google Sheets 연동 | 4시간 | hands-on worker | `feature/sessions-data` |
| 4 | Git 커밋 및 병합 | 15분 | hands-on worker | - |

---

## 📝 작업 상세 내역

### 1. 메인 로고 링크 수정 (15분)

#### 목표
메인 로고 클릭 시 `/` 대신 `/home/`으로 이동

#### 작업 파일
```
moducon-frontend/src/components/Header.tsx
또는
moducon-frontend/src/app/layout.tsx
```

#### 구현 방법
**Step 1: 파일 찾기** (5분)
```bash
# Grep으로 로고 링크 위치 찾기
grep -r "href=\"/\"" moducon-frontend/src/
```

**Step 2: 코드 수정** (5분)
```typescript
// 수정 전
<Link href="/">
  <img src="/logo.svg" alt="모두콘 2025" />
</Link>

// 수정 후
<Link href="/home/">
  <img src="/logo.svg" alt="모두콘 2025" />
</Link>
```

**Step 3: 테스트** (5분)
- 프론트엔드 빌드 (`npm run build`)
- 로그인 전/후 동작 확인
- 모바일/데스크톱 확인

#### DoD (Definition of Done)
- [ ] 로고 클릭 시 `/home/` 이동 확인
- [ ] 빌드 성공 (no errors)
- [ ] 로그인 상태 유지 확인

---

### 2. QR 코드 기능 검증 및 개선 (2시간)

#### 목표
- 후방 카메라 활용 세션/부스/포스터 QR 스캔 동작 확인
- 자동 라우팅 로직 검증
- 에러 핸들링 강화

#### 작업 파일
```
moducon-frontend/src/components/QRScanner.tsx
moducon-frontend/src/app/(mobile)/page.tsx
```

#### 구현 방법
**Step 1: QR 데이터 형식 정의** (30분)
```typescript
// QR 코드 데이터 형식
interface QRData {
  type: 'session' | 'booth' | 'paper';
  id: string;
}

// 예시 QR 내용
// 세션: moducon://session/00-00
// 부스: moducon://booth/클라비
// 포스터: moducon://paper/P-001
```

**Step 2: QR 파싱 로직 강화** (1시간)
```typescript
// moducon-frontend/src/lib/qrParser.ts (신규 파일)
export function parseQRCode(qrData: string): { type: string; id: string } | null {
  // 형식 검증
  const pattern = /^moducon:\/\/(session|booth|paper)\/(.+)$/;
  const match = qrData.match(pattern);

  if (!match) {
    console.error('Invalid QR format:', qrData);
    return null;
  }

  const [, type, id] = match;
  return { type, id };
}

export function getRouteFromQR(qrData: string): string | null {
  const parsed = parseQRCode(qrData);
  if (!parsed) return null;

  const { type, id } = parsed;
  switch (type) {
    case 'session':
      return `/sessions/${id}`;
    case 'booth':
      return `/booths/${id}`;
    case 'paper':
      return `/papers/${id}`;
    default:
      return null;
  }
}
```

**Step 3: QRScanner 컴포넌트 업데이트** (30분)
```typescript
// moducon-frontend/src/components/QRScanner.tsx
import { getRouteFromQR } from '@/lib/qrParser';

const handleScanSuccess = (decodedText: string) => {
  const route = getRouteFromQR(decodedText);

  if (!route) {
    toast.error('유효하지 않은 QR 코드입니다.');
    return;
  }

  // 햅틱 피드백 (모바일)
  if (navigator.vibrate) {
    navigator.vibrate(200);
  }

  // 라우팅
  router.push(route);
};
```

**Step 4: 에러 핸들링 추가** (30분)
- 카메라 권한 거부 시
- 잘못된 QR 형식
- 네트워크 오류 (API 호출 실패)

#### DoD
- [ ] QR 스캔 → 라우팅 동작 확인 (세션/부스/포스터 각 1개)
- [ ] 에러 핸들링 동작 확인
- [ ] 모바일 카메라 권한 UX 확인

---

### 3. 세션 데이터 Google Sheets 연동 (4시간)

#### 목표
Google Sheets '세션' 시트의 36개 세션 데이터를 프론트엔드에 표시

#### 데이터 소스
```
Spreadsheet ID: 1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g
Sheet: '세션' (gid=1035988542)
```

#### 구현 방법
**Step 1: Google Sheets 시트 구조 확인** (30분)
```bash
# MCP로 세션 시트 데이터 확인
mcp__google-sheets__get_sheet_data \
  --spreadsheet_id="1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g" \
  --sheet="세션" \
  --range="A1:N100"
```

**예상 컬럼 구조**:
| 컬럼 | 내용 |
|------|------|
| A | 세션 ID (예: 00-00, 01-01) |
| B | 트랙 (Track 00, Track 01, ...) |
| C | 시간 (예: 10:10-10:50) |
| D | 장소 |
| E | 세션명 |
| F | 연사 |
| G | 난이도 (초급/중급/고급) |
| H | 설명 |
| I-N | 해시태그 |

**Step 2: 백엔드 서비스 함수 작성** (1시간 30분)
```typescript
// moducon-backend/src/services/googleSheetsService.ts

interface Session {
  id: string;
  name: string;
  track: string;
  startTime: string;
  endTime: string;
  location: string;
  speaker: string;
  difficulty: '초급' | '중급' | '고급';
  description: string;
  hashtags: string[];
}

export async function getSessions(): Promise<Session[]> {
  const SESSIONS_DATA: Session[] = [
    // 하드코딩 방식: MCP로 가져온 데이터를 TypeScript 배열로 변환
    {
      id: '00-00',
      name: '키노트: AI의 미래',
      track: 'Track 00',
      startTime: '10:10',
      endTime: '10:50',
      location: '그랜드홀',
      speaker: '홍길동',
      difficulty: '중급',
      description: 'AI 기술의 최신 트렌드와 미래 전망',
      hashtags: ['AI', 'Keynote', 'Future']
    },
    // ... (36개 세션)
  ];

  return SESSIONS_DATA;
}

export async function getSessionById(id: string): Promise<Session | null> {
  const sessions = await getSessions();
  return sessions.find(s => s.id === id) || null;
}
```

**시간 파싱 유틸**:
```typescript
function parseTimeRange(timeRange: string): { start: string; end: string } {
  const [start, end] = timeRange.split('-').map(t => t.trim());
  return { start, end };
}
```

**Step 3: 백엔드 API 엔드포인트 구현** (30분)
```typescript
// moducon-backend/src/routes/sessions.ts (이미 존재하는 파일 수정)
import { getSessions, getSessionById } from '../services/googleSheetsService';

// GET /api/sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await getSessions();

    // 쿼리 파라미터 필터링
    const { track } = req.query;
    let filteredSessions = sessions;

    if (track && typeof track === 'string') {
      filteredSessions = sessions.filter(s => s.track === track);
    }

    res.json({ success: true, data: filteredSessions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
  }
});

// GET /api/sessions/:id
router.get('/:id', async (req, res) => {
  try {
    const session = await getSessionById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch session' });
  }
});
```

**Step 4: 프론트엔드 페이지 업데이트** (1시간)
```typescript
// moducon-frontend/src/app/sessions/page.tsx
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';

export default function SessionsPage() {
  const [selectedTrack, setSelectedTrack] = useState<string>('all');

  const { data, error, isLoading } = useSWR(
    selectedTrack === 'all'
      ? '/api/sessions'
      : `/api/sessions?track=${encodeURIComponent(selectedTrack)}`,
    fetcher
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading sessions</div>;

  const sessions = data?.data || [];
  const tracks = ['Track 00', 'Track 01', 'Track 02', 'Track i', 'Track 101'];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">세션 타임테이블</h1>

      {/* 트랙 필터 */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        <Button
          variant={selectedTrack === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedTrack('all')}
        >
          전체
        </Button>
        {tracks.map(track => (
          <Button
            key={track}
            variant={selectedTrack === track ? 'default' : 'outline'}
            onClick={() => setSelectedTrack(track)}
          >
            {track}
          </Button>
        ))}
      </div>

      {/* 세션 목록 */}
      <div className="space-y-4">
        {sessions.map((session: Session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
```

**Step 5: 테스트** (1시간)
- 백엔드 API 테스트 (curl/Postman)
- 프론트엔드 빌드 테스트
- 데이터 표시 확인
- 필터 기능 동작 확인

#### DoD
- [ ] `GET /api/sessions` → 36개 세션 반환
- [ ] `GET /api/sessions?track=Track%2000` → 트랙 필터링
- [ ] `GET /api/sessions/00-00` → 특정 세션 반환
- [ ] 프론트엔드 세션 목록 페이지에 실제 데이터 표시
- [ ] 트랙 필터 동작 확인

---

### 4. Git 커밋 및 병합 (15분)

#### Git 전략

**브랜치 전략**:
```
main (프로덕션)
├── feature/logo-link-fix
├── feature/qr-improvements
└── feature/sessions-data
```

**커밋 컨벤션**:
```
feat: 새로운 기능
fix: 버그 수정
docs: 문서 수정
refactor: 리팩토링
chore: 빌드/설정
```

#### 커밋 예시

**Commit 1: 로고 링크 수정**
```bash
git checkout -b feature/logo-link-fix
git add moducon-frontend/src/components/Header.tsx
git commit -m "fix(header): 메인 로고 클릭 시 /home/으로 이동

- href=\"/\" → href=\"/home/\" 수정
- 로그인 전/후 동작 검증 완료

관련 요구사항: 102_TECH_LEAD_IMPLEMENTATION_PLAN.md #3"
```

**Commit 2: QR 기능 개선**
```bash
git checkout -b feature/qr-improvements
git add moducon-frontend/src/lib/qrParser.ts
git add moducon-frontend/src/components/QRScanner.tsx
git commit -m "feat(qr): QR 스캔 자동 라우팅 개선

- QR 데이터 형식 정의 (moducon://type/id)
- 파싱 로직 강화 (qrParser.ts)
- 에러 핸들링 추가 (잘못된 QR, 권한 거부)
- 햅틱 피드백 추가

테스트: 세션/부스/포스터 QR 스캔 동작 확인

관련 요구사항: 102_TECH_LEAD_IMPLEMENTATION_PLAN.md #1"
```

**Commit 3: 세션 데이터 연동**
```bash
git checkout -b feature/sessions-data
git add moducon-backend/src/services/googleSheetsService.ts
git add moducon-backend/src/routes/sessions.ts
git add moducon-frontend/src/app/sessions/page.tsx
git commit -m "feat(sessions): Google Sheets 세션 데이터 연동

- 36개 세션 데이터 하드코딩 (Track 00~101)
- GET /api/sessions 엔드포인트 구현
- GET /api/sessions/:id 엔드포인트 구현
- 트랙 필터링 기능 추가
- 프론트엔드 세션 목록 페이지 업데이트

데이터 소스: Google Sheets '세션' 시트
테스트: 36개 세션 표시, 트랙 필터 동작 확인

관련 요구사항: 102_TECH_LEAD_IMPLEMENTATION_PLAN.md #2"
```

**Commit 4: 문서 업데이트**
```bash
git add 01_PRD.md
git add 102_TECH_LEAD_IMPLEMENTATION_PLAN.md
git add 07_PROGRESS.md
git commit -m "docs: PRD v1.7 업데이트 및 구현 계획서 작성

- PRD v1.6 → v1.7 (신규 요구사항 4개)
- 102_TECH_LEAD_IMPLEMENTATION_PLAN.md 작성
- 07_PROGRESS.md 업데이트

관련 문서: 93_TECH_LEAD_REQUIREMENTS_ANALYSIS.md"
```

#### 병합 전략
```bash
# Feature 브랜치 테스트 후 main 병합
git checkout main
git merge feature/logo-link-fix
git merge feature/qr-improvements
git merge feature/sessions-data

# 또는 PR 생성 (GitHub)
gh pr create --title "feat: 신규 요구사항 4개 구현" \
  --body "$(cat <<EOF
## Summary
- 메인 로고 링크 수정 (/home/)
- QR 스캔 자동 라우팅 개선
- 세션 데이터 Google Sheets 연동 (36개)

## Test Plan
- [x] 로고 링크 동작 확인
- [x] QR 스캔 테스트 (세션/부스/포스터)
- [x] 세션 목록 페이지 데이터 표시
- [x] 프론트엔드 빌드 성공
- [x] 백엔드 API 테스트 통과
EOF
)"
```

---

## 📊 완료 후 예상 성과

### PRD 달성률
- **현재**: 51% (기본 기능)
- **완료 후**: 65% (+14%p)
  - QR 기능: 85% → 100%
  - 세션 관리: 20% → 80%
  - 전체 UX: 향상

### 기술 품질
| 항목 | 현재 | 완료 후 |
|------|------|---------|
| 코드 품질 | A (93/100) | A (94/100) |
| 기능 완성도 | 85% | 90% |
| 문서 정합성 | 95% | 100% |

---

## 🚨 리스크 및 대응

### 리스크 1: Google Sheets 시트 구조 불일치
**확률**: Medium
**영향**: High
**대응**:
- MCP로 사전 확인 (30분)
- 구조 불일치 시 백엔드에서 데이터 변환 로직 추가

### 리스크 2: QR 형식 미정의
**확률**: High
**영향**: Medium
**대응**:
- 표준 QR 형식 정의 (moducon://type/id)
- 관리자 페이지에서 QR 생성 기능 추가 (향후)

### 리스크 3: 시간 부족
**확률**: Low
**영향**: High
**대응**:
- Phase 1만 완료해도 핵심 기능 동작
- 추가 기능은 Phase 2로 연기

---

## 📚 참고 자료

### 내부 문서
1. **PRD**: 01_PRD.md v1.7
2. **요구사항 분석**: 93_TECH_LEAD_REQUIREMENTS_ANALYSIS.md
3. **진행 상황**: 07_PROGRESS.md
4. **최종 분석**: 92_MODUCON_FINAL_ANALYSIS.md
5. **API 명세**: 05_API_SPEC.md
6. **DB 설계**: 06_DB_DESIGN.md

### 외부 리소스
1. **Google Sheets**: https://docs.google.com/spreadsheets/d/1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g/edit?gid=1035988542#gid=1035988542
2. **MCP Google Sheets**: `mcp__google-sheets__get_sheet_data`

---

## ✅ Definition of Done (전체)

### 기능 요구사항
- [ ] 메인 로고 클릭 → `/home/` 이동
- [ ] QR 스캔 → 세션/부스/포스터 자동 라우팅
- [ ] `GET /api/sessions` → 36개 세션 반환
- [ ] 세션 목록 페이지에 실제 데이터 표시
- [ ] 트랙 필터 동작

### 기술 요구사항
- [ ] TypeScript 컴파일 0 errors
- [ ] ESLint 0 errors
- [ ] 프론트엔드 빌드 성공
- [ ] 백엔드 API 테스트 통과

### 문서 요구사항
- [ ] PRD v1.7 업데이트
- [ ] 07_PROGRESS.md 업데이트
- [ ] Git 커밋 4개 완료 (컨벤션 준수)
- [ ] 103_HANDOFF_TO_WORKER.md 작성

---

## 🔄 Next Steps

### Immediate (당일)
1. hands-on worker 착수
2. 작업 완료 후 editor 리뷰

### Short-term (1주)
1. 퀘스트 MVP 개발 (8시간)
2. 실시간 혼잡도 (6시간)
3. 체크인 시스템 (4시간)

### Long-term (행사 전)
1. 배지/포인트 시스템
2. 네트워킹 기능
3. PWA 완성

---

**작성 완료**: 2025-11-29
**다음 담당자**: hands-on worker
**다음 문서**: 103_HANDOFF_TO_WORKER.md
