# 151_PRD_CORE.md - 핵심 PRD (Product Requirements Document)

**작성일**: 2025-12-01
**작성자**: Technical Lead
**버전**: v2.0
**우선순위**: P0 (Critical)

---

## 🎯 프로젝트 비전

### 목표
참가자들이 컨퍼런스를 더 능동적으로 즐기고, 참여 기록을 남기며, 자랑할 수 있는 디지털 경험 제공

### 핵심 가치
1. **탐색의 편의성**: 세션/부스/포스터를 쉽게 탐색
2. **참여의 재미**: QR 체크인으로 참여 기록
3. **성취의 공유**: 마이페이지에서 자랑하기

---

## 📋 핵심 기능 명세

### 1. 컨텐츠 탐색 시스템 ✅ (완료)

#### 1.1 세션 탐색
**요구사항**:
- 32개 세션 데이터 제공 (하드코딩)
- 트랙별 필터링 (AI/ML, 데이터 엔지니어링 등)
- 시간별 정렬 (다가오는 세션 우선)
- 세션 상세 페이지 (발표자, 난이도, 시간 등)

**현재 상태**: ✅ 완료
- sessions.json (32개 세션)
- localStorage 캐싱 (5분 만료)
- 다가오는 세션 3개 홈페이지 표시

#### 1.2 부스 탐색
**요구사항**:
- 12개 부스 데이터 제공
- 부스별 상세 정보 (기업명, 설명, 위치)
- 부스 방문 체크인 (QR 스캔)

**현재 상태**: 🔄 진행 중
- booths.json 데이터 준비 중
- 부스 페이지 구조 완료

#### 1.3 포스터 탐색
**요구사항**:
- 33개 포스터 데이터 제공
- 포스터별 상세 정보 (제목, 저자, 요약)
- 포스터 열람 체크인 (QR 스캔)

**현재 상태**: 🔄 진행 중
- papers.json 데이터 준비 중
- 포스터 페이지 구조 완료

---

### 2. QR 스캔 시스템 🔄 (Phase 1 완료)

#### 2.1 하단 네비게이션 QR 버튼 ⏳ (Phase 2 예정)
**요구사항**:
- 하단 네비게이션 5개 탭: 세션/부스/포스터/지도/QR
- 중앙 원형 QR 버튼 (64x64px, 그라데이션, 그림자)
- 클릭 시 QR 스캔 모달 전체 화면 표시

**UI 명세**:
```
┌──────────────────────────────────────────┐
│           Main Content                   │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│ [세션]  [부스]   [🎯 QR]   [포스터] [지도] │
└──────────────────────────────────────────┘
```

**현재 상태**: ⏳ Phase 2 예정 (2시간)

#### 2.2 QR 스캔 UI 개선 ✅ (Phase 1 완료)
**요구사항**:
- 정사각형 스캔 가이드 (280x280px)
- 흰색 테두리, 둥근 모서리
- 외부 어둡게 처리 (shadow-[0_0_0_9999px_rgba(0,0,0,0.5)])
- 안내 메시지 하단 배치

**현재 상태**: ✅ 완료 (2025-12-01)

#### 2.3 QR 값 파싱 및 라우팅 ✅ (Phase 1 완료)
**지원 QR 형식**:

1. **체크인 QR** (3가지):
   - `checkin-session-{id}` → 세션 체크인 + 상세 페이지
   - `checkin-booth-{id}` → 부스 방문 체크인 + 상세 페이지
   - `checkin-paper-{id}` → 포스터 열람 체크인 + 상세 페이지

2. **퀴즈 QR**:
   - `quiz-{id}` → 퀴즈 팝업 표시
   - 정답 시에만 체크인 기록

3. **히든 배지 QR**:
   - `hidden-{id}` → 히든 배지 획득 팝업

**현재 상태**: ✅ 파서 완료, API 연동 예정

---

### 3. 체크인 시스템 ⏳ (Phase 3 예정)

#### 3.1 Database 스키마
**테이블 1: user_checkins**
```sql
CREATE TABLE user_checkins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  target_type VARCHAR(20) NOT NULL, -- 'session', 'booth', 'paper'
  target_id VARCHAR(50) NOT NULL,    -- 세션/부스/포스터 ID
  checked_in_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);
```

**테이블 2: quizzes**
```sql
CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY,
  target_type VARCHAR(20) NOT NULL,
  target_id VARCHAR(50) NOT NULL,
  question TEXT NOT NULL,
  answer VARCHAR(200) NOT NULL,
  options JSONB NOT NULL, -- ['A', 'B', 'C', 'D']
  created_at TIMESTAMP DEFAULT NOW()
);
```

**테이블 3: user_quiz_attempts**
```sql
CREATE TABLE user_quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id),
  answer VARCHAR(200) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  attempted_at TIMESTAMP DEFAULT NOW()
);
```

**현재 상태**: ⏳ Phase 3 예정 (1시간)

#### 3.2 체크인 API
**엔드포인트**: `POST /api/checkin`

**요청 본문**:
```json
{
  "targetType": "session" | "booth" | "paper",
  "targetId": "session-1",
  "quizId": 1 (optional),
  "quizAnswer": "A" (optional)
}
```

**응답**:
```json
{
  "success": true,
  "checkin": {
    "id": 123,
    "targetType": "session",
    "targetId": "session-1",
    "checkedInAt": "2025-12-01T09:00:00Z"
  },
  "quizResult": { (퀴즈가 있는 경우)
    "isCorrect": true,
    "correctAnswer": "A"
  }
}
```

**현재 상태**: ⏳ Phase 3 예정 (2시간)

#### 3.3 퀴즈 API
**엔드포인트 1**: `GET /api/quiz/:quizId`
```json
{
  "quiz": {
    "id": 1,
    "question": "이 세션의 주요 주제는?",
    "options": ["AI/ML", "데이터 엔지니어링", "클라우드", "보안"]
  }
}
```

**엔드포인트 2**: `POST /api/quiz/:quizId/answer`
```json
{
  "answer": "A",
  "isCorrect": true
}
```

**현재 상태**: ⏳ Phase 3 예정 (1시간)

---

### 4. 마이페이지 ⏳ (Phase 4 예정)

#### 4.1 프로필 카드
**요구사항**:
- 사용자 이름, 이메일 표시
- 참여 일자 (예: "모두콘 2025 참가 중")
- 프로필 편집 버튼 (선택 사항)

#### 4.2 체크인 통계
**요구사항**:
- 세션 체크인 수 (예: 8/32)
- 부스 방문 수 (예: 5/12)
- 포스터 열람 수 (예: 12/33)
- 진행률 프로그레스 바

**UI 예시**:
```
┌─────────────────────────────────┐
│ 📊 체크인 통계                  │
├─────────────────────────────────┤
│ 세션 참여     8/32  ████░░░░░░  │
│ 부스 방문     5/12  ████░░░░░░  │
│ 포스터 열람  12/33  ████░░░░░░  │
└─────────────────────────────────┘
```

#### 4.3 획득 배지
**요구사항**:
- 일반 배지 (세션/부스/포스터 체크인)
- 퀴즈 정답 배지
- 히든 배지 (특별 QR)
- 배지 그리드 레이아웃 (3열)

#### 4.4 자랑하기
**요구사항**:
- "참여 인증 QR 코드" 생성
- QR 코드 + 통계 이미지 다운로드 (PNG)
- 공유 버튼 (클립보드 복사, 이미지 저장)

**현재 상태**: ⏳ Phase 4 예정 (3시간)

---

## 🎨 UI/UX 요구사항

### 디자인 시스템
- **컬러**: Tailwind CSS 기본 색상 (primary, gray 등)
- **타이포그래피**: 시스템 폰트 (sans-serif)
- **아이콘**: lucide-react

### 반응형 디자인
- **모바일 우선**: 375px ~ 768px
- **태블릿**: 768px ~ 1024px
- **데스크톱**: 1024px 이상

### 접근성 (WCAG 2.1)
- **키보드 접근**: 모든 버튼 Tab/Enter 지원
- **스크린 리더**: aria-label 적용
- **색상 대비**: 4.5:1 이상

---

## 🔒 기술 요구사항

### 성능
- **첫 화면 로딩**: < 2초
- **API 응답 시간**: < 500ms
- **QR 스캔 응답**: < 300ms
- **캐시 히트율**: > 90%

### 보안
- **JWT 인증**: Access Token (1시간)
- **환경 변수**: .env 파일 (Git 제외)
- **SQL Injection 방지**: Prisma ORM
- **XSS 방지**: React 기본 보호

### 브라우저 지원
- **모바일**: iOS Safari 14+, Chrome 90+
- **데스크톱**: Chrome 90+, Firefox 88+, Safari 14+

---

## 📊 성공 지표 (KPI)

### 참여 지표
- **체크인율**: 참가자의 50% 이상이 5개 이상 체크인
- **퀴즈 정답률**: 70% 이상
- **마이페이지 방문**: 참가자의 80% 이상

### 기술 지표
- **빌드 성공률**: 100%
- **TypeScript 에러**: 0건
- **보안 취약점**: 0건 (Critical/High)

### 사용자 만족도
- **QR 스캔 성공률**: 95% 이상
- **페이지 로딩 시간**: 평균 < 2초
- **에러 발생률**: < 1%

---

## ⚠️ 제약사항

### 기술 제약
- **백엔드**: Express.js (Node.js 18+)
- **프론트엔드**: Next.js 14 (App Router)
- **Database**: PostgreSQL 14+

### 리소스 제약
- **개발 시간**: 총 14시간 (약 2일)
- **예산**: 무료 티어 (Vercel, Supabase)

### 데이터 제약
- **세션 데이터**: 하드코딩 (32개)
- **부스 데이터**: 하드코딩 (12개)
- **포스터 데이터**: 하드코딩 (33개)

---

## 🚀 배포 계획

### 환경
- **프론트엔드**: Vercel (자동 배포)
- **백엔드**: Render (무료 티어)
- **Database**: Supabase PostgreSQL

### 배포 전 체크리스트
- [ ] TypeScript 빌드 성공 (0 errors)
- [ ] 환경 변수 설정 완료
- [ ] Database 마이그레이션 완료
- [ ] QA 테스트 통과 (전체 플로우)

---

**최종 상태**: ✅ **PRD v2.0 작성 완료**

**다음 문서**: 152_DB_API_SPEC.md (DB/API 통합 명세)

---

**작성 완료 시각**: 2025-12-01 09:15 KST
