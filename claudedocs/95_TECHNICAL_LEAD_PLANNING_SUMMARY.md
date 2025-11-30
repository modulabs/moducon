# 95_TECHNICAL_LEAD_PLANNING_SUMMARY.md - 테크니컬 리드 기획 완료 요약

**프로젝트명**: 모두콘 2025 디지털 컨퍼런스 북 개선
**작성일**: 2025-11-30
**작성자**: Technical Lead
**문서 유형**: Executive Summary

---

## 📋 Executive Summary

모두콘 2025 디지털 컨퍼런스 북의 신규 요구사항 2개에 대한 기획 작업을 완료했습니다. QR 스캐너 UI 개선과 세션 데이터 실시간 연동을 위한 상세 명세서, 기술 요구사항, 개발 계획이 수립되었습니다.

### 작업 기간
- **기획 시작**: 2025-11-30 09:00
- **기획 완료**: 2025-11-30 11:30
- **소요 시간**: 2.5시간

### 산출물
1. ✅ **01_PRD.md** (v1.8) - 제품 요구사항 명세서
2. ✅ **02_TECHNICAL_REQUIREMENTS.md** - 기술 요구사항 명세
3. ✅ **03_DEVELOPMENT_PLAN.md** - 개발 계획서
4. ✅ **07_PROGRESS.md** - 진행 현황 문서

---

## 🎯 신규 요구사항 정리

### 요구사항 1: QR 스캐너 UI 개선

#### 현재 문제
```
❌ 기본 html5-qrcode UI (사용자 친화적이지 않음)
❌ 다른 UI 요소와 분리되지 않음
❌ 모바일 UX 최적화 미흡
```

#### 개선 방향
```
✅ 원형 버튼 (120px, 화면 중앙 하단 고정)
✅ 전체 화면 카메라 모달
✅ 후방 카메라 자동 선택
✅ 250px 스캔 가이드라인
✅ 햅틱 피드백 및 친절한 안내
```

#### 예상 개발 시간
- **2-4시간** (프론트엔드)

#### 핵심 컴포넌트
1. `QRFloatingButton.tsx` - 원형 버튼
2. `QRScannerModal.tsx` - 전체 화면 모달
3. `QRIcon.tsx` - SVG 아이콘

---

### 요구사항 2: 세션 데이터 Google Sheets 연동

#### 현재 문제
```
❌ Google Sheets에 33개 세션 데이터 존재
❌ 백엔드 getSessions() 빈 배열 반환
❌ 프론트엔드 "세션 데이터가 없습니다" 메시지
```

#### 개선 방향
```
✅ Google Sheets API v4 연동
✅ 33개 세션 × 14개 필드 파싱
✅ 트랙별 필터링 (Track 00, 01, 10, i, 101)
✅ 5분 캐싱 (sessionStorage)
✅ 난이도 자동 추론 (키워드 기반)
```

#### 예상 개발 시간
- **2-3시간** (백엔드)
- **2-3시간** (프론트엔드)
- **총 4-6시간**

#### 핵심 기능
1. `googleSheetsService.ts` - API 연동
2. `sessionCache.ts` - 캐싱 레이어
3. `sessions/page.tsx` - UI 업데이트

---

## 📊 데이터 분석 결과

### Google Sheets 세션 데이터
- **Spreadsheet ID**: `1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g`
- **시트명**: `세션`
- **데이터 규모**: 33개 세션

### 세션 분포
| 트랙 | 세션 수 | 예시 |
|------|---------|------|
| Track 00 | 7개 | 노정석, 김태훈, 정지훈 등 |
| Track 01 | 6개 | 이화여대 연구팀, 창업가 등 |
| Track 10 | 9개 | 다오랩, 해례랩, RSC 등 |
| Track i | 6개 | 테크포임팩트 LAB 등 |
| Track 101 | 4개 | 아이펠리서치, 교육 과정 |

### 데이터 필드 (14개)
1. 번호 (ID)
2. 페이지 URL
3. 트랙
4. 위치
5. 발표-시간 (**파싱 필요**: "10:10-10:50" → startTime, endTime)
6. 연사-명
7. 연사-소속
8. 연사-소개
9. 연사-프로필
10. 발표-제목
11. 발표-내용
12-14. 키워드1-3 (**배열 변환 필요**)

---

## 🏗️ 기술 아키텍처

### 시스템 구조
```
Frontend (Next.js 16)
├── QRFloatingButton (신규)
│   └── QRScannerModal (신규)
├── SessionsPage (개선)
│   └── sessionCache (신규)
└── html5-qrcode (기존)

Backend (Express.js)
├── googleSheetsService (개선)
│   ├── getSessions()
│   ├── filterSessions()
│   └── axios + Google API
└── routes/sessions.ts (기존)

Data Source
└── Google Sheets API v4
    └── Spreadsheet: 1djkPQzg...
        ├── "세션" (33개)
        ├── "부스" (13개)
        └── "포스터" (33개)
```

### 기술 스택
- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Express.js, TypeScript, axios
- **API**: Google Sheets API v4
- **QR**: html5-qrcode v2.3.8
- **캐싱**: sessionStorage (5분 TTL)

---

## 📅 개발 계획

### Phase 1: 백엔드 (2-3시간)
**Day 1 - Morning**

#### 환경 설정 (30분)
- [ ] Google Sheets API 키 발급
- [ ] `.env` 파일 설정
- [ ] `axios` 패키지 설치

#### 타입 정의 (30분)
- [ ] `src/types/session.ts` 생성
- [ ] `Session`, `SessionRaw` 인터페이스

#### Google Sheets Service (1시간)
- [ ] `getSessions()` 구현
- [ ] 시간 파싱 유틸리티
- [ ] 난이도 추론 로직
- [ ] 에러 핸들링

#### 검증
```bash
curl http://localhost:3001/api/sessions
# Expected: 33개 세션 데이터
```

---

### Phase 2: 프론트엔드 (4-6시간)
**Day 1 - Afternoon + Day 2 - Morning**

#### QR 스캐너 (3시간)
- [ ] `QRIcon.tsx` SVG 컴포넌트
- [ ] `QRFloatingButton.tsx` 원형 버튼
- [ ] `QRScannerModal.tsx` 전체 화면 모달
- [ ] Tailwind 애니메이션 설정
- [ ] 홈 페이지 통합

#### 세션 데이터 (2시간)
- [ ] `lib/sessionCache.ts` 캐싱 레이어
- [ ] `app/sessions/page.tsx` 업데이트
- [ ] 트랙 필터링
- [ ] 에러 처리

#### 검증
- [ ] QR 버튼 표시
- [ ] 카메라 권한 요청
- [ ] 33개 세션 로딩
- [ ] 트랙 필터 동작

---

### Phase 3: 통합 테스트 (1시간)
**Day 2 - Afternoon**

#### 기능 테스트 (30분)
- [ ] QR 스캔 성공률
- [ ] 세션 데이터 로딩
- [ ] 캐싱 동작

#### 성능 테스트 (15분)
- [ ] API 응답 < 500ms
- [ ] 캐시 적중 < 10ms
- [ ] QR 스캔 < 1초

#### 에러 시나리오 (15분)
- [ ] 네트워크 오프라인
- [ ] API 오류
- [ ] 카메라 권한 거부

---

## ✅ 성공 지표 (KPI)

### 정량적 지표
| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| QR 스캔 성공률 | 95% 이상 | 스캔 시도 대비 성공 |
| 세션 데이터 로딩 성공률 | 99% 이상 | API 호출 성공 비율 |
| 평균 QR 스캔 시간 | 5초 이내 | 버튼 클릭 → 스캔 성공 |
| 세션 API 응답 시간 | 500ms 이내 | API 응답 시간 |
| 캐시 적중률 | 80% 이상 | 캐시/전체 요청 비율 |

### 정성적 지표
- UX 만족도: 4.5/5
- QR 스캔 편의성: "매우 편함" 70% 이상
- 세션 정보 만족도: 4.0/5 이상

---

## ⚠️ 리스크 및 완화 전략

### 🔴 High Risk
1. **Google Sheets API 제한** (분당 100회)
   - **완화**: 5분 캐싱 + 수동 갱신 버튼

2. **시간 압박** (D-14일, 핵심 기능 미완성)
   - **완화**: 신규 기능 축소, 핵심만 완성

### 🟡 Medium Risk
1. **카메라 권한 이슈** (iOS Safari)
   - **완화**: 권한 거부 시 명확한 안내

2. **네트워크 의존성**
   - **완화**: Service Worker 캐싱

---

## 📁 산출물 상세

### 01_PRD.md (v1.8)
**길이**: 약 500줄
**주요 내용**:
- Executive Summary
- 신규 요구사항 2개 상세 명세
- 타겟 사용자 페르소나
- 성공 지표 (KPI)
- 기술적 제약사항
- 리스크 관리 계획

### 02_TECHNICAL_REQUIREMENTS.md
**길이**: 약 600줄
**주요 내용**:
- QR 스캐너 컴포넌트 구조
- Google Sheets API 연동 방법
- 데이터 스키마 정의
- 상세 코드 예시 (TypeScript)
- 캐싱 전략
- 에러 처리 명세

### 03_DEVELOPMENT_PLAN.md
**길이**: 약 400줄
**주요 내용**:
- 시스템 아키텍처 다이어그램
- 디렉토리 구조 설계
- 개발 일정 (6-10시간)
- Phase별 작업 분류
- 기술 스택 및 의존성
- 배포 계획

### 07_PROGRESS.md
**길이**: 약 300줄
**주요 내용**:
- 전체 진행률 (15%)
- Phase별 진행 상황
- 다음 단계 액션 아이템
- 이슈 및 리스크 추적
- 작업 이력

---

## 🎯 다음 담당자에게

### 즉시 착수 항목
1. **Google Sheets API 키 발급** (Backend Developer)
   - Google Cloud Console에서 API 키 생성
   - API 제한사항 설정 (HTTP 리퍼러, Sheets API만 허용)

2. **백엔드 개발 시작** (Backend Developer)
   - `moducon-backend/src/services/googleSheetsService.ts` 구현
   - 로컬 테스트: `curl http://localhost:3001/api/sessions`

3. **프론트엔드 개발 병행** (Frontend Developer)
   - QR 스캐너 UI 구현
   - 세션 페이지 데이터 연동

### 참고 문서
- **PRD**: `claudedocs/01_PRD.md`
- **기술 명세**: `claudedocs/02_TECHNICAL_REQUIREMENTS.md`
- **개발 계획**: `claudedocs/03_DEVELOPMENT_PLAN.md`
- **진행 현황**: `claudedocs/07_PROGRESS.md`

### Git 정보
- **브랜치**: `feature/sessions-data`
- **최신 커밋**: `d66f569` (docs: 신규 요구사항 기획 문서 작성 완료)

---

## 📊 작업 통계

### 문서 작성
- **총 문서**: 4개 (신규 작성)
- **총 라인 수**: 약 1,800줄
- **총 단어 수**: 약 15,000단어
- **작성 시간**: 2.5시간

### 커버리지
- ✅ 제품 요구사항 (100%)
- ✅ 기술 요구사항 (100%)
- ✅ 개발 계획 (100%)
- ✅ 진행 관리 (100%)

---

## 🏁 결론

모두콘 2025 디지털 컨퍼런스 북의 2개 신규 요구사항에 대한 기획 작업이 완료되었습니다.

### 핵심 성과
1. ✅ **명확한 요구사항 정의**: QR 스캐너 UI 개선 및 세션 데이터 연동
2. ✅ **상세 기술 명세**: 코드 예시 포함한 구현 가이드
3. ✅ **현실적 개발 계획**: 6-10시간 예상, Phase별 분류
4. ✅ **리스크 관리**: 잠재적 이슈 식별 및 완화 전략

### 다음 단계
**hands-on worker**에게 인계하여 실제 개발 착수

---

**작성자**: Technical Lead
**완료일**: 2025-11-30
**다음 담당자**: **hands-on worker** (Backend + Frontend Developer)
