# 71_MOBILE_PWA_DEV_PLAN.md - 모바일 PWA 개발 계획서

## 📋 문서 정보
- **작성자**: Technical Lead
- **작성일**: 2025-11-28
- **버전**: v1.0
- **프로젝트**: 모두콘 2025 디지털 컨퍼런스 북 - 모바일 PWA

---

## 🎯 프로젝트 개요

### 목표
**모바일 최적화 PWA**로 참가자가 컨퍼런스 현장에서 쉽게 사용할 수 있는 디지털 가이드북 개발

### 핵심 가치
1. **Mobile-First**: 모바일 환경 최적화 (QR 스캔, 터치 UI)
2. **Progressive**: 점진적 기능 추가 (오프라인 지원, 푸시 알림)
3. **Web-based**: 앱 설치 불필요 (브라우저에서 즉시 실행)

### 기술 스택 (PRD 준수)
- **Framework**: Next.js 14+ (Static Export, App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **QR**: html5-qrcode
- **PWA**: next-pwa (Service Worker)
- **Deployment**: GitHub Pages

---

## 📊 개발 범위

### Phase 2.1: 프로젝트 초기화 (1일)

**목표**: 모바일 PWA 프로젝트 세팅 완료

#### 작업 항목
1. **Git 브랜치 생성**
   ```bash
   git checkout main
   git checkout -b mobile-pwa-dev
   ```

2. **디렉토리 구조**
   ```
   moducon-frontend/
   ├── src/
   │   ├── app/
   │   │   ├── (mobile)/           # 모바일 레이아웃 그룹
   │   │   │   ├── layout.tsx      # 모바일 레이아웃
   │   │   │   ├── page.tsx        # 홈 대시보드
   │   │   │   ├── sessions/       # 세션 타임테이블
   │   │   │   ├── booths/         # 부스 목록
   │   │   │   ├── papers/         # 페이퍼샵
   │   │   │   ├── quests/         # 퀘스트 시스템
   │   │   │   ├── profile/        # 내 프로필
   │   │   │   └── qr-scan/        # QR 스캔
   │   │   └── admin/              # 관리자 (기존)
   │   ├── components/
   │   │   ├── mobile/             # 모바일 전용 컴포넌트
   │   │   │   ├── BottomNav.tsx   # 하단 네비게이션
   │   │   │   ├── QRScanner.tsx   # QR 스캔 컴포넌트
   │   │   │   ├── SessionCard.tsx # 세션 카드
   │   │   │   ├── BoothCard.tsx   # 부스 카드
   │   │   │   └── QuestCard.tsx   # 퀘스트 카드
   │   │   └── ui/                 # shadcn/ui (기존)
   │   ├── lib/
   │   │   ├── api.ts              # API 클라이언트 (확장)
   │   │   ├── qr-scanner.ts       # QR 스캔 유틸리티
   │   │   └── pwa.ts              # PWA 유틸리티
   │   ├── store/
   │   │   ├── authStore.ts        # 인증 (기존)
   │   │   ├── questStore.ts       # 퀘스트 상태
   │   │   ├── sessionStore.ts     # 세션 상태
   │   │   └── boothStore.ts       # 부스 상태
   │   └── types/
   │       └── index.ts            # 타입 정의 (확장)
   └── public/
       ├── manifest.json           # PWA Manifest
       └── service-worker.js       # Service Worker
   ```

3. **환경 변수 설정**
   ```bash
   # .env.local (개발)
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_WS_URL=ws://localhost:3001

   # .env.production
   NEXT_PUBLIC_API_URL=https://api.moducon.vibemakers.kr
   NEXT_PUBLIC_WS_URL=wss://ws.moducon.vibemakers.kr
   ```

4. **의존성 설치**
   ```bash
   npm install html5-qrcode
   npm install @radix-ui/react-bottom-navigation # (필요 시)
   npm install date-fns # 날짜 포맷
   npm install lucide-react # 아이콘
   ```

---

### Phase 2.2: QR 스캔 기능 (1일)

**목표**: 모바일 카메라를 사용한 QR 스캔 기능 구현

#### PRD 요구사항
- **현장 QR 접속** (PRD 1.1): QR 코드 스캔 → 앱 접속
- **세션 체크인** (PRD 3.2): QR 스캔 → 체크인
- **부스 방문 인증** (PRD 4.2): QR 스캔 → 방문 기록
- **퀘스트 인증** (PRD 2.3): QR 스캔 → 퀘스트 완료

#### 구현 상세

**1. QR 스캔 컴포넌트**
```tsx
// src/components/mobile/QRScanner.tsx
import { Html5Qrcode } from 'html5-qrcode';

export function QRScanner({ onScan, onError }) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScan = async () => {
    const scanner = new Html5Qrcode("qr-reader");
    await scanner.start(
      { facingMode: "environment" }, // 후방 카메라
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      (decodedText) => onScan(decodedText),
      (error) => console.error(error)
    );
    scannerRef.current = scanner;
  };

  return (
    <div>
      <div id="qr-reader" className="w-full h-64" />
      <button onClick={startScan}>스캔 시작</button>
    </div>
  );
}
```

**2. QR 스캔 페이지**
```tsx
// src/app/(mobile)/qr-scan/page.tsx
export default function QRScanPage() {
  const handleScan = async (qrData: string) => {
    // QR 데이터 파싱: moducon://session/{id}/checkin
    const { type, id, action } = parseQRData(qrData);

    if (type === 'session' && action === 'checkin') {
      await api.sessions.checkin(id);
      toast.success('세션 체크인 완료!');
    } else if (type === 'booth') {
      await api.booths.visit(id);
      toast.success('부스 방문 인증 완료!');
    }
  };

  return <QRScanner onScan={handleScan} />;
}
```

**3. QR 데이터 파싱 유틸리티**
```typescript
// src/lib/qr-scanner.ts
export function parseQRData(qrCode: string) {
  // moducon://session/{id}/checkin
  // moducon://booth/{id}
  // moducon://paper/{id}/quiz

  const url = new URL(qrCode);
  const parts = url.pathname.split('/').filter(Boolean);

  return {
    type: parts[0], // 'session' | 'booth' | 'paper'
    id: parts[1],
    action: parts[2] // 'checkin' | 'quiz'
  };
}
```

---

### Phase 2.3: 홈 대시보드 (1일)

**목표**: 모바일 최적화 홈 화면 구현

#### PRD 요구사항
- **출입증** (PRD 1.4): 디지털 배지 표시
- **퀘스트 진행률** (PRD 2.5): 프로그레스 바
- **실시간 혼잡도** (PRD 3.3): 공간별 혼잡도
- **빠른 액션**: QR 스캔, 지도 보기, 내 일정

#### 구현 상세

**1. 홈 페이지**
```tsx
// src/app/(mobile)/page.tsx
export default function MobileHomePage() {
  const { user } = useAuthStore();
  const { progress } = useQuestStore();

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* 출입증 */}
      <section className="bg-white p-4 shadow">
        <DigitalBadge user={user} />
      </section>

      {/* 퀘스트 진행률 */}
      <section className="bg-white p-4 mt-2 shadow">
        <QuestProgress progress={progress} />
      </section>

      {/* 실시간 혼잡도 */}
      <section className="bg-white p-4 mt-2 shadow">
        <CongestionGrid />
      </section>

      {/* 빠른 액션 */}
      <section className="grid grid-cols-3 gap-2 p-4">
        <QuickAction icon="qr-code" label="QR 스캔" href="/qr-scan" />
        <QuickAction icon="map" label="지도" href="/map" />
        <QuickAction icon="calendar" label="내 일정" href="/schedule" />
      </section>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}
```

**2. 디지털 배지 컴포넌트**
```tsx
// src/components/mobile/DigitalBadge.tsx
export function DigitalBadge({ user }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-sm text-gray-500">{user.organization}</p>
      </div>
      <QRCode value={`moducon://profile/${user.id}`} size={80} />
    </div>
  );
}
```

**3. 하단 네비게이션**
```tsx
// src/components/mobile/BottomNav.tsx
export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: 'home', label: '홈', href: '/' },
    { icon: 'calendar', label: '세션', href: '/sessions' },
    { icon: 'store', label: '부스', href: '/booths' },
    { icon: 'target', label: '퀘스트', href: '/quests' },
    { icon: 'user', label: '프로필', href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t h-16 flex">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex-1 flex flex-col items-center justify-center",
            pathname === item.href ? "text-blue-600" : "text-gray-500"
          )}
        >
          <Icon name={item.icon} size={24} />
          <span className="text-xs mt-1">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
```

---

### Phase 2.4: 세션 타임테이블 (1일)

**목표**: 세션 목록 및 필터링 기능 구현

#### PRD 요구사항
- **세션 타임테이블** (PRD 3.1): 6개 트랙, 필터링
- **세션 체크인** (PRD 3.2): QR 스캔 체크인
- **즐겨찾기**: 관심 세션 북마크

#### 구현 상세

**1. 세션 목록 페이지**
```tsx
// src/app/(mobile)/sessions/page.tsx
export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState({ track: 'all', time: 'all' });

  const filteredSessions = sessions.filter((s) => {
    if (filter.track !== 'all' && s.track !== filter.track) return false;
    if (filter.time !== 'all' && !isInTimeRange(s.startTime, filter.time)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* 필터 */}
      <div className="bg-white p-4 shadow sticky top-0 z-10">
        <SessionFilter filter={filter} onChange={setFilter} />
      </div>

      {/* 세션 목록 */}
      <div className="p-4 space-y-2">
        {filteredSessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
```

**2. 세션 카드 컴포넌트**
```tsx
// src/components/mobile/SessionCard.tsx
export function SessionCard({ session }) {
  const { toggleFavorite, isFavorite } = useSessionStore();

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-lg">{session.title}</h3>
          <p className="text-sm text-gray-600">{session.speaker}</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <Icon name="clock" size={16} />
            <span>{formatTime(session.startTime)}</span>
            <Icon name="map-pin" size={16} />
            <span>{session.location}</span>
          </div>
        </div>
        <button onClick={() => toggleFavorite(session.id)}>
          <Icon
            name={isFavorite(session.id) ? "heart" : "heart-outline"}
            size={24}
            className={isFavorite(session.id) ? "text-red-500" : "text-gray-400"}
          />
        </button>
      </div>

      {/* 태그 */}
      <div className="flex flex-wrap gap-1 mt-2">
        <Badge>{session.difficulty}</Badge>
        {session.tags.map((tag) => (
          <Badge key={tag} variant="secondary">{tag}</Badge>
        ))}
      </div>

      {/* 체크인 버튼 */}
      <Link href={`/qr-scan?type=session&id=${session.id}`}>
        <Button className="w-full mt-3">체크인 (QR 스캔)</Button>
      </Link>
    </div>
  );
}
```

---

### Phase 2.5: 부스 & 페이퍼샵 (1일)

**목표**: 부스 목록 및 페이퍼샵 퀴즈 기능 구현

#### PRD 요구사항
- **LAB 부스 정보** (PRD 4.1): 목록, 상세, 필터
- **부스 방문 기록** (PRD 4.2): QR 스캔 인증
- **페이퍼샵 퀴즈** (PRD 4.3): 객관식 퀴즈

#### 구현 상세

**1. 부스 목록 페이지**
```tsx
// src/app/(mobile)/booths/page.tsx
export default function BoothsPage() {
  const [booths, setBooths] = useState([]);
  const [filter, setFilter] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-white p-4 shadow sticky top-0 z-10">
        <BoothFilter filter={filter} onChange={setFilter} />
      </div>

      <div className="p-4 space-y-2">
        {booths.map((booth) => (
          <BoothCard key={booth.id} booth={booth} />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
```

**2. 페이퍼샵 퀴즈 페이지**
```tsx
// src/app/(mobile)/papers/[id]/quiz/page.tsx
export default function PaperQuizPage({ params }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});

  const handleSubmit = async () => {
    const result = await api.papers.submitQuiz(params.id, answers);
    if (result.passed) {
      toast.success('퀴즈 통과! 포인트 획득');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">{quiz?.paper.title}</h1>

      {quiz?.questions.map((q, idx) => (
        <div key={q.id} className="bg-white p-4 rounded-lg shadow mb-4">
          <p className="font-medium mb-2">Q{idx + 1}. {q.question}</p>
          <RadioGroup value={answers[q.id]} onValueChange={(v) => setAnswers({ ...answers, [q.id]: v })}>
            {q.options.map((opt) => (
              <div key={opt.id} className="flex items-center gap-2">
                <RadioGroupItem value={opt.id} id={opt.id} />
                <label htmlFor={opt.id}>{opt.text}</label>
              </div>
            ))}
          </RadioGroup>
        </div>
      ))}

      <Button onClick={handleSubmit} className="w-full">제출</Button>
    </div>
  );
}
```

---

### Phase 2.6: 퀘스트 시스템 (2일)

**목표**: 개인화 퀘스트 생성 및 진행 추적 기능 구현

#### PRD 요구사항
- **관심 분야 선택** (PRD 2.1): 최대 3개 선택
- **퀘스트 맵 생성** (PRD 2.2): 개인화 알고리즘
- **퀘스트 인증** (PRD 2.3): QR 스캔
- **진행 상황 추적** (PRD 2.5): 프로그레스 바, 타임라인

#### 구현 상세

**1. 관심 분야 선택 (온보딩)**
```tsx
// src/app/(mobile)/onboarding/interests/page.tsx
export default function InterestsOnboardingPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const interests = ['생성 AI', '컴퓨터 비전', 'NLP/LLM', '로보틱스', 'MLOps', '데이터 엔지니어링', 'AI 윤리/정책'];

  const handleSubmit = async () => {
    await api.user.updateInterests(selected);
    await api.quests.generate(); // 퀘스트 생성 요청
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">관심 분야를 선택하세요 (최대 3개)</h1>

      <div className="space-y-2">
        {interests.map((interest) => (
          <button
            key={interest}
            onClick={() => toggleInterest(interest)}
            className={cn(
              "w-full p-4 rounded-lg border-2 text-left",
              selected.includes(interest) ? "border-blue-600 bg-blue-50" : "border-gray-200"
            )}
          >
            {interest}
          </button>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={selected.length === 0 || selected.length > 3}
        className="w-full mt-4"
      >
        완료 ({selected.length}/3)
      </Button>
    </div>
  );
}
```

**2. 퀘스트 목록 페이지**
```tsx
// src/app/(mobile)/quests/page.tsx
export default function QuestsPage() {
  const { quests, progress } = useQuestStore();

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* 진행률 */}
      <div className="bg-white p-4 shadow">
        <h2 className="text-lg font-bold mb-2">퀘스트 진행률</h2>
        <Progress value={progress.percentage} className="h-2" />
        <p className="text-sm text-gray-600 mt-1">
          {progress.completed}/{progress.total} 완료
        </p>
      </div>

      {/* 퀘스트 목록 */}
      <div className="p-4 space-y-2">
        {quests.map((quest, idx) => (
          <QuestCard key={quest.id} quest={quest} index={idx + 1} />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
```

**3. 퀘스트 카드 컴포넌트**
```tsx
// src/components/mobile/QuestCard.tsx
export function QuestCard({ quest, index }) {
  return (
    <div className={cn(
      "bg-white p-4 rounded-lg shadow",
      quest.isCompleted && "opacity-60"
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
          {quest.isCompleted ? '✓' : index}
        </div>

        <div className="flex-1">
          <h3 className="font-bold">{quest.target.name}</h3>
          <p className="text-sm text-gray-600">{quest.target.description}</p>

          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <Icon name="map-pin" size={16} />
            <span>{quest.target.location}</span>
            <Icon name="clock" size={16} />
            <span>{quest.estimatedMinutes}분</span>
          </div>

          {!quest.isCompleted && (
            <Link href={`/qr-scan?type=${quest.targetType}&id=${quest.targetId}`}>
              <Button size="sm" className="mt-3">인증하기 (QR 스캔)</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### Phase 2.7: PWA 기능 (1일)

**목표**: Service Worker, 오프라인 지원, 설치 가능

#### PRD 요구사항
- **Offline Mode** (PRD Section 4): 기본 UI 및 캐시된 데이터 접근
- **Installability**: manifest.json 설정
- **Push Notifications**: 웹 푸시 알림 (선택)

#### 구현 상세

**1. manifest.json**
```json
{
  "name": "모두콘 2025",
  "short_name": "Moducon",
  "description": "모두의연구소 컨퍼런스 2025 디지털 가이드",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1e40af",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**2. next.config.js (PWA 설정)**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  output: 'export',
  // ... 기존 설정
});
```

**3. Service Worker 캐싱 전략**
```typescript
// public/sw.js (자동 생성됨)
// Cache-First: Static assets (HTML, CSS, JS)
// Network-First: API calls
// Cache-Only: 출입증, 지도
```

---

## 🔄 Git 브랜치 전략

### 브랜치 구조
```
main (프로덕션)
  ├── backend-dev (백엔드 + 관리자, 완료 ✅)
  └── mobile-pwa-dev (모바일 PWA, 신규 📋)
```

### 작업 프로세스
1. **브랜치 생성**
   ```bash
   git checkout main
   git checkout -b mobile-pwa-dev
   ```

2. **단계별 커밋**
   ```bash
   # Phase 2.1 완료 후
   git add .
   git commit -m "feat: 모바일 PWA 프로젝트 초기화

   - 디렉토리 구조 생성
   - 의존성 설치
   - 환경 변수 설정"

   # Phase 2.2 완료 후
   git commit -m "feat: QR 스캔 기능 구현

   - html5-qrcode 통합
   - 세션/부스/페이퍼 QR 파싱
   - 스캔 페이지 UI"
   ```

3. **중간 푸시** (선택)
   ```bash
   git push -u origin mobile-pwa-dev
   ```

4. **최종 머지** (모든 Phase 완료 후)
   ```bash
   git checkout main
   git merge mobile-pwa-dev
   git push origin main
   ```

---

## 📊 진행률 추적

### 예상 일정
| Phase | 기능 | 예상 시간 | 상태 |
|-------|------|----------|------|
| 2.1 | 프로젝트 초기화 | 1일 | 📋 |
| 2.2 | QR 스캔 기능 | 1일 | 📋 |
| 2.3 | 홈 대시보드 | 1일 | 📋 |
| 2.4 | 세션 타임테이블 | 1일 | 📋 |
| 2.5 | 부스 & 페이퍼샵 | 1일 | 📋 |
| 2.6 | 퀘스트 시스템 | 2일 | 📋 |
| 2.7 | PWA 기능 | 1일 | 📋 |
| **총계** | | **8일** | |

### 마일스톤
- 🎯 **M1**: 프로젝트 초기화 + QR 스캔 (2일)
- 🎯 **M2**: 홈 + 세션 + 부스 (3일)
- 🎯 **M3**: 퀘스트 시스템 (2일)
- 🎯 **M4**: PWA 기능 + 최종 테스트 (1일)

---

## 🧪 테스트 계획

### 기능 테스트
- [ ] QR 스캔: 세션/부스/페이퍼 모든 타입 정상 동작
- [ ] 세션 필터링: 트랙, 시간대별 필터링
- [ ] 부스 방문: QR 스캔 → 방문 기록 저장
- [ ] 퀘스트 완료: 진행률 업데이트, 보상 안내
- [ ] PWA 설치: 홈 화면 추가 가능

### 모바일 테스트
- [ ] iPhone (Safari): iOS 14+
- [ ] Android (Chrome): Android 10+
- [ ] 터치 제스처: 스와이프, 탭
- [ ] 화면 회전: 세로/가로 모두 지원

### 오프라인 테스트
- [ ] 네트워크 끊김 시 캐시된 데이터 접근
- [ ] 오프라인 작업 큐잉 (Background Sync)

---

## 📝 최종 요약

### 주요 기능
1. ✅ **QR 스캔**: 모바일 카메라 후방 사용
2. ✅ **홈 대시보드**: 출입증, 퀘스트 진행률, 혼잡도
3. ✅ **세션 타임테이블**: 필터링, 즐겨찾기, 체크인
4. ✅ **부스 & 페이퍼샵**: 목록, 상세, 퀴즈
5. ✅ **퀘스트 시스템**: 개인화, 진행 추적, 보상
6. ✅ **PWA**: 오프라인, 설치 가능, 푸시 알림

### 기술 스택 준수
- ✅ Next.js 14+ Static Export (PRD 준수)
- ✅ Tailwind CSS + shadcn/ui (PRD 준수)
- ✅ html5-qrcode (PRD 준수)
- ✅ next-pwa (PRD 준수)
- ✅ GitHub Pages 배포 (PRD 준수)

### 다음 단계
1. 📋 **hands-on worker**: 모바일 PWA 개발 시작
2. 📋 **백엔드**: 퀘스트 생성 알고리즘 API 개발
3. 📋 **백엔드**: WebSocket 혼잡도 업데이트
4. 📋 **테스트**: E2E 테스트 (Playwright)

---

**다음 담당자**: hands-on worker
**다음 문서**: 72_MOBILE_PWA_IMPLEMENTATION_REPORT.md
**시작일**: 2025-11-28
**예상 완료일**: 2025-12-06 (8일)
