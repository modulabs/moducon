# 184_DEV_PLAN_NEXT.md - Phase 3-5 개발 계획 및 구현 가이드

**작성일**: 2025-12-01
**작성자**: Technical Lead
**버전**: v2.0
**문서 유형**: 개발 계획 및 구현 가이드

---

## 📋 개요

Phase 3-5 개발 작업의 상세 구현 가이드입니다.
총 예상 작업 시간은 **3.25시간**입니다.

---

## 🎯 Phase 3: Database 마이그레이션 (15분)

### 작업 순서

1. **schema.prisma 수정** (5분)
2. **마이그레이션 실행** (5분)
3. **검증** (5분)

### 상세 작업

#### 1단계: schema.prisma 수정

**파일 위치**: `moducon-backend/prisma/schema.prisma`

**추가할 모델** (3개):

```prisma
// 체크인 기록
model UserCheckin {
  id           Int      @id @default(autoincrement())
  userId       Int      @map("user_id")
  targetType   String   @map("target_type") // 'session', 'booth', 'paper'
  targetId     String   @map("target_id")
  checkedInAt  DateTime @default(now()) @map("checked_in_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, targetType, targetId]) // 중복 방지
  @@index([userId])
  @@index([targetType, targetId])
  @@map("user_checkins")
}

// 퀴즈 문제
model Quiz {
  id         Int      @id @default(autoincrement())
  targetType String   @map("target_type")
  targetId   String   @map("target_id")
  question   String   @db.Text
  answer     String   // 정답 (A, B, C, D 등)
  options    Json     // {"A": "AI/ML", "B": "데이터", "C": "클라우드", "D": "보안"}
  createdAt  DateTime @default(now()) @map("created_at")

  attempts UserQuizAttempt[]

  @@index([targetType, targetId])
  @@map("quizzes")
}

// 퀴즈 응답 기록
model UserQuizAttempt {
  id            Int      @id @default(autoincrement())
  userId        Int      @map("user_id")
  quizId        Int      @map("quiz_id")
  selectedAnswer String   @map("selected_answer")
  isCorrect     Boolean  @map("is_correct")
  attemptedAt   DateTime @default(now()) @map("attempted_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  quiz Quiz @relation(fields: [quizId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([quizId])
  @@map("user_quiz_attempts")
}
```

**User 모델에 관계 추가**:
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now()) @map("created_at")

  sessions     AuthSession[]
  signatures   Signature[]
  checkins     UserCheckin[]        // 추가
  quizAttempts UserQuizAttempt[]    // 추가

  @@map("users")
}
```

#### 2단계: 마이그레이션 실행

```bash
cd moducon-backend

# 마이그레이션 생성 및 실행
npx prisma migrate dev --name add_checkin_quiz_tables

# 생성된 타입 확인
npx prisma generate
```

#### 3단계: 검증

```bash
# Prisma Studio로 테이블 확인
npx prisma studio

# 또는 TypeScript 빌드 검증
npm run build
```

**검증 항목**:
- [ ] user_checkins 테이블 생성 확인
- [ ] quizzes 테이블 생성 확인
- [ ] user_quiz_attempts 테이블 생성 확인
- [ ] unique 제약조건 확인
- [ ] 인덱스 생성 확인
- [ ] TypeScript 타입 생성 확인

---

## 🔌 Phase 4: 체크인 + 퀴즈 API (2시간)

### 작업 순서

1. **체크인 API 구현** (1시간)
   - src/routes/checkin.ts 생성
   - 3개 엔드포인트 구현
2. **퀴즈 API 구현** (1시간)
   - src/routes/quiz.ts 생성
   - 2개 엔드포인트 구현

### 상세 작업

#### 1단계: 체크인 API 구현

**파일 위치**: `moducon-backend/src/routes/checkin.ts`

**구현 코드**:

```typescript
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// 1. POST /api/checkin - 체크인 생성
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { targetType, targetId } = req.body;
    const userId = (req as any).user.id;

    // 유효성 검사
    if (!['session', 'booth', 'paper'].includes(targetType)) {
      return res.status(400).json({
        error: 'INVALID_TARGET_TYPE',
        message: 'targetType은 session, booth, paper 중 하나여야 합니다.'
      });
    }

    // 중복 체크인 방지 (unique 제약조건)
    const existingCheckin = await prisma.userCheckin.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType,
          targetId
        }
      }
    });

    if (existingCheckin) {
      return res.status(409).json({
        error: 'DUPLICATE_CHECKIN',
        message: '이미 체크인하셨습니다.'
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
    console.error('체크인 생성 실패:', error);
    res.status(500).json({
      error: 'CHECKIN_FAILED',
      message: '체크인 처리 중 오류가 발생했습니다.'
    });
  }
});

// 2. GET /api/checkins/user/:userId - 사용자별 체크인 목록
router.get('/user/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const requestUserId = (req as any).user.id;

    // 본인의 체크인 목록만 조회 가능
    if (parseInt(userId) !== requestUserId) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: '본인의 체크인 목록만 조회할 수 있습니다.'
      });
    }

    const checkins = await prisma.userCheckin.findMany({
      where: {
        userId: parseInt(userId)
      },
      orderBy: {
        checkedInAt: 'desc'
      }
    });

    res.json({ checkins });
  } catch (error) {
    console.error('체크인 목록 조회 실패:', error);
    res.status(500).json({
      error: 'FETCH_FAILED',
      message: '체크인 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// 3. GET /api/checkins/stats/:userId - 사용자 통계
router.get('/stats/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const requestUserId = (req as any).user.id;

    // 본인의 통계만 조회 가능
    if (parseInt(userId) !== requestUserId) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: '본인의 통계만 조회할 수 있습니다.'
      });
    }

    // 체크인 통계
    const [
      totalCheckins,
      sessionCheckins,
      boothCheckins,
      paperCheckins,
      quizAttempts,
      quizCorrect
    ] = await Promise.all([
      prisma.userCheckin.count({ where: { userId: parseInt(userId) } }),
      prisma.userCheckin.count({ where: { userId: parseInt(userId), targetType: 'session' } }),
      prisma.userCheckin.count({ where: { userId: parseInt(userId), targetType: 'booth' } }),
      prisma.userCheckin.count({ where: { userId: parseInt(userId), targetType: 'paper' } }),
      prisma.userQuizAttempt.count({ where: { userId: parseInt(userId) } }),
      prisma.userQuizAttempt.count({ where: { userId: parseInt(userId), isCorrect: true } })
    ]);

    res.json({
      stats: {
        totalCheckins,
        sessionCheckins,
        boothCheckins,
        paperCheckins,
        quizAttempts,
        quizCorrect
      }
    });
  } catch (error) {
    console.error('통계 조회 실패:', error);
    res.status(500).json({
      error: 'STATS_FAILED',
      message: '통계 조회 중 오류가 발생했습니다.'
    });
  }
});

export default router;
```

#### 2단계: 퀴즈 API 구현

**파일 위치**: `moducon-backend/src/routes/quiz.ts`

**구현 코드**:

```typescript
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// 1. GET /api/quiz/:targetType/:targetId - 퀴즈 조회 (정답 숨김)
router.get('/:targetType/:targetId', authenticate, async (req: Request, res: Response) => {
  try {
    const { targetType, targetId } = req.params;

    const quiz = await prisma.quiz.findFirst({
      where: {
        targetType,
        targetId
      },
      select: {
        id: true,
        question: true,
        options: true,
        // answer는 클라이언트에 노출하지 않음 (보안)
      }
    });

    if (!quiz) {
      return res.status(404).json({
        error: 'QUIZ_NOT_FOUND',
        message: '퀴즈를 찾을 수 없습니다.'
      });
    }

    res.json({ quiz });
  } catch (error) {
    console.error('퀴즈 조회 실패:', error);
    res.status(500).json({
      error: 'QUIZ_FETCH_FAILED',
      message: '퀴즈 조회 중 오류가 발생했습니다.'
    });
  }
});

// 2. POST /api/quiz/submit - 퀴즈 제출 및 정답 확인
router.post('/submit', authenticate, async (req: Request, res: Response) => {
  try {
    const { quizId, selectedAnswer } = req.body;
    const userId = (req as any).user.id;

    // 퀴즈 조회
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    });

    if (!quiz) {
      return res.status(404).json({
        error: 'QUIZ_NOT_FOUND',
        message: '퀴즈를 찾을 수 없습니다.'
      });
    }

    // 정답 확인
    const isCorrect = selectedAnswer === quiz.answer;

    // 응답 기록 저장
    const attempt = await prisma.userQuizAttempt.create({
      data: {
        userId,
        quizId,
        selectedAnswer,
        isCorrect
      }
    });

    res.json({
      isCorrect,
      correctAnswer: isCorrect ? quiz.answer : undefined // 정답 시에만 노출
    });
  } catch (error) {
    console.error('퀴즈 제출 실패:', error);
    res.status(500).json({
      error: 'QUIZ_SUBMIT_FAILED',
      message: '퀴즈 제출 중 오류가 발생했습니다.'
    });
  }
});

export default router;
```

#### 3단계: 라우트 등록

**파일 위치**: `moducon-backend/src/index.ts`

```typescript
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import checkinRoutes from './routes/checkin';  // 추가
import quizRoutes from './routes/quiz';        // 추가

const app = express();

app.use(cors());
app.use(express.json());

// 라우트 등록
app.use('/api/auth', authRoutes);
app.use('/api/checkin', checkinRoutes);      // 추가
app.use('/api/quiz', quizRoutes);            // 추가

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 🎨 Phase 5: 마이페이지 UI (1시간)

### 작업 순서

1. **MyPage 메인** (20분)
2. **Statistics 컴포넌트** (15분)
3. **VisitHistory 컴포넌트** (15분)
4. **ShareCard 컴포넌트** (10분)

### 상세 작업

#### 1단계: MyPage 메인 페이지

**파일 위치**: `moducon-frontend/src/app/my/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Statistics } from './components/Statistics';
import { VisitHistory } from './components/VisitHistory';
import { ShareCard } from './components/ShareCard';

interface Stats {
  totalCheckins: number;
  sessionCheckins: number;
  boothCheckins: number;
  paperCheckins: number;
  quizAttempts: number;
  quizCorrect: number;
}

interface Checkin {
  id: number;
  targetType: string;
  targetId: string;
  checkedInAt: string;
}

export default function MyPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // 통계 조회
        const statsRes = await fetch(`/api/checkins/stats/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const statsData = await statsRes.json();
        setStats(statsData.stats);

        // 방문 기록 조회
        const historyRes = await fetch(`/api/checkins/user/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const historyData = await historyRes.json();
        setHistory(historyData.checkins);
      } catch (error) {
        console.error('데이터 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">마이페이지</h1>
      {stats && <ShareCard stats={stats} />}
      {stats && <Statistics stats={stats} />}
      <VisitHistory history={history} />
    </div>
  );
}
```

#### 2단계: Statistics 컴포넌트

**파일 위치**: `moducon-frontend/src/app/my/components/Statistics.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{icon}</span>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatisticsProps {
  stats: {
    totalCheckins: number;
    sessionCheckins: number;
    boothCheckins: number;
    paperCheckins: number;
    quizAttempts: number;
    quizCorrect: number;
  };
}

export function Statistics({ stats }: StatisticsProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">통계</h2>
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon="🎓" label="세션 참여" value={`${stats.sessionCheckins}/32`} />
        <StatCard icon="🏢" label="부스 방문" value={`${stats.boothCheckins}/12`} />
        <StatCard icon="📄" label="포스터 열람" value={`${stats.paperCheckins}/33`} />
        <StatCard icon="❓" label="퀴즈 시도" value={stats.quizAttempts} />
        <StatCard icon="✅" label="퀴즈 정답" value={stats.quizCorrect} />
        <StatCard icon="🎯" label="총 체크인" value={stats.totalCheckins} />
      </div>
    </div>
  );
}
```

#### 3단계: VisitHistory 컴포넌트

**파일 위치**: `moducon-frontend/src/app/my/components/VisitHistory.tsx`

```typescript
import { Calendar, Store, FileText } from 'lucide-react';

interface Checkin {
  id: number;
  targetType: string;
  targetId: string;
  checkedInAt: string;
}

interface VisitHistoryProps {
  history: Checkin[];
}

function getIcon(type: string) {
  switch (type) {
    case 'session':
      return <Calendar className="w-6 h-6 text-primary" />;
    case 'booth':
      return <Store className="w-6 h-6 text-primary" />;
    case 'paper':
      return <FileText className="w-6 h-6 text-primary" />;
    default:
      return null;
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case 'session':
      return '세션';
    case 'booth':
      return '부스';
    case 'paper':
      return '포스터';
    default:
      return type;
  }
}

export function VisitHistory({ history }: VisitHistoryProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">방문 기록</h2>
      {history.length === 0 ? (
        <p className="text-muted-foreground">아직 방문 기록이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {history.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow border">
              {getIcon(item.targetType)}
              <div className="flex-1">
                <p className="font-medium">
                  {getTypeLabel(item.targetType)} - {item.targetId}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(item.checkedInAt).toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### 4단계: ShareCard 컴포넌트

**파일 위치**: `moducon-frontend/src/app/my/components/ShareCard.tsx`

```typescript
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';

interface ShareCardProps {
  stats: {
    totalCheckins: number;
    sessionCheckins: number;
    boothCheckins: number;
    paperCheckins: number;
  };
}

export function ShareCard({ stats }: ShareCardProps) {
  const handleDownload = () => {
    // QR 코드 + 통계 이미지 생성 및 다운로드
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = 600;
    canvas.height = 800;

    // 배경 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, 600, 0);
    gradient.addColorStop(0, '#4F46E5');
    gradient.addColorStop(1, '#7C3AED');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 800);

    // 제목
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('모두콘 2025 참여 인증', 50, 80);

    // 통계 텍스트
    ctx.font = '24px sans-serif';
    ctx.fillText(`총 체크인: ${stats.totalCheckins}`, 50, 140);
    ctx.fillText(`세션 참여: ${stats.sessionCheckins}/32`, 50, 180);
    ctx.fillText(`부스 방문: ${stats.boothCheckins}/12`, 50, 220);
    ctx.fillText(`포스터 열람: ${stats.paperCheckins}/33`, 50, 260);

    // 다운로드
    const link = document.createElement('a');
    link.download = `moducon-2025-${stats.totalCheckins}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold mb-4">모두콘 2025 참여 인증</h2>
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              value={`moducon-2025-${stats.totalCheckins}`}
              size={200}
            />
          </div>
          <Button
            onClick={handleDownload}
            variant="secondary"
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            이미지 저장
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 📦 필요한 패키지 설치

### Frontend

```bash
cd moducon-frontend

# QR 코드 생성 라이브러리
npm install qrcode.react
```

---

## 🧪 테스트 체크리스트

### Phase 3: Database
- [ ] `npx prisma migrate dev` 실행 성공
- [ ] Prisma Studio에서 3개 테이블 확인
- [ ] TypeScript 빌드 성공 (`npm run build`)

### Phase 4: API
- [ ] POST /api/checkin - 체크인 생성 성공
- [ ] POST /api/checkin - 중복 체크인 방지 확인
- [ ] GET /api/checkins/user/:userId - 목록 조회 성공
- [ ] GET /api/checkins/stats/:userId - 통계 조회 성공
- [ ] GET /api/quiz/:targetType/:targetId - 퀴즈 조회 성공 (정답 숨김 확인)
- [ ] POST /api/quiz/submit - 퀴즈 제출 성공 (정답/오답 확인)

### Phase 5: Frontend
- [ ] /my 페이지 접근 성공
- [ ] Statistics 컴포넌트 표시 확인
- [ ] VisitHistory 컴포넌트 표시 확인
- [ ] ShareCard QR 코드 생성 확인
- [ ] 이미지 다운로드 기능 확인

---

## 🚀 배포 전 최종 체크

### 1. 환경 변수 확인
- [ ] DATABASE_URL 설정 확인
- [ ] JWT_SECRET 설정 확인
- [ ] CORS 설정 확인

### 2. 빌드 검증
- [ ] Backend: `npm run build` 성공
- [ ] Frontend: `npm run build` 성공

### 3. 데이터 마이그레이션
- [ ] 프로덕션 DB에 마이그레이션 실행
- [ ] 퀴즈 데이터 시딩 (옵션)

---

**작성 완료 시각**: 2025-12-01 16:30 KST
**문서 버전**: v2.0
**다음 담당자**: hands-on worker (Phase 3 Database 작업 착수)
