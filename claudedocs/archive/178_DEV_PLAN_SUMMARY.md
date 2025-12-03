# 178_DEV_PLAN_SUMMARY.md - 개발 계획 요약본

**작성일**: 2025-12-01
**작성자**: Technical Lead
**버전**: v1.0
**문서 유형**: 개발 계획 통합 요약

---

## 🎯 Phase 3-5 개발 계획 (3.25시간)

### Phase 3: Database 마이그레이션 (15분)

#### 작업 내용
1. **schema.prisma 수정** (3개 모델 추가)
2. **마이그레이션 실행**: `npx prisma migrate dev`
3. **검증**: Prisma Studio 또는 빌드

#### 신규 테이블 (3개)

**1. user_checkins**
```prisma
model UserCheckin {
  id           Int      @id @default(autoincrement())
  userId       Int      @map("user_id")
  targetType   String   @map("target_type") // 'session', 'booth', 'paper'
  targetId     String   @map("target_id")
  checkedInAt  DateTime @default(now()) @map("checked_in_at")

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, targetType, targetId]) // 중복 방지
  @@index([userId])
  @@map("user_checkins")
}
```

**2. quizzes**
```prisma
model Quiz {
  id         Int      @id @default(autoincrement())
  targetType String   @map("target_type")
  targetId   String   @map("target_id")
  question   String   @db.Text
  answer     String
  options    Json     // {"A": "AI/ML", "B": "데이터", ...}
  createdAt  DateTime @default(now()) @map("created_at")

  attempts UserQuizAttempt[]

  @@map("quizzes")
}
```

**3. user_quiz_attempts**
```prisma
model UserQuizAttempt {
  id            Int      @id @default(autoincrement())
  userId        Int      @map("user_id")
  quizId        Int      @map("quiz_id")
  selectedAnswer String   @map("selected_answer")
  isCorrect     Boolean  @map("is_correct")
  attemptedAt   DateTime @default(now()) @map("attempted_at")

  user User @relation(fields: [userId], references: [id])
  quiz Quiz @relation(fields: [quizId], references: [id])

  @@index([userId])
  @@map("user_quiz_attempts")
}
```

---

### Phase 4: 체크인 + 퀴즈 API (2시간)

#### 작업 내용
1. **체크인 API 구현** (1시간): 3개 엔드포인트
2. **퀴즈 API 구현** (1시간): 2개 엔드포인트

#### 신규 엔드포인트 (5개)

**1. POST /api/checkin**
```typescript
// 요청
{
  "targetType": "session" | "booth" | "paper",
  "targetId": "session-1"
}

// 응답
{
  "success": true,
  "checkin": {
    "id": 123,
    "targetType": "session",
    "targetId": "session-1",
    "checkedInAt": "2025-12-01T09:00:00Z"
  }
}
```

**2. GET /api/checkins/user/:userId**
```typescript
// 응답
{
  "checkins": [
    {
      "id": 123,
      "targetType": "session",
      "targetId": "session-1",
      "checkedInAt": "2025-12-01T09:00:00Z"
    }
  ]
}
```

**3. GET /api/checkins/stats/:userId**
```typescript
// 응답
{
  "stats": {
    "totalCheckins": 25,
    "sessionCheckins": 8,
    "boothCheckins": 5,
    "paperCheckins": 12,
    "quizAttempts": 10,
    "quizCorrect": 7
  }
}
```

**4. GET /api/quiz/:targetType/:targetId**
```typescript
// 응답
{
  "quiz": {
    "id": 1,
    "question": "이 세션의 주요 주제는?",
    "options": {
      "A": "AI/ML",
      "B": "데이터 엔지니어링",
      "C": "클라우드",
      "D": "보안"
    }
    // 정답은 클라이언트에 노출 안 됨
  }
}
```

**5. POST /api/quiz/submit**
```typescript
// 요청
{
  "quizId": 1,
  "selectedAnswer": "A"
}

// 응답
{
  "isCorrect": true,
  "correctAnswer": "A" // 정답 시에만 노출
}
```

---

### Phase 5: 마이페이지 UI (1시간)

#### 작업 내용
1. **MyPage 메인** (20분): 3개 섹션 통합
2. **Statistics 컴포넌트** (15분): 6개 통계 카드
3. **VisitHistory 컴포넌트** (15분): 방문 기록 목록
4. **ShareCard 컴포넌트** (10분): 자랑하기 카드

#### 신규 컴포넌트 (4개)

**1. MyPage.tsx** (메인 페이지)
```tsx
// src/app/my/page.tsx
export default function MyPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<Checkin[]>([]);

  useEffect(() => {
    fetchStats(); // GET /api/checkins/stats/:userId
    fetchHistory(); // GET /api/checkins/user/:userId
  }, []);

  return (
    <div className="space-y-6 p-4">
      <ShareCard stats={stats} />
      <Statistics stats={stats} />
      <VisitHistory history={history} />
    </div>
  );
}
```

**2. Statistics.tsx** (통계 카드)
```tsx
// src/app/my/components/Statistics.tsx
export default function Statistics({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard icon="🎓" label="세션 참여" value={`${stats.sessionCheckins}/32`} />
      <StatCard icon="🏢" label="부스 방문" value={`${stats.boothCheckins}/12`} />
      <StatCard icon="📄" label="포스터 열람" value={`${stats.paperCheckins}/33`} />
      <StatCard icon="❓" label="퀴즈 시도" value={stats.quizAttempts} />
      <StatCard icon="✅" label="퀴즈 정답" value={stats.quizCorrect} />
      <StatCard icon="🎯" label="총 체크인" value={stats.totalCheckins} />
    </div>
  );
}
```

**3. VisitHistory.tsx** (방문 기록)
```tsx
// src/app/my/components/VisitHistory.tsx
export default function VisitHistory({ history }: { history: Checkin[] }) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold">방문 기록</h2>
      {history.map((item) => (
        <div key={item.id} className="flex items-center gap-2 p-3 bg-white rounded-lg shadow">
          {getIcon(item.targetType)}
          <div className="flex-1">
            <p className="font-medium">{item.targetId}</p>
            <p className="text-sm text-gray-500">
              {new Date(item.checkedInAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**4. ShareCard.tsx** (자랑하기)
```tsx
// src/app/my/components/ShareCard.tsx
export default function ShareCard({ stats }: { stats: Stats }) {
  const handleDownload = async () => {
    // QR 코드 생성 + 통계 이미지 다운로드
    const canvas = generateQRWithStats(stats);
    const blob = await canvas.toBlob();
    downloadBlob(blob, 'moducon-2025-achievement.png');
  };

  return (
    <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">모두콘 2025 참여 인증</h2>
      <div className="flex flex-col items-center gap-4">
        <QRCodeCanvas value={`moducon-2025-${stats.totalCheckins}`} size={200} />
        <button
          onClick={handleDownload}
          className="bg-white text-primary px-6 py-2 rounded-lg font-medium"
        >
          이미지 저장
        </button>
      </div>
    </div>
  );
}
```

---

## 📁 파일 변경 사항 (예상)

### Backend (Phase 3-4)
```
moducon-backend/
├── prisma/
│   └── schema.prisma                    (수정 - 3개 모델 추가)
└── src/
    ├── routes/
    │   ├── checkin.ts                   (신규 - 3개 엔드포인트)
    │   └── quiz.ts                      (신규 - 2개 엔드포인트)
    └── index.ts                         (수정 - 라우트 등록)
```

### Frontend (Phase 5)
```
moducon-frontend/src/
├── app/
│   └── my/
│       ├── page.tsx                     (신규 - 마이페이지 메인)
│       └── components/
│           ├── Statistics.tsx           (신규 - 통계)
│           ├── VisitHistory.tsx         (신규 - 방문 기록)
│           └── ShareCard.tsx            (신규 - 자랑하기)
├── components/
│   ├── QRScanner.tsx                    (수정 - API 호출 추가)
│   └── QuizModal.tsx                    (신규 - 퀴즈 모달)
└── lib/
    └── api/
        ├── checkin.ts                   (신규 - 체크인 API)
        └── quiz.ts                      (신규 - 퀴즈 API)
```

---

## 🔄 QR 스캔 플로우 (통합)

### 1단계: QR 스캔 (완료 ✅)
```typescript
// BottomNavigation.tsx
<button onClick={() => setShowQRScanner(true)}>
  <QrCode className="w-7 h-7" />
</button>
```

### 2단계: 카메라 활성화 (완료 ✅)
```typescript
// QRScanner.tsx
const scanner = new Html5Qrcode("qr-reader");
await scanner.start(
  { facingMode: "environment" },
  config,
  onScanSuccess
);
```

### 3단계: QR 값 파싱 (완료 ✅)
```typescript
// qrParser.ts
const parsed = parseQR(qrValue);
// "checkin-session-1" → { type: 'checkin', targetType: 'session', id: '1' }
```

### 4단계: 퀴즈 확인 (예정 ⏳)
```typescript
// QRScanner.tsx
const quiz = await fetch(`/api/quiz/${targetType}/${targetId}`);
if (quiz) {
  setShowQuizModal(true);
} else {
  await checkin(targetType, targetId);
}
```

### 5단계: 퀴즈 모달 (예정 ⏳)
```typescript
// QuizModal.tsx
const handleSubmit = async () => {
  const result = await fetch('/api/quiz/submit', {
    method: 'POST',
    body: JSON.stringify({ quizId, selectedAnswer })
  });

  if (result.isCorrect) {
    await checkin(targetType, targetId);
  }
};
```

### 6단계: 체크인 API (예정 ⏳)
```typescript
// lib/api/checkin.ts
export async function checkin(targetType: string, targetId: string) {
  const response = await fetch('/api/checkin', {
    method: 'POST',
    body: JSON.stringify({ targetType, targetId })
  });
  return response.json();
}
```

---

## 🎨 UI 특이사항 정리

### 1. 하단 네비게이션 (BottomNavigation.tsx)
- **중앙 원형 QR 버튼**: `-top-2`로 살짝 올라감
- **그라데이션**: `from-primary to-primary/80`
- **쉐도우**: `shadow-[0_4px_12px_rgba(79,70,229,0.4)]`
- **Pulse 애니메이션**: `animate-pulse`

### 2. QR 스캔 UI (QRScanner.tsx)
- **전체 화면 카메라**: `fixed inset-0`
- **정사각형 가이드**: `w-[280px] h-[280px]`
- **외부 어둡게**: `shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]`
- **모서리 강조**: 4개 모서리 흰색 테두리

### 3. 마이페이지 (MyPage)
- **ShareCard**: 그라데이션 배경 + QR 코드 중앙
- **Statistics**: 2열 그리드 (6개 카드)
- **VisitHistory**: 리스트 레이아웃 (아이콘 + 텍스트)

---

## ⚙️ 기술 특이사항

### Database
- **중복 방지**: `@@unique([userId, targetType, targetId])`
  - 같은 사용자가 같은 세션을 2번 체크인 불가
- **인덱스 최적화**: userId, targetType, targetId
  - 빠른 조회를 위한 복합 인덱스

### API
- **정답 숨김**: 퀴즈 조회 시 정답을 클라이언트에 노출 안 함
  - 보안상 서버에서만 검증
- **에러 핸들링**: 일관된 에러 응답 구조
  ```typescript
  {
    "error": "DUPLICATE_CHECKIN",
    "message": "이미 체크인하셨습니다."
  }
  ```

### 페이지
- **동적 라우트**: 77개 정적 페이지 생성
  - 세션 32개: `/sessions/[id]`
  - 부스 12개: `/booths/[id]`
  - 포스터 33개: `/papers/[id]`

---

## 📊 작업 체크리스트

### Phase 3: Database (15분)
- [ ] schema.prisma 수정 (3개 모델 추가)
- [ ] `npx prisma migrate dev --name add_checkin_quiz_tables` 실행
- [ ] Prisma Studio 검증 (user_checkins, quizzes, user_quiz_attempts 테이블 확인)
- [ ] TypeScript 빌드 검증 (`npm run build`)
- [ ] Git 커밋

### Phase 4: API (2시간)
- [ ] src/routes/checkin.ts 생성 (3개 엔드포인트)
- [ ] src/routes/quiz.ts 생성 (2개 엔드포인트)
- [ ] index.ts 라우트 등록
- [ ] Postman/Thunder Client API 테스트
- [ ] Git 커밋

### Phase 5: Frontend (1시간)
- [ ] app/my/page.tsx 생성 (메인)
- [ ] app/my/components/Statistics.tsx 생성
- [ ] app/my/components/VisitHistory.tsx 생성
- [ ] app/my/components/ShareCard.tsx 생성
- [ ] lib/api/checkin.ts 생성 (API 클라이언트)
- [ ] lib/api/quiz.ts 생성 (API 클라이언트)
- [ ] QRScanner.tsx 수정 (퀴즈 연동)
- [ ] QuizModal.tsx 생성 (퀴즈 모달)
- [ ] TypeScript 빌드 검증 (`npm run build`)
- [ ] Git 커밋

---

## 🚀 다음 작업 우선순위

### 🔴 P0: 즉시 착수 (긴급)
1. **카메라 영상 수정** (30분) - 사용자 요구사항
   - QRScanner.tsx 수정
   - 1개 비디오만 표시
   - 정사각형 박스 안에 영상 표시

2. **Phase 3 착수** (15분)
   - schema.prisma 수정
   - npx prisma migrate dev 실행

### 🟡 P1: 1일 내
3. **Phase 4 착수** (2시간)
   - 체크인 API (1시간)
   - 퀴즈 API (1시간)

4. **Phase 5 착수** (1시간)
   - 마이페이지 UI (4개 컴포넌트)

---

**작성 완료 시각**: 2025-12-01 11:30 KST
**문서 버전**: v1.0
**다음 담당자**: hands-on worker (카메라 영상 수정 작업)
