# 93_TECH_LEAD_REQUIREMENTS_ANALYSIS - 기술 리드 요구사항 분석

**작성일**: 2025-11-28
**작성자**: Technical Lead
**문서 버전**: 1.0
**기준 문서**: [가이드]모두콘 컨퍼런스 북 제작, PRD v1.6, 07_PROGRESS.md, 92_MODUCON_FINAL_ANALYSIS.md

---

## 📋 Executive Summary

### 현황 파악
- **프로젝트 상태**: 프로덕션 배포 완료 (A 93/100)
- **구현 완성도**: 기본 기능 85%, 고급 기능 0%
- **PRD 대비 달성률**: 51% (P0 필수 기능 기준)
- **주요 격차**: 퀘스트 시스템, 실시간 기능, 네트워킹 등 미구현

### 신규 요구사항 (2025-11-28)
1. ✅ **QR 코드 기능 개선**: 세션/부스/포스터 QR 스캔 → 자동 라우팅
2. ✅ **세션 실제 데이터 적용**: Google Sheets 연동
3. ⚠️ **메인 로고 링크 수정**: `/` → `/home/` 이동
4. ✅ **Git 관리**: 체계적 커밋 및 브랜치 관리

### 우선순위 판단
- **Immediate (당일)**: 메인 로고 링크 수정, QR 기능 검증
- **Short-term (1주)**: PRD High Priority 3개 항목 (퀘스트 MVP, 혼잡도, 세션 타임테이블)
- **Long-term (행사 후)**: 네트워킹, 알림, PWA 완성

---

## 🔍 현황 상세 분석

### 1. 프로젝트 구조
```
moducon/
├── moducon-frontend/          # Next.js 14 PWA
│   ├── src/
│   │   ├── app/
│   │   │   ├── (mobile)/     # 모바일 전용 페이지
│   │   │   ├── booths/        # 부스 목록/상세
│   │   │   ├── papers/        # 포스터 목록/상세
│   │   │   ├── sessions/      # 세션 (더미 데이터)
│   │   │   ├── home/          # 홈 대시보드
│   │   │   ├── login/         # 로그인
│   │   │   └── signature/     # 서명 (완료)
│   │   ├── components/        # 공통 컴포넌트
│   │   ├── lib/               # API 클라이언트
│   │   └── store/             # Zustand 상태 관리
├── moducon-backend/           # Express + TypeScript
│   ├── src/
│   │   ├── routes/            # API 라우트
│   │   ├── controllers/       # 비즈니스 로직
│   │   ├── middleware/        # JWT, 인증
│   │   └── services/          # 외부 서비스 (Google Sheets)
└── documents/                 # 기획 문서 92개
```

### 2. 기술 스택 확정
| 영역 | 기술 | 상태 | 비고 |
|------|------|------|------|
| **Frontend** | Next.js 14, React 18, TypeScript | ✅ 구현 완료 | Static Export, shadcn/ui |
| **Backend** | Express, TypeScript, Prisma ORM | ✅ 구현 완료 | PostgreSQL, JWT 인증 |
| **Database** | PostgreSQL 16 | ✅ 운영 중 | 16개 테이블, 마이그레이션 완료 |
| **Data Source** | Google Sheets MCP | ✅ 연동 완료 | 부스 13개, 포스터 33개 |
| **Deployment** | GitHub Pages (Frontend) | ✅ 배포 완료 | moducon.vibemakers.kr |
| **PWA** | Service Worker, Manifest | ⚠️ 부분 구현 | manifest.json 존재, SW 미구현 |
| **Real-time** | WebSocket | ❌ 미구현 | PRD 요구사항 |

### 3. 구현된 기능 (완료)
#### ✅ P0 - 사용자 인증 (100%)
- [x] QR 접속 → 로그인 → 서명 플로우 완성
- [x] 이름 + 전화번호 뒷 4자리 인증
- [x] JWT 세션 관리 (Bearer Token)
- [x] 디지털 서명 (Canvas 기반)
- [x] 관리자 페이지 (사용자 목록, 서명 확인)

#### ✅ P0 - 부스 & 포스터 (85%)
- [x] Google Sheets 실시간 연동
  - 부스: 13개 (클라비, K-HP, 아이펠, NVIDIA LAB 등)
  - 포스터: 33개 (CVPR, ICCV, ACL, EMNLP 국제학회 논문)
- [x] 부스/포스터 목록 페이지 (검색, 필터)
- [x] 상세 페이지 (설명, 기술, 해시태그)
- [x] QR 스캔 자동 라우팅
- [ ] 방문 기록 시스템 (백엔드 API 미구현)
- [ ] 퀴즈/인증 기능 (미구현)

#### ⚠️ P0 - 세션 & 공간 (20%)
- [x] `/sessions` 페이지 구조 존재
- [ ] 실제 세션 데이터 (더미 데이터)
- [ ] 6개 트랙별 타임테이블 (미구현)
- [ ] 세션 체크인 기능 (미구현)
- [ ] 실시간 혼잡도 표시 (미구현)
- [ ] 실내 지도 (미구현)

### 4. 미구현 기능 (갭 분석)
#### ❌ P0 - 개인화 퀘스트 (0%)
**PRD 요구사항**:
- 관심 분야 선택 (최대 3개)
- 관심사별 관련도 스코어링 (LAB 부스, 페이퍼샵)
- 동선 최적화 → 개인화 퀘스트 리스트 (3~5개 LAB + 1~2개 페이퍼샵)
- QR 스캔 인증 시스템
- 히든 퀘스트 (포토존, 휴게실, 식음료존 QR)
- 진행 상황 추적 (프로그레스 바, 체크리스트)

**현황**: 전혀 구현되지 않음

**영향**:
- PRD 핵심 UVP 미실현
- 참가자 능동적 참여 유도 불가
- Success Criteria 달성 불가 (퀘스트 완료율 60% 목표)

#### ❌ P1 - 네트워킹 (0%)
**PRD 요구사항**:
- 내 프로필 설정 (이름, 직무, 관심사, 한 줄 소개)
- 프로필 QR 공유
- 관심사 기반 매칭 추천

**현황**: 미구현

#### ❌ P1 - 활동 기록 (0%)
**PRD 요구사항**:
- 참석한 세션, 방문한 부스, 완료한 퀘스트 타임라인
- 포인트/배지 획득 시스템
- 10주년 기념 배지, 앱 소스코드 보상

**현황**: 미구현

#### ❌ P1 - 알림 & 푸시 (0%)
**PRD 요구사항**:
- 세션 시작 15분 전 알림
- 퀘스트 추천 알림
- 관심 공간 혼잡도 알림

**현황**: Push Notification API 미구현

---

## 📊 신규 요구사항 상세 분석

### 요구사항 1: QR 코드 기능 개선 ✅
**요구**: 휴대폰 후방 카메라로 세션/부스/포스터 QR 스캔 → 자동 라우팅

**현재 구현 상태**:
```typescript
// moducon-frontend/src/components/QRScanner.tsx
- html5-qrcode 라이브러리 사용
- facingMode: "environment" (후방 카메라)
- 스캔 성공 시 onScanSuccess 콜백 실행

// 자동 라우팅 로직 (추정)
if (qrData.includes('session')) router.push(`/sessions/${id}`);
if (qrData.includes('booth')) router.push(`/booths/${id}`);
if (qrData.includes('paper')) router.push(`/papers/${id}`);
```

**검증 필요 사항**:
1. QR 코드 데이터 형식 정의 (예: `moducon://session/1`, `moducon://booth/클라비`)
2. 실제 QR 코드 생성 여부 (백엔드 API 또는 관리자 페이지)
3. 라우팅 실패 시 에러 핸들링
4. 모바일 브라우저 카메라 권한 요청 UX

**개선 작업** (예상 2시간):
- [ ] QR 데이터 파싱 로직 명확화
- [ ] 에러 핸들링 강화 (잘못된 QR, 네트워크 오류)
- [ ] 스캔 성공 피드백 (햅틱, 사운드, 비주얼)
- [ ] 관리자 페이지에서 QR 코드 생성 기능 추가

---

### 요구사항 2: 세션 실제 데이터 적용 ✅
**요구**: Google Sheets 세션 정보를 프론트엔드에 연동

**데이터 소스**:
```
https://docs.google.com/spreadsheets/d/1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g/edit?gid=1035988542#gid=1035988542
```

**필요 정보**:
- 세션 이름
- 트랙 (6개 트랙)
- 시간 (시작/종료)
- 장소
- 연사
- 난이도 (초급/중급/고급)
- 설명

**구현 방식** (예상 4시간):
1. **Google Sheets MCP 활용** (기존 부스/포스터와 동일)
   ```typescript
   // moducon-backend/src/services/googleSheets.ts
   export async function getSessionsData() {
     const rows = await sheets.spreadsheets.values.get({
       spreadsheetId: SPREADSHEET_ID,
       range: 'Sessions!A2:H100', // 헤더 제외
     });
     return rows.data.values?.map(row => ({
       id: row[0],
       name: row[1],
       track: row[2],
       startTime: row[3],
       endTime: row[4],
       location: row[5],
       speaker: row[6],
       difficulty: row[7],
       description: row[8],
     }));
   }
   ```

2. **백엔드 API 엔드포인트**
   ```typescript
   // moducon-backend/src/routes/sessions.ts
   router.get('/api/sessions', async (req, res) => {
     const sessions = await getSessionsData();
     res.json({ success: true, data: sessions });
   });

   router.get('/api/sessions/:id', async (req, res) => {
     const sessions = await getSessionsData();
     const session = sessions.find(s => s.id === req.params.id);
     res.json({ success: true, data: session });
   });
   ```

3. **프론트엔드 연동**
   ```typescript
   // moducon-frontend/src/app/sessions/page.tsx
   'use client';
   import useSWR from 'swr';

   export default function SessionsPage() {
     const { data, error } = useSWR('/api/sessions', fetcher);

     // 트랙별 필터링
     const [selectedTrack, setSelectedTrack] = useState('all');
     const filteredSessions = data?.data.filter(
       s => selectedTrack === 'all' || s.track === selectedTrack
     );

     return (
       <div>
         <TrackFilter onChange={setSelectedTrack} />
         <SessionList sessions={filteredSessions} />
       </div>
     );
   }
   ```

**작업 순서**:
1. Google Sheets 시트 구조 확인 및 매핑 (30분)
2. 백엔드 서비스 함수 작성 (1시간)
3. API 엔드포인트 구현 (30분)
4. 프론트엔드 페이지 구현 (1시간)
5. 테스트 및 검증 (1시간)

---

### 요구사항 3: 메인 로고 링크 수정 ⚠️
**요구**: 메인 로고 클릭 시 `/` → `/home/` 이동

**현재 구현 추정**:
```typescript
// moducon-frontend/src/components/Header.tsx 또는 layout.tsx
<Link href="/">
  <img src="/logo.svg" alt="모두콘 2025" />
</Link>
```

**수정 내용** (예상 5분):
```typescript
<Link href="/home/">
  <img src="/logo.svg" alt="모두콘 2025" />
</Link>
```

**영향 분석**:
- **변경 범위**: Header 컴포넌트 1개 파일
- **리스크**: 매우 낮음 (단순 URL 변경)
- **테스트 필요**:
  - 로그인 전/후 동작 확인
  - 모바일/데스크톱 브라우저 확인
  - 뒤로 가기 버튼 동작 확인

**작업 순서**:
1. Header 컴포넌트 파일 찾기 (Grep)
2. href 속성 수정
3. 빌드 및 테스트
4. Git 커밋

---

### 요구사항 4: Git 관리 ✅
**요구**: 체계적인 커밋 및 브랜치 관리

**현재 Git 상태**:
```bash
Branch: main
Commits: 39개
Status: Clean (ahead of origin/main by 4 commits)
```

**Git 전략 수립**:
1. **브랜치 전략**:
   ```
   main                # 프로덕션 배포 브랜치
   ├── feature/qr-improvements   # QR 기능 개선
   ├── feature/sessions-data     # 세션 데이터 연동
   └── feature/quest-mvp         # 퀘스트 MVP (향후)
   ```

2. **커밋 컨벤션**:
   ```
   feat: 새로운 기능 추가
   fix: 버그 수정
   docs: 문서 수정
   style: 코드 포맷팅 (기능 변경 없음)
   refactor: 코드 리팩토링
   test: 테스트 코드
   chore: 빌드, 설정 파일 수정

   예시:
   feat(sessions): Google Sheets 세션 데이터 연동
   fix(header): 메인 로고 링크를 /home/으로 수정
   docs: 93_TECH_LEAD_REQUIREMENTS_ANALYSIS.md 작성
   ```

3. **커밋 단위**:
   - 1개 요구사항 = 1개 feature 브랜치
   - 1개 논리적 작업 단위 = 1개 커밋
   - 큰 작업은 여러 커밋으로 분할 (WIP 커밋 허용)

4. **PR 프로세스**:
   - Feature 브랜치 → main PR 생성
   - 코드 리뷰 (자체 검토 또는 팀 리뷰)
   - Squash Merge 권장
   - PR 설명에 변경 사항, 테스트 결과 명시

---

## 🎯 PRD High Priority 갭 분석

### 92_MODUCON_FINAL_ANALYSIS.md 기준 High Priority 3개

#### 1. 퀘스트 시스템 (MVP)
**예상 개발 시간**: 8시간

**MVP 범위**:
- 관심사 선택 (3개)
- 단순 부스 방문 체크리스트 (5개 추천)
- QR 스캔 인증
- 진행률 표시 (프로그레스 바)

**구현 계획**:
```typescript
// 1. 온보딩: 관심사 선택 (1시간)
// moducon-frontend/src/app/onboarding/page.tsx
const interests = ['생성 AI', '컴퓨터 비전', 'NLP/LLM', '로보틱스', 'MLOps', '데이터 엔지니어링'];
<MultiSelect max={3} options={interests} />

// 2. 퀘스트 생성 (2시간)
// moducon-backend/src/services/quest.ts
function generateQuest(interests: string[], booths: Booth[]) {
  // 관심사별 관련도 점수 계산 (해시태그 매칭)
  const scored = booths.map(booth => ({
    ...booth,
    score: calculateRelevance(booth.tags, interests)
  }));

  // 상위 5개 추천
  return scored.sort((a, b) => b.score - a.score).slice(0, 5);
}

// 3. QR 인증 (2시간)
// moducon-backend/src/routes/quest.ts
router.post('/api/quest/:boothId/checkin', authenticate, async (req, res) => {
  const { userId } = req.user;
  const { boothId } = req.params;

  await db.questProgress.create({
    data: { userId, boothId, checkedInAt: new Date() }
  });

  // 진행률 계산
  const progress = await getQuestProgress(userId);
  res.json({ success: true, progress });
});

// 4. 진행률 UI (2시간)
// moducon-frontend/src/app/quest/page.tsx
<ProgressBar value={completedCount} max={totalCount} />
<QuestList quests={quests} onCheckin={handleCheckin} />

// 5. 테스트 (1시간)
```

**데이터베이스 스키마** (이미 존재):
```sql
-- 07_PROGRESS.md 참고: 16개 테이블 중 quests 관련 테이블 확인 필요
CREATE TABLE quests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  booth_ids INTEGER[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE quest_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  booth_id INTEGER,
  checked_in_at TIMESTAMP,
  UNIQUE(user_id, booth_id)
);
```

---

#### 2. 실시간 혼잡도 (간소화)
**예상 개발 시간**: 6시간

**MVP 범위**:
- 체크인 데이터 기반 혼잡도 계산
- 부스/세션별 🟢🟡🟠🔴 표시
- 30초 간격 자동 업데이트

**구현 계획**:
```typescript
// 1. 백엔드: 혼잡도 계산 (2시간)
// moducon-backend/src/services/crowdLevel.ts
interface CrowdLevel {
  locationId: string;
  locationType: 'session' | 'booth';
  currentCount: number;
  capacity: number;
  level: '🟢' | '🟡' | '🟠' | '🔴';
  updatedAt: Date;
}

async function calculateCrowdLevel(locationId: string, type: string): Promise<CrowdLevel> {
  // 최근 5분간 체크인 수 조회
  const count = await db.checkins.count({
    where: {
      locationId,
      locationType: type,
      checkedInAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }
    }
  });

  // 혼잡도 레벨 계산
  const capacity = getLocationCapacity(locationId, type);
  const ratio = count / capacity;
  const level = ratio < 0.3 ? '🟢' : ratio < 0.6 ? '🟡' : ratio < 0.85 ? '🟠' : '🔴';

  return { locationId, locationType: type, currentCount: count, capacity, level, updatedAt: new Date() };
}

// 2. API 엔드포인트 (1시간)
router.get('/api/crowd-levels', async (req, res) => {
  const sessions = await Promise.all(
    SESSION_IDS.map(id => calculateCrowdLevel(id, 'session'))
  );
  const booths = await Promise.all(
    BOOTH_IDS.map(id => calculateCrowdLevel(id, 'booth'))
  );

  res.json({ success: true, data: { sessions, booths } });
});

// 3. 프론트엔드: 실시간 업데이트 (2시간)
// moducon-frontend/src/app/sessions/page.tsx
import useSWR from 'swr';

export default function SessionsPage() {
  const { data } = useSWR('/api/crowd-levels', fetcher, {
    refreshInterval: 30000, // 30초마다 갱신
  });

  return (
    <div>
      {data?.data.sessions.map(session => (
        <SessionCard key={session.locationId}>
          <CrowdBadge level={session.level} count={session.currentCount} />
        </SessionCard>
      ))}
    </div>
  );
}

// 4. 테스트 (1시간)
```

**고려 사항**:
- 용량(capacity) 데이터는 Google Sheets 또는 하드코딩
- 체크인 시스템이 없으면 혼잡도 계산 불가 → 체크인 API 우선 구현 필요
- WebSocket 대신 polling으로 간소화 (30초 간격)

---

#### 3. 세션 타임테이블 (기본)
**예상 개발 시간**: 4시간 (요구사항 2와 중복)

**MVP 범위**:
- 6개 트랙 세션 정보 표시
- 시간, 장소, 연사, 제목
- 필터 기능 (트랙별, 시간대별)

**이미 요구사항 2에서 커버됨**

---

## 📈 구현 우선순위 (Technical Lead 권고)

### Phase 1: Immediate Fixes (당일, 2시간)
**목표**: 신규 요구사항 3개 처리

| 순위 | 작업 | 예상 시간 | 담당자 |
|------|------|----------|--------|
| 1 | **메인 로고 링크 수정** | 5분 | hands-on worker |
| 2 | **QR 기능 검증** | 1시간 | hands-on worker |
| 3 | **세션 데이터 연동** | 4시간 | hands-on worker |
| - | **Git 커밋** | 30분 | hands-on worker |

**완료 기준**:
- 메인 로고 클릭 시 `/home/` 이동 확인
- QR 스캔 → 자동 라우팅 정상 동작
- 세션 페이지에 실제 데이터 표시
- Feature 브랜치 별도 커밋 완료

---

### Phase 2: High Priority (1주, 18시간)
**목표**: PRD 핵심 UVP 최소 실현

| 순위 | 작업 | 예상 시간 | 담당자 |
|------|------|----------|--------|
| 1 | **퀘스트 MVP** | 8시간 | hands-on worker |
| 2 | **실시간 혼잡도** | 6시간 | hands-on worker |
| 3 | **체크인 시스템** | 4시간 | hands-on worker |

**완료 기준**:
- 퀘스트 생성 → QR 인증 → 진행률 표시 플로우 완성
- 부스/세션 혼잡도 실시간 표시
- 세션 체크인 기능 동작

**PRD 달성률**: 51% → 70% (예상)

---

### Phase 3: Medium Priority (행사 전, 14시간)
**목표**: 참여 경험 향상

| 순위 | 작업 | 예상 시간 |
|------|------|----------|
| 1 | **내 활동 기록** | 5시간 |
| 2 | **배지/포인트 시스템** | 6시간 |
| 3 | **SNS 공유** | 3시간 |

---

### Phase 4: Low Priority (행사 후)
- 오프라인 지도
- 네트워킹 기능
- PWA 완성 (Service Worker)

---

## 🛠️ 기술적 고려사항

### 1. Google Sheets MCP 활용 전략
**현재 구현**:
```typescript
// moducon-backend/src/services/googleSheets.ts
- getBoothsData(): 부스 13개 연동 ✅
- getPapersData(): 포스터 33개 연동 ✅
- getSessionsData(): 미구현 ❌
```

**확장 계획**:
- 세션 데이터 시트 추가
- 캐싱 전략 (5분 TTL)
- 에러 핸들링 강화

### 2. 데이터베이스 최적화
**현재 상태**:
- PostgreSQL 16, Prisma ORM
- 16개 테이블, 마이그레이션 완료
- Connection Pooling (limit=20)

**추가 필요**:
- 퀘스트 진행 상황 인덱스
- 혼잡도 계산용 체크인 인덱스
- 세션 타임테이블 캐싱

### 3. 프론트엔드 성능
**현재**:
- 빌드 시간: 9.9초 (8개 정적 페이지)
- ESLint: 0 errors
- 번들 크기: 최적화 완료

**우려 사항**:
- 세션 목록 렌더링 성능 (가상화 필요 여부)
- 실시간 혼잡도 polling 부하
- 이미지 최적화 (부스 로고, 포스터 썸네일)

### 4. 보안
**현재**:
- JWT 시크릿 환경 변수화 ✅
- Prisma 싱글톤 패턴 ✅
- HTTPS 강제 (GitHub Pages) ✅

**추가 필요**:
- QR 코드 위조 방지 (서명 또는 HMAC)
- Rate Limiting (API 호출 제한)
- CORS 정책 재검토

---

## 📝 Next Steps - hands-on worker 인계사항

### Immediate Tasks (당일)
1. **메인 로고 링크 수정** (5분)
   - 파일: `moducon-frontend/src/components/Header.tsx` (추정)
   - 변경: `href="/"` → `href="/home/"`
   - 테스트: 로그인 전/후, 모바일/데스크톱

2. **QR 기능 검증 및 개선** (1시간)
   - QR 데이터 형식 확인
   - 라우팅 로직 테스트 (세션/부스/포스터)
   - 에러 핸들링 추가

3. **세션 데이터 연동** (4시간)
   - Google Sheets 시트 구조 확인
   - 백엔드 서비스 함수 작성
   - API 엔드포인트 구현
   - 프론트엔드 페이지 업데이트

4. **Git 커밋** (30분)
   - Feature 브랜치 생성 (3개)
   - 커밋 메시지 작성 (컨벤션 준수)
   - main 브랜치 병합 또는 PR 생성

### Follow-up Tasks (1주)
1. **퀘스트 MVP** (8시간)
   - 상세 계획: 94_IMPLEMENTATION_ROADMAP.md 참고

2. **실시간 혼잡도** (6시간)
   - 체크인 시스템 먼저 구현
   - 혼잡도 계산 로직 개발

3. **QA 및 배포** (2시간)
   - 전체 기능 통합 테스트
   - 프로덕션 배포

---

## 📚 참고 문서
- **PRD**: 01_PRD.md v1.6
- **진행 상황**: 07_PROGRESS.md
- **최종 분석**: 92_MODUCON_FINAL_ANALYSIS.md
- **API 명세**: 05_API_SPEC.md
- **DB 설계**: 06_DB_DESIGN.md

---

**다음 담당자**: hands-on worker
**다음 문서**: 94_IMPLEMENTATION_ROADMAP.md (구현 로드맵 작성)
