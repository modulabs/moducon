# 146_QR_FEATURE_REQUIREMENTS.md - QR 스캔 기능 상세 요구사항

**작성일**: 2025-12-01
**작성자**: Technical Lead
**버전**: v1.0
**우선순위**: P0 (Critical)

---

## 📋 요구사항 개요

### 사용자 요청
> "0. 지금 하단 네비게이션에 가운데 위치에 원형으로 버튼이 제공되면 좋을 것 같습니다.
> 1. 휴대폰 카메라에 접근하여 QR을 찍는 기능을 동작시킵니다.
>  a) ui 상단에 정 사각 박스로 사용자 카메라로 찍히는 화면이 뜨도록 해줍니다.
>  b) 해당 화면에 QR값이 들어오면 값에 따라서 아래 동작을 진행하게 됩니다.
> 2. QR의 값에 따라 다른 동작을 진행합니다."

### 핵심 기능
1. **하단 네비게이션 중앙 원형 QR 버튼** (UI 개선)
2. **카메라 QR 스캔 기능** (기존 기능 유지)
3. **QR 값에 따른 라우팅 및 동작** (신규 확장)

---

## 🎯 요구사항 #1: 하단 네비게이션 중앙 원형 QR 버튼

### 현재 상태
- ❌ 기존: Floating 버튼 (화면 정가운데)
- ✅ 요청: 하단 네비게이션 중앙 원형 버튼

### UI 디자인 명세

#### 레이아웃 구조
```
┌──────────────────────────────────────────┐
│                                          │
│           Main Content                   │
│         (100vh - 64px)                   │
│                                          │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│ [세션]  [부스]   [🎯 QR]   [포스터] [지도] │  ← 64px 고정
└──────────────────────────────────────────┘
```

#### 탭 구성 (5개)
1. **세션** (Sessions) - `/sessions`
2. **부스** (Booths) - `/booths`
3. **QR 버튼** (중앙, 특별 UI) - QR 스캔 모달
4. **포스터** (Papers) - `/papers`
5. **지도** (Map) - `/map`

#### 일반 탭 스타일
```typescript
const TabButton = {
  size: '48x48px',
  icon: 'lucide-react (Calendar, Store, FileText, Map)',
  label: '아이콘 하단 (10px, gray-500)',
  activeColor: 'primary',
  inactiveColor: 'gray-500'
}
```

#### 중앙 QR 버튼 특별 디자인
```typescript
const QRButton = {
  size: '64x64px',           // 1.33배 큰
  position: 'relative -top-2', // 약간 위로
  shape: 'rounded-full',     // 원형
  background: 'bg-gradient-to-r from-primary to-primary-dark',
  border: '4px white',       // 테두리
  shadow: 'shadow-lg',       // 그림자
  icon: 'QrCode (24x24px, white)',
  label: '스캔 (12px, white)',
  animation: 'animate-pulse' // 맥박 효과
}
```

#### 구현 예시
```tsx
// src/components/layout/BottomNavigation.tsx
export function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-lg border-t">
      <div className="flex items-center justify-around h-full max-w-screen-lg mx-auto">
        {/* 세션 */}
        <TabButton icon={Calendar} label="세션" href="/sessions" />

        {/* 부스 */}
        <TabButton icon={Store} label="부스" href="/booths" />

        {/* 중앙 QR 버튼 (특별 UI) */}
        <button
          className="relative -top-2 w-16 h-16 rounded-full
                     bg-gradient-to-r from-primary to-primary-dark
                     shadow-lg ring-4 ring-white
                     animate-pulse"
          onClick={() => setQRModalOpen(true)}
        >
          <QrCode className="w-6 h-6 text-white mx-auto" />
          <span className="text-xs text-white">스캔</span>
        </button>

        {/* 포스터 */}
        <TabButton icon={FileText} label="포스터" href="/papers" />

        {/* 지도 */}
        <TabButton icon={Map} label="지도" href="/map" />
      </div>
    </div>
  );
}
```

---

## 🎯 요구사항 #2: 카메라 QR 스캔 UI

### 현재 상태
- ✅ 기존: html5-qrcode 라이브러리 사용
- ✅ 모달: 전체 화면 QR 스캔 모달
- ❌ 문제: UI 개선 필요 (정사각형 박스)

### UI 개선 명세

#### 스캔 화면 레이아웃
```
┌──────────────────────────────────────────┐
│          QR 코드 스캔                     │  ← Header
├──────────────────────────────────────────┤
│                                          │
│   ┌────────────────────────┐             │
│   │                        │             │
│   │     [Camera View]      │             │  ← 정사각형 박스
│   │                        │             │
│   └────────────────────────┘             │
│                                          │
│   "QR 코드를 박스 안에 맞춰주세요"         │  ← 안내 메시지
│                                          │
└──────────────────────────────────────────┘
```

#### 정사각형 박스 스타일
```typescript
const ScanBox = {
  size: '280x280px',         // 정사각형
  border: '4px solid white', // 흰색 테두리
  borderRadius: '16px',      // 둥근 모서리
  shadow: '0 0 0 9999px rgba(0,0,0,0.5)', // 외부 어둡게
  position: 'center'         // 화면 중앙
}
```

#### 구현 예시
```tsx
// src/components/qr/QRScannerModal.tsx
export function QRScannerModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full h-full max-w-full p-0 bg-black">
        <div className="relative flex flex-col items-center justify-center h-full">
          {/* 카메라 뷰 */}
          <div id="qr-reader" className="w-full max-w-md" />

          {/* 정사각형 스캔 가이드 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[280px] h-[280px] border-4 border-white rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
          </div>

          {/* 안내 메시지 */}
          <p className="absolute bottom-24 text-white text-center">
            QR 코드를 박스 안에 맞춰주세요
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🎯 요구사항 #3: QR 값에 따른 동작

### 현재 상태
- ✅ 기존: 세션/부스/포스터 라우팅 (간단한 파싱)
- ❌ 확장 필요: 다양한 QR 동작 추가

### QR 값 파싱 로직

#### QR 데이터 형식 (예상)
```
session-{id}        → 세션 상세 페이지
booth-{id}          → 부스 상세 페이지
paper-{id}          → 포스터 상세 페이지
checkin-session-{id} → 세션 체크인 + 기록
checkin-booth-{id}   → 부스 방문 + 기록
checkin-paper-{id}   → 포스터 열람 + 기록
quiz-{id}           → 퀴즈 팝업
hidden-{id}         → 히든 QR (특별 배지)
```

#### 라우팅 로직 확장
```typescript
// src/lib/qrParser.ts
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
    return {
      type: 'checkin',
      id: qrData.replace('checkin-session-', ''),
      action: 'record',
      route: `/sessions/${id}?checkin=true`,
      data: { sessionId: id }
    };
  }

  // 2. 부스 방문
  if (qrData.startsWith('checkin-booth-')) {
    return {
      type: 'checkin',
      id: qrData.replace('checkin-booth-', ''),
      action: 'record',
      route: `/booths/${id}?checkin=true`,
      data: { boothId: id }
    };
  }

  // 3. 포스터 열람
  if (qrData.startsWith('checkin-paper-')) {
    return {
      type: 'checkin',
      id: qrData.replace('checkin-paper-', ''),
      action: 'record',
      route: `/papers/${id}?checkin=true`,
      data: { paperId: id }
    };
  }

  // 4. 퀴즈 QR
  if (qrData.startsWith('quiz-')) {
    return {
      type: 'quiz',
      id: qrData.replace('quiz-', ''),
      action: 'quiz',
      data: { quizId: id }
    };
  }

  // 5. 히든 QR
  if (qrData.startsWith('hidden-')) {
    return {
      type: 'hidden',
      id: qrData.replace('hidden-', ''),
      action: 'badge',
      data: { hiddenId: id }
    };
  }

  // 6. 기본 라우팅 (기존 로직)
  if (qrData.includes('session')) {
    return {
      type: 'session',
      id: extractId(qrData),
      action: 'navigate',
      route: `/sessions/${extractId(qrData)}`
    };
  }

  // ... 부스, 포스터 동일
}
```

---

## 📊 데이터베이스 설계 (신규 추가)

### 체크인 기록 테이블

#### user_checkins 테이블
```sql
CREATE TABLE user_checkins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  checkin_type VARCHAR(20) NOT NULL,  -- 'session', 'booth', 'paper'
  target_id VARCHAR(50) NOT NULL,     -- 세션/부스/포스터 ID
  checked_in_at TIMESTAMP DEFAULT NOW(),
  quiz_passed BOOLEAN DEFAULT NULL,   -- 퀴즈 통과 여부 (있을 경우)
  UNIQUE(user_id, checkin_type, target_id)
);

CREATE INDEX idx_user_checkins_user_id ON user_checkins(user_id);
CREATE INDEX idx_user_checkins_type ON user_checkins(checkin_type);
```

#### quizzes 테이블
```sql
CREATE TABLE quizzes (
  id VARCHAR(50) PRIMARY KEY,
  target_type VARCHAR(20) NOT NULL,   -- 'session', 'booth', 'paper'
  target_id VARCHAR(50) NOT NULL,     -- 세션/부스/포스터 ID
  question TEXT NOT NULL,
  options JSONB NOT NULL,             -- ["A", "B", "C", "D"]
  correct_answer VARCHAR(1) NOT NULL, -- "A"
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### user_quiz_attempts 테이블
```sql
CREATE TABLE user_quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  quiz_id VARCHAR(50) REFERENCES quizzes(id),
  selected_answer VARCHAR(1) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  attempted_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_user_id ON user_quiz_attempts(user_id);
```

---

## 🎮 API 설계 (신규 추가)

### 체크인 API

#### POST /api/checkin
**기능**: QR 스캔 후 체크인 기록
**요청**:
```json
{
  "type": "session",
  "targetId": "session-01",
  "timestamp": "2025-01-15T14:30:00Z"
}
```

**응답**:
```json
{
  "success": true,
  "checkin": {
    "id": 123,
    "type": "session",
    "targetId": "session-01",
    "checkedInAt": "2025-01-15T14:30:00Z"
  },
  "hasQuiz": true,
  "quizId": "quiz-session-01"
}
```

### 퀴즈 API

#### GET /api/quiz/:id
**기능**: 퀴즈 정보 조회
**응답**:
```json
{
  "quizId": "quiz-session-01",
  "question": "이 세션의 주제는 무엇인가요?",
  "options": ["MLOps", "멀티모달", "에이전트", "자율주행"],
  "targetType": "session",
  "targetId": "session-01"
}
```

#### POST /api/quiz/:id/answer
**기능**: 퀴즈 답변 제출
**요청**:
```json
{
  "selectedAnswer": "A"
}
```

**응답**:
```json
{
  "correct": true,
  "message": "정답입니다! 체크인이 완료되었습니다.",
  "checkinId": 123
}
```

### 체크인 내역 API

#### GET /api/checkin/history
**기능**: 사용자 체크인 내역 조회
**응답**:
```json
{
  "checkins": [
    {
      "id": 123,
      "type": "session",
      "targetId": "session-01",
      "targetName": "Transformer 모델 최적화",
      "checkedInAt": "2025-01-15T14:30:00Z",
      "quizPassed": true
    },
    // ...
  ],
  "stats": {
    "totalSessions": 5,
    "totalBooths": 3,
    "totalPapers": 2
  }
}
```

---

## 🎨 마이페이지 기획

### 페이지 구조
```
/app/profile/page.tsx
```

### 섹션 구성

#### 1. 사용자 정보
- 이름
- 전화번호 뒷 4자리
- 가입일
- 디지털 서명 (Badge)

#### 2. 체크인 통계
```
┌────────────────────────────────┐
│   체크인 현황                  │
├────────────────────────────────┤
│ 🎓 세션 참여: 5/32             │
│ 🏢 부스 방문: 3/13             │
│ 📄 포스터 열람: 2/33           │
└────────────────────────────────┘
```

#### 3. 체크인 내역
```
┌────────────────────────────────┐
│   최근 체크인                  │
├────────────────────────────────┤
│ ✅ Transformer 최적화 세션     │
│    01/15 14:30 | 퀴즈 통과     │
│                                │
│ ✅ ModuLabs AI 연구소 부스     │
│    01/15 13:20                 │
│                                │
│ ✅ 딥러닝 논문 포스터           │
│    01/15 12:00 | 퀴즈 통과     │
└────────────────────────────────┘
```

#### 4. 배지 컬렉션 (향후)
```
┌────────────────────────────────┐
│   획득한 배지                  │
├────────────────────────────────┤
│ 🎓 [Session Master]            │
│ 🧭 [Explorer] (잠김)           │
│ 📜 [Scholar] (잠김)            │
│ 🔍 [Secret Hunter] (잠김)      │
└────────────────────────────────┘
```

#### 5. 공유 기능
```
┌────────────────────────────────┐
│   모두콘 참여 자랑하기          │
├────────────────────────────────┤
│ [🔗 링크 복사]  [📷 이미지]    │
└────────────────────────────────┘
```

**공유 이미지 예시**:
```
┌────────────────────────────────┐
│   모두콘 2025 참여 완료!        │
├────────────────────────────────┤
│   조해창님의 활동               │
│                                │
│   🎓 세션: 5개                 │
│   🏢 부스: 3개                 │
│   📄 포스터: 2개               │
│                                │
│   #모두콘2025 #AI컨퍼런스       │
└────────────────────────────────┘
```

---

## 📋 구현 우선순위

### P0 (Critical): 즉시 착수 (4시간)
1. **하단 네비게이션 구현** (2시간)
   - BottomNavigation 컴포넌트 생성
   - 중앙 원형 QR 버튼 특별 UI
   - layout.tsx 적용

2. **QR 스캔 UI 개선** (1시간)
   - 정사각형 박스 가이드
   - 안내 메시지

3. **지도 페이지 생성** (30분)
   - /app/map/page.tsx (빈 페이지)

4. **빌드 및 테스트** (30분)

### P1 (High): 1-2일 내 (8시간)
5. **체크인 기능 구현** (4시간)
   - user_checkins 테이블 생성
   - POST /api/checkin API
   - GET /api/checkin/history API
   - QR 파싱 로직 확장

6. **마이페이지 구현** (3시간)
   - /app/profile/page.tsx
   - 체크인 통계
   - 체크인 내역

7. **테스트 및 검증** (1시간)

### P2 (Medium): 1주 내 (6시간)
8. **퀴즈 시스템 구현** (4시간)
   - quizzes 테이블 생성
   - GET /api/quiz/:id API
   - POST /api/quiz/:id/answer API
   - 퀴즈 팝업 UI

9. **공유 기능 구현** (2시간)
   - 이미지 생성 (Canvas API)
   - SNS 공유 버튼

---

## 🎯 성공 지표

### 기술 지표
- ✅ 하단 네비게이션 구현 완료
- ✅ QR 스캔 UI 개선 완료
- ✅ 체크인 기능 동작 검증
- ✅ TypeScript 빌드 성공 (0 errors)

### 사용자 경험 지표 (배포 후)
- 🎯 QR 스캔 성공률: 95% 이상
- 🎯 체크인 기록 정확도: 100%
- 🎯 네비게이션 사용률: 90% 이상
- 🎯 마이페이지 방문률: 70% 이상

---

**작성 완료일**: 2025-12-01
**버전**: v1.0
**다음 단계**: 147_QR_DEV_PLAN.md 작성
**담당자**: Technical Lead
