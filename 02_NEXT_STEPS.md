# 다음 개발 계획 (Phase 3-5)

## 📋 개요

**작성일**: 2025-12-01
**예상 소요 시간**: 3-4시간
**담당자**: hands-on worker

## 🎯 현재 상태

### ✅ 완료된 Phase (Phase 1-2)

**Phase 1: 기획 & 문서화**
- PRD, 개발 계획, DB 설계, API 명세 완료
- 대화 내역 197개 문서 claudedocs/ 정리 완료

**Phase 2: 기본 UI 구현**
- 홈 페이지 (깔끔한 UI, 실제 세션 데이터)
- 하단 네비게이션 (5개 탭 + QR 스캔)
- QR 스캐너 (카메라 접근, 파싱)
- 세션/부스/포스터/지도 페이지

### 🚧 진행 대기 (Phase 3-5)

## 📝 Phase 3: Database 마이그레이션 (15분)

### 작업 내용
`backend/prisma/schema.prisma`에 CheckIn, Quiz 모델 추가

### 코드

```prisma
model CheckIn {
  id        String   @id @default(uuid())
  userId    String
  type      String   // SESSION, BOOTH, POSTER
  targetId  String   // 세션/부스/포스터 ID
  timestamp DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, type, targetId])
  @@index([userId])
  @@index([type, targetId])
  @@map("check_ins")
}

model Quiz {
  id            String   @id @default(uuid())
  userId        String
  sessionId     String
  answers       Json     // { q1: "A", q2: "C", q3: "B" }
  score         Int      // 0-100
  submittedAt   DateTime @default(now())

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, sessionId])
  @@index([userId])
  @@index([sessionId])
  @@map("quizzes")
}
```

### User 모델 업데이트
```prisma
model User {
  // ... (기존 필드)

  // 새로운 관계 추가
  checkIns  CheckIn[]
  quizzes   Quiz[]
}
```

### 마이그레이션 실행
```bash
cd backend
npx prisma migrate dev --name add-checkin-quiz
npx prisma generate
```

## 🔧 Phase 4: 체크인 + 퀴즈 API (2시간)

### 4.1 체크인 API (`backend/src/routes/checkin.ts`)

#### POST /api/checkin - 체크인 기록
```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { type, targetId } = req.body;

    // Validation
    if (!type || !targetId) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }

    if (!['SESSION', 'BOOTH', 'POSTER'].includes(type)) {
      return res.status(400).json({ error: '잘못된 체크인 타입입니다.' });
    }

    // 중복 체크인 확인
    const existingCheckIn = await prisma.checkIn.findUnique({
      where: {
        userId_type_targetId: {
          userId,
          type,
          targetId,
        },
      },
    });

    if (existingCheckIn) {
      return res.status(409).json({
        error: '이미 체크인한 항목입니다.',
        checkIn: existingCheckIn,
      });
    }

    // 체크인 생성
    const checkIn = await prisma.checkIn.create({
      data: {
        userId,
        type,
        targetId,
      },
    });

    res.status(201).json(checkIn);
  } catch (error) {
    console.error('체크인 실패:', error);
    res.status(500).json({ error: '체크인 처리 중 오류가 발생했습니다.' });
  }
});

export default router;
```

#### GET /api/checkin/:userId - 사용자 체크인 내역
```typescript
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query; // 선택적 필터

    // 권한 확인 (본인 또는 관리자만)
    if (req.user?.id !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    const checkIns = await prisma.checkIn.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });

    res.json(checkIns);
  } catch (error) {
    console.error('체크인 조회 실패:', error);
    res.status(500).json({ error: '체크인 조회 중 오류가 발생했습니다.' });
  }
});
```

#### GET /api/checkin/stats/:userId - 체크인 통계
```typescript
router.get('/stats/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // 권한 확인
    if (req.user?.id !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    // 타입별 체크인 수
    const stats = await prisma.checkIn.groupBy({
      by: ['type'],
      where: { userId },
      _count: true,
    });

    // 전체 체크인 수
    const total = await prisma.checkIn.count({ where: { userId } });

    res.json({
      total,
      byType: stats.reduce((acc, stat) => {
        acc[stat.type] = stat._count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('체크인 통계 조회 실패:', error);
    res.status(500).json({ error: '통계 조회 중 오류가 발생했습니다.' });
  }
});
```

### 4.2 퀴즈 API (`backend/src/routes/quiz.ts`)

#### POST /api/quiz - 퀴즈 제출
```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { sessionId, answers } = req.body;

    // Validation
    if (!sessionId || !answers) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }

    // 중복 제출 확인
    const existingQuiz = await prisma.quiz.findUnique({
      where: {
        userId_sessionId: {
          userId,
          sessionId,
        },
      },
    });

    if (existingQuiz) {
      return res.status(409).json({
        error: '이미 제출한 퀴즈입니다.',
        quiz: existingQuiz,
      });
    }

    // 점수 계산 (예: 정답 개수 / 전체 문제 수 * 100)
    // 실제로는 정답 데이터와 비교 필요
    const score = calculateScore(answers);

    // 퀴즈 생성
    const quiz = await prisma.quiz.create({
      data: {
        userId,
        sessionId,
        answers,
        score,
      },
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error('퀴즈 제출 실패:', error);
    res.status(500).json({ error: '퀴즈 제출 중 오류가 발생했습니다.' });
  }
});

// 점수 계산 함수 (예시)
function calculateScore(answers: Record<string, string>): number {
  // 실제 정답 데이터와 비교
  const correctAnswers = {
    q1: 'A',
    q2: 'C',
    q3: 'B',
  };

  let correct = 0;
  const total = Object.keys(correctAnswers).length;

  for (const [key, value] of Object.entries(answers)) {
    if (correctAnswers[key] === value) {
      correct++;
    }
  }

  return Math.round((correct / total) * 100);
}

export default router;
```

#### GET /api/quiz/:userId/:sessionId - 퀴즈 결과 조회
```typescript
router.get('/:userId/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { userId, sessionId } = req.params;

    // 권한 확인
    if (req.user?.id !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    const quiz = await prisma.quiz.findUnique({
      where: {
        userId_sessionId: {
          userId,
          sessionId,
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({ error: '퀴즈 결과를 찾을 수 없습니다.' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('퀴즈 조회 실패:', error);
    res.status(500).json({ error: '퀴즈 조회 중 오류가 발생했습니다.' });
  }
});
```

### 4.3 라우트 등록 (`backend/src/index.ts`)

```typescript
import checkInRoutes from './routes/checkin';
import quizRoutes from './routes/quiz';

// ... (기존 코드)

app.use('/api/checkin', checkInRoutes);
app.use('/api/quiz', quizRoutes);
```

## 🎨 Phase 5: 마이페이지 UI (1-1.5시간)

### 5.1 마이페이지 메인 (`frontend/src/app/mypage/page.tsx`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { ProfileSection } from '@/components/mypage/ProfileSection';
import { BadgesSection } from '@/components/mypage/BadgesSection';
import { StatsSection } from '@/components/mypage/StatsSection';
import { CheckpointsSection } from '@/components/mypage/CheckpointsSection';

export default function MyPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 데이터 로딩
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-3xl font-bold">마이페이지</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <ProfileSection />
          <StatsSection />
          <CheckpointsSection />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <BadgesSection />
        </div>
      </div>
    </div>
  );
}
```

### 5.2 프로필 섹션 (`frontend/src/components/mypage/ProfileSection.tsx`)

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { User } from 'lucide-react';

export function ProfileSection() {
  const { user } = useAuthStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          프로필
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">이름</label>
            <p className="text-lg font-semibold">{user?.name}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">전화번호</label>
            <p className="text-lg">{user?.phone}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">참가 유형</label>
            <p className="text-lg">{user?.role === 'ADMIN' ? '관리자' : '참가자'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5.3 통계 섹션 (`frontend/src/components/mypage/StatsSection.tsx`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { BarChart3 } from 'lucide-react';

interface Stats {
  total: number;
  byType: Record<string, number>;
}

export function StatsSection() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkin/stats/${user?.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch stats');

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('통계 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchStats();
    }
  }, [user?.id]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          활동 통계
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{stats?.byType.SESSION || 0}</p>
            <p className="text-sm text-muted-foreground">세션</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{stats?.byType.BOOTH || 0}</p>
            <p className="text-sm text-muted-foreground">부스</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{stats?.byType.POSTER || 0}</p>
            <p className="text-sm text-muted-foreground">포스터</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">{stats?.total || 0}</p>
            <p className="text-sm text-muted-foreground">전체 체크인</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5.4 배지 섹션 (`frontend/src/components/mypage/BadgesSection.tsx`)

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';

export function BadgesSection() {
  // TODO: 실제 배지 데이터 연동
  const badges = [
    { id: '1', name: '첫 세션 참석', icon: '🎓', unlocked: true },
    { id: '2', name: '5개 부스 방문', icon: '🏆', unlocked: false },
    { id: '3', name: '퀴즈 고수', icon: '🧠', unlocked: false },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          배지
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 border rounded-lg text-center ${
                badge.unlocked ? 'bg-primary/10' : 'opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">{badge.icon}</div>
              <p className="text-sm font-medium">{badge.name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5.5 체크포인트 섹션 (`frontend/src/components/mypage/CheckpointsSection.tsx`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { MapPin } from 'lucide-react';

interface CheckIn {
  id: string;
  type: string;
  targetId: string;
  timestamp: string;
}

export function CheckpointsSection() {
  const { user } = useAuthStore();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckIns = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/checkin/${user?.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch check-ins');

        const data = await response.json();
        setCheckIns(data);
      } catch (error) {
        console.error('체크인 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchCheckIns();
    }
  }, [user?.id]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          체크포인트
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checkIns.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              체크인 내역이 없습니다.
            </p>
          ) : (
            checkIns.map((checkIn) => (
              <div key={checkIn.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                <div className="flex-1">
                  <p className="font-medium">{checkIn.type}</p>
                  <p className="text-sm text-muted-foreground">{checkIn.targetId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(checkIn.timestamp).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

## ✅ 테스트 체크리스트

### Database
- [ ] Prisma 마이그레이션 성공
- [ ] CheckIn, Quiz 모델 생성 확인
- [ ] User 관계 설정 확인

### Backend API
- [ ] POST /api/checkin - 체크인 성공
- [ ] POST /api/checkin - 중복 체크인 방지
- [ ] GET /api/checkin/:userId - 체크인 내역 조회
- [ ] GET /api/checkin/stats/:userId - 통계 조회
- [ ] POST /api/quiz - 퀴즈 제출 성공
- [ ] POST /api/quiz - 중복 제출 방지
- [ ] GET /api/quiz/:userId/:sessionId - 퀴즈 결과 조회
- [ ] JWT 인증 미들웨어 동작 확인

### Frontend UI
- [ ] 마이페이지 접근 가능
- [ ] ProfileSection 렌더링
- [ ] StatsSection 데이터 로딩
- [ ] BadgesSection 배지 표시
- [ ] CheckpointsSection 체크인 목록
- [ ] 반응형 디자인 확인 (모바일/데스크톱)
- [ ] 로딩 상태 표시
- [ ] 에러 처리 확인

### Integration
- [ ] 체크인 → 통계 업데이트 확인
- [ ] 퀴즈 제출 → 결과 조회 확인
- [ ] 권한 검증 (본인/관리자만 접근)

## 📚 참고 문서

- `claudedocs/188_DEV_PLAN_NEXT.md` - 상세 구현 가이드
- `claudedocs/05_API_SPEC.md` - API 명세 전체
- `claudedocs/06_DB_DESIGN.md` - DB 스키마 상세

---

**다음 담당자**: hands-on worker
**예상 소요 시간**: 3-4시간
**시작 시점**: 사용자 명시적 요청 시
