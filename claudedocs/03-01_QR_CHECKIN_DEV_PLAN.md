# QR 체크인 시스템 개발 계획

## 📅 최종 업데이트
**날짜**: 2025-12-03
**작성자**: Technical Lead
**문서 번호**: 03-01

---

## 📊 현재 구현 상태 분석

### ✅ 이미 구현된 기능

#### 1. 인증 시스템 (완료)
- **로그인**: 이름 + 전화번호 뒷4자리 → JWT 토큰 발급 ✅
- **서명**: Canvas 기반 디지털 서명 저장 ✅
- **JWT 미들웨어**: `src/middleware/auth.ts` ✅
- **인증 상태 관리**: Zustand `authStore.ts` ✅

#### 2. QR 스캔 (부분 구현)
- **QR 스캐너 컴포넌트**: `html5-qrcode` 라이브러리 사용 ✅
- **QR 파서**: `qrParser.ts` - 다양한 형식 지원 ✅
  - `checkin-session-{id}`, `checkin-booth-{id}`, `checkin-paper-{id}`
  - `moducon://` 프로토콜
  - 레거시 형식

#### 3. 체크인 API (부분 구현)
- **POST /api/checkin**: 체크인 생성 ✅
- **GET /api/checkin/user/:userId**: 사용자 체크인 목록 ✅
- **GET /api/checkin/stats/:userId**: 통계 및 배지 ✅

#### 4. DB 스키마 (완료)
- `users`, `auth_sessions`, `signatures` ✅
- `user_checkins`, `quizzes`, `user_quiz_attempts` ✅
- `sessions`, `booths`, `posters` ✅

### ❌ 미구현 / 수정 필요 사항

1. **등록 데스크 QR 처리**: 현재 `registration` 타입 미지원
2. **QR 스캔 후 체크인 자동 호출**: 프론트엔드 연동 미완성
3. **체크인 후 상세페이지 이동**: 라우팅 로직 미완성
4. **퀴즈 연동 체크인**: 퀴즈 통과 후 체크인 로직 없음
5. **마이페이지**: 방문 기록, 관심 등록 UI 미완성

---

## 🎯 Phase 4: QR 체크인 시스템 구현

### 예상 소요: 3-4시간

---

### 4.1 QR 스캔 타입별 처리 로직

#### QR URL 형식 (현재 생성된 형식)
```
https://moducon.vibemakers.kr/checkin?type={type}&id={code}

예시:
- 등록: ?type=registration&id=desk_main
- 세션: ?type=session&id=00-01
- 부스: ?type=booth&id=booth_1
- 포스터: ?type=paper&id=paper_1
```

#### 처리 플로우

```
[QR 스캔]
    ↓
[URL 파싱] → type, id 추출
    ↓
[타입별 분기]
    ├─ registration → 4.1.1 등록 처리
    ├─ session → 4.1.2 세션 체크인
    ├─ booth → 4.1.3 부스 체크인
    └─ paper → 4.1.4 포스터 체크인
```

---

### 4.1.1 등록 데스크 처리 (type=registration)

**시나리오**: 사용자가 행사장 입구에서 등록 QR 스캔

```
[등록 QR 스캔]
    ↓
[로그인 여부 확인]
    ├─ 미로그인 → /login 리다이렉트
    │              ↓
    │         [이름 + 전화번호 입력]
    │              ↓
    │         [JWT 토큰 발급] ← 이미 구현됨
    │              ↓
    │         [서명 페이지] ← 이미 구현됨
    │              ↓
    │         [등록 체크인 기록]
    │              ↓
    └─ 로그인됨 → [등록 체크인 기록]
                    ↓
              [/home 리다이렉트]
```

**구현 필요 사항**:
- [ ] `/checkin` 라우트 페이지 생성
- [ ] `registration` 타입 처리 로직
- [ ] 등록 완료 후 체크인 API 호출

---

### 4.1.2 세션 체크인 (type=session)

**시나리오**: 세션 입장 시 QR 스캔

```
[세션 QR 스캔]
    ↓
[로그인 여부 확인]
    ├─ 미로그인 → /login?redirect=/checkin?type=session&id={id}
    └─ 로그인됨
          ↓
    [퀴즈 존재 여부 확인] ← API: GET /api/quiz/session/{id}
          ├─ 퀴즈 있음 → [퀴즈 모달 표시]
          │                  ↓
          │              [정답 시 체크인]
          │                  ↓
          └─ 퀴즈 없음 → [즉시 체크인]
                            ↓
                      [POST /api/checkin]
                            ↓
                      [성공 토스트 메시지]
                            ↓
                      [/sessions/{id} 리다이렉트]
```

**구현 필요 사항**:
- [ ] 퀴즈 확인 API 호출 로직
- [ ] 퀴즈 모달 컴포넌트
- [ ] 체크인 성공/실패 UI 피드백

---

### 4.1.3 부스 체크인 (type=booth)

**시나리오**: 부스 방문 시 QR 스캔

```
[부스 QR 스캔]
    ↓
[로그인 여부 확인]
    ├─ 미로그인 → /login?redirect=/checkin?type=booth&id={id}
    └─ 로그인됨
          ↓
    [퀴즈 존재 여부 확인]
          ├─ 퀴즈 있음 → [퀴즈 모달]
          └─ 퀴즈 없음 → [즉시 체크인]
                            ↓
                      [POST /api/checkin]
                            ↓
                      [/booths/{id} 리다이렉트]
```

---

### 4.1.4 포스터 체크인 (type=paper)

**시나리오**: 포스터 관람 시 QR 스캔

```
[포스터 QR 스캔]
    ↓
[로그인 여부 확인]
    ├─ 미로그인 → /login?redirect=/checkin?type=paper&id={id}
    └─ 로그인됨
          ↓
    [퀴즈 존재 여부 확인]
          ├─ 퀴즈 있음 → [퀴즈 모달]
          └─ 퀴즈 없음 → [즉시 체크인]
                            ↓
                      [POST /api/checkin]
                            ↓
                      [/papers/{id} 리다이렉트]
```

---

### 4.2 구현 파일 목록

#### 프론트엔드 (신규/수정)

| 파일 | 작업 | 설명 |
|------|------|------|
| `src/app/checkin/page.tsx` | 신규 | QR 체크인 처리 페이지 |
| `src/components/checkin/CheckinHandler.tsx` | 신규 | 타입별 체크인 로직 |
| `src/components/quiz/QuizModal.tsx` | 신규 | 퀴즈 풀이 모달 |
| `src/lib/qrParser.ts` | 수정 | URL 파라미터 형식 지원 |
| `src/lib/api.ts` | 수정 | 체크인/퀴즈 API 함수 추가 |

#### 백엔드 (수정)

| 파일 | 작업 | 설명 |
|------|------|------|
| `src/routes/checkin.ts` | 수정 | registration 타입 지원 |
| `src/routes/quiz.ts` | 신규 | 퀴즈 조회/제출 API |

---

### 4.3 API 명세 (추가/수정)

#### GET /api/quiz/:targetType/:targetId
특정 대상의 퀴즈 조회

**Response (200)**
```json
{
  "quiz": {
    "id": "uuid",
    "question": "이 부스에서 소개하는 AI 기술은?",
    "options": ["GPT", "BERT", "LLaMA", "Claude"],
    "targetType": "booth",
    "targetId": "booth_1"
  }
}
```

**Response (404)** - 퀴즈 없음
```json
{
  "quiz": null
}
```

#### POST /api/quiz/attempt
퀴즈 답변 제출

**Request**
```json
{
  "quizId": "uuid",
  "answer": 2
}
```

**Response (200)**
```json
{
  "isCorrect": true,
  "correctAnswer": 2,
  "canCheckin": true
}
```

---

## ✅ 체크리스트

### Phase 4.1: 체크인 페이지 구현
- [ ] `/checkin` 라우트 페이지 생성
- [ ] URL 쿼리 파라미터 파싱 (type, id)
- [ ] 로그인 상태 확인 및 리다이렉트
- [ ] 타입별 분기 처리

### Phase 4.2: 체크인 API 연동
- [ ] 체크인 API 호출 함수 (`api.ts`)
- [ ] 성공/실패 토스트 메시지
- [ ] 중복 체크인 처리 (이미 방문함 표시)

### Phase 4.3: 퀴즈 시스템
- [ ] 퀴즈 조회 API 구현
- [ ] 퀴즈 제출 API 구현
- [ ] QuizModal 컴포넌트
- [ ] 정답 시 체크인 연동

### Phase 4.4: 상세페이지 리다이렉트
- [ ] 체크인 후 해당 상세페이지로 이동
- [ ] 체크인 완료 배지 표시

---

## 📅 다음 문서

- **03-02**: 마이페이지 및 관심 등록 시스템
- **03-03**: 세션 Q&A 시스템

---

**문서 버전**: v1.0
**최종 수정일**: 2025-12-03
