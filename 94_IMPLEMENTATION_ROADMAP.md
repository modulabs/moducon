# 94_IMPLEMENTATION_ROADMAP - 구현 로드맵

**작성일**: 2025-11-28
**작성자**: Technical Lead
**문서 버전**: 1.0
**선행 문서**: 93_TECH_LEAD_REQUIREMENTS_ANALYSIS.md

---

## 📋 Executive Summary

### 목표
- **Immediate (당일, 5.5시간)**: 신규 요구사항 3개 처리 + Git 관리
- **Short-term (1주, 18시간)**: PRD High Priority 구현 (퀘스트, 혼잡도, 체크인)
- **Mid-term (행사 전)**: 참여 경험 향상 (활동 기록, 배지, SNS 공유)

### 예상 성과
- **PRD 달성률**: 51% → 80%
- **사용자 만족도**: 3.8/5.0 → 4.3/5.0 (예상)
- **퀘스트 완료율**: 0% → 50% (예상)

---

## 🚀 Phase 1: Immediate Fixes (당일, 5.5시간)

### Task 1.1: 메인 로고 링크 수정 (5분)
**목표**: 로고 클릭 시 `/` → `/home/` 이동

**파일 위치 확인**:
```bash
grep -r "href=\"/\"" moducon-frontend/src --include="*.tsx"
# 예상: moducon-frontend/src/components/Header.tsx
```

**변경 내용**:
```typescript
// Before
<Link href="/">
  <Image src="/logo.svg" alt="모두콘 2025" />
</Link>

// After
<Link href="/home/">
  <Image src="/logo.svg" alt="모두콘 2025" />
</Link>
```

**테스트 체크리스트**:
- [ ] 로그인 전 로고 클릭 → `/home/` 이동 확인
- [ ] 로그인 후 로고 클릭 → `/home/` 이동 확인
- [ ] 모바일 브라우저 테스트 (Chrome, Safari)
- [ ] 데스크톱 브라우저 테스트

**Git 커밋**:
```bash
git checkout -b fix/header-logo-link
git add moducon-frontend/src/components/Header.tsx
git commit -m "fix(header): 메인 로고 링크를 /home/으로 수정

- 사용자 요청에 따라 로고 클릭 시 /home/ 페이지로 이동
- 기존 / 경로 대신 /home/ 사용"
```

---

### Task 1.2: QR 기능 검증 및 개선 (1시간)

#### Subtask 1.2.1: QR 데이터 형식 정의 (15분)
**목표**: QR 코드 데이터 표준화

**형식 제안**:
```typescript
// QR 코드 데이터 형식
type QRCodeData =
  | `moducon://session/${sessionId}`    // 세션 QR
  | `moducon://booth/${boothId}`        // 부스 QR
  | `moducon://paper/${paperId}`;       // 포스터 QR

// 예시
const sessionQR = "moducon://session/track1-session3";
const boothQR = "moducon://booth/클라비";
const paperQR = "moducon://paper/cvpr2024-001";
```

**파싱 로직**:
```typescript
// moducon-frontend/src/lib/qrParser.ts
export function parseQRCode(qrData: string): { type: 'session' | 'booth' | 'paper', id: string } | null {
  try {
    const url = new URL(qrData);
    if (url.protocol !== 'moducon:') return null;

    const [type, id] = url.pathname.split('/').filter(Boolean);
    if (!type || !id) return null;
    if (!['session', 'booth', 'paper'].includes(type)) return null;

    return { type: type as 'session' | 'booth' | 'paper', id };
  } catch {
    return null;
  }
}
```

#### Subtask 1.2.2: 자동 라우팅 강화 (20분)
**목표**: QR 스캔 → 페이지 이동 에러 핸들링

```typescript
// moducon-frontend/src/components/QRScanner.tsx
import { parseQRCode } from '@/lib/qrParser';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

function QRScanner() {
  const router = useRouter();

  const handleScanSuccess = async (qrData: string) => {
    const parsed = parseQRCode(qrData);

    if (!parsed) {
      toast.error('유효하지 않은 QR 코드입니다.');
      return;
    }

    // 햅틱 피드백 (모바일)
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    // 라우팅
    const route = `/${parsed.type}s/${parsed.id}`; // sessions, booths, papers
    toast.success(`${parsed.type} 페이지로 이동합니다.`);
    router.push(route);
  };

  return (
    <Html5QrcodePlugin
      facingMode="environment"
      onScanSuccess={handleScanSuccess}
      onScanError={(error) => console.warn('QR 스캔 오류:', error)}
    />
  );
}
```

#### Subtask 1.2.3: 관리자 QR 생성 기능 (25분)
**목표**: 관리자 페이지에서 QR 코드 생성

```typescript
// moducon-frontend/src/app/admin/qr-generator/page.tsx
'use client';
import QRCode from 'qrcode';
import { useState } from 'react';

export default function QRGeneratorPage() {
  const [type, setType] = useState<'session' | 'booth' | 'paper'>('booth');
  const [id, setId] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  const generateQR = async () => {
    const data = `moducon://${type}/${id}`;
    const url = await QRCode.toDataURL(data, { width: 400 });
    setQrUrl(url);
  };

  return (
    <div className="p-6">
      <h1>QR 코드 생성</h1>
      <select value={type} onChange={(e) => setType(e.target.value as any)}>
        <option value="session">세션</option>
        <option value="booth">부스</option>
        <option value="paper">포스터</option>
      </select>
      <input
        type="text"
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="ID 입력"
      />
      <button onClick={generateQR}>생성</button>
      {qrUrl && <img src={qrUrl} alt="QR Code" />}
    </div>
  );
}
```

**테스트 체크리스트**:
- [ ] 세션 QR 스캔 → `/sessions/{id}` 이동
- [ ] 부스 QR 스캔 → `/booths/{id}` 이동
- [ ] 포스터 QR 스캔 → `/papers/{id}` 이동
- [ ] 잘못된 QR → 에러 토스트 표시
- [ ] 햅틱 피드백 동작 (iOS/Android)

**Git 커밋**:
```bash
git checkout -b feature/qr-improvements
git add moducon-frontend/src/lib/qrParser.ts
git add moducon-frontend/src/components/QRScanner.tsx
git add moducon-frontend/src/app/admin/qr-generator/
git commit -m "feat(qr): QR 코드 기능 개선

- QR 데이터 형식 표준화 (moducon://{type}/{id})
- 자동 라우팅 에러 핸들링 추가
- 햅틱 피드백 및 토스트 알림 구현
- 관리자 QR 생성 페이지 추가"
```

---

### Task 1.3: 세션 데이터 연동 (4시간)

#### Subtask 1.3.1: Google Sheets 시트 구조 확인 (30분)
**목표**: 세션 데이터 매핑

**시트 URL**:
```
https://docs.google.com/spreadsheets/d/1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g/edit?gid=1035988542#gid=1035988542
```

**예상 컬럼**:
```
A: 세션 ID
B: 세션 이름
C: 트랙 (Track 1-6)
D: 시작 시간 (09:00)
E: 종료 시간 (10:00)
F: 장소 (이화여대 포스코관 201호)
G: 연사
H: 난이도 (초급/중급/고급)
I: 설명
J: 해시태그 (쉼표 구분)
```

**타입 정의**:
```typescript
// moducon-backend/src/types/session.ts
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
  tags: string[];
}
```

#### Subtask 1.3.2: 백엔드 서비스 함수 작성 (1시간)
**목표**: Google Sheets 데이터 가져오기

```typescript
// moducon-backend/src/services/googleSheets.ts
import { google } from 'googleapis';

const SPREADSHEET_ID = '1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g';
const SESSIONS_RANGE = 'Sessions!A2:J100'; // 헤더 제외

export async function getSessionsData(): Promise<Session[]> {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SESSIONS_RANGE,
    });

    const rows = response.data.values || [];
    return rows.map((row) => ({
      id: row[0] || '',
      name: row[1] || '',
      track: row[2] || '',
      startTime: row[3] || '',
      endTime: row[4] || '',
      location: row[5] || '',
      speaker: row[6] || '',
      difficulty: (row[7] || '중급') as '초급' | '중급' | '고급',
      description: row[8] || '',
      tags: (row[9] || '').split(',').map((t) => t.trim()),
    }));
  } catch (error) {
    console.error('세션 데이터 가져오기 실패:', error);
    return [];
  }
}
```

**캐싱 전략**:
```typescript
// moducon-backend/src/lib/cache.ts
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5분 TTL

export function getCached<T>(key: string): T | undefined {
  return cache.get(key);
}

export function setCached<T>(key: string, value: T): void {
  cache.set(key, value);
}

// 사용 예시
export async function getSessionsDataCached(): Promise<Session[]> {
  const cached = getCached<Session[]>('sessions');
  if (cached) return cached;

  const sessions = await getSessionsData();
  setCached('sessions', sessions);
  return sessions;
}
```

#### Subtask 1.3.3: API 엔드포인트 구현 (30분)
**목표**: REST API 제공

```typescript
// moducon-backend/src/routes/sessions.ts
import express from 'express';
import { getSessionsDataCached } from '../services/googleSheets';

const router = express.Router();

// 전체 세션 목록
router.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await getSessionsDataCached();

    // 쿼리 파라미터 필터링
    const { track, difficulty } = req.query;
    let filtered = sessions;

    if (track) {
      filtered = filtered.filter(s => s.track === track);
    }
    if (difficulty) {
      filtered = filtered.filter(s => s.difficulty === difficulty);
    }

    res.json({ success: true, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// 세션 상세
router.get('/api/sessions/:id', async (req, res) => {
  try {
    const sessions = await getSessionsDataCached();
    const session = sessions.find(s => s.id === req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

export default router;
```

**라우트 등록**:
```typescript
// moducon-backend/src/index.ts
import sessionsRouter from './routes/sessions';

app.use(sessionsRouter);
```

#### Subtask 1.3.4: 프론트엔드 페이지 구현 (1시간)
**목표**: 세션 목록 및 상세 페이지

```typescript
// moducon-frontend/src/app/sessions/page.tsx
'use client';
import useSWR from 'swr';
import { SessionCard } from '@/components/SessionCard';
import { TrackFilter } from '@/components/TrackFilter';
import { useState } from 'react';

export default function SessionsPage() {
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const { data, error, isLoading } = useSWR('/api/sessions', fetcher);

  const sessions = data?.data || [];
  const filteredSessions = selectedTrack === 'all'
    ? sessions
    : sessions.filter((s: any) => s.track === selectedTrack);

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>데이터를 불러오지 못했습니다.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">세션 타임테이블</h1>
      <TrackFilter selected={selectedTrack} onChange={setSelectedTrack} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSessions.map((session: any) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
```

```typescript
// moducon-frontend/src/components/SessionCard.tsx
import Link from 'next/link';

interface SessionCardProps {
  session: {
    id: string;
    name: string;
    track: string;
    startTime: string;
    endTime: string;
    location: string;
    speaker: string;
    difficulty: string;
  };
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <Link href={`/sessions/${session.id}`}>
      <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
        <h3 className="font-bold text-lg">{session.name}</h3>
        <p className="text-sm text-gray-600">{session.track}</p>
        <p className="text-sm">{session.startTime} - {session.endTime}</p>
        <p className="text-sm">{session.location}</p>
        <p className="text-sm">연사: {session.speaker}</p>
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {session.difficulty}
        </span>
      </div>
    </Link>
  );
}
```

#### Subtask 1.3.5: 테스트 및 검증 (1시간)
**테스트 체크리스트**:
- [ ] 백엔드 API 테스트 (curl/Postman)
  ```bash
  curl http://localhost:3001/api/sessions
  curl http://localhost:3001/api/sessions/track1-session1
  ```
- [ ] 프론트엔드 빌드 테스트
  ```bash
  cd moducon-frontend && npm run build
  ```
- [ ] 세션 목록 페이지 렌더링 확인
- [ ] 트랙 필터 동작 확인
- [ ] 세션 상세 페이지 이동 확인
- [ ] Google Sheets 데이터 동기화 확인 (시트 수정 → 5분 후 반영)

**Git 커밋**:
```bash
git checkout -b feature/sessions-data
git add moducon-backend/src/services/googleSheets.ts
git add moducon-backend/src/routes/sessions.ts
git add moducon-frontend/src/app/sessions/
git add moducon-frontend/src/components/SessionCard.tsx
git commit -m "feat(sessions): Google Sheets 세션 데이터 연동

- Google Sheets API로 세션 목록 가져오기
- 5분 TTL 캐싱 적용
- 트랙별 필터링 API 구현
- 세션 목록 및 상세 페이지 구현"
```

---

### Task 1.4: Git 관리 및 브랜치 병합 (30분)
**목표**: Feature 브랜치 정리 및 main 병합

**프로세스**:
```bash
# 1. 모든 변경사항 확인
git status

# 2. Feature 브랜치 병합 (Squash Merge 권장)
git checkout main
git merge --squash fix/header-logo-link
git commit -m "fix(header): 메인 로고 링크 수정"

git merge --squash feature/qr-improvements
git commit -m "feat(qr): QR 기능 개선 (파싱, 라우팅, 관리자 생성)"

git merge --squash feature/sessions-data
git commit -m "feat(sessions): Google Sheets 세션 데이터 연동"

# 3. 원격 저장소 푸시
git push origin main

# 4. Feature 브랜치 삭제
git branch -d fix/header-logo-link
git branch -d feature/qr-improvements
git branch -d feature/sessions-data
```

**검증**:
```bash
# 커밋 히스토리 확인
git log --oneline -10

# 빌드 테스트
cd moducon-frontend && npm run build
cd ../moducon-backend && npm run build
```

---

## 🎯 Phase 2: High Priority (1주, 18시간)

### Task 2.1: 퀘스트 MVP (8시간)

#### Step 1: 온보딩 - 관심사 선택 (1시간)
**목표**: 최초 로그인 후 관심 분야 3개 선택

**UI 구현**:
```typescript
// moducon-frontend/src/app/onboarding/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const INTERESTS = [
  '생성 AI',
  '컴퓨터 비전',
  'NLP/LLM',
  '로보틱스',
  'MLOps',
  '데이터 엔지니어링',
  'AI 윤리/정책',
  '기타',
];

export default function OnboardingPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  const toggleInterest = (interest: string) => {
    if (selected.includes(interest)) {
      setSelected(selected.filter(i => i !== interest));
    } else if (selected.length < 3) {
      setSelected([...selected, interest]);
    } else {
      toast.error('최대 3개까지 선택 가능합니다.');
    }
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      toast.error('최소 1개 이상 선택해주세요.');
      return;
    }

    const response = await fetch('/api/users/me/interests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interests: selected }),
    });

    if (response.ok) {
      toast.success('관심사가 저장되었습니다!');
      router.push('/quest');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">관심 분야를 선택해주세요</h1>
      <p className="text-gray-600 mb-6">최대 3개까지 선택 가능합니다</p>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {INTERESTS.map(interest => (
          <button
            key={interest}
            onClick={() => toggleInterest(interest)}
            className={`p-4 border rounded-lg ${
              selected.includes(interest)
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-800'
            }`}
          >
            {interest}
          </button>
        ))}
      </div>
      <p className="mb-4">선택: {selected.join(', ')}</p>
      <button onClick={handleSubmit} className="w-full bg-blue-600 text-white p-3 rounded-lg">
        다음
      </button>
    </div>
  );
}
```

**백엔드 API**:
```typescript
// moducon-backend/src/routes/users.ts
router.patch('/api/users/me/interests', authenticate, async (req, res) => {
  const { userId } = req.user;
  const { interests } = req.body;

  if (!Array.isArray(interests) || interests.length === 0 || interests.length > 3) {
    return res.status(400).json({ success: false, error: 'Invalid interests' });
  }

  await db.users.update({
    where: { id: userId },
    data: { interests: interests.join(',') },
  });

  res.json({ success: true });
});
```

#### Step 2: 퀘스트 생성 (2시간)
**목표**: 관심사 기반 부스 추천 (관련도 점수 계산)

**알고리즘**:
```typescript
// moducon-backend/src/services/quest.ts
import { getBoothsDataCached } from './googleSheets';

interface QuestRecommendation {
  booth: Booth;
  score: number;
  reason: string;
}

export async function generateQuest(interests: string[]): Promise<QuestRecommendation[]> {
  const booths = await getBoothsDataCached();

  // 관련도 점수 계산
  const scored = booths.map(booth => {
    let score = 0;
    const reasons: string[] = [];

    // 해시태그 매칭
    interests.forEach(interest => {
      const matchCount = booth.tags.filter(tag =>
        tag.includes(interest) || interest.includes(tag)
      ).length;

      if (matchCount > 0) {
        score += matchCount * 10;
        reasons.push(`"${interest}" 관련 해시태그 ${matchCount}개`);
      }
    });

    // 설명 키워드 매칭
    interests.forEach(interest => {
      if (booth.description.includes(interest)) {
        score += 5;
        reasons.push(`설명에 "${interest}" 포함`);
      }
    });

    return {
      booth,
      score,
      reason: reasons.join(', ') || '일반 추천',
    };
  });

  // 상위 5개 추천
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
```

**API**:
```typescript
// moducon-backend/src/routes/quest.ts
import { generateQuest } from '../services/quest';

router.post('/api/quest/generate', authenticate, async (req, res) => {
  const { userId } = req.user;

  // 사용자 관심사 조회
  const user = await db.users.findUnique({ where: { id: userId } });
  const interests = user.interests?.split(',') || [];

  if (interests.length === 0) {
    return res.status(400).json({ success: false, error: 'No interests set' });
  }

  // 퀘스트 생성
  const recommendations = await generateQuest(interests);
  const boothIds = recommendations.map(r => r.booth.id);

  // DB 저장
  await db.quests.create({
    data: {
      userId,
      boothIds: boothIds.join(','),
      createdAt: new Date(),
    },
  });

  res.json({ success: true, data: recommendations });
});
```

#### Step 3: QR 인증 시스템 (2시간)
**목표**: 부스 QR 스캔으로 퀘스트 진행

**백엔드 API**:
```typescript
// moducon-backend/src/routes/quest.ts
router.post('/api/quest/:boothId/checkin', authenticate, async (req, res) => {
  const { userId } = req.user;
  const { boothId } = req.params;

  // 중복 체크인 방지
  const existing = await db.questProgress.findFirst({
    where: { userId, boothId },
  });

  if (existing) {
    return res.status(400).json({ success: false, error: 'Already checked in' });
  }

  // 체크인 기록
  await db.questProgress.create({
    data: { userId, boothId, checkedInAt: new Date() },
  });

  // 진행률 계산
  const progress = await getQuestProgress(userId);

  res.json({ success: true, progress });
});

async function getQuestProgress(userId: number) {
  const quest = await db.quests.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (!quest) return { completed: 0, total: 0 };

  const boothIds = quest.boothIds.split(',');
  const checkedIn = await db.questProgress.count({
    where: { userId, boothId: { in: boothIds } },
  });

  return { completed: checkedIn, total: boothIds.length };
}
```

**프론트엔드 QR 스캔**:
```typescript
// moducon-frontend/src/components/QRScanner.tsx (수정)
const handleScanSuccess = async (qrData: string) => {
  const parsed = parseQRCode(qrData);
  if (!parsed || parsed.type !== 'booth') return;

  // 체크인 API 호출
  const response = await fetch(`/api/quest/${parsed.id}/checkin`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.ok) {
    const { progress } = await response.json();
    toast.success(`${parsed.id} 방문 완료! (${progress.completed}/${progress.total})`);
  }
};
```

#### Step 4: 진행률 UI (2시간)
**목표**: 퀘스트 진행 상황 표시

```typescript
// moducon-frontend/src/app/quest/page.tsx
'use client';
import useSWR from 'swr';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestCard } from '@/components/QuestCard';

export default function QuestPage() {
  const { data } = useSWR('/api/quest/me', fetcher);

  const quest = data?.data || { recommendations: [], progress: { completed: 0, total: 0 } };
  const { recommendations, progress } = quest;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">나의 퀘스트</h1>
      <ProgressBar
        value={progress.completed}
        max={progress.total}
        label={`${progress.completed}/${progress.total} 완료`}
      />
      <div className="mt-6 space-y-4">
        {recommendations.map((rec: any) => (
          <QuestCard key={rec.booth.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}
```

#### Step 5: 테스트 (1시간)
**테스트 체크리스트**:
- [ ] 온보딩 플로우 (관심사 선택 → 퀘스트 생성)
- [ ] 부스 QR 스캔 → 체크인 성공
- [ ] 진행률 업데이트 확인
- [ ] 중복 체크인 방지 확인
- [ ] 모바일 UX 테스트

---

### Task 2.2: 실시간 혼잡도 (6시간)

#### Step 1: 체크인 시스템 (2시간)
**목표**: 세션/부스 체크인 API

**데이터베이스 스키마**:
```sql
CREATE TABLE checkins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  location_id VARCHAR(100),
  location_type VARCHAR(20), -- 'session' | 'booth'
  checked_in_at TIMESTAMP DEFAULT NOW(),
  checked_out_at TIMESTAMP
);

CREATE INDEX idx_checkins_location ON checkins(location_id, location_type, checked_in_at);
```

**API**:
```typescript
// moducon-backend/src/routes/checkin.ts
router.post('/api/checkin/:type/:id', authenticate, async (req, res) => {
  const { userId } = req.user;
  const { type, id } = req.params;

  if (!['session', 'booth'].includes(type)) {
    return res.status(400).json({ success: false, error: 'Invalid type' });
  }

  // 체크인 기록
  await db.checkins.create({
    data: {
      userId,
      locationId: id,
      locationType: type,
      checkedInAt: new Date(),
    },
  });

  res.json({ success: true });
});

// 체크아웃 (선택)
router.post('/api/checkout', authenticate, async (req, res) => {
  const { userId } = req.user;

  await db.checkins.updateMany({
    where: { userId, checkedOutAt: null },
    data: { checkedOutAt: new Date() },
  });

  res.json({ success: true });
});
```

#### Step 2: 혼잡도 계산 (2시간)
**목표**: 최근 5분간 체크인 기반 혼잡도 계산

**서비스 함수**:
```typescript
// moducon-backend/src/services/crowdLevel.ts
interface CrowdLevel {
  locationId: string;
  locationType: 'session' | 'booth';
  currentCount: number;
  capacity: number;
  level: '🟢' | '🟡' | '🟠' | '🔴';
  updatedAt: Date;
}

// 용량 데이터 (하드코딩 또는 Google Sheets)
const CAPACITY_DATA: Record<string, number> = {
  'track1': 200,
  'track2': 150,
  'booth-클라비': 30,
  'booth-K-HP': 25,
  // ... (전체 부스/세션 용량)
};

export async function calculateCrowdLevel(
  locationId: string,
  locationType: 'session' | 'booth'
): Promise<CrowdLevel> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  // 최근 5분간 체크인 수 (체크아웃 안한 사람)
  const currentCount = await db.checkins.count({
    where: {
      locationId,
      locationType,
      checkedInAt: { gte: fiveMinutesAgo },
      checkedOutAt: null,
    },
  });

  const capacity = CAPACITY_DATA[`${locationType}-${locationId}`] || 50;
  const ratio = currentCount / capacity;

  let level: CrowdLevel['level'];
  if (ratio < 0.3) level = '🟢';
  else if (ratio < 0.6) level = '🟡';
  else if (ratio < 0.85) level = '🟠';
  else level = '🔴';

  return {
    locationId,
    locationType,
    currentCount,
    capacity,
    level,
    updatedAt: new Date(),
  };
}
```

**API**:
```typescript
// moducon-backend/src/routes/crowdLevel.ts
router.get('/api/crowd-levels', async (req, res) => {
  const sessions = await getSessionsDataCached();
  const booths = await getBoothsDataCached();

  const sessionLevels = await Promise.all(
    sessions.map(s => calculateCrowdLevel(s.id, 'session'))
  );
  const boothLevels = await Promise.all(
    booths.map(b => calculateCrowdLevel(b.id, 'booth'))
  );

  res.json({ success: true, data: { sessions: sessionLevels, booths: boothLevels } });
});
```

#### Step 3: 프론트엔드 실시간 표시 (1시간)
**목표**: 30초 간격 폴링으로 혼잡도 업데이트

```typescript
// moducon-frontend/src/app/sessions/page.tsx
import useSWR from 'swr';

export default function SessionsPage() {
  const { data: sessions } = useSWR('/api/sessions', fetcher);
  const { data: crowdLevels } = useSWR('/api/crowd-levels', fetcher, {
    refreshInterval: 30000, // 30초마다 갱신
  });

  const sessionLevels = crowdLevels?.data.sessions || [];

  return (
    <div>
      {sessions?.data.map((session: any) => {
        const level = sessionLevels.find((l: any) => l.locationId === session.id);
        return (
          <SessionCard
            key={session.id}
            session={session}
            crowdLevel={level?.level}
            currentCount={level?.currentCount}
          />
        );
      })}
    </div>
  );
}
```

```typescript
// moducon-frontend/src/components/SessionCard.tsx (수정)
export function SessionCard({ session, crowdLevel, currentCount }: any) {
  return (
    <div className="border rounded-lg p-4">
      <h3>{session.name}</h3>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{crowdLevel}</span>
        <span className="text-sm text-gray-600">{currentCount}명</span>
      </div>
    </div>
  );
}
```

#### Step 4: 테스트 (1시간)
**테스트 체크리스트**:
- [ ] 체크인 API 테스트
- [ ] 혼잡도 계산 정확도 검증
- [ ] 프론트엔드 30초 갱신 확인
- [ ] 모바일 성능 테스트 (배터리, 네트워크)

---

### Task 2.3: 통합 QA 및 배포 (2시간)
**목표**: Phase 2 전체 기능 통합 테스트

**테스트 시나리오**:
1. 온보딩 → 퀘스트 생성
2. 부스 QR 스캔 → 체크인 → 진행률 업데이트
3. 세션 페이지 혼잡도 확인
4. 실시간 혼잡도 변화 확인

**배포**:
```bash
# 빌드
cd moducon-frontend && npm run build
cd ../moducon-backend && npm run build

# Git 커밋
git add .
git commit -m "feat: Phase 2 High Priority 구현 완료

- 퀘스트 MVP (온보딩, 생성, QR 인증, 진행률)
- 실시간 혼잡도 (체크인, 계산, 30초 폴링)
- 통합 테스트 완료"

# 배포
git push origin main
```

---

## 📊 Phase 3: Medium Priority (행사 전, 14시간)

### Task 3.1: 내 활동 기록 (5시간)
- 방문 부스 목록
- 참석 세션 목록
- 타임라인 뷰 (시간순 정렬)

### Task 3.2: 배지/포인트 시스템 (6시간)
- 부스 방문 시 포인트 적립
- 3개 기본 배지 (방문 5곳, 10곳, 전체)
- 내 배지 컬렉션 페이지

### Task 3.3: SNS 공유 (3시간)
- 내 배지 이미지 생성 (Canvas API)
- "모두콘 2025 참가 중" 공유 버튼

---

## 🏆 예상 성과

### PRD 달성률
- **Before Phase 1**: 51%
- **After Phase 1**: 65%
- **After Phase 2**: 80%
- **After Phase 3**: 90%

### 사용자 만족도 예측
- **앱 사용률**: 60% → 75%
- **퀘스트 완료율**: 0% → 50%
- **부스 방문 증가**: +15% → +35%

---

**다음 담당자**: hands-on worker
**필독 문서**: 93_TECH_LEAD_REQUIREMENTS_ANALYSIS.md
**작업 시작**: Task 1.1부터 순서대로 진행
