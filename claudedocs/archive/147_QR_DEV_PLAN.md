# 147_QR_DEV_PLAN.md - QR 기능 개발 계획

**작성일**: 2025-12-01
**작성자**: Technical Lead
**버전**: v1.0
**기반 문서**: 146_QR_FEATURE_REQUIREMENTS.md

---

## 📋 개발 계획 요약

### Phase 1: 하단 네비게이션 (P0)
- **예상 시간**: 2시간
- **우선순위**: Critical
- **산출물**: BottomNavigation 컴포넌트, 지도 페이지

### Phase 2: QR 스캔 UI 개선 (P0)
- **예상 시간**: 1시간
- **우선순위**: Critical
- **산출물**: 정사각형 스캔 가이드

### Phase 3: 체크인 시스템 (P1)
- **예상 시간**: 4시간
- **우선순위**: High
- **산출물**: 체크인 API, DB 스키마

### Phase 4: 마이페이지 (P1)
- **예상 시간**: 3시간
- **우선순위**: High
- **산출물**: 프로필 페이지, 체크인 내역

### Phase 5: 퀴즈 시스템 (P2)
- **예상 시간**: 4시간
- **우선순위**: Medium
- **산출물**: 퀴즈 API, 팝업 UI

**총 예상 시간**: 14시간 (약 2일)

---

## 🎯 Phase 1: 하단 네비게이션 구현

### 작업 1.1: BottomNavigation 컴포넌트 생성 (1시간)

#### 파일 생성
```
moducon-frontend/src/components/layout/
├── BottomNavigation.tsx        # 🆕 신규
└── Header.tsx                   # ✅ 기존
```

#### 컴포넌트 구조
```tsx
// src/components/layout/BottomNavigation.tsx
'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, Store, FileText, Map, QrCode } from 'lucide-react';
import { QRScannerModal } from '@/components/qr/QRScannerModal';

interface NavTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const TABS: NavTab[] = [
  { id: 'sessions', label: '세션', icon: Calendar, href: '/sessions' },
  { id: 'booths', label: '부스', icon: Store, href: '/booths' },
  { id: 'papers', label: '포스터', icon: FileText, href: '/papers' },
  { id: 'map', label: '지도', icon: Map, href: '/map' },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [qrModalOpen, setQRModalOpen] = useState(false);

  const handleTabClick = (href: string) => {
    router.push(href);
  };

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      {/* 하단 네비게이션 바 */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-lg border-t border-gray-200 z-50">
        <div className="flex items-center justify-around h-full max-w-screen-lg mx-auto px-2">
          {/* 세션, 부스 탭 */}
          {TABS.slice(0, 2).map((tab) => (
            <TabButton
              key={tab.id}
              {...tab}
              active={isActive(tab.href)}
              onClick={() => handleTabClick(tab.href)}
            />
          ))}

          {/* 중앙 QR 버튼 (특별 UI) */}
          <button
            className="relative -top-2 w-16 h-16 rounded-full
                       bg-gradient-to-r from-blue-600 to-blue-800
                       shadow-lg ring-4 ring-white
                       animate-pulse
                       flex flex-col items-center justify-center
                       active:scale-95 transition-transform"
            onClick={() => setQRModalOpen(true)}
            aria-label="QR 스캔"
          >
            <QrCode className="w-6 h-6 text-white" />
            <span className="text-xs text-white mt-0.5">스캔</span>
          </button>

          {/* 포스터, 지도 탭 */}
          {TABS.slice(2).map((tab) => (
            <TabButton
              key={tab.id}
              {...tab}
              active={isActive(tab.href)}
              onClick={() => handleTabClick(tab.href)}
            />
          ))}
        </div>
      </div>

      {/* QR 스캔 모달 */}
      <QRScannerModal
        open={qrModalOpen}
        onClose={() => setQRModalOpen(false)}
      />
    </>
  );
}

// 일반 탭 버튼 컴포넌트
interface TabButtonProps extends NavTab {
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, icon: Icon, active, onClick }: TabButtonProps) {
  return (
    <button
      className={`flex flex-col items-center justify-center space-y-1 px-3 py-1
                  ${active ? 'text-blue-600' : 'text-gray-500'}
                  active:scale-95 transition-all`}
      onClick={onClick}
    >
      <Icon className="w-6 h-6" />
      <span className={`text-xs ${active ? 'font-semibold' : 'font-normal'}`}>
        {label}
      </span>
    </button>
  );
}
```

### 작업 1.2: layout.tsx 적용 (30분)

```tsx
// src/app/layout.tsx
import { BottomNavigation } from '@/components/layout/BottomNavigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50">
        <Header />

        {/* Main Content (하단 네비게이션 높이 제외) */}
        <main className="min-h-screen pb-16">
          {children}
        </main>

        {/* 하단 네비게이션 */}
        <BottomNavigation />
      </body>
    </html>
  );
}
```

### 작업 1.3: 지도 페이지 생성 (30분)

```tsx
// src/app/map/page.tsx
import { Map } from 'lucide-react';

export const metadata = {
  title: '지도 | 모두콘 2025',
  description: '모두콘 2025 컨퍼런스 장소 지도',
};

export default function MapPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px-64px)] px-4">
      {/* 아이콘 */}
      <Map className="w-24 h-24 text-gray-300 mb-4" />

      {/* 제목 */}
      <h1 className="text-2xl font-bold text-gray-700 mb-2">
        지도 페이지
      </h1>

      {/* 설명 */}
      <p className="text-gray-500 text-center">
        컨퍼런스 장소 지도는 추후 추가 예정입니다.
      </p>

      {/* 추가 정보 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-md">
        <p className="text-sm text-blue-700">
          📍 장소: 서울시 강남구 역삼동 모두의연구소
        </p>
      </div>
    </div>
  );
}
```

---

## 🎯 Phase 2: QR 스캔 UI 개선

### 작업 2.1: QRScannerModal 개선 (1시간)

```tsx
// src/components/qr/QRScannerModal.tsx (개선)
'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface QRScannerModalProps {
  open: boolean;
  onClose: () => void;
}

export function QRScannerModal({ open, onClose }: QRScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!open) {
      stopScanner();
      return;
    }

    startScanner();

    return () => {
      stopScanner();
    };
  }, [open]);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 280 }, // 정사각형 박스
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        (error) => {
          // 스캔 실패 (무시)
        }
      );

      setScanning(true);
    } catch (error) {
      console.error('QR 스캐너 시작 실패:', error);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setScanning(false);
      } catch (error) {
        console.error('QR 스캐너 정지 실패:', error);
      }
    }
  };

  const handleScan = async (qrData: string) => {
    console.log('QR 스캔 결과:', qrData);

    // 스캐너 정지
    await stopScanner();

    // QR 데이터 파싱 및 처리
    const action = parseQRCode(qrData);

    // 라우팅 또는 동작 실행
    if (action.route) {
      router.push(action.route);
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full h-full max-w-full p-0 bg-black">
        {/* 닫기 버튼 */}
        <button
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 text-white"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        {/* 카메라 뷰 */}
        <div className="relative flex items-center justify-center h-full">
          <div id="qr-reader" className="w-full max-w-md" />

          {/* 정사각형 스캔 가이드 (오버레이) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[280px] h-[280px] border-4 border-white rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
              {/* 모서리 강조선 (선택) */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-2xl" />
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="absolute bottom-24 left-0 right-0 text-center px-4">
            <p className="text-white text-lg font-medium">
              QR 코드를 박스 안에 맞춰주세요
            </p>
            <p className="text-white/70 text-sm mt-2">
              세션·부스·포스터 체크인 가능
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🎯 Phase 3: 체크인 시스템 구현

### 작업 3.1: Database 스키마 생성 (1시간)

```sql
-- moducon-backend/prisma/schema.prisma 업데이트

// 1. user_checkins 모델 추가
model UserCheckin {
  id           Int      @id @default(autoincrement())
  userId       Int      @map("user_id")
  checkinType  String   @map("checkin_type") @db.VarChar(20)
  targetId     String   @map("target_id") @db.VarChar(50)
  checkedInAt  DateTime @default(now()) @map("checked_in_at")
  quizPassed   Boolean? @map("quiz_passed")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, checkinType, targetId])
  @@index([userId])
  @@index([checkinType])
  @@map("user_checkins")
}

// 2. quizzes 모델 추가
model Quiz {
  id            String   @id @db.VarChar(50)
  targetType    String   @map("target_type") @db.VarChar(20)
  targetId      String   @map("target_id") @db.VarChar(50)
  question      String
  options       Json
  correctAnswer String   @map("correct_answer") @db.VarChar(1)
  createdAt     DateTime @default(now()) @map("created_at")

  attempts UserQuizAttempt[]

  @@map("quizzes")
}

// 3. user_quiz_attempts 모델 추가
model UserQuizAttempt {
  id             Int      @id @default(autoincrement())
  userId         Int      @map("user_id")
  quizId         String   @map("quiz_id") @db.VarChar(50)
  selectedAnswer String   @map("selected_answer") @db.VarChar(1)
  isCorrect      Boolean  @map("is_correct")
  attemptedAt    DateTime @default(now()) @map("attempted_at")

  user User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  quiz Quiz  @relation(fields: [quizId], references: [id])

  @@index([userId])
  @@map("user_quiz_attempts")
}
```

**마이그레이션 실행**:
```bash
cd moducon-backend
npx prisma migrate dev --name add_checkin_quiz_tables
npx prisma generate
```

### 작업 3.2: 체크인 API 구현 (2시간)

#### POST /api/checkin
```typescript
// moducon-backend/src/routes/checkin.ts
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

interface CheckinRequest {
  type: 'session' | 'booth' | 'paper';
  targetId: string;
  timestamp?: string;
}

// POST /api/checkin - 체크인 기록
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { type, targetId, timestamp }: CheckinRequest = req.body;

    // 중복 체크인 확인
    const existing = await prisma.userCheckin.findUnique({
      where: {
        userId_checkinType_targetId: {
          userId,
          checkinType: type,
          targetId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: '이미 체크인한 항목입니다.',
      });
    }

    // 체크인 생성
    const checkin = await prisma.userCheckin.create({
      data: {
        userId,
        checkinType: type,
        targetId,
        checkedInAt: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    // 퀴즈 확인
    const quiz = await prisma.quiz.findFirst({
      where: {
        targetType: type,
        targetId,
      },
    });

    res.json({
      success: true,
      checkin: {
        id: checkin.id,
        type: checkin.checkinType,
        targetId: checkin.targetId,
        checkedInAt: checkin.checkedInAt,
      },
      hasQuiz: !!quiz,
      quizId: quiz?.id,
    });
  } catch (error) {
    console.error('체크인 생성 실패:', error);
    res.status(500).json({
      success: false,
      error: '체크인 생성에 실패했습니다.',
    });
  }
});

// GET /api/checkin/history - 체크인 내역
router.get('/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const checkins = await prisma.userCheckin.findMany({
      where: { userId },
      orderBy: { checkedInAt: 'desc' },
    });

    // 통계 계산
    const stats = {
      totalSessions: checkins.filter(c => c.checkinType === 'session').length,
      totalBooths: checkins.filter(c => c.checkinType === 'booth').length,
      totalPapers: checkins.filter(c => c.checkinType === 'paper').length,
    };

    res.json({
      success: true,
      checkins: checkins.map(c => ({
        id: c.id,
        type: c.checkinType,
        targetId: c.targetId,
        checkedInAt: c.checkedInAt,
        quizPassed: c.quizPassed,
      })),
      stats,
    });
  } catch (error) {
    console.error('체크인 내역 조회 실패:', error);
    res.status(500).json({
      success: false,
      error: '체크인 내역 조회에 실패했습니다.',
    });
  }
});

export default router;
```

### 작업 3.3: QR 파싱 로직 확장 (1시간)

```typescript
// src/lib/qrParser.ts (확장)
export interface QRAction {
  type: 'session' | 'booth' | 'paper' | 'checkin' | 'quiz' | 'hidden';
  id: string;
  action: 'navigate' | 'record' | 'quiz' | 'badge';
  route?: string;
  data?: any;
}

export function parseQRCode(qrData: string): QRAction {
  // 1. 세션 체크인
  if (qrData.startsWith('checkin-session-')) {
    const id = qrData.replace('checkin-session-', '');
    return {
      type: 'checkin',
      id,
      action: 'record',
      route: `/sessions/${id}?checkin=true`,
      data: { type: 'session', targetId: id }
    };
  }

  // 2. 부스 방문
  if (qrData.startsWith('checkin-booth-')) {
    const id = qrData.replace('checkin-booth-', '');
    return {
      type: 'checkin',
      id,
      action: 'record',
      route: `/booths/${id}?checkin=true`,
      data: { type: 'booth', targetId: id }
    };
  }

  // 3. 포스터 열람
  if (qrData.startsWith('checkin-paper-')) {
    const id = qrData.replace('checkin-paper-', '');
    return {
      type: 'checkin',
      id,
      action: 'record',
      route: `/papers/${id}?checkin=true`,
      data: { type: 'paper', targetId: id }
    };
  }

  // 4. 퀴즈 QR
  if (qrData.startsWith('quiz-')) {
    const id = qrData.replace('quiz-', '');
    return {
      type: 'quiz',
      id,
      action: 'quiz',
      data: { quizId: id }
    };
  }

  // 5. 히든 QR
  if (qrData.startsWith('hidden-')) {
    const id = qrData.replace('hidden-', '');
    return {
      type: 'hidden',
      id,
      action: 'badge',
      data: { hiddenId: id }
    };
  }

  // 6. 기본 라우팅 (기존)
  if (qrData.includes('session')) {
    const id = extractId(qrData);
    return {
      type: 'session',
      id,
      action: 'navigate',
      route: `/sessions/${id}`
    };
  }

  if (qrData.includes('booth')) {
    const id = extractId(qrData);
    return {
      type: 'booth',
      id,
      action: 'navigate',
      route: `/booths/${id}`
    };
  }

  if (qrData.includes('paper')) {
    const id = extractId(qrData);
    return {
      type: 'paper',
      id,
      action: 'navigate',
      route: `/papers/${id}`
    };
  }

  // 기본값 (오류)
  throw new Error('알 수 없는 QR 코드 형식입니다.');
}

function extractId(qrData: string): string {
  const match = qrData.match(/\d+/);
  return match ? match[0] : '';
}
```

---

## 🎯 Phase 4: 마이페이지 구현

### 작업 4.1: 프로필 페이지 생성 (2시간)

```tsx
// src/app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Store, FileText } from 'lucide-react';

interface Checkin {
  id: number;
  type: string;
  targetId: string;
  checkedInAt: string;
  quizPassed: boolean | null;
}

interface CheckinStats {
  totalSessions: number;
  totalBooths: number;
  totalPapers: number;
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [stats, setStats] = useState<CheckinStats>({
    totalSessions: 0,
    totalBooths: 0,
    totalPapers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheckinHistory();
  }, []);

  const fetchCheckinHistory = async () => {
    try {
      const response = await fetch('/api/checkin/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setCheckins(data.checkins);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('체크인 내역 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* 사용자 정보 */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-gray-500">전화번호: ***-{user?.phone_last4}</p>
          </div>
          <Badge className="bg-blue-600 text-white">
            출입증
          </Badge>
        </div>
      </Card>

      {/* 체크인 통계 */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">체크인 현황</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>세션 참여</span>
            </div>
            <span className="font-semibold">
              {stats.totalSessions}/32
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="w-5 h-5 text-green-600" />
              <span>부스 방문</span>
            </div>
            <span className="font-semibold">
              {stats.totalBooths}/13
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span>포스터 열람</span>
            </div>
            <span className="font-semibold">
              {stats.totalPapers}/33
            </span>
          </div>
        </div>
      </Card>

      {/* 체크인 내역 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">최근 체크인</h2>
        {loading ? (
          <p className="text-gray-500">로딩 중...</p>
        ) : checkins.length === 0 ? (
          <p className="text-gray-500">체크인 내역이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {checkins.map((checkin) => (
              <div
                key={checkin.id}
                className="flex items-start justify-between border-b pb-3 last:border-b-0"
              >
                <div>
                  <p className="font-medium">
                    {checkin.type === 'session' && '세션'}
                    {checkin.type === 'booth' && '부스'}
                    {checkin.type === 'paper' && '포스터'}
                    {' - '}
                    {checkin.targetId}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(checkin.checkedInAt).toLocaleString('ko-KR')}
                    {checkin.quizPassed !== null && (
                      <span className="ml-2">
                        | 퀴즈 {checkin.quizPassed ? '통과 ✅' : '실패 ❌'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
```

---

## 🎯 Phase 5: 퀴즈 시스템 구현

### 작업 5.1: 퀴즈 API 구현 (2시간)

```typescript
// moducon-backend/src/routes/quiz.ts
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/quiz/:id - 퀴즈 조회
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: '퀴즈를 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      quiz: {
        quizId: quiz.id,
        question: quiz.question,
        options: quiz.options,
        targetType: quiz.targetType,
        targetId: quiz.targetId,
      },
    });
  } catch (error) {
    console.error('퀴즈 조회 실패:', error);
    res.status(500).json({
      success: false,
      error: '퀴즈 조회에 실패했습니다.',
    });
  }
});

// POST /api/quiz/:id/answer - 퀴즈 답변
router.post('/:id/answer', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { selectedAnswer } = req.body;

    // 퀴즈 조회
    const quiz = await prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: '퀴즈를 찾을 수 없습니다.',
      });
    }

    // 정답 확인
    const isCorrect = selectedAnswer === quiz.correctAnswer;

    // 퀴즈 시도 기록
    const attempt = await prisma.userQuizAttempt.create({
      data: {
        userId,
        quizId: id,
        selectedAnswer,
        isCorrect,
      },
    });

    // 정답인 경우 체크인 업데이트
    let checkinId = null;
    if (isCorrect) {
      const checkin = await prisma.userCheckin.findFirst({
        where: {
          userId,
          checkinType: quiz.targetType,
          targetId: quiz.targetId,
        },
      });

      if (checkin) {
        await prisma.userCheckin.update({
          where: { id: checkin.id },
          data: { quizPassed: true },
        });
        checkinId = checkin.id;
      }
    }

    res.json({
      success: true,
      correct: isCorrect,
      message: isCorrect
        ? '정답입니다! 체크인이 완료되었습니다.'
        : '오답입니다. 다시 시도해주세요.',
      checkinId,
    });
  } catch (error) {
    console.error('퀴즈 답변 제출 실패:', error);
    res.status(500).json({
      success: false,
      error: '퀴즈 답변 제출에 실패했습니다.',
    });
  }
});

export default router;
```

### 작업 5.2: 퀴즈 팝업 UI 구현 (2시간)

```tsx
// src/components/quiz/QuizModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface QuizModalProps {
  quizId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Quiz {
  quizId: string;
  question: string;
  options: string[];
  targetType: string;
  targetId: string;
}

export function QuizModal({ quizId, open, onClose, onSuccess }: QuizModalProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);

  useEffect(() => {
    if (open && quizId) {
      fetchQuiz();
    }
  }, [open, quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quiz/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setQuiz(data.quiz);
      }
    } catch (error) {
      console.error('퀴즈 조회 실패:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/quiz/${quizId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ selectedAnswer }),
      });

      const data = await response.json();

      setResult({
        correct: data.correct,
        message: data.message,
      });

      if (data.correct && onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('퀴즈 답변 제출 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>퀴즈</DialogTitle>
        </DialogHeader>

        {quiz && (
          <div className="space-y-4">
            {/* 질문 */}
            <p className="text-lg font-medium">{quiz.question}</p>

            {/* 선택지 */}
            <div className="space-y-2">
              {quiz.options.map((option, index) => {
                const letter = String.fromCharCode(65 + index); // A, B, C, D
                return (
                  <button
                    key={letter}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all
                              ${selectedAnswer === letter
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                              }`}
                    onClick={() => setSelectedAnswer(letter)}
                  >
                    <span className="font-semibold">{letter}. </span>
                    {option}
                  </button>
                );
              })}
            </div>

            {/* 결과 메시지 */}
            {result && (
              <div
                className={`p-4 rounded-lg ${
                  result.correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {result.message}
              </div>
            )}

            {/* 제출 버튼 */}
            {!result && (
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={!selectedAnswer || loading}
              >
                {loading ? '제출 중...' : '답변 제출'}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

## 📋 테스트 계획

### 단위 테스트
- [ ] parseQRCode() 함수 (다양한 QR 형식)
- [ ] API 엔드포인트 (/api/checkin, /api/quiz)
- [ ] localStorage 캐싱

### 통합 테스트
- [ ] QR 스캔 → 체크인 기록
- [ ] 퀴즈 통과 → 체크인 업데이트
- [ ] 마이페이지 데이터 표시

### UI/UX 테스트
- [ ] 하단 네비게이션 동작
- [ ] QR 중앙 버튼 클릭 → 모달 열기
- [ ] 정사각형 스캔 가이드 표시
- [ ] 체크인 내역 표시

---

**작성 완료일**: 2025-12-01
**버전**: v1.0
**다음 단계**: 구현 착수
**담당자**: hands-on worker
