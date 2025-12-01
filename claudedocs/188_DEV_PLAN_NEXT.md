# 188_DEV_PLAN_NEXT.md - Phase 3-5 개발 계획 및 구현 가이드

**작성일**: 2025-12-01
**작성자**: Planner Agent
**버전**: v2.0
**문서 유형**: 실행 가능한 개발 계획

---

## 📋 개발 계획 개요

Phase 3-5는 **데이터베이스 설계 → API 구현 → 마이페이지 UI** 순서로 진행됩니다.

**예상 소요 시간**: 3.5시간
- Phase 3: 15분 (Database)
- Phase 4: 2시간 (API)
- Phase 5: 1시간 (UI)

---

## 🗄️ Phase 3: Database 마이그레이션 (15분)

### 1. Prisma Schema 수정

**파일**: `moducon-backend/prisma/schema.prisma`

```prisma
// 기존 모델 생략...

// 체크인 기록
model CheckIn {
  id          String   @id @default(cuid())
  userId      String
  contentType String   // "session" | "booth" | "paper"
  contentId   String   // 세션/부스/포스터 ID
  checkedAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, contentType, contentId]) // 중복 체크인 방지
  @@index([userId, contentType, contentId])  // 조회 성능 최적화
}

// 퀴즈
model Quiz {
  id             String   @id @default(cuid())
  contentType    String   // "session" | "booth" | "paper"
  contentId      String   // 세션/부스/포스터 ID
  question       String   // 퀴즈 질문
  options        String[] // 선택지 배열 (4개)
  correctAnswer  Int      // 정답 인덱스 (0-3)
  createdAt      DateTime @default(now())

  attempts QuizAttempt[]

  @@index([contentType, contentId]) // 조회 성능 최적화
}

// 퀴즈 제출 기록
model QuizAttempt {
  id             String   @id @default(cuid())
  userId         String
  quizId         String
  selectedAnswer Int      // 사용자가 선택한 답 (0-3)
  isCorrect      Boolean  // 정답 여부
  attemptedAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  quiz Quiz @relation(fields: [quizId], references: [id], onDelete: Cascade)

  @@index([userId, quizId])
}

// User 모델에 관계 추가
model User {
  // ... 기존 필드 생략
  checkIns     CheckIn[]
  quizAttempts QuizAttempt[]
}
```

### 2. 마이그레이션 실행

```bash
cd moducon-backend
npx prisma migrate dev --name add_checkin_quiz_models
npx prisma generate
```

### 3. 검증

```bash
# Prisma Studio로 테이블 확인
npx prisma studio
```

**예상 결과**:
- `CheckIn`, `Quiz`, `QuizAttempt` 테이블 생성
- 인덱스 3개 생성
- User 테이블에 FK 추가

---

## 🔌 Phase 4: 체크인 + 퀴즈 API (2시간)

### 1. 체크인 API 구현 (1시간)

#### 📄 `moducon-backend/src/routes/checkin.ts`

```typescript
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/checkin - QR 스캔 시 체크인 기록
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { contentType, contentId } = req.body;

    // 유효성 검증
    if (!['session', 'booth', 'paper'].includes(contentType)) {
      return res.status(400).json({
        success: false,
        error: 'contentType은 session, booth, paper 중 하나여야 합니다.',
      });
    }

    if (!contentId) {
      return res.status(400).json({
        success: false,
        error: 'contentId는 필수입니다.',
      });
    }

    // 중복 체크인 확인
    const existing = await prisma.checkIn.findUnique({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType,
          contentId,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: '이미 체크인한 컨텐츠입니다.',
      });
    }

    // 체크인 생성
    const checkIn = await prisma.checkIn.create({
      data: {
        userId,
        contentType,
        contentId,
      },
    });

    res.json({
      success: true,
      data: checkIn,
    });
  } catch (error) {
    console.error('CheckIn creation error:', error);
    res.status(500).json({
      success: false,
      error: '체크인 처리 중 오류가 발생했습니다.',
    });
  }
});

// GET /api/checkin - 사용자별 체크인 목록 조회
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { contentType } = req.query;

    const where = contentType
      ? { userId, contentType: contentType as string }
      : { userId };

    const checkIns = await prisma.checkIn.findMany({
      where,
      orderBy: { checkedAt: 'desc' },
    });

    // 통계 계산
    const stats = {
      total: checkIns.length,
      sessions: checkIns.filter((c) => c.contentType === 'session').length,
      booths: checkIns.filter((c) => c.contentType === 'booth').length,
      papers: checkIns.filter((c) => c.contentType === 'paper').length,
    };

    res.json({
      success: true,
      data: {
        checkIns,
        stats,
      },
    });
  } catch (error) {
    console.error('CheckIn fetch error:', error);
    res.status(500).json({
      success: false,
      error: '체크인 목록 조회 중 오류가 발생했습니다.',
    });
  }
});

// GET /api/checkin/status - 특정 컨텐츠 체크인 여부 확인
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { contentType, contentId } = req.query;

    if (!contentType || !contentId) {
      return res.status(400).json({
        success: false,
        error: 'contentType과 contentId는 필수입니다.',
      });
    }

    const checkIn = await prisma.checkIn.findUnique({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType: contentType as string,
          contentId: contentId as string,
        },
      },
    });

    res.json({
      success: true,
      data: {
        isCheckedIn: !!checkIn,
        checkIn,
      },
    });
  } catch (error) {
    console.error('CheckIn status error:', error);
    res.status(500).json({
      success: false,
      error: '체크인 상태 조회 중 오류가 발생했습니다.',
    });
  }
});

export default router;
```

#### 📄 `moducon-backend/src/app.ts` 라우터 등록

```typescript
// ... 기존 코드 생략
import checkinRoutes from './routes/checkin';

// ... 미들웨어 설정 생략

app.use('/api/checkin', checkinRoutes);

// ... 나머지 코드 생략
```

---

### 2. 퀴즈 API 구현 (1시간)

#### 📄 `moducon-backend/src/routes/quiz.ts`

```typescript
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/quiz - 컨텐츠별 퀴즈 조회 (정답 제외)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { contentType, contentId } = req.query;

    if (!contentType || !contentId) {
      return res.status(400).json({
        success: false,
        error: 'contentType과 contentId는 필수입니다.',
      });
    }

    const quiz = await prisma.quiz.findFirst({
      where: {
        contentType: contentType as string,
        contentId: contentId as string,
      },
      select: {
        id: true,
        question: true,
        options: true,
        // correctAnswer는 제외 (보안)
      },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: '해당 컨텐츠의 퀴즈를 찾을 수 없습니다.',
      });
    }

    // 사용자가 이미 시도했는지 확인
    const userId = req.user!.id;
    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        userId,
        quizId: quiz.id,
      },
    });

    res.json({
      success: true,
      data: {
        quiz,
        hasAttempted: !!attempt,
        attempt: attempt
          ? {
              selectedAnswer: attempt.selectedAnswer,
              isCorrect: attempt.isCorrect,
              attemptedAt: attempt.attemptedAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Quiz fetch error:', error);
    res.status(500).json({
      success: false,
      error: '퀴즈 조회 중 오류가 발생했습니다.',
    });
  }
});

// POST /api/quiz/submit - 퀴즈 제출 및 정답 검증
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { quizId, selectedAnswer } = req.body;

    // 유효성 검증
    if (!quizId || selectedAnswer === undefined) {
      return res.status(400).json({
        success: false,
        error: 'quizId와 selectedAnswer는 필수입니다.',
      });
    }

    // 퀴즈 조회 (정답 포함)
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: '퀴즈를 찾을 수 없습니다.',
      });
    }

    // 정답 확인
    const isCorrect = quiz.correctAnswer === selectedAnswer;

    // 퀴즈 시도 기록
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        selectedAnswer,
        isCorrect,
      },
    });

    res.json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: quiz.correctAnswer, // 제출 후에만 정답 공개
        attempt,
      },
    });
  } catch (error) {
    console.error('Quiz submit error:', error);
    res.status(500).json({
      success: false,
      error: '퀴즈 제출 중 오류가 발생했습니다.',
    });
  }
});

export default router;
```

#### 📄 `moducon-backend/src/app.ts` 라우터 등록

```typescript
import quizRoutes from './routes/quiz';

app.use('/api/quiz', quizRoutes);
```

---

## 🎨 Phase 5: 마이페이지 UI (1시간)

### 1. API 클라이언트 함수

#### 📄 `moducon-frontend/src/lib/api/checkin.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export interface CheckInStats {
  total: number;
  sessions: number;
  booths: number;
  papers: number;
}

export interface CheckInResponse {
  checkIns: Array<{
    id: string;
    contentType: string;
    contentId: string;
    checkedAt: string;
  }>;
  stats: CheckInStats;
}

export async function getMyCheckIns(): Promise<CheckInResponse> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/checkin`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('체크인 목록 조회 실패');
  }

  const result = await response.json();
  return result.data;
}
```

---

### 2. 마이페이지 메인 컴포넌트

#### 📄 `moducon-frontend/src/app/mypage/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getMyCheckIns, type CheckInResponse } from '@/lib/api/checkin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

export default function MyPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<CheckInResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getMyCheckIns();
        setData(result);
      } catch (err) {
        setError('데이터를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold">마이페이지</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">전체 체크인</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.stats.total || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">세션</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.stats.sessions || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">부스</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.stats.booths || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">포스터</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.stats.papers || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* 공유하기 버튼 */}
      <Button className="w-full" size="lg">
        <Share2 className="mr-2 h-5 w-5" />
        내 기록 공유하기
      </Button>

      {/* 최근 활동 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.checkIns.length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 체크인한 내역이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {data?.checkIns.slice(0, 10).map((checkIn) => (
                <div key={checkIn.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{checkIn.contentType}</p>
                    <p className="text-xs text-muted-foreground">{checkIn.contentId}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(checkIn.checkedAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## ✅ 테스트 체크리스트

### Phase 3 (Database)
- [ ] `npx prisma migrate dev` 성공
- [ ] Prisma Studio에서 테이블 확인
- [ ] 인덱스 3개 생성 확인

### Phase 4 (API)
#### 체크인 API
- [ ] `POST /api/checkin` - 체크인 성공
- [ ] `POST /api/checkin` - 중복 체크인 409 에러
- [ ] `GET /api/checkin` - 체크인 목록 조회
- [ ] `GET /api/checkin/status` - 체크인 여부 확인

#### 퀴즈 API
- [ ] `GET /api/quiz` - 퀴즈 조회 (정답 제외)
- [ ] `POST /api/quiz/submit` - 정답 제출 및 검증

### Phase 5 (UI)
- [ ] 마이페이지 통계 카드 표시
- [ ] 최근 활동 목록 표시
- [ ] 공유하기 버튼 클릭 가능

---

## 🚀 배포 전 최종 체크

- [ ] TypeScript 타입 에러 없음 (`tsc --noEmit`)
- [ ] ESLint 경고 없음 (`npm run lint`)
- [ ] 모든 API 엔드포인트 테스트 통과
- [ ] 프론트엔드 빌드 성공 (`npm run build`)
- [ ] 백엔드 빌드 성공 (`npm run build`)

---

**다음 담당자**: hands-on worker (Phase 3 Database 마이그레이션 착수)
