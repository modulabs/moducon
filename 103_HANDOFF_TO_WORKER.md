# 103_HANDOFF_TO_WORKER - Technical Lead → hands-on worker 인계서

**작성일**: 2025-11-29
**작성자**: Technical Lead
**문서 버전**: 1.0
**브랜치**: main → feature/* 작업
**우선순위**: P0 - Critical

---

## 📋 Executive Summary

### 인계 배경
2025-11-29 신규 요구사항 4개가 추가되어, 긴급하게 구현이 필요합니다.
프로젝트는 이미 프론트엔드 100%, 백엔드 MVP 완료 상태이며, 추가 기능 정비가 필요합니다.

### 작업 범위
총 **6시간 30분** 예상, 당일 완료 목표

1. ✅ 메인 로고 링크 수정 (15분)
2. ✅ QR 코드 기능 검증 및 개선 (2시간)
3. ✅ 세션 데이터 Google Sheets 연동 (4시간)
4. ✅ Git 커밋 및 문서 업데이트 (15분)

### 예상 성과
- **PRD 달성률**: 51% → 65% (+14%p)
- **기능 완성도**: 85% → 90%
- **품질 점수**: A (93/100) → A (94/100)

---

## 🎯 작업 우선순위 및 체크리스트

### Phase 1: 간단한 수정 (15분)
- [ ] **메인 로고 링크 수정**
  - 파일: `moducon-frontend/src/components/Header.tsx`
  - 변경: `href="/"` → `href="/home/"`
  - 테스트: 로그인 전/후, 모바일/데스크톱
  - 브랜치: `feature/logo-link-fix`

### Phase 2: QR 기능 개선 (2시간)
- [ ] **QR 데이터 형식 정의**
  - 형식: `moducon://session/00-00`, `moducon://booth/클라비`, `moducon://paper/P-001`
  - 파일: `moducon-frontend/src/lib/qrParser.ts` (신규)

- [ ] **QR 파싱 로직 구현**
  - parseQRCode() 함수
  - getRouteFromQR() 함수
  - 에러 핸들링

- [ ] **QRScanner 컴포넌트 업데이트**
  - 파일: `moducon-frontend/src/components/QRScanner.tsx`
  - 햅틱 피드백 추가
  - 에러 메시지 표시

- [ ] **테스트**
  - 세션/부스/포스터 QR 스캔 동작 확인
  - 잘못된 QR 에러 처리 확인
  - 브랜치: `feature/qr-improvements`

### Phase 3: 세션 데이터 연동 (4시간)
- [ ] **Google Sheets 시트 구조 확인 (30분)**
  - MCP로 '세션' 시트 데이터 확인
  - 컬럼 매핑 확인

- [ ] **백엔드 서비스 함수 작성 (1.5시간)**
  - 파일: `moducon-backend/src/services/googleSheetsService.ts`
  - getSessions() 함수 구현 (36개 세션 하드코딩)
  - getSessionById() 함수 구현

- [ ] **백엔드 API 엔드포인트 구현 (30분)**
  - 파일: `moducon-backend/src/routes/sessions.ts`
  - GET /api/sessions (트랙 필터링 지원)
  - GET /api/sessions/:id

- [ ] **프론트엔드 페이지 업데이트 (1시간)**
  - 파일: `moducon-frontend/src/app/sessions/page.tsx`
  - 세션 목록 표시
  - 트랙 필터 UI

- [ ] **테스트 (1시간)**
  - API 테스트 (curl/Postman)
  - 프론트엔드 빌드
  - 데이터 표시 확인
  - 브랜치: `feature/sessions-data`

### Phase 4: Git 커밋 및 문서 (15분)
- [ ] **Git 커밋 4개**
  - Commit 1: 로고 링크 수정
  - Commit 2: QR 기능 개선
  - Commit 3: 세션 데이터 연동
  - Commit 4: 문서 업데이트

- [ ] **문서 업데이트**
  - 07_PROGRESS.md 업데이트
  - 작업 완료 보고서 작성

---

## 📚 필수 읽기 문서 (우선순위 순)

### 1. 102_TECH_LEAD_IMPLEMENTATION_PLAN.md ⭐⭐⭐⭐⭐
**가장 중요**: 작업 상세 내역, 코드 예시, DoD 체크리스트

**주요 섹션**:
- 작업 1: 메인 로고 링크 수정 (상세 구현 방법)
- 작업 2: QR 코드 기능 개선 (QR 파싱 로직 코드 예시)
- 작업 3: 세션 데이터 연동 (백엔드/프론트엔드 전체 코드)
- Git 커밋 가이드 (컨벤션, 예시)

### 2. 93_TECH_LEAD_REQUIREMENTS_ANALYSIS.md ⭐⭐⭐⭐
**요구사항 분석**: 신규 요구사항 4개 상세 분석

**주요 섹션**:
- 요구사항 1: QR 코드 기능 개선
- 요구사항 2: 세션 실제 데이터 적용
- 요구사항 3: 메인 로고 링크 수정
- 요구사항 4: Git 관리

### 3. 01_PRD.md v1.7 ⭐⭐⭐
**제품 요구사항**: 전체 프로젝트 맥락 이해

### 4. 07_PROGRESS.md ⭐⭐
**진행 상황**: 현재 완료/미완료 작업 목록

---

## 🚀 Quick Start Guide

### Step 1: 환경 확인 (5분)
```bash
# Git 상태 확인
git status
git branch

# 브랜치 확인 (현재: main 또는 feature/sessions-data)
git checkout main

# 최신 코드 확인
git pull origin main

# 프론트엔드 의존성 확인
cd moducon-frontend
npm install

# 백엔드 의존성 확인
cd ../moducon-backend
npm install
```

### Step 2: 작업 1 - 로고 링크 수정 (15분)
```bash
# 브랜치 생성
git checkout -b feature/logo-link-fix

# 파일 찾기
grep -r "href=\"/\"" moducon-frontend/src/

# 수정 후 테스트
cd moducon-frontend
npm run build

# 커밋
git add moducon-frontend/src/components/Header.tsx
git commit -m "fix(header): 메인 로고 클릭 시 /home/으로 이동"

# main으로 병합
git checkout main
git merge feature/logo-link-fix
```

### Step 3: 작업 2 - QR 기능 개선 (2시간)
```bash
# 브랜치 생성
git checkout -b feature/qr-improvements

# 1. QR 파서 파일 생성 (1시간)
# 파일: moducon-frontend/src/lib/qrParser.ts
# 코드: 102_TECH_LEAD_IMPLEMENTATION_PLAN.md 참고

# 2. QRScanner 컴포넌트 수정 (1시간)
# 파일: moducon-frontend/src/components/QRScanner.tsx

# 테스트
npm run build

# 커밋
git add moducon-frontend/src/lib/qrParser.ts
git add moducon-frontend/src/components/QRScanner.tsx
git commit -m "feat(qr): QR 스캔 자동 라우팅 개선"

# main으로 병합
git checkout main
git merge feature/qr-improvements
```

### Step 4: 작업 3 - 세션 데이터 연동 (4시간)
```bash
# 브랜치 생성
git checkout -b feature/sessions-data

# 1. Google Sheets 확인 (30분)
# MCP로 세션 시트 데이터 가져오기
# 시트: '세션' (gid=1035988542)

# 2. 백엔드 서비스 함수 수정 (1.5시간)
# 파일: moducon-backend/src/services/googleSheetsService.ts
# getSessions() 함수 구현 (36개 세션 하드코딩)

# 3. 백엔드 API 엔드포인트 수정 (30분)
# 파일: moducon-backend/src/routes/sessions.ts

# 4. 프론트엔드 페이지 수정 (1시간)
# 파일: moducon-frontend/src/app/sessions/page.tsx

# 테스트
# 백엔드
cd moducon-backend
npm run build
npm run dev

# 프론트엔드
cd moducon-frontend
npm run build

# 커밋
git add moducon-backend/src/services/googleSheetsService.ts
git add moducon-backend/src/routes/sessions.ts
git add moducon-frontend/src/app/sessions/page.tsx
git commit -m "feat(sessions): Google Sheets 세션 데이터 연동"

# main으로 병합
git checkout main
git merge feature/sessions-data
```

### Step 5: 문서 업데이트 (15분)
```bash
# 07_PROGRESS.md 업데이트
# - 완료된 작업 체크
# - 버전 히스토리 추가

# 작업 완료 보고서 작성
# 파일: 104_WORKER_COMPLETION_REPORT.md

# 커밋
git add 07_PROGRESS.md
git add 104_WORKER_COMPLETION_REPORT.md
git commit -m "docs: 신규 요구사항 4개 작업 완료 보고"
```

---

## 💡 핵심 구현 팁

### 1. QR 파서 구현 시
```typescript
// moducon-frontend/src/lib/qrParser.ts
export function parseQRCode(qrData: string): { type: string; id: string } | null {
  const pattern = /^moducon:\/\/(session|booth|paper)\/(.+)$/;
  const match = qrData.match(pattern);

  if (!match) {
    console.error('Invalid QR format:', qrData);
    return null;
  }

  const [, type, id] = match;
  return { type, id };
}
```

### 2. 세션 데이터 하드코딩 시
```typescript
// MCP로 가져온 데이터를 이 형식으로 변환
const SESSIONS_DATA: Session[] = [
  {
    id: '00-00', // 컬럼 A
    name: '키노트: AI의 미래', // 컬럼 E
    track: 'Track 00', // 컬럼 B
    startTime: '10:10', // 컬럼 C (파싱 필요: "10:10-10:50" → "10:10")
    endTime: '10:50', // 컬럼 C (파싱 필요: "10:10-10:50" → "10:50")
    location: '그랜드홀', // 컬럼 D
    speaker: '홍길동', // 컬럼 F
    difficulty: '중급', // 컬럼 G
    description: 'AI 기술의 최신 트렌드...', // 컬럼 H
    hashtags: ['AI', 'Keynote', 'Future'] // 컬럼 I-N (빈 값 제외)
  },
  // ... 나머지 35개 세션
];
```

### 3. 시간 파싱 유틸
```typescript
function parseTimeRange(timeRange: string): { start: string; end: string } {
  const [start, end] = timeRange.split('-').map(t => t.trim());
  return { start, end };
}

// 사용 예시
const { start, end } = parseTimeRange('10:10-10:50');
// start: "10:10", end: "10:50"
```

---

## 🚨 주의사항 및 트러블슈팅

### 주의사항 1: Google Sheets MCP 사용법
```bash
# MCP 호출 예시 (Claude Code 환경에서만 동작)
mcp__google-sheets__get_sheet_data(
  spreadsheet_id="1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g",
  sheet="세션",
  range="A1:N100"
)
```

**중요**: MCP는 백엔드 Node.js 런타임에서 직접 호출 불가!
→ MCP로 데이터를 가져와서 **백엔드 코드에 하드코딩**하는 방식 사용

### 주의사항 2: TypeScript 타입 안정성
```typescript
// ❌ 절대 사용 금지
const session: any = ...;

// ✅ 명시적 타입 정의
const session: Session = {
  id: row[0] || '',
  name: row[4] || '',
  // ...
};
```

### 주의사항 3: 난이도 추정
Google Sheets에 난이도 컬럼이 없으면 **트랙 기반 추정**:
```typescript
function inferDifficulty(track: string): '초급' | '중급' | '고급' {
  if (track === 'Track 00') return '중급'; // 키노트
  if (track === 'Track 01') return '고급'; // 연구/창업
  if (track === 'Track i') return '초급'; // 임팩트
  return '중급'; // 기본값
}
```

### 트러블슈팅: 빌드 에러
```bash
# TypeScript 컴파일 에러
npm run build

# ESLint 에러
npm run lint

# 타입 에러 해결
npm run type-check
```

---

## ✅ Definition of Done (최종 체크리스트)

### 기능 요구사항
- [ ] 메인 로고 클릭 시 `/home/` 이동
- [ ] QR 스캔 → 세션/부스/포스터 자동 라우팅 (각 1개 테스트)
- [ ] `GET /api/sessions` → 36개 세션 반환
- [ ] `GET /api/sessions?track=Track%2000` → 트랙 필터링
- [ ] `GET /api/sessions/00-00` → 특정 세션 반환
- [ ] 세션 목록 페이지에 실제 데이터 표시
- [ ] 트랙 필터 동작 확인

### 기술 요구사항
- [ ] TypeScript 컴파일 성공 (no errors)
- [ ] ESLint 0 errors
- [ ] 프론트엔드 빌드 성공 (`npm run build`)
- [ ] 백엔드 빌드 성공 (`npm run build`)
- [ ] API 테스트 5개 통과

### 문서 요구사항
- [ ] Git 커밋 4개 완료 (컨벤션 준수)
- [ ] 07_PROGRESS.md 업데이트
- [ ] 104_WORKER_COMPLETION_REPORT.md 작성

### QA 요구사항
- [ ] 모바일 브라우저 테스트 (카메라 권한)
- [ ] 데스크톱 브라우저 테스트
- [ ] 로그인 전/후 동작 확인

---

## 📞 문제 발생 시 참고

### 1. Google Sheets 시트 구조가 예상과 다를 때
→ `93_TECH_LEAD_REQUIREMENTS_ANALYSIS.md` 섹션 3 참고
→ 백엔드에서 데이터 변환 로직 추가

### 2. QR 형식이 정의되지 않았을 때
→ 표준 형식 정의: `moducon://session/00-00`
→ 관리자 페이지에서 QR 생성 기능 추가 (향후)

### 3. 시간이 부족할 때
→ Phase 1 (로고 링크)만 완료해도 OK
→ Phase 2, 3은 다음 세션으로 연기

---

## 🎯 다음 단계

### 작업 완료 후
1. **editor 리뷰 요청**
   - 코드 품질 재검증
   - 최종 등급 산정
   - 104_WORKER_COMPLETION_REPORT.md 검토

2. **프론트엔드 배포**
   - GitHub Pages 자동 배포 확인
   - https://moducon.vibemakers.kr 접속 테스트
   - 실제 세션 데이터 표시 확인

3. **백엔드 배포** (향후)
   - 프로덕션 서버 배포
   - API 엔드포인트 동작 확인

### Short-term (1주)
1. 퀘스트 MVP (8시간)
2. 실시간 혼잡도 (6시간)
3. 체크인 시스템 (4시간)

---

## 📊 예상 성과

### PRD 달성률
- **현재**: 51% (기본 기능만)
- **완료 후**: 65% (+14%p)
  - QR 기능: 85% → 100%
  - 세션 관리: 20% → 80%
  - 전체 UX: 향상

### 품질 점수
| 항목 | 현재 | 완료 후 |
|------|------|---------|
| 코드 품질 | 93/100 | 94/100 |
| 기능 완성도 | 85% | 90% |
| 문서 정합성 | 95% | 100% |

---

## 📚 참고 자료 요약

### 내부 문서
1. **102_TECH_LEAD_IMPLEMENTATION_PLAN.md** - 작업 상세 내역 (코드 예시)
2. **93_TECH_LEAD_REQUIREMENTS_ANALYSIS.md** - 요구사항 분석
3. **01_PRD.md v1.7** - 제품 요구사항
4. **07_PROGRESS.md** - 진행 상황
5. **05_API_SPEC.md** - API 명세
6. **06_DB_DESIGN.md** - 데이터베이스 설계

### 외부 리소스
1. **Google Sheets**: https://docs.google.com/spreadsheets/d/1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g/edit?gid=1035988542#gid=1035988542
2. **MCP Google Sheets**: `mcp__google-sheets__get_sheet_data`

---

**작성 완료**: 2025-11-29
**다음 담당자**: hands-on worker
**예상 소요 시간**: 6시간 30분
**우선순위**: P0 - Critical

---

## 🚀 시작하세요!

모든 준비가 완료되었습니다. `102_TECH_LEAD_IMPLEMENTATION_PLAN.md`를 열고 작업을 시작하세요.

**Good luck! 🎉**
