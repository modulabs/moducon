# 72_GIT_STRATEGY.md - Git 브랜치 관리 전략

## 📋 문서 정보
- **작성자**: Technical Lead
- **작성일**: 2025-11-28
- **버전**: v1.0
- **프로젝트**: 모두콘 2025 디지털 컨퍼런스 북

---

## 🎯 브랜치 전략 개요

### 목적
- **기능별 브랜치 분리**: 백엔드, 모바일 PWA 독립 개발
- **안정적 배포**: main 브랜치는 항상 배포 가능 상태 유지
- **체계적 관리**: 기능 완료 후 main 머지

### 브랜치 구조
```
main (프로덕션)
  ├── backend-dev (백엔드 + 관리자, 완료 ✅)
  └── mobile-pwa-dev (모바일 PWA, 신규 📋)
```

---

## 📊 현재 상태

### main 브랜치
**용도**: 프로덕션 배포용 (GitHub Pages)

**현재 상태**:
- ✅ PRD, API 스펙, DB 설계 완료
- ✅ 프론트엔드 프로젝트 초기화 (Next.js 14)
- ✅ 관리자 로그인 페이지 (기본 구현)

**최근 커밋**:
```
edae411 chore: 관리자 대시보드 UI 개선 최종 승인 완료
```

---

### backend-dev 브랜치
**용도**: 백엔드 API + 관리자 프론트엔드 개발

**완료 기능** ✅:
1. **백엔드 (moducon-backend)**:
   - PostgreSQL + Prisma ORM
   - Express + TypeScript
   - 인증 API 4개: 로그인, 서명, 사용자 정보, 리셋
   - 관리자 API 3개: 참가자 조회, 통계, 로그인
   - JWT 인증 미들웨어
   - 서명 저장 및 자동 업데이트

2. **프론트엔드 (moducon-frontend/src/app/admin)**:
   - 관리자 로그인 페이지
   - 관리자 대시보드 (탭 분리)
   - 참가자 목록 (검색, 정렬)
   - 서명 이미지 표시
   - shadcn/ui Tabs 컴포넌트

**테스트 완료**:
- ✅ 빌드 검증: 9.9초, TypeScript 에러 0건
- ✅ 기능 검증: 메인/상세 탭 전환
- ✅ 보안 검증: XSS 취약점 0건
- ✅ QA 점수: 100/100 (S등급)

**문서**:
- 📄 62_SIGNATURE_FIX_REPORT.md
- 📄 66_UI_IMPROVEMENT_PLAN.md
- 📄 67_UI_IMPROVEMENT_IMPLEMENTATION.md
- 📄 68_FINAL_UI_QA_REPORT.md

**커밋 수**: 5개
**마지막 커밋**:
```
(backend-dev) chore: 관리자 UI 개선 완료 및 문서화
```

---

### mobile-pwa-dev 브랜치 (신규 생성 예정)
**용도**: 모바일 PWA 프론트엔드 개발

**계획 기능** 📋:
1. **모바일 레이아웃**:
   - (mobile) 그룹 레이아웃
   - 하단 네비게이션

2. **QR 스캔 기능**:
   - html5-qrcode 통합
   - 세션/부스/페이퍼 QR 파싱

3. **홈 대시보드**:
   - 디지털 배지 (출입증)
   - 퀘스트 진행률
   - 실시간 혼잡도

4. **세션 타임테이블**:
   - 필터링 (트랙, 시간대)
   - 즐겨찾기
   - 체크인

5. **부스 & 페이퍼샵**:
   - 목록, 상세
   - 퀴즈 시스템

6. **퀘스트 시스템**:
   - 관심 분야 선택
   - 개인화 퀘스트
   - 진행 추적

7. **PWA 기능**:
   - Service Worker
   - 오프라인 지원
   - 설치 가능

**예상 일정**: 8일
**예상 커밋 수**: 15-20개

---

## 🔄 브랜치 작업 프로세스

### 1. backend-dev 브랜치 작업 (완료 ✅)

**현재 위치**:
```bash
git branch
# * backend-dev
```

**완료 작업**:
- ✅ 서명 기능 버그 수정
- ✅ 관리자 UI 개선 (탭 분리)
- ✅ 테스트 및 QA 통과

**다음 단계**: main 머지 (선택 사항)

---

### 2. mobile-pwa-dev 브랜치 생성 및 작업

#### Step 1: 브랜치 생성
```bash
# 현재 backend-dev에서 작업 중이라면
git add .
git commit -m "chore: backend-dev 최종 상태 저장"

# main 브랜치로 이동
git checkout main

# 새 브랜치 생성
git checkout -b mobile-pwa-dev
```

#### Step 2: 작업 진행
```bash
# Phase 2.1: 프로젝트 초기화
npm install html5-qrcode date-fns lucide-react
mkdir -p src/app/\(mobile\)
mkdir -p src/components/mobile
mkdir -p src/store
# ... 파일 작성

git add .
git commit -m "feat: 모바일 PWA 프로젝트 초기화

- 디렉토리 구조 생성
- 의존성 설치
- 환경 변수 설정"

# Phase 2.2: QR 스캔 기능
# ... QRScanner 컴포넌트 작성

git commit -m "feat: QR 스캔 기능 구현

- html5-qrcode 통합
- 세션/부스/페이퍼 QR 파싱
- 스캔 페이지 UI"

# 이후 Phase 2.3 ~ 2.7 순차 진행
```

#### Step 3: 중간 푸시 (선택 사항)
```bash
# 진행 상황 백업
git push -u origin mobile-pwa-dev
```

#### Step 4: 최종 머지 (모든 Phase 완료 후)
```bash
# 빌드 테스트
npm run build

# TypeScript 에러 확인
npm run type-check

# main 브랜치로 이동
git checkout main

# 머지
git merge mobile-pwa-dev

# 푸시
git push origin main
```

---

## 📋 커밋 메시지 규칙

### 커밋 메시지 형식
```
<type>: <subject>

<body>

<footer>
```

### Type 종류
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 스타일 변경 (포맷, 세미콜론 등)
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드, 패키지 등 기타 변경
- `perf`: 성능 개선

### 예시
```bash
# 좋은 예시 ✅
git commit -m "feat: QR 스캔 기능 구현

- html5-qrcode 라이브러리 통합
- 후방 카메라 활성화
- QR 데이터 파싱 유틸리티 추가"

git commit -m "fix: 서명 이미지 표시 버그 수정

- users.signatureUrl 자동 업데이트 추가
- 테이블 내 이미지 직접 표시
- 미완료자 빈칸 처리"

git commit -m "docs: 모바일 PWA 개발 계획서 작성

- Phase 2.1 ~ 2.7 상세 계획
- 기술 스택 및 디렉토리 구조
- Git 브랜치 전략"

# 나쁜 예시 ❌
git commit -m "update"
git commit -m "fix bug"
git commit -m "add feature"
```

---

## 🚨 주의사항

### 1. main 브랜치 보호
- ❌ **직접 푸시 금지**: main에 직접 커밋하지 않기
- ✅ **기능 브랜치 사용**: 항상 feature 브랜치에서 작업
- ✅ **테스트 후 머지**: 빌드 및 테스트 통과 후 머지

### 2. 브랜치 동기화
```bash
# main 최신 상태 유지
git checkout main
git pull origin main

# 기능 브랜치에 main 반영
git checkout mobile-pwa-dev
git rebase main # 또는 git merge main
```

### 3. 충돌 해결
```bash
# 충돌 발생 시
git status
# Unmerged paths 확인

# 파일 수동 수정 후
git add <resolved-file>
git rebase --continue # 또는 git merge --continue
```

### 4. 백업
```bash
# 작업 중 정기 푸시
git push origin mobile-pwa-dev

# 또는 로컬 브랜치 백업
git branch backup-mobile-pwa-dev
```

---

## 📊 브랜치 현황 요약

| 브랜치 | 상태 | 기능 | 커밋 수 | 마지막 업데이트 |
|--------|------|------|---------|----------------|
| main | ✅ 안정 | 프로덕션 | 28개 | 2025-11-22 |
| backend-dev | ✅ 완료 | 백엔드 + 관리자 | 5개 | 2025-11-22 |
| mobile-pwa-dev | 📋 예정 | 모바일 PWA | 0개 | - |

---

## 🎯 다음 단계

### 1. backend-dev 브랜치 정리 (선택 사항)
```bash
# backend-dev → main 머지 (선택)
git checkout main
git merge backend-dev
git push origin main

# 또는 backend-dev 그대로 유지 (권장)
# → 향후 백엔드 추가 개발 시 재사용
```

### 2. mobile-pwa-dev 브랜치 생성
```bash
git checkout main
git checkout -b mobile-pwa-dev
```

### 3. 모바일 PWA 개발 시작
- 📄 **참고 문서**: 71_MOBILE_PWA_DEV_PLAN.md
- 📅 **예상 일정**: 8일
- 👤 **담당자**: hands-on worker

---

## 📝 최종 체크리스트

### backend-dev 브랜치 ✅
- [x] 백엔드 API 구현 완료
- [x] 관리자 프론트엔드 구현 완료
- [x] 테스트 및 QA 통과
- [x] 문서 작성 완료
- [ ] main 머지 (선택 사항)

### mobile-pwa-dev 브랜치 📋
- [ ] 브랜치 생성
- [ ] Phase 2.1: 프로젝트 초기화
- [ ] Phase 2.2: QR 스캔 기능
- [ ] Phase 2.3: 홈 대시보드
- [ ] Phase 2.4: 세션 타임테이블
- [ ] Phase 2.5: 부스 & 페이퍼샵
- [ ] Phase 2.6: 퀘스트 시스템
- [ ] Phase 2.7: PWA 기능
- [ ] 테스트 및 QA
- [ ] main 머지

---

**다음 담당자**: hands-on worker
**다음 작업**: mobile-pwa-dev 브랜치 생성 및 개발 시작
