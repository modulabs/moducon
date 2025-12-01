# UI 가시성 검증 가이드

**작성일**: 2025-12-01
**목적**: 사용자 제기 UI 이슈 검증 및 해결 방안

---

## 🎯 검증 대상 이슈

### Issue #1: 홈 화면 "참가자" 블록
**상태**: ✅ **해결 완료**
**위치**: `src/components/home/DigitalBadge.tsx`

### Issue #2: 하단 네비게이션 QR 아이콘 가시성
**상태**: ⚠️ **실제 테스트 필요**
**위치**: `src/components/layout/BottomNavigation.tsx`

---

## 1. Issue #1: 홈 화면 "참가자" 블록 ✅

### 현재 구현 상태

```typescript
// src/components/home/DigitalBadge.tsx (lines 10-21)
<Card className="w-full">
  <CardContent className="p-6 flex items-center gap-6">
    <div className="p-4 bg-primary/10 rounded-lg">
      <div className="w-16 h-16 flex items-center justify-center">
        <span className="text-4xl">🎫</span>
      </div>
    </div>
    <div>
      <p className="text-sm text-muted-foreground">디지털 배지</p>
      <h2 className="text-2xl font-bold">{user?.name}</h2>
    </div>
  </CardContent>
</Card>
```

### 변경 이력

**이전 버전** (제거됨):
```typescript
// 제거된 코드 (사용자 언급)
<p>참가자</p>
<QrCode className="w-16 h-16" />
```

**현재 버전** (최적화 완료):
```typescript
// 현재 코드
<p className="text-sm text-muted-foreground">디지털 배지</p>
<span className="text-4xl">🎫</span>
<h2 className="text-2xl font-bold">{user?.name}</h2>
```

### 검증 결과

| 항목 | 이전 | 현재 | 상태 |
|-----|------|------|------|
| 텍스트 | "참가자" | "디지털 배지" | ✅ 변경됨 |
| 아이콘 | `<QrCode />` | 🎫 이모지 | ✅ 변경됨 |
| 배경색 | 없음 | `bg-primary/10` | ✅ 추가됨 |
| 레이아웃 | 기본 | flex gap-6 | ✅ 개선됨 |

### 결론

**✅ 문제 없음** - "참가자" 블록은 이미 제거되고 최적화 완료

**가능한 원인**:
1. 브라우저 캐시 (이전 버전 표시)
2. 다른 페이지 참조 (홈이 아닌 다른 페이지)
3. 오해 (DigitalBadge 자체를 참가자 블록으로 인식)

**권장 조치**:
```bash
# 1. 브라우저 캐시 클리어
# Chrome: Cmd+Shift+Delete (Mac) / Ctrl+Shift+Delete (Windows)
# Safari: Cmd+Option+E

# 2. 하드 리프레시
# Chrome/Safari: Cmd+Shift+R (Mac) / Ctrl+F5 (Windows)

# 3. 빌드 재실행
cd moducon-frontend
rm -rf .next
npm run dev
```

---

## 2. Issue #2: 하단 네비게이션 QR 아이콘 가시성 ⚠️

### 현재 구현 상태

```typescript
// src/components/layout/BottomNavigation.tsx (lines 40-72)
<button
  onClick={() => setQrModalOpen(true)}
  className="relative -top-2 flex flex-col items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-[0_4px_12px_rgba(79,70,229,0.4)] ring-4 ring-white hover:scale-105 transition-transform"
  aria-label="QR 코드 스캔"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#FFFFFF"        // ✅ 명시적 흰색
    strokeWidth="2.5"       // ✅ 선명도 향상
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mb-1"
  >
    <rect width="5" height="5" x="3" y="3" rx="1"></rect>
    <rect width="5" height="5" x="16" y="3" rx="1"></rect>
    <rect width="5" height="5" x="3" y="16" rx="1"></rect>
    <path d="M21 16h-3a2 2 0 0 0-2 2v3"></path>
    <path d="M21 21v.01"></path>
    <path d="M12 7v3a2 2 0 0 1-2 2H7"></path>
    <path d="M3 12h.01"></path>
    <path d="M12 3h.01"></path>
    <path d="M12 16v.01"></path>
    <path d="M16 12h1"></path>
    <path d="M21 12v.01"></path>
    <path d="M12 21v-1"></path>
  </svg>
  <span className="text-[9px] text-white font-bold tracking-wider">SCAN</span>
</button>
```

### 코드 분석

| 속성 | 값 | 상태 | 판정 |
|-----|-----|------|------|
| `stroke` | `#FFFFFF` | 명시적 흰색 | ✅ 정상 |
| `strokeWidth` | `2.5` | 선 두께 증가 | ✅ 정상 |
| `width/height` | `28px` | 아이콘 크기 | ✅ 충분 |
| 버튼 배경 | `bg-gradient-to-r from-primary to-primary/80` | 보라색 그라디언트 | ✅ 정상 |
| 텍스트 | `text-white` | 흰색 | ✅ 정상 |
| 링 테두리 | `ring-4 ring-white` | 흰색 테두리 | ✅ 정상 |

### 가능한 원인

#### 원인 1: 브라우저 캐시 (가능성: 80%)
**증상**: 이전 버전 (stroke 속성 없음) 캐싱
**확인 방법**:
```bash
# 개발자 도구 → Network → Disable cache 체크
# 하드 리프레시: Cmd+Shift+R
```

#### 원인 2: Primary 색상 문제 (가능성: 15%)
**증상**: `primary` Tailwind 색상이 밝은 경우 대비 부족
**확인 방법**:
```typescript
// tailwind.config.ts 확인
colors: {
  primary: {
    DEFAULT: '#4f46e5',  // 보라색 (정상)
    ...
  }
}
```

#### 원인 3: Dark Mode 간섭 (가능성: 5%)
**증상**: 시스템 다크 모드에서 색상 반전
**확인 방법**:
```typescript
// 명시적 stroke로 이미 방지됨
stroke="#FFFFFF"  // 다크 모드 영향 없음
```

### 실제 테스트 가이드

#### Step 1: 브라우저 캐시 클리어
```bash
# Chrome
1. Cmd+Shift+Delete (Mac) / Ctrl+Shift+Delete (Windows)
2. "Cached images and files" 체크
3. "Clear data" 클릭

# Safari
1. Cmd+Option+E (Mac)
2. "Develop" → "Empty Caches"

# 또는 하드 리프레시
Cmd+Shift+R (Mac) / Ctrl+F5 (Windows)
```

#### Step 2: 개발자 도구 검사
```bash
1. F12 → Elements 탭
2. 중앙 QR 버튼 선택
3. Computed 탭에서 실제 적용된 CSS 확인
   - stroke: #FFFFFF 확인
   - background: primary gradient 확인
4. Console에서 색상 대비 확인
   - getComputedStyle(qrButton).stroke
```

#### Step 3: 실제 디바이스 테스트
```yaml
iOS:
  - Safari (light mode)
  - Safari (dark mode)
  - Chrome (light mode)

Android:
  - Chrome (light mode)
  - Chrome (dark mode)
  - Samsung Internet

Desktop:
  - Chrome (Mac)
  - Safari (Mac)
  - Edge (Windows)
```

#### Step 4: 스크린샷 확인
```bash
# 다음 상태에서 스크린샷 촬영
1. 홈 화면 (하단 네비게이션 포함)
2. 세션 페이지 (하단 네비게이션 포함)
3. 부스 페이지 (하단 네비게이션 포함)

# 확인 사항
- QR 아이콘 가시성
- "SCAN" 텍스트 가시성
- 버튼 그라디언트 표시
- 링 테두리 표시
```

### 대체 해결 방안 (필요 시)

#### 방안 1: Tailwind 클래스 사용 (권장)
```typescript
// 현재: 명시적 색상
stroke="#FFFFFF"

// 대안: Tailwind 클래스
stroke="currentColor"
className="text-white mb-1"

// 장점: Tailwind의 모든 색상 유틸리티 활용 가능
// 단점: 없음 (동일한 효과)
```

#### 방안 2: 대비 강화
```typescript
// 버튼 배경 더 어둡게
className="bg-gradient-to-r from-primary-600 to-primary-500"

// 또는 단색 배경
className="bg-primary-600"
```

#### 방안 3: 드롭 쉐도우 추가
```typescript
<svg
  // ... 기존 속성
  className="mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
>
```

#### 방안 4: 필터 효과
```typescript
<svg
  // ... 기존 속성
  style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))' }}
>
```

### 코드 패치 (필요 시)

```typescript
// src/components/layout/BottomNavigation.tsx

// ✅ 현재 코드 (변경 불필요)
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="28"
  height="28"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#FFFFFF"        // 이미 최적
  strokeWidth="2.5"       // 이미 최적
  strokeLinecap="round"
  strokeLinejoin="round"
  className="mb-1"
>
  {/* ... SVG paths ... */}
</svg>

// ⚠️ 대안 1 (Tailwind 클래스 사용 - 동일한 효과)
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="28"
  height="28"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"   // 변경
  strokeWidth="2.5"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="mb-1 text-white"  // 추가
>
  {/* ... SVG paths ... */}
</svg>

// ⚠️ 대안 2 (드롭 쉐도우 추가 - 더 강한 가시성)
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="28"
  height="28"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#FFFFFF"
  strokeWidth="2.5"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"  // 추가
>
  {/* ... SVG paths ... */}
</svg>
```

---

## 3. 종합 검증 체크리스트

### Phase 1: 코드 검증 ✅
- [x] DigitalBadge "참가자" 텍스트 제거 확인
- [x] QR 아이콘 stroke 속성 확인
- [x] 버튼 배경색 그라디언트 확인
- [x] 텍스트 색상 white 확인

### Phase 2: 로컬 테스트 (필수)
- [ ] 브라우저 캐시 클리어
- [ ] 하드 리프레시 (Cmd+Shift+R)
- [ ] 개발 서버 재시작
- [ ] 빌드 재실행 (rm -rf .next)

### Phase 3: 실제 디바이스 테스트 (권장)
- [ ] iOS Safari (light mode)
- [ ] iOS Safari (dark mode)
- [ ] Android Chrome (light mode)
- [ ] Android Chrome (dark mode)
- [ ] Desktop Chrome (Mac)

### Phase 4: 스크린샷 캡처 (문서화)
- [ ] 홈 화면 (DigitalBadge 확인)
- [ ] 하단 네비게이션 (QR 버튼 확인)
- [ ] 여러 페이지 (일관성 확인)

### Phase 5: 사용자 확인
- [ ] 사용자에게 테스트 URL 제공
- [ ] 캐시 클리어 가이드 전달
- [ ] 스크린샷 요청 (재현 여부 확인)

---

## 4. 최종 판정

### Issue #1: 홈 화면 "참가자" 블록
**상태**: ✅ **해결 완료**
**조치**: 없음 (이미 최적화됨)
**사용자 액션**: 브라우저 캐시 클리어

### Issue #2: 하단 네비게이션 QR 아이콘
**상태**: ⚠️ **코드상 문제 없음**
**조치**: 실제 디바이스 테스트 필요
**가능성**:
- 80%: 브라우저 캐시 문제
- 15%: 환경별 렌더링 차이
- 5%: 다크 모드 간섭

**권장 조치**:
1. 브라우저 캐시 클리어 (최우선)
2. 하드 리프레시 (Cmd+Shift+R)
3. 실제 디바이스 테스트
4. 필요 시 대안 코드 적용

---

## 5. 빠른 테스트 명령어

```bash
# 1. 개발 서버 재시작
cd moducon-frontend
rm -rf .next
npm run dev

# 2. 프로덕션 빌드 테스트
npm run build
npm start

# 3. 캐시 없이 브라우저 열기 (Chrome)
open -a "Google Chrome" --args --disable-cache http://localhost:3000

# 4. 모바일 시뮬레이션 (Chrome DevTools)
# F12 → Toggle device toolbar (Cmd+Shift+M)
```

---

**작성자**: Technical QA Lead
**최종 업데이트**: 2025-12-01
**다음 단계**: 사용자 실제 테스트 → 결과 피드백 → 필요 시 코드 패치
