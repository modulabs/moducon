# 145_NEXT_DEV_PLAN.md - 향후 개발 계획

**작성일**: 2025-12-01
**작성자**: Technical Lead
**버전**: v2.1
**기반 문서**: 139_DEV_PLAN_UPDATE.md v2.0

---

## 📋 개발 계획 요약

### 현재 상태 (2025-12-01)
- **전체 완성도**: 85%
- **Phase 8 완료**: 하단 네비게이션, 지도 페이지 ✅
- **Phase 9 예정**: 부스/포스터 데이터 연동 (2시간)

---

## 🎯 Phase 9: 부스/포스터 데이터 연동 (우선순위: P0)

### 9.1 부스 데이터 추가 (예상 1시간)

#### 데이터 소스
- **Google Sheets**: 모두콘 2025 부스 정보
- **예상 개수**: 13개 부스
- **필드**: id, name, organization, description, location, category, tags

#### 작업 단계
1. **Google Sheets 데이터 추출** (20분)
   - 시트 접근 권한 확인
   - 데이터 복사 → JSON 변환
   - 필드 검증 (필수/선택 구분)

2. **JSON 파일 생성** (10분)
   ```json
   // /public/data/booths.json
   [
     {
       "id": "booth-01",
       "name": "ModuLabs AI 연구소",
       "organization": "ModuLabs",
       "description": "생성형 AI 최신 연구 소개 및 체험",
       "location": "1층 부스존 A-1",
       "category": "연구",
       "tags": ["AI", "연구", "생성형"]
     },
     // ... 12개 더
   ]
   ```

3. **UI 연동 검증** (15분)
   - `/app/booths/page.tsx` 동작 확인
   - boothCache.ts 캐싱 검증
   - 카테고리별 필터링 테스트

4. **빌드 및 배포** (15분)
   - `npm run build` 실행
   - 정적 페이지 생성 확인
   - Git commit & push

### 9.2 포스터 데이터 추가 (예상 1시간)

#### 데이터 소스
- **Google Sheets**: 모두콘 2025 포스터 정보
- **예상 개수**: 33개 포스터
- **필드**: id, title, authors, organization, category, abstract, keywords

#### 작업 단계
1. **Google Sheets 데이터 추출** (20분)
   - 시트 접근 권한 확인
   - 데이터 복사 → JSON 변환
   - authors 필드 배열 변환

2. **JSON 파일 생성** (10분)
   ```json
   // /public/data/papers.json
   [
     {
       "id": "paper-01",
       "title": "Transformer 모델 최적화 기법",
       "authors": ["홍길동", "김철수"],
       "organization": "모두의연구소",
       "category": "딥러닝",
       "abstract": "Transformer 모델의 추론 속도를 개선하는 새로운 기법을 제안합니다...",
       "keywords": ["Transformer", "최적화", "추론"]
     },
     // ... 32개 더
   ]
   ```

3. **UI 연동 검증** (15분)
   - `/app/papers/page.tsx` 동작 확인
   - paperCache.ts 캐싱 검증
   - 카테고리별 필터링 테스트

4. **빌드 및 배포** (15분)
   - `npm run build` 실행
   - 정적 페이지 생성 확인
   - Git commit & push

---

## 🚀 Phase 10: SNS 공유 기능 (우선순위: P1)

### 10.1 공유 버튼 구현 (예상 2시간)

#### 기능 명세
1. **세션 상세 페이지 공유**
   - "공유하기" 버튼 추가
   - Twitter, Facebook, Kakao 연동
   - 클립보드 복사 기능

2. **Open Graph 메타 태그**
   ```html
   <meta property="og:title" content="{세션 제목}" />
   <meta property="og:description" content="{세션 설명}" />
   <meta property="og:image" content="{연사 프로필}" />
   <meta property="og:url" content="{세션 URL}" />
   ```

3. **공유 데이터 포맷**
   ```
   📚 모두콘 2025: {세션 제목}
   🎤 연사: {연사 이름} ({소속})
   ⏰ {시간} | 📍 {장소}
   🔗 {세션 URL}
   #모두콘2025 #AI컨퍼런스
   ```

### 10.2 내 일정 공유 (예상 1시간)

#### 기능 명세
1. **즐겨찾기 세션 목록**
   - localStorage에 저장
   - "내 일정 공유" 버튼

2. **공유 이미지 생성**
   - Canvas API 사용
   - 세션 목록 → 이미지 변환
   - SNS 업로드 용이

---

## 📊 Phase 11: 지도 페이지 완성 (우선순위: P2)

### 11.1 SVG 지도 이미지 추가 (예상 2시간)

#### 작업 내용
1. **컨퍼런스 장소 도면 획득**
   - 주최 측에서 제공
   - SVG 포맷 변환

2. **인터랙티브 맵 구현**
   ```typescript
   // /app/map/page.tsx
   import VenueMap from '@/components/map/VenueMap';

   export default function MapPage() {
     return (
       <div className="p-4">
         <VenueMap
           onLocationClick={(location) => {
             // 해당 위치 세션/부스 표시
           }}
         />
       </div>
     );
   }
   ```

3. **현재 위치 표시**
   - 실내 GPS (가능 시)
   - 수동 위치 선택 (대체)

---

## 🎮 Phase 12: 퀘스트 시스템 완성 (우선순위: P2)

### 12.1 퀘스트 자동 생성 (예상 6시간)

#### 알고리즘 설계
```typescript
// /lib/questGenerator.ts

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'session' | 'booth' | 'paper' | 'hidden';
  targets: string[]; // 세션/부스 ID 목록
  reward: string; // 배지 ID
  completed: boolean;
}

export function generateQuests(interests: string[]): Quest[] {
  const quests: Quest[] = [];

  // 1. 세션 퀘스트 (관심사 기반)
  const sessionQuest = {
    id: 'quest-session-1',
    title: '관심 세션 3개 참석하기',
    description: '선택한 관심사 관련 세션 3개 이상 참석',
    type: 'session',
    targets: getSessionsByInterests(interests).slice(0, 3),
    reward: 'badge-session-master',
    completed: false,
  };
  quests.push(sessionQuest);

  // 2. 부스 퀘스트
  const boothQuest = {
    id: 'quest-booth-1',
    title: '부스 5곳 방문하기',
    description: '다양한 부스를 방문하고 체험하기',
    type: 'booth',
    targets: getAllBooths().slice(0, 5),
    reward: 'badge-explorer',
    completed: false,
  };
  quests.push(boothQuest);

  // 3. 히든 퀘스트
  const hiddenQuest = {
    id: 'quest-hidden-1',
    title: '숨겨진 QR 찾기',
    description: '컨퍼런스 장 곳곳에 숨겨진 특별 QR 코드 발견',
    type: 'hidden',
    targets: ['hidden-qr-1', 'hidden-qr-2'],
    reward: 'badge-secret-hunter',
    completed: false,
  };
  quests.push(hiddenQuest);

  return quests;
}
```

### 12.2 퀘스트 진행 추적 (예상 2시간)

#### 구현 내용
1. **Zustand 스토어**
   ```typescript
   // /store/questStore.ts
   interface QuestStore {
     quests: Quest[];
     checkInSession: (sessionId: string) => void;
     visitBooth: (boothId: string) => void;
     scanHiddenQR: (qrId: string) => void;
   }

   export const useQuestStore = create<QuestStore>((set) => ({
     quests: [],
     checkInSession: (sessionId) => set((state) => {
       // 퀘스트 진행률 업데이트
     }),
     // ...
   }));
   ```

2. **진행률 UI**
   - `/app/home/page.tsx`에 표시
   - Progress Bar (0-100%)
   - 완료된 퀘스트 체크 표시

---

## 🏆 Phase 13: 배지 시스템 (우선순위: P2)

### 13.1 배지 디자인 및 구현 (예상 4시간)

#### 배지 종류 (5개)
1. **Session Master** 🎓
   - 조건: 세션 5개 이상 참석
   - 디자인: 졸업모자 아이콘

2. **Explorer** 🧭
   - 조건: 부스 10곳 방문
   - 디자인: 나침반 아이콘

3. **Scholar** 📜
   - 조건: 포스터 10개 열람
   - 디자인: 두루마리 아이콘

4. **Secret Hunter** 🔍
   - 조건: 히든 QR 2개 발견
   - 디자인: 돋보기 아이콘

5. **Completionist** 🏆
   - 조건: 모든 퀘스트 완료
   - 디자인: 트로피 아이콘

#### 구현 코드
```typescript
// /components/badge/BadgeDisplay.tsx
export function BadgeDisplay({ badges }: { badges: string[] }) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {ALL_BADGES.map(badge => (
        <div
          key={badge.id}
          className={badges.includes(badge.id) ? 'opacity-100' : 'opacity-30'}
        >
          <badge.icon className="w-12 h-12" />
          <p className="text-xs text-center">{badge.name}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 📈 Phase 14: 성능 최적화 (우선순위: P1)

### 14.1 Lighthouse 성능 검증 (예상 2시간)

#### 목표 지표
```yaml
Performance: 90+
Accessibility: 95+
Best Practices: 95+
SEO: 90+
```

#### 최적화 항목
1. **이미지 최적화**
   - WebP 포맷 변환
   - Lazy Loading 적용
   - 적절한 해상도 (2x, 3x)

2. **번들 크기 최적화**
   - Tree Shaking
   - Code Splitting
   - Dynamic Import

3. **CSS 최적화**
   - Tailwind CSS Purge
   - Critical CSS 추출

---

## 🚀 배포 및 운영 계획

### 배포 전 체크리스트
- [ ] 부스 데이터 13개 추가
- [ ] 포스터 데이터 33개 추가
- [ ] SNS 공유 기능 구현
- [ ] Open Graph 메타 태그
- [ ] Lighthouse 성능 90+
- [ ] 크로스 브라우저 테스트
- [ ] 모바일 테스트 (iOS, Android)

### 운영 모니터링
1. **사용자 피드백 수집**
   - Google Forms 설문
   - GitHub Issues

2. **성능 모니터링**
   - Vercel Analytics (선택)
   - Google Analytics

3. **오류 추적**
   - Sentry (선택)
   - 브라우저 Console Logs

---

## 📊 예상 일정 (총 28시간)

| Phase | 작업 내용 | 예상 시간 | 우선순위 |
|-------|----------|----------|----------|
| Phase 9 | 부스/포스터 데이터 | 2시간 | P0 |
| Phase 10 | SNS 공유 기능 | 3시간 | P1 |
| Phase 14 | 성능 최적화 | 2시간 | P1 |
| Phase 11 | 지도 페이지 완성 | 2시간 | P2 |
| Phase 12 | 퀘스트 시스템 | 8시간 | P2 |
| Phase 13 | 배지 시스템 | 4시간 | P2 |
| 문서화 | README, 케이스 스터디 | 4시간 | P1 |
| 테스트 | 크로스 브라우저, 모바일 | 3시간 | P0 |

**총 예상 시간**: 28시간 (약 3.5일)

---

## 🎯 최종 목표

### 1주 내 (P0-P1)
1. ✅ Phase 9 완료 (부스/포스터 데이터)
2. ✅ Phase 10 완료 (SNS 공유)
3. ✅ Phase 14 완료 (성능 최적화)
4. ✅ 문서화 (README.md)
5. ✅ 배포 및 테스트

### 2주 내 (P2)
6. ✅ Phase 11 완료 (지도 페이지)
7. ✅ Phase 12 완료 (퀘스트 시스템)
8. ✅ Phase 13 완료 (배지 시스템)

### 1개월 내 (P3)
9. 실시간 혼잡도
10. AI 추천 시스템
11. 리더보드

---

**작성 완료일**: 2025-12-01
**버전**: v2.1
**다음 단계**: Phase 9 착수 (부스/포스터 데이터 추가)
**담당자**: hands-on worker
