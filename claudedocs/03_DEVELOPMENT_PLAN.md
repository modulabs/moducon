# 개발 계획 총괄 문서

## 📅 최종 업데이트
**날짜**: 2025-12-03
**작성자**: Technical Lead

---

## 📊 개발 현황 요약

| Phase | 작업 | 상태 | 진행률 | 문서 |
|-------|------|------|--------|------|
| Phase 1 | 기획 & 문서화 | ✅ 완료 | 100% | - |
| Phase 2 | 기본 UI 구현 | ✅ 완료 | 100% | - |
| Phase 3 | DB 구축 및 API 연동 | ✅ 완료 | 100% | - |
| Phase 4 | QR 체크인 시스템 | 🚧 대기 | 0% | [03-01](03-01_QR_CHECKIN_DEV_PLAN.md) |
| Phase 5 | 마이페이지 & 관심 등록 | 🚧 대기 | 0% | [03-02](03-02_MYPAGE_FAVORITES_DEV_PLAN.md) |
| Phase 6 | 세션 Q&A 시스템 | 🚧 대기 | 0% | [03-03](03-03_SESSION_QA_DEV_PLAN.md) |

**전체 진행률**: 50% (3/6 Phase 완료)

---

## ✅ 완료된 작업

### Phase 1-3 요약

#### 인증 시스템 ✅
- 로그인 (이름 + 전화번호 뒷4자리) → JWT 토큰 발급
- 디지털 서명 (Canvas 기반)
- 인증 미들웨어 및 상태 관리 (Zustand)

#### UI/UX ✅
- 홈/세션/부스/포스터 페이지
- 모바일 PWA 최적화
- 브랜드 그라데이션 헤더
- 하단 네비게이션

#### 데이터베이스 ✅
- PostgreSQL + Prisma ORM
- Session (32개), Booth (15개), Poster (33개)
- User, UserCheckin, Quiz 모델

#### QR 코드 ✅
- 81개 QR 코드 이미지 생성 (세션 32, 부스 15, 포스터 33, 등록 1)
- 출력용 HTML 페이지 (`qr_codes/index.html`)

---

## 🎯 다음 단계 (Phase 4-6)

### Phase 4: QR 체크인 시스템
**예상 소요**: 3-4시간
**문서**: [03-01_QR_CHECKIN_DEV_PLAN.md](03-01_QR_CHECKIN_DEV_PLAN.md)

**핵심 작업**:
1. `/checkin` 라우트 페이지 구현
2. QR 타입별 분기 처리 (registration, session, booth, paper)
3. 체크인 API 연동 및 UI 피드백
4. 퀴즈 연동 체크인 (옵션)

**QR 처리 플로우**:
```
[QR 스캔] → [URL 파싱] → [로그인 확인] → [퀴즈 확인] → [체크인] → [상세페이지]
```

---

### Phase 5: 마이페이지 & 관심 등록
**예상 소요**: 2-3시간
**문서**: [03-02_MYPAGE_FAVORITES_DEV_PLAN.md](03-02_MYPAGE_FAVORITES_DEV_PLAN.md)

**핵심 작업**:
1. `UserFavorite` 모델 추가 (DB 스키마)
2. 관심 등록 API (POST/DELETE/GET)
3. 마이페이지 통합 API
4. 마이페이지 UI 컴포넌트 5개

**마이페이지 구성**:
```
/mypage
├── ProfileCard (프로필 + 서명)
├── VisitHistory (방문 기록)
├── FavoritesList (관심 목록)
├── BadgeCollection (배지)
└── ActivityStats (통계)
```

---

### Phase 6: 세션 Q&A 시스템
**예상 소요**: 3-4시간
**문서**: [03-03_SESSION_QA_DEV_PLAN.md](03-03_SESSION_QA_DEV_PLAN.md)

**핵심 작업**:
1. DB 스키마 4개 모델 추가
   - `SessionQuestion` (질문)
   - `QuestionLike` (좋아요)
   - `QuestionAnswer` (답변)
   - `UserNotification` (알림)
2. Q&A API 구현
3. 알림 시스템 구현
4. Q&A UI 컴포넌트

**Q&A 기능**:
- 질문 작성 (익명 옵션)
- 좋아요 기능
- 답변 시 알림 발송

---

## 🗄️ DB 스키마 변경 요약

### 추가 예정 모델

```prisma
// Phase 5
model UserFavorite {
  id, userId, targetType, targetId, createdAt
}

// Phase 6
model SessionQuestion {
  id, sessionId, userId, content, isAnonymous, isAnswered, isPinned, createdAt
}

model QuestionLike {
  id, questionId, userId, createdAt
}

model QuestionAnswer {
  id, questionId, content, answeredBy, createdAt
}

model UserNotification {
  id, userId, type, title, message, data, isRead, createdAt
}
```

---

## 📂 프로젝트 구조 (변경 예정)

```
moducon_dev/
├── claudedocs/
│   ├── 01_PRD.md
│   ├── 02_TECHNICAL_REQUIREMENTS.md
│   ├── 03_DEVELOPMENT_PLAN.md (본 문서)
│   ├── 03-01_QR_CHECKIN_DEV_PLAN.md ← 신규
│   ├── 03-02_MYPAGE_FAVORITES_DEV_PLAN.md ← 신규
│   ├── 03-03_SESSION_QA_DEV_PLAN.md ← 신규
│   └── ...
├── moducon-frontend/
│   └── src/
│       ├── app/
│       │   ├── checkin/page.tsx ← 신규 (Phase 4)
│       │   └── mypage/
│       │       ├── page.tsx ← 수정 (Phase 5)
│       │       └── components/ ← 신규
│       └── components/
│           ├── checkin/ ← 신규 (Phase 4)
│           ├── qa/ ← 신규 (Phase 6)
│           └── notifications/ ← 신규 (Phase 6)
├── moducon-backend/
│   └── src/
│       └── routes/
│           ├── favorites.ts ← 신규 (Phase 5)
│           ├── mypage.ts ← 신규 (Phase 5)
│           ├── questions.ts ← 신규 (Phase 6)
│           └── notifications.ts ← 신규 (Phase 6)
└── qr_codes/
    ├── index.html ✅
    ├── sessions/ ✅
    ├── booths/ ✅
    ├── posters/ ✅
    └── registration/ ✅
```

---

## 🔧 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| Frontend | Next.js | 15.x |
| Frontend | TypeScript | 5.x |
| Frontend | Tailwind CSS | 3.x |
| Frontend | Zustand | 4.x |
| Backend | Express.js | 4.x |
| Backend | Prisma ORM | 5.x |
| Database | PostgreSQL | 15.x |
| Auth | JWT | - |
| QR | html5-qrcode | 2.x |

---

## 📅 개발 일정 (권장)

| 일자 | Phase | 작업 |
|------|-------|------|
| Day 1 | Phase 4 | QR 체크인 시스템 |
| Day 2 | Phase 5 | 마이페이지 & 관심 등록 |
| Day 3 | Phase 6 | 세션 Q&A (MVP) |
| Day 4 | Phase 6 | 알림 시스템 |
| Day 5 | QA | 통합 테스트 |

**총 예상 소요**: 8-11시간 (작업 시간 기준)

---

## ✅ 전체 체크리스트

### Phase 4: QR 체크인
- [ ] `/checkin` 라우트 페이지
- [ ] 타입별 분기 처리
- [ ] 체크인 API 연동
- [ ] 퀴즈 모달 (옵션)
- [ ] 상세페이지 리다이렉트

### Phase 5: 마이페이지
- [ ] `UserFavorite` DB 모델
- [ ] 관심 등록 API 3개
- [ ] 마이페이지 통합 API
- [ ] UI 컴포넌트 5개
- [ ] 상세페이지 하트 버튼

### Phase 6: Q&A 시스템
- [ ] DB 모델 4개
- [ ] 질문 API
- [ ] 좋아요 API
- [ ] 답변 API (관리자)
- [ ] 알림 API
- [ ] Q&A UI 컴포넌트
- [ ] 알림 UI 컴포넌트

---

**다음 담당자**: hands-on worker
**시작 추천**: Phase 4 (QR 체크인 시스템)
