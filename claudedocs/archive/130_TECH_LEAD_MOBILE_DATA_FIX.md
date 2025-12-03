# 130_TECH_LEAD_MOBILE_DATA_FIX.md - 모바일 세션 데이터 로딩 문제 해결 계획

**작성일**: 2025-11-30
**작성자**: Technical Lead
**버전**: v1.0
**우선순위**: P0 (Critical)
**예상 작업 시간**: 3시간 30분

---

## 📋 Executive Summary

### 🎯 Overall Status: **Critical Issue Identified**

**핵심 문제**:
- ✅ **웹 (localhost)**: 정상 동작 (백엔드 API 연동 완료)
- ❌ **모바일 (GitHub Pages)**: 데이터 로딩 실패 (프로덕션 백엔드 미배포)
- ⚠️ **더미 데이터**: 코드에는 없음, 로딩 실패 시 에러 메시지 표시 중

**근본 원인**:
- `.env.production` 설정: `NEXT_PUBLIC_API_URL=https://api.moducon.vibemakers.kr`
- 해당 백엔드 서버 **미배포** 또는 **동작 불가** 상태
- 모바일에서는 Static Export된 프론트엔드만 GitHub Pages에서 서비스 중
- 백엔드 API 호출 실패 → 캐시 없음 → "자료가 없다고 뜹니다" 에러

---

## 🔍 문제 분석

### 1. 현재 아키텍처

```
[모바일 사용자]
     ↓
[GitHub Pages]
(moducon.vibemakers.kr)
     ↓ API Call
[❌ 백엔드 미배포]
(api.moducon.vibemakers.kr)
     ↓
[세션 데이터 로딩 실패]
```

### 2. 파일별 상태

| 파일 | 상태 | 비고 |
|------|------|------|
| `/home/page.tsx` | ✅ API 연동 완료 | 더미 데이터 없음, `fetchSessionsWithCache()` 사용 |
| `/sessions/page.tsx` | ✅ API 연동 완료 | Google Sheets 36개 세션 연동 |
| `sessionCache.ts` | ✅ 구조 완벽 | localStorage 캐싱, 오프라인 폴백 |
| `.env.production` | ⚠️ 백엔드 URL 잘못됨 | `api.moducon.vibemakers.kr` 미배포 |
| `moducon-backend` | ✅ 로컬 동작 중 | 36개 세션 API 정상 |

### 3. 에러 플로우

```typescript
// sessionCache.ts:45-56
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
// 프로덕션: https://api.moducon.vibemakers.kr (미배포)
// ↓
const response = await fetch(url);
// ❌ CORS 에러 또는 404 Not Found
// ↓
catch (error) {
  console.error('세션 로딩 실패:', error);
  // localStorage 캐시 없음 (최초 접속)
  // ↓
  throw error; // 상위로 전파
}
// ↓
// page.tsx:39-41
setError('세션 정보를 불러올 수 없습니다.');
```

---

## 💡 해결 방안

### Option 1: 정적 세션 데이터 (Static JSON) ⭐ **권장**

**개요**: Google Sheets 데이터를 정적 JSON 파일로 변환하여 프론트엔드에 포함

**장점**:
- ✅ **배포 단순**: 백엔드 배포 불필요
- ✅ **성능 우수**: CDN 캐싱, 빠른 로딩
- ✅ **오프라인 지원**: 100% 오프라인 동작
- ✅ **비용 절감**: 서버 불필요
- ✅ **즉시 적용 가능**: 3시간 내 완료

**단점**:
- ⚠️ 데이터 업데이트 시 재배포 필요
- ⚠️ 실시간 데이터 불가능 (행사 당일 변경 사항 즉시 반영 불가)

**구현 방법**:
1. Google Sheets 데이터를 `/public/data/sessions.json`으로 저장
2. `/public/data/booths.json`, `/public/data/papers.json` 동일 처리
3. `sessionCache.ts` 수정: API 호출 → JSON 파일 fetch
4. 빌드 시 정적 파일 포함 → GitHub Pages 배포

**예상 작업 시간**: 3시간 30분

---

### Option 2: 백엔드 배포 (Vercel/Railway)

**개요**: 기존 백엔드를 Vercel 또는 Railway에 배포

**장점**:
- ✅ **실시간 데이터**: 즉시 업데이트 가능
- ✅ **기존 API 활용**: 코드 수정 최소화
- ✅ **확장성**: 향후 기능 추가 용이

**단점**:
- ❌ **작업 시간 많음**: 최소 1-2일 (DB 설정, 배포 설정, 도메인 연결)
- ❌ **복잡도 증가**: 인프라 관리 필요
- ❌ **비용 발생**: DB 호스팅 비용
- ⚠️ **행사 임박 시 리스크**: 배포 문제 발생 시 대응 어려움

**예상 작업 시간**: 1-2일 (16-20시간)

---

### Option 3: Hybrid (Static + 백엔드 선택적 사용)

**개요**: 정적 JSON을 기본으로 사용하되, 백엔드 API가 있으면 우선 사용

**장점**:
- ✅ **최고의 안정성**: 백엔드 실패 시 정적 데이터 폴백
- ✅ **점진적 개선**: 정적 먼저 배포 → 백엔드 추후 추가
- ✅ **오프라인 지원**: 정적 데이터 항상 가능

**단점**:
- ⚠️ **복잡도 증가**: 두 가지 데이터 소스 관리
- ⚠️ **동기화 필요**: 정적 데이터와 백엔드 데이터 일치 보장

**예상 작업 시간**: 4시간 30분

---

## 🎯 최종 권장 방안: **Option 1 (정적 JSON)**

### 근거

1. **행사 임박**: 2025-12-13 행사 예정, 안정성 최우선
2. **데이터 특성**: 세션/부스/포스터는 행사 전 확정, 실시간 업데이트 불필요
3. **성능**: CDN 캐싱으로 최고 속도
4. **비용**: 무료 (GitHub Pages)
5. **작업 시간**: 3시간 30분 (즉시 착수 가능)

### 구현 상세 계획

#### Phase 1: 정적 데이터 생성 (1시간)

**1.1 Google Sheets 데이터 추출**
- 백엔드 `/data/sessions.ts` → JSON 변환
- 백엔드 `/data/booths.json` → 복사
- 백엔드 `/data/papers.json` → 복사

**1.2 정적 JSON 파일 생성**
```bash
# 디렉토리 생성
mkdir -p moducon-frontend/public/data

# 세션 데이터 생성
# moducon-frontend/public/data/sessions.json
```

**1.3 데이터 검증**
- JSON 형식 유효성 체크
- 필드 완전성 체크 (id, name, speaker, track, startTime, endTime, location 등)

#### Phase 2: API 클라이언트 수정 (1시간 30분)

**2.1 sessionCache.ts 수정**

```typescript
// Before (API 호출)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const url = `${API_URL}/api/sessions`;
const response = await fetch(url);

// After (정적 JSON)
const response = await fetch('/data/sessions.json');
if (!response.ok) {
  throw new Error(`데이터 로딩 실패: ${response.status}`);
}
const sessions = await response.json();
```

**2.2 boothCache.ts 생성**

```typescript
// /lib/boothCache.ts
export async function fetchBoothsWithCache(): Promise<Booth[]> {
  try {
    const cached = localStorage.getItem('moducon_booths');
    // ... 캐싱 로직

    const response = await fetch('/data/booths.json');
    const booths = await response.json();

    localStorage.setItem('moducon_booths', JSON.stringify(booths));
    return booths;
  } catch (error) {
    console.error('부스 로딩 실패:', error);
    throw error;
  }
}
```

**2.3 paperCache.ts 생성**

```typescript
// /lib/paperCache.ts
export async function fetchPapersWithCache(): Promise<Paper[]> {
  try {
    const cached = localStorage.getItem('moducon_papers');
    // ... 캐싱 로직

    const response = await fetch('/data/papers.json');
    const papers = await response.json();

    localStorage.setItem('moducon_papers', JSON.stringify(papers));
    return papers;
  } catch (error) {
    console.error('포스터 로딩 실패:', error);
    throw error;
  }
}
```

#### Phase 3: 빌드 및 테스트 (30분)

**3.1 로컬 빌드 테스트**
```bash
cd moducon-frontend
npm run build
# → out/ 디렉토리에 정적 파일 생성 확인
# → out/data/sessions.json, booths.json, papers.json 포함 확인
```

**3.2 로컬 서버 테스트**
```bash
npx serve out
# → http://localhost:3000 접속
# → /sessions, /booths, /papers 페이지 정상 동작 확인
# → localStorage 캐싱 동작 확인
```

**3.3 모바일 에뮬레이션 테스트**
- Chrome DevTools → Mobile 모드
- 네트워크 탭 확인 (API 호출 없음, JSON 파일 로딩 확인)
- 오프라인 모드 테스트

#### Phase 4: 배포 및 검증 (30분)

**4.1 Git Commit & Push**
```bash
git add .
git commit -m "feat: 정적 세션 데이터 적용 (모바일 데이터 로딩 문제 해결)

- Google Sheets 데이터를 정적 JSON으로 변환
- sessionCache.ts: API 호출 → JSON 파일 fetch
- boothCache.ts, paperCache.ts 생성
- 백엔드 의존성 제거, GitHub Pages 완전 호환
- 오프라인 지원 100%, 성능 최적화

Resolves: 모바일 뷰 데이터 로딩 실패 이슈"

git push origin feature/sessions-data
```

**4.2 GitHub Pages 배포 대기**
- GitHub Actions 워크플로우 실행 확인
- 배포 완료 (약 3-5분)

**4.3 프로덕션 검증**
- https://moducon.vibemakers.kr/sessions 접속
- 모바일 기기로 실제 접속 테스트
- 세션 36개 정상 표시 확인
- 부스 13개, 포스터 33개 정상 표시 확인

---

## 📊 작업 체크리스트

### Phase 1: 정적 데이터 생성 (1시간)
- [ ] `public/data/` 디렉토리 생성
- [ ] `public/data/sessions.json` 생성 (36개 세션)
- [ ] `public/data/booths.json` 생성 (13개 부스)
- [ ] `public/data/papers.json` 생성 (33개 포스터)
- [ ] JSON 형식 검증 (jq, JSON validator)

### Phase 2: API 클라이언트 수정 (1시간 30분)
- [ ] `src/lib/sessionCache.ts` 수정 (API → JSON)
- [ ] `src/lib/boothCache.ts` 생성
- [ ] `src/lib/paperCache.ts` 생성
- [ ] 캐싱 로직 유지 (localStorage, 5분 캐싱)
- [ ] 에러 핸들링 개선

### Phase 3: 빌드 및 테스트 (30분)
- [ ] 로컬 빌드 성공 (`npm run build`)
- [ ] Static Export 확인 (`out/data/*.json` 포함)
- [ ] 로컬 서버 테스트 (`npx serve out`)
- [ ] 모바일 에뮬레이션 테스트
- [ ] 오프라인 모드 테스트

### Phase 4: 배포 및 검증 (30분)
- [ ] Git Commit & Push
- [ ] GitHub Actions 워크플로우 성공 확인
- [ ] 프로덕션 URL 접속 테스트
- [ ] 모바일 기기 실제 테스트
- [ ] 세션/부스/포스터 데이터 정상 표시 확인

---

## 🎯 성공 지표

### 필수 (Must-Have)
- ✅ 모바일에서 세션 데이터 정상 로딩 (36개)
- ✅ 부스/포스터 데이터 정상 로딩 (13개 + 33개)
- ✅ "자료가 없다고 뜹니다" 에러 해결
- ✅ 오프라인 모드 100% 동작
- ✅ 빌드 시간 10초 이내

### 권장 (Should-Have)
- ✅ localStorage 캐싱 정상 동작 (5분)
- ✅ 네트워크 트래픽 최소화 (CDN 캐싱)
- ✅ 모바일 성능 최적화 (3초 이내 로딩)

### 선택 (Nice-to-Have)
- ⚠️ 백엔드 배포 (향후 개선)
- ⚠️ 실시간 데이터 업데이트 (향후 개선)

---

## ⚠️ 리스크 및 대응 방안

### 리스크 1: JSON 파일 크기 과다
**원인**: 36개 세션 + 13개 부스 + 33개 포스터 = ~100KB
**영향**: 초기 로딩 시간 증가
**대응**:
- gzip 압축 (GitHub Pages 자동 지원)
- 예상 크기: 100KB → 20KB (gzip)
- 모바일 4G: 0.2초 로딩

### 리스크 2: 데이터 업데이트 필요 시
**원인**: 행사 당일 세션 시간 변경 등
**영향**: 재배포 필요 (5-10분 소요)
**대응**:
- Git 브랜치 전략: `hotfix/session-update`
- CI/CD 파이프라인 자동화 (GitHub Actions)
- 백업 플랜: 공지사항으로 변경 안내

### 리스크 3: 캐시 무효화 실패
**원인**: localStorage 버전 관리 실패
**영향**: 구 데이터 표시
**대응**:
- `CACHE_VERSION` 증가 (`1.0` → `1.1`)
- localStorage 자동 무효화
- Hard Refresh 안내 (Ctrl + F5)

---

## 📈 예상 효과

### 성능 개선
- **초기 로딩**: 3-5초 → 1-2초 (60% 개선)
- **네트워크 요청**: API 호출 제거 → JSON 1회만
- **오프라인 지원**: 0% → 100%

### 안정성 개선
- **백엔드 의존성**: 100% → 0%
- **SPOF 제거**: API 서버 장애 영향 없음
- **배포 단순화**: 프론트엔드만 배포

### 비용 절감
- **서버 비용**: $0 (GitHub Pages 무료)
- **DB 비용**: $0 (정적 파일)
- **유지보수**: 최소화

---

## 📝 향후 개선 방안

### Phase 2: 백엔드 배포 (선택 사항)
- Vercel/Railway 배포
- PostgreSQL DB 설정
- 실시간 데이터 업데이트 기능
- Admin 패널 추가

### Phase 3: 고급 기능
- 세션 즐겨찾기
- 개인화 추천
- 실시간 혼잡도
- 푸시 알림

---

## 📋 결론

**최종 권장**: Option 1 (정적 JSON) 즉시 착수
**작업 시간**: 3시간 30분
**우선순위**: P0 (Critical)
**담당자**: hands-on worker
**검증자**: Technical Lead

**다음 단계**: `131_HANDOFF_TO_WORKER.md` 작성 → hands-on worker 인계

---

**작성 완료일**: 2025-11-30
**다음 검토일**: Phase 4 배포 완료 후
**담당자**: hands-on worker (즉시 착수)
