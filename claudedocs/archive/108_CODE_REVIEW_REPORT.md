# 108_CODE_REVIEW_REPORT.md - 코드 리뷰 보고서

**검토자**: Code Reviewer
**검토일**: 2025-11-30
**검토 범위**: QR 스캐너 UI 개선 + 세션 데이터 Google Sheets 연동
**전체 평가**: ⚠️ 재작업 필요 (중대한 이슈 발견)

---

## 📊 종합 평가

| 영역 | 평가 | 상태 |
|------|------|------|
| 코드 품질 | 🟡 중간 | 개선 필요 |
| 보안 | 🔴 낮음 | 재작업 필요 |
| 성능 | 🟢 양호 | 통과 |
| 테스트 | 🔴 부족 | 재작업 필요 |
| 문서-코드 정합성 | 🟡 중간 | 개선 필요 |

---

## 🔴 중대한 이슈 (P0 - 즉시 수정 필요)

### 1. **보안 취약점: JWT Secret 노출** ⚠️

**위치**: `moducon-backend/.env:2`
```env
JWT_SECRET="RYbAEkyycWqu8xGMhgPQbjrZQXjgyQKX9wmupBjquRQ="
```

**문제점**:
- `.env` 파일이 Git에 커밋됨 (보안 심각)
- JWT Secret이 평문으로 노출

**영향도**: 🔴 **Critical**
- 인증 시스템 전체 보안 위험
- 토큰 위조 가능성
- 프로덕션 배포 시 심각한 보안 사고

**해결 방안**:
```bash
# 1. .env 파일 Git 히스토리에서 완전 제거
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch moducon-backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# 2. .gitignore에 추가
echo "moducon-backend/.env" >> .gitignore

# 3. .env.example 파일 생성
DATABASE_URL="postgresql://user@localhost:5432/moducon_dev"
JWT_SECRET="CHANGE_THIS_TO_RANDOM_SECRET"
JWT_EXPIRES_IN="1d"
GOOGLE_SHEETS_API_KEY="YOUR_API_KEY_HERE"
SPREADSHEET_ID="YOUR_SPREADSHEET_ID"

# 4. JWT Secret 재생성
openssl rand -base64 32
```

**시정 마감**: 즉시

---

### 2. **타입 불일치: Session 인터페이스 중복 정의** 🔴

**위치**:
- `moducon-backend/src/types/session.ts:28-43`
- `moducon-backend/src/services/googleSheetsService.ts:45-56`

**문제점**:
```typescript
// types/session.ts (14개 필드)
export interface Session {
  id: string;
  pageUrl: string;
  track: string;
  location: string;
  startTime: string;
  endTime: string;
  speaker: string;
  speakerAffiliation: string;
  speakerBio: string;
  speakerProfile: string;
  name: string;
  description: string;
  hashtags: string[];
  difficulty: '초급' | '중급' | '고급';
}

// googleSheetsService.ts (10개 필드 - ❌ 불일치)
export interface Session {
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
```

**영향도**: 🔴 **High**
- TypeScript 타입 체크 실패 가능
- 프론트엔드-백엔드 데이터 불일치
- 런타임 에러 발생 가능

**해결 방안**:
```typescript
// googleSheetsService.ts에서 중복 정의 제거
import { Session, SessionRaw } from '../types/session.js';

// Session 인터페이스 정의 삭제
// ❌ export interface Session { ... }
```

**시정 마감**: 즉시

---

### 3. **에러 처리 부족: QRScannerModal 카메라 클린업 미비** 🔴

**위치**: `moducon-frontend/src/components/qr/QRScannerModal.tsx:48-52`

**문제점**:
```typescript
return () => {
  if (scanner.isScanning) {
    scanner.stop();
  }
};
```

**이슈**:
- `scanner.stop()`이 async인데 await 없음
- 메모리 누수 가능성
- 컴포넌트 언마운트 시 에러 발생 가능

**해결 방안**:
```typescript
return () => {
  if (scannerRef.current) {
    scannerRef.current.stop()
      .catch((err) => console.error('카메라 정지 실패:', err));
  }
};
```

**시정 마감**: 1일 이내

---

## 🟡 중요 이슈 (P1 - 우선 수정 필요)

### 4. **코드 중복: Session 타입 정의 중복** 🟡

**위치**:
- `moducon-backend/src/types/session.ts`
- `moducon-frontend/src/types/session.ts`

**문제점**:
- 백엔드-프론트엔드 간 동일 타입 정의 중복
- DRY 원칙 위반
- 향후 스키마 변경 시 2곳 수정 필요

**개선 방안**:
```bash
# 1. 공유 패키지 생성
moducon-shared/
  types/
    session.ts  # 공통 타입 정의

# 2. 양측에서 import
import { Session } from '@moducon/shared/types/session';
```

**또는 간단한 방법**:
```typescript
// 백엔드에서 타입 export
// 프론트엔드에서 API 응답 타입으로 활용
```

---

### 5. **성능 이슈: sessionStorage 사용** 🟡

**위치**: `moducon-frontend/src/lib/sessionCache.ts:11-12`

**문제점**:
```typescript
const cached = sessionStorage.getItem(CACHE_KEY);
const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);
```

**이슈**:
- sessionStorage는 탭 닫으면 데이터 삭제됨
- 새 탭에서 매번 API 호출 발생
- localStorage가 더 적합

**개선 방안**:
```typescript
// sessionStorage → localStorage 변경
const cached = localStorage.getItem(CACHE_KEY);
const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

// 또는 IndexedDB 사용 (더 나은 성능)
```

**근거**:
- 5분 캐싱 전략은 브라우저 세션 간에도 유효
- API 호출 최소화가 목표 (Google Sheets API 제한)

---

### 6. **접근성 이슈: QRFloatingButton 키보드 접근성 부족** 🟡

**위치**: `moducon-frontend/src/components/qr/QRFloatingButton.tsx:37-49`

**문제점**:
```tsx
<button
  onClick={() => setIsModalOpen(true)}
  aria-label="QR 코드 스캔하기"
>
```

**개선 필요**:
```tsx
<button
  onClick={() => setIsModalOpen(true)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsModalOpen(true);
    }
  }}
  aria-label="QR 코드 스캔하기"
  role="button"
  tabIndex={0}
>
```

---

### 7. **변수명 개선: 시간 파싱 함수 반환 타입** 🟡

**위치**: `moducon-backend/src/services/googleSheetsService.ts:130-137`

**문제점**:
```typescript
function parseTimeRange(timeRange: string): TimeRange | null {
  const match = timeRange.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
  if (!match) {
    console.warn(`Invalid time format: ${timeRange}`);
    return null;  // ❌ null 반환 시 에러 핸들링 부족
  }
  return { start: match[1], end: match[2] };
}

// 사용처에서 null 체크 부족
startTime: timeRange?.start || '',  // ⚠️ 빈 문자열 반환
```

**개선 방안**:
```typescript
function parseTimeRange(timeRange: string): TimeRange {
  const match = timeRange.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
  if (!match) {
    throw new Error(`Invalid time format: ${timeRange}`);
  }
  return { start: match[1], end: match[2] };
}

// 또는 기본값 반환
return { start: '00:00', end: '00:00' };
```

---

## 🟢 경미한 이슈 (P2 - 개선 권장)

### 8. **코드 스타일: Console.log 남아있음** 🟢

**위치**:
- `moducon-backend/src/services/googleSheetsService.ts:184`
- `moducon-frontend/src/app/sessions/page.tsx:27`

**개선 방안**:
```typescript
// logger 사용
import { logger } from '@/utils/logger';
logger.error('Google Sheets 데이터 가져오기 실패:', error);
```

---

### 9. **UX 개선: QRFloatingButton 툴팁 타이머 누락** 🟢

**위치**: `moducon-frontend/src/components/qr/QRFloatingButton.tsx:17`

**문제점**:
```typescript
const [showTooltip, setShowTooltip] = useState(true);
// ❌ 3초 후 자동 사라짐 미구현
```

**개선 방안**:
```typescript
useEffect(() => {
  const timer = setTimeout(() => setShowTooltip(false), 3000);
  return () => clearTimeout(timer);
}, []);
```

---

### 10. **Magic Number: 하드코딩된 값들** 🟢

**위치**: 여러 곳

**개선 대상**:
```typescript
// QRFloatingButton.tsx
const BUTTON_SIZE = 120;  // px
const PULSE_DURATION = 2000;  // ms
const TOOLTIP_DURATION = 3000;  // ms

// sessionCache.ts
const CACHE_DURATION_MS = 5 * 60 * 1000;

// QRScannerModal.tsx
const QR_BOX_SIZE = 250;  // px
const SCAN_FPS = 10;
```

---

## 📋 테스트 부족

### 누락된 테스트
1. ❌ **단위 테스트**: `googleSheetsService.ts` 함수들
2. ❌ **통합 테스트**: API 엔드포인트
3. ❌ **E2E 테스트**: QR 스캔 플로우
4. ❌ **접근성 테스트**: WCAG 준수

**권장 테스트**:
```typescript
// googleSheetsService.test.ts
describe('parseTimeRange', () => {
  it('정상 시간 파싱', () => {
    expect(parseTimeRange('10:10-10:50')).toEqual({
      start: '10:10',
      end: '10:50'
    });
  });

  it('잘못된 형식 에러', () => {
    expect(() => parseTimeRange('invalid')).toThrow();
  });
});

describe('calculateDifficulty', () => {
  it('고급 키워드 감지', () => {
    expect(calculateDifficulty(['딥테크', 'AI'])).toBe('고급');
  });
});
```

---

## 📝 문서-코드 정합성 검증

### ✅ 일치 항목
1. ✅ **QR 버튼 크기**: 120px (01_PRD.md ↔ QRFloatingButton.tsx)
2. ✅ **캐시 시간**: 5분 (02_TECHNICAL_REQUIREMENTS.md ↔ sessionCache.ts)
3. ✅ **가이드라인 크기**: 250px (01_PRD.md ↔ QRScannerModal.tsx)
4. ✅ **트랙 목록**: 5개 (PRD ↔ sessions/page.tsx)

### ⚠️ 불일치 항목
1. ⚠️ **Session 필드 수**:
   - PRD: 14개 필드 명시
   - types/session.ts: 14개 (일치)
   - googleSheetsService.ts: 10개 (❌ 4개 누락)
     - 누락: `pageUrl`, `speakerAffiliation`, `speakerBio`, `speakerProfile`

2. ⚠️ **에러 핸들링**:
   - PRD: "네트워크 오프라인 시 캐시 데이터 표시"
   - 구현: ❌ 오프라인 감지 로직 없음

---

## 🎯 우선순위별 수정 계획

### 🔴 P0 (즉시)
1. `.env` 파일 Git에서 제거 + 재생성
2. Session 타입 중복 정의 제거
3. QRScannerModal 카메라 클린업 개선

### 🟡 P1 (1-2일)
4. sessionStorage → localStorage 변경
5. 키보드 접근성 개선
6. parseTimeRange null 처리 개선
7. 테스트 코드 작성

### 🟢 P2 (개선 권장)
8. console.log → logger 교체
9. 툴팁 타이머 추가
10. Magic Number 상수화

---

## 📊 코드 메트릭스

### 신규 파일 (6개)
- ✅ `moducon-backend/src/types/session.ts`
- ⚠️ `moducon-backend/src/services/googleSheetsService.ts` (중복 타입 제거 필요)
- ✅ `moducon-frontend/src/types/session.ts`
- ⚠️ `moducon-frontend/src/lib/sessionCache.ts` (sessionStorage 개선 필요)
- ⚠️ `moducon-frontend/src/components/qr/QRFloatingButton.tsx` (툴팁 타이머 추가)
- ⚠️ `moducon-frontend/src/components/qr/QRScannerModal.tsx` (클린업 개선)

### 수정 파일 (4개)
- ⚠️ `moducon-backend/package.json` (axios 버전 확인 필요)
- ✅ `moducon-frontend/src/app/globals.css`
- ✅ `moducon-frontend/src/app/sessions/page.tsx`
- 🔴 `moducon-backend/.env` (즉시 제거)

### 코드 품질 점수
- **복잡도**: 낮음-중간
- **중복도**: 중간 (Session 타입 중복)
- **유지보수성**: 중간
- **보안성**: 🔴 낮음 (JWT Secret 노출)
- **테스트 커버리지**: 0%

---

## 🚨 재작업 필요 사유

1. **보안 취약점**: JWT Secret Git 노출 (Critical)
2. **타입 불일치**: Session 인터페이스 중복 정의
3. **테스트 부재**: 품질 검증 불가
4. **에러 처리 미비**: 카메라 클린업, null 체크

---

**다음 담당자**: hands-on worker

### 재작업 요청 사항

#### 🔴 즉시 수정 (필수)
1. `.env` 파일 Git에서 완전 제거 + `.env.example` 생성
2. `googleSheetsService.ts`에서 Session 타입 정의 삭제 (import 사용)
3. QRScannerModal 카메라 클린업 async 처리

#### 🟡 우선 수정 (권장)
4. sessionStorage → localStorage 변경
5. QRFloatingButton 키보드 접근성 개선
6. parseTimeRange 에러 핸들링 개선
7. 기본 테스트 코드 작성 (최소 parseTimeRange, calculateDifficulty)

#### 📝 문서 업데이트
8. 07_PROGRESS.md 업데이트 (재작업 현황 반영)
9. README.md에 보안 설정 가이드 추가

---

**검토 완료일**: 2025-11-30
**재검토 예정일**: 수정 후 즉시
