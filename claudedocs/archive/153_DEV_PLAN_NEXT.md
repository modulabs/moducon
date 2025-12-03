# 153_DEV_PLAN_NEXT.md - 다음 개발 계획 (Phase 2-5)

**작성일**: 2025-12-01
**작성자**: Technical Lead
**버전**: v2.0
**기반**: 146_QR_FEATURE_REQUIREMENTS.md, 147_QR_DEV_PLAN.md

---

## 📋 전체 Phase 요약

| Phase | 설명 | 우선순위 | 예상 시간 | 상태 |
|-------|------|----------|----------|------|
| **Phase 1** | QR 스캔 UI 개선 | P0 | 1.5시간 | ✅ 완료 |
| **Phase 2** | 하단 네비게이션 | P0 | 2시간 | ⏳ 진행 예정 |
| **Phase 3** | Database 스키마 | P0 | 1시간 | ⏳ 대기 |
| **Phase 4** | 체크인 API | P0 | 2시간 | ⏳ 대기 |
| **Phase 5** | 마이페이지 | P1 | 1시간 | ⏳ 대기 |
| **총 예상** | - | - | **7.5시간** | **13% 완료** |

---

## ✅ Phase 1: QR 스캔 UI 개선 (완료)

### 작업 내용
1. ✅ 정사각형 스캔 가이드 (280x280px)
2. ✅ QR 파서 확장 (체크인, 퀴즈, 히든 배지)
3. ✅ TypeScript 타입 안정성 확보

### 성과
- **예상 시간**: 1.5시간
- **실제 시간**: 1시간
- **효율**: 150% (33% 단축)

### 완료 파일
- `src/components/QRScanner.tsx` (UI 개선)
- `src/lib/qrParser.ts` (파서 확장)
- `claudedocs/148_TECH_LEAD_SUMMARY.md`
- `claudedocs/149_HANDSON_QR_PHASE1_COMPLETE.md`

### Git Commit
```
8e5e69f feat: QR 스캔 UI 개선 및 파서 확장 (Phase 1)
```

---

## 🔄 Phase 2: 하단 네비게이션 구현 (진행 예정)

### 목표
하단 네비게이션에 중앙 원형 QR 버튼 추가 및 5개 탭 구현

### 우선순위
**P0 (Critical)** - QR 기능의 핵심 UI

### 예상 시간
**2시간**

---

### 작업 2.1: BottomNavigation 컴포넌트 생성 (1시간)

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

const TABS = [
  { id: 'sessions', label: '세션', icon: Calendar, href: '/sessions' },
  { id: 'booths', label: '부스', icon: Store, href: '/booths' },
  { id: 'papers', label: '포스터', icon: FileText, href: '/papers' },
  { id: 'map', label: '지도', icon: Map, href: '/map' },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [qrModalOpen, setQRModalOpen] = useState(false);

  return (
    <>
      {/* 하단 네비게이션 바 */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-lg border-t z-50">
        <div className="flex items-center justify-around h-full max-w-screen-lg mx-auto px-2">
          {/* 세션, 부스 */}
          {TABS.slice(0, 2).map((tab) => (
            <TabButton key={tab.id} {...tab} />
          ))}

          {/* 중앙 QR 버튼 */}
          <button
            className="relative -top-2 w-16 h-16 rounded-full
                       bg-gradient-to-r from-primary to-primary-dark
                       shadow-lg ring-4 ring-white animate-pulse"
            onClick={() => setQRModalOpen(true)}
          >
            <QrCode className="w-6 h-6 text-white mx-auto" />
            <span className="text-xs text-white">스캔</span>
          </button>

          {/* 포스터, 지도 */}
          {TABS.slice(2).map((tab) => (
            <TabButton key={tab.id} {...tab} />
          ))}
        </div>
      </div>

      {/* QR 스캔 모달 */}
      {qrModalOpen && (
        <QRScannerModal onClose={() => setQRModalOpen(false)} />
      )}
    </>
  );
}

function TabButton({ icon: Icon, label, href }) {
  // ... 구현
}
```

#### 체크리스트
- [ ] `src/components/layout/BottomNavigation.tsx` 생성
- [ ] TabButton 컴포넌트 구현
- [ ] QR 버튼 특별 디자인 적용
- [ ] TypeScript 타입 안정성 확보

---

### 작업 2.2: Layout 통합 (30분)

#### 파일 수정
```
moducon-frontend/src/app/layout.tsx
```

#### 수정 내용
```tsx
// src/app/layout.tsx
import { BottomNavigation } from '@/components/layout/BottomNavigation';

export default function RootLayout({ children }: Props) {
  return (
    <html lang="ko">
      <body className="pb-20"> {/* 하단 패딩 추가 */}
        <Header />
        <main>{children}</main>
        <BottomNavigation /> {/* 하단 네비게이션 추가 */}
      </body>
    </html>
  );
}
```

#### 체크리스트
- [ ] `layout.tsx` 수정
- [ ] 하단 패딩 추가 (`pb-20`)
- [ ] BottomNavigation import

---

### 작업 2.3: 지도 페이지 빈 페이지 생성 (30분)

#### 파일 생성
```
moducon-frontend/src/app/map/
└── page.tsx        # 🆕 신규
```

#### 페이지 구조
```tsx
// src/app/map/page.tsx
export default function MapPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">컨퍼런스 지도</h1>
      <div className="bg-gray-100 rounded-lg h-[600px] flex items-center justify-center">
        <p className="text-gray-500">지도 준비 중입니다.</p>
      </div>
    </div>
  );
}
```

#### 체크리스트
- [ ] `src/app/map/page.tsx` 생성
- [ ] 빈 페이지 UI 구현
- [ ] 메타데이터 추가

---

### 작업 2.4: 빌드 테스트 (10분)

#### 체크리스트
- [ ] `npm run build` 성공 확인
- [ ] TypeScript 0 errors
- [ ] ESLint 0 warnings
- [ ] 정적 페이지 생성 확인

---

### Phase 2 완료 기준
- [x] BottomNavigation 컴포넌트 완성
- [x] Layout 통합 완료
- [x] 지도 페이지 생성
- [x] 빌드 성공

### Git Commit 메시지
```
feat: 하단 네비게이션 구현 (Phase 2 완료)

- 5개 탭 구현 (세션/부스/포스터/지도/QR)
- 중앙 원형 QR 버튼 (그라데이션, 그림자)
- 지도 페이지 빈 페이지 생성
- Layout 통합 (하단 패딩)

관련 파일:
- src/components/layout/BottomNavigation.tsx (신규)
- src/app/layout.tsx (수정)
- src/app/map/page.tsx (신규)

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## ⏳ Phase 3: Database 스키마 (대기)

### 목표
체크인 및 퀴즈 시스템을 위한 Database 테이블 생성

### 우선순위
**P0 (Critical)** - 백엔드 API의 기반

### 예상 시간
**1시간**

---

### 작업 3.1: Prisma 스키마 업데이트 (30분)

#### 파일 수정
```
moducon-backend/prisma/schema.prisma
```

#### 추가 모델 (3개)
1. **UserCheckin**: 체크인 기록
2. **Quiz**: 퀴즈 데이터
3. **UserQuizAttempt**: 퀴즈 답변 기록

#### 체크리스트
- [ ] `schema.prisma` 수정
- [ ] User 모델에 관계 추가
- [ ] 인덱스 설정

---

### 작업 3.2: 마이그레이션 생성 및 적용 (20분)

#### 명령어
```bash
# 1. 마이그레이션 생성
npx prisma migrate dev --name add_checkin_quiz_tables

# 2. 마이그레이션 적용
npx prisma migrate deploy

# 3. Prisma Client 재생성
npx prisma generate
```

#### 체크리스트
- [ ] 마이그레이션 파일 생성
- [ ] Database에 마이그레이션 적용
- [ ] Prisma Client 재생성

---

### 작업 3.3: 시드 데이터 추가 (10분)

#### 파일 생성
```
moducon-backend/prisma/seed.ts
```

#### 시드 데이터
```typescript
// 퀴즈 5개 추가
const quizzes = [
  {
    targetType: 'session',
    targetId: 'session-1',
    question: '이 세션의 주요 주제는?',
    answer: 'A',
    options: { A: 'AI/ML', B: '데이터 엔지니어링', C: '클라우드', D: '보안' }
  },
  // ... 4개 더
];
```

#### 체크리스트
- [ ] `seed.ts` 작성
- [ ] `npm run seed` 실행
- [ ] Database에 퀴즈 5개 추가 확인

---

### Phase 3 완료 기준
- [x] Prisma 스키마 업데이트
- [x] 마이그레이션 적용
- [x] 시드 데이터 추가
- [x] Database 테이블 생성 확인

---

## ⏳ Phase 4: 체크인 API 구현 (대기)

### 목표
체크인 및 퀴즈 API 엔드포인트 구현

### 우선순위
**P0 (Critical)** - QR 기능의 핵심 로직

### 예상 시간
**2시간**

---

### 작업 4.1: 체크인 API (1시간)

#### 파일 생성
```
moducon-backend/src/routes/checkin.ts
```

#### API 엔드포인트
1. **POST /api/checkin** - 체크인 기록
2. **GET /api/checkin** - 체크인 내역 조회

#### 체크리스트
- [ ] `checkin.ts` 라우터 생성
- [ ] POST /api/checkin 구현
- [ ] GET /api/checkin 구현
- [ ] 에러 핸들링 (중복 체크인, 인증 오류 등)
- [ ] Postman 테스트

---

### 작업 4.2: 퀴즈 API (1시간)

#### 파일 생성
```
moducon-backend/src/routes/quiz.ts
```

#### API 엔드포인트
1. **GET /api/quiz/:quizId** - 퀴즈 조회
2. **POST /api/quiz/:quizId/answer** - 퀴즈 답변 제출

#### 체크리스트
- [ ] `quiz.ts` 라우터 생성
- [ ] GET /api/quiz/:quizId 구현
- [ ] POST /api/quiz/:quizId/answer 구현
- [ ] 정답 검증 로직
- [ ] Postman 테스트

---

### Phase 4 완료 기준
- [x] 체크인 API 구현
- [x] 퀴즈 API 구현
- [x] Postman 테스트 통과
- [x] 에러 핸들링 완료

---

## ⏳ Phase 5: 마이페이지 (대기)

### 목표
사용자의 체크인 통계 및 배지를 표시하는 마이페이지 구현

### 우선순위
**P1 (High)** - 사용자 경험 향상

### 예상 시간
**1시간**

---

### 작업 5.1: 마이페이지 API (30분)

#### 파일 생성
```
moducon-backend/src/routes/myPage.ts
```

#### API 엔드포인트
**GET /api/my-page/stats** - 마이페이지 통계 조회

#### 체크리스트
- [ ] `myPage.ts` 라우터 생성
- [ ] 체크인 통계 조회 로직
- [ ] 배지 계산 로직
- [ ] Postman 테스트

---

### 작업 5.2: 마이페이지 UI (30분)

#### 파일 생성
```
moducon-frontend/src/app/my-page/
└── page.tsx        # 🆕 신규
```

#### 컴포넌트
1. **ProfileCard**: 사용자 정보
2. **CheckInStats**: 체크인 통계 (프로그레스 바)
3. **BadgeGrid**: 획득 배지 목록
4. **ShareButton**: 자랑하기 (선택 사항)

#### 체크리스트
- [ ] `my-page/page.tsx` 생성
- [ ] API 연동 (`/api/my-page/stats`)
- [ ] UI 컴포넌트 구현
- [ ] 반응형 디자인

---

### Phase 5 완료 기준
- [x] 마이페이지 API 구현
- [x] 마이페이지 UI 구현
- [x] API 연동 완료
- [x] 통계 데이터 표시 확인

---

## 🎯 전체 개발 일정

### Phase별 예상 일정
| Phase | 작업 | 예상 시간 | 담당자 |
|-------|------|----------|--------|
| Phase 1 | QR 스캔 UI 개선 | ~~1.5시간~~ 1시간 | ✅ hands-on worker |
| Phase 2 | 하단 네비게이션 | 2시간 | ⏳ hands-on worker |
| Phase 3 | Database 스키마 | 1시간 | ⏳ hands-on worker (백엔드) |
| Phase 4 | 체크인 API | 2시간 | ⏳ hands-on worker (백엔드) |
| Phase 5 | 마이페이지 | 1시간 | ⏳ hands-on worker (프론트엔드) |
| **총 예상** | - | **7.5시간 → 6.5시간** | - |

### 작업 순서 (Critical Path)
```
Phase 2 (하단 네비게이션) → Phase 3 (Database) → Phase 4 (API) → Phase 5 (마이페이지)
```

---

## 📊 진행률 추적

### 현재 상태
- **완료**: Phase 1 (13%)
- **진행 중**: Phase 2 (0%)
- **대기**: Phase 3-5

### 남은 작업
- **총 작업량**: 6.5시간
- **완료 작업량**: 1시간
- **진행률**: 13%

---

## ⚠️ 리스크 및 대응 방안

### Risk 1: Database 마이그레이션 실패 🟡
**영향**: Phase 3-4 지연
**확률**: 낮음 (10%)
**완화 방안**:
- Prisma 스키마 검증 (`npx prisma validate`)
- 마이그레이션 전 백업

### Risk 2: QR 스캔 실제 동작 미검증 🟡
**영향**: QR 기능 전체 재작업
**확률**: 중간 (30%)
**완화 방안**:
- Phase 2 완료 후 실제 QR 스캔 테스트
- 예시 QR 이미지 생성 및 검증

---

**최종 상태**: ✅ **Phase 2-5 개발 계획 작성 완료**

**다음 담당자**: hands-on worker (Phase 2 구현 착수)

---

**작성 완료 시각**: 2025-12-01 09:45 KST
