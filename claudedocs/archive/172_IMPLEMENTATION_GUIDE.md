# 172_IMPLEMENTATION_GUIDE.md - Phase 3-5 상세 구현 가이드

**작성일**: 2025-12-01
**작성자**: hands-on worker
**목적**: Phase 3-5 구현 시 참고할 상세 코드 가이드

---

## 📊 Phase 3: Database 마이그레이션 (15분)

### Step 1: schema.prisma 수정

**파일**: `moducon-backend/prisma/schema.prisma`

**추가할 내용**:
```prisma
// 기존 User 모델에 관계 추가
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 기존 관계
  sessions AuthSession[]
  signatures Signature[]

  // 신규 관계 추가
  checkins UserCheckin[]
  quizAttempts UserQuizAttempt[]

  @@map("users")
}

// 신규 모델 1: 체크인 기록
model UserCheckin {
  id          String   @id @default(cuid())
  userId      String
  targetType  String   // "session" | "booth" | "poster"
  targetId    String
  checkedAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, targetType, targetId])
  @@index([userId])
  @@index([targetType, targetId])
  @@map("user_checkins")
}

// 신규 모델 2: 퀴즈 문제
model Quiz {
  id          String   @id @default(cuid())
  targetType  String   // "session" | "booth" | "poster"
  targetId    String
  question    String
  options     Json     // ["옵션1", "옵션2", "옵션3", "옵션4"]
  correctAnswer String

  attempts UserQuizAttempt[]

  @@unique([targetType, targetId])
  @@map("quizzes")
}

// 신규 모델 3: 퀴즈 응답 기록
model UserQuizAttempt {
  id          String   @id @default(cuid())
  userId      String
  quizId      String
  selectedAnswer String
  isCorrect   Boolean
  attemptedAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  quiz Quiz @relation(fields: [quizId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([quizId])
  @@map("user_quiz_attempts")
}
```

### Step 2: 마이그레이션 실행

```bash
cd moducon-backend

# 마이그레이션 생성 및 적용
npx prisma migrate dev --name add_checkin_quiz_tables

# 성공 메시지 확인
# ✅ Applying migration `20251201_add_checkin_quiz_tables`
```

### Step 3: 검증

```bash
# Prisma Studio 실행 (옵션)
npx prisma studio

# 또는 TypeScript 빌드로 검증
npm run build
```

---

## 📊 Phase 4-1: 체크인 API 구현 (1시간)

### Step 1: 체크인 라우트 생성

**파일**: `moducon-backend/src/routes/checkin.ts`

```typescript
import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/checkin - 체크인 생성
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { userId, targetType, targetId } = req.body;

    // 유효성 검증
    if (!userId || !targetType || !targetId) {
      return res.status(400).json({
        success: false,
        error: '필수 필드가 누락되었습니다.'
      });
    }

    if (!['session', 'booth', 'poster'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        error: '잘못된 targetType입니다. (session, booth, poster 중 하나)'
      });
    }

    // 중복 체크인 방지
    const existing = await prisma.userCheckin.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType,
          targetId
        }
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: '이미 체크인한 항목입니다.'
      });
    }

    // 체크인 생성
    const checkin = await prisma.userCheckin.create({
      data: {
        userId,
        targetType,
        targetId
      }
    });

    res.status(201).json({
      success: true,
      checkin
    });
  } catch (error) {
    console.error('체크인 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '체크인 생성 중 오류가 발생했습니다.'
    });
  }
});

// GET /api/checkins/user/:userId - 사용자별 체크인 목록
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const checkins = await prisma.userCheckin.findMany({
      where: { userId },
      orderBy: { checkedAt: 'desc' }
    });

    res.json({ checkins });
  } catch (error) {
    console.error('체크인 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '체크인 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// GET /api/checkins/stats/:userId - 통계
router.get('/stats/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const [totalCheckins, sessions, booths, posters, quizzesAttempted, quizzesCorrect] = await Promise.all([
      prisma.userCheckin.count({ where: { userId } }),
      prisma.userCheckin.count({ where: { userId, targetType: 'session' } }),
      prisma.userCheckin.count({ where: { userId, targetType: 'booth' } }),
      prisma.userCheckin.count({ where: { userId, targetType: 'poster' } }),
      prisma.userQuizAttempt.count({ where: { userId } }),
      prisma.userQuizAttempt.count({ where: { userId, isCorrect: true } })
    ]);

    res.json({
      stats: {
        totalCheckins,
        sessions,
        booths,
        posters,
        quizzesAttempted,
        quizzesCorrect
      }
    });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '통계 조회 중 오류가 발생했습니다.'
    });
  }
});

export default router;
```

### Step 2: 퀴즈 라우트 생성

**파일**: `moducon-backend/src/routes/quiz.ts`

```typescript
import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/quiz/:targetType/:targetId - 퀴즈 조회
router.get('/:targetType/:targetId', authenticateToken, async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: {
        targetType_targetId: {
          targetType,
          targetId
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: '퀴즈가 존재하지 않습니다.'
      });
    }

    // correctAnswer는 클라이언트에 보내지 않음
    const { correctAnswer, ...quizWithoutAnswer } = quiz;

    res.json({ quiz: quizWithoutAnswer });
  } catch (error) {
    console.error('퀴즈 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '퀴즈 조회 중 오류가 발생했습니다.'
    });
  }
});

// POST /api/quiz/submit - 퀴즈 제출
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { userId, quizId, selectedAnswer } = req.body;

    // 유효성 검증
    if (!userId || !quizId || !selectedAnswer) {
      return res.status(400).json({
        success: false,
        error: '필수 필드가 누락되었습니다.'
      });
    }

    // 퀴즈 조회
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: '퀴즈가 존재하지 않습니다.'
      });
    }

    // 정답 확인
    const isCorrect = selectedAnswer === quiz.correctAnswer;

    // 퀴즈 시도 기록
    const attempt = await prisma.userQuizAttempt.create({
      data: {
        userId,
        quizId,
        selectedAnswer,
        isCorrect
      }
    });

    res.status(201).json({
      success: true,
      isCorrect,
      attempt
    });
  } catch (error) {
    console.error('퀴즈 제출 오류:', error);
    res.status(500).json({
      success: false,
      error: '퀴즈 제출 중 오류가 발생했습니다.'
    });
  }
});

export default router;
```

### Step 3: 라우트 등록

**파일**: `moducon-backend/src/index.ts` (또는 `app.ts`)

```typescript
import checkinRoutes from './routes/checkin';
import quizRoutes from './routes/quiz';

// ... 기존 코드 ...

// 라우트 등록
app.use('/api/checkin', checkinRoutes);
app.use('/api/quiz', quizRoutes);
```

---

## 📊 Phase 5-1: 마이페이지 UI 구현 (40분)

### Step 1: 마이페이지 메인

**파일**: `moducon-frontend/src/app/my/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import Statistics from './components/Statistics';
import VisitHistory from './components/VisitHistory';
import ShareCard from './components/ShareCard';
import { fetchUserCheckins, fetchUserStats } from '@/lib/api/checkin';

interface Stats {
  totalCheckins: number;
  sessions: number;
  booths: number;
  posters: number;
  quizzesAttempted: number;
  quizzesCorrect: number;
}

interface Checkin {
  id: string;
  targetType: string;
  targetId: string;
  checkedAt: string;
}

export default function MyPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // TODO: 실제 userId는 인증 컨텍스트에서 가져오기
        const userId = 'user123';

        const [statsData, checkinsData] = await Promise.all([
          fetchUserStats(userId),
          fetchUserCheckins(userId)
        ]);

        setStats(statsData.stats);
        setCheckins(checkinsData.checkins);
      } catch (error) {
        console.error('데이터 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">마이페이지</h1>

      {/* 자랑하기 카드 */}
      <ShareCard totalCheckins={stats?.totalCheckins || 0} />

      {/* 통계 */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">나의 활동</h2>
        <Statistics stats={stats} />
      </div>

      {/* 방문 기록 */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">방문 기록</h2>
        <VisitHistory checkins={checkins} />
      </div>
    </div>
  );
}
```

### Step 2: 통계 컴포넌트

**파일**: `moducon-frontend/src/app/my/components/Statistics.tsx`

```typescript
interface StatsProps {
  stats: {
    totalCheckins: number;
    sessions: number;
    booths: number;
    posters: number;
    quizzesAttempted: number;
    quizzesCorrect: number;
  } | null;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold text-indigo-600">{value}</span>
      </div>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

export default function Statistics({ stats }: StatsProps) {
  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-8">
        통계 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  const quizAccuracy = stats.quizzesAttempted > 0
    ? Math.round((stats.quizzesCorrect / stats.quizzesAttempted) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard title="총 방문" value={stats.totalCheckins} icon="📍" />
      <StatCard title="세션" value={stats.sessions} icon="🎤" />
      <StatCard title="부스" value={stats.booths} icon="🏢" />
      <StatCard title="포스터" value={stats.posters} icon="📄" />
      <StatCard title="퀴즈 시도" value={stats.quizzesAttempted} icon="❓" />
      <StatCard title="퀴즈 정답률" value={`${quizAccuracy}%`} icon="✅" />
    </div>
  );
}
```

### Step 3: 방문 기록 컴포넌트

**파일**: `moducon-frontend/src/app/my/components/VisitHistory.tsx`

```typescript
interface Checkin {
  id: string;
  targetType: string;
  targetId: string;
  checkedAt: string;
}

interface VisitHistoryProps {
  checkins: Checkin[];
}

function getTargetIcon(type: string): string {
  switch (type) {
    case 'session': return '🎤';
    case 'booth': return '🏢';
    case 'poster': return '📄';
    default: return '📍';
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function VisitHistory({ checkins }: VisitHistoryProps) {
  if (checkins.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
        아직 방문한 곳이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {checkins.map(checkin => (
        <div
          key={checkin.id}
          className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getTargetIcon(checkin.targetType)}</span>
            <div>
              <p className="font-medium text-gray-900">
                {checkin.targetType === 'session' && '세션'}
                {checkin.targetType === 'booth' && '부스'}
                {checkin.targetType === 'poster' && '포스터'}
              </p>
              <p className="text-sm text-gray-500">ID: {checkin.targetId}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">{formatDate(checkin.checkedAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Step 4: 자랑하기 카드

**파일**: `moducon-frontend/src/app/my/components/ShareCard.tsx`

```typescript
'use client';

interface ShareCardProps {
  totalCheckins: number;
}

export default function ShareCard({ totalCheckins }: ShareCardProps) {
  const handleShare = () => {
    // TODO: SNS 공유 기능 구현
    if (navigator.share) {
      navigator.share({
        title: '모두콘 2025 참여!',
        text: `모두콘 2025에서 총 ${totalCheckins}곳을 방문했어요!`,
        url: window.location.origin
      }).catch(err => console.error('공유 실패:', err));
    } else {
      alert('이 브라우저는 공유 기능을 지원하지 않습니다.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
      <h2 className="text-2xl font-bold mb-2">모두콘 2025 참여!</h2>
      <p className="text-sm mb-4 text-indigo-100">총 {totalCheckins}곳 방문</p>
      <button
        onClick={handleShare}
        className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
      >
        SNS 공유하기 📤
      </button>
    </div>
  );
}
```

---

## 📊 Phase 5-2: API 클라이언트 함수 (20분)

### Step 1: 체크인 API 클라이언트

**파일**: `moducon-frontend/src/lib/api/checkin.ts`

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function createCheckin(userId: string, targetType: string, targetId: string) {
  const response = await fetch(`${API_BASE_URL}/api/checkin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // TODO: Authorization 헤더 추가 (JWT 토큰)
    },
    body: JSON.stringify({ userId, targetType, targetId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '체크인 생성 실패');
  }

  return response.json();
}

export async function fetchUserCheckins(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/checkins/user/${userId}`, {
    headers: {
      // TODO: Authorization 헤더 추가
    }
  });

  if (!response.ok) {
    throw new Error('체크인 목록 조회 실패');
  }

  return response.json();
}

export async function fetchUserStats(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/checkins/stats/${userId}`, {
    headers: {
      // TODO: Authorization 헤더 추가
    }
  });

  if (!response.ok) {
    throw new Error('통계 조회 실패');
  }

  return response.json();
}
```

### Step 2: 퀴즈 API 클라이언트

**파일**: `moducon-frontend/src/lib/api/quiz.ts`

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchQuiz(targetType: string, targetId: string) {
  const response = await fetch(`${API_BASE_URL}/api/quiz/${targetType}/${targetId}`, {
    headers: {
      // TODO: Authorization 헤더 추가
    }
  });

  if (response.status === 404) {
    return null; // 퀴즈 없음
  }

  if (!response.ok) {
    throw new Error('퀴즈 조회 실패');
  }

  return response.json();
}

export async function submitQuiz(userId: string, quizId: string, selectedAnswer: string) {
  const response = await fetch(`${API_BASE_URL}/api/quiz/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // TODO: Authorization 헤더 추가
    },
    body: JSON.stringify({ userId, quizId, selectedAnswer })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '퀴즈 제출 실패');
  }

  return response.json();
}
```

---

## ✅ 빌드 검증 순서

### Backend 검증
```bash
cd moducon-backend

# TypeScript 컴파일
npm run build

# 서버 실행 (옵션)
npm run dev
```

### Frontend 검증
```bash
cd moducon-frontend

# TypeScript 컴파일
npm run build

# 개발 서버 실행 (옵션)
npm run dev
```

---

**다음 담당자**: hands-on worker (Phase 3 실행)
