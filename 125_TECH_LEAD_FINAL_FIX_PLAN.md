# 125_TECH_LEAD_FINAL_FIX_PLAN - 최종 수정 계획서

**작성일**: 2025-11-30
**작성자**: Technical Lead
**문서 버전**: 1.0
**기준**: MODUCON_2025_FINAL_ANALYSIS.md (v2.0)
**브랜치**: `feature/sessions-data`

---

## 📋 Executive Summary

### 현황 분석
**최종 분석 보고서(MODUCON_2025_FINAL_ANALYSIS.md) 검토 결과**:
- ✅ **QR UI 개선**: 완료 (정가운데 배치, 원형 아이콘)
- ✅ **세션 API 연동**: 완료 (백엔드 `/api/sessions` 동작)
- ❌ **홈페이지 더미 데이터**: **미완료** (김철수, 이영희 등 하드코딩 남아있음)

### 문제점
**파일**: `moducon-frontend/src/app/home/page.tsx`
**라인**: 60-73
**내용**:
```typescript
{/* Mock Data */}
<div className="space-y-4">
  <div className="border-b pb-4 last:border-0">
    <h3 className="font-semibold">AI 시대의 프론트엔드 개발</h3>
    <p className="text-sm text-muted-foreground">
      김철수 • Track 1  ← 더미 데이터
    </p>
  </div>
  <div className="border-b pb-4 last:border-0">
    <h3 className="font-semibold">LLM을 활용한 챗봇 구축</h3>
    <p className="text-sm text-muted-foreground">
      이영희 • Track 2  ← 더미 데이터
    </p>
  </div>
</div>
```

### 핵심 이슈
1. **API 연동 미완료**: `/home/page.tsx`에서 API 호출 코드가 주석 처리됨
2. **더미 데이터 하드코딩**: 세션 데이터가 정적 HTML로 작성됨
3. **데이터 불일치**: 실제 Google Sheets 데이터(36개 세션)와 무관한 내용 표시

### 작업 목표
✅ **홈페이지에 실제 세션 데이터 표시** (다가오는 세션 3개)
✅ **더미 데이터 완전 제거** (김철수, 이영희 등)
✅ **API 기반 동적 로딩 구현**

---

## 🎯 작업 계획

### Phase 1: 세션 데이터 API 연동 (1시간 30분)

#### Step 1: API 함수 확인 및 수정 (30분)

**1.1 sessionCache.ts 검토**
```bash
# 파일 위치
moducon-frontend/src/lib/sessionCache.ts
```

**확인 사항**:
- ✅ API 엔드포인트 올바른지 확인
- ✅ 응답 데이터 형식 검증
- ✅ 에러 핸들링 로직 확인
- ✅ localStorage 캐싱 동작 확인

**예상 함수**:
```typescript
export async function getSessions(track?: string): Promise<Session[]>
export async function getSessionById(id: string): Promise<Session | null>
```

#### Step 2: home/page.tsx 수정 (1시간)

**2.1 Import 추가**
```typescript
import { getSessions } from '@/lib/sessionCache';
import type { Session } from '@/types';
```

**2.2 State 추가**
```typescript
const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
const [error, setError] = useState<string | null>(null);
```

**2.3 useEffect 수정**
```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 실제 API 호출
      const allSessions = await getSessions();

      // 현재 시간 기준으로 다가오는 세션 3개 선택
      const now = new Date();
      const upcoming = allSessions
        .filter(session => {
          // 세션 시작 시간이 현재 시간 이후인 것만
          const sessionTime = parseSessionTime(session.startTime);
          return sessionTime > now;
        })
        .sort((a, b) => {
          // 시작 시간 기준 오름차순 정렬
          const timeA = parseSessionTime(a.startTime);
          const timeB = parseSessionTime(b.startTime);
          return timeA.getTime() - timeB.getTime();
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

**2.4 시간 파싱 유틸 함수 추가**
```typescript
// moducon-frontend/src/lib/utils.ts 또는 home/page.tsx 내부
function parseSessionTime(timeStr: string): Date {
  // timeStr 형식: "10:10" 또는 "14:30"
  const [hour, minute] = timeStr.split(':').map(Number);
  const now = new Date();
  const sessionDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);

  // 행사일: 2025년 12월 13일 (토)
  // 개발 중에는 현재 날짜 사용, 프로덕션에서는 행사일로 변경
  // const eventDate = new Date(2025, 11, 13); // 12월은 11
  // sessionDate.setFullYear(2025, 11, 13);

  return sessionDate;
}
```

**2.5 UI 렌더링 수정**
```typescript
<CardContent>
  {error ? (
    <p className="text-sm text-destructive">{error}</p>
  ) : upcomingSessions.length === 0 ? (
    <p className="text-sm text-muted-foreground">
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

### Phase 2: 테스트 및 검증 (30분)

#### Step 1: 로컬 테스트 (15분)

**1.1 백엔드 실행**
```bash
cd moducon-backend
npm run dev
# → http://localhost:3001 실행 확인
```

**1.2 API 엔드포인트 테스트**
```bash
curl http://localhost:3001/api/sessions | jq
# → 36개 세션 데이터 반환 확인
```

**1.3 프론트엔드 실행**
```bash
cd moducon-frontend
npm run dev
# → http://localhost:3000/home 접속
```

**1.4 동작 확인**
- [ ] 홈페이지에서 "다가오는 세션" 섹션 확인
- [ ] 더미 데이터(김철수, 이영희) 제거 확인
- [ ] 실제 세션 데이터 3개 표시 확인
- [ ] 세션 이름, 연사, 트랙, 시간, 장소 정보 정확성 확인

#### Step 2: 에러 케이스 테스트 (15분)

**2.1 백엔드 중단 시**
```bash
# 백엔드 종료 후 프론트엔드 새로고침
# → 에러 메시지 표시 확인
# → localStorage 캐시 데이터 사용 확인 (sessionCache.ts 로직)
```

**2.2 네트워크 오류 시뮬레이션**
```bash
# 브라우저 DevTools → Network → Offline 모드
# → 에러 핸들링 확인
# → 사용자에게 명확한 오류 메시지 표시 확인
```

**2.3 빈 데이터 케이스**
```typescript
// sessionCache.ts에서 빈 배열 반환 시나리오
// → "다가오는 세션이 없습니다" 메시지 확인
```

---

### Phase 3: 코드 품질 개선 (30분)

#### Step 1: TypeScript 타입 검증 (10분)

**파일 확인**:
```bash
# Session 타입 정의 확인
moducon-frontend/src/types/index.ts
```

**예상 타입**:
```typescript
export interface Session {
  id: string;          // 세션 ID (예: "00-00")
  name: string;        // 세션명
  track: string;       // 트랙 (예: "Track 00")
  startTime: string;   // 시작 시간 (예: "10:10")
  endTime: string;     // 종료 시간 (예: "10:50")
  location: string;    // 장소
  speaker: string;     // 연사
  difficulty: '초급' | '중급' | '고급';
  description: string; // 설명
  hashtags: string[];  // 해시태그
}
```

#### Step 2: ESLint 및 Prettier 검사 (10분)

```bash
cd moducon-frontend
npm run lint
npm run format
```

**수정 대상**:
- Unused imports 제거
- Console.log 제거 또는 에러 로깅으로 변경
- 코드 포맷팅 일관성 유지

#### Step 3: 빌드 테스트 (10분)

```bash
cd moducon-frontend
npm run build
# → 0 errors 확인
# → 빌드 성공 확인
```

---

### Phase 4: Git 커밋 및 문서화 (30분)

#### Step 1: Git 커밋 (15분)

**브랜치 전략**:
```bash
# 현재 브랜치: feature/sessions-data
git status
git add moducon-frontend/src/app/home/page.tsx
git add moducon-frontend/src/lib/utils.ts  # 시간 파싱 함수 추가한 경우
```

**커밋 메시지**:
```bash
git commit -m "fix(home): 홈페이지 세션 데이터 더미 제거 및 실제 API 연동

- 더미 데이터(김철수, 이영희) 완전 제거
- getSessions() API 호출로 실제 세션 데이터 로딩
- 다가오는 세션 3개 동적 표시 (시간 기준 정렬)
- 에러 핸들링 추가 (네트워크 오류, 빈 데이터)
- parseSessionTime() 유틸 함수 추가

테스트:
- 백엔드 API 연동 동작 확인
- 36개 세션 중 다가오는 3개 정확히 표시
- 에러 케이스 핸들링 검증
- 프론트엔드 빌드 성공 (0 errors)

관련 문서:
- claudedocs/MODUCON_2025_FINAL_ANALYSIS.md (요구사항 #2)
- 102_TECH_LEAD_IMPLEMENTATION_PLAN.md (Step 3)"
```

#### Step 2: PROGRESS 업데이트 (15분)

**파일**: `07_PROGRESS.md`

**추가 내용**:
```markdown
## 2025-11-30: 세션 데이터 실제 연동 완료

### 완료 작업
1. ✅ 홈페이지 더미 데이터 제거 (`/home/page.tsx`)
   - 더미 데이터(김철수, 이영희) 완전 삭제
   - 실제 API 기반 동적 로딩 구현

2. ✅ 다가오는 세션 3개 표시
   - 현재 시간 기준 필터링
   - 시작 시간 오름차순 정렬
   - 세션 정보 완전 표시 (이름, 연사, 트랙, 시간, 장소)

3. ✅ 에러 핸들링 강화
   - 네트워크 오류 시 명확한 에러 메시지
   - 빈 데이터 케이스 처리
   - localStorage 캐시 폴백

### 기술 구현
- **파일 수정**: `moducon-frontend/src/app/home/page.tsx`
- **API 함수**: `getSessions()` from `sessionCache.ts`
- **타입 정의**: `Session` interface
- **유틸 함수**: `parseSessionTime()` (시간 파싱)

### 테스트 결과
- ✅ 백엔드 API 연동 동작 (36개 세션)
- ✅ 홈페이지 실제 데이터 표시
- ✅ 더미 데이터 0개 (완전 제거)
- ✅ 에러 핸들링 동작
- ✅ 프론트엔드 빌드 성공 (0 errors)

### 다음 단계
- QR UI 툴팁 개선 (선택 사항)
- 세션 즐겨찾기 기능 (선택 사항)
```

---

## 📊 완료 후 예상 성과

### PRD 충족도
| 항목 | 현재 | 완료 후 |
|------|------|---------|
| **세션 관리** | 85% | **100%** |
| **데이터 품질** | 70% (더미 데이터) | **100%** (실제 데이터) |
| **사용자 경험** | B (혼란 발생) | **A** (명확한 정보) |

### 기술 품질
| 항목 | 현재 | 완료 후 |
|------|------|---------|
| 코드 품질 | 90/100 | **93/100** |
| 기능 완성도 | 93/100 | **97/100** |
| Overall Score | 89/100 (B+) | **94/100 (A)** |

---

## 🚨 리스크 및 대응

### 리스크 1: 세션 시간 형식 불일치
**확률**: Medium
**영향**: Medium
**대응**:
- Google Sheets 시트 확인하여 정확한 시간 형식 파악
- `parseSessionTime()` 함수에서 다양한 형식 지원 (예: "10:10", "10:10:00")

### 리스크 2: 다가오는 세션이 0개인 경우
**확률**: High (행사 종료 후)
**영향**: Low
**대응**:
- "다가오는 세션이 없습니다" 메시지 표시 (이미 구현됨)
- 최근 종료된 세션 표시 (선택 사항)

### 리스크 3: 백엔드 API 장애
**확률**: Low
**영향**: High
**대응**:
- localStorage 캐시 폴백 (sessionCache.ts에 이미 구현됨)
- 에러 메시지 표시 및 재시도 버튼 제공

---

## ✅ Definition of Done (DoD)

### 기능 요구사항
- [ ] 홈페이지 "다가오는 세션" 섹션에 실제 데이터 표시
- [ ] 더미 데이터(김철수, 이영희) 완전 제거
- [ ] 다가오는 세션 3개 표시 (시간 기준 정렬)
- [ ] 세션 정보 완전 표시 (이름, 연사, 트랙, 시간, 장소)

### 기술 요구사항
- [ ] TypeScript 컴파일 0 errors
- [ ] ESLint 0 errors
- [ ] 프론트엔드 빌드 성공 (`npm run build`)
- [ ] API 연동 동작 확인 (백엔드 실행 시)

### 에러 핸들링
- [ ] 네트워크 오류 시 에러 메시지 표시
- [ ] 빈 데이터 케이스 처리
- [ ] localStorage 캐시 폴백 동작

### 문서 요구사항
- [ ] Git 커밋 완료 (커밋 컨벤션 준수)
- [ ] 07_PROGRESS.md 업데이트
- [ ] 126_HANDOFF_TO_WORKER.md 작성

---

## 📚 참고 자료

### 내부 문서
1. **최종 분석**: `claudedocs/MODUCON_2025_FINAL_ANALYSIS.md` (v2.0)
2. **구현 계획**: `102_TECH_LEAD_IMPLEMENTATION_PLAN.md`
3. **PRD**: `01_PRD.md` (v1.7)
4. **진행 상황**: `07_PROGRESS.md`
5. **API 명세**: `05_API_SPEC.md`

### 코드 파일
1. **홈페이지**: `moducon-frontend/src/app/home/page.tsx`
2. **세션 캐시**: `moducon-frontend/src/lib/sessionCache.ts`
3. **타입 정의**: `moducon-frontend/src/types/index.ts`
4. **세션 페이지**: `moducon-frontend/src/app/sessions/page.tsx` (참고용)

### 외부 리소스
1. **Google Sheets**: https://docs.google.com/spreadsheets/d/1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g/edit?gid=1035988542#gid=1035988542

---

## 🔄 Next Steps

### Immediate (즉시)
1. **hands-on worker** 착수
   - home/page.tsx 수정
   - API 연동 구현
   - 테스트 및 검증

### Short-term (선택 사항)
1. **QR UI 툴팁 개선** (30분)
   - "세션·부스·포스터 체크인" 상세 설명 추가

2. **세션 즐겨찾기 기능** (2시간)
   - localStorage 기반 즐겨찾기 구현
   - 홈페이지에 즐겨찾기 세션 표시

### Long-term (향후)
1. **퀘스트 시스템 MVP** (1주)
2. **실시간 혼잡도** (6시간)
3. **배지/포인트 시스템** (3일)

---

**작성 완료**: 2025-11-30
**다음 담당자**: hands-on worker
**다음 문서**: 126_HANDOFF_TO_WORKER.md
**예상 완료 시간**: 2시간 30분
